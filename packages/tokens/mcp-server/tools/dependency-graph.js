/**
 * Dependency Graph Tool
 * Skill: discovery/dependency-graph.md
 *
 * Trace token references to find dependents and dependencies.
 * Detects circular references.
 */

import {
  findTokenEntries,
  getCachedTokenEntries,
  getCachedTokenIndexes
} from './token-utils.js';

/**
 * Build the dependency graph.
 */
export async function dependencyGraph({ tokenPath, direction, maxDepth }) {
  const allTokens = getCachedTokenEntries();
  const { downstreamByReference } = getCachedTokenIndexes();
  const maxDepthNumber = Math.max(1, Number(maxDepth) || 5);

  // Find the target token(s)
  const targetTokens = findTokenEntries(tokenPath, true);

  if (targetTokens.length === 0) {
    return {
      tokenPath,
      error: `Token not found: ${tokenPath}`,
      suggestion:
        'Try a partial path or use token_lookup to find the exact path first.'
    };
  }

  const result = {
    tokenPath,
    direction,
    maxDepth: maxDepthNumber,
    targets: targetTokens.map((t) => ({
      set: t.set,
      path: t.path,
      value: t.value
    })),
    upstream: [],
    downstream: [],
    circularRefs: []
  };

  // Upstream: what does this token reference?
  if (direction === 'upstream' || direction === 'both') {
    const visited = new Set();

    function traceUpstream(entry, depth = 0) {
      if (depth >= maxDepthNumber || visited.has(entry.fullPath)) return [];
      visited.add(entry.fullPath);

      const refs = [];

      for (const ref of entry.references) {
        const refTokens = findTokenEntries(ref, true);

        refs.push({
          from: { set: entry.set, path: entry.path },
          to: ref,
          resolved: refTokens.length > 0,
          depth
        });

        for (const refEntry of refTokens) {
          refs.push(...traceUpstream(refEntry, depth + 1));
        }
      }

      return refs;
    }

    result.upstream = targetTokens.flatMap((entry) => traceUpstream(entry));
  }

  // Downstream: what references this token?
  if (direction === 'downstream' || direction === 'both') {
    const downstream = [];
    const seen = new Set();

    for (const target of targetTokens) {
      const referenceKeys = [target.path, target.fullPath, tokenPath];

      for (const refKey of referenceKeys) {
        const references = downstreamByReference.get(refKey) || [];

        for (const fullPath of references) {
          if (seen.has(fullPath)) continue;
          seen.add(fullPath);

          const [entry] = findTokenEntries(fullPath, false);
          if (!entry) continue;

          downstream.push({
            referencing: { set: entry.set, path: entry.path },
            referencedPath: refKey,
            value: entry.value
          });
        }
      }
    }

    result.downstream = downstream.slice(0, 30); // Limit output
  }

  // Circular reference detection
  const circularVisited = new Set();

  function detectCircular(entry, chain = []) {
    if (chain.includes(entry.fullPath)) {
      result.circularRefs.push([...chain, entry.fullPath]);
      return;
    }
    if (
      circularVisited.has(entry.fullPath) ||
      chain.length >= maxDepthNumber
    ) {
      return;
    }

    circularVisited.add(entry.fullPath);

    for (const ref of entry.references) {
      const refEntries = findTokenEntries(ref, true);
      for (const refEntry of refEntries) {
        detectCircular(refEntry, [...chain, entry.fullPath]);
      }
    }
  }

  for (const target of targetTokens) {
    detectCircular(target);
  }

  return result;
}
