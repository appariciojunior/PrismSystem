# Design System Tokens MCP

The Design System Tokens MCP gives AI agents direct access to token decisions without slow file scanning. Connect it to Copilot, Claude, or Cursor to find the right token, check WCAG contrast, audit token health, and generate documentation — all through natural language.

Server name: `ds-tokens-mcp`  
Entry point: `packages/tokens/mcp-server/index.js`

## What you can do

- Find the right token for any design intent: interactive link, danger state, canvas surface.
- Check WCAG contrast between two tokens before committing to a combination.
- Audit the full token set for duplicate values, naming inconsistencies, and contrast risks.
- Trace token dependencies upstream and downstream to understand the impact of a change.
- Generate markdown documentation for any token group, ready to paste into a PR.
- Confirm resolved hex values directly from the Figma-sourced database, not from reference traversal.

## Recommended agent flow

0. Check `hex_sync_status` before any colour-sensitive work. If not synced, ask the user to open the Token Library Figma file and say "sync with figma variables".
1. Discover candidates with `search_tokens` (intent-first).
2. Confirm exact path, value, and layer with `token_lookup`.
3. Get resolved hex values with `hex_lookup` or `hex_batch_lookup`.
4. Check governance boundary with `foundation_gate` if a write is planned.
5. Run `contrast_check` or `audit_design_system` for broader health or risk review.
6. Generate docs with `generate_token_docs` once tokens are confirmed.

This sequence is the default path for high-confidence token decisions.

## MCP Tools

| Tool                     | Purpose                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `search_tokens`          | Semantic/intent search. Colour results include `resolvedHex` when the DB is synced.                                            |
| `token_lookup`           | Find tokens by exact path, glob pattern, or value. Colour tokens include `resolvedHex`.                                        |
| `token_validate`         | Validate `tokens.json` syntax, structure, or run a full build.                                                                 |
| `foundation_gate`        | Check whether a token path is in the protected foundation layer before writing.                                                |
| `ramp_lookup`            | Look up a ramp step hex for a given mode. Reads from the resolved hex DB; falls back to `tokens.json` traversal if not synced. |
| `contrast_check`         | Calculate WCAG contrast ratio between two colours or token references. Uses resolved hex DB for accurate resolution.           |
| `dependency_graph`       | Trace token references upstream/downstream and detect circular references.                                                     |
| `audit_design_system`    | Audit for duplicate values, naming inconsistencies, and heuristic contrast issues. Uses resolved hex DB for colour resolution. |
| `generate_token_docs`    | Generate markdown documentation for a token group path.                                                                        |
| `color_normalize`        | Normalise any colour input to a canonical hex string.                                                                          |
| `discovery_index_export` | Export the full semantic token discovery index.                                                                                |
| `intent_rank_tokens`     | Rank tokens by design intent.                                                                                                  |
| `reverse_lookup_color`   | Find tokens by hex. Uses resolved hex DB when synced: ground truth, not reference traversal.                                   |
| `hex_lookup`             | Get resolved hex colour(s) for a token path from the Figma-sourced DB. Returns light and/or dark mode values.                  |
| `hex_batch_lookup`       | Get resolved hexes for multiple token paths at once. Returns a map of tokenPath → `{ light, dark }`.                           |
| `hex_reverse_lookup`     | Find all token paths that resolve to a given hex. Uses Figma DB: no reference traversal.                                       |
| `hex_sync_status`        | Check when the resolved hex DB was last synced from Figma, and how many tokens it covers.                                      |

## Resolved Hex Database

`packages/tokens/data/resolved-hexes.json` stores every token's resolved hex value, keyed by token path and mode. It reads Figma variables directly, not `tokens.json` references in code. Code-side traversal is inaccurate because Token Studio applies token sets in a specific order that only the Figma runtime knows. The DB is the only reliable source.

**Coverage:** 681 Mode collection tokens (ramps and base brand colours) and 286 Theme tokens × 14 themes × 2 modes = 8,008 theme entries (8,689 total).

**Key format:**

- Mode tokens: `ramp.blue.50` (dot-separated path)
- Theme tokens: `surface.canvas.core.light` (token path + theme + mode)

**How to sync:** Open the Token Library Figma file, make sure the Desktop Bridge plugin is running, then ask the agent: "sync with figma variables". The agent will run `sync-resolved-hexes.js` and write the updated DB.

There is no staleness enforcement. Re-sync whenever you have made token exports to Figma via Token Studio.

## How it works

`packages/tokens/src/tokens.json` is the token definition authority. `packages/tokens/data/resolved-hexes.json` is the resolved hex database, populated by syncing from Figma variables.

- `search_tokens` finds the strongest candidates from intent in one step. `token_lookup` confirms exact paths and values immediately. Agents spend less time exploring files and more time delivering decisions.
- Prompts chain tools in a repeatable flow instead of ad hoc searching. `generate_token_docs` turns selected token groups into PR-ready docs quickly. Teams get consistent outputs across Copilot, Claude, and Cursor.
- `hex_lookup` and `hex_batch_lookup` return Figma-sourced hex values, not values inferred from reference traversal. `audit_design_system` surfaces duplicate, naming, and contrast risks early. Agents can validate before recommending, not after shipping.

## Troubleshooting

- **Result looks wrong or mismatched:** `search_tokens` uses an in-process cache keyed by `tokens.json` mtime. If you've just edited tokens, re-run `token_lookup` (direct read, no cache) to verify the live value.
- **Tool returns fewer results than expected:** Add precision filters, `tokenTypes: ["color"]` or `pathStartsWith: "interactive.link"`, to narrow scope.
- **Foundation token unexpectedly editable:** Run `foundation_gate` before any write. Foundation edits require explicit human approval.
- **`hex_lookup` returns null:** The DB has not been synced yet. Ask the user to open Token Library in Figma with Desktop Bridge running and say "sync with figma variables".
- **Hex values look wrong after a token change:** The DB reflects the last Figma export. Re-export tokens to Figma via Token Studio, then ask the agent to sync again.

## Prompt Library

Copy any prompt below and paste it into Copilot, Claude, or Cursor. Adjust the details to match your task.

### Prompts for Finding the Right Token

Tools used: `search_tokens`, `token_lookup`

```text
I am designing a danger button. Please find the best token options for the button text in light and dark themes, and tell me which one you recommend most and why.
```

```text
I need a subtle link style for article body text. Please suggest the best token choices and give me the top 3 I should consider.
```

### Prompts for Checking Token Quality

Tools used: `audit_design_system`

```text
Please run a full health check on our tokens and tell me the biggest issues in plain English, especially naming problems, duplicate values, and any accessibility concerns.
```

```text
Please check dark mode tokens only and give me a simple cleanup plan with low-risk tasks first.
```

### Prompts for Creating Documentation

Tools used: `generate_token_docs`, `token_lookup`

```text
Please generate clear documentation for the link tokens in light core, and include which token states should be used for default, hover, and pressed.
```

```text
Please generate documentation for dark core feedback tokens in a format I can
paste straight into a PR.
```

### General Prompts That Use the MCP Well

Tools used: `search_tokens`, `token_lookup`, `audit_design_system`, `generate_token_docs`

```text
I need the best tokens for a destructive call-to-action. Please find options, validate them, check for any risks, and give me a final recommendation.
```

```text
I am updating link styles. Please find suitable tokens, verify the exact token names I should use, and then generate a short doc section for the final choice.
```

```text
Please run a token health review for interactive tokens and give me a prioritised action plan for what we should fix this sprint.
```

```text
Please produce a decision trace for secondary button text on dark surfaces: what options were considered, what was rejected, and what you recommend.
```

### Prompt Templates

Tools used: `search_tokens`, `token_lookup`, `audit_design_system`, `generate_token_docs`

```text
I need token options for [what you are designing]. Please find the best matches, rank them from strongest to weakest, and explain your recommendation.
```

```text
Please confirm the exact token names and values for [chosen option], return them in a clean copy-paste list, and add one sentence on when each token should be used.
```

```text
Please run a health check for [scope], summarize the biggest issues first, and then give me a practical fix plan with quick wins at the top.
```

```text
Please generate documentation for [token group], keep it short and clear for both design and engineering teams, and include common mistakes to avoid.
```

```text
I need a final token recommendation for [use case]. Please find options, validate exact token names, check for risks, and provide one final recommendation with reasons.
```

```text
Please create a cleanup sprint plan for [scope], split into quick fixes, medium effort, and larger improvements, and include success criteria for each phase.
```

## File structure

For contributors setting up or extending the server.

```text
packages/tokens/mcp-server/
  index.js
  package.json
  start-mcp.sh
  start-mcp.bat
  sync-resolved-hexes.js
  tools/
    token-utils.js
    token-lookup.js
    token-validate.js
    foundation-gate.js
    ramp-lookup.js
    contrast-check.js
    dependency-graph.js
    search-tokens.js
    audit-design-system.js
    generate-token-docs.js
    color-normalize.js
    discovery-index-export.js
    intent-rank-tokens.js
    reverse-lookup-color.js
    hex-db.js
    hex-lookup.js
    hex-batch-lookup.js
    hex-reverse-lookup.js
    hex-sync-status.js

packages/tokens/data/
  resolved-hexes.json
```
