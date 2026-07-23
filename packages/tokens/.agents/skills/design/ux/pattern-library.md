---
name: pattern-library
description: The catalogue of brand experience patterns, one altitude above component-level interaction patterns. Navigation, content lists and cards, article anatomy, forms and auth, paywall and subscriber touchpoints, empty/error/loading, and live-updating content. Each pattern names when to use it, its anatomy in DS components, content and state rules, accessibility and motion, and links down to motion/interaction-patterns and the corpus.
license: MIT
metadata:
  category: design/ux
  pillar: ux
  agents: [Designer, PM, Design Engineer]
  autonomy: autonomous
  portable: true
  cadence: weekly
  mcp_tool: ux_patterns
---

# Pattern Library

## Purpose

`motion/interaction-patterns` catalogues component-level motions (modal-open, toast-appear, sheet-drag). This skill sits one altitude up: the *experience* patterns that recur across brand journeys — how a list of articles is built, how a paywall touchpoint behaves, how a live-updating feed works. When `ux/flow-design` needs "the house way to do a content list", it comes here rather than inventing one.

Every pattern is assembled from existing DS components and existing interaction patterns. This library names the assembly, not new primitives. Where a pattern needs something DS does not have, it says so and points at governance.

## Preconditions

1. `foundation/design-dna` and `ux/experience-principles` are loaded as preamble.
2. Component reality is checked against `packages/tokens/docs/components/` (some components are docs-only: Banner, InlineMessage, Tooltip, Label, Image).
3. Corpus evidence, where it exists, is cited per `foundation/corpus-guide`.

## Inputs

* `pattern` — optional: name one pattern to return in full. Default: list all with one-line summaries.
* `context` — optional surface to tailor the guidance.

## How to read a pattern card

Each card has: **When to use** · **Anatomy** (DS components) · **Content rules** · **States** · **Accessibility** · **Motion** (→ `motion/interaction-patterns`) · **Evidence** (corpus / Mobbin). Cards are guidance, not law; the DNA and the rules outrank them.

## The patterns

### Navigation and wayfinding

**When to use.** Any experience that spans more than one view, or sits inside the product's global chrome.
**Anatomy.** Global masthead (product chrome, not redesigned per feature) · section navigation · in-page anchors for long reads · a persistent way back (experience-principle 5). Breadcrumbs only where the hierarchy is genuinely deep.
**Content rules.** Section labels use the `Label` component; never invent a nav label that is not a real section. British English, full names.
**States.** Current location is always marked (`aria-current`). Loading nav is rare; render it statically.
**Accessibility.** Nav is a landmark; the current item carries `aria-current="page"`; skip-to-content is present on full pages.
**Motion.** None on the nav itself beyond `hover-feedback` (instant). Route transitions are calm (DNA: motion is invisible).
**Evidence.** `design-corpus/distilled/ux-patterns/navigation-search.md` when populated.

### Content lists and cards

**When to use.** Any surface presenting multiple articles, events, or items — the core of a news product.
**Anatomy.** A repeating card: optional `Image` (fixed ratio, usually 3:2 or 16:9) · optional `Label` (section) · headline (`brand-heading-*`) · optional standfirst (`brand-standfirst-*`) · byline/timestamp (`brand-byline-*`) · optional `Flag` (LIVE, UPDATED). Lists compose cards on the grid (`ux/page-templates`).
**Content rules.** One headline per card. Standfirst is optional and short. Timestamps are relative for recent, absolute beyond a day. No clickbait — brand headlines are direct.
**States.** Loading = skeleton cards matching the final layout. Empty = a quiet line, never a blank grid. Variable text lengths must not break the card (design-critique density rules).
**Accessibility.** The whole card is one link with an accessible name from the headline; nested links (byline author) are separate, not overlapping targets. Image alt from the caption or marked decorative.
**Motion.** `hover-feedback` only. No scroll-reveal on every card (DNA anti-pattern).
**Evidence.** `layout-patterns.md#card-anatomy` (corpus vN) when populated.

### Article anatomy

**When to use.** The reading experience itself — the product's centre of gravity.
**Anatomy.** `Label` (section) → headline (`brand-heading-fluid-*`) → standfirst → byline + timestamp → hero `Image` → body (`brand-paragraph-*`, 60–75 char measure) → inline `Link`s (brand sentiment) → pull quotes, inline `Flag`s → related/UpNext rail → comments (or `CommentsDisabled`).
**Content rules.** Reading measure held at 8 columns max.
**States.** Paywall/register interpose per the subscription pattern below. Comments have their own loading/empty/disabled states.
**Accessibility.** One `h1`; heading levels sequential (`DS-TYP-02`); body at or above the minimum body token.
**Motion.** Minimal. No hero scroll theatrics on news (DNA anti-pattern `DS-MOT-06`).
**Evidence.** `layout-patterns.md#article-template`, `ux-patterns/reader-journey.md`.

### Forms and authentication

**When to use.** Sign-in, register, subscribe, account settings, comment composer.
**Anatomy.** `Input` (label always visible, never placeholder-as-label) · inline validation via `InlineMessage` (docs-only — flag the gap) · primary `Button` (one per step) · `Link` for secondary paths (forgot password). Multi-step forms show "Step n of m".
**Content rules.** Labels are nouns, plain. Errors say what and how to fix, no blame. Microcopy authored via `ux/microcopy`, checked by `ui/content-style-check`.
**States.** Field-level: default, focus, error, disabled. Form-level: loading (submit), success (Toast + advance), error (InlineMessage or Banner). Empty is the default form.
**Accessibility.** Every input has a programmatic label; errors are associated (`aria-describedby`); focus moves to the first error on submit; 44px targets.
**Motion.** `optimistic-save` where safe; `in-place-edit` for settings; focus ring appears instantly.
**Evidence.** `ux-patterns/onboarding.md`.

### Paywall and subscriber touchpoints

**When to use.** Article limits, premium sections, subscriber-exclusive content and events.
**Anatomy.** An interposed panel or full page (modality per experience-principle 1): value proposition (one line) · plan options (`Chip` or cards) · primary `Button` (subscribe) · a plainly visible exit `Link` · subscriber-exclusive markers use `Label`, not flashing badges.
**Content rules.** Experience-principle 4 governs: state the value once, name why the wall appeared, always show the exit. No countdown urgency, no fake scarcity, no guilt. Directness is the brand.
**States.** Logged-out vs registered-not-subscribed vs subscriber differ; design all three. Error on payment uses Banner/InlineMessage, never a dead end.
**Accessibility.** If modal, focus-trapped with a real close; never a wall with no keyboard exit.
**Motion.** `modal-open` if modal; otherwise a calm page transition. Nothing celebratory.
**Evidence.** `ux-patterns/paywall-subscription.md`.

### Empty, error and loading (the state trio)

**When to use.** Every screen. This is not optional (experience-principle 3, `DS-UX-02`).
**Anatomy.** Loading = skeletons matching final layout (structure solid, content shimmer on `surface-level-2`). Empty = one quiet line + one way forward. Error = messaging framework by criticality (Banner page-level, InlineMessage in-flow, Toast transient) with specific, recoverable copy.
**Content rules.** No jokes, no mascots, no "Oops!" (DNA: friendly copy and borrowed identity are anti-patterns). Say what happened and what to do.
**Accessibility.** Errors announced (`role="alert"` / `status`); loading regions marked `aria-busy`; empty states are readable text, not just an image.
**Motion.** Skeleton shimmer is subtle and respects reduced-motion. Error appearance is instant, not animated.
**Evidence.** across all `ux-patterns/*`.

### Live-updating content

**When to use.** Live blogs, election results, sports commentary, breaking-news feeds — new content arriving while the reader watches.
**Anatomy.** A reverse-chronological feed of entries (each a small card: timestamp, `Flag` LIVE/UPDATED, headline, body) · a non-disruptive "new posts" affordance rather than auto-jumping the scroll · a pinned summary/key-points block at top · optional filter `Chip`s (all / goals / analysis).
**Content rules.** Timestamps on every entry, relative and precise. LIVE `Flag` while active; switch to a clear "ended" state when over. Key points stay pinned and current.
**States.** Loading = skeleton entries. Empty (pre-first-post) = "Live coverage begins at <time>". New content = a count affordance the reader taps to reveal (never yank their scroll). Ended = banner marking the blog closed, feed frozen. Error/reconnect = quiet InlineMessage, keep last-good content.
**Accessibility.** New content in an `aria-live="polite"` region so it is announced without stealing focus; never `assertive` for a feed. The "new posts" control is a real button. Respect reduced-motion: no auto-animating insertions.
**Motion.** New entries insert calmly (`list-reorder`/insert, opacity + short slide), gated on reduced-motion and on the reader opting to reveal. No flashing, no bounce (DNA `DS-MOT-06`).
**Evidence.** `ux-patterns/live-blog.md` when populated; Mobbin live-feed prior art.

## Output Contract

Listing mode returns the pattern names with one-line summaries. Single-pattern mode returns the full card. Both end with:

```json
{
  "skill": "design/ux/pattern-library",
  "patterns": ["navigation", "content-lists-cards", "article-anatomy", "forms-auth", "paywall-subscriber", "state-trio", "live-updating"],
  "returned": "<pattern name or 'all'>",
  "component_gaps": ["InlineMessage (docs-only)", "Banner (docs-only)", "..."],
  "evidence": { "corpus_version": "<vN or null>" }
}
```

## Error Handling

* **Pattern not in the library.** Say so. Recommend `ux/flow-design` to design it from prior art, and note it as a candidate to add here once validated.
* **Pattern needs a docs-only or missing component** (InlineMessage, Banner, Modal). Name the gap and route to governance; do not pretend the component ships.
* **Corpus empty.** Cards stand on the DNA and Mobbin; mark evidence "none yet".
* **A pattern would violate a principle** (e.g. a paywall with no exit). The principle wins; correct the card usage.

## Composition

* `compose_after`: `design/foundation/design-dna`, `design/ux/experience-principles`
* `compose_before`: `design/ux/flow-design`, `design/ux/page-templates`, `design/ui/design-critique`
* `calls`: `motion/interaction-patterns`, `design/foundation/corpus-guide`

## Related skills

* `../motion/interaction-patterns.md` — the component-level motions these patterns use
* `./flow-design.md` — assembles these patterns into a journey
* `./page-templates.md` — the page layouts these patterns sit within
* `./microcopy.md` — the copy inside these patterns
