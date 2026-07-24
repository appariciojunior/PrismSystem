#!/usr/bin/env node
/**
 * Design System Tokens MCP
 *
 * Exposes design token operations as MCP tools for AI agents.
 * Tools map to skills in packages/tokens/.agents/skills/
 *
 * Usage:
 *   node packages/tokens/mcp-server/index.js
 *   # Or via npx:
 *   npx @modelcontextprotocol/sdk packages/tokens/mcp-server/index.js
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { tokenLookup } from './tools/token-lookup.js';
import { tokenValidate } from './tools/token-validate.js';
import { foundationGate } from './tools/foundation-gate.js';
import { rampLookup } from './tools/ramp-lookup.js';
import { contrastCheck } from './tools/contrast-check.js';
import { dependencyGraph } from './tools/dependency-graph.js';
import { searchTokens } from './tools/search-tokens.js';
import { auditDesignSystem } from './tools/audit-design-system.js';
import { generateTokenDocs } from './tools/generate-token-docs.js';
import { colorNormalize } from './tools/color-normalize.js';
import { discoveryIndexExport } from './tools/discovery-index-export.js';
import { intentRankTokens } from './tools/intent-rank-tokens.js';
import { reverseLookupColor } from './tools/reverse-lookup-color.js';
import { hexLookup } from './tools/hex-lookup.js';
import { hexBatchLookup } from './tools/hex-batch-lookup.js';
import { hexReverseLookup } from './tools/hex-reverse-lookup.js';
import { hexSyncStatus } from './tools/hex-sync-status.js';
import { designRules } from './tools/design-rules.js';
import { designScore } from './tools/design-score.js';
import { designRoute } from './tools/design-route.js';
import { corpusStatus } from './tools/corpus-status.js';

const server = new McpServer({
  name: 'ds-tokens-mcp',
  version: '1.0.0'
});

function asTextContent(result) {
  return {
    content: [{ type: 'text', text: JSON.stringify(result) }]
  };
}

// --- Tool: token_lookup ---
// Skill: discovery/token-lookup.md
server.tool(
  'token_lookup',
  'Find tokens by path, name pattern, or value. Returns token metadata and location without loading full tokens.json.',
  {
    query: z.string().describe('Token path, glob pattern, or search term'),
    queryType: z
      .enum(['path', 'pattern', 'value'])
      .default('pattern')
      .describe('Search strategy: exact path, glob pattern, or value match'),
    layer: z
      .enum(['all', 'foundation', 'palette', 'semantic'])
      .default('all')
      .describe('Filter by token layer'),
    mode: z
      .enum(['all', 'light', 'dark'])
      .default('all')
      .describe('Filter by light/dark mode'),
    limit: z
      .number()
      .min(1)
      .max(200)
      .default(50)
      .describe('Maximum results to return in this page'),
    cursor: z.number().min(0).default(0).describe('Start offset for pagination')
  },
  async ({ query, queryType, layer, mode, limit, cursor }) => {
    const result = await tokenLookup({
      query,
      queryType,
      layer,
      mode,
      limit,
      cursor
    });
    return asTextContent(result);
  }
);

// --- Tool: token_validate ---
// Skill: validation/json-validate.md + validation/build-verify.md
server.tool(
  'token_validate',
  'Validate tokens.json syntax, structure, and optionally run build/tests.',
  {
    level: z
      .enum(['syntax', 'structure', 'build', 'full'])
      .default('syntax')
      .describe(
        'Validation level: syntax (JSON only), structure (layer checks), build (npm build), full (all)'
      )
  },
  async ({ level }) => {
    const result = await tokenValidate({ level });
    return asTextContent(result);
  }
);

// --- Tool: foundation_gate ---
// Skill: governance/foundation-gate.md
server.tool(
  'foundation_gate',
  'Check if a token path is in the protected foundation layer. Returns allowed/blocked status.',
  {
    tokenPath: z.string().describe('Full token path to check'),
    operation: z
      .enum(['read', 'write', 'delete'])
      .default('read')
      .describe('Intended operation')
  },
  async ({ tokenPath, operation }) => {
    const result = foundationGate({ tokenPath, operation });
    return asTextContent(result);
  }
);

// --- Tool: ramp_lookup ---
// Skill: color-ramps/dark-mode-mapping.md
server.tool(
  'ramp_lookup',
  "Look up a ramp step's hex value for a given mode. Critical for dark mode where neutral ramps are REVERSED.",
  {
    ramp: z
      .string()
      .default('neutral')
      .describe('Ramp name (e.g., neutral, blue, red)'),
    step: z.string().describe('Step number (e.g., 50, 100, 500, 1000)'),
    mode: z
      .enum(['light', 'dark', 'both'])
      .default('both')
      .describe('Which mode to look up')
  },
  async ({ ramp, step, mode }) => {
    const result = await rampLookup({ ramp, step, mode });
    return asTextContent(result);
  }
);

// --- Tool: contrast_check ---
// Skill: color-ramps/contrast-check.md
server.tool(
  'contrast_check',
  'Calculate WCAG contrast ratio between two colors. Supports hex values or token references.',
  {
    foreground: z
      .string()
      .describe('Foreground color (hex like #000000 or token path)'),
    background: z
      .string()
      .describe('Background color (hex like #ffffff or token path)'),
    level: z
      .enum(['AA', 'AAA'])
      .default('AA')
      .describe('WCAG conformance level')
  },
  async ({ foreground, background, level }) => {
    const result = contrastCheck({ foreground, background, level });
    return asTextContent(result);
  }
);

// --- Tool: dependency_graph ---
// Skill: discovery/dependency-graph.md
server.tool(
  'dependency_graph',
  'Trace token references to find dependents and dependencies. Detects circular references.',
  {
    tokenPath: z.string().describe('Token path to trace'),
    direction: z
      .enum(['upstream', 'downstream', 'both'])
      .default('both')
      .describe(
        'Trace direction: upstream (what it references), downstream (what references it), or both'
      ),
    maxDepth: z.number().default(5).describe('Maximum reference depth to trace')
  },
  async ({ tokenPath, direction, maxDepth }) => {
    const result = await dependencyGraph({ tokenPath, direction, maxDepth });
    return asTextContent(result);
  }
);

// --- Tool: search_tokens ---
server.tool(
  'search_tokens',
  'Semantic token search by design intent. Example: "best token for danger button".',
  {
    intent: z.string().describe('Natural-language intent or query'),
    mode: z
      .enum(['all', 'light', 'dark'])
      .default('all')
      .describe('Filter semantic search by light/dark mode'),
    maxResults: z
      .number()
      .min(1)
      .max(50)
      .default(15)
      .describe('Maximum recommendations to return'),
    includeRawMatches: z
      .boolean()
      .default(false)
      .describe('Include full raw scored matches for debugging'),
    tokenTypes: z
      .array(z.string())
      .default([])
      .describe('Optional token type filter, e.g. ["color"]'),
    pathStartsWith: z
      .string()
      .default('')
      .describe('Optional token path prefix filter, e.g. "interactive.link"')
  },
  async ({
    intent,
    mode,
    maxResults,
    includeRawMatches,
    tokenTypes,
    pathStartsWith
  }) => {
    const result = await searchTokens({
      intent,
      mode,
      maxResults,
      includeRawMatches,
      tokenTypes,
      pathStartsWith
    });
    return asTextContent(result);
  }
);

// --- Tool: audit_design_system ---
server.tool(
  'audit_design_system',
  'Audit tokens for duplicate values, naming inconsistencies, and heuristic contrast issues.',
  {
    mode: z
      .enum(['all', 'light', 'dark'])
      .default('all')
      .describe('Which mode token sets to audit'),
    includeContrast: z
      .boolean()
      .default(true)
      .describe('Include text/icon-to-surface contrast checks'),
    contrastLevel: z
      .enum(['AA', 'AAA'])
      .default('AA')
      .describe('WCAG target level for contrast checks')
  },
  async ({ mode, includeContrast, contrastLevel }) => {
    const result = await auditDesignSystem({
      mode,
      includeContrast,
      contrastLevel
    });
    return asTextContent(result);
  }
);

// --- Tool: generate_token_docs ---
server.tool(
  'generate_token_docs',
  'Generate human-readable markdown docs for a requested token group path.',
  {
    groupPath: z
      .string()
      .describe(
        'Token group path, e.g. "light/ core.interactive.link" or "foundation"'
      ),
    outputPath: z
      .string()
      .optional()
      .describe('Optional absolute output path for generated markdown docs')
  },
  async ({ groupPath, outputPath }) => {
    const result = await generateTokenDocs({ groupPath, outputPath });
    return asTextContent(result);
  }
);

// --- Tool: color_normalize ---
server.tool(
  'color_normalize',
  'Normalize and validate color values (hex/rgb/hsl) into canonical forms.',
  {
    value: z.string().describe('Color value to normalize')
  },
  async ({ value }) => {
    const result = colorNormalize({ value });
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// --- Tool: discovery_index_export ---
server.tool(
  'discovery_index_export',
  'Export normalized semantic token discovery index for docs and search UIs.',
  {
    includeCategories: z
      .array(z.string())
      .default([])
      .describe('Optional category filter list'),
    includeAliases: z
      .boolean()
      .default(true)
      .describe('Include alias terms for discovery'),
    format: z
      .enum(['json', 'compact'])
      .default('json')
      .describe('Output shape for index entries')
  },
  async ({ includeCategories, includeAliases, format }) => {
    const result = await discoveryIndexExport({
      includeCategories,
      includeAliases,
      format
    });
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// --- Tool: intent_rank_tokens ---
server.tool(
  'intent_rank_tokens',
  'Rank semantic tokens for a natural-language intent query.',
  {
    query: z.string().describe('Natural-language search query'),
    categories: z
      .array(z.string())
      .default([])
      .describe('Optional token categories to prioritize/filter'),
    mode: z
      .enum(['all', 'light', 'dark'])
      .default('all')
      .describe('Return mode-specific values'),
    limit: z
      .number()
      .min(1)
      .max(100)
      .default(15)
      .describe('Maximum results to return'),
    includeReasons: z
      .boolean()
      .default(true)
      .describe('Include scoring reasons in response')
  },
  async ({ query, categories, mode, limit, includeReasons }) => {
    const result = await intentRankTokens({
      query,
      categories,
      mode,
      limit,
      includeReasons
    });
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// --- Tool: reverse_lookup_color ---
server.tool(
  'reverse_lookup_color',
  'Find exact and near semantic token matches for a color value.',
  {
    value: z.string().describe('Color value to reverse lookup'),
    mode: z
      .enum(['all', 'light', 'dark'])
      .default('all')
      .describe('Mode set to match against'),
    includeNear: z
      .boolean()
      .default(true)
      .describe('Include near matches by distance threshold'),
    threshold: z
      .number()
      .min(0)
      .max(500)
      .default(30)
      .describe('Distance threshold for near matches'),
    limit: z
      .number()
      .min(1)
      .max(200)
      .default(20)
      .describe('Maximum number of exact and near matches')
  },
  async ({ value, mode, includeNear, threshold, limit }) => {
    const result = await reverseLookupColor({
      value,
      mode,
      includeNear,
      threshold,
      limit
    });
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// --- Tool: hex_lookup ---
server.tool(
  'hex_lookup',
  'Get resolved hex colour(s) for a token path from the Figma-sourced database. Returns light and/or dark mode values. Call hex_sync_status first if you are unsure whether the DB is populated.',
  {
    tokenPath: z
      .string()
      .describe('Token path, e.g. "color.background.primary"'),
    mode: z
      .enum(['light', 'dark', 'both'])
      .default('both')
      .describe('Which mode(s) to return')
  },
  async ({ tokenPath, mode }) => {
    const result = await hexLookup({ tokenPath, mode });
    return asTextContent(result);
  }
);

// --- Tool: hex_batch_lookup ---
server.tool(
  'hex_batch_lookup',
  'Get resolved hex colours for multiple token paths at once. Returns a map of tokenPath → { light, dark }. Efficient for contrast checks and audits.',
  {
    tokenPaths: z.array(z.string()).describe('Array of token paths'),
    mode: z
      .enum(['light', 'dark', 'both'])
      .default('both')
      .describe('Which mode(s) to return')
  },
  async ({ tokenPaths, mode }) => {
    const result = await hexBatchLookup({ tokenPaths, mode });
    return asTextContent(result);
  }
);

// --- Tool: hex_reverse_lookup ---
server.tool(
  'hex_reverse_lookup',
  'Find all token paths that resolve to a given hex colour. Uses the Figma-sourced database — ground truth, not reference traversal.',
  {
    hex: z.string().describe('Hex colour value, e.g. "#FFFFFF"'),
    mode: z
      .enum(['light', 'dark', 'all'])
      .default('all')
      .describe('Which mode to search in'),
    includeNear: z
      .boolean()
      .default(false)
      .describe('Include near matches within the distance threshold'),
    threshold: z
      .number()
      .min(0)
      .max(100)
      .default(15)
      .describe('Euclidean RGB distance threshold for near matches')
  },
  async ({ hex, mode, includeNear, threshold }) => {
    const result = await hexReverseLookup({
      hex,
      mode,
      includeNear,
      threshold
    });
    return asTextContent(result);
  }
);

// --- Tool: hex_sync_status ---
server.tool(
  'hex_sync_status',
  'Check when the resolved hex database was last synced from Figma variables, and how many tokens it covers.',
  {},
  async () => {
    const result = await hexSyncStatus();
    return asTextContent(result);
  }
);

// =====================================================================
// Design suite tools — the deterministic helpers behind the design/ skills.
// The LLM-judgment skills (design-critique, flow-design, distill-corpus) are
// executed by the agent reading the .md; these tools do their mechanical parts:
// serve the rules, compute the score, classify a route, report corpus state.
// =====================================================================

// --- Tool: design_rules ---
// Skill: design/foundation/design-rules.md
server.tool(
  'design_rules',
  'Get the Design System rule set (8 categories, ~56 rules) and the 0-100 scoring formula. Filter by category or fetch one rule by ID. Parsed from design-rules.md so it never drifts from the skill.',
  {
    category: z
      .enum(['all', 'TYP', 'COL', 'SPC', 'CMP', 'A11Y', 'UX', 'MOT', 'BRD'])
      .default('all')
      .describe('Filter rules by category, or all'),
    ruleId: z
      .string()
      .default('')
      .describe('Fetch a single rule by ID, e.g. "DS-SPC-02"'),
    severityFloor: z
      .enum(['info', 'warning', 'error'])
      .default('info')
      .describe('Only return rules at or above this severity')
  },
  async ({ category, ruleId, severityFloor }) => {
    return asTextContent(designRules({ category, ruleId, severityFloor }));
  }
);

// --- Tool: design_score ---
// Skill: design/ui/design-critique.md, design/ui/monthly-audit.md
server.tool(
  'design_score',
  'Compute the 0-100 design score and per-category subscores from a list of findings, using the design-rules formula (error 5 / warning 2 / info 0, capped 30 per category). Scores findings; it does not produce them.',
  {
    findings: z
      .array(
        z.object({
          ruleId: z.string().optional().describe('Rule ID, e.g. "DS-COL-06"'),
          category: z.string().optional().describe('Category if no ruleId'),
          severity: z
            .enum(['error', 'warning', 'info'])
            .optional()
            .describe('Severity; looked up from the rule if omitted and ruleId is given')
        })
      )
      .describe('Findings to score, each with a ruleId (or category) and severity'),
    assessedCategories: z
      .array(z.string())
      .optional()
      .describe('Categories in scope; defaults to those appearing in findings')
  },
  async ({ findings, assessedCategories }) => {
    return asTextContent(designScore({ findings, assessedCategories }));
  }
);

// --- Tool: design_route ---
// Skill: design/design-router.md
server.tool(
  'design_route',
  'Classify a plain-language design request into one of five routes (prototype, ui-craft, new-experience, handoff, corpus-distill) and return the canonical skill sequence. Heuristic first pass; the design-router skill does the context-aware routing.',
  {
    request: z.string().describe("The designer's ask in plain language")
  },
  async ({ request }) => {
    return asTextContent(designRoute({ request }));
  }
);

// --- Tool: corpus_status ---
// Skill: design/corpus/distill-corpus.md, design/foundation/corpus-guide.md
server.tool(
  'corpus_status',
  'Report the state of the design corpus: version, screen counts by surface/channel/journey, and which distilled documents exist. Call before citing corpus evidence.',
  {},
  async () => {
    return asTextContent(corpusStatus());
  }
);

// --- Start server ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
