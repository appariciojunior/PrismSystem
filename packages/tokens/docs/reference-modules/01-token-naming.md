# Token Naming System

**Reference**: `packages/tokens/docs/reference-modules/`  
**Use Case**: Understanding token structure and naming conventions  
**For Agent**: Architect, Code Agent (when naming new tokens)

---

## Overview

Token names in the Design System are constructed using a structured taxonomy that ensures consistency, clarity, and scalability. Each token name is built by combining specific attributes in a defined order, creating self-documenting identifiers that communicate both purpose and context.

## Naming Structure

Tokens follow this general pattern (not all attributes are required for every token):

```
[Design System]-[Sentiment]-[Type]-[Context]-[Grouping]-[Option]-[Modifier]-[Scale]-[Role]-[State]
```

**Visual Reference**: [View the Token Naming Structure diagram in Figma](https://www.figma.com/design/YOUR-FIGMA-FILE-KEY/Token-Library---Design-System?node-id=3713-8136&t=2JPKvYJyl9GH2tmU-1)

## Token Attributes Reference

| Attribute         | Description                                                                                                                        | Example Values                                                                                                    |
| :---------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **Design System** | The namespace prefix for the design system, ensuring tokens are uniquely identified.                                               | `--ds`                                                                                                           |
| **Sentiment**     | The abstraction layer of the token.                                                                                                | `semantic`, `foundation`                                                                                          |
| **Type**          | The category of design property being defined. Determines what aspect of the UI the token controls.                                | `color`, `typography`, `spacing`, `elevation`, `border-radius`                                                    |
| **Context**       | The domain or usage context for the token.                                                                                         | `brand`, `utility`                                                                                                |
| **Grouping**      | The semantic context or functional area where the token is used. Primary organizational layer.                                     | `interactive`, `feedback`, `selection`, `selected`, `active`, `text`, `icon`, `border`, `surface`, `input`, `tag` |
| **Option**        | Behavioural characteristics of the token. For typography, defines responsive vs. fixed sizing. For color, defines mode-dependency. | `static` (fixed font sizes or mode-independent colors), `fluid` (responsive font sizes that scale with viewport)  |
| **Modifier**      | Visual weight or style variation.                                                                                                  | `light`, `regular`, `bold`, `black`, `subtle`, `strong`, `medium`, `semibold`                                     |
| **Scale**         | Hierarchical level or severity within a grouping.                                                                                  | `primary`, `secondary`, `tertiary`, `critical`, `success`, `warning`, `info`, `2xs`, `xs`, `s`, `m`, `l`, `xl`    |
| **Role**          | The specific UI element or property the token applies to.                                                                          | `fill`, `text`, `icon`, `border`, `horizontal`, `vertical`, `between`, `elevation`, `overlay`                     |
| **State**         | The interaction state of the element.                                                                                              | `default`, `hover`, `pressed`, `focus`, `active`, `disabled`, `error`, `success`                                  |

## Naming Examples

| Token Name                         | Breakdown                                                                                                              | Usage                                                                                                                                                                                                                                                                                  |
| :--------------------------------- | :--------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `interactive.primary.fill.default` | **Grouping**: `interactive`<br>**Scale**: `primary`<br>**Role**: `fill`<br>**State**: `default`                        | Default background colour for primary buttons                                                                                                                                                                                                                                          |
| `feedback.text.error`              | **Grouping**: `feedback`<br>**Role**: `text`<br>**Scale**: `error`                                                     | Text colour for error messages                                                                                                                                                                                                                                                         |
| `text.secondary`                   | **Grouping**: `text`<br>**Role**: `secondary`                                                                          | Secondary text colour                                                                                                                                                                                                                                                                  |
| `surface.static.dark`              | **Grouping**: `surface`<br>**Option**: `static`<br>**Scale**: `dark`                                                   | Always renders black (#000000) regardless of light/dark mode. Useful for QR codes and elements with fixed colors.                                                                                                                                                                      |
| `text.static.light`                | **Grouping**: `text`<br>**Option**: `static`<br>**Scale**: `light`                                                     | Always renders white (#ffffff) regardless of light/dark mode. Useful for fixed light text overlays.                                                                                                                                                                                    |
| `border.static.dark`               | **Grouping**: `border`<br>**Option**: `static`<br>**Scale**: `dark`                                                    | Always renders black (#000000) regardless of light/dark mode. Useful for fixed dark dividers.                                                                                                                                                                                          |
| `brand.heading.fluid.light.xlarge` | **Context**: `brand`<br>**Grouping**: `heading`<br>**Option**: `fluid`<br>**Modifier**: `light`<br>**Scale**: `xlarge` | Composite typography token referencing foundation tokens:<br>• `fontFamily010` → `Inter`<br>• `fontWeight030` → `Light`<br>• `fontSize095` → `2.125rem`<br>• `fontLineHeight020` → `112.5%`                                                                                     |
| `surface.level-1`                  | **Grouping**: `surface`<br>**Scale**: `level-1`                                                                        | Composite elevation token referencing foundation tokens:<br>• Fill: `surface.level-1` → `brand.core.base.white`<br>• Border: `border.elevation` → `#E6E6E6`<br>• Shadow: `shadow010` → `0px 0.5px 2px rgba(0,0,0,0.08)`<br>Used for cards and panels to provide hierarchy above canvas |

## Outlier Token Types: Composite Tokens

It's important to note that some token types, particularly at the semantic level, function as composite tokens. For instance, a `typography` token like `brand.heading.fluid.light.xlarge` is not a single value but rather a composition of several foundational properties, including font size, line height, font family, and font weight. Similarly, `surface.level-1` tokens are composite, often combining a fill, a border, and a shadow token to define a complete visual depth effect.

## Best Practices for Creating New Tokens

1. **Start with Grouping**: Identify the semantic context first (interactive, feedback, text, etc.)
2. **Define the Role**: Determine what UI property it controls (fill, text, border, icon)
3. **Add Scale if needed**: Include hierarchy or severity (primary, secondary, error, success)
4. **Include State when relevant**: Add interaction states for interactive elements
5. **Keep it semantic**: Name tokens by purpose, not by visual appearance (use `primary` not `blue`)
6. **Maintain consistency**: Follow existing patterns in the system
7. **Avoid redundancy**: Don't repeat information already implied by other attributes
