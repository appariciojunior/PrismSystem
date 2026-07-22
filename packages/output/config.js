import { formatJS } from './src/scripts/theme-formatting/format-js.js';
import { formatCSS } from './src/scripts/theme-formatting/format-css.js';
import {
  formatSCSS,
  formatSCSSPalette,
  formatSCSSLayout
} from './src/scripts/theme-formatting/format-scss.js';
import {
  formatIOSColours,
  formatIOSTypography,
  formatIOSSpacing
} from './src/scripts/theme-formatting/format-ios.js';
import tokens from './tokens-reconciled.json' with { type: 'json' };

const myPreprocessor = {
  name: 'strip-props',
  preprocessor: async (dictionary) => dictionary
};

const tokensArr = Object.keys(tokens).filter(
  (token) => token.includes('dark/') || token.includes('light/')
);

const iosPaletteObjects = tokensArr.map((palette) => {
  const paletteName = palette.replace(/light\/ |dark\/ /g, '').trim();

  return {
    format: 'formatIOSColours',
    filter: (token) => token.path[0].includes(paletteName)
  };
});

const paletteTokensArr = (filter) => {
  const keys = Object.keys(tokens);
  return filter ? keys.filter(filter) : keys;
};

const scssFilters = (file, filter, format = 'formatSCSS') => ({
  destination: format === 'formatSCSSPalette' ? `/palettes/${file}` : `${file}`,
  format,
  options: {
    minify: true,
    outputReferences: true
  },
  filter
});

const scssPaletteObjects = (filter) => {
  const tokensArr = paletteTokensArr(filter);
  return tokensArr.map((palette) => {
    const isDark = palette.includes('dark/ ');
    const paletteName = palette.replace(/light\/ |dark\/ /g, '').trim();

    return scssFilters(
      `_${paletteName}${isDark ? '-dark' : '-light'}.scss`,
      (token) => token.path[0] === palette,
      'formatSCSSPalette'
    );
  });
};

export default {
  source: ['packages/output/tokens-reconciled.json'],
  hooks: {
    preprocessors: {
      'strip-props': myPreprocessor
    },
    transforms: {
      // remove unit from token, calculate its value if it contains a mathematical expression and then add unit back
      calculateValue: {
        type: 'value',
        transitive: true,
        warnImmediately: false,
        transform: (token) => {
          // Skip non-string values (objects like boxShadow)
          if (typeof token.value !== 'string') {
            return token.value;
          }

          const baseUnit = token.value.match(/rem/g);
          const baseNumericalValue = token.value.replace(/rem|%/gi, '');

          let calculatedValue = token.value.includes('*')
            ? `${+eval(`${baseNumericalValue}`).toFixed(3)}${baseUnit ? baseUnit : ''}`
            : token.value;

          if (token.name.includes('LineHeight')) {
            calculatedValue =
              calculatedValue === '100%' ? 1 : +eval(`${calculatedValue}`);
          }
          if (token.name.includes('FontWeight')) {
            const baseWeight = token.name.replace('FoundationFontWeight0', '');
            calculatedValue = eval(baseWeight * 10);
          }

          return calculatedValue;
        }
      }
    },
    // Same with formats, you can now write them directly to this config
    // object. The name of the format is the key.
    formats: {
      formatJS: (dictionary) => formatJS(dictionary),
      formatCSS: ({ dictionary, options }) =>
        formatCSS({ dictionary, options }),
      formatSCSS: ({ dictionary, options }) =>
        formatSCSS({ dictionary, options }),
      formatSCSSPalette: ({ dictionary, options }) =>
        formatSCSSPalette({ dictionary, options }),
      formatSCSSLayout: ({ dictionary, options }) =>
        formatSCSSLayout({ dictionary, options }),
      formatIOSColours: ({ dictionary, options }) =>
        formatIOSColours({ dictionary, options }),
      formatIOSTypography: ({ dictionary, options }) =>
        formatIOSTypography({ dictionary, options }),
      formatIOSSpacing: ({ dictionary, options }) =>
        formatIOSSpacing({ dictionary, options })
    }
  },
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'packages/theme-css/src',
      transforms: ['calculateValue'],
      files: [
        {
          destination: 'variables.css',
          format: 'formatCSS',
          options: {
            minify: true,
            outputReferences: true
          }
        }
      ]
    },
    scss: {
      transformGroup: 'scss',
      buildPath: 'packages/theme-scss/src',
      transforms: ['calculateValue'],
      files: [
        scssFilters('ds-typography.scss', (token) =>
          /^(foundation|typographyTokens|viewport)/.test(token.path[0])
        ),
        scssFilters(
          'ds-layout.scss',
          (token) =>
            /^(foundation|viewport|shadows|borderRadius)/.test(token.path[0]),
          'formatSCSSLayout'
        ),
        ...scssPaletteObjects((key) => /^(foundation|light\/|dark\/)/.test(key))
      ]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'build/js/',
      warnImmediately: false,
      transitive: true,
      files: [
        {
          format: 'formatJS',
          destination: 'tokens.json',
          options: {
            outputReferences: true
          }
        }
      ]
    },
    ios: {
      transformGroup: 'ios',
      buildPath: 'packages/theme-ios/src',
      warnImmediately: false,
      transitive: true,
      files: [
        {
          format: 'formatIOSTypography',
          destination: 'Typography/DSTypography.swift',
          options: {
            outputReferences: true
          },
          filter: (token) => token.path[0] === 'typographyTokens'
        },
        {
          format: 'formatIOSSpacing',
          destination: 'DSSpacing.swift',
          filter: (token) =>
            token.key.includes('viewport/ small.spacing.static')
        },
        ...iosPaletteObjects
      ]
    }
  }
};
