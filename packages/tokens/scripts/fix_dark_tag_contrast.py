#!/usr/bin/env python3
import json
import re
from math import pow
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOKENS = ROOT / 'src' / 'tokens.json'
RECONCILED = ROOT.parent / 'output' / 'tokens-reconciled.json'

def load(p):
    return json.loads(Path(p).read_text())

def linearize(c):
    if c <= 0.04045:
        return c / 12.92
    return pow((c + 0.055) / 1.055, 2.4)

def lum(rgb):
    r,g,b = rgb
    return 0.2126*linearize(r)+0.7152*linearize(g)+0.0722*linearize(b)

def contrast(a,b):
    La=lum(a); Lb=lum(b)
    return (La+0.05)/(Lb+0.05) if La>Lb else (Lb+0.05)/(La+0.05)

def rgba_to_tuple(s):
    nums = re.findall(r"[0-9.]+", s)
    return (float(nums[0])/255.0, float(nums[1])/255.0, float(nums[2])/255.0)

def find_min_step(recon, ramp_path, bg_rgb, text_rgb):
    node = recon.get('dark/ brand', {}).get('brand', {}).get('core', {}).get('ramp', {})
    for part in ramp_path.split('.'):
        node = node.get(part, {})
    steps = sorted([int(k) for k in node.keys() if k.isdigit()])
    for s in steps:
        val = node.get(str(s), {}).get('value')
        if not val:
            continue
        fill = rgba_to_tuple(val)
        c_bg = contrast(fill, bg_rgb)
        c_text = contrast(text_rgb, fill)
        if c_bg >= 4.5 and c_text >= 4.5:
            return str(s)
    return None

def main():
    tokens = load(TOKENS)
    recon = load(RECONCILED)
    bg = (38/255.0,38/255.0,38/255.0)

    ramp_root = recon.get('dark/ brand', {}).get('brand', {}).get('core', {}).get('ramp', {})
    ramp_names = [k for k in ramp_root.keys() if isinstance(ramp_root[k], dict)]

    targets = {
        'tag.filled.live.fill': None,
        'tag.filled.primary.fill': None
    }

    def test_step(ramp_name, step):
        node = ramp_root.get(ramp_name, {})
        val = node.get(step, {}).get('value')
        if not val:
            return None
        fill = rgba_to_tuple(val)
        c_bg = contrast(fill, bg)
        if c_bg < 4.5:
            return None
        neutral_node = ramp_root.get('neutral', {})
        for nstep in sorted([k for k in neutral_node.keys() if k.isdigit()], key=int):
            v = neutral_node.get(nstep, {}).get('value')
            if not v:
                continue
            text_rgb = rgba_to_tuple(v)
            if contrast(text_rgb, fill) >= 4.5:
                return nstep
        return None

    for ramp_name in ramp_names:
        node = ramp_root.get(ramp_name, {})
        steps = sorted([k for k in node.keys() if k.isdigit()], key=int, reverse=True)
        for s in steps:
            text_candidate = test_step(ramp_name, s)
            if text_candidate:
                for t in targets:
                    if targets[t] is None:
                        targets[t] = (ramp_name, s, text_candidate)
                        print('Candidate for', t, '=>', ramp_name + '.' + s, 'text neutral', text_candidate)
                        break
            if all(v is not None for v in targets.values()):
                break
        if all(v is not None for v in targets.values()):
            break

    changed = False
    for key, val in targets.items():
        if val is None:
            print('No candidate found for', key)
            continue
        ramp_name, step, text_choice = val
        path_parts = key.split('.')
        node_tokens = tokens.setdefault('dark/ core', {})
        for p in path_parts[:-1]:
            node_tokens = node_tokens.setdefault(p, {})
        node_tokens[path_parts[-1]] = {'value': f'{{brand.core.ramp.{ramp_name}.{step}}}', 'type': 'color'}
        node_tokens['text'] = {'value': f'{{brand.core.ramp.neutral.{text_choice}}}', 'type': 'color'}
        print('Applied', key, '->', ramp_name + '.' + step, 'text neutral.' + text_choice)
        changed = True

    if changed:
        Path(TOKENS).write_text(json.dumps(tokens, indent=2, ensure_ascii=False) + '\n')
        print('Wrote updates to', TOKENS)
    else:
        print('No changes applied')

if __name__ == '__main__':
    main()
