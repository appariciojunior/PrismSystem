"""
Token Description Update Script
Applies all approved description changes to packages/tokens/src/tokens.json.
Run from repo root: python3 scripts/update-token-descriptions.py
"""
import json
import sys
import os

TOKEN_FILE = 'packages/tokens/src/tokens.json'

if not os.path.exists(TOKEN_FILE):
    sys.exit(f"ERROR: {TOKEN_FILE} not found. Run from repo root.")

print(f"Loading {TOKEN_FILE}...")
with open(TOKEN_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)
print("  OK")

# ─────────────────────────────────────────────
# A. Foundation shadows — replace 12 descriptions
# ─────────────────────────────────────────────
print("A. Foundation shadows...")
fd = data['foundation']
fd['down']['shadow010']['description'] = "Minimum downward shadow. Cards at rest and active buttons."
fd['down']['shadow020']['description'] = "Compact downward shadow for badges."
fd['down']['shadow030']['description'] = "Moderate downward shadow for sticky navigation."
fd['down']['shadow040']['description'] = "Deeper downward shadow for card and button hover."
fd['down']['shadow050']['description'] = "Deep downward shadow for pickers and popovers."
fd['down']['shadow060']['description'] = "Maximum downward shadow for modals and dialogs."
fd['up']['shadow010']['description'] = "Minimum upward shadow. Anchored elements at rest."
fd['up']['shadow020']['description'] = "Compact upward shadow for badges."
fd['up']['shadow030']['description'] = "Moderate upward shadow for bottom navigation."
fd['up']['shadow040']['description'] = "Deeper upward shadow for interactive hover feedback."
fd['up']['shadow050']['description'] = "Deep upward shadow for bottom sheets."
fd['up']['shadow060']['description'] = "Maximum upward shadow for bottom modals."
print("  OK")

# ─────────────────────────────────────────────
# B. shadows.shadow.elevation — add 6 descriptions
# ─────────────────────────────────────────────
print("B. shadows.shadow.elevation...")
se = data['shadows']['shadow']['elevation']
se['down']['level-2']['description'] = "Downward shadow for Level 2 surfaces. Pairs with surface.level-2."
se['down']['level-3']['description'] = "Downward shadow for Level 3 surfaces. Pairs with surface.level-3."
se['down']['level-4']['description'] = "Downward shadow for Level 4 surfaces. Pair with surface.overlay."
se['up']['level-2']['description'] = "Upward shadow for Level 2 surfaces. For anchored bottom elements."
se['up']['level-3']['description'] = "Upward shadow for Level 3 surfaces. For bottom sheets and drawers."
se['up']['level-4']['description'] = "Upward shadow for Level 4 surfaces. Pair with surface.overlay."
print("  OK")

# ─────────────────────────────────────────────
# C. light/ core — surface tokens: replace 8 descriptions
# ─────────────────────────────────────────────
print("C. surface tokens...")
lc = data['light/ core']
lc['surface']['undercanvas']['description'] = "Level -1. Deepest background, beneath canvas. Fill only."
lc['surface']['canvas']['description']      = "Level 0. Page base. Fill only."
lc['surface']['level-1']['description']     = "Level 1. Pair with border.elevation for edge definition."
lc['surface']['level-2']['description']     = "Level 2. Pair with shadow.elevation.level-2."
lc['surface']['level-3']['description']     = "Level 3. Pair with shadow.elevation.level-3."
lc['surface']['level-4']['description']     = "Level 4. Pair with shadow.elevation.level-4 and surface.overlay."
lc['surface']['inverse']['description']     = "Fixed dark surface in light mode. Does not respond to dark mode."
lc['surface']['overlay']['description']     = "Scrim for modals and Level 4 surfaces. Semi-transparent."
print("  OK")

# ─────────────────────────────────────────────
# D. border.elevation — replace 1 description
# ─────────────────────────────────────────────
print("D. border.elevation...")
lc['border']['elevation']['description'] = "Edge definition for Level 1 surfaces. Use instead of shadow at the lowest elevation."
print("  OK")

# ─────────────────────────────────────────────
# E. Terminology fixes — American "color" → British "colour"; wrong hierarchy labels
# ─────────────────────────────────────────────
print("E. Terminology fixes...")
lc['text']['tertiary']['description']          = "Tertiary text for supporting captions and disabled states."
lc['icon']['tertiary']['description']          = "Tertiary icon colour for least-prominent iconography."
lc['text']['channel']['primary']['description']   = "Primary channel-specific text colour."
lc['text']['channel']['secondary']['description'] = "Secondary channel-specific text colour."
lc['icon']['channel']['primary']['description']   = "Primary channel-specific icon colour."
lc['icon']['channel']['secondary']['description'] = "Secondary channel-specific icon colour."
lc['border']['channel']['primary']['description']   = "Primary channel-specific border colour."
lc['border']['channel']['secondary']['description'] = "Secondary channel-specific border colour."
lc['border']['channel']['tertiary']['description']  = "Tertiary channel-specific border colour."
lc['surface']['static']['dark']['description']  = "Fixed dark surface. Always black regardless of mode."
lc['surface']['static']['light']['description'] = "Fixed light surface. Always white regardless of mode."
lc['text']['static']['dark']['description']  = "Fixed dark text. Always black regardless of mode."
lc['text']['static']['light']['description'] = "Fixed light text. Always white regardless of mode."
lc['border']['static']['dark']['description']  = "Fixed dark border. Always black regardless of mode."
lc['border']['static']['light']['description'] = "Fixed light border. Always white regardless of mode."
print("  OK")

# ─────────────────────────────────────────────
# F. Toast — add 24 descriptions
# ─────────────────────────────────────────────
print("F. Toast tokens...")
toast = lc['toast']
toast['fill']['info']['description']    = "Info toast background."
toast['fill']['success']['description'] = "Success toast background."
toast['fill']['warning']['description'] = "Warning toast background."
toast['fill']['error']['description']   = "Error toast background."
toast['icon']['info']['description']    = "Icon on info toast."
toast['icon']['success']['description'] = "Icon on success toast."
toast['icon']['warning']['description'] = "Icon on warning toast."
toast['icon']['error']['description']   = "Icon on error toast."
toast['text']['info']['description']    = "Text on info toast."
toast['text']['success']['description'] = "Text on success toast."
toast['text']['warning']['description'] = "Text on warning toast."
toast['text']['error']['description']   = "Text on error toast."
for variant in ['info', 'success', 'error', 'warning']:
    toast['link'][variant]['default']['description'] = f"Link on {variant} toast, default state."
    toast['link'][variant]['hover']['description']   = f"Link on {variant} toast, hover state."
    toast['link'][variant]['pressed']['description'] = f"Link on {variant} toast, pressed state."
print("  OK")

# ─────────────────────────────────────────────
# G. Tooltip — add 3 descriptions
# ─────────────────────────────────────────────
print("G. Tooltip tokens...")
tooltip = lc['tooltip']
tooltip['fill']['description'] = "Tooltip background. Always uses inverse surface."
tooltip['text']['description'] = "Tooltip text. Always uses inverse text colour."
tooltip['icon']['description'] = "Tooltip icon. Always uses inverse icon colour."
print("  OK")

# ─────────────────────────────────────────────
# H. Brand fluid headings — append HTML hints to 28 existing descriptions
# ─────────────────────────────────────────────
print("H. Brand fluid headings...")
tt = data['typographyTokens']

FLUID_HTML = {
    '2xsmall': 'Typically h5, h6.',
    'xsmall':  'Typically h4, h5.',
    'small':   'Typically h3, h4.',
    'medium':  'Typically h2, h3.',
    'large':   'Typically h1, h2.',
    'xlarge':  'Typically h1.',
    '2xlarge': 'Typically h1.',
}

for weight in ['light', 'regular', 'bold', 'black']:
    for size, html_hint in FLUID_HTML.items():
        token = tt['brand']['heading']['fluid'][weight][size]
        existing = token.get('description', '').rstrip()
        if html_hint not in existing:
            # Strip trailing period from existing desc then append hint
            base = existing.rstrip('.')
            token['description'] = f"{base}. {html_hint}" if base else html_hint
print("  OK")

# ─────────────────────────────────────────────
# I. Brand static headings — add 40 descriptions
# ─────────────────────────────────────────────
print("I. Brand static headings...")

STATIC_SIZES = {
    '010': ('19px', 'h5, h6'),
    '020': ('20px', 'h5, h6'),
    '030': ('24px', 'h4, h5'),
    '040': ('28px', 'h4'),
    '050': ('32px', 'h3, h4'),
    '060': ('36px', 'h3'),
    '070': ('40px', 'h2, h3'),
    '080': ('46px', 'h2'),
    '090': ('48px', 'h1, h2'),
    '100': ('56px', 'h1'),
}

WEIGHT_LABELS = {
    'light':   'light-weight',
    'regular': 'regular-weight',
    'bold':    'bold-weight',
    'black':   'black-weight',
}

for weight in ['light', 'regular', 'bold', 'black']:
    for size, (px, html) in STATIC_SIZES.items():
        token = tt['brand']['heading']['static'][weight][size]
        token['description'] = f"Fixed {WEIGHT_LABELS[weight]} editorial heading at {px}. Typically {html}."
print("  OK")

# ─────────────────────────────────────────────
# J. Brand display — add 40 descriptions
# ─────────────────────────────────────────────
print("J. Brand display...")

DISPLAY_SIZES = {
    '010': '68px',
    '020': '94px',
    '030': '120px',
    '040': '145px',
    '050': '171px',
    '060': '197px',
    '070': '223px',
    '080': '248px',
    '090': '274px',
    '100': '300px',
}

for weight in ['light', 'regular', 'bold', 'black']:
    for size, px in DISPLAY_SIZES.items():
        token = tt['brand']['display'][weight][size]
        token['description'] = f"Fixed {WEIGHT_LABELS[weight]} display type at {px}. Decorative brand use only. Use p or span."
print("  OK")

# ─────────────────────────────────────────────
# K. Brand subheading — add 12 descriptions (3 weights × 4 sizes)
# ─────────────────────────────────────────────
print("K. Brand subheading...")

SUBHEAD_SIZES = {
    'small':  ('h5, h6', 'small'),
    'medium': ('h4',     'mid size'),
    'large':  ('h3, h4', 'prominent'),
    'xlarge': ('h3',     'large'),
}

for weight in ['light', 'regular', 'bold']:
    for size, (html, qualifier) in SUBHEAD_SIZES.items():
        token = tt['brand']['subheading'][weight][size]
        w_label = WEIGHT_LABELS[weight].capitalize()
        if qualifier == 'small':
            token['description'] = f"{w_label} editorial subheading. Typically {html}."
        else:
            token['description'] = f"{w_label} editorial subheading, {qualifier}. Typically {html}."
print("  OK")

# ─────────────────────────────────────────────
# L. Brand standfirst — add 2 descriptions
# ─────────────────────────────────────────────
print("L. Brand standfirst...")
tt['brand']['standfirst']['large']['description']  = "Article intro paragraph, large. Use p."
tt['brand']['standfirst']['medium']['description'] = "Article intro paragraph, standard. Use p."
print("  OK")

# ─────────────────────────────────────────────
# M. Brand paragraph — add 4 descriptions
# ─────────────────────────────────────────────
print("M. Brand paragraph...")
tt['brand']['paragraph']['regular']['small']['description']  = "Regular-weight body paragraph, small. Use p."
tt['brand']['paragraph']['regular']['medium']['description'] = "Regular-weight body paragraph, standard. Use p."
tt['brand']['paragraph']['bold']['small']['description']     = "Bold-weight body paragraph, small. Use p."
tt['brand']['paragraph']['bold']['medium']['description']    = "Bold-weight body paragraph, standard. Use p."
print("  OK")

# ─────────────────────────────────────────────
# N. Brand caption — add 1 description
# ─────────────────────────────────────────────
print("N. Brand caption...")
tt['brand']['caption']['description'] = "Image or media caption. Use figcaption or span."
print("  OK")

# ─────────────────────────────────────────────
# O. Brand byline — add 2 descriptions
# ─────────────────────────────────────────────
print("O. Brand byline...")
tt['brand']['byline']['medium']['description'] = "Author attribution, standard size. Use span or p."
tt['brand']['byline']['small']['description']  = "Author attribution, compact. Use span or p."
print("  OK")

# ─────────────────────────────────────────────
# P. Utility heading — replace 3 descriptions (add HTML hints, trim verbosity)
# ─────────────────────────────────────────────
print("P. Utility heading...")
tt['utility']['heading']['small']['description']  = "Compact utility heading for mobile navigation. Typically h4, h5."
tt['utility']['heading']['medium']['description'] = "Standard utility heading for card titles. Typically h3, h4."
tt['utility']['heading']['large']['description']  = "Prominent utility heading for page sections. Typically h2, h3."
print("  OK")

# ─────────────────────────────────────────────
# Q. Utility subheading — add 4 descriptions
# ─────────────────────────────────────────────
print("Q. Utility subheading...")
tt['utility']['subheading']['xsmall']['description'] = "Micro utility subheading. Typically h6 or span."
tt['utility']['subheading']['small']['description']  = "Small utility subheading. Typically h5, h6."
tt['utility']['subheading']['medium']['description'] = "Standard utility subheading. Typically h4, h5."
tt['utility']['subheading']['large']['description']  = "Prominent utility subheading. Typically h4."
print("  OK")

# ─────────────────────────────────────────────
# R. Utility body — add 10 descriptions
# ─────────────────────────────────────────────
print("R. Utility body...")
BODY_SIZES = {
    '2xsmall': ('Minimum-size', 'p or span'),
    'xsmall':  ('Compact', 'p or span'),
    'small':   ('Small', 'p or span'),
    'medium':  ('Standard', 'p'),
    'large':   ('Large', 'p'),
}
for weight in ['regular', 'bold']:
    for size, (prefix, elem) in BODY_SIZES.items():
        token = tt['utility']['body'][weight][size]
        token['description'] = f"{prefix} {weight} body. Use {elem}."
print("  OK")

# ─────────────────────────────────────────────
# S. Utility button — replace 4 descriptions (add HTML hints)
# ─────────────────────────────────────────────
print("S. Utility button...")
tt['utility']['button']['xsmall']['description'] = "Compact button text for space-constrained UI. Use span inside button."
tt['utility']['button']['small']['description']  = "Standard button text for secondary and mobile actions. Use span inside button."
tt['utility']['button']['medium']['description'] = "Primary button text for desktop CTAs. Use span inside button."
tt['utility']['button']['large']['description']  = "Prominent button text for hero CTAs. Use span inside button."
print("  OK")

# ─────────────────────────────────────────────
# T. Utility label — replace 4 descriptions (add HTML hints)
# ─────────────────────────────────────────────
print("T. Utility label...")
tt['utility']['label']['xsmall']['description'] = "Micro label for badges and tags. Use label or span."
tt['utility']['label']['small']['description']  = "Standard label for form fields and captions. Use label or span."
tt['utility']['label']['medium']['description'] = "Prominent form label and card section heading. Use label or span."
tt['utility']['label']['large']['description']  = "Large label for emphasised metadata. Use label or span."
print("  OK")

# ─────────────────────────────────────────────
# U. Utility linkInline — replace/add descriptions with HTML hints
# ─────────────────────────────────────────────
print("U. linkInline...")
LINKINLINE_DESCS = {
    'xsmall': "Inline links within footnotes and compact navigation. Use a inside p.",
    'small':  "Inline links within body text. Use a inside p.",
    'medium': "Inline links within primary content. Use a inside p.",
    'large':  "Large inline links for callouts. Use a inside p.",
}
for variant in ['utility', 'brand']:
    for size, desc in LINKINLINE_DESCS.items():
        tt['utility']['linkInline'][variant][size]['description'] = desc
print("  OK")

# ─────────────────────────────────────────────
# V. Utility linkStandalone — fix "Inline" label error + add HTML hints
# ─────────────────────────────────────────────
print("V. linkStandalone...")
LINKSTANDALONE_DESCS = {
    'xsmall': "Compact standalone link for tight navigation. Use a outside paragraph flow.",
    'small':  "Standard standalone link for navigation and secondary actions. Use a.",
    'medium': "Primary standalone link for navigation. Use a.",
    'large':  "Large standalone link for hero callouts. Use a.",
}
for variant in ['utility', 'brand']:
    for size, desc in LINKSTANDALONE_DESCS.items():
        tt['utility']['linkStandalone'][variant][size]['description'] = desc
print("  OK")

# ─────────────────────────────────────────────
# Write back
# ─────────────────────────────────────────────
print("Writing updated tokens.json...")
with open(TOKEN_FILE, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    f.write('\n')

print("  DONE")
print("\nAll description updates applied successfully.")
