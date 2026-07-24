#!/usr/bin/env python3
"""
Fix spacing.static tokens - remove duplicates, fix naming, ensure proper order.
Per design-token-framework.md, spacing.static should be numbered 01-21.
"""

import json
from collections import OrderedDict
from pathlib import Path

# Correct spacing.static values per documentation
CORRECT_STATIC_SPACING = OrderedDict([
    ("01", {"value": "2", "type": "spacing"}),
    ("02", {"value": "3", "type": "spacing"}),
    ("03", {"value": "4", "type": "spacing"}),
    ("04", {"value": "6", "type": "spacing"}),
    ("05", {"value": "8", "type": "spacing"}),
    ("06", {"value": "10", "type": "spacing"}),
    ("07", {"value": "12", "type": "spacing"}),
    ("08", {"value": "14", "type": "spacing"}),
    ("09", {"value": "16", "type": "spacing"}),
    ("10", {"value": "18", "type": "spacing"}),
    ("11", {"value": "20", "type": "spacing"}),
    ("12", {"value": "23", "type": "spacing"}),
    ("13", {"value": "24", "type": "spacing"}),
    ("14", {"value": "28", "type": "spacing"}),
    ("15", {"value": "32", "type": "spacing"}),
    ("16", {"value": "36", "type": "spacing"}),
    ("17", {"value": "40", "type": "spacing"}),
    ("18", {"value": "48", "type": "spacing"}),
    ("19", {"value": "56", "type": "spacing"}),
    ("20", {"value": "64", "type": "spacing"}),
    ("21", {"value": "80", "type": "spacing"}),
])

def fix_spacing_static(tokens):
    """Fix spacing.static in all viewport collections"""
    viewport_sets = [
        "Viewport/ Small",
        "Viewport/ Medium", 
        "Viewport/ Large",
        "Viewport/ XLarge"
    ]
    
    for viewport in viewport_sets:
        if viewport in tokens and "spacing" in tokens[viewport]:
            # Replace static section with correct values
            tokens[viewport]["spacing"]["static"] = CORRECT_STATIC_SPACING.copy()
            print(f"✅ Fixed spacing.static in {viewport}")
    
    return tokens

def main():
    file_path = Path(__file__).parent.parent.parent / 'tokens.json'
    
    # Read with OrderedDict to preserve structure
    with open(file_path, 'r', encoding='utf-8') as f:
        tokens = json.load(f, object_pairs_hook=OrderedDict)
    
    # Fix spacing
    tokens = fix_spacing_static(tokens)
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(tokens, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Fixed spacing.static tokens in tokens.json")
    print("   - Removed duplicates")
    print("   - Fixed naming (01-21)")
    print("   - Proper sort order")

if __name__ == '__main__':
    main()
