import json
import csv
import os
import colorsys
import re

# Load tokens.json
tokens_path = 'packages/tokens/src/tokens.json'
with open(tokens_path, 'r') as f:
    tokens = json.load(f)

# Define the 10 new themes
new_channels = [
    'home', 'uk', 'world', 'business', 'money', 
    'sport', 'travel', 'culture', 'obituaries', 'ireland'
]

# Define the sections and their tokens
sections = {
    "Surface": [
        "surface.undercanvas", "surface.canvas", "surface.level-1", "surface.level-2",
        "surface.level-3", "surface.level-4", "surface.inverse", "surface.overlay",
        "surface.accent.low", "surface.accent.medium", "surface.accent.high"
    ],
    "Text": [
        "text.primary", "text.secondary", "text.inverse.primary", "text.inverse.secondary",
        "text.on-accent.primary", "text.on-accent.secondary", "text.accent.low",
        "text.accent.medium", "text.accent.high", "text.channel.primary", "text.channel.secondary"
    ],
    "Icon": [
        "icon.primary", "icon.secondary", "icon.inverse", "icon.on-accent.primary",
        "icon.on-accent.secondary", "icon.accent.low", "icon.accent.medium",
        "icon.accent.high", "icon.channel.primary", "icon.channel.secondary"
    ],
    "Border": [
        "border.primary.default", "border.primary.hover", "border.primary.pressed",
        "border.secondary.default", "border.secondary.hover", "border.secondary.pressed",
        "border.elevation", "border.inverse", "border.on-accent.primary",
        "border.on-accent.secondary", "border.tertiary.default", "border.tertiary.hover",
        "border.tertiary.pressed", "border.accent.low", "border.accent.medium",
        "border.accent.high", "border.channel.primary", "border.channel.secondary"
    ],
    "Input": [
        "input.fill.default", "input.fill.error", "input.border.default",
        "input.border.error", "input.text.default", "input.text.error"
    ],
    "Feedback": [
        "feedback.fill.error", "feedback.fill.success", "feedback.fill.warning", "feedback.fill.info",
        "feedback.text.error", "feedback.text.success", "feedback.text.warning", "feedback.text.info",
        "feedback.border.error", "feedback.border.success", "feedback.border.warning", "feedback.border.info"
    ],
    "Interactive": [
        "interactive.primary.fill.default", "interactive.primary.fill.hover", "interactive.primary.fill.pressed",
        "interactive.primary.text.default", "interactive.primary.text.hover", "interactive.primary.text.pressed",
        "interactive.secondary.fill.default", "interactive.secondary.fill.hover", "interactive.secondary.fill.pressed",
        "interactive.secondary.border.default", "interactive.secondary.border.hover", "interactive.secondary.border.pressed",
        "interactive.secondary.text.default", "interactive.secondary.text.hover", "interactive.secondary.text.pressed",
        "interactive.disabled.a", "interactive.disabled.b", "interactive.disabled.c",
        "interactive.link.primary.default", "interactive.link.primary.hover", "interactive.link.primary.pressed",
        "interactive.link.secondary.default", "interactive.link.secondary.hover", "interactive.link.secondary.pressed"
    ],
    "Selection": [
        "selection.background", "selection.text"
    ],
    "Selected": [
        "selected.primary.fill.default"
    ],
    "Focus": [
        "focus.border"
    ],
    "Tag": [
        "tag.filled.live.fill", "tag.filled.live.text", "tag.filled.live.border",
        "tag.filled.primary.fill", "tag.filled.primary.text", "tag.filled.primary.border",
        "tag.filled.secondary.fill", "tag.filled.secondary.text", "tag.filled.secondary.border",
        "tag.inline.live.text", "tag.inline.primary.text", "tag.inline.secondary.text", "tag.channel"
    ]
}

def get_ref_with_modifier(token_path, mode, channel):
    parts = token_path.split('.')
    # Try channel-specific theme first
    theme_name = f'{mode}/ {channel}'
    current = tokens.get(theme_name, {})
    for part in parts:
        if isinstance(current, dict) and part in current:
            current = current[part]
        else:
            # Fallback to core
            current = tokens.get(f'{mode}/ core', {})
            for p in parts:
                if isinstance(current, dict) and p in current:
                    current = current[p]
                else:
                    current = "N/A"
                    break
            break
    
    if isinstance(current, dict) and 'value' in current:
        val = current['value']
        
        # Check for modifiers
        ext = current.get('$extensions', {}).get('studio.tokens', {}).get('modify', {})
        if ext:
            mod_type = ext.get('type')
            mod_val = ext.get('value')
            return f"{val} ({mod_type} {mod_val})"
        
        return val
    return "N/A"

# Generate the proposal
output = "# Channel Semantic Tokens Proposal (Granular - References & Modifiers)\n\n"
output += "This proposal outlines the semantic token mappings for 10 additional channels.\n\n"

# Add the Channel-Specific Tokens Summary Table
output += "## Channel-Specific Tokens Summary\n"
output += "This table lists all tokens that reference the channel's specific color ramp (e.g., `{brand.channels.ramp.<channel>.*}`).\n\n"
output += "| Token | Reference (Light) | Reference (Dark) |\n"
output += "| :--- | :--- | :--- |\n"

# Collect all tokens that use channel-specific ramps
channel_tokens = []
for section_name, token_list in sections.items():
    for token_path in token_list:
        ref_light = get_ref_with_modifier(token_path, "light", "comment")
        if "brand.channels.ramp.comment" in ref_light:
            channel_tokens.append(token_path)

for token_path in sorted(list(set(channel_tokens))):
    ref_light = get_ref_with_modifier(token_path, "light", "comment")
    ref_dark = get_ref_with_modifier(token_path, "dark", "comment")
    output += f"| {token_path} | `{ref_light}` | `{ref_dark}` |\n"

output += "\n---\n\n"

for channel in new_channels:
    output += f"## Theme: {channel.capitalize()}\n\n"
    
    for section_name, token_list in sections.items():
        output += f"### {section_name}\n\n"
        output += "| Token | Reference (Light) | Reference (Dark) |\n"
        output += "| :--- | :--- | :--- |\n"
        
        for token_path in token_list:
            ref_light = get_ref_with_modifier(token_path, "light", channel)
            ref_dark = get_ref_with_modifier(token_path, "dark", channel)
            
            output += f"| {token_path} | `{ref_light}` | `{ref_dark}` |\n"
        
        output += "\n"

with open('packages/tokens/colour analysis/channel semantic tokens proposal granular.md', 'w') as f:
    f.write(output)

print("Granular proposal (References & Modifiers) generated at packages/tokens/colour analysis/channel semantic tokens proposal granular.md")
