# Restructure log (historical): everything that changed, 20 July 2026

> Purpose: the complete record of the working sessions on this repo, newest last, for the owner and for the design system specialist who picks it up next.
> Status at the end: local folder only (git disconnected on purpose), full consistency check green after every change.
> This is a historical record of a past restructuring session. Nothing here is an instruction; see `START-HERE.md` and `README.md` for current orientation.
> Read `START-HERE.md` first if you are new to the repo. This document is the changelog; that one is the map.

## The one-paragraph summary

This session redesigned the design intake (`/design-start`) around focal paths in plain language, created its engineering mirror (`/engineer-start`) to close the designer-prototype-to-production gap, added six new capabilities as skills (rebrand, Mobbin patterns, stack conversion, usage telemetry times two, retrofit learning), introduced the sandbox run-folder convention so every generation is kept and never overwritten, consolidated three overlapping design docs into one guide, cleaned committed junk out of the repo, disconnected git to make the folder local-only, and added a repo map. Every change was verified against a consistency check (tokens, skills, agents, symlinks, commands) and nothing in the four-IDE wiring was broken.

## 1. New files (14)

| File | What it is |
|---|---|
| `START-HERE.md` (root) | The repo map: three layers (product, agent system, docs), where to start by task, the folder table, the IDE symlink wiring, the safety rules. |
| `RESTRUCTURE-LOG.md` (root) | This document. |
| `.claude/commands/engineer-start.md` | The engineer intake: pick up a handoff, convert a prototype into the production stack, build a component properly, check what was built, ask a question. Mirrors `/design-start`. |
| `packages/tokens/.agents/skills/rebrand/rebrand-system.md` | Forks the whole suite to a new brand or product by swapping the grounding layer (DNA, tokens, rules, voice, corpus) while keeping all machinery. Reads a Figma file plus an optional moodboard; maps colours, logo, type, corners, shapes and buttons to exactly where each lands. Dry-run by default. |
| `packages/tokens/.agents/skills/reference/mobbin-patterns.md` | Uses the Mobbin MCP (one tool, `search_screens`, 600k+ shipped screens, needs a paid plan and OAuth) as prior-art grounding for generation. Precedence: own corpus beats Mobbin beats guessing. Strict anti-copying rules. |
| `packages/tokens/.agents/skills/design/MOBBIN-FOR-DESIGNERS.md` | The plain-language explainer of the above for designers. |
| `packages/tokens/.agents/skills/design/PROMPT-COOKBOOK.md` | User-friendly docs: ten scenarios organised by situation, copy-paste prompts, good-versus-weak prompt pairs, an FAQ. Linked from GUIDE. |
| `packages/tokens/.agents/skills/design/handoff/stack-convert.md` | The conversion engine behind `/engineer-start`: AI prototype, HTML, screenshot or Figma frame into React, WordPress, iOS, Android or plain CSS, under a fidelity contract (layout preserved, colours mapped to nearest semantic token with a mapping table, custom widgets swapped for real components, unknowns flagged never guessed). Approval-gated. |
| `packages/tokens/.agents/skills/coordination/usage-log.md` | The telemetry convention: every skill and agent run appends one metadata line (never prompt text or design content) to the week's `usage.jsonl`. Includes the three honest "did not help" proxies: explicit feedback, manual re-prompt within the hour, abandoned runs. Logging never blocks work. |
| `packages/tokens/.agents/skills/coordination/usage-report.md` | The weekly roll-up: totals by skill, agent and entry point, outcome breakdown, friction list, week-over-week deltas, up to three evidence-cited upgrade suggestions. All numbers computed by an embedded script, never estimated. |
| `packages/tokens/.agents/skills/design/agents/learning-agent.md` | The retrofit learning loop: capture every generating run, evaluate in batches against three gates (objective met, critique score 80 plus with no accessibility errors, zero token-audit errors), distil passing runs into cited lessons, propose skill improvements after a lesson recurs three times. Never edits skills, rules or the DNA itself; humans promote. |
| `design-corpus/retrofit/RETROFIT-LOOP.md` | The team explainer for the learning loop. |
| `packages/tokens/.agents/skills/design/foundation/sandbox-runs.md` | The sandbox convention: every generation lands in `sandbox/<project>/<YYYY-MM-DD>-<run-slug>/` with a `MANIFEST.md` (the ask, inputs, what ran, what came out) and its reports in `reports/`. Append-only: past runs are never edited; iteration is a new folder. Collisions auto-suffix. |
| `sandbox/README.md` | The human explainer for the sandbox: the structure, the three rules, why it exists. |

## 2. Modified files (7)

| File | What changed |
|---|---|
| `.claude/commands/design-start.md` | Rewritten twice, then extended. First: from a five-route classifier to the focal-path wizard (modes Diverge and Converge, each path a contract naming its skills, agent, deliverable and weight). Second: designer-facing copy rewritten in plain common language (no "diverge", "converge", skill names or file paths visible; those words remain internal routing only), plus the first-run Figma nudge: a screenshot is enough to start, connect the Figma desktop MCP for token-precise results, never nag or block. Finally: Step 8 added, wiring every generating path into the sandbox run-folder convention. |
| `.claude/commands/engineer-start.md` | Extended after creation with its own Step 8 (sandbox run folders; the build-component path still writes production files to `packages/` after approval, with its plan and reports recorded in the run folder). |
| `packages/tokens/.agents/skills/design/GUIDE.md` | Now the single how-to for the suite. The getting-started walkthrough from the retired ONBOARDING is folded in, the `.design` output-file glossary added, a link to the new PROMPT-COOKBOOK added, and the "where things go" section updated for the sandbox convention and the renamed folder. |
| `packages/tokens/.agents/skills/design/README.md` | Slimmed to the architecture map (pillars, composition rules, MCP tools) with a clear signpost at the top: new people read GUIDE. The old "start with ONBOARDING" line removed. |
| `.continue/rules/designer.md` | Reference repointed from `design/ONBOARDING.md` to `design/GUIDE.md`. |
| `portal/index.html` and `portal/how-to-use.html` | Download links repointed from ONBOARDING to GUIDE; "onboarding doc" wording updated. |
| `sandbox/live-blog/FLOW.md` | Old folder name reference updated after the sandbox rename. |

## 3. Moved and renamed (5)

| Was | Now | Why |
|---|---|---|
| `.git/` | `.git_REMOVED_backup/` (owner did this) | Owner wanted a local-only folder for this testing copy. The folder is no longer a git repo. Company git remains the recovery source. |
| `sandbox-designpages-testing/` | `sandbox/` | Clean name for the new run-folder convention. The three existing explorations (comment-follow-button, events-landing, live-blog) became its first projects; they predate the convention, carry no manifests, and are read-only history. |
| `rebrand/rebrand-system.md` (repo root) | `packages/tokens/.agents/skills/rebrand/` | The skill belongs beside the other 14 skill families, where the four-IDE symlink picks it up. |
| `design/ONBOARDING.md` | `_to_delete/` | Retired; its content lives in GUIDE. All references repointed first. |
| `output.txt`, `output_final.txt`, `temp_urls/`, `.playwright-mcp/`, root `.DS_Store` | `_to_delete/` | Junk: two identical 600 KB dumps, scratch HTML, and test-run noise that had been committed. |

`_to_delete/` also holds the intermediate `.NEW` copies used to install commands (the remote tools cannot write into `.claude/` directly, so files were placed at the root and copied in). The whole folder is safe to delete permanently: `rm -rf _to_delete .git_REMOVED_backup` when the owner is ready.

## 4. The design decisions worth remembering

**A path is a focal contract.** The intake redesign's core idea: each path names exactly what it loads, what it runs and what it produces, and skips the rest of the suite. This cuts token cost and sharpens the designer's focus at the same time. Diverge is cheap on purpose (low-fidelity, most of it discarded); Converge is where fidelity and effort go.

**Plain language at the surface, system language underneath.** Designers see "Check this design" and "Build on a screen I have", never route names, skill names or file paths. The hard rule is written into both commands so the model cannot leak jargon into the options.

**The unify rule for outputs.** The owner chose to unify reports with generations. Implemented as a resolution rule rather than a thirty-file rewrite: while a sandbox run is active, any skill whose contract says `.design/<feature>/` writes to the run's `reports/` instead; `.design/` survives only for quick checks with no project attached.

**Propose, never self-modify.** Both the corpus and the new learning loop follow the same safety pattern: the system proposes rule candidates and skill improvements with evidence; a human promotes them. Nothing edits the DNA, the rules or a skill automatically.

**The `.agents` system stays where it is.** The one big move considered and rejected: promoting `.agents` out of `packages/tokens`. The agents exist to govern the tokens (deliberate co-location), and the skills are symlinked into four IDE folders with hardcoded references across `.claude`, `.cursor`, `.continue` and `.github`. `START-HERE.md` solves findability without breaking any of it. If the physical move is ever wanted: restore git first, move, update all four IDE references together, run `npm run sync:skills`, re-run the consistency check.

## 5. How the new pieces feed each other

`/design-start` and `/engineer-start` generate into sandbox run folders. Each run's `MANIFEST.md` records the ask, inputs, skills and outcome, which is exactly what the learning agent reads in its capture phase. The usage log counts every run and flags friction; the weekly report turns that into evidence; the learning agent turns passing runs into lessons and recurring lessons into proposed skill improvements; humans promote the good ones; the skills improve. Mobbin and the design corpus ground what gets generated in the first place. The loop is closed.

## 6. Still open (small, deliberate)

- **Telemetry adoption**: each skill's output contract needs the one-line "append a usage line" instruction added (a mechanical sweep, not yet run).
- **Mobbin access**: needs a paid Mobbin plan and OAuth sign-in per person before `mobbin-patterns` can actually search.
- **Evolve and Versions**: the two generative design paths run inline from the command's instructions; they do not yet have dedicated skill files.
- **A `/rebrand` command**: the skill exists; a one-line command in `.claude/commands/` would surface it (the owner can drop one in, since remote tools cannot write there).
- **`_to_delete/` and `.git_REMOVED_backup/`**: awaiting the owner's `rm -rf`.
- **Code Connect**: still not wired (pre-existing); the build paths record it as pending rather than pretending.

## 7. The consistency check used after every change

```
tokens:   packages/tokens/src/tokens.json parses; foundation + semantic sets intact
skills:   .claude/skills symlink resolves; 15 families present (14 original + rebrand)
design:   GUIDE.md + README.md present; ONBOARDING retired; portal links point to GUIDE
commands: design-start, design, engineer-start present; DNA + router paths resolve
sandbox:  sandbox/ renamed; README present; old name referenced nowhere
connect:  skills read correctly through the .claude symlink
refs:     no dangling references to any moved or retired file
```

All green at session end.

## Appendix: session artefacts that live outside the repo

Produced during the session and delivered in the conversation (not committed, by design): the interactive focal-path map (`design-start-path-map.html`, also saved as a desktop artefact), the written intake redesign spec (`design-start-v2-recommendation.md`), and the earlier standalone copy of the rebrand skill. The committed versions above are the source of truth.

---

# Session log: dev spec and target surface, 21 July 2026

> The second working session of 21 July. Everything below is local only, same as before. Two learnings from the full-page video rail run became suite conventions: every generated screen now ships with an engineer's dev spec page, and the design intake asks where the design will live before anything is drawn.

## Catch-up: the earlier 21 July session (not previously logged)

Three things were locked in the session before this one, recorded here so the log has no hole:

- **The whole-screen rule.** The design-start "Build on a screen" path and the engineer-start conversion reproduce the entire base screen at full fidelity, then apply the change. Placeholder blocks are allowed only for photography and adverts, never for structure, copy or chrome. Codified in both command files.
- **Brand marks from `brand-logos/`.** Real brand logos (crest masthead, inverse nav wordmark) live at the repo root; the rule "always the file, never retype the wordmark" lives in the new `foundation/brand-assets.md` and a Brand marks bullet in the DNA TL;DR.
- **The sandbox convention in real use.** `sandbox/home-page-v2/` gained two runs: a rail-only first pass, superseded by `2026-07-21-full-page-video-rail`, the full homepage rebuild with the Video briefing rail bound to `theme-css` variables.

## The one-paragraph summary

This session added the dev spec convention (every generation that builds a screen or page also writes `DEV-SPEC.html` into the same run folder, in the same pass: an engineer's one-minute quick view of the components used, the tokens used, each with an honest status, the target surface and the open questions) and the target-surface question (the design intake now asks "Where will this live?" with four answers: web desktop, web mobile, responsive web page, or native iOS app in Swift, because the grid, the patterns, the components and the token set all change with the answer). One new skill carries the dev spec contract; eight existing files were rewired to make both true across the designer intake, the engineer intake, the router, the conversion engine, the Copilot surface and the portal, which was also refreshed to list four skills it had fallen behind on.

## 1. New files (1)

| File | What it is |
|---|---|
| `packages/tokens/.agents/skills/design/handoff/dev-spec.md` | The dev spec contract. `DEV-SPEC.html` is one self-contained HTML page in the run folder root: what was built, a components table (element, component used, status: existing / variant needed / gap / estimated), a tokens table (token path, role, status: bound / nearest / flagged), the status counts, and the next moves for the engineer. Written from the generation's own record, never re-derived by guessing. The quick view, not the packet: frame-to-spec, spec-packet and CONVERSION.md remain the deep artefacts. Flow documents and check-only runs skip it. |

## 2. Modified files (8)

| File | What changed |
|---|---|
| `packages/tokens/.agents/skills/skills.json` | `dev-spec` registered under `design/handoff`. Now 105 entries; every registered path verified against disk. |
| `packages/tokens/.agents/skills/design/foundation/sandbox-runs.md` | `DEV-SPEC.html` added to the run-folder structure; new rule 6 ("the dev spec rides along"); the manifest template gained a `Target:` line (web desktop, web mobile, responsive web, native ios); procedure and composition updated. |
| `.claude/commands/design-start.md` | New Step 6, "where will it live": a clickable question for any path that generates a full page or feature, with the four target surfaces. The sniff step answers it from context when it can (a phone-frame base screen, "on mobile" in the description, a Swift context) and confirms in the receipt instead of asking. Old Steps 6 to 8 renumbered 7 to 9; the intake is now four clicks at most. Step 9 writes the dev spec in the same pass as the artefact; the receipt and the Build-on-a-screen deliverable name it. |
| `.claude/commands/engineer-start.md` | The conversion deliverable now includes `DEV-SPEC.html` beside the code and `CONVERSION.md`. Handoff pickup reads a run's dev spec first as the fastest map of what the designer made; the sniff step now also spots a waiting `DEV-SPEC.html` in `sandbox/`. |
| `packages/tokens/.agents/skills/design/design-router.md` | New `target` input and a `target` field in the output contract, both never silently defaulted. Guided mode gained G3 "Where will it live" (old G3 and G4 became G4 and G5; up to four questions now). The new-experience sequence notes that built screens land in a sandbox run with the dev spec beside them. |
| `packages/tokens/.agents/skills/design/handoff/stack-convert.md` | Step 7 also writes `DEV-SPEC.html`, derived directly from the two mapping tables with statuses carried over (exact and bound become bound, nearest stays nearest, flagged stays flagged; matched widgets become existing, swaps become variant needed, gaps stay gaps). The dev spec summarises the report and never contradicts it. |
| `packages/tokens/.agents/skills/design/portal/index.html` | Refreshed to 32 skills. Added the four the portal had fallen behind on: `sandbox-runs` and `brand-assets` (Foundation, now 6), `stack-convert` and `dev-spec` (Handoff, now 7). Pillar counts corrected. |
| `.github/prompts/design-start.prompt.md` | The Copilot surface mirrors both changes: the G3 target question and the dev spec landing beside every generated screen. |

## 3. The design decisions worth remembering

**The dev spec is the quick view, never the packet.** The sixty seconds after "look what I made" should be grounded in real component and token names, without waiting for a full handoff. The deep artefacts (frame-to-spec, spec-packet, CONVERSION.md) still run when the feature is ready to ship; the dev spec never replaces them.

**Statuses come from the run's own record.** The dev spec is written in the same pass as the artefact, from the decisions the generation actually made. Nothing is re-derived afterwards, nothing is upgraded to look healthier: estimated and flagged are worn openly. A dev spec that claims everything is bound when the run worked from a screenshot is worse than none.

**The target surface is the designer's call.** Web desktop, web mobile, responsive web and native iOS are different design problems, so the intake asks rather than assumes. Sniff first (the context often answers it), confirm inferences in the receipt, never default silently. Native iOS means iOS patterns and safe areas, the `theme-ios` token names, a SwiftUI mapping in the dev spec, and the `figma-swiftui` skill when writing to Figma; the web targets prototype in HTML on the `theme-css` variables.

## 4. Still open

- **The registry gap, pre-existing and now visible:** `stack-convert.md`, `sandbox-runs.md`, `brand-assets.md` and `learning-agent.md` are on disk but not in `skills.json` (the doc files GUIDE, README, PROMPT-COOKBOOK and MOBBIN-FOR-DESIGNERS are unregistered on purpose). `learning-agent` also has no portal agent card. Left alone deliberately; reconciling is a small mechanical sweep.
- Everything in section 6 of the 20 July log still stands (telemetry sweep, Mobbin auth, dedicated Evolve and Versions skill files, the `/rebrand` command, the `_to_delete/` folders, Code Connect).
