// Boot the real controller page and drive the Variables panel with real engine
// data. The page normally talks to a server this container cannot reach, so
// /api/state is stubbed with exactly what the server would return: the payload
// is built by the same computeSystem and variablesFor the server calls.

import path from 'path';
import { chromium } from 'playwright';
import { loadBrand, computeSystem, variablesFor } from '../lib/engine.mjs';
import { ROOT, scratch, launch } from './_shared.mjs';

const PAGE = 'file://' + path.join(ROOT, 'tools/controller/public/index.html');

const brand = loadBrand();
const system = computeSystem(brand);
const STATE = {
  brand,
  theme: system.theme,
  ramps: system.ramps,
  audits: system.audits,
  vars: variablesFor(system),
  building: false,
  versions: [],
  images: []
};

const browser = await launch(chromium);
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });

// gallery.js is not in this mirror and fonts need egress; neither says anything
// about the page's own code. Script faults still count.
const NOISE = /ERR_FILE_NOT_FOUND|ERR_TUNNEL_CONNECTION_FAILED|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED/;
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) errs.push(m.text()); });

await page.addInitScript((state) => {
  window.__STATE = state;
  window.fetch = (url) => {
    const u = String(url);
    let out = state;
    if (u.includes('/api/preview')) out = { theme: state.theme, ramps: state.ramps, audits: state.audits, vars: state.vars };
    if (u.includes('/api/versions')) out = { versions: [] };
    if (u.includes('/api/images')) out = { images: [] };
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve(out),
      text: () => Promise.resolve(JSON.stringify(out))
    });
  };
}, STATE);

await page.goto(PAGE);
await page.waitForFunction(() => document.querySelectorAll('#vp-list .vp-row').length > 0, null, { timeout: 8000 });

// The panel lives inside a closed accordion, and everything below is a real
// interaction rather than a DOM read, so the accordion has to be open the way a
// person would have opened it. Typing into a search box nobody can see would
// prove nothing about the panel working.
await page.evaluate(() => {
  const d = document.querySelector('#vp-list').closest('details');
  if (d) { d.open = true; d.scrollIntoView({ block: 'start' }); }
});
await page.waitForSelector('#vp-search', { state: 'visible', timeout: 5000 });

let fail = 0;
const check = (label, ok, got) => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : '   got: ' + JSON.stringify(got)}`);
  if (!ok) fail++;
};

const read = () => page.evaluate(() => {
  const rows = [...document.querySelectorAll('#vp-list .vp-row')];
  return {
    rows: rows.length,
    groups: [...document.querySelectorAll('#vp-list .vp-group-head')].map((h) => h.textContent),
    chips: [...document.querySelectorAll('#vp-chips .vp-chip')].map((c) => [
      c.firstChild.textContent, Number(c.querySelector('.n').textContent), c.classList.contains('on')
    ]),
    count: document.querySelector('#vp-count').textContent,
    // A swatch painting nothing means the panel looked a token up and missed.
    blankSwatches: rows.reduce((n, r) => n + [...r.querySelectorAll('.vp-sw i')]
      .filter((i) => getComputedStyle(i).backgroundColor === 'rgba(0, 0, 0, 0)').length, 0),
    // A recipe line that is present but blank is a bug. A row with no recipe
    // line at all is a hand-picked colour, and only allowed in the Chosen block.
    emptyRecipes: rows.filter((r) => {
      const rec = r.querySelector('.vp-recipe');
      return rec && !rec.textContent.trim();
    }).length,
    soloRows: rows.filter((r) => !r.querySelector('.vp-recipe')).length,
    soloOutsideChosen: [...document.querySelectorAll('#vp-list .vp-group')]
      .filter((g) => g.querySelector('.vp-group-head').textContent !== 'Chosen')
      .reduce((n, g) => n + [...g.querySelectorAll('.vp-row')]
        .filter((r) => !r.querySelector('.vp-recipe')).length, 0),
    solved: document.querySelectorAll('.vp-flag.solved').length,
    sample: (() => {
      const r = rows.find((x) => x.querySelector('.vp-name').title === 'primary-hover');
      return r && {
        name: r.querySelector('.vp-name').title,
        hex: r.querySelector('.vp-hex').textContent,
        recipe: r.querySelector('.vp-recipe').textContent,
        tip: r.querySelector('.vp-recipe').title
      };
    })(),
    empty: !!document.querySelector('.vp-empty')
  };
});

const all = await read();
console.log('AT REST\n  ', JSON.stringify({ rows: all.rows, groups: all.groups, count: all.count }));

const themeCount = Object.keys(system.theme.light).length;
const derivedCount = Object.keys(system.derived.light.recipes).length;

console.log('\nEVERY TOKEN IS PRESENT AND EXPLAINED');
check('one row per token in the theme', all.rows === themeCount, [all.rows, themeCount]);
check('no swatch fails to paint', all.blankSwatches === 0, all.blankSwatches);
check('no recipe line is left blank', all.emptyRecipes === 0, all.emptyRecipes);
check('every derived token carries its recipe', all.soloOutsideChosen === 0, all.soloOutsideChosen);
check('hand-picked tokens do not repeat themselves on a second line',
  all.soloRows === themeCount - derivedCount, [all.soloRows, themeCount - derivedCount]);
check('groups are in reading order',
  JSON.stringify(all.groups) === JSON.stringify(['Chosen', 'Surfaces', 'Borders', 'Fields', 'States', 'Soft variants']),
  all.groups);
check('the chip counts add up to the whole list',
  all.chips.slice(1).reduce((n, c) => n + c[1], 0) === all.rows, all.chips);
check('All is the chip that starts selected', all.chips[0][2] === true, all.chips[0]);
check('the count line names the derived half',
  all.count === `${themeCount} tokens, ${derivedCount} of them derived`, [all.count, themeCount, derivedCount]);
check('a derived row shows its recipe, not just its value',
  all.sample && all.sample.recipe.startsWith('primary 88% + primary-foreground 12%'), all.sample);
check('the tooltip carries the live color-mix expression',
  all.sample && all.sample.tip.includes('color-mix(in oklab, var(--primary) 88%'), all.sample && all.sample.tip);
check('a solved token is flagged as solved', all.solved > 0, all.solved);
check('primary-hover reads the light hex at rest',
  all.sample && all.sample.hex === system.theme.light['primary-hover'], all.sample);

console.log('\nSEARCH AND FILTER BITE');
await page.fill('#vp-search', 'soft-hover');
const s1 = await read();
check('search narrows the list', s1.rows > 0 && s1.rows < all.rows, s1.rows);
check('every survivor matches the query',
  await page.evaluate(() => [...document.querySelectorAll('#vp-list .vp-row')]
    .every((r) => (r.querySelector('.vp-name').title + (r.querySelector('.vp-recipe') || {}).textContent)
      .toLowerCase().includes('soft-hover'))), s1.rows);
check('the match is highlighted in the name',
  await page.evaluate(() => document.querySelectorAll('#vp-list .vp-name b').length) === s1.rows, s1.rows);
check('chips recount against the search, not the system',
  s1.chips.slice(1).reduce((n, c) => n + c[1], 0) === s1.rows, s1.chips);

await page.fill('#vp-search', 'zzzznothing');
const s2 = await read();
check('a query with no matches says so', s2.rows === 0 && s2.empty, [s2.rows, s2.empty]);

await page.fill('#vp-search', '');
const s3 = await read();
check('clearing search restores every row', s3.rows === all.rows, s3.rows);

// Chips filter, and clicking the selected one turns filtering off again.
await page.evaluate(() => [...document.querySelectorAll('#vp-chips .vp-chip')]
  .find((c) => c.firstChild.textContent === 'Soft variants').click());
const f1 = await read();
check('a chip filters to its group', f1.groups.length === 1 && f1.groups[0] === 'Soft variants', f1.groups);
check('the filtered count is stated against the whole',
  /^\d+ of \d+ tokens$/.test(f1.count), f1.count);
await page.evaluate(() => [...document.querySelectorAll('#vp-chips .vp-chip')]
  .find((c) => c.firstChild.textContent === 'Soft variants').click());
const f2 = await read();
check('clicking the live chip again clears the filter', f2.rows === all.rows, f2.rows);

console.log('\nTHE PANEL FOLLOWS THE MODE');
await page.click('#mode-dark');
const dk = await read();
check('the hex column switches to the dark value',
  dk.sample && dk.sample.hex === system.theme.dark['primary-hover'], dk.sample);
check('the row count does not change with the mode', dk.rows === all.rows, dk.rows);
await page.click('#mode-light');

console.log('\nCOPYING');
await page.evaluate(() => {
  window.__copied = null;
  navigator.clipboard.writeText = (t) => { window.__copied = t; return Promise.resolve(); };
  [...document.querySelectorAll('#vp-list .vp-row')]
    .find((r) => r.querySelector('.vp-name').title === 'primary-soft').click();
});
check('a row copies its var() reference',
  (await page.evaluate(() => window.__copied)) === 'var(--primary-soft)',
  await page.evaluate(() => window.__copied));

await page.screenshot({ path: scratch('vars.png'), clip: { x: 1440 - 348, y: 0, width: 348, height: 1000 } });

if (errs.length) { console.log('\nPAGE ERRORS:\n ', errs.join('\n  ')); fail++; }
console.log(fail ? `\nFAILURES: ${fail}` : '\nVARIABLES PANEL EXPLAINS EVERY TOKEN THE SYSTEM EMITS');
await browser.close();
process.exit(fail ? 1 : 0);
