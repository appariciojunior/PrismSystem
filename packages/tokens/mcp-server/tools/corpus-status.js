/**
 * Corpus Status Tool
 * Skill: design/corpus/distill-corpus.md, design/foundation/corpus-guide.md
 *
 * Report the state of the design corpus: version, screen counts by surface /
 * channel / journey, and which distilled documents exist. Deterministic: reads
 * the manifest and VERSION.md. Skills call this before citing corpus evidence.
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CORPUS_ROOT = resolve(__dirname, '../../../../design-corpus');
const MANIFEST_PATH = resolve(CORPUS_ROOT, 'manifest/corpus-manifest.json');
const DISTILLED_DIR = resolve(CORPUS_ROOT, 'distilled');

function countBy(arr, key) {
  const out = {};
  for (const item of arr) {
    const v = item[key] || 'unknown';
    out[v] = (out[v] || 0) + 1;
  }
  return out;
}

function listDistilled() {
  if (!existsSync(DISTILLED_DIR)) return [];
  const docs = [];
  for (const entry of readdirSync(DISTILLED_DIR, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.md')) docs.push(entry.name);
    else if (entry.isDirectory()) {
      const sub = resolve(DISTILLED_DIR, entry.name);
      for (const f of readdirSync(sub)) {
        if (f.endsWith('.md')) docs.push(`${entry.name}/${f}`);
      }
    }
  }
  return docs.sort();
}

export function corpusStatus() {
  if (!existsSync(MANIFEST_PATH)) {
    return {
      exists: false,
      corpus_version: null,
      total_screens: 0,
      note: 'No corpus manifest found. The corpus has not been scaffolded, or the path is wrong.',
      manifestPath: MANIFEST_PATH
    };
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
  } catch (err) {
    return { exists: true, error: `Manifest is not valid JSON: ${err.message}`, manifestPath: MANIFEST_PATH };
  }

  const screens = Array.isArray(manifest.screens) ? manifest.screens : [];
  const distilled = listDistilled();

  return {
    exists: true,
    corpus_version: manifest.corpus_version ?? 0,
    total_screens: screens.length,
    empty: screens.length === 0,
    by_surface: countBy(screens, 'surface'),
    by_channel: countBy(screens, 'channel'),
    by_journey: countBy(screens, 'journey'),
    distilled_docs: distilled,
    citation_reminder:
      'Cite corpus evidence as design-corpus/distilled/<doc>#<anchor> (corpus vN). Never cite without a version. See design/foundation/corpus-guide.md.',
    next_step:
      screens.length === 0
        ? 'Drop screenshots in design-corpus/raw/inbox/ and run the distill-corpus skill to create corpus v1.'
        : `Corpus has ${screens.length} screens at v${manifest.corpus_version ?? 0}.`
  };
}
