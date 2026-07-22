#!/usr/bin/env node

/**
 * Copy token files from build directories to theme package source directories
 * - Copies build/js to packages/theme-react/src/js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const copyConfigs = [
  {
    name: 'React',
    source: path.join(projectRoot, 'build/js'),
    target: path.join(projectRoot, 'packages/theme-react/src/js'),
    package: 'theme-react'
  }
];

try {
  copyConfigs.forEach((config) => {
    // Create target directory if it doesn't exist
    if (!fs.existsSync(config.target)) {
      fs.mkdirSync(config.target, { recursive: true });
    }

    // Read all files from source directory
    const files = fs.readdirSync(config.source);
    let copiedCount = 0;

    // Copy each file
    files.forEach((file) => {
      const sourceFile = path.join(config.source, file);
      const targetFile = path.join(config.target, file);

      // Only copy files (not directories)
      if (fs.statSync(sourceFile).isFile()) {
        fs.copyFileSync(sourceFile, targetFile);
        console.log(`✓ Copied ${file}`);
        copiedCount++;
      }
    });

    console.log(
      `✓ All ${config.name} token files copied to packages/${config.package}/src/js (${copiedCount} files)`
    );
    console.log('');
  });
} catch (error) {
  console.error('✗ Error copying token files:', error.message);
  process.exit(1);
}
