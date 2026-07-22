---
name: Token Change Request
about: Structured request for design token updates
title: '[tokens] '
labels: tokens
assignees: ''
---

## Task

<!-- Brief one-line description of the change -->

## Scope

### Tokens

<!-- List exact token paths to be modified -->

- [ ] `Foundation.viewport.multiplier.*`
- [ ] `Viewport/ Small.fontSize*`
- [ ] Other: \***\*\_\_\_\*\***

### Docs

<!-- Files/sections requiring updates -->

- [ ] `packages/tokens/design-token-framework.md` → \***\*\_\_\*\*** section
- [ ] `packages/tokens/styleguide.md` → \***\*\_\_\*\*** section
- [ ] Other: \***\*\_\_\_\*\***

## Constraints

- [ ] **Single source of truth**: \***\*\_\_\_\*\*** (which file/section is authoritative?)
- [ ] **No Token Studio schema changes** (only values/descriptions)
- [ ] **Backward compatibility required** / Breaking change acceptable
- [ ] **Figma export compatibility** verified

## Changes Required

<!-- Specific value changes, ranges, examples to update -->

**Before:**

```json
{
  "viewport.multiplier.small": {
    "value": "1.0",
    "description": "Old range"
  }
}
```

**After:**

```json
{
  "viewport.multiplier.small": {
    "value": "1.0",
    "description": "New range"
  }
}
```

## Acceptance Criteria

- [ ] Values updated in `tokens.json`
- [ ] Examples updated in framework doc
- [ ] Deprecated/conflicting docs removed or marked
- [ ] JSON validation passes: `python3 -m json.tool tokens.json > /dev/null`
- [ ] No legacy values remain: `grep -R "441\|1025\|1441" packages/tokens || echo "✅ Clean"`
- [ ] Token Studio can parse file without errors

## Validation Commands

```sh
# Validate JSON structure
python3 -m json.tool packages/tokens/src/tokens.json > /dev/null

# Check for legacy values (customize pattern)
grep -R "OLD_VALUE" packages/tokens -n || echo "✅ No legacy values found"

# Preview changes
git diff packages/tokens/src/tokens.json
git diff packages/tokens/design-token-framework.md
```

## Deliverables

- [ ] Patched `tokens.json`
- [ ] Updated documentation
- [ ] Commit message following template:

```
tokens: <concise summary>

- tokens.json: <what changed>
- framework: <what changed>
- docs: <what changed>

Refs: <relevant doc sections>; Token Studio-safe
```

## Context / Rationale

<!-- Why is this change needed? Link to design specs, Figma files, or issues -->

## Related Issues/PRs

<!-- Link to related work -->

Closes #**_
Relates to #_**
