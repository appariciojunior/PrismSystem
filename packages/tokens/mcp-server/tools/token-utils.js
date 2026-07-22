import { readFileSync, mkdirSync, writeFileSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = resolve(__dirname, '../../src/tokens.json');

let tokenCache = {
  mtimeMs: -1,
  tokens: null,
  setIndex: null,
  tokenEntries: null,
  tokenIndexes: null
};

function classifyLayer(setName) {
  if (setName === 'Foundation' || setName.startsWith('Foundation')) {
    return 'foundation';
  }

  if (
    setName.startsWith('Palette') ||
    setName.startsWith('light/ brand') ||
    setName.startsWith('dark/ brand')
  ) {
    return 'palette';
  }

  if (
    setName.startsWith('light/') ||
    setName.startsWith('dark/') ||
    setName.includes('core') ||
    setName.includes('channel')
  ) {
    return 'semantic';
  }

  return 'other';
}

function classifyMode(setName) {
  if (setName.startsWith('light/')) return 'light';
  if (setName.startsWith('dark/')) return 'dark';
  return 'all';
}

function extractReferences(value) {
  const refs = [];
  if (value == null) return refs;

  const valueString = String(value);
  const matches = valueString.matchAll(/\{([^}]+)\}/g);

  for (const match of matches) {
    refs.push(match[1]);
  }

  return refs;
}

export function loadTokens() {
  const stats = statSync(TOKENS_PATH);

  if (tokenCache.tokens && tokenCache.mtimeMs === stats.mtimeMs) {
    return tokenCache.tokens;
  }

  const tokens = JSON.parse(readFileSync(TOKENS_PATH, 'utf-8'));
  tokenCache = {
    mtimeMs: stats.mtimeMs,
    tokens,
    setIndex: null,
    tokenEntries: null,
    tokenIndexes: null
  };

  return tokens;
}

export function getTokenSets(tokens) {
  return Object.entries(tokens).filter(
    ([setName, setData]) =>
      setName !== '$themes' &&
      setName !== '$metadata' &&
      typeof setData === 'object' &&
      setData !== null
  );
}

export function getCachedSetIndex() {
  const tokens = loadTokens();
  if (tokenCache.setIndex) {
    return tokenCache.setIndex;
  }

  const setIndex = [];
  for (const [setName, setData] of getTokenSets(tokens)) {
    setIndex.push({
      setName,
      tokens: flattenTokenObject(setData)
    });
  }

  tokenCache.setIndex = setIndex;
  return setIndex;
}

export function getCachedTokenEntries() {
  loadTokens();

  if (tokenCache.tokenEntries) {
    return tokenCache.tokenEntries;
  }

  const entries = [];

  for (const [setName, setData] of getTokenSets(tokenCache.tokens)) {
    const layer = classifyLayer(setName);
    const mode = classifyMode(setName);
    const flattened = flattenTokenObject(setData);

    for (const token of flattened) {
      entries.push({
        set: setName,
        mode,
        layer,
        path: token.path,
        fullPath: `${setName}.${token.path}`,
        value: token.value,
        type: token.type,
        description: token.description || null,
        references: extractReferences(token.value)
      });
    }
  }

  tokenCache.tokenEntries = entries;
  return entries;
}

export function getCachedTokenIndexes() {
  if (tokenCache.tokenIndexes) {
    return tokenCache.tokenIndexes;
  }

  const entries = getCachedTokenEntries();

  const byFullPath = new Map();
  const byPath = new Map();
  const byLayerModeKey = new Map();
  const downstreamByReference = new Map();

  const allLayerModes = [
    ['all', 'all'],
    ['foundation', 'all'],
    ['palette', 'all'],
    ['semantic', 'all'],
    ['other', 'all'],
    ['all', 'light'],
    ['all', 'dark'],
    ['all', 'all']
  ];

  for (const [layer, mode] of allLayerModes) {
    byLayerModeKey.set(`${layer}|${mode}`, []);
  }

  for (const entry of entries) {
    byFullPath.set(entry.fullPath, entry);

    if (!byPath.has(entry.path)) {
      byPath.set(entry.path, []);
    }
    byPath.get(entry.path).push(entry);

    const keys = new Set([
      'all|all',
      `${entry.layer}|all`,
      `all|${entry.mode}`
    ]);

    if (entry.mode !== 'all') {
      keys.add(`${entry.layer}|${entry.mode}`);
    }

    for (const key of keys) {
      if (!byLayerModeKey.has(key)) {
        byLayerModeKey.set(key, []);
      }
      byLayerModeKey.get(key).push(entry);
    }

    for (const ref of entry.references) {
      if (!downstreamByReference.has(ref)) {
        downstreamByReference.set(ref, []);
      }
      downstreamByReference.get(ref).push(entry.fullPath);
    }
  }

  tokenCache.tokenIndexes = {
    byFullPath,
    byPath,
    byLayerModeKey,
    downstreamByReference
  };

  return tokenCache.tokenIndexes;
}

export function getEntriesForFilters(layer = 'all', mode = 'all') {
  const { byLayerModeKey } = getCachedTokenIndexes();
  return byLayerModeKey.get(`${layer}|${mode}`) || [];
}

export function findTokenEntries(tokenPath, includePartial = true) {
  const query = String(tokenPath || '').trim();
  if (!query) return [];

  const { byFullPath, byPath } = getCachedTokenIndexes();
  const directFull = byFullPath.get(query);
  if (directFull) return [directFull];

  const directPath = byPath.get(query);
  if (directPath && directPath.length > 0) {
    return directPath;
  }

  if (!includePartial) return [];

  const entries = getCachedTokenEntries();
  return entries.filter(
    (entry) =>
      entry.path.endsWith(query) ||
      entry.fullPath.endsWith(query) ||
      entry.fullPath.includes(query)
  );
}

export function flattenTokenObject(obj, prefix = '', out = []) {
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const path = prefix ? `${prefix}.${key}` : key;

    if (val && typeof val === 'object' && 'value' in val) {
      out.push({
        path,
        key,
        value: val.value,
        type: val.type || null,
        description: val.description || ''
      });
      continue;
    }

    if (val && typeof val === 'object') {
      flattenTokenObject(val, path, out);
    }
  }

  return out;
}

export function getNestedValue(obj, dottedPath) {
  const parts = dottedPath.split('.');
  let current = obj;

  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return null;
    }
    current = current[part];
  }

  return current;
}

export function hexToRgb(hex) {
  const clean = String(hex).trim().replace(/^#/, '');

  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16)
    };
  }

  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16)
    };
  }

  return null;
}

export function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(hexA, hexB) {
  const rgbA = hexToRgb(hexA);
  const rgbB = hexToRgb(hexB);
  if (!rgbA || !rgbB) return null;

  const lumA = relativeLuminance(rgbA);
  const lumB = relativeLuminance(rgbB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);

  return (lighter + 0.05) / (darker + 0.05);
}

function resolveReferenceValue(refPath, setData, globalTokenIndex, depth) {
  if (depth > 8) return null;

  const localMatch = getNestedValue(setData, refPath);
  if (localMatch && typeof localMatch === 'object' && 'value' in localMatch) {
    return resolveTokenValue(
      localMatch.value,
      setData,
      globalTokenIndex,
      depth + 1
    );
  }

  if (globalTokenIndex.has(refPath)) {
    return resolveTokenValue(
      globalTokenIndex.get(refPath),
      setData,
      globalTokenIndex,
      depth + 1
    );
  }

  return null;
}

export function resolveTokenValue(value, setData, globalTokenIndex, depth = 0) {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();

  if (/^#[0-9a-fA-F]{3,6}$/.test(trimmed)) {
    return trimmed;
  }

  const refMatch = trimmed.match(/^\{(.+?)\}$/);
  if (refMatch) {
    return resolveReferenceValue(refMatch[1], setData, globalTokenIndex, depth);
  }

  return null;
}

export function createGlobalTokenIndex(tokens) {
  const index = new Map();

  for (const [setName, setData] of getTokenSets(tokens)) {
    const flattened = flattenTokenObject(setData);
    for (const token of flattened) {
      // Local path key often appears in references, e.g. {ramp.neutral.100}
      if (!index.has(token.path)) {
        index.set(token.path, token.value);
      }

      // Fully-qualified path key for deterministic addressing.
      index.set(`${setName}.${token.path}`, token.value);
    }
  }

  return index;
}

export function ensureDirAndWrite(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf-8');
}

export function defaultGeneratedDocPath(fileName) {
  return resolve(__dirname, `../../docs/generated/${fileName}`);
}

export function defaultTempPath(fileName) {
  return resolve(__dirname, `../../temp/${fileName}`);
}
