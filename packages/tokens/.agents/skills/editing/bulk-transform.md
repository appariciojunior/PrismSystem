---
name: bulk-transform
description: Apply batch transformations across multiple tokens with atomic commit and rollback. Requires human approval when affecting more than 10 tokens.
license: MIT
metadata:
  category: editing
  agents: [Architect, Code, Testing]
  autonomy: requires-approval (if >10 tokens)
---

# Bulk Transform

## Purpose

Apply batch transformations across multiple tokens with atomic commit and rollback.

## Preconditions

- `packages/tokens/src/tokens.json` exists and is valid JSON
- Transformation specification is well-defined
- Human approval if >10 tokens affected

## Inputs

| Parameter   | Type     | Required | Description                                      |
| ----------- | -------- | -------- | ------------------------------------------------ |
| `pattern`   | string   | yes      | Glob/regex pattern to match tokens               |
| `transform` | object   | yes      | Transformation spec (see below)                  |
| `dry_run`   | boolean  | no       | Preview changes without applying (default: true) |
| `modes`     | string[] | no       | Limit to specific modes: `light`, `dark`, `all`  |

### Transform Specification

```json
{
  "type": "rename | remap | replace | delete",
  "rename": { "from": "old.path.segment", "to": "new.path.segment" },
  "remap": { "field": "value", "mapping": { "old": "new", ... } },
  "replace": { "field": "value", "find": "pattern", "replace": "new" },
  "delete": { "confirm": true }
}
```

## Procedure

### Step 1: Discovery Phase

```python
import json
import re

with open('packages/tokens/src/tokens.json') as f:
    data = json.load(f)

def find_matching_tokens(data, pattern, prefix=''):
    """Recursively find all tokens matching pattern"""
    matches = []
    for key, value in data.items():
        path = f"{prefix}.{key}" if prefix else key
        if re.search(pattern, path):
            matches.append(path)
        if isinstance(value, dict) and 'value' not in value:
            matches.extend(find_matching_tokens(value, pattern, path))
    return matches

matches = find_matching_tokens(data, pattern)
print(f"Found {len(matches)} tokens matching '{pattern}'")
```

### Step 2: Approval Gate (if needed)

```
IF len(matches) > 10:
    print("⚠️ BULK OPERATION: {len(matches)} tokens will be modified")
    print("Tokens to modify:")
    for m in matches[:20]:
        print(f"  - {m}")
    if len(matches) > 20:
        print(f"  ... and {len(matches) - 20} more")

    REQUIRE human approval before proceeding
```

### Step 3: Dry Run Preview

```python
def preview_transform(token_path, token_data, transform):
    """Generate preview of transformation"""
    preview = {
        'path': token_path,
        'before': token_data.get('value'),
        'after': None,
        'change_type': transform['type']
    }

    if transform['type'] == 'remap':
        old_value = token_data.get(transform['remap']['field'])
        mapping = transform['remap']['mapping']
        preview['after'] = mapping.get(old_value, old_value)

    elif transform['type'] == 'replace':
        old_value = token_data.get(transform['replace']['field'], '')
        preview['after'] = re.sub(
            transform['replace']['find'],
            transform['replace']['replace'],
            old_value
        )

    return preview

# Generate all previews
previews = [preview_transform(m, get_token(data, m), transform) for m in matches]

# Display changes
for p in previews[:10]:
    print(f"{p['path']}: {p['before']} → {p['after']}")
```

### Step 4: Apply Transformation (if not dry_run)

```python
def apply_transform(data, token_path, transform):
    """Apply transformation to single token"""
    token = get_token(data, token_path)

    if transform['type'] == 'remap':
        field = transform['remap']['field']
        mapping = transform['remap']['mapping']
        if token.get(field) in mapping:
            token[field] = mapping[token[field]]

    elif transform['type'] == 'replace':
        field = transform['replace']['field']
        if field in token:
            token[field] = re.sub(
                transform['replace']['find'],
                transform['replace']['replace'],
                token[field]
            )

    return token

# Create checkpoint
checkpoint_commit = run('git rev-parse HEAD').strip()

# Apply all transformations
for match in matches:
    apply_transform(data, match, transform)

# Write atomically
with open('packages/tokens/src/tokens.json', 'w') as f:
    json.dump(data, f, indent=2)
```

### Step 5: Validate and Checkpoint

```bash
# Validate JSON
python3 -m json.tool packages/tokens/src/tokens.json > /dev/null
if [ $? -ne 0 ]; then
    git checkout HEAD -- packages/tokens/src/tokens.json
    exit 1
fi

# Run tests
npm run test:output
if [ $? -ne 0 ]; then
    echo "Tests failed - review changes or rollback"
fi

# Commit with detailed message
git add packages/tokens/src/tokens.json
git commit -m "feat(tokens): bulk transform ${#matches} tokens

Pattern: ${pattern}
Transform: ${transform.type}
Affected tokens: ${#matches}
Rollback: git revert HEAD"
```

## Outputs

| Output              | Type   | Description                                        |
| ------------------- | ------ | -------------------------------------------------- |
| `status`            | enum   | `success`, `failed`, `dry_run_complete`, `blocked` |
| `tokens_affected`   | number | Count of modified tokens                           |
| `previews`          | array  | List of before/after for each token                |
| `checkpoint_commit` | string | Git commit SHA before changes                      |
| `rollback_cmd`      | string | Command to revert entire batch                     |

## Error Handling

| Error                           | Recovery                                            |
| ------------------------------- | --------------------------------------------------- |
| `Pattern matches 0 tokens`      | Check pattern syntax; use token-lookup first        |
| `JSON invalid after transform`  | Rollback to checkpoint_commit                       |
| `Tests fail after transform`    | Review specific failures; may need partial rollback |
| `Partial failure mid-transform` | Rollback entire batch; do not leave partial state   |

## Examples

### Example 1: Remap ramp step references

```
INVOKE: skill/editing/bulk-transform
INPUTS: {
  pattern: "light/ .*\\.text\\.secondary",
  dry_run: true,
  transform: {
    type: "replace",
    replace: {
      field: "value",
      find: "ramp\\.neutral\\.600",
      replace: "ramp.neutral.700"
    }
  }
}
RESULT: {
  status: "dry_run_complete",
  tokens_affected: 28,
  previews: [
    { path: "light/ core.text.secondary.primary", before: "{brand.core.ramp.neutral.600}", after: "{brand.core.ramp.neutral.700}" },
    ...
  ]
}
```

### Example 2: Blocked due to count

```
INVOKE: skill/editing/bulk-transform
INPUTS: {
  pattern: ".*\\.text\\..*",
  dry_run: false,
  transform: { type: "remap", ... }
}
RESULT: {
  status: "blocked",
  tokens_affected: 156,
  message: "Bulk operation affects >10 tokens. Human approval required."
}
```

## Best Practices

1. **Always dry_run first**: Preview before applying
2. **Document assumptions**: In commit message, explain why this pattern
3. **Test both modes**: Verify light AND dark mode affected correctly
4. **Checkpoint commits**: Ensure easy rollback path
5. **Primary ≠ Secondary**: After ramp changes, verify differentiation maintained
