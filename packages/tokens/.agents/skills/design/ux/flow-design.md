---
name: flow-design
description: Turn an experience brief into a designed flow for a new brand experience. Loads the DNA and experience principles, grounds the flow in prior art (Mobbin plus the design corpus), then produces a FLOW.md with the screen sequence, states, decision points, component mapping and open questions. The entry skill for the new-experience route. Composes into page-templates, design-critique and handoff.
license: MIT
metadata:
  category: design/ux
  pillar: ux
  agents: [Designer, PM, Design Engineer]
  autonomy: autonomous
  portable: true
  cadence: weekly
  mcp_tool: ux_flow_design
---

# Flow Design

## Purpose

The starting point when a designer says "we need a new X" and X does not exist yet in the Design System — a live-blog, an events landing page, an onboarding flow, a saved-articles experience. This skill takes the brief and produces a grounded, brand-shaped flow: the sequence of screens, the states each screen needs, the decisions the reader makes, and the DS components and patterns that build it. It does not draw pixels; it produces the flow document that a prototype or a Figma exploration is then built from.

It is deliberately grounded, not generative. Before proposing anything it looks at how the rest of the industry solves the pattern (Mobbin) and how your brand already solves adjacent ones (the corpus). New brand experiences are assembled from prior art and existing components, not invented from a blank page.

## Preconditions

1. `foundation/design-dna` (tldr) and `ux/experience-principles` are loaded as preamble.
2. `reference/mobbin-mcp` is reachable for prior-art grounding. If Mobbin is not authenticated, the flow still runs but records the gap and marks pattern choices provisional.
3. `foundation/corpus-guide` is available; if the corpus has relevant `distilled/ux-patterns/*` evidence, it is cited.
4. The brief names, at minimum, what the reader is trying to do. Everything else can be inferred and surfaced as an open question.

## Inputs

Required:

* `experience_brief` — what the new experience is, in plain language.

Optional:

* `journey` — a slug matching a corpus `ux-patterns/*` doc when one fits (`reader-journey`, `paywall-subscription`, `onboarding`, `live-blog`, `navigation-search`) or a new slug.
* `surfaces` — `web` | `ios` | `android` | list. Default `web` first, note native divergence.
* `output_path` — defaults to `.design/<feature>/FLOW.md`.

## Procedure

### Step 1: Load the preamble

Load `foundation/design-dna` (tldr) and `ux/experience-principles` (all lenses). Everything below is shaped by them, especially the modality heuristic and the state-completeness principle.

### Step 2: Frame the reader task

State, in one sentence, what the reader is trying to accomplish and in what context (mid-article? logged out? on mobile?). Name the primary task and any secondary tasks. If the brief implies a conversion goal (subscribe, register), name it too, and bind it to experience-principle 4 (subscription dignity) so it does not become a dark pattern.

### Step 3: Ground in prior art (mandatory)

* **Mobbin.** Query `reference/mobbin-mcp` for the closest shipped patterns (for a live-blog: live-updating feeds, sports commentary, news tickers). Capture what works and what to avoid. This step is mandatory per the Mobbin mandate; if Mobbin is unavailable, record "prior art not consulted (Mobbin unauthenticated)" and lower confidence.
* **Corpus.** Check `design-corpus/distilled/ux-patterns/<journey>.md` and `layout-patterns.md` for how your brand already handles this or an adjacent journey. Cite per `foundation/corpus-guide` (`... (corpus vN)`). If the corpus is empty for this journey, note it and proceed on the DNA and Mobbin.

### Step 4: Choose the modality and shape

Using experience-principle 1, decide the top-level shape: is this a page, a flow of pages, a sheet over an existing page, a section within a page? Justify the choice.

### Step 5: Map the screen sequence

List the screens or states in order. For each:

* **Name and purpose** — one line.
* **Entry** — how the reader arrives.
* **Content** — what is on it, at a hierarchy level (lead / supporting / metadata), not pixel detail.
* **Actions** — primary and secondary, mapped to components (Button, Link, Chip...).
* **Exits** — where the reader can go, including the way back (principle 5).

Then the decision points between screens: what the reader chooses, and what each choice leads to. A simple text flow diagram is enough.

### Step 6: State completeness pass

For every screen, apply experience-principle 3. Enumerate its loading, empty, error, success and edge states, mapped to the messaging framework (Banner / InlineMessage / Toast / Tooltip) and the interaction patterns. A screen with only a happy-path definition is incomplete; flag it.

### Step 7: Component and pattern mapping

For each screen and state, name the DS components and interaction patterns that build it. Split into:

* **Exists** — DS components used as-is.
* **Composition** — new arrangements of existing primitives (no new component needed).
* **Gap** — genuinely new components or patterns. These need governance approval (`governance/token-modification-gates`) and must be called out, not quietly assumed. Cross-check against the component contracts in `packages/tokens/docs/components/` and the "docs-only" components (Banner, InlineMessage, Tooltip, Label, Image) that exist on paper but not yet in code.

### Step 8: Write the flow and open questions

Render `FLOW.md` (Output Contract). End with the open questions the brief could not answer — the decisions a human must make before this becomes a prototype.

### Step 9: Hand on

Recommend the next skills: `ux/page-templates` for any full-page screens, `ui/design-critique` once a prototype exists, `handoff/handoff-flow` when the direction is settled. The flow is the input to all three.

## Output Contract

```markdown
# Flow — <Experience name>

> Brief: <one line>
> Surfaces: <list>
> Journey: <slug> · Corpus evidence: <vN or "none">
> Prior art: <Mobbin consulted | not consulted>
> Generated: <date> · Tokens snapshot: <git sha>

## Reader task

<one paragraph: who, doing what, in what context, with what conversion goal if any>

## Shape and modality

<the top-level decision and why, per experience-principle 1>

## Screen sequence

### 1. <Screen name>
- Purpose · Entry · Content (by hierarchy) · Actions (→ components) · Exits

### 2. ...

## Decision points

<reader choices between screens, as a simple flow>

## States (per screen)

| Screen | Loading | Empty | Error | Success | Edge |
|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... |

## Component and pattern map

- Exists: <DS components used as-is>
- Composition: <new arrangements of primitives>
- Gap (needs governance): <new components/patterns>

## Prior art and evidence

- Mobbin: <what was learned / "not consulted">
- Corpus: <citations (corpus vN) / "none yet">

## Open questions

1. ...
```

Followed by:

```json
{
  "skill": "design/ux/flow-design",
  "feature": "<slug>",
  "screens": <n>,
  "gaps": ["<new component/pattern>", "..."],
  "prior_art": { "mobbin": <true|false>, "corpus_version": "<vN or null>" },
  "artifacts": [".design/<feature>/FLOW.md"],
  "next": ["design/ux/page-templates", "design/ui/design-critique", "design/handoff/handoff-flow"]
}
```

## Error Handling

* **Brief too thin to shape.** Produce what you can, then make the missing decisions explicit as open questions. Do not invent product intent.
* **Mobbin unavailable.** Proceed, record the gap, mark pattern choices provisional, lower confidence in the summary.
* **Corpus empty for the journey.** Note it and lean on the DNA and Mobbin. Never fabricate a corpus citation.
* **Brief implies a dark pattern** (forced urgency, hidden exit, trap). Refuse that part, cite experience-principle 4, and design the honest version.
* **The experience already exists in DS.** Stop and redirect: this is a `ui-craft` or `handoff` task, not a new experience. Route back through `design-router`.

## Composition

* `compose_after`: `design/foundation/design-dna`, `design/ux/experience-principles`, `reference/mobbin-mcp`, `design/foundation/corpus-guide`
* `compose_before`: `design/ux/page-templates`, `design/ux/pattern-library`, `design/ui/design-critique`, `design/handoff/handoff-flow`
* `calls`: `reference/mobbin-mcp`, `design/foundation/corpus-guide`, `discovery/token-lookup`

## Related skills

* `./experience-principles.md` — the journey principles this applies
* `./pattern-library.md` — the reusable experience patterns a flow draws on
* `./page-templates.md` — the page-level layouts a flow's full-page screens use
* `../../reference/mobbin-mcp.md` — cross-product prior art
