---
status: DRAFT
component_id: tooltip
component_version: 1.0.0
owners:
  design: Design System
  engineering: Design System
last_reviewed: 2026-04-17
storybook_refs: []
figma_refs:
  - file_key: hcCXq9ObSEBdXtwROtBSNc
    node_id: '936:6380'
parity_state: docs-only
canonical_ids:
  properties:
    - property_id: tooltip.direction
      figma_property: direction
      code_property: not exposed
      support: not-exposed
    - property_id: tooltip.icon
      figma_property: icon
      code_property: not exposed
      support: not-exposed
    - property_id: tooltip.label
      figma_property: label
      code_property: not exposed
      support: content
  variants:
    - variant_id: tooltip.direction.up
      property_id: tooltip.direction
      value: up
      figma_value: 'up (arrow char replaced from: up-arrow)'
    - variant_id: tooltip.direction.down
      property_id: tooltip.direction
      value: down
      figma_value: 'down (arrow char replaced from: down-arrow)'
    - variant_id: tooltip.direction.up-left
      property_id: tooltip.direction
      value: up-left
      figma_value: 'up-left (arrow char replaced from: up-left-arrow)'
    - variant_id: tooltip.direction.up-right
      property_id: tooltip.direction
      value: up-right
      figma_value: 'up-right (arrow char replaced from: up-right-arrow)'
    - variant_id: tooltip.direction.down-left
      property_id: tooltip.direction
      value: down-left
      figma_value: 'down-left (arrow char replaced from: down-left-arrow)'
    - variant_id: tooltip.direction.down-right
      property_id: tooltip.direction
      value: down-right
      figma_value: 'down-right (arrow char replaced from: down-right-arrow)'
    - variant_id: tooltip.icon.false
      property_id: tooltip.icon
      value: 'false'
    - variant_id: tooltip.icon.true
      property_id: tooltip.icon
      value: 'true'
  behaviors:
    - behavior_id: tooltip.a11y.accessibleName
      concern: Accessible name for trigger
    - behavior_id: tooltip.a11y.keyboardDiscoverability
      concern: Keyboard discoverability
    - behavior_id: tooltip.a11y.focusPreservation
      concern: Focus preservation on dismiss
    - behavior_id: tooltip.a11y.noInteractiveContent
      concern: No interactive content inside tooltip
    - behavior_id: tooltip.layout.pointerDirection
      concern: Pointer direction and trigger alignment
    - behavior_id: tooltip.content.brevity
      concern: Label brevity
    - behavior_id: tooltip.content.noEssentialInfo
      concern: Non-essential supplementary use
    - behavior_id: tooltip.framework.criticalityTier
      concern: Criticality tier
    - behavior_id: tooltip.framework.scopeBoundary
      concern: Scope boundary
---

# Tooltip 1.0.0

## Summary

Tooltip is the messaging framework's control-labelling component: a small floating label that clarifies the purpose of an interactive control on hover or keyboard focus. **Use Tooltip only for supplementary identification — never for content that is essential to complete a task or understand a status.**

Within the messaging framework, Tooltip sits at the lowest criticality tier. Unlike Banner, Inline Message, and Toast, it does not carry a status intent (`info`, `success`, `warning`, `error`). It is scoped entirely to a single UI control and is non-persistent — it appears and disappears with the pointer or focus state.

## Framework Positioning

| Dimension             | Tooltip contract                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Criticality           | Low. Supplementary control labelling only. No system-status or validation role.                                                 |
| Placement             | Floating, anchored to a specific trigger control. Appears on hover or focus; dismissed on pointer leave, focus loss, or Escape. |
| Semantic scope        | No intent system. Label and optional icon only. Used for naming and shortcut hints, not status communication.                   |
| Action model          | No actions inside the tooltip. Label text only. The trigger control handles any activation.                                     |
| Out-of-scope patterns | Not for validation errors or persistent guidance (Inline Message), page alerts (Banner), or post-action confirmations (Toast).  |

## Properties

| Figma Property | Code Property | Type    | Allowed Values                                                 | Default             | Description                                                                                                   |
| -------------- | ------------- | ------- | -------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `direction`    | `not exposed` | enum    | `up`, `down`, `up-left`, `up-right`, `down-left`, `down-right` | `up`                | Sets which way the tooltip pointer faces, determining where the tooltip body appears relative to the trigger. |
| `icon`         | `not exposed` | boolean | `true`, `false`                                                | `true`              | Shows or hides an optional leading icon inside the tooltip label.                                             |
| `label`        | `not exposed` | string  | any short text                                                 | `Save to your list` | Sets the tooltip text content. Keep to a few words; longer text should go in a different component.           |

**Note on `direction` values:** The Figma component uses arrow unicode characters as variant names. The text equivalents used throughout this doc are:

| Figma variant    | Text equivalent | Tooltip body position relative to trigger      |
| ---------------- | --------------- | ---------------------------------------------- |
| up-arrow         | `up`            | Below the trigger; pointer faces up            |
| down-arrow       | `down`          | Above the trigger; pointer faces down          |
| up-left-arrow    | `up-left`       | Below-right of trigger; pointer at top-left    |
| up-right-arrow   | `up-right`      | Below-left of trigger; pointer at top-right    |
| down-left-arrow  | `down-left`     | Above-right of trigger; pointer at bottom-left |
| down-right-arrow | `down-right`    | Above-left of trigger; pointer at bottom-right |

## When to Use / When Not to Use

### Do

- Use Tooltip to provide a name for icon-only controls where the action is not obvious from the icon alone.
- Use Tooltip to surface keyboard shortcut information that supports but does not replace other navigation.
- Match `direction` to the position of the tooltip relative to the trigger so the pointer aligns naturally.
- Keep `label` to three to five words; anything longer should use a different pattern.

### Don't

- Do not use Tooltip for required instructions, validation errors, or status messages; use Inline Message or Banner instead.
- Do not put interactive elements (links, buttons) inside a tooltip.
- Do not rely on Tooltip as the sole accessible name for a control; the control itself must have an accessible name independent of the tooltip.
- Do not use Tooltip for content that must always be visible; persistent guidance belongs in Inline Message.
- Do not trigger Tooltip on click; it should respond to hover and keyboard focus only.

## States and Interactions

### Icon Button with Tooltip

```js
// Storybook Args
{ direction: 'up', icon: true, label: 'Save to your list' }
```

**Purpose**: Names the action of an icon-only control so users can identify it before activating.

**Implementation notes**: Trigger on pointer hover and keyboard focus. Dismiss on pointer leave, focus loss, or Escape. Do not steal focus from the trigger when the tooltip appears.

### No Icon Variant

```js
// Storybook Args
{ direction: 'up', icon: false, label: 'Save to your list' }
```

**Purpose**: Text-only label when an icon would add noise rather than clarity.

**Implementation notes**: Same trigger and dismiss behaviour as the icon variant. Keep label text short enough that the bubble width stays proportional to the trigger.

## Accessibility

| Concern                     | Requirement                                                                                                             | Example + Notes                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Accessible name for trigger | The trigger control must have its own accessible name independent of the tooltip.                                       | Use `aria-label` on the icon button. Tooltip text supplements but does not replace it.                                    |
| Keyboard discoverability    | Tooltip must appear on keyboard focus, not only on hover.                                                               | Bind tooltip display to `:focus-visible` as well as `:hover` on the trigger element.                                      |
| Focus preservation          | Dismiss events (Escape, pointer leave) must not move focus to the tooltip or disrupt the trigger's focus state.         | Tooltip is `role="tooltip"` with `aria-describedby` from the trigger; it is not a focus target.                           |
| No interactive content      | Tooltips must not contain links, buttons, or other interactive elements.                                                | If an action is needed inside the floating surface, use a Popover or Modal instead.                                       |
| Touch accessibility         | Touch devices do not have hover; icon-only controls on touch must have an alternative visible label or accessible name. | Ensure the trigger's `aria-label` fully describes the action on touch-first surfaces.                                     |
| Pointer direction           | The `direction` value must match the visual position so sighted and AT users share the same spatial model.              | Validate pointer alignment at each breakpoint; ensure the tooltip does not overlap the trigger or clip at viewport edges. |

## Related Components

| Component      | Relationship                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Icon Button    | Primary trigger for Tooltip; use Tooltip to name icon-only controls that lack a visible label.                                  |
| Inline Message | Higher criticality than Tooltip; use for persistent, in-flow contextual guidance or validation tied to a local content area.    |
| Toast          | Higher criticality than Tooltip; use for transient post-action confirmations that require brief system feedback.                |
| Banner         | Highest criticality in the framework; use for page-level or session-affecting status. Tooltip carries no system-status meaning. |

## Checklist

### Designer

- [ ] `direction` is chosen so the tooltip body clears the trigger and avoids viewport edge clipping.
- [ ] `label` is three to five words and names the control action or shortcut precisely.
- [ ] Tooltip is used only for supplementary labelling, not for essential task instructions.
- [ ] No interactive elements appear inside the tooltip bubble.

### Developer

- [ ] Trigger exposes its own accessible name via `aria-label` or visible text, independent of the tooltip.
- [ ] Tooltip uses `role="tooltip"` and is linked to the trigger via `aria-describedby`.
- [ ] Tooltip appears on both hover and `:focus-visible`; it does not steal focus.
- [ ] Escape key dismisses the tooltip without moving focus.
- [ ] Touch-first surfaces provide an accessible label alternative since hover is unavailable.
