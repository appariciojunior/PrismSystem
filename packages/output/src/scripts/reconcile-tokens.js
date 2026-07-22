import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  loadTokens,
  getTokenSets,
  createGlobalTokenIndex,
  getNestedValue,
  loadHexTokens
} from './token-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colourTokens = loadHexTokens();

/**
 * Reconcile all token references by resolving them to their concrete values
 */
async function reconcileTokens() {
  try {
    console.log('🔧 Loading tokens...\n');

    const tokens = loadTokens();
    const globalIndex = createGlobalTokenIndex(tokens);

    const reconciled = {};

    console.log('🔗 Resolving token references...\n');

    // Process each semantic token set (light/dark core)
    for (const [setName, setData] of getTokenSets(tokens)) {
      if (setName === '$themes' || setName === '$metadata') {
        continue;
      }

      console.log(`  Resolving ${setName}...`);
      if (setName === 'typographyTokens') {
        let resolvedTypography = JSON.stringify(setData);
        resolvedTypography = resolvedTypography
          .replaceAll('{fontFamily', '{foundation.fontFamily')
          .replaceAll('{fontSize', '{foundation.fontSize')
          .replaceAll('{fontWeight', '{foundation.fontWeight')
          .replaceAll('{fontLineHeight', '{foundation.fontLineHeight')
          .replaceAll('{underline}', 'underline');
        reconciled[setName] = JSON.parse(resolvedTypography);
      } else {
        reconciled[setName] = resolveTokenSet(
          setData,
          globalIndex,
          tokens,
          setName
        );
      }
    }

    // Write the reconciled tokens
    const outputPath = path.join(process.cwd(), 'tokens-reconciled.json');

    // Clean up intermediate token sets that should not be in the output
    const setsToDelete = [
      'light/ channels',
      'dark/ channels',
      'light/ brand',
      'dark/ brand',
      'light/ marketing',
      'dark/ marketing',
      'light/ dataVisualisation',
      'dark/ dataVisualisation'
    ];

    setsToDelete.forEach((setName) => {
      if (reconciled[setName]) {
        delete reconciled[setName];
      }
    });

    // Remove display typography tokens to prevent interference with reference resolution
    if (reconciled.typographyTokens?.brand?.display) {
      delete reconciled.typographyTokens.brand.display;
    }

    // Delete foundation tokens that don't include 'font' in the name
    // but keep shadow definitions (down/up) and underline needed by other token sets
    if (reconciled.foundation) {
      const foundationKeys = Object.keys(reconciled.foundation);
      for (const key of foundationKeys) {
        const isFontToken = key.includes('font');
        const isShadowDefinition = key === 'down' || key === 'up';
        const isUnderline = key === 'underline';
        if (!isFontToken && !isShadowDefinition && !isUnderline) {
          delete reconciled.foundation[key];
        }
      }
    }

    await fs.writeJson(outputPath, reconciled, { spaces: 2 });

    console.log('\n✅ Reconciliation complete!\n');
    console.log(`📊 Output: ${outputPath}`);
    console.log(`📈 Token sets: ${Object.keys(reconciled).length}`);

    // Optionally replace the original file
    const replaceOriginal = process.argv.includes('--replace');
    if (replaceOriginal) {
      const originalPath = path.resolve(
        __dirname,
        '../../../tokens/src/tokens.json'
      );
      await fs.copy(outputPath, originalPath);
      console.log('🔄 Original tokens.json has been updated');
    }
  } catch (error) {
    console.error('❌ Reconciliation failed:', error);
    process.exit(1);
  }
}

const resolveColourTokens = (setData, setName) => {
  const mode = setName.split('/ ')[0];
  const theme = setName.split('/ ')[1];
  const formattedColourTokens = JSON.stringify(colourTokens).replaceAll(
    'life-and-style',
    'lifeAndStyle'
  );
  const updatedColourTokens = JSON.parse(formattedColourTokens);
  const tokens = loadTokens()[`${mode}/ brand`]; // Load the original tokens to access the token structure for reference resolution
  // console.log('tokens', tokens);

  Object.entries(updatedColourTokens)
    .filter(([key]) => key.endsWith(`.${theme}.${mode}`))
    .forEach(([key, value]) => {
      const tokenItems = key.split('.').slice(0, -2); // Remove the last two segments (theme and mode)
      const tokenItem = tokenItems.reduce((acc, item) => acc?.[item], setData);

      if (!tokenItem?.value) {
        console.log('No tokenItem.value found for', tokenItems);
        return;
      }

      if (tokenItem?.value.match(/overlay/)) {
        const rampToken = tokenItem.value
          .replace('{', '')
          .replace('}', '')
          .split('.');
        const rampTokenItem = rampToken.reduce(
          (acc, item) => acc?.[item],
          tokens
        );

        tokenItem.value = rampTokenItem.value;
      } else {
        tokenItem.value = value.hex;
      }

      delete tokenItem['$extensions'];
    });

  return setData;
};
/**
 * Recursively resolve all token references in a token set,
 * applying modifiers from intermediate tokens when needed
 */
function resolveTokenSet(setData, globalIndex, allTokens, setName) {
  const resolved = {};

  if (setName.match(/light|dark/)) {
    return resolveColourTokens(setData, setName);
  }

  /**
   * Resolve one reference level, returning the next value to resolve
   */
  function resolveOneLevel(refPath) {
    // Check if it's in the current set
    const localMatch = getNestedValue(setData, refPath);
    if (localMatch && typeof localMatch === 'object' && 'value' in localMatch) {
      return localMatch.value;
    }

    // Check global index
    if (globalIndex.has(refPath)) {
      const tokenData = globalIndex.get(refPath);
      const value = typeof tokenData === 'string' ? tokenData : tokenData.value;
      return value;
    }

    return null;
  }

  /**
   * Recursively resolve token references in nested objects
   */
  function resolveNestedReferences(obj) {
    if (typeof obj === 'string' && obj.includes('{')) {
      // Resolve string value with embedded references
      let resolved = obj;
      let maxDepth = 10;

      while (
        maxDepth > 0 &&
        resolved &&
        typeof resolved === 'string' &&
        resolved.includes('{')
      ) {
        const refMatch = resolved.match(/\{([^}]+)\}/);
        if (!refMatch) break;

        const refPath = refMatch[1];
        const nextValue = resolveOneLevel(refPath);

        if (nextValue === null) break;

        resolved = resolved.replace(`{${refPath}}`, nextValue);
        maxDepth--;
      }
      return resolved;
    } else if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      // Recursively resolve object properties
      const resolved = {};
      for (const [key, val] of Object.entries(obj)) {
        const result = resolveNestedReferences(val);
        resolved[key] = result;
      }
      return resolved;
    } else if (Array.isArray(obj)) {
      // Handle arrays
      return obj.map((item) => resolveNestedReferences(item));
    }

    return obj;
  }

  function traverse(obj, target) {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      // Skip metadata fields
      if (key.startsWith('$')) {
        target[key] = value;
        continue;
      }

      // Check if this is a token (has a value property)
      if (value && typeof value === 'object' && 'value' in value) {
        let resolvedValue = value.value;
        // let appliedModifiers = null;
        let depth = 0;
        const maxDepth = 10;

        // If the value is an object (e.g., typography tokens), resolve nested references
        if (typeof resolvedValue === 'object' && resolvedValue !== null) {
          resolvedValue = resolveNestedReferences(resolvedValue);
        } else {
          // Iteratively resolve token references for string values
          while (
            depth < maxDepth &&
            resolvedValue &&
            typeof resolvedValue === 'string' &&
            resolvedValue.includes('{')
          ) {
            // Try to match the entire value as a single token reference first
            const fullRefMatch = resolvedValue.match(/^\{(.+?)\}$/);

            if (fullRefMatch) {
              // Entire value is a token reference
              const refPath = fullRefMatch[1];

              // Get the full token to check for modifiers
              // const referencedToken = getTokenFromIndex(refPath, globalIndex);

              // If the referenced token has a modifier and we don't already have one,
              // apply the referenced token's modifier
              // if (
              //   referencedToken?.extensions?.['studio.tokens']?.modify &&
              //   !appliedModifiers
              // ) {
              //   appliedModifiers =
              //     referencedToken.extensions['studio.tokens'].modify;
              // }

              // Resolve to the next level
              const nextValue = resolveOneLevel(refPath);
              if (nextValue === null || nextValue === resolvedValue) {
                break;
              }
              resolvedValue = nextValue;
            } else {
              // Value contains embedded references (e.g., "{dimension.100}*0.5")
              const embeddedRefMatch = resolvedValue.match(/\{([^}]+)\}/);
              if (!embeddedRefMatch) break;

              const refPath = embeddedRefMatch[1];
              const nextValue = resolveOneLevel(refPath);

              if (nextValue === null) {
                break;
              }

              // Replace this reference with its resolved value
              resolvedValue = resolvedValue.replace(`{${refPath}}`, nextValue);
            }
            depth++;
          }

          // If the resolved value is now an object, recursively resolve nested references
          if (typeof resolvedValue === 'object' && resolvedValue !== null) {
            resolvedValue = resolveNestedReferences(resolvedValue);
          }
        }

        // Build token object with resolved value
        target[key] = {
          value: resolvedValue || value.value,
          type: value.type || null
        };

        // Include description if present
        if (value.description) {
          target[key].description = value.description;
        }

        // Skip $extensions in output
      } else if (value && typeof value === 'object') {
        // Recurse into nested objects
        target[key] = {};
        traverse(value, target[key]);
      } else {
        // Copy non-object values as-is
        target[key] = value;
      }
    }
  }

  traverse(setData, resolved);
  return resolved;
}

// Run if executed directly
reconcileTokens();
