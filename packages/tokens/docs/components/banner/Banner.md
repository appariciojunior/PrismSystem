---
status: DRAFT
component_id: banner
component_version: 1.0.0
owners:
  design: Design System
  engineering: Design System
last_reviewed: 2026-04-17
storybook_refs: []
figma_refs: []
parity_state: docs-only
canonical_ids:
  properties:
    - property_id: banner.intent
      figma_property: intent
      code_property: not exposed
      support: not-exposed
    - property_id: banner.dismiss
      figma_property: dismiss
      code_property: not exposed
      support: not-exposed
    - property_id: banner.optionalButtons
      figma_property: optional buttons
      code_property: not exposed
      support: not-exposed
    - property_id: banner.cta1
      figma_property: cta 1
      code_property: not exposed
      support: not-exposed
    - property_id: banner.cta2
      figma_property: cta 2
      code_property: not exposed
      support: not-exposed
  variants:
    - variant_id: banner.intent.info
      property_id: banner.intent
      value: info
    - variant_id: banner.intent.success
      property_id: banner.intent
      value: success
    - variant_id: banner.intent.warning
      property_id: banner.intent
      value: warning
    - variant_id: banner.intent.error
      property_id: banner.intent
      value: error
    - variant_id: banner.dismiss.false
      property_id: banner.dismiss
      value: 'false'
    - variant_id: banner.dismiss.true
      property_id: banner.dismiss
      value: 'true'
    - variant_id: banner.optionalButtons.false
      property_id: banner.optionalButtons
      value: 'false'
    - variant_id: banner.optionalButtons.true
      property_id: banner.optionalButtons
      value: 'true'
    - variant_id: banner.cta1.false
      property_id: banner.cta1
      value: 'false'
    - variant_id: banner.cta1.true
      property_id: banner.cta1
      value: 'true'
    - variant_id: banner.cta2.false
      property_id: banner.cta2
      value: 'false'
    - variant_id: banner.cta2.true
      property_id: banner.cta2
      value: 'true'
  behaviors:
    - behavior_id: banner.a11y.accessibleName
      concern: Accessible name
    - behavior_id: banner.a11y.announcementMode
      concern: Announcement behavior
    - behavior_id: banner.a11y.focusOrder
      concern: Focus order
    - behavior_id: banner.content.ctaLimit
      concern: CTA limit
    - behavior_id: banner.state.dismissBehavior
      concern: Dismiss behavior
    - behavior_id: banner.state.ctaVisibility
      concern: CTA visibility
    - behavior_id: banner.layout.pageAnchoring
      concern: Page anchoring
    - behavior_id: banner.framework.criticalityTier
      concern: Criticality tier
    - behavior_id: banner.framework.scopeBoundary
      concern: Scope boundary
---

# Banner 1.0.0

## Summary

Banner is the messaging framework's page-status component: a high-priority, full-width message for current-view or system-state information that affects the reader's session. **Use Banner when the message is global, urgent enough to deserve the highest messaging prominence, and must remain anchored under the main navigation rather than appearing as local guidance or transient feedback.**

Within the messaging framework, Banner sits at the top of the hierarchy of criticality: it supports the four core system intents (`info`, `success`, `warning`, `error`), stays sticky during deep editorial scroll, and should always offer a clear route to understanding or resolution when the status affects the reader's path.

## Framework Positioning

| Dimension             | Banner contract                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Criticality           | High. Use for page-level or session-affecting status that readers must notice quickly.                                |
| Placement             | Anchored directly under main navigation and sticky while the condition remains relevant.                              |
| Semantic scope        | System communication only. Use core intents (`info`, `success`, `warning`, `error`) for status semantics.             |
| Action model          | 0-2 CTAs maximum. Warning and error states should provide a clear path to resolution.                                 |
| Out-of-scope patterns | Not for local field guidance (Inline Message), transient feedback (Toast), or growth/marketing messaging (Promotion). |

## Properties

| Figma Property     | Code Property | Type    | Allowed Values                        | Default   | Description                                                                                                    |
| ------------------ | ------------- | ------- | ------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| `intent`           | `not exposed` | enum    | `info`, `success`, `warning`, `error` | `success` | Sets the system-status meaning, icon treatment, and message tone using the framework's four core intents only. |
| `dismiss`          | `not exposed` | boolean | `true`, `false`                       | `true`    | Shows or hides the dismiss control in the banner header.                                                       |
| `optional buttons` | `not exposed` | boolean | `true`, `false`                       | `true`    | Shows or hides the banner action button group for one or two path-to-resolution actions.                       |
| `cta 1`            | `not exposed` | boolean | `true`, `false`                       | `true`    | Shows or hides the primary CTA inside the optional button group.                                               |
| `cta 2`            | `not exposed` | boolean | `true`, `false`                       | `true`    | Shows or hides the secondary CTA inside the optional button group.                                             |

Banner headline, supporting copy, and button labels are currently edited through nested text layers and nested button instances in Figma. They are part of the component content model, but they are not exposed as Banner-level component properties.

## When to Use / When Not to Use

### Do

- ✅ DO: Use Banner for current-view or system-state communication that affects the reader's session or the page as a whole.
- ✅ DO: Keep the message concise enough to scan quickly, with a short title and supporting body copy.
- ✅ DO: Use the optional button group only when users need one or two immediate next steps.
- ✅ DO: Anchor Banner directly under the main navigation and keep it sticky on scroll when the state remains relevant during a deep read.
- ✅ DO: Ensure warning and error banners provide a clear path to resolution rather than leaving the reader at a dead end.

### Don't

- ❌ DONT: Use Banner for low-priority confirmations that can disappear automatically; use Toast instead.
- ❌ DONT: Use Banner for local field validation or tightly scoped inline guidance; use Inline Message instead.
- ❌ DONT: Add more than two actions or use the button group for complex branching; escalate to a dedicated page or Modal when users need to choose.
- ❌ DONT: Make critical or legally required messaging dismissible unless the product explicitly preserves the requirement elsewhere.
- ❌ DONT: Use Banner for marketing, editorial promotion, branded themes, or rich media; those belong to Promotion, not system messaging.
- ❌ DONT: Float Banner above the page grid like a Toast or Tooltip; its role in the framework is anchored, not overlay-based.

## States and Interactions

### Persistent

```js
// Storybook Args
{ intent: 'success', dismiss: true, 'optional buttons': false, 'cta 1': false, 'cta 2': false }
```

**Purpose**: Presents important information that remains available while the underlying condition is still true.

**Implementation notes**: Place Banner directly under the main navigation, not as a floating overlay. Keep it sticky while the state remains relevant to the current reading session. Do not auto-dismiss. Edit the headline and body copy directly in the text layers, and keep the message readable without relying on the dismiss control or button group.

### With One Action

```js
// Storybook Args
{ intent: 'warning', dismiss: true, 'optional buttons': true, 'cta 1': true, 'cta 2': false }
```

**Purpose**: Adds one clear next step when the banner communicates a problem the user can resolve immediately.

**Implementation notes**: Show the button group and enable only `cta 1` when one primary next step is needed. Edit the nested button label to use explicit outcome-led copy such as `Update billing details`. Keep the action adjacent to the message and in normal tab order. Use this pattern to avoid dead-end warnings or errors.

### With Two Actions

```js
// Storybook Args
{ intent: 'info', dismiss: true, 'optional buttons': true, 'cta 1': true, 'cta 2': true }
```

**Purpose**: Supports a primary and secondary action when users need an immediate choice without leaving the page context.

**Implementation notes**: Use two buttons only when the choices are tightly related and easy to understand side by side. `cta 1` should hold the primary action and `cta 2` the secondary action. If the actions compete with each other, need explanation, or push the reader into a growth journey, Banner is the wrong pattern.

## Accessibility

| Concern               | Requirement                                                                                                          | Example + Notes                                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accessible name       | The banner content must be readable in DOM order, with the visible title and body serving as the accessible message. | Use semantic heading and paragraph content inside the banner. Do not duplicate the full message in an `aria-label`.                                                                 |
| Announcement behavior | Use live-region semantics only when the banner appears or changes after initial page load.                           | Use `role="status"` or `aria-live="polite"` for informational updates. Reserve `role="alert"` for urgent warning or error messages that require immediate awareness.                |
| Focus order           | Do not move focus to the banner automatically unless it blocks the user from continuing.                             | On insertion, keep focus on the current control for non-blocking banners. If the banner introduces a required action, move focus only when that change prevents safe progress.      |
| CTA limit             | Use zero, one, or two actions only.                                                                                  | `cta 1` should be the primary action. `cta 2` is optional and should stay secondary. More than two actions turns the banner into a decision surface and should use another pattern. |
| Dismiss control label | Dismiss buttons need a clear accessible name and keyboard support.                                                   | Use a native button with an explicit label such as `Dismiss banner`. Icon-only dismiss affordances require an accessible name.                                                      |
| Meaning beyond color  | Intent meaning cannot rely on color alone.                                                                           | The title and body copy must state the problem or status directly, such as `Payment failed` or `Settings saved`.                                                                    |
| Sticky placement      | Sticky placement must not obscure primary navigation or reading progress.                                            | Keep the banner anchored under the main nav and ensure its height and scroll behavior remain predictable across breakpoints.                                                        |
| Scope boundary        | Banner must remain functional system messaging rather than promotional messaging.                                    | Do not introduce branded themes, rich media, or growth-copy framing in Banner content.                                                                                              |

## Related Components

| Component      | Relationship                                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Toast          | Use Toast for transient confirmations that auto-dismiss and do not need to stay visible in page flow.                      |
| Inline Message | Use Inline Message for guidance or status tied to a specific form area, card, or content block rather than the whole page. |
| Modal          | Use Modal when the user must stop, review more detail, or choose among multiple actions before continuing.                 |

## Checklist

### Designer

- [ ] `intent` matches the severity and urgency of the message.
- [ ] Banner is used only for page-status or system-state communication, not promotion or editorial messaging.
- [ ] Visual and copy treatment preserve functional status tone rather than campaign or marketing tone.
- [ ] Title communicates the outcome or issue in plain language before the user reads the body.
- [ ] Body copy stays within one or two short sentences and avoids multi-step instructions.
- [ ] Optional buttons are used only when one or two immediate actions are required.
- [ ] `dismiss=true` is used only when the banner can be safely cleared without losing essential information.

### Developer

- [ ] Banner remains in normal page flow and does not auto-dismiss.
- [ ] Banner is anchored under the main navigation and remains sticky when the status is still relevant during scroll.
- [ ] Title and body are announced in reading order without duplicative ARIA labels.
- [ ] Live-region behavior is applied only for dynamically inserted or updated banners.
- [ ] Button labels, when present, use explicit destination-oriented or outcome-led copy.
- [ ] Dismiss control is a native button with a clear accessible name and predictable focus behavior.
- [ ] Warning and error banners provide a clear route to resolution rather than presenting a dead-end status.
- [ ] Banner content avoids promotional framing, branded themes, and rich-media treatment reserved for Promotion.
