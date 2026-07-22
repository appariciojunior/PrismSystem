#!/usr/bin/env python3
"""Inspect ramp structure and extract all resolved colors for the generator."""
import json
import sys

with open("packages/tokens/src/tokens.json") as f:
    d = json.load(f)

lb = d.get("light/ brand", {}).get("brand", {})
db = d.get("dark/ brand", {}).get("brand", {})

def inspect_ramp(ramp_obj, prefix=""):
    for k, v in ramp_obj.items():
        if k.startswith("$"):
            continue
        if isinstance(v, dict) and "value" in v:
            print(f"  {prefix}{k}: value={v['value']}")
        elif isinstance(v, dict):
            sub_keys = [s for s in v.keys() if not s.startswith("$")]
            # Check if these are steps (numeric) or sub-ramps
            if all(s.replace("-base","").isdigit() for s in sub_keys):
                print(f"  {prefix}{k}: {len(sub_keys)} steps -> {sub_keys[:5]}...")
            else:
                print(f"  {prefix}{k}: sub-ramp with keys {sub_keys[:5]}")
                inspect_ramp(v, prefix + k + ".")

print("=== LIGHT BRAND RAMP STRUCTURE ===")
core_ramp = lb.get("core", {}).get("ramp", {})
inspect_ramp(core_ramp)

print("\n=== DARK BRAND RAMP STRUCTURE ===")
dark_core_ramp = db.get("core", {}).get("ramp", {}) if db else {}
inspect_ramp(dark_core_ramp)

# Check channels
print("\n=== LIGHT CHANNELS ===")
lc = d.get("light/ channels", {}).get("brand", {})
if lc:
    channels_ramp = lc.get("channels", {}).get("ramp", {})
    inspect_ramp(channels_ramp)

print("\n=== DARK CHANNELS ===")
dc = d.get("dark/ channels", {}).get("brand", {})
if dc:
    channels_ramp = dc.get("channels", {}).get("ramp", {})
    inspect_ramp(channels_ramp)

# Also check what the light/core set references
print("\n=== LIGHT/CORE SEMANTIC - surface.channel.static ===")
lcore = d.get("light/ core", {})
scs = lcore.get("surface", {}).get("channel", {}).get("static", {})
if scs:
    for k, v in scs.items():
        if isinstance(v, dict) and "value" in v:
            print(f"  surface.channel.static.{k} = {v['value']}")

# Check what tokens are in dark/core but not light/core
print("\n=== TOKEN COUNT CHECK ===")
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

lt = count_tokens(d.get("light/ core", {}))
dt = count_tokens(d.get("dark/ core", {}))
print(f"Light/core tokens: {len(lt)}")
print(f"Dark/core tokens:  {len(dt)}")
print(f"\nIn light but not dark ({len(set(lt)-set(dt))}):")
for t in sorted(set(lt) - set(dt)):
    print(f"  {t}")
print(f"\nIn dark but not light ({len(set(dt)-set(lt))}):")
for t in sorted(set(dt) - set(lt)):
    print(f"  {t}")

# Check typography and spacing in viewport/small
print("\n=== VIEWPORT/SMALL ===")
vs = d.get("viewport/ small", {})
vs_tokens = count_tokens(vs)
print(f"viewport/small tokens: {len(vs_tokens)}")
for k in sorted(list(vs_tokens.keys()))[:10]:
    print(f"  {k} = {vs_tokens[k]}")

# Check foundation font tokens
print("\n=== FOUNDATION FONT TOKENS ===")
fnd = d.get("foundation", {})
for k in sorted(fnd.keys()):
    if k.startswith("font") or k.startswith("spacing"):
        v = fnd[k]
        if isinstance(v, dict) and "value" in v:
            print(f"  {k} = {v['value']}")

# Check foundation shadow tokens
print("\n=== FOUNDATION SHADOW TOKENS ===")
for direction in ["down", "up"]:
    shadow = fnd.get(direction, {})
    for k, v in shadow.items():
        if isinstance(v, dict) and "value" in v:
            print(f"  {direction}.{k} = {json.dumps(v['value'])[:80]}")

# Check shadows semantic
print("\n=== SHADOWS SET ===")
shadows = d.get("shadows", {})
shadows_tokens = count_tokens(shadows)
print(f"Shadows tokens: {len(shadows_tokens)}")
for k in sorted(list(shadows_tokens.keys()))[:10]:
    print(f"  {k} = {json.dumps(shadows_tokens[k])[:80]}")

# Check breakpoints
print("\n=== BREAKPOINTS SET ===")
bp = d.get("breakpoints", {})
bp_tokens = count_tokens(bp)
print(f"Breakpoint tokens: {len(bp_tokens)}")
for k, v in bp_tokens.items():
    print(f"  {k} = {v}")
