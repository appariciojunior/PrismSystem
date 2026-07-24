# Figma Make — Design System

This document consolidates all Figma Make guidance for the Design System: prompt templates for designers, AI guidelines for Figma Make, and the developer integration workflow.

**Last Updated:** May 2026

---

## Contents

1. [Prompt Template](#1-prompt-template) — Copy-paste templates for designers
2. [AI Guidelines for Figma Make](#2-ai-guidelines-for-figma-make) — Upload as `Guidelines.md` to Figma Make → Code
3. [Developer Integration Workflow](#3-developer-integration-workflow) — CSS generation pipeline for implementers

---

# 1. Prompt Template

**Copy-paste this template directly into Figma Make to generate UI using the design system tokens.**

---

## Before You Start

### 1. Attach the Token Library

1. Open your Figma file
2. Assets panel → Click book icon 📖 → Search "Design System - Token Library"
3. Toggle **ON**

### 2. Open Figma Make

- Select frame → Click **Actions** panel → Choose **First Draft**
- Choose library: **Mobile** or **Desktop** (wireframe for lo-fi)

---

## 📝 Copy This Prompt Template

```
[Component/Screen Name] for [Platform Context]

Layout:
- [Describe structure: vertical/horizontal, sections, hierarchy]
- [Grid: 4-column (small) or 12-column (medium/large/xlarge)]

Typography:
- Headline: brand.heading.fluid.bold.large
- Body text: utility.body.medium
- [Add other text elements with token names]

Colors:
- Background: surface.level-1
- Primary button: interactive.primary.fill.default
- Text: text.primary
- [Add other color elements with token names]

Spacing:
- Card padding: spacing.fluid.400
- Between sections: spacing.fluid.300
- [Add other spacing with token names]

Interactive Elements:
- [Buttons, links, inputs with states]
- Hover: interactive.primary.fill.hover
- Disabled: interactive.primary.fill.disabled

Using Design System tokens
```

---

## ✅ Prompt Best Practices (Figma Make/First Draft)

Based on how Figma Make works (GPT-4 + design system component selection):

### Keep It Simple

- **One screen at a time** - Don't describe entire flows
- **Clear hierarchy** - List most important elements first
- **Specific tokens** - Name exact tokens, not colors ("text.primary" not "black text")

### Structure Matters

- Use **bullet points** (AI parses structure better)
- Group by category (Layout → Typography → Colors → Spacing)
- End with "Using Design System tokens"

### Be Concrete

- ❌ "Make it look professional" → ⚠️ Too vague
- ✅ "Use surface.level-2 with shadow.elevation.level-2" → Specific

### Avoid Color Names in Prompts

- ❌ "white background", "black text", "red button", "blue link"
- ✅ "surface.level-1", "text.primary", "interactive.negative.fill.default", "interactive.text.default"

**Reason**: Figma Make should apply semantic tokens, not hard-coded colors. This ensures theme compatibility and allows light/dark mode switching.

### Choose Right Library

- **Wireframe**: Lo-fi primitives, no visual polish
- **Mobile**: High-fidelity phone UI patterns
- **Desktop**: High-fidelity web UI patterns
- **Material 3**: If you want Google's design language (not this design system)

---

## 🎯 Example Prompts (Ready to Use)

### Mobile Article Card

```
News article card for mobile app

Layout:
- Vertical card with thumbnail at top
- Headline below image
- Metadata row: category tag + timestamp
- 4-column grid (mobile)

Typography:
- Headline: brand.heading.fluid.bold.medium
- Timestamp: utility.body.small
- Category tag: utility.body.xsmall

Colors:
- Card background: surface.level-1
- Card border: border.primary
- Headline: text.primary
- Timestamp: text.secondary
- Category tag: tag.primary

Spacing:
- Card padding: spacing.fluid.300
- Between headline and metadata: spacing.fluid.200
- Thumbnail aspect ratio: 16:9

Using Design System tokens
```

### Primary CTA Button

```
Primary call-to-action button for mobile

Layout:
- Horizontal button with centered text
- Full-width on mobile

Typography:
- Button text: utility.body.medium with bold weight

Colors:
- Background: interactive.primary.fill.default
- Text: interactive.primary.text.default
- Hover state: interactive.primary.fill.hover
- Disabled state: interactive.primary.fill.disabled

Spacing:
- Padding: spacing.fluid.200 horizontal, spacing.fluid.100 vertical
- Border radius: 4px
- Height: 48px touch target

Using Design System tokens
```

### Search Input Field

```
Search input field for desktop header

Layout:
- Horizontal input with search icon left
- Clear button right (when active)

Typography:
- Input text: utility.body.medium
- Placeholder: utility.body.medium

Colors:
- Background: input.fill.default
- Border: input.border.default (1px)
- Text: input.text.default
- Placeholder: text.secondary
- Icon: icon.secondary
- Focus border: interactive.primary.fill.default

Spacing:
- Padding inside: spacing.fluid.200
- Icon left margin: spacing.fluid.200
- Width: 320px

Using Design System tokens
```

---

## ⚠️ After Generation: Manual Steps

Figma Make creates a starting point. You'll need to:

1. **Verify Tokens Applied**
   - Select elements → Check if variables are connected
   - Manually swap to the design system tokens if needed

2. **Refine Spacing**
   - Use spacing.fluid.\* tokens for responsive gaps
   - Check padding/margins match design system

3. **Add Interactive States**
   - Hover, pressed, focus, disabled
   - Create variants if needed

4. **Connect to Components**
   - Once UI Kit is available, swap generated elements for components

---

## 📚 Resources

You can also use the provided CSS variables for quick prototyping. See `packages/tokens/figma-make/globals.css` for the variable list.

## 💬 Need Help?

- Ask in **#design-system** Slack
- Share your prompts that work well
- Report issues with token application

---

**Pro Tip:** Start with wireframe library for layout, then regenerate with mobile/desktop library for high-fidelity visuals. This two-step approach gives you better control.

---

# 2. AI Guidelines for Figma Make

> **Upload this section's content to Figma Make → Code → guidelines folder as `Guidelines.md`.**
>
> This provides rules for Figma Make's AI to ensure generated designs match your brand standards and token usage.

---

## Token Description Guidelines for AI

When Figma Make or other AI tools generate token descriptions, labels, or documentation:

**NEVER include:**

- ❌ Specific color names (white, black, red, blue, etc.)
- ❌ Hex values or color codes (#FFFFFF, #000000, etc.)
- ❌ Implementation details (neutral.50, error.800, step numbers)
- ❌ Prescriptive UI patterns ("only for modals", "displayed in sidebars")

**ALWAYS use:**

- ✅ Semantic purpose ("signals danger", "indicates active state", "provides emphasis")
- ✅ Hierarchy descriptions ("high-emphasis", "medium-emphasis", "subtle", "prominent")
- ✅ Functional context ("for interactive elements", "in form inputs", "on elevated surfaces")
- ✅ Interaction behavior ("on hover", "during pressed state", "when focused")

**Why?** Semantic abstraction enables theme switching and keeps descriptions accurate across light/dark modes.

**Full Guidelines**: [description-guidelines.md](../../.agents/skills/editing/description-guidelines.md)

---

## General Guidelines

- Always use Design System tokens for colors, typography, spacing, and elevation
- Reference tokens by semantic name (e.g., `text.primary`, `spacing.fluid.400`) not hex values
- Prefer responsive layouts using auto layout with fluid spacing tokens
- Generate mobile-first designs unless desktop is explicitly requested
- Use 4-column grid for small, 12-column for medium/large/xlarge viewports
- Keep layouts clean and readable with generous whitespace
- Ensure minimum 48px touch targets for interactive elements on mobile

---

## Design System Guidelines

### Typography

- Use `Inter` font family for headlines and display text
- Use `Inter` font family for body text and UI elements
- Always reference typography tokens, never use px values directly
- Responsive typography tokens scale across viewports (Small/Medium/Large/XLarge)
- Static typography tokens remain constant regardless of viewport

**For Headlines (Responsive):**

- Extra Large: `brand.heading.fluid.bold.2xlarge`
- Large: `brand.heading.fluid.bold.large`
- Medium: `brand.heading.fluid.bold.medium`
- Small: `brand.heading.fluid.regular.small`

**Headings Line Height:** Use 125% line height for utility headings (`fontLineHeight030`).

**For Body Text (Static):**

- Large: `utility.body.large`
- Medium: `utility.body.medium`
- Small: `utility.body.small`
- Extra Small: `utility.body.xsmall`

**Font Weight Guidelines:**

- Headlines: Use `bold` or `semibold` weights
- Body text: Use `regular` or `medium` weights
- Never use `light` weight below 18px size

---

### Color System

- Never use hex values directly — always reference semantic tokens
- Light mode is default; dark mode tokens adapt automatically
- Ensure minimum 4.5:1 contrast ratio for text (WCAG AA)

| Category    | Token                                | Purpose                  |
| ----------- | ------------------------------------ | ------------------------ |
| Text        | `text.primary`                       | Primary text             |
| Text        | `text.secondary`                     | Supporting/metadata text |
| Text        | `text.inverse`                       | Text on dark backgrounds |
| Interactive | `interactive.primary.fill.default`   | Primary button fill      |
| Interactive | `interactive.primary.text.default`   | Primary button text      |
| Interactive | `interactive.secondary.fill.default` | Secondary button fill    |
| Interactive | `interactive.text.default`           | Text links               |
| Feedback    | `feedback.fill.error`                | Error background         |
| Feedback    | `feedback.text.error`                | Error text               |
| Surface     | `surface.canvas`                     | Page background          |
| Surface     | `surface.level-1`                    | Card background          |
| Surface     | `surface.level-2`                    | Elevated card            |
| Surface     | `surface.level-4`                    | Modal/dialog background  |
| Border      | `border.primary`                     | Standard borders         |
| Border      | `border.secondary`                   | Subtle borders           |

---

### Spacing

Use fluid spacing tokens for responsive layouts; static only when fixed spacing is required.

| Token               | Base value | Common use                              |
| ------------------- | ---------- | --------------------------------------- |
| `spacing.fluid.050` | 2px        | Extra tight                             |
| `spacing.fluid.100` | 4px        | Tight                                   |
| `spacing.fluid.200` | 8px        | Between related elements                |
| `spacing.fluid.300` | 12px       | Medium                                  |
| `spacing.fluid.400` | 16px       | Card padding, page margins (mobile)     |
| `spacing.fluid.500` | 20px       | Between sections                        |
| `spacing.fluid.800` | 32px       | Section spacing, page margins (desktop) |

---

### Elevation

| Level | Surface           | Shadow                       | Use for                     |
| ----- | ----------------- | ---------------------------- | --------------------------- |
| 1     | `surface.level-1` | none, use `border.elevation` | Content cards, panels       |
| 2     | `surface.level-2` | `shadow.elevation.level-2`   | Interactive/draggable cards |
| 3     | `surface.level-3` | `shadow.elevation.level-3`   | Sticky headers, footers     |
| 4     | `surface.level-4` | `shadow.elevation.level-4`   | Modals, dialogs, tooltips   |

---

### Grid System (BETA)

| Viewport            | Columns | Gutter |
| ------------------- | ------- | ------ |
| small (0–767px)     | 4       | 24px   |
| medium (768–1023px) | 12      | 32px   |
| large (1024–1439px) | 12      | 32px   |
| xlarge (1440px+)    | 12      | 32px   |

---

### Generic → Semantic Token Map (Bridging Layer)

Always prompt using semantic tokens. The generic layer exists only for compatibility and exported CSS readability.

| Generic CSS Variable       | Semantic Token                       | Purpose                       |
| -------------------------- | ------------------------------------ | ----------------------------- |
| `--primary`                | `interactive.primary.fill.default`   | Primary button background     |
| `--primary-foreground`     | `interactive.primary.text.default`   | Text on primary fills         |
| `--secondary`              | `interactive.secondary.fill.default` | Secondary button background   |
| `--secondary-foreground`   | `interactive.secondary.text.default` | Text on secondary actions     |
| `--destructive`            | `feedback.fill.error`                | Error/destructive backgrounds |
| `--destructive-foreground` | `feedback.text.error`                | Text on destructive surfaces  |
| `--background`             | `surface.canvas`                     | Page background               |
| `--foreground`             | `text.primary`                       | Default text color            |
| `--border`                 | `border.primary`                     | Standard borders              |
| `--input`                  | `input.fill.default`                 | Input background              |
| `--ring`                   | `focus.border`                       | Focus ring color              |
| `--radius`                 | `border.radius.medium`               | Standard border radius        |

**Bridging rules:**

- Direction: generic → semantic only (no reverse aliasing)
- Dark mode: handled by the semantic token system; no extra bridging needed
- Update the table and `globals-bridged.css` when new semantic tokens are introduced

---

### Component-Specific Guidelines

**Button**

- Primary fill: `interactive.primary.fill.default` / text: `interactive.primary.text.default`
- Secondary fill: `interactive.secondary.fill.default` / border: `interactive.secondary.border.default`
- Minimum height: 48px; padding: `spacing.fluid.200` H / `spacing.fluid.100` V
- One primary button per section maximum

**Input Fields**

- Background: `input.fill.default`; border: `input.border.default`; focus: `focus.border`
- Minimum height: 48px; always provide visible labels

**Card**

- Flat: `surface.level-1` + `border.primary`; Elevated: `surface.level-2` + `shadow.elevation.level-2`
- Padding: `spacing.fluid.400`; border radius: 8px

**Navigation**

- Header: `surface.level-3` + `shadow.elevation.level-3`; height 64px desktop / 56px mobile
- Footer: `surface.level-1` + `border.primary` top

---

## Token Reference Quick Guide

```
Typography:    brand.heading.fluid.bold.large / utility.body.medium / utility.body.small
Colors:        interactive.primary.fill.default / surface.level-1 / text.primary / text.secondary
Spacing:       spacing.fluid.400 (card) / spacing.fluid.200 (elements) / spacing.fluid.500 (sections)
Elevation:     surface.level-1 + border.elevation / surface.level-2 + shadow.elevation.level-2
```

> **TIP:** More context isn't always better. Focus on the most important rules. Reference tokens by semantic name and let the design system handle the values.

---

# 3. Developer Integration Workflow

**For design system implementers** setting up automated CSS generation for Figma Make.

---

## What is This?

This workflow connects your design token system to Figma Make so AI-generated designs automatically use your tokens.

**Without integration:** AI generates arbitrary colors and spacing; designers manually fix everything.

**With integration:**

```
tokens.json  →  generate-css.js  →  globals.css  →  Figma Make
```

One source of truth: changes in `tokens.json` flow through to Figma Make via generated CSS.

---

## Prerequisites

1. **Token Studio setup** with `tokens.json` as source of truth
2. **Node.js** v18+
3. **Semantic token structure** (surface, text, border, interactive, feedback)
4. **Optional**: Pre-resolved ramp CSV for complex color systems

---

## Implementation Steps

### Step 1: Token Structure

Ensure `tokens.json` has separate light/dark token sets with semantic naming:

```json
{
  "light/ core": {
    "surface": { "canvas": { "value": "{brand.core.ramp.neutral.50}", "type": "color" } },
    "text": { "primary": { "value": "{brand.core.ramp.neutral.950}", "type": "color" } }
  },
  "dark/ core": { ... }
}
```

### Step 2: CSS Generator Script

See `packages/tokens/scripts/generate-figma-make-css.js` for the complete implementation.

Reference resolution order:

1. Ramp reference (`{brand.core.ramp.neutral.500}`) → lookup in pre-resolved ramp colors
2. Foundation lookup → return direct hex
3. Semantic lookup → recursively resolve
4. Special cases (overlays, calculated values)

### Step 3: Light and Dark Mode CSS Output

```css
:root,
[data-theme='light'] {
  --surface-canvas: #ffffff;
  --text-primary: #191919;
}

[data-theme='dark'],
.dark {
  --surface-canvas: #000000;
  --text-primary: #e5e5e5;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --surface-canvas: #000000;
  }
}
```

### Step 4: Bridged CSS (Optional)

```css
/* globals-bridged.css */
:root {
  --primary: var(--interactive-primary-fill-default);
  --background: var(--surface-canvas);
  --foreground: var(--text-primary);
}
```

### Step 5: npm Script

```json
{
  "scripts": {
    "build:figma-make": "node packages/tokens/scripts/generate-figma-make-css.js"
  }
}
```

---

## File Checklist

```
figma-make/
├── globals.css              # Auto-generated semantic tokens
├── globals-bridged.css      # Auto-generated generic mappings
├── guidelines.md            # Manual - AI instructions (from Section 2 above)
├── HOW_TO_USE.md            # Manual - Designer documentation
└── README.md                # Manual - Directory overview

scripts/
└── generate-figma-make-css.js
```

---

## Maintenance

| Trigger                                | Action                                          |
| -------------------------------------- | ----------------------------------------------- |
| Tokens change                          | Run `npm run build:figma-make`, commit CSS      |
| New generic variable from Figma export | Update bridging table and `globals-bridged.css` |
| Dark mode looks wrong                  | Check neutral ramp reversal in generator script |
| Missing tokens in output               | Verify token set names match in script config   |
