---
name: experience-principles
description: The journey-level principles for designing new brand experiences. Extends the six DNA principles (which govern a single view) up to the level of flows, pages and multi-step journeys. Modality heuristics, progressive disclosure, state completeness, subscription-aware moments, reader-first pacing and continuity. Loaded as a preamble by the other ux/ skills, the way design-dna is loaded by everything.
license: MIT
metadata:
  category: design/ux
  pillar: ux
  agents: [Designer, PM, Design Engineer]
  autonomy: autonomous
  portable: true
  cadence: daily
  mcp_tool: ux_principles
---

# Experience Principles

## Purpose

`foundation/design-dna` governs a single view: hierarchy, rhythm, channels, motion. But a new experience is more than a view. It is a sequence of screens, states and decisions a reader moves through. This skill is the layer above the DNA: the principles that govern the *journey*. It is loaded as a preamble by `ux/flow-design`, `ux/pattern-library` and `ux/page-templates`, so that every new experience is paced and shaped like the brand, not like a generic product.

Where the DNA answers "does this screen look like us?", this skill answers "does this journey behave like us?".

## Preconditions

1. `foundation/design-dna` is loaded first. These principles assume it and never contradict it.
2. On conflict, the DNA and `content-styleguide.md` outrank this file.

## Inputs

* `lens` — optional focus: `modality` | `disclosure` | `states` | `subscription` | `pacing` | `continuity` | `all`. Default `all`.

## The six experience principles

Priority order, like the DNA. When two conflict, the higher one wins. Principle 0 is always the reader.

### 0. The reader is doing something. Respect it.

Every brand experience interrupts a reader who came to read. The default posture is deference: do not interrupt the reading task for anything the reader did not ask for, and when you must interrupt (a paywall, a consent gate), do it once, cleanly, and get out of the way. A journey that respects the reading task is more on-brand than one that is merely pretty.

### 1. Choose the right modality

The most common new-experience mistake is putting content at the wrong altitude. The heuristic:

| Modality | Use when | Brand examples | DS pattern |
|---|---|---|---|
| **Full page** | The task is the reader's whole focus, or it needs the grid | article, section front, account settings, subscribe | `ux/page-templates` |
| **Sheet / drawer** | A focused sub-task that keeps the page as context | filters, save-to-list, share, comment composer | `motion/interaction-patterns` → `sheet-drag` |
| **Modal / dialog** | A short, blocking decision that must be resolved now | confirm delete, sign-in gate, one-question prompt | `motion/interaction-patterns` → `modal-open` |
| **Inline** | The change belongs in the flow of the content | in-place edit, expand/collapse, inline validation, inline message | `motion/interaction-patterns` → `in-place-edit`; InlineMessage |
| **Toast** | Confirming something already done, non-blocking | saved, sent, undo | Toast; `toast-appear` |

Rules: never stack modals. Never use a modal for something the page could show inline. A sheet is the brand default for "more, but keep me where I am". Reserve the full blocking modal for decisions that genuinely cannot wait. This operationalises the messaging hierarchy documented for the components (Banner > InlineMessage > Toast > Tooltip) at the journey level.

### 2. Disclose progressively

Comprehension first (DNA principle 1) at journey scale means: show the reader what they need for *this* step, and let the next step reveal the next thing. A form with 20 fields on one screen is a hierarchy failure. Break it into steps with a clear count ("Step 1 of 3"). Put advanced or rare options behind a disclosure, not on the first screen. The reader should never feel the full weight of the system at once.

Counter-rule: do not disclose so progressively that the reader loses the map. Three steps that each explain themselves beat one wall, but eight steps that hide the shape of the task are worse than one honest page. Show the length of the journey up front.

### 3. Design every state, not the happy path

An experience is its states. The happy path is the easy 20 per cent. For every screen in a new flow, the design is not done until these exist:

* **Loading** — skeletons that match the final layout, never a spinner where content will be. Structure (dates, headers) renders immediately; content shimmers.
* **Empty** — a quiet, useful line and a way forward. Never a blank space, never a jokey illustration (DNA anti-pattern: borrowed identities, friendly copy).
* **Error** — plain, specific, recoverable. Use the messaging framework (InlineMessage for in-flow, Banner for page-level, Toast for transient). Say what happened and what to do. No blame, no jargon.
* **Success** — usually a Toast and a return to the flow, not a celebration screen.
* **Edge** — sold out, expired, offline, subscriber-only, partial data. Keep the item visible with a reason; never silently drop it (`DS-UX-05`).

A flow that only shows the happy path is a prototype, not a design.

### 4. Handle subscription moments with editorial dignity

The example brand is a subscription product, so many journeys touch a paywall, a register-wall, or a subscriber-exclusive marker. These are the moments most likely to become dark patterns. The brand posture:

* The value proposition is stated plainly, once. No countdown-timer urgency, no fake scarcity, no guilt copy.
* The reader always knows why they hit the wall (article limit, premium section) and what they get.
* The exit is always visible. A reader who does not subscribe is a future subscriber; do not trap them.
* Subscriber-exclusive content is marked with dignity (a `Label`, not a flashing badge). Exclusivity is stated, not shouted.

Directness is the brand. A paywall that reads like the brand is confident and calm, not a growth-hack funnel.

### 5. Keep the reader oriented (continuity)

Across a journey the reader must always know: where am I, how did I get here, how do I get back, and did my last action register. Concretely: a persistent way back (never trap the reader in a flow), a visible step position in multi-step tasks, immediate feedback on every action (optimistic where safe, `motion/interaction-patterns` → `optimistic-save`), and preserved context on return (a reader who backs out of a sheet returns to the same scroll position). Motion is the connective tissue here (DNA principle 6): it shows where things came from and where they went.

## How other skills use this skill

* `ux/flow-design` loads this preamble and applies principles 1–5 to shape a brief into a flow.
* `ux/pattern-library` cites these principles as the *why* behind each pattern.
* `ux/page-templates` uses principle 1 (modality) and 3 (states) to decide what is a page and what is not.
* `ui/design-critique` can cite the UX rules (`DS-UX-*`) these principles back.

## Output Contract

Standalone, return the requested lens as prose. As a preamble, return the one-paragraph digest:

```markdown
Experience preamble (brand): the reader is mid-task — defer to it. Pick the lightest modality that fits (inline < toast < sheet < modal < page). Disclose one step at a time but show the journey's length. Design loading, empty, error, success and edge states, not just the happy path. Handle paywall and subscriber moments plainly, with a visible exit. Keep the reader oriented: a way back, a sense of position, immediate feedback.
```

Followed by:

```json
{
  "skill": "design/ux/experience-principles",
  "lens": "<lens>",
  "principles": ["reader-first", "modality", "progressive-disclosure", "state-completeness", "subscription-dignity", "continuity"],
  "backs_rules": ["DS-UX-01", "DS-UX-02", "DS-UX-04", "DS-UX-05", "DS-UX-06"]
}
```

## Error Handling

* **Conflict with the DNA.** The DNA wins. Surface the conflict; do not resolve it here.
* **A principle would justify a dark pattern.** It cannot. Principle 4 forbids it and principle 0 outranks any conversion goal. If a brief asks for urgency theatre or a hidden exit, refuse and say why.
* **Journey has one screen.** Then this skill mostly defers to the DNA; note that and apply only principle 3 (states).

## Composition

* `compose_after`: `design/foundation/design-dna`
* `compose_before`: `design/ux/flow-design`, `design/ux/pattern-library`, `design/ux/page-templates`

## Related skills

* `../foundation/design-dna.md` — the view-level principles this extends
* `../motion/interaction-patterns.md` — the motion behind modality and continuity
* `../ui/design-critique.md` — enforces the UX rules these principles back
