---
mode: agent
description: '🔍 Find tokens by path, name pattern, or resolved value'
tools:
  - read_file
  - grep_search
  - run_in_terminal
---

# Token Lookup

Find tokens in `packages/tokens/src/tokens.json` by path, name pattern, or value.

#file:packages/tokens/.agents/skills/discovery/token-lookup.md

## Quick Commands

```bash
# Find by path fragment
grep -n "text.primary" packages/tokens/src/tokens.json | head -20

# Find by hex value
grep -n "#ffffff\|#000000" packages/tokens/src/tokens.json | head -20

# Find by reference
grep -n "{brand.core.ramp.neutral" packages/tokens/src/tokens.json | head -20

# List all keys in a token set
jq '.["light/ core"] | keys' packages/tokens/src/tokens.json

# List ramp steps
jq '.["light/ brand"].brand.core.ramp | keys' packages/tokens/src/tokens.json
```

## Dark Mode Reference

Remember: neutral ramps are **REVERSED** in dark mode.
CSV reference: `packages/tokens/data/ramp-colors-reference.csv`
