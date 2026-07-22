#!/usr/bin/env python3
"""
Update dark mode border.elevation references and verify surface grouping.

This script:
1. Updates border.elevation from {brand.core.ramp.neutral.950} to {brand.core.ramp.neutral.300}
   in all 12 dark mode semantic themes (excludes brand/channels/marketing/dataVis)
2. Verifies surface grouping structure exists in all 12 themes
3. Reports summary of changes

Rationale:
- neutral.950 in dark mode = #e5e5e5 (very light, poor contrast)
- neutral.300 in dark mode = #3f3f3f (darker, better contrast on dark backgrounds)
"""

import json
import sys
from pathlib import Path

# Dark mode semantic themes to update (excludes brand, channels, marketing, dataVis)
TARGET_DARK_THEMES = [
    'dark/ core',
    'dark/ comment',
    'dark/ lifeAndStyle',
    'dark/ puzzles',
    'dark/ home',
    'dark/ uk',
    'dark/ world',
    'dark/ business',
    'dark/ money',
    'dark/ sport',
    'dark/ travel',
    'dark/ culture',
    'dark/ obituaries',
    'dark/ ireland'
]

def update_dark_borders():
    """Update border.elevation references in dark mode themes."""
    
    tokens_path = Path(__file__).parent.parent / 'src' / 'tokens.json'
    
    # Load tokens
    with open(tokens_path, 'r') as f:
        data = json.load(f)
    
    print("=" * 70)
    print("Dark Mode Border Elevation Update")
    print("=" * 70)
    
    # Track changes
    updated_count = 0
    themes_found = 0
    surface_verified = 0
    missing_border = []
    missing_surface = []
    
    # Process each target dark theme
    for theme_name in TARGET_DARK_THEMES:
        if theme_name not in data:
            print(f"❌ MISSING: {theme_name} not found in tokens.json")
            missing_border.append(theme_name)
            continue
        
        theme = data[theme_name]
        themes_found += 1
        
        # Update border.elevation
        if 'border' in theme and 'elevation' in theme['border']:
            current_value = theme['border']['elevation'].get('value', '')
            if current_value == '{brand.core.ramp.neutral.950}':
                theme['border']['elevation']['value'] = '{brand.core.ramp.neutral.300}'
                updated_count += 1
                print(f"✅ {theme_name}: updated border.elevation")
            else:
                print(f"⚠️  {theme_name}: border.elevation value unexpected: {current_value}")
        else:
            print(f"❌ {theme_name}: border.elevation not found")
            missing_border.append(theme_name)
        
        # Verify surface grouping
        if 'surface' in theme:
            surface_keys = set(theme['surface'].keys())
            expected_keys = {'undercanvas', 'canvas', 'level-1', 'level-2', 'level-3', 'level-4', 'inverse', 'overlay', 'channel'}
            if surface_keys == expected_keys:
                surface_verified += 1
                print(f"✅ {theme_name}: surface grouping verified (9 properties)")
            else:
                missing_props = expected_keys - surface_keys
                extra_props = surface_keys - expected_keys
                print(f"⚠️  {theme_name}: surface structure mismatch")
                if missing_props:
                    print(f"   Missing: {missing_props}")
                if extra_props:
                    print(f"   Extra: {extra_props}")
        else:
            print(f"❌ {theme_name}: surface grouping not found")
            missing_surface.append(theme_name)
    
    # Save updated tokens
    with open(tokens_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    # Summary report
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Themes processed: {themes_found}/14")
    print(f"border.elevation updated: {updated_count}/14")
    print(f"surface grouping verified: {surface_verified}/14")
    
    if missing_border:
        print(f"\n⚠️  Missing border.elevation in: {', '.join(missing_border)}")
    
    if missing_surface:
        print(f"\n⚠️  Missing surface grouping in: {', '.join(missing_surface)}")
    
    if updated_count == 14 and surface_verified == 14:
        print("\n✅ SUCCESS: All dark mode themes updated and verified")
        return 0
    else:
        print(f"\n❌ INCOMPLETE: {14 - updated_count} themes not updated, {14 - surface_verified} missing surface")
        return 1

if __name__ == '__main__':
    sys.exit(update_dark_borders())
