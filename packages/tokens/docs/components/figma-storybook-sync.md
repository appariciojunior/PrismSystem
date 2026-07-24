# Button Figma Storybook Sync Contract

status: DRAFT
component: button
component_version: 1.0.0
last_reviewed: 2026-03-08

## Purpose

Define how Button properties and behavior map consistently between Figma, the published component doc, and Storybook. Figma component properties are the source of truth for property names, defaults, and allowed values.

## Canonical IDs

| Field               | Description                | Example                    |
| ------------------- | -------------------------- | -------------------------- |
| `component_id`      | Stable component key       | `button`                   |
| `component_version` | Component contract version | `1.0.0`                    |
| `property_id`       | Stable property key        | `button.intent`            |
| `variant_id`        | Stable variant key         | `button.state.loading`     |
| `behavior_id`       | Invisible behavior key     | `button.a11y.iconOnlyName` |

## Mapping Rules

| Canonical Type   | Figma                   | Storybook                       | Rule                                         |
| ---------------- | ----------------------- | ------------------------------- | -------------------------------------------- |
| enum property    | Variant property        | select/radio control            | values and labels must match exactly         |
| boolean property | Boolean property        | boolean control                 | defaults must match exactly                  |
| text property    | Text property           | text control                    | same placeholder and default behavior        |
| icon property    | Boolean + instance swap | boolean + icon selector control | use icon library IDs, not local ad hoc names |
| state property   | Variant property        | control + dedicated stories     | mark preview-only vs runtime-supported       |

## Component Doc Embedding Contract

Machine-readable IDs live in YAML frontmatter on each versioned component doc.

Required top-level fields:

- `status`
- `component_id`
- `component_version`
- `owners`
- `last_reviewed`
- `storybook_refs`
- `figma_refs`
- `parity_state`
- `canonical_ids`

`canonical_ids` must contain:

- `properties[]` entries with `property_id`, `figma_property`, `support`, and optional `code_property` / `code_aliases`
- `variants[]` entries with `variant_id`, `property_id`, and `value`
- `behaviors[]` entries with `behavior_id` and `concern`

ID naming rules:

- `component_id`: stable slug per component (for example `link`)
- `property_id`: `<component_id>.<property>` (for example `link.intent`)
- `variant_id`: `<component_id>.<axis>.<value>` (for example `link.state.hover`)
- `behavior_id`: `<component_id>.<namespace>.<name>` (for example `link.a11y.focusVisible`)

Canonical naming rule:

- IDs follow canonical Figma property terms, not implementation aliases.
- If code still exposes a legacy alias, store it in `code_aliases` and keep the ID unchanged.

## Parser Validation Spec (Link Pilot)

For `link/Link.md`, parser validation should enforce:

1. Frontmatter exists and includes all required top-level fields.
2. `component_id` equals `link`, and `component_version` equals `1.0.0`.
3. Every row in the Properties table has exactly one matching `property_id` entry by `figma_property`.
4. Every documented state section (`Base`, `Hover`, `Pressed`, `Focus`, `Visited`, `Disabled`) has one matching `variant_id`.
5. Every Accessibility row concern has one matching `behavior_id` entry.
6. IDs are unique within each collection (`properties`, `variants`, `behaviors`).
7. `support` governs the `Code Property` cell: `runtime` / `content` must match `code_property`; `preview-only` must render as `preview-only`; `not-exposed` must render as `not exposed`.
8. If a code alias differs from the canonical term, store it in `code_aliases`; do not rename the ID or the published `Code Property` cell to the alias.
9. Validation fails on missing, duplicate, or orphaned IDs.

Link pilot expected examples:

- `property_id`: `link.intent` maps Figma `intent` to code `intent` with legacy alias `variant`
- `variant_id`: `link.state.hover`
- `behavior_id`: `link.security.hrefRequired`

## Sync Directions

1. Component doc -> Storybook

- Update `argTypes`, defaults, and stories to match Figma property names and the published component doc.

2. Component doc -> Figma

- Update the published component doc and Storybook whenever the Figma property model changes.

3. Figma/Storybook -> Component doc

- Any divergence discovered in implementation must be logged in the changelog section of `Button.md` and tracked as a parity gap against the Figma property model.

## Conflict Resolution

- If Figma properties and implementation disagree, Figma property names/defaults win.
- The component doc records the approved contract and any temporary implementation alias or parity gap.
- Breaking changes require a component version bump and changelog entry.
- Temporary product exceptions must be documented with owner and sunset target.

## Validation Checklist

- Every Storybook control maps to one property row in `Button.md`.
- Every exposed Figma property maps to one property row in `Button.md`.
- Defaults match in all three places: component doc, Storybook, Figma.
- State names are identical across surfaces.
- Icon properties reference the design system icon library contract.
- Accessibility requirements (icon-only labeling, keyboard activation) are represented in docs and validated.

## Automation Candidates (Future)

- Lint check to compare Storybook `argTypes` against `Button.md`.
- Export/import bridge for Figma property definitions.
- Component-level parity report generated per release.
