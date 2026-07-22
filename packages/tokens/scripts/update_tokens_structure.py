import json

with open('packages/tokens/src/tokens.json', 'r') as f:
    tokens = json.load(f)

def update_theme(theme_name):
    if theme_name in tokens:
        theme = tokens[theme_name]
        
        # Update channel tokens
        if 'text' in theme and 'channel' in theme['text']:
            if 'value' in theme['text']['channel']:
                val = theme['text']['channel']['value']
                theme['text']['channel'] = {
                    "primary": { "value": val, "type": "color", "description": "Primary channel-specific text color." },
                    "secondary": { "value": val, "type": "color", "description": "Secondary channel-specific text color." }
                }
        
        if 'icon' in theme and 'channel' in theme['icon']:
            if 'value' in theme['icon']['channel']:
                val = theme['icon']['channel']['value']
                theme['icon']['channel'] = {
                    "primary": { "value": val, "type": "color", "description": "Primary channel-specific icon color." },
                    "secondary": { "value": val, "type": "color", "description": "Secondary channel-specific icon color." }
                }
            
        if 'border' in theme and 'channel' in theme['border']:
            if 'value' in theme['border']['channel']:
                val = theme['border']['channel']['value']
                theme['border']['channel'] = {
                    "primary": { "value": val, "type": "color", "description": "Primary channel-specific border color." },
                    "secondary": { "value": val, "type": "color", "description": "Secondary channel-specific border color." }
                }

        # Update disabled tokens for light themes
        if theme_name.startswith('light/'):
            if 'interactive' in theme and 'disabled' in theme['interactive']:
                theme['interactive']['disabled']['a']['value'] = "{brand.core.ramp.neutral.200}"
                theme['interactive']['disabled']['b']['value'] = "{brand.core.ramp.neutral.300}"
                theme['interactive']['disabled']['c']['value'] = "{brand.core.ramp.neutral.400}"

# Update existing themes
update_theme('light/ core')
update_theme('light/ comment')
update_theme('dark/ core')
update_theme('dark/ comment')

with open('packages/tokens/src/tokens.json', 'w') as f:
    json.dump(tokens, f, indent=2)
