#!/usr/bin/env node

/**
 * Copy fonts from /fonts to dist/fonts in theme packages
 * Also copy fonts.css to the dist directory
 * This ensures font files and styles are included in npm package distributions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFontsDir = path.resolve(__dirname, '../fonts');
const fontsCssFile = path.resolve(__dirname, './fonts.css');
const packages = [
  { name: 'theme-react', path: '../packages/theme-react/dist/fonts' }
];

try {
  // Get all font files from source
  const fontFiles = fs.readdirSync(sourceFontsDir);

  packages.forEach(({ name, path: targetPath }) => {
    const targetDir = path.resolve(__dirname, targetPath);

    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Copy each font file
    fontFiles.forEach((file) => {
      const sourceFile = path.join(sourceFontsDir, file);
      const targetFile = path.join(targetDir, file);
      fs.copyFileSync(sourceFile, targetFile);
    });

    // Copy fonts.css to the dist directory
    const targetCssFile = path.resolve(
      __dirname,
      `../packages/${name}/dist/fonts.css`
    );
    if (fs.existsSync(fontsCssFile)) {
      fs.copyFileSync(fontsCssFile, targetCssFile);
      console.log(`✓ Copied fonts.css to packages/${name}/dist`);
    }

    console.log(
      `✓ Copied ${fontFiles.length} fonts to packages/${name}/dist/fonts`
    );
  });

  console.log(`✓ All font files and styles distributed to theme packages`);
} catch (error) {
  console.error(`✗ Failed to copy fonts:`, error.message);
  process.exit(1);
}
