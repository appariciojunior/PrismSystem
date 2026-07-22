#!/usr/bin/env python3
"""
Fix interactive.primary.text to use proper contrast color.

Primary interactive (e.g., buttons with colored fills):
- fill = brand/channel color
- text = text.on-accent.primary (contrasts with the fill)
- icon = inherits from text

Secondary interactive (neutral fills):
- fill = neutral background
- text = references link (colored text on neutral background)
- icon = inherits from text

Link tokens:
- Stay as references to fill colors (they're standalone text, not on colored backgrounds)
"""

import json
from collections import OrderedDict

def fix_primary_text_contrast(data):
    """Update primary.text to use on-accent text for proper contrast"""
    
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
        
        # Fix primary.text - should use on-accent for WCAG contrast with colored fill
        if "primary" in interactive and "text" in interactive["primary"]:
            # All states use on-accent (doesn't change with hover/pressed)
            interactive["primary"]["text"]["default"]["value"] = "{text.on-accent.primary}"
            interactive["primary"]["text"]["default"]["description"] = "Text colour for primary interactive elements, uses on-accent for WCAG contrast with colored fills."
            
            interactive["primary"]["text"]["hover"]["value"] = "{text.on-accent.primary}"
            interactive["primary"]["text"]["hover"]["description"] = "Hover state text colour for primary interactive elements, maintains contrast."
            
            interactive["primary"]["text"]["pressed"]["value"] = "{text.on-accent.primary}"
            interactive["primary"]["text"]["pressed"]["description"] = "Pressed state text colour for primary interactive elements, maintains contrast."
        
        # Secondary already correct (references link which has good contrast on neutral backgrounds)
        # Icon already correct (inherits from text)
        # Link already correct (references fill - they're standalone colored text)
        
        print(f"✅ Fixed {palette_name}")
    
    return data

# Load tokens
with open('packages/tokens/src/tokens.json', 'r', encoding='utf-8') as f:
    data = json.load(f, object_pairs_hook=OrderedDict)

# Fix structure
data = fix_primary_text_contrast(data)

# Save
with open('packages/tokens/src/tokens.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\n✅ Primary text now uses on-accent for proper WCAG contrast")
print("\nCorrected architecture:")
print("  Primary fill: brand/channel color")
print("  Primary text: text.on-accent.primary (contrasts WITH fill)")
print("  Primary icon: inherits from text")
print("\n  Secondary fill: neutral background")
print("  Secondary text: references link (colored on neutral)")
print("  Secondary icon: inherits from text")
print("\n  Link: references fill (standalone text, not on colored background)")
