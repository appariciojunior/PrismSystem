#!/usr/bin/env python3
"""De-brand the master Token Studio export (tokens.json): remove newspaper
channels + accent + product.channel, add the shadcn-inspired 'theme'
semantic tier layer to light/core & dark/core. Idempotent."""
import json, collections
F = "packages/tokens/src/tokens.json"
d = json.load(open(F), object_pairs_hook=collections.OrderedDict)

CHANNELS = ["comment","lifeAndStyle","puzzles","home","uk","world","business",
            "money","sport","travel","culture","obituaries","ireland"]
REMOVE_SETS = set()
for pre in ("light/ ", "dark/ "):
    REMOVE_SETS.add(pre + "channels")
    for c in CHANNELS:
        REMOVE_SETS.add(pre + c)

# 1. drop channel + accent token sets
for k in list(d.keys()):
    if k in REMOVE_SETS:
        d.pop(k)

# 2. foundation
d["foundation"].pop("product", None)
d["foundation"].pop("accent", None)
d["foundation"].get("data-vis", {}).pop("political-party", None)

# 3. strip 'channel' subkeys everywhere in remaining colour sets
def strip_channels(node):
    if isinstance(node, dict):
        node.pop("channel", None)
        for v in node.values():
            strip_channels(v)
    elif isinstance(node, list):
        for v in node:
            strip_channels(v)
for k in list(d.keys()):
    if k.startswith(("light/ ", "dark/ ")):
        strip_channels(d[k])

# 4. $metadata.tokenSetOrder
d["$metadata"]["tokenSetOrder"] = [s for s in d["$metadata"]["tokenSetOrder"]
                                   if s not in REMOVE_SETS]

# 5. $themes: drop channel themes, clean selectedTokenSets
CHAN_THEME = set(c.lower() for c in CHANNELS)
def is_channel_theme(name):
    base = name.split(" ", 1)[-1].strip().lower().replace(" & ", "").replace(" ", "")
    aliases = {"lifestyle": "lifeandstyle"}
    base = aliases.get(base, base)
    return base in CHAN_THEME
kept = []
for t in d["$themes"]:
    if is_channel_theme(t.get("name", "")):
        continue
    sts = t.get("selectedTokenSets", {})
    for s in list(sts.keys()):
        if s in REMOVE_SETS:
            sts.pop(s)
    kept.append(t)
d["$themes"] = kept

# 6. shadcn 'theme' tier layer on light/core & dark/core (Token Studio aliases)
def col(v, desc):
    o = collections.OrderedDict()
    o["value"] = v
    o["type"] = "color"
    o["description"] = desc
    return o
def build_theme():
    t = collections.OrderedDict()
    t["background"] = col("{ramp.neutral.50}", "App/page base surface.")
    t["foreground"] = col("{ramp.neutral.950}", "Default text on background.")
    t["card"] = col("{ramp.neutral.100}", "Card surface.")
    t["card-foreground"] = col("{ramp.neutral.950}", "Text on card.")
    t["popover"] = col("{ramp.neutral.50}", "Popover/menu surface.")
    t["popover-foreground"] = col("{ramp.neutral.950}", "Text on popover.")
    t["primary"] = col("{ramp.blue.800}", "Primary brand tier. Main CTAs.")
    t["primary-foreground"] = col("{ramp.neutral.50}", "Text/icon on primary.")
    t["secondary"] = col("{ramp.neutral.200}", "Secondary tier.")
    t["secondary-foreground"] = col("{ramp.neutral.950}", "Text/icon on secondary.")
    t["tertiary"] = col("{data-vis.teal}", "Tertiary accent tier.")
    t["tertiary-foreground"] = col("{ramp.neutral.50}", "Text/icon on tertiary.")
    t["muted"] = col("{ramp.neutral.150}", "Muted surface.")
    t["muted-foreground"] = col("{ramp.neutral.600}", "Muted/secondary text.")
    t["border"] = col("{ramp.neutral.300}", "Default border colour.")
    t["input"] = col("{ramp.neutral.300}", "Form input border.")
    t["ring"] = col("{ramp.neutral.600}", "Focus ring.")
    t["info"] = col("{ramp.messaging.info.500}", "Informational feedback.")
    t["info-foreground"] = col("{ramp.neutral.50}", "Text on info.")
    t["success"] = col("{ramp.messaging.success.500}", "Success feedback.")
    t["success-foreground"] = col("{ramp.neutral.50}", "Text on success.")
    t["warning"] = col("{ramp.messaging.warning.500}", "Warning feedback.")
    t["warning-foreground"] = col("{ramp.neutral.950}", "Text on warning.")
    t["error"] = col("{ramp.messaging.error.500}", "Error feedback.")
    t["error-foreground"] = col("{ramp.neutral.50}", "Text on error.")
    t["destructive"] = col("{ramp.messaging.error.500}", "Destructive action.")
    t["destructive-foreground"] = col("{ramp.neutral.50}", "Text on destructive.")
    t["chart-1"] = col("{data-vis.darkBlue}", "Data-vis series 1.")
    t["chart-2"] = col("{data-vis.yellow}", "Data-vis series 2.")
    t["chart-3"] = col("{data-vis.lightBlue}", "Data-vis series 3.")
    t["chart-4"] = col("{data-vis.orange}", "Data-vis series 4.")
    t["chart-5"] = col("{data-vis.teal}", "Data-vis series 5.")
    return t
for k in ("light/ core", "dark/ core"):
    d[k]["theme"] = build_theme()

json.dump(d, open(F, "w"), indent=2, ensure_ascii=False)
open(F, "a").write("\n")
print("top keys:", [k for k in d.keys() if k.startswith(('light','dark'))])
print("themes kept:", [t["name"] for t in d["$themes"]])
print("OK")
