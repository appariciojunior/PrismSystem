---
name: safe-token-edit
description: Safely edit tokens in tokens.json with validation gates. Includes pre-edit checklist, scripted approach, and post-edit validation.
license: MIT
metadata:
  category: editing
  agents: [Architect, Code, Testing]
  autonomy: requires-approval
---

# Safe Token Edit

## Purpose

Safely edit tokens with validation gates. Prevents common mistakes.

## Pre-Edit Checklist

Before ANY edit:

- [ ] Read ARCHITECTURE.md (if exists) for scope
- [ ] Confirm no foundation changes (use palette steps)
- [ ] If dark mode: call `hex_lookup` MCP tool to verify resolved hex
- [ ] Understand the change: restate it back to user
- [ ] Decide target files: typically packages/tokens/src/tokens.json

## Inputs

| Parameter | Type | Required | Description |
| ------------ | ------ | -------- | --------| ------------ | ------ | -------- | --------| ------------ | ------ | -- ye| ------------ | ------ | -------- | ght/ core.text.primary) |
| field | enum | yes | Field to modify: value, description, type |
| new_value | string | yes | New value for the field |
| reason | string | yes | Brief explanation (for commit message) |

## Procedure

### Step 1: Locate Token

```bash
grep -n "token.name" packages/tokens/src/tokens.json | head -5
```

### Step 2: Validate Current Value

```python
import json
with open('packages/tokens/src/tokens.json') as f:
    data = json.load(f)

# Navigate to token
token = data['light/ core']['text']['primary']
print(f"Current: {token}")
```

### Step 3: Governance Check

```
INVOKE: skill/governance/foundation-gate
  If foundation.* token, STOP unless approved

INVOKE: skill/governance/palette-gate
  If palette token, STOP unless approved
```

### Step 4: Make Edit (Scripted)

Use Python/JQ - avoid manual find/replace:

```python
import json

with open('packages/tokens/src/tokens.json') as f:
    data = json.load(f)

# Make change
data['light/ core']['text']['primary']['value'] = '{brand.core.ramp.neutral.900}'

with open('packages/tokens/src/tokens.json', 'w') as f:
    json.dump(data, f, indent=2)
```

### Step 5: Validate

```bash
# JSON syntax
python3 -m json.tool packages/tokens/src/tokens.json > /dev/null && echo "JSON: OK"

# Tests
npm run test:output

# Build
npm run build:output
```

### Step 6: Spot-Check

```bash
grep -A2 -B2 "text.primary" packages/tokens/src/tokens.json | head -20
```

## Dark Mode Edits

ALWAYS check the CSV first:

```js
hex_lookup({ tokenPath: 'ramp.neutral.X', mode: 'dark' });
```

Remember: neutral.50 = black in dark mode, neutral.1000 = white.

## Description Editing Rules

When editing token descriptions, follow semantic abstraction principles:

**NEVER include:**

- ❌ Specific color names (white, black, red, blue)
- ❌ Hex values (#FFFFFF, #000000)
- ❌ Implementation details (neutral.50, error.800, step numbers)
- ❌ Prescriptive UI patterns (confirmation modal, sidebar only)

**ALWAYS use:**

- ✅ Semantic purpose (signals danger, indicates success)
- ✅ Hierarchy description (high-emphasis, medium-emphasis, subtle)
- ✅ Functional context (for interactive elements, in form inputs)
- ✅ Interaction behavior (on hover, during pressed state, when focused)

**Examples:**

```diff
- "Destructive button border. Error color (red) signals critical action."
+ "Border for destructive action buttons. Signals critical actions requiring user attention."

- "Light fill (white) for medium-emphasis danger actions (delete, remove, revoke)."
+ "Background for destructive action buttons. Medium-emphasis visual treatment for actions requiring user confirmation."
```

**Full Guidelines**: See [description-guidelines](description-guidelines.md) skill for complete rules and patterns.

## Forbidden Actions

- DO NOT edit themes or figma\* metadata
- DO NOT modify foundation.\* without approval
- DO NOT use raw hex values in semantic/palette
- DO NOT create docs outside packages/tokens/

## Post-Edit

1. Commit with conventional message: feat(tokens): [description]
2. Update TODO_STATE.md status
3. If behavior differs from plan, pause and show diff to user
4. If >5 themes affected, ensure ARCHITECTURE.md exists

## Error Handling

| Error              | Recovery                                                          |
| ------------------ | ----------------------------------------------------------------- |
| JSON syntax error  | Restore from git: git checkout -- packages/tokens/src/tokens.json |
| Foundation blocked | Use different palette step instead                                |
| Tests fail         | Check for circular refs, revert if needed                         |
