---
name: prototype-spec
description: Given a Figma prototype (frames with smart animate transitions and/or interactive components), emit a textual motion spec for engineering. Captures every animated property, duration, easing, trigger, and reduced-motion fallback. Drops cleanly into the Motion section of a handoff spec packet.
license: MIT
metadata:
  category: design/motion
  pillar: motion
  agents: [Designer, Design Engineer, Architect]
  autonomy: autonomous
  portable: true
  cadence: on-demand
  status: scaffold
---

# Prototype Spec (motion)

## Purpose

Designers prototype motion in Figma via smart animate, after-delay triggers, and interactive components. Engineers building the same motion in code need that prototype rendered as text: triggers, properties, durations, easings, reduced-motion behaviour. This skill produces that text.

The skill is the motion analogue of `handoff/frame-to-spec.md`. Where frame-to-spec produces a static spec, this produces a motion spec.

## Preconditions

1. Figma Console MCP is connected. The **Mandatory User Gate** applies for Figma URLs.
2. The frame or component being spec'd is a Figma prototype, not a static design. If it is static, return early: "no motion to spec".
3. `motion/motion-tokens.md` is reachable (skill maps captured values to motion tokens via that lookup).
4. `motion/interaction-patterns.md` is reachable (the skill cross-references named patterns when the captured motion matches one).

## Inputs

Required:

* `figma_url_or_node` — the prototype frame or component.

Optional:

* `pattern_hint` — an interaction-patterns name (e.g. `modal-open`). When provided, the skill compares the captured motion against the named pattern and flags divergence.
* `output_path` — defaults to inclusion in the parent spec, or `.design/<feature>/MOTION_SPEC.md` if standalone.

## Procedure

### Step 1: Extract prototype data from Figma

Use the Figma Console MCP to retrieve:

* Every interaction defined on the frame (`on click`, `on hover`, `after delay`, `while pressing`, `mouse down`, `mouse enter`).
* For each interaction, the destination state.
* The transition animation between source and destination: type (`smart animate`, `instant`, `dissolve`, `move in`, `push`, `slide`), duration, easing curve, optional spring parameters.
* For interactive components, the variants and the transition properties on each variant change.

Record each capture as: `{trigger, source_node, destination_node, animation_type, duration_ms, easing_curve, animated_properties[]}`.

### Step 2: Identify which properties animate

For each animation, compare source and destination to identify what changes:

* Position (`x`, `y`, or transform translate)
* Size (`width`, `height`, or scale)
* Rotation
* Opacity
* Fill, stroke, effect colour or value
* Corner radius
* Text content (rare in motion, but possible)

Only list properties that actually change between the two states.

### Step 3: Map duration and easing to tokens

For each capture, call `motion/motion-tokens.md` with the captured duration and easing curve. The lookup returns the closest token (or the closest provisional value in scaffolded mode). Record both the raw value and the token path.

If a duration falls outside the standard scale (e.g. 450ms when the scale is 200/320/500), flag in step 5.

### Step 4: Cross-reference named patterns

For each capture, attempt to match it to an entry in `motion/interaction-patterns.md`:

* The animated properties match.
* The duration and easing fall within tolerance of the pattern's recommended values.
* The trigger matches the pattern's expected trigger.

If a match is found, the spec says "this is a `<pattern-name>` interaction" and links to the pattern card.

If no match is found, the spec says "custom motion, not in pattern library" and either suggests a candidate or recommends opening a pattern proposal.

### Step 5: Identify divergence and concerns

Surface as findings:

* **Off-scale duration.** Duration is not on the motion token scale. Suggested fix: snap to nearest token.
* **Off-set easing.** Easing curve is not in the standard set. Suggested fix: replace with closest standard.
* **Long duration on critical path.** Duration > 500ms on an interaction that blocks the user (e.g. modal open). Surface as `warning`.
* **No reduced-motion design.** The prototype implies motion but the design does not document the reduced-motion fallback. Surface as `warning`.
* **Multiple overlapping transitions.** More than three properties animating simultaneously with different durations. Surface as `info` for review.

### Step 6: Render the spec

Use the **Output Contract** below.

## Output Contract

```markdown
# Motion Spec — <Frame Name>

> Figma prototype: <deep link>
> Captured: <ISO timestamp>
> Captures: <n>
> Tokens snapshot: <git sha>
> Motion-tokens mode: <live | scaffolded>

## Captures

| # | Trigger | Source → Destination | Properties animated | Duration | Easing | Pattern match |
|---|---|---|---|---|---|---|
| 1 | on click | `<source-node>` → `<dest-node>` | `translateY 0 → 16`, `opacity 1 → 0` | 180ms (`motion.duration.fast`) | `cubic-bezier(0.4, 0.0, 1, 1)` (`motion.easing.ease-in`) | `modal-close` |
| 2 | hover | `Button.default` → `Button.hover` | `background-color` | 50ms (`motion.duration.instant`) | linear (`motion.easing.linear`) | `hover-feedback` |
| ... | ... | ... | ... | ... | ... | ... |

## Pattern matches

For each capture matched to a named pattern, a one-line link to the pattern card.

## Custom motions (no pattern match)

For each capture without a match, the full breakdown and a recommendation:

| # | Capture | Why no match | Suggested action |
|---|---|---|---|
| 5 | hero scroll-triggered shrink | not in catalogue | propose new pattern `hero-scroll-shrink` |

## Findings

| Severity | Capture # | Finding | Suggested fix |
|---|---|---|---|
| warning | 3 | duration 450ms not on scale | snap to `motion.duration.slow` (320ms) or `motion.duration.slower` (500ms) |
| warning | 1 | no reduced-motion design | document reduced-motion behaviour for modal-close |
| info | 6 | five properties animating with three different durations | consider reducing complexity |

## Reduced-motion summary

| Capture | Has fallback documented | Recommended fallback |
|---|---|---|
| 1 | no | crossfade only |
| 2 | n/a (instant) | n/a |

## Provenance

- Figma node: <id>
- Tokens snapshot: <sha>
- Skill version: <semver>
- Motion-tokens mode: <live | scaffolded>
```

## Error Handling

* **Frame has no prototype interactions.** Return early: "no motion to spec". Not an error.
* **Smart animate produces no resolvable property diff.** Surface as `info`: "smart animate between identical states; no motion to record".
* **Easing is a custom cubic-bezier with no token match.** Record the raw curve, flag as off-set, recommend the closest standard.
* **Spring animation.** Figma's spring parameters do not map 1:1 to CSS / native. Record the spring values and flag as needing a per-platform implementation note.

## Composition

* `compose_after`: `figma-integration/figma-console-mcp-integration`, `motion/motion-tokens`, `motion/interaction-patterns`
* `compose_before`: `ui/motion-review`, `handoff/frame-to-spec`, `handoff/spec-packet`
* `calls`: `figma-integration/design-extraction`, `motion/motion-tokens`, `motion/interaction-patterns`

## Related Skills

* `./motion-tokens.md`
* `./interaction-patterns.md`
* `../handoff/frame-to-spec.md` — the static spec, this is the motion equivalent
* `../ui/motion-review.md` — what this skill's output gets reviewed against
