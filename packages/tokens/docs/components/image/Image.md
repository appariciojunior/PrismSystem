---
status: ACTIVE
component_id: image
component_version: 1.0.0
owners:
  design: TBD
  engineering: TBD
last_reviewed: 2026-04-23
storybook_refs:
  - stories/components/Image.stories.tsx
figma_refs:
  - file_key: hcCXq9ObSEBdXtwROtBSNc
    node_id: '147:3182'
parity_state: aligned
canonical_ids:
  properties:
    - property_id: image.ratio
      figma_property: ratio
      code_property: ratio
      support: runtime
      default: 3:4
  variants:
    - variant_id: image.ratio.3-4
      property_id: image.ratio
      value: 3:4
      dimensions: '320×426.67'
    - variant_id: image.ratio.4-5
      property_id: image.ratio
      value: 4:5
      dimensions: '320×400'
    - variant_id: image.ratio.5-4
      property_id: image.ratio
      value: 5:4
      dimensions: '320×256'
    - variant_id: image.ratio.4-3
      property_id: image.ratio
      value: 4:3
      dimensions: '320×240'
    - variant_id: image.ratio.3-2
      property_id: image.ratio
      value: 3:2
      dimensions: '320×213.33'
    - variant_id: image.ratio.2-3
      property_id: image.ratio
      value: 2:3
      dimensions: '320×480'
    - variant_id: image.ratio.1-1
      property_id: image.ratio
      value: 1:1
      dimensions: '320×320'
    - variant_id: image.ratio.9-16
      property_id: image.ratio
      value: 9:16
      dimensions: '320×568.89'
    - variant_id: image.ratio.16-9
      property_id: image.ratio
      value: 16:9
      dimensions: '320×180'
    - variant_id: image.ratio.custom
      property_id: image.ratio
      value: custom
      dimensions: '320×250'
  behaviors: []
---

# Image v1.0.0

## Summary

Aspect-ratio-locked image container with 10 predefined ratios. Maintains proportions when parent is resized.

**Rule:** Choose a ratio; set parent width; height auto-adjusts.

---

## Properties

| Property | Type | Allowed Values                                                            | Default |
| -------- | ---- | ------------------------------------------------------------------------- | ------- |
| `ratio`  | enum | `3:4`, `4:5`, `5:4`, `4:3`, `3:2`, `2:3`, `1:1`, `9:16`, `16:9`, `custom` | `3:4`   |

---

## Accessibility

| Concern      | Notes                                           |
| ------------ | ----------------------------------------------- |
| Alt text     | Parent component provides `alt` on img element. |
| Lazy loading | Apply `loading="lazy"` to img element inside.   |
