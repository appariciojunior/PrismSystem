# Shadows & Elevation

## Elevation System

### Overview

The elevation system creates visual hierarchy through layered surfaces that communicate depth, stacking order, and z-index positioning. Each elevation level combines surface fills, borders, and/or shadows to form a complete elevation treatment.

**Core Principles:**

1. **Z-index alignment** - Elevation levels map directly to z-index stacking order
2. **Visual-first approach** - Tokens created only when design demands distinct treatment
3. **Composite treatment** - Each level combines fill + border/shadow for complete visual effect
4. **Dark mode surface tints** - Higher elevations use lighter neutral ramps (inverted ramp)
5. **Level-1 uses border only** - No shadow to avoid visual bloat

### Token Structure

**Surface Tokens** - Location: `Palette - Light/Dark/ Core`

- Background colour for each elevation level
- Light mode: `neutral.100` (white) for most levels
- Dark mode: Progressively lighter neutrals (`neutral.150` → `neutral.800`)

**Border Tokens** - Location: `Palette - Light/Dark/ Core`

- Used ONLY at level-1 for subtle separation
- Light: `neutral.150`, Dark: `neutral.700`

**Shadow Tokens** - Location: `Shadows` token set (separate)

- Applied from level-2 onwards (not level-1)
- Organized into directional groups: `down` (downward-casting, positive y-offset) and `up` (upward-casting, negative y-offset)
- Down references: `{down.shadow030}`, `{down.shadow050}`, `{down.shadow060}`
- Up references: `{up.shadow030}`, `{up.shadow050}`, `{up.shadow060}`
- Use down shadows for top-anchored UI; up shadows for bottom-anchored UI

### Elevation System: Composite Token Reference

This table documents the complete elevation system with composite token names, their visual composition, usage, and z-index positioning.

| Composite Token                     | Visual Composition       | Usage                                                     | Z-Index  | Light Mode Values                                                                                                                             | Dark Mode Values                                                                                                                                             |
| :---------------------------------- | :----------------------- | :-------------------------------------------------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`elevation.level-undercanvas`**   | Fill only                | Page backgrounds, app scaffolding                         | -1       | `surface.undercanvas` → `neutral.100` (#FFFFFF white)                                                                                         | `surface.undercanvas` → `neutral.150` (#0D0D0D)                                                                                                              |
| **`elevation.level-canvas`**        | Fill only                | Base content area, article body                           | 0        | `surface.canvas` → `neutral.100` (#FFFFFF white)                                                                                              | `surface.canvas` → `neutral.100` (#000000 black, inverted ramp)                                                                                              |
| **`elevation.level-1`**             | Fill + Border            | Flat cards, content blocks, panels                        | 100      | `surface.level-1` → `neutral.100` (#FFFFFF)<br>`border.elevation` → `neutral.150` (#F5F5F5)                                                   | `surface.level-1` → `neutral.100` (#000000)<br>`border.elevation` → `neutral.500` (#666666, inverted ramp)                                                   |
| **`elevation.level-2`**             | Fill + Shadow            | Interactive/draggable cards, emphasis containers          | 200      | `surface.level-2` → `neutral.100` (#FFFFFF)<br>`shadow.elevation.down.level-2` → `{down.shadow030}`                                           | `surface.level-2` → `neutral.150` (#0D0D0D, inverted ramp)<br>`shadow.elevation.down.level-2` → `{down.shadow030}`                                           |
| **`elevation.level-3`**             | Fill + Shadow            | Sticky headers/footers, persistent navigation             | 300      | `surface.level-3` → `neutral.100` (#FFFFFF)<br>`shadow.elevation.down.level-3` → `{down.shadow050}`                                           | `surface.level-3` → `neutral.200` (#1A1A1A, inverted ramp)<br>`shadow.elevation.down.level-3` → `{down.shadow050}`                                           |
| **`elevation.level-4`**             | Fill + Shadow + Backdrop | Modals, dialogs, dropdowns, tooltips                      | 400      | `surface.level-4` → `neutral.100` (#FFFFFF)<br>`shadow.elevation.down.level-4` → `{down.shadow060}`<br>`surface.overlay` → `overlay.dark.500` | `surface.level-4` → `neutral.150` (#0D0D0D, inverted ramp)<br>`shadow.elevation.down.level-4` → `{down.shadow060}`<br>`surface.overlay` → `overlay.dark.500` |
| **`elevation.level-inverse`**       | Fill only                | Dark cards in light mode, light cards in dark mode        | Inherits | `surface.inverse` → `neutral.1000` (#000000 black)                                                                                            | `surface.inverse` → `neutral.1000` (#FFFFFF white, inverted ramp)                                                                                            |
| **`elevation.level-accent-low`**    | Fill only                | Subtle backgrounds, light badges, minimal highlights      | Inherits | `surface.level-accent-low` → `neutral.200`                                                                                 | `surface.level-accent-low` → `neutral.700` (inverted tonality)                                                                            |
| **`elevation.level-accent-medium`** | Fill only                | Tags, info boxes, moderate feature callouts               | Inherits | `surface.level-accent-medium` → `neutral.350`                                                                              | `surface.level-accent-medium` → `neutral.500` (inverted tonality)                                                                         |
| **`elevation.level-accent-high`**   | Fill only                | Promotional banners, key callouts, strong visual emphasis | Inherits | `surface.level-accent-high` → `neutral.800`                                                                                | `surface.level-accent-high` → `neutral.300` (inverted tonality)                                                                           |

**Key Observations:**

- **Level-1**: Border provides subtle separation without shadow weight
- **Level-2, 3, 4**: Shadows replace borders for progressively stronger depth
- **Agnostic levels**: No shadows or borders, only fill variations
- **Dark mode**: Uses **inverted neutral ramp** where `neutral.100` = black (#000000), `neutral.1000` = white (#FFFFFF)
- **Dark mode surface tints**: Higher elevations use lighter neutrals (`neutral.150` #0D0D0D → `neutral.800` #B3B3B3)

### Z-Index Mapped Levels

These levels correspond directly to z-index stacking order and should guide component layering decisions.

#### Level -1: Undercanvas

**Purpose**: Deepest background layer for page scaffolding  
**Z-index**: -1 (behind all content)  
**Use cases**: Application background, page wrapper, decorative backgrounds

**Light Mode:**

```
surface.undercanvas: {brand.core.ramp.core.neutral.100}  // #FFFFFF white
```

**Dark Mode:**

```
surface.undercanvas: {brand.core.ramp.core.neutral.150}  // #0D0D0D (inverted ramp)
```

**Token Composition**: Fill only (no border or shadow)

---

#### Level 0: Canvas

**Purpose**: Base surface where primary content resides  
**Z-index**: 0 (baseline)  
**Use cases**: Page body, main content area, article backgrounds

**Light Mode:**

```
surface.canvas: {brand.core.ramp.core.neutral.100}  // #FFFFFF white
```

**Dark Mode:**

```
surface.canvas: {brand.core.ramp.core.neutral.100}  // #000000 black (inverted ramp)
```

**Token Composition**: Fill only (no border or shadow)

---

#### Level 1: Contained Elements

**Purpose**: First elevation above canvas for cards and panels  
**Z-index**: 100  
**Use cases**: Article cards, content blocks, non-interactive containers

**Light Mode:**

```
surface.level-1: {brand.core.ramp.core.neutral.100}  // #FFFFFF white
border.elevation: {brand.core.ramp.core.neutral.150}  // #F5F5F5 subtle grey border
```

**Dark Mode:**

```
surface.level-1: {brand.core.ramp.core.neutral.100}  // #000000 black (same as canvas, inverted ramp)
border.elevation: {brand.core.ramp.core.neutral.500}  // #666666 visible contrast (inverted ramp)
```

**Token Composition**: Fill + Border (no shadow)  
**Rationale**: Subtle border provides separation without heavy shadows for everyday content

---

#### Level 2: Interactive Cards

**Purpose**: Hierarchy within canvas-level content  
**Z-index**: 200  
**Use cases**: Draggable cards (Jira/Trello style), interactive panels, emphasis containers

**Light Mode:**

```
surface.level-2: {brand.core.ramp.core.neutral.100}  // #FFFFFF white
shadow.elevation.level-2: {shadow030}  // 0px 4px 8px rgba(0,0,0,0.08)
```

**Dark Mode:**

```
surface.level-2: {brand.core.ramp.core.neutral.150}  // #0D0D0D very dark grey (inverted ramp)
shadow.elevation.level-2: {shadow030}  // 0px 4px 8px rgba(0,0,0,0.08)
```

**Token Composition**: Fill + Shadow  
**Rationale**: Shadow replaces border for stronger lift; dark mode surface tint increases visibility

---

#### Level 3: Sticky Elements

**Purpose**: Fixed navigation and persistent UI  
**Z-index**: 300  
**Use cases**: Headers, footers, sticky sidebars, floating toolbars

**Light Mode:**

```
surface.level-3: {brand.core.ramp.core.neutral.100}  // #FFFFFF white
shadow.elevation.level-3: {shadow050}  // 0px 16px 24px rgba(0,0,0,0.08)
```

**Dark Mode:**

```
surface.level-3: {brand.core.ramp.core.neutral.200}  // #1A1A1A dark grey (inverted ramp)
shadow.elevation.level-3: {shadow050}  // 0px 16px 24px rgba(0,0,0,0.08)
```

**Token Composition**: Fill + Shadow  
**Rationale**: Deeper shadow communicates persistence and higher z-index positioning; subtle surface tint for sticky UI

---

#### Level 4: Overlays

**Purpose**: Highest elevation for transient UI over other surfaces  
**Z-index**: 400  
**Use cases**: Modals, dialogs, dropdowns, tooltips, floating action buttons  
**Special requirement**: Must be used with overlay scrim/backdrop

**Light Mode:**

```
surface.level-4: {brand.core.ramp.core.neutral.100}  // #FFFFFF white
shadow.elevation.level-4: {shadow060}  // 0px 20px 32px rgba(0,0,0,0.08)
surface.overlay: {brand.core.ramp.digital.overlay.dark.500}  // semi-transparent backdrop
```

**Dark Mode:**

```
surface.level-4: {brand.core.ramp.core.neutral.150}  // #0D0D0D very dark grey (inverted ramp)
shadow.elevation.level-4: {shadow060}  // 0px 20px 32px rgba(0,0,0,0.08)
surface.overlay: {brand.core.ramp.digital.overlay.dark.500}  // semi-transparent backdrop
```

**Token Composition**: Fill + Shadow + Overlay Backdrop  
**Rationale**: Maximum separation; distinct surface tint in dark mode; scrim focuses attention

---

### Agnostic Elevation Levels

These levels are not tied to specific z-index values. They inherit the z-index of the surface they're applied to, providing semantic colour variations for non-positional hierarchy.

#### Level Inverse

**Purpose**: Inverted surface for contrast in both modes  
**Z-index**: Inherits from parent  
**Use cases**: Dark cards in light mode, light cards in dark mode, visual contrast within same elevation

**Light Mode:**

```
surface.inverse: {brand.core.ramp.core.neutral.1000}  // #000000 black
text.inverse.primary: {brand.core.ramp.core.neutral.100}  // #FFFFFF white text
```

**Dark Mode:**

```
surface.inverse: {brand.core.ramp.core.neutral.100}  // #FFFFFF white (inverted ramp)
text.inverse.primary: {brand.core.ramp.core.neutral.100}  // #000000 black text (inverted ramp)
```

**Token Composition**: Fill only; pair with inverse text tokens  
**Rationale**: Provides visual prominence through colour inversion, not elevation change

---

#### Level Accent Low

**Purpose**: Subtle accent surface for minimal emphasis  
**Z-index**: Inherits from parent  
**Use cases**: Subtle backgrounds, light badges, minimal highlights

**Light Mode:**

```
surface.level-accent-low: {brand.core.ramp.core.neutral.200}  // Core: neutral.200
text.primary: {brand.core.ramp.core.neutral.1000}  // #000000 black standard text
```

**Dark Mode:**

```
surface.level-accent-low: {brand.core.ramp.core.neutral.700}  // Core: neutral.700 (inverted tonality)
text.primary: {brand.core.ramp.core.neutral.1000}  // #FFFFFF white standard text (inverted ramp)
```

**Token Composition**: Fill + Standard text tokens  
**Rationale**: Lightest accent emphasis; readable with standard text; inverted tonality in dark mode for contrast

---

#### Level Accent Medium

**Purpose**: Moderate accent surface for tags and info boxes  
**Z-index**: Inherits from parent  
**Use cases**: Tags, info boxes, moderate feature callouts

**Light Mode:**

```
surface.level-accent-medium: {brand.core.ramp.core.neutral.350}  // Core: neutral.350
text.primary: {brand.core.ramp.core.neutral.1000}  // #000000 black standard text
```

**Dark Mode:**

```
surface.level-accent-medium: {brand.core.ramp.core.neutral.500}  // Core: neutral.500 (inverted tonality)
text.primary: {brand.core.ramp.core.neutral.1000}  // #FFFFFF white standard text (inverted ramp)
```

**Token Composition**: Fill + Standard text tokens  
**Rationale**: Medium emphasis for tagging and informational surfaces; uses nearest defined neutral steps

---

#### Level Accent High

**Purpose**: Strong accent surface for prominent callouts  
**Z-index**: Inherits from parent  
**Use cases**: Promotional banners, key callouts, strong visual emphasis

**Light Mode:**

```
surface.level-accent-high: {brand.core.ramp.core.neutral.800}  // Core: neutral.800
text.inverse.primary: {brand.core.ramp.core.neutral.100}  // white text for high contrast (validate ≥4.5:1)
```

**Dark Mode:**

```
surface.level-accent-high: {brand.core.ramp.core.neutral.300}  // Core: neutral.300 (inverted tonality)
text.primary: {brand.core.ramp.core.neutral.1000}  // #FFFFFF white standard text (inverted ramp)
```

**Token Composition**: Fill + Inverse Text tokens (light) or Standard text (dark)  
**Rationale**: Highest emphasis; saturated colors in light mode require inverse text; inverted tonality maintains contrast in dark mode  
**Contrast Requirement**: **Minimum 4.5:1** (WCAG AA) when using saturated fills with inverse text

---

### Token Implementation

**Surface Tokens** - Available in all 8 theme sets:

- `surface.undercanvas`, `surface.canvas`
- `surface.level-1`, `surface.level-2`, `surface.level-3`, `surface.level-4`
- `surface.inverse`
- `surface.level-accent-low`, `surface.level-accent-medium`, `surface.level-accent-high`
- `surface.overlay`

**Border Tokens:**

- `border.elevation` - Used only with level-1

**Shadow Tokens** - In `Shadows` set:

- Directional groups: `down` (downward-casting) and `up` (upward-casting)
- Down shadows:
  - `shadow.elevation.down.level-2` → `{down.shadow030}` (0px 4px 8px rgba({brand.black},0.08))
  - `shadow.elevation.down.level-3` → `{down.shadow050}` (0px 16px 24px rgba({brand.black},0.08))
  - `shadow.elevation.down.level-4` → `{down.shadow060}` (0px 20px 32px rgba({brand.black},0.08))
- Up shadows:
  - `shadow.elevation.up.level-2` → `{up.shadow030}` (0px -4px 8px rgba({brand.black},0.08))
  - `shadow.elevation.up.level-3` → `{up.shadow050}` (0px -16px 24px rgba({brand.black},0.08))
  - `shadow.elevation.up.level-4` → `{up.shadow060}` (0px -20px 32px rgba({brand.black},0.08))

### Usage Examples

**Level 1 Container:**

```
Fill: surface.level-1
Border: border.elevation (1px solid)
```

**Level 2 Card (Top-anchored):**

```
Fill: surface.level-2
Shadow: shadow.elevation.down.level-2
```

**Level 2 Bottom Nav (Bottom-anchored):**

```
Fill: surface.level-2
Shadow: shadow.elevation.up.level-2
```

**Level 4 Modal (Top-anchored):**

```
Fill: surface.level-4
Shadow: shadow.elevation.down.level-4
Backdrop: surface.overlay
```

**Level 4 Bottom Sheet (Bottom-anchored):**

```
Fill: surface.level-4
Shadow: shadow.elevation.up.level-4
Backdrop: surface.overlay
```

### Shadow Specifications

Shadows are defined at the Foundation layer in two directional groups: **down** (traditional downward-casting) and **up** (upward-casting for bottom-anchored UI). Current implementation uses consistent shadow opacity across light/dark modes (8%), with dark mode relying on surface tints for differentiation.

#### Foundation Shadow Structure

```
foundation/
  down/      // Positive y-offset (downward-casting)
    shadow010, shadow020, shadow030, shadow040, shadow050, shadow060
  up/        // Negative y-offset (upward-casting)
    shadow010, shadow020, shadow030, shadow040, shadow050, shadow060
```

#### Down Shadows (Positive Y-Offset)

Used for: Top navigation, dropdown menus, modals, cards elevated above canvas, sticky headers

**Level 2 (Interactive Cards) - References `{down.shadow030}`:**

```
Offset: 0px, 4px (downward)
Blur: 8px
Spread: 0px
Color: rgba({brand.black}, 0.08)
```

**Level 3 (Sticky Headers) - References `{down.shadow050}`:**

```
Offset: 0px, 16px (downward)
Blur: 24px
Spread: 0px
Color: rgba({brand.black}, 0.08)
```

**Level 4 (Modals/Overlays) - References `{down.shadow060}`:**

```
Offset: 0px, 20px (downward)
Blur: 32px
Spread: 0px
Color: rgba({brand.black}, 0.08)
```

#### Up Shadows (Negative Y-Offset)

Used for: Bottom navigation bars, sticky footers, bottom sheets, floating action buttons at screen bottom

**Level 2 (Bottom Interactive Elements) - References `{up.shadow030}`:**

```
Offset: 0px, -4px (upward)
Blur: 8px
Spread: 0px
Color: rgba({brand.black}, 0.08)
```

**Level 3 (Sticky Bottom Nav) - References `{up.shadow050}`:**

```
Offset: 0px, -16px (upward)
Blur: 24px
Spread: 0px
Color: rgba({brand.black}, 0.08)
```

**Level 4 (Bottom Sheets) - References `{up.shadow060}`:**

```
Offset: 0px, -20px (upward)
Blur: 32px
Spread: 0px
Color: rgba({brand.black}, 0.08)
```

#### Semantic Shadow References

```
shadows/
  shadow/
    elevation/
      down/      // For top-anchored UI
        level-2 → {down.shadow030}
        level-3 → {down.shadow050}
        level-4 → {down.shadow060}
      up/        // For bottom-anchored UI
        level-2 → {up.shadow030}
        level-3 → {up.shadow050}
        level-4 → {up.shadow060}
```

#### When to Use Directional Shadows

| UI Pattern               | Direction | Shadow Token                      | Rationale                                                       |
| ------------------------ | --------- | --------------------------------- | --------------------------------------------------------------- |
| Top navigation           | Down      | `shadow.elevation.down.level-3`   | Casts shadow downward onto content below                        |
| Dropdown menus           | Down      | `shadow.elevation.down.level-2/3` | Opens downward from trigger, shadow reinforces depth            |
| Modals/dialogs           | Down      | `shadow.elevation.down.level-4`   | Overlays entire viewport, downward shadow is convention         |
| Bottom navigation        | Up        | `shadow.elevation.up.level-3`     | Anchored to bottom, casts shadow upward onto content above      |
| Sticky footers           | Up        | `shadow.elevation.up.level-2/3`   | Fixed to bottom edge, upward shadow creates separation          |
| Bottom sheets            | Up        | `shadow.elevation.up.level-4`     | Slides up from bottom, shadow reinforces upward motion          |
| Floating action (bottom) | Up        | `shadow.elevation.up.level-2`     | Positioned at screen bottom, upward shadow maintains visual cue |
| Cards (mid-content)      | Down      | `shadow.elevation.down.level-2`   | Default downward shadow for neutral elevation                   |
| Toast (bottom-anchored)  | Up        | `shadow.elevation.up.level-2`     | Appears from bottom, upward shadow creates depth                |

**Key Principle**: Shadow direction should align with the UI element's anchoring point to create natural visual hierarchy and motion cues.

### Dark Mode Strategy

**Inverted Neutral Ramp**: Dark mode uses `neutral.100` = #000000 (black), `neutral.1000` = #FFFFFF (white).

**Surface Tint Progression:**

```
Level -1: neutral.150  (#0D0D0D, inverted ramp)
Level 0:  neutral.100  (#000000, inverted ramp)
Level 1:  neutral.100  (#000000, differentiated by border)
Level 2:  neutral.150  (#0D0D0D, inverted ramp)
Level 3:  neutral.200  (#1A1A1A, inverted ramp)
Level 4:  neutral.150  (#0D0D0D, inverted ramp)
```

**Border**: `border.elevation` = `neutral.500` (#666666, inverted ramp) for level-1.

Higher z-index = lighter surface. Shadows provide edge definition rather than depth perception.

### Usage Guidelines

**When to Use Each Level:**

| Level                | Use Cases                                        | Don't Use For        |
| -------------------- | ------------------------------------------------ | -------------------- |
| **Undercanvas (-1)** | Page backgrounds, app scaffolding                | Content containers   |
| **Canvas (0)**       | Primary content area, article body               | Elevated UI          |
| **Level 1**          | Flat cards, content blocks, panels               | Draggable elements   |
| **Level 2**          | Interactive/draggable cards, emphasis containers | Sticky navigation    |
| **Level 3**          | Headers, footers, persistent navigation          | Modals, dropdowns    |
| **Level 4**          | Modals, dialogs, menus, tooltips                 | Everyday content     |
| **Inverse**          | Contrast cards, dark-in-light UI                 | Elevation changes    |
| **Accent Low**       | Subtle backgrounds, light badges                 | Strong emphasis      |
| **Accent Medium**    | Tags, info boxes, moderate callouts              | Primary content      |
| **Accent High**      | Promotional banners, key callouts                | Interactive elements |

**Z-Index Reference:**

```
-1:  Undercanvas
0:   Canvas
100: Level 1 (cards, panels)
200: Level 2 (interactive cards)
300: Level 3 (sticky nav, headers)
400: Level 4 (overlays, modals)
500: Overlay backdrop
```

### Accessibility Considerations

1. **Contrast Validation**: Always validate text contrast on accent surfaces (≥ 4.5:1 WCAG AA)
2. **Dark Mode Testing**: Check shadow visibility and surface tint differentiation
3. **Focus States**: Elevated surfaces must maintain visible focus indicators
4. **Motion Sensitivity**: Elevation transitions should respect `prefers-reduced-motion`

### Best Practices

**✅ Do:**

- Match level surfaces with corresponding directional shadows
  - Top-anchored: level-2→down.shadow030, level-3→down.shadow050, level-4→down.shadow060
  - Bottom-anchored: level-2→up.shadow030, level-3→up.shadow050, level-4→up.shadow060
- Use **down shadows** for top-anchored UI (headers, dropdowns, modals, cards)
- Use **up shadows** for bottom-anchored UI (bottom nav, sticky footers, bottom sheets)
- Use `border.elevation` for level-1 (not shadows)
- Limit to 4 elevation levels maximum
- Validate text contrast on accent surfaces (≥ 4.5:1 WCAG AA)
- Test dark mode surface tint differentiation
- Test shadow visibility across different backgrounds

**❌ Don't:**

- Mix mismatched elevation/shadow pairs or directions
- Use down shadows on bottom-anchored elements (creates visual disconnect)
- Use up shadows on top-anchored elements
- Apply shadows to level-1
- Stack more than 4 levels
- Use accent surfaces for interactive elements
- Combine conflicting shadow directions (e.g., both up and down on same element)

---
