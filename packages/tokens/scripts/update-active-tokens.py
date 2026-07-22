#!/usr/bin/env python3
import json
import sys

# Read the tokens file
with open('src/tokens.json', 'r') as f:
    data = json.load(f)

# Define the new active structure for light mode
light_active = {
    "primary": {
        "fill": {
            "default": {
                "value": "{brand.core.ramp.neutral.50}",
                "type": "color",
                "description": "Active primary fill - white background for high contrast."
            },
            "hover": {
                "value": "{brand.core.ramp.neutral.50}",
                "type": "color",
                "description": "Active primary fill hover"
            },
            "pressed": {
                "value": "{brand.core.ramp.neutral.50}",
                "type": "color",
                "description": "Active primary fill pressed"
            }
        },
        "text": {
            "default": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active primary text - black for 21:1 contrast on white."
            },
            "hover": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active primary text hover"
            },
            "pressed": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active primary text pressed"
            }
        },
        "border": {
            "default": {
                "value": "{active.primary.text.default}",
                "type": "color",
                "description": "Active primary border - cascades to text token for consistency."
            },
            "hover": {
                "value": "{active.primary.text.default}",
                "type": "color",
                "description": "Active primary border hover"
            },
            "pressed": {
                "value": "{active.primary.text.default}",
                "type": "color",
                "description": "Active primary border pressed"
            }
        },
        "icon": {
            "default": {
                "value": "{active.primary.text.default}",
                "type": "color",
                "description": "Active primary icon - cascades to text token for consistency."
            },
            "hover": {
                "value": "{active.primary.text.default}",
                "type": "color",
                "description": "Active primary icon hover"
            },
            "pressed": {
                "value": "{active.primary.text.default}",
                "type": "color",
                "description": "Active primary icon pressed"
            }
        }
    },
    "secondary": {
        "fill": {
            "default": {
                "value": "{brand.core.ramp.neutral.200}",
                "type": "color",
                "description": "Active secondary fill - neutral gray for lower emphasis."
            },
            "hover": {
                "value": "{brand.core.ramp.neutral.200}",
                "type": "color",
                "description": "Active secondary fill hover"
            },
            "pressed": {
                "value": "{brand.core.ramp.neutral.200}",
                "type": "color",
                "description": "Active secondary fill pressed"
            }
        },
        "text": {
            "default": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active secondary text - black for 13.1:1 contrast on neutral.200."
            },
            "hover": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active secondary text hover"
            },
            "pressed": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active secondary text pressed"
            }
        },
        "border": {
            "default": {
                "value": "{brand.core.ramp.neutral.500}",
                "type": "color",
                "description": "Active secondary border - 4.54:1 contrast, passes 3:1 requirement."
            },
            "hover": {
                "value": "{brand.core.ramp.neutral.500}",
                "type": "color",
                "description": "Active secondary border hover"
            },
            "pressed": {
                "value": "{brand.core.ramp.neutral.500}",
                "type": "color",
                "description": "Active secondary border pressed"
            }
        },
        "icon": {
            "default": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active secondary icon - black for contrast on secondary fill."
            },
            "hover": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active secondary icon hover"
            },
            "pressed": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active secondary icon pressed"
            }
        }
    }
}

# Define the new active structure for dark mode (REVERSED)
dark_active = {
    "primary": {
        "fill": {
            "default": {
                "value": "{brand.core.ramp.neutral.50}",
                "type": "color",
                "description": "Active primary fill - black background for high contrast (dark mode reversed)."
            },
            "hover": {
                "value": "{brand.core.ramp.neutral.50}",
                "type": "color",
                "description": "Active primary fill hover"
            },
            "pressed": {
                "value": "{brand.core.ramp.neutral.50}",
                "type": "color",
                "description": "Active primary fill pressed"
            }
        },
        "text": {
            "default": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active primary text - white for 21:1 contrast on black (dark mode)."
            },
            "hover": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active primary text hover"
            },
            "pressed": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active primary text pressed"
            }
        },
        "border": {
            "default": {
                "value": "{active.primary.text.default}",
                "type": "color",
                "description": "Active primary border - cascades to text token for consistency."
            },
            "hover": {
                "value": "{active.primary.text.default}",
                "type": "color",
                "description": "Active primary border hover"
            },
            "pressed": {
                "value": "{active.primary.text.default}",
                "type": "color",
                "description": "Active primary border pressed"
            }
        },
        "icon": {
            "default": {
                "value": "{active.primary.text.default}",
                "type": "color",
                "description": "Active primary icon - cascades to text token for consistency."
            },
            "hover": {
                "value": "{active.primary.text.default}",
                "type": "color",
                "description": "Active primary icon hover"
            },
            "pressed": {
                "value": "{active.primary.text.default}",
                "type": "color",
                "description": "Active primary icon pressed"
            }
        }
    },
    "secondary": {
        "fill": {
            "default": {
                "value": "{brand.core.ramp.neutral.250}",
                "type": "color",
                "description": "Active secondary fill - dark gray for lower emphasis (dark mode)."
            },
            "hover": {
                "value": "{brand.core.ramp.neutral.250}",
                "type": "color",
                "description": "Active secondary fill hover"
            },
            "pressed": {
                "value": "{brand.core.ramp.neutral.250}",
                "type": "color",
                "description": "Active secondary fill pressed"
            }
        },
        "text": {
            "default": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active secondary text - white for 13.4:1 contrast on neutral.250 (dark mode)."
            },
            "hover": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active secondary text hover"
            },
            "pressed": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active secondary text pressed"
            }
        },
        "border": {
            "default": {
                "value": "{brand.core.ramp.neutral.500}",
                "type": "color",
                "description": "Active secondary border - 4.54:1 contrast, passes 3:1 requirement (dark mode)."
            },
            "hover": {
                "value": "{brand.core.ramp.neutral.500}",
                "type": "color",
                "description": "Active secondary border hover"
            },
            "pressed": {
                "value": "{brand.core.ramp.neutral.500}",
                "type": "color",
                "description": "Active secondary border pressed"
            }
        },
        "icon": {
            "default": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active secondary icon - white for contrast on secondary fill (dark mode)."
            },
            "hover": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active secondary icon hover"
            },
            "pressed": {
                "value": "{brand.core.ramp.neutral.1000}",
                "type": "color",
                "description": "Active secondary icon pressed"
            }
        }
    }
}

# Light mode themes (semantic)
light_themes = [
    "light/ core",
    "light/ comment",
    "light/ lifeAndStyle",
    "light/ puzzles",
    "light/ home",
    "light/ uk",
    "light/ world",
    "light/ business",
    "light/ money",
    "light/ sport",
    "light/ travel",
    "light/ culture",
    "light/ obituaries",
    "light/ ireland"
]

# Dark mode themes (semantic)
dark_themes = [
    "dark/ core",
    "dark/ comment",
    "dark/ lifeAndStyle",
    "dark/ puzzles",
    "dark/ home",
    "dark/ uk",
    "dark/ world",
    "dark/ business",
    "dark/ money",
    "dark/ sport",
    "dark/ travel",
    "dark/ culture",
    "dark/ obituaries",
    "dark/ ireland"
]

# Update light mode themes
updated_light = 0
for theme in light_themes:
    if theme in data:
        # Remove selected if it exists
        if "selected" in data[theme]:
            del data[theme]["selected"]
            print(f"✅ Removed 'selected' from {theme}")
        
        # Replace active with new structure
        data[theme]["active"] = json.loads(json.dumps(light_active))
        updated_light += 1
        print(f"✅ Updated 'active' in {theme}")

# Update dark mode themes
updated_dark = 0
for theme in dark_themes:
    if theme in data:
        # Remove selected if it exists
        if "selected" in data[theme]:
            del data[theme]["selected"]
            print(f"✅ Removed 'selected' from {theme}")
        
        # Replace active with new structure
        data[theme]["active"] = json.loads(json.dumps(dark_active))
        updated_dark += 1
        print(f"✅ Updated 'active' in {theme}")

print(f"\n✅ Summary: Updated {updated_light} light mode themes and {updated_dark} dark mode themes")

# Write back the updated tokens
with open('src/tokens.json', 'w') as f:
    json.dump(data, f, indent=2)

print("✅ tokens.json saved successfully")
