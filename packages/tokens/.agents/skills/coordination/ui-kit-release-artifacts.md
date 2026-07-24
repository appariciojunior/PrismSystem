---
name: ui-kit-release-artifacts
description: Generate UI Kit release artifacts from master release source using strict scope and Added/Removed/Updated grouping.
license: MIT
metadata:
  category: coordination
  agents: [Architect, Code, Testing, Figma Executor]
  autonomy: autonomous
---

# UI Kit Release Artifacts

## Purpose

Create UI Kit release outputs that focus only on component changes relevant to Figma/design consumption.

## Required Outputs

1. UI Kit Slack announcement
2. UI Kit Figma publish message

## Scope Rules

- UI Kit is not versioned as a product.
- Components are versioned independently and should be listed by component name + version.
- Include only design-facing component changes.
- Exclude docs, infra, and code-only implementation notes.

## Formatting Rules

### UI Kit Slack

- Markdown.
- No emojis.
- Must include UI Kit Figma link at top.
- Must include attach/update instructions at bottom.
- Must include this line before steps: If you already have the UI Kit library attached, just click Update.
- Must use section grouping:
  - Added
  - Removed
  - Updated

### UI Kit Figma Publish

- Figma-facing updates only.
- Emojis allowed in bullets.
- Must use section grouping:
  - Added
  - Removed
  - Updated
- Must include CTA line at bottom:
  - Questions or feedback: #ds-support ([Slack channel](https://your-workspace.slack.example/ds-support))

## Source of Truth

- packages/tokens/release/changelog.md
- packages/tokens/release/ui-kit/CHANGELOG.md
- packages/tokens/docs/components/_/_-changelog.md

## Procedure

1. Read master changelog release entry.
2. Collect UI Kit component changes for current release date.
3. Build UI Kit Slack content using template.
4. Build UI Kit Figma publish content using template.
5. Validate scope and formatting.

## Quality Gate

- UI Kit Slack has no emojis.
- Both artifacts use Added/Removed/Updated bullet groups.
- UI Kit Slack includes top Figma link and bottom attach/update instructions.
- Figma publish includes only Figma-relevant component changes.
- No token-library-only updates leak into UI Kit artifacts.
