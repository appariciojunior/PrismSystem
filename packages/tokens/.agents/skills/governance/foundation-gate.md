---
name: foundation-gate
description: Compatibility wrapper for foundation-layer gating. Delegates to token-modification-gates.
license: MIT
metadata:
  category: governance
  agents: [Architect, Code, Testing]
  autonomy: blocked (always requires approval)
---

# Foundation Gate

## Purpose

This skill is kept for backward compatibility. Canonical gate logic now lives in:

- `./token-modification-gates.md`

## Foundation Rule

For foundation token paths, `write` and `delete` are blocked unless PR has `foundation-change` label and explicit human approval.

## How to Use

1. Invoke `token-modification-gates`.
2. Provide `token_path`, `operation`, and `has_foundation_label`.
3. Follow escalation guidance if blocked.

## Notes

- Foundation is highest-protection layer.
- Prefer palette or semantic adjustments when possible.
