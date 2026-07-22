---
mode: agent
description: '🎨 /design-start — guided design intake. Click through what you want, then send your screen.'
tools:
  - read_file
  - grep_search
  - run_in_terminal
---

# Design Start

Guided intake for the Design System design suite. For designers who would rather click than recall skill names.

#file:packages/tokens/.agents/skills/design/design-router.md

## Procedure

Run the router's **Guided mode** (the "/design-start wizard" section of the file above).

1. Load the TL;DR of `packages/tokens/.agents/skills/design/foundation/design-dna.md`.
2. Ask **G1 — What would you like to do?** as selectable options via `vscode_askQuestions`: Check or improve a design · Design something new · Get it ready for engineering · Teach the system from screens.
3. Ask **G2** to narrow it (options depend on G1), then **G3 — Where will it live?** for anything that will generate a screen or page: Web desktop · Web mobile · Responsive web page · Native iOS app (Swift). The grid, components and token set change with the answer (`theme-css` for web, `theme-ios` + SwiftUI mapping for native iOS), so ask unless the context already answers it. Then **G4** for channel context only when it helps.
4. Ask for the concrete input in plain text (screenshot / Figma active tab / folder / description), with the one-line screenshot-versus-Figma guidance.
5. Map to a route and run the composed skill sequence. Every generated screen lands in its own sandbox run folder with `DEV-SPEC.html` written beside it (per `handoff/dev-spec`): the engineer's quick view of components, tokens, statuses, target surface and open questions.

Two to four clickable questions, then get the design. Never require the user to know skill names.
