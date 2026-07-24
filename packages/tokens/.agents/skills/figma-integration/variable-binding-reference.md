# Variable Binding Reference — Design System

> Internalised knowledge for figma-executor. Do not repeat in prompts.

## File Keys

| File          | Key                      |
| ------------- | ------------------------ |
| Token Library | `YOUR-FIGMA-FILE-KEY` |
| UI Kit        | `hcCXq9ObSEBdXtwROtBSNc` |

## Variable Collections (Token Library)

| Collection | ID                                | Variables | Modes                                                                                                                                              |
| ---------- | --------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Viewport   | `VariableCollectionId:4042:5990`  | 60        | 4 breakpoints                                                                                                                                      |
| Mode       | `VariableCollectionId:5342:10076` | 681       | Light / Dark                                                                                                                                       |
| Theme      | `VariableCollectionId:5342:11185` | 286       | 18 (theme variants, each in a light/dark pair) |

**Semantic variables live in the Theme collection, not Mode.**

## Semantic Variable Names (Theme Collection)

### Surface

| Variable               | ID                      |
| ---------------------- | ----------------------- |
| `surface/canvas`       | `VariableID:5342:11187` |
| `surface/level-1`      | `VariableID:5342:11188` |
| `surface/level-2`      | `VariableID:5342:11189` |
| `surface/level-3`      | `VariableID:5342:11190` |
| `surface/level-4`      | `VariableID:5342:11191` |
| `surface/overlay`      | `VariableID:5342:11193` |
| `surface/undercanvas`  | `VariableID:5342:11192` |
| `surface/static/dark`  | `VariableID:5342:11194` |
| `surface/static/light` | `VariableID:5342:11195` |

### Text

| Variable            | ID                      |
| ------------------- | ----------------------- |
| `text/primary`      | `VariableID:5342:11197` |
| `text/secondary`    | `VariableID:5342:11198` |
| `text/tertiary`     | `VariableID:5342:11199` |
| `text/static/dark`  | `VariableID:5342:11200` |
| `text/static/light` | `VariableID:5342:11201` |

### Border

| Variable           | ID                      |
| ------------------ | ----------------------- |
| `border/primary`   | `VariableID:5342:11215` |
| `border/secondary` | `VariableID:5342:11216` |
| `border/tertiary`  | `VariableID:5342:11217` |
| `border/elevation` | `VariableID:5342:11219` |

### Interactive

| Variable                               | ID                      |
| -------------------------------------- | ----------------------- |
| `interactive/primary/text/default`     | `VariableID:5342:11271` |
| `interactive/primary/text/hover`       | `VariableID:5342:11272` |
| `interactive/primary/text/pressed`     | `VariableID:5342:11273` |
| `interactive/secondary/text/default`   | `VariableID:5342:11274` |
| `interactive/secondary/border/default` | `VariableID:5342:11275` |

> Note: IDs above were resolved on 2026-05-15. Use `figma.variables.getLocalVariablesAsync()` to re-resolve by name if IDs drift after library sync.

## Variable Binding Code Pattern

All variable APIs in plugin sandbox require async variants:

```javascript
// ✅ CORRECT — async
const vars = await figma.variables.getLocalVariablesAsync();
const v = await figma.variables.getVariableByIdAsync('VariableID:5342:11188');
const node = await figma.getNodeByIdAsync('nodeId');

// ❌ WRONG — will throw "Cannot call with documentAccess: dynamic-page"
const vars = figma.variables.getLocalVariables();
const v = figma.variables.getVariableById('VariableID:...');
const node = figma.getNodeById('...');
```

### Bind a variable to a fill:

```javascript
async function applyVarFill(node, variableId, fallbackColor) {
  const v = await figma.variables.getVariableByIdAsync(variableId);
  const paint = v
    ? figma.variables.setBoundVariableForPaint(
        { type: 'SOLID', color: fallbackColor },
        'color',
        v
      )
    : { type: 'SOLID', color: fallbackColor };
  node.fills = [paint];
}
```

### Resolve variable by name (when ID unknown):

```javascript
const vars = await figma.variables.getLocalVariablesAsync();
const v = vars.find((x) => x.name === 'surface/level-1');
```

### Import and instantiate a library component:

```javascript
const comp = await figma.importComponentByKeyAsync('componentKey');
const instance = comp.createInstance();
```

## Key UI Kit Component Sets

| Component   | Set Key                                    | Node ID    |
| ----------- | ------------------------------------------ | ---------- |
| Button      | `6b1c2a8bc16246abd4b715826426f860f891159d` | `146:3178` |
| Icon Button | `69d2f5f7e4352da5835a9c30f60d134db3d4f413` | `147:1681` |

### Button Variant Keys (subset)

| Variant                                | Key                                        |
| -------------------------------------- | ------------------------------------------ |
| medium / primary / base / hug / square | `2f91dea8d1873ddd67b156e3727fa1bead3d5850` |
| large / primary / base / hug / square  | see set key + variant props                |
| xlarge / primary / base / hug / square | `04d15c1265bdd7d4f9142ad5a043c4f14e5c63f4` |

### Icon Button Variant Keys (subset)

| Variant                          | Key                                        |
| -------------------------------- | ------------------------------------------ |
| medium / primary / base / square | `ab26550a2975e3699123a460dee7c8553079522f` |
| large / primary / base / square  | `574fda46b7573e7c4cc50525518c76615796fc21` |

## Section Housekeeping Rule

All canvas-placed frames must live inside a Section (unless a spec sheet — spec sheets are placed directly on the canvas per the spec checklist). The housekeeping warning `FLOATING_NODES` means nodes are on the page without a section wrapper.
