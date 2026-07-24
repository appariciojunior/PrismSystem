/**
 * Hex Reverse Lookup Tool
 *
 * Find all token paths that resolve to a given hex colour.
 * Uses the Figma-sourced database — ground truth, not reference traversal.
 */

import { getAllEntries, getMeta, isDbPopulated } from './hex-db.js';

/**
 * Normalise a hex string to lowercase 6-digit form (#rrggbb).
 * Expands 3-digit shorthand. Returns null if invalid.
 */
function normaliseHex(hex) {
  if (!hex || typeof hex !== 'string') return null;
  const clean = hex.trim().replace(/^#/, '');
  if (clean.length === 3) {
    const expanded = clean
      .split('')
      .map((c) => c + c)
      .join('');
    return `#${expanded.toLowerCase()}`;
  }
  if (clean.length === 6) return `#${clean.toLowerCase()}`;
  return null;
}

/**
 * Parse a hex string to [r, g, b] integers (0–255).
 */
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16)
  ];
}

/**
 * Euclidean RGB distance between two hex strings.
 */
function rgbDistance(hexA, hexB) {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
  );
}

/**
 * @param {object} params
 * @param {string} params.hex             Hex colour to look up, e.g. "#FFFFFF"
 * @param {'light'|'dark'|'all'} [params.mode='all']
 * @param {boolean} [params.includeNear=false]
 * @param {number} [params.threshold=15]  Euclidean RGB distance threshold for near matches
 */
export async function hexReverseLookup({
  hex,
  mode = 'all',
  includeNear = false,
  threshold = 15
}) {
  if (!isDbPopulated()) {
    return { error: 'DB not synced yet.' };
  }

  const normalizedHex = normaliseHex(hex);
  if (!normalizedHex) {
    return { error: `Invalid hex value: "${hex}"` };
  }

  const meta = getMeta();
  const entries = getAllEntries();
  const exact = [];
  const near = [];

  const modesToCheck = mode === 'all' ? ['light', 'dark'] : [mode];

  for (const [tokenPath, entry] of entries) {
    const match = {};
    let isExact = false;
    let minDistance = Infinity;

    for (const m of modesToCheck) {
      const entryHex = entry[m];
      if (!entryHex) continue;
      const normEntry = normaliseHex(entryHex);
      if (!normEntry) continue;

      if (normEntry === normalizedHex) {
        match[m] = entryHex;
        isExact = true;
      } else if (includeNear) {
        const dist = rgbDistance(normalizedHex, normEntry);
        if (dist <= threshold) {
          match[m] = entryHex;
          minDistance = Math.min(minDistance, dist);
        }
      }
    }

    if (isExact) {
      exact.push({ tokenPath, ...match });
    } else if (includeNear && Object.keys(match).length > 0) {
      near.push({
        tokenPath,
        distance: Math.round(minDistance * 10) / 10,
        ...match
      });
    }
  }

  // Sort near matches by distance ascending
  near.sort((a, b) => a.distance - b.distance);

  return {
    input: hex,
    normalizedHex,
    mode,
    exact,
    near: includeNear ? near : undefined,
    syncedAt: meta?.syncedAt ?? null
  };
}
