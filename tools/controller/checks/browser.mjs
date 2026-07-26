// Does the browser agree with us?
//
// The whole dual-emission idea rests on one claim: the resolved hex that goes to
// Style Dictionary, SCSS and Swift, and the live color-mix() that goes to the web,
// are the same colour. That claim is cheap to make and easy to get wrong, so this
// loads the generated theme.css into real Chromium and reads back what the engine
// actually painted, for every derived token, in both modes.
//
// Translucent tokens are composited over the page before comparing, because that
// is what the browser will do when the fill lands on the page anyway.

import fs from 'fs';
import { chromium } from 'playwright';
import { loadBrand, computeSystem, shadcnThemeCss } from '../lib/engine.mjs';
import { scratch, launch } from './_shared.mjs';


const brand = loadBrand();
const system = computeSystem(brand);
// Asking the engine for the stylesheet rather than making it write one and
// reading it back. Same bytes either way, minus a check that dirties the repo
// every time it runs.
const css = shadcnThemeCss(brand, system);

const names = Object.keys(system.derived.light.tokens);
const probe = scratch('theme-probe.html');
fs.writeFileSync(probe, `<!doctype html><meta charset="utf-8">
<style>${css}
html,body{margin:0}
.probe{width:1px;height:1px}
</style>
<body>
<div id="light">${names.map((n) => `<div class="probe" data-t="${n}" style="background:var(--${n})"></div>`).join('')}</div>
<div class="dark" id="dark">${names.map((n) => `<div class="probe" data-t="${n}" style="background:var(--${n})"></div>`).join('')}</div>
`);

const browser = await launch(chromium);
const page = await browser.newPage();
await page.goto('file://' + probe);

// Read the painted pixel, not the computed string. Chromium serialises a
// color-mix() result as oklab(...) rather than rgb(...), and an invalid value
// serialises as transparent, so parsing the string would both need a colour
// parser and quietly pass a token the browser failed to resolve. Compositing
// each token over the page on a canvas gives the byte the user actually sees,
// which is the only number worth comparing.
const read = (scope, pageHex) => page.evaluate(([sel, bg]) => {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 1;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const out = {};
  document.querySelectorAll(sel + ' .probe').forEach((el) => {
    const c = getComputedStyle(el).backgroundColor;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const p = ctx.getImageData(0, 0, 1, 1).data;
    out[el.dataset.t] = { px: [p[0], p[1], p[2]], raw: c };
  });
  return out;
}, [scope, pageHex]);

const hex = (n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');

let fail = 0;
let worst = 0;
for (const mode of ['light', 'dark']) {
  const page0 = system.theme[mode].background;
  const got = await read('#' + mode, page0);
  const want = system.derived[mode].tokens;

  const rows = [];
  for (const n of names) {
    const g = got[n];
    if (!g) { rows.push([n, want[n], 'NOT RENDERED', '']); fail++; continue; }
    const browserHex = '#' + g.px.map(hex).join('');
    const ours = want[n];
    const d = Math.max(...[1, 3, 5].map((i, j) =>
      Math.abs(parseInt(ours.slice(i, i + 2), 16) - g.px[j])));
    if (d > worst) worst = d;
    if (d > 1) { rows.push([n, ours, browserHex, d + (g.raw === 'rgba(0, 0, 0, 0)' ? '  (browser could not resolve it)' : '')]); fail++; }
  }
  console.log(`${mode}: ${names.length} derived tokens, ${rows.length} disagree by more than 1/255`);
  for (const r of rows) console.log('   ', r[0].padEnd(30), 'ours', r[1], 'browser', r[2], 'delta', r[3]);
}

console.log(`\nworst channel disagreement across both modes: ${worst}/255`);
console.log(fail ? `BROWSER CHECK FAILED: ${fail}` : 'BROWSER AGREES WITH THE ENGINE');
await browser.close();
process.exit(fail ? 1 : 0);
