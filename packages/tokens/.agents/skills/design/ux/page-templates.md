---
name: page-templates
description: The page-level layout templates for brand experiences. Article, section front, media, account and settings, and game hub, each expressed on the DS responsive grid (Small, Medium, Large, XLarge viewports). Grounded in the grid reference and the design corpus. Tells a new full-page screen how to sit on the grid before it fills in content.
license: MIT
metadata:
  category: design/ux
  pillar: ux
  agents: [Designer, PM, Design Engineer]
  autonomy: autonomous
  portable: true
  cadence: weekly
  mcp_tool: ux_page_templates
---

# Page Templates

## Purpose

`ux/flow-design` decides a screen should be a full page. This skill decides how that page sits on the grid: how many columns, where the reading measure sits, how it reflows across viewports. It is the bridge between a flow and a real layout, expressed in the DS grid system rather than in arbitrary pixels.

Templates are starting points, not straitjackets. They encode the layouts your brand already uses so a new page inherits the product's rhythm instead of reinventing it.

## Preconditions

1. `foundation/design-dna` and `ux/experience-principles` loaded as preamble.
2. The grid reference is the source of truth for columns and spacing: `packages/tokens/docs/reference/grid.md` (marked BETA) and the `viewport/*` token sets. Verify current values via `discovery/token-lookup` rather than trusting numbers memorised here.
3. Corpus `distilled/layout-patterns.md` is cited where it has evidence.

## Inputs

* `template` — `article` | `section-front` | `media` | `account` | `game-hub` | `all`. Default `all` (list) or the one named.
* `viewport` — optional focus: `small` | `medium` | `large` | `xlarge`.

## The grid, briefly

Four viewports, columns increasing with width. Verify live values with `discovery/token-lookup` on the `grid` and `viewport/*` sets; the reference documents them and the token set is authoritative.

| Viewport | Columns | Notes |
|---|---|---|
| Small | 4 | phone; single column of content, list-first |
| Medium | 12 | tablet |
| Large | 10 or 12 | **known drift**: `grid.md` documents 10, `tokens.json` has 12. Confirm before building; tracked in `ui/monthly-audit` Known drift. |
| XLarge | 12 | wide desktop |

Reading measure: body text never wider than about 8 columns / 60–75 characters (`DS-TYP-07`). Gutters and margins come from the grid tokens; spacing between sections uses fluid spacing (`spacing.fluid.*`, which scales by the viewport multiplier), spacing inside components uses static (`spacing.static.*`). This is the editorial-rhythm principle made concrete (DNA principle 3).

## The templates

### Article

The reading page; the product's centre.
**Layout.** Single reading column centred, max ~8 columns for the measure. Hero image full content-width above or beside the headline block. Related/UpNext rail below the article on Small/Medium, optionally beside it on Large/XLarge if the measure is preserved.
**Reflow.** Small: one column, rail stacks below. Large/XLarge: reading column stays ~8 cols even as the page widens; extra width becomes margin, not longer lines.
**Anatomy source.** `ux/pattern-library` → article anatomy. Evidence: `layout-patterns.md#article-template`.

### Section front

A topic landing page: a curated list of articles.
**Layout.** A lead block (one large card, full or 8-column) then a grid of cards. Card grid: 1-up on Small, 2–3-up on Medium, 3–4-up on Large/XLarge. An ad slot (`AdContainer`) at documented intervals, never mid-card.
**Reflow.** Cards reflow by column count; the lead card spans full width on Small, a larger span on wide viewports. Density holds — cards keep a consistent internal rhythm.
**Evidence.** `layout-patterns.md#section-front`.

### Media (gallery / video)

Image- or video-led pages.
**Layout.** Media dominant, using fixed aspect ratios (`Image` component ratios). Caption and credit below in `brand-byline-*`. Galleries are a horizontal or grid set with a clear position indicator; video uses the product player chrome.
**Reflow.** Media scales to content width; captions keep the reading measure. On Small, galleries are swipeable with a visible count.
**Accessibility.** Every media item has alt or a caption; galleries are keyboard-navigable; autoplay respects reduced-motion and is muted.
**Evidence.** `layout-patterns.md#media`.

### Account and settings

Utility pages: profile, subscription, preferences.
**Layout.** A single narrow column of grouped settings (a settings list of rows: label, current value, control). Section headings group related settings. On Large/XLarge an optional left nav lists the setting groups; content stays a readable single column, not stretched full-width.
**Reflow.** Small: stacked, nav becomes a top list or accordion. The content column never widens past comfortable reading.
**States.** In-place edit (`motion/interaction-patterns` → `in-place-edit`), optimistic save with Toast confirmation, InlineMessage for validation.
**Copy.** Plain, `core` tokens. Microcopy via `ux/microcopy`.
**Evidence.** `ux-patterns/onboarding.md`, `layout-patterns.md#account`.

### Game hub

The games landing: a warmer, more playful surface within the brand frame.
**Layout.** A grid of game entry cards (crossword, sudoku, etc.), each with title, difficulty, and a play action. A "continue where you left off" block at top when there is progress.
**Reflow.** Card grid by column count as section front; the continue block spans wide.
**Tone.** A warmer, more interactive tone is on-brand here — still on-brand, not a games app (DNA: playful but restrained).
**States.** Progress persistence, locked-until-subscribed entries marked with `Label` (subscriber pattern), completed state.
**Evidence.** `layout-patterns.md#game-hub`.

## Output Contract

Listing mode returns template names with one-line summaries. Single-template mode returns the full template with a per-viewport reflow table:

```markdown
# Page template — <name>

> Grid source: grid.md + viewport/* tokens
> Corpus evidence: <vN or none>

## Layout
<the column structure and measure>

## Reflow

| Viewport | Columns | Layout |
|---|---|---|
| Small | 4 | ... |
| Medium | 12 | ... |
| Large | 10/12 (confirm) | ... |
| XLarge | 12 | ... |

## Components and patterns
<DS components; links to ux/pattern-library cards>

## Notes
<states, known drift>
```

Followed by:

```json
{
  "skill": "design/ux/page-templates",
  "template": "<name or all>",
  "grid_verified": <true|false>,
  "known_drift": ["grid Large columns 10 (docs) vs 12 (tokens)"],
  "evidence": { "corpus_version": "<vN or null>" }
}
```

## Error Handling

* **Grid values uncertain.** Do not guess. Look them up via `discovery/token-lookup` on the `grid`/`viewport` sets; if still ambiguous (the Large-column drift), present both and flag for confirmation.
* **Template does not fit the screen.** Say so and route to `ux/flow-design` to shape a new layout from prior art; propose adding it here once validated.
* **Content would break the reading measure.** The measure wins (`DS-TYP-07`); widen margins, not lines.
* **Corpus empty.** Templates stand on the grid reference and the DNA; mark evidence "none yet".

## Composition

* `compose_after`: `design/foundation/design-dna`, `design/ux/experience-principles`, `design/ux/flow-design`
* `compose_before`: `design/ui/design-critique`, `design/handoff/frame-to-spec`
* `calls`: `discovery/token-lookup`, `design/foundation/corpus-guide`

## Related skills

* `./flow-design.md` — decides which screens are full pages
* `./pattern-library.md` — the patterns that fill these templates
* `../ui/state-matrix.md` — the states each template's components need
* `packages/tokens/docs/reference/grid.md` — the grid source of truth (BETA)
