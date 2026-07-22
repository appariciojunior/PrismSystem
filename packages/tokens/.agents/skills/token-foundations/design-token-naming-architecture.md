# Design Token Naming Architecture (Agent Reference)

**Source:** Extracted from 8 industry sources (Always Twisted, Netguru, Smashing, Smart Patterns, Contentful, RedHat, Design System Guide)

This is **internalized expert knowledge** for both agents. Use this as foundational reference before planning token changes. This guide is tool-agnostic; tool-specific implementation patterns are covered in separate implementation guides.

---

## 1. Three-Tier Token Architecture

All industry sources converge on **3-layer hierarchy**:

### Layer 1: Foundation (Global/Primitive)

- **What:** Raw values with no semantic meaning
- **Naming:** `color-blue-500`, `space-8px`, `weight-700`
- **Characteristics:**
  - Direct hex colors, absolute sizes, exact values
  - No team/context dependency
  - Language: brand color names or numeric scales
- **Scope:** Never change without full audit (breaks everything below)
- **Example (RedHat):** `color-blue-500: #0066cc`

### Layer 2: Palette (Alias/Semantic Reference)

- **What:** Semantic meaning layer; references foundation only
- **Naming:** `color-brand`, `color-neutral-background`, `space-section-gap`
- **Characteristics:**
  - Maps foundation to intent (not direct values)
  - Single responsibility: map ONE foundation token
  - Can be theme-dependent (light/dark mode)
  - Survives design changes (foundation → palette updates)
- **Scope:** Change when brand/theme shifts
- **Example (RedHat):** `color-brand: {light: color-blue-500, dark: color-blue-200}`

### Layer 3: Semantic/Component

- **What:** Usage-specific meaning
- **Naming:** `color-button-primary`, `color-status-success`, `space-component-grid-gap`
- **Characteristics:**
  - Maps palette layer (never foundation directly)
  - Describes **intent and context**
  - Component/feature-scoped
  - Most frequently referenced in implementations
- **Scope:** Change when component behavior/meaning shifts
- **Example (Netguru):** `color-button-primary: color-brand` → `color-button-primary: color-brand-light` (in dark mode)

---

## 2. Token Naming Patterns (CTI + Tier Hierarchy)

### Tier-Based Hierarchy Pattern

**Structure:** `[layer]-[category]-[concept]-[property]-[modifier]`

#### Foundation Layer

```
color-blue-500
color-red-100
space-8px
weight-700
```

#### Palette Layer

```
color-brand              # primary brand color
color-brand-light       # brand variant for light context
color-neutral-text      # text on neutral backgrounds
color-status-success    # semantic: means success
color-status-error      # semantic: means error
space-component-padding # component-scoped spacing
```

#### Semantic/Component Layer

```
color-button-primary              # button primary state
color-button-primary-hover        # button primary hover
color-button-disabled-background  # button disabled background
color-status-badge-success        # success badge text
space-button-internal-padding     # button internal space
```

### CTI (Category-Type-Item) Pattern

**Alternative structure:** `[category]/[type]/[item]`

```
color/brand/primary
color/status/success
typography/heading/large
space/inset/section
```

---

## 3. Naming Best Practices

### ✅ DO: Semantic & Intent-Based Naming

**Good:**

- `color-button-primary` (intent: button primary state)
- `space-section-gap` (intent: space between sections)
- `color-status-success` (intent: communicates success)

**Why:** Survives design changes. If primary button becomes red or green, only the mapping changes, not the reference.

### ❌ DON'T: Value-Based or Descriptive Naming

**Bad:**

- `color-blue-500` at semantic layer (couples intent to value; breaks if design changes)
- `space-24px` at semantic layer (brittle; if spacing changes to 25px, all refs break)
- `button-color` (too vague; which button? what state?)

**Why:** Breaks when values change. Forces rework across entire system.

### Consistency Rules

1. **Singular vs. Plural:** Use **singular** at all layers
   - ✅ `color-status`, not `colors-statuses`
   - ✅ `space-inset`, not `spaces-insets`

2. **Kebab-case:** All tokens use kebab-case
   - ✅ `color-button-primary`
   - ❌ `colorButtonPrimary` or `color_button_primary`

3. **Hierarchy Depth:** 3-4 levels maximum
   - ✅ `color-status-success-light`
   - ❌ `color-status-feedback-positive-light-contrast-accessible`

4. **Category First:** Always start with category (color, space, typography)
   - ✅ `color-brand`, `space-button-padding`, `typography-heading`
   - ❌ `brand-color`, `button-padding-space`

---

## 4. Dark Mode & Theme Architecture

### Neutral Ramp Reversal (Critical)

**Light Mode:**

```
neutral-50   → #ffffff (white, lightest)
neutral-500  → #777777 (mid-gray)
neutral-1000 → #000000 (black, darkest)
```

**Dark Mode:**

```
neutral-50   → #000000 (black, appears as darkest)
neutral-500  → #777777 (mid-gray, same)
neutral-1000 → #ffffff (white, appears as lightest)
```

**Why:** In dark mode, the ramp is inverted. `neutral-50` becomes black to provide darkest background.

### Theme Mapping Strategy

#### Foundation Layer (Unchanged)

```json
{
  "color-neutral-50": "#ffffff",
  "color-neutral-1000": "#000000"
}
```

#### Palette Layer (Theme-Dependent)

```json
{
  "$themes": [
    {
      "name": "light",
      "color-background-primary": "color-neutral-50",
      "color-text-primary": "color-neutral-1000"
    },
    {
      "name": "dark",
      "color-background-primary": "color-neutral-1000",
      "color-text-primary": "color-neutral-50"
    }
  ]
}
```

#### Semantic Layer (References Palette)

```json
{
  "color-button-primary": "color-brand",
  "color-text-default": "color-text-primary"
}
```

### Best Practices for Themes

1. **Foundation**: Universal (no theme variants)
2. **Palette**: Theme-aware (light/dark modes here)
3. **Semantic**: Neutral to palette (use at all times)

---

## 5. Semantic Token Patterns (Netguru Model)

### Tier Structure (3-Layer Semantic Approach)

```
Global → Alias → Component
  ↓        ↓         ↓
Value   Meaning   Usage
```

#### Global Tokens (Foundation)

```
color-blue-600
space-16px
font-weight-600
```

#### Alias Tokens (Palette)

```
color-primary: color-blue-600
color-surface: color-neutral-50
space-md: space-16px
```

#### Component Tokens (Semantic)

```
button-primary-background: color-primary
button-primary-text: color-text-primary
card-padding: space-md
```

### Decision Tree: When to Create Semantic Tokens

1. **Is this used in 2+ places?** → Create semantic token
2. **Is this intent-based?** (success, danger, primary) → Create semantic token
3. **Is this component-specific?** → Create component semantic token
4. **Is this a one-off value?** → Use palette directly

---

## 6. Anti-Patterns to Avoid

### ❌ Directly Referencing Foundation in Semantic Layer

```json
// WRONG
"color-button-primary": "#0066cc"  // Hardcoded value
"color-button-primary": "color-blue-600"  // Foundation ref (should be palette)

// CORRECT
"color-button-primary": "color-brand"  // Palette reference
```

**Why:** Changes to foundation break semantic intention. Palette should absorb the change.

### ❌ Circular Dependencies

```json
// WRONG
"color-brand": "color-primary"
"color-primary": "color-brand"

// CORRECT
"color-brand": "color-blue-600"       // Foundation
"color-primary": "color-brand"        // Palette
"button-primary": "color-primary"     // Semantic
```

### ❌ Context in Foundation Names

```json
// WRONG
"color-button-blue": "#0066cc"
"space-card-padding": "16px"

// CORRECT
"color-blue-600": "#0066cc"          // Foundation (no context)
"space-16px": "16px"                  // Foundation (value-only)
"color-primary": "color-blue-600"    // Palette (adds context)
"card-padding": "space-16px"         // Semantic (adds usage)
```

### ❌ Naming by Value Instead of Intent

```json
// WRONG
"color-light-gray": "#f0f0f0"        // Changes if shade changes
"space-24": "24px"                    // Brittle if scaled

// CORRECT
"color-surface": "color-neutral-50"   // Intent-based
"space-section-gap": "space-24px"     // Semantic intent
```

---

## 7. Implementation Checklist (Tool-Agnostic)

### Before Proposing New Tokens

- [ ] Is this foundation, palette, or semantic layer?
- [ ] Does it follow the naming pattern? (category-concept-property-modifier)
- [ ] Is the name semantic/intent-based (not value-based)?
- [ ] Does it avoid circular dependencies?
- [ ] For palette tokens: Does it reference ONLY foundation?
- [ ] For semantic tokens: Does it reference ONLY palette?
- [ ] For dark mode: Is the mapping explicitly documented?
- [ ] Is it consistent with industry patterns (RedHat/Contentful/Netguru)?

### During Tool Implementation

- [ ] Token naming exactly matches this architecture
- [ ] Token hierarchy preserves layer discipline (foundation → palette → semantic)
- [ ] Dark mode mappings implemented per Section 4 logic
- [ ] All references validated (palette refs only foundation, semantic refs only palette)
- [ ] Theme support (if applicable) assigned at palette layer only

---

## 8. Reference Sources

All patterns validated against:

1. **Always Twisted** — Naming convention schemas (CTI, Category-Concept-Property)
2. **Netguru** — 3-tier (Global/Alias/Component) semantic structure
3. **Smashing Magazine** — CTI pattern and functional naming
4. **Smart Patterns** — Intent-based naming (over value-based)
5. **Contentful** — 3-tier architecture (Primitive/Semantic/Component)
6. **RedHat** — Global/Alias/Component implementation reference
7. **Design System Guide** — Token lifecycle and source of truth concept

---

## 9. Quick Reference: Token Naming Decision Tree

```
START: "I need to name a token"
│
├─ Is this a raw value (hex, px, weight)?
│  └─ YES → FOUNDATION layer: color-blue-600, space-16px
│
├─ Is this semantic meaning (primary, success, text)?
│  ├─ YES, maps to ONE foundation token?
│  │  └─ PALETTE layer: color-brand, color-status-success
│  │
│  └─ YES, maps to palette for specific component?
│     └─ SEMANTIC layer: color-button-primary, space-card-padding
│
└─ Use naming pattern: category-concept-property-modifier
   └─ Example: color-button-primary-hover
```

---

**Document Status:** Reference material for both agents. Tool-agnostic core patterns. Tool-specific implementation (Figma, Token Studio, etc.) covered in separate implementation guides.
