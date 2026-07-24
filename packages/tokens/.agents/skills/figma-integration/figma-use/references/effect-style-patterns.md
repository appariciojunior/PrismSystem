# Effect Style API Patterns

> Part of the [figma-use skill](../SKILL.md). How to create, apply, and inspect effect styles using the Plugin API.

## Contents

- Listing Effect Styles
- Creating a Drop Shadow Style
- Importing Library Effect Styles
- Applying Effect Styles to Nodes

---

## Listing Effect Styles

```javascript
async function listEffectStyles() {
  const styles = await figma.getLocalEffectStylesAsync();
  return styles.map(s => ({
    id: s.id,
    name: s.name,
    key: s.key,
    effectCount: s.effects.length
  }));
}

// Full runnable script:
const results = await listEffectStyles();
return results;
```

---

## Creating a Drop Shadow Style

Colors are **RGBA 0–1 range**. `effects` is a read-only array — always reassign, never mutate in place.

```javascript
/**
 * Creates a drop shadow effect style.
 * @param {string} name - e.g. "Elevation/200"
 * @param {{ r, g, b, a }} color - RGBA, 0-1 range
 * @param {{ x, y }} offset
 * @param {number} radius - blur radius
 * @param {number} [spread=0]
 */
function createDropShadowStyle(name, color, offset, radius, spread) {
  const style = figma.createEffectStyle();
  style.name = name;
  style.effects = [{
    type: "DROP_SHADOW",
    color,
    offset,
    radius,
    spread: spread || 0,
    visible: true,
    blendMode: "NORMAL"
  }];
  return style;
}

// Full runnable script:
const style = createDropShadowStyle(
  "Elevation/200",
  { r: 0, g: 0, b: 0, a: 0.15 },
  { x: 0, y: 4 },
  12,
  0
);
return { id: style.id, name: style.name };
```

### Multiple Shadows (Layered)

```javascript
const shadowStyle = figma.createEffectStyle();
shadowStyle.name = "Elevation/400";
shadowStyle.effects = [
  {
    type: "DROP_SHADOW",
    color: { r: 0, g: 0, b: 0, a: 0.04 },
    offset: { x: 0, y: 1 },
    radius: 3,
    spread: 0,
    visible: true,
    blendMode: "NORMAL"
  },
  {
    type: "DROP_SHADOW",
    color: { r: 0, g: 0, b: 0, a: 0.08 },
    offset: { x: 0, y: 8 },
    radius: 24,
    spread: -4,
    visible: true,
    blendMode: "NORMAL"
  }
];
```

### Binding Effect Variables

To bind a COLOR variable to a shadow's color, use `setBoundVariableForEffect`:

```javascript
const effectCopy = JSON.parse(JSON.stringify(node.effects[0]));
// Field can be: "color" (COLOR var), "radius" | "spread" | "offsetX" | "offsetY" (FLOAT var)
const newEffect = figma.variables.setBoundVariableForEffect(effectCopy, "color", colorVar);
// ⚠️ Returns a NEW effect — must capture return value!
node.effects = [newEffect];
```

---

## Importing Library Effect Styles

For effect styles from **team libraries**, use `importStyleByKeyAsync`:

```javascript
// Import a library effect style by key
const shadowStyle = await figma.importStyleByKeyAsync("EFFECT_STYLE_KEY");
// Apply to a node
node.effectStyleId = shadowStyle.id;
```

`search_design_system` with `includeStyles: true` returns style keys you can import this way. Prefer importing library styles over creating new ones.

---

## Applying Effect Styles to Nodes

```javascript
/**
 * Applies an effect style to all nodes on the current page matching a name pattern.
 */
function applyEffectStyleToMatchingNodes(styleId, nodeNamePattern) {
  const nodes = figma.currentPage.findAll(n => n.name.includes(nodeNamePattern));
  let applied = 0;
  for (const node of nodes) {
    if ('effectStyleId' in node) {
      node.effectStyleId = styleId;
      applied++;
    }
  }
  return applied;
}

// Full runnable script:
const applied = applyEffectStyleToMatchingNodes('STYLE_ID', 'Card');
return { applied };
```
