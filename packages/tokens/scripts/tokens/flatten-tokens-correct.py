import json

with open('packages/tokens/src/tokens.json', 'r') as f:
    data = json.loads(f.read())

# Base rem values (using 1rem = 16px as standard)
# These should be THE SAME across all viewports
standard_values = {
    'fontSize0025': '0.5rem',      # 8px
    'fontSize005': '0.625rem',     # 10px
    'fontSize010': '0.75rem',      # 12px
    'fontSize020': '0.875rem',     # 14px
    'fontSize025': '0.9375rem',    # 15px
    'fontSize030': '1rem',         # 16px
    'fontSize035': '1.0625rem',    # 17px
    'fontSize040': '1.125rem',     # 18px
    'fontSize045': '1.1875rem',    # 19px
    'fontSize050': '1.25rem',      # 20px
    'fontSize055': '1.3125rem',    # 21px
    'fontSize060': '1.375rem',     # 22px
    'fontSize065': '1.4375rem',    # 23px
    'fontSize070': '1.5rem',       # 24px
    'fontSize075': '1.625rem',     # 26px
    'fontSize080': '1.75rem',      # 28px
    'fontSize085': '1.875rem',     # 30px
    'fontSize095': '2.125rem',     # 34px
    'fontSize105': '2.875rem',     # 46px
    'fontSize120': '2.75rem',      # 44px
    'fontSize125': '2.8125rem',    # 45px
    'fontSize130': '3rem',         # 48px
    'fontSize150': '4rem',         # 64px
    'fontSize155': '4.375rem',     # 70px
    'fontSize160': '5rem'          # 80px
}

# Responsive tokens with viewport-specific values
responsive_tokens = {'fontSize090', 'fontSize095', 'fontSize100', 'fontSize110', 'fontSize140'}
responsive_values = {
    'fontSize090': {
        'Viewport/ Small': '2rem',      # 32px
        'Viewport/ Medium': '2rem',     # 32px  
        'Viewport/ Large': '2rem',      # 32px
        'Viewport/ XLarge': '2.25rem'   # 36px
    },
    'fontSize100': {
        'Viewport/ Small': '2.25rem',   # 36px
        'Viewport/ Medium': '2.5rem',   # 40px
        'Viewport/ Large': '2.875rem',  # 46px
        'Viewport/ XLarge': '3.5rem'    # 56px
    },
    'fontSize110': {
        'Viewport/ Small': '2rem',      # 32px
        'Viewport/ Medium': '2rem',     # 32px
        'Viewport/ Large': '2rem',      # 32px
        'Viewport/ XLarge': '2.5rem'    # 40px
    },
    'fontSize140': {
        'Viewport/ Small': '2.5rem',    # 40px
        'Viewport/ Medium': '2.5rem',   # 40px
        'Viewport/ Large': '2.5rem',    # 40px
        'Viewport/ XLarge': '3.5rem'    # 56px
    }
}

# Process each viewport
for viewport_name in ['Viewport/ Small', 'Viewport/ Medium', 'Viewport/ Large', 'Viewport/ XLarge']:
    if viewport_name not in data:
        print(f"Warning: {viewport_name} not found in data")
        continue
    
    viewport = data[viewport_name]
    
    # Find and update all fontSize tokens
    for key in list(viewport.keys()):
        if key.startswith('fontSize'):
            # Skip responsive tokens for standard value application
            if key in responsive_tokens:
                continue
                
            # Apply standard value if exists
            if key in standard_values:
                viewport[key]['value'] = standard_values[key]
                viewport[key]['type'] = 'fontSizes'
                # Remove descriptions for non-responsive tokens
                if 'description' in viewport[key]:
                    del viewport[key]['description']
                print(f"Set {viewport_name}/{key} = {standard_values[key]}")
    
    # Apply responsive values
    for token_name, viewport_values in responsive_values.items():
        if token_name in viewport and viewport_name in viewport_values:
            value = viewport_values[viewport_name]
            viewport[token_name]['value'] = value
            viewport[token_name]['type'] = 'fontSizes'
            viewport[token_name]['description'] = f"{float(value.replace('rem', '')) * 16:.0f}px at {viewport_name.split('/ ')[1]} viewport"
            print(f"Set {viewport_name}/{token_name} = {value} (responsive)")

with open('packages/tokens/src/tokens.json', 'w') as f:
    json.dump(data, f, indent=2)

print("\n✓ All fontSize tokens flattened with explicit values")
print("✓ Non-responsive tokens have same values across all viewports")
print("✓ Responsive tokens scale according to specification")
