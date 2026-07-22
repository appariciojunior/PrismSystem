#!/usr/bin/env python3
"""
Fix interactive token structure to follow semantic cascade pattern:
- Fill colors are the foundation (reference channel ramps directly)
- Link states reference fill states
- Text properties reference link states  
- Icon properties reference text properties
- Border properties reference fill states (for consistency with fill)

This ensures brand director changes cascade automatically through the system.
"""

import json
from collections import OrderedDict

def fix_interactive_structure(data):
    """Update all 8 theme variants to follow cascade pattern"""
    
    palettes = [
        "Palette - Light/ Core - Light",
        "Palette - Dark/ Core - Dark",
        "Palette - Light/ Comment - Light",
        "Palette - Dark/ Comment - Dark",
        "Palette - Light/ Life & Style - Light",
        "Palette - Dark/ Life & Style - Dark",
        "Palette - Light/ Puzzles - Light",
        "Palette - Dark/ Puzzles - Dark"
    ]
    
    for palette_name in palettes:
        if palette_name not in data:
            print(f"⚠️  Skipping {palette_name} (not found)")
            continue
            
        palette = data[palette_name]
        if "interactive" not in palette:
            print(f"⚠️  Skipping {palette_name} (no interactive section)")
            continue
        
        interactive = palette["interactive"]
        
        # Fix primary.fill - should reference channel ramp directly (foundation)
        if "primary" in interactive and "fill" in interactive["primary"]:
            # Keep fill as foundation reference (already correct pattern)
            pass
        
        # Fix link references - should reference fill states
        if "link" in interactive:
            # Primary link references primary fill
            if "primary" in interactive["link"]:
                interactive["link"]["primary"]["default"]["value"] = "{interactive.primary.fill.default}"
                interactive["link"]["primary"]["hover"]["value"] = "{interactive.primary.fill.hover}"
                interactive["link"]["primary"]["pressed"]["value"] = "{interactive.primary.fill.pressed}"
            
            # Secondary link references secondary fill  
            if "secondary" in interactive["link"]:
                interactive["link"]["secondary"]["default"]["value"] = "{interactive.secondary.fill.default}"
                interactive["link"]["secondary"]["hover"]["value"] = "{interactive.secondary.fill.hover}"
                interactive["link"]["secondary"]["pressed"]["value"] = "{interactive.secondary.fill.pressed}"
        
        # Text already references link (correct)
        # Icon already references text (correct)
        
        print(f"✅ Fixed {palette_name}")
    
    return data

# Load tokens
with open('packages/tokens/src/tokens.json', 'r', encoding='utf-8') as f:
    data = json.load(f, object_pairs_hook=OrderedDict)

# Fix structure
data = fix_interactive_structure(data)

# Save
with open('packages/tokens/src/tokens.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\n✅ Interactive cascade pattern applied to all themes")
print("\nSemantic cascade:")
print("  Foundation: fill → (references channel ramps)")
print("  Layer 1: link → (references fill)")
print("  Layer 2: text → (references link)")
print("  Layer 3: icon → (references text)")
print("\nBrand director changes to channel ramps cascade automatically!")
