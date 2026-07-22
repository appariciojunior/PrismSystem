---
name: token-mapping-audit
description: For a given Figma frame, list every raw colour, spacing, radius, type and shadow value, map each one to a DS token via Token MCP, flag values with no token match, and recommend the closest semantic token. Run before `handoff/frame-to-spec` if you suspect token drift, or as a standalone audit.
license: MIT
metadata:
  category: design/ui
  pillar: ui
  agents: [Designer, Design Engineer, Architect]
  autonomy: autonomous
  portable: true
  cadence: daily
---

# Token Mapping Audit

## Purpose

Take a Figma frame and produce a complete inventory of its raw values, each one mapped to the right DS token, with unmapped values surfaced as actionable findings. The output is a structured report engineers and designers can act on without further digging.

This is the audit half of the value → token pipeline. The methodology lives in `figma-integration/token-mapping.md`. This skill applies that methodology with a strict reporting contract.

## Preconditions

1. Figma Console MCP is connected (see `figma-integration/figma-console-mcp-integration.md`). This includes the **Mandatory User Gate** for Figma URLs: ask the user whether the Desktop Bridge plugin is running before any Figma MCP call.
2. DS Tokens MCP server is running at `packages/tokens/mcp-server/index.js`.
3. The frame is stable enough to extract from. If it is a draft, the unmapped-values list will be dominated by work-in-progress and the report will not be useful.
4. `packages/tokens/src/tokens.json` is committed at a known sha. The report records that sha for traceability.

## Inputs

Required:

* `figma_url_or_node` — the frame or component to audit.

Optional:

* `intent_hint` — free-text intent like "card surface", "interactive primary", "text on dark surface". Improves `search_tokens` ranking.
* `strict` — boolean, default false. When true, the report fails on any unmapped value. When false, unmapped values are listed but the report completes.
* `output_path` — defaults to `.design/<frame_name>/TOKEN_AUDIT.md`.

## Procedure

### Step 1: Extract all values

Use `figma_get_component_for_development` and the variable read flow from `figma-integration/design-extraction.md`. From the response, harvest:

* Every fill (solid, gradient stops counted individually).
* Every stroke colour and width.
* Every effect (shadow colour, blur, offset).
* Every typography style (font family, size, weight, line-height, letter-spacing).
* Every spacing value (auto-layout padding per side, gap).
* Every corner radius (per corner if mixed).
* Every variable binding (alias key, library file key).

Record each value with the node id it appeared on so unmapped findings can be pinpointed.

### Step 2: Resolve via Token MCP

For each captured value:

1. If the value has a Figma variable binding, call `token_lookup` with the alias. This is the deterministic path. Trust the result.
2. If there is no binding, call `search_tokens` with the raw value plus the `intent_hint` (when provided). Take the highest-confidence match if it is above the recommended threshold (the MCP reports a score). If below threshold, treat as unmapped.
3. If `search_tokens` returns multiple equally-good matches, list all of them. The audit does not pick winners silently.

Cross-check via `discovery/semantic-token-search.md` if a candidate token feels wrong for the intent (e.g. a `messaging.fill.warning` token returned for a body text colour). Surface the mismatch.

### Step 3: Classify each value

Every captured value lands in one of four buckets:

* **Mapped (semantic).** Bound to a semantic token. The desired state for components.
* **Mapped (palette or foundation).** Bound to a palette- or foundation-level token. Allowed for foundation work, *not* allowed in components. Flag if seen inside a component.
* **Mapped (channel).** Bound to a `product.channel.*` token. Allowed only when channel context is set. Cross-reference `ui/channel-context.md` rules.
* **Unmapped.** No binding, no `search_tokens` match above threshold. The value is a literal, which is a design system violation in 99% of cases.

### Step 4: Recommend remediation for unmapped values

For every unmapped value, propose a remediation:

1. **Closest existing semantic token.** Run `search_tokens` with relaxed intent and surface the top three candidates with their similarity scores. The designer can pick or reject.
2. **New token needed.** If the value is genuinely outside the current token system (e.g. a new colour for a new product feature), flag it as "candidate for new token". Note: creating new tokens is governed by `governance/token-modification-gates.md` and is not done by this skill.
3. **Design mistake.** If the value is close to an existing token but not bound to it (e.g. `#FFFFFE` vs the white token `#FFFFFF`), flag as "likely design mistake, snap to existing".

The skill produces recommendations, not decisions.

### Step 5: Light/dark divergence check

For any colour value, look up its sibling in the opposite theme (light↔dark) via `color-ramps/dark-mode-mapping.md`. If the frame is only one theme and the component is expected to support both, list the missing sibling as an unmapped value in the other theme.

### Step 6: Channel cross-check

If any channel token is in the map, confirm it is being used inside a channel-scoped section. Out-of-channel use of channel colour is a flag, not a hard error.

### Step 7: Render the report

Write a Markdown report at `output_path` using the **Output Contract** below.

## Output Contract

```markdown
# Token Mapping Audit — [Frame Name]

> Figma: <deep link>
> Audited: <ISO timestamp>
> Tokens snapshot: <git sha of tokens.json>
> Strict: <true|false>
> Result: <pass | pass-with-findings | fail>

## Summary

- Values captured: <n>
- Mapped (semantic): <n>
- Mapped (palette/foundation): <n>  ← these need to move to semantic if inside a component
- Mapped (channel): <n>
- Unmapped: <n>
- Light/dark divergence: <n missing siblings>

## Mapped (semantic)

| Figma value | Token path | Token value | Node id |
|---|---|---|---|
| ... | ... | ... | ... |

## Mapped (palette / foundation) — review required if inside a component

| Figma value | Token path | Token value | Node id | Why this is flagged |
|---|---|---|---|---|
| ... | ... | ... | ... | foundation token used inside a component |

## Mapped (channel)

| Figma value | Token path | Token value | Node id | Channel scope OK? |
|---|---|---|---|---|
| ... | ... | ... | ... | yes / no |

## Unmapped values

| Figma value | Where it appears | Closest candidates | Recommendation |
|---|---|---|---|
| #FFFFFE | header background | `light/ core/ surface/ primary` (0.98) | snap to existing |
| ... | ... | ... | ... |

## Light/dark divergence

| Token path (one theme) | Sibling in other theme | Status |
|---|---|---|
| `light/ core/ text/ primary` | `dark/ core/ text/ primary` | present |
| `light/ comment/ surface/ primary` | `dark/ comment/ surface/ primary` | missing |

## Findings (actionable)

A bulleted list of the top issues, each one tagged with its severity (error, warning, info) and pointing to the row in the tables above.

## Provenance

- Figma file: <url>
- Figma node id: <id>
- Token MCP version: <semver>
- Tokens snapshot: <git sha of tokens.json>
```

## Error Handling

* **Token MCP cache stale.** If `search_tokens` returns results inconsistent with a direct read, force `token_lookup` and use that. Note the discrepancy.
* **Variable alias resolves to an unknown library.** Record the library key and surface as "external token reference" rather than guessing.
* **High unmapped count (>20% of captured values).** Stop and report. A frame with that many unmapped values is either a draft or built off-system; do not produce a low-confidence audit.
* **Channel scope unclear.** Flag and continue. Do not fail audit on channel scope alone.

## Composition

* `compose_after`: `figma-integration/figma-console-mcp-integration`
* `compose_before`: `handoff/frame-to-spec`, `handoff/spec-packet`
* `calls`: `figma-integration/design-extraction`, `figma-integration/token-mapping`, `discovery/token-lookup`, `discovery/semantic-token-search`, `color-ramps/dark-mode-mapping`, `ui/channel-context`

## Related Skills

* `./frame-to-spec.md` — consumes the audit output
* `./channel-context.md` — channel-scope validation rules
* `../../discovery/semantic-token-search.md` — the search layer this skill uses
* `../../governance/token-modification-gates.md` — what to do when "new token needed" is the recommendation
