#!/usr/bin/env python3
"""Fix interactive.negative descriptions - remove color references and make semantic"""
import json
from pathlib import Path

# Better descriptions (semantic, no color names, consistent pattern)
DESCRIPTIONS = {
    'fill': {
        'default': 'Background for destructive action buttons. Medium-emphasis visual treatment for actions requiring user confirmation.',
        'hover': 'Background hover state for destructive actions. Provides visual feedback for interactive danger elements.',
        'pressed': 'Background pressed state for destructive actions. Completes interaction feedback before user confirmation.'
    },
    'border': {
        'default': 'Border for destructive action buttons. Signals critical actions requiring user attention and confirmation.',
        'hover': 'Border hover state for destructive actions. Reinforces interactive danger state.',
        'pressed': 'Border pressed state for destructive actions. Maximum emphasis for imminent critical action.'
    },
    'text': {
        'default': 'Text for destructive action buttons. High contrast ensures readability and signals danger.',
        'hover': 'Text hover state for destructive actions. Maintains readability during interaction.',
        'pressed': 'Text pressed state for destructive actions. Maximum emphasis confirms critical action intent.'
    },
    'icon': {
        'default': 'Icon color for destructive actions. Matches text for visual consistency.',
        'hover': 'Icon hover state for destructive actions. Unified visual feedback with text and border.',
        'pressed': 'Icon pressed state for destructive actions. Maximum emphasis aligns with text state.'
    }
}

tokens_path = Path(__file__).parent.parent / 'src' / 'tokens.json'
with open(tokens_path) as f:
    data = json.load(f)

# All 28 theme sets
themes = [k for k in data.keys() if k.startswith('light/ ') or k.startswith('dark/ ')]
updated_count = 0

for theme in themes:
    if 'interactive' in data[theme] and 'negative' in data[theme]['interactive']:
        negative = data[theme]['interactive']['negative']
        
        for role, states in DESCRIPTIONS.items():
            if role in negative:
                for state, description in states.items():
                    if state in negative[role] and isinstance(negative[role][state], dict):
                        negative[role][state]['description'] = description
                        updated_count += 1

print(f"✅ Updated {updated_count} descriptions across {len(themes)} themes")

# Write back
with open(tokens_path, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    f.write('\n')

print("✅ tokens.json updated with semantic descriptions")
