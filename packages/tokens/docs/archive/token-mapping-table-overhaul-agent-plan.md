## Blueprint: Token Mapping Table Overhaul (Theme-Aware, 28-Mode Resolved)

### Complexity: COMPLEX

### Objective

Re-architect the Storybook Token Mapping Table used by Foundations/Migrating from Legacy so it:

1. Adds a top-level DS theme selector (default: core).
2. Supports all 14 themes in both light and dark (28 resolved theme-mode combinations).
3. Preserves grouping structure (for example, ink section with all ink rows) based on the Figma template.
4. Shows two match types per legacy token:
   - Primary match (human-curated by user intent/context).
   - Secondary match (agent-computed nearest candidate), with strict non-overlap against primary.
5. Displays light/dark resolved values in the same visual pattern as the provided Figma template (L and D circular markers).

### Scope Boundaries

- In scope:
  - Storybook migration table architecture, data pipeline, matching logic, and rendering model.
  - Pulling resolved values from Figma variables for all 14 themes x 2 modes.
  - Migration documentation and execution artifacts under `packages/tokens/docs/migration`.
- Out of scope:
  - Token value edits in `packages/tokens/src/tokens.json`.
  - Foundation/palette token mutations.
  - Changes to `$themes`, `$figma*`, or Token Studio metadata.

### Constraints and Governance

- Semantic tokens must map through palette references, never direct foundation references.
- No hardcoded semantic raw hex as canonical source; resolved hex is a derived artifact only.
- Dark-mode neutral behavior must be validated using the `hex_lookup` MCP tool before confidence scoring.
- All new docs/artifacts must stay under `packages/tokens/`.
- Figma URL workflow gate is mandatory before Figma MCP usage:
  - Ask Desktop Bridge status first (`Running now`, `Not running`, `Not sure`).

### Token Changes

| Token Path | Light Value | Dark Value | Notes                                                                                                 |
| ---------- | ----------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| N/A        | N/A         | N/A        | This blueprint is documentation and implementation planning only; no token value changes are planned. |

## Target Architecture

### 1) Data Contract Split (Authoritative vs Derived)

Introduce a migration-data split for reliability and regeneration:

1. Authoritative input contracts
   - `legacy_tokens`: canonical legacy token list + legacy descriptions.
   - `tds_theme_matrix`: DS token resolved values for 14 themes x 2 modes.
   - `primary_matches`: user-provided primary mapping assignments.
2. Derived contract
   - `secondary_matches`: algorithmic nearest candidates excluding primary assignments.
   - `render_rows`: grouped, render-ready rows with both primary and secondary match bundles.

Recommended artifact locations:

- `packages/tokens/docs/migration/data/legacy-token-catalog.json`
- `packages/tokens/docs/migration/data/ds-theme-resolved-values.json`
- `packages/tokens/docs/migration/data/primary-matches.json`
- `packages/tokens/docs/migration/data/secondary-matches.generated.json`
- `packages/tokens/docs/migration/data/token-mapping-table.generated.json`

### 2) UI Rendering Model

Rework mapping table rendering from markdown-bound parsing to structured data rendering:

1. Keep existing MDX page shell in `stories/foundations/MigratingFromLegacy.mdx`.
2. Replace table body dependency on markdown table parsing with JSON-driven sections.
3. Add `ThemeSelector` above table:
   - Default selected theme: `core`.
   - Options: exact 14 DS themes.
   - Mode display remains two lanes (Light/Dark) for selected theme.
4. Preserve accordion grouping UX and ordering from template:
   - Group key from legacy token prefix (for example `ink`, `interface`, etc).
   - Expand/collapse behavior retained.
5. DS match cell content per row:
   - Primary block (first).
   - Secondary block (second).
   - Each block shows token path, match score, and resolved light/dark values with L/D chips/circles.

### 2.1) Optional Grid Framework Path (MUI X Data Grid)

If implementation speed or table ergonomics become a bottleneck, the code agent may adopt MUI X React Data Grid as a rendering foundation instead of maintaining a custom table renderer.

Potential feature reuse:

1. Built-in sorting/filtering for large token inventories.
2. Column pinning and resizing for readability across wide match cells.
3. Virtualized rendering for performance with large grouped datasets.
4. Single-select column support for theme selector or row-level review workflows.

Adoption constraints:

1. Must preserve current visual contract from Figma template (group bars, L/D markers, score chips).
2. Must preserve deterministic section grouping order (ink first where specified, then canonical order).
3. Must not block Storybook docs rendering or degrade accessibility semantics.
4. If bundle/cost or licensing constraints conflict, stay on custom renderer and implement only required behavior.

Decision rule:

- Prefer custom renderer when parity styling is highly bespoke and current performance is acceptable.
- Prefer Data Grid when dataset size and interaction complexity justify framework features with minimal visual compromise.

### 3) Matching Architecture

Secondary matching uses a deterministic weighted score:

1. Candidate pool: all valid DS semantic tokens for selected group/context.
2. Hard exclusions:
   - Any token already selected as primary for that legacy token.
   - Any exact duplicate already used in secondary for same row side.
3. Score dimensions:
   - Hex proximity score (per mode):
     - Compare legacy brand/channel-resolved hex vs DS resolved hex.
     - Compute distance in perceptual space (preferred: CIEDE2000; fallback: Euclidean RGB if utility absent).
   - Description intent score:
     - Token description semantic similarity (keyword + embedding-like fallback heuristic).
4. Composite score:
   - `score = 0.65 * hex_similarity + 0.35 * description_similarity`
   - Ties broken by smaller hex delta in both modes.
5. Banding for UI labels:
   - `H` high, `M` medium, `L` low, `Orphan` when below minimum threshold.

### 4) Theme and Mode Matrix Coverage

Coverage target is strict:

- 14 themes x 2 modes = 28 resolved theme-mode states.
- For each row, rendered values must be computed for current theme light and current theme dark.
- Switching theme must update all rows and both mode values atomically from same dataset version.

## Agent Handover Plan

### H0: Architect -> Figma Executor (Extraction Brief)

Owner: `architect`

Deliverables:

1. Extraction brief with exact Figma source URLs.
2. Required output schema for `tds_theme_matrix`.
3. Required output schema for template style constraints (L/D visual pattern, grouping behavior).

Exit criteria:

- Brief includes all 14 theme names expected in target table.
- Includes mandatory Desktop Bridge confirmation gate.

### H1: Figma Executor (Resolved Value Capture)

Owner: `figma-executor`

Steps:

1. Ask Desktop Bridge status question before any Figma MCP call.
2. Extract variables/resolved values from Token Library file.
3. Extract template design constraints from UI Kit file (node reference + sample rows).
4. Emit normalized JSON artifacts for theme/mode/token resolved values.

Exit criteria:

- Resolved values captured for all 14 themes in light and dark.
- Missing/unpublished values explicitly flagged, not silently omitted.
- Extraction report includes timestamp and source node references.

### H2: Architect -> Code Agent (Implementation Brief)

Owner: `architect`

Deliverables:

1. File-level implementation map (what to change in stories and migration data scripts).
2. Data schema contract and fallback behavior.
3. Matching rules and non-overlap guarantee.

Exit criteria:

- Code agent has deterministic algorithm spec and acceptance tests list.

### H3: Code Agent (Implementation)

Owner: `code`

Expected code work:

1. Introduce generator scripts to produce normalized mapping JSON.
2. Refactor `stories/foundations/MappingTable.jsx` to consume generated JSON contract.
3. Add top theme dropdown (default `core`) and render sync update pipeline.
4. Implement primary + secondary match renderer with L/D markers.
5. Ensure grouping/ordering parity with Figma template.

Exit criteria:

- Storybook docs page reflects theme switch behavior across all rows.
- No parser dependency on huge inline markdown HTML for generated mapping table body.

### H4: Testing Agent (Verification and Risk Gates)

Owner: `testing`

Verification matrix:

1. Functional:
   - Theme switch updates all rows.
   - Default theme = core.
   - Light and dark both visible per row.
2. Data integrity:
   - 14 themes present.
   - 28 resolved theme-mode states covered.
   - Primary/secondary no-overlap assertions pass.
3. Visual regression:
   - L/D markers match template placement and label style.
   - Grouping and section ordering match template.
4. Storybook validation:
   - `Foundations/Migrating from Legacy` renders without runtime errors.

Exit criteria:

- Verification report with pass/fail checklist and blocker severity.

### H5: Content Agent (Copy and Label QA)

Owner: `content`

Tasks:

1. Validate legacy description text is legacy-authentic (not DS rewrites).
2. Ensure token/score labels are concise and consistent.
3. Ensure migration guidance copy explains primary vs secondary intent.

Exit criteria:

- Copy QA checklist signed off.

## Execution Phases

### Phase A: Discovery and Schema Freeze

1. Freeze theme list (14 exact IDs/names).
2. Freeze row group taxonomy (ink/interface/etc).
3. Freeze JSON contracts.

### Phase B: Data Extraction and Normalization

1. Pull resolved values from Figma variables.
2. Normalize legacy token catalog + descriptions.
3. Merge into row candidates.

### Phase C: Matching and Generation

1. Ingest user primary matches.
2. Compute secondary matches with exclusion logic.
3. Generate render dataset.

### Phase D: UI Rebuild

1. Add theme selector.
2. Swap markdown parsing path for data-driven rendering.
3. Implement match card rendering with L/D resolved values.

### Phase E: Validation and Signoff

1. Verify full coverage + no-overlap.
2. Visual parity review against Figma template.
3. Storybook QA and handoff notes.

## Risks and Mitigations

1. Risk: incomplete theme coverage due to missing Figma variable bindings.
   - Mitigation: explicit missing-state markers and hard fail when theme count < 14.
2. Risk: primary matches unavailable initially (user-provided later).
   - Mitigation: support placeholder primary set and rerunnable generation when primary mapping file is updated.
3. Risk: massive markdown table payload causes parse/render instability.
   - Mitigation: move to generated JSON rendering contract.
4. Risk: false-positive secondary matches from description-only similarity.
   - Mitigation: keep hex proximity weighted higher and enforce per-mode checks.

## Completion Criteria

- Theme selector exists and defaults to core.
- All 14 themes x light/dark (28 total) resolve and render for all rows.
- Primary + secondary matches both shown, with strict non-overlap.
- Grouping follows Figma template structure (ink and all other groups complete).
- L/D visual markers and score chips reflect template behavior.
- Data generation pipeline is repeatable and agent-friendly.

## Skills for Code Agent

- reasoning/react-loop
- figma-integration/design-extraction
- figma-integration/figma-console-mcp-integration
- discovery/token-lookup
- discovery/semantic-token-search
- validation/semantic-theme-parity
- color-ramps/dark-mode-mapping
- color-ramps/contrast-check
- governance/constraint-reference
- coordination/handoff-protocol

## Suggested Agent Invocation Order

1. `architect` (finalize contracts)
2. `figma-executor` (extract resolved theme matrix + template constraints)
3. `code` (implement data pipeline + UI rebuild)
4. `testing` (coverage, no-overlap, visual regression)
5. `content` (copy QA)
