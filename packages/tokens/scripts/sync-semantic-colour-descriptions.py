#!/usr/bin/env python3
"""
Synchronize semantic colour token descriptions from Semantic Token Usage Guide to tokens.json.

This script reads refined descriptions from the guide and updates corresponding tokens
across all theme sets (light/core, dark/core, light/channels, dark/channels, etc.)

Usage:
    python3 sync-semantic-colour-descriptions.py [--dry-run] [--theme THEME]

Options:
    --dry-run: Print changes without modifying tokens.json
    --theme THEME: Only update specific theme set (e.g., "light/ core")
"""

import json
import re
import sys
from pathlib import Path
from typing import Dict, Any, List, Tuple

# Descriptions extracted from refined Semantic Token Usage Guide
DESCRIPTIONS = {
    # Interactive
    "interactive.primary.fill.default": "High-emphasis button background. Primary action colour used for main CTAs.",
    "interactive.primary.fill.hover": "Primary button on hover. Increased contrast for interactive state feedback.",
    "interactive.primary.fill.pressed": "Primary button on press/active. Maximum contrast shift to signal interaction.",
    "interactive.primary.text.default": "Text/icon on primary fills. Ensures contrast on primary background.",
    "interactive.primary.text.hover": "Primary text on hover state. Maintains contrast over hover fill.",
    "interactive.primary.text.pressed": "Primary text on pressed state. Maintains contrast over pressed fill.",
    "interactive.secondary.fill.default": "Medium-emphasis button background. Used for secondary actions and outline button fills.",
    "interactive.secondary.fill.hover": "Secondary button on hover. Provides visual feedback without primary emphasis.",
    "interactive.secondary.fill.pressed": "Secondary button on press/active. Completes state progression.",
    "interactive.secondary.text.default": "Text/icon on secondary fills. Contrast on secondary background.",
    "interactive.secondary.text.hover": "Secondary text on hover. Maintains readability on hover state.",
    "interactive.secondary.text.pressed": "Secondary text on pressed. Maintains readability on pressed state.",
    "interactive.secondary.border.default": "Border for secondary buttons. Defines button edge without fill.",
    "interactive.secondary.border.hover": "Secondary border on hover. Visual distinction for interactive state.",
    "interactive.secondary.border.pressed": "Secondary border on pressed. Completes feedback state progression.",
    "interactive.disabled.a": "Disabled button fill (type A). Low contrast to signal unavailability.",
    "interactive.disabled.b": "Disabled text/link (type B). Reduced contrast for disabled text content.",
    "interactive.disabled.c": "Disabled border (type C). Subtle border for disabled inputs/fields.",
    "interactive.link.primary.default": "Standalone primary link text. Used in prose and navigation. Brand colour.",
    "interactive.link.primary.hover": "Primary link on hover. Indicates interactive state for text links.",
    "interactive.link.primary.pressed": "Primary link on press/visited. Completes link state progression.",
    "interactive.link.secondary.default": "Standalone secondary link text. Lower emphasis than primary.",
    "interactive.link.secondary.hover": "Secondary link on hover. Visual feedback for secondary interactive state.",
    "interactive.link.secondary.pressed": "Secondary link on press. Completes secondary state progression.",
    "interactive.icon.default": "Icon colour for interactive elements. Used for icon buttons and interactive icons.",
    "interactive.icon.hover": "Icon colour on hover state. Provides visual feedback for icon interaction.",
    "interactive.icon.pressed": "Icon colour on pressed state. Signals active/selected icon state.",
    
    # Feedback
    "feedback.fill.error": "Error message background. Signals critical issue, validation failure, or danger.",
    "feedback.text.error": "Error message text. Ensures contrast on error fill background.",
    "feedback.border.error": "Error message border. Reinforces error intent with colour accent.",
    "feedback.fill.success": "Success message background. Signals positive completion or confirmation.",
    "feedback.text.success": "Success message text. Ensures contrast on success fill background.",
    "feedback.border.success": "Success message border. Reinforces success intent with colour accent.",
    "feedback.fill.warning": "Warning message background. Signals caution, blocked action, or attention need.",
    "feedback.text.warning": "Warning message text. Ensures contrast on warning fill background.",
    "feedback.border.warning": "Warning message border. Reinforces warning intent with colour accent.",
    "feedback.fill.info": "Info message background. Signals neutral information or helpful guidance.",
    "feedback.text.info": "Info message text. Ensures contrast on info fill background.",
    "feedback.border.info": "Info message border. Reinforces info intent with colour accent.",
    
    # Text
    "text.primary": "Main body text and headlines on canvas background. Darkest neutral.",
    "text.secondary": "Supporting text, captions, and metadata on canvas. Mid-tone neutral.",
    "text.inverse.primary": "Primary text on inverted backgrounds.",
    "text.inverse.secondary": "Supporting text on inverted backgrounds.",
    "text.on-accent.primary": "Text on saturated fills (brand/channel colours). Optimized for contrast.",
    "text.on-accent.secondary": "Secondary text on saturated fills. Reduced emphasis on coloured backgrounds.",
    
    # Surface
    "surface.canvas": "Primary background layer. Page/application base.",
    "surface.undercanvas": "Deepest background beneath canvas. Rarely visible; used for special contexts.",
    "surface.level-1": "First elevation above canvas. Subtle lift for cards and contained components.",
    "surface.level-2": "Second elevation. Modest lift for grouped content and secondary panels.",
    "surface.level-3": "Third elevation. Prominent lift for popovers and tertiary containers.",
    "surface.level-4": "Fourth elevation. Highest lift for modals, dropdowns, and overlays.",
    "surface.inverse": "Inverted background. Adapts per theme.",
    "surface.level-accent-low": "Low-emphasis accent background. Subtle tint using brand/channel colour.",
    "surface.level-accent-medium": "Medium-emphasis accent background. Moderate saturation for accents.",
    "surface.level-accent-high": "High-emphasis accent background. Strong saturation for featured content.",
    "surface.overlay": "Semi-transparent overlay. Used for modals, backdrop scrim, dimming.",
    
    # Border
    "border.primary": "Standard UI borders and dividers.",
    "border.secondary": "Subtle borders and light dividers.",
    "border.elevation": "Borders for elevated surfaces and cards. Defines depth and separation.",
    "border.inverse": "Borders on inverted backgrounds.",
    "border.on-accent.primary": "Borders on saturated/brand fills. Ensures contrast on coloured backgrounds.",
    "border.on-accent.secondary": "Secondary borders on saturated fills. Lower emphasis on coloured backgrounds.",
    
    # Input
    "input.fill.default": "Form input background at rest.",
    "input.fill.error": "Form input background with validation error. Uses error colour family.",
    "input.border.default": "Form input border at rest. Subtle neutral border defining field edge.",
    "input.border.error": "Form input border with validation error. Signals validation failure.",
    "input.text.default": "Text colour inside form inputs. Contrast on input fill.",
    "input.text.error": "Text colour in inputs with errors. Readable on error fill background.",
    
    # Tag
    "tag.filled.primary.fill": "Filled primary tag background. Brand colour for emphasis.",
    "tag.filled.primary.text": "Filled primary tag text. Optimized contrast on primary background.",
    "tag.filled.primary.border": "Filled primary tag border. Defines edge of filled tag.",
        "tag.filled.secondary.fill": "Background fill for a filled secondary tag. Lower emphasis alternative to primary filled tags.",
        "tag.filled.secondary.text": "Foreground text colour for a filled secondary tag. Ensures legibility against the secondary `fill`.",
        "tag.filled.secondary.border": "Border colour for a filled secondary tag. Defines the edge for secondary-filled tags when an outline is used.",
        "tag.filled.live.fill": "Background fill for a LIVE badge. High-emphasis filled tag used for urgent/breaking status indicators.",
        "tag.filled.live.text": "Foreground text colour for a LIVE filled badge. Ensures strong contrast and legibility on the live `fill`.",
        "tag.filled.live.border": "Border colour for a LIVE filled badge. Used to reinforce the badge edge when an outline is present.",
        "tag.inline.primary.text": "Text colour for a primary inline tag. Inline tags are rendered as plain text within the text flow and do not include their own container or background.",
        "tag.inline.secondary.text": "Text colour for a secondary inline tag. Lower emphasis inline label rendered without a background.",
        "tag.inline.live.text": "Text colour for an inline LIVE indicator. Inline LIVE tags are text-only urgency markers within prose or UI text.",
        "tag.channel": "Channel-specific tag colour. Used for tags that visually represent a content channel; apply as a `fill` for filled tags or as `text` for inline variants depending on context.",
    
    # Channel
    "channel.background": "Channel-specific background tint. Subtle accent on canvas per section.",
    "channel.text.primary": "Channel-specific primary text colour. Main text using channel accent.",
    "channel.text.secondary": "Channel-specific secondary text colour. Supporting text per section.",
    "channel.accent.subtle": "Channel-specific subtle accent highlight. Low emphasis brand tint.",
    "channel.icon.primary": "Channel-specific icon colour. Icons in channel-themed contexts.",
    "channel.interactive.primary.text.default": "Channel-specific interactive text (primary). Link colour per channel.",
    "channel.tag.highlight": "Channel-specific tag/badge colour. Labels and badges per section.",
}


def get_nested_value(obj: Dict[str, Any], path_parts: List[str]) -> Any:
    """Navigate nested dictionary using path parts."""
    current = obj
    for part in path_parts:
        if isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return None
    return current


def set_nested_value(obj: Dict[str, Any], path_parts: List[str], value: Any) -> bool:
    """Set nested dictionary value using path parts. Returns True if successful."""
    current = obj
    for part in path_parts[:-1]:
        if part not in current:
            current[part] = {}
        current = current[part]
    
    last_part = path_parts[-1]
    if isinstance(current, dict):
        current[last_part] = value
        return True
    return False


def sync_descriptions(tokens_path: Path, descriptions: Dict[str, str], dry_run: bool = False, target_theme: str = None) -> Tuple[int, int]:
    """
    Sync descriptions to tokens.json across all theme sets.
    
    Returns: (updated_count, skipped_count)
    """
    with open(tokens_path, 'r') as f:
        tokens = json.load(f)
    
    updated = 0
    skipped = 0
    
    # Identify all theme sets
    theme_sets = [key for key in tokens.keys() if key.startswith(('light', 'dark'))]
    
    if target_theme:
        theme_sets = [t for t in theme_sets if t == target_theme]
        if not theme_sets:
            print(f"Error: Theme '{target_theme}' not found")
            return 0, 0
    
    print(f"Found {len(theme_sets)} theme sets: {', '.join(theme_sets)}")
    
    for theme in theme_sets:
        print(f"\nProcessing {theme}...")
        
        for token_path, new_description in descriptions.items():
            path_parts = token_path.split('.')
            
            # Navigate to token in theme
            token_obj = get_nested_value(tokens[theme], path_parts)
            
            if token_obj is None:
                print(f"  ⊘ {token_path}: Not found in {theme}")
                skipped += 1
                continue
            
            if not isinstance(token_obj, dict) or 'description' not in token_obj:
                print(f"  ⊘ {token_path}: Missing description field")
                skipped += 1
                continue
            
            old_description = token_obj.get('description', '')
            if old_description == new_description:
                print(f"  ✓ {token_path}: Already up-to-date")
                updated += 1
                continue
            
            if dry_run:
                print(f"  → {token_path}")
                print(f"    OLD: {old_description}")
                print(f"    NEW: {new_description}")
            else:
                token_obj['description'] = new_description
                print(f"  ✓ {token_path}: Updated")
                updated += 1
    
    if not dry_run:
        with open(tokens_path, 'w') as f:
            json.dump(tokens, f, indent=2)
        print(f"\n✅ Synced {updated} descriptions across {len(theme_sets)} theme sets")
    else:
        print(f"\n📋 DRY RUN: Would sync {updated} descriptions")
    
    return updated, skipped


def main():
    """Main entry point."""
    dry_run = '--dry-run' in sys.argv
    target_theme = None
    
    if '--theme' in sys.argv:
        idx = sys.argv.index('--theme')
        if idx + 1 < len(sys.argv):
            target_theme = sys.argv[idx + 1]
    
    tokens_path = Path(__file__).parent.parent / 'src' / 'tokens.json'
    
    if not tokens_path.exists():
        print(f"Error: tokens.json not found at {tokens_path}")
        sys.exit(1)
    
    print(f"Syncing semantic colour descriptions to {tokens_path}")
    print(f"Total descriptions to sync: {len(DESCRIPTIONS)}")
    print(f"Mode: {'DRY RUN' if dry_run else 'UPDATE'}\n")
    
    updated, skipped = sync_descriptions(tokens_path, DESCRIPTIONS, dry_run=dry_run, target_theme=target_theme)
    
    print(f"\nSummary:")
    print(f"  Updated: {updated}")
    print(f"  Skipped: {skipped}")
    print(f"  Total: {updated + skipped}")


if __name__ == '__main__':
    main()
