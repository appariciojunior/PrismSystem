---
name: usage-log
description: The append-only usage telemetry convention for the Design System AI suite. Every skill and agent run appends exactly one JSON line to the current week's usage.jsonl as its final act, recording what ran, from which entry point, what it produced and how it ended. Also defines the honest "did not help" signals, an explicit /feedback rejection, the retry-after-wizard flag, and abandonment, all as noisy proxies to be read as trends. Plain files only, no server, no network, and logging never blocks the actual work.
license: MIT
metadata:
  category: coordination/telemetry
  pillar: telemetry
  agents: [Designer, Design Engineer, PM, QA, Architect]
  autonomy: autonomous
  portable: true
  cadence: every-run
  mcp_tool: usage_log
---

# Usage Log

## Purpose

One line per run, appended to a plain file, so that once a week the team can see what the suite actually did: which skills and agents ran, which door people came in through, what got produced, and, honestly, where the suite did not help and the designer went round it.

Everything is local files inside the repo. No server, no network analytics, no telemetry endpoints of any kind; this is a subscriber-sensitive environment and the log records metadata only. The convention is deliberately tiny so that all four IDE surfaces (Claude Code, Cursor, Copilot, Codex) can follow it with nothing more than a shell append. And the first law of this skill: telemetry never costs the user anything. If the append fails for any reason, skip it silently and carry on with the real work.

## Preconditions

1. The repo checkout is writable and `packages/tokens/.agents/weekly/` exists (it is the established home of the weekly changelogs). If either is false, this skill does nothing, silently; that is not an error.
2. The running agent knows its own run metadata (which skill or agent it is, how it was invoked, what it produced). It never asks the user for any of it.
3. A POSIX shell or `python3` is available for the append. Any tool that can append one line to a file is acceptable; the convention is the file and the line, not the tool.

## Inputs

All inputs come from the run itself, never from the user:

* `entry` - which door the run came through. See the table in Step 2. Required.
* `skill` / `agent` - what ran. At least one is usually set; both null only for the manual-prompting fallback line.
* `route`, `feature` - propagated from the router or the calling context when known, else null.
* `artifacts` - repo-relative paths produced by this run. Note the key is spelled `artifacts`: it matches the machine keys every skill summary already emits. Prose in this suite says artefact; the wire format does not.
* `outcome` - how the run ended. See Step 2.

## Procedure

### Step 1: Resolve the week file

The log lives beside the weekly changelog:

```
packages/tokens/.agents/weekly/<year>-W<nn>/usage.jsonl
```

`<year>-W<nn>` is the ISO week in UTC. In shell that is `date -u +%G-W%V`. Use `%G` (ISO year), never `%Y`, or the file lands in the wrong folder during the year boundary week.

### Step 2: Build the line

One run, one JSON object, one line. The fields:

| Field | Values | Notes |
|---|---|---|
| `ts` | ISO 8601 UTC, seconds precision | `null` if the clock is unavailable; never invent a time |
| `ide` | `claude-code`, `cursor`, `copilot`, `codex`, `unknown` | Whichever surface the agent is running in |
| `entry` | `design-start`, `design`, `direct`, `engineer-start` | See below |
| `skill` | full skill path, e.g. `design/ui/a11y-check`, or `null` | `null` on agent lines and manual-fallback lines |
| `agent` | agent name, e.g. `critique-agent`, or `null` | On a nested skill line, the parent agent's name |
| `route` | one of the five router routes, or `null` | |
| `feature` | kebab-case slug, or `null` | The `.design/<feature>/` slug |
| `artifacts` | array of repo-relative paths, may be empty | Paths only, never content, never URLs |
| `outcome` | `completed`, `partial`, `failed`, `abandoned` | `rejected` exists too but appears only on feedback event lines (Step 4) |

Entry values:

| `entry` | The run began from |
|---|---|
| `design-start` | The guided wizard: `/design-start`, or `/design` with no description |
| `design` | A typed router request: `/design <task>` |
| `direct` | A skill or agent called by name, or plain manual prompting with no suite skill at all (then `skill` and `agent` are both `null`) |
| `engineer-start` | The engineering side: `build-agent`, the code or testing briefs, or the token MCP workflow |

Outcome values:

* `completed` - the run finished its procedure and delivered its output contract.
* `partial` - it finished, but knowingly delivered less than the contract (for example contrast checks skipped because the token MCP was down).
* `failed` - it errored and delivered nothing usable.
* `abandoned` - the user stopped, cancelled or moved on mid-run, before the output existed.

Who appends what:

* A standalone skill run appends one line (`skill` set, `agent` null).
* An agent run appends one line for itself at the end (`agent` set, `skill` null), and each skill it composed appends its own line with both `skill` and the parent `agent` set. The weekly report uses this to count invocations without double counting.
* Manual design work with no suite involvement still appends a line: `entry: "direct"`, `skill` and `agent` null. This is the fallback signal; without it the report cannot see the suite being bypassed.
* This skill never logs itself. It is a convention, not a run.

### Step 3: Append, silently

The append is the last act of the run, after the skill's own JSON summary block is printed. Canonical one-liner, run from the repo root:

```bash
w=$(date -u +%G-W%V); d="packages/tokens/.agents/weekly/$w"; mkdir -p "$d" 2>/dev/null; printf '%s\n' '{"ts":"2026-07-20T09:21:40Z","ide":"claude-code","entry":"design-start","skill":"design/ui/a11y-check","agent":null,"route":"ui-craft","feature":"saved-articles","artifacts":[".design/saved-articles/A11Y.md"],"outcome":"completed"}' >> "$d/usage.jsonl" 2>/dev/null || true
```

Rules:

* One `printf` call, one trailing newline, so concurrent runs from different IDE sessions interleave whole lines rather than corrupt each other.
* The file is append-only. Never edit, rewrite, sort or deduplicate it. A correction is a new line; a malformed line is the report's problem to skip, not yours to fix.
* The shell payload is single-quoted, so the JSON must contain no single quotes. Run metadata never does; a `reason` field that would (for example an apostrophe) gets rephrased, or use the `python3` fallback:

```bash
python3 - <<'PY' 2>/dev/null || true
import datetime, json, os
line = {"ts": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "ide": "cursor", "entry": "direct", "skill": "design/ui/design-critique", "agent": None,
        "route": "ui-craft", "feature": "saved-articles",
        "artifacts": [".design/saved-articles/CRITIQUE.md"], "outcome": "completed"}
iso = datetime.datetime.now(datetime.timezone.utc).date().isocalendar()
d = os.path.join("packages/tokens/.agents/weekly", f"{iso[0]}-W{iso[1]:02d}")
os.makedirs(d, exist_ok=True)
with open(os.path.join(d, "usage.jsonl"), "a", encoding="utf-8") as fh:
    fh.write(json.dumps(line) + "\n")
PY
```

* If the append fails: skip it, say nothing to the user, do not retry more than once, do not write to any fallback location, and continue the actual work. A missing log line is a rounding error; a design run blocked by telemetry is a failure of this skill's whole design.

### Step 4: The "did not help" signals

We cannot read minds, so the suite does not pretend to know when it failed someone. It records three pragmatic proxies instead. All three are noisy. They are trends to watch across weeks, not verdicts on a run, a skill, or a person.

**(a) Explicit rejection: the `/feedback` convention.** When the user types `/feedback`, or says thumbs-down wording in the flow of work ("that did not help", "this is not helping", "wrong direction", "I will just do it myself"), the assistant appends a feedback event line: a copy of the judged run's `entry`, `skill`, `agent`, `route` and `feature`, plus:

```json
{"outcome": "rejected", "event": "feedback", "reason": "<one line>"}
```

The `reason` is one line, written by the assistant, about the suite's behaviour ("contrast advice ignored the dark theme", "route classified as handoff, user wanted a critique"). It summarises; it never quotes the user or the design. `event: "feedback"` marks the line as a judgement about an earlier run, not a run itself, so the report can keep run counts honest. Acknowledge the user in one sentence and move on; never interrogate them about their feedback.

**(b) Implicit rejection: `retry_after_wizard`.** Before appending any `entry: "direct"` line, read the tail of this week's `usage.jsonl` (`tail -n 40` is plenty). If the same `feature` has a `design-start` or `design` line with a `ts` within the previous 60 minutes, add `"retry_after_wizard": true` to the new line. The shape it catches: the wizard ran, and within the hour the user went round it, by name or by hand, on the same feature. The noise it carries: it also catches a designer doing a quick follow-up check after a perfectly good wizard run. That is why it is a counted flag, not an alarm.

**(c) Abandonment.** A wizard run that never reached an artefact. At log time: if the run visibly stops inside the conversation (the user cancels the wizard, says stop, or changes subject before providing the input G4 asked for), append the run's line with `outcome: "abandoned"`. If the session simply ends mid-run, nothing can be appended and that run is invisible; the weekly report additionally infers abandonment from `design-start` lines whose feature never produced an artefact. Both counts are floors, not totals, and neither can distinguish "the tool failed me" from "lunch".

### Step 5: Worked example

A morning on the `saved-articles` feature, as it lands in the file:

```json
{"ts":"2026-07-20T09:14:02Z","ide":"claude-code","entry":"design-start","skill":"design/design-router","agent":null,"route":"ui-craft","feature":"saved-articles","artifacts":[],"outcome":"completed"}
{"ts":"2026-07-20T09:21:40Z","ide":"claude-code","entry":"design-start","skill":"design/ui/a11y-check","agent":null,"route":"ui-craft","feature":"saved-articles","artifacts":[".design/saved-articles/A11Y.md"],"outcome":"completed"}
{"ts":"2026-07-20T09:48:11Z","ide":"claude-code","entry":"direct","skill":null,"agent":null,"route":null,"feature":"saved-articles","artifacts":[],"outcome":"completed","retry_after_wizard":true}
{"ts":"2026-07-20T09:52:30Z","ide":"claude-code","entry":"direct","skill":"design/ui/a11y-check","agent":null,"route":"ui-craft","feature":"saved-articles","artifacts":[],"outcome":"rejected","event":"feedback","reason":"contrast advice ignored the dark theme"}
```

Line 3 is the interesting one: the wizard ran at 09:14, and at 09:48 the same feature was worked on by plain prompting. That is the fallback signal this whole convention exists to catch.

## Privacy rules

Non-negotiable, because the log travels with git like every other weekly artefact:

* **Log names and metadata only**: skill paths, agent names, routes, feature slugs, repo-relative artefact paths, outcomes, timestamps.
* **Never log**: prompt text, requirements, design content or copy, token values or hex colours from the design under review, screenshots or references to image files outside the repo, Figma URLs or node ids, user names, email addresses, machine names.
* Feature slugs are the `.design/<feature>/` slugs already visible in the repo. If a feature name is itself sensitive (an unreleased editorial project), use a neutral slug for both the folder and the log; the mapping lives with the humans, not in the file.
* The `reason` field on feedback lines describes the suite, never the design, and never quotes anyone.
* Nothing in this convention transmits anything anywhere. The log is read by exactly one consumer, `coordination/usage-report`, locally.

## Output Contract

The primary output is the appended line itself, silent, in the schema of Step 2. This skill prints nothing during normal operation.

When invoked explicitly (a human asks to verify the convention, or to log a run by hand), it ends with the standard machine-readable summary:

```json
{
  "skill": "coordination/usage-log",
  "week": "<year>-W<nn>",
  "appended": true,
  "artifacts": ["packages/tokens/.agents/weekly/<year>-W<nn>/usage.jsonl"]
}
```

`appended: false` with no further comment is the correct summary when the append was skipped.

## Error Handling

* **Append fails** (read-only checkout, permissions, missing tree, full disk). Skip silently, continue the real work. Do not surface an error, do not retry beyond one attempt, do not write anywhere else.
* **A field is unknown.** Use `null`. Never guess, and never ask the user for logging metadata.
* **Clock unavailable.** `ts: null`. An unordered line beats an invented timestamp.
* **Quoting would break** (single quote in a payload via the shell method). Rephrase the field or use the `python3` fallback. Never let the append syntax interrupt the run.
* **The file looks corrupted or someone edited it.** Not your problem at log time. Append your line and move on; `usage-report` skips and counts malformed lines.
* **Tempted to log content** ("just this one headline for context"). No. If a signal cannot be expressed as metadata, it is not logged.

## Composition

* `compose_after`: every skill and agent in the library. This is the final step of every run, after the skill's own JSON summary.
* `compose_before`: `coordination/usage-report`, the sole consumer, weekly.
* `calls`: a POSIX shell append, or `python3` as fallback.

Adoption is one line added to every skill's Output Contract, immediately after its JSON summary block:

> Finally, append one usage line to the current week's `usage.jsonl` per `coordination/usage-log`. Silent, best-effort, never blocking.

## Related skills

* `usage-report.md` - turns a week of these lines into the weekly report and upgrade suggestions
* `../../design/design-router.md` - source of `entry`, `route` and `feature` for routed runs
