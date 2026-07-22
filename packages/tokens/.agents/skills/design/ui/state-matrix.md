---
name: state-matrix
description: Generate the full interactive state grid for a Figma component (default, hover, focus-visible, active, disabled, loading, error, empty) with the token controlling the difference in each cell. Used standalone for review, or called as a sub-procedure by `handoff/frame-to-spec`.
license: MIT
metadata:
  category: design/ui
  pillar: ui
  agents: [Designer, Design Engineer, Architect]
  autonomy: autonomous
  portable: true
  cadence: daily
---

# State Matrix

## Purpose

Produce a deterministic, complete state matrix for a component. Every supported state names the token that makes it different from the default. Every unsupported state is recorded as "not implemented" rather than omitted, so engineering and design are aligned on what the component does *not* do.

The matrix is the single source of truth for "what states should the engineer build". It is consumed by `handoff/frame-to-spec.md` and `handoff/spec-packet.md`, and used directly by reviewers.

## Preconditions

1. Figma Console MCP is connected and stable. Per `figma-integration/figma-console-mcp-integration.md`, the **Mandatory User Gate** applies: ask the user whether the Desktop Bridge plugin is running before any Figma MCP call.
2. The component is part of a published component set (i.e. it has variants), or single-variant with explicit state documentation in the Figma component description.
3. DS tokens are addressable via Token MCP.

## Inputs

Required:

* `figma_url_or_node` — the component or component set.

Optional:

* `state_set` — override the default state list. Default is `[default, hover, focus-visible, active, disabled, loading, error, empty]`.
* `interactive_only` — boolean, default true. When true, non-interactive states (`loading`, `error`, `empty`) are marked "not applicable" for components like text or dividers.
* `output_path` — defaults to inclusion in the parent spec, or `.design/<component>/STATE_MATRIX.md` if standalone.

## Procedure

### Step 1: Enumerate component variants

Use `figma_get_component` in metadata mode to list every variant in the component set. Read each variant's properties (state, size, variant kind, etc.) and the values they take. Build a list of `{variant: <props>, node_id: <id>}` for downstream extraction.

### Step 2: Extract differentiators per variant

For each variant, use `figma_get_component_for_development` and capture the values that differ from the default variant:

* Fill, stroke, opacity
* Border-radius (if state changes corner treatment)
* Typography differences (often weight or colour)
* Iconography (e.g. spinner appearing on `loading`)
* Cursor (often `not-allowed` on `disabled`)
* Content slot changes (e.g. `error` shows a message slot)

Record the *one or two tokens* that semantically own each difference, not every raw value.

### Step 3: Map differentiators to states

For each of the states in `state_set`, find the variant that represents it. The mapping is by convention:

| State | Variant property |
|---|---|
| default | `state=default` or no state property |
| hover | `state=hover` |
| focus-visible | `state=focus` or `state=focus-visible` |
| active | `state=active` or `state=pressed` |
| disabled | `state=disabled` or `disabled=true` property |
| loading | `state=loading` or `loading=true` property |
| error | `state=error` or `error=true` property |
| empty | empty-slot variant or `content=empty` |

If a state has no matching variant, classify as one of:

* **not implemented** — the component should support this state but does not. Surface in Findings.
* **not applicable** — the component does not need this state by design (e.g. text component does not need `loading`). Mark and move on.
* **unknown** — extraction did not resolve. Mark for human review.

### Step 4: Token validation per state

For each implemented state, confirm the differentiating tokens are *semantic* not foundation/palette. A state that flips colour by referencing a palette colour directly is a violation — call out via `ui/token-mapping-audit.md` rules.

### Step 5: Render the matrix

Write the matrix in the format below. Single Markdown table for legibility.

## Output Contract

```markdown
## State Matrix — [Component Name]

> Figma component set: <deep link>
> Generated: <ISO timestamp>
> Tokens snapshot: <git sha>

| State | Status | Differentiating token(s) | Value change | Variant link |
|---|---|---|---|---|
| default | implemented | n/a | baseline | <node link> |
| hover | implemented | `light/ core/ surface/ interactive-hover` | fill darkens by one step | <node link> |
| focus-visible | implemented | `light/ core/ border/ focus` | 2px focus ring | <node link> |
| active | implemented | `light/ core/ surface/ interactive-pressed` | fill darkens further | <node link> |
| disabled | implemented | `light/ core/ opacity/ disabled` | opacity 0.4, cursor not-allowed | <node link> |
| loading | not implemented | — | spinner not present | — |
| error | implemented | `light/ messaging/ border/ error` | red border + message slot | <node link> |
| empty | not applicable | — | non-data component | — |

### Findings

- `loading` is not implemented but the component is interactive. Recommend adding a loading variant before handoff.
- `focus-visible` uses a foundation token. Should be remapped to a semantic focus token.

### Provenance

- Component set: <figma deep link>
- Variants captured: <n>
- States resolved automatically: <n>
- States needing human review: <n>
```

## Error Handling

* **Component is not a set.** If there are no variants, the matrix has one row (`default`) and the rest are `unknown` until states are documented. Surface a Finding: "Component lacks state variants. Define states before handoff."
* **State property uses non-standard naming.** If a Figma file uses `state=Press` instead of `state=active`, normalise via the mapping in step 3 but record the original name in the Findings section so the Figma file can be cleaned up.
* **Differentiator is a hard-coded value.** Surface in Findings and recommend `ui/token-mapping-audit.md` as the fix path.
* **More than 12 states across all variants.** Stop and ask the human. A component with 12+ states usually has overlapping concerns (state × variant × size) and the matrix would be better split per axis.

## Composition

* `compose_after`: `figma-integration/figma-console-mcp-integration`, `figma-integration/design-extraction`
* `compose_before`: `handoff/frame-to-spec`, `handoff/spec-packet`, `handoff/component-scaffold`
* `calls`: `figma-integration/design-extraction`, `discovery/token-lookup`, `ui/token-mapping-audit`

## Related Skills

* `./frame-to-spec.md` — calls this skill as a sub-procedure
* `./token-mapping-audit.md` — referenced when differentiators are not semantic
* `../../react/component-patterns.md` — when implementing the matrix in code
* `../../storybook/story-writing.md` — every implemented state becomes a Storybook story
