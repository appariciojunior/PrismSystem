---
name: release-process
description: Execute the full seven-artifact release workflow from master source to Slack/Figma outputs with template-based generation.
license: MIT
metadata:
  category: coordination
  agents: [Architect, Code, Testing, Figma Executor]
  autonomy: requires-approval
  trigger: release-doc-generation
---

# Release Process

## Purpose

Run a deterministic, template-first release process that starts from one master changelog source and generates all required artifacts.

## Required Artifacts (7)

1. Master changelog source entry
2. UI Kit Slack announcement
3. UI Kit Figma publish message
4. Token Library Slack announcement
5. Token Library Figma publish message
6. Token Library Figma changelog entry
7. Release README (workflow and wayfinding)

## Canonical Source

- packages/tokens/release/changelog.md

All human-readable docs must be derived from this source.
`packages/tokens/release/changelog.md` is the only canonical changelog for new release authoring. Per-library `CHANGELOG.md` files under `packages/tokens/release/` are historical archives only.

## Release Initiation

Release work begins from plain human language in chat, not command syntax.

Examples:

- "We will release this week."
- "We will release tomorrow."
- "We will release today."
- "Let's release."
- "Run the release protocol."
- "Run the release cycle."

Interpretation:

- Timing language means prepare or draft the release package.
- Action language means execute the approved release workflow.
- If versions or scope are incomplete, draft the release block first and ask for missing release-defining facts before generating artifacts.

## Template Registry

- packages/tokens/release/templates/MASTER_CHANGELOG_ENTRY_TEMPLATE.md
- packages/tokens/release/templates/UI_KIT_SLACK_TEMPLATE.md
- packages/tokens/release/templates/UI_KIT_FIGMA_PUBLISH_TEMPLATE.md
- packages/tokens/release/templates/TOKEN_LIBRARY_SLACK_TEMPLATE.md
- packages/tokens/release/templates/TOKEN_LIBRARY_FIGMA_PUBLISH_TEMPLATE.md
- packages/tokens/release/templates/TOKEN_LIBRARY_FIGMA_CHANGELOG_ENTRY_TEMPLATE.md

## Mandatory Human-Doc Section Format

For all human-readable outputs (everything except master changelog):

- Added
- Removed
- Updated

Each section must use bullet points.

## Agent Execution Model

### Ownership

- Architect: release intake, scope lock, changelog inclusion decisions, migration wave planning.
- Code: changelog authoring, artifact generation, workflow doc updates, historical file migration.
- Testing: repository QA and final publish gates.
- Figma Executor: Token Library Figma changelog mutation only.
- React Expert: only if release work exposes component parity work outside standard release artifacts.

### Default Sequence

1. Architect intake and scope lock.
2. Architect changelog blueprint.
3. Code authoring and artifact generation.
4. Testing repository QA.
5. Figma Executor applies artifact #6.
6. Testing final publish gate.

### Handoff Requirements

- Architect to Code: approved scope, changelog inclusion decisions, release block shape, do-not-include items.
- Code to Testing: files changed, artifacts generated, historical files migrated, open questions.
- Testing to Figma Executor: approved final Figma changelog text and any ordering/wording risks.
- Figma Executor to Testing: exact Figma mutation and before/after evidence.

## Scope Rules

### Figma Document Mutation Rule (Critical)

- Only Token Library Figma changelog entry (artifact #6) updates a Figma document.
- UI Kit Figma publish and Token Library Figma publish are text artifacts only; they must not mutate Figma docs directly.

### UI Kit docs

- Component updates only (design/Figma relevant).
- UI Kit is not versioned as a product.
- Include component versions.
- Exclude docs, infra, and code-only updates.

### Token Library docs

- Token updates only (design/Figma relevant).
- Token Library is versioned.
- Exclude docs, infra, and code-only updates.

## Slack Rules

- Markdown.
- No emojis.
- Include Figma link at top.
- Include attach/update instructions at bottom.

## Figma Publish Rules

- Figma-focused updates only.
- Emojis allowed in bullets.
- Keep concise and design-centric.
- Include CTA at bottom:
  - Questions or feedback: #ds-support ([Slack channel](https://newscorp.enterprise.slack.com/archives/C09ALD6M7CZ))

## Token Library Figma Changelog Rule

- Add new version entry below previous version.
- Keep Added/Removed/Updated grouping consistent with release source.
- Use plain semver only (never prefix with v).
- Use ISO date format (`YYYY-MM-DD`).
- Use strict uppercase section labels: `ADDED`, `UPDATED`, `REMOVED`.
- Hide/remove empty sections.
- Remove empty bullet rows.
- Author line is optional and omitted by default unless explicitly requested.

## Changelog Entry Rule

- Add a changelog entry when a change is release-relevant and user-visible enough to belong in one or more release artifacts.
- Candidate changes may come from local edits, remote commits, manual Figma work, or release-relevant work described by the user in chat.
- Exclude agent maintenance, workflow-only cleanup, internal refactors with no consumer-visible change, and non-shipping exploratory work.

## Ambiguity Protocol

If release inclusion is unclear, do not guess.

Required behavior:

1. Build a candidate list from local changes, recent commits, prior release docs, and user-described remote/manual work.
2. Flag uncertain items.
3. Use `vscode_askQuestions` before including or excluding any ambiguous item.
4. Wait for user response before finalizing `changelog.md`.

Preferred question:

- Header: `changelog_entry_decision`
- Prompt: `Should this change be included as a changelog entry for the current release?`
- Options: `Include`, `Exclude`, `Not sure - discuss`
- `allowFreeformInput: true`

## Execution Order

1. Architect interprets release intent and locks scope.
2. Architect builds or approves the release block plan.
3. Code adds or updates master source entry for current release.
4. Code generates UI Kit Slack announcement.
5. Code generates UI Kit Figma publish message.
6. Code generates Token Library Slack announcement.
7. Code generates Token Library Figma publish message.
8. Testing validates repository outputs against the quality gate.
9. Figma Executor generates and syncs Token Library Figma changelog entry.
10. Testing validates final parity and publish readiness.

## Historical Release Migration Rule

- Historical docs under `packages/tokens/release` should be migrated onto the same applicable template structure used for current release outputs.
- Preserve release facts, meaning, and version/date semantics.
- Migrate in waves, starting with the most recent releases.
- Validate each migrated file before moving to the next wave.

## Quality Gate

- All required artifacts generated.
- Human docs use Added/Removed/Updated bullets.
- Slack docs have no emojis and include required top/bottom sections.
- UI Kit docs mention component versions, not UI Kit product version.
- Token Library docs use consistent versioning across files.
- Figma changelog entry exists for current Token Library version.
- Historical files changed in the current wave match the applicable current template structure.
