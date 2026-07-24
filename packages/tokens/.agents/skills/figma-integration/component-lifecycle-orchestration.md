---
name: component-lifecycle-orchestration
description: Mandatory orchestration workflow for Figma Executor when asked to MAKE or UPDATE components, including VS Code question gates, semver classification, multi-agent delegation, and release communications.
license: MIT
metadata:
  category: figma-integration
  agents: [Architect, Figma Executor, Code, React Expert, Testing]
  autonomy: autonomous
  trigger: make-component, update-component
---

# Component Lifecycle Orchestration

## Purpose

Provide one mandatory sequence for all component MAKE/UPDATE requests so execution is predictable across Figma, code, docs, testing, and release communication.

## Critical Rules

1. NEVER add comments in Figma as part of execution (including status notes, progress notes, or release notes).
2. Complete requested updates by direct mutation and verification only.
3. Treat "Figma doc" as "Figma specs" (summary + properties + version + design-only changelog).
4. For Figma specs/changelog tasks, always execute through Figma Executor, even if another agent receives the prompt first.
5. Use instance-level overrides in local file instances; do not directly edit main component definitions.
6. Full changelog history belongs in component docs (`<component>-changelog.md`) and Storybook; Figma specs changelog remains concise and design-only.
7. For specs sections such as Guidelines and Changelog, clone canonical section structures from an approved reference (for example Button/Flag) before editing copy.
8. Never handcraft specs layout primitives when a canonical section pattern already exists in-file.
9. Container-fit parity is mandatory: inserted sections must match sibling x-offset and width inside the target content frame.
10. Duplicate prevention is mandatory: exactly one direct Guidelines block and one direct Changelog block are allowed in the target specs stack.
11. Canonical component-spec template source of truth is fixed to Figma node `283:34812` in `UI-Kit---Design-System` unless the user explicitly announces an updated template.
12. For component specs work, clone from the source-of-truth template first; do not infer format from other component pages.
13. Template registry section is fixed to Figma node `827:352780` (`FIgma spec templates`) and is the canonical in-file index for template usage notes.
14. For Messaging Framework specs (banner, inline message, toast, tooltip), follow source node `650:853` and use DO/DON'T copy format from component set `277:8335`.
15. DO/DON'T copy format is mandatory for Messaging Framework specs: prefix each line with `✅ DO:` or `❌ DONT:`.
16. Template registry references for DO/DON'T guidance are pointer/index aids only; avoid maintaining duplicate live instances next to the source component set.

## Mandatory Question Gates (VS Code askQuestions only)

Before any extraction or mutation, ask all required gates using `vscode_askQuestions`:

1. Desktop Bridge status (Running now / Not running / Not sure)
2. Change intent (make new / update existing)
3. If removing or changing behavior: reason for the change
4. Target Figma component link (required if not provided)
5. Target Figma documentation link (required if not provided)
6. Execution mode (plan-only vs execute-now)
7. Semver decision checkpoint (or propose one)

Rule: if a Figma URL is present in the initial prompt, ask Desktop Bridge status immediately and wait for response.

## Semver Contract

Use semver.org classification:

- Patch: no public API/contract break, bug fix only
- Minor: backwards-compatible feature additions
- Major: backwards-incompatible contract changes
- Beta pre-release: when release train is beta and team accepts breaking updates in beta

If there is a removal, the agent must ask for reason and then propose major or beta pre-release with explicit migration guidance.

## Orchestration Sequence

1. Scope

- Confirm component, platform surface, and expected artifacts.

1. Architecture Check (Architect)

- Validate layer impact and governance constraints.
- If token impact exists, verify Foundation -> Palette -> Semantic boundaries.

1. Design Extraction (Figma Executor)

- Verify Figma readiness and mode.
- Extract component structure and variant/property map.
- If task includes specs documentation, extract source-of-truth template structure from node `283:34812` and lock it as baseline before mutation.
- Confirm the task is represented in template registry section `827:352780` before claiming completion for a new specs workflow.

1. Implementation (Code + React Expert)

- Update React/component code and Storybook controls/stories.
- Update component documentation contract and changelog entries.

1. Design Update (Figma Executor)

- Apply component and documentation updates in Figma.
- Perform screenshot validation loop (max 3 iterations).
- For changelog stacks, prefer a single auto-layout container with `itemSpacing=0` and two visible entries: `current` then `previous`.
- Changelog labels must be strict uppercase: `ADDED`, `UPDATED`, `REMOVED`.
- Hide empty sections (for example if previous has only ADDED, hide UPDATED/REMOVED and remove empty bullets).
- Version display must be plain semver without prefix (for example `2.0.0`, never `v2.0.0`).
- Author metadata is optional and should be omitted unless explicitly requested.
- Run a specs parity check before completion:
  - validate source template lock (template node `283:34812` used),
  - validate section source pattern (reference clone id/name),
  - validate width/x parity vs sibling content blocks,
  - validate no duplicate Guidelines/Changelog direct children,
  - validate section order in the docs stack.

1. Validation (Testing)

- Run visual regression and relevant tests.
- Produce pass/fail with drift evidence.

1. Release Communications (Code)

- Update release changelog.
- Add Slack announcement artifact.
- Add Figma publish message artifact.

1. Git Completion (Code)

- Commit with conventional messages.
- Push/merge only if user approved in question gate.

## Design Tokens MCP Usage

For token-aware component updates:

1. `search_tokens` for intent-first discovery
2. `token_lookup` to confirm exact path/value
3. `dependency_graph` to assess blast radius
4. `audit_design_system` or `contrast_check` when color/contrast risk exists

Never treat aliases as visual truth when direct Figma variable resolution is available.

## Required Outputs

Every MAKE/UPDATE run must provide:

1. Implementation summary
2. Semver decision and rationale
3. Migration notes (if breaking)
4. Test and visual regression results
5. Storybook link
6. Commit and push status
7. Release communication file paths

## Failure Handling

If any required input is missing (for example Figma doc link), pause and ask via `vscode_askQuestions`.
If Desktop Bridge is unavailable for design mutation, continue with code/docs and mark Figma update as blocked with exact unblock steps.

## Figma Completion Criteria (Mandatory)

For any request that says "update Figma doc/component" (or equivalent), completion can be claimed only when all checks pass:

1. Mutation executed on the target node(s) (not just a comment posted).
2. Structural verification proves the requested change (for example removed node no longer exists, or variant list excludes removed intent).
3. Post-mutation screenshot captured from the updated target area.
4. Final response includes evidence:

- target URL + node ID,
- mutation action taken,
- verification result,
- screenshot reference.

Rule: posting a Figma comment is communication only, never a substitute for mutation when the user asked for a visual/content update.

1. Specs frame naming: verify frame is named `[ComponentName] - Specifications` exactly.
2. Layout parity verification confirms inserted docs sections fit the local container context (not just reference absolute dimensions).
3. Duplicate cleanup verification confirms no retry artifacts remain (for example extra Guideline/Changelog frames).

## Blocked-State Response Contract

If mutation is blocked (Desktop Bridge disconnected, permissions, runtime errors):

1. Do not claim "fixed" or "updated".
2. Return exact blocker error text.
3. Return what was verified read-only (for example node still present at specific ID).
4. Provide one immediate unblock step and wait for user confirmation before retrying.

## Source-of-Truth Template

- Figma URL: [UI Kit Specs Template](https://www.figma.com/design/hcCXq9ObSEBdXtwROtBSNc/UI-Kit---Design-System?node-id=283-34812&t=y8xBFkUke5eq5zJH-1)
- MCP node id: `283:34812`
- Template registry section: [Figma spec templates](https://www.figma.com/design/hcCXq9ObSEBdXtwROtBSNc/UI-Kit---Design-System?node-id=827-352780)
- DO/DON'T style source: [Messaging guidelines component set](https://www.figma.com/design/hcCXq9ObSEBdXtwROtBSNc/UI-Kit---Design-System?node-id=277-8335)
- DO/DON'T registry pointer: [Standards reference pointer block](https://www.figma.com/design/hcCXq9ObSEBdXtwROtBSNc/UI-Kit---Design-System?node-id=827-425545)
- Messaging Framework source: [Messaging Framework section](https://www.figma.com/design/hcCXq9ObSEBdXtwROtBSNc/UI-Kit---Design-System?node-id=650-853)
- Policy:
  - Always use this template for component specs composition.
  - If template appears stale or unavailable, pause and ask user for instruction instead of falling back silently.
  - When user announces a new template, update this skill first, then proceed with specs work.
