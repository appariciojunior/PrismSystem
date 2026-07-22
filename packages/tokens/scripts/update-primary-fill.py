#!/usr/bin/env python3
"""Update interactive.primary.fill.default values across all themes."""

import json
import sys
from pathlib import Path

# Configuration
TOKENS_FILE = Path(__file__).parent.parent / "src" / "tokens.json"

LIGHT_MODE_THEMES = [
    "light/ core", "light/ business", "light/ comment", "light/ culture",
    "light/ home", "light/ ireland", "light/ lifeAndStyle", "light/ money",
    "light/ obituaries", "light/ puzzles", "light/ sport", "light/ travel",
    "light/ uk", "light/ world"
]

DARK_MODE_THEMES = [
    "dark/ core", "dark/ business", "dark/ comment", "dark/ culture",
    "dark/ home", "dark/ ireland", "dark/ lifeAndStyle", "dark/ money",
    "dark/ obituaries", "dark/ puzzles", "dark/ sport", "dark/ travel",
    "dark/ uk", "dark/ world"
]

LIGHT_VALUE = "{brand.core.ramp.digital.blue.800}"
DARK_VALUE = "{brand.core.ramp.digital.blue.550}"

def update_tokens():
    """Update primary fill values."""
    print(f"📖 Reading {TOKENS_FILE}")
    with open(TOKENS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    changes = []
    
    # Update light mode themes
    for theme in LIGHT_MODE_THEMES:
        if theme in data:
            token_path = data[theme]["interactive"]["primary"]["fill"]["default"]
            old_value = token_path["value"]
            token_path["value"] = LIGHT_VALUE
            changes.append(f"  {theme}: {old_value} → {LIGHT_VALUE}")
            print(f"✓ Updated {theme}")
        else:
            print(f"⚠️  Theme not found: {theme}")
    
    # Update dark mode themes
    for theme in DARK_MODE_THEMES:
        if theme in data:
            token_path = data[theme]["interactive"]["primary"]["fill"]["default"]
            old_value = token_path["value"]
            token_path["value"] = DARK_VALUE
            changes.append(f"  {theme}: {old_value} → {DARK_VALUE}")
            print(f"✓ Updated {theme}")
        else:
            print(f"⚠️  Theme not found: {theme}")
    
    # Write back
    print(f"\n💾 Writing changes to {TOKENS_FILE}")
    with open(TOKENS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Updated {len(changes)} tokens")
    print("\n📝 Changes made:")
    for change in changes[:5]:  # Show first 5
        print(change)
    if len(changes) > 5:
        print(f"  ... and {len(changes) - 5} more")
    
    return len(changes)

if __name__ == "__main__":
    try:
        count = update_tokens()
        print(f"\n🎉 Complete! {count} tokens updated")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        sys.exit(1)
