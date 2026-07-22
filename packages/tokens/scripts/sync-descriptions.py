#!/usr/bin/env python3
"""
Sync token descriptions from Semantic Token Usage Guide to tokens.json.

This script:
1. Extracts descriptions from the Semantic Token Usage Guide
2. Compares with descriptions in tokens.json across all theme sets
3. Reports mismatches
4. Optionally updates tokens.json with synced descriptions
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Tuple

# Theme sets to check
THEME_SETS = [
    "light/ core",
    "dark/ core",
    "light/ comment",
    "dark/ comment",
    "light/ lifeAndStyle",
    "dark/ lifeAndStyle",
    "light/ puzzles",
    "dark/ puzzles",
]

# Semantic token categories from the guide
SEMANTIC_CATEGORIES = [
    "interactive",
    "feedback",
    "selection",
    "selected",
    "active",
    "text",
    "surface",
    "border",
    "input",
    "tag",
    "channel",
]


def parse_guide_descriptions(guide_path: Path) -> Dict[str, str]:
    """Extract token descriptions from the Semantic Token Usage Guide."""
    descriptions = {}

    with open(guide_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all markdown tables with token descriptions
    # Pattern: | `token.path.name` | Description text |
    pattern = r'\|\s*`([a-z.\-]+)`\s*\|\s*(.+?)\s*\|'

    matches = re.findall(pattern, content, re.MULTILINE)

    for token_path, description in matches:
        # Clean up description (remove extra spaces, trailing periods if inconsistent)
        clean_desc = description.strip()
        descriptions[token_path] = clean_desc

    return descriptions


def get_token_description(tokens_data: dict, theme_set: str, token_path: str) -> str:
    """Get description for a token from tokens.json."""
    if theme_set not in tokens_data:
        return None

    # Navigate the nested structure
    parts = token_path.split('.')
    current = tokens_data[theme_set]

    for part in parts:
        if not isinstance(current, dict) or part not in current:
            return None
        current = current[part]

    # Check if this is a leaf node with a description
    if isinstance(current, dict) and 'description' in current:
        return current['description']

    return None


def set_token_description(tokens_data: dict, theme_set: str, token_path: str, description: str) -> bool:
    """Set description for a token in tokens.json."""
    if theme_set not in tokens_data:
        return False

    # Navigate the nested structure
    parts = token_path.split('.')
    current = tokens_data[theme_set]

    for part in parts[:-1]:
        if not isinstance(current, dict) or part not in current:
            return False
        current = current[part]

    # Set description on the final part
    final_part = parts[-1]
    if final_part in current and isinstance(current[final_part], dict):
        current[final_part]['description'] = description
        return True

    return False


def compare_descriptions(tokens_path: Path, guide_path: Path) -> Tuple[List, List]:
    """
    Compare descriptions between guide and tokens.json.

    Returns (mismatches, missing) where:
    - mismatches: list of (token_path, theme_set, guide_desc, json_desc) for desc differences
    - missing: list of (token_path, theme_set) for tokens not found in json
    """
    mismatches = []
    missing = []

    # Load guide descriptions
    guide_descriptions = parse_guide_descriptions(guide_path)

    # Load tokens.json
    with open(tokens_path, 'r', encoding='utf-8') as f:
        tokens_data = json.load(f)

    print(f"Found {len(guide_descriptions)} token descriptions in guide\n")

    # Check each token across all theme sets
    for token_path, guide_desc in sorted(guide_descriptions.items()):
        found_any = False
        desc_issues = 0

        for theme_set in THEME_SETS:
            json_desc = get_token_description(tokens_data, theme_set, token_path)

            if json_desc is None:
                missing.append((token_path, theme_set))
            else:
                found_any = True
                if json_desc != guide_desc:
                    mismatches.append((token_path, theme_set, guide_desc, json_desc))
                    desc_issues += 1

        # Print summary for this token
        if found_any and desc_issues > 0:
            print(f"❌ {token_path}: {desc_issues} theme(s) need description update")
        elif found_any:
            print(f"✅ {token_path}: All descriptions synced")
        else:
            print(f"⚠️  {token_path}: Not found in any theme set")

    return mismatches, missing


def sync_descriptions(tokens_path: Path, guide_path: Path, dry_run: bool = True) -> int:
    """
    Sync descriptions from guide to tokens.json.

    Returns number of updates made.
    """
    # Load guide descriptions
    guide_descriptions = parse_guide_descriptions(guide_path)

    # Load tokens.json
    with open(tokens_path, 'r', encoding='utf-8') as f:
        tokens_data = json.load(f)

    update_count = 0

    # Update each token across all theme sets
    for token_path, guide_desc in sorted(guide_descriptions.items()):
        for theme_set in THEME_SETS:
            json_desc = get_token_description(tokens_data, theme_set, token_path)

            if json_desc is not None and json_desc != guide_desc:
                if dry_run:
                    print(f"[DRY RUN] Would update {theme_set}.{token_path}")
                else:
                    success = set_token_description(tokens_data, theme_set, token_path, guide_desc)
                    if success:
                        print(f"✅ Updated {theme_set}.{token_path}")
                        update_count += 1

    # Write back to tokens.json if not dry run
    if not dry_run and update_count > 0:
        with open(tokens_path, 'w', encoding='utf-8') as f:
            json.dump(tokens_data, f, indent=2, ensure_ascii=False)
        print(f"\n✅ Updated {update_count} descriptions in tokens.json")

    return update_count


def main():
    base_path = Path(__file__).parent
    tokens_path = base_path / "tokens.json"
    guide_path = base_path / "Semantic Token Usage Guide.md"

    print("=" * 80)
    print("Token Description Sync Report")
    print("=" * 80)
    print()

    # Compare and report
    mismatches, missing = compare_descriptions(tokens_path, guide_path)

    print()
    print("=" * 80)
    print("Summary")
    print("=" * 80)
    print(f"Description mismatches (will be synced): {len(mismatches)}")
    print(f"Missing tokens (will be skipped): {len(missing)}")
    print()

    if mismatches:
        # Group by token to show which tokens need updates
        tokens_needing_update = {}
        for token_path, theme_set, _, _ in mismatches:
            if token_path not in tokens_needing_update:
                tokens_needing_update[token_path] = []
            tokens_needing_update[token_path].append(theme_set)

        print(f"Tokens needing description updates: {len(tokens_needing_update)}")
        print("\nRun with --sync flag to update tokens.json")

    return len(mismatches)


if __name__ == "__main__":
    import sys

    if "--sync" in sys.argv:
        print("🔄 SYNC MODE: Updating tokens.json...")
        base_path = Path(__file__).parent
        tokens_path = base_path / "tokens.json"
        guide_path = base_path / "Semantic Token Usage Guide.md"
        count = sync_descriptions(tokens_path, guide_path, dry_run=False)
        print(f"\n✅ Synced {count} descriptions")
    else:
        exit(main())
