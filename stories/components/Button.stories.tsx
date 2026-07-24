import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Button,
  type ButtonProps
} from '../../packages/components-react/src/Button/Button';

const defaultButtonArgs: ButtonProps = {
  size: 'medium',
  intent: 'primary',
  state: 'base',
  behaviour: 'hug',
  label: 'Button label'
};

const buttonFigmaUrl =
  'https://www.figma.com/design/YOUR-FIGMA-FILE-KEY/Token-Library---Design-System?node-id=7100-1178';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none'
    }
  },
  argTypes: {
    size: {
      name: 'Size',
      description: 'Controls the overall dimensions of the button',
      control: 'select',
      options: ['small', 'medium', 'large'],
      table: { defaultValue: { summary: 'medium' } }
    },
    intent: {
      name: 'Intent',
      description: 'Sets the visual style treatment of the button',
      control: 'select',
      options: ['primary', 'secondary', 'negative'],
      table: { defaultValue: { summary: 'primary' } }
    },
    state: {
      name: 'State',
      description:
        'Controls the interaction state styling shown for the button',
      control: 'select',
      options: ['base', 'hover', 'pressed', 'loading', 'disabled', 'focus'],
      table: { defaultValue: { summary: 'base' } }
    },
    behaviour: {
      name: 'Behaviour',
      description:
        'Controls width behavior: content width (Hug) or full-width (100%)',
      control: 'select',
      options: ['hug', 'full'],
      table: { defaultValue: { summary: 'hug' } }
    },
    label: {
      name: 'Label',
      description: 'Sets the button text label',
      control: 'text',
      table: { defaultValue: { summary: 'Button label' } }
    },
    iconLeft: {
      name: 'Icon left name',
      description: 'Selects which icon is displayed on the left side',
      control: 'select',
      options: [
        'filled_add',
        'filled_arrow_right',
        'filled_arrow_left',
        'filled_close'
      ],
      table: { defaultValue: { summary: 'filled_arrow_right' } }
    },
    iconRight: {
      name: 'Icon right name',
      description: 'Selects which icon is displayed on the right side',
      control: 'select',
      options: [
        'filled_add',
        'filled_arrow_right',
        'filled_arrow_left',
        'filled_close'
      ],
      table: { defaultValue: { summary: 'filled_arrow_right' } }
    },
    href: {
      name: 'Href',
      description: 'Renders the button as an anchor tag when provided',
      control: 'text',
      table: { defaultValue: { summary: 'undefined' } }
    },
    target: {
      name: 'Target',
      description: 'Link target attribute (_blank, _self, etc.)',
      control: 'select',
      options: [undefined, '_blank', '_self', '_parent', '_top'],
      table: { defaultValue: { summary: 'undefined' } }
    },
    rel: {
      name: 'Rel',
      description: 'Link rel attribute for security/semantics',
      control: 'text',
      table: { defaultValue: { summary: 'undefined' } }
    },
    onClick: {
      name: 'On Click',
      description: 'Callback function triggered when the button is clicked',
      action: 'clicked'
    },
    disabled: {
      name: 'Disabled',
      description: 'Disables the button and prevents interaction',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    }
  },
  args: defaultButtonArgs
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: defaultButtonArgs,
  parameters: {
    design: {
      type: 'figma',
      url: buttonFigmaUrl
    }
  }
};

export const Secondary: Story = {
  args: {
    intent: 'secondary'
  }
};

export const Negative: Story = {
  args: {
    intent: 'negative'
  }
};

export const Medium: Story = {
  args: {
    size: 'medium'
  }
};

export const Large: Story = {
  args: {
    size: 'Large'
  }
};

export const XLarge: Story = {
  args: {
    size: 'XLarge'
  }
};

export const Small: Story = {
  args: {
    size: 'small'
  }
};

export const WithLeftIcon: Story = {
  args: {
    iconLeft: 'filled_arrow_left'
  }
};

export const WithRightIcon: Story = {
  args: {
    iconRight: 'filled_arrow_right'
  }
};

export const WithBothIcons: Story = {
  args: {
    iconLeft: 'filled_arrow_left',
    iconRight: 'filled_arrow_right'
  }
};

export const IconSelection: Story = {
  args: {
    iconLeft: 'filled_add',
    iconRight: 'filled_close'
  }
};

export const Loading: Story = {
  args: {
    state: 'loading'
  }
};

export const Disabled: Story = {
  args: {
    state: 'disabled'
  }
};

export const FullWidth: Story = {
  args: {
    behaviour: 'full',
    iconRight: 'filled_arrow_right'
  },
  render: (args) => (
    <div style={{ width: '320px' }}>
      <Button {...args} />
    </div>
  )
};

export const HoverState: Story = {
  args: {
    state: 'hover'
  }
};

export const PressedState: Story = {
  args: {
    state: 'pressed'
  }
};

export const FocusState: Story = {
  args: {
    state: 'focus'
  }
};

export const SizeRegressionMatrix: Story = {
  parameters: {
    layout: 'padded'
  },
  render: () => {
    const sizes: ButtonProps['size'][] = ['Small', 'Medium', 'Large', 'XLarge'];
    const behaviours: ButtonProps['behaviour'][] = ['Hug', '100%'];

    return (
      <div style={{ display: 'grid', gap: '20px', width: '640px' }}>
        {behaviours.map((behaviour) => (
          <div key={behaviour} style={{ display: 'grid', gap: '12px' }}>
            <strong>{behaviour} behaviour</strong>
            <div style={{ display: 'grid', gap: '16px' }}>
              {sizes.map((size) => (
                <div
                  key={`${behaviour}-${size}`}
                  style={{ width: behaviour === '100%' ? '320px' : 'auto' }}
                >
                  <Button
                    {...defaultButtonArgs}
                    behaviour={behaviour}
                    size={size}
                    label={`${size} button`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export const AsLink: Story = {
  args: {
    ...defaultButtonArgs,
    href: 'https://example.com',
    label: 'Link button'
  }
};

export const LinkNewTab: Story = {
  args: {
    ...defaultButtonArgs,
    href: 'https://example.com',
    target: '_blank',
    label: 'Open in new tab'
  }
};

export const LinkWithIcon: Story = {
  args: {
    ...defaultButtonArgs,
    href: 'https://example.com',
    iconRight: 'filled_arrow_right',
    label: 'Learn more'
  }
};

export const WithClickHandler: Story = {
  args: {
    ...defaultButtonArgs,
    label: 'Click me'
  }
};
