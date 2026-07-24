/**
 * Token Validate Tool
 * Skill: validation/json-validate.md + validation/build-verify.md
 *
 * Validate tokens.json syntax, structure, and optionally run builds.
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadTokens } from './token-utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = resolve(__dirname, '../../src/tokens.json');
const REPO_ROOT = resolve(__dirname, '../../../..');

/**
 * Validate tokens at various levels.
 */
export async function tokenValidate({ level }) {
  let parsedTokens = null;
  const result = {
    level,
    json_syntax: null,
    structure: null,
    tests: null,
    build: null,
    errors: []
  };

  // --- Syntax check (always) ---
  try {
    const raw = readFileSync(TOKENS_PATH, 'utf-8');
    parsedTokens = JSON.parse(raw);
    result.json_syntax = { status: 'pass' };
  } catch (err) {
    result.json_syntax = {
      status: 'fail',
      error: err.message,
      position: err.message.match(/position (\d+)/)?.[1] || null
    };
    result.errors.push(`JSON syntax error: ${err.message}`);
    // Can't proceed further with invalid JSON
    return result;
  }

  if (level === 'syntax') return result;

  // --- Structure check ---
  try {
    const tokens = parsedTokens || loadTokens();

    const checks = {
      has_themes: '$themes' in tokens,
      has_foundation: 'Foundation' in tokens,
      themes_is_array: Array.isArray(tokens.$themes)
    };

    // Check expected token sets exist
    const expectedSets = ['Foundation', 'light/ core', 'dark/ core'];
    const missingSets = expectedSets.filter((s) => !(s in tokens));

    // Check font weights are strings in Foundation
    const fontWeightIssues = [];
    const checkFontWeights = (obj, path = '') => {
      for (const [key, val] of Object.entries(obj)) {
        if (
          key === 'fontWeight' &&
          val &&
          typeof val === 'object' &&
          'value' in val
        ) {
          if (typeof val.value === 'number') {
            fontWeightIssues.push(
              `${path}.${key}: ${val.value} (should be string)`
            );
          }
        } else if (val && typeof val === 'object' && !Array.isArray(val)) {
          checkFontWeights(val, path ? `${path}.${key}` : key);
        }
      }
    };
    if (tokens.Foundation) {
      checkFontWeights(tokens.Foundation, 'Foundation');
    }

    result.structure = {
      status:
        missingSets.length === 0 && fontWeightIssues.length === 0
          ? 'pass'
          : 'fail',
      checks,
      missingSets,
      fontWeightIssues,
      tokenSetCount: Object.keys(tokens).filter((k) => !k.startsWith('$'))
        .length
    };

    if (missingSets.length > 0) {
      result.errors.push(`Missing token sets: ${missingSets.join(', ')}`);
    }
    if (fontWeightIssues.length > 0) {
      result.errors.push(
        `Font weight format issues: ${fontWeightIssues.join('; ')}`
      );
    }
  } catch (err) {
    result.structure = { status: 'error', error: err.message };
    result.errors.push(`Structure check error: ${err.message}`);
  }

  if (level === 'structure') return result;

  // --- Build check ---
  if (level === 'build' || level === 'full') {
    try {
      execSync('npm run build:output 2>&1', {
        cwd: REPO_ROOT,
        timeout: 30000,
        encoding: 'utf-8'
      });
      result.build = { status: 'pass' };
    } catch (err) {
      result.build = {
        status: 'fail',
        error: err.stdout?.slice(-500) || err.message
      };
      result.errors.push('Build failed');
    }
  }

  // --- Test check ---
  if (level === 'full') {
    try {
      execSync('npm run test:output 2>&1', {
        cwd: REPO_ROOT,
        timeout: 30000,
        encoding: 'utf-8'
      });
      result.tests = { status: 'pass' };
    } catch (err) {
      result.tests = {
        status: 'fail',
        error: err.stdout?.slice(-500) || err.message
      };
      result.errors.push('Tests failed');
    }
  }

  return result;
}
