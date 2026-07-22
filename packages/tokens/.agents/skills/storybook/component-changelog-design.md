---
name: component-changelog-design
description: Document design-specific changes in Figma. Full component changelogs (including code/API/implementation) live in Storybook and markdown docs; design-only changelogs track Figma structure, variants, visual properties, and design decisions separately.
license: MIT
metadata:
  category: storybook
  agents: [Architect, Code, React Expert, Figma Executor]
  autonomy: autonomous
  portable: true
---

# Component Changelog — Design Only (Figma)

## Purpose

Maintain a design-focused changelog inside Figma that tracks structure, visual, and property changes independent of code/implementation. Full changelogs (code + design unified) live in Storybook component docs and `<Component>-<version>.md` markdown files. This skill defines what belongs in a design-only changelog and how to maintain it in Figma.

Full history now lives in `<component>-changelog.md` and Storybook; Figma specs changelog should stay concise and design-only.

## Scope: What Goes in Design-Only Changelog

### ✅ Include

- **Figma property changes**: Added, removed, renamed, or reordered component properties
- **Visual/styling changes**: Color updates, typography variants, spacing adjustments, effects, stroke/fill changes
- **Variant or state changes**: New states/variants added, removed, or restructured
- **Component structure changes**: Child frame/layer reorganizations, grid layout changes, nesting changes
- **Design rationale**: Decisions explaining _why_ a visual or structural choice was made
- **Figma-only preview controls**: Property changes that exist in Figma but not in code
- **Theme or mode updates**: Design token assignments, dark mode adjustments

### ❌ Do Not Include

- **Code API changes** (props, methods, events) — these belong in the full changelog
- **Implementation details** (React components, CSS specifics) — code team owns these
- **Accessibility implementation** — belongs in full changelog
- **Package versioning or release metadata** — tracked separately in monorepo changelog
- **Non-design doc updates** (typos, formatting) — not changelog-worthy

## Design-Only Changelog Structure

### Header

```
Component: <Name>
Version: <X.Y.Z>
Date: <YYYY-MM-DD>
Figma Status: [Draft | Review | Published]
```

Rules:

- Version text is plain semver (`2.0.0`), never `v2.0.0`.
- Author is omitted by default unless explicitly requested.

### Entry Format

Use strict section labels only:

```
ADDED
- ...

UPDATED
- ...

REMOVED
- ...
```

Rules:

- Labels are exactly `ADDED`, `UPDATED`, `REMOVED` in uppercase.
- Hide/remove any section with no entries.
- Empty bullet rows are not allowed.

### Status and Stacking

- Use instance status variants `current` and `previous`.
- Stack entries in a single parent auto-layout container with `itemSpacing = 0`.
- Entry order is newest first (`current`), then prior releases (`previous`).

### Date Format

Use ISO 8601 (`YYYY-MM-DD`) for all dates so sorting/filtering is deterministic.

### Temporal Resolution

- **Within one day**: Group related design changes into one entry
- **Across days**: Separate entries by date
- **Version boundary**: One entry per published version; note when version was finalized

## Figma Template Layout

### Design-Only Changelog Template Sections

1. **Entry Container** — Component instance override only (no master edits)
2. **Header Row** — Version + Date + status variant
3. **ADDED Section** — Required if non-empty
4. **UPDATED Section** — Optional, hide if empty
5. **REMOVED Section** — Optional, hide if empty

### Figma Container Sizing

Design-only changelog entries should be self-contained frames sized to:

- Height = 400–800px (depending on entry fullness; empty sections collapse)
- Width = 1200px (readable in 2-column page layouts)
- Padding = 40px (horizontal), 30px (vertical)
- Corner radius = 8px, subtle shadow

Rows and sections use auto-layout VERTICAL; entry stacking is controlled by parent container gap 0.

## Metadata Contract

All design-only changelog entries in Figma must include a YAML metadata block in the frame description or as a layer comment:

```yaml
design_changelog_v1:
  component_id: 'flag'
  version: '2.0.0'
  date: '2026-03-24'
  editor: 'Design Team'
  status: 'published'
  supercedes: '1.0.0'
  figma_refs:
    - node_id: '146:2509'
      description: 'Primary variant grid'
    - node_id: '146:2563'
      description: 'Secondary variant grid'
  visual_changes: 3
  property_changes: 2
  variant_changes: 1
  structure_changes: 0
  rationale_entries: 1
```

## Quality Gate Checklist

Before finalizing a design-only changelog entry:

- [ ] Component and version names are explicit and unambiguous
- [ ] Date uses agreed format (`YYYY-MM-DD` or approved display format)
- [ ] All changes are design-only scope (no code/API/implementation items)
- [ ] Labels are strict uppercase ADDED/UPDATED/REMOVED
- [ ] Empty sections are hidden/removed
- [ ] No empty bullet points are visible
- [ ] No typos, incomplete sentences, or placeholder text
- [ ] Frame sizing allows full content visibility without horizontal scroll
- [ ] Current/previous statuses are correctly applied
- [ ] Entries are stacked in one container with gap 0
- [ ] Version labels contain no `v` prefix

## Relationship to Full Changelogs

| Scope             | Location                           | Audience                          | Tracks                         |
| ----------------- | ---------------------------------- | --------------------------------- | ------------------------------ |
| Design-only       | Figma (this template)              | Designers                         | Visuals, properties, rationale |
| Code-only         | Component code, in-file comments   | Developers                        | API, implementation, deps      |
| Unified/canonical | Storybook MDX + component markdown | All (designers + developers + PO) | Everything relevant to release |

**Rule**: A change goes into the design-only changelog _first_. When the release is tagged, relevant entries from the design-only changelog are _referenced_ or _summarized_ in the unified changelog in Storybook/markdown, not duplicated.

## Workflow

1. Designer completes design work for a component update.
2. Designer creates a new entry in the Figma design-only changelog template using this skill.
3. Designer categorizes changes and fills in visual/property/variant/structure/rationale sections.
4. Designer includes token references and Figma node IDs for traceability.
5. Designer marks entry status as `Draft`.
6. Design review (if applicable): change status to `Review`.
7. Once approved: change status to `Published` and finalize date.
8. At release time: code team reads the design-only changelog and incorporates summaries into the unified release changelog in Storybook/markdown.

## Example Entry

```
Component: Flag
Version: 2.0.0
Date: 2026-03-24
Editor: Design Team
Figma Status: Published
Supercedes: 1.0.0

**Previous Version**: Flag 1.0.0 (2026-01-15)

---

VISUAL: Updated callout intent fill color
- Changed from brand.core.orange.500 to brand.core.red.600
- Improves contrast in light mode (WCAG AA)
- Dark mode: brand.core.red.400 (auto-mapped by token)
- Affects all callout variants: medium, small

---

PROPERTY: Removed intent='channel'
- Channel intent was deprecated in favor of secondary / callout split
- Migration: map existing channel instances to secondary or callout by context
- All property logic files updated in Figma

---

VARIANT: Added disabled state
- New disabled state added to all size/intent combinations (6 variants total)
- Disabled: uses neutral.500 fill, 50% opacity
- Grid reference: node 146:2509

---

RATIONALE: Channel consolidation improves intent clarity
- Channel mixed semantic meaning with secondary (both "alternate" treatment)
- Splitting into secondary (neutral emphasis) and callout (urgent emphasis) makes intent explicit
- Aligns with the design language: primary / secondary / callout hierarchy

---

References:
- [Intent variants grid](figma://node/146:2509)
- [Accessibility guidance](figma://node/146:2563)
- Related: Chip component (similar intent options)
```

## Implementation Notes for Agents

- **Architects**: Use design-only changelog to plan design-code alignment during parity reviews.
- **Code agents**: Reference design-only changelog when implementing code changes to ensure visual/property parity.
- **React expert**: Check design-only changelog for property changes that affect component API.
- **Figma executor**: Follow this skill when creating or updating design-only changelog entries in the template.
