---
name: spec-packet
description: Bundle the outputs of frame-to-spec, state-matrix, token-mapping-audit, plus an asset export list and the Figma deep link, into a single Markdown packet ready to attach to an engineering ticket. The packet is the artefact, not a summary; engineering can build from it without opening Figma.
license: MIT
metadata:
  category: design/handoff
  pillar: handoff
  agents: [Designer, Design Engineer, PM, Architect]
  autonomy: autonomous
  portable: true
  cadence: weekly
---

# Spec Packet

## Purpose

Take the artefacts produced by the upstream handoff and quality skills and consolidate them into one Markdown file that can be pasted into a ticket, dropped into a PR description, or attached to a planning doc. The packet is the deliverable, not a redaction.

The skill does not extract anything itself. It composes outputs that already exist. If an upstream output is missing, the packet either runs the missing skill (when safe) or flags the gap.

## Preconditions

1. `handoff/frame-to-spec.md` has produced a SPEC.md for the frame, or can run cleanly now.
2. `ui/state-matrix.md` and `ui/token-mapping-audit.md` outputs are available or can be run.
3. Asset export list is producible from Figma (icons, images that need export). Figma MCP must be connected.
4. Engineering ticket destination is known (URL or ID) if the packet will be auto-attached.

## Inputs

Required:

* `figma_url_or_node` — the source frame.

Optional:

* `feature_name` — used as the folder name and packet title. Defaults to the component name.
* `ticket_id` — JIRA/Linear/GitHub issue ID. If provided, included in the packet header and the file is also written to `.design/<feature>/ticket-<ticket_id>.md`.
* `include_critique` — boolean, default false. When true, the `ui/design-critique.md` output is included as a section. Most handoff packets do not need this once the design is approved.
* `include_content_check` — boolean, default true.
* `include_a11y` — boolean, default true.
* `output_path` — defaults to `.design/<feature_name>/PACKET.md`.

## Procedure

### Step 1: Resolve all required inputs

For each upstream artefact required by the packet, check `.design/<feature>/` for an existing output. If present and the underlying Figma sha matches, reuse. If the sha differs, regenerate.

If absent, run the upstream skill now. The order is:

1. `ui/token-mapping-audit.md` (every other skill depends on this)
2. `ui/state-matrix.md`
3. `ui/a11y-check.md` (if `include_a11y`)
4. `ui/content-style-check.md` (if `include_content_check`)
5. `ui/design-critique.md` (only if `include_critique`)
6. `handoff/frame-to-spec.md` (the central spec)

### Step 2: Generate the asset export list

For every image, icon, or vector that is not a DS icon component instance, list it with:

* Node id.
* Suggested export format (`SVG` for icons, `PNG @1x/@2x/@3x` for raster, `WebP` where supported).
* Recommended filename, derived from the layer name with kebab-case normalisation.

Note: this list is a *recommendation*, not an export action. Exports are kicked off separately by the engineer or via a CI script.

### Step 3: Assemble the packet

Render the **Output Contract** below. The packet sections are fixed; missing inputs become "not run" or "not applicable" rows rather than omitted sections.

### Step 4: Write to the canonical location

Write to `.design/<feature>/PACKET.md`. Also write `.design/<feature>/INDEX.md` listing every artefact in the feature folder and its purpose, so a future reader can navigate the bundle.

If `ticket_id` is provided, also write a copy at `.design/<feature>/ticket-<ticket_id>.md` to make the ticket link explicit.

## Output Contract

```markdown
# Handoff Packet — [Feature Name]

> Figma: <deep link>
> Ticket: <ticket_id or "not set">
> Bundled: <ISO timestamp>
> Tokens snapshot: <git sha>

## What this packet contains

A list of every section below, with status (`included`, `not run`, `not applicable`).

## 1. Overview

The Overview section from `handoff/frame-to-spec.md`, verbatim.

## 2. Public API

The Public API table from frame-to-spec.

## 3. Layout

The Layout section from frame-to-spec.

## 4. Tokens

The Mapped (semantic) table from `ui/token-mapping-audit.md`, plus a count of unmapped values. If unmapped > 0, full unmapped table is included.

## 5. State matrix

Full matrix from `ui/state-matrix.md`.

## 6. Responsive behaviour

From frame-to-spec.

## 7. Accessibility

If `include_a11y`, the Summary table from `ui/a11y-check.md`. Full findings linked separately so the packet stays scannable.

## 8. Content style

If `include_content_check`, the Summary and Findings tables from `ui/content-style-check.md`.

## 9. Design critique (optional)

If `include_critique`, the Summary and per-category counts from `ui/design-critique.md`. Full critique linked.

## 10. Asset exports

| Node | Asset | Suggested format | Suggested filename |
|---|---|---|---|

## 11. Open questions

Combined Open Questions from frame-to-spec, plus any unresolved findings from the quality skills. Engineering or design owns each before build.

## 12. Provenance

- Figma file: <url>
- Figma node id: <id>
- Tokens snapshot: <git sha>
- Skills run, with versions:
  - `handoff/frame-to-spec` v<x>
  - `ui/token-mapping-audit` v<x>
  - `ui/state-matrix` v<x>
  - `ui/a11y-check` v<x> (or "not run")
  - `ui/content-style-check` v<x> (or "not run")
  - `ui/design-critique` v<x> (or "not run")
- Generated by: `design/handoff/spec-packet` v<x>

## Artefact index

Every file in `.design/<feature>/`, with one-line purpose.
```

## Error Handling

* **Upstream skill fails to run.** Surface the failure in the packet's section as "skill failed: <reason>" and include the error log in `.design/<feature>/errors.log`. Do not silently omit.
* **Stale outputs.** If an upstream output exists but the Figma sha differs, regenerate without asking.
* **Asset export list ambiguous.** If a node could be SVG or PNG (e.g. a logo), list both options with a recommendation note.
* **Packet length.** If the packet grows past 1500 lines, split the long sections (state matrix, content findings) into linked subfiles and reference them.

## Composition

* `compose_after`: every Phase 1, 2 and 3 skill
* `compose_before`: none (this is a terminal handoff artefact)
* `calls`: `handoff/frame-to-spec`, `ui/state-matrix`, `ui/token-mapping-audit`, `ui/a11y-check`, `ui/content-style-check`, `ui/design-critique` (optional), `figma-integration/design-extraction`

## Related Skills

* `./handoff-flow.md` — the orchestrator that drives this packet for new features end-to-end
* `../../coordination/handoff-protocol.md` — the underlying handoff state-transfer skill
