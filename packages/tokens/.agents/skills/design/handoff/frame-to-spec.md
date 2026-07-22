---
name: frame-to-spec
description: Turn a Figma frame into a complete, no-questions-asked developer spec packet. Pulls layout, tokens, states, breakpoints, edge cases and a11y notes from the frame and renders them as a single Markdown file that links back to the Figma node. Use when a designer or design engineer needs to hand a frame to engineering.
license: MIT
metadata:
  category: design/handoff
  pillar: handoff
  agents: [Designer, Design Engineer, Architect]
  autonomy: autonomous
  portable: true
  cadence: daily
---

# Frame to Spec

## Purpose

Produce a complete developer handoff document from a Figma frame, in a single pass, with deterministic output. The spec must be detailed enough that an engineer can build the component without opening Figma's dev mode, and grounded enough that no token, breakpoint, or state is invented.

This skill does extraction and synthesis. It does *not* check the design (use `ui/design-critique` for that) and does *not* write code (use `handoff/component-scaffold` for that). It is the bridge between "a frame exists" and "engineering can build it".

## Preconditions

1. Figma Console MCP is connected and in a stable mode. Confirm via `figma-integration/figma-console-mcp-integration.md` before starting. This includes the **Mandatory User Gate** for Figma URLs: ask the user whether the Desktop Bridge plugin is running in the target file before any Figma MCP call.
2. The DS Tokens MCP server is running (`packages/tokens/mcp-server/index.js`) so token lookups resolve.
3. The frame is a published component or a stable design (not a half-built sketch). If unsure, run `figma-integration/design-linting.md` first and stop on errors.
4. `packages/tokens/src/tokens.json` is current. The skill reads from this file via Token MCP, not from Figma styles directly.

## Inputs

Required:

* `figma_url_or_node` — a Figma URL or node ID for the frame to spec.

Optional:

* `component_name` — defaults to the frame's parent component name. Used in the output filename.
* `channel_context` — one of the DS product channels (`home`, `world`, `money`, `comment`, `business`, `sport`, `travel`, `puzzle`, `culture`, `obituaries`, `ireland`). Auto-detected from the frame if it uses a channel colour, otherwise omitted.
* `output_path` — defaults to `.design/<component_name>/SPEC.md`.

## Procedure

### Step 1: Preflight

Run the readiness snapshot from `figma-integration/figma-console-mcp-integration.md`. Stop and report if any tool is not ready. Do not partial-spec.

### Step 2: Extract the frame

Use `figma_get_component_for_development` against the input node. Capture:

* Component properties (`componentPropertyDefinitions`, `componentProperties`) for the public API.
* All variants: enumerate the component set and record each variant's property values.
* Auto-layout direction, padding, gap, alignment.
* Sizing rules (`hug`, `fill`, fixed).
* Effects: shadows, blurs, strokes.
* Variable bindings on fills, strokes, gaps, padding, typography.

If the response looks partial, re-run with `refreshCache: true` and explicit `fileUrl`. Per `figma-integration/design-extraction.md`, treat the second response as source evidence.

### Step 3: Resolve every value to a DS token

For each captured value (colour, spacing, radius, type, shadow), resolve via Token MCP:

1. Try `token_lookup` with the variable alias if a binding was found in step 2.
2. If no binding, use `search_tokens` with the value and intent (e.g. "fill, surface, primary").
3. If `search_tokens` returns nothing, the value is unmapped. Flag it. Do not invent a token name.

The output of this step is a mapping table: `Figma value → token path → token value`. Hand the unmapped values to `ui/token-mapping-audit` to confirm the gap is real (a value with no token is either a token to add or a design mistake).

### Step 4: Build the state matrix

For each variant in the component set, enumerate every interactive state the component supports. The default state set is:

`default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`, `empty`.

A state is "supported" if it has at least one differentiating property (different fill, different opacity, different content, different border, different cursor). For each supported state, record the differentiating property and the token controlling it. States the component does not implement are listed as "not implemented" rather than omitted, so engineering knows the answer is "no" and not "missed".

For the full state grid, delegate to `ui/state-matrix.md` (call as a sub-procedure).

### Step 5: Responsive behaviour

If the frame is part of a component set that includes breakpoint variants (small/medium/large, or named breakpoints), record what changes per breakpoint. Reference the DS viewport tokens (`viewport/ small`, `viewport/ medium`, `viewport/ large`) rather than hardcoded pixel values.

If the frame is single-breakpoint, state that explicitly and link to the parent component set if one exists.

### Step 6: Channel context (when relevant)

If the resolved tokens include a `product.channel.*` value, run the channel check from `ui/channel-context.md`. Confirm:

* The channel is set at the right level (usually the page wrapper or section, not the component itself).
* All channel-coloured nodes resolve via semantic tokens that flow from the channel, not the foundation channel colour directly.
* The contrast against text and surface tokens in that channel passes the existing `color-ramps/contrast-check.md`.

### Step 7: Accessibility notes

Run the relevant checks against the captured spec:

* Colour contrast: every text-on-surface pair from the token map, via `color-ramps/contrast-check.md`.
* Hit target: any interactive component must be at least 44×44 CSS pixels per `react/accessibility.md`. Flag if not.
* Focus: confirm a focus-visible state is defined (from step 4). Flag if missing.
* Reduced motion: if the frame implies motion (prototype interactions, smart animate), note the reduced-motion fallback expected.

This step produces notes for the spec, not a pass/fail gate. Hard gates live in `ui/a11y-check.md`.

### Step 8: Render the spec packet

Write a single Markdown file to `output_path` using the template in the **Output Contract** section below. The file must contain the deep link to the Figma node, the extraction timestamp, every token referenced, and every state captured. No prose without a fact behind it.

## Output Contract

The rendered spec file is structured exactly as follows. Order is fixed so engineers can scan predictably.

```markdown
# [Component Name] — Handoff Spec

> Figma: <deep link to the node>
> Extracted: <ISO timestamp>
> Channel: <channel name or "none">
> Spec generated by: design/handoff/frame-to-spec v<version>

## Overview

One paragraph. What this component does, who uses it, why it exists. Pulled from the Figma component description if present, otherwise stated as "needs description".

## Public API (component properties)

| Property | Type | Default | Allowed values | Description |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## Layout

- Direction, alignment, padding, gap, sizing rules
- Reference DS spacing tokens by path

## Tokens used

| Role | Token | Value | Where it applies |
|---|---|---|---|
| Surface (default) | `light/ core/ surface/ primary` | #FFFFFF | Background fill |
| ... | ... | ... | ... |

Unmapped values (must be resolved before merge):

| Figma value | Where it appears | Suggested action |
|---|---|---|
| ... | ... | ... |

## State matrix

| State | Implemented | Differentiating tokens | Notes |
|---|---|---|---|
| default | yes | ... | ... |
| hover | yes | ... | ... |
| focus-visible | yes | ... | ... |
| active | yes | ... | ... |
| disabled | yes | ... | reduced opacity via `light/ core/ opacity/ disabled` |
| loading | not implemented | | flag if expected |
| error | yes | ... | ... |
| empty | not applicable | | for non-data components |

## Responsive behaviour

| Breakpoint | Changes |
|---|---|
| small (`viewport/ small`) | ... |
| medium (`viewport/ medium`) | ... |
| large (`viewport/ large`) | ... |

## Accessibility

- Contrast checks: all pass / specific failures listed by token pair
- Hit target: meets 44×44 / fails on X
- Focus indicator: defined via Y
- Reduced motion: documented behaviour / not applicable

## Channel context

If channel is set, list the channel and the semantic tokens that flow from it.

## Edge cases

- Empty data
- Long text / overflow rules
- Loading
- Error
- International text expansion

## Open questions

Anything the extraction could not resolve. The skill must not invent answers. Engineering or design picks these up before build.

## Provenance

- Figma file: <url>
- Figma node id: <id>
- Token MCP version: <semver>
- Tokens snapshot: <git sha of tokens.json>
```

Every section above must be present in the rendered file, even if the content is "not applicable" or "needs description". Empty sections are removed only by the human reviewer, not by the skill.

## Error Handling

* **Figma MCP not ready.** Stop. Run `figma-integration/figma-console-mcp-integration.md` and re-try. Do not extract from screenshots as a fallback in this skill — that is `ui/visual-vs-built.md`'s job.
* **Frame has no resolvable component.** Report which parent it is part of, do not spec a loose frame.
* **Token MCP returns inconsistent results.** Force a `token_lookup` direct read of `tokens.json` and trust that. Note the discrepancy in the spec's Provenance section.
* **Unmapped values.** Render them in the unmapped table. Do not invent token names. Do not fail the spec on unmapped values alone — they are a deliverable, not a halt condition.
* **Channel colour in a non-channel context.** Flag in Channel context section as a likely design mistake. Continue.
* **State matrix incomplete.** If you cannot determine whether a state is implemented or not, mark it `unknown` and surface it in Open questions. Do not guess.

## Composition

* `compose_after`: `figma-integration/figma-console-mcp-integration`, `figma-integration/design-linting`
* `compose_before`: `handoff/component-scaffold` (if engineering is also scaffolding)
* `calls`: `figma-integration/design-extraction`, `figma-integration/token-mapping`, `discovery/semantic-token-search`, `discovery/token-lookup`, `color-ramps/contrast-check`, `react/accessibility`, `ui/state-matrix`, `ui/token-mapping-audit`, `ui/channel-context`

## Related Skills

* `./token-mapping-audit.md` — deep dive on unmapped values
* `./state-matrix.md` — the state grid producer this skill delegates to
* `./channel-context.md` — channel colour validation
* `./spec-packet.md` — bundles this spec with assets and a Figma deep link for ticket attachment
* `../ui/design-critique.md` — run this *before* spec'ing if the frame quality is uncertain
