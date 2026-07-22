---
name: token-modification-gates
description: Unified gate for foundation and palette token edits. Enforces approval labels, ticket scope, and safe escalation.
license: MIT
metadata:
  category: governance
  agents: [Architect, Code, Testing]
  autonomy: requires-approval
---

# Token Modification Gates

## Purpose

Provide one shared decision flow for protected token layers:

- Foundation: always approval-gated for write/delete.
- Palette: approval-gated for palette work and blocked for semantic-only tickets.

Use this as the canonical gate skill. `foundation-gate.md` and `palette-gate.md` are compatibility wrappers.

## Inputs

| Parameter              | Type    | Required | Description                                        |
| ---------------------- | ------- | -------- | -------------------------------------------------- |
| `token_path`           | string  | yes      | Target token path                                  |
| `operation`            | enum    | yes      | `read`, `write`, `delete`                          |
| `ticket_type`          | enum    | no       | `semantic`, `palette`, `full` (default `semantic`) |
| `has_foundation_label` | boolean | no       | PR has `foundation-change`                         |
| `has_palette_label`    | boolean | no       | PR has `palette/approval`                          |

## Layer Detection

Foundation indicators:

- `foundation.` prefix
- `Foundation.` prefix

Palette indicators:

- `light/ brand`
- `dark/ brand`
- `light/ channels`
- `dark/ channels`
- `brand.core.ramp`
- `brand.channels.ramp`

## Decision Table

| Layer      | Operation    | Ticket Type  | Label Requirement   | Result           |
| ---------- | ------------ | ------------ | ------------------- | ---------------- |
| Foundation | read         | any          | none                | allow            |
| Foundation | write/delete | any          | `foundation-change` | block if missing |
| Palette    | read         | any          | none                | allow            |
| Palette    | write/delete | semantic     | n/a                 | block            |
| Palette    | write/delete | palette/full | `palette/approval`  | block if missing |
| Other      | any          | any          | none                | allow            |

## Escalation Messages

Foundation block:

1. Request explicit human approval.
2. Request `foundation-change` label.
3. Run dependency impact check before write.

Palette block on semantic ticket:

1. Keep change in semantic layer only, or
2. Reclassify ticket to palette/full, then request `palette/approval`.

## Required Follow-Up When Allowed

If a protected-layer write is approved:

1. Document rationale in commit message.
2. Run dependency and parity checks.
3. Run full validation (`json`, `test`, `build`).

## Integration Points

Invoke this skill before:

- `editing/safe-token-edit`
- `editing/bulk-transform`
- any script that mutates `tokens.json`
