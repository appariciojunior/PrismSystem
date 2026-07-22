import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Custom plugin to copy iOS theme files after build
const copyPlugin = {
  name: 'copy-assets',
  writeBundle() {
    const srcDir = path.join(__dirname, 'src');
    const distDir = path.join(__dirname, 'dist');

    // Ensure dist directory exists
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Copy all DS theme directories (DSBrand, DSCore, etc.)
    const entries = fs.readdirSync(srcDir);
    const themesDirs = entries.filter(
      (entry) =>
        (entry.startsWith('DS') || entry === 'Typography') &&
        fs.statSync(path.join(srcDir, entry)).isDirectory()
    );

    for (const themeDir of themesDirs) {
      const themeSrc = path.join(srcDir, themeDir);
      const themeDest = path.join(distDir, themeDir);
      if (!fs.existsSync(themeDest)) {
        fs.mkdirSync(themeDest, { recursive: true });
      }
      copyDirRecursive(themeSrc, themeDest);
    }

    // Copy all Preset files (DSColorsPreset.swift, etc.)
    const srcFiles = fs.readdirSync(srcDir);
    const presetFiles = srcFiles.filter((file) =>
      file.endsWith('Preset.swift')
    );

    for (const presetFile of presetFiles) {
      const src = path.join(srcDir, presetFile);
      const dest = path.join(distDir, presetFile);
      fs.copyFileSync(src, dest);
    }
  }
};

// Helper function to recursively copy directories
function copyDirRecursive(src, dest) {
  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

export default {
  input: 'src/index.js',
  external: [],
  output: [
    {
      file: 'dist/index.js',
      format: 'es'
    }
  ],
  plugins: [copyPlugin]
};
