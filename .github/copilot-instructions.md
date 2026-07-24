# Design System - AI Agent Instructions

This file is intentionally concise for prompt efficiency.

Canonical deep references (read when needed):

- `packages/tokens/.agents/skills/README.md`
- `packages/tokens/.agents/skills/governance/constraint-reference.md`
- `packages/tokens/DESIGN_SYSTEM_CONTEXT.md`
- `packages/tokens/styleguide.md`

## First Prompt Bootstrap (Once Per Day)

Before any substantial work on first prompt of the day, run:

```bash
# 1) Sync repo
git fetch origin main && git pull origin main --rebase 2>/dev/null || echo "Offline mode"

# 2) Quick status
echo "=== DAILY BOOTSTRAP ===" && \
git log --oneline -3 && \
echo "=== TODO STATE ===" && \
head -30 packages/tokens/.agents/TODO_STATE.md
```

Then read: `packages/tokens/.agents/TODO_STATE.md` and `packages/tokens/.agents/skills/governance/constraint-reference.md`.

Skip bootstrap only if user says `skip bootstrap` or `continue from last session`.

## Architecture Invariants

- Token architecture is 3-layer: Foundation -> Palette -> Semantic.
- Semantic tokens must reference Palette, never Foundation.
- `packages/tokens/src/tokens.json` is the Token Studio source of truth.
- Never modify `$themes` or any `$figma*` metadata unless explicitly human-approved.
- Do not edit `tokens.json` to fix output/render issues; investigate build scripts in `packages/output/src/scripts/` first.

## Dark Mode Critical Rule

Neutral ramps are reversed in dark mode:

- Light mode: `neutral.50` is white, `neutral.1000` is black.
- Dark mode: `neutral.50` is black, `neutral.1000` is white.

Always verify actual hex in `packages/tokens/data/ramp-colors-reference.csv` before deciding dark mappings.

## Governance Gates

- Foundation edits require explicit human approval and `foundation-change` governance path.
- Palette edits require explicit approval (`palette/approval`) and design owner sign-off.
- For semantic-only scope, do not change foundation or palette layers.
- If scope is ambiguous, stop and ask one concise clarifying question.

## tokens.json Edit Rules

When explicitly asked to edit `packages/tokens/src/tokens.json`:

- Change only intended token `value`/`description` fields.
- Keep font weights as strings (for Figma export), not numeric values.
- Validate JSON immediately:

```bash
python3 -m json.tool packages/tokens/src/tokens.json > /dev/null
```

## Verification Commands

Use these after token-affecting changes:

```bash
npm run build:output
npm run test:output
```

If the workflow requires it, also run:

```bash
python3 packages/tokens/scripts/verify_tag_updates.py
```

## Documentation Boundary

Keep token documentation under `packages/tokens/`. Do not create token docs elsewhere.

## Agent Brief Size Limit

All files in `packages/tokens/.agents/briefs/` must stay at or below 150 lines. Keep briefs concise and push deep workflow detail into skills under `packages/tokens/.agents/skills/`.

## Skills Path

Canonical skills live in `packages/tokens/.agents/skills/` and are synced to:

- `.github/skills/tokens`
- `.cursor/skills`
- `.claude/skills`
- `.codex/skills`

Avoid duplicating long instruction blocks across tool-specific files.

## Token MCP Fast Path

- Prefer `ds-tokens-mcp` for token discovery before broad file scans.
- Use `search_tokens` for intent-first lookup, then `token_lookup` for exact path/value confirmation.
- Use `audit_design_system` when evaluating quality/risk across token groups.
- `packages/tokens/src/tokens.json` remains the source of truth.

## Token Reference Query Contract (MCP-Only, Deterministic)

For requests that are explicitly reference-only (for example "suggest tokens", "which token should I use", "token reference", "no implementation"), use this strict output contract:

1. Retrieval path must be MCP-only fast path.
2. If the intent is about a component or interaction pattern (for example modal, drawer, onboarding flow, paywall), query Mobbin MCP first to ground the response in real shipped patterns.
3. Do not use non-MCP validation fallback for these requests.
4. Output must be table-only and grouped by application area in this exact order:
   - Fill
   - Border
   - Icon
   - Text
   - Other
5. Table columns must be exactly:
   - Semantic Token
   - Description
6. Rows must be deterministically sorted alphabetically by semantic token path within each group.
7. If MCP results are partial or noisy, retry MCP with a narrower intent once and a scoped token-type filter once.
8. If still partial, return best available grouped tables and add a single line:
   - `Data Quality: MCP partial match. Tokens listed are highest-confidence semantic references for this intent.`

This contract is mandatory for all agents responding to token reference queries.

## Component Docs Fast Path

Component docs are indexed in Docmancer and readable via explicit file pointers. Use both layers:

- **Discovery (unknown component):** `docmancer query "<intent>"` — finds the right component doc without knowing the file path. 238 sections indexed across 12 components.
- **Direct read (known component):** `read_file packages/tokens/docs/components/<name>/<Name>.md` — load the full spec immediately. See `packages/tokens/docs/components/README.md` for the canonical read-order list.
- Always read the component spec before any Figma mutation, React implementation, or Storybook authoring task.
- Changelogs live at `packages/tokens/docs/components/<name>/<name>-changelog.md`.

## Mobbin MCP Fast Path

- Use `mobbin` MCP for design pattern discovery before building or proposing UI layouts, components, or interaction patterns.
- Query Mobbin with natural language: "Show me paywalls from top finance apps", "How do top apps handle notification permission prompts?"
- Architect and figma-executor must query Mobbin before scoping any new component or layout task.
- For component or pattern prompts, this applies to both reference and execution workflows.
- When the user asks for component-pattern token references (for example modal warning tokens), query Mobbin first, then provide the token output using the Token Reference Query Contract.
- Mobbin findings inform decisions — they do not override the brand principles or existing token architecture.
- Full usage guide: `packages/tokens/.agents/skills/reference/mobbin-mcp.md`.

## Mandatory Figma Link Confirmation Gate

For any user request that includes a Figma URL (for example `figma.com/design`, `figma.com/file`, `figma.com/board`, or `figma.com/slides`), the agent must ask a confirmation question before running any Figma MCP tool.

Required behavior:

1. Call `vscode_askQuestions` immediately.
2. Ask whether Desktop Bridge is currently running in the target file.
3. Offer options: `Running now`, `Not running`, `Not sure`.
4. Set `allowFreeformInput: true`.
5. Wait for user response before any Figma extraction, mutation, or debugging action.

Use this exact question intent:

- Header: `Desktop Bridge Status`
- Prompt: `Before I continue with this Figma link, is the Figma Desktop Bridge plugin currently running in that file?`

**After user confirms `Running now`:**

- Call `figma_reconnect` once and verify `"status": "reconnected"`.
- Proceed immediately to `figma_execute` or the required mutation tool.
- Do NOT call `figma_get_design_changes` as a bridge check — it is an event listener that returns empty under normal conditions and is not a write-readiness proxy.
- Desktop MCP (`mcp_figma-desktop_*`) is read-only — Console MCP (`mcp_figma-console_figma_execute`) is the only write path.
- If `figma_execute` fails after a successful reconnect, report the exact error and ask the user to reload the Desktop Bridge plugin. Do not loop on diagnostic calls.

## Figma Specs Routing Rule

Treat any request about a "Figma doc", "Figma specs", component spec page, props table, guidelines block, or Figma changelog as a **Figma specs** workflow.

Required behavior:

1. Always delegate Figma specs work to the `figma-executor` agent, even if another agent received the prompt first. **This applies in architect mode too:** when the task transitions from planning to Figma execution, architect must automatically invoke figma-executor without waiting to be asked.
2. Use in-file component instances and instance overrides; do not directly edit main component definitions unless explicitly requested.
3. Full changelog history belongs in component docs (`<component>-changelog.md`) and Storybook.
4. Figma specs changelog must stay concise and design-only:
   - strict uppercase labels `ADDED`, `UPDATED`, `REMOVED`
   - hide empty sections
   - remove empty bullet rows
   - plain semver only (`2.0.0`, never `v2.0.0`)
   - no author field unless explicitly requested
5. For stacked changelog entries, prefer one auto-layout container with `itemSpacing=0` and status variants `current` then `previous`.
