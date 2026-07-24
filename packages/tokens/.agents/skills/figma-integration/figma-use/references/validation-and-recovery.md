# Validation Workflow & Error Recovery

> Part of the [figma-use skill](../SKILL.md). How to debug, validate, and recover from errors.

## Contents

- `get_metadata` vs `get_screenshot`
- Error Recovery After Failed Script
- Recommended Workflow

---

## `get_metadata` vs `get_screenshot`

After each script call, validate results using the right tool. Do NOT reach for `get_screenshot` every time — it is expensive and should be reserved for visual checks.

### `get_metadata` — Use for intermediate validation (preferred)

Returns an XML tree of node IDs, types, names, positions, and sizes. Use to confirm:

- **Structure & hierarchy**: correct parent-child relationships, component nesting, section contents
- **Node counts**: expected number of variants created, children present
- **Naming**: variant property names follow the `property=value` convention
- **Positioning & alignment**: x/y coordinates, width/height values match expectations
- **Layout properties**: auto-layout direction, sizing mode, padding, spacing
- **Component set membership**: all expected variants are inside the ComponentSet

**When to use `get_metadata`:**
- After creating/modifying nodes — to verify structure, counts, and names
- After layout operations — to verify positions and dimensions
- After combining variants — to confirm all components are in the ComponentSet
- After binding variables — to verify node properties
- Between multi-step workflows — to confirm step N succeeded before starting step N+1

### `get_screenshot` — Use after each major creation milestone

`get_screenshot` renders a pixel-accurate image. It is the only way to verify visual correctness (colors, typography rendering, effects, variable mode resolution). It is slower, so don't call it after every single script — but do call it after each major milestone.

**When to use `get_screenshot`:**
- **After creating a component set** — verify variants look correct, grid is readable, nothing collapsed or overlapping
- **After composing a layout** — verify overall structure and spacing
- **After binding variables/modes** — verify colors and tokens resolved correctly
- **After any fix or recovery** — verify the fix didn't introduce new visual issues
- **Before reporting results to the user** — final visual proof

**What to look for in screenshots — most commonly missed issues:**
- **Cropped/clipped text** — line heights or frame sizing cutting off descenders, ascenders, or entire lines
- **Overlapping content** — elements stacking due to incorrect sizing or missing auto-layout
- **Placeholder text** still showing ("Title", "Heading", "Button") instead of actual content

---

## Error Recovery After Failed Script

**Scripts are atomic — failed scripts do not execute.** If a script errors, no changes are made to the file. File remains in exactly the same state. Retrying after a fix is safe.

**Recovery steps when a script returns an error:**
1. **STOP — do NOT immediately fix the code and retry.** Read the error message carefully first.
2. **Understand the error.** Most errors are caused by wrong API usage, missing font loads, invalid property values, or referencing nodes that don't exist.
3. **If the error is unclear**, call `get_metadata` or `get_screenshot` to understand the current file state and confirm nothing has changed.
4. **Fix the script** based on the error message.
5. **Retry** the corrected script.

### When the script succeeds but the result looks wrong

1. Call `get_metadata` to check structural correctness (hierarchy, counts, positions).
2. Call `get_screenshot` to check visual correctness. Look closely for cropped/clipped text and overlapping elements — these are common and easy to miss.
3. Identify the discrepancy — is it structural (wrong hierarchy, missing nodes) or visual (wrong colors, broken layout, clipped content)?
4. Write a targeted fix script that modifies only the broken parts — don't recreate everything.

---

## Recommended Workflow

```
1. script call    →  Create/modify nodes
2. get_metadata   →  Verify structure, counts, names, positions (fast, cheap)
3. script call    →  Fix any structural issues found
4. get_metadata   →  Re-verify fixes
5. ... repeat as needed ...
6. get_screenshot →  Visual check after each major milestone

⚠️ ON ERROR at any step:
   a. Read the error message carefully
   b. get_metadata / get_screenshot  →  If the error is unclear, inspect file state
   c. Fix the script based on the error
   d. Retry the corrected script (safe — failed scripts don't modify the file)
```
