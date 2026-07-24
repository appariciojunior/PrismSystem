import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Toast,
  type ToastProps
} from '../../packages/components-react/src/Toast/Toast';

const toastFigmaUrl =
  'https://www.figma.com/design/hcCXq9ObSEBdXtwROtBSNc/UI-Kit---Design-System?node-id=803-3115&t=28XC3plkS6yCipuO-1';

const defaultArgs: ToastProps = {
  intent: 'success',
  label: 'Short toast message goes here.',
  link: true,
  linkLabel: 'Link',
  timeout: 2000
};

const TOAST_PREVIEW_WIDTH = 421;
const TOAST_PREVIEW_HEIGHT = 186;
const TOAST_STAGE_BOTTOM_INSET = 24;
const TOAST_STAGE_TOP = 40;

const ToastPreview = (args: ToastProps) => {
  const [instanceKey, setInstanceKey] = useState(0);

  return (
    <div
      style={{
        position: 'relative',
        width: `${TOAST_PREVIEW_WIDTH}px`,
        height: `${TOAST_PREVIEW_HEIGHT}px`,
        overflow: 'hidden'
      }}
    >
      <button
        type="button"
        onClick={() => setInstanceKey((currentKey) => currentKey + 1)}
        style={{
          appearance: 'none',
          border: '1px solid #1f1f1f',
          borderRadius: '4px',
          background: '#ffffff',
          color: '#1f1f1f',
          cursor: 'pointer',
          font: 'inherit',
          fontSize: '12px',
          lineHeight: 1,
          padding: '4px 8px',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1
        }}
      >
        Replay
      </button>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${TOAST_STAGE_TOP}px`,
          bottom: `${TOAST_STAGE_BOTTOM_INSET}px`,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}
      >
        <Toast key={instanceKey} {...args} />
      </div>
    </div>
  );
};

const meta = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none'
    }
  },
  render: (args) => <ToastPreview {...args} />,
  argTypes: {
    intent: {
      name: 'Intent',
      description:
        'Sets the semantic meaning and visual treatment of the notification',
      control: 'select',
      options: ['success', 'info', 'warning', 'error'],
      table: { defaultValue: { summary: 'success' } }
    },
    label: {
      name: 'Label',
      description: 'The message text displayed in the toast',
      control: 'text',
      table: { defaultValue: { summary: 'Short toast message goes here.' } }
    },
    link: {
      name: 'Link',
      description: 'Shows or hides an optional inline action link',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } }
    },
    linkLabel: {
      name: 'Link label',
      description: 'Visible text for the optional inline action link',
      control: 'text',
      table: { defaultValue: { summary: 'Link' } }
    },
    timeout: {
      name: 'Timeout',
      description:
        'Auto-dismiss delay in milliseconds. Default 2000; values under 1500 are clamped to 1500.',
      control: { type: 'number', min: 1500, step: 500 },
      table: { defaultValue: { summary: '2000' } }
    },
    className: {
      table: { disable: true }
    },
    style: {
      table: { disable: true }
    },
    children: {
      table: { disable: true }
    }
  },
  args: defaultArgs
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: defaultArgs,
  parameters: {
    design: {
      type: 'figma',
      url: toastFigmaUrl
    }
  }
};

export const Info: Story = {
  args: {
    intent: 'info'
  }
};

export const Warning: Story = {
  args: {
    intent: 'warning'
  }
};

export const Error: Story = {
  args: {
    intent: 'error'
  }
};

export const NoLink: Story = {
  args: {
    link: false
  }
};

export const IntentMatrix: Story = {
  parameters: {
    controls: { disable: true }
  },
  render: (args) => {
    const intents: ToastProps['intent'][] = [
      'success',
      'info',
      'warning',
      'error'
    ];

    return (
      <div style={{ display: 'grid', gap: '12px' }}>
        {intents.map((intent) => (
          <Toast key={intent} {...args} intent={intent} />
        ))}
      </div>
    );
  }
};
