# Design Token System Governance & Scaling (Agent Reference)

**Source:** Extracted from Contentful, RedHat, Design System Guide, Netguru design token sources.

This is **internalized expert knowledge** for architect agent. Use this as foundational reference for token system governance, lifecycle, and scaling decisions.

---

## 1. Token System Lifecycle

All design systems follow a **predictable token lifecycle**. Understanding it guides governance decisions.

### Phase 1: Discovery & Definition

- **Goal:** Identify design decisions to tokenize
- **Actions:**
  - Audit existing design (colors, spacing, typography)
  - Identify repetition patterns (which values repeat?)
  - Categorize by frequency (core values vs. edge cases)
- **Output:** Initial token list with naming conventions

### Phase 2: Foundation Layer Creation

- **Goal:** Extract raw values into foundation tokens
- **Actions:**
  - Create base color ramps (50-1000 scale)
  - Define spacing scale (4px, 8px, 12px, 16px, 24px...)
  - Document typography baselines (font families, sizes, weights)
  - Establish naming system (color-blue-500, space-16px)
- **Output:** `packages/tokens/src/tokens.json` foundation layer
- **Governance:** **Lock after publication** (breaking change if altered)

### Phase 3: Palette Layer Creation

- **Goal:** Add semantic meaning to foundation
- **Actions:**
  - Map foundation to brand concepts (primary, secondary, accent)
  - Create status tokens (success, error, warning, info)
  - Add neutral palette (background, text, border colors)
  - Support theming (light/dark mode mappings)
- **Output:** Palette layer tokens referencing foundation
- **Governance:** Change requires design approval (impacts brand/theme)

### Phase 4: Semantic Layer Creation

- **Goal:** Map palette to usage contexts
- **Actions:**
  - Create component tokens (button-primary, card-padding)
  - Create status feedback tokens (color-status-success)
  - Create contextual tokens (surface-background, text-default)
  - Support component variants
- **Output:** Semantic layer tokens referencing palette
- **Governance:** Change requires stakeholder review (impacts components)

### Phase 5: Implementation & Export

- **Goal:** Make tokens available to code
- **Actions:**
  - Export to CSS custom properties
  - Export to Tailwind configuration
  - Export to code format (JSON, TypeScript)
  - Publish to npm (if shared across projects)
- **Output:** Build artifacts in `/packages/output/`
- **Governance:** Build pipeline validates token integrity

### Phase 6: Maintenance & Evolution

- **Goal:** Keep tokens aligned with design/code reality
- **Actions:**
  - Regular audits (quarterly) to catch unused tokens
  - Deprecate tokens no longer used
  - Update documentation as system grows
  - Track breaking changes
- **Output:** Changelog and versioning strategy
- **Governance:** Semantic versioning (breaking/feature/patch changes)

---

## 2. Governance Gates: When to Lock Changes

### Foundation Layer: **HIGHEST GATE**

**Lock Level:** 🔴 Foundation-change approval required

**Who decides:** Design system owner + stakeholder committee  
**Approval type:** Explicit written approval required  
**Change impact:** Breaking change across all layers (palette + semantic)  
**Example gates:**

- Changing color ramp (neutral-50 from #fff to #f5f5f5)
- Adding new color family (cyan, magenta)
- Changing spacing base unit (8px → 6px)
- Modifying typography baseline (18px → 16px)

**Process:**

1. Proposal with impact analysis (which layers affected?)
2. Design review (aesthetic impact?)
3. Component audit (which components break?)
4. Stakeholder vote (proceed?)
5. Update with deprecation notice (old tokens still work briefly)

### Palette Layer: **MEDIUM GATE**

**Lock Level:** 🟡 Palette-approval required

**Who decides:** Design owner + tech lead  
**Approval type:** Documented design + tech alignment  
**Change impact:** Theme/brand change (may affect all semantic refs)  
**Example gates:**

- Changing brand primary color (blue → green)
- Adding new status token (warning → caution distinction)
- Reorganizing neutral palette
- Theme restructuring (light/dark mode changes)

**Process:**

1. Design rationale documented
2. Component preview (show impact)
3. Tech lead validates palette-to-semantic mappings
4. Approval with changelog entry

### Semantic Layer: **LOW GATE**

**Lock Level:** 🟢 Self-service (with review)

**Who decides:** Component team lead  
**Approval type:** PR review (3 eyes minimum)  
**Change impact:** Component-specific (contained)  
**Example gates:**

- New button state token (button-primary-focus)
- New component token family (modal-padding, tooltip-background)
- Fixing semantic mapping (button-primary → use correct brand ref)
- Adding component variant tokens

**Process:**

1. PR with clear intent (why? what impact?)
2. Code review (naming consistent? references correct?)
3. Component validation (affected components tested?)
4. Merge with changelog

---

## 3. Scaling Challenges & Solutions

### Challenge 1: Token Proliferation ("Token Explosion")

**Problem:** Too many tokens created for edge cases; system becomes unmaintainable.

**Symptoms:**

- 500+ semantic tokens (hard to discover)
- Duplicate tokens with subtle naming differences
- Tokens used in only 1 place

**Solutions:**

1. **Naming standards:** Enforce category-concept-property pattern
2. **Usage audit:** Remove tokens used in <2 places
3. **Template tokens:** Create templates instead of variants
4. **Layer discipline:** Only promote frequently-used values to semantic

**Implementation:**

```
❌ Don't do this (token explosion):
color-button-primary
color-button-primary-small
color-button-primary-large
color-button-primary-mobile
color-button-primary-desktop

✅ Do this (use component properties):
color-button-primary (bound to component)
Component uses "size" property: small, large, mobile, desktop
(One semantic token + component logic)
```

### Challenge 2: Theme Complexity (Light/Dark/High Contrast)

**Problem:** Managing 3+ themes with different token values multiplies maintenance.

**Symptoms:**

- Inconsistent naming across themes
- Unclear which tokens are theme-dependent
- Mode-switching bugs (missing values in one theme)

**Solutions:**

1. **Clear layer separation:**
   - Foundation: **Never** changes by theme
   - Palette: **Explicitly** theme-dependent
   - Semantic: **Inherits** from palette (no direct theme logic)

2. **Documentation:**
   - Mark which tokens have theme variants
   - Document why (e.g., "neutral-50 reverses in dark mode")

3. **Validation:**
   - Build script verifies all tokens have values in all modes
   - Dev Mode shows current mode's values

**Implementation:**

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

### Challenge 3: Cross-Product Consistency

**Problem:** Multiple products/teams using tokens but diverging (custom tokens appearing in code).

**Symptoms:**

- Product A uses `color-button-primary`; Product B uses custom `#0066cc`
- No single source of truth
- Token changes don't propagate across products

**Solutions:**

1. **Shared library:** Publish tokens as npm package
2. **Versioning:** Semantic versioning for breaking changes
3. **Deprecation path:** 2-version grace period before removal
4. **Product override mechanism:** Allow product-specific semantic layer (but inherit foundation/palette)

**Implementation:**

```
@company/design-tokens (published)
├─ v2.0.0 (stable)
├─ v2.1.0 (new semantic tokens, compatible)
└─ v3.0.0 (breaking: removed deprecated tokens)

Product A: npm install @company/design-tokens@^2.1.0
Product B: npm install @company/design-tokens@^2.0.0

Both get foundation/palette; semantic layer can extend with product-specific tokens
```

### Challenge 4: Documentation Debt

**Problem:** Tokens aren't documented; developers don't know which token to use.

**Symptoms:**

- Developers create custom colors instead of using tokens
- "I didn't know this token existed"
- Token intent unclear from name

**Solutions:**

1. **Token descriptions:** Add to each semantic token
2. **Usage examples:** Show which component uses which token
3. **Discovery UI:** Figma library with preview + code samples
4. **Auto-docs:** Generate documentation from token definitions

**Implementation (in tokens.json):**

```json
{
  "color-button-primary": {
    "value": "color-brand",
    "type": "color",
    "description": "Primary button background color. Use for main CTA actions.",
    "scope": ["semantic"],
    "examples": ["Button (primary variant)", "CTA banner"]
  }
}
```

---

## 4. Approval Workflows

### Foundation Layer Change Request

```
Developer/Designer initiates:
  ↓
Submit proposal with:
  - Current value
  - New value
  - Why (business/design rationale)
  - Affected components (audit)
  - Migration path (how do existing consumers update?)
  ↓
Design System Owner reviews:
  - Brand impact acceptable?
  - Implementation feasible?
  ↓
Steering Committee vote:
  - Proceed → PR created with deprecation notice
  - Reject → Document reasoning, reopen in next cycle
  ↓
3-month deprecation period:
  - Old token still works (refs new value internally)
  - Consumers migrate to new token
  ↓
Remove deprecated token
```

### Palette Layer Change Request

```
Product/Design team initiates:
  ↓
Submit PR with:
  - Token name & new value
  - Design rationale (why this change?)
  - Component impact preview
  ↓
Automated checks:
  - Naming follows pattern? ✓
  - All refs valid? ✓
  - All modes have values? ✓
  ↓
Design owner approves:
  - Aesthetic alignment? ✓
  ↓
Tech lead approves:
  - Mapping correct? ✓
  - No circular refs? ✓
  ↓
Merge + changelog entry
```

### Semantic Layer Change Request

```
Component team initiates:
  ↓
Submit PR with:
  - Token name & value (should be palette ref)
  - Component affected
  - Usage example
  ↓
Automated checks:
  - Naming follows pattern? ✓
  - Refs correct layer? ✓
  - No duplicates? ✓
  ↓
Peer code review (2 required):
  - Is name semantic/intent-based? ✓
  - Does component use it? ✓
  - Any conflicts? ✓
  ↓
Merge + changelog entry
```

---

## 5. Version Strategy

### Semantic Versioning for Token Systems

```
MAJOR.MINOR.PATCH
v2.3.1

MAJOR: Breaking change (removed/renamed token, foundation change)
  - 2.0.0: Removed deprecated "color-accent" token
  - 3.0.0: Changed neutral ramp from 50-1000 to 10-1000 scale

MINOR: Feature-compatible (new tokens, new theme)
  - 2.1.0: Added "color-status-pending" token
  - 2.2.0: Added "HighContrast" theme mode

PATCH: Bug fixes (typo fixes, value corrections, docs)
  - 2.0.1: Fixed "color-button-secondary-hover" hex value typo
  - 2.0.2: Corrected documentation examples
```

### Release Schedule

- **Minor updates:** Monthly (when new tokens added)
- **Patch updates:** As-needed (fix bugs immediately)
- **Major updates:** Quarterly planning cycle (1 breaking change per quarter maximum)

### Deprecation Timeline

1. **Announce** (1 release before removal): "Deprecated in v2.5, remove in v3.0"
2. **Support** (2 versions): Old token still works, internal alias to new
3. **Remove** (Major version): Delete deprecated token

---

## 6. Team Roles & Responsibilities

### Design System Owner

**Owns:** Token strategy, governance, approval gates  
**Decides:** Foundation-layer changes, major architecture shifts  
**Approves:** Palette layer changes, removal of tokens

### Design Owner(s)

**Owns:** Brand/palette consistency  
**Decides:** Color palette choices, theme definitions  
**Approves:** New palette tokens, brand-affecting changes

### Token Architect (You: Architect Agent)

**Owns:** Token hierarchy, naming consistency, layer discipline  
**Decides:** Whether change is foundation/palette/semantic  
**Approves:** New semantic tokens, refactoring proposals

### Figma Executor (You: Figma-Executor Agent)

**Owns:** Token implementation in Figma, variable structure, export  
**Decides:** Variable grouping, binding strategy, mode setup  
**Maintains:** Variable collections, library publishing

### Developers

**Consume:** Semantic-layer tokens in code  
**Report:** Missing tokens, token naming issues  
**Propose:** New semantic tokens for new use cases

---

## 7. Audit & Maintenance Checklist (Quarterly)

### Q1 Foundation Audit

- [ ] Are all foundation tokens used by palette? (no orphans)
- [ ] Have values drifted from design? (verify against Figma)
- [ ] Are naming patterns consistent?
- [ ] Document any unused foundation tokens for removal

### Q2 Palette Audit

- [ ] Are all palette tokens used by semantic? (no orphans)
- [ ] Do colors meet WCAG AA contrast ratios?
- [ ] Are themes complete? (all modes have all values)
- [ ] Document deprecated or unused palette tokens

### Q3 Semantic Audit

- [ ] Are all semantic tokens used in code? (usage report)
- [ ] Are naming patterns consistent?
- [ ] Do they follow intent-based naming? (or value-based?)
- [ ] List candidates for removal (used in <2 places)

### Q4 System Audit

- [ ] Documentation current? (descriptions, examples)
- [ ] Changelog complete for all changes?
- [ ] Breaking changes communicated 1 version ahead?
- [ ] Plan major refactor/update for next year?

---

## 8. Common Scaling Antipatterns to Avoid

### ❌ Component Tokens in Semantic Layer

```json
// WRONG: Component structure leaking into semantic
"color-card-title": "#000000"
"color-modal-background": "#ffffff"
"color-table-border": "#cccccc"
→ Too many semantic tokens; not reusable
```

### ✅ Correct: Reusable Semantic Tokens

```json
"color-text-primary": "#000000"
"color-surface-primary": "#ffffff"
"color-border-subtle": "#cccccc"
→ Tokens map to multiple components; reusable
```

### ❌ Foundation in Semantic Layer

```json
// WRONG: Direct palette refs from semantic
"color-button-primary": "color-blue-600"  // Should ref palette
"space-card-padding": "16px"  // Should ref palette
```

### ✅ Correct: Layer Discipline

```json
"color-button-primary": "color-brand"  // Refs palette
"space-card-padding": "space-md"  // Refs palette
```

### ❌ Mixing Themes at Wrong Layers

```json
// WRONG: Theme variants at semantic layer
"color-button-primary-light": "color-brand-light"
"color-button-primary-dark": "color-brand-dark"
→ Breaks semantic layer discipline
```

### ✅ Correct: Palette Layer Handles Themes

```json
"$themes": [
  { "name": "light", "color-brand": "#0066cc" },
  { "name": "dark", "color-brand": "#00ccff" }
]
"color-button-primary": "color-brand"  // Same at any theme
```

---

## 9. Scaling Decision Tree

```
START: "Should we add/change a token?"
│
├─ Is this a raw value (hex, px, weight)?
│  └─ YES → Foundation decision (highest gate)
│
├─ Is this semantic meaning (brand, status, theme)?
│  └─ YES → Palette decision (medium gate)
│
├─ Is this component/usage-specific?
│  └─ YES → Semantic decision (low gate)
│
├─ Is this used in 2+ places?
│  └─ NO → Keep in component; don't tokenize
│  └─ YES → Proceed to tokenization
│
└─ Did we audit for duplicates?
   └─ NO → Audit first
   └─ YES → Create token with appropriate gate
```

---

## 10. Quick Reference: Governance at a Glance

| Layer          | Gate Level | Approval           | Change Impact               | Frequency       |
| -------------- | ---------- | ------------------ | --------------------------- | --------------- |
| **Foundation** | 🔴 Highest | Committee vote     | Breaking (palette+semantic) | Rare (1-2/year) |
| **Palette**    | 🟡 Medium  | Design + Tech lead | Theme change                | Monthly (1-3)   |
| **Semantic**   | 🟢 Low     | Code review        | Component-specific          | Weekly (10-20)  |

---

**Document Status:** Reference material for architect agent. Primary source for governance and scaling decisions.
