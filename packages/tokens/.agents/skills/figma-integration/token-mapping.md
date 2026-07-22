---
name: token-mapping
description: Methodology for mapping Figma design values to design system tokens dynamically using tokens.json as source of truth, with FOM 2026 MCP-aware guidance for component properties and variable bindings.
license: MIT
metadata:
  category: figma-integration
  agents: [Architect, Code, Testing]
  autonomy: autonomous
  portable: true
---

# Token Mapping Methodology

## Purpose

Map raw Figma design values (hex colors, pixel values) to semantic design tokens. This is a **methodology**, not a lookup table—tokens vary by design system.

## Critical Rule

**There is only one source of truth: `packages/tokens/src/tokens.json`.**
Design System Token MCP is a search/audit layer over that same file.

## Design System Token MCP Fast Path

Use Design System Token MCP to accelerate discovery before broad file scans.

- Start with `search_tokens` for intent-first candidate discovery.
- Confirm exact token path/value/layer/mode with `token_lookup`.
- Use `audit_design_system` when quality/risk checks are needed across a token group.
- Freshness note: `token_lookup` reads `tokens.json` directly per call, while `search_tokens`/`audit_design_system` use an in-process cache keyed by `tokens.json` mtime for speed.
- Keep boundaries strict: Token MCP is for discovery and audit, `tokens.json` is final authority, and Figma Console MCP performs Figma execution.
- All Token MCP results are derived from `tokens.json`; if a result looks inconsistent, re-run `token_lookup` (direct read) and verify the path in `tokens.json`.

## FOM 2026 MCP Mapping Notes

- Slot-like intent in Figma must map to public component property APIs (`TEXT`, `BOOLEAN`, `INSTANCE_SWAP`) via `componentPropertyDefinitions`, `componentProperties`, and `setProperties`.
- Do not use undocumented "native slot" symbols in mapping logic.
- Typography token mapping that needs variable control should bind with `setBoundVariable` (node-wide) or `setRangeBoundVariable` (range-specific) using `VariableBindableTextField`.
- Grid spacing token mapping can bind node fields such as `gridRowGap` and `gridColumnGap` where variable binding is required.
- For REST-based variable pipelines: use local/published GET endpoints for reads and POST variables for all writes.

## Variable Read Reliability Note

For deterministic variable reads during multi-file bridge sessions, prefer explicit `fileUrl` in `figma_get_variables` calls.

If token-summary/value calls are empty but node extraction shows variable aliases, re-run `figma_get_variables` with explicit `fileUrl` and `refreshCache: true`.

Runtime policy source: `./design-extraction.md` (see "Deterministic Variable Reads (Multi-File Sessions)").

---

## Token Architecture (Universal Pattern)

Most design systems follow a 3-layer architecture:

```text
Foundation (primitives)     →  Palette (ramps/scales)  →  Semantic (usage)
   Raw values                   Brand variations          Component tokens
   #0064FF                      brand.digital.600         interactive.primary.fill.default
   16px                         fontSize.020              typography.body.base
```

**Rule**: Components use SEMANTIC tokens. Never reference Foundation directly.

---

## Discovery Methodology

### Step 1: Discover Token Structure

Before mapping ANY values, understand the design system's token structure:

```bash
# What token categories exist?
jq 'keys' packages/tokens/src/tokens.json

# Common semantic categories (varies by system):
# "light/ core", "dark/ core" - semantic color tokens
# "viewport/ small" etc - responsive tokens
# "foundation" - primitive values
# "typographyTokens" - typography compositions
```

### Step 2: Find Semantic Token Categories

```bash
# What semantic groupings exist for colors?
jq '.["light/ core"] | keys' packages/tokens/src/tokens.json

# Common groups: surface, text, icon, border, interactive, feedback, input, tag
```

### Step 3: Explore Token Paths Within Categories

```bash
# Interactive tokens structure
jq '.["light/ core"].interactive | keys' packages/tokens/src/tokens.json

# Surface tokens
jq '.["light/ core"].surface | keys' packages/tokens/src/tokens.json

# Text tokens
jq '.["light/ core"].text | keys' packages/tokens/src/tokens.json
```

### Step 4: Verify Token Exists in Both Modes

```bash
# Check light mode
jq '.["light/ core"].interactive.primary.fill' packages/tokens/src/tokens.json

# Check dark mode (must exist for theming)
jq '.["dark/ core"].interactive.primary.fill' packages/tokens/src/tokens.json
```

---

## Mapping Workflow (Per Component)

### 1. Extract Figma Values

From Figma MCP extraction:

```yaml
button:
  fill: '#0064FF'
  text: '#FFFFFF'
  padding: '12px 24px'
  fontSize: '16px'
  borderRadius: '6px'
```

### 2. Determine Semantic Category

Ask: "What is this value's PURPOSE?"

| If the value is for...   | Look in category...                  |
| ------------------------ | ------------------------------------ |
| Backgrounds/fills        | `surface.*` or `interactive.*.fill`  |
| Text colors              | `text.*` or `interactive.*.text`     |
| Borders/outlines         | `border.*` or `interactive.*.border` |
| Feedback (error/success) | `feedback.*`                         |
| Icons                    | `icon.*`                             |
| Form fields              | `input.*`                            |

### 3. Search tokens.json

```bash
# Find all tokens containing "primary"
grep -n "primary" packages/tokens/src/tokens.json | head -20

# Find all tokens with a specific hex value
grep -n "#0064FF" packages/tokens/src/tokens.json

# Find spacing-related tokens
jq '.["viewport/ small"].spacing' packages/tokens/src/tokens.json
```

### 4. Build Mapping Table (Per Component)

Document the mapping for YOUR component:

```markdown
| Figma Value | Semantic Purpose    | Token Path                       | Verified |
| ----------- | ------------------- | -------------------------------- | -------- |
| #0064FF     | Primary button fill | interactive.primary.fill.default | ✓        |
| #FFFFFF     | Primary button text | interactive.primary.text.default | ✓        |
| 12px        | Vertical padding    | spacing.fluid.200                | ✓        |
| 24px        | Horizontal padding  | spacing.fluid.400                | ✓        |
```

### 5. Convert to CSS Variables

Token path → CSS variable naming convention (varies by build system):

```text
interactive.primary.fill.default
    → --interactive-primary-fill-default

spacing.fluid.200
    → --spacing-fluid-200
```

Check globals.css for exact variable names.

---

## Common Semantic Patterns

These patterns are common across design systems (verify against tokens.json):

### Color Tokens (Semantic Level)

```text
surface.canvas          - main background
surface.level-{n}       - elevation backgrounds
text.primary            - main text
text.secondary          - subdued text
text.inverse            - text on dark backgrounds
interactive.*.fill.*    - button/control backgrounds
interactive.*.text.*    - button/control text
feedback.{type}.*       - error/success/warning/info
border.primary          - main borders
border.focus            - focus indicators
```

### Spacing Tokens

```text
spacing.static.*        - fixed spacing (doesn't scale)
spacing.fluid.*         - responsive spacing (scales with viewport)
```

### Typography Tokens

```text
typography.*.fontFamily
typography.*.fontSize
typography.*.fontWeight
typography.*.lineHeight
```

---

## Dark Mode Considerations

**CRITICAL**: Many systems REVERSE neutral ramps in dark mode.

```text
Light mode: neutral.50 = lightest (#FFFFFF)
Dark mode:  neutral.50 = darkest (#000000) ← REVERSED!
```

**Solution**: Always use SEMANTIC tokens, not palette ramps.

```css
/* ✅ Correct - semantic token adapts to mode */
color: var(--text-primary);

/* ❌ Wrong - palette reference may break in dark mode */
color: var(--brand-neutral-900);
```

---

## When Tokens Don't Match

If a Figma value has no exact token:

1. **Find nearest token** in the scale
2. **Document the deviation** in component code
3. **Flag for design review** - is the design aligned with the token system?
4. **Never hardcode** - use nearest token, never raw values

```css
/* Figma shows 10px, token scale has 8px and 12px */
/* Using 8px (spacing.xs) per token scale - flagged for design review */
gap: var(--spacing-xs);
```

---

## Validation Checklist

Before finalizing token mapping:

- [ ] Token exists in tokens.json
- [ ] Token exists in BOTH light and dark modes
- [ ] CSS variable is available in globals.css
- [ ] Semantic meaning matches component usage
- [ ] No hardcoded values in component
