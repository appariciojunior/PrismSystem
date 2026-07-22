# Token Operations Utility

Reusable Python utility for common `tokens.json` operations.

Script: `packages/tokens/scripts/token-operations.py`

## What It Does

- `reorder`: Sorts keys numerically or alphabetically in a token collection.
- `flatten`: Resolves nested references for selected keys.
- `describe`: Bulk applies descriptions.
- `validate`: Checks JSON and Token Studio compatibility constraints.

## Usage

Run from `packages/tokens/`:

```sh
cd packages/tokens
```

### Quick Examples

```sh
# Reorder display scale numerically
python3 scripts/token-operations.py reorder "typographyTokens.brand.display.light" --pattern numeric

# Reorder ramp names alphabetically
python3 scripts/token-operations.py reorder "foundation.data-vis" --pattern alpha

# Flatten all fontSize tokens in small viewport
python3 scripts/token-operations.py flatten "viewport/ small.fontSize*" --target-keys value

# Add descriptions to viewport spacing tokens
python3 scripts/token-operations.py describe "viewport/ *.spacing.*" \
  --template "Fluid spacing - scales with viewport multiplier"

# Validate tokens file
python3 scripts/token-operations.py validate
```

## Command Reference

### `reorder`

```sh
python3 scripts/token-operations.py reorder <path> --pattern <numeric|alpha>
```

- Use `numeric` for numbered scales.
- Use `alpha` for named groups.

### `flatten`

```sh
python3 scripts/token-operations.py flatten <path> --target-keys <key1,key2>
```

- Default `--target-keys` is `value`.
- Wildcards are supported in `<path>`.

### `describe`

```sh
python3 scripts/token-operations.py describe <path> --template "Description text"
```

- Applies template text to all matching token leaves.
- Wildcards are supported in `<path>`.

### `validate`

```sh
python3 scripts/token-operations.py validate
```

Checks include:

- JSON validity
- Token Studio compatibility constraints
- Font weight value type checks

## Description Quality Rules

When using `describe`, keep descriptions semantic and implementation-agnostic.

- Do not use color names, hex values, or ramp step internals.
- Do describe purpose, emphasis level, and usage context.

Guidelines: `packages/tokens/.agents/skills/editing/description-guidelines.md`

## Common Workflow

```sh
cd packages/tokens

# 1) Apply operation
python3 scripts/token-operations.py reorder "typographyTokens.brand.display.light" --pattern numeric

# 2) Validate JSON
python3 -m json.tool src/tokens.json > /dev/null

# 3) Validate token constraints
python3 scripts/token-operations.py validate
```

## Troubleshooting

- Path errors:
  Use dot-separated paths that match exact key names, for example `viewport/ small.spacing`.
- Validation failures:
  Fix reported keys first, then re-run `validate`.
- Unsure which path to target:
  Inspect `packages/tokens/src/tokens.json` and copy the exact key path.

## See Also

- `packages/tokens/docs/reference-modules/01-token-naming.md`
- `packages/tokens/docs/reference-modules/05-color-ramps.md`
- [Token Studio Docs](https://docs.tokens.studio/)
