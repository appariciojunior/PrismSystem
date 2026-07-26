// Run the lot, in one go, and say what happened.
//
// Each script here answers a different question and each one exits non-zero when
// its answer is wrong, so running them is really just a matter of running them.
// What this adds is an order, a summary you can read at a glance, and an honest
// account of anything that did not run.
//
//   node tools/controller/checks/run.mjs              every check
//   node tools/controller/checks/run.mjs tokens       just the ones you name
//
// The cheap ones go first. If the engine's own maths is wrong there is no point
// spending thirty seconds of browser time confirming that a browser agrees.

import path from 'path';
import { spawnSync } from 'child_process';
import { ROOT, launch } from './_shared.mjs';

// script, what it answers, whether it needs a browser, and how to invoke it.
//
// audit.mjs takes a mode and defaults to light, so it appears twice. Running it
// once would leave the dark theme unaudited while the summary still read as a
// clean sweep, and dark is where the ramp inverts and the awkward pairings live.
const CHECKS = [
  { script: 'tokens', what: 'Every derived token is what its recipe says it is' },
  { script: 'gallery', what: 'The gallery is token-clean, with no stray literals' },
  { script: 'browser', what: 'Chromium resolves the same colours the engine computed', browser: true },
  { script: 'behaviour', what: 'The behaviour layer is a no-op until something is changed', browser: true },
  { script: 'variables', what: 'The variables panel explains every token the system emits', browser: true },
  { script: 'rail', what: 'The rail is a no-op until something is changed', browser: true },
  { script: 'audit', args: ['light'], what: 'The light audit still renders and nothing regressed', browser: true },
  { script: 'audit', args: ['dark'], what: 'The dark audit still renders and nothing regressed', browser: true }
].map((c) => ({ ...c, args: c.args || [], name: [c.script, ...(c.args || [])].join(' ') }));

const here = path.dirname(new URL(import.meta.url).pathname);
const asked = process.argv.slice(2).filter((a) => !a.startsWith('-'));
// Naming a script runs every variant of it, so `run.mjs audit` covers both modes.
const wanted = (c) => asked.includes(c.script) || asked.includes(c.name);
const unknown = asked.filter((a) => !CHECKS.some((c) => c.script === a || c.name === a));
if (unknown.length) {
  console.error(`no such check: ${unknown.join(', ')}`);
  console.error(`there is: ${[...new Set(CHECKS.map((c) => c.script))].join(', ')}`);
  process.exit(2);
}
const queue = asked.length ? CHECKS.filter(wanted) : CHECKS;

// Most of these drive a real browser, because a stylesheet only means something
// once something has resolved it. Playwright is a devDependency so normally it
// is simply there, but the package and the browser it drives are two separate
// installs and a fresh clone often has one without the other.
//
// Either way it is a setup fact rather than a regression, so it is worth finding
// out once, here, instead of watching six scripts die with the same stack trace
// and calling that six failures. The ones that need nothing still run and still
// catch a broken import, which is most of what this is for.
const noBrowser = await (async () => {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    return 'playwright is not installed';
  }
  try {
    const probe = await launch(chromium);
    await probe.close();
    return null;
  } catch (err) {
    return String(err.message).split('\n')[0];
  }
})();

// Colour when a person is watching, plain text when this is being piped into a
// log or a CI transcript, where escape codes are just litter.
const tint = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (tint ? `\u001b[${code}m${s}\u001b[0m` : s);
const rule = (label) => c('1', `── ${label} ${'─'.repeat(Math.max(0, 64 - label.length))}`);

const results = [];
for (const { script, args, name, what, browser } of queue) {
  if (browser && noBrowser) {
    results.push({ name, what, state: 'skipped', ms: 0 });
    continue;
  }
  console.log('\n' + rule(name));
  console.log(`   ${what}\n`);
  const began = Date.now();
  const run = spawnSync(process.execPath, [path.join(here, `${script}.mjs`), ...args], {
    stdio: 'inherit',
    cwd: ROOT
  });
  results.push({
    name, what, ms: Date.now() - began,
    state: run.status === 0 ? 'passed' : 'failed'
  });
}

const mark = { passed: c('32', 'pass'), failed: c('31', 'FAIL'), skipped: c('33', 'skip') };
console.log('\n' + rule('summary'));
for (const r of results) {
  const time = r.state === 'skipped' ? '' : `${(r.ms / 1000).toFixed(1)}s`;
  console.log(`  ${mark[r.state]}  ${r.name.padEnd(14)} ${time.padStart(7)}   ${r.what}`);
}

const failed = results.filter((r) => r.state === 'failed');
const skipped = results.filter((r) => r.state === 'skipped');
if (skipped.length) {
  console.log(
    `\n  ${skipped.length} check${skipped.length > 1 ? 's' : ''} did not run. They drive a real browser, and\n` +
    `  ${noBrowser}\n` +
    '  To run them:  npm i -D playwright && npx playwright install chromium'
  );
}
console.log(failed.length
  ? '\n' + c('31', `${failed.length} CHECK${failed.length > 1 ? 'S' : ''} FAILED: ${failed.map((r) => r.name).join(', ')}`)
  : '\n' + c('32', `ALL ${results.length - skipped.length} CHECKS PASS`));
process.exit(failed.length ? 1 : 0);
