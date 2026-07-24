---
status: ACTIVE
component_id: button
component_version: 1.1.0
owners:
  design: TBD
  engineering: TBD
last_reviewed: 2026-04-02
storybook_refs:
  - stories/components/Button.stories.tsx
figma_refs:
  - file_key: YOUR-FIGMA-FILE-KEY
    node_id: '7164:227'
parity_state: aligned
canonical_ids:
  properties:
    - property_id: button.size
      figma_property: size
      code_property: size
      support: runtime
    - property_id: button.intent
      figma_property: intent
      code_property: intent
      support: runtime
    - property_id: button.state
      figma_property: state
      code_property: state
      support: runtime
    - property_id: button.behaviour
      figma_property: behaviour
      code_property: behaviour
      support: runtime
    - property_id: button.round
      figma_property: round
      support: not-exposed
    - property_id: button.label
      figma_property: label
      code_property: label
      support: content
    - property_id: button.iconLeft
      figma_property: iconLeft
      code_property: iconLeft + iconLeftName
      support: runtime
    - property_id: button.iconRight
      figma_property: iconRight
      code_property: iconRight + iconRightName
      support: runtime
  variants:
    - variant_id: button.state.base
      property_id: button.state
      value: base
    - variant_id: button.state.hover
      property_id: button.state
      value: hover
    - variant_id: button.state.pressed
      property_id: button.state
      value: pressed
    - variant_id: button.state.loading
      property_id: button.state
      value: loading
    - variant_id: button.state.disabled
      property_id: button.state
      value: disabled
    - variant_id: button.state.focus
      property_id: button.state
      value: focus
  behaviors:
    - behavior_id: button.a11y.accessibleName
      concern: Accessible name
    - behavior_id: button.a11y.keyboardActivation
      concern: Keyboard activation
    - behavior_id: button.state.disabledBehavior
      concern: Disabled behavior
    - behavior_id: button.state.loadingBehavior
      concern: Loading behavior
    - behavior_id: button.semantic.toggleBehavior
      concern: Toggle behavior
    - behavior_id: button.semantic.menuTrigger
      concern: Menu trigger semantics
    - behavior_id: button.a11y.focusHandling
      concern: Focus handling
---

# Button 1.1.0

Last updated: 2026-04-02

## Summary

Buttons trigger an on-page action. They are the primary mechanism for users to do things: submit forms, save changes, open modals, and progress through flows.

## Size Scale (Display Labels)

| Display label | Height | Intended use                                            |
| ------------- | -----: | ------------------------------------------------------- |
| Small         |     40 | Compact layouts and dense control groups.               |
| Medium        |     48 | Default button size for most product UI.                |
| Large         |     56 | Higher-emphasis actions requiring stronger presence.    |
| XLarge        |     64 | Extra-emphasis actions requiring maximum visual weight. |

### Size Property Values (Figma/Code 1:1)

| Property value | Label  | Height |
| -------------- | ------ | -----: |
| `small`        | Small  |     40 |
| `medium`       | Medium |     48 |
| `large`        | Large  |     56 |
| `xlarge`       | XLarge |     64 |

---

## When to Use / When Not to Use

### Do

- Use to trigger an action on the current page: submit a form, save changes, open a dialog, or progress through a flow.
- Use `primary` intent for the single most important action in a view.
- Use `secondary` intent for supporting actions alongside a primary button.
- Use `negative` intent for irreversible actions (delete, remove, cancel a commitment) and pair with a confirmation step.

### Don't

- Use for navigation to another page or URL; use Link instead.
- Use more than one `primary` button in the same view — it dilutes the hierarchy.
- Use vague labels like "Submit", "OK", or "Click here" without surrounding context.
- Use a button with an icon only and no label; use Icon Button instead.

---

## States and Interactions

| Intent                                                                                                                                                                                                                                            | State                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Behaviour                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary**: Use for the single most important action in a view.<br><br>**Secondary**: Use for supporting actions alongside a primary action.<br><br>**Negative**: Use for destructive or irreversible actions and pair with a confirmation step. | **Base**: Default resting state. The button is visible and interactive.<br><br>**Hover**: Signals interactivity for pointer users. Use `:hover` only; the base state must already look interactive.<br><br>**Pressed**: Active click/tap feedback. Use `:active`; this state must not persist after release.<br><br>**Loading**: Communicates in-progress work after activation. Block repeat activation and keep an accessible name while loading.<br><br>**Focus**: Shows keyboard focus target using the bespoke focus border. Do not suppress or override focus visibility.<br><br>**Disabled**: Represents an unavailable action. Prefer explaining why the action is unavailable; use `aria-disabled="true"` when the control must stay discoverable. | **Hug**: Width fits the button content.<br><br>**100%**: Width fills the available container.<br><br>**Implementation notes**: Render as `<button>` and set `type` explicitly (for example `type="button"` or `type="submit"`) to avoid accidental form submission. |

---

## Related Components

| Component   | Relationship                                                                              |
| ----------- | ----------------------------------------------------------------------------------------- |
| Icon Button | Use when the action requires no label and the icon alone communicates the intent clearly. |
| Link        | Use when the user is navigating to another page rather than triggering an on-page action. |
| Chip        | Use for toggle interactions; Button does not support `aria-pressed` in version 1.1.0.     |

---

## Accessibility

| Concern                | Requirement                                                                               | Example + Notes                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Accessible name        | Button must have an accessible name via visible text, `aria-label`, or `aria-labelledby`. | Text: `Save changes`. Icon-only: use Icon Button with `aria-label` instead.                                        |
| Keyboard activation    | `Enter` and `Space` both activate the button.                                             | Native `<button>` handles this automatically. Do not use `<div>` or `<span>` as a button.                          |
| Disabled behavior      | Unavailable actions are non-interactive and communicated as unavailable.                  | Use native `disabled` when possible. Use `aria-disabled="true"` when the button must stay in focus order.          |
| Loading behavior       | Loading blocks repeat activation and preserves the accessible name.                       | After activation, show loading feedback and prevent further clicks until the operation completes.                  |
| Toggle behavior        | Not supported in Button 1.1.0.                                                            | Use Chip for toggle interactions; do not apply `aria-pressed` to Button.                                           |
| Menu trigger semantics | Buttons that open menus require additional ARIA attributes.                               | Use `aria-haspopup="menu"` and toggle `aria-expanded` on open/close.                                               |
| Focus handling         | Focus moves based on the result of the action.                                            | On dialog open, move focus into the dialog. On close, return focus to the trigger unless the flow moves elsewhere. |

---

## Native Notes (iOS and Android)

- Prefer `medium`, `large`, and `xlarge` sizes for touch-first contexts to keep actions comfortably tappable.
- Keep loading behavior consistent: block repeat taps while progress is visible.
- Ensure accessible naming parity (`accessibilityLabel` on iOS and `contentDescription` on Android) when the visible label is not sufficient.
- Optional product enhancement: haptic feedback can be used for important actions (for example primary or destructive confirms).

---

## Checklist

### Designer

- [ ] `intent` reflects action priority in the view (maximum one `primary` per view).
- [ ] `negative` intent paired with a confirmation step for irreversible actions.
- [ ] Label is short, verb-led, and specific (e.g. "Save article", not "Submit").
- [ ] Icon, if present, supports the label and is not decorative.
- [ ] `behaviour` (`hug` vs `100%`) aligned with the layout context.

### Developer

- [ ] Rendered as `<button>` with `type` attribute explicitly set.
- [ ] Accessible name present as visible text, `aria-label`, or `aria-labelledby`.
- [ ] Loading state disables activation and preserves the accessible name.
- [ ] `aria-disabled="true"` used when the button must remain discoverable by screen readers.
- [ ] `aria-haspopup` and `aria-expanded` set correctly when the button triggers a menu.
- [ ] Focus styles not suppressed; visible in keyboard navigation.
- [ ] Destructive actions (`negative` intent) protected by a confirmation step.
