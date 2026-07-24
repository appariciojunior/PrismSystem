import { colorNormalize } from './color-normalize.js';
import {
  buildSemanticDiscoveryEntries,
  normalizeHex
} from './discovery-utils.js';
import { getAllEntries, isDbPopulated } from './hex-db.js';

function hexToRgb(hex) {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16)
  };
}

function colorDistance(a, b) {
  const ar = hexToRgb(a);
  const br = hexToRgb(b);
  if (!ar || !br) return Number.POSITIVE_INFINITY;

  const dr = ar.r - br.r;
  const dg = ar.g - br.g;
  const db = ar.b - br.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function modeValues(entry, mode) {
  if (mode === 'light') {
    return [
      { mode: 'light', value: entry.lightValue, cssVar: entry.cssVarLight }
    ];
  }

  if (mode === 'dark') {
    return [{ mode: 'dark', value: entry.darkValue, cssVar: entry.cssVarDark }];
  }

  return [
    { mode: 'light', value: entry.lightValue, cssVar: entry.cssVarLight },
    { mode: 'dark', value: entry.darkValue, cssVar: entry.cssVarDark }
  ];
}

export async function reverseLookupColor({
  value,
  mode = 'all',
  includeNear = true,
  threshold = 30,
  limit = 20
} = {}) {
  const normalized = colorNormalize({ value });
  if (!normalized.valid) {
    return {
      input: value,
      normalizedInput: null,
      exact: [],
      near: [],
      errors: normalized.errors
    };
  }

  // Use the Figma DB when populated; fall back to buildSemanticDiscoveryEntries
  if (isDbPopulated()) {
    const dbEntries = getAllEntries();
    const exact = [];
    const near = [];
    const modesToCheck = mode === 'all' ? ['light', 'dark'] : [mode];

    for (const [tokenPath, entry] of dbEntries) {
      for (const m of modesToCheck) {
        const entryHex = entry[m];
        if (!entryHex) continue;
        const normEntry = normalizeHex(entryHex);
        if (!normEntry) continue;

        if (normEntry === normalized.hex) {
          exact.push({ tokenPath, mode: m, value: normEntry });
        } else if (includeNear) {
          const distance = colorDistance(normEntry, normalized.hex);
          if (distance <= threshold) {
            near.push({
              tokenPath,
              mode: m,
              value: normEntry,
              distance: Number(distance.toFixed(2))
            });
          }
        }
      }
    }

    exact.sort(
      (a, b) =>
        a.tokenPath.localeCompare(b.tokenPath) || a.mode.localeCompare(b.mode)
    );
    near.sort(
      (a, b) =>
        a.distance - b.distance || a.tokenPath.localeCompare(b.tokenPath)
    );

    const maxCount = Math.max(1, Math.min(Number(limit) || 20, 200));
    return {
      input: value,
      normalizedInput: normalized.hex,
      mode,
      threshold,
      source: 'figma-db',
      exact: exact.slice(0, maxCount),
      near: near.slice(0, maxCount),
      counts: { exact: exact.length, near: near.length }
    };
  }

  // Fallback: existing semantic discovery entries
  const entries = buildSemanticDiscoveryEntries();
  const exact = [];
  const near = [];

  for (const entry of entries) {
    const candidates = modeValues(entry, mode);

    for (const candidate of candidates) {
      const candidateHex = normalizeHex(candidate.value);
      if (!candidateHex) continue;

      if (candidateHex === normalized.hex) {
        exact.push({
          tokenPath: entry.tokenPath,
          category: entry.category,
          mode: candidate.mode,
          value: candidateHex,
          cssVar: candidate.cssVar
        });
      } else if (includeNear) {
        const distance = colorDistance(candidateHex, normalized.hex);
        if (distance <= threshold) {
          near.push({
            tokenPath: entry.tokenPath,
            category: entry.category,
            mode: candidate.mode,
            value: candidateHex,
            cssVar: candidate.cssVar,
            distance: Number(distance.toFixed(2))
          });
        }
      }
    }
  }

  exact.sort(
    (a, b) =>
      a.tokenPath.localeCompare(b.tokenPath) || a.mode.localeCompare(b.mode)
  );
  near.sort(
    (a, b) => a.distance - b.distance || a.tokenPath.localeCompare(b.tokenPath)
  );

  return {
    input: value,
    normalizedInput: normalized.hex,
    mode,
    threshold,
    source: 'tokens-json',
    exact: exact.slice(0, Math.max(1, Math.min(Number(limit) || 20, 200))),
    near: near.slice(0, Math.max(1, Math.min(Number(limit) || 20, 200))),
    counts: {
      exact: exact.length,
      near: near.length
    }
  };
}
