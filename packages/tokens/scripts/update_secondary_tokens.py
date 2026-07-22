#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOKENS = ROOT / 'src' / 'tokens.json'

with TOKENS.open('r', encoding='utf-8') as f:
    data = json.load(f)

changed = 0

for top_key, theme in list(data.items()):
    if not isinstance(top_key, str):
        continue
    # only operate on theme token sets like 'light/ core', 'dark/ core', 'light/ brand', etc.
    if '/' not in top_key:
        continue
    if not isinstance(theme, dict):
        continue
    if 'interactive' not in theme:
        continue
    inter = theme['interactive']
    if 'secondary' not in inter:
        continue
    sec = inter['secondary']
    # 1) Fill.default in dark themes -> {brand.core.ramp.neutral.50}
    if top_key.startswith('dark/'):
        if 'fill' in sec and 'default' in sec['fill']:
            val = sec['fill']['default'].get('value')
            if val != '{brand.core.ramp.neutral.50}':
                sec['fill']['default']['value'] = '{brand.core.ramp.neutral.50}'
                changed += 1
    # 2) border.default -> {brand.core.ramp.neutral.700}
    if 'border' in sec and 'default' in sec['border']:
        val = sec['border']['default'].get('value')
        if val != '{brand.core.ramp.neutral.700}':
            sec['border']['default']['value'] = '{brand.core.ramp.neutral.700}'
            changed += 1
    # 3) text.default -> {brand.core.ramp.neutral.1000}
    if 'text' in sec and 'default' in sec['text']:
        val = sec['text']['default'].get('value')
        if val != '{brand.core.ramp.neutral.1000}':
            sec['text']['default']['value'] = '{brand.core.ramp.neutral.1000}'
            changed += 1
    # 4) icon.default -> cascade from text.default
    if 'icon' in sec and 'default' in sec['icon'] and 'text' in sec and 'default' in sec['text']:
        val = sec['icon']['default'].get('value')
        target = '{interactive.secondary.text.default}'
        if val != target:
            sec['icon']['default']['value'] = target
            changed += 1

if changed:
    with TOKENS.open('w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f'Updated {changed} token values')
else:
    print('No changes required')
