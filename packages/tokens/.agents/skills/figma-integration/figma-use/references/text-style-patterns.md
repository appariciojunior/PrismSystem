# Text Style API Patterns

> Part of the [figma-use skill](../SKILL.md). How to create, apply, and inspect text styles using the Plugin API.
>
> For design system context (when to create text styles, how they relate to tokens, headless limitations), see [working-with-design-systems/wwds-text-styles.md](working-with-design-systems/wwds-text-styles.md) (if available).

## Contents

- Listing Text Styles
- Creating a Text Style
- Probing Font Styles
- Creating a Type Ramp (Multi-Step)
- Importing Library Text Styles
- Applying Text Styles to Nodes

---

## Listing Text Styles

```javascript
async function listTextStyles() {
  const styles = await figma.getLocalTextStylesAsync();
  return styles.map(s => ({
    id: s.id,
    name: s.name,
    key: s.key,
    fontSize: s.fontSize,
    fontName: s.fontName,
    lineHeight: s.lineHeight,
    letterSpacing: s.letterSpacing
  }));
}

// Full runnable script:
const results = await listTextStyles();
return results;
```

---

## Creating a Text Style

Font **MUST** be loaded before setting `fontName`. `lineHeight` and `letterSpacing` must be `{value, unit}` objects — bare numbers throw.

```javascript
function createTextStyleFull(name, fontName, fontSize, lineHeight, letterSpacing, description) {
  const style = figma.createTextStyle();
  style.name = name;
  style.fontName = fontName;
  style.fontSize = fontSize;
  style.lineHeight = lineHeight; // { unit: 'AUTO' } | { value, unit: 'PIXELS'|'PERCENT' }
  if (letterSpacing) style.letterSpacing = letterSpacing;
  if (description) style.description = description;
  return style;
}

// Usage:
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
const style = createTextStyleFull(
  "Body/Default",
  { family: "Inter", style: "Regular" },
  16,
  { value: 24, unit: "PIXELS" },
  { value: 0, unit: "PERCENT" },
  "CSS: var(--font-body-default)"
);
return { id: style.id };
```

**HEADLESS NOTE:** `setBoundVariable` on `TextStyle` is not supported in headless/`figma_execute`/`use_figma`. Set raw values here. To bind variables, do it interactively in Figma after creation.

---

## Probing Font Styles

Font style names vary per provider and per file (`"SemiBold"` vs `"Semi Bold"`). **Always probe before hardcoding.**

```javascript
async function probeAvailableFontStyles(family, stylesToTest) {
  const available = [];
  for (const style of stylesToTest) {
    try {
      await figma.loadFontAsync({ family, style });
      available.push(style);
    } catch (_) {}
  }
  return available;
}

// Usage:
const available = await probeAvailableFontStyles("Inter", [
  "Thin", "ExtraLight", "Light", "Regular", "Medium",
  "SemiBold", "Semi Bold", "Bold", "ExtraBold", "Black"
]);
return available;
```

---

## Creating a Type Ramp (Multi-Step)

Handles font loading, deduplication, and idempotency. Each entry: `[name, fontFamily, fontStyle, fontSize_px, lineHeight, cssVar]`.

```javascript
/**
 * Creates a full type ramp from a token definition array.
 * - lineHeight: { unit: 'AUTO' } or { value: number, unit: 'PIXELS' | 'PERCENT' }
 */
async function createTypeRamp(defs) {
  const uniqueFonts = new Set();
  for (const [, family, style] of defs) {
    uniqueFonts.add(JSON.stringify({ family, style }));
  }
  await Promise.all(
    [...uniqueFonts].map(f => figma.loadFontAsync(JSON.parse(f)))
  );

  const existing = new Set(
    (await figma.getLocalTextStylesAsync()).map(s => s.name)
  );

  const created = [];
  const skipped = [];

  for (const [name, family, style, fontSize, lineHeight, cssVar] of defs) {
    if (existing.has(name)) {
      skipped.push(name);
      continue;
    }

    const ts = figma.createTextStyle();
    ts.name = name;
    ts.fontName = { family, style };
    ts.fontSize = fontSize;
    ts.lineHeight = lineHeight ?? { unit: 'AUTO' };
    if (cssVar) ts.description = `CSS: var(${cssVar})`;
    created.push(name);
  }

  return { created, skipped };
}

// Full runnable script:
const defs = [
  ['heading/xl', 'Inter', 'Bold',    48, { unit: 'PIXELS', value: 56 }, '--font-heading-xl'],
  ['heading/lg', 'Inter', 'Bold',    36, { unit: 'PIXELS', value: 44 }, '--font-heading-lg'],
  ['body/base',  'Inter', 'Regular', 16, { unit: 'AUTO' },              '--font-body-base'],
  ['body/sm',    'Inter', 'Regular', 14, { unit: 'AUTO' },              '--font-body-sm'],
  ['code/base',  'IBM Plex Mono', 'Regular', 14, { unit: 'AUTO' },        '--font-code-base'],
];
const result = await createTypeRamp(defs);
return result;
```

---

## Importing Library Text Styles

For text styles from **team libraries**, use `importStyleByKeyAsync`:

```javascript
// Import a library text style by key
const headingStyle = await figma.importStyleByKeyAsync("TEXT_STYLE_KEY");
// Apply to a text node
await textNode.setTextStyleIdAsync(headingStyle.id);
```

`search_design_system` with `includeStyles: true` returns style keys you can import this way. Prefer importing library styles over creating new ones.

---

## Applying Text Styles to Nodes

```javascript
/**
 * Applies a text style to all TEXT nodes on the current page matching a name pattern.
 */
async function applyTextStyleToMatchingNodes(styleId, nodeNamePattern) {
  const textNodes = figma.currentPage.findAllWithCriteria({ types: ['TEXT'] });
  let applied = 0;
  for (const node of textNodes) {
    if (node.name.includes(nodeNamePattern)) {
      await node.setTextStyleIdAsync(styleId);
      applied++;
    }
  }
  return applied;
}

// Full runnable script:
const applied = await applyTextStyleToMatchingNodes('STYLE_ID', 'Heading');
return { applied };
```
