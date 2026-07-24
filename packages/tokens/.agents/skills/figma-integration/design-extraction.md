---
name: design-extraction
description: Runtime extraction and handoff workflow for Figma Console MCP with deterministic outputs and evidence contracts.
license: MIT
metadata:
  category: figma-integration
  agents: [Architect, Code, Testing, React Expert]
  autonomy: autonomous
  portable: true
---

# Figma Design Extraction

## Purpose

Define runtime extraction workflow once preflight is complete.

For setup, mode behavior, and troubleshooting baseline, use `./figma-console-mcp-integration.md` first.

## Runtime Rules

- Prefer one high-signal extraction call over fragmented calls.
- Never guess missing values; re-query with narrower scope.
- Keep property tables 1:1 with real component properties.
- For docs/specs descriptions, write present-state behavior only.

## FOM 2026 Fields (When using execute)

Use documented terms only:

- GRID container: `layoutMode`, `gridRowCount`, `gridColumnCount`, `gridRowGap`, `gridColumnGap`
- GRID child: `setGridChildPosition`, `gridRowSpan`, `gridColumnSpan`
- Absolute in auto-layout: `layoutPositioning='ABSOLUTE'`
- Variable binding: `setBoundVariable`, `setRangeBoundVariable`

## Tool Routing

| Intent                            | Preferred Tool                        |
| --------------------------------- | ------------------------------------- |
| Full system extraction            | `figma_get_design_system_kit`         |
| Component implementation payload  | `figma_get_component_for_development` |
| Component metadata/reconstruction | `figma_get_component`                 |
| Variables/tokens                  | `figma_get_variables`                 |
| Styles                            | `figma_get_styles`                    |
| Parity check                      | `figma_check_design_parity`           |
| Node writes/advanced layout       | `figma_execute` (local only)          |
| Post-change linting               | `figma_lint_design`                   |
| Screenshot evidence               | `figma_take_screenshot`               |

## Extraction Flows

### A) Full design system

1. Resolve file URL or key.
2. Run `figma_get_design_system_kit` with minimum include scope.
3. Prefer compact/summary format for large files.
4. Record `errors` and `ai_instruction` before downstream actions.

### B) Single component

1. Run `figma_get_component_for_development`.
2. If needed, run `figma_get_component` in metadata mode.
3. Produce mapping table: Figma value -> token alias -> code usage.

### C) Token/style focused

1. Variables work: `figma_get_variables`.
2. Style layer work: `figma_get_styles`.
3. Request explicit export format when needed.

## Deterministic Variable Reads

In multi-file sessions, always provide explicit `fileUrl` to `figma_get_variables`.

If output looks incomplete:

1. Re-run with explicit `fileUrl`.
2. Add `refreshCache: true`.
3. Treat that response as source evidence for the session.

## Output Contract

Each handoff must include:

1. Mode/readiness snapshot
2. Tools called in order
3. Artifacts produced (kit, screenshot, lint/parity report)
4. Any mode-limited gaps and next required step

## Related Skills

- `./figma-console-mcp-integration.md`
- `./component-lifecycle-orchestration.md`
- `./design-linting.md`
