# The Retrofit Learning Loop

Every time the design suite generates something (a page, a prototype, HTML, a React
component, a spec, a critique), the learning-agent studies the run. Good runs become
lessons; recurring lessons become suggested skill improvements. Nothing in the loop
ever edits a skill, a rule or the DNA. It proposes; humans promote.

## The four phases

 any generating run finishes
 |
 v
 1. CAPTURE one metadata line -> design-corpus/retrofit/runs.jsonl
 | automatic, cheap, never delays your run
 v
 2. EVALUATE async and batched: three gates per run, using the machinery
 | we already trust (design-critique, a11y-check, token audit)
 v
 3. DISTIL runs that pass every gate -> lessons in retrofit/lessons.md
 | append-only, versioned, every lesson cites its run ids
 v
 4. PROPOSE a lesson seen in 3+ runs -> skill-improvement-candidates.md
 a human reviews and applies via PR; the agent never does

## What gets captured

One JSON line per run: timestamp, entry point, skills and agents used, the stated
objective (one line, paraphrased), context files loaded, artefact paths, channel,
and the JSON summaries every skill already emits.

Privacy line: metadata and paths only. Never prompt transcripts, never design
content. If it would show what a design looks like or quote what someone typed,
it does not go in the log.

## "Good enough to learn from": the three gates

1. **Objective.** Did the artefact do what was asked? Agent judgement, grounded in
 the brand's Design DNA, with evidence cited from the artefact itself.
2. **Craft.** `ui/design-critique` scores 80 or above, and `ui/a11y-check` finds no
 error-severity issues. Applies when the artefact is visual.
3. **Connectedness.** `ui/token-mapping-audit` finds no errors: semantic tokens
 only, no palette or foundation reach-ins. Applies when the artefact is code or Figma.

Gates that do not apply to an artefact type are recorded as n/a. A run teaches a
lesson only when every applicable gate passes. Failed runs are not wasted: when
three or more share a cause, the failure pattern becomes a candidate too.

## How a lesson becomes a skill improvement

A lesson recurs across 3+ runs. The agent appends a candidate to
`design-corpus/retrofit/skill-improvement-candidates.md` naming the exact skill,
the exact suggested edit (an example added, a default changed, guidance reworded)
and the evidence. A human reviews it, applies it through a normal PR, and ticks
the box. Same contract as `rules-candidates.md` in the corpus: the loop suggests,
people decide. Every candidate can be audited (follow the run ids back through
the lesson) and reversed (revert the PR).

## Five lessons this loop might produce

1. Runs that name an content section before generating average 14 points higher
 on design-critique than runs where the channel emerged mid-run. Candidate: the
 /design-start wizard confirms the channel before asking for the design.
2. Prototype runs that loaded `ux/page-templates` alongside the DNA passed the
 objective gate first time in 9 of 9 runs; without it, 4 of 7 needed a second
 iteration. Candidate: prototyping-agent loads page-templates by default for
 full-page requests.
3. Handoff packets generated from a screenshot failed the connectedness gate in
 5 of 6 runs; packets from an active Figma tab passed in all 8. Candidate:
 handoff-flow warns when the input is a screenshot and offers the Figma path.
4. Em dashes appear in generated microcopy whenever `ui/content-style-check` is
 absent from the sequence (6 runs). Candidate: add the no-em-dash rule as a
 worked example in `ux/microcopy`.
5. Requests phrased "quick first pass" that were routed to ui-craft instead of
 prototype failed the objective gate in 3 of 3 runs. Candidate: add "first
 pass" to the prototype route's classification signals in design-router.
