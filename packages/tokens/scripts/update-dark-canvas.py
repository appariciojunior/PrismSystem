#!/usr/bin/env python3
"""
Update dark mode surface.canvas references to align with dark/ core standard.

This script:
1. Updates surface.canvas from {brand.core.ramp.neutral.100} to {brand.core.ramp.neutral.50}
   in 13 dark mode semantic themes
2. Verifies dark/ core remains unchanged (already correct at neutral.50)
3. Reports summary of changes

Rationale:
- In dark mode: neutral.50 = #000000 (pure black, correct for canvas base)
- In dark mode: neutral.100 = #0c0c0c (should be for level-1 elevation, not canvas)
- Restores proper elevation hierarchy: canvas < level-1 < level-2...
"""

import json
import sys
from pathlib import Path

# Dark mode semantic themes to update (currently using neutral.100)
TARGET_DARK_THEMES = [
    'dark/ business',
    'dark/ comment',
    'dark/ culture',
    'dark/ home',
    'dark/ ireland',
    'dark/ lifeAndStyle',
    'dark/ money',
    'dark/ obituaries',
    'dark/ puzzles',
    'dark/ sport',
    'dark/ travel',
    'dark/ uk',
    'dark/ world'
]

def update_dark_canvas():
    """Update surface.canvas references in dark mode themes."""
    
    tokens_path = Path(__file__).parent.parent / 'src' / 'tokens.json'
    
    # Load tokens
    with open(tokens_path, 'r') as f:
        data = json.load(f)
    
    print("=" * 70)
    print("Dark Mode Surface Canvas Standardization")
    print("=" * 70)
    
    # Track changes
    updated_count = 0
    themes_found = 0
    missing_canvas = []
    unexpected_value = []
    
    # Verify dark/ core is correct
    print("\n✓ Verifying dark/ core (source of truth)...")
    if 'dark/ core' in data and 'surface' in data['dark/ core'] and 'canvas' in data['dark/ core']['surface']:
        core_value = data['dark/ core']['surface']['canvas']['value']
        if core_value == '{brand.core.ramp.neutral.50}':
            print(f"  ✅ dark/ core: already correct (neutral.50)")
        else:
            print(f"  ⚠️  dark/ core: unexpected value {core_value}")
    else:
        print(f"  ❌ dark/ core: surface.canvas not found!")
    
    print("\n✓ Updating 13 channel-specific dark themes...")
    
    # Process each target dark theme
    for theme_name in TARGET_DARK_THEMES:
        if theme_name not in data:
            print(f"❌ MISSING: {theme_name} not found in tokens.json")
            missing_canvas.append(theme_name)
            continue
        
        theme = data[theme_name]
        themes_found += 1
        
        # Update surface.canvas
        if 'surface' in theme and 'canvas' in theme['surface']:
            current_value = theme['surface']['canvas'].get('value', '')
            if current_value == '{brand.core.ramp.neutral.100}':
                theme['surface']['canvas']['value'] = '{brand.core.ramp.neutral.50}'
                updated_count += 1
                print(f"✅ {theme_name}: updated surface.canvas (100 → 50)")
            elif current_value == '{brand.core.ramp.neutral.50}':
                print(f"⚠️  {theme_name}: already at neutral.50 (no change needed)")
            else:
                print(f"⚠️  {theme_name}: unexpected value: {current_value}")
                unexpected_value.append((theme_name, current_value))
        else:
            print(f"❌ {theme_name}: surface.canvas not found")
            missing_canvas.append(theme_name)
    
    # Save updated tokens
    with open(tokens_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    # Summary report
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Themes processed: {themes_found}/13")
    print(f"surface.canvas updated: {updated_count}/13")
    
    # Verify final state
    print("\n✓ Verifying all 14 dark themes now use neutral.50...")
    all_correct = True
    for theme_name in ['dark/ core'] + TARGET_DARK_THEMES:
        if theme_name in data and 'surface' in data[theme_name] and 'canvas' in data[theme_name]['surface']:
            value = data[theme_name]['surface']['canvas']['value']
            if value != '{brand.core.ramp.neutral.50}':
                print(f"  ❌ {theme_name}: {value} (should be neutral.50)")
                all_correct = False
    
    if all_correct:
        print(f"  ✅ All 14 dark themes now use neutral.50 for surface.canvas")
    
    if missing_canvas:
        print(f"\n⚠️  Missing surface.canvas in: {', '.join(missing_canvas)}")
    
    if unexpected_value:
        print(f"\n⚠️  Unexpected values found:")
        for theme, value in unexpected_value:
            print(f"    {theme}: {value}")
    
    if updated_count == 13 and all_correct:
        print("\n✅ SUCCESS: All dark mode themes standardized to neutral.50")
        return 0
    else:
        print(f"\n❌ INCOMPLETE: {13 - updated_count} themes not updated")
        return 1

if __name__ == '__main__':
    sys.exit(update_dark_canvas())
