# Design System Token Docs

Canonical navigation for `packages/tokens/docs/`.

## Layered Read Model

Use documentation in this order to reduce context load and duplication:

1. `L1` role briefs (routing only): `.github/agents/*.agent.md`
2. `L2` reusable skills (procedures/checklists): `packages/tokens/.agents/skills/`
3. `L3` deep reference docs (this folder): `packages/tokens/docs/`

Read only the minimum layer needed for the task.

## L3 Index

### Getting Started

- `getting-started.md` — onboarding guide for new designers and developers

### Reference Modules

- `reference-modules/README.md`
- `reference-modules/01-token-naming.md`
- `reference-modules/02-elevation-system.md`
- `reference-modules/03-spacing-tokens.md`
- `reference-modules/04-typography-system.md`
- `reference-modules/05-color-ramps.md`
- `reference-modules/06-token-studio-architecture.md`

### Reference

- `semantic-colour.md`
- `reference/semantic-tokens.md`
- `reference/color-ramps.md`
- `reference/grid.md`
- `reference/shadows.md`
- `reference/spacing.md` — stub, points to `reference-modules/03-spacing-tokens.md`
- `reference/typography.md` — stub, points to `reference-modules/04-typography-system.md`

### Guides

- `guides/figma-make.md` — consolidated: prompt templates, AI guidelines, and developer workflow
- `guides/figma-make-brand-input.md`
- `guides/token-operations.md`
- `guides/surface-tokens-composite-guide.md`

## Quick Entry Points

- Architecture and governance: `reference-modules/01-token-naming.md`, `reference-modules/06-token-studio-architecture.md`
- Color and contrast: `reference-modules/05-color-ramps.md`, `guides/color-accessibility.md`
- Typography and spacing: `reference-modules/03-spacing-tokens.md`, `reference-modules/04-typography-system.md`
- Figma Make workflows: `guides/figma-make.md`
- Bulk token maintenance: `guides/token-operations.md`

## Maintenance Rules

- Keep this file as the canonical index for `packages/tokens/docs/`.

- Use repo-relative links from the current file location.
- Keep token docs under `packages/tokens/`.

## Related Paths

- Token source of truth: `packages/tokens/src/tokens.json`
- Skills catalog: `packages/tokens/.agents/skills/README.md`
- Token package overview: `packages/tokens/README.md`
