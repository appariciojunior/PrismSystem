/**
 * Smoke test for the design suite MCP tools.
 * Run: node packages/tokens/mcp-server/test/design-smoke.mjs
 */
const { designRules } = await import('../tools/design-rules.js');
const { designScore } = await import('../tools/design-score.js');
const { designRoute } = await import('../tools/design-route.js');
const { corpusStatus } = await import('../tools/corpus-status.js');

let pass = 0;
let fail = 0;
function check(label, cond, detail = '') {
  if (cond) {
    pass++;
    console.log(`  ✅ ${label}`);
  } else {
    fail++;
    console.log(`  ❌ ${label} ${detail}`);
  }
}

console.log('design_rules');
const all = designRules({ category: 'all' });
check('parses ~56 rules', all.rule_count_total >= 50, `got ${all.rule_count_total}`);
check('8 categories', all.categories.length === 8);
const spc = designRules({ category: 'SPC' });
check('filters SPC', spc.rules.length > 0 && spc.rules.every((r) => r.category === 'SPC'));
const one = designRules({ ruleId: 'DS-BRD-01' });
check('fetches DS-BRD-01', one.rules.length === 1 && one.rules[0].id === 'DS-BRD-01');

console.log('design_score');
// Reproduce the Home page v2 structural score: TYP-04 error, TYP-03 warning, COL-06 warning, SPC-08 info → 91
const hp = designScore({
  findings: [
    { ruleId: 'DS-TYP-04', severity: 'error' },
    { ruleId: 'DS-TYP-03', severity: 'warning' },
    { ruleId: 'DS-COL-06', severity: 'warning' },
    { ruleId: 'DS-SPC-08', severity: 'info' }
  ]
});
check('homepage structural score = 91', hp.score === 91, `got ${hp.score}`);
check('band ship-ready', hp.band === 'ship-ready');
check('TYP subscore 93', hp.subscores.TYP === 93, `got ${hp.subscores.TYP}`);
check('COL subscore 98', hp.subscores.COL === 98, `got ${hp.subscores.COL}`);
const perfect = designScore({ findings: [] });
check('no findings = 100', perfect.score === 100);
const capped = designScore({
  findings: Array.from({ length: 10 }, () => ({ ruleId: 'DS-CMP-01', severity: 'error' }))
});
check('per-category cap 30 → subscore 70', capped.subscores.CMP === 70, `got ${capped.subscores.CMP}`);
const invented = designScore({ findings: [{ ruleId: 'DS-XYZ-99', severity: 'error' }] });
check('flags invented rule id', invented.unknown_rules.includes('DS-XYZ-99'));

console.log('design_route');
check('live-blog → new-experience', designRoute({ request: 'design a new live blog experience' }).route === 'new-experience');
check('critique → ui-craft', designRoute({ request: 'critique this frame, check spacing and contrast' }).route === 'ui-craft');
check('handoff → handoff', designRoute({ request: 'this is ready for engineering, produce the spec' }).route === 'handoff');
check('screenshots → corpus-distill', designRoute({ request: 'learn from these screenshots' }).route === 'corpus-distill');
check('empty → no route', designRoute({ request: '' }).error !== undefined);
check('new-experience sequence includes flow-design', designRoute({ request: 'create a new onboarding flow' }).sequence.includes('design/ux/flow-design'));

console.log('corpus_status');
const cs = corpusStatus();
check('corpus exists', cs.exists === true);
check('reports a version', typeof cs.corpus_version === 'number');
check('lists distilled docs', Array.isArray(cs.distilled_docs) && cs.distilled_docs.length > 0);

console.log(`\n${fail === 0 ? '✅' : '❌'} design tools: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
