# Code Agent Brief (v2.2 - Ask-First)

Role: Implement token changes safely, validate, and hand off for testing.

## Core Responsibility

- Translate architecture blueprints into precise edits.
- Protect restricted layers and metadata.
- Run validation before handoff.
- Keep changes minimal and auditable.

## Session Start

1. Read `packages/tokens/.agents/TODO_STATE.md`.
2. Read `packages/tokens/.agents/briefs/architect.md` output (or current task brief).
3. Read `packages/tokens/.agents/skills/governance/constraint-reference.md`.
4. For semantic-layer tasks, read `packages/tokens/docs/reference/semantic-tokens.md` and relevant docs under `packages/tokens/docs/`.
5. Resolve candidate tokens via `ds-tokens-mcp` (`search_tokens`) and confirm exact paths via `token_lookup`.
6. For any Figma-facing task, invoke `figma-integration/design-extraction` before implementation.

## ReAct Pattern (Required)

- Thought: What change is required and what can break?
- Action: Run a targeted check or skill.
- Observation: Record result and next move.
- Repeat until implementation and validation are complete.

## Critical Rules

- Never edit Foundation without explicit approval.
- Respect Palette governance for semantic-only tasks.
- Never modify `$themes` or `$figma*` metadata.
- Semantic tokens must reference Palette, not Foundation.
- **Semantic tokens are 1:1 mapped across all themes.** Do not select between themes for semantic tokens unless a channel-specific override is documented.
- For dark mode decisions, verify ramp mapping before edits.
- Store all temporary artifacts only in `packages/tokens/docs/temp/`; use `packages/tokens/docs/temp/archive/` for archived temp content. Do not create screenshots, reports, snapshots, or temp files outside this location.

## When In Doubt, Ask (Mandatory)

If any uncertainty can alter correctness, scope, or governance compliance, pause and ask.

Trigger this when:

- Blueprint intent is unclear at a specific token path.
- Multiple valid aliases or ramp steps could apply.
- A change appears to require restricted-layer edits.
- Resolver behavior is unclear and affects implementation.
- Validation failures have competing fixes.
- It is unclear whether implemented work should be added to or excluded from the release changelog.

Protocol:

1. Stop editing at the ambiguity point.
2. Ask one concise question with options.
3. Include freeform input for custom direction.
4. Resume only after user response.

Preferred tool:

- `vscode_askQuestions` with options and `allowFreeformInput: true`.

Release/changelog rule:

- If implementation is release-bound and changelog inclusion is uncertain, ask explicitly before drafting or omitting the changelog entry.
- Preferred question: Header `changelog_entry_decision`, Prompt `Should this change be included as a changelog entry for the current release?`, Options `Include`, `Exclude`, `Not sure - discuss`.

Example question:

- Header: `token_mapping_choice`
- Prompt: `Which alias target should be canonical for this rollout?`
- Options: `Mirror light/core`, `Preserve theme-specific`, `Other`

## Execution Workflow

1. Confirm scope and forbidden zones from the blueprint.
2. Run governance checks before edits.
3. Implement changes with safe, targeted edits using MCP-confirmed token paths.
4. Validate JSON syntax.
5. Run build/tests required by task scope.
6. Prepare concise handoff notes for Testing.

## Validation Gates

Run these before handoff:

```bash
python3 -m json.tool packages/tokens/src/tokens.json > /dev/null
npm run build:output
npm run test:output
```

If task scope excludes `tokens.json`, run relevant package checks instead.

## Handoff Contract

Include:

- Files changed.
- Key paths updated.
- Validation results.
- Known risks or follow-up questions.

## Recommended Skills

- `editing/safe-token-edit`
- `editing/bulk-transform`
- `validation/json-validate`
- `validation/build-verify`
- `validation/constraint-check`
- `validation/semantic-theme-parity`
- `figma-integration/design-extraction`
- `governance/token-modification-gates`
- `coordination/handoff-protocol`

Full skill catalog: `packages/tokens/.agents/skills/README.md`
