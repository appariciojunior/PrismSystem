---
status: PROPOSAL
component_id: label
component_version: 1.1.0
owners:
  design: TBD
  engineering: TBD
last_reviewed: 2026-05-18
storybook_refs:
  - stories/components/Label.stories.tsx
  - stories/components/Label.docs.mdx
figma_refs:
  - file_key: YOUR-FIGMA-FILE-KEY
    template_node_id: '8432:289294'
    doc_page_id: '8432:289521'
parity_state: pending-validation
canonical_ids:
  properties:
    - property_id: label.intent
      figma_property: intent
      code_property: intent
      support: runtime
    - property_id: label.size
      figma_property: size
      code_property: size
      support: runtime
  variants:
    - variant_id: label.intent.primary
      property_id: label.intent
      value: primary
    - variant_id: label.intent.secondary
      property_id: label.intent
      value: secondary
    - variant_id: label.intent.callout
      property_id: label.intent
      value: callout
    - variant_id: label.size.large
      property_id: label.size
      value: large
    - variant_id: label.size.medium
      property_id: label.size
      value: medium
    - variant_id: label.size.small
      property_id: label.size
      value: small
  behaviors:
    - behavior_id: label.a11y.text-only
      concern: Non-interactive text badge
    - behavior_id: label.a11y.semantic-html
      concern: Semantic HTML structure
---

# Label 1.1.0

## Summary

Label is a non-interactive text badge used to categorize or tag content, such as article categories ("SPORT", "POLITICS"), content types, or status indicators. Labels sit above headlines and serve a read-only, informational purpose with no hover or focus interactions.

---

## When to Use / When Not to Use

### Do

- Use to denote a content category
- Use to classify content type or topic (e.g., "Guest Column", "Breaking News")
- Use above headlines to contextualize content
- Use when you need color-coded intent (primary, secondary, callout)

### Don't

- Do not make labels interactive or clickable
- Do not use as a toggle or filter control (use Button instead)
- Do not mix Label with navigational components
- Do not use for form field labels (use native label elements)

---

## States and Interactions

### Base

**Purpose**: Default state for displaying categorised content badges.

**Implementation notes**: Label is a static text component. No hover, focus, or pressed states. Content is always visible and never disabled.

---

## Properties

| Property   | Type    | Default  | Options                                      | Notes                                                 |
| ---------- | ------- | -------- | -------------------------------------------- | ----------------------------------------------------- |
| `intent`   | VARIANT | primary  | `primary`, `secondary`, `callout` | Determines color/styling. Maps to label token groups. |
| `size`     | VARIANT | medium   | `large`, `medium`, `small`                   | Text and padding scaling.                             |
| `children` | string  | REQUIRED | Any text                                     | Visible label text (e.g., "SPORT", "BREAKING").       |

---

## Typography

| Size     | Text Style             | Font Family  | Weight | Size | Line-height | Dimensions |
| -------- | ---------------------- | ------------ | ------ | ---- | ----------- | ---------- |
| `large`  | `utility/label/large`  | Inter | Medium | 18px | 112.5%      | 59 × 20px  |
| `medium` | `utility/label/medium` | Inter | Medium | 16px | 112.5%      | 55 × 18px  |
| `small`  | `utility/label/small`  | Inter | Medium | 14px | 112.5%      | 50 × 16px  |

---

## Token Mapping

| Intent        | Light Token       | Dark Token        | Usage                                                        |
| ------------- | ----------------- | ----------------- | ------------------------------------------------------------ |
| **primary**   | `label.primary`   | `label.primary`   | Default, neutral labels                                      |
| **secondary** | `label.secondary` | `label.secondary` | Muted/secondary context                                      |
| **callout**   | `label.callout`   | `label.callout`   | Highlighted state, alerts, status (e.g., BREAKING, FEATURED) |

---

## Accessibility

| Concern             | Requirement                                                                                                            | Example + Notes                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Semantic HTML**   | Render as `<span>` or `<div>` with semantic role if needed. No interactive elements.                                   | Avoid `<button>` or `<a>` elements unless label is clickable (then use Button component).        |
| **Text Content**    | Text must be readable and self-contained. No abbreviations without explanation.                                        | Good: "BREAKING NEWS". Avoid: "BRK" without context.                                             |
| **Color Contrast**  | Text contrast ratio must meet WCAG AA (4.5:1 minimum for small text).                                                  | Verify against label token text/background pairs in light and dark modes.                        |
| **Aria Attributes** | Not required for static labels. If used as a badge context or status, label with `aria-label` if value is non-obvious. | Example: `<span aria-label="Breaking news">BREAKING</span>` only if "BREAKING" alone is unclear. |

---

## Light / Dark Mode

### Light Mode (label.X)

- `primary`: Neutral primary text on light background
- `secondary`: Muted secondary text
- `callout`: High-contrast callout (red/error brand)

### Dark Mode (label.X)

- Tokens reference same semantic names but resolve to dark-appropriate values
- Text maintained for readability against dark surfaces
- No ramp reversal needed (labels use distinct semantic colors, not neutral ramps)

---

## Native Notes (iOS and Android)

- iOS/Android theme outputs include label token color sets (LabelPrimary, LabelSecondary, LabelCallout)
- Native implementations should use platform-appropriate text sizing for `large` (~15pt), `medium` (~13pt), and `small` (~11pt)
- No interactive states needed—render as static text views

---

## Related Components

| Component                     | Relationship                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------------- |
| [Flag](../flag/Flag.md)       | Grouped badge system with primary/secondary/callout variants; similar structure and token alignment |
| [Chip](../chip/Chip.md)       | Interactive dismissible badge; Label is a static alternative                                        |
| [Button](../button/Button.md) | Use if label must be clickable or interactive                                                       |

---

## Design System Integration

### Figma Component Set

- **Location**: Token Library—Design System → Label (node-id: 8432:289294)
- **Variants**: 12 (intent: 4 × size: 3)
- **Variables**: Figma color bindings per intent; synced via Token Studio

### React Component

- **Package**: `@ds/components-react`
- **Export**: `Label`
- **Props**: `intent`, `size`, `children`
- **CSS Modules**: Token-driven, no hardcoded values

### Build Output

- Storybook stories: 12 canonical variant combinations
- CSS: Generated via `npm run build:output`
- Themes: All 28 themes (14 light + 14 dark) included

---

## Checklist

### Designer

- [x] Figma component set created with 12 variants (intent × size)
- [ ] Figma color variable bindings verified
- [ ] Design doc page updated with component spec
- [ ] Token mapping table reviewed and approved

### Developer

- [ ] React component created (`Label.tsx` + `styles.css`)
- [ ] Storybook stories added (8 variants)
- [ ] Storybook docs page created (MDX)
- [ ] Visual regression baseline captured
- [ ] A11y checks passed (contrast, semantic HTML)
- [ ] All theme outputs validated
