---
name: extend-ramps
description: Extend the colour ranges of the white-label system - add a new accent tier, add shades to an existing ramp, add data-vis chart slots, and wire new tokens through source so a rebuild emits them across web and iOS.
license: MIT
metadata:
  category: color-ramps
  agents: [Architect, Code, Testing]
  autonomy: requires-approval (palette change)
---

# Extend Ramps

## Purpose

Safely widen the colour ranges of the brand-neutral design system on request. Covers four common extensions:

- (a) add a brand new accent tier (for example `quaternary` or a named accent) with light and dark values plus a matching foreground and WCAG-AA contrast guidance
- (b) extend an existing raw ramp with more shades (for example `25`/`975` or intermediate steps) while keeping perceptual spacing
- (c) add more data-vis `chart-N` slots
- (d) wire the new tokens through the source token JSON so a rebuild emits them across web (CSS/SCSS) and iOS

This skill orchestrates the change end to end. It does not re-derive lightness maths or contrast maths - it composes the sibling skills `color-ramps/ramp-generation` and `color-ramps/contrast-check` for those.

## Preconditions

- The source token files exist and are valid JSON. Discover them rather than assuming paths:
  - Raw ramps and named colour families (neutral, blue, teal): `packages/tokens/src/plugin-test/palette.json`
  - The shadcn-inspired semantic `theme` layer (background, foreground, card, popover, muted, border, input, ring, `primary`/`secondary`/`tertiary` + foregrounds, feedback `info`/`success`/`warning`/`error`/`destructive`, data-vis `chart-1..5`): `packages/tokens/src/plugin-test/semantic.json`
  - Underlying literal colours: `packages/tokens/src/plugin-test/foundation.json`
  - Legacy merged token tree still referenced by sibling skills: `packages/tokens/src/tokens.json`
- Both `Light` and `Dark` modes are understood as sibling top-level keys in each source file.
- You know that regenerating outputs requires the `output` build (Style Dictionary via `packages/output/config.js`), which cannot run offline. Author the source changes, then hand off the rebuild.
- Request approval before committing: any change here is a palette change.

## Inputs

| Parameter       | Type     | Required | Description                                                                                 |
| --------------- | -------- | -------- | ------------------------------------------------------------------------------------------- |
| `extension`     | enum     | yes      | `accent-tier`, `ramp-shades`, `chart-slots`, or `wire-through`                              |
| `name`          | string   | cond     | New tier name (for example `quaternary`) or new ramp name; required for `accent-tier`       |
| `base_ref`      | string   | cond     | Raw ramp reference the new tier maps to (for example `{brand.core.ramp.teal.600}`)          |
| `steps`         | number[] | no       | New steps to add to an existing ramp (for example `[25, 975]`)                              |
| `chart_count`   | number   | no       | How many additional `chart-N` slots to add                                                  |
| `mode`          | enum     | yes      | `light`, `dark`, or `both`                                                                   |

## Procedure

### Step 1: Discover the current shape

Before editing, read the source files and confirm the existing structure so the addition matches house conventions.

```python
import json

palette = json.load(open('packages/tokens/src/plugin-test/palette.json'))
semantic = json.load(open('packages/tokens/src/plugin-test/semantic.json'))

# Raw ramps live under a natural colour name with steps 50..1000
core_ramps = palette['Light']['brand']['core']['ramp']
print('core ramps:', list(core_ramps.keys()))

# The shadcn-inspired semantic tiers live under theme
theme = semantic['Light']['theme']
print('semantic tiers:', list(theme.keys()))

# A tier is one token plus its foreground token, each referencing a raw step
print(json.dumps(theme['primary'], indent=1))
print(json.dumps(theme['primary-foreground'], indent=1))
```

A tier token has the shape `{ "$type": "color", "$value": "{brand.core.ramp.<name>.<step>}", "$description": "..." }`. Foregrounds follow the same shape and point at a contrasting step (usually a near-white or near-black raw step).

### Step 2 (a): Add a brand new accent tier

1. Make sure a raw ramp exists for the accent. If not, generate one first with `color-ramps/ramp-generation` (it maintains 50..1000 step intervals and OKLCH lightness spacing).
2. Add the tier and its foreground to the `theme` layer in BOTH `Light` and `Dark` under `semantic.json`, mirroring `primary`/`primary-foreground`.

```python
def add_accent_tier(semantic, name, base_ref, fg_ref):
    """Add <name> and <name>-foreground to both modes' theme layer."""
    for mode in ('Light', 'Dark'):
        theme = semantic[mode]['theme']
        theme[name] = {
            "$type": "color",
            "$value": base_ref,   # e.g. "{brand.core.ramp.teal.700}"
            "$description": f"{name.capitalize()} accent tier."
        }
        theme[f"{name}-foreground"] = {
            "$type": "color",
            "$value": fg_ref,     # contrasting step for text/icons on the tier
            "$description": f"Foreground on {name}."
        }
    return semantic
```

3. Choose the light and dark `$value` per mode if they should differ (dark mode often maps to a lighter step of the same family; see `color-ramps/dark-mode-mapping` for the reversal rules on neutral-driven values).
4. Verify the foreground meets WCAG AA on the tier surface, in both modes, using `color-ramps/contrast-check` (target 4.5:1 for text, 3.0:1 for large text and UI). Adjust the foreground step until it passes with margin before continuing.

### Step 2 (b): Extend an existing ramp with more shades

Add the new steps to the raw ramp in `palette.json` (both modes), keeping perceptual spacing. Do not hand-pick hex values by eye - delegate the lightness maths to `color-ramps/ramp-generation`, which applies OKLCH modifiers relative to the ramp base step.

```python
def add_ramp_steps(palette, family, new_steps):
    """Insert new steps into an existing named ramp in both modes.
    The step VALUES should come from ramp-generation, not guessed here."""
    for mode in ('Light', 'Dark'):
        ramp = palette[mode]['brand']['core']['ramp'][family]
        for step in new_steps:
            # placeholder token; real $value/OKLCH modifier from ramp-generation
            ramp[str(step)] = {"$value": None, "$type": "color"}
        # Re-sort so downstream reads stay ordered 25,50,100,...,975,1000
        palette[mode]['brand']['core']['ramp'][family] = {
            k: ramp[k] for k in sorted(ramp, key=lambda s: int(s))
        }
    return palette
```

Typical extensions are endpoint shades (`25`, `975`) for extra-light/extra-dark surfaces, or intermediate steps to smooth a gap. Keep the interval regular: if the ramp runs in 50s, add 25/975 at the ends rather than an odd single mid-step, so the perceptual spacing stays even.

### Step 2 (c): Add more data-vis chart slots

The `chart-1..5` slots live in the `theme` layer and each reference a distinct data-vis ramp. Add higher-numbered slots in both modes, each pointing at an unused data-vis family so series stay visually distinct.

```python
def add_chart_slots(semantic, palette, start_from, count):
    dv = palette['Light']['brand']['data-visualisation']['ramp']
    families = list(dv.keys())  # e.g. darkBlue, yellow, lightBlue, orange, teal...
    for i in range(count):
        n = start_from + i
        family = families[(n - 1) % len(families)]
        for mode in ('Light', 'Dark'):
            semantic[mode]['theme'][f"chart-{n}"] = {
                "$type": "color",
                "$value": f"{{brand.data-visualisation.ramp.{family}.500}}",
                "$description": f"Data-vis series {n}."
            }
    return semantic
```

Prefer families that already read as distinct categorical hues. If you run out, generate a new data-vis ramp with `color-ramps/ramp-generation` before adding the slot.

### Step 3: Wire through and rebuild

New source tokens only reach consumers after the `output` build resolves and formats them.

1. If the legacy merged tree `packages/tokens/src/tokens.json` is still consumed by a workflow, mirror the new tokens there too (sibling discovery skills read that file).
2. The `output` package reconciles sources into `tokens-reconciled.json` (`npm run reconcile` in `packages/output`), then Style Dictionary (`packages/output/config.js`) emits per platform:
   - web CSS via `formatCSS`
   - web SCSS via `formatSCSS` / `formatSCSSPalette`
   - iOS Swift via `formatIOSColours` into `packages/theme-ios/src`
3. This build cannot run offline. Note that a rebuild is required and hand off, or run it where the toolchain is available, then confirm the new tier/steps/chart slots appear in each platform output.

## Outputs

| Output          | Type   | Description                                                    |
| --------------- | ------ | ------------------------------------------------------------- |
| `edited_files`  | array  | Source files changed (palette.json, semantic.json, ...)        |
| `new_tokens`    | array  | Fully-qualified paths of tokens added, per mode                |
| `contrast`      | object | AA results for any new tier/foreground pair, both modes        |
| `rebuild_note`  | string | Reminder that the Style Dictionary output build must be run    |

## Error Handling

| Error                              | Recovery                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `Raw ramp missing for accent`      | Generate the ramp first with `color-ramps/ramp-generation`               |
| `Foreground fails AA`              | Pick a more contrasting raw step; re-check with `color-ramps/contrast-check` |
| `Tier added to one mode only`      | Always add to both `Light` and `Dark`; parity is required                |
| `Steps out of order`               | Re-sort ramp keys numerically after inserting                            |
| `New token absent from output`     | Run the `output` reconcile + build; it cannot run offline                |

## Examples

### Example 1: Add a `quaternary` accent tier

```
INVOKE: skill/color-ramps/extend-ramps
INPUTS: {
  extension: "accent-tier",
  name: "quaternary",
  base_ref: "{brand.core.ramp.teal.700}",
  mode: "both"
}
RESULT: {
  edited_files: ["packages/tokens/src/plugin-test/semantic.json"],
  new_tokens: [
    "Light.theme.quaternary", "Light.theme.quaternary-foreground",
    "Dark.theme.quaternary", "Dark.theme.quaternary-foreground"
  ],
  contrast: { light: { ratio: 5.9, passes: true }, dark: { ratio: 6.4, passes: true } },
  rebuild_note: "Run packages/output reconcile + Style Dictionary build"
}
```

### Example 2: Add endpoint shades 25 and 975 to the blue ramp

```
INVOKE: skill/color-ramps/extend-ramps
INPUTS: { extension: "ramp-shades", name: "blue", steps: [25, 975], mode: "both" }
NOTE: step $values come from color-ramps/ramp-generation (OKLCH spacing),
      not chosen by hand.
```

### Example 3: Add chart-6 and chart-7

```
INVOKE: skill/color-ramps/extend-ramps
INPUTS: { extension: "chart-slots", chart_count: 2, mode: "both" }
RESULT: new_tokens includes Light.theme.chart-6, Dark.theme.chart-7, ...
```

## Best Practices

1. **Both modes, always**: every new tier, shade, or chart slot must exist in `Light` and `Dark`.
2. **Compose, do not duplicate**: get lightness spacing from `color-ramps/ramp-generation` and AA verification from `color-ramps/contrast-check`.
3. **Reference raw steps**: semantic tiers should point at raw ramp steps, never at literal hex, so rebrands stay clean.
4. **Stay brand-neutral**: use natural-language, generic names (accent, quaternary, teal). Do not introduce any specific brand naming.
5. **Keep perceptual spacing**: extend ramps at the endpoints or on the regular interval; avoid single odd mid-steps.
6. **Flag the rebuild**: source edits are inert until the offline `output` build runs; say so explicitly.
7. **Get approval**: this is a palette change - confirm before committing.
