---
name: figma-console-mcp-integration
description: Canonical setup and runtime gate policy for Figma Console MCP. Use before any Figma task.
license: MIT
metadata:
  category: figma-integration
  agents: [Architect, Code, Testing, React Expert, Figma Executor]
  autonomy: autonomous
  portable: true
---

# Figma Console MCP Integration

## Purpose

Provide one canonical source for setup, mode behavior, mandatory user gate, and recovery playbook.

Runtime extraction sequencing is defined in `./design-extraction.md`.

## Mandatory User Gate for Figma Links

When a prompt includes a Figma URL, ask this before any Figma MCP call:

- Header: `Desktop Bridge Status`
- Prompt: `Before I continue with this Figma link, is the Figma Desktop Bridge plugin currently running in that file?`
- Options: `Running now`, `Not running`, `Not sure`
- `allowFreeformInput: true`

## Mode Contract

- Local mode + Desktop Bridge (`setup.valid: true`) is required for write operations.
- Remote mode is read-first; do not assume write parity.

## Dual-MCP Awareness (Mandatory)

Two Figma MCPs are available in this repo:

| MCP               | Tool prefix           | Write capable                                                 |
| ----------------- | --------------------- | ------------------------------------------------------------- |
| Figma Console MCP | `mcp_figma-console_*` | **Yes** — `figma_execute`, all mutation tools                 |
| Figma Desktop MCP | `mcp_figma-desktop_*` | **No** — read-only (context, screenshot, metadata, variables) |

**Write path is Console MCP only.** Desktop MCP cannot be used as a write fallback.

If Console MCP write fails, the recovery sequence is:

1. Call `figma_reconnect` and verify response includes `"status": "reconnected"`.
2. Proceed immediately to `figma_execute` — do not run any intermediate diagnostic tools.
3. If `figma_execute` still fails, report the exact error and ask user to reload the Desktop Bridge plugin.

## Write Readiness Protocol

After `figma_reconnect` returns `"status": "reconnected"`, the bridge is live. Proceed directly to `figma_execute`.

**`figma_get_design_changes` is NOT a write-readiness check.** It is an event buffer that listens for incoming file changes from Figma. Calling it returns empty when no external edits have occurred — this is expected and normal, and does not indicate a bridge problem. Never use it to determine whether writes will succeed.

## Setup Contract

Use `FIGMA_ACCESS_TOKEN` in env configuration. Do not use `FIGMA_API_KEY`.

Use absolute executable paths in MCP config to avoid spawn failures.

## Preflight Checklist

1. Status check passes (`figma_get_status`).
2. Mode is known (`local` or `remote`).
3. If writing, Desktop Bridge is active and `setup.valid` is true.
4. Tool availability matches intent.
5. If preflight passes, continue to `design-extraction.md`.

## Failure and Recovery

| Symptom                  | Cause                          | Recovery                                        |
| ------------------------ | ------------------------------ | ----------------------------------------------- |
| `ENOENT` or `EPIPE`      | MCP command path/env issue     | Use absolute command path and explicit PATH     |
| Unauthorized/token error | Wrong env var or missing token | Set `FIGMA_ACCESS_TOKEN` and reload host        |
| `setup.valid: false`     | Bridge not connected           | Start Desktop Bridge plugin and re-check status |
| Wrong node/selection     | Scope mismatch                 | Resolve selection/nodeId before write           |

## Anti-Patterns

- Writing in remote mode without readiness checks
- Skipping the Figma URL user gate
- Using PATH-dependent spawn config
- Running destructive actions without explicit confirmation

## Core Concepts (Must Understand)

Rule: never attempt write-oriented workflows until status confirms Local + bridge readiness.

### 3) Token/Auth Model

Auth uses Figma Personal Access Token via:

- `FIGMA_ACCESS_TOKEN`

Do not use `FIGMA_API_KEY`.

### 4) Connection Topology

There are two independent concerns:

- MCP server process lifecycle (spawnable command, stdio health).
- Desktop Bridge runtime connectivity (plugin running in target file).

Most failures come from conflating these layers.

## Non-Negotiable Invariants

1. Use `FIGMA_ACCESS_TOKEN` only.
2. Treat Desktop Bridge plugin as mandatory for Local write workflows.
3. Avoid PATH-dependent commands in MCP configs on macOS. Use absolute executables.
4. When a Figma URL is provided, run the Desktop Bridge status question gate before any Figma MCP action.
5. Defer runtime behavior and execution rules to `design-extraction.md` to avoid policy drift.

## Mandatory Figma Link User Gate

When a user prompt includes a Figma link (`figma.com/design`, `figma.com/file`, `figma.com/board`, `figma.com/slides`), agents must ask for Desktop Bridge status before any Figma MCP action.

Required interaction contract:

1. Call `vscode_askQuestions` immediately.
2. Question header: `Desktop Bridge Status`.
3. Question text: `Before I continue with this Figma link, is the Figma Desktop Bridge plugin currently running in that file?`
4. Options: `Running now`, `Not running`, `Not sure`.
5. Set `allowFreeformInput: true`.
6. Wait for user response before running Figma tools.

This gate is mandatory for all agents and primary for Figma Executor.

## Setup Contract (VS Code)

### Required MCP config shape

Use explicit executable paths to avoid `ENOENT` in VS Code MCP host environments.

```json
{
  "servers": {
    "figma-console": {
      "type": "stdio",
      "command": "/opt/homebrew/bin/npx",
      "args": ["-y", "figma-console-mcp@latest"],
      "env": {
        "PATH": "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
      },
      "envFile": "/Users/<user>/.figma-console-mcp.env"
    }
  }
}
```

### Required env file shape

```bash
FIGMA_ACCESS_TOKEN=figd_xxx
```

### Bridge setup requirements

- Install/import Desktop Bridge plugin once.
- Open Figma Desktop.
- Run plugin in the active target file.

## Naming Conventions (Critical for Visual Design)

All Figma specs frames must follow exact naming convention for design consistency:

- Frame name: `[ComponentName] - Specifications`
- Examples: `Image - Specifications`, `Button - Specifications`, `Link - Specifications`
- Case-sensitive: component name must match branding case
- No variations: never use `Specs`, `Spec`, `Documentation`, or abbreviations
- This is not a guideline; it is mandatory for all specs frame creation

## Preflight Checklist (Mandatory)

1. Confirm MCP process can spawn without `ENOENT` / `EPIPE`.
2. Confirm token env variable name is correct (`FIGMA_ACCESS_TOKEN`).
3. Confirm mode and setup readiness from status call.
4. Confirm bridge plugin is running for Local workflows.
5. Confirm tool availability for requested task type.
6. For Figma specs work: confirm frame naming convention is planned before creation.
7. If runtime execution is next, switch to `design-extraction.md` for workflow policy.

If any check fails, stop task execution and run recovery playbook.

## Failure Taxonomy and Recovery

### Spawn/Process Layer

Symptoms:

- `spawn node ENOENT`
- `env: node: No such file or directory`
- immediate `EPIPE`

Recovery:

1. Use absolute `command` path in MCP config.
2. Add explicit `PATH` in server `env`.
3. Reload MCP client host after config changes.

### Auth Layer

Symptoms:

- token not configured / unauthorized access

Recovery:

1. Ensure env file exists and is referenced correctly.
2. Ensure variable name is `FIGMA_ACCESS_TOKEN`.
3. Refresh/reload MCP host.

### Bridge Layer

Symptoms:

- Local tools unavailable
- setup invalid / transport unavailable

Recovery:

1. Run Desktop Bridge plugin in Figma Desktop file.
2. Reconnect/reload plugin tools.
3. Re-run status and proceed only when valid.

### Scope Layer

Symptoms:

- wrong node/component targeted

Recovery:

1. Resolve current selection first.
2. Confirm node ID with user before mutation.

## Runtime Policy Reference

For quality gates, tool routing, workflow sequencing, screenshot evidence, and handoff reporting format, use `./design-extraction.md` as the single source of truth.

## Security and Safety

- Never print PAT values in chat/output.
- Never commit PAT to repository files.
- Keep PAT in user env file only.
- For destructive operations, require explicit user confirmation.

## Agent-Specific Expectations

All agents can invoke this skill for setup validation and troubleshooting triage.

Figma Executor should use this skill for preflight setup checks, then switch to `design-extraction.md` for runtime execution policy.

## Anti-Patterns (Prohibited)

1. Running write workflows in Remote mode without readiness confirmation.
2. Using `FIGMA_API_KEY` instead of `FIGMA_ACCESS_TOKEN`.
3. Relying on shell PATH assumptions inside MCP host.
4. Skipping status checks before running tools.
5. Claiming bridge is connected without status evidence.
6. Performing visual mutation without screenshot validation.
7. **Using `figma_get_design_changes` as a write-readiness proxy** — it is an event listener, not a write check. An empty response is normal and expected.
8. **Attempting Desktop MCP (`mcp_figma-desktop_*`) for write operations** — it is read-only.
9. **Running more than one non-write diagnostic call after `figma_reconnect` succeeds** — reconnect success means the bridge is live; proceed to `figma_execute` immediately.

## Appendix: Minimal Triage Runbook

1. Check spawn errors (`ENOENT`, `EPIPE`) -> fix command path/PATH.
2. Check auth errors -> fix env var name/value and reload.
3. Check bridge/status -> run plugin and reconnect.
4. Re-run status.
5. Run one read tool, then one targeted task.

## Related Skills

- `./design-extraction.md` for runtime extraction and handoff contract
- `./component-lifecycle-orchestration.md` for MAKE/UPDATE lifecycle
- `./design-linting.md` for post-change quality auditing
