---
name: handoff-flow
description: End-to-end orchestrator for the design skill suite. Runs every check and produces a complete handoff packet for a feature in one guided pass, stopping between phases for confirmation. Persists every artefact to `.design/<feature>/`. Use this when handing a new design to engineering for the first time; use individual skills for spot checks or re-runs.
license: MIT
metadata:
  category: design/handoff
  pillar: handoff
  agents: [Designer, Design Engineer, PM, Architect]
  autonomy: requires-approval
  portable: true
  cadence: on-demand
---

# Handoff Flow (orchestrator)

## Purpose

Drive the full design pipeline for a single feature from one entry point. The orchestrator runs each upstream skill in the right order, pauses between phases so a human can review intermediate outputs, and ends with a finished `PACKET.md` ready to attach to a ticket.

This skill is the daily entry point for someone who has just finished a design and wants the whole machine to run. For day-to-day spot checks (e.g. just an a11y pass), use the individual skills directly.

## Preconditions

1. Figma Console MCP is connected. The **Mandatory User Gate** applies for Figma URLs; see `figma-integration/figma-console-mcp-integration.md`.
2. DS Tokens MCP is running.
3. All Phase 1, 2 and 3 skills are present in the local repo. The orchestrator will not run if any required skill is missing.
4. The feature has a clear name (used as the `.design/<feature>/` folder name).

## Inputs

Required:

* `feature_name` — short kebab-case name, e.g. `comments-modal`, `homepage-hero`. Used as folder and packet title.
* `figma_url_or_node` — the entry frame. If the feature includes a light and a dark frame, pass the light one here and use `dark_figma_url` below.

Optional:

* `dark_figma_url` — required if light/dark parity will run.
* `ticket_id` — JIRA/Linear/GitHub ID to embed in the packet.
* `include_critique` — boolean, default true for the first run of a feature, false for re-runs.
* `interactive` — boolean, default true. When true, the orchestrator pauses for confirmation between phases. When false, it runs straight through and reports.
* `skip` — list of skill names to skip (e.g. `["ui/design-critique"]`).

## Procedure

The orchestrator runs in six phases. Each phase produces a file in `.design/<feature>/`. Between phases (when `interactive` is true), the orchestrator presents a summary and asks: continue, re-run last phase, or stop.

### Phase A: Preflight

1. Confirm Figma MCP readiness.
2. Run the **Mandatory User Gate** for the Figma URL.
3. Confirm Token MCP responsive.
4. Create `.design/<feature>/` if it does not exist.
5. Write `.design/<feature>/MANIFEST.md` capturing inputs, run start time, and the orchestrator version.

### Phase B: Token mapping audit

1. Run `ui/token-mapping-audit.md` against the light frame. Output: `TOKEN_AUDIT_LIGHT.md`.
2. If `dark_figma_url` provided, run again against dark. Output: `TOKEN_AUDIT_DARK.md`.
3. Pause: present the summary tables and ask: continue, re-run, stop.
4. Stop conditions: error severity in unmapped values (more than 20% of captured values), or scope confusion. The orchestrator stops and asks for human triage.

### Phase C: State matrix

1. Run `ui/state-matrix.md` against the entry frame (or the component set parent if the entry frame is a single variant).
2. Output: `STATE_MATRIX.md`.
3. Pause: present the matrix. Highlight any "not implemented" states.

### Phase D: Quality checks

Run these three concurrently (no dependency between them):

1. `ui/a11y-check.md` → `A11Y_CHECK.md`
2. `ui/content-style-check.md` → `CONTENT_STYLE.md`
3. `ui/design-critique.md` if `include_critique` → `CRITIQUE.md`

After all three complete, pause. Present the combined error count and ask: continue, re-run any, stop.

### Phase E: Light/dark parity (conditional)

1. Skip if no `dark_figma_url`.
2. Otherwise run `ui/light-dark-parity.md`. Output: `PARITY.md`.
3. Pause: present.

### Phase F: Spec and packet

1. Run `handoff/frame-to-spec.md` against the entry frame. Output: `SPEC.md`.
2. Run `handoff/spec-packet.md` with all upstream artefacts present. Output: `PACKET.md` and `INDEX.md`.
3. If `ticket_id` provided, also write `ticket-<ticket_id>.md` as an alias to `PACKET.md`.
4. Final summary: list every file in `.design/<feature>/`, total error/warning/info counts, total elapsed time.

## Output Contract

The orchestrator does not produce a single file as its primary output. Its output is the populated `.design/<feature>/` folder, anchored by `PACKET.md`. The orchestrator's *summary* file is `.design/<feature>/RUN_LOG.md`, structured as follows:

```markdown
# Handoff Flow Run Log — [Feature Name]

> Started: <ISO timestamp>
> Ended: <ISO timestamp>
> Orchestrator version: <semver>
> Run mode: <interactive | non-interactive>
> Phases skipped: <list>

## Inputs

- Feature: <name>
- Light Figma: <url>
- Dark Figma: <url or "not provided">
- Ticket: <id or "not set">
- Include critique: <true | false>

## Phase log

| Phase | Skill | Status | Duration | Output file | Errors | Warnings |
|---|---|---|---|---|---|---|
| A | preflight | ok | 2s | MANIFEST.md | 0 | 0 |
| B | token-mapping-audit (light) | ok | 12s | TOKEN_AUDIT_LIGHT.md | 0 | 3 |
| B | token-mapping-audit (dark) | ok | 11s | TOKEN_AUDIT_DARK.md | 0 | 2 |
| C | state-matrix | ok | 8s | STATE_MATRIX.md | 1 | 0 |
| D | a11y-check | ok | 18s | A11Y_CHECK.md | 0 | 4 |
| D | content-style-check | ok | 6s | CONTENT_STYLE.md | 2 | 7 |
| D | design-critique | ok | 14s | CRITIQUE.md | 0 | 6 |
| E | light-dark-parity | ok | 9s | PARITY.md | 1 | 0 |
| F | frame-to-spec | ok | 11s | SPEC.md | - | - |
| F | spec-packet | ok | 4s | PACKET.md | - | - |

## Decisions taken during run

A list of every "continue", "re-run", or "stop" decision the user made, with timestamps.

## Final state

- Packet: `.design/<feature>/PACKET.md`
- Total errors across all checks: <n>
- Total warnings: <n>
- Total info: <n>
- Open questions: <n>

## What to do next

If errors > 0: address the open questions, fix the design, re-run.
If errors == 0: attach PACKET.md to ticket <id> and notify engineering.
```

## Error Handling

* **Required skill missing.** Stop at preflight, report which skill is missing and where it should live.
* **A required upstream produces fatal errors.** Pause, present the errors, ask the human whether to fix and re-run or skip and continue.
* **Figma MCP disconnects mid-run.** Pause, prompt to reconnect (per the recovery sequence in `figma-integration/figma-console-mcp-integration.md`), then re-run the interrupted phase.
* **Light and dark frame mismatch (clearly different components).** Stop at Phase F, ask for the correct dark frame.
* **Long-running phase.** If any single phase exceeds 5 minutes, surface a warning. The skill set is designed for sub-minute phases per component.

## Composition

* `compose_after`: every Phase 1, 2 and 3 skill exists and is reachable.
* `compose_before`: nothing (this is the top of the flow).
* `calls`: all six handoff and quality skills, in the order documented above.

## Related Skills

* `./frame-to-spec.md`
* `./token-mapping-audit.md`
* `./state-matrix.md`
* `./spec-packet.md`
* `../ui/design-critique.md`
* `../ui/a11y-check.md`
* `../ui/content-style-check.md`
* `../ui/light-dark-parity.md`
* `../../coordination/handoff-protocol.md` — the underlying agent-to-agent handoff convention

## Autonomy note

This skill is marked `requires-approval` because it can trigger writes to `.design/<feature>/` and (in future phases) component scaffolds. The interactive pauses are the approval mechanism. In `interactive: false` mode, treat the skill as a CI/scheduled task and run it only on stable designs.
