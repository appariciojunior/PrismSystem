#!/usr/bin/env python3
"""
Remove brand.data-visualisation.ramp.positive from light and dark dataVisualisation themes.

This removes the positive ramp while keeping sequential and other ramps.
"""

import json
import sys
from pathlib import Path

def main():
    tokens_path = Path('packages/tokens/src/tokens.json')
    
    if not tokens_path.exists():
        print(f"❌ Error: {tokens_path} not found")
        sys.exit(1)
    
    # Load tokens.json
    print(f"📖 Loading {tokens_path}...")
    with open(tokens_path, 'r') as f:
        data = json.load(f)
    
    removed_count = 0
    
    # Process light/ dataVisualisation
    if 'light/ dataVisualisation' in data:
        if 'brand' in data['light/ dataVisualisation']:
            if 'data-visualisation' in data['light/ dataVisualisation']['brand']:
                if 'ramp' in data['light/ dataVisualisation']['brand']['data-visualisation']:
                    ramps = data['light/ dataVisualisation']['brand']['data-visualisation']['ramp']
                    if 'positive' in ramps:
                        del ramps['positive']
                        print(f"✅ Removed positive ramp from light/ dataVisualisation")
                        removed_count += 1
    
    # Process dark/ dataVisualisation
    if 'dark/ dataVisualisation' in data:
        if 'brand' in data['dark/ dataVisualisation']:
            if 'data-visualisation' in data['dark/ dataVisualisation']['brand']:
                if 'ramp' in data['dark/ dataVisualisation']['brand']['data-visualisation']:
                    ramps = data['dark/ dataVisualisation']['brand']['data-visualisation']['ramp']
                    if 'positive' in ramps:
                        del ramps['positive']
                        print(f"✅ Removed positive ramp from dark/ dataVisualisation")
                        removed_count += 1
    
    # Write updated tokens.json
    print(f"\n💾 Writing updated tokens.json...")
    with open(tokens_path, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Verify removal
    print(f"\n✅ Completed")
    print(f"   Positive ramps removed: {removed_count}")
    
    # Verify remaining ramps
    if 'light/ dataVisualisation' in data:
        remaining = list(data['light/ dataVisualisation']['brand']['data-visualisation']['ramp'].keys())
        print(f"\n📊 Remaining ramps in light/ dataVisualisation: {sorted(remaining)}")
    
    if 'dark/ dataVisualisation' in data:
        remaining = list(data['dark/ dataVisualisation']['brand']['data-visualisation']['ramp'].keys())
        print(f"📊 Remaining ramps in dark/ dataVisualisation: {sorted(remaining)}")

if __name__ == '__main__':
    main()
