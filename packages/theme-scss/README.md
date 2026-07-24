# @ds/theme-scss

Design System SCSS theme package with pre-compiled palette files and utility functions for designing themed SCSS applications. Pending review

## Installation

```bash
npm install @ds/theme-scss
```

## Usage

### Import SCSS Files

```scss
// Import typography utilities
@import '@ds/theme-scss/ds-typography.scss';

// Import layout utilities
@import '@ds/theme-scss/ds-layout.scss';

// Import a specific palette
@import '@ds/theme-scss/palettes/light-palette.scss';
@import '@ds/theme-scss/palettes/dark-palette.scss';
```

### Using Design Tokens in SCSS

```scss
// Access color variables
body {
  background-color: $ds-surface-canvas;
  color: $ds-text-primary;
}

// Use typography utilities
h1 {
  @include ds-heading-large;
  margin-bottom: $ds-spacing-200;
}

// Use spacing tokens
.component {
  padding: $ds-spacing-100;
  margin: $ds-spacing-050;
  border-radius: $ds-radius-100;
}
```

### Palette Files

All channel and brand palettes are included:

```
dist/palettes/
├── light-palette.scss          # Light mode palette
├── dark-palette.scss           # Dark mode palette
├── light-brand-colors.scss     # Light brand colors
├── dark-brand-colors.scss      # Dark brand colors
├── light-channels.scss         # Light channel colors
├── dark-channels.scss          # Dark channel colors
└── ... (20+ additional palettes)
```

## Package Contents

```
dist/
├── ds-layout.scss             # Layout and grid utilities
├── ds-typography.scss         # Typography mixins and utilities
├── variables.css               # CSS custom properties (compatible)
└── palettes/                   # SCSS palette files
    ├── light-*.scss
    ├── dark-*.scss
    └── foundation-*.scss
```

## Available Tokens

### Color Tokens

All tokens follow a consistent naming pattern:

```scss
// Semantic colors (light mode)
$ds-text-primary
$ds-text-secondary
$ds-text-tertiary
$ds-surface-canvas
$ds-surface-level-1
$ds-border-primary

// Brand colors
$ds-brand-home-500
$ds-brand-business-500
$ds-brand-sport-500
// ... and more channels

// Dark mode variants
// Use the palette files or CSS custom properties with light-dark()
```

### Spacing Tokens

```scss
$ds-spacing-025    // 0.25rem
$ds-spacing-050    // 0.5rem
$ds-spacing-100    // 1rem
$ds-spacing-200    // 1.5rem
// ... scales up to $ds-spacing-400
```

### Typography

```scss
// Use typography mixins
@include ds-heading-large;
@include ds-body-standard;
@include ds-label-small;
```

## Dark Mode Support

The package includes dedicated dark mode palettes. Use CSS custom properties with `light-dark()` for best results:

```scss
color: light-dark($ds-text-primary, $ds-text-primary-dark);
background: light-dark($ds-surface-canvas, $ds-surface-canvas-dark);
```

## Compatibility

- **Sass/SCSS**: ≥ 1.3.0
- **Node**: ≥ 14.0.0
- **Browsers**: All modern browsers supporting CSS custom properties

## Building

To rebuild the package after modifying tokens:

```bash
npm run build
```

This will compile SCSS files with deduplication and asset distribution.

## License

ISC
