#!/usr/bin/env python3
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
TOKENS = ROOT / 'src' / 'tokens.json'

LIGHT_BORDER_ERROR = '{brand.core.ramp.messaging.error.650}'
DARK_BORDER_ERROR = '{brand.core.ramp.messaging.error.700}'
LIGHT_TEXT_ERROR = '{brand.core.ramp.messaging.error.900}'
DARK_TEXT_ERROR = '{brand.core.ramp.messaging.error.100}'

with TOKENS.open('r', encoding='utf-8') as f:
    tokens = json.load(f)
changed = False
for top, node in tokens.items():
    if not isinstance(top, str):
        continue
    if not (top.startswith('light/') or top.startswith('dark/')):
        continue
    mode = 'light' if top.startswith('light/') else 'dark'
    input_node = node.get('input')
    if not isinstance(input_node, dict):
        continue
    # fill.error
    fill = input_node.get('fill')
    if isinstance(fill, dict):
        err = fill.get('error')
        if isinstance(err, dict):
            if err.get('value') is None:
                # choose mapping
                fill['error']['value'] = DARK_TEXT_ERROR if mode=='dark' else LIGHT_TEXT_ERROR
                changed = True
        elif err is None:
            fill['error'] = {'value': DARK_TEXT_ERROR if mode=='dark' else LIGHT_TEXT_ERROR, 'type': 'color'}
            changed = True
    # border.error
    border = input_node.get('border')
    if isinstance(border, dict):
        berr = border.get('error')
        if isinstance(berr, dict):
            if berr.get('value') is None:
                border['error']['value'] = DARK_BORDER_ERROR if mode=='dark' else LIGHT_BORDER_ERROR
                changed = True
        elif berr is None:
            border['error'] = {'value': DARK_BORDER_ERROR if mode=='dark' else LIGHT_BORDER_ERROR, 'type': 'color'}
            changed = True
    # text.error
    text = input_node.get('text')
    if isinstance(text, dict):
        terr = text.get('error')
        if isinstance(terr, dict):
            if terr.get('value') is None:
                text['error']['value'] = DARK_TEXT_ERROR if mode=='dark' else LIGHT_TEXT_ERROR
                changed = True
        elif terr is None:
            text['error'] = {'value': DARK_TEXT_ERROR if mode=='dark' else LIGHT_TEXT_ERROR, 'type': 'color'}
            changed = True
    # icon.error mirror text.error
    icon = input_node.get('icon')
    if isinstance(icon, dict):
        ierr = icon.get('error')
        desired = text.get('error', {}).get('value') if isinstance(text, dict) else None
        if ierr is None:
            icon['error'] = {'value': desired or (DARK_TEXT_ERROR if mode=='dark' else LIGHT_TEXT_ERROR), 'type': 'color'}
            changed = True
        elif isinstance(ierr, dict) and ierr.get('value') is None:
            icon['error']['value'] = desired or (DARK_TEXT_ERROR if mode=='dark' else LIGHT_TEXT_ERROR)
            changed = True

if changed:
    TOKENS.write_text(json.dumps(tokens, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
    print('Patched tokens.json')
else:
    print('No changes')
