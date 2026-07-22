import { buildSemanticDiscoveryEntries } from './discovery-utils.js';

function tokenize(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9./_\-\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function scoreEntry(entry, terms, categoryFilter) {
  const reasons = [];
  let score = 0;

  const path = entry.tokenPath.toLowerCase();
  const description = String(entry.description || '').toLowerCase();
  const aliases = (entry.aliases || []).map((a) => String(a).toLowerCase());

  for (const term of terms) {
    if (!term) continue;

    if (path.includes(term)) {
      score += 6;
      reasons.push(`path contains '${term}'`);
      continue;
    }

    if (aliases.some((a) => a.includes(term))) {
      score += 4;
      reasons.push(`alias matches '${term}'`);
      continue;
    }

    if (description.includes(term)) {
      score += 3;
      reasons.push(`description contains '${term}'`);
    }
  }

  if (
    categoryFilter.length > 0 &&
    categoryFilter.includes(entry.category.toLowerCase())
  ) {
    score += 2;
    reasons.push(`category boosted: ${entry.category}`);
  }

  return {
    score,
    reasons: [...new Set(reasons)]
  };
}

function modeValue(entry, mode) {
  if (mode === 'light') {
    return { value: entry.lightValue, cssVar: entry.cssVarLight };
  }

  if (mode === 'dark') {
    return { value: entry.darkValue, cssVar: entry.cssVarDark };
  }

  return {
    value: {
      light: entry.lightValue,
      dark: entry.darkValue
    },
    cssVar: {
      light: entry.cssVarLight,
      dark: entry.cssVarDark
    }
  };
}

export async function intentRankTokens({
  query,
  categories = [],
  mode = 'all',
  limit = 15,
  includeReasons = true
} = {}) {
  const terms = tokenize(query);
  const categoryFilter = categories.map((c) => String(c).toLowerCase());
  const entries = buildSemanticDiscoveryEntries({
    includeCategories: categories
  });

  const scored = [];

  for (const entry of entries) {
    const { score, reasons } = scoreEntry(entry, terms, categoryFilter);
    if (score <= 0) continue;

    const current = modeValue(entry, mode);

    scored.push({
      tokenPath: entry.tokenPath,
      category: entry.category,
      description: entry.description || null,
      score,
      reasons,
      value: current.value,
      cssVar: current.cssVar
    });
  }

  scored.sort(
    (a, b) => b.score - a.score || a.tokenPath.localeCompare(b.tokenPath)
  );

  const capped = scored.slice(
    0,
    Math.max(1, Math.min(Number(limit) || 15, 100))
  );

  return {
    query,
    mode,
    categories,
    totalMatches: scored.length,
    results: capped.map((item, idx) => ({
      rank: idx + 1,
      tokenPath: item.tokenPath,
      category: item.category,
      description: item.description,
      score: item.score,
      value: item.value,
      cssVar: item.cssVar,
      reasons: includeReasons ? item.reasons : undefined
    }))
  };
}
