---
status: STABLE
doc_type: design-tokens-guide
doc_id: design-tokens
owners:
 design: TBD
 engineering: TBD
last_reviewed: 2026-03-26
storybook_refs:
 - stories/foundations/DesignTokens.mdx
figma_refs:
 - file_key: YOUR-FIGMA-FILE-KEY
 node_id: TBD
parity_state: stable
---

# Design Tokens

## Summary

Design tokens are the named, shared vocabulary of every visual decision in the Design System: colours, typography, spacing, and radius. They give your brand's digital products a consistent, themeable visual identity across Figma, web, iOS, and Android. All tokens originate from one source of truth.

This guide explains what tokens are, why they exist, how the three-layer model organises them, and how theming works across light and dark contexts.

---

## 1. What Is a Design Token?

A design token is a **named design decision**. Instead of asking "what colour is that?" and getting the answer `#1a191a`, you ask "what is that _for_?" and get the answer `text.primary` — the primary text colour.

The name carries the intent. The value can change. The relationship between components and that decision stays intact.

Every token has three parts:

| Part | Description | Example |
| --------- | ---------------------------------------------------------- | -------------------------------- |
| **Name** | The semantic intent of the decision | `text.primary`, `surface.canvas` |
| **Value** | The resolved design decision, or an alias to another token | a token reference or `#ffffff` |
| **Type** | The category of the value | `color`, `spacing`, `fontFamily` |

The key insight: a token is not a colour. It is a _decision about when and why to use_ a colour.

---

## 2. Why Tokens Matter

### Consistency without coordination

Without tokens, every engineer and designer makes independent colour or spacing choices. Two components can end up with slightly different shades of "brand black" without anyone knowing. Tokens make that impossible. There is one `text.primary` and it is the same everywhere.

### Themes without rewrites

The system supports light mode and dark mode. Because every component references a token by intent, switching theme requires no code changes in components; only the active token set changes at the root.

### Accessibility baked in

Contrast relationships — text against its surface, interactive states, focus indicators — are reviewed and certified at the token layer. Fixing a contrast failure in one token fixes every component that uses it, automatically.

### One source, every platform

Design decisions live in one place and are delivered to every platform:

- Web (CSS custom properties)
- React / JavaScript
- iOS (colour asset catalogs)
- Android (resource files)
- Figma (native variables, kept in sync)

When a colour is updated, _all_ platforms receive it in the next release — without per-platform coordination.

### Change safety

Tokens are version-controlled. The three-layer model means that low-risk intent changes (a text colour in one theme) are insulated from high-risk structural changes (a palette ramp step). Each layer has its own governance weight.

---

## 3. The Three-Layer Architecture

The Design System organises tokens into three distinct layers, each with a different purpose, audience, and governance weight.

### Layer overview

| Layer | Purpose | Who changes it |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **Foundation** | Colour values, font families, font sizes, font weights, line heights, and dimension units. The source material for the entire system. Internal only. | Design system team |
| **Palette** | Colour-only. Named ramps generated from foundation colour values. Semantic colour tokens alias palette steps. Internal only. | Design system team |
| **Semantic** | Tokens named by UI purpose, not by value. They cover colour, typography, spacing, and radius. These are the only tokens components should ever reference. | Design system team |

Think of it as a kitchen: Foundation is the raw ingredients. Palette is the pantry (organised, labelled, ready). Semantic tokens are the recipes (they tell you what to use and when).

### Foundation layer

Foundation tokens are colour values, font families, font sizes, font weights, line heights, and dimension units. They are the source material for the entire system.

Components should never reference foundation tokens directly. They exist so that Palette tokens, and ultimately Semantic tokens, have consistent, principled values to draw from.

### Palette layer

Palette tokens organise the colour language into named ramps. The core palette is the **neutral ramp**, which runs from lightest to darkest and reverses between light and dark mode (see Section 4).

Palette tokens are not the same as semantic tokens. A ramp step like `neutral.950` has no opinion about intent: it is just "that value at that point in the scale." Semantic tokens give it meaning. Palette tokens are not for use in product code. They are internal only.

### Semantic layer

Semantic tokens are where design intent lives. Every component uses these, and only these.

| Token | Meaning |
| --------------------- | ---------------------------------------- |
| `surface.canvas` | Default page or panel background |
| `surface.undercanvas` | Background area beneath the main canvas |
| `surface.inverse` | Opposed surface for inverted UI elements |
| `text.primary` | Main body reading text |
| `text.secondary` | Supporting or descriptive text |
| `text.tertiary` | Metadata, captions, and labels |
| `text.inverse` | Text placed on inverse surfaces |
| `interactive.primary` | Default interactive/brand accent colour |
| `focus.ring` | Keyboard focus indicator colour |
| `border.default` | Standard divider and outline colour |

The rule is simple: **semantic tokens reference palette tokens. Never foundation tokens directly.**

---

## 4. Theming and Modes

### Light and dark modes

Every semantic token has a light-mode value and a dark-mode value. The active token set at the root of the page resolves the theme. Components do not need to know which mode is active: they always reference the same token name, and the correct value resolves from context.

### The neutral ramp inversion

**The neutral ramp is reversed between light and dark.** This is the most important dark mode concept.

In light mode, low numbers mean lighter and high numbers mean darker. In dark mode, this is completely reversed:

| Ramp stop | Light mode | Dark mode |
| -------------- | -------------------- | ------------------- |
| `neutral.50` | Lightest: near white | Darkest: near black |
| `neutral.950` | Near black | Near white |
| `neutral.1000` | Pure black | Pure white |

This means you cannot assume a dark-mode mapping by analogy with light mode. A token that uses `neutral.100` in light mode (very light grey) must use `neutral.900` in dark mode (very dark grey), not the same number.

When making dark mode decisions, always verify the actual colour value against the ramp reference before deciding which stop to use.

### How theming works in practice

Theming is a context, not a transformation. A component is unchanged; only the token values resolving around it change when the theme context switches. This separation is what makes the system scalable: a new theme requires no component work, only a new token set.

---

## 5. Choosing the Right Token

The guiding principle: **choose by intent, not by value.**

Never look for a token because it happens to be the right shade. Look for the token that describes what the element _is_ — what role it plays in the interface.

### Decision guide

| What you are designing or building | Token category to use |
| ------------------------------------- | ----------------------------------- |
| Main body text | `text.primary` |
| Supporting or descriptive copy | `text.secondary` |
| Captions, metadata, labels | `text.tertiary` |
| Text on dark/inverted surfaces | `text.inverse` |
| Standard page background | `surface.canvas` |
| Card, panel, or raised element | `surface.level-1` |
| Inverted surface | `surface.inverse` |
| Standard dividers and outlines | `border.default` |
| Interactive elements (buttons, links) | `interactive.*` |
| Focus ring for keyboard navigation | `focus.ring` |

### When to create a new token

Only when the intent is genuinely new — not expressed by any existing token. If the element has a unique role that no current token names, propose it for governance review before adding it. Creating a token for a one-off visual variation is not the right use of the system.

### What never to do

Never hard-code a colour value in a component. If you find yourself reaching for a raw hex, it means a semantic token already exists for that intent — or should. Hard-coding a value disconnects a component from theming, accessibility, and future changes.

---

## 6. Tokens in Practice

The before/after below illustrates what tokens change for an engineer:

```css
/* Without tokens — fragile, disconnected */
.headline {
 color: #1a191a;
 background: #ffffff;
}

/* With tokens — intent-driven, themeable */
.headline {
 color: var(--ds-light-core-text-primary);
 background: var(--ds-light-core-surface-canvas);
}
```

The token version is not just a style preference. When dark mode activates, or a brand colour shifts, the token version responds automatically. The first version does not.

For implementation specifics — package names, theme providers, platform-specific APIs — see the component documentation or the design system developer guides.

---

## 7. Tokens in Figma

All semantic tokens in the Design System are available as native **Figma Variables** in the Token Library file.

**[Token Library — Design System](https://www.figma.com/design/YOUR-FIGMA-FILE-KEY/)**

### Variables are tokens

In Figma, variables are the design-side equivalent of tokens in code. When a designer applies `Light / Core / Text / Primary` to a text element and an engineer applies `--ds-light-core-text-primary` to a component, they are making the same decision from the same source.

This alignment is intentional. It means that design specs, prototypes, and production components all speak the same language — changes made on one side propagate to the other through the sync process.

### How to use them

Attach the Token Library to your working file via the Figma Libraries panel. Once attached, all semantic variables become available in the colour, fill, stroke, and typography pickers throughout the file.

Apply them from the variables panel rather than from free-form colour pickers. Choosing a variable keeps the design connected to the system; choosing a raw colour breaks that connection.

### Sync and currency

The Token Library is kept in sync with the design system source of truth as part of the release process. You do not need to manually update variable values — they are maintained by the system. If you notice a variable value that appears incorrect, raise it as a token issue rather than editing the Figma variable directly.

---

## 8. Requesting Changes to the Token System

All token changes (across every layer) are made by the design system team. Tokens are shared decisions that affect every product and platform, so changes go through a review process rather than open editing.

### How requests work

If you need a token that does not exist, or believe an existing token needs to change, raise a request rather than making the change directly.

**Where:** Open an issue in the Design System repository with the "token-request" label, or start a discussion in the #design-system-tokens Slack channel.

| What you need | How to raise it |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| A new semantic token for a design intent not currently expressed | Describe the intent and context: where it will be used, why no existing token fits, and the proposed value |
| A change to an existing semantic token value | Describe the current behaviour, desired behaviour, and affected products or contexts |
| Something that feels like a palette or foundation gap | Start a conversation with the design system team; these changes need broader alignment before any decision |

### What makes a good request

Frame requests around intent, not values. Say: "I need a text colour for content captions that sits below secondary text in hierarchy." Do not say: "I need a grey that is 60% opacity." The team will map intent to the right token decision.

If you are not sure whether you need a new token or whether an existing one fits, that uncertainty is itself worth raising — the team can help identify the right token or confirm a gap exists.

### What the team considers

The team evaluates token requests against the whole system: contrast and accessibility across themes, consistency with existing semantic naming, and downstream effects on components that reference the token.

---

## 9. Troubleshooting and Common Questions

### Understand the token model

**What is the difference between a token and a CSS variable?**

A CSS variable is one delivery format for a token. The same token is delivered as an iOS colour asset, an Android resource, and a Figma variable. The token is the decision; the CSS variable is one platform's expression of it.

**Why can't semantic tokens reference foundation tokens directly?**

The palette layer provides semantic tokens with a stable, design-reviewed set of values to reference. Jumping directly from semantic to foundation bypasses this curation and makes theming harder: palette ramp logic and semantic intent both need to be respected for theming to work.

### Choose and create tokens

**When should a new semantic token be created?**

Only when there is genuinely new design intent that no existing token expresses. Tokens are not a per-component override mechanism. If you are trying to create a `button-headline-text` token for a one-off style, that is likely a local component style decision, not a system token.

**What is the difference between `surface.canvas` and `surface.level-1`?**

`surface.canvas` is the default page background (bottom of the visual stack). `surface.level-1` is for elements that sit above the canvas, like cards and panels. They may resolve to the same colour in some themes today, but their semantic meanings are different. Use the token that matches the element's _role_ in the visual hierarchy, not the one that currently resolves to the value you want.

### Sync and theming

**Why does dark mode reverse the neutral ramp?**

In light mode, the neutral scale runs light to dark from low to high numbers (natural reading direction). Dark mode inverts the context, so the same scale is read in reverse to maintain the same perceptual relationships. A card sitting above the page background requires the same _contrast relationship_ in dark mode as in light, even though hex values are opposite.

**What if the Figma variable doesn't match what I see in production?**

Both Figma and production derive from the same token source, but they are updated at release time. If you notice a discrepancy, check whether a recent token release has been published and whether the Token Library has been updated in Figma. If values genuinely diverge outside a release window, raise it as a token parity issue.
