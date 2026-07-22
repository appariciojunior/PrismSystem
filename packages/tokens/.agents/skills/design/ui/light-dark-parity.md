---
name: light-dark-parity
description: Compare the light and dark frames of the same component or feature, flag structural divergence, value divergence outside the documented channel exceptions, and missing dark variants. Enforces the Design System rule that semantic tokens are 1:1 across themes, with channel tokens as the only allowed exception.
license: MIT
metadata:
  category: design/ui
  pillar: ui
  agents: [Designer, Design Engineer, Architect]
  autonomy: autonomous
  portable: true
  cadence: weekly
---

# Light/Dark Parity

## Purpose

The Design System holds a strict rule:

> All semantic tokens are structurally and semantically identical across all themes. Channel-specific tokens (`.channel.` in path) are the only exception where documented value divergence may apply.

That rule is enforced in the token files by `validation/semantic-theme-parity.md`. This skill enforces it in the *design* before tokens get touched. It compares the light and dark Figma frames for the same component and surfaces any divergence the designer introduced, intentionally or otherwise.

The skill is weekly cadence because parity drift is a slow leak, not a daily emergency. It should run before every release, and any time a new theme variant is added to a component.

## Preconditions

1. Figma Console MCP is connected. The **Mandatory User Gate** applies for Figma URLs; see `figma-integration/figma-console-mcp-integration.md`.
2. Both the light and dark frames exist for the component being compared. If only one exists, the skill reports a missing-sibling finding and stops.
3. Tokens are mapped on both frames (run `ui/token-mapping-audit.md` on each first; this skill consumes those outputs).

## Inputs

Required:

* `light_url_or_node` — Figma frame for the light theme variant.
* `dark_url_or_node` — Figma frame for the dark theme variant.

Optional:

* `allow_channel_divergence` — boolean, default true. When false, even channel tokens must match by structure (only values are allowed to differ).
* `output_path` — defaults to `.design/<component_name>/PARITY.md`.

## Procedure

### Step 1: Extract both frames

Use `figma_get_component_for_development` against both nodes. Capture the same shape for each:

* Auto-layout structure (direction, padding per side, gap, alignment).
* Every text node with its bound typography token.
* Every fill / stroke with its bound colour token.
* Every effect with its bound effect token.
* Every spacing value with its bound spacing token.
* Every state variant present.

Build two parallel inventories, one per theme.

### Step 2: Map each token to its sibling

For every token reference in the light inventory, find the corresponding token in the dark inventory via `color-ramps/dark-mode-mapping.md` rules:

* Direct sibling: `light/ core/ surface/ primary` → `dark/ core/ surface/ primary`.
* Neutral ramp reversal: step 50 swaps with step 1000 on the neutral ramp (per dark-mode-mapping rule).
* Channel siblings: `light/ <channel>/ <subpath>` → `dark/ <channel>/ <subpath>`.

For each mapping, classify:

* **Match.** Same semantic path, expected sibling. Pass.
* **Allowed divergence.** Channel token where `allow_channel_divergence` is true. Pass with `info` note.
* **Mismatch.** Different semantic path between themes (a structural divergence). `error` severity.
* **Missing sibling.** Token present in one theme, absent in the other. `error` severity.

### Step 3: Structural diff

Compare the auto-layout structures of the two frames. They should be identical in:

* Direction, padding per side, gap, alignment, distribution.
* Node count and node hierarchy.
* Component property values (variants, sizes).

Any divergence is `error` severity unless explicitly noted in a Figma description (e.g. "dark variant uses larger padding for legibility, see ticket XYZ").

### Step 4: State coverage diff

For each variant in the light frame's component set, confirm the same variant exists in the dark frame's set. Missing dark variants are `error`. Extra dark variants (states that exist in dark but not light) are also `error`.

Cross-reference `ui/state-matrix.md`: if a state is "not implemented" in light, it should be "not implemented" in dark too, or the discrepancy needs a documented reason.

### Step 5: Value-divergence assessment

Even where tokens match by name, if a designer has detached a binding and overridden the value, the two themes can drift in unintended ways. For each fill/stroke/effect:

* Confirm the variable binding is intact in both themes.
* Confirm the resolved values differ in the documented direction (light values lighter, dark values darker, channel values per channel rules).
* Surface any case where the light value is darker than the dark value, or vice versa, as `error`.

### Step 6: Render the report

Use the **Output Contract** below.

## Output Contract

```markdown
# Light/Dark Parity — [Component Name]

> Light Figma: <deep link>
> Dark Figma: <deep link>
> Compared: <ISO timestamp>
> Allow channel divergence: <true | false>
> Tokens snapshot: <git sha>
> Result: <pass | pass-with-allowed-divergence | fail>

## Summary

| Metric | Light | Dark |
|---|---|---|
| Tokens referenced | <n> | <n> |
| States present | <n> | <n> |
| Auto-layout nodes | <n> | <n> |

| Finding type | Count |
|---|---|
| Structural mismatches | <n> |
| Missing siblings | <n> |
| Allowed divergence (channel) | <n> |
| Value direction reversed | <n> |

## Token mapping

| Light token | Dark sibling | Status | Note |
|---|---|---|---|
| `light/ core/ surface/ primary` | `dark/ core/ surface/ primary` | match | |
| `light/ comment/ accent/ primary` | `dark/ comment/ accent/ primary` | allowed divergence | channel |
| `light/ core/ text/ primary` | missing | missing sibling | error |

## Structural diff

| Aspect | Light | Dark | Status |
|---|---|---|---|
| Padding top | 16px | 16px | match |
| Padding right | 16px | 20px | mismatch (error) |
| Gap | 8px | 8px | match |
| Node count | 7 | 7 | match |

## State coverage

| State | Light | Dark | Status |
|---|---|---|---|
| default | yes | yes | match |
| hover | yes | yes | match |
| focus-visible | yes | no | missing dark (error) |
| disabled | yes | yes | match |

## Findings (top to bottom by severity)

| Severity | Type | Detail | Suggested fix |
|---|---|---|---|
| ... | ... | ... | ... |

## Provenance

- Light Figma node: <id>
- Dark Figma node: <id>
- Tokens snapshot: <git sha>
- Dark-mode-mapping skill version: <semver>
- Skill version: <semver>
```

## Error Handling

* **One theme missing.** Stop with a single finding: "missing <light|dark> variant". The fix is to design the missing variant, not to spec parity.
* **Both frames have detached components.** Surface as `warning`, parity comparison is unreliable with detached components.
* **Channel divergence in unexpected direction.** A `light/ comment/...` token that resolves to a colour lighter than its `dark/ comment/...` sibling is a likely mistake. Flag with `error`.
* **Skill runs but light and dark are clearly different components.** If structural diff exceeds 50% of nodes, the skill is likely comparing the wrong pair. Stop and ask for confirmation.

## Composition

* `compose_after`: `ui/token-mapping-audit` (run on both frames first), `ui/channel-context`
* `compose_before`: `handoff/spec-packet`, `handoff/handoff-flow`
* `calls`: `figma-integration/design-extraction`, `color-ramps/dark-mode-mapping`, `validation/semantic-theme-parity`, `ui/state-matrix`

## Related Skills

* `../ui/channel-context.md` — defines what allowed divergence looks like
* `../../validation/semantic-theme-parity.md` — the token-level enforcement this skill mirrors at design time
* `../../color-ramps/dark-mode-mapping.md` — the sibling-mapping logic
