import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Chip,
  type ChipProps
} from '../../packages/components-react/src/Chip/Chip';

const chipFigmaUrl =
  'https://www.figma.com/design/YOUR-FIGMA-FILE-KEY/Token-Library---Design-System?node-id=7224-8224';

const defaultArgs: ChipProps = {
  intent: 'primary',
  size: 'small',
  state: 'base',
  channel: false,
  toggle: false,
  iconLeft: undefined,
  iconRight: undefined,
  children: 'Chip Label'
};

const meta = {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none'
    }
  },
  argTypes: {
    intent: {
      name: 'Intent',
      description: 'Sets the chip emphasis and token family',
      control: 'select',
      options: ['primary', 'secondary'],
      table: { defaultValue: { summary: 'primary' } }
    },
    size: {
      name: 'Size',
      description: 'Sets the chip height and horizontal padding',
      control: 'select',
      options: ['small', 'large'],
      table: { defaultValue: { summary: 'small' } }
    },
    state: {
      name: 'State',
      description: 'Previews the visual interaction state',
      control: 'select',
      options: ['base', 'hover', 'pressed', 'disabled', 'focus'],
      table: { defaultValue: { summary: 'base' } }
    },
    channel: {
      name: 'Channel',
      description: 'Switches to the channel-colour token family',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    toggle: {
      name: 'Toggle',
      description: 'Enables the toggle on/off visual contract',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
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
    children: {
      name: 'Children',
      description: 'Visible chip label content',
      control: 'text',
      table: { defaultValue: { summary: 'Chip Label' } }
    },
    ariaLabel: {
      table: { disable: true }
    },
    'aria-label': {
      table: { disable: true }
    },
    onClick: {
      table: { disable: true }
    },
    className: {
      table: { disable: true }
    },
    disabled: {
      table: { disable: true }
    },
    type: {
      table: { disable: true }
    },
    leftIcon: {
      table: { disable: true }
    },
    rightIcon: {
      table: { disable: true }
    }
  },
  args: defaultArgs
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: defaultArgs,
  parameters: {
    design: {
      type: 'figma',
      url: chipFigmaUrl
    }
  }
};

export const Secondary: Story = {
  args: {
    intent: 'secondary'
  }
};

export const Channel: Story = {
  args: {
    channel: true
  }
};

export const ToggleOn: Story = {
  args: {
    toggle: true
  }
};

export const WithLeftIcon: Story = {
  args: {
    iconLeft: 'filled_add'
  }
};

export const WithRightIcon: Story = {
  args: {
    iconRight: 'filled_close'
  }
};

export const WithBothIcons: Story = {
  args: {
    iconLeft: 'filled_arrow_left',
    iconRight: 'filled_arrow_left'
  }
};

export const FocusState: Story = {
  args: {
    state: 'focus'
  }
};

export const DisabledState: Story = {
  args: {
    state: 'disabled'
  }
};

export const StateMatrix: Story = {
  parameters: {
    controls: { disable: true }
  },
  render: (args) => {
    const states: ChipProps['state'][] = [
      'base',
      'hover',
      'pressed',
      'focus',
      'disabled'
    ];

    return (
      <div style={{ display: 'grid', gap: '16px' }}>
        {(['primary', 'secondary'] as const).map((intent) => (
          <div key={intent}>
            <h4
              style={{ margin: '0 0 8px 0', fontFamily: 'Arial, sans-serif' }}
            >
              {intent}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {states.map((state) => (
                <Chip
                  key={`${intent}-${state}`}
                  {...args}
                  intent={intent}
                  state={state}
                >
                  {`${intent} ${state}`}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
};
