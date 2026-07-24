---
description: Route any design request through the Design System designer suite (UI, UX, handoff)
---

Follow the design router at `packages/tokens/.agents/skills/design/design-router.md`.

Request: $ARGUMENTS

**If the request above is empty** (the user typed `/design` with no description), run the router's **Guided mode** instead — the same clickable wizard as `/design-start`. Otherwise classify the typed request directly:

1. Load the TL;DR of `packages/tokens/.agents/skills/design/foundation/design-dna.md` first.
2. Classify the request into one route — prototype, ui-craft, new-experience, handoff, or corpus-distill — per the router's Step 2 table.
3. Ask at most one clarifying question, and only if two routes are genuinely tied.
4. Output the route, the ordered skill sequence as a checklist, and the router's JSON summary block. Then begin the first skill in the sequence unless the user asked for the plan only.

If the request names a Figma URL, apply the Figma gate: prefer the Figma desktop MCP (the file must be the active tab), otherwise ask for an exported image. Never guess frame contents.
