import json

# Read tokens
with open('packages/tokens/src/tokens.json', 'r') as f:
    data = json.loads(f.read())

# Define the base font size for each viewport (in rem, where 1rem = 16px)
# These are the fontSize030 values that should remain
viewport_bases = {
    'Viewport/ Small': 1.0,      # 16px
    'Viewport/ Medium': 1.25,    # 20px  
    'Viewport/ Large': 1.125,    # 18px
    'Viewport/ XLarge': 1.0      # 16px (reverted from 1.375)
}

# fontSize tokens that need EXPLICIT values (responsive tokens already set)
# For non-responsive tokens, they should calculate from base but we'll make them explicit
responsive_tokens = {
    'fontSize090', 'fontSize095', 'fontSize100', 
    'fontSize110', 'fontSize140'
}

# Base multipliers from Foundation (for reference)
base_multipliers = {
    'fontSize0025': 0.5,
    'fontSize005': 0.625,
    'fontSize010': 0.75,
    'fontSize020': 0.875,
    'fontSize025': 0.9375,
    'fontSize030': 1.0,
    'fontSize035': 1.0625,
    'fontSize040': 1.125,
    'fontSize045': 1.1875,
    'fontSize050': 1.25,
    'fontSize055': 1.3125,
    'fontSize060': 1.375,
    'fontSize065': 1.4375,
    'fontSize070': 1.5,
    'fontSize075': 1.625,
    'fontSize080': 1.75,
    'fontSize085': 1.875,
    'fontSize090': 2.0,
    'fontSize095': 2.125,
    'fontSize100': 2.25,
    'fontSize105': 2.875,
    'fontSize110': 2.5,
    'fontSize120': 2.75,
    'fontSize125': 2.8125,
    'fontSize130': 3.0,
    'fontSize140': 3.5,
    'fontSize150': 4.0,
    'fontSize155': 4.375,
    'fontSize160': 5.0
}

# Process each viewport
for viewport_name, base_rem in viewport_bases.items():
    if viewport_name not in data:
        print(f"Warning: {viewport_name} not found")
        continue
    
    viewport = data[viewport_name]
    
    # Find all fontSize tokens in this viewport
    for token_name in list(viewport.keys()):
        if token_name.startswith('fontSize') and isinstance(viewport[token_name], dict):
            token = viewport[token_name]
            
            # Skip if already has explicit value and description (responsive tokens)
            if 'description' in token and 'viewport' in token.get('description', '').lower():
                print(f"Skipping {viewport_name}/{token_name} - already set as responsive")
                continue
            
            # Get the multiplier for this token
            if token_name in base_multipliers:
                multiplier = base_multipliers[token_name]
                # Calculate the explicit rem value
                calculated_rem = base_rem * multiplier
                
                # Round to reasonable precision (4 decimal places)
                calculated_rem = round(calculated_rem, 4)
                
                # Update the token with explicit value
                token['value'] = f"{calculated_rem}rem"
                token['type'] = 'fontSizes'
                
                # Remove any old description that's not viewport-specific
                if 'description' in token and 'viewport' not in token.get('description', '').lower():
                    del token['description']
                
                print(f"Set {viewport_name}/{token_name} = {calculated_rem}rem (base {base_rem} × {multiplier})")

# Write back
with open('packages/tokens/src/tokens.json', 'w') as f:
    json.dump(data, f, indent=2)

print("\n✓ All fontSize tokens now have explicit rem values per viewport")
