#!/usr/bin/env python3
"""Remove residual channel-specific tokens (interactive.chip.channel) and
remap channel-hue accents (brand.channels.ramp.*) to the primary blue ramp."""
import json, collections, re
F = "packages/tokens/src/plugin-test/semantic.json"
sem = json.load(open(F), object_pairs_hook=collections.OrderedDict)

REMAP = {  # channel-hue accent -> primary blue equivalent (same step)
    "{brand.channels.ramp.business.850}": "{brand.core.ramp.blue.850}",
    "{brand.channels.ramp.business.800}": "{brand.core.ramp.blue.800}",
    "{brand.channels.ramp.business.650}": "{brand.core.ramp.blue.650}",
    "{brand.channels.ramp.travel.800}":   "{brand.core.ramp.blue.800}",
}

def clean(node):
    if isinstance(node, dict):
        # drop any nested 'channel' group entirely
        for k in list(node.keys()):
            if k == "channel":
                node.pop(k)
        for k, v in node.items():
            if k == "$value" and isinstance(v, str) and v in REMAP:
                node[k] = REMAP[v]
            else:
                clean(v)
    elif isinstance(node, list):
        for x in node:
            clean(x)

for mode in ("Light", "Dark"):
    clean(sem[mode])

json.dump(sem, open(F, "w"), indent=2, ensure_ascii=False)
open(F, "a").write("\n")

# verify
txt = open(F).read()
import re as _re
left = sorted(set(_re.findall(r"\{[^}]*channel[^}]*\}", txt)))
left += sorted(set(_re.findall(r"brand\.channels", txt)))
print("residual channel refs:", left)
print("OK")
