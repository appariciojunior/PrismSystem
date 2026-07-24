---
name: palette-gate
description: Compatibility wrapper for palette-layer gating. Delegates to token-modification-gates.
license: MIT
metadata:
  category: governance
  agents: [Architect, Code, Testing]
  autonomy: requires-approval (for semantic tickets)
---

# Palette Gate

## Purpose

This skill is kept for backward compatibility. Canonical gate logic now lives in:

- `./token-modification-gates.md`

## Palette Rule

For palette token paths:

- `read` is always allowed
- `write` and `delete` are blocked on semantic-only tickets
- palette/full tickets require `palette/approval`

## How to Use

1. Invoke `token-modification-gates`.
2. Provide `token_path`, `operation`, `ticket_type`, and `has_palette_label`.
3. Follow escalation guidance if blocked.

## Notes

- Palette changes have broad downstream impact.
- Use semantic-layer adjustments when scope allows.
