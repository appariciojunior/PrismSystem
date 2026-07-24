---
name: figma-make-workflow
description: End-to-end workflow for building bespoke React components from Figma designs for Figma Make integration. No templates - all components are built from scratch using Figma MCP extraction.
license: MIT
metadata:
  category: figma-integration
  agents: [Architect, Code, Testing]
  autonomy: autonomous
  portable: true
---

# Figma Make Component Workflow

## Purpose

Build bespoke React components from Figma designs. Every component is unique and built from scratch using:

1. **Figma MCP** - Extract exact design specifications
2. **tokens.json** - Map to design system tokens
3. **React patterns** - Implement with proper patterns

## Critical Rules

- **NO TEMPLATES** - Every component is built from the specific Figma design
- **FIGMA MCP FIRST** - Always start by extracting design from Figma
- **tokens.json IS SOURCE OF TRUTH** - Verify all tokens exist before using

## Reference

- [How to get your design system into Figma Make](https://finchy.medium.com/how-to-get-your-design-system-into-figma-make-3ac735205e7f)

---

## Overview: The Figma Make Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                        FIGMA DESIGN                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Colors    │  │  Typography │  │      Component Specs    │ │
│  │  Spacing    │  │   Shadows   │  │   Variants & States     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FIGMA MCP EXTRACTION                        │
│  Query component → Extract ALL visual specs → Document fully    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 TOKEN DISCOVERY (tokens.json)                   │
│  Search semantic tokens → Verify light/dark modes → Map values  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 BESPOKE REACT COMPONENT                         │
│  Structure from Figma → Props from variants → Styles from tokens│
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FIGMA MAKE OUTPUT                           │
│  Component library → Storybook → globals.css → Figma Make AI    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Design Extraction via Figma MCP

### Query Component from Figma

```markdown
**Thought [PLAN]**: I need to build [ComponentName] - must extract ALL specs from Figma first
**Action**: Query Figma MCP for "[ComponentName]" in design library
**Observation**: Document EVERYTHING returned - variants, sizes, states, structure, colors, spacing
```

### Required Extractions

For EVERY component, extract and document:

```yaml
# Component: [Name from Figma]
# Figma File: [Reference]
# Date Extracted: [Date]

## Structure
element: [What HTML element / wrapper?]
children:
  - [List all child elements in order]
  - [Note which are required vs optional]

## Variants
[List all variants from Figma]:
  [variant-name]:
    fill: '[exact hex from Figma]'
    text: '[exact hex]'
    border: "[exact value or 'none']"
    # ... all visual properties

## Sizes
[List all sizes from Figma]:
  [size-name]:
    padding: '[exact values]'
    fontSize: '[exact value]'
    height: '[if specified]'
    # ... all dimension properties

## States
[List all states: default, hover, focus, active, disabled, loading, etc.]:
  [state-name]:
    # All properties that change in this state

## Fixed Properties
borderRadius: '[value]'
shadow: "[value or 'none']"
# Any properties that don't change across variants/states
```

**CRITICAL**: If information is missing from Figma MCP response, query again with more specific parameters. Never assume or use defaults.

---

## Step 2: Token Discovery

### Before Mapping - Verify Token Structure

```bash
# Discover what semantic categories exist in THIS design system
jq 'keys' packages/tokens/src/tokens.json

# Find the semantic layer keys (usually "light/ core", "dark/ core" or similar)
jq '.["light/ core"] | keys' packages/tokens/src/tokens.json
```

### Create Mapping Table (Per Component)

For EACH extracted value, find the matching token:

```markdown
| Figma Value | Purpose | Token Search | Found Token  | Verified both modes |
| ----------- | ------- | ------------ | ------------ | ------------------- |
| [hex color] | [usage] | grep/jq cmd  | [token path] | ✓/✗                 |
```

### Verification Commands

```bash
# Search for a color value
grep -n "[hex-value]" packages/tokens/src/tokens.json

# Verify token exists in light mode
jq '.["light/ core"].[category].[token-path]' packages/tokens/src/tokens.json

# Verify token exists in dark mode
jq '.["dark/ core"].[category].[token-path]' packages/tokens/src/tokens.json
```

---

## Step 3: Define Component API (From Figma)

The props interface is **derived from Figma**, not invented:

```typescript
// [ComponentName].types.ts
// Props derived from Figma extraction on [date]

// Variant names come directly from Figma variants
export type [ComponentName]Variant = '[variant1]' | '[variant2]' | '[variant3]';

// Size names come directly from Figma sizes
export type [ComponentName]Size = '[size1]' | '[size2]' | '[size3]';

export interface [ComponentName]Props {
  /** Visual style - from Figma variants */
  variant?: [ComponentName]Variant;

  /** Size preset - from Figma size variants */
  size?: [ComponentName]Size;

  // Add props for each Figma feature:
  // - If Figma shows icons: iconLeft?, iconRight?
  // - If Figma shows loading state: isLoading?
  // - If Figma shows full-width option: fullWidth?

  // Standard React props
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}
```

---

## Step 4: Implement with Tokens

### Style Implementation

```typescript
// [ComponentName].styles.ts or .module.css

// Map tokens discovered in Step 2
// Each CSS property uses a token, NEVER a raw value

.component {
  /* From mapping table */
  background-color: var(--[token-discovered-for-fill]);
  color: var(--[token-discovered-for-text]);
  padding: var(--[spacing-token]) var(--[spacing-token]);
  border-radius: var(--[radius-token]);
}

/* States from Figma - each with mapped tokens */
.component:hover {
  background-color: var(--[hover-fill-token]);
}

.component:focus {
  outline: 2px solid var(--[focus-token]);
}
```

### Component Implementation

```typescript
// [ComponentName].tsx
import type { [ComponentName]Props } from './[ComponentName].types';
import styles from './[ComponentName].module.css';
import clsx from 'clsx';

export const [ComponentName] = ({
  variant = '[default-from-figma]',
  size = '[default-from-figma]',
  children,
  className,
  disabled,
  ...props
}: [ComponentName]Props) => {
  return (
    <[element-from-figma]
      className={clsx(
        styles.root,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {/* Children structure from Figma extraction */}
      {children}
    </[element-from-figma]>
  );
};
```

---

## Step 5: Documentation & Stories

### Storybook Stories (Match Figma)

```typescript
// [ComponentName].stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { [ComponentName] } from './[ComponentName]';

const meta: Meta<typeof [ComponentName]> = {
  title: 'Components/[ComponentName]',
  component: [ComponentName],
  // Document that this matches Figma design
  parameters: {
    design: {
      type: 'figma',
      url: '[Figma file URL]',
    },
  },
};

export default meta;
type Story = StoryObj<typeof [ComponentName]>;

// Create a story for EACH variant shown in Figma
export const [Variant1]: Story = {
  args: {
    variant: '[variant1]',
    children: '[Label from Figma]',
  },
};

export const [Variant2]: Story = {
  args: {
    variant: '[variant2]',
    children: '[Label from Figma]',
  },
};

// Create stories for all sizes
// Create stories for all states
```

---

## Validation Checklist

Before marking component complete:

- [ ] **Figma Extraction Complete** - All variants, sizes, states documented
- [ ] **Token Mapping Complete** - Every value mapped to a verified token
- [ ] **Light/Dark Mode** - All tokens verified in both modes
- [ ] **Props Match Figma** - No invented props, all from design
- [ ] **Stories Match Figma** - Story for each variant/size/state
- [ ] **No Hardcoded Values** - Zero raw colors, sizes, spacing in code
- [ ] **Accessibility** - Keyboard, ARIA labels, focus states

---

## Step 6: Export for Figma Make

### Add to globals.css

```css
/* globals.css - Add component-specific tokens if needed */

:root {
  /* Component specific custom properties (if not in main tokens) */
  --button-border-radius: var(--border-radius-base);
  --button-font-weight: var(--font-weight-semibold);
  --button-transition: background-color 0.15s ease, border-color 0.15s ease;
}
```

### Add to globals-bridged.css

```css
/* globals-bridged.css - Map generic names to semantic tokens */

:root {
  /* Generic button variables for Figma Make AI */
  --button-primary-bg: var(--interactive-primary-fill-default);
  --button-primary-text: var(--interactive-primary-text-default);
  --button-primary-bg-hover: var(--interactive-primary-fill-hover);

  --button-secondary-bg: transparent;
  --button-secondary-text: var(--text-primary);
  --button-secondary-border: var(--border-primary);
}
```

---

## Step 7: Documentation for Figma Make

Add to HOW_TO_USE.md:

```markdown
### [ComponentName] Component

**Semantic prompts for Figma Make:**

Create a [component type] with:

- [Property]: [semantic token name]
- [Property]: [semantic token name]
- [Property]: [semantic token name]

**Variants:**

- `[variant1]` - [Description]
- `[variant2]` - [Description]

**Sizes:**

- `[size1]` - [Description and dimensions]
- `[size2]` - [Description and dimensions]
```

---

## Completion Checklist

- [ ] Figma specs extracted and documented
- [ ] All colors mapped to design tokens
- [ ] All spacing mapped to design tokens
- [ ] Typography using token references
- [ ] Props interface complete with JSDoc
- [ ] Component accessible (keyboard, ARIA)
- [ ] All variants implemented
- [ ] All states implemented (hover, focus, active, disabled)
- [ ] Storybook stories for all variants
- [ ] Tests passing (unit, accessibility)
- [ ] globals.css updated (if needed)
- [ ] globals-bridged.css updated (if needed)
- [ ] HOW_TO_USE.md updated
- [ ] Dark mode verified
