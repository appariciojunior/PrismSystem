---
name: description-guidelines
description: Rules for writing token descriptions that maintain semantic abstraction and theme compatibility
license: MIT
metadata:
  category: editing
  agents: [Architect, Code, Testing]
  autonomy: reference
---

# Token Description Guidelines

## Purpose

Ensure token descriptions maintain semantic abstraction, enabling theme switching and keeping descriptions accurate across light/dark modes.

## Core Principles

Token descriptions must:

1. **Describe semantic purpose**, not implementation
2. **Work across all themes** (light/dark mode)
3. **Avoid coupling** to specific colors or values
4. **Focus on function**, not appearance

---

## Critical Rules

### ❌ DO NOT

- **Mention specific color names** (white, black, red, blue, gray, etc.)
- **Include hex values or color codes** (#FFFFFF, #000000, rgba values)
- **Reference implementation details** ("Error color", "neutral.50", "error.800", step numbers)
- **Prescribe specific UI patterns** ("confirmation modal", "sidebar only", "displayed in...")
- **Copy descriptions from other design systems** without adapting to our semantic approach

### ✅ DO

- **Describe semantic purpose** ("signals danger", "indicates success", "provides emphasis")
- **Explain visual hierarchy** ("high-emphasis", "medium-emphasis", "subtle", "prominent")
- **State functional context** ("for destructive actions", "for form inputs", "on elevated surfaces")
- **Note interaction behavior** ("provides visual feedback", "completes interaction", "on hover")
- **Maintain consistency** with similar token descriptions in the same group
- **Keep descriptions concise** (1-2 sentences maximum)

---

## Pattern Examples

### Good vs Bad Examples

#### Fill Tokens

```markdown
✅ GOOD: "Background for destructive action buttons. Medium-emphasis visual treatment for actions requiring user confirmation."
❌ BAD: "Destructive button background. Light fill (white) for medium-emphasis danger actions (delete, remove, revoke)."

✅ GOOD: "Background for primary action buttons. High-emphasis visual treatment for most important actions."
❌ BAD: "Blue background for primary buttons. Uses brand.blue.700 for high contrast."
```

#### Border Tokens

```markdown
✅ GOOD: "Border for destructive action buttons. Signals critical actions requiring user attention and confirmation."
❌ BAD: "Destructive button border. Error color (red) signals critical action requiring confirmation."

✅ GOOD: "Border for form inputs. Defines boundaries and indicates interactive areas."
❌ BAD: "1px solid neutral.300 border for text fields."
```

#### Text Tokens

```markdown
✅ GOOD: "Text hover state for destructive actions. Maintains readability during interaction."
❌ BAD: "Destructive text on hover. Darkened error text maintains readability during hover state."

✅ GOOD: "Primary content text. Default semantic color for body copy and article content."
❌ BAD: "Black text (#191919) for main content. WCAG AAA contrast on white backgrounds."
```

#### State Tokens

```markdown
✅ GOOD: "Hover state for primary actions. Provides visual feedback during interaction."
❌ BAD: "Hover state darkens button by 10% using darken modifier."

✅ GOOD: "Disabled state for interactive elements. Reduces emphasis to indicate non-interactive state."
❌ BAD: "Disabled state uses 40% opacity on neutral.600."
```

---

## Why These Rules Matter

| Issue                       | Impact                                                              | Solution                              |
| --------------------------- | ------------------------------------------------------------------- | ------------------------------------- |
| Color names in descriptions | Breaks when colors change; inaccurate in dark mode                  | Use semantic purpose instead          |
| Hex values in descriptions  | Couples docs to implementation; requires updates when values change | Describe function, not value          |
| Implementation details      | Exposes internal structure; breaks abstraction                      | Focus on user-facing purpose          |
| Prescriptive UI patterns    | Limits token usage; incorrect assumptions                           | Describe capability, not prescription |

### Examples of Breaking Changes

**Without semantic abstraction:**

```
"White background for buttons" → ❌ Breaks in dark mode (background is black)
"Red text for errors" → ❌ Breaks when brand changes error color
"neutral.50 fill" → ❌ Breaks when ramp is restructured
```

**With semantic abstraction:**

```
"Background for primary actions" → ✅ Works in all themes
"Text for error messages. High contrast ensures readability" → ✅ Accurate everywhere
"Background for destructive actions" → ✅ Survives refactoring
```

---

## Sync Rule

**Descriptions MUST be synchronized** between:

1. `packages/tokens/src/tokens.json` (source of truth)
2. `packages/tokens/docs/reference/semantic-tokens.md` (documentation)

If a description is improved in one location, it must be synced to the other across all relevant theme sets.

---

## Usage in Tools

### When Using token-operations.py

```bash
# ✅ GOOD: Semantic description
python3 scripts/token-operations.py describe "interactive.primary.*" \
  --template "Background for highest-emphasis interactive elements"

# ❌ BAD: Mentions color
python3 scripts/token-operations.py describe "interactive.primary.*" \
  --template "Blue background for primary buttons"
```

### When Using Figma Make

Ensure AI-generated descriptions follow these guidelines by providing examples in prompts:

```markdown
Generate token descriptions using semantic purpose, not color names.
Example: "Background for primary actions" not "blue button background"
```

### When Writing Documentation

Always review new descriptions against this checklist:

- [ ] No color names mentioned
- [ ] No hex values or color codes
- [ ] No implementation details (step numbers, palette references)
- [ ] Describes semantic purpose clearly
- [ ] Works across light/dark modes
- [ ] Concise (1-2 sentences)

---

## State Token Description Pattern

Interactive tokens have multiple states. Follow this pattern:

| State        | Description Pattern                      | Example                                                                                                 |
| ------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **default**  | Describe base purpose and emphasis level | "Background for primary action buttons. High-emphasis visual treatment for most important actions."     |
| **hover**    | Focus on providing visual feedback       | "Background hover state for primary actions. Provides visual feedback during interaction."              |
| **pressed**  | Emphasize completion or confirmation     | "Background pressed state for primary actions. Completes interaction feedback before action execution." |
| **disabled** | Explain reduced emphasis                 | "Background disabled state for primary actions. Reduced emphasis indicates non-interactive state."      |
| **focus**    | Describe accessibility enhancement       | "Background focus state for primary actions. Enhanced visibility for keyboard navigation."              |

---

## References

- Full semantic token descriptions: [reference/semantic-tokens.md](../../docs/reference/semantic-tokens.md)
- Safe token editing workflow: [editing/safe-token-edit](safe-token-edit.md)
- Bulk description updates: [../../docs/guides/token-operations.md](../../docs/guides/token-operations.md)

---

## Quick Reference Card

```
❌ AVOID                           ✅ USE
────────────────────────────────────────────────────────
Color names                     → Semantic purpose
Hex values                      → Hierarchy description
Implementation details          → Functional context
Prescriptive patterns           → General capabilities
"White background"              → "Background for..."
"Red error text"                → "Text for error messages"
"neutral.50 fill"               → "Fill for..."
"Shown in modals"               → "For overlay surfaces"
```

---

**Last Updated**: 2025-02-12  
**Related Skills**: safe-token-edit, bulk-transform  
**Related Docs**: semantic-tokens.md, token-operations.md
