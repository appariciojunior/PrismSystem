---
mode: agent
description: '🎨 /design — route any design request through the Design System design suite'
tools:
  - read_file
  - grep_search
  - run_in_terminal
---

# Design

Route a design request through the Design System designer suite.

#file:packages/tokens/.agents/skills/design/design-router.md

## Procedure

1. Load the TL;DR of `packages/tokens/.agents/skills/design/foundation/design-dna.md`.
2. Follow the design-router procedure with the user's request as `request`. Classify into one route: prototype, ui-craft, new-experience, handoff, corpus-distill.
3. Ask at most one clarifying question, and only if two routes are genuinely tied.
4. Output the route, the ordered skill sequence as a checklist, and the JSON summary block, then begin the first skill unless the user asked for the plan only.
