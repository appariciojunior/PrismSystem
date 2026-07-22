# Design Skills

The designer-facing suite of the Design System skill library. Where the engineer namespaces (discovery, editing, validation, figma-integration, storybook and friends) serve the people who build the system, `design/` serves the people who use it: designers, design engineers, PMs and QA.

One entry point: `design-router.md` (surfaced as `/design`). Say what you are doing; the router loads the Design DNA, classifies the intent and composes the right skills in the right order.

> New here? `GUIDE.md` in this folder is the single how-to. This README is the architecture map: what the suite is, its pillars, and how it composes.

## Why this exists

The system had production-grade skills for tokens and components but nothing that starts from a designer's question: "is this good?", "how do we design this?", "what do I hand to engineering?". This suite answers those questions with your brand, its channels, tokens and component contracts as ground truth, not generic design advice. The full rationale lived in the original design-workflow proposal; its essence: catch problems before code is written, make handoff unambiguous, and keep every judgement traceable to a DS source.

## Pillars

| Pillar | What it is for | Skills |
|---|---|---|
| `foundation/` | Ground truth. The Design DNA: identity, thirteen channels, principles, anti-patterns. Loaded by everything else. | design-dna |
| `ui/` | Doing UI. Critique, accessibility, content style, tokens, states, channels, parity, motion review, drift, monthly roll-up. | design-critique, a11y-check, content-style-check, token-mapping-audit, state-matrix, channel-context, light-dark-parity, motion-review, visual-vs-built, monthly-audit |
| `ux/` | Creating new experiences. Flows, patterns, page templates, experience principles, microcopy. | coming next (flow-design, pattern-library, experience-principles, page-templates, microcopy) |
| `handoff/` | The designer-to-engineer bridge. Both UI and UX work exits through here. | frame-to-spec, spec-packet, component-scaffold, code-connect-stub, handoff-flow |
| `motion/` | Motion reference and interaction patterns. Scaffolded until motion tokens land in `tokens.json`. | motion-tokens, interaction-patterns, prototype-spec |
| `corpus/` | Learning how your brand designs from real product screenshots (`design-corpus/` at repo root). | coming next (distill-corpus) |
| `agents/` | Orchestrators that run whole flows. | prototyping-agent, critique-agent, handoff-agent, build-agent |

## Cadence

Daily: design-critique, a11y-check, content-style-check, token-mapping-audit, state-matrix, the router itself.
Weekly: light-dark-parity, motion-review, visual-vs-built, spec-packet, component-scaffold, code-connect-stub.
Monthly: monthly-audit (scheduled; posts via coordination/slack-announcements).
On demand: channel-context, handoff-flow, prototype-spec, corpus distillation.

## Composition rules

1. Every skill loads the TL;DR of `foundation/design-dna` before producing output.
2. Skills compose with the engineer namespaces rather than duplicating them: token questions go to `discovery/*` and the token MCP, contrast to `color-ramps/contrast-check`, Figma operations to `figma-integration/*`, stories to `storybook/*`.
3. Every judgement must trace to a DS source: `tokens.json`, `content-styleguide.md`, a component contract in `packages/tokens/docs/components/`, the DNA, or (once shipped) a versioned corpus document. No "feels off" rules.
4. Artefacts persist to `.design/<feature>/` (SPEC.md, CRITIQUE.md, PACKET.md and friends). They are working outputs, not versioned knowledge.
5. Higher authorities on conflict: `tokens.json` and `content-styleguide.md` outrank every skill, including the DNA.

## Known drift (re-check monthly)

Tracked in `ui/monthly-audit.md`: grid Large columns (docs say 10, tokens say 12), Button `xlarge` (docs only, not in code), Code Connect not yet wired (`figma.config.json` carries starter-template substitutions; no `.figma.tsx` files), motion tokens absent (motion pillar stays scaffolded).

## Registry and mirroring

Every skill here is registered in the top-level `skills.json` with `category: design/<pillar>`. The canonical directory is `packages/tokens/.agents/skills/`; `.claude/skills`, `.cursor/skills`, `.codex/skills`, `.github/skills/tokens` and `.github/skills/design` are symlinks, so this suite appears in Claude Code, Cursor, Codex and GitHub Copilot with no extra sync. Continue users get the role-aggregated `.continue/rules/designer.md`.

## MCP tools

The token MCP server (`packages/tokens/mcp-server/`) exposes deterministic helpers that back these skills, following its own "tools map to skills" pattern. The design tool group is live:

| Tool | Backs | What it does (deterministic) |
|---|---|---|
| `design_rules` | `foundation/design-rules` | Serves the rule set and scoring formula, parsed from `design-rules.md` (filter by category, fetch by ID). |
| `design_score` | `ui/design-critique`, `ui/monthly-audit` | Computes the 0–100 score and subscores from a list of findings. Identical maths on every surface. |
| `design_route` | `design-router` | Heuristic first-pass classification of a request into a route plus the canonical skill sequence. |
| `corpus_status` | `corpus/distill-corpus`, `foundation/corpus-guide` | Reports corpus version, screen counts and distilled docs before evidence is cited. |

By design, the **judgement** skills (`design-critique`, `flow-design`, `distill-corpus`) stay agent-executed — they need vision and design sense, so they are read and run by the agent, not computed by a tool. The tools do their mechanical parts. Tests: `node packages/tokens/mcp-server/test/design-smoke.mjs` (logic, no deps) and `test/list-tools.mjs` (live boot, needs the MCP SDK installed).

## Non-technical guide

Designers and PMs: **start with `GUIDE.md`** in this folder. It is the single how-to: how to prompt, when to use each agent and skill, how to get good results from screens, and when you need Figma versus a screenshot. For the browsable catalogue, open `portal/index.html`.
