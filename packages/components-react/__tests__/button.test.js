import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const buttonTsPath = path.join(root, 'src/Button/Button.tsx');
const buttonCssPath = path.join(root, 'src/Button/styles.css');
const buttonStoryPath = path.resolve(
  root,
  '../../stories/components/Button.stories.tsx'
);

function mustContain(content, expected, label) {
  if (!content.includes(expected)) {
    throw new Error(`Expected ${label} to include: ${expected}`);
  }
}

const buttonTs = fs.readFileSync(buttonTsPath, 'utf8');
const buttonCss = fs.readFileSync(buttonCssPath, 'utf8');
const buttonStories = fs.readFileSync(buttonStoryPath, 'utf8');

// API and default contract
mustContain(
  buttonTs,
  "type ButtonSize = 'Small' | 'Medium' | 'Large' | 'XLarge';",
  'Button.tsx size union'
);
mustContain(buttonTs, "size = 'Medium'", 'Button.tsx default size');

// Visual size contract in CSS
mustContain(
  buttonCss,
  '.ds-button--size-small {',
  'styles.css small size class'
);
mustContain(buttonCss, 'min-height: 40px;', 'styles.css small min-height');
mustContain(
  buttonCss,
  '.ds-button--size-large {',
  'styles.css large size class'
);
mustContain(buttonCss, 'min-height: 56px;', 'styles.css large min-height');
mustContain(
  buttonCss,
  '.ds-button--size-xlarge {',
  'styles.css xlarge size class'
);
mustContain(buttonCss, 'min-height: 64px;', 'styles.css xlarge min-height');
mustContain(
  buttonCss,
  '.ds-button--size-xlarge .ds-button__icon,',
  'styles.css xlarge icon selector'
);
mustContain(buttonCss, 'width: 28px;', 'styles.css xlarge icon width');

// Storybook controls and story coverage
mustContain(
  buttonStories,
  "options: ['Small', 'Medium', 'Large', 'XLarge']",
  'Button.stories.tsx size options'
);
mustContain(
  buttonStories,
  'export const XLarge: Story = {',
  'Button.stories.tsx XLarge story'
);
mustContain(
  buttonStories,
  'export const SizeRegressionMatrix: Story = {',
  'Button.stories.tsx size regression story'
);

console.log('button.test.js passed');
