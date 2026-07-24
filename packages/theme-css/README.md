# @ds/theme-css

Design System CSS theme package with 2,748+ pre-compiled CSS custom properties (variables) for building themed applications.

## Installation

```bash
npm install @ds/theme-css
```

## Usage

### Link CSS File

```html
<!-- Via CDN or npm node_modules -->
<link
  rel="stylesheet"
  href="node_modules/@ds/theme-css/variables.css"
/>
```

### Use CSS Variables in Your Stylesheet

```css
/* Color tokens */
body {
  background-color: var(--ds-surface-canvas);
  color: var(--ds-text-primary);
}

/* Spacing tokens */
.component {
  padding: var(--ds-spacing-100);
  margin: var(--ds-spacing-050);
  gap: var(--ds-spacing-200);
}

/* Typography */
h1 {
  font-size: var(--ds-font-size-100);
  line-height: var(--ds-line-height-heading);
  letter-spacing: var(--ds-letter-spacing-tight);
}

/* Dark mode with light-dark() */
.card {
  background: light-dark(
    var(--ds-surface-level-1),
    var(--ds-surface-level-1-dark)
  );
  border-color: light-dark(
    var(--ds-border-primary),
    var(--ds-border-primary-dark)
  );
}

/* Shadows/Elevation */
.elevated {
  box-shadow: var(--ds-elevation-100);
}
```

### Import in JavaScript

```javascript
// If bundling CSS
import '@ds/theme-css/variables.css';

// Then use in JS
const element = document.querySelector('.component');
const spacing = getComputedStyle(element).getPropertyValue('--ds-spacing-100');
```

## Package Contents

```
dist/
└── variables.css         # 2,748+ CSS custom properties
```

## Available Token Categories

### Color Tokens

All semantic and brand colors:

```css
/* Semantic colors */
--ds-text-primary
--ds-text-secondary
--ds-text-tertiary
--ds-surface-canvas
--ds-surface-level-1
--ds-surface-level-2
--ds-border-primary
--ds-border-secondary

/* Brand tier colours (e.g.) */
--ds-primary
--ds-secondary
--ds-tertiary
--ds-chart-1
```

### Spacing Tokens

```css
--ds-spacing-025    /* 0.25rem */
--ds-spacing-050    /* 0.5rem */
--ds-spacing-100    /* 1rem */
--ds-spacing-200    /* 1.5rem */
--ds-spacing-300    /* 2rem */
--ds-spacing-400    /* 2.5rem */
```

### Typography Tokens

```css
--ds-font-size-025  /* 0.75rem */
--ds-font-size-050  /* 1rem */
--ds-font-size-100  /* 2.25rem */
--ds-font-family-sans
--ds-font-family-serif
--ds-font-weight-regular  /* 400 */
--ds-font-weight-bold     /* 700 */
--ds-line-height-tight
--ds-line-height-normal
--ds-letter-spacing-tight
```

### Other Tokens

```css
--ds-radius-100      /* Border radius */
--ds-radius-200
--ds-elevation-100   /* Box shadows */
--ds-elevation-200
--ds-transition-normal
--ds-transition-smooth
```

## Dark Mode

All tokens support light and dark variants through CSS variable naming. Use with `light-dark()` for automatic switching:

```css
:root {
  color-scheme: light dark;
}

body {
  color: light-dark(var(--ds-text-primary), var(--ds-text-primary-dark));
  background: light-dark(
    var(--ds-surface-canvas),
    var(--ds-surface-canvas-dark)
  );
}

@media (prefers-color-scheme: dark) {
  :root {
    --ds-text-primary: #ffffff;
    --ds-surface-canvas: #000000;
    /* ... */
  }
}
```

## Browser Support

- **Modern browsers**: Full support with `light-dark()` and CSS custom properties
- **All other modern browsers (Chrome, Firefox, Safari, Edge)**: CSS custom properties supported
- **Fallback**: Provide fallback values for older browsers

```css
.component {
  /* Fallback for older browsers */
  padding: 1rem;
  /* Override if CSS variables supported */
  padding: var(--ds-spacing-100, 1rem);
}
```

## File Size

- **variables.css**: ~314KB (uncompressed)
- **variables.css (gzipped)**: ~20KB
- **CSS custom properties**: 2,748+

## Compatibility

- **Node**: ≥ 14.0.0
- **Browsers**: All modern browsers (IE not supported, use fallbacks)
- **CSS**: CSS Custom Properties Level 1

## Building

To rebuild the package after modifying tokens:

```bash
npm run build
```

## License

ISC
