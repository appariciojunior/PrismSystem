/**
 * Token Lookup Tool
 * Skill: discovery/token-lookup.md
 *
 * Find tokens by path, name pattern, or value.
 */

import { getEntriesForFilters } from './token-utils.js';
import { getHex, isDbPopulated } from './hex-db.js';

/**
 * Search tokens by various strategies.
 */
export async function tokenLookup({
  query,
  queryType,
  layer,
  mode,
  limit = 50,
  cursor = 0
}) {
  const maxLimit = Math.max(1, Math.min(Number(limit) || 50, 200));
  const start = Math.max(0, Number(cursor) || 0);
  const normalizedQuery = String(query || '').toLowerCase();
  const entries = getEntriesForFilters(layer, mode);
  const results = [];

  for (const token of entries) {
    let match = false;

    switch (queryType) {
      case 'path':
        match = token.path === query || token.fullPath === query;
        break;
      case 'pattern':
        match =
          token.path.toLowerCase().includes(normalizedQuery) ||
          token.fullPath.toLowerCase().includes(normalizedQuery) ||
          (token.description &&
            token.description.toLowerCase().includes(normalizedQuery));
        break;
      case 'value':
        match =
          token.value &&
          String(token.value).toLowerCase().includes(normalizedQuery);
        break;
      default:
        match = false;
    }

    if (match) {
      const result = {
        set: token.set,
        layer: token.layer,
        path: token.path,
        value: token.value,
        type: token.type,
        description: token.description
      };

      // Append resolved hex for colour tokens when DB is populated
      if (token.type === 'color' && isDbPopulated()) {
        const lightHex = getHex(token.path, 'light');
        const darkHex = getHex(token.path, 'dark');
        const resolvedHex = {};
        if (lightHex != null) resolvedHex.light = lightHex;
        if (darkHex != null) resolvedHex.dark = darkHex;
        if (Object.keys(resolvedHex).length > 0)
          result.resolvedHex = resolvedHex;
      }

      results.push(result);
    }
  }

  const paged = results.slice(start, start + maxLimit);
  const nextCursor =
    start + maxLimit < results.length ? start + maxLimit : null;

  return {
    query,
    queryType,
    filters: { layer, mode },
    pagination: {
      cursor: start,
      limit: maxLimit,
      nextCursor
    },
    count: results.length,
    results: paged,
    truncated: nextCursor !== null
  };
}
