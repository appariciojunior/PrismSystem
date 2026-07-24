---
status: DRAFT
component_id: divider
component_version: 1.1.0
owners:
 design: TBD
 engineering: TBD
last_reviewed: 2026-04-02
figma_refs:
 - role: source_component
 file_key: YOUR-FIGMA-FILE-KEY
 node_id: '7459:10736'
 - role: documentation_sync_target
 file_key: YOUR-FIGMA-FILE-KEY
 node_id: '8426:7477'
parity_state: implemented
canonical_ids:
 properties:
 - property_id: divider.variant
 figma_property: style
 code_property: variant
 support: runtime
 - property_id: divider.direction
 figma_property: direction
 code_property: direction
 support: runtime
 - property_id: divider.padding
 figma_property: padding
 code_property: padding
 support: runtime
 variants:
 - variant_id: divider.variant.dashed
 property_id: divider.variant
 value: dashed
 - variant_id: divider.variant.solid
 property_id: divider.variant
 value: solid
 - variant_id: divider.direction.horizontal
 property_id: divider.direction
 value: horizontal
 - variant_id: divider.direction.vertical
 property_id: divider.direction
 value: vertical
 - variant_id: divider.padding.true
 property_id: divider.padding
 value: 'true'
 - variant_id: divider.padding.false
 property_id: divider.padding
 value: 'false'
 behaviors:
 - behavior_id: divider.a11y.role
 concern: Semantic role
 - behavior_id: divider.a11y.ariaOrientation
 concern: Axis declaration
---

# Divider 1.1.0

## Summary

Dividers create visual separation between content sections. Use a dashed divider for content breaks and a solid divider for structural UI separation. Supports horizontal and vertical orientations.

---

## Properties

| Figma property | Code property | Type | Values | Default | Description |
| -------------- | ------------- | ------- | ------------------------ | ------------ | ---------------------------------------------------------------------------------- |
| `style` | `variant` | string | `dashed`, `solid` | `dashed` | Sets the line style. Dashed for section breaks, solid for structural separation. |
| `direction` | `direction` | string | `horizontal`, `vertical` | `horizontal` | Sets the axis along which the divider is drawn. |
| `padding` | `padding` | boolean | `true`, `false` | `true` | Adds gutter spacing (24 px) around the line. |

---

## When to Use / When Not to Use

### Do

- Use a **dashed** divider between content sections (e.g. article lists, feed items).
- Use a **solid** divider to separate structural UI regions (e.g. header from body, sidebar from main).
- Use `padding=true` when the divider needs breathing room within a flow layout.
- Use `direction=vertical` to separate side-by-side columns or inline elements.

### Don't

- Do not use a divider as a substitute for adequate spacing alone; dividers communicate a semantic break, not just margin.
- Do not stack multiple dividers back-to-back without intervening content.
- Do not use a divider as a decorative element unrelated to content grouping.

---

## States and Interactions

Dividers are non-interactive. They have no hover, focus, pressed, or disabled states.

### Base

**Purpose**: Provides a visual content boundary. Horizontal dividers use `--border-secondary`; vertical dividers use `--border-tertiary`.

**Implementation notes**: Rendered as `<div role="separator">` with `aria-orientation` set to the direction prop. Use `border-top` (horizontal) or `border-left` (vertical) to maintain 1 px rendering at all pixel ratios.

---

## Accessibility

| Concern | Requirement | Example + Notes |
| ---------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Semantic role | The element must expose `role="separator"` to assistive technology. | Using a plain `<div>` without `role="separator"` will make the divider invisible to screen readers. |
| Axis declaration | `aria-orientation` must match the visual direction of the divider. | `aria-orientation="horizontal"` (default) or `aria-orientation="vertical"`. |
| Not interactive | Dividers must not receive keyboard focus or interactive ARIA roles. | Do not add `tabindex`, `aria-label`, or interactive roles to a divider. |

---

## Native Notes

- On iOS, use a 1 pt hairline `UIView` with `accessibilityElementsHidden = true` to keep the divider out of the accessibility tree.
- On Android, use a horizontal or vertical `View` with `importantForAccessibility="no"`.
- No touch target required — dividers are purely visual.

---

## Related Components

| Component | Relationship |
| --------- | -------------------------------------------------------------------------------- |
| Chip | Chips may appear separated by dividers in filter rows. |
| Button | Buttons are sometimes flanked by vertical dividers in toolbars or action groups. |

---

## Checklist

### Designer

- [ ] Use `style=dashed` for content contexts and `style=solid` for structural UI.
- [ ] Confirm `padding` setting is consistent with surrounding layout rhythm.
- [ ] Do not add labels or icons to the divider frame.

### Developer

- [ ] Render with `role="separator"` and correct `aria-orientation`.
- [ ] Do not add `tabindex` or interactive handlers.
- [ ] Use `--border-secondary` (horizontal) and `--border-tertiary` (vertical) tokens; do not hard-code colour values.
