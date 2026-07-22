# Agent Coordination Hub

**Purpose**: Single source of truth for agent workflows  
**NOT for humans** - see packages/tokens/docs/ for human docs

---

## First Prompt of Day

```bash
git fetch origin main && git pull origin main --rebase
head -20 packages/tokens/.agents/TODO_STATE.md
```

Or use: skills/coordination/daily-bootstrap.md

---

## Files

| File          | Purpose                      |
| ------------- | ---------------------------- |
| TODO_STATE.md | Current task + status        |
| CHANGELOG.md  | Pointer to weekly changelogs |

## Briefs

| Role      | Brief               |
| --------- | ------------------- |
| Architect | briefs/architect.md |
| Code      | briefs/code.md      |
| Testing   | briefs/testing.md   |

## Skills

See `skills/README.md` for current skill inventory and categories.

## Custom Agents

The skills library is operationalized into executable agents across multiple surfaces:

### VS Code Prompt Files (`.github/prompts/`)

| Prompt                    | Purpose                             |
| ------------------------- | ----------------------------------- |
| architect.prompt.md       | Token architecture planning         |
| code.prompt.md            | Token editing with governance gates |
| testing.prompt.md         | Validation-only, no file edits      |
| token-lookup.prompt.md    | Quick token search                  |
| dark-mode-check.prompt.md | Verify dark mode ramp references    |
| daily-bootstrap.prompt.md | Session start sync procedure        |

### VS Code Chat Modes (`.vscode/`)

| Mode                  | Role                                   |
| --------------------- | -------------------------------------- |
| architect.chatmode.md | Planning-only, read-only tools         |
| code.chatmode.md      | Implementation with mandatory workflow |
| testing.chatmode.md   | Validation, produces test reports      |

### MCP Server (`packages/tokens/mcp-server/`)

9 tools exposed via Model Context Protocol:

| Tool                | Purpose                                |
| ------------------- | -------------------------------------- |
| token_lookup        | Find tokens by path, pattern, or value |
| token_validate      | JSON syntax + structure + build checks |
| foundation_gate     | Foundation layer protection gate       |
| ramp_lookup         | Ramp step hex lookup with CSV data     |
| contrast_check      | WCAG 2.1 contrast ratio calculator     |
| dependency_graph    | Token reference tracing                |
| search_tokens       | Intent-first token recommendation      |
| audit_design_system | Duplicate/naming/contrast audit        |
| generate_token_docs | Markdown docs from token groups        |

Start: `npm run mcp:tokens` or via `.vscode/mcp.json`

Workspace MCP servers in `.vscode/mcp.json`:

- `figma-console` (full Figma Console MCP via `npx -y figma-console-mcp@latest`)
- `figma-desktop` (Figma desktop HTTP bridge)
- `ds-tokens-mcp` (local token governance tools)

This shared workspace config is used by all agent modes (Architect, Code, Testing).

Token context fast path for agents:

1. `search_tokens` for intent-first discovery.
2. `token_lookup` for exact confirmation.
3. `audit_design_system` for broader risk checks.

### Cross-IDE Portability

Skills are symlinked to all supported IDE directories:

| IDE            | Path                    |
| -------------- | ----------------------- |
| GitHub Copilot | `.github/skills/tokens` |
| Cursor         | `.cursor/skills`        |
| Claude Code    | `.claude/skills`        |
| Codex          | `.codex/skills`         |

Sync: `npm run sync:skills`

---

## Critical Rules (Memorize These)

1. **Dark mode ramps are REVERSED**  
   neutral.50 = black, neutral.1000 = white in dark mode

2. **Never touch foundation**  
   Use palette steps instead. See skills/governance/foundation-gate.md

3. **Docs stay in packages/tokens/**  
   Never create token docs outside this folder

For full constraint list: skills/governance/constraint-reference.md
