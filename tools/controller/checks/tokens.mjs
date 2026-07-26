// Check on the derivation layer as the engine actually runs it. Reads the base
// and derived halves the engine kept apart, then prints the matrix size, every
// solve the walker had to make, and the pairings that still fail so nothing hides.
//
// It grades what computeSystem produced rather than re-deriving from the finished
// theme. Those are not the same thing now that derivation is wired in: the theme
// the engine returns already has the derived tokens merged into it, so feeding it
// back through deriveMode would report a 156-token matrix and call all 61 derived
// names collisions with base. Both would be artefacts of the harness.

import { loadBrand, computeSystem } from '../lib/engine.mjs';
import { mixOklab, overHex, recipeLabel } from '../lib/derive.mjs';
import { contrast } from '../lib/color.mjs';


const brand = loadBrand();
const sys = computeSystem(brand);
const ROLES = ['primary', 'secondary', 'tertiary', 'accent', 'muted', 'info', 'success', 'warning', 'error', 'destructive'];

console.log('preset:', brand.presetSlug, '| primary:', brand.primary);
console.log('base tokens:', Object.keys(sys.base.light).length);

console.log('\nMIXER (against Chrome)');
console.log('  oklab red->blue 50%   ', mixOklab('#ff0000', '#0000ff', 50), 'expect #8c53a2');
console.log('  oklab white->black 50%', mixOklab('#ffffff', '#000000', 50), 'expect #636363');
console.log('  100% / 0%             ', mixOklab('#ffffff', '#000000', 100), mixOklab('#ffffff', '#000000', 0));
console.log('  15% red over white    ', overHex('#ffffff', '#ff0000', 0.15), 'expect #ffd9d9');

let fail = 0;
for (const mode of ['light', 'dark']) {
  const base = sys.base[mode];
  const out = sys.derived[mode];
  const names = Object.keys(out.tokens);
  const all = sys.theme[mode];

  console.log(`\n=== ${mode.toUpperCase()} ===`);
  console.log('derived:', names.length, '| total matrix:', Object.keys(all).length);

  const bad = names.filter((n) => !/^#[0-9a-f]{6}$/.test(out.tokens[n]));
  const clash = names.filter((n) => base[n] != null);
  if (bad.length) { console.log('MALFORMED HEX:', bad); fail++; }
  if (clash.length) { console.log('CLASHES WITH BASE:', clash); fail++; }

  // No fill may paint the same pixel as the fill it derives from. Aliases are
  // exempt because a second name is the point, and soft foregrounds are exempt
  // because landing on the role colour is a correct answer for them; their real
  // test is the AA check further down.
  const STEP = { surface: 10, field: 10, border: 4, state: 6, soft: 6 };
  const dead = [];
  for (const n of names) {
    const r = out.recipes[n];
    // Soft fills are exempt: their contract is with the page, checked below, not
    // with the role they take their hue from. A soft grey is allowed to look
    // like the grey it came from.
    if (!r || r.kind === 'alias' || r.group === 'soft') continue;
    const src = all[r.from];
    if (!src) continue;
    // A wash made of the page itself is exempt, because it is never painted on
    // the page. The scrim is the case: it has to darken in both modes, so on a
    // black dark theme its ink is the background, and flattening it against the
    // background is asking what black over black looks like. What it actually
    // covers is the content underneath, and the live color-mix() is what does
    // that work.
    if (r.kind === 'wash' && src === all.background) continue;
    const A = out.tokens[n];
    const d = Math.max(...[1, 3, 5].map((i) =>
      Math.abs(parseInt(A.slice(i, i + 2), 16) - parseInt(src.slice(i, i + 2), 16))));
    if (d < (STEP[r.group] ?? 4)) dead.push(`${n} is ${d} from ${r.from}`);
  }
  console.log('steps too small to see:', dead.length, dead.length ? dead : '');
  if (dead.length) fail++;

  console.log('\n  solver moved off its nominal value:');
  const moved = out.audits.filter((a) => a.kind === 'step' || a.adjusted || a.note.includes('pulled back'));
  if (!moved.length) console.log('    (nothing)');
  for (const a of moved) {
    console.log(`    ${a.token.padEnd(28)} ${String(a.nominal).padStart(3)}% -> ${String(a.pct).padStart(3)}%   ${a.note}`);
  }

  console.log('\n  soft fills against the page (target 1.18 / 1.32):');
  for (const role of ['primary', 'tertiary', 'info', 'success', 'warning', 'error', 'destructive']) {
    const s = out.tokens[`${role}-soft`];
    const h = out.tokens[`${role}-soft-hover`];
    if (!s || !h) { console.log(`    ${role} MISSING soft pair`); fail++; continue; }
    const cs = contrast(s, base.background);
    const ch = contrast(h, base.background);
    const gap = Math.max(...[1, 3, 5].map((i) =>
      Math.abs(parseInt(s.slice(i, i + 2), 16) - parseInt(h.slice(i, i + 2), 16))));
    const bad = cs < 1.1 || ch <= cs || gap < 6;
    console.log(`    ${role.padEnd(13)} ${s} ${cs.toFixed(2)}   hover ${h} ${ch.toFixed(2)}   gap ${gap}${bad ? '   TOO FLAT' : ''}`);
    if (bad) fail++;
  }

  // Graded on the worse of the rest and hover fills, which is what the solver
  // itself now works to, so the ratio printed here is the one that has to clear AA.
  console.log('\n  soft foreground on its own soft fill (worse of rest / hover):');
  const softFg = out.audits.filter((x) => x.kind === 'contrast' && x.token.endsWith('-soft-foreground'));
  if (!softFg.length) { console.log('    (none reported, the audit shape moved)'); fail++; }
  for (const a of softFg) {
    console.log(`    ${a.token.padEnd(28)} ${String(a.ratio).padStart(5)}  ${a.aa ? 'AA' : 'FAIL'}${a.adjusted ? `  solved to ${a.pct}%` : ''}`);
    if (!a.aa) fail++;
  }

  console.log('\n  role foreground on rest / hover / active:');
  for (const role of ROLES) {
    const fg = base[`${role}-foreground`];
    if (!fg) continue;
    const r = (bg) => (bg ? Math.round(contrast(fg, bg) * 10) / 10 : null);
    const rest = r(base[role]);
    const hov = r(out.tokens[`${role}-hover`]);
    const act = r(out.tokens[`${role}-active`]);
    const broke = rest >= 4.5 && (hov < 4.5 || act < 4.5);
    console.log(
      `    ${role.padEnd(13)} rest ${String(rest).padStart(5)}  hover ${String(hov).padStart(5)}  active ${String(act).padStart(5)}` +
      `${broke ? '   REGRESSION' : rest < 4.5 ? '   (rest already below AA, seed colour)' : ''}`
    );
    if (broke) fail++;
  }

  console.log('\n  sample rows');
  for (const n of ['background-secondary', 'background-tertiary', 'surface-hover',
                   'border-secondary', 'border-tertiary', 'border-strong', 'separator',
                   'field-hover', 'field-border-hover', 'field-disabled',
                   'primary-hover', 'primary-active', 'primary-soft', 'primary-soft-hover',
                   'primary-soft-foreground', 'secondary-hover', 'accent-hover', 'muted-hover',
                   'success-soft', 'warning-soft', 'focus', 'focus-ring', 'overlay']) {
    if (!out.tokens[n]) { console.log(`    ${n.padEnd(26)} MISSING`); fail++; continue; }
    // A pinned token has no recipe left, on purpose, so print the literal it kept.
    const label = recipeLabel(out.recipes[n]) || 'pinned by hand';
    console.log(`    ${n.padEnd(26)} ${out.tokens[n]}  ${label.padEnd(36)} ${out.css[n] || out.tokens[n]}`);
  }
}

console.log(fail ? `\nFAILURES: ${fail}` : '\nALL CHECKS PASS');
