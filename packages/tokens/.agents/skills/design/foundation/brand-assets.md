---
name: brand-assets
description: The convention for brand marks in every generated screen, prototype and conversion. Your brand's logos live in brand-logos/ at the repo root; any surface that shows the brand uses those files. Never retype the wordmark as styled text, never redraw the logo, never substitute a lookalike serif.
license: MIT
metadata:
  category: design/foundation
  pillar: foundation
  agents: [Designer, Design Engineer, PM, Code]
  autonomy: autonomous
  portable: true
  cadence: always
---

# Brand Assets

## Purpose

A prototype that spells the wordmark in a fallback serif is off-brand. This convention gives every generating path one place to find the real marks and one rule for using them, so the brand survives every generation without anyone having to ask.

## The folder

`brand-logos/` at the repository root. This starter ships without logo files: add your own before generating screens that show a logo. A typical set:

| File | What it is | Use on |
|---|---|---|
| `logo-light.svg` | Primary wordmark or logotype, dark ink | Light surfaces: headers, print-like surfaces |
| `logo-dark.svg` | Wordmark, light/white | Dark surfaces: the global navigation bar, footers |
| `logo-mark.svg` | Compact symbol or monogram | Tight spaces, favicons, app tiles |

`brand-logos/README.md` carries provenance and the same rules; keep the two in step when adding files.

## The rules

1. **Always the file, never type.** Any generated surface that shows the brand references a file from `brand-logos/` (relative path from the artefact). Styled text is never an acceptable stand-in for the wordmark or mark.
2. **Never alter.** Keep aspect ratio. No stretching, recolouring, cropping, effects or opacity tricks.
3. **Right mark for the surface.** Dark-ink logotype on `--surface-canvas`; white inverse on `--surface-static-dark`.
4. **Copy stays written in full.** Write your brand's name in full, never abbreviated; the logo files are the only visual short form.
5. **Missing mark: flag it.** If a needed mark (an alternative variant, an app icon, a badge) is not in the folder, flag the gap in the run's change note and use a plainly labelled placeholder box, not an approximation. Export the real mark into the folder when access allows, and record its provenance in the README.

## Adding an asset

Export from the brand library or a live frame via the Figma connection, at working resolution or better (SVG preferred when export access exists; raster is acceptable and marked as a working reference). Name it descriptively, kebab-case (for example `logo-light.svg`, `logo-mark.svg`), add a row to `brand-logos/README.md` with provenance and date, and note the addition in the run manifest.

## Composition

* `compose_after`: `design/foundation/design-dna`
* Loaded by every generating path: the evolve and versions paths of `/design-start`, the conversion path of `/engineer-start`, `agents/prototyping-agent`, `agents/build-agent`.

## Related skills

* `./design-dna.md` — the brand this convention protects
* `./sandbox-runs.md` — where generated artefacts referencing these assets land
