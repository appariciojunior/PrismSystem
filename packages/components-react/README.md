# `@ds/components-react`

React component library for the Design System. Provides a collection of accessible, production-ready UI components with semantic token integration and multiple export patterns for optimal tree-shaking.

## Installation

```bash
npm install @ds/components-react
```

## Quick Start

### Import All Components

```tsx
import {
  Button,
  Input,
  Link,
  Toast
} from '@ds/components-react';

export function App() {
  return (
    <Button intent="primary" size="large">
      Click me
    </Button>
  );
}
```

### Tree-Shakeable Imports

For better bundle optimization, import individual components:

```tsx
import { Button } from '@ds/components-react/Button';
import { Input } from '@ds/components-react/Input';
import { IconButton } from '@ds/components-react/IconButton';
```

## Available Components

- **Button** - Primary interactive element with support for icons, intents, sizes, and link rendering
- **IconButton** - Icon-only button for compact layouts
- **Input** - Form input with validation states
- **Link** - Semantic link component
- **Text** - Typography component
- **Divider** - Visual separator
- **Chip** - Compact component for categories or selections
- **Flag** - Badge/label component
- **Toast** - Notification component
- **Icon** - Icon rendering with design system icon library
- **AdContainer** - Container for ad placement
- **CommentsDisabled** - Comments disabled state component
- **Article** - Article-specific components (UpNextArticles)

## Component Examples

### Button

```tsx
import { Button } from '@ds/components-react/Button';

// Standard button
<Button intent="primary" size="large">
  Submit
</Button>

// Button with icons
<Button iconLeft="filled_arrow_left" iconRight="filled_arrow_right">
  Navigate
</Button>

// Button as link
<Button href="/page" target="_blank">
  Learn More
</Button>

// Different intents
<Button intent="primary">Primary</Button>
<Button intent="secondary">Secondary</Button>
<Button intent="negative">Delete</Button>

// Different states
<Button state="hover">Hover</Button>
<Button state="disabled">Disabled</Button>
<Button state="loading">Loading</Button>
```

### IconButton

```tsx
import { IconButton } from '@ds/components-react/IconButton';

// Icon button
<IconButton iconName="filled_add" ariaLabel="Add item" />

// As link
<IconButton
  href="https://example.com"
  iconName="filled_arrow_right"
  target="_blank"
/>

// Different sizes and intents
<IconButton size="small" intent="primary" />
<IconButton size="large" intent="secondary" />
```

### Input

```tsx
import { Input } from '@ds/components-react/Input';

<Input type="text" placeholder="Enter text..." disabled={false} />;
```

### Text

```tsx
import { Text } from '@ds/components-react/Text';

<Text variant="heading" size="large">
  Heading
</Text>
<Text variant="body">
  Body text
</Text>
```

## Component Props

All components follow the Design System guidelines:

### Common Props

- **intent**: `'primary' | 'secondary' | 'negative'` - Visual style variant
- **size**: `'small' | 'medium' | 'large'` - Component size
- **state**: `'base' | 'hover' | 'pressed' | 'loading' | 'disabled' | 'focus'` - Interaction state
- **disabled**: `boolean` - Disabled state
- **className**: `string` - Additional CSS classes

### Link Support

Button and IconButton support link rendering:

- **href**: `string` - URL to navigate to
- **target**: `'_blank' | '_self' | '_parent' | '_top'` - Link target
- **rel**: `string` - Link relationship (auto-set for security when needed)

## Styling

Components use CSS classes from the Design System. The library includes all necessary styles — no additional CSS imports required.

```tsx
// Styles are automatically included
import { Button } from '@ds/components-react/Button';

// Button will have all DS styling applied
<Button>Styled button</Button>;
```

## Accessibility

All components follow WAI-ARIA standards:

- Semantic HTML elements (button, a, input, etc.)
- ARIA labels and roles where appropriate
- Keyboard navigation support
- Focus management
- Loading and disabled states properly announced

```tsx
<IconButton iconName="filled_add" ariaLabel="Add new item" />
```

## TypeScript Support

Full TypeScript support with exported interfaces:

```tsx
import {
  Button,
  type ButtonProps
} from '@ds/components-react/Button';

interface MyComponentProps extends ButtonProps {
  customProp?: string;
}

export const MyComponent: React.FC<MyComponentProps> = (props) => {
  return <Button {...props} />;
};
```

## Development

### Building

```bash
npm run build
```

Generates:

- ES modules in `dist/`
- CommonJS bundles for Node.js
- TypeScript declarations
- Shared code chunks for deduplication

This build is then published to npm (https://www.npmjs.com/package/@ds/components-react), where components can be installed to your codebase as a using versioned dependency; e.g. `"@ds/components-react": "1.0.0"`

### Development Server

```bash
npm run dev
```

Watches source files and rebuilds on changes.

### Testing

```bash
npm run test
```

## Package Structure

The package uses modern module resolution:

- **ES Modules**: `dist/Component/Component.js`
- **CommonJS**: `dist/Component/Component.cjs`
- **Type Definitions**: `dist/Component/Component.d.ts`
- **Shared Dependencies**: `dist/shared/*` (deduplicated code)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This package is part of the Design System. For contribution guidelines, see the main repository README.

## License

ISC
