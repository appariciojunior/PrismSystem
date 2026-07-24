#!/usr/bin/env python3
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
TOKENS = ROOT / 'src' / 'tokens.json'

def ensure(d, k, v=None):
    if k not in d:
        d[k] = v if v is not None else {}
    return d[k]

LIGHT_FILL_MAP = {
    'hover': '{brand.core.ramp.neutral.150}',
    'active': '{brand.core.ramp.neutral.200}',
    'completed': '{brand.core.ramp.messaging.success.100}',
    'error': '{brand.core.ramp.messaging.error.100}',
    'success': '{brand.core.ramp.messaging.success.100}',
    'warning': '{brand.core.ramp.messaging.warning.100}',
    'info': '{brand.core.ramp.messaging.info.100}',
}
LIGHT_BORDER_MAP = {
    'default': '{brand.core.ramp.neutral.700}',
    'hover': '{brand.core.ramp.neutral.800}',
    'active': '{brand.core.ramp.neutral.900}',
    'completed': '{brand.core.ramp.messaging.success.600}',
    'error': '{brand.core.ramp.messaging.error.650}',
    'success': '{brand.core.ramp.messaging.success.600}',
    'warning': '{brand.core.ramp.messaging.warning.600}',
    'info': '{brand.core.ramp.messaging.info.700}',
}
LIGHT_TEXT_MAP = {
    'default': '{brand.core.ramp.neutral.1000}',
    'hover': '{brand.core.ramp.neutral.1000}',
    'active': '{brand.core.ramp.neutral.1000}',
    'completed': '{brand.core.ramp.messaging.success.900}',
    'error': '{brand.core.ramp.messaging.error.900}',
    'success': '{brand.core.ramp.messaging.success.900}',
    'warning': '{brand.core.ramp.messaging.warning.900}',
    'info': '{brand.core.ramp.messaging.info.900}',
}

DARK_FILL_MAP = {
    'hover': '{brand.core.ramp.neutral.150}',
    'active': '{brand.core.ramp.neutral.200}',
    'completed': '{brand.core.ramp.messaging.success.900}',
    'error': '{brand.core.ramp.messaging.error.900}',
    'success': '{brand.core.ramp.messaging.success.900}',
    'warning': '{brand.core.ramp.messaging.warning.900}',
    'info': '{brand.core.ramp.messaging.info.900}',
}
DARK_BORDER_MAP = {
    'default': '{brand.core.ramp.neutral.350}',
    'hover': '{brand.core.ramp.neutral.400}',
    'active': '{brand.core.ramp.neutral.500}',
    'completed': '{brand.core.ramp.messaging.success.700}',
    'error': '{brand.core.ramp.messaging.error.700}',
    'success': '{brand.core.ramp.messaging.success.700}',
    'warning': '{brand.core.ramp.messaging.warning.700}',
    'info': '{brand.core.ramp.messaging.info.700}',
}
DARK_TEXT_MAP = {
    'default': '{brand.core.ramp.neutral.1000}',
    'hover': '{brand.core.ramp.neutral.1000}',
    'active': '{brand.core.ramp.neutral.1000}',
    'completed': '{brand.core.ramp.messaging.success.100}',
    'error': '{brand.core.ramp.messaging.error.100}',
    'success': '{brand.core.ramp.messaging.success.100}',
    'warning': '{brand.core.ramp.messaging.warning.100}',
    'info': '{brand.core.ramp.messaging.info.100}',
}

STATES = ['default','hover','active','completed','error','success','warning','info']

with TOKENS.open('r', encoding='utf-8') as f:
    tokens = json.load(f)

changed = False
for top in list(tokens.keys()):
    if not (top.startswith('light/') or top.startswith('dark/')):
        continue
    mode = 'light' if top.startswith('light/') else 'dark'
    input_node = tokens[top].get('input')
    if input_node is None:
        input_node = {}
        tokens[top]['input'] = input_node
        changed = True
    # ensure fill subgroup
    fill = ensure(input_node, 'fill', {})
    # preserve existing default if present, else set
    if 'default' not in fill:
        fill['default'] = {'value': '{brand.core.ramp.neutral.50}', 'type': 'color'}
        changed = True
    # set other fill states
    for s,ref in (LIGHT_FILL_MAP.items() if mode=='light' else DARK_FILL_MAP.items()):
        if s not in fill:
            fill[s] = {'value': ref, 'type': 'color'}
            changed = True
    # ensure border
    border = ensure(input_node, 'border', {})
    if 'default' not in border:
        border['default'] = {'value': '{brand.core.ramp.neutral.50}', 'type': 'color'}
        changed = True
    for s in STATES:
        if s in (LIGHT_BORDER_MAP if mode=='light' else DARK_BORDER_MAP):
            ref = (LIGHT_BORDER_MAP if mode=='light' else DARK_BORDER_MAP)[s]
            if s not in border:
                border[s] = {'value': ref, 'type': 'color'}
                changed = True
    # ensure text
    text = ensure(input_node, 'text', {})
    if 'default' not in text:
        text['default'] = {'value': '{brand.core.ramp.neutral.50}', 'type': 'color'}
        changed = True
    for s in STATES:
        ref = (LIGHT_TEXT_MAP if mode=='light' else DARK_TEXT_MAP)[s]
        if s not in text:
            text[s] = {'value': ref, 'type': 'color'}
            changed = True
    # ensure icon
    icon = ensure(input_node, 'icon', {})
    if 'default' not in icon:
        icon['default'] = {'value': text['default']['value'], 'type': 'color'}
        changed = True
    for s in STATES:
        if s not in icon:
            icon[s] = {'value': text[s]['value'], 'type': 'color'}
            changed = True

if changed:
    TOKENS.write_text(json.dumps(tokens, indent=2, ensure_ascii=False)+"\n", encoding='utf-8')
    print('Updated tokens.json')
else:
    print('No changes required')
