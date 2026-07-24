---
status: DRAFT
component_id: link
component_version: 1.0.0
owners:
  design: TBD
  engineering: TBD
last_reviewed: 2026-03-13
storybook_refs:
  - stories/components/Link.stories.js
figma_refs:
  - file_key: YOUR-FIGMA-FILE-KEY
    template_node_id: '7481:1339'
parity_state: contract-alignment-in-progress
canonical_ids:
  properties:
    - property_id: link.sentiment
      figma_property: sentiment
      code_property: sentiment
      support: runtime
    - property_id: link.intent
      figma_property: intent
      code_property: intent
      code_aliases:
        - variant
      support: runtime
    - property_id: link.size
      figma_property: size
      code_property: size
      support: runtime
    - property_id: link.state
      figma_property: state
      code_property: state
      support: runtime
    - property_id: link.iconLeft
      figma_property: iconLeft
      code_property: iconLeft + leftIconName
      support: runtime
    - property_id: link.iconRight
      figma_property: iconRight
      code_property: iconRight + rightIconName
      support: runtime
    - property_id: link.label
      figma_property: label
      code_property: children
      support: content
    - property_id: link.inline
      figma_property: inline
      code_property: inline
      support: runtime
      description: Controls whether the underline is visible. True for body text links — required for WCAG 1.4.1. False for nav links and standalone CTAs.
    - property_id: link.emphasis
      figma_property: emphasis
      code_property: emphasis
      support: runtime
      description: Make links bold for prominence. Uses bold or regular weight tokens based on the link type.
  variants:
    - variant_id: link.state.base
      property_id: link.state
      value: base
    - variant_id: link.state.hover
      property_id: link.state
      value: hover
    - variant_id: link.state.pressed
      property_id: link.state
      value: pressed
    - variant_id: link.state.focus
      property_id: link.state
      value: focus
    - variant_id: link.state.visited
      property_id: link.state
      value: visited
    - variant_id: link.state.disabled
      property_id: link.state
      value: disabled
  behaviors:
    - behavior_id: link.a11y.accessibleName
      concern: Accessible name
    - behavior_id: link.a11y.keyboardActivation
      concern: Keyboard activation
    - behavior_id: link.a11y.focusVisible
      concern: Focus visibility
    - behavior_id: link.security.externalNoopener
      concern: External links
    - behavior_id: link.semantic.linkVsButton
      concern: Semantic use
    - behavior_id: link.security.hrefRequired
      concern: Href requirement
    - behavior_id: link.a11y.clickableArea
      concern: Clickable area
---

# Link 1.0.0

## Summary

Links are text-first navigational elements that take users to another destination — internal routes, external pages, or in-page anchors.

---

## When to Use / When Not to Use

### Do

- Use for navigation to another page or route, internal or external.
- Use for in-page jump links and anchor navigation.
- Use descriptive labels that clearly predict the destination.
- Use an external indicator when a link opens in a new tab or window.
- Use `inline=true` (underlined) for links embedded within body or prose text — the underline is required to distinguish them from surrounding non-link text.
- Use `inline=false` (standalone) when the link sits in isolation from prose, such as navigation menus, footers, or standalone CTAs where context makes the interactive nature clear.

### Don't

- Use for form submission, in-page state changes, or triggering overlays.
- Use for destructive or irreversible actions.
- Use vague labels like "click here" or "learn more" without surrounding context.
- Use icons in inline links without a specific semantic reason.
- Use `inline=false` for links inside paragraphs or article body text — removing the underline makes links indistinguishable from surrounding text by colour alone, failing WCAG 1.4.1.

---

## States and Interactions

| Intent                                                                                                                                                                                                                                                                                                                 | State                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Behaviour                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary**: Standard navigational emphasis for links in most UI contexts. **Secondary**: Reduced-emphasis navigational treatment where hierarchy is lower but link semantics remain unchanged. **Emphasis** (`emphasis=true`): Bold-weight text token. **No emphasis** (`emphasis=false`): Regular-weight text token. | **Base**: Default resting state. The link is visible and interactive. **Hover**: Signals interactivity for pointer users via colour and underline change; the base state must still look interactive without hover. **Pressed**: Momentary click or tap feedback; apply while active only and do not persist after release. **Focus**: Shows the current keyboard focus target using the bespoke focus border; do not suppress or replace this indicator. **Visited**: Communicates that the destination has been previously viewed; apply through `:visited` because browsers restrict visited styling for privacy. **Disabled**: Represents temporarily unavailable navigation; prefer plain text when there is no true destination and keep disabled links non-focusable with clear unavailability messaging. | **Inline** (`inline=true`): Underline remains visible by default and across interaction states for links inside prose; this is required to satisfy WCAG 1.4.1. **Standalone** (`inline=false`): Underline can be removed when surrounding context already makes the element clearly interactive, for example nav lists or isolated CTAs. **Emphasis** (`emphasis=true`) uses `linkInline.bold` or `linkStandalone.bold` tokens depending on inline state; `emphasis=false` uses regular-weight variants. **Implementation notes**: Render as semantic `<a>` with a valid `href`, retain link semantics instead of button semantics for navigation, use `rel="noopener noreferrer"` with `target="_blank"`, and keep focus visibility consistent with WCAG 2.4.7. |

---

## Accessibility

| Concern                | Requirement                                                                                                                                                                                                                                              | Example + Notes                                                                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Accessible name        | Links must have visible text or `aria-label`. Text must be meaningful and destination-indicative.                                                                                                                                                        | Use element text (preferred). Icon-only links require `aria-label`. Avoid generic phrases without context.                                                         |
| Underline (WCAG 1.4.1) | Links within body or prose text must use `inline=true`. Colour alone is not sufficient to identify a link from surrounding text. `inline=false` is only permitted when the link is isolated from prose and its interactive nature is clear from context. | A link inside a paragraph must be underlined. A standalone navigation link in a footer or menu may omit the underline. Failing this fails WCAG 1.4.1 Use of Color. |
| Keyboard activation    | `Enter` activates; `Space` does not (button behaviour only). Focus order must remain logical and uninterrupted.                                                                                                                                          | Test with keyboard only before shipping. Do not trap focus inside link containers.                                                                                 |
| Focus visibility       | Focus must remain visible and meet WCAG 2.4.7. Do not override or suppress the design-system focus border.                                                                                                                                               | Uses the bespoke focus border defined as a component property. Do not replace with the native browser ring.                                                        |
| External links         | Set `rel="noopener noreferrer"` when `target="_blank"`. Provide a visual indicator on the link.                                                                                                                                                          | Security mitigation; not visible to sighted users but required for safe behaviour.                                                                                 |
| Semantic use           | Links = navigation; buttons = in-page actions. `<a>` is required for routing and `href`-based navigation.                                                                                                                                                | Never use `<a>` without `href` for button-like behaviour.                                                                                                          |
| Href requirement       | `href` must be a valid, safe URL or anchor. Reject `javascript:` and other unsafe protocols.                                                                                                                                                             | Invalid or absent `href` prevents navigation. Treat as a required prop.                                                                                            |
| Clickable area         | Text and icon must both be part of the interactive hit area when an icon is present.                                                                                                                                                                     | Avoid gaps between label and icon. Multi-line links must have a clear, uninterrupted interactive region.                                                           |

---

## Native Notes (iOS and Android)

- Native apps may implement links through in-app navigation or deep links rather than browser `href` handling.
- Keep destination clarity and external-destination signaling consistent with web guidance.
- Treat visited-state support as product-defined on native; if omitted, document that choice as intentional.
- Preserve accessible naming parity for text and icon links (`accessibilityLabel` on iOS, `contentDescription` on Android when needed).

---

## Related Components

| Component       | Relationship                                                             |
| --------------- | ------------------------------------------------------------------------ |
| Button          | Preferred when the action affects the current page without navigating.   |
| Breadcrumb      | Uses Link tokens for each step in the navigational trail.                |
| Tabs            | Shares the current-page state concept; surfaces `aria-current` guidance. |
| Navigation link | Extended Link for persistent, application-level navigation contexts.     |

---

## Checklist

### Designer

- [ ] Correct `sentiment` (`brand` vs `utility`) chosen for the context.
- [ ] Correct `intent` (`primary` vs `secondary`) reflects navigational priority.
- [ ] `emphasis=true` applied only when visual weight is necessary (e.g., prominent CTAs, primary navigation, hero headlines).
- [ ] No icon used in inline links unless a specific semantic reason exists.
- [ ] External link indicator applied when a link opens a new tab or window.
- [ ] Visited state behaviour aligned with product policy.

### Developer

- [ ] Rendered as `<a>` with a valid `href`.
- [ ] `rel="noopener noreferrer"` present on all `target="_blank"` links.
- [ ] Accessible name present as visible text or `aria-label`.
- [ ] `javascript:` and other unsafe href protocols rejected.
- [ ] Active route mapped to `aria-current="page"` where applicable.
- [ ] Emphasis property correctly maps to bold-weight tokens (`linkInline.bold` or `linkStandalone.bold`) when `emphasis=true`.
- [ ] Focus styles not suppressed; visible in keyboard navigation.
- [ ] Disabled state, if used, is non-focusable and communicates unavailability to screen readers.
