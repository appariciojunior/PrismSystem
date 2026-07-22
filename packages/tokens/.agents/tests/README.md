# Agent Visual Regression Tests

This folder is the required home for all agent-driven visual regression assets.

## Scope

Use this for any task where UI appearance must be validated, including:

- Figma MCP design implementation checks
- Visual prompt changes (typography, spacing, layout, colour, etc.)
- Reference-to-output fidelity checks

## Structure

```
packages/tokens/.agents/tests/
└── visual-regression/
    ├── baselines/      # approved baseline images
    ├── current/        # latest captures under test
    ├── diff/           # generated diff images
    └── scenarios.json  # scenario registry + thresholds
```

## Required Skill Invocation

All agents must invoke:

`INVOKE: skill/storybook/visual-regression-gate`

before final handoff when a task has visual impact.

## Threshold Profiles

- `strict`: zero pixel difference required
- `near-zero`: minimal anti-aliasing tolerance
- `custom`: scenario-defined tolerance with explicit reason

## Notes for Any LLM

1. Read `visual-regression/scenarios.json` and pick/update the relevant scenario.
2. Restart Storybook on `6006` before capture.
3. Save artifacts only inside this folder tree.
4. Report PASS/FAIL with `diffPixels` and `diffPercent`.
