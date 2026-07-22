#!/usr/bin/env node

/**
 * Copy generated variables.css from build/css to .storybook/public
 * Run after style-dictionary build to keep Storybook styles in sync
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFile = path.resolve(
  __dirname,
  '../packages/theme-css/src/variables.css'
);
const storybookTarget = path.resolve(
  __dirname,
  '../.storybook/public/variables.css'
);

try {
  // Ensure source file exists
  if (!fs.existsSync(sourceFile)) {
    console.error(`✗ Source file not found: ${sourceFile}`);
    process.exit(1);
  }

  // Create target directory if it doesn't exist
  const targetDir = path.dirname(storybookTarget);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy variables.css to storybook
  fs.copyFileSync(sourceFile, storybookTarget);
  console.log(`✓ Copied variables.css to .storybook/public`);
} catch (error) {
  console.error(`✗ Failed to copy variables.css:`, error.message);
  process.exit(1);
}
