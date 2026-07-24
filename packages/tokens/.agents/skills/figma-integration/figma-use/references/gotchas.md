# Gotchas & Common Mistakes

> Part of the [figma-use skill](../SKILL.md). Every known pitfall with WRONG/CORRECT code examples.

## Contents

- New nodes default to (0,0) and overlap existing content
- `addComponentProperty` returns a string key — never hardcode or guess it
- MUST return ALL created/mutated node IDs
- Colors are 0–1 range
- Fills/strokes are immutable arrays
- `setBoundVariableForPaint` returns a NEW paint
- Variable collection starts with 1 mode
- `combineAsVariants` requires ComponentNodes
- Page switching: sync setter throws
- `get_metadata` only sees one page
- Never use `figma.notify()`
- `getPluginData()` / `setPluginData()` not supported
- Script must always return a value
- `setBoundVariable` for paint fields only works on SOLID paints
- Explicit variable modes must be set per component
- `TextStyle.setBoundVariable` not available in headless
- `lineHeight` and `letterSpacing` must be objects, not bare numbers
- Font style names are file-dependent — probe before assuming
- `combineAsVariants` does NOT auto-layout in headless mode
- COLOR variable values use `{r, g, b, a}` (with alpha)
- `layoutSizingVertical/Horizontal = 'FILL'` requires auto-layout parent FIRST
- HUG parents collapse FILL children
- `layoutGrow` with a hugging parent causes content compression
- `resize()` resets sizing modes to FIXED
- Node positions don't auto-reset after reparenting
- Grid layout with mixed-width rows causes overlaps
- Sections don't auto-resize to fit content
- `counterAxisAlignItems` does NOT support `'STRETCH'`
- Variable collection mode limits are plan-dependent
- Variables default to `ALL_SCOPES` — always set explicitly
- Binding fills on nodes with empty fills
- Mode names must be descriptive — never leave 'Mode 1'
- CSS variable names must not contain spaces
- `detachInstance()` invalidates ancestor node IDs

---

## New nodes default to (0,0) and overlap existing content

Every `figma.create*()` call places the node at position (0,0). If you append multiple nodes directly to the page, they all stack on top of each other and on top of any existing content.

**This only matters for nodes appended directly to the page** (page-level nodes). Nodes appended as children of other frames or auto-layout containers are positioned by their parent.

```js
// WRONG — top-level node lands at (0,0), overlapping existing page content
const frame = figma.createFrame()
frame.resize(400, 300)
figma.currentPage.appendChild(frame)

// CORRECT — find existing content bounds and place to the right
const page = figma.currentPage
let maxX = 0
for (const child of page.children) {
  const right = child.x + child.width
  if (right > maxX) maxX = right
}
const frame = figma.createFrame()
frame.resize(400, 300)
figma.currentPage.appendChild(frame)
frame.x = maxX + 100  // 100px gap from rightmost existing content
frame.y = 0

// NOT NEEDED — child nodes inside a parent don't need overlap scanning
const card = figma.createFrame()
card.layoutMode = 'VERTICAL'
const label = figma.createText()
card.appendChild(label)  // positioned by auto-layout, no x/y needed
```

---

## `addComponentProperty` returns a string key, not an object — never hardcode or guess it

Figma generates the property key dynamically (e.g. `"label#4:0"`). The suffix is unpredictable.

```js
// WRONG — guessing / hardcoding the key
comp.addComponentProperty('label', 'TEXT', 'Button')
labelNode.componentPropertyReferences = { characters: 'label#0:1' }  // Error: key not found

// WRONG — treating the return value as an object
const result = comp.addComponentProperty('Label', 'TEXT', 'Button')
const propKey = Object.keys(result)[0]  // BUG: returns '0' (first char index of string!)

// CORRECT — the return value IS the key string, use it directly
const propKey = comp.addComponentProperty('Label', 'TEXT', 'Button')
// propKey === "label#4:0" (exact value varies; never assume it)
labelNode.componentPropertyReferences = { characters: propKey }
```

---

## MUST return ALL created/mutated node IDs

```js
// WRONG — only returns the parent frame ID, loses track of children
const frame = figma.createFrame()
const rect = figma.createRectangle()
const text = figma.createText()
frame.appendChild(rect)
frame.appendChild(text)
return { nodeId: frame.id }

// CORRECT — returns all created node IDs in a structured response
const frame = figma.createFrame()
const rect = figma.createRectangle()
const text = figma.createText()
frame.appendChild(rect)
frame.appendChild(text)
return {
  createdNodeIds: [frame.id, rect.id, text.id],
  rootNodeId: frame.id
}

// CORRECT — when mutating existing nodes, return those IDs too
const nodes = figma.currentPage.findAll(n => n.name === 'Card')
for (const n of nodes) {
  n.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]
}
return {
  mutatedNodeIds: nodes.map(n => n.id),
  count: nodes.length
}
```

---

## Colors are 0–1 range

```js
// WRONG — will throw validation error
node.fills = [{ type: 'SOLID', color: { r: 255, g: 0, b: 0 } }]

// CORRECT
node.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]
```

---

## Fills/strokes are immutable arrays

```js
// WRONG — modifying in place does nothing
node.fills[0].color = { r: 1, g: 0, b: 0 }

// CORRECT — clone, modify, reassign
const fills = JSON.parse(JSON.stringify(node.fills))
fills[0].color = { r: 1, g: 0, b: 0 }
node.fills = fills
```

---

## `setBoundVariableForPaint` returns a NEW paint

```js
// WRONG — ignoring return value
figma.variables.setBoundVariableForPaint(paint, "color", colorVar)
node.fills = [paint]  // paint is unchanged!

// CORRECT — capture the returned new paint
const boundPaint = figma.variables.setBoundVariableForPaint(paint, "color", colorVar)
node.fills = [boundPaint]
```

---

## Variable collection starts with 1 mode

```js
// A new collection already has one mode — rename it, don't try to add first
const collection = figma.variables.createVariableCollection("Colors")
// collection.modes = [{ modeId: "...", name: "Mode 1" }]
collection.renameMode(collection.modes[0].modeId, "Light")
const darkModeId = collection.addMode("Dark")
```

---

## `combineAsVariants` requires ComponentNodes

```js
// WRONG — passing frames
const f1 = figma.createFrame()
figma.combineAsVariants([f1], figma.currentPage) // Error!

// CORRECT — passing components
const c1 = figma.createComponent()
c1.name = "variant=primary, size=md"
const c2 = figma.createComponent()
c2.name = "variant=secondary, size=md"
figma.combineAsVariants([c1, c2], figma.currentPage)
```

---

## Page switching: sync setter throws

```js
// WRONG — throws "Setting figma.currentPage is not supported in this runtime"
figma.currentPage = targetPage

// CORRECT
await figma.setCurrentPageAsync(targetPage)
```

---

## `get_metadata` only sees one page — use a script to discover all pages

A Figma file can have multiple pages. `get_metadata` operates on a single node/page.

```js
// CORRECT — use a script to list pages, then inspect each one
const pages = figma.root.children.map(p => `${p.name} id=${p.id} children=${p.children.length}`);
return pages.join('\n');
```

---

## Never use `figma.notify()`

```js
// WRONG — throws "not implemented" error
figma.notify("Done!")

// CORRECT — return a value to send data back
return "Done!"
```

---

## `getPluginData()` / `setPluginData()` are not supported

```js
// WRONG
node.setPluginData('my_key', 'my_value')
const val = node.getPluginData('my_key')

// CORRECT — use shared plugin data (requires a namespace)
node.setSharedPluginData('my_namespace', 'my_key', 'my_value')
const val = node.getSharedPluginData('my_namespace', 'my_key')

// ALSO CORRECT — return node IDs and track them across calls
const rect = figma.createRectangle()
return { nodeId: rect.id }
```

---

## Script must always return a value

```js
// WRONG — no return, caller gets no useful response
figma.createRectangle()

// CORRECT
const rect = figma.createRectangle()
return { nodeId: rect.id }
```

---

## `setBoundVariable` for paint fields only works on SOLID paints

```js
// Only SOLID paint type supports color variable binding
// Gradient paints, image paints will throw
const solidPaint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }
const bound = figma.variables.setBoundVariableForPaint(solidPaint, "color", colorVar)
```

---

## Explicit variable modes must be set per component

```js
// WRONG — all variants render with the default (first) mode
// CORRECT — set explicit mode on each component to get variant-specific values
component.setExplicitVariableModeForCollection(colorCollection, targetModeId)
```

---

## `TextStyle.setBoundVariable` is not available in headless

`setBoundVariable` exists on `TextStyle` in the typed API but is **not available** when running scripts through `figma_execute`/`use_figma`.

```js
// WRONG — throws "not a function" in headless
const ts = figma.createTextStyle()
ts.setBoundVariable("fontSize", fontSizeVar)

// CORRECT (headless) — set raw values; bind variables interactively in Figma later
const ts = figma.createTextStyle()
ts.fontSize = 24
```

This only affects `TextStyle`. Variable binding on **nodes** (`node.setBoundVariable(...)`) and on **paint objects** (`figma.variables.setBoundVariableForPaint(...)`) still works in headless mode.

---

## `lineHeight` and `letterSpacing` must be objects, not bare numbers

```js
// WRONG — throws or silently does nothing
style.lineHeight = 1.5
style.lineHeight = 24
style.letterSpacing = 0

// CORRECT
style.lineHeight = { unit: "AUTO" }                    // auto/intrinsic
style.lineHeight = { value: 24, unit: "PIXELS" }       // fixed pixel height
style.lineHeight = { value: 150, unit: "PERCENT" }     // percentage of font size

style.letterSpacing = { value: 0, unit: "PIXELS" }     // no tracking
style.letterSpacing = { value: -0.5, unit: "PIXELS" }  // tight
style.letterSpacing = { value: 5, unit: "PERCENT" }    // percent-based
```

---

## Font style names are file-dependent — probe before assuming

`"SemiBold"` and `"Semi Bold"` are different strings. Loading a font with the wrong style string **throws silently or errors**.

```js
// WRONG — guessing style names
await figma.loadFontAsync({ family: "Inter", style: "SemiBold" }) // may throw

// CORRECT — probe which style names are available
const candidates = ["SemiBold", "Semi Bold", "Semibold"]
for (const style of candidates) {
  try {
    await figma.loadFontAsync({ family: "Inter", style })
    break
  } catch (_) {}
}
```

---

## `combineAsVariants` does NOT auto-layout in headless mode

```js
// WRONG — all variants stack at position (0, 0)
const cs = figma.combineAsVariants(components, figma.currentPage)
// cs.width/height will be the size of a SINGLE variant!

// CORRECT — manually layout children in a grid after combining
const cs = figma.combineAsVariants(components, figma.currentPage)
const colWidth = 120
const rowHeight = 56
cs.children.forEach((child, i) => {
  const col = i % numCols
  const row = Math.floor(i / numCols)
  child.x = col * colWidth
  child.y = row * rowHeight
})
// CRITICAL: resize from actual child bounds, not formula
let maxX = 0, maxY = 0
for (const child of cs.children) {
  maxX = Math.max(maxX, child.x + child.width)
  maxY = Math.max(maxY, child.y + child.height)
}
cs.resizeWithoutConstraints(maxX + 40, maxY + 40)
```

---

## COLOR variable values use `{r, g, b, a}` (with alpha)

```js
// Paint colors use {r, g, b} (no alpha — opacity is a separate paint property)
node.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]

// But COLOR variable values use {r, g, b, a} — alpha maps to paint opacity
const colorVar = figma.variables.createVariable("bg", collection, "COLOR")
colorVar.setValueForMode(modeId, { r: 1, g: 0, b: 0, a: 1 })  // opaque red
colorVar.setValueForMode(modeId, { r: 0, g: 0, b: 0, a: 0 })  // fully transparent
```

---

## `layoutSizingVertical/Horizontal = 'FILL'` requires auto-layout parent FIRST

```js
// WRONG — setting FILL before the node is a child of an auto-layout frame
const child = figma.createFrame()
child.layoutSizingVertical = 'FILL'  // ERROR: "FILL can only be set on children of auto-layout frames"
parent.appendChild(child)

// CORRECT — append to auto-layout parent FIRST, then set FILL
const child = figma.createFrame()
parent.appendChild(child)            // parent must have layoutMode set
child.layoutSizingVertical = 'FILL'  // Works!
```

---

## HUG parents collapse FILL children

A `HUG` parent cannot give `FILL` children meaningful size.

```js
// WRONG — parent hugs, so FILL children get zero extra space
const parent = figma.createFrame()
parent.layoutMode = 'HORIZONTAL'
parent.layoutSizingHorizontal = 'HUG'
const child = figma.createFrame()
parent.appendChild(child)
child.layoutSizingHorizontal = 'FILL'  // collapses to min size!

// CORRECT — parent must be FIXED or FILL for FILL children to expand
const parent = figma.createFrame()
parent.layoutMode = 'HORIZONTAL'
parent.resize(400, 50)
parent.layoutSizingHorizontal = 'FIXED'
const child = figma.createFrame()
parent.appendChild(child)
child.layoutSizingHorizontal = 'FILL'  // expands to fill remaining 400px
```

---

## `layoutGrow` with a hugging parent causes content compression

```js
// WRONG — layoutGrow on a child when parent has primaryAxisSizingMode='AUTO' (hug)
// causes the child to SHRINK below its natural size
const parent = figma.createComponent()
parent.layoutMode = 'VERTICAL'
parent.primaryAxisSizingMode = 'AUTO'  // hug contents
const content = figma.createFrame()
parent.appendChild(content)
content.layoutGrow = 1  // BUG: content compresses, children hidden!

// CORRECT — only use layoutGrow when parent has FIXED sizing with extra space
content.layoutGrow = 0  // let content take its natural size
// OR: set parent to FIXED sizing first
parent.primaryAxisSizingMode = 'FIXED'
parent.resizeWithoutConstraints(300, 500)
content.layoutGrow = 1  // NOW it correctly fills remaining space
```

---

## `resize()` resets `primaryAxisSizingMode` and `counterAxisSizingMode` to FIXED

`resize(w, h)` silently resets **both** sizing modes to `FIXED`.

```js
// WRONG — resize() after setting sizing mode overwrites it back to FIXED
const frame = figma.createComponent()
frame.layoutMode = 'VERTICAL'
frame.primaryAxisSizingMode = 'AUTO'  // hug height
frame.resize(300, 10)  // BUG: resets BOTH axes to 'FIXED'! Height stays at 10px.

// CORRECT — call resize() FIRST, then set sizing modes
const frame = figma.createComponent()
frame.layoutMode = 'VERTICAL'
frame.resize(300, 40)  // use a reasonable default, never 0 or 1
frame.counterAxisSizingMode = 'FIXED'   // keep width fixed at 300
frame.primaryAxisSizingMode = 'AUTO'    // NOW set height to hug — this sticks!
```

**Rule**: Never pass a throwaway value (like `1` or `0`) to `resize()` for an axis you intend to be `HUG`.

---

## Node positions don't auto-reset after reparenting

```js
// WRONG — assuming positions reset when moving a node into a new parent
const node = figma.createRectangle()
node.x = 500; node.y = 500;
figma.currentPage.appendChild(node)
section.appendChild(node)  // node still at (500, 500) relative to section!

// CORRECT — explicitly set x/y after ANY reparenting operation
section.appendChild(node)
node.x = 80; node.y = 80;  // reset to desired position within section
```

---

## Grid layout with mixed-width rows causes overlaps

```js
// WRONG — using a single column offset for rows with different-width items
for (let i = 0; i < allCards.length; i++) {
  allCards[i].x = (i % 4) * 370  // 370 works for 320px cards but NOT 500px cards!
}

// CORRECT — compute each row's spacing independently based on actual child widths
const gap = 50
let x = 0
for (const card of horizontalCards) {
  card.x = x
  x += card.width + gap  // use actual width, not a fixed column size
}
```

---

## Sections don't auto-resize to fit content

```js
// WRONG — section stays at default size, content overflows
const section = figma.createSection()
section.appendChild(someNode) // node may be outside section bounds

// CORRECT — explicitly resize after adding content
const section = figma.createSection()
section.appendChild(someNode)
section.resizeWithoutConstraints(
  Math.max(someNode.width + 100, 800),
  Math.max(someNode.height + 100, 600)
)
```

---

## `counterAxisAlignItems` does NOT support `'STRETCH'`

```js
// WRONG — 'STRETCH' is not a valid enum value
comp.counterAxisAlignItems = 'STRETCH'
// Error: Invalid enum value. Expected 'MIN' | 'MAX' | 'CENTER' | 'BASELINE'

// CORRECT — use 'MIN' on the parent, then set children to FILL on the cross axis
comp.counterAxisAlignItems = 'MIN'
comp.appendChild(child)
child.layoutSizingHorizontal = 'FILL'  // For vertical layout, stretch width
```

---

## Variable collection mode limits are plan-dependent

```js
// Figma limits modes per collection based on plan:
//   Free: 1 mode only
//   Professional: up to 4 modes
//   Organization/Enterprise: up to 40+ modes

// CORRECT — if you need many modes, split across multiple collections
// Collection A: 4 modes (variant: plain/outlined/soft/solid)
// Collection B: 5 modes (color: neutral/primary/danger/success/warning)
// Then use setExplicitVariableModeForCollection for BOTH on each component
```

---

## Variables default to `ALL_SCOPES` — always set explicitly

```js
// WRONG — variable appears in every property picker
const bgColor = figma.variables.createVariable("Background/Default", coll, "COLOR")
// bgColor.scopes defaults to ["ALL_SCOPES"] — pollutes all dropdowns

// CORRECT — restrict to relevant property pickers
const bgColor = figma.variables.createVariable("Background/Default", coll, "COLOR")
bgColor.scopes = ["FRAME_FILL", "SHAPE_FILL"]  // fill pickers only

const textColor = figma.variables.createVariable("Text/Default", coll, "COLOR")
textColor.scopes = ["TEXT_FILL"]  // text color picker only

const borderColor = figma.variables.createVariable("Border/Default", coll, "COLOR")
borderColor.scopes = ["STROKE_COLOR"]  // stroke picker only

const spacing = figma.variables.createVariable("Space/400", coll, "FLOAT")
spacing.scopes = ["GAP"]  // gap/spacing pickers only

// Hide primitives that are only referenced via aliases
const primitive = figma.variables.createVariable("Brand/500", coll, "COLOR")
primitive.scopes = []  // hidden from all pickers
```

---

## Binding fills on nodes with empty fills

```js
// WRONG — binding to a node with no fills does nothing
const comp = figma.createComponent()
comp.fills = []  // transparent — can't bind a color variable to fills that don't exist

// CORRECT — add a placeholder SOLID fill, then bind the variable
const comp = figma.createComponent()
const basePaint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }
const boundPaint = figma.variables.setBoundVariableForPaint(basePaint, "color", colorVar)
comp.fills = [boundPaint]
```

---

## Mode names must be descriptive — never leave 'Mode 1'

```js
// WRONG — generic names give no semantic meaning
const coll = figma.variables.createVariableCollection('Colors')
// coll.modes[0].name === 'Mode 1' — left as-is

// CORRECT — rename immediately to match the source
const coll = figma.variables.createVariableCollection('Colors')
coll.renameMode(coll.modes[0].modeId, 'Light')   // was 'Mode 1'
const darkId = coll.addMode('Dark')

// For single-mode collections
const spacing = figma.variables.createVariableCollection('Spacing')
spacing.renameMode(spacing.modes[0].modeId, 'Default')
```

---

## CSS variable names must not contain spaces

```js
// WRONG — only replacing slashes leaves spaces
v.setVariableCodeSyntax('WEB', `var(--${figmaName.replace(/\//g, '-').toLowerCase()})`)

// CORRECT — replace all whitespace and slashes in one pass
v.setVariableCodeSyntax('WEB', `var(--${figmaName.replace(/[\s\/]+/g, '-').toLowerCase()})`)

// PREFERRED — use the source CSS name directly
v.setVariableCodeSyntax('WEB', `var(${token.cssVar})`)  // e.g. '--color-bg-brand-secondary-hover'
```

---

## `detachInstance()` invalidates ancestor node IDs

When `detachInstance()` is called on a nested instance, the parent instance may also get implicitly detached (new ID).

```js
// WRONG — using cached parent ID after child detach
const parentId = parentInstance.id;
nestedChild.detachInstance();
const parent = await figma.getNodeByIdAsync(parentId); // null! ID changed.

// CORRECT — re-discover by traversal from a stable (non-instance) frame
const stableFrame = await figma.getNodeByIdAsync(manualFrameId);
nestedChild.detachInstance();
const parent = stableFrame.findOne(n => n.name === "ParentName");
```

If detaching multiple nested instances across siblings, do it in a **single** call — discover all targets by traversal before any detachment mutates the tree.
