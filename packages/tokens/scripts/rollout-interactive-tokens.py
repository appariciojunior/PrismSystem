#!/usr/bin/env python3
"""
Rollout Interactive Token Updates
================================
Updates interactive.primary and interactive.secondary tokens across all themes
to match the structure in light/ core.

Changes:
1. primary.text.hover/pressed - Remove $extensions (no more darken)
2. primary.icon.hover/pressed - Cascade from text, remove $extensions
3. secondary.icon.hover - Cascade from text.hover, remove $extensions
4. secondary.icon.pressed - Cascade from text.pressed, KEEP $extensions with description
"""

import json
import sys
from pathlib import Path

TOKENS_FILE = Path(__file__).parent.parent / "src" / "tokens.json"

# Themes to update (light/ core is already done, skip it)
THEMES_TO_UPDATE = [
    # Light mode themes
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
    # Dark mode themes (including dark/ core)
    "dark/ core",
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


def update_theme(data: dict, theme_name: str) -> int:
    """Update interactive tokens for a single theme. Returns count of changes made."""
    changes = 0
    
    if theme_name not in data:
        print(f"  ⚠️  Theme '{theme_name}' not found, skipping")
        return 0
    
    theme = data[theme_name]
    
    # Check if interactive section exists
    if "interactive" not in theme:
        print(f"  ⚠️  No 'interactive' section in '{theme_name}', skipping")
        return 0
    
    interactive = theme["interactive"]
    
    # 1. Update primary.text.hover - remove $extensions
    if "primary" in interactive and "text" in interactive["primary"]:
        text = interactive["primary"]["text"]
        
        if "hover" in text and "$extensions" in text["hover"]:
            del text["hover"]["$extensions"]
            changes += 1
            print(f"  ✓ Removed $extensions from primary.text.hover")
        
        if "pressed" in text and "$extensions" in text["pressed"]:
            del text["pressed"]["$extensions"]
            changes += 1
            print(f"  ✓ Removed $extensions from primary.text.pressed")
    
    # 2. Update primary.icon - cascade from text, remove $extensions
    if "primary" in interactive and "icon" in interactive["primary"]:
        icon = interactive["primary"]["icon"]
        
        if "hover" in icon:
            # Change value to cascade from text
            if icon["hover"].get("value") == "{interactive.primary.icon.default}":
                icon["hover"]["value"] = "{interactive.primary.text.hover}"
                changes += 1
                print(f"  ✓ Updated primary.icon.hover value to cascade from text")
            # Remove $extensions if present
            if "$extensions" in icon["hover"]:
                del icon["hover"]["$extensions"]
                changes += 1
                print(f"  ✓ Removed $extensions from primary.icon.hover")
        
        if "pressed" in icon:
            # Change value to cascade from text
            if icon["pressed"].get("value") == "{interactive.primary.icon.default}":
                icon["pressed"]["value"] = "{interactive.primary.text.pressed}"
                changes += 1
                print(f"  ✓ Updated primary.icon.pressed value to cascade from text")
            # Remove $extensions if present
            if "$extensions" in icon["pressed"]:
                del icon["pressed"]["$extensions"]
                changes += 1
                print(f"  ✓ Removed $extensions from primary.icon.pressed")
    
    # 3. Update secondary.icon.hover - cascade from text, remove $extensions
    if "secondary" in interactive and "icon" in interactive["secondary"]:
        icon = interactive["secondary"]["icon"]
        
        if "hover" in icon:
            # Change value to cascade from text
            if icon["hover"].get("value") == "{interactive.secondary.icon.default}":
                icon["hover"]["value"] = "{interactive.secondary.text.hover}"
                changes += 1
                print(f"  ✓ Updated secondary.icon.hover value to cascade from text")
            # Remove $extensions if present
            if "$extensions" in icon["hover"]:
                del icon["hover"]["$extensions"]
                changes += 1
                print(f"  ✓ Removed $extensions from secondary.icon.hover")
        
        # 4. Update secondary.icon.pressed - cascade from text, KEEP $extensions but add description
        if "pressed" in icon:
            # Change value to cascade from text
            if icon["pressed"].get("value") == "{interactive.secondary.icon.default}":
                icon["pressed"]["value"] = "{interactive.secondary.text.pressed}"
                changes += 1
                print(f"  ✓ Updated secondary.icon.pressed value to cascade from text")
            
            # Keep $extensions but ensure it has the description
            if "$extensions" in icon["pressed"]:
                modify = icon["pressed"]["$extensions"].get("studio.tokens", {}).get("modify", {})
                if modify and "description" not in modify:
                    modify["description"] = "Programmatic icon contrast adjustment (opposite of secondary fill modify)"
                    changes += 1
                    print(f"  ✓ Added description to secondary.icon.pressed modifier")
    
    return changes


def main():
    print("=" * 60)
    print("Interactive Token Rollout")
    print("=" * 60)
    
    # Load tokens.json
    print(f"\nLoading: {TOKENS_FILE}")
    with open(TOKENS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    total_changes = 0
    themes_updated = 0
    
    # Process each theme
    for theme_name in THEMES_TO_UPDATE:
        print(f"\n📦 Processing: {theme_name}")
        changes = update_theme(data, theme_name)
        total_changes += changes
        if changes > 0:
            themes_updated += 1
    
    # Write back
    print(f"\n{'=' * 60}")
    print(f"Writing changes to: {TOKENS_FILE}")
    with open(TOKENS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ COMPLETE")
    print(f"   Themes updated: {themes_updated}/{len(THEMES_TO_UPDATE)}")
    print(f"   Total changes:  {total_changes}")
    print(f"{'=' * 60}")
    
    return 0 if total_changes > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
