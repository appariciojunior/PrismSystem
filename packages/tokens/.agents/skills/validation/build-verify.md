---
name: build-verify
description: Run npm build and test commands to verify token changes. Ensures JSON syntax, tests pass, and theme.js is generated correctly.
license: MIT
metadata:
  category: validation
  agents: [Architect, Code, Testing]
  autonomy: autonomous
---

# Build Verify

## Purpose

Run npm build and test commands to verify token changes don't break the build pipeline.

## Preconditions

- Working directory is repository root
- npm dependencies installed (`node_modules/` exists)
- `packages/tokens/src/tokens.json` is valid JSON

## Inputs

| Parameter | Type    | Required | Description                                        |
| --------- | ------- | -------- | -------------------------------------------------- |
| `quick`   | boolean | no       | Run only JSON validation (default: false)          |
| `full`    | boolean | no       | Run all tests including slow ones (default: false) |

## Procedure

### Step 1: Quick JSON Validation (always runs)

```bash
echo "Step 1: JSON syntax check..."
python3 -m json.tool packages/tokens/src/tokens.json > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ JSON syntax invalid"
    exit 1
fi
echo "✅ JSON syntax valid"
```

### Step 2: Run Token Tests

```bash
echo "Step 2: Running token tests..."
npm run test:output 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Token tests failed"
    # Capture test output for analysis
    npm run test:output 2>&1 | tail -50
    exit 1
fi
echo "✅ Token tests passed"
```

### Step 3: Build Output

```bash
echo "Step 3: Building token output..."
npm run build:output 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    npm run build:output 2>&1 | tail -30
    exit 1
fi

# Verify output file exists
if [ ! -f "packages/output/lib/theme.js" ]; then
    echo "❌ Build succeeded but theme.js not found"
    exit 1
fi

echo "✅ Build succeeded, theme.js generated"
```

### Step 4: Output Validation (optional, if full=true)

```bash
echo "Step 4: Validating build output..."

# Check theme.js is non-empty
size=$(wc -c < packages/output/lib/theme.js)
if [ $size -lt 1000 ]; then
    echo "⚠️ theme.js is suspiciously small ($size bytes)"
fi

# Quick spot-check for expected content
if grep -q "light/ core" packages/output/lib/theme.js; then
    echo "✅ Output contains expected theme data"
else
    echo "⚠️ Output may be incomplete - 'light/ core' not found"
fi
```

## Outputs

| Output            | Type    | Description                               |
| ----------------- | ------- | ----------------------------------------- |
| `status`          | enum    | `success`, `failed`                       |
| `json_valid`      | boolean | JSON syntax check result                  |
| `tests_passed`    | boolean | npm test result                           |
| `build_succeeded` | boolean | npm build result                          |
| `output_exists`   | boolean | theme.js file exists                      |
| `errors`          | array   | List of error messages if any step failed |
| `duration_ms`     | number  | Total time taken                          |

## Error Handling

| Error                    | Recovery                                                         |
| ------------------------ | ---------------------------------------------------------------- |
| `JSON syntax error`      | Fix syntax using json-validate skill error location              |
| `Test failure`           | Read test output; usually indicates reference or structure issue |
| `Build failure`          | Often circular references; use dependency-graph skill to debug   |
| `theme.js not generated` | Check build script; may be path issue                            |

## Examples

### Example 1: All checks pass

```
INVOKE: skill/validation/build-verify
INPUTS: { quick: false }
RESULT: {
  status: "success",
  json_valid: true,
  tests_passed: true,
  build_succeeded: true,
  output_exists: true,
  errors: [],
  duration_ms: 12340
}
```

### Example 2: Tests fail

```
INVOKE: skill/validation/build-verify
INPUTS: {}
RESULT: {
  status: "failed",
  json_valid: true,
  tests_passed: false,
  build_succeeded: false,
  output_exists: false,
  errors: [
    "Test failure: Token 'light/ core.text.primary' references undefined token 'brand.core.ramp.neutral.1050'"
  ],
  duration_ms: 8200
}
```

### Example 3: Quick mode

```
INVOKE: skill/validation/build-verify
INPUTS: { quick: true }
RESULT: {
  status: "success",
  json_valid: true,
  tests_passed: null,  // skipped
  build_succeeded: null,  // skipped
  output_exists: null,  // skipped
  duration_ms: 150
}
```

## Performance Notes

| Check            | Typical Duration |
| ---------------- | ---------------- |
| JSON validation  | ~100ms           |
| npm test:output  | ~5-10s           |
| npm build:output | ~3-8s            |
| Full validation  | ~15-20s          |

Use `quick: true` during iterative editing; run full validation before commit.

## Common Build Failures

| Error Pattern                           | Likely Cause                        | Fix                                |
| --------------------------------------- | ----------------------------------- | ---------------------------------- |
| `ReferenceError: X is not defined`      | Token references non-existent token | Check token path spelling          |
| `Maximum call stack exceeded`           | Circular reference                  | Use dependency-graph to find cycle |
| `Cannot read property 'X' of undefined` | Missing parent token                | Ensure full path exists            |
| `ENOENT: no such file`                  | Missing input file                  | Check tokens.json path             |
