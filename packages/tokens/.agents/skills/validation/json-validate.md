---
name: json-validate
description: Validate JSON syntax and structure of tokens.json. Provides specific error locations with line/column numbers for quick debugging.
license: MIT
metadata:
  category: validation
  agents: [Architect, Code, Testing]
  autonomy: autonomous
---

# JSON Validate

## Purpose

Validate JSON syntax and structure of tokens.json, providing specific error locations.

## Preconditions

- File path exists
- Agent has read access

## Inputs

| Parameter         | Type    | Required | Description                                                    |
| ----------------- | ------- | -------- | -------------------------------------------------------------- |
| `file_path`       | string  | no       | Path to JSON file (default: `packages/tokens/src/tokens.json`) |
| `check_structure` | boolean | no       | Also validate token structure (default: false)                 |

## Procedure

### Step 1: Syntax Validation

```bash
# Quick syntax check
python3 -m json.tool packages/tokens/src/tokens.json > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ JSON syntax valid"
else
    echo "❌ JSON syntax error"
    # Get detailed error
    python3 -m json.tool packages/tokens/src/tokens.json 2>&1
fi
```

### Step 2: Detailed Error Location (if syntax fails)

```python
import json

def find_json_error(filepath):
    """Find exact location of JSON syntax error"""
    with open(filepath, 'r') as f:
        content = f.read()

    try:
        json.loads(content)
        return None
    except json.JSONDecodeError as e:
        # Extract line and column
        lines = content.split('\n')
        error_line = lines[e.lineno - 1] if e.lineno <= len(lines) else ""

        return {
            'line': e.lineno,
            'column': e.colno,
            'message': e.msg,
            'context': error_line[:100],
            'pointer': ' ' * (e.colno - 1) + '^'
        }

error = find_json_error('packages/tokens/src/tokens.json')
if error:
    print(f"Error at line {error['line']}, column {error['column']}")
    print(f"Message: {error['message']}")
    print(f"Context: {error['context']}")
    print(f"         {error['pointer']}")
```

### Step 3: Structure Validation (optional)

```python
def validate_structure(data):
    """Check expected token structure"""
    errors = []

    # Check required top-level sets
    required_sets = ['foundation', 'light/ brand', 'dark/ brand', 'light/ core', 'dark/ core']
    for s in required_sets:
        if s not in data:
            errors.append(f"Missing required token set: {s}")

    # Check $themes exists
    if '$themes' not in data:
        errors.append("Missing $themes array")

    # Validate font weights are strings
    def check_font_weights(obj, path=''):
        if isinstance(obj, dict):
            if 'fontWeight' in obj:
                val = obj['fontWeight'].get('value', obj['fontWeight'])
                if isinstance(val, (int, float)):
                    errors.append(f"Numeric fontWeight at {path}: {val}")
            for k, v in obj.items():
                check_font_weights(v, f"{path}.{k}")

    check_font_weights(data)

    return errors

with open('packages/tokens/src/tokens.json') as f:
    data = json.load(f)

structure_errors = validate_structure(data)
if structure_errors:
    for e in structure_errors:
        print(f"❌ {e}")
else:
    print("✅ Structure valid")
```

## Outputs

| Output             | Type           | Description                                      |
| ------------------ | -------------- | ------------------------------------------------ |
| `valid`            | boolean        | True if JSON is valid                            |
| `syntax_error`     | object \| null | {line, column, message, context} if syntax error |
| `structure_errors` | array          | List of structural issues found                  |

## Error Handling

| Error               | Recovery                                                                  |
| ------------------- | ------------------------------------------------------------------------- |
| `File not found`    | Check path; file may have been moved                                      |
| `Permission denied` | Check file permissions                                                    |
| `Syntax error`      | Use error location to fix; common issues: trailing commas, missing quotes |

## Examples

### Example 1: Valid JSON

```
INVOKE: skill/validation/json-validate
INPUTS: { file_path: "packages/tokens/src/tokens.json" }
RESULT: {
  valid: true,
  syntax_error: null,
  structure_errors: []
}
```

### Example 2: Syntax error with location

```
INVOKE: skill/validation/json-validate
INPUTS: { file_path: "packages/tokens/src/tokens.json" }
RESULT: {
  valid: false,
  syntax_error: {
    line: 1523,
    column: 15,
    message: "Expecting property name enclosed in double quotes",
    context: '    "value": {brand.core.ramp.neutral.500}',
    pointer: '              ^'
  }
}
```

## Common Fixes

| Error Type                | Likely Cause              | Fix                            |
| ------------------------- | ------------------------- | ------------------------------ |
| `Expecting property name` | Missing quotes around key | Add `"` around property name   |
| `Expecting value`         | Trailing comma            | Remove comma before `}` or `]` |
| `Invalid \escape`         | Unescaped backslash       | Use `\\` instead of `\`        |
| `Unexpected token`        | Copy-paste artifact       | Check for invisible characters |
