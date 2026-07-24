---
name: visual-vs-built
description: Compare a Figma frame against the live Storybook story for the same component. Captures a Figma screenshot and a Storybook screenshot, computes structured differences (token usage, spacing, typography, colour, layout) and renders a diff report. Catches drift after a component has landed in code.
license: MIT
metadata:
  category: design/ui
  pillar: ui
  agents: [Design Engineer, QA, Designer]
  autonomy: requires-approval
  portable: true
  cadence: weekly
---

# Visual vs Built

## Purpose

After a component has been scaffolded and implemented, things drift. Padding edits in Storybook get out of sync with the Figma source. Tokens get refactored on one side but not the other. This skill spots the drift by comparing the Figma frame against the rendered Storybook story for the same component.

The comparison is not pixel-perfect. Pixel diffs in design systems produce false positives because anti-aliasing and font hinting vary by environment. This skill instead does a *structured* comparison: spacings, tokens used, type sizes, hit areas, and a flagged-only pixel diff as supporting evidence.

## Preconditions

1. Figma Console MCP is connected. The **Mandatory User Gate** applies for Figma URLs.
2. Storybook is running locally or a static build URL is reachable. The skill needs a URL to the specific story (e.g. `http://localhost:9001/?path=/story/components-button--default`).
3. The component being compared has at least one Storybook story matching the Figma variant under review.
4. `storybook/visual-testing.md` is satisfied as the underlying baseline; this skill builds on it.

## Inputs

Required:

* `figma_url_or_node` — the Figma component or variant.
* `storybook_url` — the live Storybook story URL.

Optional:

* `variant` — the Figma variant key (e.g. `state=hover, intent=primary`). When provided, the skill loads the matching Storybook story args.
* `tolerance_px` — pixel diff tolerance for the supporting screenshot diff. Default 3.
* `output_path` — defaults to `.design/<component>/VISUAL_VS_BUILT.md`.

## Procedure

### Step 1: Capture both sides

1. Take a Figma screenshot via `figma_take_screenshot` (deterministic, server-side rendered).
2. Capture the Storybook story via the existing visual regression tooling configured in `storybook/visual-testing.md` and `storybook/visual-regression-gate.md`. Output: a static PNG of the rendered story at the same nominal viewport as the Figma frame.

### Step 2: Extract the structured spec from both sides

**Figma side:** call `handoff/frame-to-spec.md` on the Figma node (or read its cached output from `.design/<feature>/SPEC.md` if fresh).

**Storybook side:** use the rendered DOM via a headless browser (`Playwright` or equivalent, the project has `.playwright-mcp/` available). For the story root element and every child, capture:

* Resolved CSS values: `padding`, `margin`, `gap`, `border-radius`, `border-width`, `color`, `background-color`, `font-size`, `line-height`, `font-weight`.
* The CSS custom properties referenced (e.g. `var(--ds-button-fill-primary)`).
* Hit-box dimensions for interactive elements.

### Step 3: Diff the two specs

For each captured attribute, compare. The diff records:

* **Match.** Values identical (or equivalent through token resolution).
* **Drift.** Different values, both within their respective systems. Surface as `warning` with both values and the path where it was used.
* **Token mismatch.** Figma uses token A, code uses token B. `error` severity.
* **Hard-coded value in code.** Code uses a literal where Figma uses a token. `error`. The fix is to replace with the correct CSS variable.
* **Hard-coded value in Figma.** Figma uses a raw value where the token system has one. Cross-reference `ui/token-mapping-audit.md` if not already run.

### Step 4: Pixel-level corroboration

Run a fuzzy pixel diff (the existing visual regression tool, e.g. Chromatic, Loki, Playwright's `toHaveScreenshot`) at the configured `tolerance_px`. The output is supporting evidence, not the primary signal.

If structured diffs are clean but the pixel diff shows a large area of difference, that means *something* is off that structured comparison missed (perhaps a font-rendering issue, perhaps a missing asset). Surface as `info` with the diff image attached.

### Step 5: Render the report

Use the **Output Contract** below.

## Output Contract

```markdown
# Visual vs Built — <Component Name> (<variant>)

> Figma: <deep link>
> Storybook: <story URL>
> Compared: <ISO timestamp>
> Tolerance px: <n>
> Result: <pass | pass-with-drift | fail>

## Summary

| Metric | Value |
|---|---|
| Attributes compared | <n> |
| Matches | <n> |
| Drift (warning) | <n> |
| Token mismatches (error) | <n> |
| Hard-coded in code (error) | <n> |
| Hard-coded in Figma (warning) | <n> |
| Pixel diff area | <n>% |

## Structured findings

| Severity | Element | Attribute | Figma value | Storybook value | Suggested fix |
|---|---|---|---|---|---|
| error | `.ds-button` | background-color | `var(--ds-interactive-primary-fill)` | `#005C8A` (hard-coded) | replace with `var(--ds-interactive-primary-fill)` |
| warning | `.ds-button__label` | font-weight | `var(--font-weight-bold)` | `var(--font-weight-medium)` | confirm intended weight |
| ... | ... | ... | ... | ... | ... |

## Pixel diff (supporting)

Attached: `.design/<feature>/diff-<variant>.png`

Pixel diff area: <n>% (threshold: <tolerance_px>)
Interpretation: <"clean", "expected (anti-aliasing only)", "investigation needed">

## Provenance

- Figma node: <id>
- Storybook story URL: <url>
- Storybook build sha: <git sha>
- Tolerance px: <n>
- Skill version: <semver>
```

## Error Handling

* **Storybook URL unreachable.** Stop. The skill cannot run without the live story.
* **Figma frame and Storybook story are clearly different components.** If more than 50% of root element attributes diverge, abort and ask for confirmation (likely a wrong-pair input).
* **Headless browser fails to render.** Capture the console log and report. Common cause: missing fonts or web font loading not complete; the skill should retry once with a longer wait.
* **Token resolution differs because of theme.** If the Figma is light and the Storybook is dark (or vice versa), every colour will diverge. The skill detects this and refuses to run, recommending matching theme on both sides first.

## Composition

* `compose_after`: `handoff/component-scaffold`, `handoff/code-connect-stub`, `storybook/visual-testing`
* `compose_before`: `coordination/release-process` (this is a release gate)
* `calls`: `figma-integration/figma-console-mcp-integration`, `figma-integration/design-extraction`, `storybook/visual-testing`, `storybook/visual-regression-gate`, `handoff/frame-to-spec`, `ui/token-mapping-audit`

## Related Skills

* `../handoff/component-scaffold.md` — creates the component this skill verifies
* `../handoff/code-connect-stub.md` — when Code Connect is set up, this skill can cross-check the connected example
* `../../storybook/visual-testing.md` — the underlying Storybook test workflow
* `../../storybook/visual-regression-gate.md` — the gate this skill defers to for fuzzy-pixel scoring

## Autonomy note

`requires-approval` because it triggers Playwright/CI tasks that may cost real CI minutes and because the report may flag tokens for editing. The skill itself does not edit code; the human triages and fixes.
