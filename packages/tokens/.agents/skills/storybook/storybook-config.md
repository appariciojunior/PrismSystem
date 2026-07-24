---
name: storybook-config
description: Manage Storybook configuration for the Design System monorepo. Covers main.js, preview.js, addons, font loading, and CSS token integration.
license: MIT
metadata:
  category: storybook
  agents: [Architect, Code, Testing]
  autonomy: requires-approval
  portable: true
---

# Storybook Configuration

## Purpose

Reference guide for managing the Design System Storybook configuration. Covers when and how to modify config files, add addons, configure story discovery, and integrate design tokens.

## Preconditions

- Storybook 8+ installed
- Framework: `@storybook/nextjs-vite`
- Monorepo structure with stories in `stories/`

## Mandatory Live Preview Rule

For any work using this skill, restart the local Storybook server on port `6006` before validating changes so browser refresh always shows the latest result.

```bash
PORT_PIDS=$(lsof -ti tcp:6006); if [ -n "$PORT_PIDS" ]; then kill $PORT_PIDS; sleep 1; fi
npm run storybook -- --port 6006
```

---

## Configuration Files Overview

| File                              | Purpose                                 | When to Edit                                    |
| --------------------------------- | --------------------------------------- | ----------------------------------------------- |
| `.storybook/main.js`              | Story discovery, addons, framework      | Adding new story directories, new addons        |
| `.storybook/preview.js`           | Global decorators, parameters, controls | Changing default layout, adding theme decorator |
| `.storybook/preview-head.html`    | Font loading, CSS imports               | Adding new fonts, linking new CSS files         |
| `.storybook/public/variables.css` | Design token CSS custom properties      | Updated by build:output (don't edit manually)   |
| `.storybook/vitest.setup.js`      | Test configuration                      | Modifying test setup                            |

---

## Current Configuration (Reference)

### main.js

```javascript
// .storybook/main.js
import { join, dirname } from 'path';

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config = {
  stories: [
    '../stories/**/*.mdx', // MDX docs
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)' // Story files
  ],
  staticDirs: ['./public'], // Static assets (fonts, CSS)
  addons: [
    '@chromatic-com/storybook', // Visual testing
    '@storybook/addon-docs', // Documentation
    '@storybook/addon-a11y', // Accessibility
    '@storybook/addon-vitest' // Test integration
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {}
  }
};
export default config;
```

### preview.js

```javascript
// .storybook/preview.js
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    a11y: {
      test: 'todo' // Options: 'todo', 'error', 'off'
    }
  }
};
export default preview;
```

### preview-head.html

- Loads `variables.css` (design token CSS custom properties)
- Declares `@font-face` rules for Inter
- Fonts served from `.storybook/public/static/fonts/`

---

## Common Configuration Tasks

### Task 1: Add a New Story Directory

When components are stored in a new package:

```javascript
// .storybook/main.js — add to stories array
stories: [
  '../stories/**/*.mdx',
  '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
],
```

### Task 2: Add a New Addon

```bash
# 1. Install the addon
npm install --save-dev @storybook/addon-name

# 2. Add to main.js addons array
addons: [
  // ...existing addons
  getAbsolutePath('@storybook/addon-name'),
],
```

**Commonly useful addons:**

| Addon                          | Purpose                                    |
| ------------------------------ | ------------------------------------------ |
| `@storybook/addon-a11y`        | Accessibility checking (already installed) |
| `@storybook/addon-docs`        | Documentation (already installed)          |
| `@storybook/addon-viewport`    | Responsive viewport testing                |
| `@storybook/addon-backgrounds` | Background colour switching                |
| `@storybook/addon-measure`     | Spacing/padding inspector                  |
| `@storybook/addon-outline`     | CSS outline overlay                        |

### Task 3: Add Global Decorators

For wrapping all stories (e.g., theme provider, layout wrapper):

```javascript
// .storybook/preview.js
const preview = {
  decorators: [
    // Theme wrapper
    (Story) => (
      <div data-theme="light" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        <Story />
      </div>
    )
  ],
  parameters: {
    // ...existing parameters
  }
};
export default preview;
```

### Task 4: Add Dark Mode Toggle

```javascript
// .storybook/preview.js — add toolbar item for dark mode
const preview = {
  globalTypes: {
    theme: {
      description: 'Theme mode',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true
      }
    }
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';
      return (
        <div
          data-theme={theme}
          style={{
            background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            padding: '2rem',
            minHeight: '100vh'
          }}
        >
          <Story />
        </div>
      );
    }
  ]
  // ...
};
```

### Task 5: Configure Viewports for Responsive Testing

```javascript
// .storybook/preview.js
const CUSTOM_VIEWPORTS = {
  small: {
    name: 'Small (Mobile)',
    styles: { width: '375px', height: '812px' }
  },
  medium: {
    name: 'Medium (Tablet)',
    styles: { width: '768px', height: '1024px' }
  },
  large: {
    name: 'Large (Desktop)',
    styles: { width: '1280px', height: '800px' }
  },
  xlarge: {
    name: 'XLarge (Wide)',
    styles: { width: '1440px', height: '900px' }
  }
};

const preview = {
  parameters: {
    viewport: {
      viewports: CUSTOM_VIEWPORTS
    }
    // ...
  }
};
```

### Task 6: Sidebar Organisation

```javascript
// .storybook/preview.js — customise sidebar order
const preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          'About',
          'Theme',
          ['Palettes', 'Typography', 'Spacing', 'Shadows'],
          'Components',
          ['Button', 'Input', 'Text', 'Link', 'Divider'],
          'Pages'
        ]
      }
    }
    // ...
  }
};
```

---

## Design Token Integration

The design tokens are loaded via CSS custom properties:

1. **Build tokens**: `npm run build:output` generates CSS with `--token-name` variables
2. **Copy to Storybook**: The built CSS is available at `.storybook/public/variables.css`
3. **Loaded automatically**: `preview-head.html` includes `<link rel="stylesheet" href="/variables.css">`

**To update tokens in Storybook:**

```bash
# 1. Build tokens
npm run build:output

# 2. Copy CSS variables to Storybook public dir (if not automated)
cp packages/output/lib/variables.css .storybook/public/variables.css

# 3. Restart Storybook
npm run storybook
```

---

## Running & Building

```bash
# Development
npm run storybook                  # Start at localhost:6006

# Production build
npm run build-storybook            # Output to storybook-static/

# With specific port
npx storybook dev --port 6007
```

---

## Error Handling

| Problem              | Recovery                                              |
| -------------------- | ----------------------------------------------------- |
| Story not discovered | Check `stories` glob in main.js matches file location |
| Addon not loading    | Verify installed + added to main.js addons array      |
| Fonts not rendering  | Check preview-head.html @font-face declarations       |
| CSS vars undefined   | Rebuild tokens and copy variables.css                 |
| Build fails          | Check for import errors in story files                |
| Port in use          | Use `--port` flag or kill process on 6006             |

## References

- [Storybook Configuration](https://storybook.js.org/docs/configure)
- [Storybook Addons](https://storybook.js.org/docs/addons)
- [Storybook Builders - Vite](https://storybook.js.org/docs/builders/vite)
- [Story Layout](https://storybook.js.org/docs/configure/story-layout)
