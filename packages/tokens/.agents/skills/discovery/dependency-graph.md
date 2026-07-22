---
name: dependency-graph
description: Trace token references to build upstream/downstream dependency graphs. Detects circular references and calculates change impact.
license: MIT
metadata:
  category: discovery
  agents: [Architect, Code, Testing]
  autonomy: autonomous
---

# Dependency Graph

## Purpose

Trace token references to build a dependency graph, identifying what references what.

## Preconditions

- `packages/tokens/src/tokens.json` exists and is valid JSON
- Token path provided exists in the file

## Inputs

| Parameter    | Type   | Required | Description                                                                    |
| ------------ | ------ | -------- | ------------------------------------------------------------------------------ |
| `token_path` | string | yes      | Starting token path to trace                                                   |
| `direction`  | enum   | no       | `upstream` (what does this reference?) or `downstream` (what references this?) |
| `max_depth`  | number | no       | Maximum reference depth (default: 3)                                           |

## Procedure

### Step 1: Extract Token Value

```python
import json
import re

with open('packages/tokens/src/tokens.json') as f:
    data = json.load(f)

def get_token(path_parts, obj):
    """Navigate to token by path parts"""
    for part in path_parts:
        if isinstance(obj, dict) and part in obj:
            obj = obj[part]
        else:
            return None
    return obj

# Example: "light/ core.text.primary" → ["light/ core", "text", "primary"]
```

### Step 2: Parse References

```python
def extract_references(value):
    """Extract token references from a value string"""
    if not isinstance(value, str):
        return []
    # Match {reference.path} patterns
    pattern = r'\{([^}]+)\}'
    return re.findall(pattern, value)

# Example: "{brand.core.ramp.neutral.1000}" → ["brand.core.ramp.neutral.1000"]
```

### Step 3: Build Graph (Upstream)

```python
def trace_upstream(token_path, depth=0, max_depth=3, visited=None):
    """Find what this token references"""
    if visited is None:
        visited = set()
    if depth > max_depth or token_path in visited:
        return {}

    visited.add(token_path)
    token = get_token(token_path)
    if not token:
        return {}

    value = token.get('value', '')
    refs = extract_references(value)

    graph = {token_path: refs}
    for ref in refs:
        graph.update(trace_upstream(ref, depth+1, max_depth, visited))

    return graph
```

### Step 4: Build Graph (Downstream)

```python
def trace_downstream(token_path, max_depth=3):
    """Find what references this token"""
    ref_pattern = f'{{{token_path}}}'

    # Search entire file for references
    cmd = f"grep -n '{ref_pattern}' packages/tokens/src/tokens.json"
    # Parse results to extract referencing token paths
```

## Outputs

| Output        | Type    | Description                                  |
| ------------- | ------- | -------------------------------------------- |
| `graph`       | object  | Adjacency list: {token: [referenced_tokens]} |
| `root`        | string  | Starting token path                          |
| `depth`       | number  | Maximum depth reached                        |
| `circular`    | boolean | True if circular reference detected          |
| `leaf_tokens` | array   | Foundation tokens (no further references)    |

## Error Handling

| Error                         | Recovery                                              |
| ----------------------------- | ----------------------------------------------------- |
| `Circular reference detected` | Log cycle path; mark `circular: true`; stop traversal |
| `Token not found`             | Return partial graph; list missing tokens             |
| `Max depth exceeded`          | Return partial graph; note truncation                 |

## Examples

### Example 1: Trace semantic token upstream

```
INVOKE: skill/discovery/dependency-graph
INPUTS: { token_path: "light/ core.text.primary", direction: "upstream" }
RESULT: {
  graph: {
    "light/ core.text.primary": ["brand.core.ramp.neutral.1000"],
    "brand.core.ramp.neutral.1000": ["foundation.brand.black"]
  },
  root: "light/ core.text.primary",
  depth: 2,
  circular: false,
  leaf_tokens: ["foundation.brand.black"]
}
```

### Example 2: Detect circular reference

```
INVOKE: skill/discovery/dependency-graph
INPUTS: { token_path: "broken.token.a", direction: "upstream" }
RESULT: {
  graph: {
    "broken.token.a": ["broken.token.b"],
    "broken.token.b": ["broken.token.c"],
    "broken.token.c": ["broken.token.a"]  # CIRCULAR!
  },
  circular: true,
  cycle_path: ["broken.token.a", "broken.token.b", "broken.token.c", "broken.token.a"]
}
```

## Use Cases

1. **Pre-edit validation**: Before modifying a foundation token, check downstream impact
2. **Circular detection**: Validate new references don't create cycles
3. **Layer compliance**: Verify semantic tokens only reference palette (depth should reach palette before foundation)
4. **Impact analysis**: Understand blast radius of a token change
