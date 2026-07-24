---
name: dev-spec
description: Generate DEV-SPEC.html, the engineer's quick view of a generated screen or feature. A single self-contained HTML page listing every component used (with its match status), every token used (with its binding status), the target surface, and the open questions. Produced automatically alongside every full-page or feature generation, in the same sandbox run folder as the artefact. The quick view, not the packet; frame-to-spec, spec-packet and CONVERSION.md remain the deep artefacts.
license: MIT
metadata:
  category: design/handoff
  pillar: handoff
  agents: [Designer, Design Engineer, Engineer]
  autonomy: autonomous
  portable: true
  cadence: every-generation
---

# Dev Spec

## Purpose

A designer generates a full page or a feature and shows it to an engineer. The first questions are always the same: which components is this, which tokens is it using, what is real and what is estimated, and where does it run. Today the honest answers are buried in the generation transcript or deferred to a full handoff packet the designer has not made yet.

This skill closes that gap. Every generation that produces a screen, page or feature build also produces `DEV-SPEC.html` in the same run folder, at the same time: one small self-contained page an engineer can open next to the artefact and read in under a minute. It is the breakdown of the new work, not a rebuild of it.

The dev spec is the **quick view**. It never replaces `handoff/frame-to-spec`, `handoff/spec-packet` or a conversion's `CONVERSION.md`; when the feature is ready to ship, those still run. The dev spec exists so that the sixty seconds after "look what I made" are grounded in real component and token names instead of guesses.

## Preconditions

1. A generation has just completed and its artefact (the screen, page or feature build) is in a sandbox run folder per `foundation/sandbox-runs`.
2. The component and token decisions made during that generation are still in context: which DS components were used or approximated, which semantic tokens were bound, what was estimated from a render. The dev spec is written from the generation's own working record, never re-derived by guessing afterwards.
3. The target surface for the run is known (web desktop, web mobile, responsive web, or native iOS); the intake collects it.

## Inputs

* `run_folder`: the sandbox run folder the artefact lives in. Required. The dev spec is written to `<run_folder>/DEV-SPEC.html`.
* `feature`: the feature or project slug. Required.
* `target`: `web-desktop` | `web-mobile` | `responsive-web` | `native-ios`. Required.
* `scope`: `new-feature` (default) or `whole-page`. For an evolve run (a full base screen plus one change), scope the tables to the **new or changed feature**; base-screen elements appear only in a one-line "unchanged base" note. For a from-scratch page, cover the whole page.

## Procedure

### Step 1: Collect the record

From the generation just completed, gather, without re-deriving:

* **Components**: every component in scope, with what it maps to. Each row gets a status:
  * `existing` — a real DS component used as-is.
  * `variant needed` — a real component, but the design needs a variant or prop it does not have yet.
  * `gap` — no DS component fits; rendered honestly as plain markup, flagged for governance.
  * `estimated` — transcribed from a render rather than read from bindings or code.
* **Tokens**: every semantic token used in scope, with its role (what it controls) and a status:
  * `bound` — read from a real binding (Figma variable or code).
  * `nearest` — the closest semantic token, substituted for an arbitrary value, with the original noted.
  * `flagged` — no credible token; carries what would resolve it.
* **Open questions**: anything the generation flagged for a human decision.

For a native iOS target, the components column also names the SwiftUI mapping (the `theme-ios` token names, the SwiftUI view or DS iOS component) so the engineer sees the native shape, not a web translation.

### Step 2: Write DEV-SPEC.html

One self-contained HTML file, no external assets, no scripts required, aiming well under 300 lines. Plain readable styling; it is an internal spec sheet, not a branded page, so no brand marks. Structure, top to bottom:

1. **Header**: feature name, run folder name, date, target surface, and the filename of the artefact it describes.
2. **What was built**: two or three sentences in plain language.
3. **Components table**: element → component used → status → note (the swap or gap explanation, one line).
4. **Tokens table**: token path → role → status → note (original value for `nearest`, resolution needed for `flagged`).
5. **Status strip**: the counts — components existing / variant needed / gaps / estimated, tokens bound / nearest / flagged — so the health of the build is readable at a glance.
6. **For the engineer**: the two or three next moves in plain words (usually: pick it up via `/engineer-start`, and the questions to send back to the designer).

Honesty rules, non-negotiable: every status comes from the generation's real record; nothing is upgraded to look healthier; `estimated` and `flagged` are worn openly. A dev spec that says everything is `bound` when the run worked from a screenshot is worse than no dev spec.

### Step 3: File it

Write the file to `<run_folder>/DEV-SPEC.html`, list it in the run's `MANIFEST.md` under "What came out", and mention it when reporting completion ("plus a dev spec page for engineering").

## Output Contract

The file itself, plus the machine-readable summary:

```json
{
  "skill": "design/handoff/dev-spec",
  "feature": "<slug>",
  "run": "<YYYY-MM-DD>-<run-slug>",
  "target": "web-desktop | web-mobile | responsive-web | native-ios",
  "components": { "existing": 0, "variant_needed": 0, "gaps": 0, "estimated": 0 },
  "tokens": { "bound": 0, "nearest": 0, "flagged": 0 },
  "open_questions": 0,
  "artifacts": ["sandbox/<project>/<run>/DEV-SPEC.html"]
}
```

## Error Handling

* **The generation record is incomplete** (for example the run predates this skill, or context was lost). Write the dev spec from what is genuinely known and mark the missing sections "not recorded in this run"; never backfill by guessing.
* **No run folder** (a quick unsaved exploration). Skip the dev spec; it only accompanies work that landed in a sandbox run.
* **Target surface unknown.** Ask the one question rather than defaulting silently; the target changes the component column's meaning.
* **The artefact is a flow document, not a screen** (a FLOW.md with no built page). Skip; the dev spec describes built screens.

## Composition

* `compose_after`: the generating paths of `/design-start` (something brand new, build on a screen, versions once one is chosen) and `/engineer-start` (conversion), `handoff/stack-convert`, `foundation/sandbox-runs` (the run folder must exist first).
* `compose_before`: `/engineer-start`'s handoff pickup (the dev spec is the first thing the engineer reads), `handoff/frame-to-spec` and `handoff/spec-packet` (the deep pass when the feature is ready), `agents/handoff-agent` (the packet links the run's dev spec when one exists).
