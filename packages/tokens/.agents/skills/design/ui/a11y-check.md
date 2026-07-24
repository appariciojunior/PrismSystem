---
name: a11y-check
description: Design-time accessibility audit for a Figma frame. Checks colour contrast, text size, hit target size, focus indicator design, alt text placeholders, screen reader notes, and reduced-motion intent. Complements the code-level react/accessibility skill which covers WCAG 2.1 AA in implementation.
license: MIT
metadata:
  category: design/ui
  pillar: ui
  agents: [Designer, QA, Design Engineer]
  autonomy: autonomous
  portable: true
  cadence: daily
---

# Accessibility Check (frame-level)

## Purpose

Catch accessibility issues in the design before they are coded. This skill operates on the Figma frame: pixel sizes, colour pairs, hit areas, focus rings, and the presence of alt-text and screen-reader hints in layer names or notes. It does *not* run a code-level a11y audit. For implementation-level WCAG 2.1 AA compliance, use `react/accessibility.md` after the component is built.

The check is hard: any error finding here is a blocker for handoff.

## Preconditions

1. Figma Console MCP is connected. The **Mandatory User Gate** applies for Figma URLs; see `figma-integration/figma-console-mcp-integration.md`.
2. The frame's tokens resolve (or unmapped values have been reviewed via `ui/token-mapping-audit.md`). Contrast checks require resolved tokens.
3. The frame names its semantic intent for non-text elements (icons, decorative images) in the layer name or a Figma note. If not, the screen-reader-notes check will return many `unknown` findings, which is itself a finding.

## Inputs

Required:

* `figma_url_or_node` — frame or component to audit.

Optional:

* `target_level` — `AA` (default) or `AAA`. Sets the contrast threshold via `color-ramps/contrast-check.md`.
* `include_aaa_warnings` — when `target_level=AA`, also list pairs that pass AA but fail AAA, as informational. Default false.
* `output_path` — defaults to `.design/<frame_name>/A11Y_CHECK.md`.

## Procedure

### Step 1: Extract the frame

Use `figma_get_component_for_development`. Capture text nodes (size, weight, fill), interactive nodes (buttons, links, inputs, anything with a hover/active state), images, icons, and any layer with explicit a11y notes.

### Step 2: Contrast check

For every text-on-surface pair in the frame, call `color-ramps/contrast-check.md`. Use the resolved tokens, not raw hex values. Record:

* The token pair.
* The computed contrast ratio.
* Pass / fail at the target level.

Fail at error severity. Borderline passes (within 0.1 of threshold) get `warning` severity with a note that the values may drift in a future token revision.

### Step 3: Text size

Minimum body text size for DS is the smallest body token currently in the system (look it up via `discovery/token-lookup.md`). Anything smaller than that token in a non-caption role is an error. Captions and footnotes use their dedicated tokens and have their own contrast adjustment (per typography token descriptions in `content-styleguide.md`).

Flag: any text node sized below the minimum body token that is not a caption.

### Step 4: Hit target size

For every interactive node (button, icon button, link with non-text-flow target, control), confirm the bounding box is at least 44 CSS pixels in both dimensions. This matches WCAG 2.5.5 target size (level AAA, but DS adopts as default per the existing `figma_lint_design` rule).

* Inline links inside a paragraph are exempt (they are not standalone targets).
* Icon-only controls below 44×44 are `error` severity.
* Controls between 32 and 44 are `warning` (likely a visual choice; surface for review).

### Step 5: Focus indicator

For every interactive node:

* The component set must include a `focus-visible` (or `focus`) variant. Cross-check via `ui/state-matrix.md` if available.
* The focus variant must change a visually obvious property (outline, ring, border, shadow). A focus state that only changes opacity by less than 10% is a finding.
* Focus ring contrast against the surrounding surface meets the contrast rule from step 2.

Missing focus state on an interactive node is an error.

### Step 6: Alt text and screen reader hints

For every image, icon, or decorative element:

* If the layer is decorative, layer name should include `decorative` or the Figma description should say so. If unclear, surface as `info`.
* If the layer is meaningful, an alt-text placeholder must be present (layer name, description, or a documented attached text node). Missing alt-text on a meaningful image is `warning`.
* Icon-only buttons must have a paired screen-reader label noted somewhere on the frame (layer name, description, or a connected text node marked as SR-only). Missing label is `error`.

### Step 7: Reduced motion

If the frame implies motion (Figma prototype interactions, smart animate, animated component variants):

* The frame or its parent component must include a note documenting the reduced-motion fallback (`prefers-reduced-motion: reduce`). Missing note is `warning`.
* Any motion involving large translation across the viewport (more than 50% viewport width or height) is `warning` regardless of fallback documentation.
* Motion durations longer than a documented DS maximum (TBD in motion tokens) are `warning`.

This step degrades gracefully: if motion tokens do not yet exist, the duration check is skipped and a `info` finding notes the gap.

### Step 8: Render the report

Use the **Output Contract** below.

## Output Contract

```markdown
# Accessibility Check — [Frame Name]

> Figma: <deep link>
> Audited: <ISO timestamp>
> Target level: <AA | AAA>
> Tokens snapshot: <git sha>
> Result: <pass | pass-with-warnings | fail>

## Summary

| Metric | Value |
|---|---|
| Errors | <n> |
| Warnings | <n> |
| Info | <n> |
| Contrast pairs checked | <n> |
| Interactive nodes checked | <n> |
| Meaningful images checked | <n> |

## Findings

### Contrast

| Severity | Node | Token pair | Ratio | Threshold | Suggested fix |
|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... |

### Text size

| Severity | Node | Size | Minimum | Role |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

### Hit target

| Severity | Node | Size | Minimum | Suggested fix |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

### Focus

| Severity | Node | What | Suggested fix |
|---|---|---|---|
| ... | ... | ... | ... |

### Alt text and SR labels

| Severity | Node | What | Suggested fix |
|---|---|---|---|
| ... | ... | ... | ... |

### Motion

| Severity | Node | What | Suggested fix |
|---|---|---|---|
| ... | ... | ... | ... |

## Provenance

- Figma file: <url>
- Figma node id: <id>
- Tokens snapshot: <git sha>
- Contrast skill version: <semver>
- Skill version: <semver>
```

## Error Handling

* **Tokens unmapped.** Skip contrast for any pair that includes an unmapped value, and surface the unmapped value as a blocker. Run `ui/token-mapping-audit.md` first to resolve.
* **Focus variant missing across the entire frame.** Stop and report. A frame with no focus design is not ready for a11y review.
* **Motion implied but not documented.** Warn, do not error. The fix is design documentation, not removal of motion.
* **Reduced-motion fallback documented but contradicts the main animation.** Flag as a finding for human review.

## Composition

* `compose_after`: `figma-integration/figma-console-mcp-integration`, `ui/token-mapping-audit`
* `compose_before`: `handoff/spec-packet`, `handoff/handoff-flow`
* `calls`: `figma-integration/design-extraction`, `color-ramps/contrast-check`, `discovery/token-lookup`, `ui/state-matrix`

## Related Skills

* `../../react/accessibility.md` — code-level WCAG 2.1 AA, runs *after* implementation
* `../../color-ramps/contrast-check.md` — the contrast engine this skill uses
* `./design-critique.md` — broader design quality, run alongside
* `./content-style-check.md` — copy and labels, run alongside
