---
name: design-critique
description: Structured critique of a Figma frame or screenshot against Design System rules. Covers visual hierarchy, spacing rhythm, alignment, density, component reuse and gradient decoration. Every finding cites a rule ID from foundation/design-rules and the frame is scored 0 to 100 with per-category subscores. Does not duplicate token, a11y or content checks - those have their own skills and fold into the full score via the critique-agent.
license: MIT
metadata:
  category: design/ui
  pillar: ui
  agents: [Designer, Design Engineer, Architect]
  autonomy: autonomous
  portable: true
  cadence: daily
  mcp_tool: design_critique
---

# Design Critique

## Purpose

Give a designer or design engineer a structured, repeatable second pair of eyes on a Figma frame before it leaves design. Critique is grounded in DS rules and existing artefacts. No opinion soup, no "feels off" findings. Every issue must point at a specific rule and a specific node.

The skill is intentionally narrow. It does *not* check tokens (that is `ui/token-mapping-audit.md`), accessibility (that is `ui/a11y-check.md`), content (that is `ui/content-style-check.md`) or light/dark parity (that is `ui/light-dark-parity.md`). Run those alongside this skill via `handoff/handoff-flow.md` or `agents/critique-agent` for a full pass.

Findings and scoring are governed by `foundation/design-rules.md`. This skill assesses the structural rule categories — **TYP, SPC, CMP, the gradient rules in COL, and the hierarchy and availability rules in UX** — and produces a score over those. The remaining categories (A11Y, BRD, MOT, full token-level COL, parity) belong to the dedicated skills; their findings fold into the full eight-category score at the `agents/critique-agent` level. A standalone critique score is therefore a *structural craft* score and says so.

## Preconditions

1. Figma Console MCP is connected. The **Mandatory User Gate** applies for Figma URLs; see `figma-integration/figma-console-mcp-integration.md`.
2. The frame is stable enough to be reviewed (not mid-sketch).
3. `figma-integration/design-linting.md` has been run and its errors resolved. This skill is a higher-level critique, it assumes the basics pass.

## Inputs

Required:

* `figma_url_or_node` — frame or component set to critique.

Optional:

* `severity_floor` — `info` | `warning` | `error`. Default `info`. Findings below this severity are suppressed from the report.
* `categories` — subset of the categories below. Default is all.
* `output_path` — defaults to `.design/<frame_name>/CRITIQUE.md`.

## Procedure

### Step 1: Run the existing Figma lint first

Call `figma_lint_design` on the input node. Capture the result. If it returns errors, abort the critique and report "fix lint errors first". This skill does not bypass the existing baseline.

If `figma_lint_design` returns warnings, capture them and include in the final report under "Baseline lint findings" so the reader sees the full picture.

### Step 2: Extract the frame for review

Use `figma_get_component_for_development` and capture:

* Auto-layout structure (direction, padding, gap, alignment, distribution).
* All text nodes with their bound typography tokens.
* All spacing values used (padding per side, gap, internal margins).
* Component instances vs detached elements.

### Step 3: Run the critique categories

Each category produces zero or more findings. Each finding has: severity, node id, **rule ID**, description, suggested fix. The `rule` field must be a real ID from `foundation/design-rules.md` — never an invented one. Severity comes from the rule, not from the reviewer's mood.

The six presentation categories map onto the rule-set categories that drive the score:

| Critique category | Rule category | Rule IDs in play |
|---|---|---|
| A. Visual hierarchy | TYP | DS-TYP-01, 02, 03, 06, 07 |
| B. Spacing rhythm | SPC | DS-SPC-01, 02, 03, 04, 05, 06 |
| C. Alignment | SPC | DS-SPC-07, 08 |
| D. Density | CMP, UX | DS-CMP-05, 07; DS-UX-01, 05 |
| E. Component reuse | CMP | DS-CMP-01, 02, 03, 04, 06 |
| F. Gradient and decoration | COL | DS-COL-07 |

If a finding does not map to an existing rule, do not score it: surface it as an `info` observation labelled "no rule yet — candidate for design-rules" so it can flow to the corpus `rules-candidates.md`.

#### Category A: Visual hierarchy

* Heading levels in the frame are sequential (no h1 → h3 jumps without an h2).
* No more than two display sizes per visible region. (DS typography tokens prevent shouting matches; flag if violated.)
* Primary action has the highest visual weight. If two elements tie for "primary" position, flag.
* Body text is one of `body.large`, `body.medium`, `body.small` — not `caption.*` used in body roles or vice versa.

#### Category B: Spacing rhythm

* All spacing values resolve to DS spacing tokens (cross-check via `ui/token-mapping-audit.md` rules).
* Padding values inside a single container are consistent on opposite sides (top/bottom equal unless there is a documented reason).
* Gap between sibling elements is one of the documented gap tokens. Half-step values (e.g. 6px when the scale uses 4 and 8) are a finding.
* The 4px / 8px rhythm holds at the section level. Spacings like 13px or 17px are findings.

#### Category C: Alignment

* All children of an auto-layout container are aligned per the container's alignment rule. Absolute-positioned children flagged with their reason.
* Text baselines align between adjacent text blocks of the same size.
* Icons sit on the optical centre of their adjacent text, not the bounding box centre. (This is a manual review note; surface it as `info` for the reviewer to confirm visually.)

#### Category D: Density

* Content-to-chrome ratio is sensible for the component context. Cards under 60% content are flagged for review.
* Action bars with more than three primary actions are flagged.
* Lists with no internal scaling for variable text lengths are flagged.

#### Category E: Component reuse

* Every primitive (button, input, chip, label, link, divider) is a DS component instance, not a detached or hand-built approximation. Check via `figma_get_component` to confirm instance vs detached.
* Custom-built versions of existing primitives are `error` severity. The fix is "replace with `@ds/...` instance".
* Acceptable detachments: documented overrides with a comment in the layer name. Surface as `info`, do not flag as error.

#### Category F: Gradient and decoration

* No purple gradients on white, and no generic gradient decoration (DS-COL-07). This is a DNA anti-pattern — the "generic AI-design aesthetic" the product deliberately avoids; severity `warning`.
* Decorative fills earn their place: flag gradient or decorative treatment that adds visual noise without contributing to hierarchy.

### Step 4: Score

Apply the scoring formula from `foundation/design-rules.md`. Roll findings up by their rule-ID category (the prefix: TYP, SPC, CMP, COL, UX):

1. Each finding contributes its rule weight — `error` 5, `warning` 2, `info` 0.
2. **Per-category deduction** = sum of weights in that category, capped at 30.
3. **Category subscore** = `max(0, 100 − deduction)`.
4. **Overall (structural) score** = `max(0, 100 − Σ capped deductions)`, over the categories this skill assesses.
5. Band it: **90–100** ship-ready · **75–89** minor fixes · **50–74** needs work · **below 50** rework.

State plainly that this is the *structural craft* score (TYP, SPC, CMP, COL-gradient, UX-hierarchy). Categories owned by sibling skills (A11Y, BRD, MOT, token-level COL, parity) are listed as "not assessed here" so the reader knows the score's scope. When `agents/critique-agent` runs the full battery it passes every skill's findings through this same formula for a true eight-category score.

Info findings never move the score; they are shown for judgement and may become rule candidates.

### Step 5: Render the report

Use the **Output Contract** below.

## Output Contract

```markdown
# Design Critique — [Frame Name]

> Figma: <deep link or "screenshot: <name>">
> Critiqued: <ISO timestamp>
> Tokens snapshot: <git sha>
> Categories run: <list>
> Severity floor: <floor>

## Score

**Structural craft score: `<n>` / 100** — <band>

| Rule category | Subscore | Errors | Warnings | Deduction (cap 30) |
|---|---|---|---|---|
| TYP | <n> | <n> | <n> | <n> |
| SPC | <n> | <n> | <n> | <n> |
| CMP | <n> | <n> | <n> | <n> |
| COL (gradient) | <n> | <n> | <n> | <n> |
| UX (hierarchy) | <n> | <n> | <n> | <n> |

Not assessed here (own skills): A11Y (`a11y-check`), BRD (`content-style-check`), MOT (`motion-review`), token-level COL (`token-mapping-audit`), parity (`light-dark-parity`).

## Summary

| Metric | Value |
|---|---|
| Total findings | <n> |
| Errors | <n> |
| Warnings | <n> |
| Info | <n> |
| Baseline lint findings | <n> |

## Findings by category

### A. Visual hierarchy

| Severity | Node | Rule | What | Suggested fix |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

### B. Spacing rhythm

| Severity | Node | Rule | What | Suggested fix |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

### C. Alignment

| Severity | Node | Rule | What | Suggested fix |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

### D. Density

| Severity | Node | Rule | What | Suggested fix |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

### E. Component reuse

| Severity | Node | Rule | What | Suggested fix |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

### F. Gradient and decoration

| Severity | Node | Rule | What | Suggested fix |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## Baseline lint findings (from `figma_lint_design`)

(Verbatim from the lint tool, included for completeness.)

## Provenance

- Figma file: <url or "screenshot">
- Figma node id: <id>
- Tokens snapshot: <git sha of tokens.json>
- Rules version: design-rules <semver>
- Corpus version: <vN or "none">
- Skill version: <semver>
```

Followed by the machine-readable summary:

```json
{
  "skill": "design/ui/design-critique",
  "version": "<semver>",
  "score": <overall structural score 0-100>,
  "band": "<ship-ready | minor-fixes | needs-work | rework>",
  "subscores": { "TYP": <n>, "SPC": <n>, "CMP": <n>, "COL": <n>, "UX": <n> },
  "counts": { "error": <n>, "warning": <n>, "info": <n> },
  "not_assessed": ["A11Y", "BRD", "MOT", "COL-token", "parity"],
  "artifacts": [".design/<feature>/CRITIQUE.md"],
  "provenance": { "figma": "<url or screenshot>", "tokens_sha": "<sha>", "corpus_version": "<vN or null>" }
}
```

## Error Handling

* **Frame is mid-draft.** If the basic lint surfaces structural errors (broken auto-layout, missing variants), abort and report.
* **Detached components.** If the frame is mostly detached, this skill's findings will be noisy. Cap output at the top 20 detached-component findings and recommend a Figma cleanup pass before re-running.
* **Subjective categories (D, F).** Density and gradient decoration are judgement calls. Surface as `warning` or `info`, never `error`.

## Composition

* `compose_after`: `design/foundation/design-dna`, `design/foundation/design-rules`, `figma-integration/figma-console-mcp-integration`, `figma-integration/design-linting`
* `compose_before`: `handoff/frame-to-spec`, `handoff/spec-packet`
* `calls`: `figma-integration/design-extraction`, `figma-integration/design-linting`, `ui/token-mapping-audit`, `foundation/design-rules`, `foundation/corpus-guide`

## Related Skills

* `./a11y-check.md` — accessibility findings, run alongside
* `./content-style-check.md` — copy and voice findings, run alongside
* `./light-dark-parity.md` — theme parity findings, run alongside (Phase 3)
* `../handoff/handoff-flow.md` — orchestrates all four checks (Phase 3)
