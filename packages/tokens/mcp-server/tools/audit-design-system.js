import {
  loadTokens,
  getTokenSets,
  flattenTokenObject,
  getNestedValue,
  createGlobalTokenIndex,
  resolveTokenValue,
  contrastRatio
} from './token-utils.js';
import { getHex, isDbPopulated } from './hex-db.js';

function checkNaming(tokenPath) {
  const issues = [];
  const parts = tokenPath.split('.');

  for (const part of parts) {
    if (/[A-Z]/.test(part)) {
      issues.push(`contains uppercase segment '${part}'`);
    }
    if (/\s/.test(part)) {
      issues.push(`contains whitespace segment '${part}'`);
    }
    if (part.includes('_') && part.includes('-')) {
      issues.push(`mixed separators in segment '${part}'`);
    }
    if (!/^[a-z0-9-]+$/.test(part)) {
      // Allow camelCase but still report for consistency checks.
      if (!/^[a-zA-Z0-9-]+$/.test(part)) {
        issues.push(`non-standard characters in segment '${part}'`);
      }
    }
  }

  return issues;
}

function buildDuplicateReport(entries) {
  const groups = new Map();

  for (const entry of entries) {
    if (entry.value == null) continue;
    const key = `${entry.type || 'unknown'}::${String(entry.value).trim()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }

  const duplicates = [];

  for (const [signature, list] of groups.entries()) {
    if (list.length < 2) continue;
    duplicates.push({
      signature,
      count: list.length,
      examples: list.slice(0, 8).map((x) => `${x.set}.${x.path}`)
    });
  }

  duplicates.sort(
    (a, b) => b.count - a.count || a.signature.localeCompare(b.signature)
  );
  return duplicates;
}

function collectContrastPairs(setName) {
  // Conservative static pairs that commonly represent text/icon on backgrounds.
  return [
    {
      foregroundPath: 'text.primary',
      backgroundPath: 'surface.canvas',
      label: `${setName}: text.primary on surface.canvas`
    },
    {
      foregroundPath: 'text.secondary',
      backgroundPath: 'surface.canvas',
      label: `${setName}: text.secondary on surface.canvas`
    },
    {
      foregroundPath: 'text.inverse',
      backgroundPath: 'surface.inverse',
      label: `${setName}: text.inverse on surface.inverse`
    },
    {
      foregroundPath: 'icon.primary',
      backgroundPath: 'surface.canvas',
      label: `${setName}: icon.primary on surface.canvas`
    }
  ];
}

export async function auditDesignSystem({
  mode = 'all',
  includeContrast = true,
  contrastLevel = 'AA'
}) {
  const tokens = loadTokens();
  const globalIndex = createGlobalTokenIndex(tokens);

  const flattenedEntries = [];
  const namingIssues = [];
  const contrastIssues = [];

  for (const [setName, setData] of getTokenSets(tokens)) {
    if (mode === 'light' && setName.startsWith('dark/')) continue;
    if (mode === 'dark' && setName.startsWith('light/')) continue;

    const flattened = flattenTokenObject(setData);

    for (const token of flattened) {
      const entry = { ...token, set: setName };
      flattenedEntries.push(entry);

      const tokenNamingIssues = checkNaming(token.path);
      if (tokenNamingIssues.length > 0) {
        namingIssues.push({
          tokenPath: `${setName}.${token.path}`,
          issues: tokenNamingIssues
        });
      }
    }

    if (!includeContrast) continue;

    for (const pair of collectContrastPairs(setName)) {
      const fgToken = getNestedValue(setData, pair.foregroundPath);
      const bgToken = getNestedValue(setData, pair.backgroundPath);

      if (
        !fgToken ||
        !bgToken ||
        typeof fgToken !== 'object' ||
        typeof bgToken !== 'object'
      ) {
        continue;
      }

      const fgHex = (() => {
        // Strip reference braces to get token path, e.g. {color.text.primary} → color.text.primary
        const fgPath = String(fgToken.value || '').replace(/^\{(.+)\}$/, '$1');
        if (isDbPopulated()) {
          const m = setName.startsWith('dark/') ? 'dark' : 'light';
          const dbHex = getHex(fgPath, m);
          if (dbHex) return dbHex;
        }
        return resolveTokenValue(fgToken.value, setData, globalIndex);
      })();

      const bgHex = (() => {
        const bgPath = String(bgToken.value || '').replace(/^\{(.+)\}$/, '$1');
        if (isDbPopulated()) {
          const m = setName.startsWith('dark/') ? 'dark' : 'light';
          const dbHex = getHex(bgPath, m);
          if (dbHex) return dbHex;
        }
        return resolveTokenValue(bgToken.value, setData, globalIndex);
      })();

      if (!fgHex || !bgHex) continue;

      const ratio = contrastRatio(fgHex, bgHex);
      if (!ratio) continue;

      const threshold = contrastLevel === 'AAA' ? 7 : 4.5;

      if (ratio < threshold) {
        contrastIssues.push({
          pair: pair.label,
          foreground: `${setName}.${pair.foregroundPath}`,
          background: `${setName}.${pair.backgroundPath}`,
          foregroundHex: fgHex,
          backgroundHex: bgHex,
          ratio: Math.round(ratio * 100) / 100,
          threshold,
          severity: ratio < 3 ? 'high' : 'medium'
        });
      }
    }
  }

  const duplicateValues = buildDuplicateReport(flattenedEntries);

  const summary = {
    totalTokenEntries: flattenedEntries.length,
    duplicateGroups: duplicateValues.length,
    namingIssues: namingIssues.length,
    contrastIssues: contrastIssues.length,
    score: Math.max(
      0,
      100 -
        duplicateValues.length * 2 -
        namingIssues.length * 0.5 -
        contrastIssues.length * 3
    )
  };

  return {
    mode,
    contrastLevel,
    summary,
    duplicates: duplicateValues.slice(0, 50),
    namingIssues: namingIssues.slice(0, 200),
    contrastIssues: contrastIssues.slice(0, 100),
    notes: [
      'Duplicate values are not always wrong: aliases and shared values are expected in token systems.',
      'Contrast checks are heuristic and only evaluate predefined text/icon to surface pairs.'
    ]
  };
}
