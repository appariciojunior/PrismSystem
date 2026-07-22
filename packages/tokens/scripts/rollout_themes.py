import json
import copy

with open('packages/tokens/src/tokens.json', 'r') as f:
    tokens = json.load(f)

channels = ['home', 'uk', 'world', 'business', 'money', 'sport', 'travel', 'culture', 'obituaries', 'ireland']

def rollout_token_sets(source_set_name, target_channel):
    target_set_name = source_set_name.replace('comment', target_channel)
    
    # Deep copy the source set
    new_set = copy.deepcopy(tokens[source_set_name])
    
    # Recursively replace 'comment' with target_channel in values
    def replace_channel_refs(obj):
        if isinstance(obj, dict):
            for k, v in obj.items():
                if k == 'value' and isinstance(v, str):
                    obj[k] = v.replace('.comment.', f'.{target_channel}.')
                else:
                    replace_channel_refs(v)
        elif isinstance(obj, list):
            for item in obj:
                replace_channel_refs(item)

    replace_channel_refs(new_set)
    
    # Add the new set to tokens
    tokens[target_set_name] = new_set
    return target_set_name

# First, create the token sets
new_sets = []
for channel in channels:
    new_sets.append(rollout_token_sets('light/ comment', channel))
    new_sets.append(rollout_token_sets('dark/ comment', channel))

# Now, create new entries in $themes
if '$themes' in tokens:
    new_themes = []
    for channel in channels:
        # Find source themes to clone
        light_source = next((t for t in tokens['$themes'] if t.get('id') == 'theme-comment-light'), None)
        dark_source = next((t for t in tokens['$themes'] if t.get('id') == 'theme-comment-dark'), None)
        
        if light_source:
            new_light = copy.deepcopy(light_source)
            new_light['id'] = f"theme-{channel}-light"
            new_light['name'] = f"☀️ {channel.capitalize()}"
            new_light['description'] = f"Light mode - {channel.capitalize()} channel semantics"
            # Update selectedTokenSets
            new_light['selectedTokenSets'] = {k: v for k, v in new_light['selectedTokenSets'].items() if not k.startswith('light/')}
            # Add standard sets
            new_light['selectedTokenSets']['foundation'] = 'source'
            new_light['selectedTokenSets']['light/ brand'] = 'source'
            new_light['selectedTokenSets']['light/ channels'] = 'source'
            new_light['selectedTokenSets']['light/ marketing'] = 'source'
            new_light['selectedTokenSets']['light/ dataVisualisation'] = 'source'
            new_light['selectedTokenSets'][f'light/ {channel}'] = 'enabled'
            new_themes.append(new_light)
            
        if dark_source:
            new_dark = copy.deepcopy(dark_source)
            new_dark['id'] = f"theme-{channel}-dark"
            new_dark['name'] = f"🌑 {channel.capitalize()}"
            new_dark['description'] = f"Dark mode - {channel.capitalize()} channel semantics"
            # Update selectedTokenSets
            new_dark['selectedTokenSets'] = {k: v for k, v in new_dark['selectedTokenSets'].items() if not k.startswith('dark/')}
            # Add standard sets
            new_dark['selectedTokenSets']['foundation'] = 'source'
            new_dark['selectedTokenSets']['dark/ brand'] = 'source'
            new_dark['selectedTokenSets']['dark/ channels'] = 'source'
            new_dark['selectedTokenSets']['dark/ marketing'] = 'source'
            new_dark['selectedTokenSets']['dark/ dataVisualisation'] = 'source'
            new_dark['selectedTokenSets'][f'dark/ {channel}'] = 'enabled'
            new_themes.append(new_dark)

    # Insert new themes before Viewport themes
    viewport_index = next((i for i, t in enumerate(tokens['$themes']) if t.get('group') == 'Viewport'), len(tokens['$themes']))
    for i, theme in enumerate(new_themes):
        tokens['$themes'].insert(viewport_index + i, theme)

# Update $metadata if it exists
if '$metadata' in tokens and 'tokenSetOrder' in tokens['$metadata']:
    for name in new_sets:
        if name not in tokens['$metadata']['tokenSetOrder']:
            tokens['$metadata']['tokenSetOrder'].append(name)

with open('packages/tokens/src/tokens.json', 'w') as f:
    json.dump(tokens, f, indent=2)

print(f"Successfully rolled out {len(new_sets)} token sets and {len(new_themes)} themes.")
