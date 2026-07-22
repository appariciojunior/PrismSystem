import { buildSemanticDiscoveryEntries } from './discovery-utils.js';

export async function discoveryIndexExport({
  includeCategories = [],
  includeAliases = true,
  format = 'json'
} = {}) {
  const entries = buildSemanticDiscoveryEntries({ includeCategories });

  const mapped = entries.map((entry) => {
    const base = {
      tokenPath: entry.tokenPath,
      category: entry.category,
      description: entry.description || null,
      lightValue: entry.lightValue,
      darkValue: entry.darkValue,
      cssVarLight: entry.cssVarLight,
      cssVarDark: entry.cssVarDark,
      figmaVariablePath: entry.figmaVariablePath
    };

    if (includeAliases) {
      base.aliases = entry.aliases;
    }

    if (format === 'compact') {
      return {
        tokenPath: base.tokenPath,
        category: base.category,
        lightValue: base.lightValue,
        darkValue: base.darkValue
      };
    }

    return base;
  });

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    format,
    filters: {
      includeCategories,
      includeAliases
    },
    count: mapped.length,
    entries: mapped
  };
}
