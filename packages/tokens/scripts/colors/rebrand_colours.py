#!/usr/bin/env python3
"""De-brand the colour system: remove newspaper channels + accent, add
shadcn-inspired natural-language semantic tiers. Operates on the authored
source token JSON (plugin-test palette/foundation/semantic). Idempotent."""
import json, collections

BASE = "packages/tokens/src/plugin-test/"

def load(f):
    return json.load(open(BASE + f), object_pairs_hook=collections.OrderedDict)

def save(f, d):
    json.dump(d, open(BASE + f, "w"), indent=2, ensure_ascii=False)
    open(BASE + f, "a").write("\n")

CHANNEL_GROUPS = ["comment","lifeAndStyle","puzzles","home","uk","world","business",
                  "money","sport","travel","culture","obituaries","ireland","channels"]

def col(v, desc=None):
    o = collections.OrderedDict()
    o["$type"] = "color"
    o["$value"] = v
    if desc:
        o["$description"] = desc
    return o

# ---------- palette.json ----------
pal = load("palette.json")
for mode in ("Light", "Dark"):
    brand = pal[mode]["brand"]
    brand.pop("channels", None)  # removes all newspaper channels + accent ramps
    dv = brand.get("data-visualisation", {})
    dv.get("base", {}).pop("politicalParty", None)
save("palette.json", pal)

# ---------- foundation.json ----------
fnd = load("foundation.json")
fnd.pop("product", None)      # product.channel.*
fnd.pop("accent", None)   # cobalt/coral
fnd.get("data-vis", {}).pop("political-party", None)
save("foundation.json", fnd)

# ---------- semantic.json ----------
sem = load("semantic.json")
for mode in ("Light", "Dark"):
    m = sem[mode]
    # drop channel semantic groups, keep only 'core'
    for k in list(m.keys()):
        if k in CHANNEL_GROUPS:
            m.pop(k)
    core = m["core"]
    # drop 'channel' sub-groups inside remaining core groups
    for g in list(core.keys()):
        if isinstance(core[g], dict):
            core[g].pop("channel", None)

    # shadcn-inspired natural-language semantic tier layer.
    # Identical alias paths in Light and Dark: the Palette collection swaps
    # per mode, so light/dark parity is automatic.
    theme = collections.OrderedDict()
    def a(path, desc):
        return col("{" + path + "}", desc)
    theme["background"] = a("brand.core.ramp.neutral.50", "App/page base surface.")
    theme["foreground"] = a("brand.core.ramp.neutral.950", "Default text on background.")
    theme["card"] = a("brand.core.ramp.neutral.100", "Card surface.")
    theme["card-foreground"] = a("brand.core.ramp.neutral.950", "Text on card.")
    theme["popover"] = a("brand.core.ramp.neutral.50", "Popover/menu surface.")
    theme["popover-foreground"] = a("brand.core.ramp.neutral.950", "Text on popover.")
    theme["primary"] = a("brand.core.ramp.blue.800", "Primary brand tier. Main CTAs.")
    theme["primary-foreground"] = a("brand.core.ramp.neutral.50", "Text/icon on primary.")
    theme["secondary"] = a("brand.core.ramp.neutral.200", "Secondary tier. Low-emphasis surfaces.")
    theme["secondary-foreground"] = a("brand.core.ramp.neutral.950", "Text/icon on secondary.")
    theme["tertiary"] = a("brand.data-visualisation.ramp.teal.500", "Tertiary accent tier.")
    theme["tertiary-foreground"] = a("brand.core.ramp.neutral.50", "Text/icon on tertiary.")
    theme["muted"] = a("brand.core.ramp.neutral.150", "Muted surface.")
    theme["muted-foreground"] = a("brand.core.ramp.neutral.600", "Muted/secondary text.")
    theme["border"] = a("brand.core.ramp.neutral.300", "Default border colour.")
    theme["input"] = a("brand.core.ramp.neutral.300", "Form input border.")
    theme["ring"] = a("brand.core.ramp.neutral.600", "Focus ring.")
    theme["info"] = a("brand.core.ramp.messaging.info.500", "Informational feedback.")
    theme["info-foreground"] = a("brand.core.ramp.neutral.50", "Text on info.")
    theme["success"] = a("brand.core.ramp.messaging.success.500", "Success feedback.")
    theme["success-foreground"] = a("brand.core.ramp.neutral.50", "Text on success.")
    theme["warning"] = a("brand.core.ramp.messaging.warning.500", "Warning feedback.")
    theme["warning-foreground"] = a("brand.core.ramp.neutral.950", "Text on warning.")
    theme["error"] = a("brand.core.ramp.messaging.error.500", "Error feedback.")
    theme["error-foreground"] = a("brand.core.ramp.neutral.50", "Text on error.")
    theme["destructive"] = a("brand.core.ramp.messaging.error.500", "Destructive action.")
    theme["destructive-foreground"] = a("brand.core.ramp.neutral.50", "Text on destructive.")
    theme["chart-1"] = a("brand.data-visualisation.ramp.darkBlue.500", "Data-vis series 1.")
    theme["chart-2"] = a("brand.data-visualisation.ramp.yellow.500", "Data-vis series 2.")
    theme["chart-3"] = a("brand.data-visualisation.ramp.lightBlue.500", "Data-vis series 3.")
    theme["chart-4"] = a("brand.data-visualisation.ramp.orange.500", "Data-vis series 4.")
    theme["chart-5"] = a("brand.data-visualisation.ramp.teal.500", "Data-vis series 5.")
    m["theme"] = theme
save("semantic.json", sem)

print("palette top:", list(pal["Light"]["brand"].keys()))
print("foundation top has product/accent:", "product" in fnd, "accent" in fnd)
print("semantic Light groups:", list(sem["Light"].keys()))
print("theme token count:", len(sem["Light"]["theme"]))
print("OK")
