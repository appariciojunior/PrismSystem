/**
 * Ramp Lookup Tool
 * Skill: color-ramps/dark-mode-mapping.md
 *
 * Look up ramp step hex values per mode.
 * CRITICAL: Neutral ramps are REVERSED in dark mode.
 */

import { loadTokens } from './token-utils.js';
import { getHex } from './hex-db.js';

/**
 * Look up a ramp step from tokens.json directly.
 */
function lookupFromTokens(ramp, step, mode) {
  const tokens = loadTokens();
  const results = [];

  const setNames =
    mode === 'both'
      ? [
          'light/ brand',
          'dark/ brand',
          'Palette - Light/ Brand',
          'Palette - Dark/ Brand'
        ]
      : mode === 'light'
        ? ['light/ brand', 'Palette - Light/ Brand']
        : ['dark/ brand', 'Palette - Dark/ Brand'];

  for (const setName of setNames) {
    const set = tokens[setName];
    if (!set) continue;

    // Navigate: brand.core.ramp.{ramp}.{step}
    const token = set?.brand?.core?.ramp?.[ramp]?.[step];

    if (token) {
      results.push({
        set: setName,
        mode: setName.includes('light') ? 'light' : 'dark',
        path: `brand.core.ramp.${ramp}.${step}`,
        value: token.value,
        description: token.description || null
      });
    }
  }

  return results;
}

/**
 * Look up ramp step hex values.
 */
export async function rampLookup({ ramp, step, mode }) {
  const isNeutral = ramp.toLowerCase() === 'neutral';

  // Build the canonical token path for DB lookup
  // e.g. ramp.neutral.500 or ramp.blue.500
  const dbTokenPath = `ramp.${ramp.toLowerCase()}.${step}`;

  const dbResults = [];
  const modesToCheck = mode === 'both' ? ['light', 'dark'] : [mode];

  for (const m of modesToCheck) {
    const hex = getHex(dbTokenPath, m);
    if (hex) {
      dbResults.push({ mode: m, hex, source: 'figma-db' });
    }
  }

  // Fall back to tokens.json if DB has no result
  const tokenData =
    dbResults.length === 0
      ? lookupFromTokens(ramp, step, mode).map((t) => ({
          ...t,
          source: 'tokens-json'
        }))
      : [];

  return {
    ramp,
    step,
    mode,
    warning: isNeutral
      ? '⚠️ CRITICAL: Neutral ramps are REVERSED in dark mode. neutral.50=black(dark)/white(light), neutral.1000=white(dark)/black(light)'
      : null,
    fromDB: dbResults.length > 0 ? dbResults : 'DB not populated or no match',
    fromTokens:
      tokenData.length > 0
        ? tokenData
        : dbResults.length > 0
          ? 'DB result used'
          : 'No token data found',
    darkModeNote: isNeutral
      ? {
          'neutral.50': { light: '#ffffff (white)', dark: '#000000 (black)' },
          'neutral.500': {
            light: '#808080 (mid-gray)',
            dark: '#808080 (mid-gray)'
          },
          'neutral.1000': { light: '#000000 (black)', dark: '#ffffff (white)' }
        }
      : 'Non-neutral ramps are NOT reversed. Modifiers handle dark mode adjustments.'
  };
}
