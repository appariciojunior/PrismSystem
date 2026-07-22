---
name: distill-corpus
description: Turn a batch of real product screenshots into versioned design knowledge. Inventories the drop folder, classifies each screen by surface, channel and journey, files it, records it in the manifest with a content hash, then distils what it sees into the design-corpus distilled documents and proposes new rules. The engine behind the "learn how we design" corpus.
license: MIT
metadata:
  category: design/corpus
  pillar: corpus
  agents: [Designer, Design Engineer, Architect]
  autonomy: requires-approval
  portable: true
  cadence: on-demand
  mcp_tool: design_distill_corpus
---

# Distil Corpus

## Purpose

Read a batch of screenshots of the live product website and app and grow the design corpus from them: file each image, record it, and update the distilled reference documents with what the batch reveals about layout, channels, components and user journeys. Over time this is how the suite learns how your brand actually designs, and how new rule candidates surface with real evidence behind them.

This skill **writes files and moves images**, so it is `requires-approval`. It shows the plan (what it will file where, what it will write) and waits for a go before touching `design-corpus/`.

## Preconditions

1. `design-corpus/` exists with `manifest/corpus-manifest.json`, `distilled/VERSION.md` and the `distilled/` tree (scaffolded in Phase 2).
2. One or more images are present in `design-corpus/raw/inbox/` (or a path given via `source`).
3. The DNA and rule set are loaded: `foundation/design-dna` (tldr) and `foundation/design-rules`. Classification and findings use them.
4. Vision is available to the running agent (it must be able to see the images). If not, stop and say so; this skill cannot run blind.

## Inputs

* `source` — folder to inventory. Default `design-corpus/raw/inbox/`.
* `batch_size` — max images to process in one run. Default 20. Larger batches are split across runs.
* `default_surface` — `web` | `ios` | `android` | `auto`. Default `auto` (classify per image).
* `dry_run` — when true, produce the plan and the proposed distilled diffs but move nothing and write nothing. Default true. The caller sets `dry_run: false` to apply.

## Procedure

### Step 1: Inventory and deduplicate

List image files under `source`. For each, compute a SHA-256 of the file bytes:

```bash
shasum -a 256 <file>
```

Cross-check each hash against `screens[].sha256` in `manifest/corpus-manifest.json`. Already-present hashes are **skipped** (idempotency: re-dropping the same screenshot does nothing). Report the skip count. Take up to `batch_size` new images.

### Step 2: Classify each image (vision)

Look at each new image and determine:

* **surface** — web, ios, or android, from chrome, status bar, proportions. If `default_surface` is not `auto`, use it and only override on strong evidence.
* **channel** — one of the thirteen (`home`, `uk`, `world`, `money`, `comment`, `business`, `sport`, `travel`, `puzzle`, `culture`, `obituaries`, `ireland`, `lifeAndStyle`), or `core` for brand/service surfaces (account, settings, subscribe), or `unknown`. Use masthead colour and section label as the signal; cross-check the channel hexes in `foundation/design-dna`.
* **journey** — a short slug for the flow the screen belongs to: `reader-journey`, `paywall-subscription`, `onboarding`, `live-blog`, `navigation-search`, or a new slug if none fit (note new slugs for review).

Low-confidence classifications are allowed; record them as `unknown` rather than guessing, and list them in the run report for a human to correct.

### Step 3: Plan the filing

For each new image, compute its destination and manifest entry. Filing convention:

```
design-corpus/raw/<surface>/<channel>/<YYYYMMDD>-<journey>-<shortslug>.<ext>
```

Date is the capture date if known (from the caller or image metadata), else the run date passed in by the caller (this skill does not read the clock itself). Present the full plan as a table: source filename → destination path → surface / channel / journey. **If `dry_run`, stop here and also show the proposed distilled-doc diffs from Step 5 without writing.** Otherwise request approval to proceed.

### Step 4: File and record

On approval, for each image:

1. Move it from `source` to its destination path (create `raw/<surface>/<channel>/` as needed).
2. Append a manifest entry:

```json
{
  "sha256": "<hash>",
  "surface": "<surface>",
  "channel": "<channel>",
  "journey": "<journey>",
  "captured": "<ISO date or null>",
  "filed_path": "raw/<surface>/<channel>/<name>",
  "distilled_into": [],
  "added_in_corpus_version": <next version>
}
```

Write the manifest back as valid JSON (validate with `python3 -m json.tool`). `filed_path` records provenance even though the binary is gitignored.

### Step 5: Distil into the reference docs

This is the value. Reading the batch **together** (patterns emerge across screens, not within one), update the distilled documents:

* `distilled/layout-patterns.md` — grids and columns, card anatomy, page templates, density and rhythm actually used.
* `distilled/channel-styling.md` — how each channel's colour and tone play out; group by channel.
* `distilled/component-usage.md` — which DS components appear, in which variants, how often, and any divergence from the component contracts in `packages/tokens/docs/components/`.
* `distilled/ux-patterns/<journey>.md` — for each journey in the batch: screens in the flow, steps and decision points, states (loading, empty, error), components used.

Rules for writing observations:

* Every observation ends with `(corpus v<N> · <n> screens)` and the manifest `sha256` prefixes it draws from, per `foundation/corpus-guide`.
* **Append, do not overwrite.** Strengthen an existing observation by adding to its screen count and evidence; add new observations under the right heading. Never delete prior evidence.
* Describe, do not prescribe. "Section fronts lead with one large headline card then a 3-column list" is an observation. "Section fronts should..." is a rule, and rules live in `design-rules`.
* Update each touched screen's manifest `distilled_into` with the anchors it fed.

### Step 6: Propose rule candidates

Where an observation recurs with enough evidence (see the strength ladder in `foundation/corpus-guide`: 3+ screens is a pattern, 10+ across channels or surfaces is strong), append a candidate to `design-corpus/distilled/rules-candidates.md`:

```
- [ ] <CAT> · <one-line rule> · proposed <error|warning|info> · evidence: distilled/<doc>#<anchor> (corpus vN) · <n> screens · <date>
```

Only propose. Promotion into `foundation/design-rules.md` is a human decision. Never edit the design-rules tables from this skill.

### Step 7: Bump the version and report

Increment `corpus_version` in the manifest, and add a row to `distilled/VERSION.md` recording the run: version, date, screens added, surfaces, channels covered, docs touched, rules proposed. Then render the run report (Output Contract).

## Output Contract

```markdown
# Corpus Distillation — run <N>

> Date: <run date>
> Source: <source folder>
> Mode: <dry-run | applied>

## Batch

| Metric | Value |
|---|---|
| Images found | <n> |
| Already in corpus (skipped) | <n> |
| Processed this run | <n> |
| Left for next run | <n> |
| Unknown classifications (need review) | <n> |

## Filed

| Source | Destination | Surface | Channel | Journey |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## Distilled

- <doc#anchor>: <one-line of what changed> (+<n> screens)
- ...

## Rule candidates proposed

- <CAT> · <rule> · <severity> · <n> screens
- ...

## Corpus now at v<N>
```

Followed by the machine-readable summary:

```json
{
  "skill": "design/corpus/distill-corpus",
  "corpus_version": <N>,
  "processed": <n>,
  "skipped": <n>,
  "docs_touched": ["<path>", "..."],
  "candidates_proposed": <n>,
  "artifacts": ["design-corpus/manifest/corpus-manifest.json", "design-corpus/distilled/VERSION.md"]
}
```

## Error Handling

* **No images in source.** Return `info`: "nothing to distil". Not an error.
* **Vision unavailable.** Stop. This skill cannot classify or distil without seeing the images.
* **Manifest invalid JSON after write.** Restore the pre-run manifest, stop, and report. Never leave the manifest unparseable; the whole corpus keys on it.
* **Ambiguous channel or surface.** Record `unknown`, file under `raw/<surface>/unknown/` or `raw/unknown/<channel>/` as appropriate, and list for human correction. Do not force a guess into the evidence.
* **A raw image would be committed.** The gitignore covers `design-corpus/raw/**`; if a filing path falls outside it, stop and report rather than risk committing subscriber or unreleased content.
* **Batch too large.** Process `batch_size`, report the remainder, and leave it in `source` for the next run.

## Composition

* `compose_after`: `design/foundation/design-dna`, `design/foundation/design-rules`, `design/foundation/corpus-guide`
* `compose_before`: `design/ui/design-critique`, `design/ux/flow-design`, `design/ux/pattern-library`
* `calls`: vision on the running agent; `python3` for hashing and JSON

## Related skills

* `../foundation/corpus-guide.md` — the citation contract for what this skill writes
* `../foundation/design-rules.md` — where strong candidates get promoted
* `../ui/design-critique.md` — consumes both the rules and the corpus evidence
