---
status: SUPERSEDED
component_id: flag
component_version: 1.0.0
owners:
 design: TBD
 engineering: TBD
last_reviewed: 2026-03-20
storybook_refs:
 - stories/components/Flag.stories.tsx
figma_refs:
 - file_key: YOUR-FIGMA-FILE-KEY
 node_id: '8432:288589'
 - file_key: YOUR-FIGMA-FILE-KEY
 node_id: '8432:288590'
parity_state: superseded-see-2.0.0
canonical_ids:
 properties:
 - property_id: flag.intent
 figma_property: intent
 code_property: intent
 support: runtime
 - property_id: flag.size
 figma_property: size
 code_property: size
 support: runtime
 - property_id: flag.iconLeft
 figma_property: iconLeft
 code_property: iconLeft
 support: runtime
 - property_id: flag.iconRight
 figma_property: iconRight
 code_property: iconRight
 support: runtime
 - property_id: flag.label
 figma_property: label
 code_property: label
 support: runtime
 variants:
 - variant_id: flag.intent.primary
 property_id: flag.intent
 value: primary
 - variant_id: flag.intent.secondary
 property_id: flag.intent
 value: secondary
 - variant_id: flag.intent.channel
 property_id: flag.intent
 value: channel
 - variant_id: flag.intent.callout
 property_id: flag.intent
 value: callout
 - variant_id: flag.size.medium
 property_id: flag.size
 value: medium
 - variant_id: flag.size.small
 property_id: flag.size
 value: small
 behaviors:
 - behavior_id: flag.a11y.accessibleName
 concern: Accessible name
 - behavior_id: flag.layout.inlineUsage
 concern: Inline layout behavior
 - behavior_id: flag.content.labelClarity
 concern: Label clarity
---

# Flag 1.0.0

> Superseded by `Flag-2.0.0.md` after removal of `intent='channel'`.

## Summary

Flag highlights short contextual metadata such as LIVE, UPDATED, or section emphasis alongside article information. Use Flag for compact status or content signals, not as a clickable control.

## Properties

| Figma Property | Code Property | Type | Allowed Values | Default | Description |
| -------------- | ------------- | ------- | -------------------------------------------- | --------- | ------------------------------ |
| `intent` | `intent` | enum | `primary`, `secondary`, `channel`, `callout` | `primary` | Changes visual treatment. |
| `size` | `size` | enum | `medium`, `small` | `medium` | Changes visual treatment. |
| `iconLeft` | `iconLeft` | boolean | `true`, `false` | `false` | Shows/hides iconleft element. |
| `iconRight` | `iconRight` | boolean | `true`, `false` | `false` | Shows/hides iconright element. |
| `label` | `label` | string | any short text | `LABEL` | Sets label content. |

## When to Use / When Not to Use

### Do

- Use for short content signals beside article metadata.
- Keep labels concise and scannable.
- Use `callout` for urgent emphasis like LIVE labels.
- Use `channel` when aligning to channel context styling.

### Don't

- Do not use as a button or link target.
- Do not use long sentences as label content.
- Do not stack multiple flags with conflicting intent.
- Do not replace critical navigation labels with Flag.

## States and Interactions

### Default

```js
// Storybook Args
{ intent: 'primary', size: 'medium', iconLeft: false, iconRight: false, label: 'LABEL' }
```

**Purpose**: Presents a compact static label for contextual metadata.

**Implementation notes**: Render as non-interactive inline content. Preserve the exact size and typography pairing from the selected `size` variant.

### With Icons

```js
// Storybook Args
{ intent: 'channel', size: 'small', iconLeft: true, iconRight: true, label: 'LIVE' }
```

**Purpose**: Adds optional visual affordance for directional or status cues.

**Implementation notes**: Icons remain decorative unless explicitly mapped to meaningful semantics. Keep icon + text aligned in a single inline row with 4px spacing.

## Accessibility

| Concern | Requirement | Example + Notes |
| ---------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Accessible name | The visible label must communicate meaning on its own. | Labels such as `LIVE` and `UPDATED` should remain explicit and context-safe. |
| Inline semantics | Flag should not present button/link semantics unless wrapped in one by parent content. | Render as inline `<span>` by default. |
| Contrast | Text and background pairing must preserve readable contrast per intent. | Validate callout and channel variants in both light and dark story modes. |

## Related Components

| Component | Relationship |
| --------- | -------------------------------------------------------------------------- |
| Chip | Chip is interactive/selectable; Flag is informational and non-interactive. |
| Button | Button triggers actions; Flag communicates status. |
| Link | Link navigates; Flag annotates nearby content. |

## Checklist

### Designer

- [ ] Intent is chosen for meaning, not decoration.
- [ ] Label remains short and recognisable.
- [ ] Size choice matches information density.
- [ ] Icon usage is purposeful and non-ambiguous.

### Developer

- [ ] Props match canonical Figma property names.
- [ ] `size` variants apply correct typography and spacing.
- [ ] Flag remains non-interactive by default.
- [ ] Stories cover all intents and both sizes in light and dark mode.

## Changelog

Date Published: `TBD`

| Date | Entry |
| ----- | ---------------------------------------------------------------------------- |
| `TBD` | `ADDED` Initial Flag 1.0.0 documentation contract with size variant support. |
