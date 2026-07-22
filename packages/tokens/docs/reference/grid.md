# Grid System

> **⚠️ BETA STATUS**
>
> The app grid framework has been applied to the design system tokens. We want to work towards having the same grid for web and app. We need discussions and workshops with designers to establish this. This is why the grid is in BETA.

## Consumer Documentation

### Overview

The Design System uses a **viewport-responsive column grid** that automatically adapts to provide optimal content organization across all device sizes. The grid system creates visual rhythm, maintains consistency, and helps designers organize content into structured, accessible layouts.

**Key Benefits:**

- **Automatic adaptation** - One grid style adapts to all viewports
- **Consistent rhythm** - Predictable spacing creates visual harmony
- **Flexible layouts** - Support for full-width, centered, and complex multi-column designs
- **Accessibility first** - Grid maintains readability and touch-friendly spacing at all sizes

### Grid Anatomy

The grid consists of three key elements:

**Columns**
Vertical divisions that define content width and positioning. Column count adapts per viewport:

- **Small (Mobile)**: 4 columns - Essential content prioritization
- **Medium (Tablet)**: 12 columns - Balanced flexibility and simplicity
- **Large (Laptop/Desktop)**: 10 columns - Streamlined desktop layouts
- **XLarge (Wide Desktop)**: 12 columns - Maximum content width without complexity

**Gutters**
Horizontal space between columns that creates visual breathing room:

- **Small**: 24px - Comfortable mobile spacing
- **Medium/Large**: 32px - Generous desktop spacing
- **XLarge**: 24px - Refined wide desktop spacing

**Margins**
Space on the left and right edges of the viewport that frames content. Margins sit **outside** the usable content area, providing visual framing without reducing available layout width:

- **Small**: 20px - Comfortable mobile framing
- **Medium/Large**: 24px - Professional desktop framing
- **XLarge**: 20px - Clean wide desktop framing

**Content Area** (usable layout width, margins excluded):

- **Small**: 393px
- **Medium**: 768px
- **Large**: 1024px
- **XLarge**: 1144px

![Grid Anatomy Diagram - showing columns, gutters, and margins]

### When to Use the Grid

**✅ Use the grid for:**

- Page layouts and content organization
- Aligning multiple components horizontally
- Creating responsive multi-column designs (cards, lists, galleries)
- Establishing visual hierarchy through column spanning
- Editorial content with complex layouts (articles, features, marketing pages)

**⚠️ Don't use the grid for:**

- Component internal spacing (use spacing tokens)
- Vertical rhythm (use spacing tokens)
- Micro-alignments within components
- Pixel-perfect positioning (grid provides structure, not precision)

### Grid Principles

**1. Content First**

The grid serves content, not the other way around. Content should span natural column widths (e.g., 4 columns, 6 columns, 8 columns) rather than forcing arbitrary spans.

**2. Respect Breakpoints**

Grid column count changes at viewport boundaries. Designs must account for:

- **4 → 12 columns** (Small to Medium): Expand simple mobile layouts into richer tablet experiences
- **12 → 10 columns** (Medium to Large): Streamline layouts for focused desktop hierarchy
- **10 → 12 columns** (Large to XLarge): Expand to maximum flexibility on wide screens

**3. Maintain Rhythm**

Consistent gutter spacing creates visual rhythm. Avoid breaking the grid with custom gaps unless absolutely necessary for content requirements.

**4. Mobile-First Thinking**

Start designs at Small viewport (4 columns). This forces content prioritization and ensures accessibility. Then progressively enhance for larger screens.

### Common Grid Patterns

**Single Column (1 column span)**

- Article bodies, forms, narrow content
- Optimal reading width: 60-75 characters per line
- Best for: Text-heavy content, sequential flows

**Two Column (2 column span each)**

- Side-by-side comparisons, image + text pairings
- Medium: 6 columns each (of 12), Large: 5 columns each (of 10), XLarge: 6 columns each (of 12)
- Best for: Feature showcases, balanced layouts

**Three Column (varies)**

- Card grids, product showcases, feature lists
- Small: Stack vertically (4 columns each)
- Medium: 4 columns each (of 12), Large: 3 columns each (of 10), XLarge: 4 columns each (of 12)
- Best for: Browsing experiences, galleries

**Asymmetric Layouts**

- 8 columns (main content) + 4 columns (sidebar metadata)
- 6 columns (article) + 6 columns (related content)
- Best for: Editorial pages, documentation

**Full Width**

- Hero sections, banners, full-bleed imagery
- Spans all available columns
- Best for: Impact moments, immersive content

### Responsive Behavior

**Small Viewport (4 columns)**

```
[====  Content (4 col)  ====]
```

- Most content spans full 4 columns
- Stack elements vertically
- Prioritize essential content

**Medium Viewport (12 columns)**

```
[== Main (8 col) ==][= Side (4 col) =]
```

- Introduce multi-column layouts
- Balance between simplicity and complexity
- Common split: 8/4, 6/6, 4/4/4

**Large Viewport (10 columns)**

```
[=== Main (7 col) ===][== Side (3 col) ==]
```

- Streamlined grid for focused content hierarchy
- Wider content area with reduced complexity
- Common split: 7/3, 5/5, 3/3/4

**XLarge Viewport (12 columns)**

```
[=== Main (8 col) ===][== Side (4 col) ==]
```

- Maximum flexibility for wide desktop layouts
- Consistent column divisions with Medium viewport
- Common split: 8/4, 6/6, 4/4/4, 3/3/3/3

### Accessibility Considerations

**Touch Targets**
Grid gutters (24px-32px) provide sufficient spacing for touch-friendly interactions. Maintain minimum 44px × 44px touch targets for interactive elements.

**Reading Width**
Limit text content to 8 columns maximum (even on 12-column grids) to maintain comfortable reading line lengths (60-75 characters). On 10-column Large viewport, use 6-7 columns for optimal readability.

**Keyboard Navigation**
Grid layouts must maintain logical tab order. Multi-column layouts should flow naturally left-to-right, top-to-bottom.

**Screen Reader Experience**
Use semantic HTML with proper heading hierarchy. Grid is presentational - content order in markup matters more than visual positioning.

### Best Practices

**Do:**

- ✅ Align components to column edges for visual consistency
- ✅ Use full column spans (avoid 3.5 column spans)
- ✅ Test responsive behavior at all viewport sizes
- ✅ Let gutter spacing create natural breathing room
- ✅ Design mobile-first, then enhance for larger screens

**Don't:**

- ❌ Override gutter spacing with custom gaps
- ❌ Span odd column counts that break visual balance
- ❌ Use grid for component-internal spacing
- ❌ Forget margin spacing at viewport edges
- ❌ Force desktop layouts onto mobile screens

### Grid Examples in Action

**Article Page Layout**

```
Small:    [Article (4 col)]
Medium:   [Article (8 col)][Metadata (4 col)]
Large:    [Article (8 col)][Related (4 col)]
```

**Product Showcase**

```
Small:    [Product 1 (4 col)]
          [Product 2 (4 col)]
Medium:   [P1 (4 col)][P2 (4 col)][P3 (4 col)]
Large:    [P1 (3 col)][P2 (3 col)][P3 (3 col)][P4 (3 col)]
```

**Dashboard Layout**

```
Small:    [Widget 1 (4 col)]
          [Widget 2 (4 col)]
Medium:   [Widget 1 (6 col)][Widget 2 (6 col)]
Large:    [Nav (3 col)][W1 (4.5 col)][W2 (4.5 col)]
```

---

## Implementation Documentation

### System Architecture Overview

The Design System implements a **viewport-responsive grid system** unified under a single "DS Grid" style in Figma. Grid properties automatically adapt when designers switch viewport modes in the Appearance panel, eliminating the need for separate grid styles per breakpoint.

**Technical Principles:**

1. **Single grid style** - One "DS Grid" adapts to all viewports via variable binding
2. **Viewport-driven** - Column count, gutter, and margin update automatically when viewport mode changes
3. **Designer-friendly aliases** - Tokens named for clarity: `grid.count`, `grid.gutter`, `grid.margin`, `grid.templateWidth`
4. **Type: Stretch** - Column width is flexible; count/gutter/margin are controlled by variables

**Why This Architecture:**

- **Eliminates style sprawl** - No need for "Mobile Grid", "Tablet Grid", "Desktop Grid" styles
- **Automatic sync** - Change viewport mode → grid updates instantly
- **Single source of truth** - One set of grid tokens in Foundation layer
- **Designer efficiency** - No manual grid switching or style management

### Token Architecture

**Foundation Layer**

Foundation tokens define base grid properties without viewport specificity:

```json
"Foundation": {
  "grid.columns": {
    "small": { "value": "4", "type": "number" },
    "medium": { "value": "12", "type": "number" },
    "large": { "value": "12", "type": "number" },
    "xlarge": { "value": "12", "type": "number" }
  },
  "grid.gutter": {
    "small": { "value": "24", "type": "spacing" },
    "medium": { "value": "32", "type": "spacing" },
    "large": { "value": "32", "type": "spacing" },
    "xlarge": { "value": "24", "type": "spacing" }
  },
  "grid.margin": {
    "small": { "value": "20", "type": "spacing" },
    "medium": { "value": "24", "type": "spacing" },
    "large": { "value": "24", "type": "spacing" },
    "xlarge": { "value": "20", "type": "spacing" }
  }
}
```

**Viewport Layer**

Each viewport collection references Foundation tokens, enabling automatic updates:

```json
"Viewport/ Small": {
  "grid.count": { "value": "{grid.columns.small}" },    // → 4
  "grid.gutter": { "value": "{grid.gutter.small}" },    // → 24px
  "grid.margin": { "value": "{grid.margin.small}" }     // → 20px
},
"Viewport/ Medium": {
  "grid.count": { "value": "{grid.columns.medium}" },   // → 12
  "grid.gutter": { "value": "{grid.gutter.medium}" },   // → 32px
  "grid.margin": { "value": "{grid.margin.medium}" }    // → 24px
},
"Viewport/ Large": {
  "grid.count": { "value": "{grid.columns.large}" },    // → 10
  "grid.gutter": { "value": "{grid.gutter.large}" },    // → 32px
  "grid.margin": { "value": "{grid.margin.large}" }     // → 24px
},
"Viewport/ XLarge": {
  "grid.count": { "value": "{grid.columns.xlarge}" },   // → 12
  "grid.gutter": { "value": "{grid.gutter.xlarge}" },   // → 32px
  "grid.margin": { "value": "{grid.margin.xlarge}" }    // → 20px
}
```

**Designer-Friendly Aliases:**

- `grid.count` - Binds to Figma's Column Count control
- `grid.gutter` - Binds to Figma's Gutter control
- `grid.margin` - Binds to Figma's Margin control (sits outside content area)
- `grid.viewport` - Figma frame widths (433px, 816px, 1072px, 1440px)
- `grid.contentArea` - Usable layout width excluding margins (393px, 768px, 1024px, 1144px)
- `grid.maxWidth` - Code breakpoint thresholds (767px, 1023px, 1439px, 1920px)

### Figma Implementation

**DS Grid Style Configuration:**

```
Name: "DS Grid"
Type: Stretch (column width flexes; count/gutter/margin are fixed per viewport)
Count: 🔗 grid.count variable
Gutter: 🔗 grid.gutter variable
Margin: 🔗 grid.margin variable
Color: #E91E63 (Pink, 20% opacity)
```

**How It Works:**

1. Designer creates a frame
2. Applies "DS Grid" style (Layout grid panel)
3. Switches viewport mode in Appearance panel (Small/Medium/Large/XLarge)
4. Grid automatically updates: count, gutter, margin all change based on viewport mode
5. Column widths recalculate automatically (Stretch type behavior)

**Viewport Ranges:**

| Viewport | Range       | Use Case                    |
| :------- | :---------- | :-------------------------- |
| Small    | 0–767px     | Mobile devices              |
| Medium   | 768–1023px  | Tablets, phablets           |
| Large    | 1024–1439px | Laptops, desktops           |
| XLarge   | 1440px+     | Large desktop, wide screens |

**Grid Visibility Toggle:**

- **Show grid**: `Cmd/Ctrl + '` (useful when aligning content)
- **Hide grid**: Same shortcut (reduce visual clutter)
- **Grid color**: Pink (#E91E63) at 20% opacity for subtle guidance without overwhelming designs

**Viewport Figma scope rollout (Mar 2026):**

- Added `com.figma.scopes: ["GAP", "WIDTH_HEIGHT"]` to 24 viewport grid tokens across `viewport/ small`, `viewport/ medium`, `viewport/ large`, and `viewport/ xlarge`
- This improves variable picker suggestions for layout-gap and size-related grid controls

### Code Implementation

**CSS Output Pattern:**

```css
/* Mobile-first approach */
.container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding-inline: 20px;
}

/* Medium viewport */
@media (min-width: 768px) {
  .container {
    grid-template-columns: repeat(12, 1fr);
    gap: 32px;
    padding-inline: 24px;
  }
}

/* Large viewport */
@media (min-width: 1024px) {
  .container {
    grid-template-columns: repeat(10, 1fr);
  }
}

/* XLarge viewport */
@media (min-width: 1440px) {
  .container {
    grid-template-columns: repeat(12, 1fr);
  }
}
```

**CSS Grid Token Variables:**

```css
:root {
  /* Small (default) */
  --grid-columns: 4;
  --grid-gutter: 24px;
  --grid-margin: 20px;
}

@media (min-width: 768px) {
  :root {
    --grid-columns: 12;
    --grid-gutter: 32px;
    --grid-margin: 24px;
  }
}

@media (min-width: 1024px) {
  :root {
    --grid-columns: 10;
    /* gutter/margin unchanged */
  }
}

@media (min-width: 1440px) {
  :root {
    --grid-columns: 12;
    --grid-margin: 20px;
  }
}
```

**Max-Width Containers:**

```css
.content-container {
  max-width: var(--grid-content-max-width);
  margin-inline: auto;
}

/* Viewport-specific max-widths */
:root {
  --grid-content-max-width: 767px; /* Small (0–767px) */
}

/* Medium threshold */
@media (min-width: 768px) {
  :root {
    --grid-content-max-width: 1023px; /* Medium (768–1023px) */
  }
}

/* Large threshold */
@media (min-width: 1024px) {
  :root {
    --grid-content-max-width: 1439px; /* Large (1024–1439px) */
  }
}

/* XLarge threshold */
@media (min-width: 1440px) {
  :root {
    --grid-content-max-width: 1920px; /* XLarge (1440px+) */
  }
}
```

### Column Count Rationale

**Why 4 columns on Small?**

- **Simplicity**: Forces content prioritization on mobile
- **Divisibility**: 4 divides evenly into 2, 4 (common mobile layouts)
- **Performance**: Fewer columns = faster rendering on mobile devices
- **Touch-friendly**: Wider columns = easier tap targets

**Why 12 columns on Medium?**

- **Flexibility**: 12 divides evenly into 2, 3, 4, 6, 12 (maximum layout options)
- **Industry standard**: Most responsive frameworks use 12-column grids
- **Balanced complexity**: Not too simple (8 columns), not too complex (16 columns)

**Why 10 columns on Large?**

- **Streamlined hierarchy**: Reduces complexity for focused desktop layouts
- **Divisibility**: 10 divides evenly into 2, 5, 10 (balanced layout options)
- **Content focus**: Encourages simpler, more readable desktop experiences
- **Progressive enhancement**: Natural progression from 12 (Medium) to 10 (Large) to 12 (XLarge)

**Why 12 columns on XLarge?**

- **Maximum flexibility**: 12 divides evenly into 2, 3, 4, 6, 12 (optimal for wide screens)
- **Industry standard**: Consistent with Medium viewport for familiar patterns
- **Complex layouts**: Wide screens can handle richer content hierarchies
- **Consistency**: Matches Medium viewport grid structure for scalable design systems

### Testing & Validation

**Design Validation Checklist:**

- [ ] Frame has "DS Grid" style applied
- [ ] Grid columns match viewport mode (Small: 4, Medium: 12, Large: 10, XLarge: 12)
- [ ] Content aligns to column edges (not floating between columns)
- [ ] Gutter spacing feels consistent (no custom gaps)
- [ ] Margins present at viewport edges (content not flush)
- [ ] Test all viewport modes (Small → Medium → Large → XLarge)
- [ ] Responsive behavior makes sense (content doesn't break)

**Code Validation:**

```javascript
// Test grid token values match specification
expect(getComputedStyle(root).getPropertyValue('--grid-columns')).toBe('4'); // Small
expect(getComputedStyle(root).getPropertyValue('--grid-gutter')).toBe('24px');

// Medium breakpoint
window.resizeTo(768, 1024);
expect(getComputedStyle(root).getPropertyValue('--grid-columns')).toBe('12');

// Large breakpoint
window.resizeTo(1024, 768);
expect(getComputedStyle(root).getPropertyValue('--grid-columns')).toBe('10');

// XLarge breakpoint
window.resizeTo(1440, 900);
expect(getComputedStyle(root).getPropertyValue('--grid-columns')).toBe('12');
```

### Common Implementation Issues

**Issue: Grid columns don't match Figma**

- ✅ Solution: Verify viewport mode is set correctly in Figma
- ✅ Solution: Check "DS Grid" style is applied (not custom grid)

**Issue: Content breaks between viewports**

- ✅ Solution: Test all breakpoint boundaries (392px, 767px, 1023px, 1439px)
- ✅ Solution: Use full column spans (avoid fractional columns)

**Issue: Gutters feel too tight/loose**

- ❌ Don't: Override gutter values with custom spacing
- ✅ Do: Use spacing tokens for component-internal spacing
- ✅ Do: Trust grid gutter values (tested for visual balance)

**Issue: Grid doesn't appear in Figma**

- ✅ Solution: Press `Cmd/Ctrl + '` to toggle grid visibility
- ✅ Solution: Check Layout grid panel has "DS Grid" applied

### Maintenance & Updates

**When to Update Grid Tokens:**

1. **User research findings**: If testing reveals usability issues with column counts
2. **Device landscape changes**: New device sizes become dominant (e.g., foldables)
3. **Content requirements**: Editorial needs demand different layouts
4. **Accessibility improvements**: Spacing requirements change (touch target sizes)

**How to Update:**

1. Update Foundation layer tokens in `tokens.json`
2. Viewport collections auto-reference Foundation (no manual updates needed)
3. Re-export to Figma via Token Studio
4. Update CSS build pipeline with new token values
5. Document changes in design system changelog
6. Communicate to team with migration guide if breaking changes

**Version Control:**

```
Grid Token Schema v1.1
- Updated column structure: Small(4), Medium(12), Large(10), XLarge(12)
- Streamlined Large viewport from 12 to 10 columns for focused hierarchy
- Gutter: 24px mobile, 32px desktop
- Margin: 20px mobile, 24px desktop

Grid Token Schema v1.0 (deprecated)
- Initial implementation (4/12/12/12 columns)
- Lacked distinction between Large and XLarge viewports
```
