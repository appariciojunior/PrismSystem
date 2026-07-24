---
name: token-reference-fast-path
description: Deterministic MCP-only workflow for token reference queries. Produces grouped table output for quick, repeatable responses.
metadata:
  category: reference
  agents: [Architect, Code, Testing]
  autonomy: autonomous
---

# Skill: Token Reference Fast Path

## Purpose

Provide fast, consistent token reference answers using MCP only, with deterministic grouped table output and no implementation guidance.

## Preconditions

- User request is reference-only (for example: "which tokens", "suggest tokens", "token reference", "no implementation").
- Request does not require token mutation.
- MCP token tools are available.
- If intent involves a component or interaction pattern (for example modal, drawer, onboarding flow), Mobbin MCP is available for pre-query grounding.

## Inputs

| Parameter   | Type   | Required | Description                                                            |
| ----------- | ------ | -------- | ---------------------------------------------------------------------- |
| intent      | string | yes      | Natural-language reference intent (for example: warning modal tokens). |
| theme_scope | string | no       | Optional scope such as core, uk, light/core, dark/core.                |
| state_scope | string | no       | Optional state scope such as warning, error, success, info.            |

## Procedure

1. Run MCP token discovery only.
2. If intent is component/pattern-oriented, run Mobbin MCP first to collect shipped-pattern evidence.
3. Use Mobbin findings to refine token-search intent terms.
4. Use stable retrieval defaults:
   - token type filter: color
   - fixed result cap (for example: 20)
5. If results are partial/noisy:
   - Retry once with narrower intent.
   - Retry once with explicit scope constraints.
6. Normalize rows to semantic token references and descriptions.
7. Group by application area in exact order:
   - Fill
   - Border
   - Icon
   - Text
   - Other
8. Sort rows alphabetically by semantic token path inside each group.
9. Render table-only output for each group with exact columns:
   - Semantic Token
   - Description

## Outputs

| Output                   | Type     | Description                                           |
| ------------------------ | -------- | ----------------------------------------------------- |
| grouped_reference_tables | markdown | Grouped tables in deterministic order and schema.     |
| data_quality_note        | string   | Optional single-line note when MCP output is partial. |

## Error Handling

- Do not switch to non-MCP validation fallback for this skill.
- If MCP still returns partial data after retries, return grouped tables with this exact note:
  - `Data Quality: MCP partial match. Tokens listed are highest-confidence semantic references for this intent.`

## Example Output Shape

## Token Reference: Warning Modal

### Fill

| Semantic Token         | Description                                                                     |
| ---------------------- | ------------------------------------------------------------------------------- |
| messaging.fill.warning | Warning message background. Signals caution, blocked action, or attention need. |

### Border

| Semantic Token           | Description                                                           |
| ------------------------ | --------------------------------------------------------------------- |
| messaging.border.warning | Warning message border. Reinforces warning intent with colour accent. |

### Icon

| Semantic Token         | Description                                         |
| ---------------------- | --------------------------------------------------- |
| messaging.icon.warning | Status icon used within warning messaging surfaces. |

### Text

| Semantic Token | Description                                    |
| -------------- | ---------------------------------------------- |
| text.primary   | Primary body text colour for readable content. |

### Other

| Semantic Token  | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| surface.overlay | Semi-transparent overlay used for modal backdrops and dimming. |
