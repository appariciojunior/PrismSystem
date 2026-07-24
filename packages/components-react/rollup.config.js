import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';

const input = {
  index: 'src/index.js',
  'Button/Button': 'src/Button/Button.tsx',
  'Button/ButtonContainer': 'src/Button/ButtonContainer.tsx',
  'IconButton/IconButton': 'src/IconButton/IconButton.tsx',
  'AdContainer/AdContainer': 'src/AdContainer/AdContainer.tsx',
  'CommentsDisabled/CommentsDisabled':
    'src/CommentsDisabled/CommentsDisabled.tsx',
  'Text/Text': 'src/Text/Text.tsx',
  'Input/Input': 'src/Input/Input.tsx',
  'Divider/Divider': 'src/Divider/Divider.tsx',
  'Link/Link': 'src/Link/Link.tsx',
  'Chip/Chip': 'src/Chip/Chip.tsx',
  'Flag/Flag': 'src/Flag/Flag.tsx',
  'Toast/Toast': 'src/Toast/Toast.tsx',
  'Icon/Icon': 'src/Icon/Icon.tsx',
  'Article/UpNextArticles': 'src/Article/UpNextArticles/UpNextArticles.tsx',
  'utils/hooks': 'src/utils/hooks.ts'
};

export default {
  input,
  output: [
    {
      dir: 'dist',
      format: 'es',
      sourcemap: true,
      entryFileNames: '[name].js',
      chunkFileNames: 'shared/[name]-[hash].js'
    },
    {
      dir: 'dist',
      format: 'cjs',
      sourcemap: true,
      entryFileNames: '[name].cjs',
      chunkFileNames: 'shared/[name]-[hash].cjs'
    }
  ],
  plugins: [
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist'
    }),
    postcss({
      extract: false, // Inject CSS into JS
      inject: true, // Inject CSS into the head
      minimize: true,
      sourceMap: true,
      modules: {
        generateScopedName: '[name]__[local]___[hash:base64:5]'
      },
      use: {
        sass: {
          data: `@import "src/styles/variables.scss";` // Global SCSS variables
        }
      }
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/(?!@ds)/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      presets: ['@babel/preset-env', '@babel/preset-react']
    }),
    copy({
      targets: [{ src: 'src/**/*.css', dest: 'dist', flatten: false }]
    })
  ],
  external: ['react', 'react-dom'] // Don't bundle React
};
