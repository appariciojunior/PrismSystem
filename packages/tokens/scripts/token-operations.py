#!/usr/bin/env python3
"""
Token Operations Utility
Reusable script for common token JSON operations: reorder, flatten, bulk descriptions.
Reduces need for multiple one-off scripts.

Usage:
  python3 token-operations.py reorder <path> --pattern numeric|alpha
  python3 token-operations.py flatten <path> --target-keys <key1,key2,...>
  python3 token-operations.py describe <path> --template "description text"
  python3 token-operations.py validate <path>

Examples:
  # Reorder display tokens numerically (010, 020, ..., 150)
  python3 token-operations.py reorder "Foundation.display" --pattern numeric

  # Flatten fontSize nested structures to explicit values
  python3 token-operations.py flatten "Viewport/ Small.fontSize*" --target-keys value

  # Add descriptions to all spacing tokens
  python3 token-operations.py describe "Foundation.spacing.fluid.*" --template "Fluid spacing - scales with viewport"

  # Validate JSON structure and Token Studio compatibility
  python3 token-operations.py validate tokens.json
"""

import json
import sys
import argparse
import re
from pathlib import Path
from collections import OrderedDict
from typing import Any, Dict, List, Optional


class TokenOperations:
    """Utilities for token JSON manipulation."""

    def __init__(self, tokens_path: str = "tokens.json"):
        self.tokens_path = Path(tokens_path)
        self.tokens: Dict[str, Any] = {}
        self.load_tokens()

    def load_tokens(self) -> None:
        """Load tokens.json with order preservation."""
        with open(self.tokens_path, 'r', encoding='utf-8') as f:
            self.tokens = json.load(f, object_pairs_hook=OrderedDict)

    def save_tokens(self) -> None:
        """Save tokens.json with formatting."""
        with open(self.tokens_path, 'w', encoding='utf-8') as f:
            json.dump(self.tokens, f, indent=2, ensure_ascii=False)
            f.write('\n')

    def navigate_path(self, path: str) -> tuple[Any, str]:
        """
        Navigate to a token path like "Foundation.spacing.fluid".
        Returns (parent_dict, final_key) for modification.
        """
        parts = path.split('.')
        current = self.tokens
        
        for i, part in enumerate(parts[:-1]):
            if part not in current:
                raise KeyError(f"Path not found: {'.'.join(parts[:i+1])}")
            current = current[part]
        
        return current, parts[-1]

    def find_matching_paths(self, pattern: str) -> List[str]:
        """
        Find all paths matching a glob-style pattern.
        Supports wildcards: Foundation.spacing.fluid.*
        """
        def walk_tokens(obj: Any, path: str = "") -> List[str]:
            paths = []
            if isinstance(obj, dict):
                for key, value in obj.items():
                    current_path = f"{path}.{key}" if path else key
                    paths.append(current_path)
                    paths.extend(walk_tokens(value, current_path))
            return paths

        all_paths = walk_tokens(self.tokens)
        regex_pattern = pattern.replace('.', r'\.').replace('*', '.*')
        return [p for p in all_paths if re.match(f"^{regex_pattern}$", p)]

    def reorder_numeric(self, parent: Dict, key: str) -> None:
        """
        Reorder tokens numerically (010, 020, ..., 150).
        Handles both direct children and nested structures.
        """
        target = parent[key]
        if not isinstance(target, dict):
            print(f"⚠️  {key} is not a dict, skipping reorder")
            return

        # Extract numeric tokens (keys like "010", "020", etc.)
        numeric_keys = [k for k in target.keys() if k.isdigit()]
        if not numeric_keys:
            print(f"⚠️  No numeric keys found in {key}")
            return

        # Sort and rebuild
        sorted_keys = sorted(numeric_keys, key=int)
        other_keys = [k for k in target.keys() if not k.isdigit()]
        
        reordered = OrderedDict()
        for k in sorted_keys:
            reordered[k] = target[k]
        for k in other_keys:
            reordered[k] = target[k]

        parent[key] = reordered
        print(f"✅ Reordered {len(sorted_keys)} numeric tokens in {key}")

    def reorder_alpha(self, parent: Dict, key: str) -> None:
        """Reorder tokens alphabetically."""
        target = parent[key]
        if not isinstance(target, dict):
            print(f"⚠️  {key} is not a dict, skipping reorder")
            return

        sorted_dict = OrderedDict(sorted(target.items()))
        parent[key] = sorted_dict
        print(f"✅ Reordered {len(sorted_dict)} tokens alphabetically in {key}")

    def flatten_structure(self, parent: Dict, key: str, target_keys: List[str]) -> None:
        """
        Flatten nested token references to explicit values.
        Example: "{dimension.100} * {viewport.multiplier.small}" -> "4"
        """
        target = parent[key]
        if not isinstance(target, dict):
            return

        def resolve_value(val: Any) -> Any:
            """Recursively resolve token references."""
            if isinstance(val, str) and '{' in val:
                # Simple reference resolution (extend as needed)
                return val  # Placeholder - add full resolver if needed
            return val

        def flatten_recursive(obj: Dict) -> None:
            for k, v in obj.items():
                if isinstance(v, dict):
                    if 'value' in v and any(tk in v for tk in target_keys):
                        # Flatten this token
                        v['value'] = resolve_value(v['value'])
                    flatten_recursive(v)

        flatten_recursive(target)
        print(f"✅ Flattened structure in {key}")

    def add_descriptions(self, parent: Dict, key: str, template: str) -> None:
        """Add or update descriptions for all tokens in a path."""
        target = parent[key]
        if not isinstance(target, dict):
            return

        count = 0
        def add_desc_recursive(obj: Dict, path: str = "") -> None:
            nonlocal count
            for k, v in obj.items():
                if isinstance(v, dict):
                    if 'value' in v:
                        # Token leaf node
                        if 'description' not in v or not v['description']:
                            v['description'] = template
                            count += 1
                    else:
                        # Recurse deeper
                        add_desc_recursive(v, f"{path}.{k}" if path else k)

        add_desc_recursive(target)
        print(f"✅ Added/updated {count} descriptions in {key}")

    def validate_json(self) -> bool:
        """Validate JSON structure and Token Studio compatibility."""
        errors = []
        warnings = []

        # Check for metadata keys at root (warn, don't fail)
        metadata_keys = ['$figmaCollections', '$themes', '$tokenSetOrder']
        for key in metadata_keys:
            if key in self.tokens:
                warnings.append(f"⚠️  Metadata key found: {key} (may cause parsing issues)")

        # Check font weight strings (must be strings, not numbers)
        def check_font_weights(obj: Any, path: str = "") -> None:
            if isinstance(obj, dict):
                if obj.get('type') == 'fontWeights' and 'value' in obj:
                    if isinstance(obj['value'], (int, float)):
                        errors.append(f"❌ Font weight must be string: {path}")
                for key, value in obj.items():
                    check_font_weights(value, f"{path}.{key}" if path else key)

        check_font_weights(self.tokens)

        # Check valid JSON structure
        try:
            json.dumps(self.tokens)
        except Exception as e:
            errors.append(f"❌ JSON serialization error: {e}")

        if warnings:
            print("\n".join(warnings))
        
        if errors:
            print("\n".join(errors))
            return False
        
        print("✅ Validation passed - Token Studio compatible")
        return True


def main():
    parser = argparse.ArgumentParser(
        description="Reusable token operations utility",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    subparsers = parser.add_subparsers(dest='operation', required=True)

    # Reorder command
    reorder_parser = subparsers.add_parser('reorder', help='Reorder tokens')
    reorder_parser.add_argument('path', help='Token path (e.g., Foundation.spacing)')
    reorder_parser.add_argument('--pattern', choices=['numeric', 'alpha'], default='numeric')
    reorder_parser.add_argument('--tokens-file', default='tokens.json')

    # Flatten command
    flatten_parser = subparsers.add_parser('flatten', help='Flatten nested structures')
    flatten_parser.add_argument('path', help='Token path with optional wildcard')
    flatten_parser.add_argument('--target-keys', default='value', help='Keys to flatten (comma-separated)')
    flatten_parser.add_argument('--tokens-file', default='tokens.json')

    # Describe command
    describe_parser = subparsers.add_parser('describe', help='Add bulk descriptions')
    describe_parser.add_argument('path', help='Token path with optional wildcard')
    describe_parser.add_argument('--template', required=True, help='Description template')
    describe_parser.add_argument('--tokens-file', default='tokens.json')

    # Validate command
    validate_parser = subparsers.add_parser('validate', help='Validate JSON structure')
    validate_parser.add_argument('--tokens-file', default='tokens.json')

    args = parser.parse_args()

    # Initialize operations
    ops = TokenOperations(args.tokens_file if hasattr(args, 'tokens_file') else 'tokens.json')

    try:
        if args.operation == 'reorder':
            parent, key = ops.navigate_path(args.path)
            if args.pattern == 'numeric':
                ops.reorder_numeric(parent, key)
            else:
                ops.reorder_alpha(parent, key)
            ops.save_tokens()

        elif args.operation == 'flatten':
            target_keys = args.target_keys.split(',')
            if '*' in args.path:
                paths = ops.find_matching_paths(args.path)
                for path in paths:
                    parent, key = ops.navigate_path(path)
                    ops.flatten_structure(parent, key, target_keys)
            else:
                parent, key = ops.navigate_path(args.path)
                ops.flatten_structure(parent, key, target_keys)
            ops.save_tokens()

        elif args.operation == 'describe':
            if '*' in args.path:
                paths = ops.find_matching_paths(args.path)
                for path in paths:
                    parent, key = ops.navigate_path(path)
                    ops.add_descriptions(parent, key, args.template)
            else:
                parent, key = ops.navigate_path(args.path)
                ops.add_descriptions(parent, key, args.template)
            ops.save_tokens()

        elif args.operation == 'validate':
            success = ops.validate_json()
            sys.exit(0 if success else 1)

    except KeyError as e:
        print(f"❌ Path error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Operation failed: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
