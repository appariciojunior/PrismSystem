# Working with Design Systems: Variables

> Part of the [figma-use skill](../../SKILL.md). Design system context for working with variables in Figma.
>
> For API code patterns (creating collections, binding variables, scopes, aliasing), see [variable-patterns.md](../variable-patterns.md).

## Overview

Variables in Figma overlap a lot with the idea of tokens in a codebase, but with some gaps:

- Variables are single-value: number, string, color, boolean.
- **No composite tokens**: you can't put a box shadow behind a single variable. That is an [effect style](../effect-style-patterns.md), but style values can be bound to variables.
- **No type ramp variable**: similarly for a type ramp, you have to use [Text Styles](../text-style-patterns.md).

## Model

### Collections

Collections are groups of variables. An example collection would be "Colors" where there might be a Light and Dark "Mode." Each variable has two values — one per mode.

### Modes

Modes are like light and dark, but teams can specify modes for anything — sizes, languages (string variables), brand themes. Mode limits are plan-dependent: Free = 1, Professional = up to 4, Organization/Enterprise = 40+.

### Extended Collections

Extended collections allow overriding only _some_ values based on another collection — similar to CSS inheritance/overrides.

### Aliasing

Aliasing in Figma variables is simply when you point a variable to another variable. Common example: pointing a semantic variable to a primitive variable.

**Decision rule:** If the source data has two tiers (primitives + semantics), create all primitives first, then create semantic variables that alias into them. If the source data is a single flat tier, create flat variables with no aliases. When in doubt, ask.

### Code Syntax

Code syntax is a surface area in Figma for codebase translation context. You can set WEB, iOS, and ANDROID code syntax on any variable:

- WEB: `var(--color-bg-default)`
- iOS: `Color.bgDefault`
- ANDROID: `colorBgDefault`

These appear in Figma's dev mode and as design context via MCP.

### Scope

`variable.scopes: VariableScope[]` specifies which properties in Figma the variable can be used for. **Always set specific scopes rather than leaving the default `ALL_SCOPES`** — it pollutes every property picker with irrelevant tokens.

Common scope values:

- `ALL_SCOPES` — unrestricted; **avoid** — almost never the right choice
- `FRAME_FILL`, `SHAPE_FILL`, `TEXT_FILL`, `STROKE_COLOR` — color bindings
- `ALL_FILLS` — covers all three fill scopes together
- `TEXT_CONTENT` — string variables for text layers
- `FONT_SIZE`, `FONT_WEIGHT`, `LINE_HEIGHT`, `LETTER_SPACING` — typography
- `CORNER_RADIUS`, `WIDTH_HEIGHT`, `GAP` — layout/spacing
- `OPACITY` — layer opacity
- `[]` (empty) — hidden from all pickers; use for primitive tokens only referenced by aliases

### Grouping

Variable names in Figma are slash-delimited and each slash represents a group visualized in Figma (e.g. `color/background/default`). When matching code to Figma, consider that part of a code prefix might be the collection name, not a top-level group. Validate existing variables by referencing the code syntax.

## Common Gotchas

- **`createVariableCollection` always creates a default mode** — rename it immediately, don't try to add your own first. New collections always have exactly one mode named "Mode 1".
- **Duplicate variable names throw silently** — Figma does not error; it creates a second variable with the same name. Always check for existence before creating.
- **Variable aliases require the target to be in the same file** — cross-file aliasing is not supported via the Plugin API. Import library variables first.
- **`setValueForMode` with an alias requires the exact shape** — `{ type: 'VARIABLE_ALIAS', id: '<variableId>' }`. Any deviation will silently set the wrong value or throw.

## Design System Variable Architecture

The token architecture is 3-layer:

- **Foundation**: raw values (hex colors, raw numbers). Never reference directly in semantic.
- **Palette**: named color ramps (e.g. `neutral.50`, `blue.500`). Semantic tokens alias Palette.
- **Semantic**: intention-based (e.g. `color.background.default`). Must reference Palette, never Foundation.

**Dark mode neutral ramp reversal** (critical):

- Light mode: `neutral.50` = white, `neutral.1000` = black
- Dark mode: `neutral.50` = black, `neutral.1000` = white
- Always verify actual hex using the `hex_lookup` MCP tool before setting variable values.

## Code Patterns

For runnable code examples (creating collections, binding variables, scopes, aliasing, discovering existing variables), see [variable-patterns.md](../variable-patterns.md).
