---
status: DRAFT
component_id: inline-message
component_version: 1.0.0
owners:
 design: Design System
 engineering: Design System
last_reviewed: 2026-04-17
storybook_refs: []
figma_refs:
 - file_key: hcCXq9ObSEBdXtwROtBSNc
 node_id: '935:61707'
parity_state: docs-only
canonical_ids:
 properties:
 - property_id: inline-message.intent
 figma_property: intent
 code_property: not exposed
 support: not-exposed
 - property_id: inline-message.optionalLink
 figma_property: optional link
 code_property: not exposed
 support: not-exposed
 variants:
 - variant_id: inline-message.intent.info
 property_id: inline-message.intent
 value: info
 - variant_id: inline-message.intent.success
 property_id: inline-message.intent
 value: success
 - variant_id: inline-message.intent.error
 property_id: inline-message.intent
 value: error
 - variant_id: inline-message.intent.warning
 property_id: inline-message.intent
 value: warning
 - variant_id: inline-message.optionalLink.false
 property_id: inline-message.optionalLink
 value: 'false'
 - variant_id: inline-message.optionalLink.true
 property_id: inline-message.optionalLink
 value: 'true'
 behaviors:
 - behavior_id: inline-message.a11y.association
 concern: Programmatic association
 - behavior_id: inline-message.a11y.readingOrder
 concern: Reading order
 - behavior_id: inline-message.a11y.meaningBeyondColor
 concern: Meaning beyond color
 - behavior_id: inline-message.content.localScope
 concern: Local scope clarity
 - behavior_id: inline-message.content.linkClarity
 concern: Optional link clarity
 - behavior_id: inline-message.layout.inFlowPlacement
 concern: In-flow placement
 - behavior_id: inline-message.framework.criticalityTier
 concern: Criticality tier
 - behavior_id: inline-message.framework.scopeBoundary
 concern: Scope boundary
---

# Inline Message 1.0.0

## Summary

Inline Message is the messaging framework's local-context component: a persistent, in-flow message attached to a specific form area, card, or content block. **Use Inline Message when feedback must stay near the relevant interface element and should not escalate to page-wide priority.**

Within the messaging framework, Inline Message sits below Banner in criticality and above transient Toast feedback: it supports the same four status intents (`info`, `success`, `warning`, `error`) but remains scoped to the local task rather than the whole page state.

## Framework Positioning

| Dimension | Inline Message contract |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Criticality | Medium. Use for local guidance, validation, and contextual status readers must see in place. |
| Placement | In normal content flow, adjacent to the related field, card, or content section. |
| Semantic scope | Local system communication only; use core intents (`info`, `success`, `warning`, `error`) for contextual meaning. |
| Action model | Zero or one optional link for a focused next step tied to the same local context. |
| Out-of-scope patterns | Not for global/sticky page status (Banner), transient confirmations (Toast), or growth/marketing messaging (Promotion). |

## Properties

| Figma Property | Code Property | Type | Allowed Values | Default | Description |
| --------------- | ------------- | ------- | ------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `intent` | `not exposed` | enum | `info`, `success`, `error`, `warning` | `info` | Sets local message meaning, icon treatment, and semantic tone using the framework's four core intents. |
| `optional link` | `not exposed` | boolean | `true`, `false` | `true` | Shows or hides the optional inline link used for one related next step. |

Inline headline, supporting copy, and optional link label are currently edited through nested text layers in Figma. They are part of the component content model, but they are not exposed as Inline Message top-level component properties.

## When to Use / When Not to Use

### Do

- ✅ DO: Use Inline Message for local guidance tied to a nearby field, setting, or content module.
- ✅ DO: Keep the message concise and specific to the local user task.
- ✅ DO: Use one optional link only when a clear local next step exists.
- ✅ DO: Keep the message visible while the local condition remains relevant.

### Don't

- ❌ DONT: Use Inline Message for page-wide announcements or session-level status; use Banner instead.
- ❌ DONT: Use Inline Message for short-lived confirmations after completed actions; use Toast instead.
- ❌ DONT: Add multiple links or branch users into complex decision paths.
- ❌ DONT: Use promotional, campaign, or content growth copy in this component.

## States and Interactions

### Local Guidance

```js
// Storybook Args
{ intent: 'info', 'optional link': true }
```

**Purpose**: Provides contextual information where the user is currently making a decision.

**Implementation notes**: Place adjacent to the related UI area and keep content actionable in that context. Use neutral, direct language that references the local task.

### Validation/Error Context

```js
// Storybook Args
{ intent: 'error', 'optional link': true }
```

**Purpose**: Explains local problems and guides users toward immediate recovery in place.

**Implementation notes**: Keep copy specific to what failed and what to do next. Optional link text should name the exact destination or action.

## Accessibility

| Concern | Requirement | Example + Notes |
| ------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Programmatic association | Associate message content with the related control or local region when used for validation/guidance. | Use `aria-describedby` from the related form control to the inline message text where applicable. |
| Reading order | Message headline and body must follow normal DOM reading order in context. | Keep inline message in flow near the referenced element, not detached visually or semantically. |
| Meaning beyond color | Intent meaning cannot rely on color alone. | Headline/body copy should explicitly describe state (for example `Payment method failed`), not just show red styling. |
| Optional link clarity | Link label must clearly state destination or outcome. | Prefer `Review payment settings` over generic `Learn more` when the action is task-critical. |
| Scope boundary | Content should stay local and task-specific, not global or promotional. | Avoid campaign-style phrasing and avoid content that implies site-wide status unless using Banner. |

## Related Components

| Component | Relationship |
| --------- | ----------------------------------------------------------------------------------------------------- |
| Banner | Use Banner for global page/session status that must remain sticky and highly prominent. |
| Toast | Use Toast for transient confirmations that auto-dismiss and are not anchored to a local content area. |
| Modal | Use Modal when users must stop and complete a decision before returning to the flow. |

## Checklist

### Designer

- [ ] `intent` matches local severity and user-task urgency.
- [ ] Message stays contextual to a nearby control, field, or content block.
- [ ] Copy is concise and provides clear local next steps.
- [ ] Optional link is present only when one focused action is needed.
- [ ] Visual and verbal semantics remain functional, not promotional.

### Developer

- [ ] Component uses canonical Figma properties: `intent`, `optional link`.
- [ ] Inline message remains in normal flow near the referenced content.
- [ ] Related controls use programmatic association (for example `aria-describedby`) when required.
- [ ] Link labels are explicit and outcome-led.
- [ ] No multi-action branching or page-level escalation is introduced.
