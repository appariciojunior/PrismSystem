// Prove the behaviour layer is an exact no-op at default settings, and that it
// actually bites once someone changes something.
//
// It cannot load Tailwind here, so it stands in the handful of utilities the
// components actually use, in a real `utilities` cascade layer, declared the way
// Tailwind v4 declares them. That is the part that matters: if the behaviour
// block were layered it would lose to these, and the test would show it.

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { loadBrand, computeSystem, shadcnThemeCss } from '../lib/engine.mjs';
import { ROOT, scratch, launch } from './_shared.mjs';

/**
 * The behaviour rules, cut out of the stylesheet that actually ships them.
 *
 * There is no separate behaviour.css to read. The block lives at the bottom of
 * shadcn.css, under its own banner comment, so the cut is made from that banner
 * rather than from a line number that would rot the first time anybody adds a
 * rule above it. If the banner is not there, something has been renamed and the
 * check should say so instead of quietly testing an empty stylesheet and
 * declaring the layer a perfect no-op.
 */
const behaviourBlock = () => {
  const file = path.join(ROOT, 'packages/ui/src/styles/shadcn.css');
  const css = fs.readFileSync(file, 'utf8');
  const marker = css.indexOf('Behaviour layer, driven by the Design System Controller');
  if (marker < 0) {
    throw new Error(
      `could not find the behaviour layer in ${path.relative(ROOT, file)}\n` +
      'This check compares the stylesheet with and without that block, so it needs\n' +
      'to know where the block starts. It looks for the banner comment that reads\n' +
      '"Behaviour layer, driven by the Design System Controller". If that wording\n' +
      'changed, change it here too.'
    );
  }
  // Back up to the opening of the banner the marker sits inside, so the comment
  // travels with the rules it introduces.
  const start = css.lastIndexOf('/* ---', marker);
  return css.slice(start < 0 ? marker : start);
};

const behaviour = behaviourBlock();

/**
 * What the engine would emit for a brand, without emitting it.
 *
 * This used to write packages/ui/src/styles/theme.css and read it back, which
 * meant a run of this check left a committed file holding whatever the last
 * probe happened to ask for. It only ever looked clean because another script
 * ran afterwards and overwrote it from the real brand.
 */
const themeFor = (over) => {
  const brand = { ...loadBrand(), ...over };
  return shadcnThemeCss(brand, computeSystem(brand));
};

// What Tailwind v4 emits for the classes these components carry.
const TAILWIND = `
@layer theme, base, components, utilities;
@layer base {
  /* Preflight. Without it an element with border-style but no width falls back
     to 'medium', and the OTP joins would read as 3px rather than nothing. */
  *, ::before, ::after { border-width: 0; border-style: solid; }
}
@layer theme {
  :root {
    --radius-sm: calc(var(--radius) * 0.6);
    --radius-md: calc(var(--radius) * 0.8);
    --radius-lg: var(--radius);
  }
}
@layer utilities {
  .rounded-md { border-radius: var(--radius-md); }
  .rounded-l-md { border-top-left-radius: var(--radius-md); border-bottom-left-radius: var(--radius-md); }
  .rounded-r-md { border-top-right-radius: var(--radius-md); border-bottom-right-radius: var(--radius-md); }
  .border { border-style: solid; border-width: 1px; }
  .border-y { border-style: solid; border-top-width: 1px; border-bottom-width: 1px; }
  .border-r { border-style: solid; border-right-width: 1px; }
  .border-l { border-style: solid; border-left-width: 1px; }
  .disabled\\:opacity-50:disabled { opacity: 50%; }
  .aria-disabled\\:opacity-50[aria-disabled="true"] { opacity: 50%; }
  .animate-pulse { animation: tw-pulse 2s cubic-bezier(.4,0,.6,1) infinite; }
}
@keyframes tw-pulse { 50% { opacity: .5 } }
`;

const BODY = `
<input  data-slot="input"          id="input"    class="rounded-md border disabled:opacity-50">
<input  data-slot="input"          id="disabled" class="rounded-md border disabled:opacity-50" disabled>
<textarea data-slot="textarea"     id="textarea" class="rounded-md border disabled:opacity-50"></textarea>
<button data-slot="select-trigger" id="trigger"  class="rounded-md border disabled:opacity-50">x</button>
<div id="otp">
  <div data-slot="input-otp-slot" id="otp1" class="border-y border-r rounded-l-md border-l"></div>
  <div data-slot="input-otp-slot" id="otp2" class="border-y border-r"></div>
  <div data-slot="input-otp-slot" id="otp3" class="border-y border-r rounded-r-md"></div>
</div>
<div  data-slot="card"             id="card"     class="border"></div>
<div  data-slot="alert"            id="alert"    class="border"></div>
<div  data-slot="skeleton"         id="skeleton" class="animate-pulse rounded-md"></div>
<div  data-slot="checkbox"         id="checkbox" class="border disabled:opacity-50"></div>
`;

const PROBES = [
  ['input', ['borderRadius', 'borderTopWidth', 'opacity']],
  ['disabled', ['opacity']],
  ['textarea', ['borderRadius', 'borderTopWidth']],
  ['trigger', ['borderRadius', 'borderTopWidth']],
  ['otp1', ['borderTopLeftRadius', 'borderTopRightRadius', 'borderLeftWidth', 'borderRightWidth', 'borderTopWidth']],
  ['otp2', ['borderTopLeftRadius', 'borderLeftWidth', 'borderRightWidth', 'borderTopWidth']],
  ['otp3', ['borderTopRightRadius', 'borderLeftWidth', 'borderRightWidth']],
  ['card', ['borderTopWidth', 'borderLeftWidth']],
  ['alert', ['borderTopWidth']],
  ['skeleton', ['borderRadius', 'animationName', 'animationDuration', 'animationTimingFunction', 'backgroundImage']],
  ['checkbox', ['borderTopWidth']]
];

const page = (theme, withBehaviour) => `<!doctype html><meta charset="utf-8">
<style>${TAILWIND}</style><style>${theme}</style>${withBehaviour ? `<style>${behaviour}</style>` : ''}
<body>${BODY}</body>`;

const browser = await launch(chromium);
const tab = await browser.newPage();
const errs = [];
tab.on('pageerror', (e) => errs.push(String(e)));

const read = async (html) => {
  const f = scratch('behaviour-probe.html');
  fs.writeFileSync(f, html);
  await tab.goto('file://' + f + '?t=' + html.length + Math.random().toString(36).slice(2));
  return tab.evaluate((probes) => {
    const out = {};
    for (const [id, props] of probes) {
      const cs = getComputedStyle(document.getElementById(id));
      for (const p of props) out[id + '.' + p] = cs[p];
    }
    return out;
  }, PROBES);
};

let fail = 0;
const base = themeFor({});

const off = await read(page(base, false));
const on = await read(page(base, true));

console.log('PARITY at default settings');
const moved = Object.keys(off).filter((k) => off[k] !== on[k]);
// The skeleton sweep is the one intended addition: a gradient that resolves to
// fully transparent, so it paints nothing but does show up as a background-image.
const allowed = new Set(['skeleton.backgroundImage', 'skeleton.animationName']);
for (const k of moved) {
  const ok = allowed.has(k);
  console.log(`  ${ok ? 'expected' : 'MOVED  '} ${k.padEnd(34)} ${off[k]}  ->  ${on[k]}`);
  if (!ok) fail++;
}
if (!moved.length) console.log('  (nothing moved at all)');

// The pulse has to be the same pulse, whatever it is called.
if (on['skeleton.animationName'] !== 'ds-skeleton-pulse') { console.log('  SKELETON not on the ds pulse:', on['skeleton.animationName']); fail++; }
if (on['skeleton.animationDuration'] !== off['skeleton.animationDuration'] ||
    on['skeleton.animationTimingFunction'] !== off['skeleton.animationTimingFunction']) {
  console.log('  SKELETON timing changed:', off['skeleton.animationDuration'], off['skeleton.animationTimingFunction'],
              '->', on['skeleton.animationDuration'], on['skeleton.animationTimingFunction']);
  fail++;
}
const sweep = on['skeleton.backgroundImage'];
// Chromium keeps the mix unresolved as oklab(... / 0); what matters is the alpha.
const opaqueStop = /(?:rgba?|oklab|oklch|color)\([^)]*\)/g;
const anyPaint = (sweep.match(opaqueStop) || []).some((c) => !/\/\s*0\s*\)$|,\s*0\)$/.test(c));
if (anyPaint) {
  console.log('  SKELETON sweep is not transparent at rest:', sweep); fail++;
} else console.log('  sweep resolves transparent at rest, so it paints nothing');

console.log('\nCONTROLS BITE once changed');
const cases = [
  ['radiusField: 3.2', { radiusField: 3.2 }, (v) => v['input.borderRadius'] !== off['input.borderRadius'] && v['card.borderTopWidth'] === off['card.borderTopWidth']],
  ['fieldBorderWidth: 2', { fieldBorderWidth: 2 }, (v) => v['input.borderTopWidth'] === '2px' && v['otp2.borderLeftWidth'] === '0px' && v['otp1.borderLeftWidth'] === '2px' && v['card.borderTopWidth'] === '1px'],
  ['borderWidth: 2', { borderWidth: 2 }, (v) => v['card.borderTopWidth'] === '2px' && v['alert.borderTopWidth'] === '2px' && v['input.borderTopWidth'] === '2px'],
  ['disabledOpacity: 25', { disabledOpacity: 25 }, (v) => v['disabled.opacity'] === '0.25' && v['input.opacity'] === '1'],
  ['skeleton: shimmer', { skeleton: 'shimmer' }, (v) => v['skeleton.animationName'] === 'ds-skeleton-shimmer' && /oklab|rgb/.test(v['skeleton.backgroundImage']) && v['skeleton.animationDuration'] === '1.6s'],
  ['skeleton: none', { skeleton: 'none' }, (v) => v['skeleton.animationName'] === 'none']
];
for (const [label, over, ok] of cases) {
  const v = await read(page(themeFor(over), true));
  const good = ok(v);
  console.log(`  ${good ? 'ok  ' : 'FAIL'} ${label}`);
  if (!good) { fail++; for (const k of Object.keys(v)) if (v[k] !== on[k]) console.log(`        ${k} ${on[k]} -> ${v[k]}`); }
}

// Motion off is a whole-document reset, so probe an element that animates.
{
  const v = await read(page(themeFor({ motion: false }), true));
  const good = parseFloat(v['skeleton.animationDuration']) < 0.001;
  console.log(`  ${good ? 'ok  ' : 'FAIL'} motion: false  (skeleton duration ${v['skeleton.animationDuration']})`);
  if (!good) fail++;
}

if (errs.length) { console.log('\nPAGE ERRORS:\n ', errs.join('\n  ')); fail++; }
console.log(fail ? `\nFAILURES: ${fail}` : '\nBEHAVIOUR LAYER IS A NO-OP AT DEFAULTS AND LIVE WHEN CHANGED');
await browser.close();
process.exit(fail ? 1 : 0);
