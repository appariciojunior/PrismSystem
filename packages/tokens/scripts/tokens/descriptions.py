#!/usr/bin/env python3
"""
1. Remove unhelpful ramp descriptions
2. Add meaningful typography descriptions
"""

import json
import re
from pathlib import Path

def remove_ramp_descriptions(tokens):
    """Remove descriptions matching pattern 'X colour ramp at scale Y'"""
    
    # Patterns to match and remove
    patterns = [
        r'^.*colour ramp at scale \d+$',
        r'^.*colour ramp at scale \d+ 🎨 Brand$',
        r'^Core colour ramp at scale \d+$',
        r'^Data visualisation colour .* at scale \d+$',
        r'^Data visualisation colour .* at scale \d+ 🎨 Brand$'
    ]
    
    removed_count = 0
    
    def process_dict(obj):
        nonlocal removed_count
        if isinstance(obj, dict):
            # Check if this is a token with a description
            if 'description' in obj and isinstance(obj['description'], str):
                desc = obj['description']
                for pattern in patterns:
                    if re.match(pattern, desc):
                        # Keep the 🎨 Brand marker if present
                        if '�� Brand' in desc:
                            obj['description'] = '🎨 Brand'
                        else:
                            del obj['description']
                        removed_count += 1
                        break
            
            # Recursively process nested dicts
            for value in obj.values():
                process_dict(value)
        elif isinstance(obj, list):
            for item in obj:
                process_dict(item)
    
    process_dict(tokens)
    return removed_count

def add_typography_descriptions(tokens):
    """Add meaningful descriptions to typography tokens"""
    
    # Typography descriptions based on UX best practices
    typography_descriptions = {
        'utility': {
            'button': {
                'xsmall': 'Compact button text for space-constrained interfaces (mobile, dense tables)',
                'small': 'Standard button text for secondary actions and mobile primary buttons',
                'medium': 'Primary button text for desktop interfaces and call-to-action buttons',
                'large': 'Prominent button text for hero sections and high-impact calls-to-action'
            },
            'label': {
                'xsmall': 'Micro labels for badges, tags, and status indicators',
                'small': 'Standard form labels, captions, and metadata text',
                'medium': 'Prominent form labels and section headings within cards',
                'large': 'Large form labels and emphasized metadata (card titles, emphasized labels)'
            },
            'link': {
                'xsmall': 'Inline links within small body text, footnotes, and compact navigation',
                'small': 'Standard inline links within body text and navigation menus',
                'medium': 'Prominent standalone links and primary navigation items',
                'large': 'Large standalone links for feature callouts and hero sections'
            }
        }
    }
    
    updated_count = 0
    
    # Navigate to Typography styles / utility
    if 'Typography styles' in tokens:
        typo = tokens['Typography styles']
        if 'utility' in typo:
            utility = typo['utility']
            
            for category, sizes in typography_descriptions['utility'].items():
                if category in utility:
                    for size, description in sizes.items():
                        if size in utility[category]:
                            utility[category][size]['description'] = description
                            updated_count += 1
    
    return updated_count

def main():
    tokens_path = Path(__file__).parent / 'tokens.json'
    
    print("📖 Reading tokens.json...")
    with open(tokens_path, 'r') as f:
        tokens = json.load(f)
    
    print("\n🗑️  Removing unhelpful ramp descriptions...")
    removed = remove_ramp_descriptions(tokens)
    print(f"   ✓ Removed {removed} ramp descriptions")
    
    print("\n📝 Adding typography descriptions...")
    added = add_typography_descriptions(tokens)
    print(f"   ✓ Added {added} typography descriptions")
    
    print("\n💾 Writing updated tokens.json...")
    with open(tokens_path, 'w') as f:
        json.dump(tokens, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Complete!")
    print(f"   - Removed: {removed} ramp descriptions")
    print(f"   - Added: {added} typography descriptions")

if __name__ == '__main__':
    main()
