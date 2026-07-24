#!/usr/bin/env python3
import json
import re
from math import pow
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOKENS_SRC = ROOT / 'src' / 'tokens.json'
RECONCILED = ROOT.parent / 'output' / 'tokens-reconciled.json'

def load_json(p):
    return json.loads(Path(p).read_text())

def get(path, *keys):
    node = path
    for k in keys:
        if not isinstance(node, dict):
            return None
        node = node.get(k)
        if node is None:
            return None
    return node

def parse_rgba(s):
    nums = re.findall(r"[0-9.]+%?", s)
    vals = []
    for n in nums[:3]:
        if n.endswith('%'):
            vals.append(float(n[:-1]) / 100.0)
        else:
            vals.append(float(n) / 255.0)
    return tuple(vals)

def linearize(c):
    if c <= 0.04045:
        return c / 12.92
    return pow((c + 0.055) / 1.055, 2.4)

def lum(rgb):
    r, g, b = rgb
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)

def contrast(a, b):
    La = lum(a); Lb = lum(b)
    if La > Lb:
        return (La + 0.05) / (Lb + 0.05)
    return (Lb + 0.05) / (La + 0.05)

def run_checks():
    tokens = load_json(TOKENS_SRC)
    recon = load_json(RECONCILED)
    results = []

    # Check presence/absence and cascades in light/core
    light_core = tokens.get('light/ core', {})
    dark_core = tokens.get('dark/ core', {})

    # Expected: tag.filled.live.fill -> messaging.error.750 (light), messaging.error.700 (dark)
    live_fill_light = get(light_core, 'tag', 'filled', 'live', 'fill', 'value')
    live_text_light = get(light_core, 'tag', 'filled', 'live', 'text', 'value')
    live_border_light = get(light_core, 'tag', 'filled', 'live', 'border')

    results.append(('live.fill.light set to messaging.error.850', live_fill_light == '{brand.core.ramp.messaging.error.850}'))
    results.append(('live.text.light set to neutral.50', live_text_light == '{brand.core.ramp.neutral.50}'))
    results.append(('live.border.light removed', live_border_light is None))

    primary_fill_light = get(light_core, 'tag', 'filled', 'primary', 'fill', 'value')
    primary_text_light = get(light_core, 'tag', 'filled', 'primary', 'text', 'value')
    primary_border_light = get(light_core, 'tag', 'filled', 'primary', 'border')
    results.append(('primary.fill.light set to digital.blue.700', primary_fill_light == '{brand.core.ramp.digital.blue.700}'))
    results.append(('primary.text.light set to neutral.50', primary_text_light == '{brand.core.ramp.neutral.50}'))
    results.append(('primary.border.light removed', primary_border_light is None))

    # Secondary group removal
    secondary_present_light = get(light_core, 'tag', 'filled', 'secondary') is not None
    inline_secondary_present_light = get(light_core, 'tag', 'inline', 'secondary') is not None
    results.append(('filled.secondary removed (light)', not secondary_present_light))
    results.append(('inline.secondary removed (light)', not inline_secondary_present_light))

    # Cascades: inline.live.text.value == {tag.filled.live.fill}
    inline_live_val = get(light_core, 'tag', 'inline', 'live', 'text', 'value')
    inline_primary_val = get(light_core, 'tag', 'inline', 'primary', 'text', 'value')
    results.append(('inline.live cascades from filled.live', inline_live_val == '{tag.filled.live.fill}'))
    results.append(('inline.primary cascades from filled.primary', inline_primary_val == '{tag.filled.primary.fill}'))

    # Repeat for dark/core expectations (values chosen earlier)
    live_fill_dark = get(dark_core, 'tag', 'filled', 'live', 'fill', 'value')
    live_text_dark = get(dark_core, 'tag', 'filled', 'live', 'text', 'value')
    live_border_dark = get(dark_core, 'tag', 'filled', 'live', 'border')
    results.append(('live.fill.dark set to messaging.error.500', live_fill_dark == '{brand.core.ramp.messaging.error.500}'))
    results.append(('live.text.dark set to neutral.100', live_text_dark == '{brand.core.ramp.neutral.100}'))
    results.append(('live.border.dark removed', live_border_dark is None))

    primary_fill_dark = get(dark_core, 'tag', 'filled', 'primary', 'fill', 'value')
    primary_text_dark = get(dark_core, 'tag', 'filled', 'primary', 'text', 'value')
    primary_border_dark = get(dark_core, 'tag', 'filled', 'primary', 'border')
    results.append(('primary.fill.dark set to neutral.1000', primary_fill_dark == '{brand.core.ramp.neutral.1000}'))
    results.append(('primary.text.dark set to neutral.100', primary_text_dark == '{brand.core.ramp.neutral.100}'))
    results.append(('primary.border.dark removed', primary_border_dark is None))

    # Now contrast checks using reconciled (if available)
    # For light: background white; dark: bg #262626
    white = (1,1,1)
    dark_bg = (38/255.0, 38/255.0, 38/255.0)

    def token_to_ramp_step(token_str):
        # Accept multi-segment ramp names like 'digital.blue' or 'messaging.error'
        m = re.match(r"\{brand\.core\.ramp\.([^.}]+(?:\.[^.}]+)*)\.([0-9]+)\}", token_str or '')
        if not m:
            return None, None
        return m.group(1), m.group(2)

    checks = [
        ('live.light', live_fill_light, live_text_light, 'messaging.error'),
        ('primary.light', primary_fill_light, primary_text_light, 'digital.blue'),
        ('live.dark', live_fill_dark, live_text_dark, 'messaging.error'),
        ('primary.dark', primary_fill_dark, primary_text_dark, 'neutral'),
    ]

    for name, fill_token, text_token, ramp_key in checks:
        ramp, step = token_to_ramp_step(fill_token)
        if ramp is None:
            results.append((f'{name} fill token parseable', False))
            continue
        mode = 'light/ brand' if name.endswith('.light') else 'dark/ brand'
        node = recon.get(mode, {}).get('brand', {}).get('core', {}).get('ramp', {})
        found = None
        for key_part in ramp_key.split('.'):
            node = node.get(key_part, node.get(key_part)) if isinstance(node, dict) else None
            if node is None:
                break
        if node and isinstance(node, dict):
            step_node = node.get(step)
            if step_node:
                found = step_node.get('value')
        if not found:
            results.append((f'{name} reconciled value found', False))
            continue
        # parse rgba like 'rgba(255, 0, 0, 1)' or 'rgba(100%, 50%, 0%, 1)'
        try:
            fill_rgb = parse_rgba(found)
        except Exception:
            results.append((f'{name} reconciled parse', False))
            continue
        bg = white if name.endswith('.light') else dark_bg
        c_bg = contrast(fill_rgb, bg)
        results.append((f'{name} fill >=4.5 vs bg', c_bg >= 4.5))
        m = re.match(r"\{brand\.core\.ramp\.([^.}]+(?:\.[^.}]+)*)\.([0-9]+)\}", text_token or '')
        if m:
            rampn, stepn = m.group(1), m.group(2)
            node2 = recon.get(mode, {}).get('brand', {}).get('core', {}).get('ramp', {}).get(rampn)
            val2 = None
            if node2:
                s = node2.get(stepn)
                if s:
                    val2 = s.get('value')
            if val2:
                try:
                    text_rgb = parse_rgba(val2)
                except Exception:
                    results.append((f'{name} text parse', False))
                    continue
                c_text = contrast(text_rgb, fill_rgb)
                results.append((f'{name} text >=4.5 vs fill', c_text >= 4.5))
            else:
                results.append((f'{name} text resolved', False))
        else:
            results.append((f'{name} text token parseable', False))

    ok = all(v for (_, v) in results)
    return ok, results

if __name__ == '__main__':
    ok, results = run_checks()
    for k, v in results:
        print(('PASS' if v else 'FAIL'), '-', k)
    print('\nOverall:', 'PASS' if ok else 'FAIL')
