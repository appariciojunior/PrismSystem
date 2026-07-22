# Figma Variables & Tokens Implementation (Agent Reference)

**Source:** Extracted from Figma Help (Update 1: Tokens, variables, and styles)

This is **internalized expert knowledge** for figma-executor agent. Use this as foundational reference for all Figma design token implementation work.

---

## 1. Figma Variables vs. Styles: When to Use Each

### Variables (Primary for Design Tokens)

**Use for:** Design tokens that vary by mode, theme, or context.

**Characteristics:**

- Support multiple modes (Light, Dark, High Contrast)
- Can be bound to component properties
- Enable dynamic theming at design + code level
- Support aliases (variable referencing other variables)
- Resolve in Dev Mode for developer inspection

**Best for:**

- Color tokens (especially theme-aware)
- Spacing tokens (responsive variants)
- Typography tokens (multi-scale systems)
- Any token that needs 2+ mode variants

**Example:**

```
Variable: color/brand/primary
├─ Mode: Light → #0066cc
├─ Mode: Dark → #00ccff
└─ Mode: High Contrast → #000080
```

### Styles (Secondary)

**Use for:** Non-variable design attributes (deprecated in favor of variables).

**Characteristics:**

- One value per style
- No mode support
- Good for shared text styles, grid styles
- Gradually being replaced by variables

**Best for:**

- Typography (when no mode variants needed)
- Grid layouts (layout grid styles)
- Effects (shadows, blurs)
- Transitional use (convert to variables when possible)

### Decision Matrix

| Need                       | Use           | Why                                  |
| -------------------------- | ------------- | ------------------------------------ |
| Theme support (light/dark) | **Variables** | Only variables support modes         |
| Component property binding | **Variables** | Styles can't bind to component props |
| Single value, no variants  | **Either**    | Use variables for consistency        |
| Typography scale           | **Variables** | Future-proof, supports scaling       |
| Grid/guides                | **Styles**    | No theme variance needed             |

---

## 2. Variables Collection Architecture

### Hierarchy & Structure

**Best practice:** Mirror token layer architecture

```
Design System Variables/
│
├── color/
│   ├── foundation/
│   │   ├── blue-50
│   │   ├── blue-100
│   │   ├── blue-500
│   │   ├── blue-900
│   │   ├── neutral-50
│   │   ├── neutral-500
│   │   └── neutral-1000
│   │
│   ├── palette/
│   │   ├── brand
│   │   ├── brand-light
│   │   ├── neutral-background
│   │   ├── neutral-text
│   │   ├── status/
│   │   │   ├── success
│   │   │   ├── error
│   │   │   └── warning
│   │   └── feedback/
│   │       └── disabled
│   │
│   └── semantic/
│       ├── button/
│       │   ├── primary
│       │   ├── primary-hover
│       │   ├── primary-disabled
│       │   ├── secondary
│       │   └── secondary-hover
│       ├── text/
│       │   ├── default
│       │   ├── muted
│       │   └── inverted
│       └── surface/
│           ├── background-primary
│           └── background-secondary
│
├── space/
│   ├── foundation/
│   │   ├── 4px
│   │   ├── 8px
│   │   ├── 12px
│   │   ├── 16px
│   │   └── 24px
│   │
│   ├── palette/
│   │   ├── inset-xs
│   │   ├── inset-sm
│   │   ├── inset-md
│   │   └── inset-lg
│   │
│   └── semantic/
│       ├── button-padding
│       ├── card-gap
│       └── section-padding
│
└── typography/
    ├── foundation/
    │   ├── font-family-sans
    │   ├── font-size-12
    │   ├── font-size-16
    │   └── font-weight-700
    │
    ├── palette/
    │   ├── heading-large
    │   ├── heading-small
    │   ├── body-default
    │   └── body-small
    │
    └── semantic/
        ├── button-text
        ├── card-title
        └── body-default
```

### Naming Rules in Figma

1. **Group Separator:** Use `/` (slash)
   - ✅ `color/brand/primary`
   - ❌ `color_brand_primary` or `color-brand-primary` (for groups)

2. **Individual Variable Names:** Use kebab-case
   - ✅ Variable name: `primary`
   - Full path: `color/brand/primary`

3. **Consistency:** Variable names match token system exactly
   - Token: `color-brand-primary`
   - Figma group: `color/brand`
   - Figma variable: `primary`

4. **No Abbreviations:** Use full names for discoverability
   - ✅ `color/background-primary`
   - ❌ `color/bg-prim`

---

## 3. Modes: Light & Dark Theme Implementation

### Mode Setup Process

1. **Create collection** with mode support
   - Collection name: `Design System Variables`
   - First mode: `Light` (becomes default)
   - Add mode: `Dark`

2. **Set foundation tokens** (same in all modes)

   ```
   Mode: Light & Dark (both)
   color/foundation/blue-500 = #0066cc
   color/foundation/neutral-50 = #ffffff
   ```

3. **Set palette tokens** (mode-dependent for neutrals)

   ```
   Mode: Light
   color/palette/background = color/foundation/neutral-50
   color/palette/text = color/foundation/neutral-1000

   Mode: Dark
   color/palette/background = color/foundation/neutral-1000
   color/palette/text = color/foundation/neutral-50
   ```

4. **Set semantic tokens** (reference palette)
   ```
   Mode: Light & Dark (both, because they ref palette)
   color/semantic/button-primary = color/palette/brand
   color/semantic/text-default = color/palette/text
   ```

### Critical: Neutral Ramp Reversal

**Light Mode View:**

- `color/foundation/neutral-50` → white (lightest, for backgrounds)
- `color/foundation/neutral-1000` → black (darkest, for text)

**Dark Mode View:**

- `color/foundation/neutral-50` → mapped to black (appears as darkest)
- `color/foundation/neutral-1000` → mapped to white (appears as lightest)

**In Figma tokens:**

```json
{
  "color/foundation/neutral-50": "#ffffff",
  "color/foundation/neutral-1000": "#000000"
}
```

The **palette layer** handles the reversal:

```json
"$themes": [
  {
    "name": "light",
    "color/palette/background": "color/foundation/neutral-50",
    "color/palette/text": "color/foundation/neutral-1000"
  },
  {
    "name": "dark",
    "color/palette/background": "color/foundation/neutral-1000",
    "color/palette/text": "color/foundation/neutral-50"
  }
]
```

### Using Modes in Components

**In component instances:**

1. Apply variables to fills/strokes
2. Toggle mode in prototype mode
3. Component automatically switches colors

**In Dev Mode:**

```
User switches to "Dark" mode
→ All variables resolve to dark values
→ Developer can inspect actual color being used
```

---

## 4. Applying Variables to Components

### Best Practices for Component Properties

#### Don't Over-Bind

```
❌ WRONG
- Button background: color/semantic/button-primary
- Button border: color/semantic/button-primary-border
- Button shadow: color/semantic/button-primary-shadow
- Button text: color/semantic/button-primary-text
→ Component has 4 variable bindings for one button style

✅ CORRECT
- Button background: color/semantic/button-primary (only)
- Button text: color/semantic/text-default
→ Component has 2 variable bindings (minimal, reusable)
```

**Why:** Over-binding reduces reusability and creates maintenance overhead.

#### Bind at the Right Level

```
❌ WRONG
- Each button variant (primary, secondary) has different variable bindings

✅ CORRECT
- Primary button → fill = color/semantic/button-primary
- Secondary button → fill = color/semantic/button-secondary
- Buttons inherit text color from instance context
```

#### Use Component Properties for Semantic Mapping

```
Component: Button
├─ Property: "Variant" (dropdown)
│  ├─ Option: Primary
│  ├─ Option: Secondary
│  └─ Option: Tertiary
│
└─ Property: "State" (dropdown)
   ├─ Option: Default
   ├─ Option: Hover
   └─ Option: Disabled

→ Use component properties to switch which semantic tokens are active
```

### Variable Assignment in Dev Mode

Developers can inspect:

- Which variable is bound to which property
- The resolved value (hex for colors)
- The mode (Light/Dark) currently active
- Fallback values

---

## 5. Variable Aliases: Reference Pattern

### Aliasing at Palette Layer

**Foundation:**

```
color/foundation/blue-500 = #0066cc
```

**Palette creates alias:**

```
color/palette/brand = color/foundation/blue-500
```

**Figma Setup:**

1. Create `color/foundation/blue-500` with value `#0066cc`
2. Create `color/palette/brand`
3. Set value to: `{color/foundation/blue-500}` (reference)

### Aliasing at Semantic Layer

**Palette:**

```
color/palette/brand = #0066cc
```

**Semantic creates alias:**

```
color/semantic/button-primary = color/palette/brand
```

### Benefits

- Changes to `color/palette/brand` automatically cascade
- Developers can trace token references in Dev Mode
- Supports complex mappings (primary might change across themes)

### Anti-Pattern: Deep Nesting

```
❌ WRONG
color/button/primary → color/status/primary → color/brand → #0066cc
(4 levels of aliasing = hard to trace, slow resolution)

✅ CORRECT
color/button/primary → color/brand  (2 levels max)
```

---

## 6. Syncing Design Tokens to Code

### Design-to-Code Workflow

1. **Source of Truth:** Design tokens in Figma variables
2. **Export:** Figma → JSON/CSS/Tokens Studio format
3. **Version Control:** Commit exported tokens to repo
4. **Build Pipeline:** Convert to format needed (CSS, Tailwind, etc.)
5. **Code:** Developers use tokens in components

### Figma Dev Mode Integration

**Developers see:**

- Resolved variable values (hex colors, px sizes)
- Component property bindings
- Mode-dependent values
- Documentation for each variable

### Anti-Patterns in Export

```
❌ DON'T
- Export foundation AND palette AND semantic (redundant)
- Export with hardcoded hex values (lose reference path)
- Export with Figma IDs instead of token names

✅ DO
- Export complete hierarchy (foundation → palette → semantic)
- Preserve variable references/aliases in export
- Use token names as identifiers
```

---

## 7. Collection Publishing & Library Sharing

### Publishing Variables (Team Libraries)

1. **Create a library file** with variables collection
2. **Publish** for team access
3. **Update library** when tokens change
4. **Link library** in consumer files

### Protecting Variables

```
❌ DON'T expose to consumers:
- Foundation layer internals (rarely changed)
- Deprecated tokens (confuse users)

✅ DO expose to consumers:
- Palette tokens (semantic meaning)
- Semantic tokens (immediate use)
- Component variables (binding)
```

### Version Management

- Figma automatically tracks changes
- Can rollback to previous versions
- Document breaking changes in release notes

---

## 8. Performance & Maintenance

### Collection Size Best Practices

- **Optimal:** 50-150 variables per collection
- **Maximum:** 500 variables before slowdown
- **Split strategy:** Separate collections for different scales (e.g., color vs. spacing)

### Updating Existing Variables

1. **Change value:** Affects all instances using it
2. **Rename variable:** Updates references automatically
3. **Add mode:** Requires values for all existing modes
4. **Remove mode:** Archived, cannot be undone without version history

### Cleanup Checklist

- [ ] Remove unused variables (test in all files first)
- [ ] Consolidate duplicate aliases
- [ ] Rename for clarity (follow naming patterns)
- [ ] Document breaking changes in changelog

---

## 9. Checklist: Before Publishing Variables to Figma

### Foundation Layer

- [ ] All values are raw (hex, px, weights, no references)
- [ ] Naming: `category-color-number` (blue-500, neutral-50)
- [ ] No circular references
- [ ] Same in all modes (foundation never varies)

### Palette Layer

- [ ] All values reference ONLY foundation
- [ ] Semantic naming (brand, status-success, text-primary)
- [ ] Mode-dependent mappings documented (light/dark reversal)
- [ ] No direct hex values

### Semantic Layer

- [ ] All values reference ONLY palette
- [ ] Component/usage-specific naming (button-primary, card-padding)
- [ ] Clear intent in name (not value-based)
- [ ] Grouped logically by usage

### Figma Structure

- [ ] Collection hierarchy matches token layers
- [ ] Variable names use kebab-case
- [ ] Group paths use `/` separator
- [ ] Modes created: Light (default), Dark
- [ ] Mode values assigned and verified

### Testing

- [ ] All variables resolve in all modes
- [ ] Aliases work correctly (check resolved values)
- [ ] Component bindings apply correctly
- [ ] Dev Mode shows correct values and names

---

## 10. Quick Reference: Variable Implementation Checklist

```
NEW VARIABLE TASK:
├─ Step 1: Determine layer
│  ├─ Foundation? (raw value)
│  ├─ Palette? (refs foundation)
│  └─ Semantic? (refs palette)
│
├─ Step 2: Name according to pattern
│  └─ category/layer-concept/property-modifier
│
├─ Step 3: Create in Figma
│  ├─ Add to correct collection
│  ├─ Place in correct group (/color/brand/, etc.)
│  └─ Create variable with kebab-case name
│
├─ Step 4: Set values
│  ├─ Foundation: literal hex/px/weight
│  ├─ Palette/Semantic: reference other variables
│  └─ Test all modes (Light, Dark)
│
└─ Step 5: Bind & Test
   ├─ Apply to components (if semantic)
   ├─ Test in prototype mode
   ├─ Inspect in Dev Mode
   └─ Verify resolved values match intent
```

---

## Reference

Source: Figma Help (Update 1: Tokens, variables, and styles)

- Variables collections & modes documentation
- Component property binding guide
- Dev Mode integration guide

---

**Document Status:** Reference material for figma-executor agent. Becomes primary source for Figma implementation decisions.
