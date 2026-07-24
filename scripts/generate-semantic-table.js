/*
Generate a markdown table of core semantic colour tokens with Light/Dark hex values and contrast ratios.
- Enumerates tokens from packages/tokens/tokens.json under "light/ core" and "dark/ core"
- Resolves palette references via packages/output/ramp-colors-resolved.json (Palette - Light/Dark)
- Computes contrast ratios for relevant token types against sensible background contexts
- Appends/updates a section in packages/tokens/semantic-colour.md
*/

import fs from 'fs';
import path from 'path';

const root = path.resolve('.');
const TOKENS_JSON = path.join(root, 'packages/tokens/tokens.json');
const RAMP_JSON = path.join(root, 'packages/output/ramp-colors-resolved.json');
const SEMANTIC_MD = path.join(root, 'packages/tokens/semantic-colour.md');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const tokens = readJson(TOKENS_JSON);
const ramp = readJson(RAMP_JSON);

// Build lookup maps for palette refs → hex/rgba
const rampLight = new Map();
const rampDark = new Map();
for (const [k, v] of Object.entries(ramp)) {
  if (k.startsWith('Palette - Light/ ')) {
    const ref = k.replace('Palette - Light/ ', '');
    rampLight.set(ref, v.resolved);
  } else if (k.startsWith('Palette - Dark/ ')) {
    const ref = k.replace('Palette - Dark/ ', '');
    rampDark.set(ref, v.resolved);
  }
}

// Helpers
function isRef(val) {
  return typeof val === 'string' && val.startsWith('{') && val.endsWith('}');
}
function stripBraces(val) {
  return val.slice(1, -1);
}
function get(obj, pathStr) {
  const parts = pathStr.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

// Resolve a token value to hex/rgba string for a given theme (light|dark)
function resolveValue(themeObj, themeName, pathStr, stack = new Set()) {
  const node = get(themeObj, pathStr);
  if (!node) return undefined;
  const val = node.value ?? node; // sometimes nested alias
  if (typeof val !== 'string') return undefined;

  if (isRef(val)) {
    const ref = stripBraces(val);
    // local semantic reference (e.g., text.primary)
    if (!ref.includes('.ramp.')) {
      // Allow relative refs like text.primary, icon.primary, etc.
      // Try within the same theme root
      if (stack.has(ref)) return undefined; // circular guard
      stack.add(ref);
      const resolved = resolveValue(
        themeObj,
        themeName,
        ref.replace(/\//g, '.').replace(/\s/g, ' ').replace(/\s*$/, '')
      );
      if (resolved) return resolved;
      // Or ref could be nested local path like interactive.primary.text.default
      const localResolved = resolveValue(themeObj, themeName, ref);
      if (localResolved) return localResolved;
      return undefined;
    }
    // palette ref: Brand or Channels collections
    let paletteKey;
    if (ref.startsWith('brand.core.ramp')) {
      paletteKey = 'Brand.' + ref;
    } else if (ref.startsWith('brand.channels.ramp')) {
      paletteKey = 'Channels.' + ref;
    } else if (ref.startsWith('brand.core.')) {
      paletteKey = 'Brand.' + ref;
    } else if (ref.startsWith('brand.channels.')) {
      paletteKey = 'Channels.' + ref;
    } else {
      // try as-is under Brand first
      paletteKey = 'Brand.' + ref;
    }
    const m = themeName === 'light' ? rampLight : rampDark;
    return m.get(paletteKey);
  }
  // Direct color value (hex/rgba) or unexpected
  return val;
}

// Relative luminance calculation (sRGB)
function srgbToLinear(c) {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
    a: 1
  };
}
function parseColor(color) {
  if (!color) return null;
  if (color.startsWith('#')) return hexToRgb(color);
  const m = color.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const parts = m[1].split(',').map((s) => s.trim());
    const r = parseFloat(parts[0]);
    const g = parseFloat(parts[1]);
    const b = parseFloat(parts[2]);
    const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
    return { r, g, b, a };
  }
  return null;
}
function compositeOver(fg, bg) {
  // Both are {r,g,b,a}; assumes bg.a=1 if absent
  const a = fg.a + bg.a * (1 - fg.a);
  const r = (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a;
  const g = (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a;
  const b = (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a;
  return { r, g, b, a };
}
function luminance(rgb) {
  const R = srgbToLinear(rgb.r);
  const G = srgbToLinear(rgb.g);
  const B = srgbToLinear(rgb.b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrastRatio(fgColor, bgColor) {
  const fg = parseColor(fgColor);
  const bg = parseColor(bgColor);
  if (!fg || !bg) return null;
  let compFg = fg;
  if (fg.a !== undefined && fg.a < 1) {
    compFg = compositeOver(fg, { ...bg, a: 1 });
  }
  const L1 = luminance(compFg);
  const L2 = luminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100; // 2dp
}

// Build flattened map of color-bearing paths for a theme section
function flattenTheme(themeObj, prefix = '') {
  const entries = [];
  function walk(obj, pathArr) {
    for (const [k, v] of Object.entries(obj)) {
      const newPath = [...pathArr, k];
      if (v && typeof v === 'object' && 'value' in v && v.type === 'color') {
        entries.push({ path: newPath.join('.'), node: v });
      } else if (v && typeof v === 'object' && !Array.isArray(v)) {
        walk(v, newPath);
      }
    }
  }
  walk(themeObj, prefix ? [prefix] : []);
  return entries;
}

const lightCore = tokens['light/ core'];
const darkCore = tokens['dark/ core'];
if (!lightCore || !darkCore) {
  console.error('Could not find light/ core or dark/ core in tokens.json');
  process.exit(1);
}

const lightEntries = flattenTheme(lightCore);
const darkEntries = flattenTheme(darkCore);

// Index entries by path for quick lookup (within theme)
const lightIndex = Object.fromEntries(lightEntries.map((e) => [e.path, e]));
const darkIndex = Object.fromEntries(darkEntries.map((e) => [e.path, e]));

// Build rows - show raw token references AND contrast values
const rows = [];

for (const e of lightEntries) {
  const pathStr = e.path;
  const lightNode = lightIndex[pathStr];
  const darkNode = darkIndex[pathStr];

  if (!lightNode || !darkNode) {
    console.warn(`Token ${pathStr} missing in one of the themes`);
    continue;
  }

  // Get raw value (should be a reference like {brand.core.ramp.core.neutral.950})
  const lightRef = lightNode.node.value || '';
  const darkRef = darkNode.node.value || '';

  // Resolve to hex for contrast calculation
  const lightHex = resolveValue(lightCore, 'light', pathStr);
  const darkHex = resolveValue(darkCore, 'dark', pathStr);

  // Calculate contrast - light vs white, dark vs black
  let lightVsWhite = '';
  let darkVsBlack = '';

  if (lightHex) {
    const cwh = contrastRatio(lightHex, '#FFFFFF');
    if (cwh !== null) lightVsWhite = cwh.toString();
  }

  if (darkHex) {
    const cbl = contrastRatio(darkHex, '#000000');
    if (cbl !== null) darkVsBlack = cbl.toString();
  }

  rows.push({
    token: pathStr,
    lightRef,
    lightVsWhite,
    darkRef,
    darkVsBlack
  });
}

// Render markdown table
function renderMarkdown(rows) {
  const header =
    '**Semantic Table**\n- Shows palette/semantic references for each token in Light and Dark themes\n- Light contrast vs white (#FFFFFF), Dark contrast vs black (#000000)\n\n| Token | Light Reference | vs White | Dark Reference | vs Black |\n|---|---|---:|---|---:|\n';
  const lines = rows.map(
    (r) =>
      `| ${r.token} | ${r.lightRef} | ${r.lightVsWhite} | ${r.darkRef} | ${r.darkVsBlack} |`
  );
  return header + lines.join('\n') + '\n';
}

console.log(
  `Generated semantic token table: ${rows.length} tokens × 2 themes = ${rows.length * 2} references.`
);

const tableMd = renderMarkdown(rows);
const md = fs.readFileSync(SEMANTIC_MD, 'utf8');
const startMarker = '\n**Semantic Table**';
let newMd;
if (md.includes(startMarker)) {
  // replace from startMarker to end of table (next header or EOF)
  const before = md.split(startMarker)[0];
  newMd = before + '\n' + tableMd;
} else {
  newMd = md.trimEnd() + '\n\n' + tableMd;
}
fs.writeFileSync(SEMANTIC_MD, newMd, 'utf8');

console.log(`Wrote semantic table with ${rows.length} rows to ${SEMANTIC_MD}`);
