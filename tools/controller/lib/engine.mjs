// Token engine: turns brand choices into a fully-regenerated design system.
// Reads/writes packages/tokens/src/tokens.json and packages/tokens/data/resolved-hexes.json.

import fs from 'fs';
import path from 'path';
import { generateRamp, contrast } from './color.mjs';

export const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../../..'
);
const TOKENS = path.join(ROOT, 'packages/tokens/src/tokens.json');
const HEXES = path.join(ROOT, 'packages/tokens/data/resolved-hexes.json');
const BRAND = path.join(ROOT, 'tools/controller/brand.json');

export const DEFAULT_BRAND = {
  primary: '#005C8A',
  neutralTint: '#8C8C8C',
  tertiary: '#3292A6',
  info: '#0F4AA2',
  success: '#31A46F',
  warning: '#FFA300',
  error: '#E02020',
  charts: ['#254251', '#E0AB26', '#75B2DD', '#F37F2F', '#3292A6'],
  headingFont: 'Inter',
  bodyFont: 'Inter',
  typeScale: 1.25,
  radius: 1.0, // multiplier on the borderRadius scale
  spacing: 1.0, // density multiplier on the spacing scale
  borderWidth: 1,
  shadow: { preset: 'soft', blur: 8, y: 2, op: 10 }
};

// theme-layer aliases: token -> ramp reference (mode-aware via ramp tables)
const THEME_REFS = {
  background: ['neutral', 50], foreground: ['neutral', 950],
  card: ['neutral', 100], 'card-foreground': ['neutral', 950],
  popover: ['neutral', 50], 'popover-foreground': ['neutral', 950],
  primary: ['brand', 800], 'primary-foreground': ['neutral', 50],
  secondary: ['neutral', 200], 'secondary-foreground': ['neutral', 950],
  tertiary: ['tertiary', 500], 'tertiary-foreground': ['neutral', 50],
  muted: ['neutral', 150], 'muted-foreground': ['neutral', 600],
  accent: ['neutral', 150], 'accent-foreground': ['neutral', 950],
  border: ['neutral', 300], input: ['neutral', 300], ring: ['neutral', 600],
  info: ['info', 500], 'info-foreground': ['neutral', 50],
  success: ['success', 500], 'success-foreground': ['neutral', 50],
  warning: ['warning', 500], 'warning-foreground': ['neutral', 950],
  error: ['error', 500], 'error-foreground': ['neutral', 50],
  destructive: ['error', 500], 'destructive-foreground': ['neutral', 50],
  'chart-1': ['chart1', 500], 'chart-2': ['chart2', 500],
  'chart-3': ['chart3', 500], 'chart-4': ['chart4', 500], 'chart-5': ['chart5', 500]
};

export function loadBrand() {
  try { return { ...DEFAULT_BRAND, ...JSON.parse(fs.readFileSync(BRAND, 'utf8')) }; }
  catch { return { ...DEFAULT_BRAND }; }
}
export function saveBrand(b) {
  fs.mkdirSync(path.dirname(BRAND), { recursive: true });
  fs.writeFileSync(BRAND, JSON.stringify(b, null, 2));
}

const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

/** Discover existing ramp step names from the hex cache (e.g. neutral -> [50..950]). */
function rampSteps(hexes, family) {
  const steps = new Set();
  for (const k of Object.keys(hexes)) {
    const m = k.match(new RegExp(`^ramp\\.${family}\\.(\\d+)$`));
    if (m) steps.add(Number(m[1]));
  }
  return [...steps].sort((a, b) => a - b);
}

/**
 * Compute the full colour system from brand choices.
 * Returns { ramps: {family:{mode:{step:hex}}}, semantic: {mode:{path:hex}}, theme, audits }
 */
export function computeSystem(brand) {
  const hexes = readJson(HEXES);
  const tokens = readJson(TOKENS);

  const families = {
    brand: { seed: brand.primary, cacheName: 'blue', anchor: 800 },
    neutral: { seed: brand.neutralTint, cacheName: 'neutral', neutral: true },
    tertiary: { seed: brand.tertiary, cacheName: 'teal', anchor: 500 },
    info: { seed: brand.info, cacheName: 'messaging.info', anchor: 500 },
    success: { seed: brand.success, cacheName: 'messaging.success', anchor: 500 },
    warning: { seed: brand.warning, cacheName: 'messaging.warning', anchor: 500 },
    error: { seed: brand.error, cacheName: 'messaging.error', anchor: 500 },
    chart1: { seed: brand.charts[0], cacheName: 'darkBlue', anchor: 500 },
    chart2: { seed: brand.charts[1], cacheName: 'yellow', anchor: 500 },
    chart3: { seed: brand.charts[2], cacheName: 'lightBlue', anchor: 500 },
    chart4: { seed: brand.charts[3], cacheName: 'orange', anchor: 500 },
    chart5: { seed: brand.charts[4], cacheName: 'teal', anchor: 500 }
  };

  const ramps = {};
  for (const [fam, cfg] of Object.entries(families)) {
    const found = rampSteps(hexes, cfg.cacheName.replace('.', '\\.'));
    const steps = found.length
      ? found
      : [50,100,150,200,250,300,350,400,450,500,550,600,650,700,750,800,850,900,950];
    ramps[fam] = {
      light: generateRamp(cfg.seed, steps, { mode: 'light', neutral: !!cfg.neutral, anchor: cfg.anchor }),
      dark: generateRamp(cfg.seed, steps, { mode: 'dark', neutral: !!cfg.neutral, anchor: cfg.anchor }),
      cacheName: cfg.cacheName,
      steps
    };
  }
  // Force neutral endpoints to pure paper/ink like the shipped system
  for (const mode of ['light', 'dark']) {
    const n = ramps.neutral[mode];
    const st = ramps.neutral.steps;
    n[st[0]] = mode === 'light' ? '#ffffff' : '#000000';
  }

  // Resolve any {ramp.x.y} reference against the regenerated ramps (cache names)
  const cacheLookup = (mode) => {
    const map = {};
    for (const fam of Object.values(ramps)) {
      for (const [step, hex] of Object.entries(fam[mode])) {
        map[`ramp.${fam.cacheName}.${step}`] = hex;
      }
    }
    return map;
  };
  const lookups = { light: cacheLookup('light'), dark: cacheLookup('dark') };

  // Walk semantic sets and recompute each referenced token per mode
  const semantic = { light: {}, dark: {} };
  for (const mode of ['light', 'dark']) {
    const set = tokens[`${mode}/ core`] || {};
    const walk = (o, p) => {
      if (o && typeof o === 'object') {
        if (typeof o.value === 'string') {
          const m = o.value.match(/^\{(ramp\.[^}]+)\}$/);
          if (m && lookups[mode][m[1]]) semantic[mode][p] = lookups[mode][m[1]];
        } else {
          for (const [k, v] of Object.entries(o)) walk(v, p ? `${p}.${k}` : k);
        }
      }
    };
    walk(set, '');
  }

  // Theme layer
  const theme = { light: {}, dark: {} };
  for (const mode of ['light', 'dark']) {
    for (const [tok, [fam, step]] of Object.entries(THEME_REFS)) {
      theme[mode][tok] = ramps[fam][mode][step] ?? Object.values(ramps[fam][mode])[0];
    }
    // Per-token overrides (e.g. from a selected preset) win over derived values
    const ov = (brand.overrides || {})[mode] || {};
    for (const [tok, hex] of Object.entries(ov)) {
      if (typeof hex === 'string' && /^#[0-9a-fA-F]{6}$/.test(hex)) theme[mode][tok] = hex.toLowerCase();
    }
  }

  // Contrast audits on key pairings
  const pairs = [
    ['foreground', 'background'], ['primary-foreground', 'primary'],
    ['secondary-foreground', 'secondary'], ['tertiary-foreground', 'tertiary'],
    ['muted-foreground', 'muted'], ['card-foreground', 'card'],
    ['destructive-foreground', 'destructive'], ['info-foreground', 'info'],
    ['success-foreground', 'success'], ['warning-foreground', 'warning']
  ];
  const audits = {};
  for (const mode of ['light', 'dark']) {
    audits[mode] = pairs.map(([fg, bg]) => {
      const r = contrast(theme[mode][fg], theme[mode][bg]);
      return { fg, bg, ratio: Math.round(r * 10) / 10, aa: r >= 4.5, aaLarge: r >= 3 };
    });
  }

  return { ramps, semantic, theme, audits };
}

/** Write the computed system into the repo sources (with timestamped backups). */
export function applySystem(brand, system) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const bdir = path.join(ROOT, 'tools/controller/backups', stamp);
  fs.mkdirSync(bdir, { recursive: true });
  for (const f of [TOKENS, HEXES]) fs.copyFileSync(f, path.join(bdir, path.basename(f)));
  if (fs.existsSync(BRAND)) fs.copyFileSync(BRAND, path.join(bdir, 'brand.json'));
  fs.writeFileSync(path.join(bdir, 'meta.json'), JSON.stringify({
    at: new Date().toISOString(),
    label: (brand.presetSlug || 'custom') + (brand.identity?.name ? ` · ${brand.identity.name}` : ''),
    primary: brand.primary
  }));

  const hexes = readJson(HEXES);
  const tokens = readJson(TOKENS);

  // 1) ramp entries in the hex cache
  for (const fam of Object.values(system.ramps)) {
    for (const step of fam.steps) {
      const key = `ramp.${fam.cacheName}.${step}`;
      const prev = hexes[key] || {};
      hexes[key] = { ...prev, light: fam.light[step].toUpperCase(), dark: fam.dark[step].toUpperCase() };
    }
  }
  // 2) semantic entries in the hex cache
  for (const mode of ['light', 'dark']) {
    for (const [p, hex] of Object.entries(system.semantic[mode])) {
      const key = `${p}.core.${mode}`;
      const prev = hexes[key] || {};
      hexes[key] = { ...prev, hex: hex.toUpperCase() };
    }
  }
  // 3) theme layer + ramp values inside tokens.json
  for (const mode of ['light', 'dark']) {
    const th = tokens[`${mode}/ core`]?.theme;
    if (th) {
      for (const [tok, hex] of Object.entries(system.theme[mode])) {
        if (th[tok] && typeof th[tok] === 'object') th[tok].value = hex;
      }
    }
    const brandSet = tokens[`${mode}/ brand`]?.ramp;
    if (brandSet) {
      for (const famKey of ['brand', 'neutral']) {
        const fam = system.ramps[famKey];
        const name = fam.cacheName.split('.')[0];
        if (brandSet[name]) {
          for (const step of fam.steps) {
            if (brandSet[name][step]?.value !== undefined) {
              brandSet[name][step].value = fam[mode][step];
            }
          }
        }
      }
    }
  }
  // 4) foundation seeds + typography + radius
  if (tokens.foundation?.brand?.blue) tokens.foundation.brand.blue.value = brand.primary;
  const setFonts = (o) => {
    if (!o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      if (k.toLowerCase().includes('fontfamil') && v && typeof v === 'object') {
        for (const fv of Object.values(v)) {
          if (fv && typeof fv === 'object' && typeof fv.value === 'string') {
            fv.value = `'${brand.bodyFont}', system-ui, sans-serif`;
          }
        }
        if (typeof v.value === 'string') v.value = `'${brand.bodyFont}', system-ui, sans-serif`;
      } else setFonts(v);
    }
  };
  setFonts(tokens.foundation);
  if (tokens.borderRadius) {
    const base = { 50: 4, 100: 8, 150: 12, 200: 16, 300: 24, 400: 32 };
    for (const [k, v] of Object.entries(tokens.borderRadius)) {
      if (v && typeof v === 'object' && base[k] !== undefined) {
        v.value = `${Math.round(base[k] * brand.radius)}px`;
      }
    }
  }
  // Density: scale the static spacing tokens across all viewports
  const dens = brand.spacing || 1;
  if (dens !== 1) {
    for (const setName of Object.keys(tokens)) {
      if (!setName.startsWith('viewport/')) continue;
      const stat = tokens[setName]?.spacing?.static;
      if (!stat) continue;
      for (const v of Object.values(stat)) {
        if (v && typeof v === 'object' && typeof v.value === 'string') {
          const m = v.value.match(/^([\d.]+)(px|rem)$/);
          if (m) v.value = `${Math.round(parseFloat(m[1]) * dens * 100) / 100}${m[2]}`;
        }
      }
    }
  }

  fs.writeFileSync(HEXES, JSON.stringify(hexes, null, 2));
  fs.writeFileSync(TOKENS, JSON.stringify(tokens, null, 2));
  writeShadcnTheme(brand, system);
  saveBrand(brand);
  return { backupDir: bdir };
}

/** Emit packages/ui/src/styles/theme.css — the shadcn variable values, both modes. */
export function writeShadcnTheme(brand, system) {
  const dir = path.join(ROOT, 'packages/ui/src/styles');
  if (!fs.existsSync(path.join(ROOT, 'packages/ui'))) return;
  fs.mkdirSync(dir, { recursive: true });
  const font = (f) => `'${f}', system-ui, sans-serif`;
  const block = (mode) => {
    const t = system.theme[mode];
    const m = (k) => t[k];
    const lines = {
      background: m('background'), foreground: m('foreground'),
      card: m('card'), 'card-foreground': m('card-foreground'),
      popover: m('popover'), 'popover-foreground': m('popover-foreground'),
      primary: m('primary'), 'primary-foreground': m('primary-foreground'),
      secondary: m('secondary'), 'secondary-foreground': m('secondary-foreground'),
      muted: m('muted'), 'muted-foreground': m('muted-foreground'),
      accent: m('accent') || m('muted'), 'accent-foreground': m('accent-foreground') || m('foreground'),
      destructive: m('destructive'), 'destructive-foreground': m('destructive-foreground'),
      border: m('border'), input: m('input'), ring: m('ring'),
      'chart-1': m('chart-1'), 'chart-2': m('chart-2'), 'chart-3': m('chart-3'),
      'chart-4': m('chart-4'), 'chart-5': m('chart-5'),
      sidebar: m('card'), 'sidebar-foreground': m('card-foreground'),
      'sidebar-primary': m('primary'), 'sidebar-primary-foreground': m('primary-foreground'),
      'sidebar-accent': m('accent') || m('muted'), 'sidebar-accent-foreground': m('accent-foreground') || m('foreground'),
      'sidebar-border': m('border'), 'sidebar-ring': m('ring'),
      surface: m('muted'), 'surface-foreground': m('foreground'),
      code: m('muted'), 'code-foreground': m('foreground'),
      'code-highlight': m('secondary'), 'code-number': m('muted-foreground'),
      selection: m('primary'), 'selection-foreground': m('primary-foreground')
    };
    return Object.entries(lines).map(([k, v]) => `  --${k}: ${v};`).join('\n');
  };
  // Shadow ladder from the brand's shadow settings (tweakcn-style scale)
  const sh = brand.shadow || { blur: 8, y: 2, op: 10 };
  const shadow = (mult, opMult = 1) => {
    const op = Math.min(0.6, (sh.op / 100) * opMult);
    if (op <= 0) return '0 0 0 0 rgba(0,0,0,0)';
    return `0 ${Math.round(sh.y * mult)}px ${Math.round(sh.blur * mult)}px rgba(0,0,0,${op.toFixed(3)})`;
  };
  const css = `/* GENERATED by the Design System Controller. Do not edit by hand.
   Regenerated on every Save & apply from the brand tokens. */
:root {
  --radius: ${(0.625 * brand.radius).toFixed(3)}rem;
  --spacing: ${(0.25 * (brand.spacing || 1)).toFixed(4)}rem;
  --border-width: ${brand.borderWidth == null ? 1 : brand.borderWidth}px;
  --font-sans: ${font(brand.bodyFont)};
  --font-heading: ${font(brand.headingFont)};
  --font-mono: ui-monospace, 'SF Mono', Menlo, monospace;
  --shadow-2xs: ${shadow(0.5, 0.5)};
  --shadow-xs: ${shadow(0.7, 0.7)};
  --shadow-sm: ${shadow(0.85)};
  --shadow: ${shadow(1)};
  --shadow-md: ${shadow(1.25)};
  --shadow-lg: ${shadow(1.6)};
  --shadow-xl: ${shadow(2.1)};
  --shadow-2xl: ${shadow(2.8, 1.4)};
${block('light')}
}

.dark {
${block('dark')}
}
`;
  fs.writeFileSync(path.join(dir, 'theme.css'), css);
}
