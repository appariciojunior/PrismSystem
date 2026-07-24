---
mode: agent
description: '🌑 Verify dark mode ramp step mapping and neutral reversal'
tools:
  - read_file
  - grep_search
  - run_in_terminal
---

# Dark Mode Check

Verify that dark mode tokens use the correct ramp steps, accounting for the **neutral ramp reversal**.

#file:packages/tokens/.agents/skills/color-ramps/dark-mode-mapping.md

## Quick Verification

```bash
# Check a specific token's light vs dark values
grep -A2 '"text"' packages/tokens/src/tokens.json | head -20

# View neutral ramp in dark mode
jq '.["dark/ brand"].brand.core.ramp.neutral' packages/tokens/src/tokens.json

# Cross-reference with CSV
head -5 packages/tokens/data/ramp-colors-reference.csv
grep "neutral" packages/tokens/data/ramp-colors-reference.csv | head -20
```

## Key Mapping

| Intent                                                             | Light Mode Step | Dark Mode Step | Light Color | Dark Color |
| ------------------------------------------------------------------ | --------------- | -------------- | ----------- | ---------- |
| White surface                                                      | neutral.50      | neutral.50     | #ffffff     | #000000    |
| Black text                                                         | neutral.1000    | neutral.1000   | #000000     | #ffffff    |
| Same visual color stays at same step — the ramp itself is reversed |

## Static Tokens (Mode-Independent)

For elements that need FIXED colors (QR codes, barcodes):

- `surface.static.dark` → Always #000000 (uses different steps per mode)
- `surface.static.light` → Always #ffffff (uses different steps per mode)

See: `packages/tokens/docs/semantic-colour.md`
