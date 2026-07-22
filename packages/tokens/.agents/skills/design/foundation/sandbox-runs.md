---
name: sandbox-runs
description: The home and safety convention for every generation. Whenever a designer or engineer generates something (a screen, a flow, a component, a conversion, a set of versions), the work lands in its own immutable run folder inside sandbox/, with a manifest that records what was asked, what ran, and what came out. Past runs are never edited; iteration means a new run. The convention that makes every generation findable, comparable and safe.
license: MIT
metadata:
  category: design/foundation
  pillar: foundation
  agents: [Designer, Design Engineer, PM, QA]
  autonomy: autonomous
  portable: true
  cadence: every-generation
---

# Sandbox Runs

## Purpose

Give every generation its own secured home. Before this convention, generated screens, prototypes and conversions landed wherever the moment put them, and a second attempt could overwrite the first. Now each generation gets a fresh, dated folder inside `sandbox/`, self-described by a manifest, and never touched again. The sandbox becomes the record of everything the system has made, which is also exactly what the learning loop and the usage reports need to read.

## The structure

```
sandbox/
  <project>/                      one folder per thing being designed
    LATEST.md                     optional index of runs, newest first
    <YYYY-MM-DD>-<run-slug>/      one folder per generation, immutable
      MANIFEST.md                 what was asked, what ran, what came out
      <the artefacts>             the generated screen, page, code, versions
      DEV-SPEC.html               engineer quick view (required when the artefact is a screen or page)
      reports/                    the skill reports for this run
        CRITIQUE.md  A11Y.md  TOKENS.md  CONVERSION.md  ...
```

Example:

```
sandbox/
  checkout/
    2026-07-20-first-pass/
    2026-07-21-darker-header/
    2026-07-21-darker-header-2/
  live-blog/
    2026-07-22-six-versions/
```

## Naming rules

* **Project slug**: kebab-case, from the feature or project name the wizard already asks for (`checkout`, `saved-articles`, `live-blog`). One project folder per thing, reused across runs.
* **Run folder**: `<YYYY-MM-DD>-<run-slug>`. The date is the run date. The run slug is two to four kebab-case words describing the attempt (`first-pass`, `darker-header`, `six-versions`, `react-conversion`).
* **Collision**: same project, same day, same slug already exists: append `-2`, `-3`. Never overwrite, never merge into an existing run folder.

## The manifest

Every run folder contains a `MANIFEST.md`, written when the run completes:

```markdown
# Run: <project> / <YYYY-MM-DD>-<run-slug>

> Entry: <design-start | engineer-start | design | direct>
> Path: <path id, e.g. evolve.add or convert.react>
> Date: <ISO timestamp>
> Previous run: <folder name or "none">

## The ask
<one line, the designer's or engineer's request in their words>

## Inputs
- <Figma link | screenshot filename | pasted code | description>
- Target: <web desktop | web mobile | responsive web | native ios | "n/a">
- Channel: <name or "none">
- Tokens snapshot: <git sha or "n/a">

## What ran
- Skills: <list>
- Agent: <name or "none">

## What came out
- <artefact filename>: <one line on what it is>
- reports/<file>: <one line>

## Next steps
<the recommended next moves, e.g. "run a critique", "convert to React">
```

The manifest never contains subscriber content or full prompt transcripts. One line for the ask is enough.

## The rules

1. **Append only.** A past run folder is never edited, renamed or deleted by any skill or agent. Iteration means a new run folder, with `Previous run` set in the manifest so the chain is traceable.
2. **Unified home.** While a run is active, any skill contract that says its report lands in `.design/<feature>/` writes it to the run folder's `reports/` instead. `.design/` remains only for quick checks with no project attached (a one-off critique of an external screenshot).
3. **Create on demand.** If `sandbox/` or the project folder does not exist, create it silently. Never ask the user where to put a generation; the convention decides.
4. **LATEST.md is the only mutable file.** At project level, it may be rewritten to list runs newest first with one line each. Everything inside run folders is frozen.
5. **The manifest is written last.** Artefacts first, reports second, manifest once the run is complete. A folder without a manifest is a run that did not finish, which is itself useful signal for the usage report.
6. **The dev spec rides along.** Any run whose artefact is a screen, page or feature build also produces `DEV-SPEC.html` in the run folder root, per `handoff/dev-spec`: the engineer's quick view of the components used, the tokens used, each with its status, plus the target surface and the open questions. It is written in the same pass as the artefact, from the generation's own record, and listed in the manifest. Runs with no built screen (a flow document, a check-only report) skip it.

## Procedure (for the generating command or skill)

1. Derive the project slug from the feature name already collected. Derive the run slug from the ask.
2. Create `sandbox/<project>/<date>-<run-slug>/` (apply the collision rule) and `reports/` inside it.
3. Generate into the run folder; when the artefact is a screen or page, write `DEV-SPEC.html` beside it in the same pass (rule 6, per `handoff/dev-spec`). Reports from composed skills go to `reports/`.
4. Write `MANIFEST.md`. Update the project's `LATEST.md`.
5. Append the usage line per `coordination/usage-log`, including the run folder path in `artifacts`.

## Output Contract

The run folder itself is the output. When reporting completion to the user, state the folder path in plain words ("saved in sandbox under checkout, run 2026-07-21-darker-header") and list the artefacts. Machine summary:

```json
{
  "skill": "design/foundation/sandbox-runs",
  "project": "<slug>",
  "run": "<YYYY-MM-DD>-<run-slug>",
  "previous_run": "<folder or null>",
  "artifacts": ["sandbox/<project>/<run>/<file>", "..."],
  "reports": ["sandbox/<project>/<run>/reports/<file>", "..."]
}
```

## Error Handling

* **Cannot create the folder.** Stop and say so before generating; never generate into an unmanaged location as a fallback.
* **Collision suffix exhausted (unlikely).** Add the time: `<date>-<slug>-<HHMM>`.
* **A skill tries to edit a past run.** Refuse, cite this convention, and offer a new run instead.
* **Manifest write fails after generation.** Report it plainly so the human can fix the folder; do not delete the artefacts.

## Composition

* `compose_after`: the generating paths of `/design-start` and `/engineer-start`, `agents/prototyping-agent`, `agents/build-agent`, `handoff/stack-convert`.
* `compose_before`: `handoff/dev-spec` (writes the engineer quick view into the run folder), `agents/learning-agent` (reads manifests for capture), `coordination/usage-report` (reads run folders for the weekly roll-up).
* Pre-convention folders (projects without manifests) are welcome in `sandbox/`; they simply predate the rules and are read-only history.
