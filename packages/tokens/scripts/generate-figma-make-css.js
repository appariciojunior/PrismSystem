#!/usr/bin/env node
/**
 * generate-figma-make-css.js
 *
 * Generates CSS variables for Figma Make from tokens.json
 * Aligned to the 3-layer token architecture:
 *   Foundation -> Palette -> Semantic
 *
 * Outputs:
 *   - globals.css:         All resolved semantic color tokens + typography/spacing/shadows
 *   - globals-bridged.css: Generic aliases -> semantic tokens (for AI prompting)
 *
 * Usage: node packages/tokens/scripts/generate-figma-make-css.js
 * Regenerate: npm run build:figma-make
 *
 * References:
 *   - packages/tokens/src/tokens.json (source of truth)
 *   - "Figma Make Won't Work Until You Do This" - Romina Kavcic (PDF)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const TOKENS_PATH = path.join(__dirname, '../src/tokens.json');
const OUTPUT_DIR = path.join(__dirname, '../figma-make');
const OUTPUT_CSS = path.join(OUTPUT_DIR, 'globals.css');
const OUTPUT_BRIDGED_CSS = path.join(OUTPUT_DIR, 'globals-bridged.css');

// Token sets to process
const LIGHT_SET = 'light/ core';
const DARK_SET = 'dark/ core';
const LIGHT_BRAND = 'light/ brand';
const DARK_BRAND = 'dark/ brand';
const LIGHT_CHANNELS = 'light/ channels';
const DARK_CHANNELS = 'dark/ channels';
const VIEWPORT_SMALL = 'viewport/ small';
const BREAKPOINTS = {
  sm: '0',
  md: '440',
  lg: '1024',
  xl: '1440'
};

// ============================================================================
// Ramp Color Extraction (from palette token sets)
// ============================================================================

function loadRampCSV() {
  // CSV-based loading removed. Use hex_lookup MCP tool for resolved hex values.
  return { light: {}, dark: {} };
}

function extractPaletteRamps(tokens) {
  const lookup = { light: {}, dark: {} };
  const paletteSets = [
    { set: LIGHT_BRAND, mode: 'light' },
    { set: DARK_BRAND, mode: 'dark' },
    { set: LIGHT_CHANNELS, mode: 'light' },
    { set: DARK_CHANNELS, mode: 'dark' }
  ];
  for (const { set, mode } of paletteSets) {
    const data = tokens[set];
    if (!data) continue;
    function walk(obj, pathParts) {
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$')) continue;
        const val = obj[key];
        const currentPath = [...pathParts, key];
        if (val && typeof val === 'object') {
          if ('value' in val && val.type === 'color') {
            const rampIdx = currentPath.indexOf('ramp');
            if (rampIdx >= 0 && rampIdx < currentPath.length - 2) {
              const rampParts = currentPath.slice(rampIdx + 1);
              const step = rampParts.pop();
              const rampName = rampParts.join('.');
              if (!lookup[mode][rampName]) lookup[mode][rampName] = {};
              lookup[mode][rampName][step] = val.value;
            }
          } else if (!('value' in val)) {
            walk(val, currentPath);
          }
        }
      }
    }
    walk(data, []);
  }
  return lookup;
}

function buildRampLookup(tokens, csvPath) {
  const csv = loadRampCSV(csvPath);
  const palette = extractPaletteRamps(tokens);
  const lookup = { light: {}, dark: {} };

  for (const mode of ['light', 'dark']) {
    // Start with palette raw refs
    for (const [ramp, steps] of Object.entries(palette[mode] || {})) {
      lookup[mode][ramp] = { ...(steps || {}) };
    }
    // CSV wins (pre-resolved hex)
    for (const [ramp, steps] of Object.entries(csv[mode] || {})) {
      if (!lookup[mode][ramp]) lookup[mode][ramp] = {};
      for (const [step, hex] of Object.entries(steps)) {
        lookup[mode][ramp][step] = hex;
      }
    }
  }

  // Hardcoded ramps for colours using studio.tokens.modify (P3 lighten/darken)
  const digitalBlueLight = {
    50: '#e6f3f9',
    100: '#cce7f3',
    150: '#b3dbec',
    200: '#99cfe6',
    250: '#80c3df',
    300: '#66b7d9',
    350: '#4dabd2',
    400: '#339fcc',
    450: '#1a93c5',
    500: '#0087bf',
    550: '#007bb0',
    600: '#006fa1',
    650: '#006392',
    700: '#005783',
    750: '#004b74',
    800: '#003f65',
    850: '#003356',
    900: '#002747',
    950: '#001b38',
    1000: '#000f29'
  };
  const digitalBlueDark = {
    50: '#000f29',
    100: '#001b38',
    150: '#002747',
    200: '#003356',
    250: '#003f65',
    300: '#004b74',
    350: '#005783',
    400: '#006392',
    450: '#006fa1',
    500: '#007bb0',
    550: '#0087bf',
    600: '#1a93c5',
    650: '#339fcc',
    700: '#4dabd2',
    750: '#66b7d9',
    800: '#80c3df',
    850: '#99cfe6',
    900: '#b3dbec',
    950: '#cce7f3',
    1000: '#e6f3f9'
  };
  lookup.light['digital.blue'] = {
    ...digitalBlueLight,
    ...(lookup.light['digital.blue'] || {})
  };
  lookup.dark['digital.blue'] = {
    ...digitalBlueDark,
    ...(lookup.dark['digital.blue'] || {})
  };

  const digitalCreamLight = {
    50: '#fefdfb',
    100: '#fcfaf5',
    150: '#faf8f0',
    200: '#f8f5ea',
    250: '#f6f3e5',
    300: '#f4f0df',
    350: '#f2eeda',
    400: '#f0ebd4',
    450: '#eee9cf',
    500: '#ece6c9',
    550: '#e4ddc0',
    600: '#dcd4b7',
    650: '#d4cbae',
    700: '#ccc2a5',
    750: '#c4b99c',
    800: '#bcb093',
    850: '#b4a78a',
    900: '#ac9e81',
    950: '#a49578',
    1000: '#9c8c6f'
  };
  const digitalCreamDark = {
    50: '#9c8c6f',
    100: '#a49578',
    150: '#ac9e81',
    200: '#b4a78a',
    250: '#bcb093',
    300: '#c4b99c',
    350: '#ccc2a5',
    400: '#d4cbae',
    450: '#dcd4b7',
    500: '#e4ddc0',
    550: '#ece6c9',
    600: '#eee9cf',
    650: '#f0ebd4',
    700: '#f2eeda',
    750: '#f4f0df',
    800: '#f6f3e5',
    850: '#f8f5ea',
    900: '#faf8f0',
    950: '#fcfaf5',
    1000: '#fefdfb'
  };
  lookup.light['digital.cream'] = {
    ...digitalCreamLight,
    ...(lookup.light['digital.cream'] || {})
  };
  lookup.dark['digital.cream'] = {
    ...digitalCreamDark,
    ...(lookup.dark['digital.cream'] || {})
  };

  // Messaging ramps
  const messagingRamps = {
    'messaging.error': {
      light: {
        50: '#ffe5e5',
        100: '#ffcccc',
        150: '#ffb2b2',
        200: '#ff9999',
        250: '#ff7f7f',
        300: '#ff6666',
        350: '#ff4c4c',
        400: '#ff3333',
        450: '#ff1919',
        500: '#ff0000',
        550: '#e60000',
        600: '#cc0000',
        650: '#b30000',
        700: '#990000',
        750: '#800000',
        800: '#660000',
        850: '#4d0000',
        900: '#330000',
        950: '#1a0000',
        1000: '#0d0000'
      },
      dark: {
        50: '#0d0000',
        100: '#1a0000',
        150: '#330000',
        200: '#4d0000',
        250: '#660000',
        300: '#800000',
        350: '#990000',
        400: '#b30000',
        450: '#cc0000',
        500: '#e60000',
        550: '#ff0000',
        600: '#ff1919',
        650: '#ff3333',
        700: '#ff4c4c',
        750: '#ff6666',
        800: '#ff7f7f',
        850: '#ff9999',
        900: '#ffb2b2',
        950: '#ffcccc',
        1000: '#ffe5e5'
      }
    },
    'messaging.success': {
      light: {
        50: '#e5f7ed',
        100: '#cbf0db',
        150: '#b7ead3',
        200: '#9de3c1',
        250: '#83dcaf',
        300: '#69d59d',
        350: '#4fce8b',
        400: '#3bc87d',
        450: '#31b870',
        500: '#31A46F',
        550: '#2d9765',
        600: '#2a8f60',
        650: '#237a51',
        700: '#1c6542',
        750: '#195a3b',
        800: '#155033',
        850: '#0e3b24',
        900: '#0a2b1a',
        950: '#061b10',
        1000: '#030d08'
      },
      dark: {
        50: '#030d08',
        100: '#061b10',
        150: '#0a2b1a',
        200: '#0e3b24',
        250: '#155033',
        300: '#195a3b',
        350: '#1c6542',
        400: '#237a51',
        450: '#2a8f60',
        500: '#2d9765',
        550: '#31A46F',
        600: '#3bc87d',
        650: '#4fce8b',
        700: '#63c297',
        750: '#83dcaf',
        800: '#9de3c1',
        850: '#b7ead3',
        900: '#cbf0db',
        950: '#e5f7ed',
        1000: '#f2fbf6'
      }
    },
    'messaging.warning': {
      light: {
        50: '#fff5e5',
        100: '#ffeccc',
        150: '#ffe2b2',
        200: '#ffd999',
        250: '#ffcf7f',
        300: '#ffc366',
        350: '#ffba4c',
        400: '#ffb333',
        450: '#ffa919',
        500: '#ffa300',
        550: '#f09700',
        600: '#e69300',
        650: '#cc8300',
        700: '#b37200',
        750: '#996200',
        800: '#805200',
        850: '#664100',
        900: '#4d3100',
        950: '#332100',
        1000: '#1a1000'
      },
      dark: {
        50: '#1a1000',
        100: '#332100',
        150: '#4d3100',
        200: '#664100',
        250: '#805200',
        300: '#996200',
        350: '#b37200',
        400: '#cc8300',
        450: '#e69300',
        500: '#f09700',
        550: '#ffa300',
        600: '#ffa919',
        650: '#ffb333',
        700: '#ffc366',
        750: '#ffcf7f',
        800: '#ffd999',
        850: '#ffe2b2',
        900: '#ffeccc',
        950: '#fff5e5',
        1000: '#fffaf2'
      }
    },
    'messaging.info': {
      light: {
        50: '#e5eef8',
        100: '#ccddf1',
        150: '#b2cceb',
        200: '#99bbe4',
        250: '#7faade',
        300: '#6699d7',
        350: '#4c88d1',
        400: '#3377ca',
        450: '#2161b6',
        500: '#0F4AA2',
        550: '#0d4092',
        600: '#0b3682',
        650: '#0a2c72',
        700: '#082862',
        750: '#061e52',
        800: '#051a48',
        850: '#041442',
        900: '#030f32',
        950: '#020a22',
        1000: '#010512'
      },
      dark: {
        50: '#010512',
        100: '#020a22',
        150: '#030f32',
        200: '#041442',
        250: '#051a48',
        300: '#061e52',
        350: '#082862',
        400: '#0a2c72',
        450: '#0b3682',
        500: '#0d4092',
        550: '#0F4AA2',
        600: '#2161b6',
        650: '#3377ca',
        700: '#4f7ac2',
        750: '#6699d7',
        800: '#7faade',
        850: '#99bbe4',
        900: '#b2cceb',
        950: '#ccddf1',
        1000: '#e5eef8'
      }
    }
  };
  for (const [rampName, modes] of Object.entries(messagingRamps)) {
    lookup.light[rampName] = {
      ...modes.light,
      ...(lookup.light[rampName] || {})
    };
    lookup.dark[rampName] = { ...modes.dark, ...(lookup.dark[rampName] || {}) };
  }

  // Overlay ramp (alpha-based)
  for (const mode of ['light', 'dark']) {
    lookup[mode]['digital.overlay.dark'] = {};
    lookup[mode]['digital.overlay.light'] = {};
    for (let step = 50; step <= 1000; step += 50) {
      const alpha = (step / 1000).toFixed(2);
      lookup[mode]['digital.overlay.dark'][String(step)] =
        `rgba(0, 0, 0, ${alpha})`;
      lookup[mode]['digital.overlay.light'][String(step)] =
        `rgba(255, 255, 255, ${alpha})`;
    }
  }

  const lightRampCount = Object.keys(lookup.light).length;
  const darkRampCount = Object.keys(lookup.dark).length;
  console.log(
    `   Loaded ramps: ${lightRampCount} light, ${darkRampCount} dark`
  );
  return lookup;
}

// ============================================================================
// Foundation Color Lookup
// ============================================================================

function buildFoundationLookup(tokens) {
  const lookup = {};
  function traverse(obj, pathArr = []) {
    for (const key in obj) {
      if (key.startsWith('$')) continue;
      const val = obj[key];
      if (val && typeof val === 'object') {
        if (
          val.value !== undefined &&
          (val.type === 'color' || typeof val.value === 'string')
        ) {
          lookup[pathArr.concat(key).join('.')] = val.value;
        } else if (!('value' in val)) {
          traverse(val, pathArr.concat(key));
        }
      }
    }
  }
  if (tokens.foundation) traverse(tokens.foundation, ['foundation']);
  return lookup;
}

// ============================================================================
// Reference Resolution (Multi-pass with full ramp support)
// ============================================================================

function resolveValue(
  ref,
  mode,
  rampColors,
  foundationLookup,
  semanticLookup,
  depth
) {
  if (depth === undefined) depth = 0;
  if (depth > 15) return ref;
  if (!ref || typeof ref !== 'string') return ref;
  if (!ref.startsWith('{') || !ref.endsWith('}')) return ref;

  const refPath = ref.slice(1, -1);
  const modeKey = mode === 'light' ? 'light' : 'dark';

  // 1. brand.core.ramp.{rampName}.{step}
  const coreRampMatch = refPath.match(
    /^brand\.core\.ramp\.(.+)\.(\d+(?:-base)?)$/
  );
  if (coreRampMatch) {
    let [, rampPath, step] = coreRampMatch;
    step = step.replace('-base', '');
    if (rampColors[modeKey]?.[rampPath]?.[step])
      return rampColors[modeKey][rampPath][step];
    const parts = rampPath.split('.');
    for (let i = parts.length; i > 0; i--) {
      const tryKey = parts.slice(0, i).join('.');
      if (rampColors[modeKey]?.[tryKey]?.[step])
        return rampColors[modeKey][tryKey][step];
    }
  }

  // 2. brand.channels.ramp.{channel}.{step}
  const channelRampMatch = refPath.match(
    /^brand\.channels\.ramp\.(\w+)\.(\d+(?:-base)?)$/
  );
  if (channelRampMatch) {
    let [, channel, step] = channelRampMatch;
    step = step.replace('-base', '');
    if (rampColors[modeKey]?.[channel]?.[step])
      return rampColors[modeKey][channel][step];
  }

  // 3. Overlay ramps
  const overlayMatch = refPath.match(
    /^brand\.core\.ramp\.digital\.overlay\.(light|dark)\.(\d+)$/
  );
  if (overlayMatch) {
    const [, variant, step] = overlayMatch;
    const alpha = (parseInt(step) / 1000).toFixed(2);
    return variant === 'dark'
      ? `rgba(0, 0, 0, ${alpha})`
      : `rgba(255, 255, 255, ${alpha})`;
  }

  // 4. Semantic self-refs
  if (semanticLookup?.[refPath]) {
    const resolved = semanticLookup[refPath];
    if (typeof resolved === 'string' && resolved.startsWith('{')) {
      return resolveValue(
        resolved,
        mode,
        rampColors,
        foundationLookup,
        semanticLookup,
        depth + 1
      );
    }
    if (typeof resolved === 'string') return resolved;
  }

  // 5. Foundation exact
  if (foundationLookup[refPath]) return foundationLookup[refPath];

  // 6. With foundation prefix
  if (foundationLookup['foundation.' + refPath])
    return foundationLookup['foundation.' + refPath];

  // 7. brand.* shorthand
  if (refPath.startsWith('brand.')) {
    if (foundationLookup['foundation.' + refPath])
      return foundationLookup['foundation.' + refPath];
  }

  if (depth === 0) console.warn(`  Warning: Could not resolve: ${ref}`);
  return ref;
}

// ============================================================================
// Semantic Token Processing
// ============================================================================

function processSemanticTokens(
  tokens,
  setName,
  mode,
  rampColors,
  foundationLookup
) {
  const tokenSet = tokens[setName];
  if (!tokenSet) {
    console.error(`Token set "${setName}" not found`);
    return {};
  }

  const rawTokens = {};
  function extract(obj, pathParts) {
    for (const key in obj) {
      if (key.startsWith('$')) continue;
      const val = obj[key];
      const currentPath = [...pathParts, key];
      if (val && typeof val === 'object') {
        if ('value' in val) rawTokens[currentPath.join('.')] = val.value;
        else extract(val, currentPath);
      }
    }
  }
  extract(tokenSet, []);

  // Build semantic lookup with fallback to light/core (Token Studio loads light as "source" for dark mode)
  const semanticLookup = {};
  if (mode === 'dark' && tokens[LIGHT_SET]) {
    const lightTokens = {};
    function extractLight(obj, pathParts) {
      for (const key in obj) {
        if (key.startsWith('$')) continue;
        const val = obj[key];
        const currentPath = [...pathParts, key];
        if (val && typeof val === 'object') {
          if ('value' in val) lightTokens[currentPath.join('.')] = val.value;
          else extractLight(val, currentPath);
        }
      }
    }
    extractLight(tokens[LIGHT_SET], []);
    Object.assign(semanticLookup, lightTokens); // light as base
  }
  Object.assign(semanticLookup, rawTokens); // dark overrides light
  const result = {};

  for (const [tokenPath, rawValue] of Object.entries(rawTokens)) {
    const cssName = tokenPath
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    let resolvedValue;

    if (typeof rawValue === 'object' && rawValue !== null) {
      if (rawValue.x !== undefined || rawValue.y !== undefined) {
        const s = rawValue;
        const color =
          typeof s.color === 'string' && s.color.startsWith('{')
            ? resolveValue(
                s.color,
                mode,
                rampColors,
                foundationLookup,
                semanticLookup,
                0
              )
            : s.color || 'rgba(0,0,0,0.08)';
        resolvedValue = `${s.x || 0}px ${s.y || 0}px ${s.blur || 0}px ${s.spread || 0}px ${color}`;
      } else {
        resolvedValue = JSON.stringify(rawValue);
      }
    } else if (typeof rawValue === 'string') {
      resolvedValue = resolveValue(
        rawValue,
        mode,
        rampColors,
        foundationLookup,
        semanticLookup,
        0
      );
    } else {
      resolvedValue = String(rawValue);
    }

    result[cssName] = resolvedValue;
  }
  return result;
}

// ============================================================================
// Typography Token Extraction (viewport/small + foundation)
// ============================================================================

function extractTypographyTokens(tokens) {
  const result = {};
  const vs = tokens[VIEWPORT_SMALL];
  if (!vs) return result;

  // Font sizes from viewport/small
  for (const key of Object.keys(vs)) {
    if (key.startsWith('fontSize') && vs[key]?.value) {
      const num = key.replace('fontSize', '');
      result[`font-size-${num}`] = vs[key].value;
    }
  }

  // Foundation font families
  const fnd = tokens.foundation;
  if (fnd) {
    const families = {
      'font-family-serif': fnd.fontFamily010?.value,
      'font-family-serif-regular': fnd.fontFamily020?.value,
      'font-family-serif-bold': fnd.fontFamily030?.value,
      'font-family-sans': fnd.fontFamily040?.value
    };
    for (const [name, value] of Object.entries(families)) {
      if (value) {
        const fallback = name.includes('sans') ? 'sans-serif' : 'serif';
        result[name] = `"${value}", ${fallback}`;
      }
    }

    // Font weights
    const weights = {
      'font-weight-thin': 100,
      'font-weight-extralight': 200,
      'font-weight-light': 300,
      'font-weight-regular': 400,
      'font-weight-medium': 500,
      'font-weight-semibold': 600,
      'font-weight-bold': 700,
      'font-weight-extrabold': 800,
      'font-weight-black': 900
    };
    for (const [wn, wv] of Object.entries(weights)) result[wn] = wv;

    // Line heights
    const lineHeights = {
      'line-height-100': '100%',
      'line-height-112': '112.5%',
      'line-height-125': '125%',
      'line-height-150': '150%',
      'line-height-175': '175%',
      'line-height-200': '200%'
    };
    for (const [lh, lv] of Object.entries(lineHeights)) result[lh] = lv;
  }

  return result;
}

// ============================================================================
// Spacing Token Extraction (viewport/small)
// ============================================================================

function extractSpacingTokens(tokens) {
  const result = {};
  const vs = tokens[VIEWPORT_SMALL];
  if (!vs) return result;

  // Static spacing
  if (vs.spacing?.static) {
    for (const [key, val] of Object.entries(vs.spacing.static)) {
      if (key.startsWith('$')) continue;
      if (val?.value !== undefined)
        result[`spacing-static-${key}`] = `${val.value}px`;
    }
  }

  // Fluid spacing (at small viewport, multiplier = 1.0x)
  if (vs.spacing?.fluid) {
    for (const [key, val] of Object.entries(vs.spacing.fluid)) {
      if (key.startsWith('$')) continue;
      if (val?.value !== undefined) {
        let value = val.value;
        if (typeof value === 'string' && value.includes('{dimension.')) {
          const dimMatch = value.match(/\{dimension\.(\d+)\}/);
          if (dimMatch) {
            const dimValue = 4 * (parseInt(dimMatch[1]) / 100);
            result[`spacing-fluid-${key}`] = `${dimValue}px`;
            continue;
          }
        }
        result[`spacing-fluid-${key}`] =
          typeof value === 'string' && value.endsWith('px')
            ? value
            : `${value}px`;
      }
    }
  }

  // Border radius
  const br = vs['border-radius'];
  if (br) {
    for (const [brKey, brVal] of Object.entries(br)) {
      if (brKey.startsWith('$')) continue;
      if (brVal?.value !== undefined) {
        let brValue = brVal.value;
        if (typeof brValue === 'string' && brValue.startsWith('{dimension.')) {
          const brDimMatch = brValue.match(/\{dimension\.(\d+)\}/);
          if (brDimMatch) brValue = 4 * (parseInt(brDimMatch[1]) / 100);
        }
        result[
          brKey === 'full' ? 'border-radius-full' : `border-radius-${brKey}`
        ] = `${brValue}px`;
      }
    }
  }

  // Grid from foundation
  const fnd = tokens.foundation;
  if (fnd?.grid) {
    const g = fnd.grid;
    if (g.columns?.small?.value) result['grid-columns'] = g.columns.small.value;
    if (g.gutter?.small?.value)
      result['grid-gutter'] = `${g.gutter.small.value}px`;
    if (g.margin?.small?.value)
      result['grid-margin'] = `${g.margin.small.value}px`;
  }

  return result;
}

// ============================================================================
// Shadow Token Extraction (foundation + shadows set)
// ============================================================================

function extractShadowTokens(tokens) {
  const result = {};
  const fnd = tokens.foundation;

  for (const direction of ['down', 'up']) {
    const shadows = fnd?.[direction];
    if (!shadows) continue;
    for (const [key, entry] of Object.entries(shadows)) {
      if (key.startsWith('$') || !entry?.value) continue;
      const s = entry.value;
      if (typeof s === 'object') {
        let color = s.color || 'rgba(0, 0, 0, 0.08)';
        if (typeof color === 'string')
          color = color.replace(/\{brand\.black\}/g, '0, 0, 0');
        result[`shadow-${direction}-${key}`] =
          `${s.x || 0}px ${s.y || 0}px ${s.blur || 0}px ${s.spread || 0}px ${color}`;
      }
    }
  }

  // Semantic elevation aliases
  const elevationMap = {
    'shadow-elevation-down-level-1': 'shadow-down-shadow010',
    'shadow-elevation-down-level-2': 'shadow-down-shadow030',
    'shadow-elevation-down-level-3': 'shadow-down-shadow050',
    'shadow-elevation-down-level-4': 'shadow-down-shadow060',
    'shadow-elevation-up-level-1': 'shadow-up-shadow010',
    'shadow-elevation-up-level-2': 'shadow-up-shadow030',
    'shadow-elevation-up-level-3': 'shadow-up-shadow050',
    'shadow-elevation-up-level-4': 'shadow-up-shadow060'
  };
  for (const [elName, srcKey] of Object.entries(elevationMap)) {
    if (result[srcKey]) result[elName] = result[srcKey];
  }

  return result;
}

// ============================================================================
// Breakpoint Token Extraction
// ============================================================================

function extractBreakpointTokens() {
  const result = {};
  for (const [key, value] of Object.entries(BREAKPOINTS)) {
    result[`breakpoint-${key}`] = `${value}px`;
  }
  return result;
}

// ============================================================================
// CSS Generation (Enhanced with sections)
// ============================================================================

function groupTokensByCategory(tokens) {
  const categories = {};
  const catOrder = [
    'Surfaces',
    'Text',
    'Icons',
    'Borders',
    'Input',
    'Feedback',
    'Interactive',
    'Selection',
    'Selected',
    'Active',
    'Focus',
    'Tags',
    'Other'
  ];
  for (const [name, value] of Object.entries(tokens)) {
    let category = 'Other';
    if (name.startsWith('surface')) category = 'Surfaces';
    else if (name.startsWith('text')) category = 'Text';
    else if (name.startsWith('icon')) category = 'Icons';
    else if (name.startsWith('border')) category = 'Borders';
    else if (name.startsWith('input')) category = 'Input';
    else if (name.startsWith('feedback')) category = 'Feedback';
    else if (name.startsWith('interactive')) category = 'Interactive';
    else if (name.startsWith('selection')) category = 'Selection';
    else if (name.startsWith('selected')) category = 'Selected';
    else if (name.startsWith('active')) category = 'Active';
    else if (name.startsWith('focus')) category = 'Focus';
    else if (name.startsWith('tag')) category = 'Tags';
    if (!categories[category]) categories[category] = {};
    categories[category][name] = value;
  }
  const ordered = {};
  for (const cat of catOrder) {
    if (categories[cat]) ordered[cat] = categories[cat];
  }
  for (const cat in categories) {
    if (!ordered[cat]) ordered[cat] = categories[cat];
  }
  return ordered;
}

function generateCSS(
  lightTokens,
  darkTokens,
  typographyTokens,
  spacingTokens,
  shadowTokens,
  breakpointTokens
) {
  const ts = new Date().toISOString();
  let css = '';

  // Header
  css += `/**\n`;
  css += ` * Design System - Figma Make CSS Variables\n`;
  css += ` * \n`;
  css += ` * AUTO-GENERATED - DO NOT EDIT MANUALLY\n`;
  css += ` * Source: packages/tokens/src/tokens.json\n`;
  css += ` * Generated: ${ts}\n`;
  css += ` * \n`;
  css += ` * Regenerate with: npm run build:figma-make\n`;
  css += ` *\n`;
  css += ` * USAGE IN FIGMA MAKE:\n`;
  css += ` *   1. Enable your Design System library in Assets > Team library\n`;
  css += ` *   2. Include this file as globals.css in your Make project\n`;
  css += ` *   3. Reference variables using var(--token-name) syntax\n`;
  css += ` *   4. Use exact component names from your library (Button/Primary, Input, Card)\n`;
  css += ` *\n`;
  css += ` * PROMPT TEMPLATE (paste into Figma Make):\n`;
  css += ` *   "Create a [screen name] using my design system components.\n`;
  css += ` *    Use spacing tokens for all margins and gaps.\n`;
  css += ` *    Use color variables from globals.css for all colours.\n`;
  css += ` *    Include loading, empty, and error states.\n`;
  css += ` *    Use component names exactly as defined in my library."\n`;
  css += ` *\n`;
  css += ` * See also: globals-bridged.css for generic variable aliases\n`;
  css += ` */\n\n`;

  // ── Light mode ──
  css += `/* ============================================================================\n`;
  css += `   COLOUR TOKENS - LIGHT MODE (Default)\n`;
  css += `   ============================================================================ */\n`;
  css += `:root,\n[data-theme="light"],\n[data-color-mode="light"] {\n`;
  for (const [cat, toks] of Object.entries(
    groupTokensByCategory(lightTokens)
  )) {
    css += `\n  /* ${cat} */\n`;
    for (const [n, v] of Object.entries(toks)) css += `  --${n}: ${v};\n`;
  }
  css += `}\n\n`;

  // ── Dark mode ──
  css += `/* ============================================================================\n`;
  css += `   COLOUR TOKENS - DARK MODE\n`;
  css += `   ============================================================================ */\n`;
  css += `[data-theme="dark"],\n[data-color-mode="dark"],\n.dark {\n`;
  for (const [cat, toks] of Object.entries(groupTokensByCategory(darkTokens))) {
    css += `\n  /* ${cat} */\n`;
    for (const [n, v] of Object.entries(toks)) css += `  --${n}: ${v};\n`;
  }
  css += `}\n\n`;

  // ── Media query dark ──
  css += `/* ============================================================================\n`;
  css += `   COLOUR TOKENS - MEDIA QUERY DARK MODE (Respects System Preference)\n`;
  css += `   ============================================================================ */\n`;
  css += `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n`;
  for (const [n, v] of Object.entries(darkTokens)) css += `    --${n}: ${v};\n`;
  css += `  }\n}\n\n`;

  // ── Typography ──
  css += `/* ============================================================================\n`;
  css += `   TYPOGRAPHY TOKENS (Mode-independent)\n`;
  css += `   \n`;
  css += `   Font Family:  var(--font-family-serif)       -> Inter\n`;
  css += `                 var(--font-family-sans)        -> Inter (UI text)\n`;
  css += `   Font Size:    var(--font-size-010) through var(--font-size-160)\n`;
  css += `                 Small=0.75rem  Base=1rem  Large=2rem  Display=5rem\n`;
  css += `   Font Weight:  var(--font-weight-regular)=400  var(--font-weight-bold)=700\n`;
  css += `   Line Height:  var(--line-height-125)=125%  var(--line-height-150)=150%\n`;
  css += `   ============================================================================ */\n`;
  css += `:root {\n`;

  const typoCats = {
    'Font Families': {},
    'Font Sizes (Small Viewport / Mobile)': {},
    'Font Weights': {},
    'Line Heights': {}
  };
  for (const [tn, tv] of Object.entries(typographyTokens)) {
    if (tn.startsWith('font-family')) typoCats['Font Families'][tn] = tv;
    else if (tn.startsWith('font-size'))
      typoCats['Font Sizes (Small Viewport / Mobile)'][tn] = tv;
    else if (tn.startsWith('font-weight')) typoCats['Font Weights'][tn] = tv;
    else if (tn.startsWith('line-height')) typoCats['Line Heights'][tn] = tv;
    else typoCats['Font Sizes (Small Viewport / Mobile)'][tn] = tv;
  }
  for (const [tc, toks] of Object.entries(typoCats)) {
    if (Object.keys(toks).length === 0) continue;
    css += `\n  /* ${tc} */\n`;
    for (const [n, v] of Object.entries(toks)) css += `  --${n}: ${v};\n`;
  }
  css += `}\n\n`;

  // ── Spacing ──
  css += `/* ============================================================================\n`;
  css += `   SPACING TOKENS (Mode-independent, Small Viewport base values)\n`;
  css += `   \n`;
  css += `   Static:  Fixed pixel values across all viewports\n`;
  css += `   Fluid:   Scale with viewport multiplier (Small=1x, Med=1.5x, Lg=2x, XL=2.5x)\n`;
  css += `   ============================================================================ */\n`;
  css += `:root {\n`;

  const spCats = {
    'Static Spacing (fixed across viewports)': {},
    'Fluid Spacing (scales with viewport multiplier)': {},
    'Border Radius': {},
    'Grid (Small Viewport)': {}
  };
  for (const [sn, sv] of Object.entries(spacingTokens)) {
    if (sn.startsWith('spacing-static'))
      spCats['Static Spacing (fixed across viewports)'][sn] = sv;
    else if (sn.startsWith('spacing-fluid'))
      spCats['Fluid Spacing (scales with viewport multiplier)'][sn] = sv;
    else if (sn.startsWith('border-radius')) spCats['Border Radius'][sn] = sv;
    else if (sn.startsWith('grid')) spCats['Grid (Small Viewport)'][sn] = sv;
    else spCats['Static Spacing (fixed across viewports)'][sn] = sv;
  }
  for (const [sc, toks] of Object.entries(spCats)) {
    if (Object.keys(toks).length === 0) continue;
    css += `\n  /* ${sc} */\n`;
    for (const [n, v] of Object.entries(toks)) css += `  --${n}: ${v};\n`;
  }
  css += `}\n\n`;

  // ── Shadows ──
  css += `/* ============================================================================\n`;
  css += `   SHADOW / ELEVATION TOKENS (Mode-independent)\n`;
  css += `   \n`;
  css += `   Down (dropdowns, modals, cards):\n`;
  css += `     var(--shadow-elevation-down-level-1)  -> subtle card shadow\n`;
  css += `     var(--shadow-elevation-down-level-2)  -> dropdown shadow\n`;
  css += `     var(--shadow-elevation-down-level-3)  -> modal shadow\n`;
  css += `     var(--shadow-elevation-down-level-4)  -> top-level overlay\n`;
  css += `   Up (bottom nav, sticky footers):\n`;
  css += `     var(--shadow-elevation-up-level-1)  -> subtle bottom bar\n`;
  css += `     var(--shadow-elevation-up-level-2)  -> sticky footer\n`;
  css += `     var(--shadow-elevation-up-level-3)  -> bottom sheet\n`;
  css += `     var(--shadow-elevation-up-level-4)  -> floating action button\n`;
  css += `   ============================================================================ */\n`;
  css += `:root {\n`;

  const shCats = {
    'Foundation Shadows - Down': {},
    'Foundation Shadows - Up': {},
    'Semantic Elevation': {}
  };
  for (const [shn, shv] of Object.entries(shadowTokens)) {
    if (shn.startsWith('shadow-down-'))
      shCats['Foundation Shadows - Down'][shn] = shv;
    else if (shn.startsWith('shadow-up-'))
      shCats['Foundation Shadows - Up'][shn] = shv;
    else if (shn.startsWith('shadow-elevation'))
      shCats['Semantic Elevation'][shn] = shv;
  }
  for (const [sc, toks] of Object.entries(shCats)) {
    if (Object.keys(toks).length === 0) continue;
    css += `\n  /* ${sc} */\n`;
    for (const [n, v] of Object.entries(toks)) css += `  --${n}: ${v};\n`;
  }
  css += `}\n\n`;

  // ── Breakpoints ──
  css += `/* ============================================================================\n`;
  css += `   BREAKPOINTS (for responsive layouts)\n`;
  css += `   \n`;
  css += `   var(--breakpoint-sm) = 0px     (Mobile-first base)\n`;
  css += `   var(--breakpoint-md) = 440px   (Tablet portrait)\n`;
  css += `   var(--breakpoint-lg) = 1024px  (Desktop)\n`;
  css += `   var(--breakpoint-xl) = 1440px  (Wide desktop)\n`;
  css += `   \n`;
  css += `   Usage in @media queries:\n`;
  css += `     @media (min-width: 440px) { ... }   -> Tablet+\n`;
  css += `     @media (min-width: 1024px) { ... }  -> Desktop+\n`;
  css += `   ============================================================================ */\n`;
  css += `:root {\n`;
  for (const [n, v] of Object.entries(breakpointTokens))
    css += `  --${n}: ${v};\n`;
  css += `}\n`;

  return css;
}

// ============================================================================
// Bridged CSS Generation (Enhanced per Romina Kavcic recommendations)
// ============================================================================

function generateBridgedCSS() {
  const ts = new Date().toISOString();
  let out = '';

  out += `/**\n`;
  out += ` * Design System - Bridged CSS Variables\n`;
  out += ` * \n`;
  out += ` * AUTO-GENERATED - DO NOT EDIT MANUALLY\n`;
  out += ` * Generated: ${ts}\n`;
  out += ` * \n`;
  out += ` * Maps generic CSS variable names (used by AI tools like Figma Make)\n`;
  out += ` * to the Design System semantic tokens in globals.css.\n`;
  out += ` *\n`;
  out += ` * PURPOSE:\n`;
  out += ` *   When you prompt Figma Make with "use --primary for the button background",\n`;
  out += ` *   these bridges ensure the output uses the correct design system token.\n`;
  out += ` *\n`;
  out += ` * USAGE:\n`;
  out += ` *   Include BOTH globals.css AND globals-bridged.css in your Figma Make project.\n`;
  out += ` *   The bridges reference tokens from globals.css via var() so they automatically\n`;
  out += ` *   adapt to light/dark mode.\n`;
  out += ` *\n`;
  out += ` * PROMPTING TIPS (from "Figma Make Won't Work Until You Do This"):\n`;
  out += ` *   - Use exact component names from your library (Button/Primary, Input, Card)\n`;
  out += ` *   - Reference token names: "use --surface-canvas for the background"\n`;
  out += ` *   - Demand states: "Include loading, empty, error, and success states"\n`;
  out += ` *   - Iterate in small steps: change one thing at a time\n`;
  out += ` *   - If output drifts from your system, stop and fix the system reference\n`;
  out += ` */\n\n`;

  out += `:root,\n[data-theme="light"],\n[data-color-mode="light"] {\n`;

  // Colour bridges
  out += `  /* ====== COLOUR BRIDGES (Generic -> Semantic) ====== */\n\n`;

  out += `  /* Background / Surface */\n`;
  out += `  --background: var(--surface-canvas);\n`;
  out += `  --background-alt: var(--surface-level-1);\n`;
  out += `  --color-background-primary: var(--surface-canvas);\n`;
  out += `  --color-background-secondary: var(--surface-level-1);\n`;
  out += `  --color-background-tertiary: var(--surface-level-2);\n`;
  out += `  --color-background-elevated: var(--surface-level-3);\n`;
  out += `  --color-background-modal: var(--surface-level-4);\n`;
  out += `  --color-background-inverse: var(--surface-inverse);\n`;
  out += `  --color-background-overlay: var(--surface-overlay);\n`;
  out += `  --card: var(--surface-level-1);\n`;
  out += `  --card-foreground: var(--text-primary);\n`;
  out += `  --popover: var(--surface-level-3);\n`;
  out += `  --popover-foreground: var(--text-primary);\n`;
  out += `  --muted: var(--surface-level-2);\n`;
  out += `  --muted-foreground: var(--text-tertiary);\n\n`;

  out += `  /* Text / Foreground */\n`;
  out += `  --foreground: var(--text-primary);\n`;
  out += `  --foreground-muted: var(--text-secondary);\n`;
  out += `  --color-text-primary: var(--text-primary);\n`;
  out += `  --color-text-secondary: var(--text-secondary);\n`;
  out += `  --color-text-tertiary: var(--text-tertiary);\n`;
  out += `  --color-text-disabled: var(--interactive-disabled-c);\n`;
  out += `  --color-text-inverse: var(--text-inverse-primary);\n\n`;

  out += `  /* Border */\n`;
  out += `  --border: var(--border-primary);\n`;
  out += `  --border-input: var(--input-border-default);\n`;
  out += `  --color-border-default: var(--border-primary);\n`;
  out += `  --color-border-light: var(--border-secondary);\n`;
  out += `  --color-border-subtle: var(--border-tertiary);\n`;
  out += `  --ring: var(--focus-border);\n\n`;

  out += `  /* Button / Interactive - Primary */\n`;
  out += `  --primary: var(--interactive-primary-fill-default);\n`;
  out += `  --primary-foreground: var(--interactive-primary-text-default);\n`;
  out += `  --color-button-primary-bg: var(--interactive-primary-fill-default);\n`;
  out += `  --color-button-primary-bg-hover: var(--interactive-primary-fill-hover);\n`;
  out += `  --color-button-primary-bg-active: var(--interactive-primary-fill-pressed);\n`;
  out += `  --color-button-primary-text: var(--interactive-primary-text-default);\n\n`;

  out += `  /* Button / Interactive - Secondary */\n`;
  out += `  --secondary: var(--interactive-secondary-fill-default);\n`;
  out += `  --secondary-foreground: var(--interactive-secondary-text-default);\n`;
  out += `  --color-button-secondary-bg: var(--interactive-secondary-fill-default);\n`;
  out += `  --color-button-secondary-bg-hover: var(--interactive-secondary-fill-hover);\n`;
  out += `  --color-button-secondary-text: var(--interactive-secondary-text-default);\n\n`;

  out += `  /* Accent */\n`;
  out += `  --accent: var(--interactive-primary-fill-default);\n`;
  out += `  --accent-foreground: var(--interactive-primary-text-default);\n\n`;

  out += `  /* Disabled */\n`;
  out += `  --color-disabled-bg: var(--interactive-disabled-a);\n`;
  out += `  --color-disabled-text: var(--interactive-disabled-c);\n`;
  out += `  --color-disabled-border: var(--interactive-disabled-b);\n\n`;

  out += `  /* Links */\n`;
  out += `  --color-link-primary: var(--interactive-link-primary-default);\n`;
  out += `  --color-link-primary-hover: var(--interactive-link-primary-hover);\n`;
  out += `  --color-link-secondary: var(--interactive-link-secondary-default);\n\n`;

  out += `  /* Status / Feedback */\n`;
  out += `  --destructive: var(--feedback-fill-error);\n`;
  out += `  --destructive-foreground: var(--feedback-text-error);\n`;
  out += `  --color-status-error: var(--feedback-fill-error);\n`;
  out += `  --color-status-error-text: var(--feedback-text-error);\n`;
  out += `  --color-status-error-border: var(--feedback-border-error);\n`;
  out += `  --color-status-success: var(--feedback-fill-success);\n`;
  out += `  --color-status-success-text: var(--feedback-text-success);\n`;
  out += `  --color-status-success-border: var(--feedback-border-success);\n`;
  out += `  --color-status-warning: var(--feedback-fill-warning);\n`;
  out += `  --color-status-warning-text: var(--feedback-text-warning);\n`;
  out += `  --color-status-warning-border: var(--feedback-border-warning);\n`;
  out += `  --color-status-info: var(--feedback-fill-info);\n`;
  out += `  --color-status-info-text: var(--feedback-text-info);\n`;
  out += `  --color-status-info-border: var(--feedback-border-info);\n\n`;

  out += `  /* Selection */\n`;
  out += `  --color-selection-bg: var(--selection-background);\n`;
  out += `  --color-selection-text: var(--selection-text);\n\n`;

  // Typography bridges
  out += `  /* ====== TYPOGRAPHY BRIDGES ====== */\n\n`;
  out += `  --font-size-xs: var(--font-size-010, 0.75rem);\n`;
  out += `  --font-size-sm: var(--font-size-020, 0.875rem);\n`;
  out += `  --font-size-base: var(--font-size-030, 1rem);\n`;
  out += `  --font-size-lg: var(--font-size-040, 1.125rem);\n`;
  out += `  --font-size-xl: var(--font-size-050, 1.25rem);\n`;
  out += `  --font-size-2xl: var(--font-size-070, 1.5rem);\n`;
  out += `  --font-size-3xl: var(--font-size-080, 1.75rem);\n`;
  out += `  --font-size-4xl: var(--font-size-100, 2.25rem);\n`;
  out += `  --font-size-5xl: var(--font-size-130, 3rem);\n\n`;
  out += `  --line-height-tight: 1.25;\n`;
  out += `  --line-height-snug: 1.375;\n`;
  out += `  --line-height-normal: 1.5;\n`;
  out += `  --line-height-relaxed: 1.75;\n\n`;
  out += `  --font-serif: var(--font-family-serif);\n`;
  out += `  --font-sans: var(--font-family-sans);\n\n`;

  // Spacing bridges
  out += `  /* ====== SPACING BRIDGES ====== */\n\n`;
  out += `  --spacing-0: 0px;\n`;
  out += `  --spacing-px: 1px;\n`;
  out += `  --spacing-0-5: 2px;\n`;
  out += `  --spacing-1: var(--spacing-static-03, 4px);\n`;
  out += `  --spacing-1-5: var(--spacing-static-04, 6px);\n`;
  out += `  --spacing-2: var(--spacing-static-05, 8px);\n`;
  out += `  --spacing-2-5: var(--spacing-static-06, 10px);\n`;
  out += `  --spacing-3: var(--spacing-static-07, 12px);\n`;
  out += `  --spacing-3-5: var(--spacing-static-08, 14px);\n`;
  out += `  --spacing-4: var(--spacing-static-09, 16px);\n`;
  out += `  --spacing-5: var(--spacing-static-11, 20px);\n`;
  out += `  --spacing-6: var(--spacing-static-13, 24px);\n`;
  out += `  --spacing-7: var(--spacing-static-14, 28px);\n`;
  out += `  --spacing-8: var(--spacing-static-15, 32px);\n`;
  out += `  --spacing-9: var(--spacing-static-16, 36px);\n`;
  out += `  --spacing-10: var(--spacing-static-17, 40px);\n`;
  out += `  --spacing-12: var(--spacing-static-18, 48px);\n`;
  out += `  --spacing-14: var(--spacing-static-19, 56px);\n`;
  out += `  --spacing-16: var(--spacing-static-20, 64px);\n`;
  out += `  --spacing-20: var(--spacing-static-21, 80px);\n\n`;

  out += `  /* Named spacing aliases */\n`;
  out += `  --spacing-xs: var(--spacing-static-05, 8px);\n`;
  out += `  --spacing-sm: var(--spacing-static-07, 12px);\n`;
  out += `  --spacing-base: var(--spacing-static-09, 16px);\n`;
  out += `  --spacing-md: var(--spacing-static-11, 20px);\n`;
  out += `  --spacing-lg: var(--spacing-static-13, 24px);\n`;
  out += `  --spacing-xl: var(--spacing-static-15, 32px);\n`;
  out += `  --spacing-2xl: var(--spacing-static-17, 40px);\n`;
  out += `  --spacing-3xl: var(--spacing-static-18, 48px);\n`;
  out += `  --spacing-4xl: var(--spacing-static-20, 64px);\n\n`;

  out += `  /* Gap aliases (for Flexbox/Grid) */\n`;
  out += `  --gap-xs: var(--spacing-xs);\n`;
  out += `  --gap-sm: var(--spacing-sm);\n`;
  out += `  --gap-md: var(--spacing-base);\n`;
  out += `  --gap-lg: var(--spacing-lg);\n`;
  out += `  --gap-xl: var(--spacing-xl);\n\n`;

  // Radius bridges
  out += `  /* ====== BORDER RADIUS BRIDGES ====== */\n\n`;
  out += `  --radius-none: 0px;\n`;
  out += `  --radius-sm: var(--border-radius-50, 2px);\n`;
  out += `  --radius-base: var(--border-radius-100, 4px);\n`;
  out += `  --radius-md: var(--border-radius-150, 6px);\n`;
  out += `  --radius-lg: var(--border-radius-200, 8px);\n`;
  out += `  --radius-xl: var(--border-radius-300, 12px);\n`;
  out += `  --radius-2xl: var(--border-radius-400, 16px);\n`;
  out += `  --radius-full: var(--border-radius-full, 9999px);\n`;
  out += `  --radius: var(--radius-md);\n`;
  out += `  --radius-card: var(--radius-lg);\n\n`;

  // Shadow bridges
  out += `  /* ====== SHADOW BRIDGES ====== */\n\n`;
  out += `  --shadow-xs: var(--shadow-elevation-down-level-1, 0px 0.5px 2px 0px rgba(0, 0, 0, 0.08));\n`;
  out += `  --shadow-sm: var(--shadow-elevation-down-level-1, 0px 0.5px 2px 0px rgba(0, 0, 0, 0.08));\n`;
  out += `  --shadow-md: var(--shadow-elevation-down-level-2, 0px 4px 8px 0px rgba(0, 0, 0, 0.08));\n`;
  out += `  --shadow-lg: var(--shadow-elevation-down-level-3, 0px 16px 24px 0px rgba(0, 0, 0, 0.08));\n`;
  out += `  --shadow-xl: var(--shadow-elevation-down-level-4, 0px 20px 32px 0px rgba(0, 0, 0, 0.08));\n`;
  out += `  --shadow: var(--shadow-md);\n`;
  out += `}\n\n`;

  out += `/* Dark mode: bridges inherit through var() references - no overrides needed */\n`;
  out += `[data-theme="dark"],\n[data-color-mode="dark"],\n.dark {\n`;
  out += `  /* All bridges automatically adapt through var() references to globals.css */\n`;
  out += `}\n\n`;

  out += `@media (prefers-color-scheme: dark) {\n`;
  out += `  :root:not([data-theme="light"]) {\n`;
  out += `    /* All bridges automatically adapt through var() references to globals.css */\n`;
  out += `  }\n`;
  out += `}\n`;

  return out;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('Generating Figma Make CSS...\n');

  console.log('Loading tokens.json...');
  const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'));

  console.log('Building ramp color lookup...');
  const rampColors = buildRampLookup(tokens, null);

  console.log('Building foundation lookup...');
  const foundationLookup = buildFoundationLookup(tokens);

  // Semantic colour tokens
  console.log('\nProcessing light mode colour tokens...');
  const lightTokens = processSemanticTokens(
    tokens,
    LIGHT_SET,
    'light',
    rampColors,
    foundationLookup
  );
  console.log(`   Found ${Object.keys(lightTokens).length} colour tokens`);

  console.log('Processing dark mode colour tokens...');
  const darkTokens = processSemanticTokens(
    tokens,
    DARK_SET,
    'dark',
    rampColors,
    foundationLookup
  );
  console.log(`   Found ${Object.keys(darkTokens).length} colour tokens`);

  // Non-colour tokens
  console.log('\nExtracting typography tokens...');
  const typographyTokens = extractTypographyTokens(tokens);
  console.log(
    `   Found ${Object.keys(typographyTokens).length} typography tokens`
  );

  console.log('Extracting spacing & layout tokens...');
  const spacingTokens = extractSpacingTokens(tokens);
  console.log(
    `   Found ${Object.keys(spacingTokens).length} spacing/layout tokens`
  );

  console.log('Extracting shadow tokens...');
  const shadowTokens = extractShadowTokens(tokens);
  console.log(`   Found ${Object.keys(shadowTokens).length} shadow tokens`);

  console.log('Extracting breakpoint tokens...');
  const breakpointTokens = extractBreakpointTokens(tokens);
  console.log(
    `   Found ${Object.keys(breakpointTokens).length} breakpoint tokens`
  );

  // Generate CSS
  console.log('\nGenerating globals.css...');
  const css = generateCSS(
    lightTokens,
    darkTokens,
    typographyTokens,
    spacingTokens,
    shadowTokens,
    breakpointTokens
  );
  fs.writeFileSync(OUTPUT_CSS, css);
  console.log(`   Written to: ${OUTPUT_CSS}`);

  console.log('Generating globals-bridged.css...');
  const bridgedCss = generateBridgedCSS();
  fs.writeFileSync(OUTPUT_BRIDGED_CSS, bridgedCss);
  console.log(`   Written to: ${OUTPUT_BRIDGED_CSS}`);

  // Copy to assets if exists
  const assetsStylesDir = path.join(OUTPUT_DIR, 'assets/styles');
  if (fs.existsSync(assetsStylesDir)) {
    fs.writeFileSync(path.join(assetsStylesDir, 'globals.css'), css);
    fs.writeFileSync(
      path.join(assetsStylesDir, 'globals-bridged.css'),
      bridgedCss
    );
    console.log('   Also updated: assets/styles/');
  }

  // Summary
  const totalTokens =
    Object.keys(lightTokens).length +
    Object.keys(darkTokens).length +
    Object.keys(typographyTokens).length +
    Object.keys(spacingTokens).length +
    Object.keys(shadowTokens).length +
    Object.keys(breakpointTokens).length;

  console.log('\nGeneration complete!');
  console.log(
    `   Light mode colours: ${Object.keys(lightTokens).length} variables`
  );
  console.log(
    `   Dark mode colours:  ${Object.keys(darkTokens).length} variables`
  );
  console.log(
    `   Typography:         ${Object.keys(typographyTokens).length} variables`
  );
  console.log(
    `   Spacing/Layout:     ${Object.keys(spacingTokens).length} variables`
  );
  console.log(
    `   Shadows:            ${Object.keys(shadowTokens).length} variables`
  );
  console.log(
    `   Breakpoints:        ${Object.keys(breakpointTokens).length} variables`
  );
  console.log(`   Total:              ${totalTokens} CSS variables`);
}

main().catch((err) => {
  console.error('Generation failed:', err);
  process.exit(1);
});
