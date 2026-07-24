---
description: Design System token agent rules
globs: ["packages/tokens/**", "packages/output/**"]
alwaysApply: false
---

# Design System — Token Agent Rules

## Architecture

3-layer token system: Foundation → Palette → Semantic.
Semantic tokens MUST reference Palette, never Foundation directly.

## Source of Truth

- Token definitions: `packages/tokens/src/tokens.json`
- Skills library: `.cursor/skills/` (symlinked from `packages/tokens/.agents/skills/`)
- Agent briefs: `packages/tokens/.agents/briefs/`

## Critical Rules

1. **Dark mode neutral ramps are REVERSED**: `neutral.50` = black, `neutral.1000` = white
2. **Never touch foundation layer** without explicit human approval
3. **Never modify `$themes` or `$figma*` metadata** in tokens.json
4. **Semantic → Palette references only** (e.g., `{brand.core.ramp.neutral.150}`)
5. **Font weights must be strings** (`"Bold"`, not `700`)
6. **Don't edit tokens.json for output issues** — fix build scripts instead

## Skills (`.cursor/skills/`)

Use these skills for structured decision-making:

- `reasoning/react-loop.md` — ReAct: Thought → Action → Observation loop
- `governance/foundation-gate.md` — Foundation layer protection gate
- `governance/constraint-reference.md` — All 8 constraint violations
- `color-ramps/dark-mode-mapping.md` — Light↔dark step mapping (CRITICAL)
- `editing/safe-token-edit.md` — Safe edit with validation gates
- `validation/build-verify.md` — npm build + test verification
- `discovery/token-lookup.md` — Find tokens by path/pattern/value

## Agent Roles

| Role | Brief | Use When |
|---|---|---|
| Architect | `packages/tokens/.agents/briefs/architect.md` | Planning, blueprints |
| Code | `packages/tokens/.agents/briefs/code.md` | Implementation, commits |
| Testing | `packages/tokens/.agents/briefs/testing.md` | Validation, QA |

## Workflow: Token Edit

```
1. Check governance gates (foundation-gate, palette-gate)
2. Locate token (token-lookup)
3. Make edit (safe-token-edit)
4. Validate JSON: python3 -m json.tool packages/tokens/src/tokens.json > /dev/null
5. Run tests: npm run test:output
6. Build: npm run build:output
7. Commit: git commit -m "feat(tokens): description"
```

## Reference

- Ramp colors: `packages/tokens/data/ramp-colors-reference.csv`
- Token state: `packages/tokens/.agents/TODO_STATE.md`
