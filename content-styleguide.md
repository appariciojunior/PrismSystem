# Content Styleguide

This guide defines naming and wording rules for docs in this repository.

## Core Rules

- Use plain English.
- Use active voice.
- Keep sentences short.
- Reuse established terms.

## Audience Rule

**All documentation must address three audiences: Product, Design, and Code.**

- **Product:** Product managers, stakeholders, team leads. Care about brand coherence, business impact, consistency across products.
- **Design:** Designers, design systems practitioners, Figma users. Care about tokens, visual hierarchy, accessibility, how to apply decisions.
- **Code:** Developers, engineers, implementation. Care about APIs, integration, CSS custom properties, component usage.

When writing, ensure each audience finds value without feeling excluded. Use examples that speak to their context.

- Token names must always be written in inline code format (for example: `text.primary`, `colors.inkBase`, `typographyTokens.utility.heading.medium`).
- Never use hypothetical or invented token names in examples. Always verify against the MCP (`search_tokens` or `token_lookup`) before using a token path in documentation.
- Write the full product name as `Design System` in all non-technical content.
- Do not use `DS` as shorthand by default.
- In technical content, you may introduce abbreviation once as `Design System (DS)` and then use `DS` only within that same section.
- If a section does not need abbreviation, keep using `Design System` throughout.
- Always use your brand name in full and spell it consistently, never abbreviated or altered.
- **Design System MCP**: Use full name always (not "MCP server", not "the MCP", not "our MCP").

## Voice By Content Type

- Non-technical copy should sound clear, human, and direct.
- Technical sections should stay precise, but still avoid unnecessary jargon.
- Avoid dry abstract phrases such as "stable product contract" when a simpler phrase explains the same point.
- Prefer practical wording that tells readers what to do next.

### Pronoun Guidance

- Use **"our"** for collective brand perspective: narrative sections, brand voice, shared ownership. Example: "Our users encounter our products across multiple platforms."
- Use **"your"** for direct instructions to the reader: steps, setup guides, personal actions. Example: "Open your Figma file." or "Install your first package."
- Avoid second person when it sounds patronising; prefer imperative verbs instead. Example: Preferred: "Attach the Token Library"; Avoid: "You should attach the Token Library."

Use these tone defaults:

- Non-technical guidance: plain, informal-professional, action-first.
- Technical guidance: exact, concise, implementation-aware.
- How-to steps: imperative verbs, short instructions, predictable structure.

Examples:

- Preferred non-technical: "Use this guide to map each legacy design system token to the right Design System token."
- Avoid non-technical: "This document defines the stable product contract for token migration."
- Preferred technical intro: "Design System (DS) semantic tokens are the migration target for product code."

## Naming And Grouping Rules

- Do not repeat context words from headings in list labels.
- If a heading already sets context, keep list labels to the differentiator only.
- Prefer `Android: ...` over `Android output: ...` when the section heading already says implementation or imports.
- Prefer `Colour`, `Typography`, `Spacing`, `Radius`, `Effects` over labels like `Colour mapping destination`.

## Redundancy Check

Before finalizing copy, remove repeated words that add no meaning in:

- section titles
- list labels
- table headings

If removing a repeated word does not change meaning, remove it.

## Em Dashes

Do not use em dashes (—). Replace them with:

- A colon when introducing an explanation.
- A comma when the em dash separates a parenthetical clause.
- A full stop when two independent clauses can stand alone.

## British English

Use British English spelling throughout.

Examples: colour, behaviour, customise, favour, recognise.

## No Duplicate Labels In Tables

Do not repeat a visible label as a word in the adjacent description cell.

If a table already shows a badge or value (for example the word "High" in a styled chip), the Meaning column must not open with that same word. Write the meaning directly: "Exact or near-exact intent match", not "High — exact or near-exact intent match".

## Typography Token Descriptions

Typography token descriptions must follow a strict template to serve Product, Design, and Code audiences equally. Token paths already encode classification (e.g., `brand.heading.fluid.light.small`), so descriptions should not repeat that context.

### Description Template

```
[Visual size or use intent]. [Visual hierarchy role or context]. [Pair/use guidance with HTML element in inline code].
```

### Required Rules

- **Start with user intent, not classification.** Lead with size, context, or use case—never weight name alone.
 - ✓ "Micro headline. Tertiary section breaks. Pair with `h5` or `h6`."
 - ✗ "Light-weight micro headline. Typically h5, h6."

- **Avoid redundancy with token path.** The token name already says `heading`, `fluid`, `light`, etc.
 - ✓ "Small headline. Sections and cards. Pair with `h3` or `h4`."
 - ✗ "Light-weight heading for small sections and cards. Pair with `h3` or `h4`."

- **Always use inline code for HTML elements.** Never write "h5" without backticks; always `` `h5` ``.
 - ✓ "Pair with `h5` or `h6`."
 - ✗ "Pair with h5 or h6. Typically h5, h6."

- **Use active, imperative verbs.** Action-oriented language helps developers and designers.
 - ✓ "Use for footnotes. Pair with `p`."
 - ✗ "Typically used for footnotes and pairs with p elements."

- **Keep descriptions ≤60 characters when possible.** Longer descriptions need strong justification.

### Weight Terminology

Use consistent, hyphen-free weight names in descriptions (weight classification is already in token path):

- `light` (400-weight equivalent)
- `regular` (500-weight equivalent)
- `bold` (600-weight equivalent)
- `black` (700-weight equivalent)

✓ "Light heading for subtle hierarchy."
✗ "Light-weight heading"

### HTML Element Guidance

Structure HTML guidance clearly and consistently:

| Situation | Format | Example |
| ----------------- | -------------------------------------------------- | ------------------------------------ |
| Single element | "Use inside `p`." | For inline links within body text |
| Multiple elements | "Use inside `p` or `span`." | For elements with flexible container |
| Specific context | "Use for standalone links outside paragraph text." | For block-level link containers |
| Semantic emphasis | "Use `figcaption` for semantic captions." | When HTML5 semantics matter |

### Accessibility & Warnings

For extreme sizes (very large or very small) and accessibility-critical tokens:

- **Minimum-size tokens (≤12px):** Add verification requirement.
 - ✓ "Micro caption (10px). Verify 4.5:1 contrast ratio. Use inside `p` or `span`."

- **Maximum-size tokens (≥68px):** Add context and warning.
 - ✓ "Mega-headline (68px). Brand splash pages only. Warning: breaks mobile layouts. Use `p` or `span`."

- **Link tokens:** Note visual state (underline present/absent).
 - ✓ "Underlined inline link (body text). Use inside `p`."
 - ✓ "Standalone link without underline (navigation). Use for block-level nav."

### Audience-Specific Guidance

Each description serves three audiences. Ensure clarity for all three:

**Product:** Context and business use

- "Small body text for dense layouts."
- "Meta for author attribution on article pages."

**Design:** Visual hierarchy and role

- "Tertiary section breaks; pairs well with regular paragraph text."
- "Light-weight headline creates visual separation without dominance."

**Code:** Implementation and pairing

- "Pair with `h5` or `h6`; resolves to `font-size: 16px; line-height: 1.4`."
- "Use inside `p` or `span`; requires `text-decoration: underline`."

### Examples

#### Good: Heading Token

```
"Small headline. Sections and cards. Pair with `h3` or `h4`."
```

✓ User intent first (small headline)
✓ Context without classification (content sections)
✓ No weight name (already in token path)
✓ Inline code for HTML
✓ ≤60 characters

#### Good: Body Token

```
"Large body text for callouts. Pair with `p`."
```

✓ User intent (callout context)
✓ No redundancy (token path says `body.large`)
✓ Clear action (pair with `p`)

#### Good: Accessibility-Critical Token

```
"Micro label (10px). Verify 4.5:1 contrast. Use for badges and tags."
```

✓ Size and accessibility warning
✓ Clear use case
✓ Action-oriented

#### Avoid: Passive, Redundant Description

```
"Light-weight body paragraph for small callouts. Typically used with p or span elements."
```

✗ Starts with weight (redundant in token path)
✗ "Typically used" (passive)
✗ No clear context for Code audience
✗ "elements" without code formatting
