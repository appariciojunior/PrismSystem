---
name: usage-report
description: Weekly usage report for the Design System AI suite. Reads the week's append-only usage.jsonl (and optionally the previous four weeks), computes totals by skill, agent and entry point, top routes, artefacts produced, outcome breakdown, the friction list (rejected, retry-after-wizard, abandoned) and week-over-week deltas, then writes USAGE-REPORT.md into the weekly folder with up to three data-backed upgrade suggestions. Numbers are computed by a deterministic python3 script, never estimated.
license: MIT
metadata:
  category: coordination/telemetry
  pillar: telemetry
  agents: [PM, Design Engineer, Architect]
  autonomy: autonomous
  portable: true
  cadence: weekly
  mcp_tool: usage_report
---

# Usage Report

## Purpose

Turn a week of `usage.jsonl` lines into one page the team actually reads: what got used, through which door, what got made, where the suite failed people, and up to three concrete upgrades the data supports. The report is derived and regenerable; the log is the source of truth. Its job is to make the friction list boring to produce and hard to ignore, while staying honest that every "did not help" number is a proxy, not a verdict.

## Preconditions

1. The `coordination/usage-log` convention is in place and `packages/tokens/.agents/weekly/` exists.
2. `python3` is available. Every number in the report comes from the counting script in Step 2; if the script cannot run, the report does not get written.
3. The run starts from the repo root (the script uses repo-relative paths).

## Inputs

* `week` - ISO week to report on, `<year>-W<nn>`. Default: the current ISO week, UTC.
* `lookback` - how many previous weeks to include in the deltas table. Default 4. Set 0 to disable.
* `min_evidence` - minimum events in a friction cluster before it may generate an upgrade suggestion. Default 3.

## Procedure

### Step 1: Resolve the week

Default week in shell: `date -u +%G-W%V` (`%G`, never `%Y`, or year-boundary weeks land wrong). The input file is `packages/tokens/.agents/weekly/<week>/usage.jsonl`; the output file is `USAGE-REPORT.md` in the same folder. Overwriting a previous report for the same week is fine: it is derived, and rerunning on the same log is deterministic.

### Step 2: Compute the numbers

Run this from the repo root. It prints ready-to-paste markdown. The rule is absolute: every number in the report comes from this output. If the script did not print it, it does not go in the report. No estimating, no counting by eye, no "roughly".

```bash
week="${1:-$(date -u +%G-W%V)}"
lookback=4
python3 - "packages/tokens/.agents/weekly" "$week" "$lookback" <<'PY'
import collections, datetime, json, os, sys

root, week, lookback = sys.argv[1], sys.argv[2], int(sys.argv[3])

def load(wk):
    rows, bad = [], 0
    try:
        with open(os.path.join(root, wk, "usage.jsonl"), encoding="utf-8") as fh:
            for raw in fh:
                raw = raw.strip()
                if not raw:
                    continue
                try:
                    row = json.loads(raw)
                except json.JSONDecodeError:
                    bad += 1
                    continue
                if isinstance(row, dict):
                    rows.append(row)
                else:
                    bad += 1
    except OSError:
        pass
    return rows, bad

def split(rows):
    feedback = [r for r in rows if r.get("event") == "feedback"]
    work = [r for r in rows if r.get("event") != "feedback"]
    nested = [r for r in work if r.get("skill") and r.get("agent")]
    top = [r for r in work if not (r.get("skill") and r.get("agent"))]
    return top, nested, feedback

def tally(key, src):
    c = collections.Counter()
    for r in src:
        c[r.get(key) or "(none)"] += 1
    return c

def table(title, counter):
    print(f"\n### {title}\n\n| Value | Runs |\n|---|---|")
    for k, v in counter.most_common():
        print(f"| {k} | {v} |")

rows, bad = load(week)
top, nested, feedback = split(rows)
print(f"Week {week}: {len(rows)} lines, {len(top)} top-level runs, "
      f"{len(nested)} nested skill lines, {len(feedback)} feedback events, "
      f"{bad} malformed skipped")

table("By skill (all skill lines)", tally("skill", [r for r in top + nested if r.get("skill")]))
table("By agent", tally("agent", [r for r in top if r.get("agent")]))
table("By entry point (top-level runs)", tally("entry", top))
table("Top routes (top-level runs)", tally("route", top))
table("Outcome breakdown (top-level runs)", tally("outcome", top))

arts = [a for r in top + nested for a in (r.get("artifacts") or [])]
print(f"\nArtefacts: {len(arts)} produced, {len(set(arts))} unique. By file name:")
for name, n in collections.Counter(os.path.basename(a) for a in arts).most_common(10):
    print(f"- {name} x{n}")

retries = [r for r in top if r.get("retry_after_wizard") is True]
abandoned = [r for r in top if r.get("outcome") == "abandoned"]
feats_with_art = {r.get("feature") for r in top + nested if r.get("artifacts")}
inferred = [r for r in top
            if r.get("entry") == "design-start" and not r.get("artifacts")
            and r.get("outcome") != "abandoned"
            and r.get("feature") not in feats_with_art]

def friction_row(name, src):
    feats = ", ".join(f"{k} x{v}" for k, v in tally("feature", src).most_common()) or "none"
    print(f"| {name} | {len(src)} | {feats} |")

print("\n### Friction\n\n| Signal | Count | Features |\n|---|---|---|")
friction_row("rejected", feedback)
friction_row("retry_after_wizard", retries)
friction_row("abandoned (logged)", abandoned)
friction_row("abandoned (inferred)", inferred)
for r in feedback:
    who = r.get("skill") or r.get("agent") or "manual"
    print(f"- rejected: {who} / {r.get('feature') or '(none)'}: {r.get('reason') or '(no reason)'}")

y, w = int(week[:4]), int(week.split("W")[1])
monday = datetime.date.fromisocalendar(y, w, 1)
weeks = [week] + [
    "{0}-W{1:02d}".format(*(monday - datetime.timedelta(weeks=k)).isocalendar()[:2])
    for k in range(1, lookback + 1)
]
print("\n### Week over week\n\n| Week | Runs | Completed | Friction | Completion |\n|---|---|---|---|---|")
for wk in weeks:
    r2, _ = load(wk)
    t2, n2, f2 = split(r2)
    comp = sum(1 for r in t2 if r.get("outcome") == "completed")
    fr = len(f2) + sum(1 for r in t2
                       if r.get("outcome") == "abandoned" or r.get("retry_after_wizard") is True)
    pct = f"{round(100 * comp / len(t2))}%" if t2 else "n/a"
    print(f"| {wk} | {len(t2)} | {comp} | {fr} | {pct} |")
PY
```

Counting definitions the script encodes, so humans can audit it:

* **Top-level run**: any non-feedback line except nested skill lines (a nested line has both `skill` and `agent` set; it is a skill running inside an agent). This keeps an agent run plus its four composed skills from counting as five runs.
* **Feedback events** (`event: "feedback"`, `outcome: "rejected"`) are judgements about earlier runs and are excluded from run totals.
* **Friction** = rejected + `retry_after_wizard` + abandoned. A single run carrying two flags counts twice in friction rows; the honesty notes say so.
* **Abandoned (inferred)** = a `design-start` line not already logged abandoned, with no artefacts of its own and whose feature produced no artefact all week: the wizard ran, nothing came out.

### Step 3: Assemble the report

Fill the template in the Output Contract from the script's output, in order, keeping the tables verbatim. Add one sentence of plain prose under each section at most; the numbers carry the report.

### Step 4: Generate the upgrade suggestions

Up to three, generated from the data, by these rules:

1. Rank friction clusters by size: rejected reasons grouped by skill, retries grouped by route or feature, abandonment grouped by skill or wizard step.
2. Only a cluster with at least `min_evidence` events may generate a suggestion. Fewer than three qualifying clusters means fewer than three suggestions; say so rather than padding.
3. Every suggestion must cite a number from Step 2, name the skill, route or wizard step involved, propose exactly one change, and name the file to edit.

The shape, with worked examples:

> `ui/token-mapping-audit` was abandoned 4 times this week, all on runs where G4 asked for a Figma tab: consider making the screenshot fallback more prominent in the G4 copy. Edit: `design/design-router.md`.

> `retry_after_wizard` fired 3 times on route `new-experience`: the wizard's G2 options may not match what designers mean by "a whole page or flow". Consider a fourth G2 option. Edit: `design/design-router.md`.

> 2 of 3 rejected reasons name dark-theme contrast advice: consider having `ui/a11y-check` require the light/dark declaration before scoring contrast. Edit: `design/ui/a11y-check.md`.

Suggestions are hypotheses for a maintainer, not orders. The report proposes; a human decides and edits.

### Step 5: Write and log

Write the report to `packages/tokens/.agents/weekly/<week>/USAGE-REPORT.md`. Then this skill takes its own medicine: append one usage line per `coordination/usage-log` (typically `entry: "direct"`, `skill: "coordination/usage-report"`, the report path in `artifacts`), silently, best effort.

## Output Contract

```markdown
# Usage Report: <year>-W<nn>

> Week: <year>-W<nn>
> Generated: <ISO timestamp>
> Lines read: <n> (malformed skipped: <n>)
> Top-level runs: <n> (nested skill lines: <n>, feedback events: <n>)
> Weeks compared: <list, or "none">

## Totals

### By skill

| Value | Runs |
|---|---|
| design/ui/design-critique | 14 |

### By agent

| Value | Runs |
|---|---|
| critique-agent | 5 |

### By entry point

| Value | Runs |
|---|---|
| design-start | 11 |
| direct | 9 |

## Top routes

| Value | Runs |
|---|---|
| ui-craft | 12 |

## Artefacts produced

<n> artefacts (<n> unique). Most common:

- CRITIQUE.md x6
- PACKET.md x2

## Outcome breakdown

| Value | Runs |
|---|---|
| completed | 18 |
| partial | 3 |
| failed | 1 |
| abandoned | 2 |

## Friction list

| Signal | Count | Features |
|---|---|---|
| rejected | 2 | saved-articles x2 |
| retry_after_wizard | 3 | saved-articles x2, live-blog x1 |
| abandoned (logged) | 2 | events-landing x2 |
| abandoned (inferred) | 1 | (none) x1 |

Rejected reasons, verbatim from the log:

- rejected: design/ui/a11y-check / saved-articles: contrast advice ignored the dark theme

## Week over week

| Week | Runs | Completed | Friction | Completion |
|---|---|---|---|---|
| 2026-W29 | 24 | 18 | 8 | 75% |
| 2026-W28 | 19 | 16 | 3 | 84% |

## Upgrade suggestions

1. <suggestion citing a number, naming the skill or step, proposing one change, naming the file>
2. ...
3. ...

## Honesty notes

These numbers are proxies, not verdicts. Rejection requires a human to say so, and most people say nothing; retry_after_wizard guesses intent from a 60-minute window and also catches legitimate follow-up checks; abandonment cannot tell "the tool failed me" from "lunch", and runs whose session simply ended are invisible, so both abandonment counts are floors. A run can carry two friction flags and count twice. Read trends across weeks, not single events, and never read this table as a performance measure of any person. A quiet week can mean low usage or low logging; both are worth asking about in the open.
```

Followed by the machine-readable summary:

```json
{
  "skill": "coordination/usage-report",
  "week": "<year>-W<nn>",
  "runs": <n>,
  "friction": {"rejected": <n>, "retry_after_wizard": <n>, "abandoned": <n>},
  "suggestions": <0 to 3>,
  "artifacts": ["packages/tokens/.agents/weekly/<year>-W<nn>/USAGE-REPORT.md"]
}
```

## Error Handling

* **`usage.jsonl` missing or empty.** Still write the report, with zeros and no suggestions, plus one line noting that an empty week is itself a signal: either the suite went unused or the logging convention is not being followed. Both are findings, not failures.
* **`python3` unavailable.** Stop and say so. Do not hand-count; a wrong report is worse than a late one.
* **Malformed lines.** Skipped and counted by the script. If they exceed 10 percent of lines read, the first upgrade suggestion writes itself: fix whichever appender is emitting broken JSON (the count and the week narrow it down).
* **A previous week's folder is missing.** The script prints it as a zero row; keep it, and note under Week over week that a zero row means "no log for that week", which is not the same as zero usage. Do not backfill or interpolate.
* **No friction cluster reaches `min_evidence`.** Output fewer than three suggestions, or none, and say why. Never invent a suggestion to fill the list.
* **Tempted to soften the friction list.** Do not. The friction list is the point of the report; a flattering report teaches the team nothing and erodes trust in the numbers.

## Composition

* `compose_after`: `coordination/usage-log`, whose lines are the sole input.
* `compose_before`: `design/ui/monthly-audit` (critique scores and usage trends are read together at month end); `coordination/release-process` (friction clusters feed the backlog discussion).
* `calls`: `python3` for deterministic counting; a shell append for its own usage line.

## Related skills

* `usage-log.md` - the append convention, field schema and privacy rules this report depends on
* `../../design/design-router.md` - where wizard-step friction findings usually point for the fix
