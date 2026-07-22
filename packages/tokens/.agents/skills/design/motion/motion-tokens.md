---
name: motion-tokens
description: Reference and lookup skill for Design System motion tokens (durations, easings, named transitions). Mirrors reference/token-reference-fast-path but for motion. Returns deterministic tables for "which duration", "which easing", "which named transition" queries. Currently scaffolded; will be fully active once motion tokens land in tokens.json.
license: MIT
metadata:
  category: design/motion
  pillar: motion
  agents: [Designer, Design Engineer, Architect, Code]
  autonomy: autonomous
  portable: true
  cadence: daily
  status: scaffold
---

# Motion Tokens (reference)

## Purpose

Give designers and design engineers a single place to look up the right motion token for the moment. Same pattern as `reference/token-reference-fast-path.md`, just for motion instead of colour and spacing.

This skill is currently *scaffolded*. The DS motion tokens are pending definition (see Open Questions in `design/README.md`). Once those tokens land in `packages/tokens/src/tokens.json`, the skill is fully live and the placeholders below are filled in. Until then, the skill returns the closest "what the token will be" guidance and clearly marks responses as provisional.

## Preconditions

1. Design System Tokens MCP is running.
2. The user request is reference-only ("which duration for a modal", "what easing for a hover", "list all motion tokens").
3. The intent does not require *creating* motion tokens. Token creation is governed by `governance/token-modification-gates.md`.

## Inputs

Required:

* `intent` — natural language motion intent (e.g. "modal open duration", "hover easing", "list named transitions").

Optional:

* `category` — `duration` | `easing` | `named-transition`. When set, narrows the search.
* `result_cap` — fixed result cap (default 15) for noisy queries.

## Procedure

### Step 1: Determine readiness

Query the token MCP for the presence of motion-category tokens:

```
search_tokens(intent="motion duration", category="number")
search_tokens(intent="motion easing", category="cubic-bezier")
search_tokens(intent="motion transition", category="transition")
```

If results are empty, the motion tokens have not yet been defined. The skill returns the **scaffolded response** in step 3.

If results are present, proceed to step 2.

### Step 2: Live response (active once motion tokens exist)

For the live mode, the skill returns deterministic grouped tables.

**Duration tokens** are expected to follow a small set of named scales:

| Intent | Expected token path | Use for |
|---|---|---|
| instant feedback | `motion.duration.instant` | hover background tint change, focus ring fade-in |
| fast | `motion.duration.fast` | small icon transitions, chip toggle |
| base | `motion.duration.base` | button state changes, dropdown open |
| slow | `motion.duration.slow` | modal open, sheet slide |
| slower | `motion.duration.slower` | page transition, hero reveal |

**Easing tokens** are expected to follow a small set of curves:

| Intent | Expected token path | Use for |
|---|---|---|
| linear | `motion.easing.linear` | progress indicators, opacity fades |
| ease-out | `motion.easing.ease-out` | entering elements (modal, toast) |
| ease-in | `motion.easing.ease-in` | exiting elements (dismiss, close) |
| ease-in-out | `motion.easing.ease-in-out` | continuous transitions (carousel, drawer) |
| emphasised | `motion.easing.emphasised` | hero moments, attention-grabbing transitions |

**Named transitions** are expected to package duration + easing for common interactions:

| Intent | Expected token path | Resolves to |
|---|---|---|
| hover | `motion.transition.hover` | `duration.instant + easing.linear` |
| modal-open | `motion.transition.modal-open` | `duration.slow + easing.ease-out` |
| modal-close | `motion.transition.modal-close` | `duration.fast + easing.ease-in` |
| sheet-drag | `motion.transition.sheet-drag` | `duration.base + easing.ease-out` |
| page-transition | `motion.transition.page` | `duration.slower + easing.emphasised` |

Cross-check live values with `token_lookup` for the exact resolved value.

### Step 3: Scaffolded response (current mode)

While motion tokens are not yet defined, the skill returns:

```
DS motion tokens are not yet defined in tokens.json.
This skill is operating in scaffolded mode.

Suggested provisional values for <intent>:
- Duration: <X>ms (sourced from industry standards / Anthropic/Material/Apple HIG)
- Easing: <cubic-bezier()> (industry standard for this intent)
- Named transition: not yet defined

When motion tokens land, the actual token path will be <expected-path-from-the-tables-above>.
```

The provisional values are *strongly* labelled as provisional and not for production use. They are guidance to the designer about what the token will likely be, not a stand-in.

### Step 4: Audit motion-token coverage (informational)

For any query that hits the scaffolded response, the skill notes:

* The motion intent that was queried.
* The expected token path.

These are aggregated in `.design/motion-token-requests.log` for prioritisation when motion tokens are defined. Frequency of request = priority.

## Output Contract

### Live mode

```markdown
# Motion Token Lookup — <intent>

> Mode: live
> Tokens snapshot: <git sha>

| Category | Token path | Value | Use for |
|---|---|---|---|
| duration | `motion.duration.base` | 200ms | <use-for column from table> |
| easing | `motion.easing.ease-out` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | <use-for> |

## Compound transition (if named-transition exists)

`motion.transition.modal-open` resolves to:
- duration: 320ms (`motion.duration.slow`)
- easing: `cubic-bezier(0.0, 0.0, 0.2, 1)` (`motion.easing.ease-out`)

## Provenance

- Tokens snapshot: <sha>
- Skill version: <semver>
```

### Scaffolded mode

```markdown
# Motion Token Lookup — <intent>

> Mode: scaffolded (motion tokens not yet defined)
> Status: provisional values only, not for production code

## Provisional guidance for "<intent>"

- Duration: ~<X>ms (industry standard)
- Easing: `<cubic-bezier()>` (industry standard for this intent)
- Reduced-motion behaviour: <"replace with crossfade" | "remove animation" | "use longer duration">

## Expected token path (once defined)

`motion.duration.<scale>` and `motion.easing.<curve>`, or `motion.transition.<name>` if compound.

## Request logged

This query has been added to the motion-token coverage log at `.design/motion-token-requests.log`.

## Provenance

- Skill version: <semver>
- Mode: scaffolded
```

## Error Handling

* **Token MCP unavailable.** Stop. The skill needs the MCP for the readiness check.
* **Empty result with non-empty motion category.** Treat as scaffolded mode but note the inconsistency. Surface as `info`.
* **Intent ambiguous between categories.** Return separate tables per category rather than guessing.
* **Request implies token creation.** Refuse and redirect to `governance/token-modification-gates.md`.

## Composition

* `compose_after`: none
* `compose_before`: `ui/motion-review`, `motion/interaction-patterns`, `motion/prototype-spec`, `handoff/frame-to-spec` (for motion sections of spec)
* `calls`: `discovery/token-lookup`, `discovery/semantic-token-search`

## Related Skills

* `../../reference/token-reference-fast-path.md` — the colour/spacing equivalent of this skill
* `./interaction-patterns.md` — uses the tokens this skill returns
* `./prototype-spec.md` — uses the tokens this skill returns
* `../ui/motion-review.md` — enforces the tokens this skill returns

## Status note

This skill is `status: scaffold` in metadata. When motion tokens land in `tokens.json`:

1. Confirm token category names match the tables in step 2.
2. Update `status: scaffold` to `status: active`.
3. Remove this status note.
