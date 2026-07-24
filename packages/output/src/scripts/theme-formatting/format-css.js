import { getReferences, usesReferences } from 'style-dictionary/utils';

export const formatCSS = ({ dictionary, options }) => {
  const { usesDtcg, outputReferences } = options;
  const outputTokens = dictionary.allTokens.map((token) => {
    let value = JSON.stringify(token.value);
    const originalValue = token.original.value;

    // the `dictionary` object now has `usesReferences()` and
    // `getReferences()` methods. `usesReferences()` will return true if
    // the value has a reference in it. `getReferences()` will return
    // an array of references to the whole tokens so that you can access their
    // names or any other attributes.
    const shouldOutputRef =
      usesReferences(originalValue) &&
      (typeof outputReferences === 'function'
        ? outputReferences(token, { dictionary, usesDtcg })
        : outputReferences);

    let isEntirelyRef;

    const isFoundationRef =
      typeof originalValue === 'string' &&
      originalValue.includes('{foundation');

    if (shouldOutputRef && !isFoundationRef) {
      // Note: make sure to use `originalValue` because
      // `token.value` is already resolved at this point.
      const refs = getReferences(originalValue, dictionary.tokens);
      isEntirelyRef = refs.length === 1 && refs[0].value === value;
      refs.forEach((ref) => {
        // wrap in template literal ${} braces if the value is more than just entirely a reference
        value = value.replace(
          ref.value,
          isEntirelyRef ? ref.name : `var(--${ref.name})`
        );
      });
    }

    if (
      token.type == 'typography' &&
      !token.original.value.fontSize.includes('{')
    ) {
      const typographyToken = value.split('/');
      value = `${typographyToken[0]}px / ${typographyToken[1]}`;
    }

    if (token.type == 'boxShadow') {
      value = `${token.value.x}px ${token.value.y}px ${token.value.blur}px ${token.value.spread}px ${token.value.color.replace('#000000', '0,0,0')}`;
    }

    if (token.type == 'fontWeights') {
      const baseWeight = token.name.replace('foundation-font-weight0', '');
      value = `${eval(baseWeight * 10)}`;
    }

    if (token.type == 'lineHeights') {
      value = token.value === '100%' ? `1` : `${eval(token.value / 100)}`;
    }

    if (token.type == 'borderRadius') {
      value = `${token.value}px`;
    }

    // const fontTokenName = token.path[token.path.length - 1];
    // const formattedTokenName = token.name.includes('-font-') ? `--ds-${fontTokenName}` : `--${token.name}`;

    // if the value is not entirely a reference, we have to wrap in template literals
    return `--${token.name}: ${value.replace(/["'`]/g, '')};`;
  });

  const breakpoints = {
    small: 0,
    medium: 440,
    large: 1024,
    xLarge: 1440
  };

  // Extract unique theme names from tokens
  const extractTheme = (token) => {
    const lightMatch = token.match(/--light-([^-]+)/);
    const darkMatch = token.match(/--dark-([^-]+)/);
    return lightMatch ? lightMatch[1] : darkMatch ? darkMatch[1] : null;
  };

  // Group tokens by theme (light and dark combined)
  const lightThemeGroups = {};
  const darkThemeGroups = {};
  const coreValueMap = {}; // Map to store core theme values for deduplication

  // First pass: collect core theme values
  outputTokens
    .filter(
      (token) =>
        token.startsWith('--light-core-') || token.startsWith('--dark-core-')
    )
    .forEach((token) => {
      const normalizedName = token.replace(/(light|dark)-core-/, '');
      coreValueMap[normalizedName] = token;
    });

  outputTokens
    .filter(
      (token) => token.startsWith('--light-') || token.startsWith('--dark-')
    )
    .forEach((token) => {
      const theme = extractTheme(token);

      const formattedToken = token
        .replace(`-${theme}`, '')
        .replace(/(light|dark)-/, '');

      if (theme) {
        if (token.startsWith('--light-')) {
          if (!lightThemeGroups[theme]) lightThemeGroups[theme] = [];
          lightThemeGroups[theme].push(formattedToken);
        } else if (token.startsWith('--dark-')) {
          if (!darkThemeGroups[theme]) darkThemeGroups[theme] = [];
          darkThemeGroups[theme].push(formattedToken);
        }
      }
    });

  // Helper function to deduplicate theme tokens by comparing values
  const deduplicateThemeTokens = (themeTokens, coreTokens) => {
    if (!coreTokens || coreTokens.length === 0) return themeTokens;

    // Build a map of core token names to values
    const coreMap = new Map();
    coreTokens.forEach((token) => {
      const match = token.match(/^--([\w-]+):\s*(.+);$/);
      if (match) {
        coreMap.set(match[1], match[2]);
      }
    });

    // Filter theme tokens, excluding those with same value as core
    return themeTokens.filter((token) => {
      const match = token.match(/^--([\w-]+):\s*(.+);$/);
      if (!match) return true;

      const tokenName = match[1];
      const tokenValue = match[2];
      const coreValue = coreMap.get(tokenName);

      // Include token only if core doesn't have it or if values differ
      return !coreValue || coreValue !== tokenValue;
    });
  };

  // Create organized output for light themes
  const lightPaletteTokens = Object.entries(lightThemeGroups)
    .map(([theme, tokens]) => {
      // Deduplicate non-core themes against core
      const deDupedTokens =
        theme !== 'core'
          ? deduplicateThemeTokens(tokens, lightThemeGroups['core'])
          : tokens;

      return deDupedTokens.length > 0
        ? `[data-theme="${theme}"] {\n${deDupedTokens.join('\n')}\n}`
        : '';
    })
    .filter(Boolean)
    .join('\n\n');

  // Create organized output for dark themes
  const darkPaletteTokens = Object.entries(darkThemeGroups)
    .map(([theme, tokens]) => {
      // Deduplicate non-core themes against core
      const deDupedTokens =
        theme !== 'core'
          ? deduplicateThemeTokens(tokens, darkThemeGroups['core'])
          : tokens;

      return deDupedTokens.length > 0
        ? `[data-theme="${theme}"] {\n${deDupedTokens.join('\n')}\n}`
        : '';
    })
    .filter(Boolean)
    .join('\n\n');

  const getBreakpointTokens = (breakpoint) =>
    outputTokens
      .filter((token) => token.startsWith(`--viewport-${breakpoint}`))
      .map((token) => {
        if (!token.includes('small') && !token.includes('grid')) {
          return;
        }

        let replacedToken = token
          .replace(`viewport-${breakpoint}-`, '')
          .replace(`font-size`, 'fontSize');

        // Convert rem values from 16px base to 10px base for fontSize tokens
        if (replacedToken.includes('fontSize')) {
          replacedToken = replacedToken.replace(
            /: ([\d.]+)rem;/,
            (match, remValue) => {
              const base10Value = (parseFloat(remValue) * 1.6).toFixed(4);
              return `: ${parseFloat(base10Value)}rem;`;
            }
          );
        }

        if (
          !replacedToken.includes('px') &&
          !replacedToken.includes('grid-columns') &&
          !replacedToken.includes('rem')
        ) {
          return replacedToken.match(/spacing|grid/gi)
            ? replacedToken.slice(0, -1).concat('px;')
            : replacedToken;
        }
        return replacedToken;
      })
      .filter((token) => token); // Remove undefined values

  const filteredTokens = outputTokens
    .filter(
      (token) =>
        !token.startsWith('--viewport-') &&
        !token.startsWith('--typography-') &&
        !token.startsWith('--foundation') &&
        !token.startsWith('--dark') &&
        !token.startsWith('--light')
    )
    .map((token) =>
      token
        .replace(/foundation-|viewport-xlarge-|shadows-/gi, '')
        .replace(/border-radius-border-radius-/gi, 'border-radius-')
    )
    .concat(
      Object.entries(breakpoints).map(
        ([name, value]) => `--breakpoint-${name}: ${value}px;`
      )
    )
    .join('\n');
  const foundationTokens = outputTokens
    .filter(
      (token) =>
        token.startsWith('--foundation-font-family') ||
        token.startsWith('--foundation-font-weight') ||
        token.startsWith('--foundation-font-line')
    )
    .map((token) =>
      token
        .replaceAll(`foundation`, '')
        .replace('-font-family', 'fontFamily')
        .replace('-font-weight', 'fontWeight')
        .replace('-font-line-height', 'fontLineHeight')
    )
    .join('\n');
  const typographyTokens = outputTokens
    .filter((token) => token.startsWith('--typography'))
    .map((token) => {
      const formattedToken = token
        .replace(/foundation-|viewport-xlarge-|typography-tokens-/gi, '')
        .replace('--', '')
        .replace('font-family', 'fontFamily')
        .replace('font-size', 'fontSize')
        .replace('font-weight', 'fontWeight')
        .replace('font-line-height', 'fontLineHeight');
      const typographyToken = formattedToken.split(':');
      return `.${typographyToken[0].replace(/\./g, '-')} {\nfont:${typographyToken[1]}\n}`;
    })
    .join('\n');
  const smallBreakpointTokens = getBreakpointTokens('small').join('\n');

  const mediumBreakpointTokens = getBreakpointTokens('medium').join('\n');
  const largeBreakpointTokens = getBreakpointTokens('large').join('\n');
  const xLargeBreakpointTokens = getBreakpointTokens('xlarge').join('\n');

  return (
    `:root {\n${foundationTokens}\n\n${lightPaletteTokens}\n}\n` +
    `[data-color-mode="dark"] {\n${darkPaletteTokens}\n}\n` +
    `@media (min-width: ${breakpoints.small}px) {\n:root {\n${smallBreakpointTokens}\n}}\n` +
    `@media (min-width: ${breakpoints.medium}px) {\n:root {\n${mediumBreakpointTokens}\n}}\n` +
    `@media (min-width: ${breakpoints.large}px) {\n:root {\n${largeBreakpointTokens}\n}}\n` +
    `@media (min-width: ${breakpoints.xLarge}px) {\n:root {\n${xLargeBreakpointTokens}\n}}\n` +
    `:root {\n${filteredTokens}\n}\n${typographyTokens}
    `
  );
};
