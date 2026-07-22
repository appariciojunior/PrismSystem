#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOKENS = ROOT / 'src' / 'tokens.json'

def main():
    data = json.loads(TOKENS.read_text())
    changed = 0
    for key, theme in data.items():
        if not isinstance(theme, dict):
            continue
        inter = theme.get('interactive')
        if not inter:
            continue
        link = inter.get('link')
        if not link:
            continue
        sec = link.get('secondary')
        if not sec:
            continue
        default = sec.get('default')
        if not default:
            # older structure: might be nested under 'default' key with children
            if isinstance(sec.get('default'), dict):
                default = sec['default']
        if default and default.get('value') != '{brand.core.ramp.neutral.600}':
            default['value'] = '{brand.core.ramp.neutral.600}'
            changed += 1

    if changed:
        TOKENS.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
    print(f"Updated {changed} interactive.link.secondary.default entries to neutral.600 in {TOKENS}")

if __name__ == '__main__':
    main()
