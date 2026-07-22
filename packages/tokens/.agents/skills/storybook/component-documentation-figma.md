---
name: component-documentation-figma
description: Sync the published component doc to Figma configuration tables and Storybook controls using canonical Figma-property names and machine-readable IDs.
license: MIT
metadata:
  category: storybook
  agents: [Code, React Expert]
  autonomy: autonomous
  portable: true
---

# Component Documentation — Figma & Storybook Sync

## Purpose

Propagate an approved component markdown doc to Figma (configuration table + demo instance) and Storybook (controls + autodocs). Figma component properties remain canonical for property names/defaults; this skill keeps the published doc, Figma, and Storybook aligned by stable machine-readable IDs.

Terminology note: use "Figma specs" for the Figma documentation surface. Full changelog history belongs in component docs (`<component>-changelog.md`) and Storybook; Figma specs should only present concise design-only changelog context.

## Figma Layout Contract

- CRITICAL: Live demo instance in the details frame must be the same component family as the documented component, set to documented defaults. Replace any legacy instance.
- CRITICAL: Place the live demo instance inside the dedicated Component window/container in the specs frame. Never leave the component floating outside the component window.
- Remove deleted property rows fully — no hidden placeholders.
- After row removal, shift remaining rows up so the table is contiguous with no empty vertical gaps.
- Remove orphaned cells/layers from deleted rows across all four columns (`Property`, `Description`, `Values`, `Default`).
- Keep property row order identical to the canonical Properties table order.
- Keep property row order identical to the source Figma component property order.
- Property `Default` must match the source Figma component default exactly.
- Each property row: exactly four visible cells with matching row Y position and row height across columns.
- Resize the table/container after row operations — no trailing empty space.

## Figma Value Formatting Contract

- Enum/boolean/swap/select properties → `Values` and `Default` as chip instances (code-pill style), not plain text.
- Free-text string properties (e.g. `label`) → `Values` and `Default` as plain text nodes, not chip instances.
- Never mix chip and plain-text in the same cell.
- Plain text: strip markdown backticks; use `Cell text` reference style (e.g. IBM Plex Mono 12, info tone); 16px inset from top/left when absolutely positioned.
- When description content wraps and row height grows, set all four cells to stretch so they share the same row height.
- If a Figma enum uses symbol variant names, specs-facing values may use approved text equivalents for readability, but include a one-line note that Figma variant names use symbols.

## Figma MCP Editing Safeguards

- Use async APIs (`figma.getNodeByIdAsync`, `figma.variables.getVariableByIdAsync`) for dynamic-page documents.
- When adding rows, clone from the canonical property row and append to the table container so Auto Layout controls placement.
- After structural or formatting edits, capture a screenshot and verify row alignment plus chip/plain-text correctness before sign-off.

## Storybook Layout Contract

- Expose only documented properties in controls, using canonical Figma property names; remove stale or legacy controls from the public surface.
- Keep controls order aligned with the Properties table order in the canonical doc.
- Default story args must match documented defaults and documented component family.
- Do not leave empty prop rows or placeholder sections in autodocs or MDX tables.
- Remove legacy examples from canonical docs stories when the component family changes.

## Machine-Readable ID Usage

- `property_id`, `variant_id`, and `behavior_id` are stable join keys between Figma, docs, Storybook, and code.
- `support` records whether a Figma property is `runtime`, `content`, `preview-only`, or `not-exposed` in code.
- `code_aliases` captures temporary implementation drift without changing the canonical property name.
- Resolve parity by canonical ID first, not by whichever label happens to appear in one surface.

## Workflow

1. Receive updated component doc with canonical IDs as input.
2. Sync Figma configuration content to match the doc.
3. Apply Figma Layout Contract (remove rows, reflow, align cell heights, resize container).
4. Apply Figma Value Formatting Contract (chip/plain-text rules).
5. Ensure the Figma demo instance is the correct component at documented defaults.
6. Sync Storybook controls/docs to match the doc.
7. Apply Storybook Layout Contract (remove stale controls, align order, confirm default args).
8. Parity check by canonical ID: confirm doc, Figma, and Storybook match with no property-level drift.
9. For Figma specs changelog blocks: apply strict labels `ADDED` / `UPDATED` / `REMOVED`, hide empty sections, and remove empty bullet rows.
10. Keep Figma specs concise and designer-facing; avoid copying long-form central-doc prose into spec surfaces.

## Quality Gate

Before finishing:

- **Specs frame naming:** Frame must be named exactly `[ComponentName] - Specifications` (e.g., `Image - Specifications`, `Button - Specifications`).
- Figma demo instance: correct component family, documented default values.
- Figma demo instance: placed inside the Component window/container (not floating outside).
- Figma table: no hidden/empty placeholder rows, no vertical gaps after row operations.
- Property rows: canonical order, four-column alignment (matching Y position and height).
- Property rows: order and `Default` match the source Figma component properties.
- No hidden obsolete cells in the active table grid.
- Table/container resized to current row set — no trailing empty area.
- Enum/boolean/swap/select rows: chip instances for values/defaults.
- Free-text rows: plain text for values/defaults (no chip chrome).
- No row has mixed visible chip and plain-text content in the same cell.
- Storybook: only documented properties, in canonical order, with correct default story.
- No drift between doc, Figma, and Storybook when compared by canonical ID.
