#!/usr/bin/env python3
"""
Map interactive.primary.text directly to neutral ramp instead of text.on-accent.primary.

Light mode themes: neutral.100 (white text on colored buttons)
Dark mode themes: neutral.900 (near-white text on colored buttons, maintains hierarchy)
"""

import json
from collections import OrderedDict

def fix_primary_text_neutral_mapping(data):
    """Map primary.text directly to neutral ramp"""
    
    light_palettes = [
        "Palette - Light/ Core - Light",
        "Palette - Light/ Comment - Light",
        "Palette - Light/ Life & Style - Light",
        "Palette - Light/ Puzzles - Light"
    ]
    
    dark_palettes = [
        "Palette - Dark/ Core - Dark",
        "Palette - Dark/ Comment - Dark",
        "Palette - Dark/ Life & Style - Dark",
        "Palette - Dark/ Puzzles - Dark"
    ]
    
    # Light mode: neutral.100
    for palette_name in light_palettes:
        if palette_name not in data:
            print(f"⚠️  Skipping {palette_name} (not found)")
            continue
            
        palette = data[palette_name]
        if "interactive" not in palette or "primary" not in palette["interactive"]:
            print(f"⚠️  Skipping {palette_name} (no interactive.primary)")
            continue
        
        primary = palette["interactive"]["primary"]
        if "text" in primary:
            primary["text"]["default"]["value"] = "{brand.core.ramp.core.neutral.100}"
            primary["text"]["default"]["description"] = "Text colour for primary interactive elements, uses lightest neutral for WCAG contrast with colored fills."
            
            primary["text"]["hover"]["value"] = "{brand.core.ramp.core.neutral.100}"
            primary["text"]["hover"]["description"] = "Hover state text colour for primary interactive elements, maintains contrast."
            
            primary["text"]["pressed"]["value"] = "{brand.core.ramp.core.neutral.100}"
            primary["text"]["pressed"]["description"] = "Pressed state text colour for primary interactive elements, maintains contrast."
        
        print(f"✅ Fixed {palette_name} → neutral.100")
    
    # Dark mode: neutral.900
    for palette_name in dark_palettes:
        if palette_name not in data:
            print(f"⚠️  Skipping {palette_name} (not found)")
            continue
            
        palette = data[palette_name]
        if "interactive" not in palette or "primary" not in palette["interactive"]:
            print(f"⚠️  Skipping {palette_name} (no interactive.primary)")
            continue
        
        primary = palette["interactive"]["primary"]
        if "text" in primary:
            primary["text"]["default"]["value"] = "{brand.core.ramp.core.neutral.900}"
            primary["text"]["default"]["description"] = "Text colour for primary interactive elements, uses near-white neutral for WCAG contrast with colored fills."
            
            primary["text"]["hover"]["value"] = "{brand.core.ramp.core.neutral.900}"
            primary["text"]["hover"]["description"] = "Hover state text colour for primary interactive elements, maintains contrast."
            
            primary["text"]["pressed"]["value"] = "{brand.core.ramp.core.neutral.900}"
            primary["text"]["pressed"]["description"] = "Pressed state text colour for primary interactive elements, maintains contrast."
        
        print(f"✅ Fixed {palette_name} → neutral.900")
    
    return data

# Load tokens
with open('packages/tokens/src/tokens.json', 'r', encoding='utf-8') as f:
    data = json.load(f, object_pairs_hook=OrderedDict)

# Fix structure
data = fix_primary_text_neutral_mapping(data)

# Save
with open('packages/tokens/src/tokens.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\n✅ Primary text now directly references neutral ramp")
print("\nMapping:")
print("  Light mode themes: neutral.100 (white on colored buttons)")
print("  Dark mode themes: neutral.900 (near-white on colored buttons)")
