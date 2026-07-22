/**
 * Design Rules Tool
 * Skill: design/foundation/design-rules.md
 *
 * Serve the Design System rule set (8 categories, ~56 rules) and the
 * scoring formula, parsed from the canonical design-rules.md so the tool never
 * drifts from the skill. Deterministic: reads and parses markdown tables.
 */
import { readFileSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RULES_PATH = resolve(
  __dirname,
  '../../.agents/skills/design/foundation/design-rules.md'
);

const CATEGORIES = ['TYP', 'COL', 'SPC', 'CMP', 'A11Y', 'UX', 'MOT', 'BRD'];
const WEIGHTS = { error: 5, warning: 2, info: 0 };
const PER_CATEGORY_CAP = 30;

let cache = { mtimeMs: -1, rules: null };

/** Parse every `| DS-XXX-## | rule | severity | source | enforced by |` row. */
function loadRules() {
  const mtimeMs = statSync(RULES_PATH).mtimeMs;
  if (cache.rules && cache.mtimeMs === mtimeMs) return cache.rules;

  const text = readFileSync(RULES_PATH, 'utf-8');
  const rules = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^\|\s*(DS-[A-Z0-9]+-\d+)\s*\|(.+)$/);
    if (!m) continue;
    const id = m[1];
    const cells = m[2].split('|').map((c) => c.trim());
    // cells: [rule, severity, source, enforced by]
    const [rule, severity, source, enforcedBy] = cells;
    const category = id.split('-')[1];
    rules.push({
      id,
      category,
      rule: rule || '',
      severity: (severity || '').toLowerCase(),
      source: source || '',
      enforced_by: enforcedBy || ''
    });
  }
  cache = { mtimeMs, rules };
  return rules;
}

/**
 * @param {object} args
 * @param {string} [args.category] one of TYP|COL|SPC|CMP|A11Y|UX|MOT|BRD|all
 * @param {string} [args.ruleId]  a single rule id to fetch
 * @param {string} [args.severityFloor] info|warning|error
 */
export function designRules({ category = 'all', ruleId = '', severityFloor = 'info' } = {}) {
  let rules;
  try {
    rules = loadRules();
  } catch (err) {
    return { error: `Could not read design-rules.md: ${err.message}`, rulesPath: RULES_PATH };
  }

  const floorRank = { info: 0, warning: 1, error: 2 };
  const floor = floorRank[severityFloor] ?? 0;

  let filtered = rules.filter((r) => (floorRank[r.severity] ?? 0) >= floor);
  if (ruleId) filtered = filtered.filter((r) => r.id === ruleId.toUpperCase());
  else if (category && category !== 'all') {
    const cat = category.toUpperCase();
    filtered = filtered.filter((r) => r.category === cat);
  }

  return {
    rule_count_total: rules.length,
    returned: filtered.length,
    categories: CATEGORIES,
    scoring: {
      weights: WEIGHTS,
      per_category_cap: PER_CATEGORY_CAP,
      formula:
        'overall = max(0, 100 - Σ per-category deductions); deduction = min(30, Σ finding weights); subscore = max(0, 100 - deduction)',
      bands: { 'ship-ready': '90-100', 'minor-fixes': '75-89', 'needs-work': '50-74', rework: '0-49' }
    },
    rules: filtered
  };
}
