/**
 * Design Route Tool
 * Skill: design/design-router.md
 *
 * Heuristic pre-classifier for the /design entry point. Given a request in plain
 * language, score it against the five routes and return the best route plus the
 * canonical skill sequence for it. Deterministic keyword scoring — the router
 * skill still does the real, context-aware routing; this gives it a fast first
 * pass and the fixed sequence so every surface composes the same chain.
 */

const ROUTES = {
  prototype: {
    keywords: ['prototype', 'mock', 'mockup', 'quick', 'first pass', 'explore', 'try ', 'idea', 'sketch', 'rough'],
    sequence: ['design/foundation/design-dna', 'design/agents/prototyping-agent'],
    note: 'Early exploration. The prototyping-agent loads the DNA and reaches for token and state skills as needed.'
  },
  'ui-craft': {
    keywords: ['critique', 'check', 'review', 'is this', 'tokens', 'spacing', 'contrast', 'accessibility', 'a11y', 'states', 'audit', 'fix', 'polish', 'improve', 'frame', 'score'],
    sequence: [
      'design/foundation/design-dna',
      'design/ui/design-critique',
      'design/ui/a11y-check',
      'design/ui/content-style-check',
      'design/ui/token-mapping-audit'
    ],
    note: 'Scope to what the request asks for. The full battery is design/agents/critique-agent.'
  },
  'new-experience': {
    keywords: ['new ', 'design a', 'flow', 'journey', 'create', 'experience', 'page type', 'onboarding', 'paywall', 'live blog', 'live-blog', 'live-updating', 'feature', "don't have", 'do not have'],
    sequence: [
      'design/foundation/design-dna',
      'design/ux/experience-principles',
      'design/ux/flow-design',
      'design/ux/page-templates',
      'design/ui/design-critique',
      'design/handoff/handoff-flow'
    ],
    note: 'flow-design grounds in Mobbin and the corpus and writes .design/<feature>/FLOW.md.'
  },
  handoff: {
    keywords: ['handoff', 'hand off', 'hand-off', 'spec', 'ready for engineering', 'engineering', 'packet', 'ship it', 'developer'],
    sequence: ['design/foundation/design-dna', 'design/handoff/handoff-flow'],
    note: 'Ends in .design/<feature>/PACKET.md. Use design/agents/handoff-agent to run it end to end.'
  },
  'corpus-distill': {
    keywords: ['screenshot', 'screenshots', 'corpus', 'learn how', 'learn from', 'distil', 'distill', 'drop these', 'these images', 'these screens'],
    sequence: ['design/corpus/distill-corpus'],
    note: 'Drop images in design-corpus/raw/inbox/ first; distill-corpus classifies, files and distils them.'
  }
};

/**
 * @param {object} args
 * @param {string} args.request the designer's ask in plain language
 */
export function designRoute({ request = '' } = {}) {
  const q = String(request).toLowerCase();
  if (!q.trim()) {
    return {
      error: 'empty request',
      routes: Object.keys(ROUTES),
      guidance: 'Describe the design task in a sentence; the router classifies it into one of five routes.'
    };
  }

  const scores = {};
  const hits = {};
  for (const [route, def] of Object.entries(ROUTES)) {
    let score = 0;
    const matched = [];
    for (const kw of def.keywords) {
      if (q.includes(kw)) {
        score += 1;
        matched.push(kw.trim());
      }
    }
    scores[route] = score;
    hits[route] = matched;
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topRoute, topScore] = ranked[0];
  const [, secondScore] = ranked[1] || [null, 0];

  // No signal, or a genuine tie between the top two → the skill must decide.
  const ambiguous = topScore === 0 || topScore === secondScore;
  const route = topScore === 0 ? null : topRoute;

  return {
    route,
    confidence: topScore === 0 ? 'none' : ambiguous ? 'low' : topScore >= 3 ? 'high' : 'medium',
    ambiguous,
    scores,
    matched_keywords: hits,
    sequence: route ? ROUTES[route].sequence : [],
    note: route ? ROUTES[route].note : 'No clear signal. The design-router skill should ask one clarifying question.',
    all_routes: Object.fromEntries(Object.entries(ROUTES).map(([r, d]) => [r, d.sequence])),
    reminder: 'Heuristic only. design/design-router.md does the context-aware routing and loads the DNA first.'
  };
}
