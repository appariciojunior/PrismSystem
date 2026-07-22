/**
 * Component Doc ↔ Figma Template API
 *
 * Unified interface for:
 * 1. Parsing component docs
 * 2. Generating Figma execution code
 * 3. Displaying preview & instructions for Figma Console MCP
 *
 * Usage (Node.js / npm script):
 *   npm run sync:component-doc -- --component button
 *   npm run sync:component-doc -- --file packages/tokens/docs/components/link/Link.md
 *
 * Then use the generated code with Figma Console MCP:
 *   mcp_figma-console_figma_execute
 */

import { parseComponentDoc } from './component-doc-to-figma.js';
import {
  generateFigmaExecutionCode,
  generateUpdatePreview,
  getFigmaExecuteInstructions
} from './figma-console-executor.js';

export {
  parseComponentDoc,
  generateFigmaExecutionCode,
  generateUpdatePreview,
  getFigmaExecuteInstructions
};

/**
 * Main API: Load component doc and generate Figma execution code
 */
export async function loadAndSyncComponentDoc(docPathOrName, options = {}) {
  const { verbose = true } = options;

  if (verbose) {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  Component Doc ↔ Figma Console MCP Sync');
    console.log('═══════════════════════════════════════════════════\n');
  }

  try {
    // Parse component doc
    const componentDoc = parseComponentDoc(docPathOrName);

    if (verbose) {
      console.log(
        `📄 Component: ${componentDoc.componentName} v${componentDoc.componentVersion}`
      );
      console.log(
        `   📊 Tables: ${componentDoc.tables.properties.length} properties, ` +
          `${componentDoc.tables.a11y.length} a11y, ` +
          `${componentDoc.tables.changelog.length} changelog`
      );
    }

    // Generate Figma execution code
    const figmaCode = generateFigmaExecutionCode(componentDoc, {
      verboseLogging: false
    });
    const preview = generateUpdatePreview(componentDoc);
    const instructions = getFigmaExecuteInstructions(figmaCode);

    if (verbose) {
      console.log(`\n${preview}`);
      console.log(`\n🎨 Figma Execution Code (ready for figma_execute):\n`);
      console.log(figmaCode);
      console.log(
        `\n📝 To apply this, use Figma Console MCP tool 'figma_execute':`
      );
      console.log(`   Tool: mcp_figma-console_figma_execute`);
      console.log(`   Pass the code above as the 'code' parameter\n`);
    }

    return {
      componentDoc,
      figmaCode,
      preview,
      instructions
    };
  } catch (err) {
    console.error(`\n❌ Sync failed: ${err.message}`);
    throw err;
  }
}

/**
 * Batch sync: process all component docs
 */
export async function batchSyncComponentDocs(options = {}) {
  const { dryRun = true, verbose = true } = options;
  const results = [];

  console.log('\n🔄 Batch syncing all component docs...\n');

  // Discover all component docs
  const fs = await import('fs').then((m) => m.default);
  const path = await import('path').then((m) => m.default);
  const { fileURLToPath } = await import('url');

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const docsDir = path.resolve(__dirname, '../docs/components');

  if (!fs.existsSync(docsDir)) {
    console.warn('⚠️  No component docs directory found');
    return results;
  }

  const dirs = fs.readdirSync(docsDir);
  for (const dir of dirs) {
    const componentPath = path.join(docsDir, dir);
    const stat = fs.statSync(componentPath);
    if (stat.isDirectory()) {
      const docs = fs
        .readdirSync(componentPath)
        .filter((f) => f.endsWith('.md'));
      if (docs.length > 0) {
        try {
          const result = await loadAndSyncComponentDoc(
            path.join(componentPath, docs[0]),
            {
              dryRun,
              verbose: false
            }
          );
          results.push({ dir, success: true, result });
          if (verbose) console.log(`  ✅ ${dir}`);
        } catch (err) {
          results.push({ dir, success: false, error: err.message });
          if (verbose) console.log(`  ❌ ${dir}: ${err.message}`);
        }
      }
    }
  }

  console.log(
    `\n📊 Batch sync complete: ${results.filter((r) => r.success).length}/${results.length} succeeded\n`
  );
  return results;
}

// Export for use as library
export default {
  loadAndSyncComponentDoc,
  batchSyncComponentDocs,
  parseComponentDoc,
  generateFigmaExecutionCode,
  generateUpdatePreview,
  getFigmaExecuteInstructions
};
