---
name: figma-to-storybook
description: End-to-end workflow for translating Figma component designs into Storybook stories. Extracts specs from Figma, maps to design tokens, and generates stories with all variants.
license: MIT
metadata:
  category: storybook
  agents: [Architect, Code, Testing]
  autonomy: autonomous
  portable: true
---

# Figma to Storybook Pipeline

## Purpose

Convert Figma component designs into fully-documented Storybook stories. This is the primary workflow for designers who have components in Figma and want them represented in Storybook — the agent handles all code generation.

## Preconditions

- Figma design exists with the component to implement
- Figma MCP server is available (or designer provides screenshots/specs)
- Component source will be created in `packages/components-react/src/`
- Stories will be created in `stories/components/`

## Mandatory Live Preview Rule

For any work using this skill, restart the local Storybook server on port `6006` before validating changes so browser refresh always shows the latest result.

```bash
PORT_PIDS=$(lsof -ti tcp:6006); if [ -n "$PORT_PIDS" ]; then kill $PORT_PIDS; sleep 1; fi
npm run storybook -- --port 6006
```

## Inputs

| Parameter     | Type    | Required | Description                                    |
| ------------- | ------- | -------- | ---------------------------------------------- |
| figmaUrl      | string  | No       | Figma frame URL (if MCP available)             |
| componentName | string  | Yes      | Name for the component                         |
| designSpecs   | object  | No       | Manual specs if MCP unavailable                |
| includeStory  | boolean | Yes      | Whether to generate story file (default: true) |

---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FIGMA DESIGN                              │
│  Variants • States • Spacing • Typography • Colours          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            STEP 1: EXTRACT DESIGN SPECS                      │
│  Via Figma MCP or designer-provided specs                    │
│  → Dimensions, spacing, colours, typography, states          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            STEP 2: MAP TO DESIGN TOKENS                      │
│  Match Figma values → tokens.json semantic tokens            │
│  → {brand.core.ramp.neutral.XXX}, typography styles          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            STEP 3: BUILD REACT COMPONENT                     │
│  Create component with CSS custom properties                 │
│  → Uses var(--token-name) for all visual properties          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            STEP 4: GENERATE STORYBOOK STORIES                │
│  CSF3 stories for every variant + state                      │
│  → Autodocs, controls, decorators, a11y                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            STEP 5: VALIDATE IN STORYBOOK                     │
│  npm run storybook → Visual check against Figma              │
└─────────────────────────────────────────────────────────────┘
```

---

## Procedure

### Step 1: Extract Design Specifications

**Option A: Via Figma MCP** (preferred when available)

```markdown
**Thought [PLAN]**: Designer has provided a Figma URL. I'll extract component specs.
**Action**: Use Figma MCP to get component metadata, layouts, typography, and colours
**Observation**: Component has 3 variants (primary, secondary, outline), 2 sizes (default, compact)
```

**Option B: Designer describes the component** (when MCP unavailable)

Ask the designer to provide:

- **Layout**: Flexbox direction, alignment, padding, gaps
- **Typography**: Font family, weight, size, line-height
- **Colours**: Background, text, border (as hex or token names)
- **States**: Default, hover, active, disabled, focus
- **Variants**: Visual variations (e.g., primary/secondary)
- **Sizes**: Responsive behaviour or fixed sizes
- **Icons**: Any icon slots (left, right, standalone)

**Option C: Designer provides screenshot**

Use the screenshot to extract visual specifications manually:

1. Identify layout structure (horizontal/vertical, nesting)
2. Estimate spacing values and match to spacing tokens
3. Identify typography styles and match to font tokens
4. Extract colours and match to palette tokens
5. Note interactive states from any attached annotations

### Step 2: Map Figma Values to Design Tokens

```markdown
**Thought [REASON]**: I need to map extracted values to Design System tokens
**Action**: INVOKE skill/discovery/token-lookup for each visual property
**Observation**: Mapping complete
```

**Token mapping table template:**

| Figma Property | Extracted Value | Design Token                                  | CSS Variable                              |
| -------------- | --------------- | --------------------------------------------- | ----------------------------------------- |
| Background     | `#1D1D1B`       | `interactive.primary.fill.default`            | `var(--interactive-primary-fill-default)` |
| Text colour    | `#FFFFFF`       | `text.inverse`                                | `var(--text-inverse)`                     |
| Font family    | "Inter"  | `brand.heading.fluid.bold.large` (fontFamily) | —                                         |
| Font size      | 16px            | `fontSize040`                                 | `var(--font-size-040)`                    |
| Padding        | 16px 24px       | `spacing.static.400` / `spacing.static.500`   | `var(--spacing-static-400)`               |
| Border radius  | 4px             | —                                             | `4px`                                     |
| Border         | 1px solid #ccc  | `border.default`                              | `var(--border-default)`                   |

**Critical**: Always reference from `variables.css` in `.storybook/public/` — these are the resolved CSS custom properties available at runtime.

### Step 3: Build React Component

```jsx
// packages/components-react/src/ComponentName/ComponentName.jsx
import React from 'react';
import './ComponentName.css';

export const ComponentName = ({
  variant = 'primary',
  size = 'medium',
  children,
  disabled = false,
  onClick,
  ...props
}) => {
  const className = [
    'component-name',
    `component-name--${variant}`,
    `component-name--${size}`,
    disabled && 'component-name--disabled'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      onClick={!disabled ? onClick : undefined}
      {...props}
    >
      {children}
    </div>
  );
};
```

```css
/* packages/components-react/src/ComponentName/ComponentName.css */
.component-name {
  /* Use CSS custom properties from design tokens */
  font-family: var(--font-family-brand-heading);
  padding: var(--spacing-static-400);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.component-name--primary {
  background-color: var(--interactive-primary-fill-default);
  color: var(--text-inverse);
}

.component-name--secondary {
  background-color: var(--interactive-secondary-fill-default);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}

.component-name--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

### Step 4: Generate Storybook Stories

```jsx
// stories/components/ComponentName.stories.jsx
import { fn } from 'storybook/test';
import { ComponentName } from '@ds/components-react';

export default {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Description from Figma design specs. Built from [Figma link].'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    propertyName: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Canonical Figma property value'
    },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large'],
      description: 'Component size'
    },
    disabled: { control: 'boolean' }
  },
  args: {
    onClick: fn(),
    children: 'Component Content'
  }
};

// Story for each canonical value from Figma
export const Primary = {
  args: { propertyName: 'primary' },
  parameters: {
    docs: {
      description: { story: 'Primary value from the canonical Figma property.' }
    }
  }
};

export const Secondary = {
  args: { propertyName: 'secondary' }
};

export const Disabled = {
  args: { propertyName: 'primary', disabled: true }
};

// Responsive story
export const Mobile = {
  args: { propertyName: 'primary' },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    layout: 'fullscreen'
  }
};
```

### Step 5: Validate

```bash
# 1. Run Storybook
npm run storybook

# 2. Visual comparison checklist:
#    - Does it match the Figma design?
#    - Do all variants render correctly?
#    - Does dark mode work? (if applicable)
#    - Are interactive states visible?
#    - Does the Controls panel work?
```

---

## Figma-to-Token Quick Reference

Common Figma property mappings for this design system:

| Figma Property | Search Pattern                          | Example Token                          |
| -------------- | --------------------------------------- | -------------------------------------- |
| Fill colour    | `interactive.*.fill.*`                  | `interactive.primary.fill.default`     |
| Text colour    | `text.*`                                | `text.primary`, `text.inverse`         |
| Background     | `surface.*`                             | `surface.primary`, `surface.secondary` |
| Border         | `border.*`                              | `border.default`, `border.emphasis`    |
| Font family    | Check typography styles                 | `brand.heading.fluid.bold.large`       |
| Shadow         | `shadow.elevation.*`                    | `shadow.elevation.down.level-2`        |
| Spacing        | `spacing.static.*` or `spacing.fluid.*` | `spacing.static.400`                   |
| Border radius  | Not tokenised yet                       | Use px values                          |

---

## Error Handling

| Problem                       | Recovery                                                                    |
| ----------------------------- | --------------------------------------------------------------------------- |
| Figma MCP not available       | Ask designer for specs manually                                             |
| Token not found for value     | Use `hex_reverse_lookup` MCP tool to find nearest token match               |
| Component renders differently | Compare CSS variables in devtools vs Figma values                           |
| Dark mode broken              | Check dark mode ramp reversal (neutral.50 = black in dark)                  |
| Fonts not loading             | Verify font is in `.storybook/public/static/fonts/` and `preview-head.html` |

## Related Skills

- [figma-integration/design-extraction](../figma-integration/design-extraction.md) — Figma MCP extraction
- [figma-integration/token-mapping](../figma-integration/token-mapping.md) — Token mapping
- [storybook/story-writing](./story-writing.md) — CSF3 story patterns
- [storybook/component-documentation](./component-documentation.md) — Documentation

## References

- [Figma to Code Implementation](https://github.com/figma/mcp-server-guide)
- [Storybook Writing Stories](https://storybook.js.org/docs/writing-stories)
- Design System `variables.css`: `.storybook/public/variables.css`
