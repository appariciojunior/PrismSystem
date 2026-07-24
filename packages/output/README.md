# @ds/output

Design System theme configuration package providing JSON theme files and utilities.

## Installation

```bash
npm install @times/theme
```

## Usage

```javascript
const { light, dark, themes, getTheme, generateCSSVars } = require('@times/theme');

// Use individual themes
console.log(light.colors.primary); // #1a1a1a

// Get theme by name
const myTheme = getTheme('dark');

// Generate CSS custom properties
const cssVars = generateCSSVars('light');
```

## Available Themes

- `light` - Light theme for Design System
- `dark` - Dark theme for Design System

## Building

```bash
npm run build
```

## Publishing

```bash
npm run prepublishOnly
npm publish
```
