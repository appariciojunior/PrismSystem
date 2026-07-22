/**
 * Hex Batch Lookup Tool
 *
 * Get resolved hex colours for multiple token paths at once.
 */

import { loadHexDb, getMeta, isDbPopulated } from './hex-db.js';

/**
 * @param {object} params
 * @param {string[]} params.tokenPaths   Array of token paths
 * @param {'light'|'dark'|'both'} [params.mode='both']
 */
export async function hexBatchLookup({ tokenPaths, mode = 'both' }) {
  if (!isDbPopulated()) {
    return {
      error: 'DB not synced yet. Ask the user to run a Figma variables sync.'
    };
  }

  const meta = getMeta();
  const db = loadHexDb();

  const results = {};
  const missing = [];

  for (const tokenPath of tokenPaths) {
    const entry = db?.[tokenPath];
    if (!entry) {
      missing.push(tokenPath);
      continue;
    }

    const value = {};
    if (mode === 'both' || mode === 'light') {
      if (entry.light != null) value.light = entry.light;
    }
    if (mode === 'both' || mode === 'dark') {
      if (entry.dark != null) value.dark = entry.dark;
    }
    results[tokenPath] = value;
  }

  return {
    results,
    missing,
    syncedAt: meta?.syncedAt ?? null
  };
}
