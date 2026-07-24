---
name: component-documentation-writing
description: Canonical writing standard for component docs using a fixed section model and Figma property truth.
license: MIT
metadata:
  category: storybook
  agents: [Architect, Code, Testing, React Expert]
  autonomy: autonomous
  portable: true
---

# Component Documentation Writing

## Purpose

Write multi-audience component docs that are concise, testable, and aligned to Figma component properties.

## Core Rules

1. Figma component properties are source-of-truth for property names, defaults, and allowed values.
2. Keep exactly one canonical component doc per component folder.
3. Keep changelog in separate file `<component>-changelog.md`.
4. No future-tense placeholders, open questions, or boilerplate filler.
5. State bespoke behavior explicitly (do not defer to browser defaults).

## Required Structure

1. `# <Component> <version>`
2. `## Summary`
3. `## Properties`
4. `## When to Use / When Not to Use`
5. `## States and Interactions`
6. `## Accessibility`
7. `## Related Components`
8. `## Checklist` (`### Designer`, `### Developer`)

For simple components, sections 4 and 7 may be omitted with rationale.

## Table Contracts

Atomic component exception:

- For atomic/foundation components, `Related Components` and `Checklist` may be omitted when they do not add decision value.
- Keep docs minimal and defer composition guidance to parent component docs.

### Messaging-Family Extension (Mandatory When Applicable)

For messaging-family components, include a `## Framework Positioning` section between Summary and Properties with:

- Criticality
- Placement
- Semantic scope
- Action model
- Out-of-scope patterns

## File Naming and Versioning Contract

- Keep exactly one markdown component doc per component folder.
- Filename format is `<Component>.md` (for example: `Link.md`).
- Keep one dedicated changelog file at component root: `<component>-changelog.md`.
- When shipping a new component doc version, append the release note in `<component>-changelog.md` and update Storybook rendering.
- Do not keep `*-proposal.md`, draft duplicates, or parallel canonical docs in the same component folder.

## Properties Table Standard

Properties table:

| Figma Property | Code Property | Type | Allowed Values | Default | Description |
| -------------- | ------------- | ---- | -------------- | ------- | ----------- |

Accessibility table:

| Concern | Requirement | Example + Notes |
| ------- | ----------- | --------------- |

Minimum concerns: accessible name, keyboard activation, focus visibility, semantic use, href/role requirement, clickable area.

Rules:

- Document the design-system bespoke focus border in the Focus visibility row. Do not reference the native browser ring.
- Security guidance (e.g. `rel="noopener noreferrer"`) belongs in the relevant accessibility row, not a standalone section.
- Do not add border/contrast guidance unless the component explicitly defines a border/stroke in the component contract.

## Related Components Table Standard

Related components table:

| Component | Relationship |
| --------- | ------------ |

## Code Property Mapping

Use one of:

- runtime
- content
- preview-only
- not exposed

Do not add synthetic Figma property rows.

## States and Interactions Format

Per state include:

1. Storybook args block
2. Purpose sentence
3. Implementation notes (1-3 sentences)

## Workflow

1. Inspect Figma properties and variants.
2. Mirror them in the Properties table.
3. Add machine-readable IDs in frontmatter when required.
4. Update changelog in `<component>-changelog.md`.
5. Run writing quality gate before publish.

## Quality Gate

- Required sections present (or omission justified)
- One canonical doc file in folder
- One changelog file in folder
- No placeholders/open questions
- No synthetic properties
- Accessibility requirements are concrete and testable
