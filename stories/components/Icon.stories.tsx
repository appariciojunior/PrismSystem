import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Icon } from '../../packages/components-react/src/Icon/Icon';
import { iconMap, type IconName } from '@ds/icons';

// Get a sample of available icon names for the dropdown
const availableIcons = Object.keys(iconMap) as IconName[];

console.log('Available icons for Storybook:', availableIcons);

// Extract base icon names (without variant prefix)
const baseIconNames = Array.from(
  new Set(
    availableIcons.map((icon) => {
      const parts = icon.split('_');
      return parts.slice(1).join('_'); // Remove variant prefix (filled/outlined)
    })
  )
).sort();

const defaultIconArgs = {
  baseName: '10k',
  variant: 'filled' as 'filled' | 'outlined',
  size: {
    width: '24',
    height: '24'
  }
};

const meta = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none'
    }
  },
  argTypes: {
    baseName: {
      name: 'Icon Base Name',
      description:
        'Selects which icon to display. Over 3900 icons available from the Material Design icon set.',
      control: 'select',
      options: baseIconNames,
      table: { defaultValue: { summary: '10k' } }
    },
    variant: {
      name: 'Variant',
      description: 'Toggle between filled and outlined icon styles',
      control: 'radio',
      options: ['filled', 'outlined'],
      table: { defaultValue: { summary: 'filled' } }
    },
    size: {
      name: 'Size',
      description: 'Sets the icon dimensions',
      control: 'object',
      table: { defaultValue: { summary: '{ width: "24", height: "24" }' } }
    }
  }
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: defaultIconArgs,
  render: (args) => {
    const iconName = `${args.variant}_${args.baseName}` as IconName;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '120px',
          height: '120px',
          padding: '16px',
          border: '1px solid var(--ds-border-secondary, #cccccc)',
          borderRadius: '8px',
          backgroundColor: 'var(--ds-surface-canvas, #ffffff)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Icon iconName={iconName} size={args.size} />
      </div>
    );
  }
};

export const Small: Story = {
  args: {
    ...defaultIconArgs,
    size: {
      width: '16',
      height: '16'
    }
  },
  render: (args) => {
    const iconName = `${args.variant}_${args.baseName}` as IconName;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          padding: '16px',
          border: '1px solid var(--ds-border-secondary, #cccccc)',
          borderRadius: '8px',
          backgroundColor: 'var(--ds-surface-canvas, #ffffff)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Icon iconName={iconName} size={args.size} />
      </div>
    );
  }
};

export const Medium: Story = {
  args: {
    ...defaultIconArgs,
    size: {
      width: '24',
      height: '24'
    }
  },
  render: (args) => {
    const iconName = `${args.variant}_${args.baseName}` as IconName;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '120px',
          height: '120px',
          padding: '16px',
          border: '1px solid var(--ds-border-secondary, #cccccc)',
          borderRadius: '8px',
          backgroundColor: 'var(--ds-surface-canvas, #ffffff)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Icon iconName={iconName} size={args.size} />
      </div>
    );
  }
};

export const Large: Story = {
  args: {
    ...defaultIconArgs,
    size: {
      width: '32',
      height: '32'
    }
  },
  render: (args) => {
    const iconName = `${args.variant}_${args.baseName}` as IconName;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '140px',
          height: '140px',
          padding: '16px',
          border: '1px solid var(--ds-border-secondary, #cccccc)',
          borderRadius: '8px',
          backgroundColor: 'var(--ds-surface-canvas, #ffffff)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Icon iconName={iconName} size={args.size} />
      </div>
    );
  }
};

export const ExtraLarge: Story = {
  args: {
    ...defaultIconArgs,
    size: {
      width: '48',
      height: '48'
    }
  },
  render: (args) => {
    const iconName = `${args.variant}_${args.baseName}` as IconName;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '160px',
          height: '160px',
          padding: '16px',
          border: '1px solid var(--ds-border-secondary, #cccccc)',
          borderRadius: '8px',
          backgroundColor: 'var(--ds-surface-canvas, #ffffff)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Icon iconName={iconName} size={args.size} />
      </div>
    );
  }
};

export const AllSizes: Story = {
  args: defaultIconArgs,
  render: (args) => {
    const iconName = `${args.variant}_${args.baseName}` as IconName;
    const sizes = [
      { width: '16', height: '16', label: '16px' },
      { width: '24', height: '24', label: '24px' },
      { width: '32', height: '32', label: '32px' },
      { width: '48', height: '48', label: '48px' }
    ];

    return (
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {sizes.map((sizeConfig) => (
          <div key={sizeConfig.label}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100px',
                height: '100px',
                padding: '12px',
                border: '1px solid var(--ds-border-secondary, #cccccc)',
                borderRadius: '6px',
                backgroundColor: 'var(--ds-surface-canvas, #ffffff)',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)'
              }}
            >
              <Icon iconName={iconName} size={sizeConfig} />
            </div>
            <p
              style={{
                fontSize: '12px',
                marginTop: '8px',
                textAlign: 'center',
                color: 'var(--ds-text-secondary, #404040)'
              }}
            >
              {sizeConfig.label}
            </p>
          </div>
        ))}
      </div>
    );
  }
};

export const Gallery: Story = {
  args: defaultIconArgs,
  render: (args) => {
    const size = { width: '24', height: '24' };

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '16px',
          padding: '24px',
          backgroundColor: 'var(--ds-surface-canvas, #ffffff)'
        }}
      >
        {baseIconNames.map((baseName) => {
          const iconName = `${args.variant}_${baseName}` as IconName;

          return (
            <div
              key={baseName}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '8px',
                padding: '12px',
                border: '1px solid var(--ds-border-secondary, #cccccc)',
                borderRadius: '8px',
                backgroundColor: 'var(--ds-surface-secondary, #f5f5f5)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                ':hover': {
                  backgroundColor: 'var(--ds-surface-primary, #e8e8e8)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '60px',
                  height: '60px'
                }}
              >
                <Icon iconName={iconName} size={size} />
              </div>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  margin: 0,
                  textAlign: 'center',
                  color: 'var(--ds-text-secondary, #404040)',
                  wordBreak: 'break-word',
                  maxWidth: '100%'
                }}
              >
                {baseName}
              </p>
            </div>
          );
        })}
      </div>
    );
  }
};
