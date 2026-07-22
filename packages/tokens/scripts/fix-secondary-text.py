#!/usr/bin/env python3
"""Quick fix: Update interactive.secondary.text.default to {text.primary}"""

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
        sec = data[theme]["interactive"].get("secondary", {}).get("text", {}).get("default")
        if sec and sec.get("value") != "{text.primary}":
            sec["value"] = "{text.primary}"
            changes += 1
            print(f"✓ {theme}: secondary.text.default → {{text.primary}}")

with open(TOKENS_FILE, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n✅ Updated {changes} themes")
