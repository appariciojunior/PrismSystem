/**
 * Contrast Check Tool
 * Skill: color-ramps/contrast-check.md
 *
 * Calculate WCAG contrast ratio between two colors.
 */

import { getHex, isDbPopulated } from './hex-db.js';

/**
 * Try to resolve a colour input via the DB (token path) or return it as-is (hex).
 * Returns { hex: string|null, resolvedFrom: 'figma-db'|'tokens-json'|'literal' }
 */
function resolveColour(input) {
  // Looks like a hex value already
  if (input && /^#[0-9a-fA-F]{3,8}$/.test(input.trim())) {
    return { hex: input.trim(), resolvedFrom: 'literal' };
  }

  // Try DB using light mode as default for token paths
  if (isDbPopulated()) {
    const lightHex = getHex(input, 'light');
    if (lightHex) return { hex: lightHex, resolvedFrom: 'figma-db' };
    const darkHex = getHex(input, 'dark');
    if (darkHex) return { hex: darkHex, resolvedFrom: 'figma-db' };
  }

  // Not resolvable via DB — return the raw input and let hexToRgb fail gracefully
  return { hex: input, resolvedFrom: 'tokens-json' };
}

/**
 * Parse a hex color string to RGB values.
 */
function hexToRgb(hex) {
  const clean = hex.replace(/^#/, '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16)
    };
  }
  return null;
}

/**
 * Calculate relative luminance per WCAG 2.1.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio per WCAG 2.1.
 */
function contrastRatio(lum1, lum2) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check WCAG contrast compliance.
 */
export function contrastCheck({ foreground, background, level }) {
  const fgResolved = resolveColour(foreground);
  const bgResolved = resolveColour(background);

  const fgRgb = hexToRgb(fgResolved.hex);
  const bgRgb = hexToRgb(bgResolved.hex);

  if (!fgRgb) {
    return {
      error: `Invalid foreground color: ${foreground}. Provide a hex value like #000000.`,
      hint: 'If you have a token path, use hex_lookup first to get the hex value.'
    };
  }

  if (!bgRgb) {
    return {
      error: `Invalid background color: ${background}. Provide a hex value like #ffffff.`,
      hint: 'If you have a token path, use hex_lookup first to get the hex value.'
    };
  }

  const fgLum = relativeLuminance(fgRgb);
  const bgLum = relativeLuminance(bgRgb);
  const ratio = contrastRatio(fgLum, bgLum);

  const thresholds = {
    AA: { normalText: 4.5, largeText: 3.0, uiComponents: 3.0 },
    AAA: { normalText: 7.0, largeText: 4.5, uiComponents: 3.0 }
  };

  const threshold = thresholds[level];

  return {
    foreground: {
      input: foreground,
      hex: fgResolved.hex,
      rgb: fgRgb,
      luminance: Math.round(fgLum * 10000) / 10000,
      resolvedFrom: fgResolved.resolvedFrom
    },
    background: {
      input: background,
      hex: bgResolved.hex,
      rgb: bgRgb,
      luminance: Math.round(bgLum * 10000) / 10000,
      resolvedFrom: bgResolved.resolvedFrom
    },
    ratio: Math.round(ratio * 100) / 100,
    ratioString: `${Math.round(ratio * 100) / 100}:1`,
    level,
    passes: {
      normalText: ratio >= threshold.normalText,
      largeText: ratio >= threshold.largeText,
      uiComponents: ratio >= threshold.uiComponents
    },
    thresholds: {
      normalText: `${threshold.normalText}:1`,
      largeText: `${threshold.largeText}:1`,
      uiComponents: `${threshold.uiComponents}:1`
    },
    overall: ratio >= threshold.normalText ? 'PASS' : 'FAIL'
  };
}
