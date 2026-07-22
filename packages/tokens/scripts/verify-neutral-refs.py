#!/usr/bin/env python3
"""
Verify neutral ramp references match expected light/dark mode patterns.

This script audits all tokens that reference neutral ramps and identifies
which ones don't match the expected pattern for their mode.

Usage:
    python3 verify-neutral-refs.py
    python3 verify-neutral-refs.py --output audit.json
    python3 verify-neutral-refs.py --theme "light/ core"
"""

import json
import sys
from pathlib import Path
from collections import defaultdict

# Load source and reconciled tokens
SRC = json.loads(Path('packages/tokens/src/tokens.json').read_text())
REC = json.loads(Path('packages/output/tokens-reconciled.json').read_text())

# Expected references per token (based on NEUTRAL_REFERENCE_MAPPING.md)
EXPECTED_REFS = {
    # Text tokens (foreground)
    "interactive.primary.text.default": {"light": "neutral.50", "dark": "neutral.1000"},
    "interactive.primary.text.hover": {"light": "neutral.50", "dark": "neutral.1000"},
    "interactive.secondary.text.default": {"light": "neutral.50", "dark": "neutral.1000"},
    "text.primary": {"light": "neutral.950", "dark": "neutral.800"},
    "text.secondary": {"light": "neutral.800", "dark": "neutral.700"},
    "text.tertiary": {"light": "neutral.600", "dark": "neutral.600"},
    
    # Surface tokens (background)
    "surface.canvas": {"light": "neutral.1000", "dark": "neutral.50"},
    "surface.level-1": {"light": "neutral.1000", "dark": "neutral.100"},
    "surface.level-2": {"light": "neutral.1000", "dark": "neutral.100"},
    "surface.level-3": {"light": "neutral.1000", "dark": "neutral.100"},
    "surface.inverse": {"light": "neutral.1000", "dark": "neutral.50"},
    
    # Border tokens
    "border.primary": {"light": "neutral.400", "dark": "neutral.600"},
}

def get_nested(d, path):
    """Get value from nested dict using dot notation."""
    if not d:
        return None
    parts = path.split('.')
    cur = d
    for p in parts:
        if isinstance(cur, dict):
            cur = cur.get(p)
        else:
            return None
    return cur

def get_value(theme, path):
    """Get token value from reconciled."""
    token = get_nested(REC.get(theme), path)
    if isinstance(token, dict):
        return token.get('value')
    return token

def get_ref(theme, path):
    """Get token reference from source."""
    token = get_nested(SRC.get(theme), path)
    if isinstance(token, dict):
        return token.get('value')
    return token

def extract_neutral_step(ref_str):
    """Extract neutral step from reference string.
    
    Examples:
        "{brand.core.ramp.neutral.1000}" -> "neutral.1000"
        "{brand.core.ramp.neutral.50}" -> "neutral.50"
    """
    if not ref_str or 'neutral' not in str(ref_str):
        return None
    parts = str(ref_str).split('.')
    for i, p in enumerate(parts):
        if p == 'neutral' and i + 1 < len(parts):
            step = parts[i + 1].rstrip('}')
            return f"neutral.{step}"
    return None

def main():
    print("🔍 Auditing neutral ramp references...\n")
    
    mismatches = defaultdict(list)
    matches = defaultdict(list)
    
    for token_name, expected in EXPECTED_REFS.items():
        light_ref = get_ref('light/ core', token_name)
        dark_ref = get_ref('dark/ core', token_name)
        
        light_step = extract_neutral_step(light_ref)
        dark_step = extract_neutral_step(dark_ref)
        
        # Check light mode
        if light_step and light_step != expected['light']:
            mismatches['light'].append({
                'token': token_name,
                'expected': expected['light'],
                'current': light_step,
                'current_ref': light_ref,
                'resolved': get_value('light/ core', token_name)
            })
        elif light_step:
            matches['light'].append(token_name)
        
        # Check dark mode
        if dark_step and dark_step != expected['dark']:
            mismatches['dark'].append({
                'token': token_name,
                'expected': expected['dark'],
                'current': dark_step,
                'current_ref': dark_ref,
                'resolved': get_value('dark/ core', token_name)
            })
        elif dark_step:
            matches['dark'].append(token_name)
    
    # Print report
    print("=" * 80)
    print("MISMATCHES (Tokens with wrong references)")
    print("=" * 80)
    
    for mode in ['light', 'dark']:
        if mismatches[mode]:
            print(f"\n{mode.upper()} MODE:")
            for item in mismatches[mode]:
                print(f"\n  ❌ {item['token']}")
                print(f"     Expected:  {item['expected']}")
                print(f"     Current:   {item['current']}")
                print(f"     Full Ref:  {item['current_ref']}")
                print(f"     Resolves:  {item['resolved']}")
        else:
            print(f"\n✓ {mode.upper()} MODE: All audited tokens correct!")
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    total_checked = len(EXPECTED_REFS) * 2
    total_mismatched = len(mismatches['light']) + len(mismatches['dark'])
    print(f"Tokens checked: {total_checked}")
    print(f"Tokens with correct refs: {total_checked - total_mismatched}")
    print(f"Tokens with WRONG refs: {total_mismatched} ⚠️")
    
    if total_mismatched > 0:
        print("\n🔧 Fix these tokens in packages/tokens/src/tokens.json:")
        for item in mismatches['light']:
            print(f"  light/ core / {item['token']}: {item['current']} → {item['expected']}")
        for item in mismatches['dark']:
            print(f"  dark/ core / {item['token']}: {item['current']} → {item['expected']}")
        sys.exit(1)
    else:
        print("\n✨ All neutral ramp references are correct!")
        sys.exit(0)

if __name__ == '__main__':
    main()
