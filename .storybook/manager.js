/**
 * Storybook Manager Configuration — Design System
 *
 * Light-mode only. Dark-mode functionality has been removed.
 *
 * Token source: packages/tokens/src/tokens.json
 * Resolved values: .storybook/public/variables.css
 */

import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

const lightTheme = create({
  base: 'light',

  // ── Branding ──────────────────────────────────────────────
  brandTitle: 'Design System',
  brandUrl: '/',
  brandImage: '/logo.svg',
  brandTarget: '_self',

  // ── Typography ────────────────────────────────────────────
  fontBase: '"Inter", system-ui, -apple-system, sans-serif',
  fontCode:
    '"IBM Plex Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',

  // ── Brand Colours ─────────────────────────────────────────
  colorPrimary: '#005C8A',
  colorSecondary: '#000000',

  // ── UI Surfaces ───────────────────────────────────────────
  appBg: '#f2f2f2',
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appBorderColor: '#e6e6e6',
  appBorderRadius: 4,

  // ── Text ──────────────────────────────────────────────────
  textColor: '#1a1a1a',
  textInverseColor: '#ffffff',
  textMutedColor: '#404040',

  // ── Toolbar ───────────────────────────────────────────────
  barBg: '#ffffff',
  barTextColor: '#404040',
  barHoverColor: '#1a1a1a',
  barSelectedColor: '#000000',

  // ── Form Inputs ───────────────────────────────────────────
  inputBg: '#ffffff',
  inputBorder: '#cccccc',
  inputTextColor: '#1a1a1a',
  inputBorderRadius: 4,

  // ── Controls ──────────────────────────────────────────────
  buttonBg: '#ffffff',
  buttonBorder: '#8c8c8c',
  booleanBg: '#ffffff',
  booleanSelectedBg: '#000000'
});

addons.setConfig({
  theme: lightTheme,
  panelPosition: 'right'
});

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-color-mode', 'light');
  document.body?.setAttribute('data-color-mode', 'light');
}
