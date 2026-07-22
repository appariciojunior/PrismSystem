# Elevation System

**Reference**: `packages/tokens/docs/reference-modules/`  
**Use Case**: Understanding z-index levels, shadows, surface tokens  
**For Agent**: Code Agent, Testing Agent (validating elevation tokens)

---

## Overview

The elevation system creates visual hierarchy through layered surfaces that communicate depth, stacking order, and z-index positioning. Each elevation level combines surface fills, borders, and/or shadows to form a complete elevation treatment.

**Core Principles:**

1. **Z-index alignment** - Elevation levels map directly to z-index stacking order
2. **Visual-first approach** - Tokens created only when design demands distinct treatment
3. **Composite treatment** - Each level combines fill + border/shadow for complete visual effect
4. **Dark mode surface tints** - Higher elevations use lighter neutral ramps (inverted ramp)
5. **Level-1 uses border only** - No shadow to avoid visual bloat

## Token Structure

**Surface Tokens** - Location: `Palette - Light/Dark/ Core`

- Background colour for each elevation level
- Light mode: `neutral.100` (white) for most levels
- Dark mode: Progressively lighter neutrals (`neutral.150` → `neutral.800`)

**Border Tokens** - Location: `Palette - Light/Dark/ Core`

- Used ONLY at level-1 for subtle separation
- Light: `neutral.150`, Dark: `neutral.700`

**Shadow Tokens** - Location: `Shadows` token set (separate)

- Applied from level-2 onwards (not level-1)
- Organized into directional groups: `down` (downward-casting) and `up` (upward-casting)
- Down references: `{down.shadow030}`, `{down.shadow050}`, `{down.shadow060}`
- Up references: `{up.shadow030}`, `{up.shadow050}`, `{up.shadow060}`

For the full composite token reference table and per-level breakdowns, see:

- [Shadow Tokens Reference](../reference/shadows.md)

This module is the condensed quick-reference for elevation concepts. For shadow specifications, dark mode surface tint strategy, and implementation best practices, see `reference/shadows.md`.

## Z-Index Mapped Levels

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

## When to Use Each Level

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

## Shadow Specifications

Shadows are defined at the Foundation layer in two directional groups: **down** (traditional downward-casting) and **up** (upward-casting for bottom-anchored UI).

### Down Shadows (Positive Y-Offset)

Used for: Top navigation, dropdowns, modals, cards elevated above canvas

**Level 2 (Interactive Cards) - References `{down.shadow030}`:**

```
Offset: 0px, 4px
Blur: 8px
Spread: 0px
Color: rgba({brand.black}, 0.08)
```

**Level 3 (Sticky Headers) - References `{down.shadow050}`:**

```
Offset: 0px, 16px
Blur: 24px
Spread: 0px
Color: rgba({brand.black}, 0.08)
```

**Level 4 (Modals/Overlays) - References `{down.shadow060}`:**

```
Offset: 0px, 20px
Blur: 32px
Spread: 0px
Color: rgba({brand.black}, 0.08)
```

### Up Shadows (Negative Y-Offset)

Used for: Bottom navigation, sticky footers, bottom sheets, floating action buttons at screen bottom

**Level 2 (Interactive Bottom Elements) - References `{up.shadow030}`:**

```
Offset: 0px, -4px
Blur: 8px
Spread: 0px
Color: rgba({brand.black}, 0.08)
```

**Level 3 (Sticky Bottom Nav) - References `{up.shadow050}`:**

```
Offset: 0px, -16px
Blur: 24px
Spread: 0px
Color: rgba({brand.black}, 0.08)
```

**Level 4 (Bottom Sheets) - References `{up.shadow060}`:**

```
Offset: 0px, -20px
Blur: 32px
Spread: 0px
Color: rgba({brand.black}, 0.08)
```

### Foundation Shadow Structure

```
foundation/
  down/
    shadow010, shadow020, shadow030, shadow040, shadow050, shadow060
  up/
    shadow010, shadow020, shadow030, shadow040, shadow050, shadow060
```

### Semantic Shadow References

```
shadows/
  shadow/
    elevation/
      down/
        level-2 → {down.shadow030}
        level-3 → {down.shadow050}
        level-4 → {down.shadow060}
      up/
        level-2 → {up.shadow030}
        level-3 → {up.shadow050}
        level-4 → {up.shadow060}
```

## Best Practices

**✅ Do:**

- Match level surfaces with corresponding directional shadows (level-2→down/up.shadow030, level-3→down/up.shadow050, level-4→down/up.shadow060)
- Use **down shadows** for top-anchored UI (headers, dropdowns, modals)
- Use **up shadows** for bottom-anchored UI (bottom nav, sticky footers, bottom sheets)
- Use `border.elevation` for level-1 (not shadows)
- Limit to 4 elevation levels maximum
- Validate text contrast on accent surfaces (≥ 4.5:1 WCAG AA)
- Test dark mode surface tint differentiation

**❌ Don't:**

- Mix mismatched elevation/shadow pairs or directions
- Apply shadows to level-1
- Use down shadows on bottom-anchored elements (creates visual disconnect)
- Use up shadows on top-anchored elements
- Stack more than 4 levels
- Use accent surfaces for interactive elements
