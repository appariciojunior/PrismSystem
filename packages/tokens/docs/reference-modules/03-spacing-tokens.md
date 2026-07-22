# Spacing Tokens

**Reference**: `packages/tokens/docs/reference-modules/`  
**Use Case**: Fluid vs static spacing, responsive layout decisions  
**For Agent**: Code Agent (when implementing spacing layouts)

---

## Overview

The Design System implements **fluid spacing** (scales with viewport) and **static spacing** (fixed sizes) tokens. This architecture ensures consistent, responsive layouts across all screen sizes while maintaining precise control over UI elements.

**Key Principles:**

1. **Fluid tokens scale** - `spacing.fluid.*` multiplies by viewport multiplier
2. **Static tokens don't scale** - `spacing.static.*` remain constant
3. **Mobile-first naming** - Numeric scale (050, 100, 200...) replaces old T-shirt sizes
4. **Viewport multipliers** - Small=1.0×, Medium=1.5×, Large=2.0×, XLarge=2.5×

## Architecture

### Foundation Layer

Foundation tokens define base spacing values in pixels:

```json
"spacing050": {
  "value": "4px",
  "type": "spacing"
},
"spacing100": {
  "value": "8px",
  "type": "spacing"
},
"spacing200": {
  "value": "16px",
  "type": "spacing"
}
```

### Semantic Layer: Fluid Tokens

Fluid tokens scale responsively using viewport multipliers:

```
Small (0-767px):        {spacing.fluid.050} = 4px × 1.0 = 4px
Medium (768-1023px):    {spacing.fluid.050} = 4px × 1.5 = 6px
Large (1024-1439px):    {spacing.fluid.050} = 4px × 2.0 = 8px
XLarge (1440px+):       {spacing.fluid.050} = 4px × 2.5 = 10px
```

**Use Cases:**

- Margins and padding in responsive containers
- Gaps between flex items
- Flexible spacing in cards and panels

### Semantic Layer: Static Tokens

Static tokens maintain fixed values across all viewports:

```
All Viewports:          {spacing.static.050} = 4px
```

**Use Cases:**

- Consistent button padding
- Form field spacing
- Navigation element spacing
- Any UI that needs predictable sizing

## Spacing Scale

### Fluid Tokens

| Token               | Small (1.0×) | Medium (1.5×) | Large (2.0×) | XLarge (2.5×) | Description             |
| :------------------ | :----------- | :-----------: | :----------: | :-----------: | :---------------------- |
| `spacing.fluid.050` | 2px          |      2px      |     2px      |      2px      | Minimal spacing (fixed) |
| `spacing.fluid.100` | 4px          |      6px      |     8px      |     10px      | Extra small padding     |
| `spacing.fluid.200` | 8px          |     12px      |     16px     |     20px      | Small gaps              |
| `spacing.fluid.300` | 12px         |     18px      |     24px     |     30px      | Medium rhythm           |
| `spacing.fluid.400` | 16px         |     24px      |     32px     |     40px      | Base card padding       |
| `spacing.fluid.500` | 20px         |     30px      |     40px     |     50px      | Generous white space    |
| `spacing.fluid.600` | 24px         |     36px      |     48px     |     60px      | Section breaks          |
| `spacing.fluid.700` | 28px         |     42px      |     56px     |     70px      | Wide section gaps       |

Tokens `spacing.fluid.800` through `spacing.fluid.1500` continue the same pattern (increments of 100) for the full editorial spacing scale.

### Static Tokens

| Token               | Value | Token               | Value | Token               | Value |
| :------------------ | :---- | :------------------ | :---- | :------------------ | :---- |
| `spacing.static.01` | 2px   | `spacing.static.08` | 14px  | `spacing.static.15` | 32px  |
| `spacing.static.02` | 3px   | `spacing.static.09` | 16px  | `spacing.static.16` | 36px  |
| `spacing.static.03` | 4px   | `spacing.static.10` | 18px  | `spacing.static.17` | 40px  |
| `spacing.static.04` | 6px   | `spacing.static.11` | 20px  | `spacing.static.18` | 48px  |
| `spacing.static.05` | 8px   | `spacing.static.12` | 23px  | `spacing.static.19` | 56px  |
| `spacing.static.06` | 10px  | `spacing.static.13` | 24px  | `spacing.static.20` | 64px  |
| `spacing.static.07` | 12px  | `spacing.static.14` | 28px  | `spacing.static.21` | 80px  |

## Design Philosophy: Mobile-First Design

The system follows **"scale appropriately, not slavishly"**:

**Fluid tokens** (grow with viewport):

- ✅ Margins between sections
- ✅ Gaps between grid items
- ✅ Flexible container padding
- ✅ Responsive white space

**Static tokens** (stay constant):

- ✅ Button padding
- ✅ Form field padding
- ✅ Navigation spacing
- ✅ Any predictable interface element

This approach balances **responsive layouts** with **interface consistency**.

## Implementation Notes

**CSS Output Example (Fluid Token):**

```css
:root {
  --ds-spacing-fluid-050: 4px; /* Small (0–767px) */
}

@media (min-width: 768px) {
  :root {
    --ds-spacing-fluid-050: 6px; /* Medium */
  }
}

@media (min-width: 1024px) {
  :root {
    --ds-spacing-fluid-050: 8px; /* Large */
  }
}

@media (min-width: 1440px) {
  :root {
    --ds-spacing-fluid-050: 10px; /* XLarge */
  }
}
```

**CSS Output Example (Static Token):**

```css
:root {
  --ds-spacing-static-200: 16px; /* Same across all viewports */
}
/* No media queries - constant value */
```

## Figma Export Structure

Spacing tokens export to Figma as a **Collection: "Viewport"** with 4 Modes (Small, Medium, Large, XLarge).

**Behavior in Figma:**

- **Fluid tokens** change value when switching viewport modes (responsive)
- **Static tokens** remain identical across all modes (truly static)

**Viewport Figma scope rollout (Mar 2026):**

- Added `com.figma.scopes: ["WIDTH_HEIGHT", "GAP"]` to 160 viewport spacing tokens across `viewport/ small`, `viewport/ medium`, `viewport/ large`, and `viewport/ xlarge`
- This improves variable picker suggestions for spacing tokens used in size and gap contexts

**Mode: Small (1.0x)**

```
spacing/fluid/md = 12px
spacing/static/05 = 8px
```

**Mode: Medium (1.25x)**

```
spacing/fluid/md = 15px    ← scaled
spacing/static/05 = 8px    ← IDENTICAL
```

**Mode: Large (1.5x)**

```
spacing/fluid/md = 18px    ← scaled
spacing/static/05 = 8px    ← IDENTICAL
```

**Mode: XLarge (1.75x)**

```
spacing/fluid/md = 21px    ← scaled
spacing/static/05 = 8px    ← IDENTICAL
```

## Related Documentation

- **Viewport System**: See Grid System documentation for breakpoint details
- **Typography**: See Typography System for responsive font sizing
- **Grid Gutters**: Spacing tokens used with grid gutter definitions
