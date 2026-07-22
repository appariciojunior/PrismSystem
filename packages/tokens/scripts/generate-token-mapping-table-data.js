import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TOKENS_PATH = path.join(ROOT, 'packages/tokens/src/tokens.json');
const RESOLVED_TOKENS_PATH = path.join(ROOT, 'build/js/tokens.json');
const DOC_PATH = path.join(
  ROOT,
  'packages/tokens/docs/archive/strategy-and-bridge-logic.md'
);
const OUTPUT_DIR = path.join(ROOT, 'packages/tokens/docs/migration/data');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'token-mapping-table.generated.json');

const EXCLUDED_THEME_SETS = new Set([
  'brand',
  'channels',
  'marketing',
  'dataVisualisation'
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function cleanCell(cell) {
  return cell.trim();
}

function parseMarkdownRows(markdown) {
  const lines = markdown.split('\n');
  const rows = [];
  let inSection = false;
  let headerSeen = false;

  for (const line of lines) {
    if (line.startsWith('### Legacy Anchored Reference')) {
      inSection = true;
      continue;
    }

    if (inSection && line.startsWith('### ')) {
      break;
    }

    if (!inSection || !line.startsWith('|')) {
      continue;
    }

    const cells = line.split('|').slice(1, -1).map(cleanCell);

    if (cells.length < 4) {
      continue;
    }

    if (!headerSeen) {
      if (/^Legacy Token$/i.test(cells[0])) {
        headerSeen = true;
      }
      continue;
    }

    if (cells.every((cell) => /^:?-+:?$/.test(cell))) {
      continue;
    }

    rows.push({
      legacyToken: cells[0].replace(/`/g, '').trim(),
      description: cells[1].replace(/`/g, '').trim(),
      lightRaw: cells[2],
      darkRaw: cells[3]
    });
  }

  return rows;
}

function extractCandidates(cellValue) {
  if (!cellValue || /^Orphan$/i.test(cellValue.trim())) {
    return [];
  }

  const candidates = [];
  const matcher =
    /<code[^>]*>([^<]+)<\/code>\s*<span[^>]*>(H|M|L|High|Medium|Low|Orphan)<\/span>/gi;

  for (const match of cellValue.matchAll(matcher)) {
    candidates.push({
      token: match[1].trim(),
      score: normalizeScore(match[2])
    });
  }

  return candidates;
}

function normalizeScore(raw) {
  const value = (raw || '').trim().toLowerCase();
  if (value === 'h' || value === 'high') return 'H';
  if (value === 'm' || value === 'medium') return 'M';
  if (value === 'l' || value === 'low') return 'L';
  return 'Orphan';
}

function getThemeNames(tokens) {
  const allKeys = Object.keys(tokens);
  const lights = allKeys
    .filter((key) => key.startsWith('light/ '))
    .map((key) => key.replace('light/ ', ''))
    .filter((name) => !EXCLUDED_THEME_SETS.has(name));

  const darkSet = new Set(
    allKeys
      .filter((key) => key.startsWith('dark/ '))
      .map((key) => key.replace('dark/ ', ''))
      .filter((name) => !EXCLUDED_THEME_SETS.has(name))
  );

  return lights
    .filter((name) => darkSet.has(name))
    .sort((a, b) => {
      if (a === 'core') return -1;
      if (b === 'core') return 1;
      return a.localeCompare(b);
    });
}

function getNested(node, parts) {
  let current = node;
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return null;
    }
    current = current[part];
  }
  return current;
}

function resolveThemeToken(resolvedTokens, theme, mode, tokenPath) {
  const tokenParts = tokenPath.split('.');
  const modeRoot = resolvedTokens[`${mode}/ ${theme}`];
  if (!modeRoot) {
    return null;
  }

  const tokenValue = getNested(modeRoot, tokenParts);
  if (typeof tokenValue !== 'string') {
    return null;
  }

  return tokenValue;
}

function buildResolvedMatrix(resolvedTokens, themes, tokenPath) {
  const byTheme = {};
  for (const theme of themes) {
    byTheme[theme] = {
      light: resolveThemeToken(resolvedTokens, theme, 'light', tokenPath),
      dark: resolveThemeToken(resolvedTokens, theme, 'dark', tokenPath)
    };
  }
  return byTheme;
}

// All candidates from the markdown (light + dark cells) become the canonical list.
// The user manually curates these cells — multiple entries are valid.
function buildCanonicalList(lightCandidates, darkCandidates) {
  const SCORE_ORDER = { H: 3, M: 2, L: 1, Orphan: 0 };
  const seen = new Map();
  for (const c of [...lightCandidates, ...darkCandidates]) {
    if (!c.token) continue;
    const existing = seen.get(c.token);
    if (
      !existing ||
      (SCORE_ORDER[c.score] || 0) > (SCORE_ORDER[existing.score] || 0)
    ) {
      seen.set(c.token, c);
    }
  }
  return [...seen.values()];
}

function hexToRgb(hex) {
  const c = (hex || '#000000').replace('#', '');
  return [
    parseInt(c.slice(0, 2), 16),
    parseInt(c.slice(2, 4), 16),
    parseInt(c.slice(4, 6), 16)
  ];
}

function rgbDistance(hex1, hex2) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function flattenTokenPaths(obj, prefix) {
  const result = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string' && value.startsWith('#')) {
      result.push({ token: path, hex: value });
    } else if (typeof value === 'object' && value !== null) {
      result.push(...flattenTokenPaths(value, path));
    }
  }
  return result;
}

// Compute synthetic matches by HEX-proximity against all 286 semantic tokens
// in the core/light theme. Excludes tokens already in canonical.
// Returns up to 3 closest matches within RGB distance ≤ 90.
function buildSyntheticList(canonicalList, resolvedTokens) {
  if (canonicalList.length === 0) return [];

  const refToken = canonicalList[0].token;
  const refHex = resolveThemeToken(resolvedTokens, 'core', 'light', refToken);
  if (!refHex) return [];

  const canonicalNames = new Set(canonicalList.map((c) => c.token));
  const coreLight = resolvedTokens['light/ core'] || {};
  const allTokens = flattenTokenPaths(coreLight, '');

  const MAX_DIST = 90;
  const MAX_RESULTS = 3;

  const ranked = allTokens
    .filter((t) => !canonicalNames.has(t.token))
    .map((t) => ({ token: t.token, dist: rgbDistance(refHex, t.hex) }))
    .sort((a, b) => a.dist - b.dist);

  const results = [];
  for (const c of ranked) {
    if (c.dist > MAX_DIST) break;
    const score = c.dist <= 10 ? 'H' : c.dist <= 40 ? 'M' : 'L';
    results.push({ token: c.token, score });
    if (results.length >= MAX_RESULTS) break;
  }
  return results;
}

function groupForNewskitToken(token) {
  if (!token) return 'other';
  return token.split('.')[0] || 'other';
}

function main() {
  const tokens = readJson(TOKENS_PATH);
  const resolvedTokens = readJson(RESOLVED_TOKENS_PATH);
  const markdown = readText(DOC_PATH);

  const themes = getThemeNames(tokens);
  const sourceRows = parseMarkdownRows(markdown);

  const rows = sourceRows.map((row) => {
    const lightCandidates = extractCandidates(row.lightRaw);
    const darkCandidates = extractCandidates(row.darkRaw);
    const canonicalList = buildCanonicalList(lightCandidates, darkCandidates);
    const syntheticList = buildSyntheticList(canonicalList, resolvedTokens);

    return {
      group: groupForNewskitToken(row.legacyToken),
      legacyToken: row.legacyToken,
      description: row.description,
      matches: {
        canonical: canonicalList.map((match) => ({
          token: match.token,
          score: match.score,
          resolvedByTheme:
            match.token != null
              ? buildResolvedMatrix(resolvedTokens, themes, match.token)
              : {}
        })),
        synthetic: syntheticList.map((match) => ({
          token: match.token,
          score: match.score,
          resolvedByTheme:
            match.token != null
              ? buildResolvedMatrix(resolvedTokens, themes, match.token)
              : {}
        }))
      }
    };
  });

  const payload = {
    metadata: {
      generatedAt: new Date().toISOString(),
      source: {
        mappingMarkdown:
          'packages/tokens/docs/archive/strategy-and-bridge-logic.md',
        tokens: 'packages/tokens/src/tokens.json'
      },
      defaultTheme: 'core',
      themes,
      rowCount: rows.length
    },
    rows
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(payload, null, 2) + '\n',
    'utf8'
  );

  console.log(`Generated ${OUTPUT_PATH} with ${rows.length} rows.`);
}

main();
