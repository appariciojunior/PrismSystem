import {
  loadTokens,
  getTokenSets,
  flattenTokenObject,
  createGlobalTokenIndex,
  resolveTokenValue
} from './token-utils.js';

function normalizeSetName(setName) {
  return String(setName || '').toLowerCase();
}

export function classifyLayer(setName) {
  const normalized = normalizeSetName(setName);

  if (normalized === 'foundation' || normalized.startsWith('foundation/')) {
    return 'foundation';
  }

  if (
    normalized.startsWith('light/ brand') ||
    normalized.startsWith('dark/ brand')
  ) {
    return 'palette';
  }

  if (normalized.startsWith('light/') || normalized.startsWith('dark/')) {
    return 'semantic';
  }

  return 'other';
}

export function shouldIncludeMode(setName, mode) {
  if (mode === 'all') return true;
  if (mode === 'light') return normalizeSetName(setName).startsWith('light/');
  if (mode === 'dark') return normalizeSetName(setName).startsWith('dark/');
  return true;
}

function toCssSafe(segment) {
  return String(segment)
    .trim()
    .replace(/\s+/g, '-')
    .replace(/\./g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function toHumanSegment(segment) {
  return String(segment)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function parseSet(setName) {
  const normalized = String(setName || '').trim();
  const [rawMode, ...rest] = normalized.split('/').map((s) => s.trim());

  const mode = (rawMode || '').toLowerCase();
  const namespace = rest.join('-') || rawMode || 'tokens';

  return {
    mode,
    namespace,
    modeLabel: toHumanSegment(mode || 'tokens'),
    namespaceLabel: toHumanSegment(namespace)
  };
}

function setPriority(setName) {
  const normalized = String(setName || '').toLowerCase();
  if (normalized.includes('/ core')) return 100;
  if (normalized.includes('/ channels')) return 80;
  if (normalized.includes('/ brand')) return 60;
  return 40;
}

export function buildCssVar(setName, tokenPath) {
  const { mode, namespace } = parseSet(setName);
  const scopedPath = String(tokenPath || '')
    .split('.')
    .map(toCssSafe)
    .join('-');
  return `--ds-${toCssSafe(mode)}-${toCssSafe(namespace)}-${scopedPath}`;
}

export function buildFigmaVariablePath(setName, tokenPath) {
  const { modeLabel, namespaceLabel } = parseSet(setName);
  const pathParts = String(tokenPath || '')
    .split('.')
    .map((p) => toHumanSegment(p));
  return [modeLabel, namespaceLabel, ...pathParts].join(' / ');
}

export function tokenCategory(tokenPath) {
  return String(tokenPath || '').split('.')[0] || 'other';
}

export function normalizeHex(input) {
  const raw = String(input || '').trim();
  const clean = raw.startsWith('#') ? raw.slice(1) : raw;

  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    const expanded = clean
      .split('')
      .map((c) => c + c)
      .join('')
      .toUpperCase();
    return `#${expanded}`;
  }

  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return `#${clean.toUpperCase()}`;
  }

  return null;
}

export function buildSemanticDiscoveryEntries({ includeCategories = [] } = {}) {
  const tokens = loadTokens();
  const globalTokenIndex = createGlobalTokenIndex(tokens);
  const filters = new Set(
    includeCategories.map((c) => String(c).toLowerCase())
  );

  const byPath = new Map();

  for (const [setName, setData] of getTokenSets(tokens)) {
    if (classifyLayer(setName) !== 'semantic') continue;
    if (!shouldIncludeMode(setName, 'all')) continue;

    const mode = normalizeSetName(setName).startsWith('dark/')
      ? 'dark'
      : 'light';
    const flattened = flattenTokenObject(setData);

    for (const token of flattened) {
      const category = tokenCategory(token.path);
      if (filters.size > 0 && !filters.has(category.toLowerCase())) continue;

      const resolved = resolveTokenValue(
        token.value,
        setData,
        globalTokenIndex
      );
      const key = token.path;

      if (!byPath.has(key)) {
        byPath.set(key, {
          tokenPath: token.path,
          category,
          type: token.type || null,
          description: token.description || '',
          aliases: [],
          lightValue: null,
          darkValue: null,
          cssVarLight: null,
          cssVarDark: null,
          figmaVariablePath: buildFigmaVariablePath(setName, token.path),
          _lightPriority: -1,
          _darkPriority: -1
        });
      }

      const entry = byPath.get(key);
      const cssVar = buildCssVar(setName, token.path);
      const hex = normalizeHex(resolved);
      const priority = setPriority(setName);

      if (mode === 'light') {
        if (priority >= entry._lightPriority) {
          entry.lightValue = hex || resolved || null;
          entry.cssVarLight = cssVar;
          entry._lightPriority = priority;
        }
      } else {
        if (priority >= entry._darkPriority) {
          entry.darkValue = hex || resolved || null;
          entry.cssVarDark = cssVar;
          entry._darkPriority = priority;
        }
      }

      if (
        token.description &&
        priority >= Math.max(entry._lightPriority, entry._darkPriority)
      ) {
        entry.description = token.description;
      }

      const pathParts = token.path.split('.');
      entry.aliases = [...new Set([...entry.aliases, ...pathParts])];
    }
  }

  return [...byPath.values()]
    .map((entry) => {
      const cleaned = { ...entry };
      delete cleaned._lightPriority;
      delete cleaned._darkPriority;
      return cleaned;
    })
    .sort((a, b) => a.tokenPath.localeCompare(b.tokenPath));
}
