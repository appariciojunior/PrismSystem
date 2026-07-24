#!/usr/bin/env python3
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOKENS_PATH = ROOT / 'src' / 'tokens.json'

def load():
    return json.loads(TOKENS_PATH.read_text())

def save(data):
    TOKENS_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")

def find_node_by_suffix(data, suffix_parts):
    # DFS search for a node whose path ends with suffix_parts
    results = []
    def dfs(node, path):
        if isinstance(node, dict):
            # If node has 'value' -> consider it a token leaf
            if 'value' in node and path[-len(suffix_parts):] == suffix_parts:
                results.append(node)
            for k, v in node.items():
                dfs(v, path + [k])
        elif isinstance(node, list):
            for i, v in enumerate(node):
                dfs(v, path + [str(i)])
    dfs(data, [])
    return results[0] if results else None

def resolve_reference(root, ref):
    # ref like {brand.black} or {colour.modifier.50}
    m = re.match(r"\{([^}]+)\}", ref)
    if not m:
        return ref
    parts = m.group(1).split('.')
    node = find_node_by_suffix(root, parts)
    if not node:
        return None
    return node.get('value')

def eval_modifier(expr):
    # expressions like "0.1*0.5" or numeric strings
    if expr is None:
        return None
    expr = str(expr).strip()
    if expr.startswith('{'):
        return None
    if '*' in expr:
        parts = [float(p) for p in expr.split('*')]
        prod = 1.0
        for p in parts:
            prod *= p
        return prod
    try:
        return float(expr)
    except Exception:
        return None

rgb_re = re.compile(r"rgb\((\d+),\s*(\d+),\s*(\d+)\)")
hex_re = re.compile(r"#([0-9a-fA-F]{6})")
rgba_re = re.compile(r"rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)")

def to_rgba(base_val, alpha):
    if base_val is None:
        return None
    base_val = str(base_val).strip()
    m = rgba_re.match(base_val)
    if m:
        r, g, b, a = m.groups()
        a = float(a) * alpha
        return f"rgba({int(r)}, {int(g)}, {int(b)}, {round(a, 4)})"
    m = rgb_re.match(base_val)
    if m:
        r, g, b = m.groups()
        return f"rgba({int(r)}, {int(g)}, {int(b)}, {round(alpha, 4)})"
    m = hex_re.match(base_val)
    if m:
        hexv = m.group(1)
        r = int(hexv[0:2], 16)
        g = int(hexv[2:4], 16)
        b = int(hexv[4:6], 16)
        return f"rgba({r}, {g}, {b}, {round(alpha, 4)})"
    # unsupported format
    return None


def walk_and_fix(node, root):
    if isinstance(node, dict):
        # If node has extensions with modify alpha
        ext = node.get('$extensions')
        if ext and isinstance(ext, dict):
            st = ext.get('studio.tokens')
            if st and isinstance(st, dict):
                mod = st.get('modify')
                if mod and mod.get('type') == 'alpha':
                    # only fix if value is null or not a proper rgba
                    cur = node.get('value')
                    if cur is None or cur == 'null':
                        # resolve base value from source 'value' (may be a ref)
                        # In source, node's explicit value may already be a ref; try resolving via root
                        # Look for nearby 'value' field in the same node? The base value should be in node['value_ref']?
                        # Instead, search the node in the full root by matching path in root to node; fallback: try to use node['value'] if set
                        # For robustness, find the token path by searching for node object equality (by id of dict)
                        pass
        # Continue recursion
        for k, v in node.items():
            walk_and_fix(v, root)
    elif isinstance(node, list):
        for v in node:
            walk_and_fix(v, root)

# Because locating the exact base reference can be tricky via object identity, we'll instead search for all tokens
# that have an "alpha" modifier and then compute value by inspecting the same object's 'value' (which in source is the base ref).

def find_alpha_tokens(root):
    results = []
    def dfs(node, path):
        if isinstance(node, dict):
            ext = node.get('$extensions')
            if ext and isinstance(ext, dict):
                st = ext.get('studio.tokens')
                if st and isinstance(st, dict):
                    mod = st.get('modify')
                    if mod and mod.get('type') == 'alpha':
                        results.append((path, node, mod))
            for k, v in node.items():
                dfs(v, path + [k])
        elif isinstance(node, list):
            for i, v in enumerate(node):
                dfs(v, path + [str(i)])
    dfs(root, [])
    return results


def main():
    data = load()
    alpha_tokens = find_alpha_tokens(data)
    changed = 0
    for path, node, mod in alpha_tokens:
        base_ref = node.get('value')
        if base_ref is None:
            # try to find a sibling 'value' earlier? skip
            continue
        base_val = resolve_reference(data, base_ref) if isinstance(base_ref, str) and base_ref.startswith('{') else base_ref
        mod_val_raw = mod.get('value')
        # mod_val_raw may be like "{colour.modifier.50}" or expression
        mod_resolved = None
        if isinstance(mod_val_raw, str) and mod_val_raw.startswith('{'):
            mod_ref_val = resolve_reference(data, mod_val_raw)
            mod_resolved = eval_modifier(mod_ref_val)
        else:
            mod_resolved = eval_modifier(mod_val_raw)
        if base_val is None or mod_resolved is None:
            continue
        rgba = to_rgba(base_val, mod_resolved)
        if rgba:
            node['value'] = rgba
            changed += 1
    if changed:
        save(data)
        print(f"Patched {changed} alpha tokens in {TOKENS_PATH}")
    else:
        print("No alpha tokens patched")

if __name__ == '__main__':
    main()
