---
name: natural-language-stories
description: Generate Storybook stories and React components from plain English descriptions. Enables non-coders (designers) to create UI components by describing what they want.
license: MIT
metadata:
  category: storybook
  agents: [Architect, Code, Testing]
  autonomy: autonomous
  portable: true
---

# Natural Language to Storybook

## Purpose

Enable designers and non-coders to create Storybook stories by describing components in plain English. The Code agent interprets the description, generates the React component (if needed), and creates full CSF3 stories with all variants.

## Preconditions

- Storybook is installed and running
- Designer provides a natural language description
- Design System tokens are available

## Mandatory Live Preview Rule

For any work using this skill, restart the local Storybook server on port `6006` before validating changes so browser refresh always shows the latest result.

```bash
PORT_PIDS=$(lsof -ti tcp:6006); if [ -n "$PORT_PIDS" ]; then kill $PORT_PIDS; sleep 1; fi
npm run storybook -- --port 6006
```

## Inputs

| Parameter          | Type   | Required | Description                                                |
| ------------------ | ------ | -------- | ---------------------------------------------------------- |
| description        | string | Yes      | Plain English description of the desired component         |
| context            | string | No       | Where this component is used (e.g., "article page header") |
| referenceComponent | string | No       | Existing component to base this on                         |

---

## How It Works

The designer describes what they want. The agent:

1. **Parses** the description to identify component type, props, variants, and states
2. **Matches** to existing components or creates a new one
3. **Maps** visual properties to design tokens
4. **Generates** CSF3 stories with all specified variants
5. **Validates** in Storybook

---

## Procedure

### Step 1: Parse the Designer's Request

```markdown
**Thought [PLAN]**: Designer said: "[their description]"
I need to extract:

- Component type (button, card, input, layout, etc.)
- Visual properties (colours, sizes, fonts)
- Variants (primary/secondary, different sizes)
- States (hover, disabled, loading, error)
- Content (text, images, icons)
- Layout (horizontal, vertical, grid)
- Responsive requirements
```

### Step 2: Identify Component Strategy

| Designer Description Pattern         | Strategy                                    |
| ------------------------------------ | ------------------------------------------- |
| "I need a button that..."            | Use existing `Button` component, add story  |
| "Show me the text component with..." | Use existing `Text` component, add story    |
| "Create a card with..."              | May need new component + story              |
| "I want a page layout with..."       | Create page-level story in `stories/pages/` |
| "Display our colour palette"         | Create MDX doc in `stories/theme/`          |
| "Show all typography styles"         | Create showcase story in `stories/theme/`   |

### Step 3: Interpret Common Designer Language

| Designer Says            | Technical Translation                                      |
| ------------------------ | ---------------------------------------------------------- |
| "big heading"            | `typographyStyle="brand.heading.fluid.bold.large"`         |
| "small text"             | `typographyStyle="utility.body.static.regular.small"`      |
| "primary colour"         | `var(--interactive-primary-fill-default)`                  |
| "greyed out"             | `disabled={true}`                                          |
| "clickable"              | Add `onClick` handler                                      |
| "side by side"           | `display: flex; flex-direction: row`                       |
| "stacked"                | `display: flex; flex-direction: column`                    |
| "with spacing"           | `gap: var(--spacing-static-400)`                           |
| "rounded corners"        | `border-radius`                                            |
| "drop shadow"            | `box-shadow: var(--shadow-elevation-down-level-2)`         |
| "full width"             | `width: 100%`, `layout: 'fullscreen'`                      |
| "centered"               | `layout: 'centered'` in story parameters                   |
| "dark mode"              | Add dark theme decorator                                   |
| "mobile view"            | Add viewport parameter                                     |
| "responsive"             | Multiple viewport stories                                  |
| "like the checkout page" | Reference `stories/pages/CheckoutPage.stories.jsx` pattern |

### Step 4: Generate the Story

**Template for simple component stories:**

```jsx
// stories/components/[ComponentName].stories.jsx
import { fn } from 'storybook/test';
// Import existing component OR create new one
import { ComponentName } from '@ds/components-react';

export default {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered', // or 'fullscreen' for page-level
    docs: {
      description: {
        component: "[Designer's description, cleaned up]"
      }
    }
  },
  tags: ['autodocs'],
  args: {
    // Default values inferred from description
  }
};

// Stories for each variant mentioned by designer
export const Default = {
  args: {
    /* ... */
  }
};
```

**Template for page-level stories (when designer describes a layout/page):**

```jsx
// stories/pages/[PageName].stories.jsx
import React, { useState } from 'react';
import {
  Button,
  Input,
  Text,
  Link
} from '@ds/components-react';
import './PageName.css';

export default {
  title: 'Pages/PageName',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs']
};

export const Default = {
  render: () => {
    // Stateful page component
    return (
      <div className="page-container">
        {/* Layout matching designer's description */}
      </div>
    );
  }
};
```

**Template for token/theme showcase:**

```mdx
{/* stories/theme/[TopicName].mdx */}
import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Theme/TopicName" />

# Topic Name

[Description based on what designer asked to see]
```

### Step 5: Handle Ambiguity

When the description is unclear, make reasonable defaults:

| Ambiguity            | Default Choice                                 |
| -------------------- | ---------------------------------------------- |
| No size specified    | Use `medium`                                   |
| No variant specified | Create `Default` and `Primary`                 |
| No layout specified  | Use `centered`                                 |
| "Make it pretty"     | Use design system tokens, proper spacing       |
| "Like the other one" | Check existing stories for reference patterns  |
| No colour specified  | Use semantic tokens (surface/text/interactive) |

**When truly ambiguous**, ask ONE clarifying question:

> "I'll create a [component type] with [variants]. Should I also include [specific thing]?"

### Step 6: Validate

```bash
npm run storybook
# Check: Does the rendered component match the designer's intent?
```

---

## Example Conversations

### Example 1: "I need a hero banner for articles"

```markdown
**Thought [PLAN]**: Designer wants a hero banner — this is a page-level component
Components needed: Image background, headline text, subtitle, CTA button
Layout: Full width, vertically stacked content, centred text
Tokens: heading typography, spacing, surface colours
```

**Generated:**

```jsx
// stories/pages/HeroBanner.stories.jsx
import React from 'react';
import { Button, Text } from '@ds/components-react';
import './HeroBanner.css';

export default {
  title: 'Pages/Hero Banner',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs']
};

export const Default = {
  render: () => (
    <div className="hero-banner">
      <div className="hero-banner__content">
        <Text as="h1" typographyStyle="brand.heading.fluid.bold.large">
          Breaking News Headline
        </Text>
        <Text as="p" typographyStyle="utility.body.static.regular.medium">
          A brief summary of the article that draws readers in.
        </Text>
        <Button primary label="Read More" />
      </div>
    </div>
  )
};

export const WithImage = {
  render: () => (
    <div
      className="hero-banner hero-banner--with-image"
      style={{ backgroundImage: 'url(https://picsum.photos/1200/600)' }}
    >
      <div className="hero-banner__content hero-banner__content--overlay">
        <Text
          as="h1"
          typographyStyle="brand.heading.fluid.bold.large"
          styles={{ color: 'white' }}
        >
          Featured Story
        </Text>
        <Button primary label="Read Now" />
      </div>
    </div>
  )
};
```

### Example 2: "Show me all our button styles side by side"

```jsx
// stories/components/ButtonShowcase.stories.jsx
import { Button } from '@ds/components-react';

export default {
  title: 'Components/Button Showcase',
  parameters: { layout: 'padded' },
  tags: ['autodocs']
};

export const AllVariants = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}
    >
      <Button primary label="Primary" />
      <Button label="Secondary" />
      <Button primary size="large" label="Large Primary" />
      <Button size="small" label="Small" />
      <Button primary disabled label="Disabled" />
    </div>
  )
};
```

### Example 3: "I want a form with name, email, and a submit button"

```jsx
// stories/pages/SimpleForm.stories.jsx
import React, { useState } from 'react';
import { Input, Button } from '@ds/components-react';

export default {
  title: 'Pages/Simple Form',
  parameters: { layout: 'centered' },
  tags: ['autodocs']
};

export const Default = {
  render: () => {
    const [form, setForm] = useState({ name: '', email: '' });
    return (
      <form
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '320px'
        }}
      >
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
        <Button primary label="Submit" />
      </form>
    );
  }
};
```

---

## Error Handling

| Problem                   | Recovery                                                  |
| ------------------------- | --------------------------------------------------------- |
| Component doesn't exist   | Create it in `packages/components-react/src/`, then story |
| Designer changes mind     | Edit the story file, re-run Storybook                     |
| "That's not what I meant" | Ask one clarifying question, regenerate                   |
| Import error              | Check component is exported from package index            |
| Style doesn't match       | Inspect CSS variables, adjust token references            |

## Related Skills

- [storybook/story-writing](./story-writing.md) — CSF3 patterns
- [storybook/figma-to-storybook](./figma-to-storybook.md) — When Figma designs exist
- [react/component-patterns](../react/component-patterns.md) — React patterns
- [storybook/component-documentation](./component-documentation.md) — Adding docs

## References

- [Natural Language Component Generator](https://github.com/flight505/storybook-assistant)
- [Storybook Writing Stories](https://storybook.js.org/docs/writing-stories)
