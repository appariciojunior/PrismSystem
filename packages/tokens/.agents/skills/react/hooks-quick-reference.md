---
name: hooks-quick-reference
description: Quick decision matrix for built-in React hooks used in design system components.
license: MIT
metadata:
  category: react
  agents: [Architect, Code, Testing]
  autonomy: autonomous
  portable: true
---

# React Hooks Quick Reference

## Purpose

Provide a compact decision matrix for built-in hooks.

Use `hooks-reference.md` for deeper custom-hook architecture and edge-case patterns.

## Hook Selection Matrix

| Hook               | Use For                               | Avoid For                               |
| ------------------ | ------------------------------------- | --------------------------------------- |
| `useState`         | local interactive UI state            | derived values from props/state         |
| `useReducer`       | multi-action state transitions        | simple toggles/counters                 |
| `useRef`           | DOM refs, mutable non-UI values       | values that must trigger render         |
| `useEffect`        | external sync/subscriptions           | pure data transformation                |
| `useMemo`          | expensive compute or stable objects   | trivial calculations                    |
| `useCallback`      | stable callback for memoized children | non-memoized local callbacks            |
| `useContext`       | shared tree-level values              | high-frequency global write-heavy state |
| `useId`            | stable accessibility ids              | list keys                               |
| `useTransition`    | non-blocking UI updates               | critical immediate updates              |
| `useDeferredValue` | defer expensive derived rendering     | simple scalar values                    |

## Guardrails

1. Prefer readability over premature optimization.
2. Add memoization only when profiling shows value.
3. Keep effect dependencies complete and explicit.
4. Model async cancellation in effects.

## Related Skills

- `./hooks-reference.md`
- `./state-management.md`
- `./component-patterns.md`
