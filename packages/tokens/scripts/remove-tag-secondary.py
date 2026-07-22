#!/usr/bin/env python3
"""
Remove tag.filled.secondary and tag.inline.secondary tokens from channel themes.

This script removes secondary tag tokens that were re-added in commit 0284b75
to restore the cleaner structure from commit c126162.

Scope: 26 channel semantic themes (13 light + 13 dark)
Excludes: brand, channels, dataVisualisation, marketing, money themes
"""

import json
import sys
from pathlib import Path

# Define the 26 channel semantic themes to update
CHANNEL_THEMES = [
    'light/ core', 'light/ business', 'light/ comment', 'light/ culture',
    'light/ home', 'light/ ireland', 'light/ lifeAndStyle', 'light/ obituaries',
    'light/ puzzles', 'light/ sport', 'light/ travel', 'light/ uk', 'light/ world',
    'dark/ core', 'dark/ business', 'dark/ comment', 'dark/ culture',
    'dark/ home', 'dark/ ireland', 'dark/ lifeAndStyle', 'dark/ obituaries',
    'dark/ puzzles', 'dark/ sport', 'dark/ travel', 'dark/ uk', 'dark/ world'
]

def count_tokens(obj):
    """Recursively count leaf tokens (those with 'value' key)"""
    count = 0
    if isinstance(obj, dict):
        if 'value' in obj and 'type' in obj:
            return 1
        for value in obj.values():
            count += count_tokens(value)
    return count

def main():
    tokens_path = Path('packages/tokens/src/tokens.json')
    
    if not tokens_path.exists():
        print(f"❌ Error: {tokens_path} not found")
        sys.exit(1)
    
    # Load tokens.json
    print(f"📖 Loading {tokens_path}...")
    with open(tokens_path, 'r') as f:
        data = json.load(f)
    
    removed_tokens_count = 0
    updated_themes = []
    token_counts_before = {}
    token_counts_after = {}
    
    # Process each channel theme
    print(f"\n🔍 Processing {len(CHANNEL_THEMES)} channel themes...\n")
    
    for theme in CHANNEL_THEMES:
        if theme not in data:
            print(f"⚠️  Theme not found: {theme}")
            continue
            
        if 'tag' not in data[theme]:
            print(f"⚠️  No tag group in: {theme}")
            continue
        
        # Count tokens before removal
        token_counts_before[theme] = count_tokens(data[theme])
        
        theme_removals = 0
        removed_items = []
        
        # Remove tag.filled.secondary
        if 'filled' in data[theme]['tag']:
            if 'secondary' in data[theme]['tag']['filled']:
                # Count tokens in secondary before deletion
                secondary_tokens = data[theme]['tag']['filled']['secondary']
                if isinstance(secondary_tokens, dict):
                    # Count border, fill, text
                    theme_removals += len([k for k in secondary_tokens.keys() if 'value' in secondary_tokens.get(k, {})])
                
                del data[theme]['tag']['filled']['secondary']
                removed_items.append('filled.secondary')
                
        # Remove tag.inline.secondary  
        if 'inline' in data[theme]['tag']:
            if 'secondary' in data[theme]['tag']['inline']:
                # Check if it's a direct token or has children
                secondary_item = data[theme]['tag']['inline']['secondary']
                if isinstance(secondary_item, dict):
                    if 'value' in secondary_item:
                        # Direct token
                        theme_removals += 1
                    else:
                        # Has children (text, etc.)
                        theme_removals += count_tokens(secondary_item)
                
                del data[theme]['tag']['inline']['secondary']
                removed_items.append('inline.secondary')
        
        # Count tokens after removal
        token_counts_after[theme] = count_tokens(data[theme])
        actual_removed = token_counts_before[theme] - token_counts_after[theme]
        
        if actual_removed > 0:
            removed_tokens_count += actual_removed
            updated_themes.append(theme)
            print(f"✅ {theme:30s} removed {actual_removed} tokens ({', '.join(removed_items)})")
            print(f"   Before: {token_counts_before[theme]:3d} tokens → After: {token_counts_after[theme]:3d} tokens")
        else:
            print(f"⚪ {theme:30s} no secondary tokens found")
    
    # Write updated tokens.json
    print(f"\n💾 Writing updated tokens.json...")
    with open(tokens_path, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Summary
    print(f"\n{'='*70}")
    print(f"📊 SUMMARY")
    print(f"{'='*70}")
    print(f"   Themes processed: {len(CHANNEL_THEMES)}")
    print(f"   Themes updated:   {len(updated_themes)}")
    print(f"   Tokens removed:   {removed_tokens_count}")
    
    # Check token count parity
    expected_count = 138
    counts_after = list(token_counts_after.values())
    unique_counts = set(counts_after)
    
    print(f"\n📈 Token Count Parity Check:")
    if len(unique_counts) == 1 and expected_count in unique_counts:
        print(f"   ✅ All {len(updated_themes)} themes have exactly {expected_count} tokens (perfect parity)")
    else:
        print(f"   ⚠️  Token counts vary: {sorted(unique_counts)}")
        mismatches = {theme: count for theme, count in token_counts_after.items() if count != expected_count}
        if mismatches:
            print(f"   Themes not matching {expected_count}:")
            for theme, count in sorted(mismatches.items()):
                print(f"      - {theme}: {count} tokens")
    
    print(f"\n✅ tokens.json updated successfully")
    print(f"\n⚠️  NEXT STEPS:")
    print(f"   1. Validate JSON syntax: python3 -m json.tool {tokens_path} > /dev/null")
    print(f"   2. Verify structure (no secondary in tag.filled/inline)")
    print(f"   3. Run build: npm run build:output")
    print(f"   4. Run tests: npm run test:output")
    print(f"   5. Commit changes")

if __name__ == '__main__':
    main()
