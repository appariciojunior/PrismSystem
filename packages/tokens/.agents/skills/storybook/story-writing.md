---
name: story-writing
description: Write Storybook stories using modern CSF3 format. Generates type-safe story files from component specs or designer descriptions, covering all states and variants.
license: MIT
metadata:
  category: storybook
  agents: [Architect, Code, Testing]
  autonomy: autonomous
  portable: true
---

# Storybook Story Writing (CSF3)

## Purpose

Generate production-quality Storybook stories using Component Story Format 3 (CSF3) for React components in the Design System. Designed to be invoked by a designer describing what they want — the agent handles all code.

## Preconditions

- Storybook is installed and running (`npm run storybook`)
- Target component exists in `packages/components-react/src/` or will be created
- React 18+, Storybook 8+

## Mandatory Live Preview Rule

For any work using this skill, restart the local Storybook server on port `6006` before validating changes so browser refresh always shows the latest result.

```bash
PORT_PIDS=$(lsof -ti tcp:6006); if [ -n "$PORT_PIDS" ]; then kill $PORT_PIDS; sleep 1; fi
npm run storybook -- --port 6006
```

## Inputs

| Parameter     | Type     | Required | Description                                                          |
| ------------- | -------- | -------- | -------------------------------------------------------------------- |
| componentName | string   | Yes      | Name of the component (e.g., "Button", "Card")                       |
| componentPath | string   | Yes      | Import path (e.g., `@ds/components-react`)          |
| variants      | string[] | No       | Visual variants to showcase (e.g., "primary", "secondary")           |
| states        | string[] | No       | Interactive states (e.g., "default", "hover", "disabled", "loading") |
| description   | string   | No       | Natural language description from designer                           |

---

## Procedure

### Step 1: Understand the Component

```markdown
**Thought [PLAN]**: Designer wants stories for [ComponentName]. I need to:

1. Check if the component exists and what props it accepts
2. Determine which variants/states to cover
3. Write CSF3 stories

**Action**: Read the component source to find props
**Observation**: Component has props: { label, primary, size, onClick, disabled, ... }
```

### Step 2: Create the Story File

Stories live in `stories/components/` (NOT alongside the component source).

**File naming**: `ComponentName.stories.jsx` (use `.jsx` for this repo — matches existing patterns).

### Step 3: Write CSF3 Story Structure

```jsx
// stories/components/ComponentName.stories.jsx
import { fn } from 'storybook/test';
import { ComponentName } from '@ds/components-react';

// Meta — the default export
export default {
  title: 'Components/ComponentName', // Sidebar hierarchy
  component: ComponentName, // Auto-generates controls
  parameters: {
    layout: 'centered', // or 'fullscreen', 'padded'
    docs: {
      description: {
        component: 'Brief description of what this component does.'
      }
    }
  },
  tags: ['autodocs'], // Enable automatic documentation
  argTypes: {
    // Override auto-detected control types
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Visual style variant'
    },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large']
    },
    disabled: { control: 'boolean' },
    backgroundColor: { control: 'color' }
  },
  args: {
    // Default args shared across stories
    onClick: fn() // Spy function for Actions panel
  }
};

// Named exports = individual stories
export const Default = {
  args: {
    label: 'Button'
  }
};

export const Primary = {
  args: {
    primary: true,
    label: 'Primary Button'
  }
};

export const Large = {
  args: {
    size: 'large',
    label: 'Large Button'
  }
};

export const Disabled = {
  args: {
    label: 'Disabled',
    disabled: true
  }
};
```

### Step 4: Cover All Visual States

Always generate stories for:

| State                  | When to Include                                  | Example                           |
| ---------------------- | ------------------------------------------------ | --------------------------------- |
| **Default**            | Always                                           | Base component with minimal props |
| **Primary**            | When component has a `primary` or `variant` prop | Primary CTA style                 |
| **Secondary**          | When variants exist                              | Secondary style                   |
| **Disabled**           | When component has `disabled` prop               | Greyed out, non-interactive       |
| **Loading**            | When component has loading state                 | Spinner or skeleton               |
| **Error**              | When component has error state                   | Red border, error message         |
| **WithIcon**           | When component accepts icons                     | Icon + label combination          |
| **Small/Medium/Large** | When component has `size` prop                   | All size variants                 |
| **Mobile**             | For responsive components                        | Narrow viewport                   |

### Step 5: Add Decorators (when needed)

```jsx
// Theme decorator (for light/dark mode)
export default {
  // ...meta
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem' }}>
        <Story />
      </div>
    )
  ]
};

// Story-level decorator
export const DarkMode = {
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ background: '#000', padding: '2rem' }}>
        <Story />
      </div>
    )
  ],
  args: {
    label: 'Dark Mode Button',
    primary: true
  }
};
```

### Step 6: Composite/Multi-Component Stories

```jsx
// For page-level or multi-component compositions
export const FormExample = {
  render: (args) => (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Input label="Email" placeholder="you@example.com" />
      <Input label="Password" type="password" />
      <ComponentName {...args} />
    </form>
  ),
  args: {
    label: 'Submit',
    primary: true
  }
};
```

### Step 7: Validate

```bash
# 1. Start Storybook to verify rendering
npm run storybook

# 2. Check story is discovered (look in sidebar)
# 3. Verify Controls panel works
# 4. Verify Actions panel logs events
```

---

## Story Writing Checklist

- [ ] File is in `stories/components/` directory
- [ ] Uses CSF3 object syntax (NOT template/bind pattern)
- [ ] Has `tags: ['autodocs']` for documentation
- [ ] Imports from `@ds/components-react` (package import, not relative)
- [ ] All interactive props have `fn()` spies in default `args`
- [ ] Multiple variants are covered
- [ ] `layout` parameter is set appropriately
- [ ] No TypeScript errors (if using `.tsx`)

---

## Common Anti-Patterns (AVOID)

```jsx
// ❌ OLD CSF2 template/bind pattern — DO NOT USE
const Template = (args) => <Button {...args} />;
export const Primary = Template.bind({});
Primary.args = { primary: true };

// ✅ CSF3 object syntax — USE THIS
export const Primary = {
  args: { primary: true }
};
```

```jsx
// ❌ Relative imports to source
import { Button } from '../../packages/components-react/src';

// ✅ Package imports (preferred for stories/components/)
import { Button } from '@ds/components-react';
// NOTE: For pages/ stories, relative imports MAY be needed — check existing patterns
```

---

## Examples

### Designer says: "I need a Button story with all sizes"

```jsx
export default {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: { onClick: fn() }
};

export const Small = { args: { size: 'small', label: 'Small' } };
export const Medium = { args: { size: 'medium', label: 'Medium' } };
export const Large = { args: { size: 'large', label: 'Large' } };
```

### Designer says: "Show me a card with image, title, and description"

```jsx
export const WithContent = {
  args: {
    title: 'Article Title',
    description: 'A brief summary of the article content.',
    imageUrl: 'https://picsum.photos/400/200'
  }
};

export const WithLongContent = {
  args: {
    title: 'A Very Long Article Title That Wraps to Multiple Lines',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    imageUrl: 'https://picsum.photos/400/200'
  }
};
```

---

## Error Handling

| Problem               | Recovery                                                                     |
| --------------------- | ---------------------------------------------------------------------------- |
| Component not found   | Check import path, verify component is exported from package                 |
| Controls don't appear | Ensure `component` is set in meta, check argTypes                            |
| Story not in sidebar  | Check `title` path, verify file matches stories glob in `.storybook/main.js` |
| Actions don't log     | Add `fn()` to event handler args                                             |
| Styles missing        | Check if CSS variables are loaded via `preview-head.html`                    |

## References

- [Storybook Writing Stories](https://storybook.js.org/docs/writing-stories)
- [CSF3 Format](https://storybook.js.org/docs/api/csf)
- [Args](https://storybook.js.org/docs/writing-stories/args)
- [Decorators](https://storybook.js.org/docs/writing-stories/decorators)
- [Parameters](https://storybook.js.org/docs/writing-stories/parameters)
