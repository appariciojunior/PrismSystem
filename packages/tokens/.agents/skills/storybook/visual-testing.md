---
name: visual-testing
description: Storybook-specific testing workflow for interaction tests, a11y addon checks, and visual regression gating.
license: MIT
metadata:
  category: storybook
  agents: [Architect, Code, Testing]
  autonomy: autonomous
  portable: true
---

# Storybook Visual Testing

## Purpose

Define Storybook test workflow for:

- play-function interactions
- addon-a11y checks
- visual regression verification

Component unit/integration strategy is in `../react/testing.md`.

## Preconditions

- Storybook 8+ configured
- `@storybook/addon-a11y` enabled
- Story files use CSF3

## Workflow

1. Run Storybook locally and validate stories load.
2. Add play functions for key interaction paths.
3. Run Storybook tests.
4. Run visual regression gate before completion.

## Play Function Baseline

Each critical story should verify:

1. primary element renders
2. user interaction executes
3. expected post-interaction state appears

## Accessibility Scope

Use addon-a11y for story-level violations.

For deep WCAG component requirements and design-system accessibility rules, use `../react/accessibility.md`.

## Visual Regression Scope

- Use existing visual regression workflow/tooling
- Treat unexpected diffs as blockers until triaged

## Anti-Patterns

- Mixing React unit-test guidance into this skill
- Relying on a11y panel only without assertions for critical flows
- Skipping regression gate for visually impactful changes

## Related Skills

- `./visual-regression-gate.md`
- `../react/testing.md`
- `../react/accessibility.md`
