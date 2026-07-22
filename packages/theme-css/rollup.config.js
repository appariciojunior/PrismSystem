import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Custom plugin to copy CSS files after build
const copyPlugin = {
  name: 'copy-assets',
  writeBundle() {
    const srcDir = path.join(__dirname, 'src');
    const distDir = path.join(__dirname, 'dist');

    // Ensure dist directory exists
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Copy variables.css
    const cssFile = path.join(srcDir, 'variables.css');
    if (fs.existsSync(cssFile)) {
      const dest = path.join(distDir, 'variables.css');
      fs.copyFileSync(cssFile, dest);
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
