# Plugin Pilot

This folder is the self-contained pilot for exporting the token system to the Figma Variable Sync to Repo plugin.

- Run `node packages/tokens/src/plugin-test/generate-pilot.mjs` from the repo root.
- Generated files stay in this folder: `foundation.json`, `palette.json`, `semantic.json`, and `generation-report.json`.
- The pilot replaces Token Studio color modifiers with OKLCH-generated values.
