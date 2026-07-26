// Token engine: turns brand choices into a fully-regenerated design system.
// Reads/writes packages/tokens/src/tokens.json and packages/tokens/data/resolved-hexes.json.

import fs from 'fs';
import path from 'path';
import { generateRamp, contrast } from './color.mjs';
import { deriveMode, recipeLabel, GROUPS } from './derive.mjs';

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
  // Behaviour: how the system acts rather than how it looks at rest.
  // radiusField and fieldBorderWidth are null on purpose, meaning "whatever the
  // general setting is". A brand only carries a number here once someone has
  // deliberately split inputs away from everything else, so every brand.json
  // written before this existed keeps behaving exactly as it did.
  radiusField: null,
  fieldBorderWidth: null,
  disabledOpacity: 50, // percent, matches Tailwind's disabled:opacity-50
  skeleton: 'pulse', // pulse | shimmer | none
  motion: true,
  shadow: { preset: 'soft', blur: 8, y: 2, op: 10 },
  // Material / surface style: how surfaces are rendered (the taste layer above tokens)
  material: { preset: 'elevated', opacity: 100, blur: 0, tint: 0, highlight: 0, page: 'plain' }
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

// Every ink that sits on a surface this table also names, as [ink, surface, ref].
// The page's own `foreground` is not in here: it pairs with `background`, and both
// ends of that pairing are the poles of the same ramp, so there is nothing to
// choose between. Derived from the table rather than listed by hand so a role
// added above cannot quietly opt out of the check.
const INK_REFS = Object.entries(THEME_REFS)
  .filter(([tok]) => tok.endsWith('-foreground') && THEME_REFS[tok.slice(0, -11)])
  .map(([tok, ref]) => [tok, tok.slice(0, -11), ref]);

const AA = 4.5;

export function loadBrand() {
  try { return { ...DEFAULT_BRAND, ...JSON.parse(fs.readFileSync(BRAND, 'utf8')) }; }
  catch { return { ...DEFAULT_BRAND }; }
}
export function saveBrand(b) {
  fs.mkdirSync(path.dirname(BRAND), { recursive: true });
  fs.writeFileSync(BRAND, JSON.stringify(b, null, 2));
}

const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

// Alpha-composite `over` (at `alpha`) on top of `base`. Hex in, hex out.
function blendHex(base, over, alpha) {
  const rgb = (h) => { h = (h || '#000000').replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
  const [br, bg, bb] = rgb(base), [or, og, ob] = rgb(over);
  const m = (a, b) => Math.round(b * alpha + a * (1 - alpha)).toString(16).padStart(2, '0');
  return `#${m(br, or)}${m(bg, og)}${m(bb, ob)}`;
}

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
  // Everything the derivation layer works out from the base tokens, kept apart
  // from `theme` as well as merged into it: the recipes and the solver's audits
  // are what the Variables panel shows, and the CSS expressions are what the web
  // target emits instead of a frozen hex.
  const derived = { light: null, dark: null };
  // The theme exactly as it stood before derivation ran. Once the derived tokens
  // are merged into `theme` there is no way to tell a hand-picked colour from a
  // solved one by looking at it, and both the harness and the Variables panel need
  // that distinction: one to prove derivation never overwrites a base name, the
  // other to label a row's origin.
  const base = { light: null, dark: null };
  // Every ink the measurement moved, so the panel can show that the colour on a
  // button is not the one the table asked for and say why.
  const inkNotes = { light: {}, dark: {} };
  for (const mode of ['light', 'dark']) {
    for (const [tok, [fam, step]] of Object.entries(THEME_REFS)) {
      theme[mode][tok] = ramps[fam][mode][step] ?? Object.values(ramps[fam][mode])[0];
    }
    // Per-token overrides (e.g. from a selected preset) win over derived values
    const ov = (brand.overrides || {})[mode] || {};
    const pinned = (tok) => {
      const hex = ov[tok];
      return typeof hex === 'string' && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex.toLowerCase() : null;
    };
    for (const tok of Object.keys(ov)) {
      const hex = pinned(tok);
      if (hex) theme[mode][tok] = hex;
    }

    // The ink each role carries is declared as a neutral ramp step, which is a
    // guess made before anyone knows what colour the role itself will come out.
    // Usually the guess holds. It stops holding as soon as a seed lands somewhere
    // the table did not expect: white on a near-white tertiary reads at 1.2:1,
    // and in dark mode the whole table inverts, so the near-black ink meant for a
    // bright green ends up on a dark green at 2:1. Neither is a solver bug, both
    // are a fixed table meeting a colour it was not written for.
    //
    // So the ink is measured rather than assumed, and only where the declared one
    // has actually failed. Passing inks are left exactly as they are, because a
    // table that reads correctly is a design decision and beating it by half a
    // point is not worth overruling anybody.
    //
    // What a failed ink should become depends on what it was asking for. A step
    // at either end of the ramp is not asking for a weight, it is asking for a
    // pole: the light one or the dark one. When that fails the honest answer is
    // the other pole, because a mid-grey label that scrapes past 4.6:1 on a dark
    // green button reads as a mistake even though it measures fine. A deliberate
    // mid-ramp ink is the opposite case: muted-foreground was picked at neutral
    // 600 because that weight was the point, so it walks one step at a time
    // towards whichever end helps and stops as soon as it can be read.
    //
    // Some pairings cannot be solved from a neutral ramp at all. A mid-blue sits
    // far enough from both ends that neither white nor black clears AA on it.
    // The walk keeps the best value it found and says so, rather than exiting
    // quietly and leaving a failure with nothing attached to explain it.
    for (const [tok, role, [fam, refStep]] of INK_REFS) {
      if (fam !== 'neutral' || pinned(tok)) continue;
      const bg = theme[mode][role];
      const was = theme[mode][tok];
      if (!bg || !was || contrast(was, bg) >= AA) continue;

      const steps = Object.keys(ramps.neutral[mode]).map(Number).sort((a, b) => a - b);
      const at = (s) => ramps.neutral[mode][s];
      const on = (s) => contrast(at(s), bg);
      const i = steps.indexOf(refStep);
      // Positional, never the literal 50 and 950: the ramp's dark end moves as
      // soon as anyone changes how many steps it has.
      const opposite = i === 0 ? steps[steps.length - 1] : i === steps.length - 1 ? steps[0] : null;

      let step;
      if (opposite !== null) {
        // Contrast climbs away from the surface's own lightness in both
        // directions, so the far pole is the best this ramp holds on that side.
        // If even that is worse than the pole we started on, there is nothing to
        // gain by moving and the declared ink stays.
        step = on(opposite) >= AA || on(opposite) > on(refStep) ? opposite : refStep;
      } else {
        const darkerHelps = on(steps[steps.length - 1]) >= on(steps[0]);
        const ahead = i < 0
          ? (darkerHelps ? steps : [...steps].reverse())
          : (darkerHelps ? steps.slice(i + 1) : steps.slice(0, i).reverse());
        const order = ahead.length ? ahead : steps;
        step = order.find((s) => on(s) >= AA)
          ?? order.reduce((best, s) => (on(s) > on(best) ? s : best), order[0]);
      }

      const wasRatio = Math.round(contrast(was, bg) * 10) / 10;
      const nowRatio = Math.round(on(step) * 10) / 10;
      const moved = at(step) !== was;
      const ok = on(step) >= AA;
      if (moved) theme[mode][tok] = at(step);
      inkNotes[mode][tok] = {
        from: was, to: at(step), step, was: wasRatio, now: nowRatio, ok, moved,
        note: moved
          ? `neutral ${refStep} only reached ${wasRatio.toFixed(1)}:1 on ${role}, so the ink walked to neutral ${step}`
            + (ok ? '' : `, which is as far as the neutral ramp goes here at ${nowRatio.toFixed(1)}:1`)
          : `no step of the neutral ramp reads on ${role}: neutral ${refStep} is already the closest at `
            + `${wasRatio.toFixed(1)}:1, so the ink stayed where it was`
      };
    }

    // Derivation runs after the overrides, never before: a pinned primary has to
    // be the colour its own hover and soft fill are worked out from, otherwise
    // the variants belong to a base colour the page never shows.
    base[mode] = { ...theme[mode] };
    const d = deriveMode(theme[mode]);
    derived[mode] = d;
    for (const [tok, hex] of Object.entries(d.tokens)) theme[mode][tok] = hex;

    // A derived token can itself be pinned. When that happens the hand-picked
    // value wins and its recipe is dropped, so the CSS layer emits the literal
    // rather than a color-mix() that would quietly overrule it.
    for (const tok of Object.keys(ov)) {
      const hex = pinned(tok);
      if (!hex || d.tokens[tok] === undefined) continue;
      theme[mode][tok] = hex;
      d.tokens[tok] = hex;
      delete d.recipes[tok];
      delete d.css[tok];
    }
  }

  // Contrast audits. The base pairings first, because those are the ones a person
  // picked; then every pairing the derivation layer created, because a hover state
  // nobody can read is exactly as broken as a rest state nobody can read, and it is
  // the one a fixed percentage table will never tell you about.
  const ROLES = ['primary', 'secondary', 'tertiary', 'accent', 'muted', 'info', 'success', 'warning', 'error', 'destructive'];
  const pairs = [
    ['foreground', 'background', 'base'], ['card-foreground', 'card', 'base'],
    ['foreground', 'background-secondary', 'base'], ['foreground', 'background-tertiary', 'base'],
    ['field-foreground', 'field-background', 'base'], ['field-placeholder', 'field-background', 'base'],
    ...ROLES.flatMap((r) => [
      [`${r}-foreground`, r, 'rest'],
      [`${r}-foreground`, `${r}-hover`, 'state'],
      [`${r}-foreground`, `${r}-active`, 'state'],
      [`${r}-soft-foreground`, `${r}-soft`, 'soft'],
      [`${r}-soft-foreground`, `${r}-soft-hover`, 'soft']
    ])
  ].filter(([fg, bg]) => theme.light[fg] && theme.light[bg]);
  // When surfaces are translucent (glass), text sits on the surface composited
  // over the page background, so audit against that effective colour, not the token.
  const mat = brand.material || {};
  const op = (mat.opacity == null ? 100 : mat.opacity) / 100;
  const effBg = (mode, bg) => {
    if (op >= 0.99 || (bg !== 'card' && bg !== 'popover')) return theme[mode][bg];
    return blendHex(theme[mode].background, theme[mode][bg], op); // surface over page
  };
  const audits = {};
  for (const mode of ['light', 'dark']) {
    audits[mode] = pairs.map(([fg, bg, group]) => {
      const bgHex = effBg(mode, bg);
      const r = contrast(theme[mode][fg], bgHex);
      return {
        fg, bg, group,
        ratio: Math.round(r * 10) / 10,
        aa: r >= 4.5, aaLarge: r >= 3,
        translucent: bgHex !== theme[mode][bg],
        ...(inkNotes[mode][fg] ? { ink: inkNotes[mode][fg] } : {})
      };
    });
    // A state that reads worse than the rest colour it came from is a fault in the
    // recipe. A state that reads badly because the rest colour already did is a
    // fault in the seed. Flagging which is which stops the panel blaming the wrong
    // thing, and stops anyone chasing a solver bug that is really a colour choice.
    const rest = {};
    for (const a of audits[mode]) if (a.group === 'rest') rest[a.bg] = a.ratio;
    for (const a of audits[mode]) {
      if (a.group !== 'state') continue;
      const base = rest[a.bg.replace(/-(hover|active)$/, '')];
      if (base != null && base >= 4.5 && !a.aa) a.regression = true;
      else if (base != null && base < 4.5 && !a.aa) a.inherited = true;
    }
  }

  return { ramps, semantic, theme, base, derived, audits, inks: inkNotes };
}

/**
 * The Variables panel's payload: everything the browser needs to explain a token
 * without re-deriving anything.
 *
 * The labels are computed here rather than in the page so the panel and the
 * command-line harness say the same sentence about the same token. Reimplementing
 * recipeLabel in the page would be a second source of truth that drifts the first
 * time a recipe kind is added.
 *
 * Hex values are left out on purpose: the page already holds them in `theme`, and
 * sending them again would be roughly six kilobytes of duplication per preview.
 */
export function variablesFor(system) {
  const out = { groups: GROUPS, light: null, dark: null };
  for (const mode of ['light', 'dark']) {
    const d = system.derived[mode];
    const labels = {};
    for (const [name, r] of Object.entries(d.recipes)) labels[name] = recipeLabel(r);
    out[mode] = {
      // Order matters twice over: base names come out in the order the theme was
      // assembled, and derived names in the order the recipes ran, which is the
      // order a person would read them in.
      base: Object.keys(system.base[mode]),
      recipes: d.recipes,
      labels,
      css: d.css,
      // Notes the solver left, keyed by token, so a row can say why it is not
      // sitting on its nominal percentage.
      notes: d.audits.reduce((acc, a) => {
        if (a.note) (acc[a.token] = acc[a.token] || []).push(a.note);
        return acc;
      }, {})
    };
  }
  return out;
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

/**
 * Build the contents of packages/ui/src/styles/theme.css — the shadcn variable
 * values, both modes — and hand them back rather than writing them.
 *
 * Kept separate from the write so the checks can ask what a hypothetical brand
 * would emit without touching the file that is committed. They used to call
 * writeShadcnTheme with a made-up brand and read the result off disk, which left
 * the working tree holding a theme nobody asked for and made the run order of
 * the battery matter.
 */
export function shadcnThemeCss(brand, system) {
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
      // The roles beyond shadcn's own set. They were in the token engine from the
      // start but never reached CSS, so anything painting with var(--success) was
      // painting with an invalid value and quietly getting nothing. Emitting them
      // is additive: no existing declaration changes, several broken ones start
      // working, and the derived hover and soft variants below now have something
      // real to refer to.
      tertiary: m('tertiary'), 'tertiary-foreground': m('tertiary-foreground'),
      info: m('info'), 'info-foreground': m('info-foreground'),
      success: m('success'), 'success-foreground': m('success-foreground'),
      warning: m('warning'), 'warning-foreground': m('warning-foreground'),
      error: m('error'), 'error-foreground': m('error-foreground'),
      border: m('border'), input: m('input'), ring: m('ring'),
      'chart-1': m('chart-1'), 'chart-2': m('chart-2'), 'chart-3': m('chart-3'),
      'chart-4': m('chart-4'), 'chart-5': m('chart-5'),
      sidebar: m('card'), 'sidebar-foreground': m('card-foreground'),
      'sidebar-primary': m('primary'), 'sidebar-primary-foreground': m('primary-foreground'),
      'sidebar-accent': m('accent') || m('muted'), 'sidebar-accent-foreground': m('accent-foreground') || m('foreground'),
      'sidebar-border': m('border'), 'sidebar-ring': m('ring'),
      code: m('muted'), 'code-foreground': m('foreground'),
      'code-highlight': m('secondary'), 'code-number': m('muted-foreground'),
      selection: m('primary'), 'selection-foreground': m('primary-foreground')
    };
    return Object.entries(lines).map(([k, v]) => `  --${k}: ${v};`).join('\n');
  };

  // The derived half. These go out as live color-mix() rather than the resolved
  // hex, so retinting one base token moves its whole family without a rebuild, and
  // a soft fill stays genuinely translucent instead of being flattened against
  // whatever the page happened to be at build time. The percentages are the ones
  // the solver verified, so the browser lands on the same colour the audit graded.
  // Platform targets that cannot do color-mix still get the resolved hex, out of
  // system.theme, which is why both forms exist.
  const derivedBlock = (mode) => {
    const d = (system.derived || {})[mode];
    if (!d) return '';
    const byGroup = new Map();
    for (const k of Object.keys(d.tokens)) {
      const g = (d.recipes[k] || {}).group || 'other';
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g).push(`  --${k}: ${d.css[k] || d.tokens[k]};`);
    }
    return [...byGroup].map(([g, rows]) =>
      `\n  /* ${GROUPS[g] || g} */\n${rows.join('\n')}`).join('');
  };
  // Shadow ladder from the brand's shadow settings (tweakcn-style scale)
  const sh = brand.shadow || { blur: 8, y: 2, op: 10 };
  const shadow = (mult, opMult = 1) => {
    const op = Math.min(0.6, (sh.op / 100) * opMult);
    if (op <= 0) return '0 0 0 0 rgba(0,0,0,0)';
    return `0 ${Math.round(sh.y * mult)}px ${Math.round(sh.blur * mult)}px rgba(0,0,0,${op.toFixed(3)})`;
  };
  // Behaviour layer. Every one of these has to compute to what the components
  // already do at default settings, or turning the feature on would move the
  // whole system for people who never asked for it. So the field radius falls
  // back to the general radius, the field border falls back to the general
  // border, disabled resolves to .5 to match `disabled:opacity-50`, and the
  // skeleton default is the pulse Tailwind was already animating.
  const bw = brand.borderWidth == null ? 1 : brand.borderWidth;
  const skeleton = brand.skeleton || 'pulse';
  // `sheen` is a percentage rather than a colour on purpose. A colour worked out
  // here would be mixed against whichever --foreground :root happens to hold,
  // which is the wrong one the moment .dark sits on anything but the html
  // element. Handing the stylesheet a number lets the mix happen on the skeleton
  // itself, where the right foreground is in scope. At 0 the sweep is fully
  // transparent, so pulse and none cost nothing.
  const SKELETON = {
    pulse: { name: 'ds-skeleton-pulse', dur: '2s', ease: 'cubic-bezier(.4,0,.6,1)', sheen: 0 },
    shimmer: { name: 'ds-skeleton-shimmer', dur: '1.6s', ease: 'linear', sheen: 12 },
    none: { name: 'none', dur: '0s', ease: 'linear', sheen: 0 }
  };
  const sk = SKELETON[skeleton] || SKELETON.pulse;
  // A global switch, not a per-component one. Someone who turns animation off
  // wants the product still, and reaching for it component by component would
  // miss the next component anyone adds. The OS preference gets the same
  // treatment in shadcn.css regardless of what this says, because a user setting
  // outranks a brand setting.
  const stillness = brand.motion === false ? `
/* Animation switched off for this brand. Unlayered so it beats the utilities
   that set these, and scoped to duration rather than display so nothing that
   relies on a transition ending silently stops working. */
*, *::before, *::after {
  animation-duration: .01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: .01ms !important;
  scroll-behavior: auto !important;
}
` : '';

  const css = `/* GENERATED by the Design System Controller. Do not edit by hand.
   Regenerated on every Save & apply from the brand tokens. */
:root {
  --radius: ${(0.625 * brand.radius).toFixed(3)}rem;
  --radius-field: ${(0.625 * (brand.radiusField ?? brand.radius)).toFixed(3)}rem;
  --spacing: ${(0.25 * (brand.spacing || 1)).toFixed(4)}rem;
  --border-width: ${bw}px;
  --field-border-width: ${brand.fieldBorderWidth ?? bw}px;
  --disabled-opacity: ${((brand.disabledOpacity ?? 50) / 100).toFixed(3)};
  --skeleton-anim: ${sk.name};
  --skeleton-duration: ${sk.dur};
  --skeleton-easing: ${sk.ease};
  --skeleton-sheen: ${sk.sheen};
  --font-sans: ${font(brand.bodyFont)};
  --font-heading: ${font(brand.headingFont)};
  --font-mono: ui-monospace, 'SF Mono', Menlo, monospace;
  --font-weight-heading: ${brand.headingWeight || 700};
  --font-weight-body: ${brand.bodyWeight || 400};
  --type-scale: ${brand.typeScale || 1.25};
  --leading: ${({ tight: 1.3, normal: 1.5, loose: 1.72 })[brand.lineHeight || 'normal']};
  --tracking: ${({ tight: '-0.012em', normal: '0em', wide: '0.03em' })[brand.letterSpacing || 'normal']};
  --shadow-2xs: ${shadow(0.5, 0.5)};
  --shadow-xs: ${shadow(0.7, 0.7)};
  --shadow-sm: ${shadow(0.85)};
  --shadow: ${shadow(1)};
  --shadow-md: ${shadow(1.25)};
  --shadow-lg: ${shadow(1.6)};
  --shadow-xl: ${shadow(2.1)};
  --shadow-2xl: ${shadow(2.8, 1.4)};
  --surface-opacity: ${(((brand.material || {}).opacity ?? 100) / 100).toFixed(3)};
  --surface-blur: ${(brand.material || {}).blur || 0}px;
  --surface-tint: ${(brand.material || {}).tint || 0};
  --surface-highlight: rgba(255,255,255,${((((brand.material || {}).highlight || 0) / 100) * 0.7).toFixed(3)});
  --page-style: ${(brand.material || {}).page || 'plain'};
${block('light')}
${derivedBlock('light')}
}

.dark {
${block('dark')}
${derivedBlock('dark')}
}
${stillness}`;
  return css;
}

/** Write what shadcnThemeCss built, when there is a packages/ui to write it to. */
export function writeShadcnTheme(brand, system) {
  const dir = path.join(ROOT, 'packages/ui/src/styles');
  if (!fs.existsSync(path.join(ROOT, 'packages/ui'))) return;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'theme.css'), shadcnThemeCss(brand, system));
}
