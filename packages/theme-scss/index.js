// Entry point for the package
// Use the built dist directory

// Import CSS
import './dist/fonts.css';
import './dist/variables.css';

export { default as tokens } from './dist/tokens.js';
export { useTypographyToken } from './dist/hooks.js';
