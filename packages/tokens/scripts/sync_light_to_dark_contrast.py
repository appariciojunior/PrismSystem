#!/usr/bin/env python3
import json
import colorsys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
TOKENS_PATH = ROOT / "packages/tokens/src/tokens.json"

STEPS = [50,100,150,200,250,300,350,400,450,500,550,600,650,700,750,800,850,900,950,1000]

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join([c*2 for c in hex_color])
    return tuple(int(hex_color[i:i+2], 16) for i in (0,2,4))

def relative_luminance(hexcolor):
    r,g,b = [c/255 for c in hex_to_rgb(hexcolor)]
    def chan(c):
        return c/12.92 if c <= 0.03928 else ((c+0.055)/1.055) ** 2.4
    R=chan(r); G=chan(g); B=chan(b)
    return 0.2126*R + 0.7152*G + 0.0722*B

def contrast_ratio(hex1, hex2):
    L1 = relative_luminance(hex1); L2 = relative_luminance(hex2)
    lighter = max(L1,L2); darker = min(L1,L2)
    return (lighter+0.05)/(darker+0.05)

def get_by_path(obj, parts):
    cur = obj
    for part in parts:
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            # try case-insensitive
            found=False
            if isinstance(cur, dict):
                for k in cur.keys():
                    if k.strip().lower() == part.strip().lower():
                        cur = cur[k]; found=True; break
            if not found:
                return None
    return cur

def resolve_value(tokens, value):
    if not isinstance(value, str) or not value.startswith('{') or not value.endswith('}'):
        return value
    full = value[1:-1].replace('/', '.')
    parts = full.split('.')
    node = get_by_path(tokens, parts)
    if node is None:
        for top in tokens.keys():
            node = get_by_path(tokens[top], parts)
            if node is not None: break
    if node is None:
        return value
    if isinstance(node, dict) and 'value' in node:
        return resolve_value(tokens, node['value'])
    if isinstance(node, str):
        return resolve_value(tokens, node)
    return node

def resolve_token_hex(tokens, ref):
    if not isinstance(ref, str) or not ref.startswith('{'):
        return ref
    full = ref[1:-1].replace('/', '.')
    parts = full.split('.')
    node = get_by_path(tokens, parts)
    if node is None:
        for top in tokens.keys():
            node = get_by_path(tokens[top], parts)
            if node is not None: break
    if node is None:
        return None
    base = node.get('value') if isinstance(node, dict) else node
    base_hex = resolve_value(tokens, base)
    # apply modifier if present
    ext = node.get('$extensions', {}).get('studio.tokens', {}).get('modify', {}) if isinstance(node, dict) else None
    if not ext:
        return base_hex
    # compute modifier value
    mod_ref = ext.get('value')
    try:
        mod_val = float(resolve_value(tokens, mod_ref))
    except:
        mod_val = 0.0
    try:
        rgb = hex_to_rgb(base_hex)
        r,g,b = [c/255 for c in rgb]
        h,l,s = colorsys.rgb_to_hls(r,g,b)
    except Exception:
        return base_hex
    t = ext.get('type')
    if t == 'lighten':
        new_l = l + (1.0 - l) * mod_val
    elif t == 'darken':
        new_l = l - l * mod_val
    else:
        new_l = l
    r2,g2,b2 = colorsys.hls_to_rgb(h, new_l, s)
    return '#{:02x}{:02x}{:02x}'.format(int(r2*255), int(g2*255), int(b2*255))

def find_candidate(tokens, palette_root_parts, desired_ratio):
    for step in STEPS:
        ref = '{' + '.'.join(palette_root_parts + [str(step)]) + '}'
        hexv = resolve_token_hex(tokens, ref)
        if not hexv or not isinstance(hexv, str) or not hexv.startswith('#'):
            continue
        cr = contrast_ratio(hexv, '#262626')
        if cr >= desired_ratio:
            return ref, hexv, cr
    # fallback to darkest available that resolves
    for step in reversed(STEPS):
        ref = '{' + '.'.join(palette_root_parts + [str(step)]) + '}'
        hexv = resolve_token_hex(tokens, ref)
        if hexv and isinstance(hexv, str) and hexv.startswith('#'):
            return ref, hexv, contrast_ratio(hexv, '#262626')
    return None, None, 0.0

def main():
    tokens = json.loads(TOKENS_PATH.read_text())
    changes = []
    paths = [
        ('input','fill','default'),
        ('input','border','default'),
        ('input','border','error'),
        ('input','text','default'),
        ('input','text','error')
    ]

    for key in list(tokens.keys()):
        if not key.startswith('light/'):
            continue
        theme = key.split('/',1)[1].strip()
        dark_key = 'dark/ ' + theme
        if dark_key not in tokens:
            continue
        for p in paths:
            light_node = get_by_path(tokens[key], list(p))
            if not light_node or 'value' not in light_node:
                continue
            light_ref = light_node['value']
            light_hex = resolve_token_hex(tokens, light_ref)
            if not isinstance(light_hex, str) or not light_hex.startswith('#'):
                continue
            cr_light = contrast_ratio(light_hex, '#ffffff')
            desired = max(3.0, cr_light)
            inner = light_ref[1:-1].replace('/', '.')
            parts = inner.split('.')
            if 'ramp' in parts:
                idx = parts.index('ramp')
                palette_parts = parts[:idx+2]
            else:
                palette_parts = ['brand','core','ramp','neutral']
            ref, hexv, cr = find_candidate(tokens, palette_parts, desired)
            if ref is None:
                # no candidate found; skip changing this token to avoid writing null
                print('Skip', '.'.join(p), 'in', dark_key, '- no suitable dark candidate found')
                continue
            dark_node = get_by_path(tokens[dark_key], list(p))
            if dark_node is None:
                cur = tokens[dark_key]
                for seg in p[:-1]:
                    cur = cur.setdefault(seg, {})
                # only set if we have a valid ref
                if ref is not None:
                    cur[p[-1]] = {'value': ref, 'type': 'color'}
                    changes.append((dark_key, '.'.join(p), ref, cr))
            else:
                if ref is not None and dark_node.get('value') != ref:
                    dark_node['value'] = ref
                    dark_node['type'] = 'color'
                    changes.append((dark_key, '.'.join(p), ref, cr))

    if changes:
        TOKENS_PATH.write_text(json.dumps(tokens, indent=2, ensure_ascii=False) + '\n')
        for c in changes:
            print('Set', c[1], 'in', c[0], 'to', c[2], 'contrast_vs_#262626=', f"{c[3]:.2f}")
    else:
        print('No changes required')

if __name__ == '__main__':
    main()
