# Token Discovery Proposals

## Context

Teams can use tokens, but discovering the right semantic token is still too hard in day-to-day design and development workflows. This proposal captures practical options to improve token discovery for designers and engineers.

---

## Goals

- Help people find the right token by intent, not by guessing names.
- Reduce hard-coded values and one-off token requests.
- Make design/code parity easier by exposing the same discovery logic in both contexts.
- Start with low-risk, high-impact options first.

---

## Proposal A: Token Finder Page in Storybook

### Summary

Create a dedicated **Foundations / Token Finder** page in Storybook with plain-language search.

### User experience

- User types intent: "muted label text", "warning background", "divider on dark surface"
- Results show ranked token cards with:
  - token name/path
  - plain-language description
  - light and dark resolved swatches
  - CSS variable copy action
  - Figma variable naming/path equivalent

### Implementation approach

- Build a static search index from tokens at Storybook build time.
- Run in-browser scoring, no backend required.
- Reuse the same intent-ranking concepts already used in token search tooling.

### Why this is strong

- Fast to ship
- Low complexity
- Useful to both designers and engineers immediately

---

## Proposal B: Chatbot-Style Token Assistant

### Summary

Add a conversational assistant for token discovery (embedded on Token Finder page or as a side panel).

### User experience

- User asks naturally: "I need text that sits below secondary but above metadata."
- Assistant returns:
  - recommended tokens
  - rationale ("best fit because...")
  - alternatives
  - light/dark previews

### Implementation approach

- UI in Storybook (or docs site) with minimal chat surface.
- Service endpoint calls existing token search capability.
- Supports follow-up prompts to refine intent.

### Why this is strong

- Most intuitive interaction model
- Great for onboarding and fuzzy requirements
- High perceived value

### Tradeoff

- More infrastructure and governance than static search.

---

## Proposal C: Reverse Lookup (Value -> Token)

### Summary

Allow users to paste a hex/rgb/value and get matching semantic tokens.

### User experience

- User pastes `#1a191a` (or any colour value).
- Tool returns:
  - exact token matches (per mode)
  - near matches (optional)
  - where those tokens are typically used

### Primary use cases

- Migrating legacy styles to tokenized styles
- Auditing hard-coded values in components
- Helping designers map visual picks back to system tokens

### Why this is strong

- Quickest practical win
- Very high utility for cleanup and migration work
- Complements Proposal A perfectly

---

## Preferred Execution Scope: A + C (Implementation Blueprint)

This section is the execution-ready scope for delivery. Proposals B and D remain in this document as future phases.

### Outcome to ship

- A single Storybook docs page under Foundations named "Token Finder".
- Two primary workflows on that page:
  - Intent Search (Proposal A)
  - Value Reverse Lookup (Proposal C)
- Shared ranking and token normalization logic used by both workflows.
- No backend service required for v1.

### Functional requirements

#### A. Intent Search

- Input accepts natural-language phrases.
- Returns ranked semantic token results.
- Each result card displays:
  - token path
  - human-readable description (fallback to derived label if missing)
  - resolved swatches for light and dark modes
  - CSS variable name(s)
  - quick copy action for token path and CSS variable
- Supports category filter (text, surface, border, interactive, focus, channel).

#### C. Reverse Lookup

- Input accepts hex value initially (`#RRGGBB`, `#RGB`).
- Returns exact matches first, then optional near matches.
- Match output includes:
  - token path
  - exactness label (`exact`, `near`)
  - distance score for near matches
  - resolved light/dark values
  - CSS variable name(s)
- If no semantic match exists, show nearest candidates and suggest intent search.

### Non-functional requirements

- Entirely static runtime for v1 (Storybook-only).
- Response target: result render under 120 ms for common queries on laptop baseline.
- Keyboard accessible controls and result navigation.
- Copy actions should provide deterministic text and visible success state.

### Data contract (search index)

Build a normalized JSON index generated from token source at build time.

Each index entry should include:

- `tokenPath`: canonical semantic token path
- `category`: top-level semantic group
- `description`: curated or derived natural-language description
- `aliases`: optional alternative phrases/synonyms
- `lightValue`: resolved value
- `darkValue`: resolved value
- `cssVarLight`: CSS variable token string
- `cssVarDark`: CSS variable token string

### Scoring model

Use a weighted score composed of:

- exact phrase match on token path and aliases
- term overlap in description
- category boost if filter active
- small recency/manual boost list for common intents (optional)

For reverse lookup near matches, use simple color distance threshold in v1 with deterministic ordering.

### File-level implementation plan

- Create finder docs page:
  - `stories/foundations/TokenFinder.mdx`
- Create UI and logic modules:
  - `stories/foundations/token-finder/TokenFinder.tsx`
  - `stories/foundations/token-finder/search.ts`
  - `stories/foundations/token-finder/reverseLookup.ts`
  - `stories/foundations/token-finder/types.ts`
- Create generated data file:
  - `stories/foundations/token-finder/data/token-index.json`
- Add build script to generate index from token source:
  - `scripts/generate-token-finder-index.(js|mjs)`
- Ensure Storybook nav placement under Foundations.

### Acceptance criteria

- A user can discover `text.primary` with a phrase such as "main body text".
- A user can paste a known color value and retrieve at least one exact semantic token match when available.
- Every result card exposes copyable token path and CSS variable.
- Light and dark swatches are visible for every returned token.
- No runtime network calls required in Storybook.

### QA checklist

- Keyboard-only flow for both inputs and result cards.
- Empty-state, no-match, and invalid-color states.
- Cross-check 20 representative queries from design and engineering.
- Confirm deterministic result ordering for identical queries.
- Validate rendering in both light and dark Storybook themes.

---

---

## Proposal D: Token Context Panel in Component Stories

### Summary

Add a "Tokens" panel for each component story showing tokens used by that component.

### User experience

For a selected component/story, panel shows:

- semantic tokens used
- resolved values for active theme/mode
- links back to token definitions / finder
- optional states (hover, pressed, disabled) if mapped

### Implementation approach

- Build metadata map: component -> token paths
- Render as Storybook addon/panel
- Keep mappings versioned with component docs/stories

### Why this is strong

- Deepens design/code parity
- Helps review and QA
- Makes token usage visible where people actually work

### Tradeoff

- Highest authoring/maintenance cost of all four proposals

---

## Agent Orchestration Plan (A + C)

This plan is structured for multi-agent execution with clear handoffs.

### Agent roles

- Architect agent
  - Finalizes scope, data contract, ranking rules, and acceptance criteria.
- Code agent
  - Implements UI, index generator, and wiring in Storybook.
- Testing agent
  - Runs validation, functional checks, and regression checks.

### Orchestration sequence

1. Architecture handoff

- Produce final implementation checklist from this section.
- Confirm v1 constraints: static only, no backend, A+C only.

2. Data pipeline first

- Implement `generate-token-finder-index` script.
- Generate `token-index.json` with resolved light/dark values.
- Validate schema completeness.

3. Core logic

- Implement `search.ts` (intent ranking) and `reverseLookup.ts` (value matching).
- Add deterministic sorting and threshold behavior.

4. UI composition

- Build `TokenFinder.tsx` and embed in `TokenFinder.mdx`.
- Add result cards, filters, copy actions, and empty states.

5. Storybook integration

- Place page under Foundations.
- Ensure build includes generated index.

6. Verification and sign-off

- Execute QA checklist.
- Capture known limitations and follow-up backlog.

### Definition of done

- All acceptance criteria in this document pass.
- Storybook page is discoverable and usable without external services.
- Implementation notes and known limits are documented in this file.

---

## MCP Additions: Implement Now (1-4)

These four tools should be added now to support the A+C scope and keep discovery logic centralized.

### 1) `discovery_index_export`

#### Purpose

Export a normalized semantic-token index for discovery UIs and scripts.

#### Input

- `includeCategories?: string[]`
- `includeAliases?: boolean` (default `true`)
- `format?: "json" | "compact"` (default `json`)

#### Output

- `version`: index schema version
- `generatedAt`: ISO timestamp
- `entries`: array of normalized token entries with:
  - `tokenPath`
  - `category`
  - `description`
  - `aliases`
  - `lightValue`
  - `darkValue`
  - `cssVarLight`
  - `cssVarDark`
  - `figmaVariablePath` (if available)

#### Notes

- Source of truth remains `packages/tokens/src/tokens.json`.
- Should resolve semantic values only.

### 2) `intent_rank_tokens`

#### Purpose

Rank semantic tokens from natural-language intent queries.

#### Input

- `query: string`
- `categories?: string[]`
- `mode?: "all" | "light" | "dark"` (default `all`)
- `limit?: number` (default `15`)
- `includeReasons?: boolean` (default `true`)

#### Output

- ranked matches with:
  - `tokenPath`
  - `score`
  - `category`
  - `lightValue`
  - `darkValue`
  - `reasons` (e.g., alias match, description overlap, category boost)

#### Notes

- Deterministic ordering required for equal scores.
- Use this as primary engine for Proposal A.

### 3) `reverse_lookup_color`

#### Purpose

Find exact and near semantic token matches from a color value.

#### Input

- `value: string` (hex in v1)
- `mode?: "all" | "light" | "dark"` (default `all`)
- `includeNear?: boolean` (default `true`)
- `threshold?: number` (distance cutoff)
- `limit?: number` (default `20`)

#### Output

- `exact`: exact matches list
- `near`: near matches list with:
  - `tokenPath`
  - `distance`
  - `modeValue`
  - `cssVar`
- `normalizedInput`: canonical parsed value

#### Notes

- Exact matches must always be returned ahead of near matches.
- Use this as primary engine for Proposal C.

### 4) `color_normalize`

#### Purpose

Normalize and validate input color values before lookup.

#### Input

- `value: string`

#### Output

- `valid: boolean`
- `hex`: canonical `#RRGGBB` (and optional alpha if supported)
- `rgb`: normalized RGB values
- `errors`: validation errors when invalid

#### Notes

- v1 can support hex first; rgb/hsl can be added without changing reverse lookup contracts.

### Delivery order

1. `color_normalize`
2. `discovery_index_export`
3. `intent_rank_tokens`
4. `reverse_lookup_color`

### Acceptance criteria for MCP additions

- Tools return stable, documented schemas.
- `intent_rank_tokens` and `reverse_lookup_color` are deterministic.
- `discovery_index_export` output can be consumed directly by Storybook A+C implementation.
- Invalid color input is handled gracefully via `color_normalize`.

---

## Recommended Rollout

### Phase 1 (Immediate): A + C (preferred)

Ship Token Finder and Reverse Lookup together.

- No backend required.
- Fastest path to practical value.
- Covers both find-by-intent and find-by-value workflows.

### Phase 2 (Next): D

Add component-level token visibility for implementation and QA workflows.

### Phase 3 (Optional / Strategic): B

Introduce conversational discovery once core retrieval quality is stable.

---

## Success Criteria

- Reduced hard-coded color/value usage in component code.
- Fewer "which token should I use?" support questions.
- Increased semantic token adoption in new component work.
- Faster onboarding for new designers/engineers.

---

## Open Questions

- Where should this live long-term: Storybook-only or shared docs surface?
- Do we need analytics on top search intents and failed searches?
- Should token descriptions be expanded to improve search quality?
- Who owns taxonomy and relevance tuning over time?

---

## Decision Snapshot

If we want the best impact-to-effort ratio now: **start with A + C**.
