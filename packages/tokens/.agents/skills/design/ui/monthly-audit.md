---
name: monthly-audit
description: Roll up every design finding across all features touched in the last month into a single Markdown report with trends, top issues by category, and an action list. Designed to run on a scheduled task and post the digest to Slack via coordination/slack-announcements.
license: MIT
metadata:
  category: design/ui
  pillar: ui
  agents: [Designer, PM, Design Engineer, Architect]
  autonomy: autonomous
  portable: true
  cadence: monthly
---

# Monthly Audit

## Purpose

The individual quality skills (`design-critique`, `a11y-check`, `content-style-check`, `light-dark-parity`, `motion-review`) produce per-feature reports. Useful per feature, but they do not tell you whether the team is improving over time, whether one category of issue keeps recurring, or where the system-level gaps are.

This skill walks every feature folder under `.design/` from the last 30 days, aggregates the findings, and produces a single monthly digest with trends and an action list. Output is designed to be readable by a PM in five minutes and to feed straight into a retro or system-health discussion.

## Preconditions

1. `.design/` exists at the repo root and contains feature folders from the audit window.
2. Quality skill outputs (`CRITIQUE.md`, `A11Y_CHECK.md`, `CONTENT_STYLE.md`, `PARITY.md`, `MOTION_REVIEW.md`) are present in those folders. Missing reports are noted, not synthesised.
3. Optionally, a prior month's `MONTHLY_AUDIT.md` exists for trend comparison.

## Inputs

Required: none.

Optional:

* `start_date` — ISO date, default 30 days before today.
* `end_date` — ISO date, default today.
* `previous_month_audit_path` — for trend comparison. Defaults to looking up the most recent prior audit in `.design/audits/`.
* `slack_post` — boolean, default false. When true, formats the summary via `coordination/slack-announcements.md` and writes the announcement file. Posting is a separate manual step.
* `output_path` — defaults to `.design/audits/MONTHLY_AUDIT_<YYYY-MM>.md`.

## Procedure

### Step 1: Enumerate features in window

Walk `.design/` and list every subfolder whose RUN_LOG.md (or any quality report) has a timestamp within the window.

For each feature, capture:

* Feature name.
* Date of most recent run.
* Files present.
* Run mode (if RUN_LOG.md is available).

### Step 2: Aggregate findings by category

For each feature, parse the quality reports and aggregate findings by:

* Category (a11y, content-style, design-critique, parity, motion).
* Severity (error, warning, info).
* Sub-category where present (e.g. for design-critique: hierarchy / spacing / alignment / density / reuse / channel).

Build a table per category with counts.

### Step 2b: Capture scores

Each `CRITIQUE.md` (and, when the critique-agent ran, the consolidated report) ends with a JSON summary carrying a `score` and `subscores` per `foundation/design-rules.md`. Read those. Record per feature:

* Overall structural score (0–100) and band.
* The eight (or five, standalone) category subscores.

These are the headline trend the audit exists to move. A month where finding counts fall but scores also fall means the easy findings were fixed and the hard ones remain; the score keeps the audit honest about that.

### Step 3: Identify recurring issues

For each (category, sub-category, rule) tuple, count how often it appears across features. Surface the top 10 recurring rules as "system-level issues" - things that are not a single-feature problem but a pattern problem.

Examples:
* "Spacing rhythm: half-step values" appearing in 7 of 12 features → system pattern.
* "Light/dark parity: missing dark variant" appearing in 3 of 4 new components → system pattern.

### Step 4: Trend comparison (when prior audit exists)

Compare the current month's counts to the prior month's:

* **Mean structural score**: this month vs last, as points moved. This is the headline number.
* Score distribution: how many features are ship-ready (90+) vs rework (<50).
* Per rule-category subscore: which categories improved, which regressed.
* Total findings: trend (up, down, flat).
* Top recurring issues: still in top 10? new entries? departed entries?

If no prior audit exists, skip this step and note "first month, no trend baseline".

### Step 5: Build the action list

From the system-level issues and the trend data, propose 3-5 concrete actions:

* If a recurring issue is a design rule, propose a Figma file cleanup or a designer-side reminder.
* If a recurring issue is a token gap, propose a token change via `governance/token-modification-gates.md`.
* If a recurring issue is a skill gap (e.g. content-style-check did not catch X), propose a skill improvement ticket.

Each proposed action gets an owner suggestion (which role should own it).

### Step 6: Compose the digest

Write the report in the **Output Contract** below.

### Step 7: Optional Slack announcement

If `slack_post: true`, format a short version of the digest (summary section + top three actions) via `coordination/slack-announcements.md`. The output is a `.md` file at `.design/audits/SLACK_<YYYY-MM>.md` ready to copy or post. The skill itself does not post.

## Output Contract

```markdown
# Monthly Design Workflow Audit — <YYYY-MM>

> Window: <start_date> to <end_date>
> Features audited: <n>
> Reports parsed: <n>
> Compared against: <previous month or "first month">

## Headline

A single sentence summarising the month, with a trend indicator.

Example: "12 features audited, mean structural score 84 (up 6 from last month), total findings down 18%. Spacing rhythm remains the top recurring issue."

## Scores

| Metric | This month | Last month | Change |
|---|---|---|---|
| Mean structural score | <n>/100 | <n>/100 | <±n> |
| Ship-ready (90+) | <n>/<total> | <n>/<total> | <±n> |
| Rework (<50) | <n>/<total> | <n>/<total> | <±n> |

| Rule category | Mean subscore | Change |
|---|---|---|
| TYP | <n> | <±n> |
| COL | <n> | <±n> |
| SPC | <n> | <±n> |
| CMP | <n> | <±n> |
| A11Y | <n> | <±n> |
| UX | <n> | <±n> |
| MOT | <n> | <±n> |
| BRD | <n> | <±n> |

## Totals

| Category | Errors | Warnings | Info | Total |
|---|---|---|---|---|
| design-critique | <n> | <n> | <n> | <n> |
| a11y-check | <n> | <n> | <n> | <n> |
| content-style-check | <n> | <n> | <n> | <n> |
| light-dark-parity | <n> | <n> | <n> | <n> |
| motion-review | <n> | <n> | <n> | <n> |
| **Total** | <n> | <n> | <n> | <n> |

## Trend (vs <previous month>)

| Category | This month | Last month | Change |
|---|---|---|---|
| ... | ... | ... | -X% |

## Top recurring issues (top 10)

| Rank | Category | Rule | Features affected | Severity |
|---|---|---|---|---|
| 1 | design-critique / spacing rhythm | "half-step values" | 7/12 | warning |
| 2 | a11y-check / contrast | "borderline AA pass" | 5/12 | warning |
| ... | ... | ... | ... | ... |

## System-level themes

A short prose section (3-5 paragraphs max) on the themes that emerge from the recurring issues. What is the system telling us? Where are designers consistently tripping on the same rule?

## Proposed actions

| # | Action | Why | Suggested owner | Effort |
|---|---|---|---|---|
| 1 | Add half-step spacing values as forbidden tokens in `design-critique` ruleset | 7/12 features hit this | Design systems lead | small |
| 2 | Audit and add missing dark variants for components landed this month | parity issue in all new components | Design engineer | medium |
| 3 | Skill improvement: content-style-check missed several "DS" abbreviations | post-hoc detection | Skills maintainer | small |

## Per-feature appendix

For each feature in the window:

### <feature_name>

- Latest run: <date>
- Findings: errors <n> / warnings <n> / info <n>
- Top issue: <rule that contributed most findings>
- Status: <handed off | in design | shipped>

## Provenance

- Skill version: <semver>
- Tokens snapshot: <git sha at audit time>
- Reports parsed:
  - `.design/<feature>/CRITIQUE.md` × <n>
  - `.design/<feature>/A11Y_CHECK.md` × <n>
  - `.design/<feature>/CONTENT_STYLE.md` × <n>
  - `.design/<feature>/PARITY.md` × <n>
  - `.design/<feature>/MOTION_REVIEW.md` × <n>
```

## Error Handling

* **No features in window.** Return early with a single-line audit: "no features audited in window". Not an error.
* **Some reports missing.** Continue. Note in provenance which reports were missing per feature.
* **No prior audit for trend.** Note "first month" and skip trend section.
* **Aggregation overflow.** If total findings exceed 10,000, truncate the per-feature appendix to the top 20 most-flagged features and surface "audit window includes very high finding count, consider weekly cadence" as `info`.

## Composition

* `compose_after`: all `ui/*` skills, `motion/motion-review`
* `compose_before`: `coordination/slack-announcements` (optional, when `slack_post: true`)
* `calls`: `coordination/slack-announcements`

## Related Skills

* `./design-critique.md`, `./a11y-check.md`, `./content-style-check.md`, `./light-dark-parity.md`, `./motion-review.md` — the sources this skill rolls up
* `../../coordination/slack-announcements.md` — the formatting for the Slack version
* `../../coordination/release-process.md` — overlapping monthly rhythm; the audit feeds release decisions

## Known drift (re-surface every month)

Standing items the system knows about but has deliberately deferred. The audit lists these each month so they are re-decided, not forgotten. Remove an item when it is fixed or accepted for good.

| Item | What | Where | Status |
|---|---|---|---|
| Grid columns | Docs say Large = 10 columns, `tokens.json` says 12 | `packages/tokens/docs/reference/grid.md` vs tokens | Open — product decision |
| Button `xlarge` | Documented size not present in the React component | `packages/tokens/docs/components/button/` vs code | Open — component team |
| Code Connect | `figma.config.json` carries starter-template substitutions (foreign file `YOUR-FIGMA-FILE-KEY`); no `.figma.tsx` files exist | `figma.config.json` | Open — flagged in-file for design-team verification |
| Motion tokens | No motion tokens in `tokens.json`; `motion/*` and MOT rules stay scaffolded / downgraded | `packages/tokens/src/tokens.json` | Open — blocks motion pillar going live |
| Legacy bindings in design vision | Legacy tokens (`NK-*`) and legacy theme variables observed bound in vision files | Home page v2 critique | Open — migrate to DS semantics |

## Scheduling note

This skill is the recommended target for a monthly scheduled task. The cadence-agent (proposed in `design/README.md`) runs this skill on the first working day of each month, then triages the proposed actions with the team.
