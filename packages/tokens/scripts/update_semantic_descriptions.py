#!/usr/bin/env python3
"""Dry-run tool to find and propose agnostic replacements for token descriptions.

Usage:
  python3 update_semantic_descriptions.py [--tokens path] [--json-report report.json] [--apply]

By default this only prints a human report. Use `--apply` to write changes back (it will create a backup).
"""
import re
import json
import argparse
from pathlib import Path

HEX_RE = re.compile(r"#(?:[0-9a-fA-F]{3}){1,2}")
COLOR_WORDS = re.compile(r"\b(white|black|grey|gray|red|blue|green|yellow|pink|orange|brown|purple)\b", re.I)
NEUTRAL_REF = re.compile(r"neutral\.\d{2,4}")


def load_tokens(path: Path):
    with path.open('r', encoding='utf-8') as f:
        return json.load(f)


def walk_tokens(node, path=None):
    if path is None:
        path = []
    if isinstance(node, dict):
        for k, v in node.items():
            yield from walk_tokens(v, path + [k])
    else:
        yield path, node


def scan_descriptions(data):
    matches = []
    # recursive descent: look for objects that contain a 'description' key
    def descend(obj, key_path):
        if isinstance(obj, dict):
            if 'description' in obj and isinstance(obj.get('description'), str):
                desc = obj['description']
                if HEX_RE.search(desc) or COLOR_WORDS.search(desc):
                    matches.append((key_path, desc, obj))
            for k, v in obj.items():
                descend(v, key_path + [k])
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                descend(item, key_path + [f'[{i}]'])

    descend(data, [])
    return matches


def propose_replacement(description: str):
    orig = description
    # If there is an explicit neutral token reference and a mode string, try to keep that
    neutral = NEUTRAL_REF.search(description)
    mode = None
    if 'dark mode' in description.lower():
        mode = 'dark mode'
    elif 'light mode' in description.lower():
        mode = 'light mode'

    # Remove hex codes and common colour words
    s = HEX_RE.sub('', description)
    s = COLOR_WORDS.sub('', s)

    # If we have a neutral token reference, prefer a concise replacement
    if neutral:
        token_ref = neutral.group(0)
        rest = s
        # remove leftover punctuation around token_ref
        rest = rest.replace('()', '')
        rest = re.sub(r"\s+", ' ', rest).strip(' .,-;:()')
        parts = [f"{token_ref}"]
        if mode:
            parts.append(mode)
        # Append short intent if present in original after the token reference
        # Attempt to keep trailing phrase like 'for high visual distinction' or 'for subtle dividers'
        tail_match = re.search(r"(?:for|used for|for the)\s+([^.]+)", orig, re.I)
        if tail_match:
            intent = tail_match.group(0)
            parts.append(intent)
        replacement = ' '.join(parts)
        return replacement

    # No neutral reference — remove literals and add placeholder
    # Keep any existing 'for ...' intent
    tail_match = re.search(r"(?:for|used for|for the)\s+([^.]+)", orig, re.I)
    intent = tail_match.group(0) if tail_match else ''
    placeholder = f"Replace with appropriate palette token in light/dark mode. {intent}".strip()
    return placeholder


def apply_changes(data, matches):
    changed = []
    for key_path, orig_desc, obj in matches:
        new_desc = propose_replacement(orig_desc)
        if new_desc != orig_desc:
            obj['description'] = new_desc
            changed.append((key_path, orig_desc, new_desc))
    return changed


def keypath_to_str(keypath):
    return '/'.join(keypath)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--tokens', default='packages/tokens/src/tokens.json')
    parser.add_argument('--json-report', help='Write machine-readable JSON report')
    parser.add_argument('--apply', action='store_true', help='Apply changes to tokens.json (creates a .bak)')
    args = parser.parse_args()

    tokens_path = Path(args.tokens)
    if not tokens_path.exists():
        print(f"Tokens file not found: {tokens_path}")
        return 2

    data = load_tokens(tokens_path)
    matches = scan_descriptions(data)
    report = []
    for key_path, desc, obj in matches:
        proposed = propose_replacement(desc)
        report.append({
            'path': keypath_to_str(key_path),
            'original': desc,
            'proposal': proposed,
        })

    # Print human summary
    if not report:
        print('No descriptions with literal colours or hex values found.')
    else:
        print(f'Found {len(report)} description(s) with literal colours/hex. Sample:')
        for i, item in enumerate(report[:50], 1):
            print(f"\n[{i}] Path: {item['path']}")
            print('Original:', item['original'])
            print('Proposal:', item['proposal'])

    # Save json report if requested
    if args.json_report:
        Path(args.json_report).write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
        print('\nWrote JSON report to', args.json_report)

    # If apply, modify file (with backup)
    if args.apply and report:
        backup = tokens_path.with_suffix(tokens_path.suffix + '.bak')
        backup.write_bytes(tokens_path.read_bytes())
        # re-scan and apply changes against loaded object
        changed = apply_changes(data, matches)
        tokens_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
        print(f"Applied {len(changed)} changes; backup created at {backup}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
