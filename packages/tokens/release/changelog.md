# Master Release Changelog (Agent Source)

Purpose: Primary source of truth for release generation.
Audience: Agents first, humans second.

Use this file to capture complete, machine-friendly release deltas before generating any human-facing release artifacts.

## Design Principles

- Prefer structured fields over prose.
- Record facts once, then derive all release docs from this file.
- Include routing flags so agents can filter without interpretation.
- Capture exclusions explicitly to prevent scope leakage.
- If the user explicitly says release now/today, all `vtbd` release artifacts must be resolved in place to a concrete version/date in the same run.

## Entry Schema

- release_id: unique ID, for example `2026-04-02-r1`
- release_date: `YYYY-MM-DD`
- token_library_version: `x.y.z` (or `tbd`)
- ui_kit_release_date: `YYYY-MM-DD`
- figma_urls:
  - token_library: canonical file URL
  - ui_kit: canonical file URL
- source_window:
  - since: previous release date
  - until: current release date
- source_commits: list of commit SHAs and one-line summaries
- token_changes: added/removed/updated arrays with normalized fields
- component_changes: added/removed/updated arrays with component + version
- figma_changelog_entry: token library version block payload for manual paste to Figma
- exclusions: docs/infrastructure/code-only notes to omit from human release artifacts
- unresolved_questions: items requiring human decision before publish

## Normalized Change Item Fields

For each item in `token_changes` or `component_changes`, include:

- id: stable identifier, for example `tok-001`, `comp-003`
- change_type: `added` | `removed` | `updated`
- domain: `token-library` | `ui-kit`
- layer: `foundation` | `palette` | `semantic` | `component-contract`
- breaking: `true` | `false`
- migration_required: `true` | `false`
- migration_note: required if `migration_required=true`
- figma_visible: `true` | `false`
- audience_relevance:
  - designers: `high` | `medium` | `low`
  - developers: `high` | `medium` | `low`
  - product: `high` | `medium` | `low`
- include_in:
  - ui_kit_slack: `true` | `false`
  - ui_kit_figma_publish: `true` | `false`
  - token_library_slack: `true` | `false`
  - token_library_figma_publish: `true` | `false`
  - token_library_figma_changelog: `true` | `false`
- summary_human: short sentence for human-facing docs
- summary_agent: complete technical detail for traceability

## Releases

Copy the template from [packages/tokens/release/templates/MASTER_CHANGELOG_ENTRY_TEMPLATE.md](packages/tokens/release/templates/MASTER_CHANGELOG_ENTRY_TEMPLATE.md) for each new release.

## Optional Fast Filters (Recommended)

Use this logic when generating downstream artifacts:

- UI Kit Slack: `include_in.ui_kit_slack=true` and `domain=ui-kit`
- UI Kit Figma publish: `include_in.ui_kit_figma_publish=true` and `figma_visible=true`
- Token Library Slack: `include_in.token_library_slack=true` and `domain=token-library`
- Token Library Figma publish: `include_in.token_library_figma_publish=true` and `figma_visible=true`
- Token Library Figma changelog: `include_in.token_library_figma_changelog=true`

## Release Entries

```yaml
release:
  status: released
  release_id: 2026-05-22-r1
  release_date: 2026-05-22
  token_library_version: v1.4.0
  ui_kit_release_date: N/A

  figma_urls:
    token_library: https://www.figma.com/design/YOUR-FIGMA-FILE-KEY/Token-Library---Design-System
    ui_kit: N/A

  source_window:
    since: 2026-04-13
    until: 2026-05-22

  source_commits:
    - sha: e05b33a0
      summary: "feat(tokens): add contrast-optimized text.channel and icon.channel tokens"
      affects: token-library
    - sha: 64393d64
      summary: "feat(tokens): update flag.callout dark mode references"
      affects: token-library
    - sha: deb35159
      summary: "fix(tokens): flag.callout.text references text.primary in dark mode"
      affects: token-library

  token_changes:
    added:
      - id: tok-001
        token: text.channel.tertiary
        domain: token-library
        change_type: added
        layer: semantic
        before: N/A
        after: Ramp references per channel theme (3:1–3.7:1 contrast range)
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: true
        audience_relevance:
          designers: high
          developers: high
          product: medium
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: Added tertiary channel text token with optimized contrast (3:1–3.7:1) across all 14 channel themes.
        summary_agent: New text.channel.tertiary token added to all 28 theme sets (14 channels × light/dark). References channel-specific ramp steps selected algorithmically for 3:1 minimum, 3.7:1 maximum contrast vs background.
        figma_impact: Designers can now use text.channel.tertiary for a third level of channel-branded text hierarchy.

      - id: tok-002
        token: icon.channel.tertiary
        domain: token-library
        change_type: added
        layer: semantic
        before: N/A
        after: "{text.channel.tertiary}"
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: true
        audience_relevance:
          designers: high
          developers: high
          product: medium
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: Added tertiary channel icon token referencing text.channel.tertiary for icon/text parity.
        summary_agent: New icon.channel.tertiary token added to all 28 theme sets. References text.channel.tertiary to maintain semantic parity between icon and text channel tokens.
        figma_impact: Designers can now use icon.channel.tertiary alongside text.channel.tertiary for consistent tertiary-level channel branding.

    removed: []
    updated:
      - id: tok-003
        token: text.channel.primary
        domain: token-library
        change_type: updated
        layer: semantic
        before: "{surface.channel.400}" (all themes)
        after: Channel-specific ramp references with 2-step gaps (e.g., neutral.750 for core light)
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: true
        audience_relevance:
          designers: high
          developers: high
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: Updated primary channel text to use contrast-optimized ramp references with 2-step hierarchy gaps.
        summary_agent: text.channel.primary updated across all 28 theme sets. Now references channel-specific ramp steps selected for contrast optimization. Maintains 2-step gap above secondary for clear visual hierarchy.
        figma_impact: Primary channel text colors may shift slightly to ensure proper contrast hierarchy.

      - id: tok-004
        token: text.channel.secondary
        domain: token-library
        change_type: updated
        layer: semantic
        before: "{surface.channel.300}" (all themes)
        after: Channel-specific ramp references with max 5.75:1 contrast (e.g., neutral.650 for core light)
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: true
        audience_relevance:
          designers: high
          developers: high
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: Updated secondary channel text to use contrast-optimized ramp references (max 5.75:1).
        summary_agent: text.channel.secondary updated across all 28 theme sets. Now references channel-specific ramp steps with max 5.75:1 contrast ceiling. Maintains 2-step gap between secondary and tertiary.
        figma_impact: Secondary channel text colors updated for proper contrast hierarchy relative to tertiary.

  component_changes:
    added: []
    removed: []
    updated: []

  exclusions:
    - Infrastructure and formatting changes from json.dump character encoding

  unresolved_questions: []
```

```yaml
release:
  status: superseded_draft
  release_id: 2026-04-13-r1
  release_date: 2026-04-13
  token_library_version: tbd
  ui_kit_release_date: tbd

  figma_urls:
    token_library: tbd
    ui_kit: tbd

  source_window:
    since: 2026-04-02
    until: 2026-04-13

  source_commits:
    - sha: bfb0e31c
      summary: feat(tokens): add overlay.light ramp in light and dark brand palettes
      affects: token-library
    - sha: ad7f3942
      summary: feat(tokens): rebalance dark messaging ramp progression across all steps
      affects: token-library

  token_changes:
    added:
      - id: tok-001
        token: ramp.overlay.light.50-1000
        domain: token-library
        change_type: added
        layer: palette
        before: N/A
        after: Added white alpha overlay ramp in both light/ brand and dark/ brand palettes with 20 steps (50-1000)
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: true
        audience_relevance:
          designers: high
          developers: medium
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: Added a new overlay.light white alpha ramp (50-1000) to both light and dark token-library brand palettes.
        summary_agent: Introduced ramp.overlay.light as a sibling to ramp.overlay.dark in light/ brand and dark/ brand. Each step uses rgba(255, 255, 255, alpha) with matching colour.modifier step and p3 alpha modify metadata.
        figma_impact: Designers can now select overlay.light ramp steps directly in both light and dark token-library modes.

    removed: []
    updated:
      - id: tok-002
        token: ramp.messaging.info/error/warning/success (all 20 steps, dark/ brand only)
        domain: token-library
        change_type: updated
        layer: palette
        before: Step 50 ~4-6% lightness, step 1000 ~68-79% lightness
        after: Step 50 ~14-15% lightness, step 1000 ~86-88% lightness across all four messaging ramps in dark/ brand mode
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: true
        audience_relevance:
          designers: high
          developers: low
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: Rebalanced dark mode messaging ramp lightness so steps start at ~14-15% and end at ~86-88%, replacing the previous near-black starts and muted ends.
        summary_agent: All 20 steps of ramp.messaging.info, error, warning, and success were updated in dark/ brand only. Modifier ladders were adjusted per-ramp using colour.modifier references; darken modifiers set the dark end and lighten modifiers set the light end, tuned to hit user-specified lightness targets at step 50 and step 1000.
        figma_impact: Dark mode messaging palette ramps now offer usable contrast across the full range rather than clustering at the dark extreme.

  component_changes:
    added:
      - id: comp-001
        component: Toast
        component_version: tbd
        domain: ui-kit
        change_type: added
        layer: component-contract
        before: N/A
        after: Placeholder only. Toast semantic tokens exist in light/ core and dark/ core as hidden-from-publishing references for future component rollout.
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: false
        audience_relevance:
          designers: medium
          developers: medium
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: false
          token_library_figma_publish: false
          token_library_figma_changelog: false
        summary_human: Placeholder for upcoming Toast component release in UI Kit once the component contract is finalized.
        summary_agent: Keep this item excluded from current release artifacts. Finalize and flip include_in routing for UI Kit outputs only when Toast component docs/specs/stories are ready.
    removed: []
    updated: []

  token_library_figma_changelog_entry:
    version: tbd
    date: 2026-04-13
    added:
      - Added ramp.overlay.light (white alpha progression, 50-1000) across light and dark brand palettes.
    updated:
      - Rebalanced dark mode messaging ramps (info, error, warning, success): step 50 now ~14-15% lightness, step 1000 now ~86-88% lightness.
    removed: []

  figma_only_notes:
    - New overlay.light ramp values are available for variable selection in token-library modes.

  unresolved_questions: []

  exclusions:
    - Generated platform output files from build pipelines are excluded from human-facing release notes.
    - Hidden-from-publishing Toast semantic tokens are excluded from Token Library release artifacts until the Toast component ships.
```

```yaml
release:
  status: released
  release_id: 2026-04-17-r1
  release_date: 2026-04-17
  token_library_version: 1.3.0
  ui_kit_release_date: N/A

  figma_urls:
    token_library: https://www.figma.com/design/YOUR-FIGMA-FILE-KEY/Token-Library---Design-System?node-id=0-1&t=5qrVz2tRTsjCKEdo-1
    ui_kit: N/A

  source_window:
    since: 2026-04-13
    until: 2026-04-17

  source_commits:
    - sha: 4fe651c6
      summary: add inverse tokens and rollout instructions across semantic themes
      affects: token-library
    - sha: 461337bd
      summary: rename feedback to messaging and roll out messaging sets across semantic themes
      affects: token-library
    - sha: c5903dab
      summary: utility.body.bold font weight update (excluded from release messaging by decision)
      affects: token-library

  token_changes:
    added:
      - id: tok-101
        token: surface.inverse, text.inverse, icon.inverse
        domain: token-library
        change_type: added
        layer: semantic
        before: Inverse anchors were not consistently available across all semantic themes.
        after: Inverse anchors are now available across all light and dark semantic themes.
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: true
        audience_relevance:
          designers: high
          developers: high
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: Added inverse surface, text, and icon anchors across all semantic themes for fixed-contrast scenarios when mode switching is not possible.
        summary_agent: Inverse tokens under surface/text/icon were described and propagated from core sets to every light and dark semantic theme.
        figma_impact: Designers can use consistent inverse anchors across all theme modes in Token Library variables.

    removed:
      - id: tok-102
        token: feedback.*
        domain: token-library
        change_type: removed
        layer: semantic
        before: Feedback semantic group existed across semantic theme sets.
        after: Feedback semantic group removed with strict replacement by messaging semantic group.
        breaking: true
        migration_required: true
        migration_note: Replace all feedback.* usages with messaging.* usages.
        figma_visible: true
        audience_relevance:
          designers: high
          developers: high
          product: medium
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: Removed feedback semantic tokens and replaced them with messaging semantic tokens across all semantic themes.
        summary_agent: Strict replace strategy was applied: feedback groups were deleted from all semantic themes and messaging groups were rolled out by mode parity.
        figma_impact: Existing feedback variable bindings require migration to messaging variables.

    updated:
      - id: tok-103
        token: messaging.link.*
        domain: token-library
        change_type: updated
        layer: semantic
        before: Hidden-from-publishing behavior was inconsistent for messaging link tokens.
        after: Hidden-from-publishing is enforced across messaging link token leaves.
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: false
        audience_relevance:
          designers: medium
          developers: low
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: false
          token_library_figma_publish: false
          token_library_figma_changelog: false
        summary_human: Hidden messaging-link implementation tokens were updated for publishing control.
        summary_agent: messaging.link leaves now explicitly set com.figma.hiddenFromPublishing=true across semantic themes.
        figma_impact: None for published variables because hidden tokens remain excluded.

  component_changes:
    added: []
    removed: []
    updated: []

  token_library_figma_changelog_entry:
    version: 1.3.0
    date: 2026-04-17
    added:
      - Added inverse surface/text/icon semantic anchors across all light and dark semantic themes.
    updated:
      - Replaced feedback semantic group with messaging semantic group across all semantic themes.
    removed:
      - Removed feedback semantic group from all semantic themes.

  figma_only_notes:
    - messaging.link and tooltip-related hidden tokens are intentionally excluded from publish-facing release messaging.

  unresolved_questions: []

  exclusions:
    - utility.body.bold release mention explicitly excluded by release decision.
    - Hidden messaging.link and hidden tooltip token changes are excluded from human-facing release artifacts.
```

```yaml
release:
  status: draft
  release_id: 2026-04-23-r1
  release_date: 2026-04-23
  token_library_version: N/A
  ui_kit_release_date: 2026-04-23

  figma_urls:
    token_library: N/A
    ui_kit: https://www.figma.com/design/hcCXq9ObSEBdXtwROtBSNc/UI-Kit---Design-System

  source_window:
    since: 2026-04-17
    until: 2026-04-23

  source_commits:
    - sha: TBD_image_component_spec
      summary: add Image component specification and Figma specs page with 10 aspect-ratio variants
      affects: ui-kit

  token_changes:
    added: []
    removed: []
    updated: []

  component_changes:
    added:
      - id: comp-image-001
        component: Image
        component_version: 1.0.0
        domain: ui-kit
        change_type: added
        layer: component-contract
        before: N/A
        after: 10 aspect-ratio variants (3:4, 4:5, 5:4, 4:3, 3:2, 2:3, 1:1, 9:16, 16:9, custom) with token-bound fill and corner-radius.
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: true
        audience_relevance:
          designers: high
          developers: high
          product: medium
        include_in:
          ui_kit_slack: true
          ui_kit_figma_publish: true
          token_library_slack: false
          token_library_figma_publish: false
          token_library_figma_changelog: false
        summary_human: Added Image component with 10 aspect-ratio variants for responsive image containers.
        summary_agent: 10 aspect-ratio variants (3:4, 4:5, 5:4, 4:3, 3:2, 2:3, 1:1, 9:16, 16:9, custom) with token-bound fill (surface token) and corner-radius (6px fixed). Static container, no interactive states. Consumers responsible for alt text via parent element or img tag.
        figma_impact: Designers can now use predefined aspect-ratio locked containers in the UI Kit for galleries, cards, and responsive layouts.
    removed: []
    updated: []

  token_library_figma_changelog_entry: N/A

  figma_only_notes:
    - Image component fill is bound to semantic token(s); no manual color overrides required.
    - Image component is static (no interactive states); wrapping components handle click/focus/keyboard interactions.

  unresolved_questions: []

  exclusions:
    - Token Library messaging not included; this is a UI Kit component-only release.
    - No Token Library publish/changelog artifacts are in scope for this release entry.
```

```yaml
release:
  status: draft
  release_id: 2026-04-29-r1
  release_date: 2026-04-29
  token_library_version: tbd
  ui_kit_release_date: tbd

  figma_urls:
    token_library: tbd
    ui_kit: tbd

  source_window:
    since: 2026-04-23
    until: 2026-04-29

  source_commits:
    - sha: ed22b224
      summary: flattened border radius as a seperate grouping
      affects: token-library
    - sha: fa0ad3f9
      summary: updated export $theme contract for figma variables
      affects: token-library

  token_changes:
    added:
      - id: tok-radius-flat-001
        change_type: added
        domain: token-library
        layer: borderRadius
        breaking: false
        migration_required: true
        migration_note: >
          Replace all `viewport/*/border-radius.*` paths with canonical flat paths `border-radius.*`.
          All 4 viewport sets (small, medium, large, xlarge) no longer contain border-radius tokens.
          New canonical Token Studio set: `borderRadius`. Token path format: `border-radius.<step>`.
          Values are identical to previous viewport entries (dimension references unchanged).
        figma_visible: true
        audience_relevance:
          designers: high
          developers: high
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: Border radius tokens moved to a standalone flat group. Use `border-radius.*` instead of `viewport/*/border-radius.*`.
        summary_agent: >
          Border radius tokens were previously duplicated across all 4 viewport sets (small/medium/large/xlarge)
          with identical values. They have been extracted into a standalone `borderRadius` Token Studio set
          as a flat group `border-radius.<step>`. $themes updated to reference the new set as `"borderRadius": "enabled"`.
          Values unchanged (dimension references preserved). The 28 viewport-namespaced border-radius variables
          are replaced by 7 canonical borderRadius variables.
    removed:
      - id: tok-radius-vp-001
        change_type: removed
        domain: token-library
        layer: viewport
        breaking: true
        migration_required: true
        migration_note: >
          `viewport/small.border-radius.*`, `viewport/medium.border-radius.*`,
          `viewport/large.border-radius.*`, `viewport/xlarge.border-radius.*`
          are all removed. Replace with `border-radius.*` from the `borderRadius` set.
        figma_visible: true
        audience_relevance:
          designers: high
          developers: high
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: Removed `viewport/*/border-radius.*` tokens (28 total across 4 viewport sets). Use `border-radius.*` instead.
        summary_agent: >
          `border-radius.50`, `border-radius.100`, `border-radius.150`, `border-radius.200`,
          `border-radius.300`, `border-radius.400`, `border-radius.full` previously existed in each of
          the 4 viewport sets. All 28 instances removed. Values were identical across viewports and have
          been consolidated into the new standalone `borderRadius` set.
      - id: tok-breakpoints-001
        change_type: removed
        domain: token-library
        layer: viewport
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: true
        audience_relevance:
          designers: low
          developers: low
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: Removed the unused top-level `breakpoints` token group from the token source. Published breakpoint outputs remain unchanged.
        summary_agent: >
          Removed the top-level Token Studio set `breakpoints` (`sm`, `md`, `lg`, `xl`) and dropped it from
          the $themes registration list. Repo checks found no `{breakpoints.*}` token references, and the two
          direct generator consumers now use local fallback breakpoint constants so CSS/JS breakpoint outputs
          keep the same values without depending on the removed token group.
    updated: []

  component_changes:
    added: []
    removed: []
    updated: []

  token_library_figma_changelog_entry:
    version: tbd
    date: 2026-04-29
    added:
      - Added standalone `borderRadius` tokens as canonical `border-radius.*` values.
    updated: []
    removed:
      - Removed duplicated `viewport/*/border-radius.*` tokens after consolidating them into `borderRadius`.
      - Removed the unused top-level `breakpoints` token group from the token source; generated breakpoint outputs are unchanged.

  figma_only_notes:
    - Border radius variables in Figma will show as `border-radius/50`, `border-radius/100` etc.
      under the `borderRadius` collection instead of per-viewport collections.
    - $themes export contract updated; Figma variable publish required to reflect new collection mapping.

  unresolved_questions:
    - token_library_version not yet assigned; assign before publishing release artifacts.
    - Figma variable publish required to propagate new borderRadius collection to consumers.

  exclusions:
    - No UI Kit component changes in this release.
    - $themes/$figma* metadata update (fa0ad3f9) is a Figma-only internal export contract change;
      excluded from human-facing release messaging beyond the Figma publish note.
```

```yaml
release:
  release_id: 2026-05-21-r1
  release_date: 2026-05-21
  token_library_version: tbd
  ui_kit_release_date: tbd

  figma_urls:
    token_library: tbd
    ui_kit: tbd

  source_window:
    since: 2026-04-29
    until: 2026-05-21

  source_commits:
    - sha: aacf6c88
      summary: 'fix(tokens): shift light-mode border tokens to lighter ramp steps; fix money channel ramp references'
      affects: token-library

  token_changes:
    added: []
    removed: []
    updated:
      - id: tok-001
        token: border.primary
        domain: token-library
        change_type: updated
        layer: semantic
        before: '{ramp.neutral.400}'
        after: '{ramp.neutral.350}'
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: true
        audience_relevance:
          designers: high
          developers: medium
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: 'border.primary lightened from neutral.400 to neutral.350 across all 14 light themes.'
        summary_agent: >
          border.primary.value changed from {ramp.neutral.400} (#a7a7a7) to {ramp.neutral.350} (#b3b2b3)
          in all 14 light token sets: core, comment, lifeAndStyle, puzzles, home, uk, world, business,
          money, sport, travel, culture, obituaries, ireland. Dark mode unchanged. Semantic layer only.
        figma_impact: 'border.primary variable resolves to a lighter grey in all light-mode themes.'

      - id: tok-002
        token: 'border.channel.primary / border.channel.secondary / border.channel.tertiary'
        domain: token-library
        change_type: updated
        layer: semantic
        before: 'border.channel.primary={ramp.<ch>.650}, border.channel.secondary={ramp.<ch>.500}, border.channel.tertiary={ramp.<ch>.350}'
        after: 'border.channel.primary={ramp.<ch>.350}, border.channel.secondary={ramp.<ch>.250}, border.channel.tertiary={ramp.<ch>.150}'
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: true
        audience_relevance:
          designers: high
          developers: medium
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: 'Channel accent border tokens shifted to lighter ramp steps in all 13 channel light themes.'
        summary_agent: >
          In light/ core: border.channel.primary shifted neutral.400 → neutral.350.
          In all 13 channel sets (comment, lifeAndStyle, puzzles, home, uk, world, business,
          money, sport, travel, culture, obituaries, ireland): border.channel.primary .650 → .350,
          border.channel.secondary .500 → .250, border.channel.tertiary .350 → .150, each on the
          set's own channel ramp. Dark mode border.channel.* tokens unchanged.
        figma_impact: 'Channel accent border variables resolve to noticeably lighter tints in light mode. Decorative borders only — no impact on interactive or input borders.'

      - id: tok-003
        token: 'light/ money — border.channel.* and icon.channel.* (bug fix)'
        domain: token-library
        change_type: updated
        layer: semantic
        before: 'ramp.business.* (incorrect cross-channel reference)'
        after: 'ramp.money.* (correct channel ramp)'
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: true
        audience_relevance:
          designers: medium
          developers: low
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: 'Money channel tokens corrected to use ramp.money instead of ramp.business.'
        summary_agent: >
          Bug fix: light/ money and dark/ money border.channel.{primary,secondary,tertiary} and
          icon.channel.{primary,secondary} were incorrectly referencing ramp.business.* instead
          of ramp.money.*. Steps preserved in dark mode; border steps also updated per tok-002 in
          light mode. Affects 10 token values total (5 light, 5 dark).
        figma_impact: 'Money theme channel borders and icons now render the correct money-green palette instead of business-blue.'

      - id: tok-004
        token: 'border.* descriptions (all 6 border token types)'
        domain: token-library
        change_type: updated
        layer: semantic
        before: 'Various — inconsistent UK/US spelling and generic wording'
        after: 'Standardised UK English, consistent parallel structure across all 14 light sets'
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: false
        audience_relevance:
          designers: low
          developers: low
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: false
          token_library_figma_publish: false
          token_library_figma_changelog: false
        summary_human: 'Border token descriptions standardised across all light themes.'
        summary_agent: >
          Descriptions updated for border.primary, border.secondary, border.tertiary,
          border.channel.primary, border.channel.secondary, border.channel.tertiary in all 14
          light token sets. US 'color' spelling corrected to UK 'colour' convention; wording
          aligned to parallel structure. Description-only change; no value or structural impact.
        figma_impact: 'No visual change. Token description metadata updated in Figma Token Library.'

  component_changes:
    added: []
    removed: []
    updated: []

  token_library_figma_changelog_entry:
    version: tbd
    date: 2026-05-21
    updated:
      - 'border.primary lightened to neutral.350 across all 14 light themes'
      - 'border.channel.primary / secondary / tertiary shifted to lighter ramp steps (.350 / .250 / .150) in all 13 channel light themes'
      - 'Money theme: border.channel.* and icon.channel.* corrected from ramp.business to ramp.money'

  figma_only_notes:
    - 'Figma variable publish required to propagate border colour changes to all light-mode themes.'
    - 'Money theme channel tokens will visually shift from business-blue to money-green palette.'

  unresolved_questions:
    - token_library_version not yet assigned; assign before publishing release artifacts.
    - Figma variable publish required to propagate changes to consumers.

  exclusions:
    - No UI Kit component changes in this release.
    - border.secondary and border.tertiary values unchanged (already at target steps); description-only update.
    - Dark mode border.channel.* step values unchanged; only money ramp reference corrected in dark mode.
    - interactive.chip.channel.primary.on.text.default intentionally retains ramp.neutral.50 (white on filled chip); not a cross-ramp bug.
```

```yaml
release:
  release_id: 2026-05-21-r2
  release_date: 2026-05-21
  token_library_version: tbd
  ui_kit_release_date: tbd

  figma_urls:
    token_library: tbd
    ui_kit: tbd

  source_window:
    since: 2026-05-21
    until: 2026-05-21

  source_commits:
    - sha: c2e4eff5
      summary: 'fix(tokens): update UK channel base colour to #407196 for improved dark-mode ramp saturation'
      affects: token-library

  token_changes:
    added: []
    removed: []
    updated:
      - id: tok-001
        token: foundation.product.channel.uk
        domain: token-library
        change_type: updated
        layer: foundation
        before: '#556D7F'
        after: '#407196'
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: true
        audience_relevance:
          designers: high
          developers: low
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: 'UK channel base colour updated to a more saturated blue (#407196) to prevent ramp steps from becoming too grey in dark mode.'
        summary_agent: >
          foundation.product.channel.uk base colour changed from #556D7F (muted grey-blue) to
          #407196 (more saturated blue). The previous value produced insufficiently saturated
          dark-mode ramp steps at higher stops (e.g. ramp.uk.650+), causing colours to read
          as grey rather than distinctly blue. The new base retains the UK brand hue direction
          while providing better saturation retention across the full ramp in dark mode.
          All 20 ramp.uk steps (50–1000) in light/ channels are derived from this foundation
          value via lighten/darken modifiers; all are regenerated by this change.
          Resolved CSS values at key light-mode steps: ramp.uk.150=#f1f4f7,
          ramp.uk.250=#dee6ed, ramp.uk.350=#bdcdda, ramp.uk.500=#83a2ba, ramp.uk.650=#4f7c9e.
        figma_impact: >
          All UK channel token variables will resolve to slightly different hues across
          the full ramp. Designers using UK theme tokens will see a more distinctly blue
          palette rather than the previous grey-blue tint, particularly noticeable in
          mid-to-dark ramp steps. Figma variable publish required to propagate to consumers.

  component_changes:
    added: []
    removed: []
    updated: []

  token_library_figma_changelog_entry:
    version: tbd
    date: 2026-05-21
    updated:
      - 'UK channel base colour updated from #556D7F to #407196 — improved saturation across the full ramp, particularly for dark-mode steps'

  figma_only_notes:
    - 'Figma variable publish required to propagate UK ramp changes to all UK-themed components.'

  unresolved_questions:
    - token_library_version not yet assigned; assign before publishing release artifacts.
    - Figma variable publish required to propagate ramp changes to consumers.

  exclusions:
    - No UI Kit component changes in this release.
    - ramp colour space remains p3 (no change to modifier space); only the foundation base hex value is updated.
    - Dark mode ramp steps are derived from the same foundation value; all regenerated automatically by build.
```

```yaml
release:
  status: draft
  release_id: 2026-05-21-r3
  release_date: 2026-05-21
  token_library_version: tbd
  ui_kit_release_date: N/A

  figma_urls:
    token_library: https://www.figma.com/design/YOUR-FIGMA-FILE-KEY/Token-Library---Design-System?node-id=2640-1460&t=eDwKChvIDttgWiD8-1
    ui_kit: N/A

  source_window:
    since: 2026-05-21
    until: 2026-05-21

  source_commits:
    - sha: 1b51bc34
      summary: 'fix(tokens): update dark-mode callout flag tokens — shift fill to error.600 and align icon to fill'
      affects: token-library

  token_changes:
    added: []
    removed: []
    updated:
      - id: tok-001
        token: flag.callout.fill (dark mode, all 14 theme sets)
        domain: token-library
        change_type: updated
        layer: semantic
        before: '{ramp.messaging.error.350}'
        after: '{ramp.messaging.error.600}'
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: true
        audience_relevance:
          designers: high
          developers: medium
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: >
          Dark mode LIVE Flag background shifted from error.350 (#BA0B05) to error.600 (#FF3933) —
          brighter, more saturated red in dark mode across all 14 theme sets.
        summary_agent: >
          flag.callout.fill.value changed from {ramp.messaging.error.350} to {ramp.messaging.error.600}
          in all 14 dark token sets: dark/ core, comment, lifeAndStyle, puzzles, home, uk, world,
          business, money, sport, travel, culture, obituaries, ireland.
          Resolved dark hex: #BA0B05 → #FF3933 (source: resolved-hexes.json).
          Light mode flag.callout.fill ({ramp.messaging.error.850}) is unchanged.
          label.callout already aliases flag.callout.fill in all dark sets — no structural change required.
        figma_impact: >
          LIVE Flag background resolves to a vivid red (#FF3933) in all dark-mode themes,
          replacing the near-black maroon (#BA0B05). Figma variable publish required to propagate.

      - id: tok-002
        token: flag.callout.icon (dark mode, all 14 theme sets)
        domain: token-library
        change_type: updated
        layer: semantic
        before: '{flag.callout.text}'
        after: '{flag.callout.fill}'
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: true
        audience_relevance:
          designers: high
          developers: medium
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: >
          Dark mode LIVE Flag icon now aliases fill (#FF3933) rather than text (white),
          aligning icon colour with the flag fill across all 14 dark theme sets.
        summary_agent: >
          flag.callout.icon.value changed from {flag.callout.text} to {flag.callout.fill}
          in all 14 dark token sets. Previously the icon inherited the text colour
          ({ramp.neutral.1000} = white in dark mode); it now resolves through flag.callout.fill
          → {ramp.messaging.error.600} → #FF3933. Light mode icon alias ({flag.callout.text})
          is unchanged.
        figma_impact: >
          LIVE Flag icon colour changes from white to red (#FF3933) in all dark-mode themes.
          Figma variable publish required to propagate.

  component_changes:
    added: []
    removed: []
    updated: []

  token_library_figma_changelog_entry:
    version: tbd
    date: 2026-05-21
    updated:
      - 'Dark mode LIVE Flag: flag.callout.fill shifted from error.350 to error.600 (#BA0B05 → #FF3933) across all 14 dark themes'
      - 'Dark mode LIVE Flag: flag.callout.icon now aliases fill (red) instead of text (white) across all 14 dark themes'

  figma_only_notes:
    - 'Figma variable publish required to propagate callout fill and icon colour changes to all dark-mode themes.'
    - 'label.callout was already aliasing flag.callout.fill in all dark sets — no Figma variable change required for label.callout.'

  unresolved_questions:
    - token_library_version not yet assigned; assign before publishing release artifacts.
    - resolved-hexes.json sync with Figma variables is PENDING — Desktop Bridge was not reachable at time of change.
      Sync required especially for updated UK ramp colours (see 2026-05-21-r2). Run sync before next Figma publish.
    - Figma variable publish required to propagate callout changes to dark-mode consumers.

  exclusions:
    - No UI Kit component changes in this release.
    - Light mode flag.callout.* tokens unchanged.
    - label.callout: already {flag.callout.fill} in all dark sets; confirmed no edit required.
```

```yaml
release:
  status: draft
  release_id: 2026-05-22-r1
  release_date: 2026-05-22
  token_library_version: tbd
  ui_kit_release_date: tbd

  figma_urls:
    token_library: tbd
    ui_kit: tbd

  source_window:
    since: 2026-05-21
    until: 2026-05-22

  source_commits:
    - sha: 46e96cd9
      summary: 'made update to brand.caption — split into medium (0.875rem) and small (0.75rem) sizes'
      affects: token-library

  token_changes:
    added:
      - id: tok-001
        token: brand.caption.small
        domain: token-library
        change_type: added
        layer: foundation
        before: N/A
        after: >
          New typography token: fontFamily040, fontWeight040, fontSize010 (0.75rem / 12px),
          fontLineHeight040. Description: "Image caption text, compact. Use figcaption or span."
        breaking: false
        migration_required: false
        migration_note: N/A
        figma_visible: true
        audience_relevance:
          designers: high
          developers: high
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: Added brand.caption.small — compact caption style at 0.75rem (12px) for inline images and space-constrained contexts.
        summary_agent: >
          brand.caption.small introduced as a sibling to brand.caption.medium in the brand typography set.
          Value: fontFamily={fontFamily040}, fontWeight={fontWeight040}, fontSize={fontSize010} (0.75rem),
          lineHeight={fontLineHeight040}. Description updated by content agent for specificity.
        figma_impact: Designers can now select brand.caption.small in the Figma variable picker for compact caption usage.

    removed: []

    updated:
      - id: tok-002
        token: brand.caption → brand.caption.medium
        domain: token-library
        change_type: updated
        layer: foundation
        before: >
          Flat token brand.caption: fontFamily040, fontWeight040, fontSize020 (0.875rem),
          fontLineHeight040. Description: "Image or media caption. Use figcaption or span."
        after: >
          Scoped token brand.caption.medium: same typographic values as before.
          Description updated to: "Image caption text, standard size. Use figcaption or span."
        breaking: true
        migration_required: true
        migration_note: >
          Replace brand.caption with brand.caption.medium to preserve the existing 0.875rem (14px)
          caption size. Or adopt brand.caption.small for the new 0.75rem (12px) compact variant.
        figma_visible: true
        audience_relevance:
          designers: high
          developers: high
          product: low
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: true
          token_library_figma_changelog: true
        summary_human: brand.caption renamed to brand.caption.medium. Typographic values unchanged (0.875rem). Description updated for clarity.
        summary_agent: >
          brand.caption was a flat single-size token. It has been restructured as brand.caption.medium
          under a caption group alongside the new brand.caption.small. The fontSize020 (0.875rem) value
          and fontLineHeight040 are preserved in brand.caption.medium. The description changed from
          "Image or media caption. Use figcaption or span." to
          "Image caption text, standard size. Use figcaption or span." (content agent, 2026-05-22).
        figma_impact: >
          brand.caption variable path changes from brand/caption to brand/caption/medium.
          Existing Figma bindings to brand.caption will need remapping to brand.caption.medium.
          Figma variable publish required to propagate new scoped path.

  component_changes:
    added: []
    removed: []
    updated: []

  token_library_figma_changelog_entry:
    version: tbd
    date: 2026-05-22
    added:
      - 'Added brand.caption.small — compact caption style at 0.75rem (12px).'
    updated:
      - 'brand.caption renamed to brand.caption.medium (values unchanged, path scoped).'
    removed: []

  figma_only_notes:
    - 'brand.caption variable path changes to brand/caption/medium — existing Figma bindings require remapping.'
    - 'Figma variable publish required to surface brand.caption.small and brand.caption.medium in the variable picker.'

  unresolved_questions:
    - token_library_version not yet assigned; assign before publishing release artifacts.
    - Figma variable publish required to propagate scoped caption path and new small variant to consumers.

  exclusions:
    - No color semantic token changes in this release.
    - No UI Kit component changes in this release.
    - Description-only update to brand.caption.medium is excluded from breaking change messaging (value unchanged).
```
