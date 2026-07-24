import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { cn } from '../../packages/components-react/src/utils/cn';
import './Label.story.css';

type LabelIntent = 'primary' | 'secondary' | 'channel' | 'callout';
type LabelSize = 'medium' | 'small';

interface LabelStoryProps extends React.HTMLAttributes<HTMLSpanElement> {
  intent?: LabelIntent;
  size?: LabelSize;
  label?: string;
  children?: React.ReactNode;
}

const labelFigmaUrl =
  'https://www.figma.com/design/YOUR-FIGMA-FILE-KEY/Token-Library---Design-System?node-id=8432-289294';

const LabelPreview: React.FC<LabelStoryProps> = ({
  intent = 'primary',
  size = 'medium',
  label = 'LABEL',
  children,
  className,
  ...rest
}) => {
  const content = children ?? label;

  return (
    <span
      className={cn(
        'ds-label-preview',
        `ds-label-preview--intent-${intent}`,
        `ds-label-preview--size-${size}`,
        className
      )}
      {...rest}
    >
      {content}
    </span>
  );
};

const defaultArgs: LabelStoryProps = {
  intent: 'primary',
  size: 'medium',
  label: 'LABEL'
};

const meta = {
  title: 'Components/Label',
  component: LabelPreview,
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none'
    }
  },
  argTypes: {
    intent: {
      name: 'Intent',
      description: 'Changes visual treatment.',
      control: 'select',
      options: ['primary', 'secondary', 'channel', 'callout'],
      table: { defaultValue: { summary: 'primary' } }
    },
    size: {
      name: 'Size',
      description: 'Changes visual treatment.',
      control: 'select',
      options: ['medium', 'small'],
      table: { defaultValue: { summary: 'medium' } }
    },
    label: {
      name: 'Label',
      description: 'Sets label content.',
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
    }
  },
  args: defaultArgs
} satisfies Meta<typeof LabelPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: defaultArgs,
  parameters: {
    design: {
      type: 'figma',
      url: labelFigmaUrl
    }
  }
};

export const PrimarySmall: Story = {
  args: {
    intent: 'primary',
    size: 'small'
  }
};

export const Secondary: Story = {
  args: {
    intent: 'secondary',
    size: 'medium'
  }
};

export const SecondarySmall: Story = {
  args: {
    intent: 'secondary',
    size: 'small'
  }
};

export const Channel: Story = {
  args: {
    intent: 'channel',
    size: 'medium'
  }
};

export const ChannelSmall: Story = {
  args: {
    intent: 'channel',
    size: 'small'
  }
};

export const Callout: Story = {
  args: {
    intent: 'callout',
    size: 'medium'
  }
};

export const CalloutSmall: Story = {
  args: {
    intent: 'callout',
    size: 'small'
  }
};
