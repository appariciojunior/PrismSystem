#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
TOKENS = ROOT / "packages/tokens/src/tokens.json"

def main():
    data = json.loads(TOKENS.read_text())
    modified = []

    for key in list(data.keys()):
        if not key.startswith('light/'):
            continue
        theme_block = data[key]
        text = theme_block.get('text')
        if not text:
            continue
        primary = text.get('primary')
        if primary is None:
            text['primary'] = {'value': '{brand.core.ramp.neutral.950}', 'type': 'color'}
            modified.append(key)
            continue

        if primary.get('value') != '{brand.core.ramp.neutral.950}':
            primary['value'] = '{brand.core.ramp.neutral.950}'
            primary['type'] = 'color'
            modified.append(key)

    if modified:
        TOKENS.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        print('Updated text.primary for:', ', '.join(modified))
    else:
        print('No changes made; all light themes already set to neutral.950')

if __name__ == '__main__':
    main()
