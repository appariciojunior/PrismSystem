#!/usr/bin/env python3
"""
Add table of contents with anchor links to design-token-framework.md
"""

from pathlib import Path
import re

def generate_toc():
    """Generate table of contents with anchor links"""
    toc = """
## Table of Contents

- [Introduction](#introduction)
- [Token Naming System](#token-naming-system)
  - [Overview](#overview)
  - [Naming Structure](#naming-structure)
  - [Token Attributes Reference](#token-attributes-reference)
  - [Naming Examples](#naming-examples)
  - [Outlier Token Types: Composite Tokens](#outlier-token-types-composite-tokens)
  - [Best Practices for Creating New Tokens](#best-practices-for-creating-new-tokens)
- [Semantic Token Descriptions](#semantic-token-descriptions)
  - [Interactive Tokens](#interactive-tokens)
  - [Feedback Tokens](#feedback-tokens)
  - [Text Tokens](#text-tokens)
  - [Icon Tokens](#icon-tokens)
  - [Surface Tokens](#surface-tokens)
  - [Border Tokens](#border-tokens)
  - [Input Tokens](#input-tokens)
  - [Channel Tokens](#channel-tokens)
  - [Tag Tokens](#tag-tokens)
- [Elevation System](#elevation-system)
  - [Overview](#overview-1)
  - [Token Structure](#token-structure)
  - [Elevation System: Composite Token Reference](#elevation-system-composite-token-reference)
  - [Z-Index Mapped Levels](#z-index-mapped-levels)
    - [Level -1: Undercanvas](#level--1-undercanvas)
    - [Level 0: Canvas](#level-0-canvas)
    - [Level 1: Contained Elements](#level-1-contained-elements)
    - [Level 2: Interactive Cards](#level-2-interactive-cards)
    - [Level 3: Sticky Elements](#level-3-sticky-elements)
    - [Level 4: Overlays](#level-4-overlays)
  - [Agnostic Elevation Levels](#agnostic-elevation-levels)
    - [Level Inverse](#level-inverse)
    - [Level Accent Strong](#level-accent-strong)
    - [Level Accent Subtle](#level-accent-subtle)
  - [Token Implementation](#token-implementation)
  - [Usage Examples](#usage-examples)
  - [Shadow Specifications](#shadow-specifications)
  - [Dark Mode Strategy](#dark-mode-strategy)
  - [Usage Guidelines](#usage-guidelines)
  - [Accessibility Considerations](#accessibility-considerations)
  - [Best Practices](#best-practices)
- [Grid System](#grid-system)
  - [Consumer Documentation](#consumer-documentation)
    - [Overview](#overview-2)
    - [Grid Anatomy](#grid-anatomy)
    - [When to Use the Grid](#when-to-use-the-grid)
    - [Grid Principles](#grid-principles)
    - [Common Grid Patterns](#common-grid-patterns)
    - [Responsive Behavior](#responsive-behavior)
    - [Accessibility Considerations](#accessibility-considerations-1)
    - [Best Practices](#best-practices-1)
    - [Grid Examples in Action](#grid-examples-in-action)
  - [Implementation Documentation](#implementation-documentation)
    - [System Architecture Overview](#system-architecture-overview)
    - [Token Architecture](#token-architecture-1)
    - [Figma Implementation](#figma-implementation)
    - [Code Implementation](#code-implementation)
    - [Column Count Rationale](#column-count-rationale)
    - [Testing & Validation](#testing--validation)
    - [Common Implementation Issues](#common-implementation-issues)
    - [Maintenance & Updates](#maintenance--updates)
- [Spacing Tokens](#spacing-tokens)
  - [Overview](#overview-3)
  - [Architecture](#architecture)
    - [Foundation Layer](#foundation-layer)
    - [Semantic Layer: Fluid Tokens](#semantic-layer-fluid-tokens)
    - [Semantic Layer: Static Tokens](#semantic-layer-static-tokens)
  - [Figma Export Structure](#figma-export-structure)
  - [Design Philosophy: Mobile-First Design](#design-philosophy-mobile-first-design)
  - [Naming Convention Comparison](#naming-convention-comparison)
  - [Implementation Notes](#implementation-notes)
- [Typography System](#typography-system)
  - [Overview](#overview-4)
  - [Architecture](#architecture-1)
    - [Foundation Layer](#foundation-layer-1)
    - [Viewport Collections](#viewport-collections)
    - [Responsive Tokens](#responsive-tokens-5-tokens)
    - [Non-Responsive Tokens](#non-responsive-tokens-20-tokens)
  - [Token Implementation in JSON](#token-implementation-in-json)
  - [Figma Export Behavior](#figma-export-behavior)
  - [Design Philosophy: Selective Responsiveness](#design-philosophy-selective-responsiveness)
  - [CSS Output Example](#css-output-example)
  - [Usage Guidelines](#usage-guidelines-1)
  - [Accessibility Considerations](#accessibility-considerations-2)
  - [Migration from Formula-Based System](#migration-from-formula-based-system)
- [Colour Ramp Generation Methodology](#colour-ramp-generation-methodology)
  - [Overview](#overview-5)
  - [Core Principle: Linear Lightness Progression](#core-principle-linear-lightness-progression)
  - [Generation Algorithm](#generation-algorithm)
  - [Real-World Example: Pink Ramp](#real-world-example-pink-ramp)
  - [Accessibility Intelligence](#accessibility-intelligence)

---
"""
    return toc

def main():
    file_path = Path(__file__).parent.parent.parent / 'design-token-framework.md'
    
    # Read file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if TOC already exists
    if '## Table of Contents' in content:
        print("⚠️  Table of Contents already exists, skipping...")
        return
    
    # Find where to insert (after title and before Introduction)
    lines = content.split('\n')
    insert_index = None
    
    for i, line in enumerate(lines):
        if line.strip() == '## Introduction':
            insert_index = i
            break
    
    if insert_index is None:
        print("❌ Could not find Introduction section")
        return
    
    # Generate TOC
    toc = generate_toc()
    
    # Insert TOC
    lines.insert(insert_index, toc)
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    
    print("✅ Added Table of Contents with anchor links to design-token-framework.md")

if __name__ == '__main__':
    main()
