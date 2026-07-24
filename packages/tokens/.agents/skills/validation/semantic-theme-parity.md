---
name: semantic-theme-parity
description: Validate semantic theme parity for Figma Variables export by enforcing strict structural parity across light and dark modes.
license: MIT
metadata:
  category: validation
  agents: [Architect, Code, Testing, 'React Expert']
  autonomy: autonomous
---

# Semantic Theme Parity

## Purpose

Validate semantic theme token parity across light and dark modes so Figma Variables export stays stable: strict 1:1 structural parity is required.

## Core Principle: 1:1 Semantic Token Mapping Across Themes

**All semantic tokens are structurally and semantically identical across all themes.** For a given semantic token like `messaging.fill.warning`, the meaning and implementation are 1:1 across `light/ core` and `dark/ core`.

Implication: When searching for a semantic token (e.g., warning modal background), do not select between themes. Always use the canonical semantic token. Theme selection does not change semantic meaning or implementation.

For token search/discovery agents: If a search returns the same semantic token from multiple themes with the same value, collapse to a single recommendation with a note that it is 1:1 mapped.

## Documentation Inputs (Required)

Before planning or validating semantic rollouts, read:

- `packages/tokens/docs/reference/semantic-tokens.md`

Use docs as source-of-truth for semantic mapping contracts. Keep briefs generalist and avoid embedding long, token-specific tables there.

## Preconditions

- `packages/tokens/src/tokens.json` exists and parses as valid JSON.
- This workflow is read-first and must not edit `tokens.json` during parity analysis.
- `light/ core` and `dark/ core` must exist as rollout baselines.

## Inputs

| Parameter                   | Type    | Required | Description                                                               |
| --------------------------- | ------- | -------- | ------------------------------------------------------------------------- |
| `file_path`                    | string  | no       | Path to token source (default: `packages/tokens/src/tokens.json`)                       |
| `require_matching_theme_count` | boolean | no       | Enforce that light and dark expose the same number of semantic themes (default: `true`) |

## Procedure

### Step 1: Discover Semantic Themes and Confirm Matching Counts

Use explicit discovery and exclude non-semantic sets:

- Exclude: `light/ brand`, `dark/ brand`, `light/ marketing`, `dark/ marketing`, `light/ dataVisualisation`, `dark/ dataVisualisation`
- Include only top-level token sets matching `light/ *` or `dark/ *`

```javascript
const excluded = new Set([
  'light/ brand',
  'dark/ brand',
  'light/ marketing',
  'dark/ marketing',
  'light/ dataVisualisation',
  'dark/ dataVisualisation'
]);

const sets = Object.keys(tokens);
const semantic = sets.filter(
  (k) => /^(light|dark)\/ /.test(k) && !excluded.has(k)
);
const lightThemes = semantic.filter((k) => k.startsWith('light/ ')).sort();
const darkThemes = semantic.filter((k) => k.startsWith('dark/ ')).sort();

if (
  !lightThemes.includes('light/ core') ||
  !darkThemes.includes('dark/ core')
) {
  throw new Error('Missing core base theme for parity rollout');
}

if (
  requireMatchingThemeCount &&
  lightThemes.length !== darkThemes.length
) {
  throw new Error(
    `Semantic theme count mismatch: light=${lightThemes.length}, dark=${darkThemes.length}`
  );
}
```

### Step 2: Use Core as Structural Baseline

- Baseline for light parity: `light/ core`
- Baseline for dark parity: `dark/ core`
- Flatten each theme into token paths that end in `value`

Why strict structure matters:

- Figma Variables export expects each mode in a collection to expose the same variable keys.
- Missing or extra semantic paths in any theme can break export parity and cause variable mismatches.
- Therefore, structure must be strict 1:1 across all semantic themes in each mode.

### Step 3: Structural Parity Algorithm (Blocking)

For each semantic theme:

1. Compare flattened paths against mode baseline (`light/ core` or `dark/ core`).
2. Compute:
   - `missing_paths = baseline_paths - theme_paths`
   - `extra_paths = theme_paths - baseline_paths`
3. Fail parity if either set is non-empty.

```python
def structural_parity(theme_paths, baseline_paths):
    missing_paths = sorted(baseline_paths - theme_paths)
    extra_paths = sorted(theme_paths - baseline_paths)
    return {
        "ok": len(missing_paths) == 0 and len(extra_paths) == 0,
        "missing_paths": missing_paths,
        "extra_paths": extra_paths,
    }
```

### Step 4: Alias/Reference Integrity Checks (Blocking)

For each token `value` that is an alias (`{...}`):

1. Validate alias syntax.
2. Resolve in this order:
   - Same semantic set
   - Shared token sets used by semantic sets (`foundation`, palette sets, mode sets)
3. Flag unresolved aliases as parity blockers.
4. Flag mode-crossing aliases (`light/ *` referencing `dark/ *`, or vice versa) as parity blockers.

### Step 5: Figma Scope Correctness (Blocking)

After structural parity passes, verify `$extensions.com.figma.scopes` values are
**correct**, not just **uniform**. Uniformity-only checks return false PASSes
when the source theme itself has wrong scopes.

Run the constraint-reference #9 quick check. Accept only when it exits with
`PASS` (zero scope errors).

| Token suffix           | Expected scopes                                |
| ---------------------- | ---------------------------------------------- |
| `*.icon`               | `["FRAME_FILL", "STROKE_COLOR", "SHAPE_FILL"]` |
| `*.fill`               | `["FRAME_FILL", "SHAPE_FILL"]`                 |
| `*.text`, `*.label.*`  | `["TEXT_FILL"]`                                |
| `*.border`, `*.stroke` | `["STROKE_COLOR"]`                             |

If FAILs: fix scopes in all affected themes before proceeding.

## Outputs

| Output                      | Type    | Description                                                          |
| --------------------------- | ------- | -------------------------------------------------------------------- |
| `theme_counts`              | object  | Semantic theme counts per mode, e.g. `{ light: 1, dark: 1, total: 2 }` |
| `core_baseline_present`     | boolean | True when `light/ core` and `dark/ core` are present                 |
| `structural_parity_results` | array   | Per-theme missing/extra path results                                 |
| `alias_integrity_results`   | array   | Unresolved/cross-mode alias issues                                   |
| `status`                    | enum    | `success`, `failed-structure`, `failed-alias`                        |

## Error Handling

| Error                                 | Recovery                                                                |
| ------------------------------------- | ----------------------------------------------------------------------- |
| Light and dark theme counts differ    | Re-run discovery filters; verify non-semantic exclusions are correct    |
| Missing `light/ core` or `dark/ core` | Stop rollout parity check and request guidance                          |
| Missing/extra structural paths        | Fix structure first; do not resolve with value-only adjustments         |
| Unresolved aliases                    | Correct alias path or source set before evaluating parity               |

## Examples

### Example 1: Full Structural Parity

```
INVOKE: skill/validation/semantic-theme-parity
INPUTS: { require_matching_theme_count: true }
RESULT: {
  status: "success",
  theme_counts: { light: 1, dark: 1, total: 2 },
  core_baseline_present: true,
  structural_parity_results: [],
  alias_integrity_results: []
}
```

### Example 2: Cross-Mode Alias Failure

```
INVOKE: skill/validation/semantic-theme-parity
INPUTS: { require_matching_theme_count: true }
RESULT: {
  status: "failed-alias",
  theme_counts: { light: 1, dark: 1, total: 2 },
  core_baseline_present: true,
  structural_parity_results: [],
  alias_integrity_results: [
    {
      path: "light/ core.messaging.fill.warning",
      issue: "mode-crossing alias references dark/ core"
    }
  ]
}
```
