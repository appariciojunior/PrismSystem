/**
 * Component Doc → Figma Template Sync via Figma Console MCP
 *
 * Uses figma_execute to directly run JavaScript in Figma and populate templates.
 * No separate plugin required — just Figma Console MCP.
 *
 * Flow:
 * 1. Parser reads component doc → extractstructured data
 * 2. Executor generates Figma JavaScript code
 * 3. figma_execute runs the code → template populated in real-time
 */

/**
 * Generate Figma JavaScript code to populate template with component data
 *
 * @param {Object} componentDoc - Parsed component doc from parseComponentDoc()
 * @param {Object} options - Configuration
 * @returns {string} JavaScript code ready for figma_execute
 */
export function generateFigmaExecutionCode(componentDoc, options = {}) {
  const { templateFrameId = '8075:17411' } = options;

  const { componentName, componentVersion, description, tables } = componentDoc;

  // Escape strings for JavaScript
  const escStr = (s) => JSON.stringify(String(s || ''));
  const cleanTableValue = (s) =>
    String(s || '')
      .replace(/`/g, '')
      .trim();
  const descFirstLine = description.split('\n')[0].substring(0, 200);

  const propertyRows6Col = tables.properties.map((prop) => [
    cleanTableValue(prop['Figma Property']),
    cleanTableValue(prop['Code Property']),
    cleanTableValue(prop['Type']),
    cleanTableValue(prop['Allowed Values']),
    cleanTableValue(prop['Default']),
    cleanTableValue(prop['Description'])
  ]);

  const propertyRows4Col = tables.properties.map((prop) => [
    cleanTableValue(prop['Figma Property']) ||
      cleanTableValue(prop['Code Property']),
    cleanTableValue(prop['Description']),
    cleanTableValue(prop['Allowed Values']),
    cleanTableValue(prop['Default'])
  ]);

  const propertyRows6ColJson = JSON.stringify(propertyRows6Col);
  const propertyRows4ColJson = JSON.stringify(propertyRows4Col);

  // Generate JavaScript code that runs in Figma.
  const code = `
const templateFrame = await figma.getNodeByIdAsync('${templateFrameId}');
if (!templateFrame) {
  throw new Error('Template frame not found: ${templateFrameId}');
}

const loadTextNodeFonts = async (textNode) => {
  if (!textNode || textNode.type !== 'TEXT') return;
  if (textNode.fontName !== figma.mixed) {
    await figma.loadFontAsync(textNode.fontName);
    return;
  }
  const fonts = textNode.getRangeAllFontNames(0, textNode.characters.length);
  for (const f of fonts) await figma.loadFontAsync(f);
};

const firstTextDescendant = (node) => {
  if (!node) return null;
  if (node.type === 'TEXT') return node;
  const all = node.findAll(n => n.type === 'TEXT');
  return all.length ? all[0] : null;
};

const setTextInNode = async (node, value) => {
  const txt = firstTextDescendant(node);
  if (!txt) {
    throw new Error(\`No TEXT descendant found in node \${node?.id || 'unknown'}\`);
  }
  await loadTextNodeFonts(txt);
  txt.characters = String(value ?? '');
  return txt;
};

let updatedCount = 0;

// ===== Update component info =====
const detailsFrame = templateFrame.children?.find(n => n.name === 'Details');
if (!detailsFrame) {
  throw new Error('Details frame not found inside template');
}

const topFrame = detailsFrame.children?.find(n => n.name === 'Top');
const compInfoFrame = topFrame?.children?.find(n => n.name === 'Component information');

const componentNameNodes = compInfoFrame?.findAll(n => n.name === '{componentName}') || [];
for (const node of componentNameNodes) {
  await setTextInNode(node, ${escStr(componentName)});
  updatedCount++;
}

const componentVersionNodes = compInfoFrame?.findAll(n => n.name === '{componentVersion}') || [];
for (const node of componentVersionNodes) {
  await setTextInNode(node, ${escStr(componentVersion)});
  updatedCount++;
}

const descNode = compInfoFrame?.children?.find(n => n.name === '{componentDescription}' && n.type === 'TEXT');
if (descNode) {
  await loadTextNodeFonts(descNode);
  descNode.characters = ${escStr(descFirstLine)};
  updatedCount++;
}

// ===== Update property table =====
const tableFrame = detailsFrame.children?.find(n => n.name === 'Property table');
const tableInnerFrame = tableFrame?.children?.find(n => n.name === 'Table');
if (!tableInnerFrame) {
  throw new Error('Property table / Table frame not found');
}

const cellContainers = tableInnerFrame.children.filter(c =>
  c.name === 'Cell container' || c.name === 'Cell small container'
);
if (cellContainers.length === 0) {
  throw new Error('No table cells found in template');
}

// Detect existing table shape from positioned cells.
const uniqueXs = [...new Set(cellContainers.map(c => Math.round(c.absoluteBoundingBox?.x ?? 0)))];
const columns = uniqueXs.length;
if (columns !== 4 && columns !== 6) {
  throw new Error(\`Unsupported template column count: \${columns}\`);
}

const isGridLayout = tableInnerFrame.layoutMode === 'GRID';

const totalRows = Math.floor(cellContainers.length / columns);
let bodyRowCapacity = Math.max(0, totalRows - 1); // excluding header row

const rows4 = ${propertyRows4ColJson};
const rows6 = ${propertyRows6ColJson};
const sourceRows = columns === 4 ? rows4 : rows6;

// Expand table by cloning the last body row when docs contain more rows than
// the current template capacity. This keeps original structure/styles intact.
if (sourceRows.length > bodyRowCapacity) {
  if (bodyRowCapacity === 0) {
    throw new Error('Template table has no body rows to clone for expansion');
  }

  const extraRowsNeeded = sourceRows.length - bodyRowCapacity;
  const lastRowStart = columns + ((bodyRowCapacity - 1) * columns);
  const lastRowCells = Array.from({ length: columns }, (_, i) => cellContainers[lastRowStart + i]);

  let rowStep = 0;
  if (bodyRowCapacity > 1) {
    const prevRowStart = columns + ((bodyRowCapacity - 2) * columns);
    rowStep = (cellContainers[lastRowStart]?.y || 0) - (cellContainers[prevRowStart]?.y || 0);
  }
  if (!rowStep) {
    rowStep = Math.max(...lastRowCells.map(c => c?.height || 0));
  }

  for (let extra = 0; extra < extraRowsNeeded; extra++) {
    for (let col = 0; col < columns; col++) {
      const proto = lastRowCells[col];
      if (!proto) continue;

      const clone = proto.clone();
      tableInnerFrame.appendChild(clone);

      if (isGridLayout) {
        // GRID templates may collapse cloned AUTO-positioned rows onto the
        // same track, so place overflow rows absolutely to keep them visible.
        try { clone.layoutPositioning = 'ABSOLUTE'; } catch {}
        clone.x = proto.x;
        clone.y = proto.y + (rowStep * (extra + 1));
      } else {
        // For non-grid layouts, place cloned cells on the next row.
        clone.x = proto.x;
        clone.y = proto.y + (rowStep * (extra + 1));
      }

      cellContainers.push(clone);
    }
  }

  bodyRowCapacity = Math.max(0, Math.floor(cellContainers.length / columns) - 1);
}

// Normalize layout after expansion to avoid overlapping rows.
const currentTotalRows = Math.floor(cellContainers.length / columns);
if (currentTotalRows > 1) {
  if (isGridLayout) {
    const colXs = Array.from({ length: columns }, (_, c) => cellContainers[c]?.x || 0);
    let prevRowY = null;
    let nextRowY = cellContainers[0]?.y || 0;

    for (let r = 0; r < currentTotalRows; r++) {
      const rowStart = r * columns;
      const rowCells = Array.from({ length: columns }, (_, c) => cellContainers[rowStart + c]).filter(Boolean);
      if (!rowCells.length) continue;

      let rowY = Math.min(...rowCells.map(c => c.y || 0));
      const rowHeight = Math.max(...rowCells.map(c => c.height || 0), 42);
      const hasAbsoluteCells = rowCells.some(c => c.layoutPositioning === 'ABSOLUTE');
      const overlapDetected = prevRowY !== null && rowY <= prevRowY;

      if (r > 0 && (overlapDetected || hasAbsoluteCells)) {
        for (let c = 0; c < rowCells.length; c++) {
          try { rowCells[c].layoutPositioning = 'ABSOLUTE'; } catch {}
          rowCells[c].x = colXs[c] ?? rowCells[c].x;
          rowCells[c].y = nextRowY;
        }
        rowY = nextRowY;
      }

      prevRowY = rowY;
      nextRowY = Math.max(nextRowY, rowY) + rowHeight;
    }
  } else {
    let overlapDetected = false;
    let prevRowY = null;

    for (let r = 0; r < currentTotalRows; r++) {
      const rowStart = r * columns;
      const rowY = cellContainers[rowStart]?.y || 0;
      if (prevRowY !== null && rowY <= prevRowY) {
        overlapDetected = true;
        break;
      }
      prevRowY = rowY;
    }

    if (overlapDetected || tableInnerFrame.layoutMode === 'NONE') {
      const rowStartY = cellContainers[0]?.y || 0;
      const colXs = Array.from({ length: columns }, (_, c) => cellContainers[c]?.x || 0);
      let nextRowY = rowStartY;

      for (let r = 0; r < currentTotalRows; r++) {
        const rowStart = r * columns;
        const rowCells = Array.from({ length: columns }, (_, c) => cellContainers[rowStart + c]).filter(Boolean);
        const rowHeight = Math.max(...rowCells.map(c => c.height || 0), 42);

        for (let c = 0; c < rowCells.length; c++) {
          rowCells[c].x = colXs[c] ?? rowCells[c].x;
          rowCells[c].y = nextRowY;
        }

        nextRowY += rowHeight;
      }
    }
  }
}

const appliedRows = sourceRows.slice(0, bodyRowCapacity);
const droppedRows = Math.max(0, sourceRows.length - bodyRowCapacity);

if (columns === 4 && cellContainers.length >= 4) {
  await setTextInNode(cellContainers[0], 'Property');
  await setTextInNode(cellContainers[1], 'Description');
  await setTextInNode(cellContainers[2], 'Values');
  await setTextInNode(cellContainers[3], 'Default');
}

for (let rowIdx = 0; rowIdx < bodyRowCapacity; rowIdx++) {
  const row = appliedRows[rowIdx] || (columns === 4 ? ['', '', '', ''] : ['', '', '', '', '', '']);
  const rowBase = columns + (rowIdx * columns); // skip header row

  if (columns === 4) {
    await setTextInNode(cellContainers[rowBase + 0], row[0]);
    updatedCount++;

    await setTextInNode(cellContainers[rowBase + 1], row[1]);
    updatedCount++;

    const valuesCell = cellContainers[rowBase + 2];
    const valueInstances = (valuesCell.children || []).filter(ch => ch.type === 'INSTANCE');
    if (valueInstances.length) {
      const parts = String(row[2] || '').split(',').map(v => v.trim()).filter(Boolean);
      for (let i = 0; i < valueInstances.length; i++) {
        const nextValue = parts[i] || '';
        await setTextInNode(valueInstances[i], nextValue);
        valueInstances[i].visible = nextValue !== '';
        updatedCount++;
      }
    } else {
      await setTextInNode(valuesCell, row[2]);
      updatedCount++;
    }

    await setTextInNode(cellContainers[rowBase + 3], row[3]);
    updatedCount++;
  } else {
    for (let colIdx = 0; colIdx < 6; colIdx++) {
      await setTextInNode(cellContainers[rowBase + colIdx], row[colIdx]);
      updatedCount++;
    }
  }
}

figma.notify(
  \`✅ Template populated: ${componentName} v${componentVersion} (\${appliedRows.length} rows, \${columns} cols, dropped \${droppedRows})\`
);
  `.trim();

  return code;
}

/**
 * Execute the population code in Figma via Console MCP
 *
 * This is a helper that shows how to call figma_execute.
 * The actual execution happens through the Copilot Chat tools.
 *
 * @param {string} code - JavaScript code from generateFigmaExecutionCode()
 * @returns {Object} Instructions for using figma_execute
 */
export function getFigmaExecuteInstructions(code) {
  return {
    toolName: 'mcp_figma-console_figma_execute',
    toolParameter: 'code',
    code,
    instructions: [
      'This code is ready to execute in Figma Console MCP:',
      '1. The code uses top-level await in Figma plugin context',
      '2. It preserves template structure and fills table in-place',
      '3. It auto-expands body rows (via clone) when docs have more rows',
      '4. It strips markdown backticks from table cell values',
      '5. No plugin required — uses native Figma API via MCP'
    ]
  };
}

/**
 * Generate a human-readable preview of what will be updated
 *
 * @param {Object} componentDoc - Parsed component doc
 * @returns {string} Preview text
 */
export function generateUpdatePreview(componentDoc) {
  const { componentName, componentVersion, description, tables } = componentDoc;
  const descFirstLine = description.split('\n')[0].substring(0, 100);

  const preview = `
📋 Template Update Preview
═══════════════════════════════════════

Component: ${componentName} v${componentVersion}
Description: "${descFirstLine}..."

Updates:
  ✓ Text: {componentName} ← "${componentName}"
  ✓ Text: {componentVersion} ← "${componentVersion}"
  ✓ Text: {componentDescription} ← "${descFirstLine}..."
  ✓ Table: ${tables.properties.length} property rows
  ✓ A11y: ${tables.a11y.length} accessibility entries
  ✓ Changelog: ${tables.changelog.length} entries

Ready to execute in Figma.
  `.trim();

  return preview;
}

export default {
  generateFigmaExecutionCode,
  getFigmaExecuteInstructions,
  generateUpdatePreview
};
