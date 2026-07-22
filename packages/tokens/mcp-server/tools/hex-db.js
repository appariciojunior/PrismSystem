/**
 * Hex DB — shared loader for the Figma-sourced resolved-hexes.json database.
 *
 * Provides mtime-cached access so tools pay no repeated I/O cost.
 */

import { readFileSync, statSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, '../../data/resolved-hexes.json');

let cache = {
  mtimeMs: -1,
  db: null
};

/**
 * Load (or return cached) resolved-hexes.json.
 * Returns the parsed object, or null if the file is missing / unreadable.
 */
export function loadHexDb() {
  if (!existsSync(DB_PATH)) return null;

  let stats;
  try {
    stats = statSync(DB_PATH);
  } catch {
    return null;
  }

  if (cache.db && cache.mtimeMs === stats.mtimeMs) {
    return cache.db;
  }

  try {
    const raw = readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    cache = { mtimeMs: stats.mtimeMs, db: parsed };
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Returns the `_meta` object from the DB, or null if unavailable.
 */
export function getMeta() {
  const db = loadHexDb();
  return db?._meta ?? null;
}

/**
 * Resolve a hex string for a given token path and mode.
 * @param {string} tokenPath  e.g. "color.background.primary"
 * @param {'light'|'dark'} mode
 * @returns {string|null}  hex string like "#FFFFFF", or null if not found
 */
export function getHex(tokenPath, mode) {
  const db = loadHexDb();
  if (!db) return null;
  const entry = db[tokenPath];
  if (!entry) return null;
  return entry[mode] ?? null;
}

/**
 * Returns all token entries as [tokenPath, { light?, dark?, figmaVariableId }] pairs.
 * Excludes the `_meta` key.
 */
export function getAllEntries() {
  const db = loadHexDb();
  if (!db) return [];
  return Object.entries(db).filter(([key]) => key !== '_meta');
}

/**
 * Returns true if the DB has been populated with at least one token.
 */
export function isDbPopulated() {
  const meta = getMeta();
  return meta != null && meta.tokenCount > 0;
}
