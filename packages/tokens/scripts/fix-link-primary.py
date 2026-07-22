#!/usr/bin/env python3
"""Update interactive.link.primary.default to reference interactive.primary.fill.default"""

import json

TOKENS_FILE = "packages/tokens/src/tokens.json"

themes = [
    "light/ core", "light/ business", "light/ comment", "light/ culture",
    "light/ home", "light/ ireland", "light/ lifeAndStyle", "light/ money",
    "light/ obituaries", "light/ puzzles", "light/ sport", "light/ travel",
    "light/ uk", "light/ world",
    "dark/ core", "dark/ business", "dark/ comment", "dark/ culture",
    "dark/ home", "dark/ ireland", "dark/ lifeAndStyle", "dark/ money",
    "dark/ obituaries", "dark/ puzzles", "dark/ sport", "dark/ travel",
    "dark/ uk", "dark/ world"
]

with open(TOKENS_FILE, 'r') as f:
    data = json.load(f)

changes = 0
for theme in themes:
    if theme in data and "interactive" in data[theme]:
        link = data[theme]["interactive"].get("link", {}).get("primary", {}).get("default")
        if link and link.get("value") != "{interactive.primary.fill.default}":
            link["value"] = "{interactive.primary.fill.default}"
            changes += 1
            print(f"✓ {theme}: link.primary.default → {{interactive.primary.fill.default}}")

with open(TOKENS_FILE, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n✅ Updated {changes} themes")
