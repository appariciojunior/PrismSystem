# Typography System

**Reference**: `packages/tokens/docs/reference-modules/`  
**Use Case**: Font sizing strategy, responsive typography, text token selection  
**For Agent**: Code Agent, Testing Agent (validating typography tokens)

---

## Overview

The Design System implements a **responsive typography architecture** where font sizes scale intelligently across viewport breakpoints. The system separates **responsive tokens** (scale with viewport) from **non-responsive tokens** (remain constant), providing precise control over typographic hierarchy at every screen size.

**Key Principles:**

1. **Selective responsiveness** - Only designated tokens scale; most remain constant for UI predictability
2. **Explicit values** - No formulas in viewport collections; each token has its calculated rem value
3. **Foundation references** - Base layer uses formulas for single source of truth; viewports flatten to explicit values
4. **Accessibility first** - All font sizes use rem units to respect user font-size preferences

## Architecture

### Foundation Layer

Foundation tokens use formulas to define relationships and maintain a single source of truth:

```json
"fontSize030": {
  "value": "1rem",
  "type": "fontSizes"
},
"fontSize100": {
  "value": "{fontSize030}*2.25",
  "type": "fontSizes"
}
```

**Role**: Reference layer for token resolution. Not exported to Figma. Source of truth for non-responsive values.

### Viewport Collections

Viewport collections contain explicit rem values for all fontSize tokens. Non-responsive tokens have identical values across all viewports; responsive tokens have viewport-specific values.

**Structure:**

```
Viewport/ Small    (0–767px)
Viewport/ Medium   (768–1023px)
Viewport/ Large    (1024–1439px)
Viewport/ XLarge   (1440px+)
```

## Responsive Tokens (5 tokens)

These tokens scale non-linearly across viewports to optimize typographic hierarchy for different screen sizes:

| Token         | Small (Mobile)  | Medium (Tablet) | Large (Laptop)  | XLarge (Desktop) | Use Case                         |
| :------------ | :-------------- | :-------------- | :-------------- | :--------------- | :------------------------------- |
| `fontSize090` | 2rem (32px)     | 2rem (32px)     | 2rem (32px)     | 2.25rem (36px)   | Subheadings, secondary headlines |
| `fontSize095` | 2.125rem (34px) | 2.125rem (34px) | 2.125rem (34px) | 2.375rem (38px)  | Mid-weight display text          |
| `fontSize100` | 2.25rem (36px)  | 2.5rem (40px)   | 2.875rem (46px) | 3.5rem (56px)    | Primary headlines, hero text     |
| `fontSize110` | 2rem (32px)     | 2rem (32px)     | 2rem (32px)     | 2.5rem (40px)    | Featured content, callouts       |
| `fontSize140` | 2.5rem (40px)   | 2.5rem (40px)   | 2.5rem (40px)   | 3.5rem (56px)    | Extra-large display, editorial   |

**Characteristics:**

- Scale between Small and XLarge viewports only (Medium/Large often match Small)
- Include viewport-specific descriptions (e.g., "36px at Small viewport")
- Used for editorial content, marketing pages, article headlines
- Provide visual impact on larger screens while remaining readable on mobile

## Non-Responsive Tokens (20 tokens)

These tokens maintain identical values across all viewports for UI consistency:

| Token          | All Viewports | Pixel Value | Use Case                      |
| :------------- | :------------ | :---------- | :---------------------------- |
| `fontSize0025` | 0.5rem        | 8px         | Micro text, legal disclaimers |
| `fontSize005`  | 0.625rem      | 10px        | Captions, metadata            |
| `fontSize010`  | 0.75rem       | 12px        | Small labels, annotations     |
| `fontSize020`  | 0.875rem      | 14px        | Secondary text                |
| `fontSize025`  | 0.9375rem     | 15px        | Supporting text               |
| `fontSize030`  | 1rem          | 16px        | Body text, base size          |
| `fontSize035`  | 1.0625rem     | 17px        | Emphasized body text          |
| `fontSize040`  | 1.125rem      | 18px        | Large body text               |
| `fontSize045`  | 1.1875rem     | 19px        | Subheadings                   |
| `fontSize050`  | 1.25rem       | 20px        | Section headers               |
| `fontSize060`  | 1.375rem      | 22px        | Card titles                   |
| `fontSize070`  | 1.5rem        | 24px        | Page titles                   |
| `fontSize080`  | 1.75rem       | 28px        | Feature headers               |
| `fontSize085`  | 1.875rem      | 30px        | Display text                  |
| `fontSize105`  | 2.875rem      | 46px        | Large display                 |
| `fontSize120`  | 2.75rem       | 44px        | Special display               |
| `fontSize125`  | 2.8125rem     | 45px        | Custom sizing                 |
| `fontSize130`  | 3rem          | 48px        | Extra display                 |
| `fontSize150`  | 4rem          | 64px        | Hero display                  |
| `fontSize155`  | 4.375rem      | 70px        | Ultra display                 |
| `fontSize160`  | 5rem          | 80px        | Maximum display               |

**Characteristics:**

- Same rem value in all viewport collections
- No viewport-specific descriptions
- Used for UI chrome, navigation, buttons, labels, forms
- Ensure predictable component sizing across breakpoints

## Design Philosophy: Selective Responsiveness

The system follows **"responsive where it matters, static where it doesn't"**:

**Responsive tokens** (5 tokens):

- ✅ Editorial headlines
- ✅ Marketing hero text
- ✅ Feature callouts
- ✅ High-impact display typography

**Non-responsive tokens** (20 tokens):

- ✅ UI navigation
- ✅ Button labels
- ✅ Form fields
- ✅ Body copy
- ✅ Data tables
- ✅ Any predictable interface element

This approach balances **visual impact on large screens** with **interface predictability** across devices.

## Usage Guidelines

**When to use responsive tokens:**

- ✅ Article headlines that need impact on desktop
- ✅ Hero sections that scale with screen real estate
- ✅ Editorial content with flexible hierarchy
- ✅ Marketing pages with dramatic typography

**When to use non-responsive tokens:**

- ✅ Navigation menus (predictable hit targets)
- ✅ Button labels (consistent sizing)
- ✅ Form inputs (stable interaction areas)
- ✅ Body text (comfortable reading size)
- ✅ UI chrome (toolbars, sidebars, headers)

**Component Example:**

```tsx
// Article headline - uses responsive token
<h1 style={{ fontSize: 'var(--ds-font-size-100)' }}>
  Breaking: Major Story Headline
</h1>

// Navigation link - uses non-responsive token
<a style={{ fontSize: 'var(--ds-font-size-030)' }}>
  Home
</a>
```

## Accessibility Considerations

1. **Rem units throughout** - All font sizes use rem to respect user's browser font-size preferences
2. **Minimum legibility** - Smallest size (fontSize0025 = 8px) reserved for disclaimers, not body text
3. **Contrast validation** - All text colours validated against background at each font size
4. **Zoom support** - Layout accommodates 200% zoom without breaking (WCAG 2.1 requirement)

## Token Count Reference

- 25 fontSize tokens per viewport × 4 viewports = 100 total viewport tokens
- 5 responsive tokens with unique values per viewport
- 20 non-responsive tokens with identical values across viewports
- 25 foundation tokens with formulas for reference resolution

## Token Implementation in JSON

### Foundation (formulas for reference resolution)

```json
"Foundation": {
  "fontSize030": {
    "value": "1rem",
    "type": "fontSizes"
  },
  "fontSize100": {
    "value": "{fontSize030}*2.25",
    "type": "fontSizes"
  }
}
```

### Viewport Collections (explicit values)

```json
"Viewport/ Small": {
  "fontSize030": {
    "value": "1rem",
    "type": "fontSizes"
  },
  "fontSize100": {
    "value": "2.25rem",
    "type": "fontSizes",
    "description": "36px at Small viewport"
  }
},
"Viewport/ Medium": {
  "fontSize030": {
    "value": "1rem",
    "type": "fontSizes"
  },
  "fontSize100": {
    "value": "2.5rem",
    "type": "fontSizes",
    "description": "40px at Medium viewport"
  }
},
"Viewport/ Large": {
  "fontSize030": {
    "value": "1rem",
    "type": "fontSizes"
  },
  "fontSize100": {
    "value": "2.875rem",
    "type": "fontSizes",
    "description": "46px at Large viewport"
  }
},
"Viewport/ XLarge": {
  "fontSize030": {
    "value": "1rem",
    "type": "fontSizes"
  },
  "fontSize100": {
    "value": "3.5rem",
    "type": "fontSizes",
    "description": "56px at XLarge viewport"
  }
}
```

## Figma Export Behavior

Typography tokens export to Figma as part of the **Collection: "Viewport"** with 4 Modes.

**Viewport Figma scope rollout (Mar 2026):**

- Added `com.figma.scopes: ["FONT_SIZE"]` to 100 viewport font-size tokens across `viewport/ small`, `viewport/ medium`, `viewport/ large`, and `viewport/ xlarge`
- This improves variable picker suggestions for text size properties while keeping token values unchanged

**Mode: Small**

```
fontSize030 = 1rem (16px)
fontSize100 = 2.25rem (36px)
```

**Mode: Medium**

```
fontSize030 = 1rem (16px)        ← SAME (non-responsive)
fontSize100 = 2.5rem (40px)      ← SCALED (responsive)
```

**Mode: Large**

```
fontSize030 = 1rem (16px)        ← SAME
fontSize100 = 2.875rem (46px)    ← SCALED
```

**Mode: XLarge**

```
fontSize030 = 1rem (16px)        ← SAME
fontSize100 = 3.5rem (56px)      ← SCALED
```

**Designer Experience:**

- Switch viewport modes in Figma to see responsive tokens update
- Non-responsive tokens stay constant (providing visual stability)
- Responsive tokens change (providing dynamic hierarchy preview)

## Semantic Typography Reference

This section shows actual resolved values for semantic typography tokens across viewport breakpoints. The fontSize values shown are token references that scale with viewport multipliers (for fluid tokens) or remain static across viewports (for static tokens).

### Brand / Heading – Fluid

| Token                 | Small                | Medium               | Large                | XLarge               |
| --------------------- | -------------------- | -------------------- | -------------------- | -------------------- |
| fluid.black.2xlarge   | {fontSize100} / 125% | {fontSize100} / 125% | {fontSize100} / 125% | {fontSize100} / 125% |
| fluid.black.2xsmall   | {fontSize045} / 125% | {fontSize045} / 125% | {fontSize045} / 125% | {fontSize045} / 125% |
| fluid.black.large     | {fontSize090} / 125% | {fontSize090} / 125% | {fontSize090} / 125% | {fontSize090} / 125% |
| fluid.black.medium    | {fontSize080} / 125% | {fontSize080} / 125% | {fontSize080} / 125% | {fontSize080} / 125% |
| fluid.black.small     | {fontSize070} / 125% | {fontSize070} / 125% | {fontSize070} / 125% | {fontSize070} / 125% |
| fluid.black.xlarge    | {fontSize095} / 125% | {fontSize095} / 125% | {fontSize095} / 125% | {fontSize095} / 125% |
| fluid.black.xsmall    | {fontSize050} / 125% | {fontSize050} / 125% | {fontSize050} / 125% | {fontSize050} / 125% |
| fluid.bold.2xlarge    | {fontSize100} / 125% | {fontSize100} / 125% | {fontSize100} / 125% | {fontSize100} / 125% |
| fluid.bold.2xsmall    | {fontSize045} / 125% | {fontSize045} / 125% | {fontSize045} / 125% | {fontSize045} / 125% |
| fluid.bold.large      | {fontSize090} / 125% | {fontSize090} / 125% | {fontSize090} / 125% | {fontSize090} / 125% |
| fluid.bold.medium     | {fontSize080} / 125% | {fontSize080} / 125% | {fontSize080} / 125% | {fontSize080} / 125% |
| fluid.bold.small      | {fontSize070} / 125% | {fontSize070} / 125% | {fontSize070} / 125% | {fontSize070} / 125% |
| fluid.bold.xlarge     | {fontSize095} / 125% | {fontSize095} / 125% | {fontSize095} / 125% | {fontSize095} / 125% |
| fluid.bold.xsmall     | {fontSize050} / 125% | {fontSize050} / 125% | {fontSize050} / 125% | {fontSize050} / 125% |
| fluid.light.2xlarge   | {fontSize100} / 125% | {fontSize100} / 125% | {fontSize100} / 125% | {fontSize100} / 125% |
| fluid.light.2xsmall   | {fontSize045} / 125% | {fontSize045} / 125% | {fontSize045} / 125% | {fontSize045} / 125% |
| fluid.light.large     | {fontSize090} / 125% | {fontSize090} / 125% | {fontSize090} / 125% | {fontSize090} / 125% |
| fluid.light.medium    | {fontSize080} / 125% | {fontSize080} / 125% | {fontSize080} / 125% | {fontSize080} / 125% |
| fluid.light.small     | {fontSize070} / 125% | {fontSize070} / 125% | {fontSize070} / 125% | {fontSize070} / 125% |
| fluid.light.xlarge    | {fontSize095} / 125% | {fontSize095} / 125% | {fontSize095} / 125% | {fontSize095} / 125% |
| fluid.light.xsmall    | {fontSize050} / 125% | {fontSize050} / 125% | {fontSize050} / 125% | {fontSize050} / 125% |
| fluid.regular.2xlarge | {fontSize100} / 125% | {fontSize100} / 125% | {fontSize100} / 125% | {fontSize100} / 125% |
| fluid.regular.2xsmall | {fontSize045} / 125% | {fontSize045} / 125% | {fontSize045} / 125% | {fontSize045} / 125% |
| fluid.regular.large   | {fontSize090} / 125% | {fontSize090} / 125% | {fontSize090} / 125% | {fontSize090} / 125% |
| fluid.regular.medium  | {fontSize080} / 125% | {fontSize080} / 125% | {fontSize080} / 125% | {fontSize080} / 125% |
| fluid.regular.small   | {fontSize070} / 125% | {fontSize070} / 125% | {fontSize070} / 125% | {fontSize070} / 125% |
| fluid.regular.xlarge  | {fontSize095} / 125% | {fontSize095} / 125% | {fontSize095} / 125% | {fontSize095} / 125% |
| fluid.regular.xsmall  | {fontSize050} / 125% | {fontSize050} / 125% | {fontSize050} / 125% | {fontSize050} / 125% |

### Brand / Heading – Static

| Token              | Small     | Medium    | Large     | XLarge    |
| ------------------ | --------- | --------- | --------- | --------- |
| static.black.010   | 19 / 125% | 19 / 125% | 19 / 125% | 19 / 125% |
| static.black.020   | 20 / 125% | 20 / 125% | 20 / 125% | 20 / 125% |
| static.black.030   | 24 / 125% | 24 / 125% | 24 / 125% | 24 / 125% |
| static.black.040   | 28 / 125% | 28 / 125% | 28 / 125% | 28 / 125% |
| static.black.050   | 32 / 125% | 32 / 125% | 32 / 125% | 32 / 125% |
| static.black.060   | 36 / 125% | 36 / 125% | 36 / 125% | 36 / 125% |
| static.black.070   | 40 / 125% | 40 / 125% | 40 / 125% | 40 / 125% |
| static.black.080   | 46 / 125% | 46 / 125% | 46 / 125% | 46 / 125% |
| static.black.090   | 48 / 125% | 48 / 125% | 48 / 125% | 48 / 125% |
| static.black.100   | 56 / 125% | 56 / 125% | 56 / 125% | 56 / 125% |
| static.bold.010    | 19 / 125% | 19 / 125% | 19 / 125% | 19 / 125% |
| static.bold.020    | 20 / 125% | 20 / 125% | 20 / 125% | 20 / 125% |
| static.bold.030    | 24 / 125% | 24 / 125% | 24 / 125% | 24 / 125% |
| static.bold.040    | 28 / 125% | 28 / 125% | 28 / 125% | 28 / 125% |
| static.bold.050    | 32 / 125% | 32 / 125% | 32 / 125% | 32 / 125% |
| static.bold.060    | 36 / 125% | 36 / 125% | 36 / 125% | 36 / 125% |
| static.bold.070    | 40 / 125% | 40 / 125% | 40 / 125% | 40 / 125% |
| static.bold.080    | 46 / 125% | 46 / 125% | 46 / 125% | 46 / 125% |
| static.bold.090    | 48 / 125% | 48 / 125% | 48 / 125% | 48 / 125% |
| static.bold.100    | 56 / 125% | 56 / 125% | 56 / 125% | 56 / 125% |
| static.light.010   | 19 / 125% | 19 / 125% | 19 / 125% | 19 / 125% |
| static.light.020   | 20 / 125% | 20 / 125% | 20 / 125% | 20 / 125% |
| static.light.030   | 24 / 125% | 24 / 125% | 24 / 125% | 24 / 125% |
| static.light.040   | 28 / 125% | 28 / 125% | 28 / 125% | 28 / 125% |
| static.light.050   | 32 / 125% | 32 / 125% | 32 / 125% | 32 / 125% |
| static.light.060   | 36 / 125% | 36 / 125% | 36 / 125% | 36 / 125% |
| static.light.070   | 40 / 125% | 40 / 125% | 40 / 125% | 40 / 125% |
| static.light.080   | 46 / 125% | 46 / 125% | 46 / 125% | 46 / 125% |
| static.light.090   | 48 / 125% | 48 / 125% | 48 / 125% | 48 / 125% |
| static.light.100   | 56 / 125% | 56 / 125% | 56 / 125% | 56 / 125% |
| static.regular.010 | 19 / 125% | 19 / 125% | 19 / 125% | 19 / 125% |
| static.regular.020 | 20 / 125% | 20 / 125% | 20 / 125% | 20 / 125% |
| static.regular.030 | 24 / 125% | 24 / 125% | 24 / 125% | 24 / 125% |
| static.regular.040 | 28 / 125% | 28 / 125% | 28 / 125% | 28 / 125% |
| static.regular.050 | 32 / 125% | 32 / 125% | 32 / 125% | 32 / 125% |
| static.regular.060 | 36 / 125% | 36 / 125% | 36 / 125% | 36 / 125% |
| static.regular.070 | 40 / 125% | 40 / 125% | 40 / 125% | 40 / 125% |
| static.regular.080 | 46 / 125% | 46 / 125% | 46 / 125% | 46 / 125% |
| static.regular.090 | 48 / 125% | 48 / 125% | 48 / 125% | 48 / 125% |
| static.regular.100 | 56 / 125% | 56 / 125% | 56 / 125% | 56 / 125% |

### Brand / Subheading

| Token          | Small                | Medium               | Large                | XLarge               |
| -------------- | -------------------- | -------------------- | -------------------- | -------------------- |
| bold.large     | {fontSize050} / 125% | {fontSize050} / 125% | {fontSize050} / 125% | {fontSize050} / 125% |
| bold.medium    | {fontSize040} / 125% | {fontSize040} / 125% | {fontSize040} / 125% | {fontSize040} / 125% |
| bold.small     | {fontSize020} / 125% | {fontSize020} / 125% | {fontSize020} / 125% | {fontSize020} / 125% |
| bold.xlarge    | {fontSize070} / 125% | {fontSize070} / 125% | {fontSize070} / 125% | {fontSize070} / 125% |
| light.large    | {fontSize050} / 125% | {fontSize050} / 125% | {fontSize050} / 125% | {fontSize050} / 125% |
| light.medium   | {fontSize040} / 125% | {fontSize040} / 125% | {fontSize040} / 125% | {fontSize040} / 125% |
| light.small    | {fontSize020} / 125% | {fontSize020} / 125% | {fontSize020} / 125% | {fontSize020} / 125% |
| light.xlarge   | {fontSize070} / 125% | {fontSize070} / 125% | {fontSize070} / 125% | {fontSize070} / 125% |
| regular.large  | {fontSize050} / 125% | {fontSize050} / 125% | {fontSize050} / 125% | {fontSize050} / 125% |
| regular.medium | {fontSize040} / 125% | {fontSize040} / 125% | {fontSize040} / 125% | {fontSize040} / 125% |
| regular.small  | {fontSize020} / 125% | {fontSize020} / 125% | {fontSize020} / 125% | {fontSize020} / 125% |
| regular.xlarge | {fontSize070} / 125% | {fontSize070} / 125% | {fontSize070} / 125% | {fontSize070} / 125% |

### Utility / Heading

| Token  | Small                | Medium               | Large                | XLarge               |
| ------ | -------------------- | -------------------- | -------------------- | -------------------- |
| large  | {fontSize080} / 125% | {fontSize080} / 125% | {fontSize080} / 125% | {fontSize080} / 125% |
| medium | {fontSize070} / 125% | {fontSize070} / 125% | {fontSize070} / 125% | {fontSize070} / 125% |
| small  | {fontSize040} / 125% | {fontSize040} / 125% | {fontSize040} / 125% | {fontSize040} / 125% |

### Utility / Subheading

| Token  | Small                | Medium               | Large                | XLarge               |
| ------ | -------------------- | -------------------- | -------------------- | -------------------- |
| large  | {fontSize050} / 125% | {fontSize050} / 125% | {fontSize050} / 125% | {fontSize050} / 125% |
| medium | {fontSize030} / 125% | {fontSize030} / 125% | {fontSize030} / 125% | {fontSize030} / 125% |
| small  | {fontSize020} / 125% | {fontSize020} / 125% | {fontSize020} / 125% | {fontSize020} / 125% |
| xsmall | {fontSize010} / 125% | {fontSize010} / 125% | {fontSize010} / 125% | {fontSize010} / 125% |

### Utility / Body

All sizes use 150% line height. Regular and bold weights share the same size scale.

| Token           | All Viewports | Pixel value |
| --------------- | ------------- | ----------- |
| regular.2xsmall | {fontSize010} | 12px        |
| regular.xsmall  | {fontSize020} | 14px        |
| regular.small   | {fontSize025} | 15px        |
| regular.medium  | {fontSize030} | 16px        |
| regular.large   | {fontSize035} | 17px        |
| bold.2xsmall    | {fontSize010} | 12px        |
| bold.xsmall     | {fontSize020} | 14px        |
| bold.small      | {fontSize025} | 15px        |
| bold.medium     | {fontSize030} | 16px        |
| bold.large      | {fontSize035} | 17px        |

### Utility / Button

Used for button labels. All sizes use 100% line height.

| Token  | All Viewports | Pixel value |
| ------ | ------------- | ----------- |
| xsmall | {fontSize005} | 10px        |
| small  | {fontSize020} | 14px        |
| medium | {fontSize030} | 16px        |
| large  | {fontSize040} | 18px        |

### Utility / Label

Used for form labels, tags, and metadata. All sizes use 100% line height.

| Token  | All Viewports | Pixel value |
| ------ | ------------- | ----------- |
| xsmall | {fontSize005} | 10px        |
| small  | {fontSize010} | 12px        |
| medium | {fontSize020} | 14px        |
| large  | {fontSize030} | 16px        |

### Utility / linkInline and linkStandalone

Inline links appear within paragraph flow. Standalone links appear outside paragraph flow as navigation or CTA elements. Both come in `utility` and `brand` variants.

| Token                 | All Viewports | Pixel value |
| --------------------- | ------------- | ----------- |
| linkInline.xsmall     | {fontSize010} | 12px        |
| linkInline.small      | {fontSize020} | 14px        |
| linkInline.medium     | {fontSize030} | 16px        |
| linkInline.large      | {fontSize040} | 18px        |
| linkStandalone.xsmall | {fontSize010} | 12px        |
| linkStandalone.small  | {fontSize020} | 14px        |
| linkStandalone.medium | {fontSize030} | 16px        |
| linkStandalone.large  | {fontSize040} | 18px        |

### Brand / Display

Fixed-size decorative heading scale. Not for editorial headlines. Use `p` or `span` with no semantic heading role.

| Token           | All Viewports | Pixel value   |
| --------------- | ------------- | ------------- |
| light.010       | {fontSize155} | 70px          |
| light.020       | {fontSize250} | 94px (approx) |
| light.030–100   | escalating px | 120–300px     |
| regular.010–100 | same scale    | 68–300px      |
| bold.010–100    | same scale    | 68–300px      |
| black.010–100   | same scale    | 68–300px      |

### Brand / Standfirst

Article intro paragraph text. Non-responsive. Use `p`.

| Token  | All Viewports | Pixel value |
| ------ | ------------- | ----------- |
| large  | {fontSize060} | 22px        |
| medium | {fontSize050} | 20px        |

### Brand / Paragraph

Body paragraph text. Non-responsive. Use `p`.

| Token          | All Viewports | Pixel value |
| -------------- | ------------- | ----------- |
| regular.small  | {fontSize025} | 15px        |
| regular.medium | {fontSize030} | 16px        |
| regular.large  | {fontSize040} | 18px        |
| bold.small     | {fontSize025} | 15px        |
| bold.medium    | {fontSize030} | 16px        |
| bold.large     | {fontSize040} | 18px        |

### Brand / Caption

Image and media caption text. Non-responsive. Use `figcaption` or `span`.

| Token   | All Viewports | Pixel value |
| ------- | ------------- | ----------- |
| caption | {fontSize010} | 12px        |

### Brand / Byline

Author attribution text. Non-responsive. Use `span` or `p`.

| Token  | All Viewports | Pixel value |
| ------ | ------------- | ----------- |
| medium | {fontSize020} | 14px        |
| small  | {fontSize010} | 12px        |
