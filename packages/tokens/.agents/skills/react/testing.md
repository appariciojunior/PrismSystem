---
name: testing
description: React component testing guidance focused on behavior-level unit and integration tests with Testing Library.
license: MIT
metadata:
  category: react
  agents: [Architect, Code, Testing]
  autonomy: autonomous
  portable: true
---

# Testing React Components

## Purpose

Define component-level testing strategy using React Testing Library.

Storybook interaction/a11y/visual workflows are documented in `../storybook/visual-testing.md`.

## Test Strategy

1. Test user-observable behavior.
2. Prefer accessible queries.
3. Prioritize integration over isolated implementation checks.
4. Avoid asserting internal state or private methods.

## Query Priority

1. `getByRole`
2. `getByLabelText`
3. `getByText`
4. `getByPlaceholderText`
5. `getByTestId` only when necessary

## Core Test Types

- Render and semantics
- User interaction
- Prop/state variation
- Composition behavior across parent + child components

## Minimal Setup

- `@testing-library/react`
- `@testing-library/user-event`
- `@testing-library/jest-dom`
- test setup file for cleanup and browser API mocks as needed

## Required Assertions

- Correct role/name exposed
- Disabled/loading/error states behave correctly
- Keyboard interaction paths where applicable
- Callback contracts (`onClick`, `onChange`, etc.)

## Anti-Patterns

- Snapshot-only strategy without behavior assertions
- Overusing `getByTestId`
- Timing-dependent flaky assertions without async waits

## Related Skills

- `../storybook/visual-testing.md`
- `./accessibility.md`
- `./component-patterns.md`
