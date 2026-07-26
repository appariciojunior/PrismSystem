// Load the controller page in a real browser with the server stubbed, then drive the
// new Shape and Behaviour controls and read back what the preview actually computes.
//
// The point is not that the markup exists. It is that a brand which has not touched
// these settings computes exactly what it computed before, and that each control
// moves the preview once someone does touch it.

import path from 'path';
import { chromium } from 'playwright';
import { loadBrand, computeSystem } from '../lib/engine.mjs';
import { ROOT, scratch, launch } from './_shared.mjs';

const brand = loadBrand();
const system = computeSystem(brand);

const browser = await launch(chromium);
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
// Fonts come from the network and gallery.js is not in this mirror, so a failed
// subresource says nothing about the page's own code. Script faults still count.
const NOISE = /ERR_FILE_NOT_FOUND|ERR_TUNNEL_CONNECTION_FAILED|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED/;
page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) errs.push(m.text()); });

// The controller talks to a Node server on the Mac. Stand it in with the same shapes
// the real endpoints return so the page boots the way it does in use.
// The real endpoint returns the brand alongside the computed halves at the top
// level, which is the shape hydrate() reads.
const STATE = { brand, theme: system.theme, ramps: system.ramps, audits: system.audits, building: false, versions: [], images: [] };
await page.addInitScript(({ state }) => {
  const json = (b) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(b), text: () => Promise.resolve(JSON.stringify(b)) });
  window.fetch = (url) => {
    const u = String(url);
    if (u.includes('/api/state')) return json(state);
    if (u.includes('/api/preview')) return json(state);
    if (u.includes('/api/ping')) return json({ ok: true });
    if (u.includes('/api/versions')) return json({ versions: [] });
    if (u.includes('/api/design-language')) return json({ text: '' });
    return json({ ok: true });
  };
}, { state: STATE });

await page.goto('file://' + path.join(ROOT, 'tools/controller/public/index.html'));
await page.waitForTimeout(600);

const read = () => page.evaluate(() => {
  const pv = document.querySelector('#preview');
  const cs = getComputedStyle(pv);
  const input = document.querySelector('.pv-input');
  const ics = input ? getComputedStyle(input) : null;
  const active = (id) => {
    const seg = document.querySelector('#' + id);
    if (!seg) return null;
    const b = seg.querySelector('button.active');
    return b ? b.getAttribute('data-v') : null;
  };
  const sel = (id) => {
    const host = document.querySelector('#' + id);
    if (!host) return null;
    const items = [...host.querySelectorAll('.rad-item')];
    const i = items.findIndex((n) => n.classList.contains('sel'));
    return i < 0 ? null : items[i].textContent.replace('✓', '').trim();
  };
  return {
    bwField: cs.getPropertyValue('--bw-field').trim(),
    rField: cs.getPropertyValue('--r-field').trim(),
    disabled: cs.getPropertyValue('--disabled-opacity').trim(),
    skelAnim: cs.getPropertyValue('--skeleton-anim').trim(),
    skelSheen: cs.getPropertyValue('--skeleton-sheen').trim(),
    motion: pv.getAttribute('data-motion'),
    inputBorder: ics && ics.borderTopWidth,
    inputRadius: ics && ics.borderTopLeftRadius,
    segField: active('field-border-width'),
    segSkeleton: active('skeleton-style'),
    segMotion: active('motion-toggle'),
    radiusGeneral: sel('dd-radius'),
    radiusField: sel('dd-radius-field'),
    // brand lives inside the page's closure, so read the rail instead: Match being
    // the selected entry is the only observable that means "still null".
    matchField: active('field-border-width') === '',
    matchCorner: sel('dd-radius-field') === 'Match'
  };
});

const base = await read();
console.log('AT REST');
console.log('  ', JSON.stringify(base));

let fail = 0;
const check = (name, ok, got) => { console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : '   got ' + JSON.stringify(got)}`); if (!ok) fail++; };

console.log('\nDEFAULTS MUST MATCH WHAT THE COMPONENTS ALREADY DID');
const gbw = brand.borderWidth == null ? 1 : brand.borderWidth;
check('field border follows the general one', base.bwField === gbw + 'px', base.bwField);
check('field corner follows the general one', base.rField === (brand.radius * 8).toFixed(1) + 'px', base.rField);
check('disabled resolves to .5', base.disabled === '0.500', base.disabled);
check('skeleton is the pulse the component ships', base.skelAnim === 'pv-skel-pulse', base.skelAnim);
check('sweep is transparent at rest', base.skelSheen === '0', base.skelSheen);
check('motion on', base.motion === 'on', base.motion);
check('field width seg shows Match', base.segField === '', base.segField);
check('field corner list shows Match', base.radiusField === 'Match', base.radiusField);
check('rendered input keeps its border', base.inputBorder === gbw + 'px', base.inputBorder);

console.log('\nEACH CONTROL HAS TO BITE');
const click = async (sel) => { await page.click(sel); await page.waitForTimeout(120); };

await click('#field-border-width button[data-v="2"]');
let v = await read();
check('field border 2px', v.bwField === '2px' && v.inputBorder === '2px', [v.bwField, v.inputBorder]);
check('general corner untouched', v.rField === base.rField, v.rField);
await click('#field-border-width button[data-v=""]');
v = await read();
check('Match puts it back', v.bwField === gbw + 'px' && v.matchField, [v.bwField, v.matchField]);

await page.evaluate(() => {
  const items = [...document.querySelectorAll('#dd-radius-field .rad-item')];
  items[items.length - 1].click(); // Round
});
await page.waitForTimeout(120);
v = await read();
check('field corner moves on its own', v.rField === '16.0px' && v.inputRadius === '16px', [v.rField, v.inputRadius]);
check('general corner stays put', v.radiusGeneral === base.radiusGeneral, v.radiusGeneral);
await page.evaluate(() => document.querySelector('#dd-radius-field .rad-item').click());
await page.waitForTimeout(120);
v = await read();
check('Match puts the corner back', v.rField === base.rField && v.matchCorner, [v.rField, v.matchCorner]);

await page.evaluate(() => {
  const s = document.querySelector('#disabled-opacity');
  s.value = '25';
  s.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.waitForTimeout(120);
v = await read();
check('disabled fade follows the slider', v.disabled === '0.250', v.disabled);

await click('#skeleton-style button[data-v="shimmer"]');
v = await read();
check('shimmer names its own keyframes and lifts the sweep', v.skelAnim === 'pv-skel-shimmer' && v.skelSheen === '12', [v.skelAnim, v.skelSheen]);
await click('#skeleton-style button[data-v="none"]');
v = await read();
check('none stops it', v.skelAnim === 'none', v.skelAnim);

await click('#motion-toggle button[data-v="off"]');
v = await read();
const stilled = await page.evaluate(() => {
  const s = document.querySelector('#preview .pv-skel') || document.querySelector('#preview .pv-card');
  return s ? parseFloat(getComputedStyle(s).transitionDuration) : null;
});
check('motion off stills the preview', v.motion === 'off' && (stilled === null || stilled < 0.001), [v.motion, stilled]);

if (errs.length) { console.log('\nPAGE ERRORS:\n  ' + errs.join('\n  ')); fail++; }
console.log(fail ? `\nFAILURES: ${fail}` : '\nRAIL IS A NO-OP AT DEFAULTS AND LIVE WHEN CHANGED');
await page.screenshot({ path: scratch('rail.png'), fullPage: false });
await browser.close();
process.exit(fail ? 1 : 0);
