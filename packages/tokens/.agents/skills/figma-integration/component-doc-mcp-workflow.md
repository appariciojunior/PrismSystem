# Component Doc → Figma via MCP Console

## Overview

Convert component property docs (Markdown) directly into Figma template updates using Figma Console MCP's `figma_execute` tool. **No plugin needed.** No REST API required.

---

## Workflow

### Step 1: Generate Figma Code

```bash
npm run sync:component-doc -- --component link
```

**Output:**

- ✅ Parsed metadata (version, row counts)
- 📋 Update preview (what will change)
- 🎨 **Figma Execution Code** (JavaScript for figma_execute)
- 📝 Copy-paste instructions

### Step 2: Copy Generated Code

The CLI outputs JavaScript code like:

```javascript
(async () => {
  const templateFrame = await figma.getNodeByIdAsync('8075:17411');
  // ... updates Description, Table fields
  return { success: true, updatedCount: 11, ... };
})()
```

### Step 3: Execute in Figma

**In Copilot Chat**, call:

```
@tools mcp_figma-console_figma_execute

code: (async () => {
  const templateFrame = await figma.getNodeByIdAsync('8075:17411');
  // ... paste entire code block
})()
```

**Or use direct tool invocation:**

```json
{
  "code": "(async () => { ... full code ... })()"
}
```

### Step 4: Watch Template Update

The Figma template at node-id=8075-17411 automatically:

- Updates `{componentDescription}` text placeholder
- Populates Property table (6 columns × 5 rows) with doc data
- Updates 11+ nodes in ~1-2 seconds

---

## Supported Components

| Component   | Doc                                                         | Status     |
| ----------- | ----------------------------------------------------------- | ---------- |
| Link        | `packages/tokens/docs/components/link/Link.md`              | ✅ Tested  |
| Button      | `packages/tokens/docs/components/button/Button.md`          | ✅ Tested  |
| Icon Button | `packages/tokens/docs/components/icon-button/IconButton.md` | ✅ Tested  |
| Divider     | `packages/tokens/docs/components/divider/Divider.md`        | ⏳ Planned |
| Input       | `packages/tokens/docs/components/input/Input-1.0.0.md`      | ⏳ Planned |

---

## Full Example: Link Component

### 1. Parse

```bash
$ npm run sync:component-doc -- --component link

✅ Parsed: Link v1.0.0
   Properties: 5 rows
   A11y: 6 rows
   Changelog: 1 rows
```

### 2. Review Preview

```
📋 Template Update Preview
═══════════════════════════════════════

Component: Link v1.0.0
Description: "Standalone links for navigation, prose, and actionable text.
Supports leading/trailing icons and interaction feedback..."
Updates:
  ✓ Text: {componentDescription} ← "Standalone links..."
  ✓ Table: 5 property rows
  ✓ A11y: 6 accessibility entries
  ✓ Changelog: 1 entries
```

### 3. Get Figma Code

```javascript
(async () => {
  try {
    const templateFrame = await figma.getNodeByIdAsync('8075:17411');
    if (!templateFrame) return { error: 'Template frame not found' };

    const detailsFrame = templateFrame.children?.find(
      (n) => n.name === 'Details'
    );
    if (!detailsFrame) return { error: 'Details frame not found' };

    let updatedCount = 0;

    // Update description
    const topFrame = detailsFrame.children?.find((n) => n.name === 'Top');
    if (topFrame) {
      const compInfoFrame = topFrame.children?.find(
        (n) => n.name === 'Component information'
      );
      if (compInfoFrame) {
        const descNode = compInfoFrame.children?.find(
          (n) => n.name === '{componentDescription}' && n.type === 'TEXT'
        );
        if (descNode) {
          descNode.characters =
            'Standalone links for navigation, prose, and actionable text. Supports leading/trailing icons and interaction feedback via colour and underline.';
          updatedCount++;
        }
      }
    }

    // Update property table
    const tableFrame = detailsFrame.children?.find(
      (n) => n.name === 'Property table'
    );
    if (tableFrame) {
      const tableInnerFrame = tableFrame.children?.find(
        (n) => n.name === 'Table'
      );
      if (tableInnerFrame) {
        const cellContainers = tableInnerFrame.children.filter(
          (c) =>
            c.name === 'Cell container' || c.name === 'Cell small container'
        );

        const propertyRows = [
          [
            '`Intent`',
            '`variant`',
            'enum',
            '`Primary`, `Secondary`',
            '`Primary`',
            'Sets link priority.'
          ],
          [
            '`State`',
            '(visual state)',
            'enum',
            '`Base`, `Hover`, `Pressed`',
            '`Base`',
            'Shows interaction feedback.'
          ]
          // ... more rows
        ];

        propertyRows.forEach((row, rowIdx) => {
          row.forEach((cellValue, colIdx) => {
            const cellIdx = rowIdx * 6 + colIdx;
            if (cellIdx < cellContainers.length) {
              const cell = cellContainers[cellIdx];
              const textNode = cell.children?.find((n) => n.type === 'TEXT');
              if (textNode) {
                textNode.characters = String(cellValue || '');
                updatedCount++;
              }
            }
          });
        });
      }
    }

    return {
      success: true,
      component: 'Link',
      version: '1.0.0',
      updatedCount,
      message: `✅ Template populated: Link v1.0.0 (${updatedCount} nodes updated)`
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
})();
```

### 4. Execute

Copy the entire code block and paste into:

```
@tools mcp_figma-console_figma_execute
```

---

## For Other Components

**Same workflow. Just change the component name:**

```bash
npm run sync:component-doc -- --component button
npm run sync:component-doc -- --component icon-button
npm run sync:component-doc -- --component divider
```

Each generates its own Figma code targeting the same template structure.

---

## How It Works

### Architecture

1. **Parser** (`component-doc-to-figma.js`)
   - Reads Markdown file
   - Extracts tables (Properties, A11y, Changelog)
   - Returns structured { componentName, tables }

2. **Executor** (`figma-console-executor.js`)
   - Takes parsed doc
   - Generates JavaScript code string
   - Code is ready to paste into figma_execute

3. **Figma Console MCP**
   - Receives generated code
   - Executes in Figma's plugin sandbox
   - Updates nodes in real-time
   - Returns { success, updatedCount, message }

### Data Flow

```
Markdown Doc
    ↓
Parser (parseComponentDoc)
    ↓
{ componentName, tables }
    ↓
Executor (generateFigmaExecutionCode)
    ↓
JavaScript Code String
    ↓
mcp_figma-console_figma_execute
    ↓
Figma Nodes Updated (live)
```

---

## Template Structure

The reusable template at node-id=8075-17411 has:

```
Link - Details (frame) [8075:17411]
├── Details (frame) [8075:17412]
│   ├── Top (frame)
│   │   ├── Component information (frame)
│   │   │   ├── Breadcrumb
│   │   │   ├── Component ID
│   │   │   ├── {componentDescription} ← TEXT placeholder (8075:18031)
│   │   │   └── Call to action
│   │   └── Frame 2609159
│   ├── Divider
│   └── Property table (frame)
│       ├── Configuration (label)
│       └── Table (frame)
│           └── 20 Cell containers (cell [0–19])
│               Maps to 5 rows × 6 columns
```

### Bracket Notation (Stable Anchoring)

- `{componentDescription}` — stable name for description placeholder
- Layer names are preserved; no Figma ID hardcoding
- Works across template clones
- Safe for future refactoring

---

## Extensibility

### Adding New Components

1. **Create a doc** (same format as Link.md)
2. **Run CLI**: `npm run sync:component-doc -- --component mycomponent`
3. Target same template (8075-17411) or clone for other components

### Adding New Tables

To include A11y or Changelog in template:

1. Add new frames to template (e.g., "A11y table", "Changelog table")
2. Update `generateFigmaExecutionCode()` to populate them
3. Re-run CLI; it will update layout automatically

### Batch Sync

Run all docs at once:

```bash
npm run sync:component-docs:batch
```

Currently validates parsing only. Can be extended to auto-execute for all components.

---

## Troubleshooting

| Issue                              | Cause                          | Fix                                                                           |
| ---------------------------------- | ------------------------------ | ----------------------------------------------------------------------------- |
| Markdown table not extracted       | Wrong header keyword           | Check header row: must contain "Figma Property", "Concern", or "Date"         |
| Template frame not found           | Wrong node-id                  | Verify 8075:17411 exists in Figma Token Library file                          |
| `{componentDescription}` not found | Missing placeholder layer      | Add TEXT layer named `{componentDescription}` in Component information frame  |
| Cell updates empty                 | Table frame structure changed  | Check Property table hierarchy: Table → Cell containers                       |
| Code doesn't execute               | Syntax error in generated code | Copy full code; check for unclosed brackets; use figma_execute tool correctly |

---

## Performance

- **Parse time**: <100ms (3 markdown docs in series)
- **Code generation**: <50ms
- **Figma execution**: 1–2 seconds (11+ nodes updated)
- **Total workflow**: ~3 seconds (dev loop time)

---

## Next Steps

- [ ] Test with Button, Icon Button templates
- [ ] Clone template for other components
- [ ] Set up batch sync for CI/CD
- [ ] Add A11y + Changelog frame templates
- [ ] Document theme variations (light/dark Figma file)

---

## References

- [Component Doc Format](./components/README.md)
- [Figma Console MCP Docs](../reference-modules/06-figma-console-mcp.md)
- [Parser Implementation](../scripts/component-doc-to-figma.js)
- [Executor Implementation](../scripts/figma-console-executor.js)
