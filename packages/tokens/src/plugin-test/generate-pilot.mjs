#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Color from 'colorjs.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../../../../');
const SOURCE_TOKENS_PATH = path.join(ROOT, 'packages/tokens/src/tokens.json');
const OUTPUT_DIR = __dirname;

const FOUNDATION_OUTPUT_PATH = path.join(OUTPUT_DIR, 'foundation.json');
const PALETTE_OUTPUT_PATH = path.join(OUTPUT_DIR, 'palette.json');
const SEMANTIC_OUTPUT_PATH = path.join(OUTPUT_DIR, 'semantic.json');
const REPORT_OUTPUT_PATH = path.join(OUTPUT_DIR, 'generation-report.json');

const MODE_LABELS = {
  light: 'Light',
  dark: 'Dark'
};

const FOUNDATION_GROUPS = [
  'foundation',
  'viewport/ small',
  'viewport/ medium',
  'viewport/ large',
  'viewport/ xlarge',
  'typographyTokens',
  'borderRadius'
];

const PALETTE_SET_CONFIG = [
  { source: 'light/ brand', mode: 'Light', target: ['brand', 'core'] },
  { source: 'light/ marketing', mode: 'Light', target: ['brand', 'marketing'] },
  {
    source: 'light/ dataVisualisation',
    mode: 'Light',
    target: ['brand', 'data-visualisation']
  },
  { source: 'dark/ brand', mode: 'Dark', target: ['brand', 'core'] },
  { source: 'dark/ marketing', mode: 'Dark', target: ['brand', 'marketing'] },
  {
    source: 'dark/ dataVisualisation',
    mode: 'Dark',
    target: ['brand', 'data-visualisation']
  }
];

const SEMANTIC_THEME_CONFIG = [
  { source: 'light/ core', mode: 'Light', key: 'core' },
  { source: 'dark/ core', mode: 'Dark', key: 'core' }
];

const TYPE_MAP = {
  color: 'color',
  number: 'number',
  spacing: 'number',
  fontSizes: 'number',
  lineHeights: 'number',
  borderRadius: 'number',
  fontWeights: 'string',
  fontFamilies: 'string',
  boolean: 'boolean',
  textDecoration: 'string',
  string: 'string'
};

const SOURCE = JSON.parse(fs.readFileSync(SOURCE_TOKENS_PATH, 'utf8'));

const report = {
  generatedAt: new Date().toISOString(),
  source: 'packages/tokens/src/tokens.json',
  outputs: {
    foundation: path.relative(ROOT, FOUNDATION_OUTPUT_PATH),
    palette: path.relative(ROOT, PALETTE_OUTPUT_PATH),
    semantic: path.relative(ROOT, SEMANTIC_OUTPUT_PATH),
    report: path.relative(ROOT, REPORT_OUTPUT_PATH)
  },
  skippedUnsupportedTokens: [],
  semanticResolvedToHex: [],
  semanticAliasedToPalette: [],
  notes: [
    'Color ramps are regenerated in OKLCH from the existing token intent, not from Token Studio runtime metadata.',
    'Semantic tokens keep aliases where possible; tokens that could not be matched back to a palette ramp stay as concrete values and are listed below.'
  ]
};

const resolvedHexCache = new Map();
const resolvedAliasCache = new Map();
const paletteHexByMode = { Light: new Map(), Dark: new Map() };
const paletteValueByMode = { Light: new Map(), Dark: new Map() };

function setNestedValue(target, keyPath, value) {
  let current = target;
  for (let index = 0; index < keyPath.length; index += 1) {
    const key = keyPath[index];
    if (index === keyPath.length - 1) {
      current[key] = value;
      return;
    }

    current[key] = current[key] || {};
    current = current[key];
  }
}

function getNodeByPath(pathParts) {
  const candidates = [pathParts, pathParts.map((part) => (part === 'puzzles' ? 'puzzle' : part))];
  for (const candidate of candidates) {
    let current = SOURCE;
    let found = true;
    for (const part of candidate) {
      if (!current || typeof current !== 'object' || !(part in current)) {
        found = false;
        break;
      }
      current = current[part];
    }
    if (found) {
      return current;
    }
  }
  return null;
}

function isToken(node) {
  return Boolean(
    node &&
      typeof node === 'object' &&
      Object.prototype.hasOwnProperty.call(node, 'value') &&
      Object.prototype.hasOwnProperty.call(node, 'type')
  );
}

function isMetadataKey(key) {
  return key.startsWith('$');
}

function stripStudioExtensions(extensions = {}) {
  const nextExtensions = { ...extensions };
  delete nextExtensions['studio.tokens'];
  return Object.keys(nextExtensions).length > 0 ? nextExtensions : null;
}

function normalizeHex(value) {
  const color = new Color(value).to('srgb');
  const coords = color.coords.map((channel) => Math.max(0, Math.min(1, channel)));
  const hex =
    '#' +
    coords
      .map((channel) => Math.round(channel * 255).toString(16).padStart(2, '0'))
      .join('');

  if (typeof color.alpha === 'number' && color.alpha < 1) {
    return `${hex}${Math.round(color.alpha * 255)
      .toString(16)
      .padStart(2, '0')}`;
  }

  return hex;
}

function rgbaToHex(value) {
  const match = value.match(
    /rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/i
  );

  if (!match) {
    return value;
  }

  const channels = [match[1], match[2], match[3]].map((channel) => Number.parseFloat(channel));
  const alpha = match[4] === undefined ? null : Number.parseFloat(match[4]);
  const hex =
    '#' +
    channels
      .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
      .join('');

  if (alpha === null) {
    return hex;
  }

  return `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;
}

function evaluateExpression(expression) {
  return expression
    .split('*')
    .map((part) => Number.parseFloat(part.trim()))
    .filter((part) => Number.isFinite(part))
    .reduce((total, part) => total * part, 1);
}

function getModeKeyFromSet(setKey) {
  if (setKey.startsWith('light/')) return 'light';
  if (setKey.startsWith('dark/')) return 'dark';
  return null;
}

function resolveReferenceTarget(reference, setKey) {
  const rawPath = reference.slice(1, -1).replace(/\//g, '.');
  const segments = rawPath.split('.');
  const modeKey = getModeKeyFromSet(setKey);

  const candidates = [];

  if (setKey) {
    candidates.push([setKey, ...segments]);
  }

  candidates.push(['foundation', ...segments]);

  if (modeKey) {
    candidates.push([`${modeKey}/ brand`, ...segments]);
    candidates.push([`${modeKey}/ marketing`, ...segments]);
    candidates.push([`${modeKey}/ dataVisualisation`, ...segments]);

    if (rawPath.startsWith('brand.core.')) {
      candidates.push([`${modeKey}/ brand`, ...segments.slice(2)]);
    }
    if (rawPath.startsWith('brand.marketing.')) {
      candidates.push([`${modeKey}/ marketing`, ...segments.slice(2)]);
    }
    if (rawPath.startsWith('brand.data-visualisation.')) {
      candidates.push([`${modeKey}/ dataVisualisation`, ...segments.slice(2)]);
    }
    if (rawPath.startsWith('brand.dataVisualisation.')) {
      candidates.push([`${modeKey}/ dataVisualisation`, ...segments.slice(2)]);
    }
  }

  for (const candidate of candidates) {
    const node = getNodeByPath(candidate);
    if (node) {
      return { path: candidate, node };
    }
  }

  return null;
}

function resolveGenericValue(rawValue, setKey, stack = []) {
  if (typeof rawValue !== 'string') {
    return rawValue;
  }

  if (rawValue.startsWith('rgba') || rawValue.startsWith('rgb')) {
    return normalizeHex(rgbaToHex(rawValue));
  }

  if (!(rawValue.startsWith('{') && rawValue.endsWith('}'))) {
    return rawValue;
  }

  const target = resolveReferenceTarget(rawValue, setKey);
  if (!target || !isToken(target.node)) {
    return rawValue;
  }

  const cacheKey = target.path.join('.');
  if (stack.includes(cacheKey)) {
    return rawValue;
  }

  if (TYPE_MAP[target.node.type] === 'number') {
    return normalizeNumberishValue(target.node.value);
  }

  if (TYPE_MAP[target.node.type] === 'string') {
    return String(target.node.value);
  }

  if (TYPE_MAP[target.node.type] === 'boolean') {
    return Boolean(target.node.value);
  }

  return resolveColorHex(target.path[0], target.path.slice(1), [...stack, cacheKey]);
}

function normalizeNumberishValue(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    return normalizeNumberishValue(resolveGenericValue(value, 'foundation'));
  }

  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim())) {
    return Number.parseFloat(value);
  }

  return value;
}

function collapseAliasToColor(value, setKey, stack = []) {
  if (!(typeof value === 'string' && value.startsWith('{') && value.endsWith('}'))) {
    return value;
  }

  const target = resolveReferenceTarget(value, setKey);
  if (!target || !isToken(target.node)) {
    return value;
  }

  const cacheKey = target.path.join('.');
  if (stack.includes(cacheKey)) {
    return value;
  }

  return resolveColorHex(target.path[0], target.path.slice(1), [...stack, cacheKey]);
}

function applyOklchModifier(hex, modifier, setKey) {
  const baseValue = collapseAliasToColor(hex, setKey);
  const amountRaw = resolveGenericValue(modifier.value, setKey);
  const amount = typeof amountRaw === 'number' ? amountRaw : evaluateExpression(String(amountRaw));
  const color = new Color(baseValue).to('oklch');
  let [lightness, chroma, hue] = color.coords;

  if (modifier.type === 'lighten') {
    lightness = lightness + (1 - lightness) * amount;
  } else if (modifier.type === 'darken') {
    lightness = lightness * (1 - amount);
  } else if (modifier.type === 'mix' && modifier.color) {
    const mixColor = new Color(resolveGenericValue(modifier.color, setKey)).to('oklch');
    const [mixLightness, mixChroma, mixHue] = mixColor.coords;
    lightness = lightness + (mixLightness - lightness) * amount;
    chroma = chroma + (mixChroma - chroma) * amount;
    if (Number.isFinite(hue) && Number.isFinite(mixHue)) {
      let delta = mixHue - hue;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      hue = hue + delta * amount;
    }
  }

  const next = new Color('oklch', [Math.max(0, Math.min(1, lightness)), Math.max(0, chroma), hue]);
  return normalizeHex(next);
}

function resolveColorHex(setKey, localPath, stack = []) {
  const cacheKey = `${setKey}:${localPath.join('.')}`;
  if (resolvedHexCache.has(cacheKey)) {
    return resolvedHexCache.get(cacheKey);
  }

  const node = getNodeByPath([setKey, ...localPath]);
  if (!isToken(node)) {
    throw new Error(`Cannot resolve token at ${setKey}.${localPath.join('.')}`);
  }

  let resolved = node.value;

  if (typeof resolved === 'string' && resolved.startsWith('{') && resolved.endsWith('}')) {
    const target = resolveReferenceTarget(resolved, setKey);
    if (target && isToken(target.node)) {
      const targetKey = target.path.join('.');
      if (!stack.includes(targetKey)) {
        resolved = resolveColorHex(target.path[0], target.path.slice(1), [...stack, targetKey]);
      }
    }
  }

  if (typeof resolved === 'string' && resolved.startsWith('{') && resolved.endsWith('}')) {
    const fallback = resolveGenericValue(resolved, setKey, stack);
    if (typeof fallback === 'string' && !(fallback.startsWith('{') && fallback.endsWith('}'))) {
      resolved = fallback;
    }
  }

  if (typeof resolved === 'string' && (resolved.startsWith('rgb') || resolved.startsWith('#'))) {
    resolved = normalizeHex(resolved.startsWith('#') ? resolved : rgbaToHex(resolved));
  }

  const modifier = node.$extensions?.['studio.tokens']?.modify;
  if (modifier) {
    resolved = applyOklchModifier(resolved, modifier, setKey);
  }

  resolvedHexCache.set(cacheKey, resolved);
  return resolved;
}

function buildFoundation() {
  const foundation = {
    $metadata: {
      collection: 'Foundation'
    }
  };

  for (const groupKey of FOUNDATION_GROUPS) {
    const sourceNode = SOURCE[groupKey];
    if (!sourceNode) continue;

    const targetPath =
      groupKey === 'foundation'
        ? []
        : groupKey.startsWith('viewport/')
          ? ['viewport', groupKey.split('/ ')[1]]
          : [groupKey];

    const transformed = transformFoundationNode(sourceNode, groupKey, targetPath);
    if (!transformed) continue;

    if (targetPath.length === 0) {
      Object.assign(foundation, transformed);
    } else {
      setNestedValue(foundation, targetPath, transformed);
    }
  }

  return foundation;
}

function transformFoundationNode(node, setKey, currentPath) {
  if (isToken(node)) {
    const dtcgType = TYPE_MAP[node.type];
    if (!dtcgType || node.type === 'other' || node.type === 'boxShadow' || node.type === 'typography') {
      report.skippedUnsupportedTokens.push(`${setKey}.${currentPath.join('.')}`);
      return null;
    }

    if (currentPath[0] === 'colour' && currentPath[1] === 'modifier') {
      return null;
    }

    let value = node.value;
    if (dtcgType === 'color') {
      value = resolveColorHex(setKey, currentPath);
    } else if (dtcgType === 'number') {
      value = normalizeNumberishValue(value);
    } else if (dtcgType === 'string') {
      value = String(resolveGenericValue(value, setKey));
    } else if (dtcgType === 'boolean') {
      value = Boolean(resolveGenericValue(value, setKey));
    }

    const result = {
      $value: value,
      $type: dtcgType
    };

    if (node.description) {
      result.$description = node.description;
    }

    const nextExtensions = stripStudioExtensions(node.$extensions);
    if (nextExtensions) {
      result.$extensions = nextExtensions;
    }

    return result;
  }

  const result = {};
  for (const [key, value] of Object.entries(node)) {
    if (isMetadataKey(key)) continue;
    const nextValue = transformFoundationNode(value, setKey, [...currentPath, key]);
    if (nextValue) {
      result[key] = nextValue;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

function buildPalette() {
  const palette = {
    $metadata: {
      collection: 'Palette',
      modes: ['Light', 'Dark']
    },
    Light: {},
    Dark: {}
  };

  for (const config of PALETTE_SET_CONFIG) {
    const sourceNode = SOURCE[config.source];
    const transformed = transformPaletteNode(sourceNode, config.source, []);
    setNestedValue(palette[config.mode], config.target, transformed);
    indexPaletteTokens(config.mode, config.target, transformed, []);
  }

  return palette;
}

function transformPaletteNode(node, setKey, currentPath) {
  if (isToken(node)) {
    const result = {
      $value: resolveColorHex(setKey, currentPath),
      $type: 'color'
    };

    if (node.description) {
      result.$description = node.description;
    }

    return result;
  }

  const result = {};
  for (const [key, value] of Object.entries(node)) {
    if (isMetadataKey(key)) continue;
    result[key] = transformPaletteNode(value, setKey, [...currentPath, key]);
  }
  return result;
}

function indexPaletteTokens(mode, rootPath, node, currentPath) {
  if (node && typeof node === 'object' && '$value' in node && '$type' in node) {
    const fullPath = [...rootPath, ...currentPath].join('.');
    paletteHexByMode[mode].set(fullPath, node.$value);
    paletteValueByMode[mode].set(fullPath, `{${fullPath}}`);
    return;
  }

  for (const [key, value] of Object.entries(node || {})) {
    if (key.startsWith('$')) continue;
    indexPaletteTokens(mode, rootPath, value, [...currentPath, key]);
  }
}

function rewriteSemanticAlias(rawValue, setKey) {
  if (!(typeof rawValue === 'string' && rawValue.startsWith('{') && rawValue.endsWith('}'))) {
    return rawValue;
  }

  const inner = rawValue.slice(1, -1);
  if (inner.startsWith('brand.core.') || inner.startsWith('brand.marketing.')) {
    return rawValue;
  }
  if (inner.startsWith('brand.data-visualisation.') || inner.startsWith('brand.dataVisualisation.')) {
    return `{${inner.replace('brand.dataVisualisation.', 'brand.data-visualisation.')}}`;
  }

  const modeKey = getModeKeyFromSet(setKey);
  if (!modeKey) return rawValue;

  const target = resolveReferenceTarget(rawValue, setKey);
  if (!target || !isToken(target.node)) {
    return rawValue;
  }

  const topSet = target.path[0];
  if (topSet === `${modeKey}/ brand`) {
    return `{brand.core.${target.path.slice(1).join('.')}}`;
  }
  if (topSet === `${modeKey}/ marketing`) {
    return `{brand.marketing.${target.path.slice(1).join('.')}}`;
  }
  if (topSet === `${modeKey}/ dataVisualisation`) {
    return `{brand.data-visualisation.${target.path.slice(1).join('.')}}`;
  }

  return rawValue;
}

function findBaseRampReference(rawValue, setKey, visited = []) {
  if (!(typeof rawValue === 'string' && rawValue.startsWith('{') && rawValue.endsWith('}'))) {
    return null;
  }

  const inner = rawValue.slice(1, -1);
  if (inner.startsWith('ramp.') || inner.includes('.ramp.')) {
    return inner;
  }

  const target = resolveReferenceTarget(rawValue, setKey);
  if (!target || !isToken(target.node)) {
    return null;
  }

  const cacheKey = target.path.join('.');
  if (visited.includes(cacheKey)) {
    return null;
  }

  return findBaseRampReference(target.node.value, target.path[0], [...visited, cacheKey]);
}

function extractRampAlias(rawRampRef, setKey) {
  if (!rawRampRef) return null;

  if (rawRampRef.startsWith('brand.')) {
    return rawRampRef.replace('brand.dataVisualisation.', 'brand.data-visualisation.');
  }

  const target = resolveReferenceTarget(`{${rawRampRef}}`, setKey);
  if (!target || !isToken(target.node)) {
    return null;
  }

  const value = rewriteSemanticAlias(target.node.value, target.path[0]);
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    return value.slice(1, -1);
  }

  return null;
}

function colorDistance(hexA, hexB) {
  const [l1, c1, h1 = 0] = new Color(hexA).to('oklch').coords;
  const [l2, c2, h2 = 0] = new Color(hexB).to('oklch').coords;
  let hueDelta = h2 - h1;
  if (hueDelta > 180) hueDelta -= 360;
  if (hueDelta < -180) hueDelta += 360;
  return Math.sqrt((l2 - l1) ** 2 + (c2 - c1) ** 2 + (hueDelta / 360) ** 2);
}

function findNearestPaletteAlias(setKey, rawValue, resolvedHex) {
  const baseRampRef = findBaseRampReference(rawValue, setKey);
  const paletteRampRef = extractRampAlias(baseRampRef, setKey);
  if (!paletteRampRef) {
    return null;
  }

  const mode = MODE_LABELS[getModeKeyFromSet(setKey)];
  const familyPath = paletteRampRef.split('.').slice(0, -1).join('.');
  const candidates = [...paletteHexByMode[mode].entries()].filter(([pathKey]) =>
    pathKey.startsWith(`${familyPath}.`)
  );

  if (candidates.length === 0) {
    return null;
  }

  let bestCandidate = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const [pathKey, hex] of candidates) {
    const distance = colorDistance(resolvedHex, hex);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestCandidate = pathKey;
    }
  }

  return bestCandidate ? `{${bestCandidate}}` : null;
}

function buildSemantic() {
  const semantic = {
    $metadata: {
      collection: 'Semantic',
      modes: ['Light', 'Dark']
    },
    Light: {},
    Dark: {}
  };

  for (const config of SEMANTIC_THEME_CONFIG) {
    const transformed = transformSemanticNode(SOURCE[config.source], config.source, []);
    semantic[config.mode][config.key] = transformed;
  }

  return semantic;
}

function transformSemanticNode(node, setKey, currentPath) {
  if (isToken(node)) {
    const dtcgType = TYPE_MAP[node.type];
    if (!dtcgType || node.type === 'boxShadow' || node.type === 'typography' || node.type === 'other') {
      report.skippedUnsupportedTokens.push(`${setKey}.${currentPath.join('.')}`);
      return null;
    }

    const result = {
      $type: dtcgType
    };

    if (dtcgType === 'color') {
      const modifier = node.$extensions?.['studio.tokens']?.modify;
      if (modifier) {
        const resolvedHex = resolveColorHex(setKey, currentPath);
        const paletteAlias = findNearestPaletteAlias(setKey, node.value, resolvedHex);
        if (paletteAlias) {
          result.$value = paletteAlias;
          report.semanticAliasedToPalette.push(`${setKey}.${currentPath.join('.')}`);
        } else {
          result.$value = resolvedHex;
          report.semanticResolvedToHex.push(`${setKey}.${currentPath.join('.')}`);
        }
      } else if (typeof node.value === 'string' && node.value.startsWith('{') && node.value.endsWith('}')) {
        result.$value = rewriteSemanticAlias(node.value, setKey);
      } else {
        result.$value = resolveColorHex(setKey, currentPath);
      }
    } else if (dtcgType === 'number') {
      result.$value = normalizeNumberishValue(resolveGenericValue(node.value, setKey));
    } else if (dtcgType === 'string') {
      const nextValue = resolveGenericValue(node.value, setKey);
      result.$value = typeof nextValue === 'string' ? rewriteSemanticAlias(nextValue, setKey) : String(nextValue);
    } else if (dtcgType === 'boolean') {
      result.$value = Boolean(resolveGenericValue(node.value, setKey));
    }

    if (node.description) {
      result.$description = node.description;
    }

    const nextExtensions = stripStudioExtensions(node.$extensions);
    if (nextExtensions) {
      result.$extensions = nextExtensions;
    }

    return result;
  }

  const result = {};
  for (const [key, value] of Object.entries(node)) {
    if (isMetadataKey(key)) continue;
    const nextValue = transformSemanticNode(value, setKey, [...currentPath, key]);
    if (nextValue) {
      result[key] = nextValue;
    }
  }

  return result;
}

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function main() {
  const foundation = buildFoundation();
  const palette = buildPalette();
  const semantic = buildSemantic();

  writeJson(FOUNDATION_OUTPUT_PATH, foundation);
  writeJson(PALETTE_OUTPUT_PATH, palette);
  writeJson(SEMANTIC_OUTPUT_PATH, semantic);
  writeJson(REPORT_OUTPUT_PATH, report);

  console.log(`Generated ${path.relative(ROOT, FOUNDATION_OUTPUT_PATH)}`);
  console.log(`Generated ${path.relative(ROOT, PALETTE_OUTPUT_PATH)}`);
  console.log(`Generated ${path.relative(ROOT, SEMANTIC_OUTPUT_PATH)}`);
  console.log(`Generated ${path.relative(ROOT, REPORT_OUTPUT_PATH)}`);
}

main();