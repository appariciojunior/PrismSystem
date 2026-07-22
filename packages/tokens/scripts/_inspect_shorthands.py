#!/usr/bin/env python3
"""Find what brand.messaging.*, brand.digital.blue, product.* resolve to in tokens.json."""
import json

with open('packages/tokens/src/tokens.json') as f:
    t = json.load(f)

# Check various possible locations for these shorthand references
shorthands = [
    'brand.messaging.error', 'brand.messaging.success',
    'brand.messaging.warning', 'brand.messaging.info',
    'brand.digital.blue', 'product.channel.home',
]

def find_token(obj, path_parts, depth=0):
    """Walk into obj following path parts."""
    if not path_parts:
        return obj
    key = path_parts[0]
    if isinstance(obj, dict) and key in obj:
        return find_token(obj[key], path_parts[1:], depth + 1)
    return None

# Search in all top-level token sets
for sh in shorthands:
    parts = sh.split('.')
    print(f"\n=== Looking for: {sh} ===")
    for set_name in t:
        if set_name.startswith('$'):
            continue
        result = find_token(t[set_name], parts)
        if result is not None:
            if isinstance(result, dict):
                if 'value' in result:
                    print(f"  Found in [{set_name}]: value={result['value']}, type={result.get('type', '?')}")
                else:
                    keys = [k for k in result.keys() if not k.startswith('$')]
                    print(f"  Found in [{set_name}]: group with keys: {keys[:10]}")
            else:
                print(f"  Found in [{set_name}]: {result}")

# Also check what the actual token values are for these in light/dark core
print("\n\n=== Semantic tokens using these refs (light/core sample) ===")
light = t.get('light/ core', {})
def find_all(obj, path=''):
    results = []
    for k, v in obj.items():
        if k.startswith('$'): continue
        cp = f'{path}.{k}' if path else k
        if isinstance(v, dict):
            if 'value' in v:
                val = str(v['value'])
                if any(s in val for s in ['brand.messaging', 'brand.digital.blue', 'product.channel']):
                    results.append((cp, val))
            else:
                results.extend(find_all(v, cp))
    return results

for p, v in find_all(light)[:10]:
    print(f"  {p}: {v}")
