// USAGE:
//   Called by an AI agent after running the Figma resolution code via Desktop Bridge MCP.
//
//   Step 1 — Agent runs this figma_execute code to resolve all COLOR variables in Figma context:
//
//   ┌─────────────────────────────────────────────────────────────────────────────────┐
//   │ const vars = await figma.variables.getLocalVariablesAsync('COLOR');             │
//   │ const collections = await figma.variables.getLocalVariableCollectionsAsync();   │
//   │ const varById = {};                                                             │
//   │ for (const v of vars) { varById[v.id] = v; }                                   │
//   │ function toHex2(f) {                                                            │
//   │   return Math.round(f * 255).toString(16).padStart(2, '0').toUpperCase();       │
//   │ }                                                                               │
//   │ function resolveValue(val, modeId, depth = 0) {                                 │
//   │   if (depth > 10 || !val) return null;                                          │
//   │   if (val.type === 'VARIABLE_ALIAS') {                                          │
//   │     const target = varById[val.id];                                             │
//   │     if (!target) return null;                                                   │
//   │     const nextVal = target.valuesByMode[modeId] ??                             │
//   │                     Object.values(target.valuesByMode)[0];                     │
//   │     return resolveValue(nextVal, modeId, depth + 1);                            │
//   │   }                                                                             │
//   │   if (typeof val.r === 'number')                                                │
//   │     return '#' + toHex2(val.r) + toHex2(val.g) + toHex2(val.b);               │
//   │   return null;                                                                  │
//   │ }                                                                               │
//   │ const modeCol = collections.find(c => c.name === 'Mode');                      │
//   │ const lightId = modeCol.modes.find(m => m.name.includes('Light'))?.modeId;     │
//   │ const darkId  = modeCol.modes.find(m => m.name.includes('Dark'))?.modeId;      │
//   │ const themeCol = collections.find(c => c.name === 'Theme');                    │
//   │ const db = { _meta: { syncedAt: new Date().toISOString(),                      │
//   │   figmaFileKey: 'YOUR-FIGMA-FILE-KEY', tokenCount: 0, version: '1' } };    │
//   │ let count = 0;                                                                  │
//   │ for (const v of vars.filter(vv => vv.variableCollectionId === modeCol.id)) {   │
//   │   const key = v.name.replace(/\//g, '.');                                      │
//   │   db[key] = {                                                                   │
//   │     light: resolveValue(v.valuesByMode[lightId], lightId),                     │
//   │     dark: resolveValue(v.valuesByMode[darkId], darkId),                        │
//   │     figmaVariableId: v.id                                                      │
//   │   }; count++;                                                                   │
//   │ }                                                                               │
//   │ function themeSlug(modeName) {                                                  │
//   │   const clean = modeName                                                        │
//   │     .replace(/^[\p{Emoji_Presentation}\p{Emoji}\uFE0F\s]+/u, '').trim();      │
//   │   return clean.toLowerCase()                                                   │
//   │     .replace(/\s*&\s*/g, '-and-').replace(/\s+/g, '-')                        │
//   │     .replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');   │
//   │ }                                                                               │
//   │ for (const v of vars.filter(vv => vv.variableCollectionId === themeCol.id)) {  │
//   │   const base = v.name.replace(/\//g, '.');                                     │
//   │   for (const mode of themeCol.modes) {                                         │
//   │     const hex = resolveValue(v.valuesByMode[mode.modeId], mode.modeId);        │
//   │     const isLight = mode.name.includes('☀️');                                  │
//   │     const slug = themeSlug(mode.name);                                         │
//   │     db[`${base}.${slug}.${isLight ? 'light' : 'dark'}`] =                      │
//   │       { hex, figmaVariableId: v.id }; count++;                                 │
//   │   }                                                                             │
//   │ }                                                                               │
//   │ db._meta.tokenCount = count;                                                    │
//   │ return db;                                                                      │
//   └─────────────────────────────────────────────────────────────────────────────────┘
//
//   Step 2 — Agent passes the figma_execute result to this script:
//
//   node packages/tokens/mcp-server/sync-resolved-hexes.js --data '<JSON output>'
//
//   The script validates the data and writes packages/tokens/data/resolved-hexes.json.
//
//   Variable name format (confirmed from Figma file YOUR-FIGMA-FILE-KEY):
//   - Mode collection:  "ramp/blue/50"      → key "ramp.blue.50"  (light + dark modes)
//   - Theme collection: "surface/canvas"    → keys "surface.canvas.{theme}.light/dark"
//   - Aliases are resolved inside Figma context before this script receives the data.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, '../data/resolved-hexes.json');

// ---------------------------------------------------------------------------
// Main sync logic — accepts pre-resolved DB object from figma_execute output
// ---------------------------------------------------------------------------

/**
 * Write a pre-resolved DB object (produced by the figma_execute code in the
 * USAGE comment above) to disk. Validates structure before writing.
 *
 * @param {object} resolvedDb - The DB object returned by figma_execute
 */
async function sync(resolvedDb) {
  if (
    !resolvedDb ||
    typeof resolvedDb !== 'object' ||
    Array.isArray(resolvedDb)
  ) {
    console.error(
      'ERROR: Input must be a resolved DB object (not a raw variables array).'
    );
    console.error(
      '       Run the figma_execute code from the USAGE comment first.'
    );
    process.exit(1);
  }

  if (!resolvedDb._meta) {
    console.error(
      'ERROR: Input is missing _meta. Run the figma_execute code from USAGE.'
    );
    process.exit(1);
  }

  const tokenCount =
    resolvedDb._meta.tokenCount ??
    Object.keys(resolvedDb).filter((k) => k !== '_meta').length;

  if (tokenCount === 0) {
    console.error(
      'ERROR: DB contains 0 tokens. Check the figma_execute output.'
    );
    process.exit(1);
  }

  // Ensure syncedAt is set
  if (!resolvedDb._meta.syncedAt) {
    resolvedDb._meta.syncedAt = new Date().toISOString();
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(resolvedDb, null, 2), 'utf-8');

  console.log(`\n✅ Sync complete`);
  console.log(`   Tokens written : ${tokenCount}`);
  console.log(`   Synced at      : ${resolvedDb._meta.syncedAt}`);
  console.log(`   Output         : ${DB_PATH}`);
}

// ---------------------------------------------------------------------------
// Entry point — read data from --data arg or stdin
// ---------------------------------------------------------------------------

async function main() {
  let rawData = null;

  // CLI arg: --data '...'
  const dataArgIdx = process.argv.indexOf('--data');
  if (dataArgIdx !== -1 && process.argv[dataArgIdx + 1]) {
    rawData = process.argv[dataArgIdx + 1];
  } else if (process.argv[2] && process.argv[2] !== '--data') {
    // Positional arg
    rawData = process.argv[2];
  } else if (!process.stdin.isTTY) {
    // Stdin
    rawData = fs.readFileSync('/dev/stdin', 'utf-8');
  }

  if (!rawData) {
    console.error(
      "ERROR: No variable data provided. Pass via --data '[...]' or stdin."
    );
    process.exit(1);
  }

  let variables;
  try {
    variables = JSON.parse(rawData);
  } catch (e) {
    console.error('ERROR: Could not parse JSON input:', e.message);
    process.exit(1);
  }

  await sync(variables);
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
