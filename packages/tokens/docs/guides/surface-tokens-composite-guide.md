# Surface Tokens: Composite Token Guide for Designers

## Overview

Surface tokens define elevation hierarchy and visual depth across the design system. **Importantly, surface tokens are composite tokens**—they combine multiple individual tokens (fill, border, shadow) to achieve a complete visual effect.

When applying surface tokens to shapes, frames, and components, designers must understand which accompanying tokens are required to achieve the intended design. This guide details exactly which tokens need to be combined for each elevation level.

---

## Key Concept: Composite Tokens

A single surface token like `surface.level-1` is not a complete solution on its own. It must be paired with:

- **Fill token** – the background colour
- **Border token** (if applicable) – the edge definition
- **Shadow token** (if applicable) – the depth indicator

**Why?** Different elevation levels require different combinations. Level-1 cards need borders for subtle separation; Level-2+ cards need shadows for progressive depth. This flexibility allows precise control while maintaining consistency.

---

## Surface Token Composition Reference

### `surface.undercanvas`

**Purpose:** Deepest background beneath canvas. Rarely visible; used for special contexts (e.g., page backgrounds in certain layouts).

**Tokens Required:**

- **Fill only:** `surface.undercanvas`
- **No border, no shadow**

**Use Cases:**

- Page/application background (beneath main canvas)
- Specialty layouts requiring visual depth separation

**Example:**

```
Background: surface.undercanvas
Border: None
Shadow: None
```

---

### `surface.canvas`

**Purpose:** Primary background layer. Page/application base. Standard default background.

**Tokens Required:**

- **Fill only:** `surface.canvas`
- **No border, no shadow**

**Use Cases:**

- Article body content
- Main page/screen background
- Default canvas for all UI

---

### `surface.level-1` (Flat Cards & Panels)

**Purpose:** First elevation above canvas. Subtle lift for cards and contained components.

**Tokens Required:**

- **Fill:** `surface.level-1`
- **Border:** `border.elevation` (1px solid)
- **No shadow**

**Why this combination?**

- The border provides subtle visual separation without the weight of a shadow
- Best for everyday content cards, panels, and non-interactive containers
- Minimal depth — keeps focus on content

**Use Cases:**

- Content cards
- Panels
- List items
- Boxes/containers with subtle separation

**Example:**

```
Background: surface.level-1
Border: 1px solid border.elevation
Shadow: None
```

---

### `surface.level-2` (Interactive Cards)

**Purpose:** Second elevation. Modest lift for grouped content and secondary panels.

**Tokens Required:**

- **Fill:** `surface.level-2`
- **Shadow:** `shadow.elevation.level-2`
- **No border**

**Why this combination?**

- Shadow replaces border — provides stronger visual depth than level-1
- Used for interactive or draggable cards
- Indicates the card can be engaged with (hover, drag, etc.)

**Use Cases:**

- Draggable/interactive cards
- Emphasis containers
- Secondary panels
- Grouped content requiring more lift than level-1

**Example:**

```
Background: surface.level-2
Border: None
Shadow: shadow.elevation.level-2
```

---

### `surface.level-3` (Sticky Headers & Persistent Navigation)

**Purpose:** Third elevation. Prominent lift for popovers and tertiary containers.

**Tokens Required:**

- **Fill:** `surface.level-3`
- **Shadow:** `shadow.elevation.level-3`
- **No border**

**Why this combination?**

- Stronger shadow than level-2 — indicates high visual prominence
- Used for persistent UI elements (headers, footers, sticky sidebars)
- Suggests these elements "float" above content

**Use Cases:**

- Sticky headers
- Persistent sidebars
- Footers
- Popovers
- Tertiary containers

**Example:**

```
Background: surface.level-3
Border: None
Shadow: shadow.elevation.level-3
```

---

### `surface.level-4` (Modals & Overlays)

**Purpose:** Fourth elevation. Highest lift for modals, dialogs, and overlays.

**Tokens Required:**

- **Fill:** `surface.level-4`
- **Shadow:** `shadow.elevation.level-4`
- **Backdrop:** `surface.overlay` (on the layer beneath the modal)
- **No border**

**Why this combination?**

- Strongest shadow — indicates modal is the focal point
- Requires backdrop overlay to darken content behind it
- **Critical:** Apply `surface.overlay` to a semi-transparent scrim layer behind the modal
- The overlay provides context that this is a modal requiring action/dismissal

**Use Cases:**

- Modals
- Dialogs
- Dropdowns (on desktop)
- Tooltips
- Any floating overlay requiring user interaction

**Example:**

```
Layer Structure:
1. Scrim/Backdrop: Background fill = surface.overlay (semi-transparent)
2. Modal Container:
   - Background: surface.level-4
   - Shadow: shadow.elevation.level-4
   - Border: None
```

---

### `surface.inverse`

**Purpose:** Inverted background. Adapts per theme — dark surfaces in light mode, light surfaces in dark mode.

**Tokens Required:**

- **Fill only:** `surface.inverse`
- **No border, no shadow**

**Why no additional tokens?**

- Used for contrast/inverse scenarios (e.g., dark card in light mode)
- Semantic meaning is encoded in the single token

**Use Cases:**

- Inverse cards (dark surfaces in light mode)
- High-contrast scenarios requiring the opposite colour mode
- Special branded callouts with inverse treatment

**Example:**

```
Background: surface.inverse
Border: None
Shadow: None
```

---

### `surface.level-accent-low` (Low-Emphasis Accent)

**Purpose:** Low-emphasis accent background. Subtle tint using a brand tier colour.

**Tokens Required:**

- **Fill only:** `surface.level-accent-low`
- **No border, no shadow**

**Why no additional tokens?**

- Accent surfaces rely on colour alone for differentiation
- No structural depth indicator (border/shadow) needed
- Colour contrast provides all necessary visual hierarchy

**Use Cases:**

- Subtle callouts
- Light tinted backgrounds for secondary information
- Branded accents with minimal emphasis

---

### `surface.level-accent-medium` (Medium-Emphasis Accent)

**Purpose:** Medium-emphasis accent background. Moderate saturation for accents.

**Tokens Required:**

- **Fill only:** `surface.level-accent-medium`
- **No border, no shadow**

**Why no additional tokens?**

- More saturated than low-emphasis, but still accent-only
- Colour intensity provides visual hierarchy
- No border/shadow needed — colour contrast is sufficient

**Use Cases:**

- Moderate callouts
- Branded sections with medium emphasis
- Featured content areas

---

### `surface.level-accent-high` (High-Emphasis Accent)

**Purpose:** High-emphasis accent background. Strong saturation for featured content.

**Tokens Required:**

- **Fill only:** `surface.level-accent-high`
- **No border, no shadow**

**Why no additional tokens?**

- Highest colour saturation — stands out strongly
- Colour alone communicates importance
- Shadow/border would over-complicate the visual treatment

**Use Cases:**

- Promotional banners
- Key callouts
- Strong visual emphasis areas
- Featured/hero content

---

### `surface.overlay`

**Purpose:** Semi-transparent overlay. Used for modals, backdrop scrim, and dimming content behind floating elements.

**Tokens Required:**

- **Fill only:** `surface.overlay` (apply to scrim/backdrop layer)
- **No border, no shadow**

**Important:** This is a **background layer token**, not a direct surface token for the component itself.

**Why this matters?**

- Create a layer behind your modal/overlay
- Apply `surface.overlay` as the background fill
- Dim/blur the content beneath to indicate a modal state
- The modal itself uses `surface.level-4`

**Use Cases:**

- Backdrop scrim behind modals
- Dimming effects for dialogs
- Focus dimming in lightboxes
- Any "content behind overlay" scenario

**Example (Modal Structure):**

```
Layer 1: Scrim/Backdrop
  - Background: surface.overlay
  - (Optional) Blur: 4px

Layer 2: Modal Container
  - Background: surface.level-4
  - Shadow: shadow.elevation.level-4
```

---

## Quick Reference Table

| Token                         | Fill | Border                | Shadow                        | Z-Index | Use Case                         |
| ----------------------------- | ---- | --------------------- | ----------------------------- | ------- | -------------------------------- |
| `surface.undercanvas`         | ✅   | ❌                    | ❌                            | 0       | Special background contexts      |
| `surface.canvas`              | ✅   | ❌                    | ❌                            | 0       | Page/application base            |
| `surface.level-1`             | ✅   | ✅ `border.elevation` | ❌                            | 100     | Cards, panels, subtle separation |
| `surface.level-2`             | ✅   | ❌                    | ✅ `shadow.elevation.level-2` | 200     | Interactive cards, emphasis      |
| `surface.level-3`             | ✅   | ❌                    | ✅ `shadow.elevation.level-3` | 300     | Sticky headers, persistent nav   |
| `surface.level-4`             | ✅   | ❌                    | ✅ `shadow.elevation.level-4` | 400     | Modals, dropdowns, overlays      |
| `surface.inverse`             | ✅   | ❌                    | ❌                            | Varies  | Inverse/contrast scenarios       |
| `surface.level-accent-low`    | ✅   | ❌                    | ❌                            | Varies  | Low-emphasis accents             |
| `surface.level-accent-medium` | ✅   | ❌                    | ❌                            | Varies  | Medium-emphasis accents          |
| `surface.level-accent-high`   | ✅   | ❌                    | ❌                            | Varies  | High-emphasis accents            |
| `surface.overlay`             | ✅   | ❌                    | ❌                            | 350     | Modal backdrop scrim             |

---

## Best Practices

### ✅ DO:

1. **Apply full compositions** — Don't use `surface.level-1` without adding `border.elevation`
2. **Layer modals correctly** — Scrim + modal with overlay and level-4 ensures proper visual hierarchy
3. **Match elevation to interaction** — Interactive elements use level-2+; static content uses level-1
4. **Use accents intentionally** — Reserve high-emphasis accents for key UI moments
5. **Reference Figma file** — Figma components should already have proper token compositions; copy these as templates

### ❌ DON'T:

1. **Mix borders and shadows** — Never use both on the same element (exception: level-1 uses border only)
2. **Forget the scrim for modals** — Level-4 without overlay loses the "modal" context
3. **Use accent tokens for base surfaces** — Accents are for branded callouts, not default backgrounds
4. **Manually assign tokens** — Use Figma components that have tokens pre-configured
5. **Ignore theme variations** — Surface colours adapt per theme (light/dark); always use the token, not hardcoded colours

---

## Examples in Figma

When building components in Figma:

**Level-1 Card:**

- Frame background: `surface.level-1`
- Frame stroke: `1px` with colour `border.elevation`

**Level-2 Card:**

- Frame background: `surface.level-2`
- Frame shadow: `shadow.elevation.level-2`
- No stroke

**Level-4 Modal:**

- Parent: Scrim/backdrop frame
  - Background: `surface.overlay`
- Child: Modal frame
  - Background: `surface.level-4`
  - Shadow: `shadow.elevation.level-4`

---

## Questions?

Refer to the [Elevation System documentation](../reference-modules/02-elevation-system.md) for technical details, or reach out in [#ds-support](https://your-workspace.slack.example/ds-support).
