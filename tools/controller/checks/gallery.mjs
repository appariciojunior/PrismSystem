// Every colour the gallery paints with should be a token the engine actually
// emits. A var() that resolves to nothing does not throw, it just draws the
// fallback or nothing at all, so a typo here is invisible until someone
// screenshots the wrong page. This walks the stylesheet and refuses anything
// it cannot account for.

import fs from 'fs';
import path from 'path';
import { loadBrand, computeSystem } from '../lib/engine.mjs';
import { ROOT } from './_shared.mjs';

const css = fs.readFileSync(path.join(ROOT, 'tools/controller/public/gallery.css'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'tools/controller/public/index.html'), 'utf8');
const system = computeSystem(loadBrand());

// Anything the theme emits, anything the app shell declares for its own chrome,
// and anything the gallery declares itself.
const theme = new Set(Object.keys(system.theme.light));
const declared = new Set();
for (const m of (html + css).matchAll(/(^|[;{\s])(--[a-z0-9-]+)\s*:/gi)) declared.add(m[2]);
// The typography and radius variables are pushed onto #preview from script
// rather than written in a stylesheet, so a plain declaration scan misses them.
for (const m of html.matchAll(/setProperty\(\s*['"](--[a-z0-9-]+)['"]/gi)) declared.add(m[1]);

// Used with a fallback is a deliberate "this may not exist" and is left alone.
const used = new Map();
for (const m of css.matchAll(/var\(\s*(--[a-z0-9-]+)\s*([,)])/gi)) {
  const [, name, next] = m;
  if (next === ',') continue;
  const line = css.slice(0, m.index).split('\n').length;
  if (!used.has(name)) used.set(name, line);
}

const orphans = [...used].filter(([n]) => !theme.has(n.slice(2)) && !declared.has(n));
const fromTheme = [...used].filter(([n]) => theme.has(n.slice(2)));

console.log(`gallery.css references ${used.size} custom properties`);
console.log(`  ${fromTheme.length} are tokens the engine emits`);
console.log(`  ${used.size - fromTheme.length} are app-shell or gallery-local`);

// The point of Phase 2 was that the gallery stops inventing colours. Two mixes
// are allowed to remain and both are named here so a third cannot creep in.
const ALLOWED_MIX = [
  /--skeleton-sheen/,                 // sheen is a number the brand sets, not a colour
  /--primary-foreground\) 35%/         // spinner ink on a filled button; no token describes ink-on-a-role
];
const mixes = [...css.matchAll(/^.*color-mix\([^\n]*$/gm)].map((m) => m[0].trim());
const stray = mixes.filter((l) => !ALLOWED_MIX.some((re) => re.test(l)));

let fail = 0;
const check = (label, ok, got) => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : '   got: ' + JSON.stringify(got, null, 1)}`);
  if (!ok) fail++;
};

console.log('\nTHE GALLERY PAINTS WITH THE SYSTEM, NOT AROUND IT');
check('every var() resolves to something that exists', orphans.length === 0, orphans);
check('no colour is mixed by hand except the two that must be', stray.length === 0, stray);
check('the new state and soft tokens are actually in use',
  ['--focus-ring', '--overlay', '--primary-soft', '--primary-soft-foreground', '--muted-hover',
   '--primary-hover', '--border-strong', '--destructive-soft', '--success-soft']
    .filter((n) => !used.has(n)).length === 0,
  ['--focus-ring', '--overlay', '--primary-soft', '--primary-soft-foreground', '--muted-hover',
   '--primary-hover', '--border-strong', '--destructive-soft', '--success-soft'].filter((n) => !used.has(n)));

console.log(fail ? `\nFAILURES: ${fail}` : '\nGALLERY IS TOKEN-CLEAN');
process.exit(fail ? 1 : 0);
