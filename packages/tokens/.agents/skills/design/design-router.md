---
name: design-router
description: The single entry point for design work. Takes a designer's request in plain language, loads the Design DNA, classifies the intent (prototype, ui-craft, new-experience, handoff, corpus-distill) and routes to the right skills or agent in the right order. Designers should not have to know the skill catalogue; they say what they are doing and the router composes the rest.
license: MIT
metadata:
  category: design
  pillar: router
  agents: [Designer, Design Engineer, PM, QA]
  autonomy: autonomous
  portable: true
  cadence: daily
  mcp_tool: design_route
---

# Design Router

## Purpose

Turn "help me with this design task" into a concrete, ordered plan of Design System skills. One entry point, five routes. The router never does the design work itself; it loads the DNA, classifies the intent, then hands over to the pillar skills or an agent with the sequence spelled out.

## Preconditions

* `foundation/design-dna` is available. The router always loads its TL;DR first.
* At least one of the following inputs is present: a request in plain language, a Figma URL, or an image.

## Inputs

* `request` — the designer's ask, in their own words. Required.
* `figma_url` — optional Figma deep link (file or node). If present, the Mandatory User Gate for Figma URLs applies before any extraction.
* `image` — optional screenshot or exported frame. Accepted anywhere Figma access is unavailable.
* `feature` — optional feature slug. Downstream artefacts persist to `.design/<feature>/`.
* `target` — the target surface for anything that will be generated: `web-desktop` | `web-mobile` | `responsive-web` | `native-ios`. Required before a screen is drawn (the grid, patterns, components and token set all change with it); collected by the wizard or inferred from the request, never silently defaulted. Native iOS designs to iOS patterns on the `theme-ios` token names, for SwiftUI.

## Procedure

### Step 1: Load the DNA

Load the TL;DR section of `foundation/design-dna`. Every downstream recommendation is grounded in it. Do not skip this, even for a one-line request.

### Step 2: Classify the intent

Map the request onto exactly one route:

| Route | The designer is saying | Primary destination |
|---|---|---|
| `prototype` | "Try an idea", "mock this up", "quick first pass" | `agents/prototyping-agent` |
| `ui-craft` | "Is this right?", "check this frame", "tokens, spacing, contrast, states" | `ui/*` (see Step 4) |
| `new-experience` | "Design a new flow / journey / page type we do not have yet" | `ux/flow-design` (the `ux/` pillar) |
| `handoff` | "This is ready for engineering", "produce the spec" | `handoff/handoff-flow` or `agents/handoff-agent` |
| `corpus-distill` | "Learn from these screenshots", "add these to the corpus" | `corpus/distill-corpus` |

Classification signals, in priority order: explicit verbs in the request, presence of a Figma URL or image, feature maturity (new idea vs existing frame), and whether the output is for engineers (handoff) or for the designer (everything else).

### Step 3: Ask at most one question

If, and only if, the route is genuinely ambiguous between two options, ask one clarifying question with the two candidate routes as options. Never ask more than one. If the request is clear, do not ask anything.

### Step 4: Compose the sequence

Emit the ordered skill sequence for the chosen route:

* **prototype** → `agents/prototyping-agent` (which itself loads the DNA, `ui/token-mapping-audit` and `ui/state-matrix` as needed).
* **ui-craft** → pick from, in default order: `ui/design-critique`, `ui/a11y-check`, `ui/content-style-check`, `ui/token-mapping-audit`, `ui/state-matrix` (for components), `ui/light-dark-parity` (when both modes exist), `ui/motion-review` (when motion is specified). Scope to what the request actually asks for; the full battery is `agents/critique-agent`.
* **new-experience** → the `ux/` pillar: `foundation/design-dna` (tldr) + `ux/experience-principles` → `ux/flow-design` (grounds in `reference/mobbin-mcp` and the corpus, produces `.design/<feature>/FLOW.md`) → `ux/page-templates` for full-page screens → `ux/pattern-library` and `ux/microcopy` as the flow needs them → `ui/design-critique` once a prototype exists → `handoff/handoff-flow` when the direction settles. Any built screen lands in a sandbox run per `foundation/sandbox-runs`, with `handoff/dev-spec` writing `DEV-SPEC.html` beside it in the same pass: the engineer's quick view of components, tokens, statuses and the target surface.
* **handoff** → `handoff/handoff-flow` for the guided pass, or `agents/handoff-agent` to run it end to end. Both end in `.design/<feature>/PACKET.md`.
* **corpus-distill** → `corpus/distill-corpus` (drop screenshots in `design-corpus/raw/inbox/` first; the skill classifies, files and distils them into the versioned corpus, and proposes rule candidates).

### Step 5: Hand over

Print the route, the sequence as a checklist, and the JSON summary. Then begin the first skill in the sequence unless the designer asked for the plan only.

## Guided mode (the /design-start wizard)

For designers who would rather click than recall skill names. Triggered by `/design-start`, or by `/design` with no description. Present each step as **selectable options** (Claude Code: the question tool; Copilot: `vscode_askQuestions`). Ask two, at most three, short questions, then request the concrete input in plain text. Never make the user type a keyword, and never ask more than three question-steps before getting to work.

Load the DNA TL;DR first (Step 1 above), then:

### G1 — What would you like to do?

Four options, plain language:

- **Check or improve a design** — feedback on something you have → route `ui-craft`
- **Design something new** — a page, flow or pattern that does not exist yet → route `new-experience`
- **Get it ready for engineering** — hand a finished design off → route `handoff`
- **Teach the system from screens** — learn how your brand designs → route `corpus-distill`

If the user picks "Other" and describes a quick idea or exploration, treat it as route `prototype`.

### G2 — Narrow it (options depend on G1)

- **Check or improve** (multi-select): Everything (scored critique) · Accessibility · Copy and voice · Token correctness · Light vs dark
- **Design something new**: A whole page or flow · A quick exploration first · Not sure, help me shape it
- **Get it ready for engineering**: Just the spec · Spec plus scaffold the component · The full packet
- **Teach the system**: Website screenshots · App screenshots · A mix

### G3 — Where will it live (only for routes that will generate a screen or page)

The `prototype` and `new-experience` routes, and any evolve of an existing screen, must know the target surface before anything is drawn. This is the designer's call, not a guess:

- **Web desktop** · **Web mobile** · **Responsive web page** · **Native iOS app (Swift)**

The three web targets prototype in HTML on the `theme-css` semantic variables at the right canvas; native iOS designs to iOS patterns and safe areas on the `theme-ios` token names, for SwiftUI (load `figma-swiftui` when writing to Figma). Skip the question only when the request or the base screen already answers it, and confirm the inference in the plan instead. Check-only, handoff and corpus routes skip it.

### G4 — Ask for the input (free text, not options)

End by asking for the concrete thing, and teach the screenshot-versus-Figma choice in the same breath:

> Great. Now send me the design: **paste a screenshot** (fine for layout, hierarchy, UX and copy), or — if you want **token-level accuracy** like legacy-drift checks — make the file your **active tab in Figma** and say so. You can also point me at a **folder**, or just **describe** the page.

Then map the collected answers to a route and target, and run the composed skill sequence from Step 4. The wizard is a friendlier front door to the same five routes; the skill sequence it produces is identical to the typed path.

## Output Contract

```markdown
# Design Router — [one-line restatement of the request]

> Route: <prototype | ui-craft | new-experience | handoff | corpus-distill>
> Target: <web-desktop | web-mobile | responsive-web | native-ios | "n/a">
> Feature: <slug or "not set">

## Sequence

- [ ] 1. <skill or agent> — <why it is in the sequence>
- [ ] 2. ...

## Notes

<anything the DNA flags about this request: anti-patterns to avoid, prior art to check>
```

Followed by the machine-readable summary:

```json
{
  "skill": "design/design-router",
  "route": "<route>",
  "sequence": ["<skill-path>", "..."],
  "target": "<web-desktop | web-mobile | responsive-web | native-ios | null>",
  "feature": "<slug or null>",
  "artifacts": []
}
```

## Error Handling

* **No classifiable intent.** Restate the five routes in one sentence each and ask the designer to pick one. Do not guess.
* **Figma URL present but unreachable.** Route unchanged; note that extraction-dependent steps will need the Figma desktop MCP (active tab) or an exported image, and continue with what is available.
* **Requested skill not yet shipped.** The `ux/` pillar, corpus and rule set are all live. If a genuinely missing capability is asked for (for example the MCP wrap, or motion scoring before motion tokens exist), say plainly what is not there rather than pretending it ran.
* **Conflicting inputs** (for example a stated target surface that contradicts the frame). Flag it, prefer the frame's evidence, and record the conflict in Notes.

## Composition

* `compose_after`: nothing. This is the entry point.
* `compose_before`: everything in `design/`. The router is the recommended first call for any design request.
