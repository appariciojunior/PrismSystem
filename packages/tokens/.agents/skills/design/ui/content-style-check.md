---
name: content-style-check
description: Run the copy in a Figma frame against the Design System content styleguide. Checks voice, tone, British English, brand name usage, em dash avoidance, headline structure, table label rules, and typography token description format. Designed for designers and content reviewers before handoff.
license: MIT
metadata:
  category: design/ui
  pillar: ui
  agents: [Designer, Content, PM, Architect]
  autonomy: autonomous
  portable: true
  cadence: daily
---

# Content Style Check

## Purpose

Apply the rules in `content-styleguide.md` (at the repo root) to every text node in a Figma frame. Surface violations as findings with the offending text, the rule it breaks, and a suggested rewrite. The skill is the bridge between the styleguide document and the day-to-day design review.

The skill enforces rules that are textual and concrete. Subjective tone judgements (e.g. "this sounds too corporate") are surfaced as `info` findings for human review, not as errors.

## Preconditions

1. Figma Console MCP is connected. The **Mandatory User Gate** applies for Figma URLs; see `figma-integration/figma-console-mcp-integration.md`.
2. `content-styleguide.md` exists at the repo root and is current. The skill reads it directly each run; it does not cache.
3. The frame's text nodes are real text layers (not images of text, not Figma component overrides masking the real text). If text is in a component instance, the skill follows to the source.

## Inputs

Required:

* `figma_url_or_node` — frame or component to audit.

Optional:

* `context` — `non-technical` | `technical` | `auto`. Default `auto`. Determines which tone rules apply (per "Voice By Content Type" in the styleguide).
* `severity_floor` — `info` | `warning` | `error`. Default `info`.
* `output_path` — defaults to `.design/<frame_name>/CONTENT_STYLE.md`.

## Procedure

### Step 1: Extract text nodes

Use `figma_get_component_for_development`. For each text node capture: the string, the typography token bound to it (if any), the parent component's role (heading, body, caption, etc.), the node id.

### Step 2: Apply lexical rules

These are mechanical and unambiguous. Failures are `error` severity unless noted.

| Rule | Detection | Severity |
|---|---|---|
| No em dashes (—) | Substring scan for `—` | error |
| British English spellings | Scan for known US spellings: `color`, `behavior`, `customize`, `favor`, `recognize`, `analyze`, `organize`, `optimize`, `center` (when used as British "centre"), `flavor`, `humor`, `labor` | error |
| Full product name | "Design System" never abbreviated to "DS" outside its established-in-section pattern | warning |
| Brand names | Brand names are always written in full, never abbreviated or shortened | error |
| Design System MCP full name | Never abbreviated to "MCP server", "the MCP", or "our MCP" | error |

### Step 3: Token name formatting

Per styleguide:

* Token names must be inline code: `` `text.primary` `` not `text.primary` (no formatting).
* No invented token names. Cross-check every token reference against `tokens.json` via `discovery/token-lookup.md`. Unknown token names are `error` severity.

### Step 4: Voice and tone

These rules are heuristic. The skill flags candidates; the human confirms.

* **Passive voice.** Detect with simple heuristics: `was/were/been/being` + past participle. Surface as `warning` for any sentence in a non-technical context. Technical contexts get `info`.
* **Long sentences.** Sentences longer than 25 words get `warning`. Longer than 35 get `error`.
* **Patronising second person.** Phrases like "You should...", "You need to...", "You can simply...". Surface as `warning` with suggested imperative rewrite.
* **Abstract jargon.** Phrases listed in the styleguide as anti-patterns ("stable product contract", "delivery mechanism", "operational excellence"). Surface as `warning`.
* **"Our" vs "your".** When a step-by-step instruction reads "our", flag as `info`. When a brand narrative line reads "your", flag as `info`. Subjective, but worth surfacing.

### Step 5: Naming and grouping (for table-style frames)

If the frame contains table-like content (a table component, a data grid, a docs table):

* Headings should not repeat context from the section heading. If the section is "Component Properties" and the column heading is "Property", that is fine; if it is "Component property", that is a finding (per "Naming And Grouping Rules").
* No duplicate labels in adjacent cells (per "No Duplicate Labels In Tables"). E.g. a badge "High" and a description cell starting "High - ...".

### Step 6: Typography token description rules (if applicable)

If the frame is documenting typography tokens (e.g. a token showcase story, a docs MDX in a frame):

Each description must match the template:

```
[Visual size or use intent]. [Visual hierarchy role or context]. [Pair/use guidance with HTML element in inline code].
```

Check:

* Starts with user intent, not weight classification. (Finding if starts with "Light-weight...", "Bold...", "Regular...".)
* Avoids redundancy with the token path (descriptions for `brand.heading.fluid.light.small` should not start with "Light fluid brand heading...").
* HTML element references are in inline code (`` `h5` ``, `` `p` ``, `` `span` ``).
* Uses active, imperative verbs ("Pair with", "Use inside", "Use for").
* Description length is ≤60 characters where possible. Over 60 is `info`.
* Weight terminology: `light`, `regular`, `bold`, `black` (no hyphens, no "weight" suffix).

### Step 7: Audience check (informational)

Per "Audience Rule", documentation copy should address Product, Design and Code. For docs frames:

* If the copy uses only technical terminology, surface as `info`: "consider adding plain-English summary for Product audience".
* If the copy is entirely narrative with no API references, surface as `info`: "consider adding implementation guidance for Code audience".

### Step 8: Render the report

Use the **Output Contract** below.

## Output Contract

```markdown
# Content Style Check — [Frame Name]

> Figma: <deep link>
> Checked: <ISO timestamp>
> Context: <non-technical | technical | auto>
> Styleguide source: content-styleguide.md @ <git sha>
> Result: <pass | pass-with-findings | fail>

## Summary

| Metric | Value |
|---|---|
| Text nodes scanned | <n> |
| Errors | <n> |
| Warnings | <n> |
| Info | <n> |

## Findings

### Lexical (rules)

| Severity | Node | Text excerpt | Rule | Suggested rewrite |
|---|---|---|---|---|
| ... | ... | ... | no em dashes | replace `—` with `:` |
| ... | ... | ... | British English | `color` → `colour` |

### Token formatting

| Severity | Node | Text excerpt | What | Suggested rewrite |
|---|---|---|---|---|
| ... | ... | ... | `text.primary` not in inline code | use backticks |
| ... | ... | ... | unknown token `colors.darkInk` | not in tokens.json, verify name |

### Voice and tone (heuristic)

| Severity | Node | Text excerpt | What | Suggested rewrite |
|---|---|---|---|---|
| ... | ... | ... | passive voice | reword with active verb |
| ... | ... | ... | 38-word sentence | split into two |

### Naming and grouping (table-style frames only)

| Severity | Node | Text excerpt | What | Suggested rewrite |
|---|---|---|---|---|

### Typography token descriptions (if applicable)

| Severity | Node | Text excerpt | What | Suggested rewrite |
|---|---|---|---|---|

### Audience (info only)

| Node | Audience missing | Suggested addition |
|---|---|---|

## Provenance

- Figma file: <url>
- Figma node id: <id>
- Styleguide: content-styleguide.md @ <git sha>
- Tokens snapshot: <git sha of tokens.json>
- Skill version: <semver>
```

## Error Handling

* **No text nodes in frame.** Skip everything except a single `info` finding: "no text content to audit".
* **Styleguide file missing.** Stop. The skill must read the live `content-styleguide.md`. If missing, the audit is meaningless.
* **Long copy that breaks multiple rules at once.** List each rule break as its own finding; do not deduplicate by node. A node with three issues gets three rows.
* **Component instance overrides hide text.** If the text node is an override, audit the override text and surface a note pointing at the component source.

## Composition

* `compose_after`: `figma-integration/figma-console-mcp-integration`
* `compose_before`: `handoff/spec-packet`, `handoff/handoff-flow`
* `calls`: `figma-integration/design-extraction`, `discovery/token-lookup`

## Related Skills

* `./design-critique.md` — structural review, run alongside
* `./a11y-check.md` — accessibility findings, run alongside
* `../../storybook/component-documentation-writing.md` — the writing standard for component docs
