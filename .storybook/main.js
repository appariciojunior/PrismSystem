import { createRequire } from 'module';
import { join, dirname } from 'path';

const require = createRequire(import.meta.url);

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

/** @type { import('@storybook/nextjs-vite').StorybookConfig } */
const config = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  staticDirs: ['./public'],

  addons: [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-designs'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-vitest')
  ],
  framework: {
    name: getAbsolutePath('@storybook/nextjs-vite'),
    options: {}
  },
  typescript: {
    reactDocgen: 'react-docgen',
    reactDocgenOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => {
        if (prop.parent) {
          return !/node_modules/.test(prop.parent.fileName);
        }
        return true;
      }
    }
  },
  viteFinal: async (config) => {
    config.resolve.conditions = [
      'development',
      ...(config.resolve.conditions ?? [])
    ];
    return config;
  }
};
export default config;
