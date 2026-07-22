---
name: channel-context
description: Validate channel colour usage in a Figma frame. Confirms the channel is declared at the right level (page or section, not component), that semantic tokens flow from the channel rather than referencing channel colour directly, and that no cross-channel mixing occurs. Surfaces channel-scope mistakes that the broader critique misses.
license: MIT
metadata:
  category: design/ui
  pillar: ui
  agents: [Designer, Design Engineer, Architect]
  autonomy: autonomous
  portable: true
  cadence: on-demand
---

# Channel Context

## Purpose

Design System uses product channels (`home`, `world`, `money`, `comment`, `business`, `sport`, `travel`, `puzzle`, `culture`, `obituaries`, `ireland`) to brand sections of the product without forking the design system. Channel colour is applied by setting a channel scope at the page or section level, and channel-aware semantic tokens (`*.channel.*` in path) then flow into components.

When designers reach for channel colour directly inside a component, they break this contract: the component stops being portable across channels, and theme parity breaks. This skill catches those mistakes.

The skill is on-demand. Run it when a frame visibly uses channel colour, or when `ui/design-critique.md` flags channel fit as a concern.

## Preconditions

1. Figma Console MCP is connected. The **Mandatory User Gate** applies for Figma URLs; see `figma-integration/figma-console-mcp-integration.md`.
2. The frame uses channel colour somewhere (otherwise the skill is a no-op). If unsure, run `ui/token-mapping-audit.md` first; it surfaces channel-mapped values.
3. `packages/tokens/src/tokens.json` is current. The skill reads channel paths from it directly.

## Inputs

Required:

* `figma_url_or_node` — the frame or section to validate.

Optional:

* `expected_channel` — one of the thirteen channels (see `foundation/design-dna`). When set, the skill verifies the frame uses *only* that channel's tokens; out-of-channel use is an error.
* `output_path` — defaults to `.design/<frame_name>/CHANNEL_CONTEXT.md`.

## Procedure

### Step 1: Enumerate channel tokens in the frame

Pull every value resolved by `ui/token-mapping-audit.md` whose token path includes `.channel.` or matches `product.channel.<name>`. Record:

* The Figma node id where it appears.
* The token path.
* The channel name (extracted from the path).
* Whether the node is a component instance, a frame, or a primitive.

### Step 2: Identify the channel scope

A channel scope is the highest-level node in the frame that sets the channel. By convention this is one of:

* A page wrapper with a channel theme variable applied.
* A section frame with a documented channel context (note, layer name, or attached doc).
* A component instance that explicitly takes a channel prop.

Locate the scope and record the channel it sets. If no scope is found, surface as `warning`: "channel colour used without a declared scope".

### Step 3: Validate token usage against scope

For each channel-referencing node found in step 1:

* **Match.** Token's channel == scope's channel. Pass.
* **Mismatch.** Token's channel != scope's channel. This is cross-channel mixing. `error` severity.
* **No scope.** A channel token used with no surrounding scope. `error` severity, since the colour will not flow correctly through theming.
* **Foundation reference.** Token path is `product.channel.<name>` directly (foundation level, not semantic). `error` severity, since components must use semantic tokens, not foundation. Recommend the closest semantic equivalent.

### Step 4: Validate parity-sensitive tokens

Per the README rule:

> Channel-specific tokens (`.channel.` in path) are the only exception where documented value divergence may apply.

Confirm that channel tokens used in the frame are *expected* to diverge across themes. Cross-reference `validation/semantic-theme-parity.md`. If a non-channel semantic token appears to diverge by theme in the frame, flag as a `warning`: "non-channel token shows divergence; suspected channel-scope leak".

### Step 5: Validate channel coverage

A frame that declares a channel scope but only uses two or three channel tokens may still be fine, but is worth surfacing as `info`: the channel theming may be incomplete. Specifically:

* Masthead / brand-bar surface uses the channel masthead token.
* Primary accent in the section uses the channel accent token.
* Primary action button uses the channel-aware interactive token (when one exists).

Missing coverage is `info`, not error. The designer may have intentionally restricted channel colour to the masthead.

### Step 6: Render the report

Use the **Output Contract** below.

## Output Contract

```markdown
# Channel Context — [Frame Name]

> Figma: <deep link>
> Validated: <ISO timestamp>
> Channels detected: <comma-separated>
> Expected channel: <name or "any">
> Tokens snapshot: <git sha>
> Result: <pass | pass-with-findings | fail>

## Summary

| Metric | Value |
|---|---|
| Channel-token references | <n> |
| Distinct channels found | <n> |
| Errors | <n> |
| Warnings | <n> |
| Info | <n> |

## Channel scope

Detected scope: <node id or "none">
Channel set by scope: <channel name or "none">
Scope mechanism: <theme variable | section frame note | component prop | unknown>

## Findings

| Severity | Node | Channel token | Issue | Suggested fix |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## Channel coverage

| Channel role | Token expected | Present in frame |
|---|---|---|
| Masthead surface | `*.channel.masthead.surface` | yes / no |
| Primary accent | `*.channel.accent.primary` | yes / no |
| Interactive primary | `*.channel.interactive.primary.fill` | yes / no |

## Provenance

- Figma file: <url>
- Figma node id: <id>
- Tokens snapshot: <git sha>
- Skill version: <semver>
```

## Error Handling

* **No channel tokens in the frame.** Return early with a single `info` line: "no channel colour detected; skipping channel validation".
* **Multiple scopes detected.** Two nested frames each declaring a different channel scope. Flag as `error`: the inner scope is overriding the outer. Note both.
* **Channel token in a token-mapping-audit unmapped row.** This means a raw channel value was used without binding. Defer to `ui/token-mapping-audit.md` for the unmapped finding and surface here as `info`.

## Composition

* `compose_after`: `figma-integration/figma-console-mcp-integration`, `ui/token-mapping-audit`
* `compose_before`: `handoff/frame-to-spec`, `handoff/spec-packet`, `ui/light-dark-parity`
* `calls`: `figma-integration/design-extraction`, `discovery/token-lookup`, `validation/semantic-theme-parity`

## Related Skills

* `./token-mapping-audit.md` — surfaces the channel tokens this skill validates
* `../ui/light-dark-parity.md` — channel tokens are the only allowed divergence; this skill defines what "allowed" means in practice
* `../../validation/semantic-theme-parity.md` — parity validator this skill consults
