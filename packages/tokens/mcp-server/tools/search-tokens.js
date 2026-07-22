import { getCachedSetIndex } from './token-utils.js';
import { getHex, isDbPopulated } from './hex-db.js';

const INTENT_MAP = {
  danger: ['negative', 'error', 'destructive', 'critical', 'alert'],
  warning: ['warning', 'caution', 'amber'],
  success: ['positive', 'success', 'confirm'],
  info: ['information', 'info', 'notice'],
  subtle: ['secondary', 'tertiary', 'quiet', 'muted'],
  primary: ['primary', 'brand', 'default'],
  link: ['interactive.link', 'underline', 'link'],
  button: ['interactive.primary', 'interactive.secondary', 'button'],
  surface: ['surface', 'background', 'canvas', 'level'],
  text: ['text', 'label', 'copy', 'typography']
};

function tokenize(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9./_\-\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function expandQueryTerms(query) {
  const terms = new Set(tokenize(query));

  for (const term of [...terms]) {
    if (INTENT_MAP[term]) {
      for (const synonym of INTENT_MAP[term]) {
        terms.add(synonym);
      }
    }
  }

  return [...terms];
}

function scoreToken(token, setName, terms) {
  const haystack =
    `${setName} ${token.path} ${token.type || ''} ${token.description || ''}`.toLowerCase();

  let score = 0;
  const reasons = [];

  for (const term of terms) {
    if (!term) continue;

    if (token.path.toLowerCase().includes(term)) {
      score += 4;
      reasons.push(`path matches '${term}'`);
      continue;
    }

    if (haystack.includes(term)) {
      score += 2;
      reasons.push(`metadata matches '${term}'`);
    }
  }

  if (token.path.includes('interactive.') && terms.includes('button')) {
    score += 3;
    reasons.push('interactive token boosted for button intent');
  }

  return { score, reasons };
}

export async function searchTokens({
  intent,
  mode = 'all',
  maxResults = 15,
  includeRawMatches = false,
  tokenTypes = [],
  pathStartsWith = ''
}) {
  const setIndex = getCachedSetIndex();
  const terms = expandQueryTerms(intent);
  const candidates = [];
  const normalizedTypes = new Set(
    tokenTypes.map((t) => String(t).toLowerCase())
  );
  const normalizedPathPrefix = String(pathStartsWith || '').toLowerCase();

  for (const { setName, tokens } of setIndex) {
    if (mode === 'light' && setName.startsWith('dark/')) continue;
    if (mode === 'dark' && setName.startsWith('light/')) continue;

    for (const token of tokens) {
      if (normalizedTypes.size > 0) {
        const tokenType = String(token.type || '').toLowerCase();
        if (!normalizedTypes.has(tokenType)) continue;
      }

      if (
        normalizedPathPrefix &&
        !token.path.toLowerCase().startsWith(normalizedPathPrefix)
      ) {
        continue;
      }

      const { score, reasons } = scoreToken(token, setName, terms);
      if (score <= 0) continue;

      candidates.push({
        set: setName,
        path: token.path,
        value: token.value,
        type: token.type,
        description: token.description,
        score,
        reasons
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));

  const top = candidates.slice(0, Math.max(1, Math.min(maxResults, 50)));

  return {
    intent,
    expandedTerms: terms,
    mode,
    filters: {
      tokenTypes,
      pathStartsWith
    },
    totalMatches: candidates.length,
    recommendations: top.map((entry, idx) => {
      const rec = {
        rank: idx + 1,
        set: entry.set,
        tokenPath: `${entry.set}.${entry.path}`,
        value: entry.value,
        type: entry.type,
        description: entry.description || null,
        confidence: Math.min(100, 35 + entry.score * 6),
        why: [...new Set(entry.reasons)].slice(0, 3)
      };

      // Append resolved hex for colour tokens when DB is populated
      if (entry.type === 'color' && isDbPopulated()) {
        const lightHex = getHex(entry.path, 'light');
        const darkHex = getHex(entry.path, 'dark');
        const resolvedHex = {};
        if (lightHex != null) resolvedHex.light = lightHex;
        if (darkHex != null) resolvedHex.dark = darkHex;
        if (Object.keys(resolvedHex).length > 0) rec.resolvedHex = resolvedHex;
      }

      return rec;
    }),
    rawMatchesIncluded: includeRawMatches,
    rawMatches: includeRawMatches ? candidates.slice(0, 100) : undefined
  };
}
