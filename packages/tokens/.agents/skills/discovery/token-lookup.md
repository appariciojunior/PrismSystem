---
name: token-lookup
description: Find tokens by path, name pattern, or value. Returns metadata and location for efficient context gathering without reading full tokens.json.
license: MIT
metadata:
  category: discovery
  agents: [Architect, Code, Testing]
  autonomy: autonomous
---

# Token Lookup

## Purpose

Find tokens by path, name pattern, or value, returning metadata and location.

MCP-first guidance: use `search_tokens` for intent discovery, then `token_lookup` for exact confirmation.

## Preconditions

- `packages/tokens/src/tokens.json` exists and is valid JSON
- Agent has read access to workspace

## Inputs

| Parameter    | Type     | Required | Description                                               |
| ------------ | -------- | -------- | --------------------------------------------------------- |
| `query`      | string   | yes      | Token path, glob pattern, or search term                  |
| `query_type` | enum     | no       | `path` (exact), `pattern` (glob), `value` (hex/reference) |
| `layers`     | string[] | no       | Filter to layers: `foundation`, `palette`, `semantic`     |
| `modes`      | string[] | no       | Filter to modes: `light`, `dark`                          |

## Procedure

### Step 1: Choose Search Strategy

Preferred: use `ds-tokens-mcp/token_lookup` directly.

```text
INVOKE: mcp/ds-tokens-mcp/token_lookup
INPUTS: { query: "interactive.link.primary", queryType: "pattern", layer: "semantic", mode: "all" }
```

Fallback (if MCP unavailable):

```python
if query_type == "path":
    # Exact path lookup via jq
    cmd = f"jq '.[\"{query}\"]' packages/tokens/src/tokens.json"
elif query_type == "pattern":
    # Grep for pattern matches
    cmd = f"grep -n '{query}' packages/tokens/src/tokens.json"
elif query_type == "value":
    # Search for specific value
    cmd = f"grep -n '\"{query}\"' packages/tokens/src/tokens.json"
```

### Step 2: Execute Search (Context-Efficient)

MCP execution:

```text
INVOKE: mcp/ds-tokens-mcp/token_lookup
INPUTS: { query: "text.primary", queryType: "pattern", layer: "all", mode: "all" }
```

Fallback shell execution:

```bash
# For pattern search (preferred - low context cost)
grep -n "brand.core.ramp.neutral" packages/tokens/src/tokens.json | head -20

# For structure inspection (moderate context cost)
python3 << 'EOF'
import json
with open('packages/tokens/src/tokens.json') as f:
    data = json.load(f)
# Navigate to specific path
token = data.get('light/ core', {}).get('text', {}).get('primary', {})
print(json.dumps(token, indent=2))
EOF
```

### Step 3: Extract Metadata

For each found token, capture:

- Full path (e.g., `light/ core.text.primary`)
- Value (reference or resolved)
- Description (if present)
- Layer classification (foundation/palette/semantic)

## Outputs

| Output       | Type   | Description                               |
| ------------ | ------ | ----------------------------------------- |
| `tokens`     | array  | List of {path, value, description, layer} |
| `count`      | number | Number of matches                         |
| `query_used` | string | Actual search query executed              |

## Error Handling

| Error                   | Recovery                                                     |
| ----------------------- | ------------------------------------------------------------ |
| `tokens.json not found` | Check file moved; search for `tokens.json` in workspace      |
| `Invalid JSON`          | Run `python3 -m json.tool` to identify syntax error location |
| `No matches`            | Broaden search; try alternate naming conventions             |
| `Too many matches`      | Add layer/mode filters; narrow pattern                       |

## Examples

### Example 1: Find neutral ramp in dark mode

```text
INVOKE: skill/discovery/token-lookup
INPUTS: { query: "brand.core.ramp.neutral", modes: ["dark"] }
RESULT: {
  tokens: [
    { path: "dark/ brand.brand.core.ramp.neutral.50", value: "#000000", layer: "palette" },
    { path: "dark/ brand.brand.core.ramp.neutral.100", value: "#0c0c0c", layer: "palette" },
    ...
  ],
  count: 19,
  query_used: "grep 'brand.core.ramp.neutral' | grep 'dark/'"
}
```

### Example 2: Find all tokens with specific hex value

```text
INVOKE: skill/discovery/token-lookup
INPUTS: { query: "#ffffff", query_type: "value" }
RESULT: {
  tokens: [
    { path: "foundation.brand.white", value: "#ffffff", layer: "foundation" },
    ...
  ],
  count: 3
}
```

## Context Window Optimization

**DO**: Use grep for initial discovery, then targeted Python for details  
**DON'T**: Load entire tokens.json into context  
**Target**: <500 tokens per invocation

MCP note: prefer MCP tools for faster repeated lookups due server-side token caching.
