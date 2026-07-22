import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Flag,
  type FlagProps
} from '../../packages/components-react/src/Flag/Flag';

const flagFigmaUrl =
  'https://www.figma.com/design/hcCXq9ObSEBdXtwROtBSNc/UI-Kit---Design-System?node-id=146-2509&t=rn82dgKJYa4KstsZ-1';

const defaultArgs: FlagProps = {
  intent: 'primary',
  size: 'medium',
  label: 'LABEL'
};

const meta = {
  title: 'Components/Flag',
  component: Flag,
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none'
    }
  },
  argTypes: {
    intent: {
      name: 'Intent',
      description: 'Changes visual treatment',
      control: 'select',
      options: ['primary', 'secondary', 'callout'],
      table: { defaultValue: { summary: 'primary' } }
    },
    size: {
      name: 'Size',
      description: 'Changes visual treatment',
      control: 'select',
      options: ['medium', 'small'],
      table: { defaultValue: { summary: 'medium' } }
    },
    iconLeft: {
      name: 'Icon left',
      description: 'Shows/hides iconleft element',
      control: 'select',
      options: ['filled_circle', 'filled_featured_video', 'filled_equalizer'],
      table: { defaultValue: { summary: 'filled_circle' } }
    },
    iconRight: {
      name: 'Icon right',
      description: 'Shows/hides iconright element',
      control: 'select',
      options: ['filled_circle', 'filled_featured_video', 'filled_equalizer'], // Replace with actual icon names
      table: { defaultValue: { summary: 'filled_circle' } }
    },
    label: {
      name: 'Label',
      description: 'Sets label content',
      control: 'text',
      table: { defaultValue: { summary: 'LABEL' } }
    },
    children: {
      table: { disable: true }
    },
    className: {
      table: { disable: true }
    },
    style: {
      table: { disable: true }
    },
    ariaLabel: {
      table: { disable: true }
    },
    'aria-label': {
      table: { disable: true }
    }
  },
  args: defaultArgs
} satisfies Meta<typeof Flag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: defaultArgs,
  parameters: {
    design: {
      type: 'figma',
      url: flagFigmaUrl
    }
  }
};

export const Secondary: Story = {
  args: {
    intent: 'secondary'
  }
};

export const Callout: Story = {
  args: {
    intent: 'callout'
  }
};

export const Small: Story = {
  args: {
    size: 'small'
  }
};

export const WithLeftIcon: Story = {
  args: {
    iconLeft: 'filled_circle'
  }
};

export const WithRightIcon: Story = {
  args: {
    iconRight: 'filled_circle'
  }
};

export const WithBothIcons: Story = {
  args: {
    iconLeft: 'filled_circle',
    iconRight: 'filled_circle'
  }
};

export const IntentSizeMatrix: Story = {
  parameters: {
    controls: { disable: true }
  },
  render: (args) => {
    const intents: FlagProps['intent'][] = ['primary', 'secondary', 'callout'];
    const sizes: FlagProps['size'][] = ['medium', 'small'];

    return (
      <div style={{ display: 'grid', gap: '16px' }}>
        {intents.map((intent) => (
          <div key={intent}>
            <h4
              style={{ margin: '0 0 8px 0', fontFamily: 'Arial, sans-serif' }}
            >
              {intent}
            </h4>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {sizes.map((size) => (
                <Flag
                  key={`${intent}-${size}`}
                  {...args}
                  intent={intent}
                  size={size}
                >
                  {`${intent} ${size}`}
                </Flag>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
};
