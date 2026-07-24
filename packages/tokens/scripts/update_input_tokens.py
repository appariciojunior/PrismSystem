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
        inp = theme_block.setdefault('input', {})

        # ensure structure
        fill = inp.setdefault('fill', {})
        border = inp.setdefault('border', {})
        text = inp.setdefault('text', {})

        changed = False
        if fill.get('default', {}).get('value') != '{brand.core.ramp.neutral.50}':
            fill.setdefault('default', {})['value'] = '{brand.core.ramp.neutral.50}'
            fill['default']['type'] = 'color'
            changed = True

        if border.get('default', {}).get('value') != '{brand.core.ramp.neutral.850}':
            border.setdefault('default', {})['value'] = '{brand.core.ramp.neutral.850}'
            border['default']['type'] = 'color'
            changed = True

        if border.get('error', {}).get('value') != '{brand.core.ramp.messaging.error.850}':
            border.setdefault('error', {})['value'] = '{brand.core.ramp.messaging.error.850}'
            border['error']['type'] = 'color'
            changed = True

        if text.get('default', {}).get('value') != '{brand.core.ramp.neutral.950}':
            text.setdefault('default', {})['value'] = '{brand.core.ramp.neutral.950}'
            text['default']['type'] = 'color'
            changed = True

        if text.get('error', {}).get('value') != '{brand.core.ramp.messaging.error.950}':
            text.setdefault('error', {})['value'] = '{brand.core.ramp.messaging.error.950}'
            text['error']['type'] = 'color'
            changed = True

        if changed:
            modified.append(key)

    if modified:
        TOKENS.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        print('Updated input tokens for:', ', '.join(modified))
    else:
        print('No changes made; input tokens already set.')

if __name__ == '__main__':
    main()
