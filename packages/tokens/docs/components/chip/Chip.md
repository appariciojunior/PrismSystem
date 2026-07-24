---
status: DRAFT
component_id: chip
component_version: 1.0.0
owners:
  design: TBD
  engineering: TBD
last_reviewed: 2026-03-19
figma_refs:
  - role: source_component
    file_key: YOUR-FIGMA-FILE-KEY
    node_id: '7224:8224'
  - role: documentation_sync_target
    file_key: YOUR-FIGMA-FILE-KEY
    node_id: '8415:153415'
parity_state: implemented
canonical_ids:
  properties:
    - property_id: chip.intent
      figma_property: intent
      code_property: intent
      support: runtime
    - property_id: chip.size
      figma_property: size
      code_property: size
      support: runtime
    - property_id: chip.state
      figma_property: state
      code_property: state
      support: runtime
    - property_id: chip.toggle
      figma_property: toggle
      code_property: toggle
      support: runtime
    - property_id: chip.iconLeft
      figma_property: iconLeft
      code_property: iconLeft
      support: runtime
    - property_id: chip.iconRight
      figma_property: iconRight
      code_property: iconRight
      support: runtime
    - property_id: chip.label
      figma_property: label
      code_property: children
      support: content
  variants:
    - variant_id: chip.intent.primary
      property_id: chip.intent
      value: primary
    - variant_id: chip.intent.secondary
      property_id: chip.intent
      value: secondary
    - variant_id: chip.size.small
      property_id: chip.size
      value: small
    - variant_id: chip.size.large
      property_id: chip.size
      value: large
    - variant_id: chip.state.base
      property_id: chip.state
      value: base
    - variant_id: chip.state.hover
      property_id: chip.state
      value: hover
    - variant_id: chip.state.pressed
      property_id: chip.state
      value: pressed
    - variant_id: chip.state.disabled
      property_id: chip.state
      value: disabled
    - variant_id: chip.state.focus
      property_id: chip.state
      value: focus
    - variant_id: chip.toggle.false
      property_id: chip.toggle
      value: 'false'
    - variant_id: chip.toggle.true
      property_id: chip.toggle
      value: 'true'
  behaviors:
    - behavior_id: chip.a11y.accessibleName
      concern: Accessible name
    - behavior_id: chip.a11y.keyboardActivation
      concern: Keyboard activation
    - behavior_id: chip.a11y.focusVisible
      concern: Focus visibility
    - behavior_id: chip.semantic.buttonUse
      concern: Semantic button use
    - behavior_id: chip.state.ariaPressed
      concern: Toggle state
    - behavior_id: chip.a11y.clickableArea
      concern: Clickable area
---

# Chip 1.0.0

## Summary

Chips present compact choices that filter, refine, or toggle a lightweight state without taking over page hierarchy. Use Chip when the control represents a selectable option or persistent toggle, not the primary action of a view.

## Properties

| Figma Property | Code Property | Type    | Allowed Values                                  | Default      | Description                                           |
| -------------- | ------------- | ------- | ----------------------------------------------- | ------------ | ----------------------------------------------------- |
| `intent`       | `intent`      | enum    | `primary`, `secondary`                          | `primary`    | Sets the chip emphasis and token family.              |
| `size`         | `size`        | enum    | `small`, `large`                                | `small`      | Sets the chip height and horizontal padding.          |
| `state`        | `state`       | enum    | `base`, `hover`, `pressed`, `disabled`, `focus` | `base`       | Previews the visual interaction state.                |
| `toggle`       | `toggle`      | boolean | `true`, `false`                                 | `false`      | Enables the toggle-style on/off visual contract.      |
| `iconLeft`     | `iconLeft`    | boolean | `true`, `false`                                 | `false`      | Shows a leading icon inside the chip.                 |
| `iconRight`    | `iconRight`   | boolean | `true`, `false`                                 | `false`      | Shows a trailing icon inside the chip.                |
| `label`        | `children`    | string  | any short text                                  | `Chip Label` | Provides the visible chip label content.              |

## When to Use / When Not to Use

### Do

- Use for compact filters, topic selectors, and mode switches.
- Use `toggle=true` when the chip represents a persistent on/off choice.
- Use short, scannable labels that fit on one line.

### Don't

- Use for page navigation; use Link instead.
- Use for the main call to action in a view; use Button instead.
- Use for destructive actions or confirmation steps.
- Use long labels that wrap or force the pill to become hard to scan.

## States and Interactions

| Intent                                                                                                                                                                                                                   | State                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Behaviour                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Primary**: Default chip emphasis. Uses the `interactive.chip.primary.*` token family for fill, border, and text.<br><br>**Secondary**: Reduced emphasis variant. Uses the `interactive.chip.secondary.*` token family. | **Base**: Default resting state. The chip is visible and interactive.<br><br>**Hover**: Signals interactivity for pointer users. Apply hover tokens for the active token family; keep the entire pill as one hover target.<br><br>**Pressed**: Momentary click or tap confirmation. Treat as transient feedback only; do not use to represent a persisted selection.<br><br>**Focus**: Shows the keyboard focus target. Uses hover-level chip colours plus the bespoke `focus.border` ring around the full pill. Do not suppress or replace this indicator.<br><br>**Disabled**: Communicates an unavailable action. Uses shared disabled semantic tokens: `interactive.disabled.b` for fill and `interactive.disabled.a` for text and icons. | **Toggle off** (`toggle=false`): Default unselected state. Uses the `on.*` token sub-family — the Figma "on" appearance. No `aria-pressed` is set.<br><br>**Toggle on** (`toggle=true`): Selected or pressed state. Uses the `off.*` token sub-family — the Figma "off" appearance. Sets `aria-pressed="true"`.<br><br>**Implementation notes**: The `on`/`off` labels in token names reflect Figma's naming convention, where "on" is the default unselected chip appearance and "off" is the selected appearance — the inverse of the `toggle` boolean. Render as `<button type="button">`. Keep `aria-pressed` synchronised with the on/off visual state. |

## Accessibility

| Concern             | Requirement                                                                                                | Example + Notes                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Accessible name     | The chip needs an accessible name from visible text or `aria-label`.                                       | Visible label text from `children` is usually sufficient. If the visible label is replaced or hidden, provide `aria-label`. |
| Keyboard activation | `Enter` and `Space` activate the chip when it is rendered as a native button.                              | Render as `<button type="button">` for in-page selection and filtering.                                                     |
| Focus visibility    | Focus remains visible at all times and uses the design-system focus treatment.                             | Use the full-pill `focus.border` ring shown in the Figma `focus` state. Do not rely on a browser-default ring.              |
| Semantic button use | Chips that change in-page state use button semantics, not link semantics.                                  | Use Link when the user navigates to another page or route.                                                                  |
| Toggle state        | Set `aria-pressed` only when `toggle=true` and the chip represents a persistent pressed or selected state. | Keep `aria-pressed` synchronized with the on/off visual family so assistive technology and visuals stay aligned.            |
| Clickable area      | The entire pill, including label and optional icons, is one interactive target.                            | Do not split the icon into a separate tap target. Maintain a single accessible control.                                     |

## Native Notes

- Keep the full touch target at or above the Figma component height; do not shrink below the published small and large sizes.
- Map the visible label to `accessibilityLabel` on iOS and `contentDescription` on Android when platform APIs need an explicit name.
- For toggle usage, reflect the persisted state through the platform-selected state as well as `aria-pressed` equivalents.
- Preserve one tappable surface for the whole chip rather than separate icon and label hit areas.

## Related Components

| Component   | Relationship                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------- |
| Button      | Use when the control triggers a primary page action instead of selecting or toggling an option. |
| Link        | Use when the interaction navigates to a destination rather than changing in-page state.         |
| Icon Button | Use when the action is icon-only and does not need persistent selection semantics.              |

## Checklist

### Designer

- [ ] `intent` reflects the right level of emphasis for the surrounding UI.
- [ ] Label stays short, clear, and single-line.
- [ ] `toggle=true` is used only for persistent selected or unselected choices.
- [ ] Optional icons support the label instead of replacing it.

### Developer

- [ ] Render the chip as a native button for in-page selection and toggling.
- [ ] Keep `iconLeft` and `iconRight` icons visually supported by the label; icons must not replace label text.
- [ ] Use `children` as the label content contract for Figma `label`.
- [ ] Keep hover, pressed, focus, and disabled visuals aligned to the published token families.
- [ ] Apply `aria-pressed` only for persistent toggle behavior.
- [ ] Keep the entire pill as one interactive hit target.
