# Master Changelog Entry Template

Use this block inside [packages/tokens/release/changelog.md](packages/tokens/release/changelog.md) for each release.

```yaml
release:
  release_id: { { YYYY-MM-DD-rN } }
  release_date: { { YYYY-MM-DD } }
  token_library_version: { { x.y.z|tbd } }
  ui_kit_release_date: { { YYYY-MM-DD } }

  figma_urls:
    token_library: { { TOKEN_LIBRARY_FIGMA_URL } }
    ui_kit: { { UI_KIT_FIGMA_URL } }

  source_window:
    since: { { PREVIOUS_RELEASE_DATE } }
    until: { { RELEASE_DATE } }

  source_commits:
    - sha: { { COMMIT_SHA } }
      summary: { { ONE_LINE_SUMMARY } }
      affects: { { token-library|ui-kit|both } }

  token_changes:
    added:
      - id: { { tok-001 } }
        token: { { TOKEN_PATH } }
        domain: token-library
        change_type: added
        layer: { { foundation|palette|semantic } }
        before: { { N/A } }
        after: { { VALUE_OR_REFERENCE } }
        breaking: { { true|false } }
        migration_required: { { true|false } }
        migration_note: { { IF_REQUIRED } }
        figma_visible: { { true|false } }
        audience_relevance:
          designers: { { high|medium|low } }
          developers: { { high|medium|low } }
          product: { { high|medium|low } }
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: { { true|false } }
          token_library_figma_changelog: { { true|false } }
        summary_human: { { SHORT_READABLE_LINE } }
        summary_agent: { { FULL_TECHNICAL_DETAIL } }
        figma_impact: { { WHAT_DESIGNERS_SEE } }

    removed:
      - id: { { tok-002 } }
        token: { { TOKEN_PATH } }
        domain: token-library
        change_type: removed
        layer: { { foundation|palette|semantic } }
        before: { { VALUE_OR_REFERENCE } }
        after: { { REMOVED } }
        breaking: { { true|false } }
        migration_required: { { true|false } }
        migration_note: { { REQUIRED_REPLACEMENT } }
        figma_visible: { { true|false } }
        audience_relevance:
          designers: { { high|medium|low } }
          developers: { { high|medium|low } }
          product: { { high|medium|low } }
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: { { true|false } }
          token_library_figma_changelog: { { true|false } }
        summary_human: { { SHORT_READABLE_LINE } }
        summary_agent: { { FULL_TECHNICAL_DETAIL } }
        figma_impact: { { WHAT_BREAKS_OR_DISAPPEARS } }

    updated:
      - id: { { tok-003 } }
        token: { { TOKEN_PATH } }
        domain: token-library
        change_type: updated
        layer: { { foundation|palette|semantic } }
        before: { { VALUE_OR_REFERENCE } }
        after: { { VALUE_OR_REFERENCE } }
        breaking: { { true|false } }
        migration_required: { { true|false } }
        migration_note: { { IF_REQUIRED } }
        figma_visible: { { true|false } }
        audience_relevance:
          designers: { { high|medium|low } }
          developers: { { high|medium|low } }
          product: { { high|medium|low } }
        include_in:
          ui_kit_slack: false
          ui_kit_figma_publish: false
          token_library_slack: true
          token_library_figma_publish: { { true|false } }
          token_library_figma_changelog: { { true|false } }
        summary_human: { { SHORT_READABLE_LINE } }
        summary_agent: { { FULL_TECHNICAL_DETAIL } }
        figma_impact: { { VISUAL_OR_BEHAVIOR_CHANGE } }

  component_changes:
    added:
      - id: { { comp-001 } }
        component: { { COMPONENT_NAME } }
        version: { { COMPONENT_VERSION } }
        domain: ui-kit
        change_type: added
        layer: component-contract
        breaking: false
        migration_required: false
        migration_note: { { N/A } }
        figma_visible: true
        audience_relevance:
          designers: { { high|medium|low } }
          developers: { { high|medium|low } }
          product: { { high|medium|low } }
        include_in:
          ui_kit_slack: true
          ui_kit_figma_publish: true
          token_library_slack: false
          token_library_figma_publish: false
          token_library_figma_changelog: false
        summary_human: { { SHORT_READABLE_LINE } }
        summary_agent: { { FULL_TECHNICAL_DETAIL } }
        figma_impact: { { DESIGN_IMPACT } }

    removed:
      - id: { { comp-002 } }
        component: { { COMPONENT_NAME } }
        version: { { COMPONENT_VERSION } }
        domain: ui-kit
        change_type: removed
        layer: component-contract
        breaking: true
        migration_required: true
        migration_note: { { DESIGN_MIGRATION_PATH } }
        figma_visible: true
        audience_relevance:
          designers: { { high|medium|low } }
          developers: { { high|medium|low } }
          product: { { high|medium|low } }
        include_in:
          ui_kit_slack: true
          ui_kit_figma_publish: true
          token_library_slack: false
          token_library_figma_publish: false
          token_library_figma_changelog: false
        summary_human: { { SHORT_READABLE_LINE } }
        summary_agent: { { FULL_TECHNICAL_DETAIL } }
        figma_impact: { { DESIGN_BREAKING_IMPACT } }

    updated:
      - id: { { comp-003 } }
        component: { { COMPONENT_NAME } }
        version: { { COMPONENT_VERSION } }
        domain: ui-kit
        change_type: updated
        layer: component-contract
        breaking: { { true|false } }
        migration_required: { { true|false } }
        migration_note: { { IF_REQUIRED } }
        figma_visible: true
        audience_relevance:
          designers: { { high|medium|low } }
          developers: { { high|medium|low } }
          product: { { high|medium|low } }
        include_in:
          ui_kit_slack: true
          ui_kit_figma_publish: true
          token_library_slack: false
          token_library_figma_publish: false
          token_library_figma_changelog: false
        summary_human: { { SHORT_READABLE_LINE } }
        summary_agent: { { FULL_TECHNICAL_DETAIL } }
        figma_impact: { { DESIGN_IMPACT } }

  token_library_figma_changelog_entry:
    version: { { TOKEN_LIBRARY_VERSION_OR_TBD } }
    date: { { YYYY-MM-DD } }
    author: { { AUTHOR_IF_EXPLICITLY_REQUESTED_OTHERWISE_OMIT } }
    added:
      - { { TOKEN_LIBRARY_CHANGELOG_ADDED_LINE } }
    updated:
      - { { TOKEN_LIBRARY_CHANGELOG_UPDATED_LINE } }
    removed:
      - { { TOKEN_LIBRARY_CHANGELOG_REMOVED_LINE } }

  figma_only_notes:
    - { { FIGMA_PUBLISH_LINE } }

  unresolved_questions:
    - { { QUESTION_REQUIRING_HUMAN_DECISION } }

  exclusions:
    - { { DOCS_OR_INFRASTRUCTURE_CHANGE } }
```
