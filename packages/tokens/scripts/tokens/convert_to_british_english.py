#!/usr/bin/env python3
"""
Convert American English 'color' to British English 'colour' in prose text only.
Preserves technical terms like "type": "color" in code blocks.
"""

import re
from pathlib import Path

def convert_color_to_colour(content):
    """
    Convert 'color' to 'colour' in prose text, avoiding code blocks and technical properties.
    """
    lines = content.split('\n')
    result = []
    in_code_block = False
    
    for line in lines:
        # Track code blocks
        if line.strip().startswith('```'):
            in_code_block = not in_code_block
            result.append(line)
            continue
        
        # Skip lines inside code blocks
        if in_code_block:
            result.append(line)
            continue
        
        # Skip lines with technical properties (JSON, CSS properties)
        if '"type": "color"' in line or '"color"' in line or "'color'" in line:
            result.append(line)
            continue
        
        # Skip CSS color property references
        if 'Color:' in line and 'rgba' in line:
            result.append(line)
            continue
            
        # Skip grid color setting (technical term)
        if 'Color: #' in line and 'opacity' in line:
            result.append(line)
            continue
        
        # Convert 'color' to 'colour' in prose
        # Use word boundaries to avoid changing 'colored' to 'coloured' (both valid)
        modified = re.sub(r'\b(c|C)olor\b', r'\1olour', line)
        modified = re.sub(r'\b(c|C)olors\b', r'\1olours', line)
        
        result.append(modified)
    
    return '\n'.join(result)

def main():
    file_path = Path(__file__).parent.parent.parent / 'design-token-framework.md'
    
    # Read file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Convert
    converted = convert_color_to_colour(content)
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(converted)
    
    print(f"✅ Converted American English to British English in {file_path.name}")

if __name__ == '__main__':
    main()
