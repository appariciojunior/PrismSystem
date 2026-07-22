---
name: component-scaffold
description: Scaffold a new DS React component from a completed handoff packet. Creates the component file, CSS, story, docs MDX and changelog stub. Never invents - every prop, variant and token traces to the upstream SPEC.md and STATE_MATRIX.md. Never overwrites existing files. Requires-approval autonomy.
license: MIT
metadata:
  category: design/handoff
  pillar: handoff
  agents: [Design Engineer, Code, Architect]
  autonomy: requires-approval
  portable: true
  cadence: weekly
---

# Component Scaffold

## Purpose

After a design has been spec'd and packed via Phase 1-3 skills, this skill creates the engineering scaffold. It writes seven files in a structure that matches the existing DS component conventions:

```
packages/components-react/src/<ComponentName>/<ComponentName>.tsx
packages/components-react/src/<ComponentName>/styles.css
packages/components-react/src/<ComponentName>/__tests__/<ComponentName>.test.tsx
stories/components/<ComponentName>.stories.tsx
stories/components/<ComponentName>.docs.mdx
packages/tokens/docs/components/<componentname>/<ComponentName>.md
packages/tokens/docs/components/<componentname>/<componentname>-changelog.md
```

The scaffold is *minimal but compilable*. It does not implement business logic. It does not invent props that are not in the spec. Every variant and state from `STATE_MATRIX.md` becomes a Storybook story. Every token from `TOKEN_AUDIT.md` becomes a CSS variable reference.

This is the first skill in the suite that writes code. It is `requires-approval` and never overwrites.

## Preconditions

1. A completed `.design/<feature>/` folder exists with at least:
   * `SPEC.md` from `handoff/frame-to-spec.md`
   * `STATE_MATRIX.md` from `ui/state-matrix.md`
   * `TOKEN_AUDIT_LIGHT.md` from `ui/token-mapping-audit.md`
2. The component name does not collide with an existing component in `packages/components-react/src/`. If it does, abort with a clear message.
3. The Figma frame's tokens are all mapped (zero unmapped values, or unmapped values explicitly waived in the spec's Open Questions). Scaffolding against unmapped values would produce CSS with invented variable names.
4. `packages/tokens/docs/components/<componentname>/` directory exists or can be created.

## Inputs

Required:

* `feature_name` — the `.design/<feature>/` folder name to read artefacts from.
* `component_name` — PascalCase name for the new component (e.g. `CommentsModal`).

Optional:

* `kebab_name` — kebab-case alias for CSS classes and docs folder name. Defaults to a kebab-case conversion of `component_name`.
* `with_icons` — boolean, default false. When true, `Icon` is imported from `@ds/icons` and the component supports `iconLeft`/`iconRight` props if the spec defines them.
* `dry_run` — boolean, default true on first run. When true, the skill writes nothing and prints a diff of every file it would create. The human reviews, then re-runs with `dry_run: false`.

## Procedure

### Step 1: Verify preconditions

1. Confirm `.design/<feature_name>/` exists and contains SPEC.md, STATE_MATRIX.md, TOKEN_AUDIT_LIGHT.md.
2. Check `packages/components-react/src/<component_name>/` does not exist. If it does, stop. The skill scaffolds new components only.
3. Check `stories/components/<component_name>.stories.tsx` does not exist.
4. Check `packages/tokens/docs/components/<kebab_name>/` does not exist.
5. Check token audit reports zero unmapped values, or that the SPEC explicitly waives them in Open Questions.

If any check fails, list every blocker and stop.

### Step 2: Parse the spec

Read the SPEC.md and extract:

* The Public API table → the TypeScript prop interface.
* The Layout section → the JSX structure outline.
* The Tokens used table → the CSS variables referenced in styles.css.
* The State matrix table → the props that drive state, and one Storybook story per implemented state.
* The Responsive behaviour section → CSS media queries (using DS viewport tokens).
* The Channel context section (if present) → noted as a CSS variable consumer, not a prop.

Reject the scaffold if any of these sections is missing or marked "needs description".

### Step 3: Generate the component file

Write `packages/components-react/src/<ComponentName>/<ComponentName>.tsx` matching the convention from existing components (see `Button/Button.tsx` for the canonical pattern). The skeleton includes:

* React import.
* CSS import: `import './styles.css';`
* If `with_icons` and the spec uses icons: `import { Icon } from '../Icon/Icon';` and `import { IconName } from '@ds/icons';`
* The `Props` interface, with each prop from the Public API table. Use JSDoc descriptions copied verbatim from the table.
* The default exported functional component, with destructured props matching the interface and defaults pulled from the Default column.
* A JSX tree following the Layout section, with className roots scoped to `ds-<kebab_name>__*`.
* No business logic, no event handlers beyond the prop pass-throughs, no state hooks. If the spec implies state (e.g. controlled vs uncontrolled), insert a `// TODO(scaffold): wire up controlled/uncontrolled pattern, see react/state-management.md` comment.

### Step 4: Generate the CSS

Write `packages/components-react/src/<ComponentName>/styles.css`. One CSS class per JSX element, BEM-style: `.ds-<kebab_name>`, `.ds-<kebab_name>__label`, `.ds-<kebab_name>--<modifier>`.

For every token in TOKEN_AUDIT_LIGHT.md, reference the CSS variable form: `var(--ds-<token-path-as-css-var>)`. Cross-reference the existing CSS variable naming convention by reading `packages/theme-css/src/`.

If a token is unmapped (despite the precondition check), comment out the line and add `/* TODO(scaffold): no token mapped for this value */`. Do not insert a raw hex/px value.

### Step 5: Generate the Storybook story

Write `stories/components/<ComponentName>.stories.tsx` using CSF3. Follow the exact pattern from `Button.stories.tsx`:

* Import the component from the source path.
* Define `defaultArgs` from the Default column of the Public API table.
* Define `buttonFigmaUrl` (or equivalent) from the Figma URL in the spec.
* Define `meta` with title `Components/<ComponentName>`, the component, parameters, and argTypes.
* For each implemented state in STATE_MATRIX.md, generate one `StoryObj` with the args that produce that state.

Story names match the state names exactly (e.g. `Default`, `Hover`, `FocusVisible`, `Active`, `Disabled`, `Loading`, `Error`, `Empty`).

### Step 6: Generate the docs MDX

Write `stories/components/<ComponentName>.docs.mdx` following the existing pattern from `Button.docs.mdx`:

```tsx
import { Canvas, Controls, Markdown, Meta, Stories, Title } from '@storybook/addon-docs/blocks';
import * as <ComponentName>Stories from './<ComponentName>.stories.tsx';
import <componentName>DocRaw from '../../packages/tokens/docs/components/<kebab>/<ComponentName>.md?raw';
import <componentName>ChangelogRaw from '../../packages/tokens/docs/components/<kebab>/<componentName>-changelog.md?raw';
import { getStorybookComponentDoc } from './docs-utils/componentDocContent';

<Meta of={<ComponentName>Stories} />
<Title />
<Canvas of={<ComponentName>Stories.Default} />
<Controls of={<ComponentName>Stories.Default} />
<Markdown>{getStorybookComponentDoc(<componentName>DocRaw, { includePropertiesSection: false, includeMarkdownTables: true })}</Markdown>
<Markdown>{<componentName>ChangelogRaw}</Markdown>
```

### Step 7: Generate the docs Markdown

Write `packages/tokens/docs/components/<kebab>/<ComponentName>.md` using the Design System component documentation template. The template structure is enforced by `storybook/component-documentation-writing.md`. Pull content from SPEC.md sections directly.

### Step 8: Generate the changelog stub

Write `packages/tokens/docs/components/<kebab>/<componentName>-changelog.md` with a single seed entry following the existing format:

```markdown
# <ComponentName> Changelog

Date Published: `<YYYY-MM-DD>`

| Version | Date         | Entry                                  |
| ------- | ------------ | -------------------------------------- |
| `0.1.0` | `<YYYY-MM-DD>` | `ADDED` Initial scaffold from <feature>. |
```

### Step 9: Dry run output or write

If `dry_run: true`, render every file's content to stdout grouped by file path, prefixed with `--- WOULD WRITE: <path> ---`. No writes.

If `dry_run: false`, write all seven files atomically. If any write fails mid-way, roll back the writes that succeeded. Either every file lands or none do.

### Step 10: Render the scaffold report

Write `.design/<feature>/SCAFFOLD.md` summarising what was created, with file paths and a checklist of follow-up work (state hooks, event handlers, tests).

## Output Contract

```markdown
# Component Scaffold — <ComponentName>

> Feature: <feature_name>
> Scaffolded: <ISO timestamp>
> Dry run: <true | false>
> Tokens snapshot: <git sha>

## Files created

| Path | Lines | Purpose |
|---|---|---|
| packages/components-react/src/<ComponentName>/<ComponentName>.tsx | <n> | Component source |
| packages/components-react/src/<ComponentName>/styles.css | <n> | Component styles |
| packages/components-react/src/<ComponentName>/__tests__/<ComponentName>.test.tsx | <n> | Test stub |
| stories/components/<ComponentName>.stories.tsx | <n> | Storybook stories (one per state) |
| stories/components/<ComponentName>.docs.mdx | <n> | Storybook docs |
| packages/tokens/docs/components/<kebab>/<ComponentName>.md | <n> | Component documentation |
| packages/tokens/docs/components/<kebab>/<componentName>-changelog.md | <n> | Changelog seed |

## Follow-up checklist

- [ ] Wire up controlled/uncontrolled patterns where TODO comments mark them
- [ ] Add event handlers per spec (onClick, onChange, etc.)
- [ ] Implement test cases per `react/testing.md`
- [ ] Run `handoff/code-connect-stub.md` to generate the Code Connect entry
- [ ] Run `ui/visual-vs-built.md` once the component renders to verify against Figma
- [ ] Open PR with conventional commit prefix `feat(<kebab>):`

## Stories generated

For each state in STATE_MATRIX.md:

| State | Story name | Args |
|---|---|---|
| default | Default | { ... } |
| hover | Hover | { ..., state: 'hover' } |
| ... | ... | ... |

## Provenance

- Feature folder: .design/<feature>/
- SPEC.md sha: <sha>
- STATE_MATRIX.md sha: <sha>
- TOKEN_AUDIT_LIGHT.md sha: <sha>
- Skill version: <semver>
```

## Error Handling

* **Existing component collision.** Abort with a clear list of colliding file paths. Suggest renaming or using `figma-integration/component-lifecycle-orchestration.md` for UPDATE mode.
* **Unmapped tokens in audit.** Abort. The user must resolve via `ui/token-mapping-audit.md` or explicitly waive in SPEC Open Questions before scaffolding.
* **SPEC.md missing required section.** Abort and list the missing sections. The fix is to re-run frame-to-spec.
* **Partial write failure.** Roll back every file created in this run before reporting. The repo must never be left half-scaffolded.
* **JSDoc / interface generation produces invalid TypeScript.** Abort and dump the offending interface for human review. Do not write the file.

## Composition

* `compose_after`: `handoff/frame-to-spec`, `ui/state-matrix`, `ui/token-mapping-audit`, `ui/channel-context`
* `compose_before`: `handoff/code-connect-stub`, `ui/visual-vs-built`
* `calls`: `react/component-patterns`, `react/typescript-patterns`, `react/hooks-reference`, `storybook/story-writing`, `storybook/component-documentation-writing`, `figma-integration/component-lifecycle-orchestration`

## Related Skills

* `./code-connect-stub.md` — next step after a successful scaffold
* `../ui/visual-vs-built.md` — validates the scaffolded component against the Figma frame
* `../../react/state-management.md` — what to wire up to replace the TODO comments
* `../../react/testing.md` — how to fill in the test stub
* `../../figma-integration/component-lifecycle-orchestration.md` — the broader MAKE/UPDATE pipeline this skill operates within

## Autonomy note

`requires-approval` because it writes seven files into the production source tree. The `dry_run: true` default is the first approval gate. The PR review on the resulting commit is the second.
