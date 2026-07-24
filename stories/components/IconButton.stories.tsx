import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  IconButton,
  type IconButtonProps
} from '../../packages/components-react/src/IconButton/IconButton';
import { IconName } from '@ds/icons';

const iconButtonFigmaUrl =
  'https://www.figma.com/design/YOUR-FIGMA-FILE-KEY/Token-Library---Design-System?node-id=7164-227';

const defaultArgs: IconButtonProps = {
  ariaLabel: 'Accessibility options',
  size: 'large',
  intent: 'primary',
  state: 'base',
  round: false,
  iconName: 'filled_add' as IconName
};

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none'
    }
  },
  argTypes: {
    ariaLabel: {
      name: 'Aria label',
      description: 'Accessible name announced by assistive technologies',
      control: 'text'
    },
    size: {
      name: 'Size',
      description: 'Controls icon button dimensions',
      control: 'select',
      options: ['small', 'medium', 'large', 'xlarge']
    },
    intent: {
      name: 'Intent',
      description: 'Controls visual treatment',
      control: 'select',
      options: ['primary', 'secondary', 'negative']
    },
    state: {
      name: 'State',
      description: 'Controls interaction state styling shown in Storybook',
      control: 'select',
      options: ['base', 'hover', 'pressed', 'loading', 'disabled', 'focus']
    },
    round: {
      name: 'Round',
      description: 'Controls corner style parity variant',
      control: 'select',
      options: [false, true]
    },
    iconName: {
      name: 'Icon',
      description: 'Selects which icon is rendered',
      control: 'select',
      options: [
        'filled_add',
        'filled_arrow_right',
        'filled_arrow_left',
        'filled_close'
      ]
    },
    onClick: {
      table: { disable: true }
    },
    className: {
      table: { disable: true }
    },
    type: {
      table: { disable: true }
    },
    disabled: {
      table: { disable: true }
    }
  },
  args: defaultArgs
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: defaultArgs,
  parameters: {
    design: {
      type: 'figma',
      url: iconButtonFigmaUrl
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

export const RoundOn: Story = {
  args: {
    round: true
  }
};

export const Small: Story = {
  args: {
    size: 'small'
  }
};

export const Medium: Story = {
  args: {
    size: 'medium'
  }
};

export const XLarge: Story = {
  args: {
    size: 'xlarge'
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

export const FocusState: Story = {
  args: {
    state: 'focus'
  }
};
