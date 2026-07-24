#!/usr/bin/env node

/**
 * Populates each DS theme directory with Typography directory and DSSpacing.swift file
 * Run before rollup build to ensure themes have all necessary assets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, '../src');
const TYPOGRAPHY_SRC = path.join(SRC_DIR, 'Typography');
const SPACING_SRC = path.join(SRC_DIR, 'DSSpacing.swift');

/**
 * Recursively copy directory
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 */
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

/**
 * Main function
 */
function main() {
  try {
    console.log('📋 Populating DS theme directories...\n');

    // Verify source files exist
    if (!fs.existsSync(TYPOGRAPHY_SRC)) {
      throw new Error(`Typography directory not found: ${TYPOGRAPHY_SRC}`);
    }
    if (!fs.existsSync(SPACING_SRC)) {
      throw new Error(`DSSpacing.swift file not found: ${SPACING_SRC}`);
    }

    // Get all DS theme directories
    const entries = fs.readdirSync(SRC_DIR);
    const themesDirs = entries.filter(
      (entry) =>
        entry.startsWith('DS') &&
        fs.statSync(path.join(SRC_DIR, entry)).isDirectory()
    );

    if (themesDirs.length === 0) {
      console.log('No DS theme directories found.');
      return;
    }

    console.log(`Found ${themesDirs.length} DS theme directories:\n`);

    // Populate each theme directory
    for (const themeDir of themesDirs.sort()) {
      const themePath = path.join(SRC_DIR, themeDir);

      // Copy Typography directory
      const typographyDest = path.join(themePath, 'Typography');
      copyDirRecursive(TYPOGRAPHY_SRC, typographyDest);

      // Copy DSSpacing.swift
      const spacingDest = path.join(themePath, 'DSSpacing.swift');
      fs.copyFileSync(SPACING_SRC, spacingDest);

      console.log(`✓ ${themeDir.padEnd(25)} ✓ Typography/ ✓ DSSpacing.swift`);
    }

    console.log(
      `\n✅ Theme population complete! (${themesDirs.length} themes)`
    );
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
