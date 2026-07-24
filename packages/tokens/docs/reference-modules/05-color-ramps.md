# Color Ramps & Generation Methodology

**Reference**: `packages/tokens/docs/reference-modules/`  
**Use Case**: Understanding color ramp structure, WCAG accessibility, color modifier logic  
**For Agent**: Code Agent (when modifying color ramps), Testing Agent (validating contrast)

---

## Overview

The Design System uses a **base-anchored lightness progression** approach to generating accessible color palettes. This methodology positions the brand base color at its natural lightness level within a 20-step ramp (50–1000), then progresses symmetrically on either side using modifier increments.

## Core Principle: 20-Step High-Resolution Ramps

The system has evolved from a 10-step scale to a **20-step high-resolution scale** (50, 100, 150... 1000). This provides designers and developers with the granularity needed for:

- Subtle UI states (hover, focus, disabled)
- Complex elevations and layering
- Precise accessibility mapping

## Lightness Targets & Guardrails

To ensure consistency across all ramps, the system adheres to specific lightness targets at the extremes:

| Mode           | Step 50 Target         | Step 1000 Target          | Color Space |
| :------------- | :--------------------- | :------------------------ | :---------- |
| **Light Mode** | 97% – 99% (Near White) | 8% – 10% (Near Black)     | HSL         |
| **Dark Mode**  | ~1% (Deep Black)       | 80% – 83% (High Contrast) | P3          |

## Base-Anchored Positioning

Instead of treating all ramp steps equally, the system **anchors the base brand color at its natural lightness position**, then builds the ramp around it.

### Light Mode Positioning

- **Base at Step 700**: For colors with mid-range inherent lightness (e.g., Business, Money, Comment)
- **Base at Step 800**: For colors with lower inherent lightness (e.g., UK, World, Sport, Travel)

### Dark Mode Positioning

- **Base at Step 500**: Standardised for most brand colours. This allows for:
  - Deep 90% darken at step 50 to reach ~1% lightness
  - Significant 50% lighten at step 1000 to reach 80%+ lightness

## Progression Smoothing & Modifier Ladders

A critical learning from system expansion is the avoidance of "modifier jumps." Large gaps in modifier values (e.g., 300 points) create jarring visual steps.

### Standard Light Mode Ladder (Base 700)

Progression from step 50 to 1000:

```
50 → 100 → 150 → 200 → 250 → 300 → 350 → 400 → 450 → 550 → 650 → 700 → 750 → 800 → 850 → 900 → 950 → 1000
```

**Characteristics:**

- Smooth transitions without jumps
- Base at step 700
- Lighter steps: 50-650 (13 steps)
- Darker steps: 700-1000 (6 steps)

### Standard Dark Mode Ladder (Base 500)

Progression from step 50 to 1000:

```
50 → 100 → 150 → 200 → 250 → 300 → 350 → 400 → 450 → 500 → 550 → 600 → 650 → 700 → 750 → 800 → 850 → 900 → 950 → 1000
```

**Characteristics:**

- Balanced progression
- Base at step 500
- Darker steps: 50-500 (10 steps)
- Lighter steps: 500-1000 (10 steps)

## Implementation via Token Studio

The system uses Tokens Studio's `$extensions.studio.tokens.modify` feature to apply HSL/P3 modifiers.

**Critical Rules:**

1. **Single Foundation Reference**: Every step in a ramp MUST reference the same foundation token (e.g., `{foundation.brand.digital.blue}`)
2. **No Cross-Referencing**: Ramps should not reference other ramps' foundation colors (e.g., don't use Cream as a base for Info)
3. **Color Space Consistency**: Always use `hsl` for Light Mode and `p3` for Dark Mode to ensure predictable results across different display technologies

## Neutral Ramp Strategy

The Neutral ramp follows a unique "Inverse Relationship" between modes:

- **Light Mode**: Step 100 is White, Step 1000 is Black
- **Dark Mode**: Step 100 is Black, Step 1000 is White
- This ensures that `neutral.100` always represents the "canvas" color and `neutral.1000` represents the "highest contrast" color, regardless of the active theme

## Token Modification Example

```json
{
  "500": {
    "value": "{foundation.brand.digital.blue}",
    "type": "color",
    "description": "Core colour ramp at scale 500 (BASE)"
  },
  "1000": {
    "value": "{foundation.brand.digital.blue}",
    "type": "color",
    "$extensions": {
      "studio.tokens": {
        "modify": {
          "type": "lighten",
          "value": "{colour.modifier.500}",
          "space": "p3"
        }
      }
    },
    "description": "Lightest step (80%+ lightness in dark mode)"
  }
}
```

## Current Color Ramps

- **Neutral** (core.neutral): 20 steps, inverse mode relationship
- **Digital Blue** (digital.blue): 20 steps, custom lightness distribution
- **Messaging Colours**: Error, Success, Warning, Info - full 20-step ramps

## WCAG Contrast Reference

**Relative Luminance Calculation:**

```
L = 0.2126 * R + 0.7152 * G + 0.0722 * B
(where R, G, B are linearized RGB values)
```

**Contrast Ratio:**

```
contrast_ratio = (L1 + 0.05) / (L2 + 0.05)
(where L1 is lighter, L2 is darker)
```

**WCAG Levels:**

- **AA (Normal text)**: ≥ 4.5:1 contrast ratio
- **AA (Large text)**: ≥ 3:1 contrast ratio
- **AAA (Normal text)**: ≥ 7:1 contrast ratio
- **AAA (Large text)**: ≥ 4.5:1 contrast ratio

## Related Documentation

- **Semantic Colour**: See `semantic-colour.md` for semantic-to-ramp mappings
- **Elevation System**: Uses color ramps for surface fills
- **Dark Mode Strategy**: See "Inverted Neutral Ramp" in Elevation System docs
