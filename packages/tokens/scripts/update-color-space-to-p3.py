#!/usr/bin/env python3
"""
Update light mode color ramps from HSL to P3 color space.

Target token sets:
- light/ brand
- light/ channels
- light/ dataVisualisation

Changes: $extensions.studio.tokens.modify.space: "hsl" → "p3"
"""

import json
import sys
from pathlib import Path

def update_color_space(data, token_set_name, path=[]):
    """Recursively traverse tokens and update space property."""
    changes = 0
    
    if isinstance(data, dict):
        # Check if this is a token with modify extensions
        if '$extensions' in data:
            try:
                modify = data['$extensions']['studio.tokens']['modify']
                if 'space' in modify and modify['space'] == 'hsl':
                    modify['space'] = 'p3'
                    changes += 1
                    token_path = '.'.join(path)
                    print(f"  ✓ {token_path}")
            except (KeyError, TypeError):
                pass
        
        # Recurse into nested structures
        for key, value in data.items():
            if key != '$extensions':  # Skip re-processing extensions
                changes += update_color_space(value, token_set_name, path + [key])
    
    return changes

def main():
    tokens_file = Path(__file__).parent.parent / 'src' / 'tokens.json'
    
    print("P3 Color Space Migration")
    print("=" * 70)
    print(f"File: {tokens_file}\n")
    
    # Load tokens
    with open(tokens_file, 'r') as f:
        data = json.load(f)
    
    # Target token sets
    target_sets = [
        'light/ brand',
        'light/ channels',
        'light/ dataVisualisation'
    ]
    
    total_changes = 0
    
    for token_set in target_sets:
        if token_set in data:
            print(f"\n{token_set}:")
            changes = update_color_space(data[token_set], token_set, [token_set])
            total_changes += changes
            print(f"  Total: {changes} tokens updated")
        else:
            print(f"\n⚠️  {token_set}: NOT FOUND")
    
    # Save updated tokens
    with open(tokens_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    print("\n" + "=" * 70)
    print(f"✅ Total changes: {total_changes} tokens")
    print(f"✅ File saved: {tokens_file}")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
