import { Text } from '@ds/components-react/Text';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'Components/Text',
  component: Text,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered'
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    styles: { control: 'object' }
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    children: 'This is the Design System Text component.'
  }
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default = {
  args: {}
};

export const AsHeadingElement = {
  args: {
    as: 'h1'
  }
};

export const WithTypographyStyle = {
  args: {
    typographyStyle: 'brand.heading.fluid.light.large'
  }
};

export const WithStyle = {
  args: {
    styles: {
      fontWeight: 'bold',
      color: '#FF5733',
      fontSize: '24px'
    }
  }
};
