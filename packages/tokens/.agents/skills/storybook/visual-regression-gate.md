---
name: visual-regression-gate
description: Mandatory post-task visual regression gate for Figma builds and visually-impacting changes using Playwright, pixel diffing, and MCP screenshot checks.
license: MIT
metadata:
  category: storybook
  agents: [Architect, Code, Testing]
  autonomy: autonomous
  portable: true
---

# Visual Regression Gate

## Purpose

Run a mandatory visual regression check after any visually-impacting task so implemented UI mirrors design output as closely as possible.

## Trigger Conditions (Mandatory)

Invoke this skill before final handoff when any of the following are true:

1. Design sent from Figma via MCP is implemented.
2. A visual prompt is executed (font size, spacing, alignment, colour, radius, shadow, layout, typography, etc.).
3. Agent builds from a visual reference and must validate output fidelity.

Invocation convention:

```
INVOKE: skill/storybook/visual-regression-gate
INPUTS: {
  scenarioId: string,
  triggerType: "figma-build" | "visual-prompt" | "reference-build",
  thresholdProfile: "strict" | "near-zero" | "custom",
  thresholdPixels?: number,
  thresholdPercent?: number
}
```

## Preconditions

- Storybook stories/pages under test are accessible.
- Baseline scenario metadata exists in `packages/tokens/.agents/tests/visual-regression/scenarios.json`.
- Local Storybook restart on port `6006` is performed before capture.

## Mandatory Storybook Restart

```bash
PORT_PIDS=$(lsof -ti tcp:6006); if [ -n "$PORT_PIDS" ]; then kill $PORT_PIDS; sleep 1; fi
npm run storybook -- --port 6006
```

## Test Asset Location (Required)

All visual regression assets must live under:

- `packages/tokens/.agents/tests/visual-regression/baselines/`
- `packages/tokens/.agents/tests/visual-regression/current/`
- `packages/tokens/.agents/tests/visual-regression/diff/`
- `packages/tokens/.agents/tests/visual-regression/scenarios.json`

## Procedure

1. Load scenario from `scenarios.json` by `scenarioId`.
2. Capture current screenshot(s) using Playwright and/or MCP browser screenshot.
3. Compare with baseline using pixel-level diff.
4. Apply threshold profile:
   - `strict`: `0` differing pixels (pixel-perfect).
   - `near-zero`: tiny anti-aliasing tolerance only (example default: `<= 0.1%`).
   - `custom`: use provided `thresholdPixels` and/or `thresholdPercent`.
5. Save artifacts (current and diff images) under test path.
6. Return PASS/FAIL + measured diff metrics.

## Threshold Guidance

- Use `strict` for critical UI where exact match is required.
- Use `near-zero` for cross-machine/browser anti-aliasing drift.
- Use `custom` only with an explicit reason captured in scenario notes.

## Outputs

| Output            | Type   | Description                                                      |
| ----------------- | ------ | ---------------------------------------------------------------- |
| `status`          | string | `pass` or `fail`                                                 |
| `scenarioId`      | string | Scenario identifier from `scenarios.json`                        |
| `diffPixels`      | number | Total differing pixels                                           |
| `diffPercent`     | number | Difference ratio in percentage                                   |
| `thresholdResult` | string | Threshold profile and effective limits used                      |
| `artifactPaths`   | object | Paths for baseline/current/diff images in `.agents/tests` folder |

## Error Handling

| Problem                           | Recovery                                                                   |
| --------------------------------- | -------------------------------------------------------------------------- |
| Storybook not reachable on `6006` | Restart using mandatory command and retry capture                          |
| Baseline missing                  | Create baseline intentionally, document reason in scenario notes           |
| Dynamic content causes false diff | Add masking/stabilization for dynamic region and rerun                     |
| Animation-related drift           | Freeze animations/transitions during capture                               |
| Environment font/render drift     | Use same viewport/device profile and prefer `near-zero` or explicit custom |

## Example

```yaml
result:
  scenarioId: button-docs-spacing
  triggerType: visual-prompt
  thresholdProfile: strict
  status: pass
  diffPixels: 0
  diffPercent: 0.0
```
