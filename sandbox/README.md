# Sandbox

Every design or code generation made with the system lands here, each in its own folder, never overwritten. If this folder looks empty, that just means nothing has been generated yet.

## How it is organised

```
sandbox/
  <project>/                    one folder per thing being designed
    <YYYY-MM-DD>-<run-slug>/    one folder per generation
      MANIFEST.md               what was asked, what ran, what came out
      <the artefacts>           the generated screen, page or code
      reports/                  critiques, audits and specs for this run
```

Example: `sandbox/checkout/2026-07-21-darker-header/`.

## The three rules

1. **Never edit a past run.** Want to iterate? Generate again; a new dated folder appears next to the old one. The history of every attempt stays intact.
2. **The manifest tells the story.** Open any run's `MANIFEST.md` to see what was asked, which inputs were used, and what came out. No archaeology needed.
3. **You never manage this by hand.** `/design-start` and `/engineer-start` create the folders and write the manifests automatically. You just design.

## Why it exists

Generations used to land wherever the moment put them, and a second attempt could quietly destroy the first. Now every attempt is kept, comparable and traceable, and the system's learning loop reads these folders to get better over time.

The full convention lives in the design suite at `foundation/sandbox-runs.md`.

The sandbox starts empty. As soon as you run `/design-start` or `/engineer-start`, runs will land here in the shape above.
