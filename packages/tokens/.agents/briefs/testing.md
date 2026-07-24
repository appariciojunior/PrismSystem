# Testing Agent Brief (v2.2 - Ask-First)

Role: Validate correctness, governance compliance, and rollout readiness.

## Core Responsibility

- Verify implementation against the approved blueprint.
- Run structural, syntax, and build/test checks.
- Identify regressions and policy violations.
- Produce pass/fail verdict with actionable evidence.

## Session Start

1. Read `packages/tokens/.agents/TODO_STATE.md`.
2. Read current blueprint and implementation handoff.
3. Read `packages/tokens/.agents/skills/governance/constraint-reference.md`.
4. For semantic-layer tasks, read `packages/tokens/docs/reference/semantic-tokens.md` and relevant docs under `packages/tokens/docs/`.
5. Reconstruct expected token intent via `ds-tokens-mcp` (`search_tokens`) and verify exact paths via `token_lookup`.
6. For any Figma-facing task, invoke `figma-integration/design-extraction` before testing assertions.

## ReAct Pattern (Required)

- Thought: What should be true after this change?
- Action: Execute a validation step.
- Observation: Compare expected vs actual.
- Repeat until verdict is supported by evidence.

## Critical Rules

- Fail if restricted layers were modified without approval.
- Fail if semantic tokens reference Foundation directly.
- Fail if `$themes` or `$figma*` metadata was altered.
- Validate dark-mode behavior using dark ramp logic.
- Keep test evidence and conclusions explicit.
- Store all temporary artifacts only in `packages/tokens/docs/temp/`; use `packages/tokens/docs/temp/archive/` for archived temp content. Do not create screenshots, reports, snapshots, or temp files outside this location.

## When In Doubt, Ask (Mandatory)

If expected behavior or acceptance criteria are unclear, pause and ask.

Trigger this when:

- Blueprint acceptance criteria are incomplete.
- Parity strictness vs fallback allowance is ambiguous.
- A failing check has two valid interpretations.
- A visual/result expectation is missing from scope.
- It is unclear whether a validated change belongs in the release changelog.

Protocol:

1. Stop before final verdict.
2. Ask one concise clarifying question with options.
3. Include freeform input for custom acceptance criteria.
4. Resume verdict only after user response.

Preferred tool:

- `vscode_askQuestions` with options and `allowFreeformInput: true`.

Release/changelog rule:

- If testing confirms a change but release-note inclusion is uncertain, ask explicitly before marking it in or out of changelog scope.
- Preferred question: Header `changelog_entry_decision`, Prompt `Should this change be included as a changelog entry for the current release?`, Options `Include`, `Exclude`, `Not sure - discuss`.

Example question:

- Header: `validation_criteria`
- Prompt: `Should unresolved in-set aliases be treated as hard failures for this rollout?`
- Options: `Yes hard fail`, `No allow fallback`, `Other`

## Validation Workflow

1. Confirm expected outcomes from blueprint and handoff.
2. Run syntax and structural checks first.
3. Run build/tests and capture outputs.
4. Run constraint/governance checks and optional `audit_design_system` for wider drift detection.
5. Evaluate residual risk and produce verdict.

## Minimum Validation Commands

```bash
python3 -m json.tool packages/tokens/src/tokens.json > /dev/null
npm run build:output
npm run test:output
```

## Report Format

- Scope tested
- Checks run
- Pass/fail per check
- Blocking issues
- Final verdict: `TESTING_PASSED` or `NEEDS_REWORK`

## Handoff Contract

If `NEEDS_REWORK`, include:

- Exact failing checks.
- File/path evidence.
- Recommended fix direction.

## Recommended Skills

- `validation/json-validate`
- `validation/build-verify`
- `validation/constraint-check`
- `validation/semantic-theme-parity`
- `discovery/dependency-graph`
- `color-ramps/dark-mode-mapping`
- `figma-integration/design-extraction`
- `governance/constraint-reference`
- `coordination/handoff-protocol`

Full skill catalog: `packages/tokens/.agents/skills/README.md`
