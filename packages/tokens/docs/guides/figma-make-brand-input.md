# Design System Brand Input for Figma Make

**Brand Alignment:**
**Brand Guidelines:**

**Colour Palette & Themes:**

Primary Brand Colors (4 core colors):

- **Digital Blue** (#005C8A) - Primary interactive color for all buttons, links, and interactive elements. Has full ramp (100-1000) with lightened/darkened variations
- **Digital Cream** (#F4F2E8) - Used exclusively for surface.undercanvas (deepest background layer) in Core theme and any theme without undercanvas override. Has full ramp (100-1000)
- **White** (#ffffff) - Developed into neutral ramp as neutral.100, used for surface backgrounds, cards, and light UI elements
- **Black** (#000000) - Developed into neutral ramp as neutral.1000, used for primary text and dark UI elements

Supporting Color Systems:

- Neutral Scale (White to Black): Full 10-step ramp from neutral.100 (white) through mid greys to neutral.1000 (black). Used for text, borders, surfaces, and all general UI
- Messaging Colors: Info (#0F4AA2), Error (#ff0000), Warning (#ffa300), Success (#31A46F) - each with full ramps for backgrounds, text, and borders

Theme System:
**Core Theme (Default)** - Use when NO specific theme is assigned:

- Context: Non-editorial experiences (utility, wayfinding, account areas, settings, authentication, general UI)
- Primary Interactive: Digital Blue (#005C8A)
- Accent: Neutral palette with blue highlights
- This is the fallback theme for all non-content pages

**Typography:**

- **Inter** - Headlines (responsive sizes: 2xlarge, large, medium, small)
- **Inter** - Article body text (Regular and Bold weights, Small/Medium sizes)
- **Inter** - UI elements, navigation, captions, bylines (sizes: 18px, 16px, 14px, 12px)
- Line Heights: 100%, 112.5%, 125%, 150%, 175%, 200%

**Spacing:**

- Scale: 2px, 4px, 8px, 12px, 16px, 20px, 32px, 40px, 60px (scales up on larger screens)
- Common: Card padding (16px), Section spacing (32px), Element spacing (8px)

**Layout:**

- Breakpoints: Small (0–767px), Medium (768–1023px), Large (1024–1439px), XLarge (1440px+)
- Responsive Scaling: Small (1.0x base), Medium (1.5x), Large (2.0x), XLarge (2.5x) - spacing and typography scale up automatically
- Grid: 4 columns (Small), 12 columns (Medium/Large/XLarge) with 24px gutters (Small) or 32px gutters (Medium+)

**Components:**

- Primary Button: Digital Blue (#005C8A) fill, white text, 44px height, 8px padding
- Secondary Button: White fill, dark grey (#4d4d4d) text and border, 44px height
- Cards: White background, light grey (#d9d9d9) border, 16px padding
- Input Fields: White background, mid grey (#999999) border, 44px height, red border on error

**Shadows:**

- 6 levels available, from subtle (0 0.5px 2px) to prominent (0 20px 32px)
- Use for cards, overlays, and creating depth hierarchy

**Elevation:**

- Level 1: Flat cards with light grey (#d9d9d9) border, no shadow
- Level 2: Interactive cards with subtle shadow (2px blur)
- Level 3: Sticky headers/footers with medium shadow (4px blur)
- Level 4: Modals/dropdowns with dark backdrop (rgba(0,0,0,0.45)) and prominent shadow (8px blur)

**Data Visualization:**
**Categorical Colors** (pie charts, bar charts):
Dark Blue (#254251), Yellow (#e0ab26), Light Blue (#75B2DD), Orange (#f37f2f), Teal (#3292a6), Purple (#6c3c5e), Brown (#96807a) - each with 10 lightness variations

**Sequential Colors** (heat maps, intensity charts):
Green (#2aa818) to Red (#af1722) gradient with 10 steps

**Political Party Colors** (election coverage only):
UK: Conservative (blue), Labour (red), Lib Dems (yellow), SNP (yellow), Green (green)
US: Democratic (blue), Republican (red)

Note: Never use data visualization colors for buttons, links, or standard UI elements

**Accessibility:**

- All buttons and interactive elements: 44px minimum height
- Text contrast: 4.5:1 minimum (WCAG AA)
- Focus outlines: Dark grey (#4d4d4d) border (2px width, 2px offset) for keyboard navigation
