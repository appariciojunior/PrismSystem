---
name: interaction-patterns
description: Reference library of named interaction patterns (loading, optimistic save, in-place edit, modal open, sheet drag, list reorder, toast appear) with the Design System recommended motion tokens and behavioural rules for each. Designers and design engineers consult this skill when designing or implementing any standard interaction.
license: MIT
metadata:
  category: design/motion
  pillar: motion
  agents: [Designer, Design Engineer, Code, Architect]
  autonomy: autonomous
  portable: true
  cadence: weekly
  status: scaffold
---

# Interaction Patterns

## Purpose

When a designer reaches for a standard interaction (open a modal, save in place, reorder a list), the right answer should be a one-line lookup, not a fresh design decision. This skill is that lookup.

Each pattern documents:

* The trigger.
* The properties that animate.
* The duration and easing tokens used.
* The reduced-motion behaviour.
* The accessibility note.
* The components in the DS that already implement it.

Like `motion/motion-tokens.md`, this skill is currently scaffolded: pattern *structure* is fixed, but specific token references are provisional until motion tokens land.

## Preconditions

1. Design System Tokens MCP is running.
2. `motion/motion-tokens.md` is reachable (this skill defers to it for token resolution).
3. The user has identified a pattern by name or by description (e.g. "what's the standard for opening a modal", "how should optimistic saves animate").

## Inputs

Required:

* `pattern_name` or `pattern_description` — one of the patterns below, or a natural-language description that maps to one.

Optional:

* `context` — `web` | `ios` | ``. Default `web`. The skill returns the relevant token paths per platform if they differ.
* `output_path` — defaults to inline response. Persists to `.design/<feature>/INTERACTION_PATTERN_<name>.md` if a feature is implied.

## Procedure

### Step 1: Resolve the pattern name

If the user provides a `pattern_name`, look it up in the catalogue below. If they provide a description, match it against the patterns by intent.

If no pattern matches, surface as `info`: "no documented pattern, this may be a candidate for a new one". Suggest opening an issue.

### Step 2: Resolve the motion tokens

For each token referenced in the pattern, call `motion/motion-tokens.md`. If the token is live, use the live value. If scaffolded, return the pattern with the provisional value, clearly marked.

### Step 3: Surface platform variations

For `context: web`, the implementation is CSS transitions or the `Motion` library where complex.
For `context: ios`, the implementation is UIKit animations against `theme-ios` token equivalents.
For `context:`, the implementation is MotionLayout or property animators against token equivalents.

If a pattern is web-only (rare), say so.

### Step 4: Return the pattern card

Use the **Output Contract** below.

## Pattern catalogue

### `modal-open`

| Aspect | Value |
|---|---|
| Trigger | User action that requires focused decision (click, keyboard) |
| Properties animated | `transform: translateY` (from +16px to 0), `opacity` (from 0 to 1) |
| Duration token | `motion.duration.slow` (provisional: ~320ms) |
| Easing token | `motion.easing.ease-out` (provisional: `cubic-bezier(0.0, 0.0, 0.2, 1)`) |
| Backdrop | Fade in over `motion.duration.base`, easing.linear |
| Reduced motion | Replace the slide with a crossfade. Opacity only. |
| Accessibility | Focus moves to the first focusable element in the modal. Background is `aria-hidden="true"`. ESC closes. |
| DS components | Toast (similar pattern), planned Dialog/Modal |

### `modal-close`

| Aspect | Value |
|---|---|
| Trigger | Click outside, ESC, explicit close button, programmatic dismiss |
| Properties animated | `transform: translateY` (0 to +12px), `opacity` (1 to 0) |
| Duration token | `motion.duration.fast` (provisional: ~180ms) |
| Easing token | `motion.easing.ease-in` (provisional: `cubic-bezier(0.4, 0.0, 1.0, 1.0)`) |
| Reduced motion | Opacity only |
| Accessibility | Focus returns to the trigger element |
| DS components | Toast, planned Dialog/Modal |

### `toast-appear`

| Aspect | Value |
|---|---|
| Trigger | Programmatic (system notification, action confirmation) |
| Properties animated | `transform: translateY` (from -16px to 0), `opacity` (0 to 1) |
| Duration token | `motion.duration.base` |
| Easing token | `motion.easing.ease-out` |
| Auto-dismiss | After `5s` default (configurable). Animation reverses on dismiss. |
| Reduced motion | Opacity only |
| Accessibility | `role="status"` for non-urgent, `role="alert"` for urgent. Live region polite/assertive. |
| DS components | Toast |

### `optimistic-save`

| Aspect | Value |
|---|---|
| Trigger | User commits a change (button click, blur) |
| Properties animated | Subtle background flash on the saved element (success colour, 1-step palette shift) |
| Duration token | `motion.duration.base` for the flash; `motion.duration.fast` for fade-out |
| Easing token | `motion.easing.ease-out` |
| Failure behaviour | If save fails, revert and play `quality.error-shake` (planned) on the element |
| Reduced motion | Replace with a static success tint that fades over `motion.duration.slow` |
| Accessibility | Announce success via `aria-live="polite"` |
| DS components | Input (planned), Form fields (planned) |

### `in-place-edit`

| Aspect | Value |
|---|---|
| Trigger | Click on an editable label |
| Properties animated | Background fade (transparent → input surface), padding shift to align with input field |
| Duration token | `motion.duration.fast` |
| Easing token | `motion.easing.ease-out` |
| Commit | On blur or Enter: optimistic-save pattern |
| Cancel | On Escape: revert without animation |
| Reduced motion | No transform; only background fade |
| Accessibility | Editable state has `contenteditable` or replaces with a real `<input>`. Label is associated. |
| DS components | not yet implemented |

### `sheet-drag`

| Aspect | Value |
|---|---|
| Trigger | Touch drag on the sheet handle, or upward swipe |
| Properties animated | `transform: translateY` follows finger; on release, snap to nearest detent |
| Duration token | While dragging, no duration (1:1 with finger). Snap animation: `motion.duration.base` |
| Easing token | Snap uses `motion.easing.ease-out` |
| Detents | Standard: collapsed (16px peek), half (50% screen), full (100% minus safe area) |
| Reduced motion | Snap instantly between detents, no animation |
| Accessibility | Drag handle has `role="button"` and a label. Keyboard alternative: arrow keys move between detents. |
| DS components | not yet implemented |

### `list-reorder`

| Aspect | Value |
|---|---|
| Trigger | Touch-and-hold or keyboard activation on a list item |
| Properties animated | Lifted item: `transform: scale(1.02), box-shadow` step up. Other items: `transform: translateY` to make space. |
| Duration token | `motion.duration.fast` (per swap) |
| Easing token | `motion.easing.ease-in-out` |
| Reduced motion | No scale, no shadow change. Swap is instant. |
| Accessibility | Keyboard: arrow keys move the focused item. Announce via `aria-live`. |
| DS components | not yet implemented |

### `chip-toggle`

| Aspect | Value |
|---|---|
| Trigger | Click |
| Properties animated | Background colour (interactive → selected), text colour, optional icon scale-in |
| Duration token | `motion.duration.fast` |
| Easing token | `motion.easing.ease-out` |
| Reduced motion | Colours only, no icon scale |
| Accessibility | `aria-pressed` toggles |
| DS components | Chip |

### `hover-feedback`

| Aspect | Value |
|---|---|
| Trigger | Mouse pointer enters interactive element |
| Properties animated | Background fill, optional border, optional shadow (1 step in palette) |
| Duration token | `motion.duration.instant` |
| Easing token | `motion.easing.linear` |
| Reduced motion | No reduction; hover feedback is fast and short already |
| Accessibility | Mouse-only feedback; keyboard users get `focus-visible` instead |
| DS components | Button, IconButton, Link, Chip, all interactive primitives |

### `focus-ring-appear`

| Aspect | Value |
|---|---|
| Trigger | Keyboard navigation to the element (`focus-visible` matches) |
| Properties animated | Outline / ring opacity 0 → 1, optional ring scale (0.95 → 1.0) |
| Duration token | `motion.duration.instant` |
| Easing token | `motion.easing.ease-out` |
| Reduced motion | Opacity only, no scale |
| Accessibility | Critical pattern. Must be visible against all surfaces (cross-check via `ui/a11y-check.md`). |
| DS components | All interactive primitives |

## Output Contract

```markdown
# Interaction Pattern — <pattern-name>

> Resolved from: <user input>
> Context: <web | ios |>
> Mode: <live | scaffolded>
> Token snapshot: <git sha>

## Card

| Aspect | Value |
|---|---|
| Trigger | ... |
| Properties animated | ... |
| Duration | <token path> resolves to <ms or "provisional Xms"> |
| Easing | <token path> resolves to <curve or "provisional curve"> |
| Reduced motion | ... |
| Accessibility | ... |
| DS components implementing this | ... |

## Implementation hint (<context>)

A short snippet showing the CSS / Swift / Kotlin / Compose for the pattern.

## Caveats / open questions

If the pattern is partial (missing iOS/Android equivalent, undocumented edge cases), list them.

## Related patterns

Cross-links to adjacent patterns the user might want next.

## Provenance

- Skill version: <semver>
- Tokens snapshot: <sha>
- Motion-tokens mode: <live | scaffolded>
```

## Error Handling

* **Pattern name not in catalogue.** Suggest the three closest names by intent. Note as candidate for a new pattern.
* **User asks for a custom variation (e.g. "modal open but slower").** Return the standard pattern and surface as `warning`: "do not customise standard patterns; if a different speed is genuinely needed, propose a new pattern via governance".
* **Cross-platform asymmetry.** When the iOS or Android equivalent is documented differently, surface both and note the divergence rationale (or "no documented rationale, candidate for alignment").

## Composition

* `compose_after`: `motion/motion-tokens`
* `compose_before`: `ui/motion-review`, `motion/prototype-spec`, `handoff/frame-to-spec`
* `calls`: `motion/motion-tokens`, `discovery/token-lookup`

## Related Skills

* `./motion-tokens.md` — the token lookup this skill leans on
* `./prototype-spec.md` — describes a *new* motion in spec terms; this skill describes the *standard* version
* `../ui/motion-review.md` — enforces these patterns

## Status note

`status: scaffold` until motion tokens are live. The patterns above are stable in *structure*; specific token values resolve to provisional industry-standard values until live.
