---
name: design-rules
description: The Design System rule set. Eight categories of concrete, sourced design rules with IDs, severities and weights. This is the scoring backbone for ui/design-critique and the promotion target for corpus observations. Every rule points at a DS source; no rule is opinion.
license: MIT
metadata:
  category: design/foundation
  pillar: foundation
  agents: [Designer, Design Engineer, PM, QA, Architect]
  autonomy: autonomous
  portable: true
  cadence: daily
  mcp_tool: design_rules
---

# Design Rules

## Purpose

The single, versioned list of what the Design System considers correct, expressed as rules a skill can score against. Eight categories, each rule with a stable ID, a severity, a weight and a source. `ui/design-critique` cites these IDs and turns them into a 0–100 score. The screenshot corpus (`corpus/distill-corpus`) proposes new rules into the Rule candidates section; a human promotes them here.

The discipline, from the Design DNA: **no rule without a source.** Every rule below points at `foundation/design-dna`, `content-styleguide.md`, the token architecture, a sibling skill, or a corpus version. If a rule cannot name its source, it does not belong here.

## Preconditions

1. `foundation/design-dna` is the higher authority on intent; this file operationalises it.
2. On any conflict, `packages/tokens/src/tokens.json` and `content-styleguide.md` outrank this file.

## Inputs

* `category` — optional filter (`TYP` | `COL` | `SPC` | `CMP` | `A11Y` | `UX` | `MOT` | `BRD` | `all`). Default `all`.
* `severity_floor` — optional (`info` | `warning` | `error`). Default `info`.

## Severity and weight

| Severity | Weight | Meaning |
|---|---|---|
| `error` | 5 | Blocks handoff. A clear violation of a system invariant. |
| `warning` | 2 | Should be fixed. A likely problem or a documented smell. |
| `info` | 0 | Worth a human glance. No score impact. |

## Scoring formula

Used by `ui/design-critique` and `ui/monthly-audit`.

1. For each finding, take its rule weight.
2. **Per-category deduction** = sum of weights of findings in that category, **capped at 30**. This stops one noisy category from zeroing the whole score.
3. **Category subscore** = `max(0, 100 − category deduction)`.
4. **Overall score** = `max(0, 100 − Σ(capped category deductions))`, rounded to a whole number.
5. Bands: **90–100** ship-ready · **75–89** minor fixes · **50–74** needs work · **below 50** rework.

Info findings never change the score; they are surfaced for judgement. A frame with no findings scores 100. The score is a servant, not a verdict: the findings are what get fixed.

## The rules

### TYP — Typography and hierarchy

| ID | Rule | Severity | Source | Enforced by |
|---|---|---|---|---|
| DS-TYP-01 | No more than two display type sizes per visible region | error | DNA anti-patterns | design-critique A |
| DS-TYP-02 | Heading levels are sequential; no h1 to h3 jump without an h2 | warning | design-critique A | design-critique A |
| DS-TYP-03 | Body text uses a `brand.paragraph.*` or `utility.body.*` token, not a caption or byline token in a body role | warning | typography system | design-critique A |
| DS-TYP-04 | Type comes from one system; no mixing legacy `editorial*` with `brand.*`/`utility.*` in one frame | error | token architecture; Home page v2 finding | token-mapping-audit |
| DS-TYP-05 | Every text node binds a typography token; no raw font, size or weight | error | token architecture | token-mapping-audit |
| DS-TYP-06 | The lead headline or primary action carries the highest visual weight in its region | warning | DNA principle 2 (hierarchy is the work) | design-critique A |
| DS-TYP-07 | Body copy stays within a readable measure, roughly 60 to 75 characters per line | info | grid reference (reading width) | design-critique A |

### COL — Colour and channels

| ID | Rule | Severity | Source | Enforced by |
|---|---|---|---|---|
| DS-COL-01 | Designs consume semantic tokens only; palette-direct is a smell, foundation-direct is a bug | error | DNA token model | token-mapping-audit |
| DS-COL-02 | No raw hex values; every colour resolves to a DS token | error | token architecture | token-mapping-audit |
| DS-COL-03 | No legacy (`NK-*`) or intermediate-collection bindings | error | Home page v2 finding; migration table | token-mapping-audit |
| DS-COL-04 | Channel is set at section level; components never bind `product.channel.*` directly | error | DNA channels | channel-context |
| DS-COL-05 | No cross-channel mixing of accent and masthead colours | error | DNA anti-patterns | channel-context |
| DS-COL-06 | A frame that reads as a channel declares that channel (channel-implied-but-not-declared) | warning | design-critique F | channel-context |
| DS-COL-07 | No purple gradients on white, or generic gradient decoration | warning | DNA anti-patterns | design-critique |
| DS-COL-08 | Light and dark use the same semantic token; per-mode divergence only on `.channel.*` paths | error | DNA themes 1:1 | light-dark-parity |

### SPC — Spacing and rhythm

| ID | Rule | Severity | Source | Enforced by |
|---|---|---|---|---|
| DS-SPC-01 | All spacing resolves to a DS spacing token (fluid or static) | error | token architecture | token-mapping-audit |
| DS-SPC-02 | Keep to the 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 rhythm; off-scale values (6, 10, 13, 14, 17, 18, 22) are findings | warning | DNA cheat-sheet; design-critique B | design-critique B |
| DS-SPC-03 | Padding is consistent on opposite sides of a container unless there is a documented reason | warning | design-critique B | design-critique B |
| DS-SPC-04 | Gap between siblings is a documented gap token; half-steps are findings | warning | design-critique B | design-critique B |
| DS-SPC-05 | Editorial rhythm follows the type scale, not the grid alone | info | DNA principle 3 | design-critique B |
| DS-SPC-06 | Radii come from the border-radius scale (2 to 16px, plus full) | warning | token architecture | token-mapping-audit |
| DS-SPC-07 | Children align to their auto-layout container's rule; absolute-positioned children carry a documented reason | info | design-critique C | design-critique C |
| DS-SPC-08 | Adjacent text blocks of the same size share a baseline; icons sit on the optical centre of adjacent text | info | design-critique C | design-critique C |

### CMP — Components and reuse

| ID | Rule | Severity | Source | Enforced by |
|---|---|---|---|---|
| DS-CMP-01 | Every primitive is a DS component instance, not a detached or hand-built copy | error | design-critique E; DNA reuse | design-critique E |
| DS-CMP-02 | New patterns compose existing primitives; a new primitive needs governance approval | warning | DNA component philosophy | governance/token-modification-gates |
| DS-CMP-03 | Variants encode functional difference (size, intent, state, behaviour), not opinion | warning | DNA component philosophy | design-critique E |
| DS-CMP-04 | One primary action per view | warning | Button contract | design-critique |
| DS-CMP-05 | An action bar carries at most three primary actions | warning | design-critique D | design-critique D |
| DS-CMP-06 | Detached instances carry a documented override note; undocumented detachment is an error | error | design-critique E | design-critique E |
| DS-CMP-07 | Content-to-chrome ratio is sensible; cards under about 60 per cent content are flagged for review | info | design-critique D | design-critique D |

### A11Y — Accessibility

| ID | Rule | Severity | Source | Enforced by |
|---|---|---|---|---|
| DS-A11Y-01 | Text-on-surface contrast meets AA (4.5:1 body, 3:1 large text) | error | a11y-check step 2 | a11y-check; color-ramps/contrast-check |
| DS-A11Y-02 | Body text is at or above the minimum body token size | error | a11y-check step 3 | a11y-check |
| DS-A11Y-03 | Interactive hit targets are at least 44 by 44px (32 to 44 warns) | error | a11y-check step 4 (WCAG 2.5.5) | a11y-check |
| DS-A11Y-04 | Every interactive node has a visibly obvious focus indicator | error | a11y-check step 5 | a11y-check; state-matrix |
| DS-A11Y-05 | Meaningful images have alt-text; icon-only controls have a screen-reader label | warning | a11y-check step 6 | a11y-check |
| DS-A11Y-06 | Motion has a documented `prefers-reduced-motion` fallback | warning | a11y-check step 7 | a11y-check; motion-review |
| DS-A11Y-07 | State is never conveyed by colour alone (for example sold-out carries text or a flag) | warning | WCAG 1.4.1; events-landing exploration | design-critique |

### UX — Patterns and flows

| ID | Rule | Severity | Source | Enforced by |
|---|---|---|---|---|
| DS-UX-01 | The page is comprehensible on a single scroll; a device that impedes comprehension is removed | warning | DNA principle 1 | design-critique |
| DS-UX-02 | Loading, empty and error states are designed, not just the happy path | warning | interaction-patterns; events-landing exploration | ux/pattern-library |
| DS-UX-03 | New layouts and patterns are grounded in prior art (Mobbin plus corpus) before invention | info | reference/mobbin-mcp mandate | ux/flow-design |
| DS-UX-04 | Established interaction patterns are used for modal, toast, sheet and in-place edit rather than bespoke ones | warning | motion/interaction-patterns | ux/pattern-library |
| DS-UX-05 | Unavailable items stay visible with a reason, never silently removed | info | events-landing exploration | design-critique |
| DS-UX-06 | The small-viewport answer is honest; no dead patterns (for example a four-column month grid) | warning | events-landing exploration | ux/page-templates |

### MOT — Motion (scaffold-aware)

While motion tokens are absent from `tokens.json`, duration and easing findings are downgraded one severity step and a single `info` notes the provisional scale (per `ui/motion-review`).

| ID | Rule | Severity | Source | Enforced by |
|---|---|---|---|---|
| DS-MOT-01 | Durations are on the motion-token scale (within 10 per cent) | error | motion-review step 2 | motion-review |
| DS-MOT-02 | Easings come from the standard set; no spring physics by default | error | motion-review step 3; DNA | motion-review |
| DS-MOT-03 | Critical-path motion stays under about 500ms; a modal opens under 320ms | warning | DNA motion philosophy; motion-review step 6 | motion-review |
| DS-MOT-04 | Every animation answers a question; no decorative micro-interactions everywhere | warning | DNA motion philosophy | motion-review |
| DS-MOT-05 | The reduced-motion fallback is opacity-only or instant, never a longer animation | error | motion-review step 5 | motion-review |
| DS-MOT-06 | No hero scroll reveals or bouncy mascot motion on editorial surfaces | warning | DNA anti-patterns | motion-review |

### BRD — Brand voice and craft

| ID | Rule | Severity | Source | Enforced by |
|---|---|---|---|---|
| DS-BRD-01 | No em dashes; replace with a colon, comma or full stop | error | content-styleguide; content-style-check | content-style-check |
| DS-BRD-02 | British English spellings throughout (`colour`, `behaviour`, `customise`) | error | content-styleguide | content-style-check |
| DS-BRD-03 | Full brand names: your brand's names and "Design System", never abbreviated | error | content-styleguide | content-style-check |
| DS-BRD-04 | No emoji in UI chrome, error states or marketing (user-generated content is exempt) | warning | DNA anti-patterns | content-style-check |
| DS-BRD-05 | Copy is direct and imperative; not patronising ("you should..."), not "friendly" thinking for the reader | warning | content-style-check step 4; DNA | content-style-check |
| DS-BRD-06 | Sentences stay short; over 25 words warns, over 35 errors | warning | content-style-check step 4 | content-style-check |
| DS-BRD-07 | No borrowed identity; the design is unmistakably on-brand, not generic | info | DNA anti-patterns | design-critique |

## Rule candidates (from the corpus)

`corpus/distill-corpus` collects proposed rules in **`design-corpus/distilled/rules-candidates.md`** with evidence. A human reviews that file and promotes the good candidates into the tables above with a new sequential ID (for example `DS-SPC-07`), or rejects them. Nothing counts toward a score until it is promoted here.

Promotion checklist: give it the next free ID in its category, name a concrete source (the corpus version counts as a source once promoted), set a severity, and note the enforcing skill. Then tick the candidate in the corpus file's "Promoted" section.

_(no promoted corpus rules yet — the seed set above is 56 rules from the DNA, sibling skills and token architecture.)_

## Output Contract

When asked for the rule set (or a filtered slice), return the matching rows plus this summary:

```json
{
  "skill": "design/foundation/design-rules",
  "version": "1.0.0",
  "categories": ["TYP","COL","SPC","CMP","A11Y","UX","MOT","BRD"],
  "rule_count": 56,
  "weights": { "error": 5, "warning": 2, "info": 0 },
  "per_category_cap": 30
}
```

## Error Handling

* **Unknown rule ID cited by a skill.** The skill must not invent IDs. If an ID is not in this file, it is a bug in the caller; surface it, do not score it.
* **Source drift.** If a rule's source document changes so the rule no longer holds, update or retire the rule here first, then the enforcing skill. Never let a skill enforce a rule this file does not carry.
* **Motion in scaffold mode.** MOT durations/easings downgrade one step until motion tokens land; note it once per report.

## Composition

* `compose_after`: `design/foundation/design-dna`
* `compose_before`: `design/ui/design-critique`, `design/ui/monthly-audit`, `design/corpus/distill-corpus`

## Related skills

* `./design-dna.md` — the intent this file operationalises
* `../ui/design-critique.md` — the scorer that cites these IDs
* `../corpus/distill-corpus.md` — proposes new rules into Rule candidates
* `./corpus-guide.md` — how corpus evidence is cited
