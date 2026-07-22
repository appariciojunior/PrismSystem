# Release Workflow - Design System

This folder is the canonical home for release artifacts and templates.

## Primary Objective

Use one agent-first source document to generate all human-facing release outputs with consistent scope and structure.

## How Release Work Starts

Release work starts from plain human language in chat, not command syntax.

Examples:

- "We will release this week."
- "We will release tomorrow."
- "We will release today."
- "Let's release."
- "Run the release protocol."
- "Run the release cycle."

Interpretation:

- Timing language means prepare or draft the current release package.
- Action language means execute the approved release workflow.
- If versions or scope are missing, draft first and confirm what is needed before generating artifacts.

## Canonical Artifacts (7)

1. Master changelog (agent source of truth)
2. UI Kit Slack announcement
3. UI Kit Figma publish message
4. Token Library Slack announcement
5. Token Library Figma publish message
6. Token Library Figma changelog entry
7. This README (workflow + wayfinding)

## File Map

- MASTER source:
  - packages/tokens/release/changelog.md
- Templates:
  - packages/tokens/release/templates/MASTER_CHANGELOG_ENTRY_TEMPLATE.md
  - packages/tokens/release/templates/UI_KIT_SLACK_TEMPLATE.md
  - packages/tokens/release/templates/UI_KIT_FIGMA_PUBLISH_TEMPLATE.md
  - packages/tokens/release/templates/TOKEN_LIBRARY_SLACK_TEMPLATE.md
  - packages/tokens/release/templates/TOKEN_LIBRARY_FIGMA_PUBLISH_TEMPLATE.md
  - packages/tokens/release/templates/TOKEN_LIBRARY_FIGMA_CHANGELOG_ENTRY_TEMPLATE.md
- Outputs:
  - packages/tokens/release/ui-kit/slack-announcements/
  - packages/tokens/release/ui-kit/figma-publish/
  - packages/tokens/release/token-library/slack-announcements/
  - packages/tokens/release/token-library/figma-publish/
  - Token Library Figma changelog entry is copied into the Figma changelog frame in the Token Library file.
- Historical archives:
  - packages/tokens/release/token-library/CHANGELOG.md
  - packages/tokens/release/ui-kit/CHANGELOG.md

`packages/tokens/release/changelog.md` is the only canonical changelog source for new release authoring. Per-library `CHANGELOG.md` files are historical archives only.

## Non-Negotiable Scope Rules

### Figma Document Mutation Rule (Critical)

- During release work, only artifact #6 (Token Library Figma changelog entry) mutates a Figma document.
- Artifacts #2, #3, #4, and #5 are generated as repo files/messages and do not directly edit any Figma document.

### Master changelog (agent source)

- Extremely detailed and machine-friendly.
- Can include technical details, before/after mappings, migration specifics.
- Drives every other artifact.

### Changelog inclusion rule

- Add a changelog entry when a change is release-relevant and user-visible enough to belong in one or more release artifacts.
- This includes local work, remote commits, manual Figma work, and release-relevant updates described in chat.
- Do not include agent maintenance, workflow-only cleanup, internal refactors with no consumer-visible change, or exploratory work that is not shipping.
- If it is unclear whether something should be included or excluded, the agent must ask explicitly using `vscode_askQuestions` before finalizing the release block.

### UI Kit Slack

- UI Kit component updates only.
- Audience: designers, developers, product owners.
- Markdown format.
- No emojis.
- Must include UI Kit Figma link at top.
- Must include library attach/update instructions at bottom.
- UI Kit is not versioned as a product; components are versioned.

### UI Kit Figma publish

- Figma design updates only.
- Include breaking changes, additions, and updates relevant inside Figma.
- Emojis are allowed in bullets.

### Token Library Slack

- Token updates only.
- Audience: designers, developers, product owners.
- Markdown format.
- No emojis.
- Must include Token Library Figma link at top.
- Must include library attach/update instructions at bottom.
- Token Library is versioned.

### Token Library Figma publish

- Figma design/token updates only.
- Include breaking changes, additions, and updates.
- Emojis are allowed in bullets.

### Token Library Figma changelog entry

- Add a new version block below the previous entry in Figma changelog.
- Align with the same release content grouping.
- This is the only release artifact that performs a direct Figma doc update.

## Section Format Rule for Human Docs

For every human-readable artifact (all except master changelog), always use:

- Added
- Removed
- Updated

Each section must contain bullet points. Empty sections should be omitted only if there are truly no items.

## Agent Execution Model

### Ownership

- Architect: interpret release intent, define scope, decide changelog inclusion strategy, and resolve ambiguous cases.
- Code: update `changelog.md`, generate artifacts #2-#5, update workflow docs, and migrate historical release docs.
- Testing: validate repository artifacts before and after Figma work.
- Figma Executor: apply artifact #6 only, with before/after evidence.
- React Expert: only used if release work uncovers component parity work outside normal release artifact generation.

### Default Sequence

1. Architect intake and scope lock.
2. Architect changelog blueprint.
3. Code authors `changelog.md` and generates repo artifacts.
4. Testing validates repo artifacts.
5. Figma Executor applies Token Library Figma changelog entry.
6. Testing performs final publish gate.

### Ambiguity Protocol

If release context is incomplete, the agent must not guess.

Use `vscode_askQuestions` when:

- a remote commit may or may not belong in the release,
- a manual Figma change may or may not be release-worthy,
- a docs change may contain migration guidance but not a shipping surface change,
- a local change exists but may belong to a different release window.

Preferred question:

- Header: `changelog_entry_decision`
- Prompt: `Should this change be included as a changelog entry for the current release?`
- Options: `Include`, `Exclude`, `Not sure - discuss`
- `allowFreeformInput: true`

## Generation Order

1. Architect interprets release intent and locks scope.
2. Architect drafts or approves the release block structure for `changelog.md`.
3. Code creates or updates the master entry in `changelog.md` using the master entry template.
4. Code generates UI Kit Slack from `UI_KIT_SLACK_TEMPLATE.md`.
5. Code generates UI Kit Figma publish from `UI_KIT_FIGMA_PUBLISH_TEMPLATE.md`.
6. Code generates Token Library Slack from `TOKEN_LIBRARY_SLACK_TEMPLATE.md`.
7. Code generates Token Library Figma publish from `TOKEN_LIBRARY_FIGMA_PUBLISH_TEMPLATE.md`.
8. Testing validates repo artifacts.
9. Figma Executor generates and applies Token Library Figma changelog entry from `TOKEN_LIBRARY_FIGMA_CHANGELOG_ENTRY_TEMPLATE.md`.
10. Testing performs final release-ready validation.
11. Save outputs to dated/versioned folders.

## Historical Release Migration

- Historical docs under `packages/tokens/release` should be migrated onto the same applicable template structure used for current releases.
- Preserve original release meaning, facts, and dates.
- Re-shape structure only where needed to match current template contracts.
- Prioritize latest/high-value releases first.
- Validate each migrated file before moving to the next wave.

## Template-Driven Change Policy

To change release style in future:

1. Update template file(s) in packages/tokens/release/templates/.
2. Regenerate outputs for current release.
3. Historical artifacts may be re-shaped when explicitly migrating them to the current template structure.

This ensures one source template change trickles down to future releases.

## Quick Validation Checklist

- All 7 artifacts accounted for.
- Human docs grouped under Added/Removed/Updated bullets.
- UI Kit Slack and Token Library Slack have no emojis.
- Slack docs include required Figma link at top.
- Slack docs include attach/update instructions at bottom.
- UI Kit outputs mention component versions, not a UI Kit product version.
- Token Library version is consistent across Token Library artifacts.
- Historical docs in migration scope match the applicable current template structure.
