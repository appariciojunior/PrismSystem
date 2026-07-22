#!/usr/bin/env python3
"""
Add comprehensive typography descriptions based on the product's editorial design
"""

import json
from pathlib import Path

def add_all_typography_descriptions(tokens):
    """Add descriptions to all typography tokens based on the product usage patterns"""
    
    # Based on studying the reference product structure:
    # - Editorial headings (serif) for article titles, opinion pieces
    # - Utility text (Inter) for UI, navigation, buttons, labels
    # - Clear hierarchy from hero headlines → article titles → section headings → body text
    # - Responsive sizing with fluid and static scales
    
    descriptions = {
        'brand': {
            'heading': {
                'fluid': {
                    'light': {
                        '2xsmall': 'Subtle editorial subheading for article sections and tertiary content',
                        'xsmall': 'Article subheading or secondary headline for opinion pieces',
                        'small': 'Standard article headline for news stories and features',
                        'medium': 'Prominent section heading for major stories and category pages',
                        'large': 'Lead story headline for homepage and top-tier editorial content',
                        'xlarge': 'Hero headline for breaking news and major investigations',
                        '2xlarge': 'Maximum impact headline for front-page stories and special reports'
                    },
                    'regular': {
                        '2xsmall': 'Body-weight subheading for accessible editorial hierarchy',
                        'xsmall': 'Regular article subheading for balanced typographic rhythm',
                        'small': 'Standard news headline with approachable weight',
                        'medium': 'Lead article headline balancing authority and readability',
                        'large': 'Major story headline for homepage hero sections',
                        'xlarge': 'Breaking news headline with commanding presence',
                        '2xlarge': 'Front-page impact headline for watershed moments'
                    },
                    'bold': {
                        '2xsmall': 'Emphasized subheading for visual hierarchy in dense layouts',
                        'xsmall': 'Strong article subheading for comment and analysis pieces',
                        'small': 'Bold news headline for sidebar stories and related content',
                        'medium': 'Prominent lead headline for section fronts and topic pages',
                        'large': 'High-impact headline for exclusive stories and investigations',
                        'xlarge': 'Bold breaking news headline for crisis coverage',
                        '2xlarge': 'Maximum emphasis front-page headline for historic events'
                    },
                    'black': {
                        '2xsmall': 'Ultra-bold micro headline for badges and compact callouts',
                        'xsmall': 'Extra-bold subheading for editorial emphasis and pull quotes',
                        'small': 'Heavy-weight headline for opinion columns and features',
                        'medium': 'Ultra-bold lead headline for major editorial statements',
                        'large': 'Maximum impact headline for flagship investigations',
                        'xlarge': 'Black-weight breaking news for critical national events',
                        '2xlarge': 'Absolute maximum impact headline for once-in-generation stories'
                    }
                },
                'static': {
                    'light': {
                        '10': 'Largest static headline (56px) for print-inspired hero sections',
                        '01': 'Smallest editorial heading (19px) for compact article sections',
                        '02': 'Minimal static heading (20px) for sidebars and related stories',
                        '03': 'Small static headline (24px) for article subheadings',
                        '04': 'Small-medium static headline (28px) for secondary article titles',
                        '05': 'Medium static headline (32px) for standard article headlines',
                        '06': 'Medium-large static headline (36px) for featured stories',
                        '07': 'Large static headline (40px) for section lead stories',
                        '08': 'Extra-large static headline (44px) for homepage hero content',
                        '09': 'Near-maximum static headline (48px) for breaking news'
                    },
                    'regular': {
                        '10': 'Maximum static headline (56px) regular weight for print aesthetic',
                        '01': 'Minimal static heading (19px) regular weight for accessibility',
                        '02': 'Small static heading (20px) regular weight for balanced hierarchy',
                        '03': 'Small-medium static headline (24px) for approachable subheadings',
                        '04': 'Medium-small static headline (28px) for section subdivisions',
                        '05': 'Standard static headline (32px) for article titles',
                        '06': 'Medium-large static headline (36px) for lead stories',
                        '07': 'Large static headline (40px) for prominent features',
                        '08': 'Extra-large static headline (44px) for homepage heroes',
                        '09': 'Near-maximum static headline (48px) for critical news'
                    },
                    'bold': {
                        '10': 'Maximum bold static headline (56px) for front-page impact',
                        '01': 'Minimal bold heading (19px) for emphasized micro content',
                        '02': 'Small bold heading (20px) for sidebar emphasis',
                        '03': 'Small-medium bold headline (24px) for strong subheadings',
                        '04': 'Medium-small bold headline (28px) for featured sidebars',
                        '05': 'Standard bold headline (32px) for lead article titles',
                        '06': 'Medium-large bold headline (36px) for major stories',
                        '07': 'Large bold headline (40px) for exclusive investigations',
                        '08': 'Extra-large bold headline (44px) for breaking news',
                        '09': 'Near-maximum bold headline (48px) for critical events'
                    },
                    'black': {
                        '10': 'Maximum black-weight headline (56px) for watershed moments',
                        '01': 'Minimal black-weight heading (19px) for ultra-bold badges',
                        '02': 'Small black-weight heading (20px) for maximum compact emphasis',
                        '03': 'Small-medium black headline (24px) for bold editorial statements',
                        '04': 'Medium-small black headline (28px) for emphasized features',
                        '05': 'Standard black headline (32px) for opinion and analysis impact',
                        '06': 'Medium-large black headline (36px) for flagship stories',
                        '07': 'Large black headline (40px) for major editorial campaigns',
                        '08': 'Extra-large black headline (44px) for crisis coverage',
                        '09': 'Near-maximum black headline (48px) for historic announcements'
                    }
                }
            },
            'body': {
                'light': {
                    'xsmall': 'Delicate body text for fine print, disclaimers, and tertiary information',
                    'small': 'Light body text for captions, image credits, and supporting metadata',
                    'medium': 'Standard light body text for accessible long-form reading',
                    'large': 'Prominent light body text for introductions and pull quotes'
                },
                'regular': {
                    'xsmall': 'Minimal body text for footnotes and micro-copy in dense layouts',
                    'small': 'Standard body text for article content and editorial copy',
                    'medium': 'Comfortable body text for long-form journalism and features',
                    'large': 'Prominent body text for article leads and introductory paragraphs',
                    'xlarge': 'Large body text for emphasis within editorial content'
                },
                'medium': {
                    'xsmall': 'Semi-bold micro text for labels and emphasized metadata',
                    'small': 'Semi-bold body text for bylines and article attributions',
                    'medium': 'Emphasized body text for pull quotes and key statements',
                    'large': 'Prominent semi-bold text for article introductions',
                    'xlarge': 'Large emphasized text for editorial highlights'
                },
                'bold': {
                    'xsmall': 'Bold micro text for tags and compact emphasized labels',
                    'small': 'Bold body text for author names and strong metadata',
                    'medium': 'Bold editorial text for key points and emphasis within articles',
                    'large': 'Strong body text for standout editorial statements',
                    'xlarge': 'Maximum bold body text for critical information highlights'
                }
            }
        },
        'utility': {
            'heading': {
                'small': 'Compact utility heading for mobile navigation and dense UI sections',
                'medium': 'Standard utility heading for card titles and component headers',
                'large': 'Prominent utility heading for page section dividers',
                'xlarge': 'Large utility heading for feature callouts and promotional blocks'
            },
            'body': {
                'xsmall': 'Minimal utility text for timestamps, view counts, and micro UI labels',
                'small': 'Standard utility text for article metadata and supporting information',
                'medium': 'Comfortable utility text for UI descriptions and help text',
                'large': 'Prominent utility text for feature descriptions and promotional copy'
            }
        }
    }
    
    updated_count = 0
    
    if 'Typography styles' not in tokens:
        return 0
    
    typography = tokens['Typography styles']
    
    # Add descriptions to brand typography
    if 'brand' in typography:
        brand = typography['brand']
        
        # Heading styles
        if 'heading' in brand:
            heading = brand['heading']
            
            # Fluid headings
            if 'fluid' in heading:
                for weight in ['light', 'regular', 'bold', 'black']:
                    if weight in heading['fluid']:
                        for size, desc in descriptions['brand']['heading']['fluid'][weight].items():
                            if size in heading['fluid'][weight]:
                                heading['fluid'][weight][size]['description'] = desc
                                updated_count += 1
            
            # Static headings
            if 'static' in heading:
                for weight in ['light', 'regular', 'bold', 'black']:
                    if weight in heading['static']:
                        for size, desc in descriptions['brand']['heading']['static'][weight].items():
                            if size in heading['static'][weight]:
                                heading['static'][weight][size]['description'] = desc
                                updated_count += 1
        
        # Body styles
        if 'body' in brand:
            body = brand['body']
            for weight in ['light', 'regular', 'medium', 'bold']:
                if weight in body:
                    for size, desc in descriptions['brand']['body'][weight].items():
                        if size in body[weight]:
                            body[weight][size]['description'] = desc
                            updated_count += 1
    
    # Add descriptions to utility typography
    if 'utility' in typography:
        utility = typography['utility']
        
        # Heading styles
        if 'heading' in utility:
            for size, desc in descriptions['utility']['heading'].items():
                if size in utility['heading']:
                    utility['heading'][size]['description'] = desc
                    updated_count += 1
        
        # Body styles  
        if 'body' in utility:
            for size, desc in descriptions['utility']['body'].items():
                if size in utility['body']:
                    utility['body'][size]['description'] = desc
                    updated_count += 1
    
    return updated_count

def main():
    tokens_path = Path(__file__).parent / 'tokens.json'
    
    print("📖 Reading tokens.json...")
    with open(tokens_path, 'r') as f:
        tokens = json.load(f)
    
    print("\n📝 Adding typography descriptions...")
    added = add_all_typography_descriptions(tokens)
    print(f"   ✓ Added {added} typography descriptions")
    
    print("\n💾 Writing updated tokens.json...")
    with open(tokens_path, 'w') as f:
        json.dump(tokens, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Complete! Added {added} comprehensive typography descriptions")
    print("   Based on the product's editorial design patterns:")
    print("   - Editorial headings (Inter)")
    print("   - Utility UI text (Inter)")
    print("   - Clear hierarchy from hero → article → section → body")

if __name__ == '__main__':
    main()
