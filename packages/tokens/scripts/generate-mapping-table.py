
import json

def get_token_value(theme_data, path):
    parts = path.split('.')
    current = theme_data
    for part in parts:
        if part in current:
            current = current[part]
        else:
            return None
    if isinstance(current, dict) and 'value' in current:
        return current['value']
    return None

def simplify_value(val):
    if not val: return "-"
    val = val.replace('{brand.channels.ramp.', '').replace('{brand.core.ramp.', 'n.').replace('}', '')
    # Remove the channel name from the ramp reference to keep it compact
    parts = val.split('.')
    if len(parts) > 1 and parts[0] != 'n':
        return parts[-1]
    return val

with open('../tokens.json', 'r') as f:
    tokens = json.load(f)

# Debug: print keys
# print(tokens.keys())

themes = [
    "home", "uk", "world", "business", "money", "sport", 
    "travel", "culture", "obituaries", "ireland", 
    "comment", "lifeAndStyle", "puzzles"
]

token_paths = [
    "text.channel.primary",
    "text.channel.secondary",
    "icon.channel.primary",
    "icon.channel.secondary",
    "border.channel.primary",
    "border.channel.secondary",
    "tag.channel",
    "surface.undercanvas",
    "surface.accent.high",
    "surface.accent.medium",
    "surface.accent.low"
]

# Header
header = "| Token | " + " | ".join([f"{t.capitalize()} L | {t.capitalize()} D" for t in themes]) + " |"
separator = "| :--- | " + " | ".join([":---: | :---:" for _ in themes]) + " |"

rows = []
for path in token_paths:
    row = f"| {path} | "
    vals = []
    for theme in themes:
        l_val = simplify_value(get_token_value(tokens.get(f"light/ {theme}", {}), path))
        d_val = simplify_value(get_token_value(tokens.get(f"dark/ {theme}", {}), path))
        vals.append(f"{l_val} | {d_val}")
    row += " | ".join(vals) + " |"
    rows.append(row)

print(header)
print(separator)
for row in rows:
    print(row)
