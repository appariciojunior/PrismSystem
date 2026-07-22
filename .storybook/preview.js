import React from 'react';
import { create } from 'storybook/theming';
import { DocsContainer } from '@storybook/addon-docs/blocks';

const docsLightTheme = create({
  base: 'light',
  fontBase: '"Inter", system-ui, -apple-system, sans-serif',
  fontCode:
    '"IBM Plex Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  colorPrimary: '#005C8A',
  colorSecondary: '#000000',
  appContentBg: '#ffffff',
  textColor: '#1a1a1a',
  textMutedColor: '#404040'
});

/** @type { import('@storybook/nextjs-vite').Preview } */
const preview = {
  decorators: [
    (Story) => {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-color-mode', 'light');
        document.documentElement.setAttribute('data-theme', 'core');
        document.body?.setAttribute('data-color-mode', 'light');
        document.body?.setAttribute('data-theme', 'core');
      }

      return Story();
    }
  ],

  parameters: {
    options: {
      storySort: {
        /**
         * Storybook Navigation IA (single control point)
         *
         * L1 = top-level sections/pages
         * L2 = children of an L1 section
         * L3 = children of an L2 subsection
         *
         * Note: "Introduction" is both an L1 item and a standalone page.
         */
        order: [
          // L1 — standalone page
          'Foundations',
          [
            // L2 (Foundations children)
            'Design Tokens',
            'Tokens MCP',
            '*'
          ],

          // L1 — standalone page
          'Introduction',

          // L1 — section
          'Theme',
          [
            // L2 (Theme children)
            'Grid',

            // L2 — subsection
            'Color Palette',
            [
              // L3 (Theme > Color Palette children)
              'Core',
              'Foundation',
              'Channels',
              'Brands',
              'Marketing',
              'Comment',
              'Data-Vis',
              'LifeStyle',
              'Puzzles',
              '*'
            ],

            // L2 — subsection
            'Typography',
            [
              // L3 (Theme > Typography children)
              'Base',
              'Composed',
              '*'
            ],
            '*'
          ],

          // L1 — section
          'Components',
          [
            // L2 (Components children)
            'AdContainer',

            // L2 — subsection
            'Articles',
            [
              // L3 (Components > Articles children)
              'UpNextArticles',
              '*'
            ],

            // L2 (Components children)
            'Button',
            'CommentsDisabled',
            'Divider',
            'Flag',
            'Input',
            'IconButton',
            'Link',
            'Text',
            '*'
          ],

          // L1 — section
          'Pages',
          [
            // L2 (Pages children)
            'CheckoutPage',
            '*'
          ],

          // Keep any unmatched stories at the end
          '*'
        ],
        method: 'configure',
        locales: 'en-US'
      }
    },

    viewport: {
      options: {
        small: {
          name: 'small (0-767px)',
          styles: {
            width: '767px',
            height: '1024px'
          },
          type: 'mobile'
        },
        medium: {
          name: 'medium (768-1023px)',
          styles: {
            width: '1023px',
            height: '1024px'
          },
          type: 'tablet'
        },
        large: {
          name: 'large (1024-1439px)',
          styles: {
            width: '1439px',
            height: '1024px'
          },
          type: 'desktop'
        },
        xlarge: {
          name: 'xlarge (1440-∞px)',
          styles: {
            width: '1440px',
            height: '1024px'
          },
          type: 'desktop'
        }
      }
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },

    docs: {
      container: (props) =>
        React.createElement(DocsContainer, {
          ...props,
          theme: docsLightTheme
        })
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  }
};

export default preview;
