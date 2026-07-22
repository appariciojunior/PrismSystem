#!/usr/bin/env python3
"""
Rollout interactive.negative grouping to all remaining themes.
Adds the corrected negative structure with proper destructive action descriptions.
"""

import json
import sys
from pathlib import Path

# Light mode themes (use error.800)
LIGHT_THEMES = [
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
    "light/ ireland",
]

# Dark mode themes (use error.600)
DARK_THEMES = [
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
    "dark/ ireland",
]

def get_negative_structure(mode="light"):
    """Generate the corrected negative structure for a given mode."""
    error_step = "800" if mode == "light" else "600"
    fill_desc_mode = "white" if mode == "light" else "black"
    border_desc_mode = "red" if mode == "light" else "lighter red for dark mode"
    text_desc_mode = "red" if mode == "light" else "Lighter error color (red)"
    
    return {
        "fill": {
            "default": {
                "value": "{brand.core.ramp.neutral.50}",
                "type": "color",
                "description": f"Destructive button background. {'Light' if mode == 'light' else 'Dark'} fill ({fill_desc_mode}) for medium-emphasis danger actions (delete, remove, revoke)."
            },
            "hover": {
                "value": "{interactive.negative.fill.default}",
                "type": "color",
                "$extensions": {
                    "studio.tokens": {
                        "modify": {
                            "type": "darken",
                            "value": "{colour.modifier.interactive.hover}",
                            "space": "hsl",
                            "description": "Destructive button fill hover state. Programmatic darkening for visual feedback."
                        }
                    }
                },
                "description": "Destructive button on hover. Subtle darkening signals interactive state without encouraging accidental activation."
            },
            "pressed": {
                "value": "{interactive.negative.fill.default}",
                "type": "color",
                "$extensions": {
                    "studio.tokens": {
                        "modify": {
                            "type": "darken",
                            "value": "{colour.modifier.interactive.pressed}",
                            "space": "hsl",
                            "description": "Destructive button fill pressed state. Maximum darkening confirms user action."
                        }
                    }
                },
                "description": "Destructive button on press. Completes state progression before triggering confirmation modal."
            }
        },
        "border": {
            "default": {
                "value": f"{{brand.core.ramp.messaging.error.{error_step}}}",
                "type": "color",
                "description": f"Destructive button border. Error color ({border_desc_mode}) signals critical action requiring confirmation."
            },
            "hover": {
                "value": "{interactive.negative.border.default}",
                "type": "color",
                "$extensions": {
                    "studio.tokens": {
                        "modify": {
                            "type": "darken",
                            "value": "{colour.modifier.interactive.hover}",
                            "space": "hsl",
                            "description": "Destructive border hover state. Darkened error border emphasizes hover feedback."
                        }
                    }
                },
                "description": "Destructive border on hover. Intensified error color indicates interactive danger state."
            },
            "pressed": {
                "value": "{interactive.negative.border.default}",
                "type": "color",
                "$extensions": {
                    "studio.tokens": {
                        "modify": {
                            "type": "darken",
                            "value": "{colour.modifier.interactive.pressed}",
                            "space": "hsl",
                            "description": "Destructive border pressed state. Maximum contrast confirms critical action initiation."
                        }
                    }
                },
                "description": "Destructive border on pressed. Full intensity error border signals imminent destructive action."
            }
        },
        "text": {
            "default": {
                "value": f"{{brand.core.ramp.messaging.error.{error_step}}}",
                "type": "color",
                "description": f"Destructive button text. {text_desc_mode} on {'light' if mode == 'light' else 'dark'} background ensures WCAG AAA contrast and signals danger."
            },
            "hover": {
                "value": "{interactive.negative.text.default}",
                "type": "color",
                "$extensions": {
                    "studio.tokens": {
                        "modify": {
                            "type": "darken",
                            "value": "{colour.modifier.interactive.hover}",
                            "space": "hsl",
                            "description": "Destructive text hover state. Maintains contrast ratio while darkening with border/fill."
                        }
                    }
                },
                "description": "Destructive text on hover. Darkened error text maintains readability during hover state."
            },
            "pressed": {
                "value": "{interactive.negative.text.default}",
                "type": "color",
                "$extensions": {
                    "studio.tokens": {
                        "modify": {
                            "type": "darken",
                            "value": "{colour.modifier.interactive.pressed}",
                            "space": "hsl",
                            "description": "Destructive text pressed state. Maximum contrast ensures readability at press."
                        }
                    }
                },
                "description": "Destructive text on pressed. Maximum intensity error text confirms critical action."
            }
        },
        "icon": {
            "default": {
                "value": "{interactive.negative.text.default}",
                "type": "color",
                "description": "Destructive icon color. Matches text for visual consistency (trash, warning, close icons)."
            },
            "hover": {
                "value": "{interactive.negative.icon.default}",
                "type": "color",
                "$extensions": {
                    "studio.tokens": {
                        "modify": {
                            "type": "darken",
                            "value": "{colour.modifier.interactive.hover}",
                            "space": "hsl"
                        }
                    }
                },
                "description": "Destructive icon on hover. Darkens with text/border for unified hover state."
            },
            "pressed": {
                "value": "{interactive.negative.icon.default}",
                "type": "color",
                "$extensions": {
                    "studio.tokens": {
                        "modify": {
                            "type": "darken",
                            "value": "{colour.modifier.interactive.pressed}",
                            "space": "hsl",
                            "description": "Destructive icon pressed state. Cascades with text for consistent pressed feedback."
                        }
                    }
                },
                "description": "Destructive icon on pressed. Maximum intensity matches text state."
            }
        }
    }

def main():
    tokens_path = Path(__file__).parent.parent / "src" / "tokens.json"
    
    print(f"Loading {tokens_path}...")
    with open(tokens_path, 'r') as f:
        tokens = json.load(f)
    
    # Process light themes
    for theme in LIGHT_THEMES:
        if theme in tokens and "interactive" in tokens[theme]:
            if "negative" not in tokens[theme]["interactive"]:
                print(f"✅ Adding negative to {theme} (error.800)")
                
                # Create new interactive dict with correct order
                old_interactive = tokens[theme]["interactive"]
                new_interactive = {}
                
                # Preserve order: disabled, link, negative (new), primary, secondary
                for key in ["disabled", "link"]:
                    if key in old_interactive:
                        new_interactive[key] = old_interactive[key]
                
                # Insert negative
                new_interactive["negative"] = get_negative_structure("light")
                
                # Add remaining keys
                for key in ["primary", "secondary"]:
                    if key in old_interactive:
                        new_interactive[key] = old_interactive[key]
                
                tokens[theme]["interactive"] = new_interactive
            else:
                print(f"⏭️  Skipping {theme} (already has negative)")
    
    # Process dark themes
    for theme in DARK_THEMES:
        if theme in tokens and "interactive" in tokens[theme]:
            if "negative" not in tokens[theme]["interactive"]:
                print(f"✅ Adding negative to {theme} (error.600)")
                
                # Create new interactive dict with correct order
                old_interactive = tokens[theme]["interactive"]
                new_interactive = {}
                
                # Preserve order: disabled, link, negative (new), primary, secondary
                for key in ["disabled", "link"]:
                    if key in old_interactive:
                        new_interactive[key] = old_interactive[key]
                
                # Insert negative
                new_interactive["negative"] = get_negative_structure("dark")
                
                # Add remaining keys
                for key in ["primary", "secondary"]:
                    if key in old_interactive:
                        new_interactive[key] = old_interactive[key]
                
                tokens[theme]["interactive"] = new_interactive
            else:
                print(f"⏭️  Skipping {theme} (already has negative)")
    
    print(f"\n💾 Writing updated tokens.json...")
    with open(tokens_path, 'w') as f:
        json.dump(tokens, f, indent=2)
    
    print("✨ Complete! Interactive.negative added to all themes.")
    print("\nRun validation:")
    print("  python3 -m json.tool packages/tokens/src/tokens.json > /dev/null")
    print("  npm run build:output")

if __name__ == "__main__":
    main()
