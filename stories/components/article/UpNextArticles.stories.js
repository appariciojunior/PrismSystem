import { UpNextArticles } from '@ds/components-react';
import upNextArticlesData from '../../fixtures/upNextArticles.json';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'Components/Articles/UpNextArticles',
  component: UpNextArticles,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered'
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs']
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  // argTypes: {
  //   "Number of upNext articles": { control: 'select', options: [1, 2, 3, 4], defaultValue: 4 },
  // },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  // args: {
  //   upNextArticles: upNextArticlesData.upNextArticles.slice(0, ["Number of upNext articles"]),
  // },
};
// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
//  articleUpNextData.items.slice(4 - upNextArticles)
export const Default = {
  args: {
    upNextArticles: upNextArticlesData.upNextArticles
  }
};
export const WithNoArticles = {
  args: {
    upNextArticles: []
  }
};
export const WithTwoArticles = {
  args: {
    upNextArticles: upNextArticlesData.upNextArticles.slice(0, 2)
  }
};
