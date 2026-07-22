# Agent Skills Library

**Purpose**: Reusable, modular capabilities that any agent can invoke. Skills are composable building blocks that encapsulate domain expertise and best practices.

## Core Principle: 1:1 Semantic Token Mapping

**All semantic tokens are structurally and semantically identical across all themes.** A token like `messaging.fill.warning` means the same thing in `light/ core`, `light/ comment`, `dark/ core`, etc. Do not select between themes for semantic tokens. Channel-specific tokens (`.channel.` in path) are the only exception where documented value divergence may apply.

## Architecture

```text
skills/
├── README.md                   # This file - registry and usage guide
├── reasoning/                  # Core thinking patterns (USE FIRST)
│   └── react-loop.md           # ReAct: Thought → Action → Observation loop
├── discovery/                  # Finding and understanding tokens
│   ├── token-lookup.md         # Find tokens by path, name, or value
│   ├── semantic-token-search.md # Intent-first token discovery via MCP
│   └── dependency-graph.md     # Trace token references
├── editing/                    # Modifying tokens safely
│   ├── safe-token-edit.md      # Single token edit with validation
│   ├── bulk-transform.md       # Multi-token batch operations
│   └── description-guidelines.md  # Token description writing standards
├── validation/                 # Verifying correctness
│   ├── json-validate.md        # Syntax and structure checks
│   ├── constraint-check.md     # CONSTRAINTS.md rule enforcement
│   ├── build-verify.md         # npm build and test verification
│   ├── semantic-theme-parity.md # Semantic light/dark structural parity + advisory value checks
│   └── token-audit-workflow.md # MCP-first audit workflow
├── governance/                 # Approval and permission gates
│   ├── token-modification-gates.md # Canonical foundation+palette gate logic
│   ├── foundation-gate.md      # Compatibility wrapper for foundation gate
│   ├── palette-gate.md         # Compatibility wrapper for palette gate
│   └── approval-workflow.md    # PR label and review requirements
├── color-ramps/                # Color-specific expertise
│   ├── ramp-generation.md      # Create/modify color ramps
│   ├── contrast-check.md       # WCAG accessibility verification
│   └── dark-mode-mapping.md    # Light↔dark mode step mapping
├── coordination/               # Multi-agent workflows
│   ├── brief-updater.md        # Sync briefs with skills library
│   ├── handoff-protocol.md     # Agent-to-agent state transfer
│   ├── rollback.md             # Recovery from failed operations
│   ├── release-process.md      # Full release checklist (tokens, changelog, announcement)
│   ├── slack-announcements.md  # Release announcement formatting
│   └── ui-kit-release-artifacts.md # UI Kit changelog, Slack, and Figma publish workflow
├── react/                      # React component development
│   ├── hooks-quick-reference.md # Built-in hooks decision matrix
│   ├── hooks-reference.md      # Custom hook architecture patterns
│   ├── component-patterns.md   # Compound, polymorphic, controlled
│   ├── typescript-patterns.md  # Props, generics, discriminated unions
│   ├── accessibility.md        # WCAG 2.1 AA, ARIA, keyboard nav
│   ├── state-management.md     # useState through context
│   └── testing.md              # Component-level behavior tests
├── figma-integration/          # Figma to React workflow
│   ├── design-extraction.md    # Extract specs via MCP (figma-console preferred, figma-desktop fallback)
│   ├── figma-console-mcp-integration.md # Setup + mode + reliability operating standard
│   ├── component-lifecycle-orchestration.md # Mandatory MAKE/UPDATE component orchestration workflow
│   ├── token-mapping.md        # Map values to tokens dynamically
│   ├── variable-binding-reference.md # Token Library/UI Kit file keys, variable IDs, async binding patterns
│   └── figma-make-workflow.md  # End-to-end component pipeline
├── storybook/                  # Storybook authoring & testing
│   ├── story-writing.md        # CSF3 story creation from specs
│   ├── component-documentation.md # Index — delegates to writing and figma skills
│   ├── component-documentation-writing.md # 9-section doc structure, writing quality rules
│   ├── component-documentation-figma.md # Figma sync, value formatting, MCP safeguards
│   ├── figma-to-storybook.md   # Figma → Storybook pipeline
│   ├── natural-language-stories.md # Plain English → stories
│   ├── storybook-config.md     # Config management (main/preview)
│   ├── visual-testing.md       # Storybook interaction + a11y + visual regression workflow
│   ├── visual-regression-gate.md # Mandatory post-task visual regression checks
│   └── token-showcase.md       # Design token display stories
└── reference/                  # Quick references
    ├── npm-packages.md         # Curated package recommendations
    ├── react-cheatsheet.md     # Quick pattern reference
  ├── token-reference-fast-path.md # MCP-only deterministic token reference tables
    └── mobbin-mcp.md           # Mobbin MCP: real app screen search for design pattern grounding
```

## Progressive Disclosure Model

The skill system now follows a tiered loading model.

| Tier | Role                         | Loaded Data                                     |
| ---- | ---------------------------- | ----------------------------------------------- |
| L1   | Fast routing and risk gating | `skills.json` only                              |
| L2   | Execution playbook           | Selected skill markdown sections                |
| L3   | Heavy source data            | Large assets only when required by L2 procedure |

This keeps context smaller while preserving governance and workflow quality.

## L1 Registry Contract (`skills.json`)

Each skill entry includes directive routing fields for selection and sequencing.

| Field                    | Purpose                                           |
| ------------------------ | ------------------------------------------------- |
| `trigger_intents`        | Positive routing signals                          |
| `do_not_use_for`         | Negative constraints to avoid misrouting          |
| `required_inputs`        | Minimum context needed before activation          |
| `outputs`                | Expected artifact/result shape                    |
| `approval_required`      | Fast approval gate check                          |
| `breaking_risks_summary` | High-impact failure mode summary                  |
| `compose_after`          | Recommended predecessor skills                    |
| `compose_before`         | Recommended successor skills                      |
| `l2_sections_required`   | Required markdown sections to load for activation |

## L2 Activation Protocol

When a skill is selected in L1, load these first:

1. YAML frontmatter
2. `Purpose`
3. `Preconditions`
4. `Inputs`
5. `Procedure`
6. `Error Handling`

Load full markdown only when these sections are insufficient for safe execution.

## Skill Specification Format

Skills follow the **Agent Skills standard** ([agentskills.io](https://agentskills.io)) with extended metadata for our token system governance.

### YAML Frontmatter (Required)

```yaml
---
name: skill-name # lowercase, hyphens, 1-64 chars
description: Brief description... # max 1024 chars
metadata:
  category: discovery|editing|validation|governance|color-ramps|coordination
  agents: [Architect, Code, Testing]
  autonomy: autonomous | requires-approval | blocked
---
```

### Extended Sections (Our Additions)

```markdown
# Skill Name

## Purpose

[One sentence describing what this skill does]

## Preconditions

- [What must be true before invoking]

## Inputs

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| ...       | ...  | ...      | ...         |

## Procedure

[Step-by-step instructions with code examples]

## Outputs

| Output | Type | Description |
| ------ | ---- | ----------- |
| ...    | ...  | ...         |

## Error Handling

- [Recovery procedures for common failures]

## Examples

[Concrete usage examples]
```

## Skill Invocation Convention

When documenting agent actions, reference skills explicitly:

```text
INVOKE: skill/category/skill-name
INPUTS: { param1: value1, param2: value2 }
RESULT: { output1: value1, status: "success" | "failed" | "blocked" }
```

## Skill Composition

Skills can be composed into workflows:

```text
Workflow: Edit Semantic Token
1. INVOKE discovery/token-lookup (find current value)
2. INVOKE governance/token-modification-gates (approval + layer gate)
3. INVOKE editing/safe-token-edit (make change)
4. INVOKE validation/json-validate (check syntax)
5. INVOKE validation/build-verify (check build)
```

## MCP-First Token Context

Use `ds-tokens-mcp` as the first stop for token context:

- `search_tokens`: intent-first candidate discovery (fast path)
- `token_lookup`: exact token path/value confirmation before edits
- `audit_design_system`: drift/risk scan across token groups

For reference-only token queries, prefer `reference/token-reference-fast-path` to enforce MCP-only retrieval and deterministic grouped table output.

This improves context speed and recommendation accuracy compared with broad file scans.

## Component Docs Fast Path

Component docs (spec + changelog) for all 12 components are indexed in Docmancer and readable via explicit file pointers. Use the two-layer model:

| Layer           | When to use                               | How                                                          |
| --------------- | ----------------------------------------- | ------------------------------------------------------------ |
| **Docmancer**   | Unknown component, cross-component search | `docmancer query "<intent>"`                                 |
| **Direct read** | Component name already known              | `read_file packages/tokens/docs/components/<name>/<Name>.md` |

Index: `packages/tokens/docs/components/README.md` — canonical read-order and metadata contract for all components.

Always read the component spec before Figma mutation, React implementation, or Storybook authoring.

## Autonomy Levels

| Level                 | Definition                              | Examples                    |
| --------------------- | --------------------------------------- | --------------------------- |
| **autonomous**        | Agent can invoke without asking         | token-lookup, json-validate |
| **requires-approval** | Agent must check with human first       | bulk-transform (>10 tokens) |
| **blocked**           | Agent cannot invoke; human must perform | foundation-gate bypass      |

## When to Create New Skills

Create a new skill when:

- The same multi-step procedure appears in 2+ briefs
- Domain expertise would benefit from explicit documentation
- Error recovery needs standardization
- Governance rules require encoding

## Version History

| Version | Date       | Changes                                                                                                                                                                                                                    |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.0.0   | 2026-04-21 | Adopted progressive-disclosure model with L1 directive routing metadata in `skills.json` and tiered L1/L2/L3 loading contract in README.                                                                                   |
| 1.0.0   | 2026-02-06 | Initial skills library (14 skills)                                                                                                                                                                                         |
| 1.1.0   | 2026-02-06 | Added YAML frontmatter, license field                                                                                                                                                                                      |
| 1.2.0   | 2026-02-06 | Added daily-bootstrap and brief-updater skills (17 total)                                                                                                                                                                  |
| 2.0.0   | 2026-02-06 | Added brief-updater skill (16ills)                                                                                                                                                                                         |
| 2.1.0   | 2026-02-13 | Added slack-announcements skill (19 skills)                                                                                                                                                                                |
| 2.2.0   | 2026-02-13 | Added release-process skill (20 skills)                                                                                                                                                                                    |
| 3.0.0   | 2025-07-24 | Added react, figma-integration, reference categories; skills.json manifest; cross-IDE portability; MCP server (33 skills, 10 categories)                                                                                   |
| 4.0.0   | 2025-07-28 | Added storybook category with 7 skills: story-writing, component-documentation, figma-to-storybook, natural-language-stories, storybook-config, visual-testing, token-showcase (40 skills, 11 categories)                  |
| 4.1.0   | 2026-03-05 | Added `storybook/visual-regression-gate` skill and mandatory test asset path under `packages/tokens/.agents/tests/visual-regression` (41 skills, 11 categories)                                                            |
| 4.2.0   | 2026-03-07 | Added `validation/semantic-theme-parity` for semantic theme `14 + 14` discovery, strict structural parity enforcement, alias integrity checks, and uncertainty escalation (42 skills, 11 categories)                       |
| 4.3.0   | 2026-03-07 | Moved chip-channel rollout guidance from a dedicated skill into semantic docs and semantic parity cross-references to keep briefs/skills generalist (42 skills, 11 categories)                                             |
| 4.4.0   | 2026-03-11 | Added OCR-first cross-agent capability with `discovery/ocr-extract` and universal `discovery/ocr-reference-validate` for reusable image evidence workflows (46 skills, 11 categories)                                      |
| 4.5.0   | 2026-03-11 | Decommissioned Pylon MCP crypto dependency. Removed `discovery/ocr-extract` and `discovery/ocr-reference-validate` (now use Claude's native vision). Removed `.vscode/mcp.json` pylon-mcp entry (44 skills, 11 categories) |
| 4.6.0   | 2026-03-24 | Added `figma-integration/figma-console-mcp-integration` as a cross-agent integration standard with setup, mode, preflight, and troubleshooting contracts (45 skills, 11 categories)                                        |
| 4.7.0   | 2026-03-24 | Added `figma-integration/component-lifecycle-orchestration` as the mandatory Figma Executor sequence for MAKE/UPDATE component tasks with semver + VS Code question gates (46 skills, 11 categories)                       |
| 4.8.0   | 2026-04-02 | Added `coordination/ui-kit-release-artifacts` to codify component-based UI Kit release aggregation, single-artifact release comms, and blanket designer-facing Figma publish messages (47 skills, 11 categories)           |

Latest update (2026-04-21): Enabled progressive-disclosure routing and activation contract across the skill library.

## References

### Standards & Specifications

- **[Agent Skills Specification](https://agentskills.io)** - Open format for portable agent skills
- **[Agent Skills GitHub](https://github.com/agentskills/agentskills)** - Full schema and validation

### Platform Documentation

- **[Cursor Skills](https://cursor.com/docs/context/skills)** - Cursor-specific implementation
- **[GitHub Copilot Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)** - GitHub implementation
- **[VS Code Copilot Customization](https://code.visualstudio.com/docs/copilot/customization/agent-skills)** - VS Code integration

### Example Repositories

- **[Anthropic Skills](https://github.com/anthropics/skills)** - Official example skills (`theme-factory`, `webapp-testing`)

### Compatibility

| Client         | Project Skills          | Global Skills        | Status       |
| -------------- | ----------------------- | -------------------- | ------------ |
| Claude Code    | `.claude/skills/`       | `~/.claude/skills/`  | ✅ Symlinked |
| Cursor         | `.cursor/skills/`       | `~/.cursor/skills/`  | ✅ Symlinked |
| Codex          | `.codex/skills/`        | `~/.codex/skills/`   | ✅ Symlinked |
| GitHub Copilot | `.github/skills/tokens` | `~/.copilot/skills/` | ✅ Symlinked |
| Canonical      | `.agents/skills/`       | —                    | Source       |

### Machine-Readable Manifest

`skills.json` — Machine-readable skill manifest used as the L1 routing registry and sync source.

### Sync Script

```bash
npm run sync:skills   # Verify/repair all symlinks + validate manifest
```

## Mandatory Cross-IDE Sync for New Skills

When adding, renaming, or moving any skill:

1. Update canonical files only in `packages/tokens/.agents/skills/`
2. Update `packages/tokens/.agents/skills/skills.json`
3. Run `npm run sync:skills`
4. Verify presence in all IDE surfaces:

- `.github/skills/tokens/`
- `.claude/skills/`
- `.cursor/skills/`
- `.codex/skills/`

This is mandatory for all agents so newly added skills are immediately available cross-IDE.
