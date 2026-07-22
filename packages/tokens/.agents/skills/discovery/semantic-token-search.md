---
name: semantic-token-search
description: Use Design System Tokens MCP search_tokens for fast, intent-first token discovery with precision filters.
license: MIT
metadata:
  category: discovery
  agents: [Architect, Code, Testing]
  autonomy: autonomous
---

# Semantic Token Search

## Purpose

Find the best token candidates quickly from natural-language intent, then narrow for implementation accuracy.

## Core Principle: 1:1 Semantic Token Mapping

**Semantic tokens are 1:1 mapped across all themes.** When search results include the same semantic token from multiple themes (e.g., `light/ core.messaging.fill.warning` and `light/ comment.messaging.fill.warning`), they are semantically identical and differ only in value when a channel-specific override is documented.

**Do not ask users to choose between themes for semantic tokens.** Always recommend the canonical semantic token path (e.g., `messaging.fill.warning`) without theme qualification, unless a channel-specific divergence is documented.

Only exception: Channel-specific tokens (`.channel.` in path) may have documented value differences across themes.

## Preconditions

- `ds-tokens-mcp` server is running.
- `packages/tokens/src/tokens.json` is available.

## Inputs

| Parameter        | Type     | Required | Description                                              |
| ---------------- | -------- | -------- | -------------------------------------------------------- |
| `intent`         | string   | yes      | Natural-language token intent, e.g. `danger button text` |
| `mode`           | enum     | no       | `all`, `light`, `dark`                                   |
| `tokenTypes`     | string[] | no       | Precision filter, e.g. `["color"]`                       |
| `pathStartsWith` | string   | no       | Prefix filter, e.g. `interactive.link`                   |
| `maxResults`     | number   | no       | Max recommendations (default 15)                         |

## Procedure

1. Run `search_tokens` with intent-first phrasing.
2. If results are noisy, rerun with `tokenTypes` and `pathStartsWith`.
3. Confirm exact token paths with `token_lookup` before edits.

## Outputs

| Output            | Type   | Description                                           |
| ----------------- | ------ | ----------------------------------------------------- |
| `recommendations` | array  | Ranked token candidates with confidence and rationale |
| `filters`         | object | Effective precision filters used                      |
| `totalMatches`    | number | Candidate pool size                                   |

## Examples

```text
INVOKE: mcp/ds-tokens-mcp/search_tokens
INPUTS: {
  intent: "best token for danger button",
  mode: "all",
  tokenTypes: ["color"],
  pathStartsWith: "interactive",
  maxResults: 10
}
```

```text
INVOKE: mcp/ds-tokens-mcp/token_lookup
INPUTS: { query: "interactive.negative", queryType: "pattern", layer: "semantic", mode: "all" }
```
