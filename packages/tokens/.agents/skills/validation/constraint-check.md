---
name: constraint-check
description: Verify token changes comply with CONSTRAINTS.md rules. Detects circular references, layer violations, and font weight format errors.
license: MIT
metadata:
  category: validation
  agents: [Architect, Code, Testing]
  autonomy: autonomous
---

# Constraint Check

## Purpose

Verify token changes comply with CONSTRAINTS.md rules, catching violations before commit.

## Preconditions

- `packages/tokens/src/tokens.json` exists and is valid JSON
- `.agents/CONSTRAINTS.md` exists (rules reference)

## Inputs

| Parameter       | Type     | Required | Description                                                                 |
| --------------- | -------- | -------- | --------------------------------------------------------------------------- |
| `changed_paths` | string[] | yes      | List of token paths that were modified                                      |
| `check_all`     | boolean  | no       | Run all constraint checks (default: false, only checks relevant to changes) |

## Procedure

### Step 1: Load Changed Tokens

```python
import json

with open('packages/tokens/src/tokens.json') as f:
    data = json.load(f)

def get_token_data(path):
    """Get token object from path"""
    parts = path.split('.')
    obj = data
    for part in parts:
        obj = obj.get(part, {})
    return obj
```

### Step 2: Run Constraint Checks

#### Check 1: Circular References

```python
def check_circular_refs(token_path, visited=None, depth=0):
    """Detect circular reference chains"""
    if visited is None:
        visited = []

    if token_path in visited:
        return {
            'violation': 'CIRCULAR_REFERENCE',
            'path': token_path,
            'chain': visited + [token_path],
            'severity': 'CRITICAL'
        }

    if depth > 10:
        return None  # Max depth reached, assume OK

    token = get_token_data(token_path)
    value = token.get('value', '')

    # Extract reference from value
    import re
    refs = re.findall(r'\{([^}]+)\}', value)

    for ref in refs:
        result = check_circular_refs(ref, visited + [token_path], depth + 1)
        if result:
            return result

    return None
```

#### Check 2: Semantic → Palette Only

```python
def check_layer_references(token_path, token_value):
    """Ensure semantic tokens only reference palette, not foundation"""
    violations = []

    # Is this a semantic token?
    semantic_prefixes = ['light/ core', 'dark/ core', 'light/ comment', 'dark/ comment']
    is_semantic = any(token_path.startswith(p) for p in semantic_prefixes)

    if not is_semantic:
        return []

    # Check if value references foundation directly
    if 'foundation.' in token_value or '{foundation.' in token_value:
        violations.append({
            'violation': 'SEMANTIC_REFS_FOUNDATION',
            'path': token_path,
            'value': token_value,
            'message': 'Semantic token must reference Palette layer, not Foundation directly',
            'severity': 'CRITICAL'
        })

    return violations
```

#### Check 3: Font Weights as Strings

```python
def check_font_weights(token_path, token_data):
    """Ensure fontWeight values are strings, not numbers"""
    violations = []

    if 'fontWeight' in str(token_path).lower():
        value = token_data.get('value')
        if isinstance(value, (int, float)):
            violations.append({
                'violation': 'NUMERIC_FONT_WEIGHT',
                'path': token_path,
                'value': value,
                'message': f'Font weight must be string (e.g., "Bold"), not number ({value})',
                'severity': 'HIGH'
            })

    return violations
```

#### Check 4: No Raw Values in Semantic/Palette

```python
def check_raw_values(token_path, token_value):
    """Ensure no hardcoded hex colors or sizes in palette/semantic"""
    violations = []

    # Skip foundation layer
    if token_path.startswith('foundation'):
        return []

    # Check for hex colors
    import re
    hex_pattern = r'#[0-9a-fA-F]{3,8}'
    if re.search(hex_pattern, str(token_value)):
        violations.append({
            'violation': 'RAW_VALUE_IN_PALETTE_SEMANTIC',
            'path': token_path,
            'value': token_value,
            'message': 'Palette/Semantic tokens must reference other tokens, not raw values',
            'severity': 'HIGH'
        })

    return violations
```

### Step 3: Aggregate Results

```python
def run_all_checks(changed_paths):
    """Run all constraint checks on changed tokens"""
    all_violations = []

    for path in changed_paths:
        token = get_token_data(path)
        value = token.get('value', '')

        # Run each check
        circ = check_circular_refs(path)
        if circ:
            all_violations.append(circ)

        all_violations.extend(check_layer_references(path, value))
        all_violations.extend(check_font_weights(path, token))
        all_violations.extend(check_raw_values(path, value))

    return all_violations
```

## Outputs

| Output           | Type    | Description                                  |
| ---------------- | ------- | -------------------------------------------- |
| `valid`          | boolean | True if no violations found                  |
| `violations`     | array   | List of {violation, path, message, severity} |
| `critical_count` | number  | Count of CRITICAL severity violations        |
| `high_count`     | number  | Count of HIGH severity violations            |

## Error Handling

| Error                  | Recovery                                       |
| ---------------------- | ---------------------------------------------- |
| `Token path not found` | Check path format; token may have been deleted |
| `Max depth exceeded`   | Possible deep nesting; review token structure  |

## Examples

### Example 1: All checks pass

```
INVOKE: skill/validation/constraint-check
INPUTS: { changed_paths: ["light/ core.text.primary", "light/ core.text.secondary"] }
RESULT: {
  valid: true,
  violations: [],
  critical_count: 0,
  high_count: 0
}
```

### Example 2: Circular reference detected

```
INVOKE: skill/validation/constraint-check
INPUTS: { changed_paths: ["light/ core.text.broken"] }
RESULT: {
  valid: false,
  violations: [
    {
      violation: "CIRCULAR_REFERENCE",
      path: "light/ core.text.broken",
      chain: ["light/ core.text.broken", "brand.custom.ref", "light/ core.text.broken"],
      severity: "CRITICAL"
    }
  ],
  critical_count: 1,
  high_count: 0
}
```

### Example 3: Semantic → Foundation violation

```
INVOKE: skill/validation/constraint-check
INPUTS: { changed_paths: ["light/ core.surface.canvas"] }
RESULT: {
  valid: false,
  violations: [
    {
      violation: "SEMANTIC_REFS_FOUNDATION",
      path: "light/ core.surface.canvas",
      value: "{foundation.brand.white}",
      message: "Semantic token must reference Palette layer, not Foundation directly",
      severity: "CRITICAL"
    }
  ]
}
```

## Severity Levels

| Severity   | Meaning                                    | Action                 |
| ---------- | ------------------------------------------ | ---------------------- |
| `CRITICAL` | Breaks build or violates core architecture | Block commit; must fix |
| `HIGH`     | Significant issue                          | Fix before merge       |
| `MEDIUM`   | Best practice violation                    | Fix if time allows     |
| `LOW`      | Suggestion                                 | Optional fix           |
