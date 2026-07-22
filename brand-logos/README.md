# Brand logos

Drop your own logo assets in this folder. Every generated screen and prototype pulls its logo from here, so the design system can show your brand without anyone retyping the wordmark as styled text or redrawing a crest.

This starter ships without logo files. The originals that lived here were brand-specific and have been removed. Add your own before generating screens that show a masthead, navigation bar or footer.

## What to add

Provide the logo variants your surfaces need. A typical set:

| Suggested file | What it is | Use on |
|---|---|---|
| `logo-light.svg` | Primary wordmark or logotype, dark ink | Light surfaces: mastheads, print-like headers |
| `logo-dark.svg` | Wordmark, light/white | Dark surfaces: global navigation, footers |
| `logo-mark.svg` | Compact symbol or monogram | Tight spaces, favicons, app tiles |

Vector (SVG) is preferred so logos scale cleanly and can be themed through a fill variable (for example `var(--fill-0, currentColor)`) when inlined. Raster (PNG) works at a fixed size where vector is not available.

## Rules

1. Every prototype, mock and generated screen uses these files for the logo. Styled text is never an acceptable stand-in.
2. Keep the aspect ratio. Never stretch, recolour, crop or add effects.
3. Match the logo variant to the surface: dark-ink logos on light backgrounds, light logos on dark backgrounds.
4. If your organisation has logo usage guidelines, follow them here.
