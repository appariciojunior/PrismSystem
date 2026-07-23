---
name: compose-screen
description: Compose a designed product screen (not raw shadcn) from the design system: brand tokens, material, the captured design language and the vendored blocks. Use when asked to build a page, screen, dashboard, or feature UI that should look designed.
license: MIT
metadata:
  category: react
  agents: [Architect, Code, Designer]
  autonomy: autonomous
  portable: true
---

# Compose a designed screen

## Purpose

Turn a brief into an on-brand, *designed* screen using `@ds/ui`, its blocks, the brand tokens and material, and the captured design language. The goal is the difference between "shadcn with tokens applied" and "shadcn designed by hand": composition, component recipes and signature moves, not just a themed skin.

## Preconditions

- `npm install --legacy-peer-deps` has run; `@ds/ui` and its blocks are available.
- The app css imports `tailwindcss`, `@ds/ui/styles/shadcn.css`, `@ds/ui/styles/theme.css`.

## Procedure

1. Read the system's intent, in this order:
   - `design-corpus/brand/GUIDELINES.md` (rules), `design-corpus/brand/DESIGN-LANGUAGE.md` (layout, recipes, signature moves), and any references under `design-corpus/`.
   - The brand tokens and current material (surface style) from the generated `theme.css`.
2. Pick a starting block from `@ds/ui/blocks` that matches the brief and the design language's layout (e.g. `dashboard-01`, a `sidebar-*`, a `login-*`). Copy it into the target as the skeleton.
3. Reproduce the design language's **component recipes** and **signature moves** explicitly. If the language says "tinted category cards with pill progress and a pill CTA", build that recipe; do not leave stock cards.
4. Style only through tokens and utilities bound to them: `bg-card text-foreground border-border rounded-lg`, `bg-primary text-primary-foreground`, chart colours `var(--chart-1..5)`, spacing from `--spacing`, material from `--surface-*`. Never hardcode a colour, radius, font or blur.
5. Use `@ds/icons` (Phosphor) for product icons.
6. Self-critique against the design language before finishing: does it show the signature moves? does it read as designed, not default? Check contrast (the controller audit composites translucent surfaces). Iterate once.
7. File the run under `sandbox/` per the run-folder convention. If a novel recipe emerges that is worth keeping, propose promoting it into a new block or a `@ds/ui` variant (see the learning-agent skill).

## Outputs

A screen under `sandbox/<run>/` importing only `@ds/ui`, `@ds/ui/blocks/*`, `@ds/icons` and tokens. No inline hex, fonts, radii or blur.

## Error handling

- Looks generic: you skipped the design language or the blocks; re-read `DESIGN-LANGUAGE.md` and start from a block.
- Unstyled: the app is missing the `@ds/ui` css imports.
