Weekly changelog + TODO conventions

Purpose
- Keep changelogs and todos minimal and LLM-friendly by organizing them into weekly folders.

Location
- `.agents/weekly/YYYY-WW/CHANGELOG.md` — one-line human entries only (VERB SUBJECT [#TAG])
- `.agents/weekly/YYYY-WW/TODO.md` — short actionable items for the week (OWNER — TASK — ETA)
- `.agents/weekly/YYYY-WW/DETAILS/` — optional deeper files for subjects that need audit details

Rules
- Human-line format (strict):
  - VERB ∈ {ADDED, REMOVED, UPDATED}
  - Example: `UPDATED cream ramp for light mode (packages/tokens/src/tokens.json) #MEDIUM`
- TODO line format: `OWNER — TASK — ETA` (e.g., `Testing Agent — Run CI validations — today EOD`)
- Default retrieval: LLMs/readers load only the latest week's `CHANGELOG.md` and `TODO.md` unless older weeks are explicitly requested.
- Archival: Keep the last 4 weeks in `.agents/weekly/`; move older weeks to `.agents/weekly/archive/`.
- Small DETAILS files allowed for deep audits; reference them in the one-line changelog only.

Workflow
- When recording a change: append a one-line entry to the current week's `CHANGELOG.md` and add a matching TODO line if action is required.
- Do not edit past weekly files; for corrections, append a new line in the current week's changelog referencing the earlier week.

Testing
- Testing Agent should confirm that LLMs by default read only the latest week and that older weeks are fetched only on explicit request.

Notes
- This approach is intentionally manual to avoid dependency on scripts. If you later want automation (validators, summarizers), they can be added but are optional.