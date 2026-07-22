#!/usr/bin/env python3
"""Removal-only de-brand for Token-Studio-style JSON dumps: strip newspaper
channels, accent, product.channel, politicalParty. Idempotent."""
import json, collections, sys
CHANNELS=["comment","lifeAndStyle","puzzles","home","uk","world","business",
          "money","sport","travel","culture","obituaries","ireland"]
def strip(F):
    d=json.load(open(F),object_pairs_hook=collections.OrderedDict)
    rm=set()
    for pre in ("light/ ","dark/ "):
        rm.add(pre+"channels")
        for c in CHANNELS: rm.add(pre+c)
    for k in list(d.keys()):
        if k in rm: d.pop(k)
    if "foundation" in d:
        d["foundation"].pop("product",None); d["foundation"].pop("accent",None)
        d["foundation"].get("data-vis",{}).pop("political-party",None)
    def walk(n):
        if isinstance(n,dict):
            n.pop("channel",None); n.pop("politicalParty",None)
            for v in n.values(): walk(v)
        elif isinstance(n,list):
            for v in n: walk(v)
    for k in list(d.keys()):
        if k.startswith(("light/ ","dark/ ")): walk(d[k])
    if "$metadata" in d and "tokenSetOrder" in d["$metadata"]:
        d["$metadata"]["tokenSetOrder"]=[s for s in d["$metadata"]["tokenSetOrder"] if s not in rm]
    if "$themes" in d:
        chan=set(c.lower() for c in CHANNELS)
        kept=[]
        for t in d["$themes"]:
            nm=t.get("name","").split(" ",1)[-1].strip().lower().replace(" & ","").replace(" ","")
            nm={"lifestyle":"lifeandstyle"}.get(nm,nm)
            if nm in chan: continue
            for key in list(t.get("selectedTokenSets",{}).keys()):
                if key in rm: t["selectedTokenSets"].pop(key)
            fv=t.get("$figmaVariableReferences",{})
            for key in list(fv.keys()):
                if "channel" in key.lower() or "political" in key.lower(): fv.pop(key)
            kept.append(t)
        d["$themes"]=kept
    json.dump(d,open(F,"w"),indent=2,ensure_ascii=False); open(F,"a").write("\n")
    print("stripped",F)
for F in sys.argv[1:]:
    strip(F)
