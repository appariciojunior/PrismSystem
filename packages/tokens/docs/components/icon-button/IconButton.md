---
status: DRAFT
component_id: icon-button
component_version: 1.1.0
owners:
  design: TBD
  engineering: TBD
last_reviewed: 2026-04-02
storybook_refs:
  - stories/components/IconButton.stories.tsx
figma_refs:
  - file_key: hcCXq9ObSEBdXtwROtBSNc
    node_id: '147:1681'
  - file_key: hcCXq9ObSEBdXtwROtBSNc
    node_id: '595:34907'
parity_state: aligned
canonical_ids:
  properties:
    - property_id: icon-button.size
      figma_property: size
      code_property: size
      support: runtime
    - property_id: icon-button.intent
      figma_property: intent
      code_property: intent
      support: runtime
    - property_id: icon-button.state
      figma_property: state
      code_property: state
      support: runtime
    - property_id: icon-button.round
      figma_property: round
      code_property: round
      support: runtime
  variants:
    - variant_id: icon-button.state.base
      property_id: icon-button.state
      value: base
    - variant_id: icon-button.state.hover
      property_id: icon-button.state
      value: hover
    - variant_id: icon-button.state.pressed
      property_id: icon-button.state
      value: pressed
    - variant_id: icon-button.state.loading
      property_id: icon-button.state
      value: loading
    - variant_id: icon-button.state.disabled
      property_id: icon-button.state
      value: disabled
    - variant_id: icon-button.state.focus
      property_id: icon-button.state
      value: focus
  behaviors:
    - behavior_id: icon-button.a11y.accessibleName
      concern: Accessible name
    - behavior_id: icon-button.a11y.keyboardActivation
      concern: Keyboard activation
    - behavior_id: icon-button.a11y.focusVisibility
      concern: Focus visibility
    - behavior_id: icon-button.state.disabledBehavior
      concern: Disabled behavior
    - behavior_id: icon-button.state.loadingBehavior
      concern: Loading behavior
    - behavior_id: icon-button.layout.targetSize
      concern: Target size
    - behavior_id: icon-button.content.iconClarity
      concern: Icon clarity
---

# Icon Button 1.1.0

## Summary

Icon Buttons trigger a single on-page action using only an icon, for contexts where space is constrained and the action is recognisable without a text label. **Use Icon Button only when the icon alone is unambiguous in context; otherwise use Button.**

---

## Properties

| Figma Property | Code Property | Type | Allowed Values                                             | Default   | Description                                        |
| -------------- | ------------- | ---- | ---------------------------------------------------------- | --------- | -------------------------------------------------- |
| `size`         | `size`        | enum | `small`, `medium`, `large`, `xlarge`                       | `large`   | Sets the fixed square size of the control.         |
| `intent`       | `intent`      | enum | `primary`, `secondary`, `negative`                         | `primary` | Sets the action priority and visual treatment.     |
| `state`        | `state`       | enum | `base`, `hover`, `pressed`, `loading`, `disabled`, `focus` | `base`    | Shows the interaction or availability state.       |
| `round`        | `round`       | enum | `off`, `on`                                                | `off`     | Switches between square and fully rounded corners. |

---

## Size Scale

| Property value | Label  | Height | Width |
| -------------- | ------ | -----: | ----: |
| `small`        | Small  |     40 |    40 |
| `medium`       | Medium |     48 |    48 |
| `large`        | Large  |     56 |    56 |
| `xlarge`       | XLarge |     64 |    64 |

---

## When to Use / When Not to Use

### Do

- Use in toolbars, navigation headers, or lists where space is limited and a text label would be too wide.
- Use when the icon is widely understood in context (close, search, share, play, delete).
- Pair with a tooltip to expose the accessible name to sighted users.
- Use `medium` (48px), `large` (56px), or `xlarge` (64px) on touch-first surfaces to meet minimum target size requirements.

### Don't

- Use when the icon alone may be ambiguous — add a visible label and use Button instead.
- Use `small` (40px) as a touch target in dense contexts only; prefer larger sizes when space allows.
- Use for navigation to another page or URL; use Link instead.
- Use for irreversible destructive actions without a confirmation step.

---

## States and Interactions

- **Intent**
  - **Primary**: High-emphasis icon-only actions.
  - **Secondary**: Supporting actions with lower emphasis.
  - **Negative**: Destructive icon actions paired with confirmation.
- **State**
  - **Base**: Default resting state.
  - **Hover**: Pointer hover feedback.
  - **Pressed**: Active click/tap feedback that does not persist.
  - **Loading**: In-progress state that blocks repeat activation.
  - **Focus**: Visible keyboard focus ring.
  - **Disabled**: Unavailable action state.
- **Behaviour**
  - **Size scale**: `small` (40px), `medium` (48px), `large` (56px), `xlarge` (64px).
  - **Semantics**: Render as `<button type="button">` and keep one hit target.
  - **Accessibility**: `aria-label` is required in every state, including loading.

---

## Accessibility

- **Accessible name**: Icon-only buttons must always have an accessible name.
  - Example: `aria-label="Close"` or `aria-label="Search"`.
- **Keyboard activation**: `Enter` and `Space` both activate the button.
  - Use native `<button>`; do not use `<div>` or `<span>` as a button.
- **Focus visibility**: Focus state must be clearly visible and persist until blur.
  - Keep the focus ring visible; do not remove it without an equivalent replacement.
- **Disabled behavior**: Disabled controls are non-interactive and communicated as unavailable.
  - Use native `disabled` where possible; use `aria-disabled="true"` when it must stay in focus order.
- **Loading behavior**: Loading blocks repeat activation and preserves the accessible name.
  - Keep the `aria-label` during loading feedback.
- **Target size**: Touch targets must meet minimum tappable area expectations.
  - Use `medium`, `large`, or `xlarge` on touch-first surfaces; use `small` only in dense layouts.
- **Icon clarity**: Icon meaning must be unambiguous in context.
  - Use familiar icons and pair with an explicit `aria-label`.

---

## Native Notes (iOS and Android)

- Always provide a clear accessible name (`accessibilityLabel` on iOS, `contentDescription` on Android).
- Prefer `medium`, `large`, or `xlarge` for touch devices; reserve `small` for dense contexts.
- Maintain icon clarity in context to reduce ambiguity for all users, especially in icon-only UI.
- If the action is destructive, keep the same confirmation safeguards used in web.

---

## Related Components

| Component | Relationship                                                                            |
| --------- | --------------------------------------------------------------------------------------- |
| Button    | Use when a visible text label is needed or when the icon alone may be ambiguous.        |
| Tooltip   | Should accompany Icon Button to expose the accessible name to sighted users.            |
| Link      | Use when the action navigates to another page rather than triggering an on-page action. |

---

## Checklist

### Designer

- [ ] Icon is universally recognisable in context without a text label.
- [ ] `size` matches the scale contract (`small` 40, `medium` 48, `large` 56, `xlarge` 64) and touch target requirements.
- [ ] `intent` reflects action priority (`negative` for destructive, `secondary` for supporting).
- [ ] Tooltip is specified in the design to expose the accessible name to sighted users.
- [ ] `round` style is consistent with surrounding button components.

### Developer

- [ ] `aria-label` present with a clear, specific accessible name.
- [ ] Rendered as `<button>` with `type` attribute explicitly set.
- [ ] Loading state disables activation and preserves the `aria-label`.
- [ ] `aria-disabled="true"` used when the button must remain discoverable by screen readers.
- [ ] Tooltip wired to the button so the label is visible on hover/focus for sighted users.
- [ ] Focus styles not suppressed; visible in keyboard navigation.
- [ ] Destructive intent actions protected by a confirmation step.
