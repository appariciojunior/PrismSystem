#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOKENS = ROOT / 'src' / 'tokens.json'

with TOKENS.open('r', encoding='utf-8') as f:
    data = json.load(f)

changed = 0

for top_key in list(data.keys()):
    if not isinstance(top_key, str):
        continue
    if top_key.startswith('light/') or top_key.startswith('dark/'):
        is_light = top_key.startswith('light/')
        theme = data[top_key]
        # find any 'interactive' key nested directly under theme
        if 'interactive' in theme:
            inter = theme['interactive']
            # Walk expected subkeys
            for part in ['primary','secondary','link']:
                if part not in inter:
                    continue
                node = inter[part]
                # for primary and secondary we expect subkeys like fill,text,icon,border
                for sub in list(node.keys()):
                    subnode = node[sub]
                    for state in ['hover','pressed']:
                        if state in subnode:
                            s = subnode[state]
                            # set value to reference the default of the same token
                            # e.g. {interactive.primary.fill.default}
                            # compute path relative to current location
                            default_ref = f"{{interactive.{part}.{sub}.default}}"
                            if s.get('value') != default_ref:
                                s['value'] = default_ref
                                changed += 1
                            # set extensions.modify
                            mod = s.get('$extensions', {}).get('studio.tokens', {}).get('modify')
                            if not mod:
                                s.setdefault('$extensions', {}).setdefault('studio.tokens', {})['modify'] = {}
                                mod = s['$extensions']['studio.tokens']['modify']
                            # choose type based on theme kind
                            mod['type'] = 'darken' if is_light else 'lighten'
                            mod['value'] = '{colour.modifier.interactive.' + state + '}'
                            mod['space'] = 'hsl'

# write back if changed
if changed:
    with TOKENS.open('w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f'Updated {changed} hover/pressed entries to reference default and set modifiers')
else:
    print('No changes required')
