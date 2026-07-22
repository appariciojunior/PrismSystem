import json
import re

def fix_references(obj):
    if isinstance(obj, str):
        # 1. Remove set names from references
        # {foundation.dimension.100} -> {dimension.100}
        obj = obj.replace('{foundation.dimension.', '{dimension.')
        # {foundation.fontSize...} -> {fontSize...}
        obj = obj.replace('{foundation.fontSize', '{fontSize')
        # {foundation.fontLineHeight...} -> {fontLineHeight')
        obj = obj.replace('{foundation.fontLineHeight', '{fontLineHeight')
        # {foundation.colour.modifier...} -> {colour.modifier...}
        obj = obj.replace('{foundation.colour.modifier.', '{colour.modifier.')
        # {foundation.foundation.brand...} -> {foundation.brand...}
        obj = obj.replace('{foundation.foundation.brand.', '{foundation.brand.')
        # {foundation.foundation.product...} -> {foundation.product.')
        obj = obj.replace('{foundation.foundation.product.', '{foundation.product.')
        # {foundation.foundation.marketing...} -> {foundation.marketing.')
        obj = obj.replace('{foundation.foundation.marketing.', '{foundation.marketing.')
        # {foundation.foundation.data-vis...} -> {foundation.data-vis.')
        obj = obj.replace('{foundation.foundation.data-vis.', '{foundation.data-vis.')
        
        # 2. Remove viewport set names
        obj = re.sub(r'\{viewport/ [^.]+\.fontSize', '{fontSize', obj)
        
        # 3. Remove palette set names
        obj = obj.replace('{light/ brand.', '{')
        obj = obj.replace('{dark/ brand.', '{')
        obj = obj.replace('{light/ channels.', '{')
        obj = obj.replace('{dark/ channels.', '{')
        
        # 4. Fix specific dimension.125 issue mentioned by user
        # (Already handled by rule 1, but let's be explicit if needed)
        
        return obj
    
    if isinstance(obj, dict):
        return {k: fix_references(v) for k, v in obj.items()}
    
    if isinstance(obj, list):
        return [fix_references(i) for i in obj]
    
    return obj

def main():
    file_path = '../src/tokens.json'
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    # Apply fixes
    fixed_data = fix_references(data)
    
    # Special check for dimension.125
    try:
        dim125 = fixed_data['foundation']['dimension']['125']['value']
        print(f"dimension.125 value: {dim125}")
    except KeyError:
        print("Could not find dimension.125")

    # Special check for brand ramp
    try:
        cream200 = fixed_data['light/ brand']['brand']['core']['ramp']['digital']['cream']['200']
        print(f"cream.200 value: {cream200['value']}")
        print(f"cream.200 modifier value: {cream200['$extensions']['studio.tokens']['modify']['value']}")
    except KeyError:
        print("Could not find cream.200")

    with open(file_path, 'w') as f:
        json.dump(fixed_data, f, indent=2)
    
    print("Successfully cleaned tokens.json")

if __name__ == "__main__":
    main()
