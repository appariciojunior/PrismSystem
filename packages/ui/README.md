# @ds/ui

The design system's component library: the complete shadcn/ui set (61 components, new-york v4), wired to the token engine.

## How theming works

Components style themselves with Tailwind utilities bound to CSS variables (`--primary`, `--background`, `--radius`, ...). Those variables are written by the Design System Controller (`npm run controller`) into `src/styles/theme.css` every time you Save & apply. Change the brand once, every component follows, light and dark.

## Usage (app side)

```css
/* app.css */
@import "tailwindcss";
@import "@ds/ui/styles/shadcn.css";  /* token contract + base layer */
@import "@ds/ui/styles/theme.css";   /* generated values, light + dark */
```

```tsx
import { Button, Card, CardContent, Dialog } from "@ds/ui";
```

Dark mode: add the `dark` class to `<html>`.

Run `npm install` at the repo root once to fetch dependencies. Icons inside components use lucide (shadcn's internal glue); the product icon set remains Phosphor via `@ds/icons`.
