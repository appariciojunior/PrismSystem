// The few things every check in this folder needs, in one place: where the repo
// is, where to put the scratch files a check writes while it runs, and how to
// get a browser without each script guessing at a path.

import fs from 'fs';
import path from 'path';

/** The repo root, from this file's own location rather than the caller's cwd. */
export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');

const OUT = path.join(ROOT, 'tools/controller/checks/.out');

/**
 * A path inside the checks' own scratch folder. The probes here write real HTML
 * files and screenshots because that is the only way to ask a browser what a
 * stylesheet computes to, and none of that belongs in the repo, so it all lands
 * in one ignored folder rather than scattered across the root.
 */
export function scratch(name) {
  fs.mkdirSync(OUT, { recursive: true });
  return path.join(OUT, name);
}

/**
 * Chromium, wherever this happens to be running.
 *
 * On a normal machine Playwright knows where its own browser is and the bare
 * launch works. In a sandbox with a pre-installed browser it does not, so
 * PRISM_CHROMIUM points at one. Either way, a missing browser is a setup
 * problem with a one-line fix, and saying so beats a stack trace about a
 * path nobody chose.
 */
export async function launch(chromium) {
  const exe = process.env.PRISM_CHROMIUM;
  try {
    return await chromium.launch(exe ? { executablePath: exe } : {});
  } catch (err) {
    throw new Error(
      `could not start Chromium: ${err.message}\n` +
      'These checks read what a browser actually computes, so they need one.\n' +
      'Install it once with:  npx playwright install chromium\n' +
      'Or point PRISM_CHROMIUM at a Chromium binary you already have.'
    );
  }
}
