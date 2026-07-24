/**
 * Hex Lookup Tool
 *
 * Get resolved hex colour(s) for a token path from the Figma-sourced database.
 */

import { loadHexDb, getMeta, isDbPopulated } from './hex-db.js';

/**
 * @param {object} params
 * @param {string} params.tokenPath  e.g. "color.background.primary"
 * @param {'light'|'dark'|'both'} [params.mode='both']
 */
export async function hexLookup({ tokenPath, mode = 'both' }) {
  if (!isDbPopulated()) {
    return {
      error: 'DB not synced yet. Ask the user to run a Figma variables sync.'
    };
  }

  const meta = getMeta();
  const db = loadHexDb();
  const entry = db?.[tokenPath];

  if (!entry) {
    return {
      tokenPath,
      mode,
      found: false,
      syncedAt: meta?.syncedAt ?? null,
      message: `Token path "${tokenPath}" not found in DB.`
    };
  }

  const result = {
    tokenPath,
    mode,
    figmaVariableId: entry.figmaVariableId ?? null,
    syncedAt: meta?.syncedAt ?? null
  };

  if (mode === 'both' || mode === 'light') {
    result.light = entry.light ?? null;
  }
  if (mode === 'both' || mode === 'dark') {
    result.dark = entry.dark ?? null;
  }

  return result;
}
