---
name: constraint-reference
description: Complete reference of token system constraints and violations. Invoke when validating changes or unsure about rules.
license: MIT
metadata:
  category: governance
  agents: [Architect, Code, Testing]
  autonomy: autonomous
---

# Constraint Reference

## Purpose

Complete reference of non-negotiable rules. Briefs contain the critical 3; this has the full list.

## Critical Violations (Auto-Reject)

### 1. Dark Mode Ramp Reversal

Dark mode neutral ramps are REVERSED:

- Light: neutral.50 = #ffffff (white), neutral.1000 = #000000 (black)
- Dark: neutral.50 = #000000 (black), neutral.1000 = #ffffff (white)

```
WRONG: Dark mode text.primary = {brand.core.ramp.neutral.50}
       (BLACK text on dark background - no contrast!)

RIGHT: Dark mode text.primary = {brand.core.ramp.neutral.1000}
                                                                             : C                                     -reference.csv

### 2. Foundation Layer Protection

NEVER modify foundation.* tokens without explicit approval.
- Use different palette STEP instead
- If must change foundation: get human approval + PR label foundation-change

### 3. Documentation Location

ALL token docs MUST be in packages/tokens/ or subdirectories.

```

WRONG: /docs/tokens/guide.md, /reference/naming.md
RIGHT: /packages/tokens/docs/guide.md, /packages/tokens/.agents/

```

### 4. Circular References

Token A to B to C to A = infinite loop = build fails.
Detection: npm run test:output

### 5. Semantic to Foundation Direct Reference

Semantic tokens MUST reference Palette, never Foundation directly.

```

WRONG: light/ core.text.primary = {foundation.brand.black}
RIGHT: light/ core.text.primary = {brand.core.ramp.neutral.1000}

```

### 6. Font Weight Format

Font weights MUST be strings, not numbers.

```

WRONG: "fontWeight": 700
RIGHT: "fontWeight": "Bold"

```

### 7. Raw Hex Values in Semantic/Palette

No hardcoded hex in Palette or Semantic layers.

```

WRONG: "value": "#000000"
RIGHT: "value": "{brand.core.ramp.neutral.1000}"

````

### 8. Themes Metadata

NEVER modify themes, figmaCollectionId, figmaModeId, or figmaVariableReferences.
If output is wrong, fix build scripts not tokens.json.

### 9. Figma Variable Scope Correctness

Token `$extensions.com.figma.scopes` MUST match the contract in `semantic-tokens.md`:

| Token suffix pattern | Required scopes |
| -------------------- | --------------- |
| `*.icon` | `["FRAME_FILL", "STROKE_COLOR", "SHAPE_FILL"]` |
| `*.fill` | `["FRAME_FILL", "SHAPE_FILL"]` |
| `*.text`, `*.label.*` | `["TEXT_FILL"]` |
| `*.border`, `*.stroke` | `["STROKE_COLOR"]` |

```
WRONG: *.icon scoped as ["TEXT_FILL"]  (copied verbatim from wrong source)
RIGHT: *.icon scoped as ["FRAME_FILL", "STROKE_COLOR", "SHAPE_FILL"]
```

**Critical failure mode:** bulk rollout scripts copy a source theme verbatim.
If the source had wrong scopes, *all copies inherit the defect* and a
uniformity-only audit returns a false PASS.

Quick check (run after any bulk rollout):

```bash
python3 - <<'EOF'
import json, re, sys
d = json.load(open('packages/tokens/src/tokens.json'))
RULES = {
    r'\.icon$': ['FRAME_FILL', 'STROKE_COLOR', 'SHAPE_FILL'],
    r'\.fill(\.|$)': ['FRAME_FILL', 'SHAPE_FILL'],
    r'\.(text|label)(\.|$)': ['TEXT_FILL'],
}
errors = []
def walk(node, path=''):
    if isinstance(node, dict):
        if 'value' in node:
            got = node.get('$extensions', {}).get('com.figma.scopes', [])
            for pat, exp in RULES.items():
                if re.search(pat, path) and sorted(got) != sorted(exp):
                    errors.append(f'{path}: expected {exp}, got {got}')
            return
        for k, v in node.items():
            if not k.startswith('$'):
                walk(v, f'{path}.{k}' if path else k)
for t in d:
    walk(d[t])
print('PASS' if not errors else f'FAIL: {len(errors)} scope errors')
[print(' ', e) for e in errors[:10]]
EOF
```

## Changelog Worthiness

### Changelog-Worthy Changes
- Token renamed, added, or removed
- Token value changed
- New semantic category added

### NOT Changelog-Worthy
- Description updates
- Comment changes
- Formatting/whitespace

## Validation Commands

```bash
# JSON syntax
python3 -m json.tool packages/tokens/src/tokens.json > /dev/null

# Tests
npm run test:output

# Build
npm run build:output

# Check for foundation changes
git diff HEAD~1 -- packages/tokens/src/tokens.json | grep -E '"foundation\.'
````

## Quick Decision Tree

```
Is change to foundation.* ?
  STOP. Use palette step instead.

Is it dark mode color?
  Check CSV for actual hex. Ramps are REVERSED.

Is it semantic token?
  Must reference Palette (brand.core.ramp.*), not Foundation.

Creating documentation?
  Must be in packages/tokens/
```
