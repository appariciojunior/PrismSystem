---
name: stack-convert
description: Convert a designer's prototype (AI-generated code, an HTML page, a screenshot or a Figma frame) into production code for one Design System stack. Inventories every visual value and widget, maps values to semantic tokens (exact match, else nearest with a flag) and widgets to real DS components (else flagged as a gap, never invented), generates code for the target stack, verifies that no raw values survive and every import resolves, and writes a CONVERSION.md report of every mapping, swap and flagged unknown. The engine behind the /engineer-start "Convert this into our stack" path.
license: MIT
metadata:
  category: design/handoff
  pillar: handoff
  agents: [Design Engineer, Engineer]
  autonomy: requires-approval
  portable: true
  cadence: on-demand
  mcp_tool: design_stack_convert
---

# Stack Convert

## Purpose

Close the gap where designers prototype with AI tools and engineers rebuild everything from scratch. This skill takes whatever the designer produced (v0 or Lovable output, a hand-rolled HTML page, a screenshot, a Figma frame) and turns it into production code for one chosen stack, built from real Design System components and semantic tokens.

The conversion honours a fidelity contract, stated to the engineer before anything runs:

* **Preserved:** layout, hierarchy, component states, content, interaction intent and observed responsive behaviour.
* **Deliberately replaced:** arbitrary colours and sizes become the nearest semantic token, with every substitution recorded in a mapping table; custom widgets become the matching DS component, with a swap note for each.
* **Never done:** guessing. A value or widget that cannot be mapped with confidence is flagged in the report with what is needed to resolve it. No raw hex reaches the output, no token is invented, and no component is fabricated to look like a DS one.

This skill **writes code**, so it is `requires-approval`. It shows the plan (files to be written plus both mapping tables) and waits for a go before touching anything.

## Preconditions

1. The DNA TL;DR is loaded (`foundation/design-dna`): voice rules and the semantic-tokens-only law.
2. A token source is available: the token MCP tools (`token_lookup`, `search_tokens`, `token_validate`, `contrast_check`) or the token JSON under `packages/tokens/`. Without token truth this skill cannot map; it must stop, not guess.
3. A component inventory for the target stack is readable: the exports of `@ds/components-react`, or the equivalent inventory for, `theme-ios`, `theme-css` / `theme-scss`.
4. An input prototype is present (code, image or Figma access).
5. Vision is available to the running agent when the input is an image. If not, stop and say so.

## Inputs

* `source`: the prototype. A path to code or a folder, an image, or a Figma URL or node. Required.
* `target_stack`: `react` | `` | `ios` | `` | `css`. Required.
* `feature`: kebab-case slug. Artefacts persist to `.design/<feature>/`. Derived from the source name if absent, confirmed with the engineer.
* `mode`: `light` | `dark` | `both`. Default `both` where the stack supports it.
* `out_dir`: where generated code goes. Default: the conventional location in the target package, proposed in the plan; the engineer can redirect it.
* `dry_run`: when true, produce the inventories, both mapping tables and the plan, but write nothing. Default false; the approval gate applies either way.

## Procedure

### Step 1: Ingest the prototype

Establish what kind of input this is and read it accordingly. Record a provenance for every value you will later map: `measured` (read from code), `bound` (read from a Figma variable binding), or `estimated` (read from pixels).

* **Code** (v0, Lovable, plain HTML, JSX, anything similar): parse the markup and the styles. Collect values from inline styles, stylesheets and utility classes; translate utility-class scales (for example Tailwind) into concrete values before mapping. Provenance: `measured`.
* **Image**: read the screen visually. All derived values are `estimated`; say so up front and mark them in every table.
* **Figma**: when the desktop MCP is live (`127.0.0.1:3845`, file as active tab), pull the design context and variable definitions; variable bindings are ground truth, provenance `bound`. When it is not live, fall back to a screenshot of the frame and treat it as an image input.

### Step 2: Inventory everything

Build two complete inventories. Nothing is skipped; these are the checklists the rest of the run works through, and the totals in the final report must reconcile against them.

* **Value inventory**: every colour, font family, size and weight, line height, spacing value, radius, border, shadow, breakpoint, opacity and motion duration, each with its location in the source and its provenance.
* **Widget inventory**: every distinct interactive or structural widget (buttons, links, inputs, cards, navigation, tabs, accordions, modals, badges, tables, media blocks and so on), each with the states the prototype shows or implies.

### Step 3: Map values to semantic tokens

For each entry in the value inventory, in order:

1. **Exact match.** Look the value up against the semantic layer (`token_lookup` by value). If one semantic token holds that exact value in the right role, map to it. Match type: `exact`.
2. **Nearest match.** No exact hit: find the nearest semantic token of the correct role (`search_tokens` intent-first, then distance on the value). For any colour that carries text, run `contrast_check` to confirm the substitution still meets AA before accepting it. Match type: `nearest`, always with a note stating the original value and the visible difference.
3. **Flag.** No credible nearest token: record the value as `flagged` with the original, the location, and what would resolve it (usually a designer decision or a token request). The generated code carries a marked placeholder that fails loudly rather than a silent raw value.

Mapping rules, non-negotiable: semantic layer only; never palette-direct, never foundation-direct, never raw hex, never legacy names.

### Step 4: Map widgets to DS components

For each entry in the widget inventory:

1. **Match.** The widget corresponds to a real component in the target stack's inventory: use it, and map the prototype's variations onto the component's actual props and variants.
2. **Swap.** The widget is close to a real component but not identical: use the component and record a swap note describing exactly what changes for the engineer and the designer (for example "the prototype's pill button becomes Button with the rounded variant; the gradient fill is dropped").
3. **Gap.** No component fits: flag it. Render the region with plain markup styled only by semantic tokens, marked clearly as a gap, or omit it with a note if it cannot be represented honestly. Never build a lookalike; a genuine gap is input to component governance, not something to fake. (Internal note: an approved gap later becomes a job for `agents/build-agent`.)

### Step 5: Generate for the target stack

Assemble the output using the maps from Steps 3 and 4:

* `react`: components from `@ds/components-react`, tokens through the theme layer, states wired, and a story when the output is a component.
* ``: blocks, patterns or templates in the conventions.
* `ios`: native code consuming the `theme-ios` semantic token names.
* ``: native code consuming the semantic token names.
* `css`: plain markup plus `theme-css` (or `theme-scss`) semantic variables, no framework.

Then present the plan: the file list with destinations, the value mapping table, the widget table, and the flag count. **If `dry_run`, stop here.** Otherwise request approval, and write only after the go.

### Step 6: Verify

Run the checks against the generated output before calling it done:

1. **No raw values.** Zero hex codes, zero rgb or named colours, zero hard-coded dimensions where a token exists. Structural values with no token equivalent are permitted only when listed in the report.
2. **Semantic layer only.** No palette-direct, foundation-direct or legacy (NK-prefixed) names anywhere. Run `token_validate` where available.
3. **Imports resolve.** Every imported component and token reference exists in the target package.
4. **Reconciliation.** Every inventory entry from Step 2 appears in the report exactly once, as exact, nearest, swap or flag. Totals must add up.

A verification failure is fixed or demoted to a flag; it is never shipped raw.

### Step 7: Write the report and the dev spec

Write `.design/<feature>/CONVERSION.md` following the Output Contract below, and place the generated code per the approved plan. The report is the artefact the designer and the engineer both read: it is the honest record of what the conversion kept, changed and could not decide.

In the same pass, write `DEV-SPEC.html` into the run folder root per `handoff/dev-spec`: the one-page quick view derived from the same two mapping tables, no new analysis. Statuses carry over directly (`exact` and `bound` → bound, `nearest` → nearest, `flagged` → flagged; matched widgets → existing, swaps → variant needed with the swap note, gaps → gap), along with the target stack and the open questions. The dev spec summarises the report; it never contradicts it.

## Output Contract

```markdown
# Conversion Report: <feature>

> Source: <path, image or Figma link> (<code | image | figma>)
> Target stack: <react | | ios | | css>
> Mode: <light | dark | both>
> Provenance: <n> measured, <n> bound, <n> estimated
> Converted: <ISO timestamp>

## The contract

Preserved: layout, hierarchy, states, content, intent.
Replaced: arbitrary values mapped to semantic tokens; custom widgets swapped for real components.
Flagged, not guessed: <n> items, listed below.

## Value mappings

| Original | Where | Token | Match | Note |
|---|---|---|---|---|
| #1D7A8C | hero background | <semantic token path> | nearest | slightly cooler; AA holds |

## Widget swaps

| Prototype widget | Component used | What changes |
|---|---|---|
| custom pill button | Button (rounded) | gradient fill dropped |

## Flagged unknowns

| Item | Where | Why flagged | To resolve |
|---|---|---|---|

## Verification

Raw values remaining: 0. Legacy names: 0. Unresolved imports: 0. Reconciliation: <pass | fail>.

## Files written

<list of generated files with paths>
```

Followed by the machine-readable summary:

```json
{
  "skill": "handoff/stack-convert",
  "source_type": "code | image | figma",
  "target_stack": "react | | ios | | css",
  "feature": "<slug>",
  "values": { "total": 0, "exact": 0, "nearest": 0, "flagged": 0 },
  "widgets": { "total": 0, "matched": 0, "swapped": 0, "gaps": 0 },
  "verification": { "raw_values": 0, "legacy_names": 0, "unresolved_imports": 0, "reconciled": true },
  "artifacts": [".design/<feature>/CONVERSION.md", "<run folder>/DEV-SPEC.html"]
}
```

## Error Handling

* **No token source.** Stop. Conversion without token truth would be guessing, which this skill exists to prevent. Say what to start (the token MCP server or a path to the token JSON).
* **Figma URL given but the desktop MCP is not live.** Fall back to a screenshot of the frame, mark every derived value `estimated`, and note in the report that reconnecting Figma would upgrade the mapping.
* **Minified or unreadable prototype code.** Extract what parses; everything unreadable becomes flagged. Suggest asking the designer for the tool's source export rather than the built bundle.
* **Target package not present in the checkout.** Generate into `.design/<feature>/build/`, state the intended destination in the report, and let the engineer move it.
* **Prototype too large for one pass** (a whole multi-page site). Propose a split by page or feature, agree the first slice, and convert that. One honest slice beats a sprawling half-mapped whole.
* **Approval declined.** Write nothing. Present both mapping tables in the conversation so the work of the analysis is not lost, and stop.
* **A single tool fails mid-run** (for example `contrast_check` unavailable). Continue, demote affected mappings from `nearest` to `flagged`, and record the gap in the report.

## Composition

* `compose_after`: `/engineer-start` (the conversion path routes here); `handoff/frame-to-spec` or `agents/handoff-agent` when a spec or packet already exists, because a packet sharpens every mapping decision.
* `compose_before`: `handoff/dev-spec` (the quick-view page written in the same pass as the report); `ui/visual-vs-built` to compare the generated output against the source design; `ui/token-mapping-audit` for an independent audit of the written code; `agents/build-agent` when a flagged widget gap is approved as a genuinely new component; `handoff/code-connect-stub` once Code Connect is wired (it is not yet; record it as pending, do not pretend it ran).
