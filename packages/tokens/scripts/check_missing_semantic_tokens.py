#!/usr/bin/env python3
"""Compare semantic token keys in `light/ core` against other light themes.

Usage:
  python3 check_missing_semantic_tokens.py [--tokens path] [--theme THEME] [--report path]

If `--theme` is provided, only that theme will be checked (e.g., "home").
Otherwise all `light/ *` themes (except `core`) are checked.
"""
import json
from pathlib import Path
import argparse


def load_tokens(path: Path):
    with path.open('r', encoding='utf-8') as f:
        return json.load(f)


def collect_paths(obj, prefix=''):
    """Return a set of hierarchical paths for nested dict keys under obj.
    Paths are returned as dot-separated strings (e.g., 'interactive.link.secondary.default')."""
    paths = set()

    def rec(node, parts):
        if isinstance(node, dict):
            if 'value' in node or 'description' in node:
                # treat this location as a leaf token
                paths.add('.'.join(parts))
            for k, v in node.items():
                rec(v, parts + [k])

    rec(obj, [])
    return paths


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--tokens', default='packages/tokens/src/tokens.json')
    parser.add_argument('--theme', help='Optional single theme to check (e.g., home)')
    parser.add_argument('--report', default='packages/tokens/scripts/missing_semantic_tokens_report.json')
    args = parser.parse_args()

    tokens_path = Path(args.tokens)
    if not tokens_path.exists():
        print('Tokens file not found:', tokens_path)
        return 2

    data = load_tokens(tokens_path)

    # Collect all top-level keys that start with 'light/ '
    light_keys = [k for k in data.keys() if k.startswith('light/')]
    core_key = 'light/ core'
    if core_key not in data:
        print('Error: expected key "light/ core" not found in tokens.json')
        return 2

    core_paths = collect_paths(data[core_key])

    themes = []
    for k in light_keys:
        if k == core_key:
            continue
        # top-level theme name after 'light/ '
        theme_name = k.split('/ ', 1)[1]
        if args.theme and theme_name != args.theme:
            continue
        themes.append((theme_name, k))

    report = {'core_count': len(core_paths), 'themes': {}}

    for theme_name, key in themes:
        theme_obj = data[key]
        theme_paths = collect_paths(theme_obj)
        missing = sorted(list(core_paths - theme_paths))
        report['themes'][theme_name] = {
            'theme_key': key,
            'theme_count': len(theme_paths),
            'missing_count': len(missing),
            'missing': missing[:500],
        }

    Path(args.report).write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
    print('Wrote report to', args.report)
    # Print summary
    for t, info in report['themes'].items():
        print(f"{t}: missing {info['missing_count']} tokens (theme has {info['theme_count']} tokens)")

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
