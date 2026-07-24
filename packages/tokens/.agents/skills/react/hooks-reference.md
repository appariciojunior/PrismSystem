---
name: hooks-reference
description: Architectural patterns for custom hooks and safe hook composition in design system components.
license: MIT
metadata:
  category: react
  agents: [Architect, Code, Testing]
  autonomy: autonomous
  portable: true
---

# React Hooks Reference

## Purpose

Define custom-hook architecture patterns used in this design system.

For built-in hook lookup, use `./hooks-quick-reference.md`.

## Custom Hook Design Rules

1. Hooks expose behavior, not presentation.
2. Keep external API small and explicit.
3. Return stable shapes to avoid caller churn.
4. Separate state logic from side effects when possible.

## Recommended Hook API Shape

```ts
interface UseExampleResult {
  value: string;
  setValue: (next: string) => void;
  reset: () => void;
}
```

Rules:

- Return named fields over positional tuples for non-trivial hooks.
- Expose callbacks with predictable naming.
- Do not leak implementation internals.

## Effect Safety in Hooks

- Model cancellation for async workflows.
- Guard against stale closures.
- Ensure dependency arrays are complete.

## Composition Patterns

- Compose domain hooks from smaller hooks.
- Keep IO boundaries explicit (events/network/storage).
- Move reusable reducer logic into helper modules when state transitions grow.

## Testing Expectations

1. Test observable outcomes, not internals.
2. Verify edge states (loading, empty, error, success).
3. Assert cleanup for subscriptions/timers.

## Anti-Patterns

- Hook that both fetches data and renders JSX.
- Hook API that returns unstable object identity every render without need.
- Effect-driven derived state that can be computed during render.

## Related Skills

- `./hooks-quick-reference.md`
- `./state-management.md`
- `./testing.md`
