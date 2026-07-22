# Working with Design Systems in Figma

> Part of the [figma-use skill](../../SKILL.md). Key concepts, processes, and guidelines for working with design systems in Figma.
>
> Source: https://github.com/figma/mcp-server-guide/tree/main/skills/figma-use/references/working-with-design-systems

## Overview

When working with design systems in Figma, there are many nuances when deciding how to do the right thing. Figma's model for patterns is form-agnostic — this is one of its strengths, allowing teams to refer to a pattern in a spec that may take distinct forms in different codebases. However, this can result in complex procedures and nuances when translating something to Figma and back.

Figma has:

- **Components** — the building blocks of UI, combined into component sets with variants
- **Variables** (tokens) — single values: number, string, color, boolean
- **Text Styles** — composite typographic settings applied to text nodes
- **Effect Styles** — composite shadow/blur settings applied to nodes
- **Prototyping actions** — interactions and transitions

## Things to Remember

Not everyone asking you to do something knows what they should be doing. You must figure out if the request is to:

- Generically perform design systems actions
- Uphold the existing rules codified in Figma or in the codebase
- Demonstrate an idea
- Enforce existing guidelines

Not every environment has the same degree of maturity. Something as simple as creating a component could be very elementary or very sophisticated depending on the environment.

**Make good judgement** — do whatever is the smartest thing in the environment you are in. For exploration tasks, reasonable defaults are fine. For production environments matching an existing codebase, match the codebase precisely.

## Things You Might Be Asked to Do

- **Create patterns in Figma that match patterns in code**
  - Create variables based on a stylesheet, JSON format, or other token definition
  - Create text styles that match a defined type hierarchy
  - Create components based on existing code components
- **Sync between code and design forms**
  - Ensure Figma's concepts match a production form
- **Use an existing Figma design library to create something**
  - Build something matching an existing code form, image, or prompt
- **Clean up a design to match a code pattern**

## Design System Paradigms

### Components

See [component-patterns.md](../component-patterns.md) for API patterns. For design system context on when to use variants vs component properties, see [wwds-components.md](wwds-components.md) (if available).

Key considerations:

- How many variants are needed? Can component properties replace some variants?
- Does an existing component need to be updated or a new one created?
- Match existing naming conventions in the file.

### Variables (Tokens)

See [variable-patterns.md](../variable-patterns.md) for API patterns and [wwds-variables.md](wwds-variables.md) for design system context.

Key considerations:

- Are there existing variables in the file that should be used/extended?
- What is the token architecture? (flat, 2-tier primitives+semantics, 3-tier Foundation→Palette→Semantic for this system)
- What scopes are appropriate for each variable?
- Does the team's plan support the number of modes needed?

### Text Styles

See [text-style-patterns.md](../text-style-patterns.md) for API patterns.

Key considerations:

- Text styles are composite — they can't be stored as variables.
- `setBoundVariable` on `TextStyle` is not supported in headless; set raw values.
- Always probe font style names before hardcoding.

### Effect Styles

See [effect-style-patterns.md](../effect-style-patterns.md) for API patterns.

Key considerations:

- Shadows can't be stored as variables — use effect styles.
- Variable color/radius bindings on individual shadow layers ARE supported via `setBoundVariableForEffect`.

## Design System Specific

When working in the Design System Figma file:

- **Token architecture**: Foundation → Palette → Semantic (3-layer). Semantic tokens alias Palette, never Foundation.
- **Dark mode neutral ramp reversal**: `neutral.50` = white in light mode, `neutral.1000` = white in dark mode. Always verify with `hex_lookup` MCP tool.
- **Variable naming**: follows CSS variable naming with slash grouping (e.g. `color/background/default`).
- **Code syntax**: set `WEB` to the CSS variable (e.g. `var(--color-bg-default)`).
- **Token discovery**: use the Token MCP (`search_tokens`, `token_lookup`, `ramp_lookup`) before writing any variables.
- **Governance**: palette and foundation layer changes require explicit approval.
