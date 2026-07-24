#!/usr/bin/env python3
"""Inspect dark/core chip.channel references to understand the unresolved tokens."""
import json

with open('packages/tokens/src/tokens.json') as f:
    t = json.load(f)

dark = t.get('dark/ core', {})

def find_all(obj, path=''):
    results = []
    for k, v in obj.items():
        if k.startswith('$'):
            continue
        cp = f'{path}.{k}' if path else k
        if isinstance(v, dict):
            if 'value' in v:
                results.append((cp, v['value']))
            else:
                results.extend(find_all(v, cp))
    return results

# Find which dark tokens reference chip.channel
print("=== Dark/core tokens referencing chip.channel ===")
all_dark = find_all(dark)
for path, val in all_dark:
    if isinstance(val, str) and 'chip.channel' in val:
        print(f"  {path}: {val}")

# Show chip.tertiary tokens in dark/core
print("\n=== chip.tertiary tokens in dark/core ===")
for path, val in all_dark:
    if 'chip.tertiary' in path:
        print(f"  {path}: {val}")

# Show chip.channel tokens in light/core for comparison
print("\n=== chip.channel tokens in light/core ===")
light = t.get('light/ core', {})
all_light = find_all(light)
for path, val in all_light:
    if 'chip.channel' in path:
        print(f"  {path}: {val}")
