---
status: DRAFT
component_id: toast
component_version: 1.0.0
owners:
  design: TBD
  engineering: TBD
last_reviewed: 2026-04-14
storybook_refs:
  - stories/components/Toast.stories.tsx
figma_refs:
  - file_key: hcCXq9ObSEBdXtwROtBSNc
    node_id: '803:3115'
  - file_key: hcCXq9ObSEBdXtwROtBSNc
    node_id: '827:104357'
parity_state: contract-alignment-in-progress
canonical_ids:
  properties:
    - property_id: toast.intent
      figma_property: intent
      code_property: intent
      support: runtime
    - property_id: toast.label
      figma_property: label
      code_property: label
      support: content
    - property_id: toast.link
      figma_property: link
      code_property: link
      support: runtime
    - property_id: toast.timeout
      figma_property: timeout
      code_property: timeout
      support: runtime
  variants:
    - variant_id: toast.intent.success
      property_id: toast.intent
      value: success
    - variant_id: toast.intent.info
      property_id: toast.intent
      value: info
    - variant_id: toast.intent.warning
      property_id: toast.intent
      value: warning
    - variant_id: toast.intent.error
      property_id: toast.intent
      value: error
  behaviors:
    - behavior_id: toast.behavior.autoDismiss
      concern: Auto-dismiss timing
    - behavior_id: toast.layout.singleVisible
      concern: Stack/queue policy
    - behavior_id: toast.content.singleSentence
      concern: Message brevity
    - behavior_id: toast.a11y.intentClarity
      concern: Intent and icon clarity
---

# Toast 1.0.0

## Summary

Toast is a brief, non-modal notification used to confirm system feedback after a user action. It should be low-disruption, short-lived, and easy to scan.

## Properties

| Figma Property | Code Property | Type    | Allowed Values                        | Default   | Description                                                                                                                                                                                                                                                                       |
| -------------- | ------------- | ------- | ------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intent`       | `intent`      | enum    | `success`, `info`, `warning`, `error` | `success` | Sets the semantic meaning and visual treatment of the notification.                                                                                                                                                                                                               |
| `label`        | `label`       | string  | any short text                        | `—`       | Message text shown in the toast body.                                                                                                                                                                                                                                             |
| `link`         | `link`        | boolean | `true`, `false`                       | `true`    | Shows/hides an optional inline action link.                                                                                                                                                                                                                                       |
| `timeout`      | `timeout`     | number  | milliseconds (`>= 1500`)              | `2000`    | Auto-dismiss delay in ms. Default is `2000`; override only for readability/context (for example `3000` for longer warning copy or `4000` when link text needs scan time). Guardrails: avoid `< 1500` and avoid long durations (`> 6000`) unless accessibility needs are explicit. |

## When to Use / When Not to Use

### Do

- ✅ DO: Try to keep the message to one short sentence; if it wraps heavily, move detail to another component.
- ✅ DO: Use for non-disruptive confirmations such as "Article saved" or "Link copied".
- ✅ DO: Match intent to meaning: success for completions, error for failures, warning for caution, info for neutral updates.
- ✅ DO: Place above mobile bottom navigation and safe-area hit zones.

### Don't

- ❌ DONT: Use for critical errors that require long instructions or forced acknowledgement.
- ❌ DONT: Add multiple CTAs; if choices are complex, use Banner, Inline Message, or Modal.
- ❌ DONT: Fire several toasts for one user action.
- ❌ DONT: Rely on toast as the only channel for high-risk or time-sensitive messaging.

## States and Interactions

### Default

```js
// Storybook Args
{ intent: 'success', label: 'Short toast message goes here.', link: true, timeout: 2000 }
```

**Purpose**: Shows fast feedback after successful user action.

**Implementation notes**: Keep one toast visible at a time and auto-dismiss after a short timeout.

## Accessibility

- Intent clarity: Message text must communicate severity and outcome, not colour alone. Example: error/warning copy should state what happened and what to do next.
- Readability timing: Display duration must be long enough for average reading speed. Example: use a consistent timeout and provide a fallback location for missed notices.
- Action clarity: Link labels must describe destination/action clearly. Example: prefer explicit labels over vague "Learn more" where possible.

## Related Components

- Banner: Higher-priority and page-anchored; Toast is transient feedback.
- Inline Message: Contextual and persistent; Toast is floating and temporary.
- Tooltip: Explains UI controls; Toast confirms system outcomes.

## Checklist

### Designer

- [ ] Intent reflects message severity and urgency.
- [ ] Message remains brief and scannable.
- [ ] Link appears only when a clear next step exists.
- [ ] Placement avoids overlap with key navigation/hit targets.

### Developer

- [ ] Props use canonical Figma names: `intent`, `label`, `link`, `timeout`.
- [ ] Toast auto-dismiss behavior is implemented consistently.
- [ ] Storybook covers all 4 intents.
- [ ] Figma specs and Storybook controls remain in property parity.
