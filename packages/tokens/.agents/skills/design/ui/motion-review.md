---
name: motion-review
description: Score the motion in a Figma frame or prototype against Design System motion standards. Checks durations against the motion-token scale, easings against the standard set, reduced-motion fallback documentation, and divergence from the interaction-patterns library. Sister skill to design-critique, but motion-only.
license: MIT
metadata:
  category: design/ui
  pillar: ui
  agents: [Designer, Design Engineer, QA]
  autonomy: autonomous
  portable: true
  cadence: weekly
  status: scaffold
---

# Motion Review

## Purpose

Critique the motion of a frame or prototype against DS motion standards. The skill is hard about durations and easings (they must be on-scale and on-set), softer about pattern fit (a custom motion may be intentional). Findings surface as `error`, `warning`, or `info` with concrete suggested fixes.

Sister to `ui/design-critique.md`, which handles static design. This skill is the equivalent for motion.

## Preconditions

1. Figma Console MCP is connected. The **Mandatory User Gate** applies.
2. `motion/prototype-spec.md` has run (or can run now). The review consumes its capture table.
3. `motion/motion-tokens.md` and `motion/interaction-patterns.md` are reachable.
4. If `motion-tokens` is in scaffolded mode, the review still runs but every duration / easing finding is downgraded by one severity step because the scale is provisional.

## Inputs

Required:

* `figma_url_or_node` — frame or prototype to review.

Optional:

* `severity_floor` — `info` | `warning` | `error`. Default `info`.
* `expected_patterns` — list of expected interaction patterns for this frame (e.g. `["modal-open", "toast-appear"]`). When provided, the review confirms these are present and well-formed.
* `output_path` — defaults to `.design/<feature>/MOTION_REVIEW.md`.

## Procedure

### Step 1: Run prototype-spec

Call `motion/prototype-spec.md` to get the canonical capture table. If no motion is detected, the review returns early with `info`: "no motion to review".

### Step 2: Duration check per capture

For each captured duration:

* If it matches a token on the scale, pass.
* If it is within 10% of a token, warn ("snap to <token>").
* If it is off-scale and not within tolerance, error ("not on scale, snap to <token>").
* If the token system is scaffolded (no live tokens yet), downgrade all of the above by one severity step and add `info`: "motion tokens are provisional".

### Step 3: Easing check per capture

For each captured easing curve:

* If it matches a curve in the standard set, pass.
* If it is mathematically similar to a standard curve (within a small delta on the control points), warn ("replace with <standard-curve>").
* If it is a custom curve outside the set, error ("not in standard easing set").
* Spring easings get a separate finding: warn, with note that per-platform implementation is needed.

### Step 4: Pattern fit per capture

For each capture:

* If `prototype-spec` matched it to a pattern, confirm the duration and easing match the pattern's recommendation. Divergence within tolerance is `info`. Divergence outside is `warning`: "non-standard <pattern>".
* If no pattern match, surface as `info` and recommend either pattern proposal or pattern selection.

### Step 5: Reduced-motion check

For every capture:

* Confirm the reduced-motion fallback is documented (in Figma layer description, frame note, or attached doc). Missing fallback is `warning`.
* Confirm the fallback is sensible: opacity-only is the safe default; instant transitions are also fine; a longer-duration animation is *not* a valid reduced-motion fallback. Flag if the fallback violates the rule.

### Step 6: Critical-path check

For motions on the critical path (modal open, page transition, form submission feedback):

* Total perceived duration (longest captured duration) should be under a hard cap (default 500ms, configurable per pattern). Over the cap is `warning`.
* No more than two captures sequenced in series on a single critical interaction. Over two is `warning`: "consider collapsing into a single transition".

### Step 7: Expected-pattern coverage

If `expected_patterns` was provided:

* For each expected pattern, confirm at least one capture matches it. Missing is `error`.
* Surface unexpected patterns (captures that match patterns not in the expected list) as `info`.

### Step 8: Render the report

Use the **Output Contract** below.

## Output Contract

```markdown
# Motion Review — <Frame Name>

> Figma: <deep link>
> Reviewed: <ISO timestamp>
> Motion-tokens mode: <live | scaffolded>
> Tokens snapshot: <git sha>
> Result: <pass | pass-with-findings | fail>

## Summary

| Metric | Value |
|---|---|
| Captures reviewed | <n> |
| Errors | <n> |
| Warnings | <n> |
| Info | <n> |
| Patterns matched | <n> |
| Custom motions | <n> |
| Captures missing reduced-motion fallback | <n> |

## Findings

### Duration

| Severity | Capture # | Actual | Closest token | Suggested fix |
|---|---|---|---|---|
| error | 3 | 450ms | `motion.duration.slow` (320ms) or `motion.duration.slower` (500ms) | snap to nearest |
| warning | 5 | 210ms | `motion.duration.fast` (200ms) | snap, 10ms drift |

### Easing

| Severity | Capture # | Actual | Closest standard | Suggested fix |
|---|---|---|---|---|
| error | 2 | `cubic-bezier(0.3, 0.1, 0.7, 1)` | `motion.easing.emphasised` | replace |

### Pattern fit

| Severity | Capture # | Matched pattern | Issue | Suggested fix |
|---|---|---|---|---|
| info | 1 | `modal-open` | duration 50ms over recommendation | review with designer |
| info | 6 | no match | not in catalogue | propose pattern or use closest existing |

### Reduced motion

| Severity | Capture # | Has fallback | Issue | Suggested fix |
|---|---|---|---|---|
| warning | 1 | no | undocumented | add fallback note in Figma |
| error | 4 | yes, but longer-duration | invalid fallback | use opacity-only instead |

### Critical-path

| Severity | Critical path | Issue | Suggested fix |
|---|---|---|---|
| warning | modal-open | total duration 620ms (cap 500ms) | shorten or collapse sequence |

### Expected-pattern coverage

| Expected pattern | Present | Notes |
|---|---|---|
| modal-open | yes | capture #1 |
| toast-appear | no | missing |

## Provenance

- Figma node: <id>
- Tokens snapshot: <sha>
- Motion-tokens mode: <live | scaffolded>
- Skill version: <semver>
```

## Error Handling

* **No motion in frame.** Return `info`: "no motion to review". Not an error.
* **Motion-tokens scaffolded mode.** Run, downgrade duration/easing severities by one step, surface a single `info` row noting the mode.
* **Prototype-spec fails.** Stop and report. The review cannot run without captures.
* **Conflicting reduced-motion fallback.** Two captures in the same interaction document different fallbacks. Flag as `error`: "inconsistent reduced-motion design".

## Composition

* `compose_after`: `motion/prototype-spec`, `motion/motion-tokens`, `motion/interaction-patterns`
* `compose_before`: `handoff/spec-packet`, `handoff/handoff-flow`
* `calls`: `motion/prototype-spec`, `motion/motion-tokens`, `motion/interaction-patterns`

## Related Skills

* `./design-critique.md` — static design review, run alongside
* `../motion/prototype-spec.md` — the capture this skill reviews
* `../motion/interaction-patterns.md` — the pattern library this skill enforces
