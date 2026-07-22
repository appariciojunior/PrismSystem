/**
 * Design Score Tool
 * Skill: design/ui/design-critique.md, design/ui/monthly-audit.md
 *
 * Compute the 0-100 design score from a list of findings, using the formula in
 * design/foundation/design-rules.md. Deterministic: this is the scoring maths as
 * a function, so every agent scores a critique identically. It does NOT produce
 * findings (that is the critique skill's LLM work); it only scores them.
 */
import { designRules } from './design-rules.js';

const WEIGHTS = { error: 5, warning: 2, info: 0 };
const CAP = 30;

function band(score) {
  if (score >= 90) return 'ship-ready';
  if (score >= 75) return 'minor-fixes';
  if (score >= 50) return 'needs-work';
  return 'rework';
}

/**
 * @param {object} args
 * @param {Array<{ruleId?:string, category?:string, severity?:string}>} args.findings
 *   Each finding needs a category (or a ruleId to derive it) and a severity.
 *   If severity is omitted but ruleId is given, it is looked up from the rule set.
 * @param {string[]} [args.assessedCategories] categories in scope (default: all that appear)
 */
export function designScore({ findings = [], assessedCategories = null } = {}) {
  if (!Array.isArray(findings)) {
    return { error: 'findings must be an array of { ruleId|category, severity }' };
  }

  // Build a ruleId → {category, severity} index for lookups / validation.
  const ruleIndex = {};
  try {
    for (const r of designRules({ category: 'all' }).rules) ruleIndex[r.id] = r;
  } catch {
    /* rules unreadable: proceed with caller-supplied fields only */
  }

  const deductions = {}; // category → summed weight (pre-cap)
  const counts = { error: 0, warning: 0, info: 0 };
  const unknownRules = [];
  const seenCategories = new Set();

  for (const f of findings) {
    let category = (f.category || '').toUpperCase();
    let severity = (f.severity || '').toLowerCase();

    if (f.ruleId) {
      const rid = f.ruleId.toUpperCase();
      const known = ruleIndex[rid];
      if (known) {
        category = category || known.category;
        severity = severity || known.severity;
      } else {
        unknownRules.push(f.ruleId);
        category = category || (rid.split('-')[1] || 'UNKNOWN');
      }
    }
    if (!category) category = 'UNKNOWN';
    if (!(severity in WEIGHTS)) severity = 'info';

    seenCategories.add(category);
    counts[severity] += 1;
    deductions[category] = (deductions[category] || 0) + WEIGHTS[severity];
  }

  const cats = assessedCategories
    ? assessedCategories.map((c) => c.toUpperCase())
    : [...seenCategories];

  const subscores = {};
  let totalDeduction = 0;
  for (const c of cats) {
    const capped = Math.min(CAP, deductions[c] || 0);
    subscores[c] = Math.max(0, 100 - capped);
    totalDeduction += capped;
  }

  const overall = Math.max(0, 100 - totalDeduction);

  return {
    score: overall,
    band: band(overall),
    subscores,
    counts,
    assessed_categories: cats,
    findings_scored: findings.length,
    weights: WEIGHTS,
    per_category_cap: CAP,
    unknown_rules: unknownRules,
    note:
      unknownRules.length > 0
        ? 'Some ruleIds are not in design-rules.md; they were scored by ID prefix but flag a possible invented ID.'
        : 'All findings mapped to known rule categories.'
  };
}
