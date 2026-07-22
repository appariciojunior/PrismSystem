---
name: token-showcase
description: Build compact Storybook token showcase stories for color, type, spacing, and shadow tokens.
license: MIT
metadata:
  category: storybook
  agents: [Architect, Code, Testing]
  autonomy: autonomous
  portable: true
---

# Token Showcase in Storybook

## Purpose

Create lightweight, browsable token showcase stories without duplicating large component scaffolds.

## Preconditions

- Token outputs generated (`npm run build:output`)
- Storybook running on port 6006 for validation
- CSS variables available in Storybook preview

## Reusable Showcase Pattern

Use one generic row component and pass category data arrays.

```jsx
const TokenRow = ({ name, cssVar, description }) => (
  <div
    style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '12px' }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 6,
        background: `var(${cssVar})`
      }}
    />
    <div>
      <div>{name}</div>
      <code>{cssVar}</code>
      {description ? <div>{description}</div> : null}
    </div>
  </div>
);
```

## Category Recipe

For each category, provide:

1. Title
2. Token data array (`name`, `cssVar`, `description`)
3. Optional notes (for ramps or mode behavior)

## Recommended Story Set

- Semantic colors
- Core neutral ramp
- Typography scale
- Spacing scale
- Shadows

## Validation

1. Story renders with no missing CSS vars.
2. Light and dark mode swaps reflect expected token behavior.
3. Category pages remain under reasonable visual density.

## Anti-Patterns

- Re-creating near-identical swatch components per category
- Inlining large repetitive arrays in every story export
- Duplicating the same explanation text on each section

## Related Skills

- `./storybook-config.md`
- `./visual-testing.md`
- `../color-ramps/dark-mode-mapping.md`
