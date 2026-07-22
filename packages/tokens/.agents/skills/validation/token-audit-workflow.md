---
name: token-audit-workflow
description: Use Design System Tokens MCP audit_design_system to detect naming drift, duplicate values, and heuristic contrast issues.
license: MIT
metadata:
  category: validation
  agents: [Architect, Code, Testing]
  autonomy: autonomous
---

# Token Audit Workflow

## Purpose

Run a fast, repeatable audit pass before or after token changes to detect systemic risks.

## Preconditions

- `ds-tokens-mcp` server is running.
- Token changes are present or baseline assessment is requested.

## Inputs

| Parameter         | Type    | Required | Description                         |
| ----------------- | ------- | -------- | ----------------------------------- |
| `mode`            | enum    | no       | `all`, `light`, `dark`              |
| `includeContrast` | boolean | no       | Include text/icon-to-surface checks |
| `contrastLevel`   | enum    | no       | `AA` or `AAA`                       |

## Procedure

1. Run `audit_design_system` for the relevant mode.
2. Review `summary.score` and issue counts.
3. Validate critical findings with exact token lookups when needed.
4. Escalate blocking issues before implementation approval.

## Outputs

| Output           | Type   | Description                   |
| ---------------- | ------ | ----------------------------- |
| `summary`        | object | Health score and issue totals |
| `duplicates`     | array  | Duplicate value groups        |
| `namingIssues`   | array  | Naming consistency issues     |
| `contrastIssues` | array  | Heuristic accessibility risks |

## Example

```text
INVOKE: mcp/ds-tokens-mcp/audit_design_system
INPUTS: { mode: "all", includeContrast: true, contrastLevel: "AA" }
```
