import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
 Divider,
 type DividerProps
} from '../../packages/components-react/src/Divider/Divider';

const dividerFigmaUrl =
 'https://www.figma.com/design/YOUR-FIGMA-FILE-KEY/Token-Library---Design-System?node-id=7459-10736';

const defaultArgs: DividerProps = {
 padding: true
};

const meta = {
 title: 'Components/Divider',
 component: Divider,
 parameters: {
 layout: 'padded',
 controls: {
 sort: 'none'
 }
 },
 argTypes: {
 isDashed: {
 name: 'isDashed',
 description:
 'Sets the line style. Dashed for section breaks, solid for structural separation.',
 control: 'select',
 options: [true, false],
 table: { defaultValue: { summary: 'false' } }
 },
 isVertical: {
 name: 'isVertical',
 description: 'Sets the axis along which the divider is drawn.',
 control: 'select',
 options: [true, false],
 table: { defaultValue: { summary: 'false' } }
 },
 padding: {
 name: 'Padding',
 description: 'Adds gutter spacing (24px) around the line.',
 control: 'boolean',
 table: { defaultValue: { summary: 'true' } }
 },
 className: {
 table: { disable: true }
 }
 },
 args: defaultArgs
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
 args: defaultArgs,
 parameters: {
 design: {
 type: 'figma',
 url: dividerFigmaUrl
 }
 }
};

export const Solid: Story = {
 args: {
 isDashed: false,
 isVertical: false,
 padding: true
 }
};

export const DashedNoPadding: Story = {
 name: 'Dashed — no padding',
 args: {
 isDashed: true,
 isVertical: false,
 padding: false
 }
};

export const SolidNoPadding: Story = {
 name: 'Solid — no padding',
 args: {
 isDashed: false,
 isVertical: false,
 padding: false
 }
};

export const VerticalDashed: Story = {
 name: 'Vertical — dashed',
 args: {
 isDashed: true,
 isVertical: true,
 padding: true
 },
 render: (args) => (
 <div style={{ display: 'flex', height: '120px', alignItems: 'stretch' }}>
 <div style={{ flex: 1, padding: '16px' }}>Left</div>
 <Divider {...args} />
 <div style={{ flex: 1, padding: '16px' }}>Right</div>
 </div>
 )
};

export const VerticalSolid: Story = {
 name: 'Vertical — solid',
 args: {
 isDashed: false,
 isVertical: true,
 padding: true
 },
 render: (args) => (
 <div style={{ display: 'flex', height: '120px', alignItems: 'stretch' }}>
 <div style={{ flex: 1, padding: '16px' }}>Left</div>
 <Divider {...args} />
 <div style={{ flex: 1, padding: '16px' }}>Right</div>
 </div>
 )
};
