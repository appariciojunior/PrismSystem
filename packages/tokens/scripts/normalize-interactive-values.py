#!/usr/bin/env python3
"""
Normalize Interactive Token Values
==================================
Ensures interactive tokens have consistent values across all themes.
- Light mode themes should match light/ core values
- Dark mode themes should match dark/ core values (with fixes)

Phase 2 of interactive token rollout.
"""

import json
import sys
from pathlib import Path

TOKENS_FILE = Path(__file__).parent.parent / "src" / "tokens.json"

# Light mode themes to update (core is reference, except link.secondary which is already correct)
LIGHT_THEMES = [
    "light/ business",
    "light/ comment",
    "light/ culture",
    "light/ home",
    "light/ ireland",
    "light/ lifeAndStyle",
    "light/ money",
    "light/ obituaries",
    "light/ puzzles",
    "light/ sport",
    "light/ travel",
    "light/ uk",
    "light/ world",
]

# Dark mode themes - ALL need link.secondary fix, 13 need fill fix
DARK_THEMES_ALL = [
    "dark/ core",  # Only needs link.secondary.default fix
    "dark/ business",
    "dark/ comment",
    "dark/ culture",
    "dark/ home",
    "dark/ ireland",
    "dark/ lifeAndStyle",
    "dark/ money",
    "dark/ obituaries",
    "dark/ puzzles",
    "dark/ sport",
    "dark/ travel",
    "dark/ uk",
    "dark/ world",
]

# Dark themes that need the fill fix (all except core)
DARK_THEMES_FILL = [t for t in DARK_THEMES_ALL if t != "dark/ core"]


def set_nested_value(data: dict, path: list, value: str) -> bool:
    """Set a nested value in a dict. Returns True if changed."""
    current = data
    for key in path[:-1]:
        if key not in current:
            return False
        current = current[key]
    
    final_key = path[-1]
    if final_key not in current:
        return False
    
    if current[final_key].get("value") != value:
        current[final_key]["value"] = value
        return True
    return False


def main():
    print("=" * 60)
    print("Interactive Token Value Normalization (Phase 2)")
    print("=" * 60)
    
    # Load tokens.json
    print(f"\nLoading: {TOKENS_FILE}")
    with open(TOKENS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    total_changes = 0
    
    # === LIGHT MODE FIXES ===
    print("\n📦 LIGHT MODE THEMES")
    print("-" * 40)
    
    for theme in LIGHT_THEMES:
        if theme not in data:
            print(f"  ⚠️  {theme} not found, skipping")
            continue
        
        changes = 0
        
        # Fix primary.fill.default: digital.blue.800 → digital.blue.700
        if set_nested_value(data[theme], 
            ["interactive", "primary", "fill", "default"],
            "{brand.core.ramp.digital.blue.700}"):
            changes += 1
            print(f"  ✓ {theme}: primary.fill.default → digital.blue.700")
        
        # Fix primary.text.default: neutral.1000 → neutral.50
        if set_nested_value(data[theme],
            ["interactive", "primary", "text", "default"],
            "{brand.core.ramp.neutral.50}"):
            changes += 1
            print(f"  ✓ {theme}: primary.text.default → neutral.50")
        
        # Fix secondary.border.default: neutral.1000 → neutral.500
        if set_nested_value(data[theme],
            ["interactive", "secondary", "border", "default"],
            "{brand.core.ramp.neutral.500}"):
            changes += 1
            print(f"  ✓ {theme}: secondary.border.default → neutral.500")
        
        # Fix link.secondary.default: neutral.600 → {text.primary}
        if set_nested_value(data[theme],
            ["interactive", "link", "secondary", "default"],
            "{text.primary}"):
            changes += 1
            print(f"  ✓ {theme}: link.secondary.default → {{text.primary}}")
        
        total_changes += changes
    
    # === DARK MODE FIXES ===
    print("\n📦 DARK MODE THEMES")
    print("-" * 40)
    
    for theme in DARK_THEMES_ALL:
        if theme not in data:
            print(f"  ⚠️  {theme} not found, skipping")
            continue
        
        changes = 0
        
        # Fix primary.fill.default: digital.blue.600 → digital.blue.650 (not for core)
        if theme != "dark/ core":
            if set_nested_value(data[theme],
                ["interactive", "primary", "fill", "default"],
                "{brand.core.ramp.digital.blue.650}"):
                changes += 1
                print(f"  ✓ {theme}: primary.fill.default → digital.blue.650")
        
        # Fix link.secondary.default: neutral.600 → {text.primary} (ALL themes including core)
        if set_nested_value(data[theme],
            ["interactive", "link", "secondary", "default"],
            "{text.primary}"):
            changes += 1
            print(f"  ✓ {theme}: link.secondary.default → {{text.primary}}")
        
        total_changes += changes
    
    # Write back
    print(f"\n{'=' * 60}")
    print(f"Writing changes to: {TOKENS_FILE}")
    with open(TOKENS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ COMPLETE")
    print(f"   Total changes: {total_changes}")
    print(f"{'=' * 60}")
    
    return 0 if total_changes > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
