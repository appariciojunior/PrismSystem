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
        on_accent = text.get('on-accent')
        if on_accent is None:
            # create structure if missing
            text['on-accent'] = {
                'primary': {'value': '{brand.core.ramp.neutral.200}', 'type': 'color'},
                'secondary': {'value': '{brand.core.ramp.neutral.350}', 'type': 'color'}
            }
            modified.append(key)
            continue

        changed = False
        # primary
        if on_accent.get('primary', {}).get('value') != '{brand.core.ramp.neutral.200}':
            on_accent.setdefault('primary', {})['value'] = '{brand.core.ramp.neutral.200}'
            on_accent['primary']['type'] = 'color'
            changed = True

        # secondary
        if on_accent.get('secondary', {}).get('value') != '{brand.core.ramp.neutral.350}':
            on_accent.setdefault('secondary', {})['value'] = '{brand.core.ramp.neutral.350}'
            on_accent['secondary']['type'] = 'color'
            changed = True

        if changed:
            modified.append(key)

    if modified:
        TOKENS.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        print("Updated text.on-accent for:", ", ".join(modified))
    else:
        print("No changes made; all light themes already set.")

if __name__ == '__main__':
    main()
