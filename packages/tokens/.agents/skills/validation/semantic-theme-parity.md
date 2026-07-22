---
name: semantic-theme-parity
description: Validate semantic theme parity for Figma Variables export by enforcing strict structural parity while separating value decisions from structure checks.
license: MIT
metadata:
  category: validation
  agents: [Architect, Code, Testing, 'React Expert']
  autonomy: autonomous
---

# Semantic Theme Parity

## Purpose

Validate semantic theme token parity across light and dark modes so Figma Variables export stays stable: strict 1:1 structural parity is required, while value parity is advisory for channel-specific decisions.

## Core Principle: 1:1 Semantic Token Mapping Across Themes

**All semantic tokens are structurally and semantically identical across all themes.** For a given semantic token like `messaging.fill.warning`, the meaning and implementation are 1:1 across `light/ core`, `light/ comment`, `dark/ core`, `dark/ comment`, etc.

Exceptions are **only** channel-specific tokens (paths containing `.channel.`, e.g., `text.channel.primary`, `icon.channel.secondary`) where design intent allows value divergence between theme contexts.

Implication: When searching for a semantic token (e.g., warning modal background), do not select between themes. Always use the canonical semantic token. Theme selection does not change semantic meaning or implementation.

For token search/discovery agents: If a search returns the same semantic token from multiple themes with the same value, collapse to a single recommendation with a note that it is 1:1 mapped.

## Documentation Inputs (Required)

Before planning or validating semantic rollouts, read:

- `packages/tokens/docs/reference/semantic-tokens.md`
- `packages/tokens/docs/reference/channel-semantic-tokens-mapping-ref.md`

Use docs as source-of-truth for semantic mapping contracts. Keep briefs generalist and avoid embedding long, token-specific tables there.

## Preconditions

- `packages/tokens/src/tokens.json` exists and parses as valid JSON.
- This workflow is read-first and must not edit `tokens.json` during parity analysis.
- `light/ core` and `dark/ core` must exist as rollout baselines.

## Inputs

| Parameter                   | Type    | Required | Description                                                               |
| --------------------------- | ------- | -------- | ------------------------------------------------------------------------- |
| `file_path`                 | string  | no       | Path to token source (default: `packages/tokens/src/tokens.json`)         |
| `require_exact_theme_count` | boolean | no       | Enforce semantic theme count check `14 light + 14 dark` (default: `true`) |
| `contrast_threshold`        | number  | no       | Advisory contrast floor for channel value decisions (default: `3.0`)      |
| `ask_on_uncertainty`        | boolean | no       | Ask user via `vscode_askQuestions` if value decisions remain unclear      |

## Procedure

### Step 1: Discover Semantic Themes and Confirm 14 + 14

Use explicit discovery and exclude non-semantic sets:

- Exclude: `light/ brand`, `dark/ brand`, `light/ channels`, `dark/ channels`, `light/ marketing`, `dark/ marketing`, `light/ dataVisualisation`, `dark/ dataVisualisation`
- Include only top-level token sets matching `light/ *` or `dark/ *`

```javascript
const excluded = new Set([
  'light/ brand',
  'dark/ brand',
  'light/ channels',
  'dark/ channels',
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
  requireExactThemeCount &&
  (lightThemes.length !== 14 || darkThemes.length !== 14)
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

### Step 5: Advisory Value Parity for Channel-Specific Tokens

This step is advisory and runs only after structural + alias checks pass.

- Structural parity is mandatory.
- Value parity is not strictly 1:1 for channel tokens.
- Focus paths typically under `.channel.` and similar channel-specific semantic branches.

Decision logic for a theme `.500` value:

```text
keep_current_500 = (contrast_ratio >= 3.0) OR (visual_review_no_step_change == true)
```

Interpretation:

- If contrast is at least `3:1`, `.500` may remain unchanged.
- If visual review confirms no ramp-step adjustment is needed, `.500` may remain unchanged.
- If neither condition is met, mark as `needs_decision` (advisory), not a structural parity failure.

### Step 6: Figma Scope Correctness (Blocking)

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

### Step 7: Uncertainty Escalation (Required Behavior)

If any advisory value decision is uncertain, ask the user via `vscode_askQuestions` using multiple-choice with a freeform fallback.

Example payload:

```json
{
  "questions": [
    {
      "header": "channel_value_decision",
      "question": "Structural parity passed, but a channel token value decision is unclear. How should I proceed?",
      "options": [
        {
          "label": "Keep current .500 value",
          "description": "Use current step because contrast is >= 3:1"
        },
        {
          "label": "Adjust to a nearby ramp step",
          "description": "Move to .400/.600 (or nearest valid step)"
        },
        {
          "label": "Mirror core theme value",
          "description": "Use core as temporary rollout baseline"
        },
        {
          "label": "Other (describe your preferred action)",
          "description": "Provide custom direction"
        }
      ],
      "allowFreeformInput": true
    }
  ]
}
```

## Outputs

| Output                      | Type    | Description                                                          |
| --------------------------- | ------- | -------------------------------------------------------------------- |
| `theme_counts`              | object  | `{ light: 14, dark: 14, total: 28 }` when counts are correct         |
| `core_baseline_present`     | boolean | True when `light/ core` and `dark/ core` are present                 |
| `structural_parity_results` | array   | Per-theme missing/extra path results                                 |
| `alias_integrity_results`   | array   | Unresolved/cross-mode alias issues                                   |
| `advisory_value_results`    | array   | Channel token recommendations (`keep`, `adjust`, `needs_decision`)   |
| `escalations`               | array   | User questions asked for uncertain advisory decisions                |
| `status`                    | enum    | `success`, `failed-structure`, `failed-alias`, `needs-user-decision` |

## Error Handling

| Error                                 | Recovery                                                                |
| ------------------------------------- | ----------------------------------------------------------------------- |
| Semantic theme count not `14 + 14`    | Re-run discovery filters; verify non-semantic exclusions are correct    |
| Missing `light/ core` or `dark/ core` | Stop rollout parity check and request guidance                          |
| Missing/extra structural paths        | Fix structure first; do not resolve with value-only adjustments         |
| Unresolved aliases                    | Correct alias path or source set before evaluating channel value advice |
| Advisory value uncertainty            | Trigger `vscode_askQuestions` payload and wait for user instruction     |

## Examples

### Example 1: Full Structural Parity, No Escalation

```
INVOKE: skill/validation/semantic-theme-parity
INPUTS: { require_exact_theme_count: true, contrast_threshold: 3.0 }
RESULT: {
  status: "success",
  theme_counts: { light: 14, dark: 14, total: 28 },
  core_baseline_present: true,
  structural_parity_results: [],
  alias_integrity_results: [],
  advisory_value_results: [
    {
      path: "light/ sport.text.channel.link",
      contrast_ratio: 3.4,
      decision: "keep"
    }
  ],
  escalations: []
}
```

### Example 2: Structural Pass, Advisory Uncertainty Escalated

```
INVOKE: skill/validation/semantic-theme-parity
INPUTS: { ask_on_uncertainty: true }
RESULT: {
  status: "needs-user-decision",
  theme_counts: { light: 14, dark: 14, total: 28 },
  structural_parity_results: [],
  alias_integrity_results: [],
  advisory_value_results: [
    {
      path: "dark/ world.interactive.chip.channel.fill.default",
      contrast_ratio: 2.8,
      visual_review_no_step_change: null,
      decision: "needs_decision"
    }
  ],
  escalations: ["channel_value_decision"]
}
```
