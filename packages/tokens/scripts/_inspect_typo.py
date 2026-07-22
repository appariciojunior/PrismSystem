#!/usr/bin/env python3
"""Inspect typography, dimensions, and spacing tokens."""
import json

with open("packages/tokens/src/tokens.json") as f:
    d = json.load(f)

def count_tokens(obj, path=None):
    if path is None:
        path = []
    tokens = {}
    for k, v in obj.items():
        if k.startswith("$"):
            continue
        if isinstance(v, dict) and "value" in v:
            tokens[".".join(path + [k])] = v["value"]
        elif isinstance(v, dict):
            tokens.update(count_tokens(v, path + [k]))
    return tokens

# Typography tokens
tt = d.get("typographyTokens", {})
typo = count_tokens(tt)
print(f"Typography tokens: {len(typo)}")
for k in sorted(list(typo.keys()))[:20]:
    val = typo[k]
    if isinstance(val, dict):
        print(f"  {k} = composite: {list(val.keys())}")
    else:
        print(f"  {k} = {str(val)[:100]}")

# Foundation dimension tokens
fnd = d.get("foundation", {})
dim = fnd.get("dimension", {})
dim_tokens = count_tokens(dim)
print(f"\nFoundation dimension tokens: {len(dim_tokens)}")
for k in sorted(list(dim_tokens.keys()))[:25]:
    print(f"  dimension.{k} = {dim_tokens[k]}")

# Viewport/small spacing
vs = d.get("viewport/ small", {})
sp = vs.get("spacing", {})
sp_tokens = count_tokens(sp)
print(f"\nViewport/small spacing tokens: {len(sp_tokens)}")
for k in sorted(list(sp_tokens.keys())):
    print(f"  spacing.{k} = {sp_tokens[k]}")

# Viewport/small border-radius
br = vs.get("border-radius", {})
br_tokens = count_tokens(br)
print(f"\nViewport/small border-radius tokens: {len(br_tokens)}")
for k in sorted(list(br_tokens.keys())):
    print(f"  border-radius.{k} = {br_tokens[k]}")

# Viewport/small fontSize
fs_tokens = {}
for k in vs:
    if k.startswith("fontSize"):
        v = vs[k]
        if isinstance(v, dict) and "value" in v:
            fs_tokens[k] = v["value"]
print(f"\nViewport/small fontSize tokens: {len(fs_tokens)}")
for k in sorted(fs_tokens.keys()):
    print(f"  {k} = {fs_tokens[k]}")

# Check what grid tokens look like
grid = vs.get("grid", {})
grid_tokens = count_tokens(grid)
print(f"\nViewport/small grid tokens: {len(grid_tokens)}")
for k in sorted(grid_tokens.keys()):
    print(f"  grid.{k} = {grid_tokens[k]}")

# Check channels ramp - get a sample of values to resolve
lc = d.get("light/ channels", {}).get("brand", {})
if lc:
    channels_ramp = lc.get("channels", {}).get("ramp", {})
    home_ramp = channels_ramp.get("home", {})
    print(f"\nLight channels home ramp sample:")
    for step in ["500", "650"]:
        val = home_ramp.get(step, {})
        if isinstance(val, dict) and "value" in val:
            print(f"  home.{step} = {val['value']}")
            ext = val.get("$extensions", {})
            if ext:
                modify = ext.get("studio.tokens", {}).get("modify", {})
                if modify:
                    print(f"    modify: {json.dumps(modify)}")
