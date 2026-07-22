#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  processModifier,
  resolveValue,
  rgbaToHex
} from './process-colour-functions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../../../../');
const TOKENS_PATH = path.join(ROOT, 'packages/tokens/src/tokens.json');
const OUTPUT_PATH = path.join(
  ROOT,
  'packages/tokens/data/resolved-tokens.json'
);

const SKIP_KEYS = new Set(['$themes', '$metadata']);
const REFERENCE_FALLBACK_REPLACEMENTS = [['.puzzles.', '.puzzle.']];

function isMetadataKey(key) {
  return SKIP_KEYS.has(key) || key.startsWith('$figma');
}

function setNestedValue(target, keyPath, value) {
  keyPath.reduce((obj, key, index) => {
    if (index === keyPath.length - 1) {
      obj[key] = value;
      return obj[key];
    }

    obj[key] = obj[key] || {};
    return obj[key];
  }, target);
}

function getByPathLoose(obj, pathParts) {
  let current = obj;
  for (const part of pathParts) {
    if (!current || typeof current !== 'object') return null;
    if (Object.prototype.hasOwnProperty.call(current, part)) {
      current = current[part];
      continue;
    }

    const fallbackKey = Object.keys(current).find(
      (key) => key.trim().toLowerCase() === part.trim().toLowerCase()
    );
    if (!fallbackKey) return null;
    current = current[fallbackKey];
  }

  return current;
}

function getModeFromPath(currentPath) {
  const topLevel = currentPath?.[0] || '';
  if (topLevel.startsWith('light/')) return 'light';
  if (topLevel.startsWith('dark/')) return 'dark';
  return null;
}

function resolveLegacyBrandReference(tokens, reference, mode) {
  if (!mode || typeof reference !== 'string') return null;
  if (!(reference.startsWith('{') && reference.endsWith('}'))) return null;

  const refPath = reference.slice(1, -1);
  const aliases = [['.puzzles.', '.puzzle.']];
  const candidateRefs = [refPath];
  for (const [from, to] of aliases) {
    if (refPath.includes(from)) {
      candidateRefs.push(refPath.replaceAll(from, to));
    }
  }

  for (const candidate of candidateRefs) {
    let rootObject = null;
    let suffix = null;

    if (candidate.startsWith('brand.core.ramp.')) {
      rootObject = tokens[`${mode}/ brand`]?.ramp;
      suffix = candidate.replace('brand.core.ramp.', '');
    } else if (candidate.startsWith('brand.data-visualisation.ramp.')) {
      rootObject = tokens[`${mode}/ dataVisualisation`]?.ramp;
      suffix = candidate.replace('brand.data-visualisation.ramp.', '');
    }

    if (!rootObject || !suffix) continue;

    const found = getByPathLoose(rootObject, suffix.split('.'));
    if (!found) continue;

    if (
      typeof found === 'object' &&
      Object.prototype.hasOwnProperty.call(found, 'value')
    ) {
      return resolveValue(tokens, found.value);
    }

    if (typeof found === 'string') {
      return resolveValue(tokens, found);
    }

    return found;
  }

  return null;
}

function resolveColorValue(tokens, token, currentPath) {
  const rawValue = token?.value;
  let resolved = resolveValue(tokens, rawValue, currentPath);

  if (
    typeof resolved === 'string' &&
    resolved.startsWith('{') &&
    resolved.endsWith('}')
  ) {
    const fallbackCandidates = [rawValue, resolved].filter(
      (candidate) => typeof candidate === 'string'
    );

    for (const candidate of fallbackCandidates) {
      for (const [from, to] of REFERENCE_FALLBACK_REPLACEMENTS) {
        if (!candidate.includes(from)) continue;
        const fallbackRef = candidate.replaceAll(from, to);
        const fallbackResolved = resolveValue(tokens, fallbackRef, currentPath);
        if (
          typeof fallbackResolved !== 'string' ||
          !fallbackResolved.startsWith('{') ||
          !fallbackResolved.endsWith('}')
        ) {
          resolved = fallbackResolved;
          break;
        }
      }

      if (
        typeof resolved !== 'string' ||
        !resolved.startsWith('{') ||
        !resolved.endsWith('}')
      ) {
        break;
      }
    }
  }

  if (
    typeof resolved === 'string' &&
    resolved.startsWith('{') &&
    resolved.endsWith('}')
  ) {
    const mode = getModeFromPath(currentPath);
    const legacyResolved = resolveLegacyBrandReference(tokens, resolved, mode);
    if (legacyResolved !== null) {
      resolved = legacyResolved;
    }
  }

  const modifier = token?.$extensions?.['studio.tokens']?.modify;
  if (modifier) {
    const modifierInput = { ...modifier };
    if (modifierInput.color) {
      modifierInput.color = resolveValue(
        tokens,
        modifierInput.color,
        currentPath
      );
    }
    resolved = processModifier(resolved, modifierInput, tokens, currentPath);
  }

  if (typeof resolved === 'string' && resolved.startsWith('rgb')) {
    return rgbaToHex(resolved);
  }

  return resolved;
}

function traverse(tokens, sourceNode, outputNode, currentPath = []) {
  if (!sourceNode || typeof sourceNode !== 'object') return;

  for (const [key, value] of Object.entries(sourceNode)) {
    if (isMetadataKey(key)) continue;

    const nextPath = [...currentPath, key];
    const isColorToken =
      value &&
      typeof value === 'object' &&
      value.type === 'color' &&
      Object.prototype.hasOwnProperty.call(value, 'value');

    if (isColorToken) {
      const resolvedValue = resolveColorValue(tokens, value, nextPath);
      setNestedValue(outputNode, nextPath, { value: resolvedValue });
      continue;
    }

    if (value && typeof value === 'object') {
      traverse(tokens, value, outputNode, nextPath);
    }
  }
}

function main() {
  const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
  const output = {};

  // Pure mode: always compute from token references and modifiers.
  traverse(tokens, tokens, output);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Generated ${OUTPUT_PATH}`);
}

main();
