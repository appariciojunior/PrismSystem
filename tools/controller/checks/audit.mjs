// Render the rebuilt accessibility panel with real engine data, in a real browser.
//
// It lifts the actual CSS and the actual renderAudits/auditRow source out of the
// controller page rather than reimplementing them, so what gets screenshotted is
// the code that ships. The controller itself cannot be loaded here: it talks to a
// server on the Mac, which this container cannot reach.

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { loadBrand, computeSystem } from '../lib/engine.mjs';
import { ROOT, scratch, launch } from './_shared.mjs';

const page0 = fs.readFileSync(path.join(ROOT, 'tools/controller/public/index.html'), 'utf8');

const css = [...page0.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
const js = page0.slice(
  page0.indexOf('  var AUDIT_GROUPS = ['),
  page0.indexOf("$('#audit-only-fail').addEventListener('change', renderAudits);") +
    "$('#audit-only-fail').addEventListener('change', renderAudits);".length
);
if (!js.includes('function auditRow')) throw new Error('could not lift the audit renderer out of index.html');

const system = computeSystem(loadBrand());
const mode = process.argv[2] === 'dark' ? 'dark' : 'light';

const vars = Object.entries(system.theme[mode]).map(([k, v]) => `--${k}: ${v};`).join('');
const out = scratch(`audit-${mode}.html`);
fs.writeFileSync(out, `<!doctype html><meta charset="utf-8"><title>audit</title>
<style>${css}
:root{${vars} --r: 8px; --radius: 8px; --bw: 1px;}
body{background:var(--background);color:var(--foreground);font-family:system-ui,sans-serif;margin:0;padding:24px;}
.pv-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;max-width:1080px;}
.pv-card-title{font-size:14px;font-weight:600;margin-bottom:4px;}
.pv-card-desc{font-size:12px;color:var(--muted-foreground);}
</style>
<body>
<div class="pv-card">
  <div class="pv-card-title">Accessibility</div>
  <div class="audit-head">
    <div class="pv-card-desc" id="audit-desc">Contrast audit for the light theme.</div>
    <label class="audit-toggle"><input type="checkbox" id="audit-only-fail"> Only what fails</label>
  </div>
  <div class="audit-list" id="audit-list"></div>
</div>
<script>
var $ = function (s) { return document.querySelector(s); };
var el = function (tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
var mode = ${JSON.stringify(mode)};
var audits = ${JSON.stringify(system.audits)};
var THEME = ${JSON.stringify(system.theme)};
function moodTokens() { return THEME[mode]; }
${js}
renderAudits();
</script>
`);

const browser = await launch(chromium);
const page = await browser.newPage({ viewport: { width: 1140, height: 1400 }, deviceScaleFactor: 2 });
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + out);

const shot = async (tag) => {
  await page.screenshot({ path: scratch(`audit-${mode}-${tag}.png`), fullPage: true });
};

const stats = await page.evaluate(() => ({
  groups: [...document.querySelectorAll('.audit-group')].map((g) => [
    g.querySelector('.audit-group-name').textContent,
    g.querySelectorAll('.audit-row').length,
    g.querySelector('.audit-group-count').textContent
  ]),
  rows: document.querySelectorAll('.audit-row').length,
  desc: document.querySelector('#audit-desc').textContent,
  regressions: document.querySelectorAll('.audit-cause.regression').length,
  inherited: document.querySelectorAll('.audit-cause.inherited').length,
  // A swatch painting nothing means the panel looked a token up and missed.
  blank: [...document.querySelectorAll('.audit-sample')]
    .filter((s) => getComputedStyle(s).backgroundColor === 'rgba(0, 0, 0, 0)').length
}));
await shot('all');

await page.click('#audit-only-fail');
const failOnly = await page.evaluate(() => document.querySelectorAll('.audit-row').length);
await shot('failures');

console.log(`${mode}: ${stats.rows} rows, ${failOnly} when filtered to failures`);
console.log('  ' + stats.desc);
for (const [name, n, count] of stats.groups) console.log(`    ${name.padEnd(28)} ${String(n).padStart(2)} rows   ${count}`);
console.log(`  regression tags ${stats.regressions}, from-seed tags ${stats.inherited}, unresolved swatches ${stats.blank}`);
if (errs.length) console.log('  PAGE ERRORS:\n   ', errs.join('\n    '));
await browser.close();
process.exit(errs.length || stats.blank ? 1 : 0);
