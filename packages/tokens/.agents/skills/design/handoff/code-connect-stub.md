---
name: code-connect-stub
description: Generate or update the Figma Code Connect entry for a DS component using the documentUrlSubstitutions in figma.config.json. Maps Figma component properties to React props and produces a .figma.tsx file alongside the component source. Requires-approval autonomy.
license: MIT
metadata:
  category: design/handoff
  pillar: handoff
  agents: [Design Engineer, Code, Architect]
  autonomy: requires-approval
  portable: true
  cadence: weekly
---

# Code Connect Stub

## Purpose

Figma Code Connect lets designers see the real React code for a component directly inside Figma. The link is established via a `.figma.tsx` file that uses `figma.connect()` to map Figma component properties to React props.

This skill generates that file for a newly-scaffolded component (or updates it when a component's API changes). It reads from `figma.config.json` for substitution patterns, from `SPEC.md` for the property mapping, and from the component file produced by `handoff/component-scaffold.md`.

The skill is `requires-approval` because it writes to the source tree.

## Preconditions

1. The component exists at `packages/components-react/src/<ComponentName>/<ComponentName>.tsx`. If not, run `handoff/component-scaffold.md` first.
2. `figma.config.json` contains a `documentUrlSubstitutions` entry for this component (or the user provides the Figma node URL directly).
3. A `SPEC.md` for the feature exists with a Public API section, so the prop mapping is grounded.
4. Code Connect CLI is available in the project (verify via `package.json` dependencies, look for `@figma/code-connect`).

## Known issue (worth surfacing on first run)

`figma.config.json` currently references paths under `packages/react-components/src/`, but the actual source lives under `packages/components-react/src/`. This is a config mismatch and Code Connect will fail until it is reconciled. The skill surfaces this in the report and recommends a one-line fix to `figma.config.json` before proceeding. The skill does not edit `figma.config.json` itself - that is a governance change.

## Inputs

Required:

* `component_name` — PascalCase, e.g. `Button`, `CommentsModal`.
* `feature_name` — the `.design/<feature>/` folder.

Optional:

* `figma_node_url` — explicit override if `documentUrlSubstitutions` does not yet contain an entry for this component.
* `dry_run` — boolean, default true. When true, prints the would-write file content without writing.
* `output_path` — defaults to `packages/components-react/src/<ComponentName>/<ComponentName>.figma.tsx`.

## Procedure

### Step 1: Verify preconditions

1. Confirm component file exists.
2. Read `figma.config.json` and locate the `documentUrlSubstitutions` token for the component (a key like `<FIGMA_BUTTONS_BUTTON>`).
3. If the substitution does not exist and no `figma_node_url` override provided, abort and recommend adding the substitution.
4. If `figma.config.json` includes an incorrect path (e.g. references `packages/react-components/`), surface the issue but continue with the write.

### Step 2: Read the component's prop interface

Parse `<ComponentName>.tsx` and extract:

* The TypeScript interface declaration.
* Each prop name, type, default value, and JSDoc description.
* The component's export shape (named export, default export).

### Step 3: Read the SPEC for the Figma-side mapping

From SPEC.md's Public API table, extract:

* The Figma property names (component properties from the Figma component set).
* The Figma value enums.
* The mapping between Figma property values and React prop values, where they differ in naming (e.g. Figma might say `state=Press`, React `state=active`).

If the SPEC table lacks a "Figma property" column, abort and ask the user to add it. Code Connect cannot guess.

### Step 4: Generate the .figma.tsx file

Produce a `.figma.tsx` file that follows Code Connect convention. Skeleton:

```tsx
import { figma } from '@figma/code-connect';
import { <ComponentName> } from './<ComponentName>';

figma.connect(<ComponentName>, '<FIGMA_*_PLACEHOLDER>', {
  props: {
    // For every Figma component property → React prop mapping
    intent: figma.enum('Intent', {
      'Primary': 'primary',
      'Secondary': 'secondary',
      // ...
    }),
    size: figma.enum('Size', {
      'Small': 'small',
      'Medium': 'medium',
      'Large': 'large',
      // ...
    }),
    label: figma.string('Label'),
    iconLeft: figma.boolean('Has Icon Left'),
    // ... one entry per prop
  },
  example: (props) => <<ComponentName> {...props} />,
});
```

Rules:

* The Figma URL placeholder uses the same `<FIGMA_*>` token form as `figma.config.json` (e.g. `<FIGMA_BUTTONS_BUTTON>`). The Figma CLI resolves the placeholder at runtime via `documentUrlSubstitutions`.
* Every React prop in the interface must appear in the `props` map, or be explicitly noted as "not exposed in Figma" via a comment.
* Default values come from the component interface defaults, not invented.
* `example` renders the component with all props spread; do not add JSX children unless the component requires them.

### Step 5: Write or dry-run

If `dry_run: true`, print the proposed file content.

If `dry_run: false`, write to `output_path`. Do not overwrite an existing `.figma.tsx` file. If one exists, produce a diff for human review and abort the write.

### Step 6: Validate the stub

Run `npx figma connect validate <path>` (or the equivalent CLI invocation in the project) to confirm the stub parses. If validation fails, surface the error and remove the just-written file so the repo is not left with an invalid stub.

### Step 7: Render the report

Write `.design/<feature>/CODE_CONNECT.md` summarising what was written, with the placeholder used, the prop mapping, and any unresolved mappings.

## Output Contract

```markdown
# Code Connect Stub — <ComponentName>

> Feature: <feature_name>
> Generated: <ISO timestamp>
> Dry run: <true | false>
> Placeholder used: <FIGMA_*>
> Figma node URL (resolved): <url>

## Prop mapping

| Figma property | Figma type | React prop | React type | Mapping |
|---|---|---|---|---|
| Intent | enum | intent | 'primary' \| 'secondary' \| ... | enum mapping table |
| Size | enum | size | 'small' \| 'medium' \| 'large' \| 'xlarge' | enum mapping table |
| Label | text | label | string | figma.string |
| Has Icon Left | boolean | iconLeft | IconName \| undefined | figma.boolean (note: lossy mapping) |

## Unresolved mappings

| Figma property | Issue | Suggested action |
|---|---|---|
| ... | ... | ... |

## File written

`packages/components-react/src/<ComponentName>/<ComponentName>.figma.tsx`

## Validation

Command: `npx figma connect validate <path>`
Result: <pass | fail with output>

## Known config issue

If `figma.config.json` references `packages/react-components/` instead of `packages/components-react/`, the Code Connect CLI will not find this file. Recommended fix: update `figma.config.json` to point to the correct package path. This is a separate governance change.

## Provenance

- Component file: packages/components-react/src/<ComponentName>/<ComponentName>.tsx
- SPEC.md sha: <sha>
- figma.config.json sha: <sha>
- Skill version: <semver>
```

## Error Handling

* **No documentUrlSubstitutions entry.** Abort with a clear instruction: "add a `<FIGMA_*_NAME>` entry to figma.config.json for this component, then re-run".
* **SPEC.md Public API missing Figma column.** Abort. The mapping cannot be inferred. The fix is to update the SPEC.
* **Existing .figma.tsx file.** Abort the write, surface the diff for human review.
* **Validation fails.** Remove the file and report the validator's output.
* **Lossy mapping detected.** When a Figma boolean maps to a richer React type (e.g. `Has Icon Left` boolean vs `iconLeft: IconName | undefined`), surface as `warning` and leave a TODO comment in the generated file.

## Composition

* `compose_after`: `handoff/component-scaffold`, `handoff/frame-to-spec`
* `compose_before`: `ui/visual-vs-built`
* `calls`: `figma-integration/figma-console-mcp-integration`, `figma-integration/variable-binding-reference`

## Related Skills

* `./component-scaffold.md` — must run before this skill
* `../ui/visual-vs-built.md` — verifies the connection renders correctly
* `../../figma-integration/figma-make-workflow.md` — the broader Figma-to-React pipeline this slots into

## Autonomy note

`requires-approval` because it writes a new file into the component source tree. The `dry_run: true` default and the CLI validator are the dual gates.
