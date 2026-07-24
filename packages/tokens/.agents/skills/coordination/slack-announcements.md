---
name: slack-announcements
description: Generate Slack release announcements for UI Kit or Token Library using markdown, no emojis, and strict Added/Removed/Updated grouping.
license: MIT
metadata:
  category: coordination
  agents: [Architect, Code, Testing]
  autonomy: autonomous
  trigger: release-doc-generation
---

# Slack Announcements

## Purpose

Create clear Slack announcements for designers, developers, and product owners using release-source data.

## Mandatory Format

- Markdown format.
- No emojis.
- Group content under:
  - Added
  - Removed
  - Updated
- Use bullet points under each section.

## Scope by Library

### UI Kit Slack

- Include only UI Kit component updates relevant to Figma/design usage.
- Do not include token library dependency details.
- Do not include docs, infrastructure, or code-only updates.
- UI Kit is not versioned as a product; list component versions only.
- Must include UI Kit Figma link at the top.
- Must include Figma library attach/update instructions at bottom.
- Must include this line before steps: If you already have the UI Kit library attached, just click Update.

### Token Library Slack

- Include only token library updates relevant to Figma/design usage.
- Do not include UI Kit component release details.
- Do not include docs, infrastructure, or code-only updates.
- Token Library is versioned.
- Must include Token Library Figma link at the top.
- Must include Figma library attach/update instructions at bottom.
- Must include this line before steps: If you already have the Token Library attached, just click Update.

## Input Source Priority

1. packages/tokens/release/changelog.md
2. packages/tokens/release/token-library/CHANGELOG.md
3. packages/tokens/release/ui-kit/CHANGELOG.md

If conflicts exist, use the master changelog source as canonical.

## Output Skeleton

```markdown
# <Library Release Title>

Figma: <link>

## Added

- ...

## Removed

- ...

## Updated

- ...

How to attach or update the <Library Name> in Figma:

1. ...
2. ...
```

## Quality Gate

- No emojis present.
- Correct scope for library type.
- Includes top Figma link.
- Includes bottom attach/update instructions.
- Includes Added/Removed/Updated headings with bullet lists.
