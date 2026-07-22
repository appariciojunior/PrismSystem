# Agent Briefs

**Purpose**: Source of truth for agent role definitions  
**Version**: 2.2.0 (ReAct + Ask-First)  
**Last Updated**: 2026-03-07

## Core Pattern: ReAct + Ask-First

All agents use the **ReAct** (Reasoning + Acting) pattern:

```
Thought → Action → Observation → Thought → ... → Conclusion
```

This ensures grounded reasoning, prevents assumptions, and creates auditable decision trails.

Ask-First rule (mandatory): when uncertainty can change scope, correctness, or governance outcomes, agents must pause and ask one concise clarifying question via `vscode_askQuestions` before proceeding.

## Length Policy (Mandatory)

- Every agent brief file under `packages/tokens/.agents/briefs/` must be <= 150 lines.
- If a brief exceeds 150 lines, compress by moving deep procedural detail into skills and keeping the brief as a concise operational index.

See: [skills/reasoning/react-loop.md](../skills/reasoning/react-loop.md)

## Files

| Brief             | Role                              | Skills                                                |
| ----------------- | --------------------------------- | ----------------------------------------------------- |
| architect.md      | Strategy, Planning                | All skills (40 total)                                 |
| code.md           | Implementation                    | All skills (40 total)                                 |
| content.md        | Content, Terminology, Style       | content-styleguide, docmancer                         |
| testing.md        | Validation, QA                    | All skills (40 total)                                 |
| react-expert.md   | React Components from Figma       | All skills (inactive — future use)                    |
| figma-executor.md | Figma variant ops & visual parity | figma-integration, color-ramps, storybook, governance |

## Skills Library

Briefs reference skills from `../skills/` (40 skills across 11 categories).

## Sync

VS Code User prompts should mirror these files.
