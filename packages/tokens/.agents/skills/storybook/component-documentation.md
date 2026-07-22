---
name: component-documentation
description: Index skill. Delegates to component-documentation-writing (content) and component-documentation-figma (Figma/Storybook sync with canonical Figma-property IDs).
license: MIT
metadata:
  category: storybook
  agents: [Architect, Code, Testing, React Expert]
  autonomy: autonomous
  portable: true
---

# Component Documentation

This skill has been split into two focused skills:

- **[component-documentation-writing](./component-documentation-writing.md)** — 9-section canonical structure, Figma-property source-of-truth rules, and machine-readable ID contract.
- **[component-documentation-figma](./component-documentation-figma.md)** — Figma configuration table sync, value formatting, MCP safeguards, Storybook layout contract, and ID-based parity checks.

Use the writing skill for published contract work. Use the Figma skill when syncing to Figma or Storybook surfaces or when resolving implementation aliases against canonical Figma property names.
