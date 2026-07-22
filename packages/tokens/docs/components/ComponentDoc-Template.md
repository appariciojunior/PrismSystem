---
status: DRAFT
component_id: component-name
component_version: 1.0.0
owners:
  design: TBD
  engineering: TBD
last_reviewed: YYYY-MM-DD
storybook_refs:
  - stories/components/Component.stories.js
figma_refs:
  - file_key: REPLACE_WITH_FIGMA_FILE_KEY
    template_node_id: 'REPLACE_WITH_NODE_ID'
parity_state: pending-validation
canonical_ids:
  properties:
    - property_id: component-name.property-name
      figma_property: propertyName
      code_property: propertyName
      support: runtime
  variants:
    - variant_id: component-name.state.base
      property_id: component-name.state
      value: base
  behaviors:
    - behavior_id: component-name.a11y.accessibleName
      concern: Accessible name
---

# Component 1.0.0

## Summary

Component summary in 1-2 sentences.

---

## When to Use / When Not to Use

### Do

- Use when...

### Don't

- Do not use when...

---

## States and Interactions

### Base

**Purpose**: One sentence.

**Implementation notes**: 1-3 sentences.

---

## Accessibility

| Concern         | Requirement         | Example + Notes                     |
| --------------- | ------------------- | ----------------------------------- |
| Accessible name | Define requirement. | Add practical implementation notes. |

---

## Native Notes (iOS and Android)

- Keep this section short and optional. Include only notes that change behavior or accessibility on iOS/Android.
- Do not duplicate the web contract. Link to the same design/token decisions unless platform behavior differs.
- Typical coverage: touch target sizing, accessible naming parity, and notable interaction differences (for example no hover).

---

## Related Components

| Component | Relationship                    |
| --------- | ------------------------------- |
| Button    | Brief relationship description. |

---

## Checklist

### Designer

- [ ] Checklist item.

### Developer

- [ ] Checklist item.

---

## Changelog

Date Published: `TBD`

| Date  | Entry                                     |
| ----- | ----------------------------------------- |
| `TBD` | `ADDED` Initial component contract draft. |
