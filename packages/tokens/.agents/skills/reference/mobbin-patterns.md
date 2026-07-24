---
name: mobbin-patterns
description: Ground new design work in shipped prior art through the official Mobbin MCP (600,000+ real product screens). Defines when the generation paths (New, Evolve, Versions and ux/flow-design) consult Mobbin, how to query it well by pattern, flow and competitor category, how to translate a found pattern into Design System terms without copying pixels, and how to cite Mobbin evidence alongside corpus evidence. External prior art complements the corpus; it never overrides it.
license: MIT
metadata:
 category: design/reference
 pillar: reference
 agents: [Designer, Design Engineer, PM]
 autonomy: autonomous
 portable: true
 cadence: on-demand
 mcp_tool: design_mobbin_patterns
---

# Mobbin Patterns

## Purpose

When your brand designs something it has not designed before, the corpus has nothing to say. This skill fills that gap with evidence instead of guesses: it searches Mobbin's library of shipped product screens, reads what other products actually do, extracts the interaction pattern, and re-expresses it in Design System terms.

Two things this skill is, and one it is not:

1. **A learning source.** Mobbin shows how paywalls, onboarding, live blogs and subscription flows behave across hundreds of real products. Patterns observed across several products are evidence; a single screen is an anecdote.
2. **A citation source.** Every judgement in this suite traces to a source. Mobbin evidence is cited with app, screen and retrieval date, in the same spirit as corpus citations.
3. **Not a style source.** Mobbin never supplies colour, type, spacing, iconography, voice or motion. Those come from `tokens.json`, the components and the DNA, without exception. See the anti-copying section.

The precedence rule, memorise it: **own corpus beats Mobbin; Mobbin beats guessing.** In full: `tokens.json` and the DNA first, then `foundation/design-rules`, then distilled corpus evidence, then Mobbin evidence, then nothing. If you are about to assert a pattern with no source at all, either search Mobbin or mark the assertion as an assumption.

## Preconditions

1. The official Mobbin MCP is connected and authenticated. Server: `https://api.mobbin.com/mcp` (HTTP transport), OAuth sign-in with a Mobbin account on a Pro or Team plan. If it is not connected, do not stop the wider task; follow Error Handling and continue corpus-only.
2. `foundation/design-dna` (tldr) is loaded. Translation into DS terms is impossible without it.
3. The corpus has been checked first: look for the pattern in `design-corpus/distilled/` (especially `ux-patterns/` and `layout-patterns.md`) before querying Mobbin. If the corpus already answers the question, Mobbin is a supplement, not the lead.
4. Vision is available to the running agent. Mobbin returns screen images; this skill cannot run blind.

### The tool surface (verified, with one assumption)

Verified as of 2026-07-20: the official Mobbin MCP exposes **one tool, `search_screens`**, which searches screens in natural language and returns screen images inline plus metadata (image URLs, app names, links to Mobbin).

| Parameter | Values | Use |
|---|---|---|
| `query` | free text, required | The pattern, flow step or category, in plain words |
| `platform` | `ios` or `web`, required | No `android` value at time of writing; see Error Handling |
| `mode` | `deep` (default) or `fast` | `deep` interprets intent; `fast` for precisely named lookups |
| `limit` | default 20, max 30 | Keep to 8 to 12; every screen costs vision time |
| `image_format` | `webp` (default) or `jpg` | Leave at default |
| `exclude_screen_ids` | array of ids | Page past screens already reviewed |

**Assumption, marked as such:** there is no dedicated flow, app or category search in the official server (a community server once offered these and is now archived in favour of the official one). Flow and category research therefore happen through query phrasing, as described in Step 4. Probe the live tool list at the start of a session; if Mobbin ships richer tools, use them and note the drift.

## Inputs

* `pattern`: what to research, in plain words ("paywall", "saved articles", "live blog onboarding"). Required.
* `route`: `new` | `evolve` | `versions` | `flow-design`. Which generation path is asking. Default `flow-design`.
* `surface`: `web` | `ios` | `android`. Default `web`. Maps to the `platform` parameter (android proxies to `ios`; see Error Handling).
* `feature`: optional feature slug. Evidence persists to `.design/<feature>/EVIDENCE.md`.
* `max_screens`: total screens to review across all queries. Default 12.
* `retrieved`: the run date passed in by the caller (this skill does not read the clock itself). Used in every citation.

## Procedure

### Step 1: Corpus first

Search the distilled corpus for the pattern. Record what it says, with its `(corpus v<N> · <n> screens)` citations. This does two jobs: it may already answer the question, and it sets the baseline that Mobbin findings must be reconciled against. A Mobbin pattern that contradicts a distilled corpus observation loses; record the conflict rather than silently preferring the shinier screen.

### Step 2: Gate by route

Not every path should reach for Mobbin. The gate:

| Route | Consult Mobbin? | When |
|---|---|---|
| **New** (Diverge: New, the `ux/` pillar) | Yes, by default | Before the first flow proposal. New experiences are exactly where the corpus is thinnest. |
| **Versions** (Diverge: Versions, N distinct directions) | Yes, once, up front | Pull a spread of genuinely different approaches to the same problem, so the N versions differ in pattern and structure, not in decoration. Assign each version a distinct prior-art basis. |
| **Evolve** (Diverge: Evolve, existing Figma frame) | Only when the evolution introduces a pattern the frame does not already have | The frame and the corpus lead. Adding, say, an inline subscription prompt to an existing article page warrants a Mobbin pass for that prompt only. |
| **ux/flow-design** | Yes (it already grounds in `reference/mobbin-mcp`) | At the prior-art step, alongside the corpus, before steps and states are fixed. |
| ui-craft, handoff, corpus-distill | No | Critique and handoff judge against the rules, the tokens and the corpus. Other products are not the yardstick for whether a design is correct. |

### Step 3: Probe the connection

Confirm the Mobbin MCP responds and list its tools. If unavailable, unauthenticated, or the plan has lapsed, say so plainly, set `mobbin: unavailable` in the summary, and continue with corpus evidence only. Never invent a Mobbin citation to fill the gap.

### Step 4: Compose the queries

Run two or three phrasings, not one. Use `exclude_screen_ids` to page past screens already seen. Three recipes:

* **By pattern name.** `"<pattern> screen"` plus one qualifier: "paywall screen news", "saved articles empty state", "article reader progress bar". Use `fast` mode when you can name the thing precisely; `deep` when you are describing intent ("screen that persuades a lapsed reader to return").
* **By flow.** The official tool searches screens, not flow objects, so reconstruct flows: first query `"<flow name> flow"` in `deep` mode, then query each step by name ("subscription plan picker", "payment confirmation", "cancellation survey"). Prefer runs where several screens come from the same app across steps: that is one coherent shipped flow, the strongest kind of Mobbin evidence.
* **By competitor category.** There is no category filter parameter, so fold the category into the query. For a news brand the useful categories are **news** ("news app article page", "breaking news live blog"), **subscription** ("subscription upgrade flow", "manage subscription cancel"), and **content** ("content longform reading experience", "magazine app navigation"). Naming a specific product in order to study it is allowed ("Guardian paywall"); naming one in order to imitate it is not (see anti-copying).

Set `platform` from `surface`: `web` stays `web`, `ios` stays `ios`, `android` proxies to `ios` with a note. Cap the total reviewed at `max_screens`.

### Step 5: Select and read the screens

From the results, keep the 3 to 8 screens that actually address the pattern; discard near-duplicates, off-brief screens, and anything too low-resolution to read honestly. Record for every kept screen: app name, screen id, Mobbin link, platform, and the query that found it.

### Step 6: Extract the interaction pattern

For each kept screen, and then across the set, write down only the transferable mechanics:

* **Purpose**: what user problem the screen solves, and where it sits in its flow.
* **Steps and sequencing**: what comes before and after; what a single screen carries versus what is split.
* **States**: loading, empty, error, success, edge, and how the product recovers.
* **Information hierarchy**: what is primary, what is metadata, what is progressively disclosed.
* **Affordances**: what is tappable, how exits and skips work, where the primary action sits.
* **Variation across apps**: what all of them do (the pattern) versus what only one does (that product's opinion).

Never record colours, typefaces, iconography, illustration style, logo treatments, copy voice or motion character. Those are the other product's identity, and they must not enter the evidence.

### Step 7: Translate into DS terms

Re-express the extracted pattern with your brand material. For each mechanic, name the DS re-expression: a semantic token, a component from `@ds/components-react`, a template from `ux/page-templates`, an interaction from `motion/interaction-patterns.md`. For example:

| Observed on Mobbin (mechanic only) | DS re-expression |
|---|---|
| Paywall keeps the article visible as dimmed context behind the offer | Standard modal pattern; sheet on `surface/ primary`; actions as `Button intent="primary"` and `intent="secondary"`; article remains real content, never a fake blur |
| Onboarding always shows progress and always offers an exit | Stepper from the pattern library; skip as a plain `Link`, not a buried gesture; copy in the brand voice, imperative and direct |
| Live blog pins the newest entry with a calm "new updates" affordance | `Flag` plus `typography.utility` timestamp; instant, linear state change; no bounce, no pulse |

Then run the translation past the DNA: does the result still read as your brand? Does it avoid every listed anti-pattern? If a mechanic cannot be expressed with existing tokens and components, that is a system gap to report, not a licence to copy the source styling.

### Step 8: Cite and hand over

Write the evidence in the house citation style, side by side with corpus citations. The Mobbin form is:

```
(mobbin · <App name> · <screen or query> · retrieved <YYYY-MM-DD>)
```

with the Mobbin link kept in the evidence file. Example evidence lines as they should appear in `FLOW.md` or `EVIDENCE.md`:

```
Paywalls in news products lead with the article, not the offer; the offer overlays.
 (corpus v4 · 6 screens) (mobbin · The Guardian · "news paywall" · retrieved 2026-07-20)
Cancellation flows ask why before they confirm, in one step, never three.
 (mobbin · Audible · "cancel subscription flow" · retrieved 2026-07-20)
```

Persist to `.design/<feature>/EVIDENCE.md` when `feature` is set, then hand the evidence to the calling skill (`ux/flow-design`, the Versions generator, or the Evolve pass) and render the Output Contract.

## Anti-copying: learn the pattern, never the identity

The DNA's anti-pattern list ends with **borrowed identities**: "if the design could have come from any other product or any other product, the design has failed." Mobbin makes borrowing effortless, so this skill makes the boundary explicit.

* **Extract mechanics, never material.** Steps, states, hierarchy, affordances and sequencing transfer. Colour, type, spacing signatures, iconography, illustration, voice and motion character never transfer. Step 6 enforces this at note-taking time, before temptation arrives.
* **Refuse imitation briefs.** "Make it look like the New York Brand app" is declined and reframed: "study how that product solves this, then design your brand's answer." Say this plainly to the designer.
* **The three-product rule.** Do not present a mechanic as a pattern unless it appears in at least three products. Below that, label it "one product's opinion" in the evidence.
* **The single-source check.** If most decisions in a proposed design trace to one app, the design is a copy wearing brand tokens. Broaden the evidence or start the translation again.
* **The logo test.** Cover the logo in the finished design. It must still be unmistakably on-brand. If it reads as the source app re-skinned, the translation failed.
* **Pixels stay out of the corpus.** Mobbin screens are another company's product photography. They are never filed into `design-corpus/`, which holds your product screens only. Mobbin evidence lives in `.design/<feature>/` as citations and extracted notes, not images.

## Output Contract

```markdown
# Mobbin Pattern Research: <pattern>

> Route: <new | evolve | versions | flow-design>
> Surface: <web | ios | android (proxied to ios)>
> Retrieved: <YYYY-MM-DD>
> Corpus checked first: <yes, <n> relevant observations | yes, nothing relevant | corpus empty>

## What the corpus already says

- <observation> (corpus v<N> · <n> screens)

## What shipped products do

| Mechanic | Seen in | Strength |
|---|---|---|
| <transferable mechanic> | <App>, <App>, <App> | pattern (3+ products) |
| <mechanic> | <App> | one product's opinion |

## Translation into Design System terms

| Mechanic | DS re-expression |
|---|---|
| ... | <tokens, components, templates, interaction patterns> |

## Evidence

- <finding> (mobbin · <App> · <screen or query> · retrieved <date>) <mobbin link>

## Conflicts and gaps

- <corpus vs Mobbin conflicts (corpus won), DNA refusals, system gaps found>
```

Followed by the machine-readable summary:

```json
{
 "skill": "design/reference/mobbin-patterns",
 "pattern": "<slug>",
 "route": "<new | evolve | versions | flow-design>",
 "platform": "<ios | web>",
 "mobbin": "<available | unavailable>",
 "queries": ["<query>", "..."],
 "screens_reviewed": 0,
 "apps_cited": ["<App>", "..."],
 "patterns_extracted": 0,
 "retrieved": "<YYYY-MM-DD>",
 "corpus_checked": true,
 "artifacts": [".design/<feature>/EVIDENCE.md"]
}
```

## Error Handling

* **Mobbin MCP not connected, OAuth expired, or plan lapsed.** Say so plainly, in one sentence, with the fix (connect `https://api.mobbin.com/mcp`, sign in, Pro or Team plan). Continue corpus-only, set `"mobbin": "unavailable"`, and mark affected assertions as corpus-based or assumption. Never fabricate a Mobbin citation.
* **Zero results.** Rephrase twice (once simpler, once by intent in `deep` mode). If still empty, report "no shipped prior art found on Mobbin for <pattern>" and proceed with corpus plus clearly marked assumptions.
* **Results dominated by one app.** Broaden the query or exclude that app's screen ids. The single-source check applies before evidence is written.
* **`surface: android`.** The verified `platform` values are `ios` and `web`. Search `ios`, treat results as mobile prior art, and add "platform proxied: android via ios" to the evidence. Re-probe occasionally; if Mobbin adds `android`, use it and note the drift.
* **Tool surface drift.** If `search_screens` is renamed, gains parameters, or is joined by flow or app tools, adapt, use the richer surface, and record the change in the run notes so this skill can be updated.
* **Mobbin contradicts the corpus.** The corpus wins. Record the conflict in "Conflicts and gaps"; it may be a genuine brand divergence worth keeping, or a corpus observation worth re-testing, but that is a human call.
* **Mobbin contradicts the DNA or `tokens.json`.** They win outright, without a conflict entry being debatable. A pattern that requires an anti-pattern is rejected at Step 7.
* **Vision unavailable.** Stop this skill (not the wider task) and say so. Metadata without eyes on the screens is not evidence.

## Composition

* `compose_after`: `design/foundation/design-dna`, `design/foundation/corpus-guide`
* `compose_before`: `design/ux/flow-design`, `design/ux/pattern-library`, `design/ux/page-templates`, `design/agents/prototyping-agent`
* `calls`: the official Mobbin MCP tool `search_screens`; vision on the running agent

## Related skills

* `../ux/flow-design.md`: the primary consumer; grounds new flows in this skill's evidence plus the corpus
* `../corpus/distill-corpus.md`: the internal complement, product screens in, distilled brand evidence out
* `../foundation/corpus-guide.md`: the citation contract this skill's Mobbin form sits alongside
* `../foundation/design-dna.md`: the identity that translation re-expresses into, and that anti-copying protects
