#!/usr/bin/env node

/**
 * Component Doc → Figma Template Sync
 *
 * Reads component docs (e.g., Button.md) and populates Figma template
 * at node-id=8075-17411 (Link - Details frame) with:
 *   - Component name & description
 *   - Properties table (Figma Property | Code Property | Type | Allowed Values | Default | Description)
 *   - Accessibility table
 *   - Changelog table
 *
 * Usage:
 *   npm run sync:component-doc -- --component button
 *   npm run sync:component-doc -- --file packages/tokens/docs/components/link/Link.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================================
// CONFIG
// ============================================================================

const FIGMA_FILE_KEY = 'YOUR-FIGMA-FILE-KEY';
const TEMPLATE_FRAME_ID = '8075:17411'; // Link - Details
const COMPONENT_DOCS_DIR = path.resolve(__dirname, '../docs/components');

const FIGMA_API_CONFIG = {
  fileKey: FIGMA_FILE_KEY,
  templateFrameId: TEMPLATE_FRAME_ID,
  descriptionPlaceholder: '{componentDescription}',
  tableRowLimit: 20
};

// ============================================================================
// PARSER: Markdown Table Extraction
// ============================================================================

function parseMarkdownTables(markdown) {
  const lines = markdown.split('\n');
  const tables = [];
  let currentTable = null;
  let headerLine = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      currentTable = null;
      headerLine = null;
      continue;
    }

    // Detect separator line (|---|---|...)
    if (line.startsWith('|') && line.includes('---') && line.endsWith('|')) {
      if (headerLine) {
        const headers = headerLine
          .split('|')
          .slice(1, -1)
          .map((h) => h.trim());

        currentTable = { headers, rows: [] };
        tables.push(currentTable);
      }
      continue;
    }

    // Collect table row
    if (line.startsWith('|') && line.endsWith('|')) {
      if (currentTable) {
        const row = line
          .split('|')
          .slice(1, -1)
          .map((cell) => cell.trim());
        currentTable.rows.push(row);
      } else {
        headerLine = line;
      }
    }
  }

  return tables;
}

function findTableByHeader(tables, pattern) {
  return tables.find((t) => t.headers.some((h) => h.includes(pattern)));
}

function tableToObjects(table) {
  return table.rows.map((row) => {
    const obj = {};
    table.headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });
}

function normalizeDocValue(value = '') {
  return String(value).replace(/`/g, '').trim().toLowerCase();
}

function getFrontmatterBlock(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/m);
  return match ? match[1] : null;
}

function parseYamlValue(value = '') {
  return String(value)
    .trim()
    .replace(/^['"]|['"]$/g, '');
}

function hasFrontmatterKey(frontmatter, key) {
  return new RegExp(`^${key}:`, 'm').test(frontmatter);
}

function parseCanonicalIds(frontmatter) {
  const metadata = {};
  const ids = {
    properties: [],
    variants: [],
    behaviors: []
  };

  const lines = frontmatter.split('\n');
  let inCanonicalIds = false;
  let currentCollection = null;
  let currentItem = null;
  let currentListField = null;

  for (const rawLine of lines) {
    const indent = rawLine.length - rawLine.trimStart().length;
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (indent === 0) {
      if (line === 'canonical_ids:') {
        inCanonicalIds = true;
        currentCollection = null;
        currentItem = null;
        currentListField = null;
        continue;
      }

      inCanonicalIds = false;
      currentCollection = null;
      currentItem = null;
      currentListField = null;

      const scalarMatch = line.match(/^([a-z_]+):\s*(.+)$/);
      if (scalarMatch) {
        metadata[scalarMatch[1]] = parseYamlValue(scalarMatch[2]);
      }
      continue;
    }

    if (!inCanonicalIds) {
      continue;
    }

    if (indent === 2 && line.endsWith(':')) {
      currentCollection = line.slice(0, -1);
      currentItem = null;
      currentListField = null;
      continue;
    }

    if (!currentCollection || !ids[currentCollection]) {
      continue;
    }

    if (indent === 4 && line.startsWith('- ')) {
      currentItem = {};
      ids[currentCollection].push(currentItem);
      currentListField = null;

      const firstField = line.slice(2).match(/^([a-z_]+):\s*(.*)$/);
      if (firstField) {
        const [, key, value] = firstField;
        if (value === '') {
          currentItem[key] = [];
          currentListField = key;
        } else {
          currentItem[key] = parseYamlValue(value);
        }
      }
      continue;
    }

    if (!currentItem) {
      continue;
    }

    if (indent === 6) {
      const fieldMatch = line.match(/^([a-z_]+):\s*(.*)$/);
      if (!fieldMatch) {
        continue;
      }

      const [, key, value] = fieldMatch;
      if (value === '') {
        currentItem[key] = [];
        currentListField = key;
      } else {
        currentItem[key] = parseYamlValue(value);
        currentListField = null;
      }
      continue;
    }

    if (indent === 8 && line.startsWith('- ') && currentListField) {
      currentItem[currentListField].push(parseYamlValue(line.slice(2)));
    }
  }

  return { metadata, ids };
}

function extractSummary(markdown) {
  const lines = markdown.split('\n');
  const summaryIndex = lines.findIndex((line) => line.trim() === '## Summary');

  if (summaryIndex !== -1) {
    const summaryLines = [];

    for (let index = summaryIndex + 1; index < lines.length; index += 1) {
      const trimmedLine = lines[index].trim();

      if (trimmedLine.startsWith('## ')) {
        break;
      }

      if (
        !trimmedLine ||
        trimmedLine === '---' ||
        trimmedLine.startsWith('**')
      ) {
        continue;
      }

      summaryLines.push(trimmedLine);
    }

    if (summaryLines.length > 0) {
      return summaryLines.join(' ');
    }
  }

  const legacyDescription = markdown.match(
    /^#\s+.+\n\n([\s\S]*?)(?=\n##\s|\n\|)/m
  );
  return legacyDescription ? legacyDescription[1].trim() : '';
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

function extractSections(markdown) {
  const body = stripFrontmatter(markdown);
  const headingMatches = [...body.matchAll(/^##\s+(.+)$/gm)];
  const sections = {};

  headingMatches.forEach((match, index) => {
    const heading = match[1].trim();
    const contentStart = match.index + match[0].length + 1;
    const contentEnd =
      index + 1 < headingMatches.length
        ? headingMatches[index + 1].index
        : body.length;

    sections[heading] = body.slice(contentStart, contentEnd).trim();
  });

  return sections;
}

function collectStateHeadings(markdown, canonicalValues = []) {
  const headings = [...markdown.matchAll(/^###\s+(.+)$/gm)].map((match) =>
    normalizeDocValue(match[1])
  );

  if (canonicalValues.length === 0) {
    return headings;
  }

  const allowedValues = new Set(
    canonicalValues.map((value) => normalizeDocValue(value))
  );
  return headings.filter((heading) => allowedValues.has(heading));
}

function uniqueValues(items, key) {
  const seen = new Set();
  const duplicates = new Set();

  items.forEach((item) => {
    const value = item[key];
    if (!value) {
      return;
    }

    if (seen.has(value)) {
      duplicates.add(value);
      return;
    }

    seen.add(value);
  });

  return [...duplicates];
}

function validateMachineReadableIds(markdown, componentVersion, tables) {
  const frontmatter = getFrontmatterBlock(markdown);

  if (!frontmatter || !hasFrontmatterKey(frontmatter, 'canonical_ids')) {
    return { enabled: false, metadata: null, ids: null, errors: [] };
  }

  const errors = [];
  const requiredTopLevelFields = [
    'status',
    'component_id',
    'component_version',
    'owners',
    'last_reviewed',
    'storybook_refs',
    'figma_refs',
    'parity_state',
    'canonical_ids'
  ];

  requiredTopLevelFields.forEach((field) => {
    if (!hasFrontmatterKey(frontmatter, field)) {
      errors.push(`Missing frontmatter field "${field}".`);
    }
  });

  const { metadata, ids } = parseCanonicalIds(frontmatter);

  if (
    metadata.component_version &&
    metadata.component_version !== componentVersion
  ) {
    errors.push(
      `Frontmatter component_version "${metadata.component_version}" does not match heading version "${componentVersion}".`
    );
  }

  [
    ['properties', 'property_id', ['property_id', 'figma_property', 'support']],
    ['variants', 'variant_id', ['variant_id', 'property_id', 'value']],
    ['behaviors', 'behavior_id', ['behavior_id', 'concern']]
  ].forEach(([collectionName, idField, requiredFields]) => {
    ids[collectionName].forEach((item, index) => {
      requiredFields.forEach((field) => {
        if (!item[field]) {
          errors.push(
            `Missing ${field} on ${collectionName}[${index}] in canonical_ids.`
          );
        }
      });
    });

    uniqueValues(ids[collectionName], idField).forEach((duplicate) => {
      errors.push(`Duplicate ${idField} "${duplicate}" in ${collectionName}.`);
    });
  });

  const propertyRows = tables.properties.map((row) => ({
    figmaProperty: normalizeDocValue(row['Figma Property']),
    codeProperty: normalizeDocValue(row['Code Property'])
  }));

  const propertiesByFigmaName = new Map(
    ids.properties.map((entry) => [
      normalizeDocValue(entry.figma_property),
      entry
    ])
  );
  const propertyNamesInTable = new Set(
    propertyRows.map((row) => row.figmaProperty)
  );

  propertyRows.forEach((row) => {
    const entry = propertiesByFigmaName.get(row.figmaProperty);

    if (!entry) {
      errors.push(
        `Properties table row "${row.figmaProperty}" is missing a canonical_ids.properties entry.`
      );
      return;
    }

    const support = normalizeDocValue(entry.support);
    const expectedCodeProperty = normalizeDocValue(entry.code_property);

    if (support === 'runtime' || support === 'content') {
      if (!expectedCodeProperty) {
        errors.push(
          `canonical_ids property "${entry.property_id}" is ${support} but has no code_property.`
        );
      } else if (row.codeProperty !== expectedCodeProperty) {
        errors.push(
          `Properties table row "${entry.figma_property}" must use code property "${entry.code_property}", found "${row.codeProperty || '(empty)'}".`
        );
      }
    }

    if (support === 'preview-only' && row.codeProperty !== 'preview-only') {
      errors.push(
        `Properties table row "${entry.figma_property}" must use "preview-only" in the Code Property column.`
      );
    }

    if (support === 'not-exposed' && row.codeProperty !== 'not exposed') {
      errors.push(
        `Properties table row "${entry.figma_property}" must use "not exposed" in the Code Property column.`
      );
    }
  });

  ids.properties.forEach((entry) => {
    if (!propertyNamesInTable.has(normalizeDocValue(entry.figma_property))) {
      errors.push(
        `canonical_ids property "${entry.property_id}" is orphaned; no matching Properties table row exists.`
      );
    }
  });

  const canonicalVariantValues = ids.variants.map((entry) => entry.value);
  const documentedStates = collectStateHeadings(
    markdown,
    canonicalVariantValues
  );
  const variantValues = new Set(
    canonicalVariantValues.map((value) => normalizeDocValue(value))
  );

  documentedStates.forEach((state) => {
    if (!variantValues.has(state)) {
      errors.push(`State heading "${state}" is missing a matching variant_id.`);
    }
  });

  ids.variants.forEach((entry) => {
    if (!documentedStates.includes(normalizeDocValue(entry.value))) {
      errors.push(
        `canonical_ids variant "${entry.variant_id}" is orphaned; no matching state heading exists.`
      );
    }
  });

  const accessibilityConcerns = new Set(
    tables.a11y.map((row) => normalizeDocValue(row['Concern']))
  );

  ids.behaviors.forEach((entry) => {
    if (!accessibilityConcerns.has(normalizeDocValue(entry.concern))) {
      errors.push(
        `canonical_ids behavior "${entry.behavior_id}" is orphaned; no matching Accessibility row exists.`
      );
    }
  });

  tables.a11y.forEach((row) => {
    const concern = normalizeDocValue(row['Concern']);
    const hasBehavior = ids.behaviors.some(
      (entry) => normalizeDocValue(entry.concern) === concern
    );

    if (!hasBehavior) {
      errors.push(
        `Accessibility concern "${concern}" is missing a matching behavior_id.`
      );
    }
  });

  return {
    enabled: true,
    metadata,
    ids,
    errors
  };
}

// ============================================================================
// DOCUMENT PARSER: Extract metadata & tables from component doc
// ============================================================================

export function parseComponentDoc(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Component doc not found: ${filePath}`);
  }

  const markdown = fs.readFileSync(filePath, 'utf8');

  // Parse the H1 title line
  const titleMatch = markdown.match(/^#\s+(.+?)(\s+\d+\.\d+\.\d+)?$/m);
  const componentName = titleMatch ? titleMatch[1].trim() : 'Unknown';
  const versionMatch = titleMatch ? titleMatch[2] : null;
  const componentVersion = versionMatch ? versionMatch.trim() : '1.0.0';

  const description = extractSummary(markdown);

  // Extract tables
  const tables = parseMarkdownTables(markdown);

  // Find specific tables
  const propertiesTable = findTableByHeader(tables, 'Figma Property');
  const a11yTable =
    findTableByHeader(tables, 'Concern') ||
    findTableByHeader(tables, 'Accessibility');
  const changelogTable =
    findTableByHeader(tables, 'Date') || findTableByHeader(tables, 'Entry');

  const parsedDoc = {
    componentName,
    componentVersion,
    description,
    sections: extractSections(markdown),
    tables: {
      properties: propertiesTable ? tableToObjects(propertiesTable) : [],
      a11y: a11yTable ? tableToObjects(a11yTable) : [],
      changelog: changelogTable ? tableToObjects(changelogTable) : []
    }
  };

  const validation = validateMachineReadableIds(
    markdown,
    componentVersion,
    parsedDoc.tables
  );

  if (validation.enabled && validation.errors.length > 0) {
    throw new Error(
      `Machine-readable ID validation failed:\n- ${validation.errors.join('\n- ')}`
    );
  }

  return {
    ...parsedDoc,
    validation,
    frontmatter: validation.enabled ? validation.metadata : null,
    canonicalIds: validation.enabled ? validation.ids : null
  };
}

// ============================================================================
// FIGMA SYNC: Build payload
// ============================================================================

export function buildFigmaSyncPayload(componentDoc) {
  const { componentName, componentVersion, description, tables } = componentDoc;

  const descriptionText = description.split('\n')[0].substring(0, 200);

  const propertyRows = tables.properties
    .slice(0, FIGMA_API_CONFIG.tableRowLimit)
    .map((prop) => [
      prop['Figma Property'] || '',
      prop['Code Property'] || '',
      prop['Type'] || '',
      prop['Allowed Values'] || '',
      prop['Default'] || '',
      prop['Description'] || ''
    ]);

  return {
    fileKey: FIGMA_FILE_KEY,
    templateFrameId: TEMPLATE_FRAME_ID,
    updates: {
      title: `${componentName} - v${componentVersion}`,
      description: descriptionText,
      propertyTableRows: propertyRows,
      a11yRows: tables.a11y.slice(0, 10),
      changelogRows: tables.changelog.slice(0, 5)
    }
  };
}

// ============================================================================
// HELPERS: Resolve paths
// ============================================================================

export function resolveComponentDocPath(input) {
  if (input.includes('/') || input.endsWith('.md')) {
    return path.resolve(input);
  }

  const dirs = fs.readdirSync(COMPONENT_DOCS_DIR);
  const componentDir = dirs.find(
    (d) => d.toLowerCase() === input.toLowerCase()
  );

  if (!componentDir) {
    throw new Error(`Component directory not found: ${input}`);
  }

  const componentPath = path.join(COMPONENT_DOCS_DIR, componentDir);
  const files = fs.readdirSync(componentPath).filter((f) => f.endsWith('.md'));

  if (files.length === 0) {
    throw new Error(`No markdown doc found in ${componentPath}`);
  }

  return path.join(componentPath, files[0]);
}

// ============================================================================
// CLI MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Usage:
  node component-doc-to-figma.js --component <name>
  node component-doc-to-figma.js --file <path>

Options:
  --component <name>     Component name (e.g., button, link, icon-button)
  --file <path>          Direct path to component doc

Examples:
  node component-doc-to-figma.js --component link
  node component-doc-to-figma.js --file packages/tokens/docs/components/button/Button.md
    `);
    process.exit(0);
  }

  try {
    // Import the executor here to avoid circular dependency
    const { generateFigmaExecutionCode, generateUpdatePreview } = await import(
      './figma-console-executor.js'
    );

    let docPath;

    if (args.includes('--component')) {
      const idx = args.indexOf('--component');
      const componentName = args[idx + 1];
      docPath = resolveComponentDocPath(componentName);
    } else if (args.includes('--file')) {
      const idx = args.indexOf('--file');
      docPath = args[idx + 1];
    } else {
      throw new Error('No --component or --file specified');
    }

    console.log(`\n📄 Reading component doc: ${docPath}`);

    const componentDoc = parseComponentDoc(docPath);
    console.log(
      `✅ Parsed: ${componentDoc.componentName} v${componentDoc.componentVersion}`
    );
    console.log(`   Properties: ${componentDoc.tables.properties.length} rows`);
    console.log(`   A11y: ${componentDoc.tables.a11y.length} rows`);
    console.log(`   Changelog: ${componentDoc.tables.changelog.length} rows`);
    if (componentDoc.validation.enabled) {
      console.log(
        `   Machine-readable IDs: ${componentDoc.validation.ids.properties.length} properties, ${componentDoc.validation.ids.variants.length} variants, ${componentDoc.validation.ids.behaviors.length} behaviors`
      );
    }

    // Display update preview
    const preview = generateUpdatePreview(componentDoc);
    console.log(`\n${preview}`);

    // Generate Figma execution code
    const figmaCode = generateFigmaExecutionCode(componentDoc);
    console.log(`\n🎨 Figma Execution Code (for figma_execute):\n`);
    console.log('```javascript');
    console.log(figmaCode);
    console.log('```');

    console.log(`\n📝 How to use:\n`);
    console.log(
      '1. Open Figma file: https://figma.com/design/YOUR-FIGMA-FILE-KEY'
    );
    console.log(
      '2. In Copilot Chat, use tool: mcp_figma-console_figma_execute'
    );
    console.log('3. Paste the code above as the "code" parameter');
    console.log('4. Template will be populated in real-time\n');

    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    process.exit(1);
  }
}

// Only run main() if this file is executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
