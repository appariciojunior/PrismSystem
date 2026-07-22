---
name: corpus-guide
description: The citation contract for the design corpus. Defines how design skills cite distilled evidence from design-corpus/, what authority that evidence carries, and how corpus versions are referenced. Load this whenever a skill needs to quote how your brand actually designs.
license: MIT
metadata:
  category: design/foundation
  pillar: foundation
  agents: [Designer, Design Engineer, PM, QA]
  autonomy: autonomous
  portable: true
  cadence: on-demand
  mcp_tool: corpus_cite
---

# Corpus Guide

## Purpose

The design corpus (`design-corpus/` at the repo root) turns screenshots of the real product into versioned reference documents. This skill is the contract for using them: how to cite a distilled observation, how much authority it carries, and how to keep citations honest as the corpus grows. It is short on purpose. The heavy lifting is in `corpus/distill-corpus` (which writes the docs) and `foundation/design-rules` (which the corpus feeds).

## Preconditions

1. `design-corpus/` exists with a `manifest/corpus-manifest.json` and a `distilled/` tree.
2. The reader understands that distilled docs describe the product as observed, not as mandated.

## The authority ladder

When sources disagree, higher wins:

1. `packages/tokens/src/tokens.json` — the token truth.
2. `content-styleguide.md` — the voice truth.
3. `foundation/design-dna.md` — the intent and principles.
4. `foundation/design-rules.md` — the operationalised rules.
5. **`design-corpus/distilled/*` — the corpus. Evidence of practice, not a rule.**

So a corpus observation can *inform* a rule (via `rules-candidates.md` → human promotion) but never *overrides* one. If the corpus shows the product doing something the DNA forbids, that is a finding about the product, not a licence to change the rule. Surface it; do not silently follow it.

## How to cite

Every claim a skill draws from the corpus carries an inline citation:

```
design-corpus/distilled/<doc>#<anchor> (corpus vN)
```

* `<doc>` — the distilled file, for example `layout-patterns.md` or `ux-patterns/live-blog.md`.
* `<anchor>` — the heading slug of the observation.
* `(corpus vN)` — the corpus version the observation was current at, from `design-corpus/distilled/VERSION.md`.

Example, inside a critique or a flow:

> Article cards lead with a 3:2 image above the headline on web home and section fronts (`design-corpus/distilled/layout-patterns.md#card-anatomy` (corpus v3)).

Never cite the corpus without a version. An un-versioned citation cannot be traced back to the screens that support it, which defeats the point.

## Strength of evidence

A distilled observation records how many screens support it. Treat that count as its confidence:

* **1–2 screens** — anecdote. Cite as `info` at most; do not build a rule on it.
* **3–9 screens** — pattern. Safe to cite; a plausible rule candidate.
* **10+ screens across more than one channel or surface** — strong. A good promotion candidate for `design-rules`.

`corpus/distill-corpus` records the count; skills should repeat it when the strength matters to the argument.

## When the corpus is empty

Until the first batch is distilled, `distilled/*` files are stubs. Skills that would cite the corpus proceed without it and note the gap, for example: "no corpus evidence yet for this journey; grounded in the DNA and Mobbin only." Never invent a corpus citation. A missing corpus is a known state, not an error.

## Output Contract

When asked to resolve or format a corpus citation, return the citation string plus:

```json
{
  "skill": "design/foundation/corpus-guide",
  "doc": "<distilled doc path>",
  "anchor": "<slug>",
  "corpus_version": "<N or null>",
  "screens": "<n or null>",
  "authority_rank": 5
}
```

## Error Handling

* **Doc or anchor not found.** Do not cite it. Report the missing reference; the corpus may not cover it yet.
* **Version mismatch** (citing v3 but VERSION.md is at v2). Cite the current version and flag the drift; distilled docs and VERSION.md are updated together by the distill skill.
* **Corpus contradicts a higher authority.** Follow the higher authority, surface the contradiction as a finding, and (if it recurs) let it flow into `rules-candidates.md` for human review.

## Composition

* `compose_after`: `design/foundation/design-dna`
* `compose_before`: `design/ui/design-critique`, `design/ux/flow-design`, `design/ux/pattern-library`, `design/ux/page-templates`

## Related skills

* `../corpus/distill-corpus.md` — writes the distilled docs this skill cites
* `./design-rules.md` — where strong corpus observations become rules
* `../../reference/mobbin-mcp.md` — cross-product prior art, complementary to your own corpus
