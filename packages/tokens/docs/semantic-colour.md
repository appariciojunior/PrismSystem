# Semantic Colour Tokens — Final Documentation

Status: Working spec

Purpose: This document defines the final, agreed semantic colour token taxonomy and usage. It removes exploratory proposals and external research.

---

## Core Principles

- Naming pattern: category.intent.property.state (example: interactive.primary.fill.hover)
- Theme parity: Every semantic token maps 1:1 across light/dark themes.
- Palette-only references: Semantic tokens must reference Palette layers (never Foundation) to enable theming.
- Accessibility: Tokens must support WCAG AA contrast for text and UI components.

---

## Categories and Roles

- surface: Backgrounds, elevation levels, overlays
- text: Text colours for primary/secondary and context variants (inverse for high contrast on saturated backgrounds)
- icon: Icon colours, aliased to text where practical
- border: Dividers, outlines, and elevated edges
- input: Form field fill, border, and text (default, error)
- feedback: Error, success, warning, info (fill, text, border)
- interactive: Buttons and links (primary, secondary) with default/hover/pressed
- selected: Top-level grouping for “selected” visual treatment (see below)
- active: Top-level grouping for “active” visual treatment (see below)
- tag: Filled and inline labels (primary, secondary, live)
- focus: Global focus indicator colour(s)
- disabled: Neutral variants for disabled UI

---

## Brand-Neutral Semantic Tiers (Theme Layer)

The theme layer provides brand-neutral, natural-language semantic tokens modelled on the shadcn/ui convention. Every token exists in both light and dark modes with automatic parity: each token aliases the same Palette path, and the Palette collection swaps its values per mode. The layer is authored in `plugin-test/semantic.json` under `Light.theme` and `Dark.theme` (and mirrored in `tokens.json` under `light/ core.theme` and `dark/ core.theme`).

### Neutrals and surfaces

The `neutral` ramp (steps 50 to 950 plus white and black) drives the neutral aliases.

| Token | Backing ramp | Role |
| ----- | ------------ | ---- |
| background | neutral.50 | App or page base surface |
| foreground | neutral.950 | Default text on background |
| card, card-foreground | neutral.100, neutral.950 | Card surface and its text |
| popover, popover-foreground | neutral.50, neutral.950 | Popover or menu surface and its text |
| muted, muted-foreground | neutral.150, neutral.600 | Muted surface and secondary text |
| border | neutral.300 | Default border colour |
| input | neutral.300 | Form input border |
| ring | neutral.600 | Focus ring |

### Brand tiers

Three shadcn-style tiers, each with a foreground pair. Back the tiers with whatever raw hues the project ships. Raw ramps keep natural colour names (blue, teal, neutral); only the semantic tier names are generic.

| Token | Backing | Role |
| ----- | ------- | ---- |
| primary, primary-foreground | blue.800, neutral.50 | Primary brand tier, main CTAs |
| secondary, secondary-foreground | neutral.200, neutral.950 | Low-emphasis surfaces |
| tertiary, tertiary-foreground | teal.500, neutral.50 | Tertiary accent |

### Feedback and messaging

| Token | Backing |
| ----- | ------- |
| info, info-foreground | messaging.info.500, neutral.50 |
| success, success-foreground | messaging.success.500, neutral.50 |
| warning, warning-foreground | messaging.warning.500, neutral.950 |
| error, error-foreground | messaging.error.500, neutral.50 |
| destructive, destructive-foreground | messaging.error.500, neutral.50 |

### Data visualisation

Five generic chart series with no domain meaning. Rename any legacy data-vis colours to these.

| Token | Backing |
| ----- | ------- |
| chart-1 | data-visualisation.darkBlue.500 |
| chart-2 | data-visualisation.yellow.500 |
| chart-3 | data-visualisation.lightBlue.500 |
| chart-4 | data-visualisation.orange.500 |
| chart-5 | data-visualisation.teal.500 |

---

## Static Color Tokens

Static color tokens maintain consistent colors regardless of light/dark mode. They are useful for elements that must have guaranteed fixed colors independent of the theme's mode.

### Static Token Definitions

| Token                  | Category | Purpose                                                                          |
| ---------------------- | -------- | -------------------------------------------------------------------------------- |
| `surface.static.dark`  | Surface  | Always renders black (#000000) — useful for QR codes, barcodes, branded elements |
| `surface.static.light` | Surface  | Always renders white (#ffffff) — useful for fixed light backgrounds              |
| `text.static.dark`     | Text     | Always renders black (#000000) — useful for fixed dark text overlays             |
| `text.static.light`    | Text     | Always renders white (#ffffff) — useful for fixed light text on dark backgrounds |
| `border.static.dark`   | Border   | Always renders black (#000000) — useful for fixed dark dividers                  |
| `border.static.light`  | Border   | Always renders white (#ffffff) — useful for fixed light dividers                 |

### Mode-Specific Ramp References

Static tokens use **different ramp steps per mode** to achieve the **same final color** across modes:

| Token                  | Light Mode                               | Dark Mode                                | Result         |
| ---------------------- | ---------------------------------------- | ---------------------------------------- | -------------- |
| `surface.static.dark`  | `brand.core.ramp.neutral.1000` → #000000 | `brand.core.ramp.neutral.50` → #000000   | Always black ✓ |
| `surface.static.light` | `brand.core.ramp.neutral.50` → #ffffff   | `brand.core.ramp.neutral.1000` → #ffffff | Always white ✓ |
| `text.static.dark`     | `brand.core.ramp.neutral.1000` → #000000 | `brand.core.ramp.neutral.50` → #000000   | Always black ✓ |
| `text.static.light`    | `brand.core.ramp.neutral.50` → #ffffff   | `brand.core.ramp.neutral.1000` → #ffffff | Always white ✓ |
| `border.static.dark`   | `brand.core.ramp.neutral.1000` → #000000 | `brand.core.ramp.neutral.50` → #000000   | Always black ✓ |
| `border.static.light`  | `brand.core.ramp.neutral.50` → #ffffff   | `brand.core.ramp.neutral.1000` → #ffffff | Always white ✓ |

### Why Mode-Specific References?

The neutral ramp is **reversed in dark mode**:

- Light mode: `neutral.50` = white, `neutral.1000` = black
- Dark mode: `neutral.50` = black, `neutral.1000` = white (REVERSED!)

By using different ramp steps per mode, we ensure the **final resolved color is always the same**, independent of the theme's mode.

### When to Use Static Tokens

| Use Case                    | Example                                  | Token                                           |
| --------------------------- | ---------------------------------------- | ----------------------------------------------- |
| QR codes / Barcodes         | Must remain scannable (pure black/white) | `surface.static.dark` or `surface.static.light` |
| Brand logos / Watermarks    | Fixed brand appearance across all modes  | `surface.static.dark` (for dark logos)          |
| Compliance overlays         | Legal text with guaranteed contrast      | `text.static.dark` on light backgrounds         |
| High-contrast accessibility | Fixed contrast indicators                | Any static token for guaranteed accessibility   |

---

## States

- Interactive controls: default, hover, pressed
- Selected: default, hover, pressed (first-class group for discoverability)
- Active: default (represents “currently active”; not interactive, no hover/pressed)

---

## Selected (Final)

Selected is a top-level grouping to maximise discoverability and reuse across components.

- Intents: primary, secondary
- Properties: fill, text, border, icon
- States: default, hover, pressed

Patterns:

```
selected.primary.fill.default
selected.primary.fill.hover
selected.primary.fill.pressed
selected.primary.text.default
selected.primary.text.hover
selected.primary.text.pressed
selected.primary.border.default
selected.primary.border.hover
selected.primary.border.pressed
selected.primary.icon.default
selected.primary.icon.hover
selected.primary.icon.pressed

selected.secondary.fill.default
selected.secondary.fill.hover
selected.secondary.fill.pressed
selected.secondary.text.default
selected.secondary.text.hover
selected.secondary.text.pressed
selected.secondary.border.default
selected.secondary.border.hover
selected.secondary.border.pressed
selected.secondary.icon.default
selected.secondary.icon.hover
selected.secondary.icon.pressed
```

Usage guidance (light mode examples):

- Primary
  - fill.default → {interactive.primary.fill.default}
  - text.default → {interactive.primary.text.default}
  - border.default → {brand.core.ramp.core.neutral.500} (or {border.strong} if adopted)
- Secondary
  - fill.default → {surface.level-accent-medium}
  - text.default → {text.primary}
  - border.default → {border.primary} (current) / {border.default} (if adopted)

Maintain parity in dark themes by referencing the corresponding dark Palette values.

---

## Active (Final)

Active is a top-level grouping representing "currently active" items which are **not interactive** (e.g., active tab, active nav item, selected menu item). Differs fundamentally from `selected` by representing a latched state with no further user interaction available until another element is chosen. No hover/pressed states.

Organized with primary and secondary emphasis levels, with properties: fill, text, border, icon (with border and icon cascading to text.default for consistency).

Patterns:

```
active.primary.fill.default
active.primary.text.default
active.primary.border.default (cascades to active.primary.text.default)
active.primary.icon.default (cascades to active.primary.text.default)

active.secondary.fill.default
active.secondary.text.default
active.secondary.border.default
active.secondary.icon.default
```

Usage guidance (light mode examples):

- Primary
  - fill.default → {brand.core.ramp.neutral.50} (high emphasis)
  - text.default → {brand.core.ramp.neutral.1000} (black, high contrast)
  - border.default → {active.primary.text.default}
  - icon.default → {active.primary.text.default}
- Secondary
  - fill.default → {brand.core.ramp.neutral.200} (lower emphasis)
  - text.default → {brand.core.ramp.neutral.1000}
  - border.default → {brand.core.ramp.neutral.500}
  - icon.default → {brand.core.ramp.neutral.1000}

---

## Existing Groups (Authoritative Summary)

This summarizes the canonical, non-proposal groups for reference when building or auditing components.

- surface
  - canvas, undercanvas, level-1/2/3/4, inverse, level-accent-low/medium/high, overlay
- text
  - primary, secondary, inverse.primary/secondary, on-accent.primary/secondary
- icon
  - primary, secondary, inverse, on-accent.primary/secondary
- border
  - primary, secondary, elevation, inverse, on-accent.primary/secondary
- input
  - fill.default/error, border.default/error, text.default/error
- feedback
  - fill/text/border × error/success/warning/info
- interactive
  - primary.fill/text/icon × default/hover/pressed
  - secondary.fill/text/icon/border × default/hover/pressed
  - link.primary/secondary × default/hover/pressed
  - disabled a/b/c
- selected (final)
  - primary/secondary × fill/text/border/icon × default/hover/pressed
- active (final)
  - fill/text/border/icon × default
- tag
  - filled.primary/secondary/live (fill/text/border)
  - inline.primary/secondary/live
  - background, text.primary/secondary, accent.subtle, icon.primary, interactive.primary.text.default, tag.highlight
- focus
  - border
- disabled
  - a/b/c

---

## Implementation Notes

- Tokens must reference Palette (light/dark) to preserve theme switching.
- Keep component implementations free of hard-coded colours; consume semantic tokens only.
- Selected/Active are first-class groups; do not scope them under component names or interactive.\*.
- Focus rings should use focus.border globally rather than per-component colour overrides.

---

## Next Steps

- Validate the selected and active groups in Token Studio (import/export check).
- Ensure 1:1 entries exist for both light and dark modes in tokens.json.
- Update component docs (Tabs, Navigation, Lists) to reference selected/active tokens.

---

## Semantic Token Reference Table

This table shows all semantic colour tokens with their palette references and WCAG contrast ratios.

- Shows palette/semantic references for each token in Light and Dark themes
- Light contrast vs white (#FFFFFF), Dark contrast vs black (#000000)

| Token                                    | Light Reference                            | vs White | Dark Reference                             | vs Black |
| ---------------------------------------- | ------------------------------------------ | -------: | ------------------------------------------ | -------: |
| surface.undercanvas                      | {brand.core.ramp.core.neutral.150}         |     1.12 | {brand.core.ramp.core.neutral.150}         |     1.21 |
| surface.canvas                           | {brand.core.ramp.core.neutral.100}         |        1 | {brand.core.ramp.core.neutral.100}         |        1 |
| surface.level-1                          | {brand.core.ramp.core.neutral.100}         |        1 | {brand.core.ramp.core.neutral.100}         |        1 |
| surface.level-2                          | {brand.core.ramp.core.neutral.100}         |        1 | {brand.core.ramp.core.neutral.150}         |     1.21 |
| surface.level-3                          | {brand.core.ramp.core.neutral.100}         |        1 | {brand.core.ramp.core.neutral.200}         |     1.39 |
| surface.level-4                          | {brand.core.ramp.core.neutral.100}         |        1 | {brand.core.ramp.core.neutral.150}         |     1.21 |
| surface.inverse                          | {brand.core.ramp.core.neutral.1000}        |       21 | {brand.core.ramp.core.neutral.1000}        |       21 |
| surface.level-accent-low                 | {brand.core.ramp.core.neutral.200}         |     1.25 | {brand.core.ramp.core.neutral.700}         |     7.37 |
| surface.level-accent-medium              | {brand.core.ramp.core.neutral.350}         |     1.84 | {brand.core.ramp.core.neutral.400}         |        3 |
| surface.level-accent-high                | {brand.core.ramp.core.neutral.800}         |     8.45 | {brand.core.ramp.core.neutral.200}         |     1.39 |
| surface.overlay                          | {brand.core.ramp.digital.overlay.dark.500} |     3.35 | {brand.core.ramp.digital.overlay.dark.500} |        1 |
| text.primary                             | {brand.core.ramp.core.neutral.950}         |     17.4 | {brand.core.ramp.core.neutral.1000}        |       21 |
| text.secondary                           | {brand.core.ramp.core.neutral.900}         |    12.63 | {brand.core.ramp.core.neutral.900}         |    13.08 |
| text.inverse.primary                     | {brand.core.ramp.core.neutral.100}         |        1 | {brand.core.ramp.core.neutral.100}         |        1 |
| text.inverse.secondary                   | {brand.core.ramp.core.neutral.150}         |     1.12 | {brand.core.ramp.core.neutral.200}         |     1.39 |
| text.on-accent.primary                   | {brand.core.ramp.core.neutral.100}         |        1 | {brand.core.ramp.core.neutral.1000}        |       21 |
| text.on-accent.secondary                 | {brand.core.ramp.core.neutral.900}         |    12.63 | {brand.core.ramp.core.neutral.300}         |     2.03 |
| icon.primary                             | {text.primary}                             |     17.4 | {text.primary}                             |       21 |
| icon.secondary                           | {text.secondary}                           |    12.63 | {text.secondary}                           |    13.08 |
| icon.inverse                             | {text.inverse.primary}                     |        1 | {text.inverse.primary}                     |        1 |
| icon.on-accent.primary                   | {text.on-accent.primary}                   |        1 | {text.on-accent.primary}                   |       21 |
| icon.on-accent.secondary                 | {text.on-accent.secondary}                 |    12.63 | {text.on-accent.secondary}                 |     2.03 |
| border.primary                           | {brand.core.ramp.core.neutral.300}         |     1.61 | {brand.core.ramp.core.neutral.500}         |     4.43 |
| border.secondary                         | {brand.core.ramp.core.neutral.150}         |     1.12 | {brand.core.ramp.core.neutral.350}         |     2.48 |
| border.elevation                         | {brand.core.ramp.core.neutral.300}         |     1.61 | {brand.core.ramp.core.neutral.700}         |     7.37 |
| border.inverse                           | {brand.core.ramp.core.neutral.100}         |        1 | {brand.core.ramp.core.neutral.1000}        |       21 |
| border.on-accent.primary                 | {text.on-accent.primary}                   |        1 | {text.on-accent.primary}                   |       21 |
| border.on-accent.secondary               | {text.on-accent.secondary}                 |    12.63 | {text.on-accent.secondary}                 |     2.03 |
| input.fill.default                       | {brand.core.ramp.core.neutral.100}         |        1 | {brand.core.ramp.core.neutral.1000}        |       21 |
| input.fill.error                         | {brand.core.ramp.messaging.error.100}      |        1 | {brand.core.ramp.messaging.error.1000}     |       21 |
| input.border.default                     | {brand.core.ramp.core.neutral.500}         |     2.85 | {brand.core.ramp.core.neutral.700}         |     7.37 |
| input.border.error                       | {brand.core.ramp.messaging.error.700}      |     8.92 | {brand.core.ramp.messaging.error.700}      |     5.25 |
| input.text.default                       | {text.primary}                             |     17.4 | {text.primary}                             |       21 |
| input.text.error                         | {brand.core.ramp.messaging.error.1000}     |       21 | {brand.core.ramp.messaging.error.100}      |        1 |
| feedback.fill.error                      | {brand.core.ramp.messaging.error.100}      |        1 | {brand.core.ramp.messaging.error.100}      |        1 |
| feedback.fill.success                    | {brand.core.ramp.messaging.success.200}    |        1 | {brand.core.ramp.messaging.success.100}    |        1 |
| feedback.fill.warning                    | {brand.core.ramp.messaging.warning.200}    |        1 | {brand.core.ramp.messaging.warning.100}    |        1 |
| feedback.fill.info                       | {brand.core.ramp.messaging.info.100}       |        1 | {brand.core.ramp.messaging.info.100}       |        1 |
| feedback.text.error                      | {brand.core.ramp.messaging.error.1000}     |       21 | {brand.core.ramp.messaging.error.1000}     |       21 |
| feedback.text.success                    | {brand.core.ramp.messaging.success.1000}   |       21 | {brand.core.ramp.messaging.success.1000}   |    19.92 |
| feedback.text.warning                    | {brand.core.ramp.messaging.warning.1000}   |       21 | {brand.core.ramp.messaging.warning.1000}   |       21 |
| feedback.text.info                       | {brand.core.ramp.messaging.info.1000}      |       21 | {brand.core.ramp.messaging.info.1000}      |    18.13 |
| feedback.border.error                    | {brand.core.ramp.messaging.error.700}      |     8.92 | {brand.core.ramp.messaging.error.700}      |     5.25 |
| feedback.border.success                  | {brand.core.ramp.messaging.success.700}    |     8.73 | {brand.core.ramp.messaging.success.700}    |     6.67 |
| feedback.border.warning                  | {brand.core.ramp.messaging.warning.700}    |     5.12 | {brand.core.ramp.messaging.warning.700}    |    10.49 |
| feedback.border.info                     | {brand.core.ramp.messaging.info.700}       |     8.33 | {brand.core.ramp.messaging.info.700}       |     5.04 |
| interactive.primary.fill.default         | {brand.core.ramp.digital.blue.800}         |     7.25 | {brand.core.ramp.digital.blue.900}         |    10.01 |
| interactive.primary.fill.hover           | {brand.core.ramp.digital.blue.800}         |     7.25 | {brand.core.ramp.digital.blue.700}         |      2.9 |
| interactive.primary.fill.pressed         | {brand.core.ramp.digital.blue.800}         |     7.25 | {brand.core.ramp.digital.blue.700}         |      2.9 |
| interactive.primary.text.default         | {brand.core.ramp.core.neutral.100}         |        1 | {brand.core.ramp.core.neutral.100}         |        1 |
| interactive.primary.text.hover           | {brand.core.ramp.core.neutral.100}         |        1 | {brand.core.ramp.core.neutral.100}         |        1 |
| interactive.primary.text.pressed         | {brand.core.ramp.core.neutral.100}         |        1 | {brand.core.ramp.core.neutral.100}         |        1 |
| interactive.primary.icon.default         | {interactive.primary.text.default}         |        1 | {interactive.primary.text.default}         |        1 |
| interactive.primary.icon.hover           | {interactive.primary.text.hover}           |        1 | {interactive.primary.text.hover}           |        1 |
| interactive.primary.icon.pressed         | {interactive.primary.text.pressed}         |        1 | {interactive.primary.text.pressed}         |        1 |
| interactive.secondary.fill.default       | {brand.core.ramp.core.neutral.100}         |        1 | {brand.core.ramp.core.neutral.1000}        |       21 |
| interactive.secondary.fill.hover         | {brand.core.ramp.core.neutral.100}         |        1 | {brand.core.ramp.core.neutral.1000}        |       21 |
| interactive.secondary.fill.pressed       | {brand.core.ramp.core.neutral.100}         |        1 | {brand.core.ramp.core.neutral.1000}        |       21 |
| interactive.secondary.border.default     | {brand.core.ramp.core.neutral.800}         |     8.45 | {brand.core.ramp.core.neutral.800}         |    10.02 |
| interactive.secondary.border.hover       | {interactive.secondary.border.default}     |     8.45 | {interactive.secondary.border.default}     |    10.02 |
| interactive.secondary.border.pressed     | {interactive.secondary.border.default}     |     8.45 | {interactive.secondary.border.default}     |    10.02 |
| interactive.secondary.text.default       | {brand.core.ramp.core.neutral.800}         |     8.45 | {brand.core.ramp.core.neutral.800}         |    10.02 |
| interactive.secondary.text.hover         | {interactive.secondary.text.default}       |     8.45 | {interactive.secondary.text.default}       |    10.02 |
| interactive.secondary.text.pressed       | {interactive.secondary.text.default}       |     8.45 | {interactive.secondary.text.default}       |    10.02 |
| interactive.secondary.icon.default       | {interactive.secondary.text.default}       |     8.45 | {interactive.secondary.text.default}       |    10.02 |
| interactive.secondary.icon.hover         | {interactive.secondary.text.hover}         |     8.45 | {interactive.secondary.text.hover}         |    10.02 |
| interactive.secondary.icon.pressed       | {interactive.secondary.text.pressed}       |     8.45 | {interactive.secondary.text.pressed}       |    10.02 |
| interactive.disabled.a                   | {brand.core.ramp.core.neutral.600}         |     3.95 | {brand.core.ramp.core.neutral.700}         |     7.37 |
| interactive.disabled.b                   | {brand.core.ramp.core.neutral.700}         |     5.74 | {brand.core.ramp.core.neutral.800}         |    10.02 |
| interactive.disabled.c                   | {brand.core.ramp.core.neutral.800}         |     8.45 | {brand.core.ramp.core.neutral.900}         |    13.08 |
| interactive.link.primary.default         | {interactive.primary.fill.default}         |     7.25 | {interactive.primary.fill.default}         |    10.01 |
| interactive.link.primary.hover           | {interactive.primary.fill.hover}           |     7.25 | {interactive.primary.fill.hover}           |      2.9 |
| interactive.link.primary.pressed         | {interactive.primary.fill.pressed}         |     7.25 | {interactive.primary.fill.pressed}         |      2.9 |
| interactive.link.secondary.default       | {interactive.secondary.fill.default}       |        1 | {interactive.secondary.fill.default}       |       21 |
| interactive.link.secondary.hover         | {interactive.secondary.fill.hover}         |        1 | {interactive.secondary.fill.hover}         |       21 |
| interactive.link.secondary.pressed       | {interactive.secondary.fill.pressed}       |        1 | {interactive.secondary.fill.pressed}       |       21 |
| focus.border                             | {brand.core.ramp.core.neutral.800}         |     8.45 | {brand.core.ramp.core.neutral.200}         |     1.39 |
| tag.filled.live.fill                     | {brand.core.ramp.messaging.error.700}      |     8.92 | {brand.core.ramp.messaging.error.700}      |     5.25 |
| tag.filled.live.text                     | {text.inverse.primary}                     |        1 | {text.inverse.primary}                     |        1 |
| tag.filled.live.border                   | {brand.core.ramp.messaging.error.800}      |    18.41 | {brand.core.ramp.messaging.error.800}      |     6.42 |
| tag.filled.primary.fill                  | {brand.core.ramp.digital.blue.800}         |     7.25 | {brand.core.ramp.digital.blue.700}         |      2.9 |
| tag.filled.primary.text                  | {text.inverse.primary}                     |        1 | {text.inverse.primary}                     |        1 |
| tag.filled.primary.border                | {brand.core.ramp.digital.blue.900}         |    20.29 | {brand.core.ramp.digital.blue.800}         |      5.9 |
| tag.filled.secondary.fill                | {brand.core.ramp.core.neutral.800}         |     8.45 | {brand.core.ramp.core.neutral.700}         |     7.37 |
| tag.filled.secondary.text                | {text.inverse.primary}                     |        1 | {text.inverse.primary}                     |        1 |
| tag.filled.secondary.border              | {brand.core.ramp.core.neutral.900}         |    12.63 | {brand.core.ramp.core.neutral.800}         |    10.02 |
| tag.inline.live                          | {brand.core.ramp.messaging.error.700}      |     8.92 | {brand.core.ramp.messaging.error.700}      |     5.25 |
| tag.inline.primary                       | {brand.core.ramp.digital.blue.800}         |     7.25 | {brand.core.ramp.digital.blue.700}         |      2.9 |
| tag.inline.secondary                     | {brand.core.ramp.core.neutral.700}         |     5.74 | {brand.core.ramp.core.neutral.700}         |     7.37 |
