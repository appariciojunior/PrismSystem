import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Custom plugin to copy SCSS and CSS files after build
const copyPlugin = {
  name: 'copy-assets',
  writeBundle() {
    const srcDir = path.join(__dirname, 'src');
    const distDir = path.join(__dirname, 'dist');

    // Ensure dist directory exists
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Copy SCSS files from src root
    const scssFiles = ['ds-layout.scss', 'ds-typography.scss'];
    scssFiles.forEach((file) => {
      const src = path.join(srcDir, file);
      if (fs.existsSync(src)) {
        const dest = path.join(distDir, file);
        fs.copyFileSync(src, dest);
      }
    });

    // Copy SCSS palette files
    const palettesSrc = path.join(srcDir, 'palettes');
    if (fs.existsSync(palettesSrc)) {
      const palettesDest = path.join(distDir, 'palettes');
      if (!fs.existsSync(palettesDest)) {
        fs.mkdirSync(palettesDest, { recursive: true });
      }
      const files = fs.readdirSync(palettesSrc);
      files.forEach((file) => {
        if (file.endsWith('.scss')) {
          const src = path.join(palettesSrc, file);
          const dest = path.join(palettesDest, file);
          fs.copyFileSync(src, dest);
        }
      });
    }
  }
};

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
