# Components Docs Index (Agent-First)

status: banner-button-chip-divider-flag-icon-button-inline-message-label-link-toast-tooltip
scope: banner, button, chip, divider, flag, icon button, inline message, label, link, toast, and tooltip component contracts
path: packages/tokens/docs/components
audience: agents-only

## Read Order

0. `ComponentDoc-Template.md` (for new component contracts)
1. `banner/Banner.md`
2. `banner/banner-changelog.md`
3. `button/Button.md`
4. `button/button-changelog.md`
5. `chip/Chip.md`
6. `chip/chip-changelog.md`
7. `divider/Divider.md`
8. `divider/divider-changelog.md`
9. `flag/Flag.md`
10. `flag/flag-changelog.md`
11. `flag/archive/Flag-1.0.0.md`
12. `icon-button/IconButton.md`
13. `icon-button/icon-button-changelog.md`
14. `inline-message/InlineMessage.md`
15. `inline-message/inline-message-changelog.md`
16. `label/Label.md`
17. `label/label-changelog.md`
18. `link/Link.md`
19. `link/link-changelog.md`
20. `toast/Toast.md`
21. `toast/toast-changelog.md`
22. `tooltip/Tooltip.md`
23. `tooltip/tooltip-changelog.md`

## Source-of-Truth Rule

- The Figma component property model is the source of truth for property names, defaults, and allowed values.
- A component doc is the published contract that records those Figma properties, runtime coverage, accessibility guidance, and machine-readable IDs.
- Storybook and code must align to Figma property names where technically possible; legacy aliases are migration-only and must not become canonical.

## Components In Scope

- `banner`
- `button`
- `chip`
- `divider`
- `icon-button`
- `inline-message`
- `link`
- `flag`
- `label`
- `toast`
- `tooltip`

## Required Metadata In Versioned Component Docs

- `component_id`
- `status`
- `component_version`
- `owners`
- `last_reviewed`
- `storybook_refs`
- `figma_refs`
- `parity_state`

## Machine-Readable ID Contract

- Include a `canonical_ids` block in doc frontmatter with `properties`, `variants`, and `behaviors` collections.
- `property_id` format: `<component_id>.<property>` (for example `link.intent`).
- `variant_id` format: `<component_id>.<axis>.<value>` (for example `link.state.hover`).
- `behavior_id` format: `<component_id>.<namespace>.<name>` (for example `link.a11y.focusVisible`).
- IDs use canonical Figma property terms, not implementation aliases.
- Use `support` to record whether a Figma property is `runtime`, `content`, `preview-only`, or `not-exposed` in code.
- Use `code_aliases` only for temporary implementation migrations; aliases never change the canonical ID.
- IDs are for parity checks: they let the parser detect missing Figma properties, stale aliases, and orphaned accessibility/state mappings.
- For field-level mapping and parser validation rules, follow `figma-storybook-sync.md`.

## Change Policy

- `PATCH`: clarifications and non-behavioral updates.
- `MINOR`: additive, non-breaking component API updates.
- `MAJOR`: removals, renames, or behavior/default changes.
