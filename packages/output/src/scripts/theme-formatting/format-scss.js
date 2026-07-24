import { getReferences, usesReferences } from 'style-dictionary/utils';

const generateOutputTokens = ({ dictionary, options }) => {
  const { usesDtcg, outputReferences } = options;

  return dictionary.allTokens.map((token) => {
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
      value = `${token.value.x}px ${token.value.y}px ${token.value.blur}px ${token.value.spread}px ${token.value.color}`;
    }

    if (token.type == 'lineHeights') {
      value = token.value === '100%' ? `1` : `${eval(token.value / 100)}`;
    }

    if (token.type == 'fontWeights') {
      const baseWeight = token.name.replace('foundation-font-weight0', '');
      value = `${eval(baseWeight * 10)}`;
    }

    if (token.type == 'borderRadius') {
      value = `${token.value}px`;
    }

    if (token.type == 'spacing' || token.name.includes('grid')) {
      value = token.value;
    }

    const isColourToken = token.path[0].match(/light|dark/gi);
    const tokenName = isColourToken
      ? ['colour', ...token.path].join('-').replace('/ ', '-')
      : token.name;

    return `$${tokenName}: ${value.replace(/["'`]/g, '')};`;
  });
};

const getBreakpointTokens = (breakpoint, outputTokens, filter) =>
  outputTokens
    .filter((token) => token.startsWith(filter))
    .map((token) => {
      const replacedToken = token.replace(`$viewport-${breakpoint}-`, '--');

      if (
        !replacedToken.includes('px') &&
        !replacedToken.includes('grid-columns')
      ) {
        return replacedToken.match(/spacing|grid/gi)
          ? replacedToken.slice(0, -1).concat('px;')
          : replacedToken;
      }
      return replacedToken;
    });

// const breakpoints = {
//   small: 0,
//   medium: 440,
//   large: 1024,
//   xLarge: 1440
// };

export const formatSCSS = ({ dictionary, options }) => {
  const outputTokens = generateOutputTokens({ dictionary, options });

  // const baseFontSizes = outputTokens
  //   .filter((token) => token.startsWith('$foundation-font-size'))
  //   .map((token) => {
  //     const formattedToken = token.replaceAll(`$foundation-`, '--');
  //     return formattedToken.replace(/: ([\d.]+)rem;/, (match, remValue) => {
  //       const base10Value = (parseFloat(remValue) * 1.6).toFixed(4);
  //       return `: ${parseFloat(base10Value)}rem;`;
  //     });
  //   })
  //   .join('\n');

  const foundationTypographyVariables = outputTokens
    .filter((token) => token.startsWith('$foundation-font'))
    .map((token) => {
      let replacedToken = token
        .replaceAll(`$foundation`, '')
        .replace('-font-size', '$fontSize')
        .replace('-font-family', '$fontFamily')
        .replace('-font-weight', '$fontWeight')
        .replace('-font-line-height', '$fontLineHeight');

      if (
        !replacedToken.includes('px') &&
        replacedToken.includes('$fontSize')
      ) {
        replacedToken = replacedToken.replace(
          /: ([\d.]+)rem;/,
          (match, remValue) => {
            const base10Value = (parseFloat(remValue) * 1.6).toFixed(4);
            return `: ${parseFloat(base10Value)}rem;`;
          }
        );
      }

      return replacedToken.replace('--', '$');

      // This will return font sizes as variables, referencing `baseFontSizes` if/when this is restored
      // const tokenArr = replacedToken.split(':');
      // return replacedToken.includes('size')
      // ? `${tokenArr[0].replace('-font-size', '$fontSize')}: var(-${tokenArr[0]});`
      // : replacedToken.replace('--', '$');
    })
    .join('\n');

  const typographyTokens = outputTokens
    .filter((token) => token.startsWith('$typography'))
    .map((token) => {
      const formattedToken = token.replace(
        /\$foundation|\$viewport-xlarge/gi,
        '--'
      );
      const typographyToken = formattedToken.split(':');
      let fontDeclaration = typographyToken[1]
        .replaceAll('--foundation', '$')
        .replace(/var\((.*?)\)/g, '$1')
        .replace('-font-size', 'fontSize')
        .replace('-font-family', 'fontFamily')
        .replace('-font-weight', 'fontWeight')
        .replace('-font-line-height', 'fontLineHeight');

      // Wrap fontSize and fontLineHeight with SCSS interpolation to prevent division
      fontDeclaration = fontDeclaration.replace(
        /\$fontSize(\d+)/g,
        '#{$fontSize$1}'
      );
      fontDeclaration = fontDeclaration.replace(
        /\$fontLineHeight(\d+)/g,
        '#{$fontLineHeight$1}'
      );

      return `
@mixin ${typographyToken[0].replace(/\$typography-tokens-/g, '')} {
  font:${fontDeclaration}\n}`;
    })
    .join('\n');

  // responsive typography tokens - to be added back in when we decide on the final approach to outputting these tokens in CSS/SCSS
  // const mediumBreakpointTokens = getBreakpointTokens(
  //   'medium',
  //   outputTokens,
  //   `$ds-viewport-medium-font`
  // ).join('\n');
  // const largeBreakpointTokens = getBreakpointTokens(
  //   'large',
  //   outputTokens,
  //   `$ds-viewport-large-font`
  // ).join('\n');
  // const xLargeBreakpointTokens = getBreakpointTokens(
  //   'xlarge',
  //   outputTokens,
  //   `$ds-viewport-xlarge-font`
  // ).join('\n');

  return (
    // `:root {\n${baseFontSizes}\n}\n` +
    // `@media (min-width: ${breakpoints.medium}px) {\n:root {\n${mediumBreakpointTokens}\n}}\n` +
    // `@media (min-width: ${breakpoints.large}px) {\n:root {\n${largeBreakpointTokens}\n}}\n` +
    // `@media (min-width: ${breakpoints.xLarge}px) {\n:root {\n${xLargeBreakpointTokens}\n}}\n\n` +
    `${foundationTypographyVariables}
    ${typographyTokens}
    `
  );
};

export const formatSCSSLayout = ({ dictionary, options }) => {
  const outputTokens = generateOutputTokens({ dictionary, options });

  const breakpoints = {
    small: 0,
    medium: 440,
    large: 1024,
    xLarge: 1440
  };

  const smallBreakpointTokens = getBreakpointTokens(
    'small',
    outputTokens,
    `$viewport-small-spacing`
  );
  // const mediumBreakpointTokens = getBreakpointTokens(
  //   'medium',
  //   outputTokens,
  //   `$ds-viewport-medium-spacing-fluid`
  // ).join('\n');
  // const largeBreakpointTokens = getBreakpointTokens(
  //   'large',
  //   outputTokens,
  //   `$ds-viewport-large-spacing-fluid`
  // ).join('\n');
  // const xLargeBreakpointTokens = getBreakpointTokens(
  //   'xlarge',
  //   outputTokens,
  //   `$ds-viewport-xlarge-spacing-fluid`
  // ).join('\n');

  const smallBreakpointGridTokens = getBreakpointTokens(
    'small',
    outputTokens,
    `$viewport-small-grid`
  );
  const mediumBreakpointGridTokens = getBreakpointTokens(
    'medium',
    outputTokens,
    `$viewport-medium-grid`
  ).join('\n');
  const largeBreakpointGridTokens = getBreakpointTokens(
    'large',
    outputTokens,
    `$viewport-large-grid`
  ).join('\n');
  const xLargeBreakpointGridTokens = getBreakpointTokens(
    'xlarge',
    outputTokens,
    `$viewport-xlarge-grid`
  ).join('\n');

  const breakpointsTokens = Object.entries(breakpoints).map(
    ([name, value]) => `--breakpoint-${name}: ${value}px;`
  );
  const shadowTokens = outputTokens
    .filter((token) => token.includes('shadows'))
    .map((token) =>
      token
        .replace('shadows-', '')
        .replace('$', '--')
        .replace('#000000', '0,0,0')
    );
  const radiusTokens = outputTokens
    .filter((token) => token.includes('border'))
    .map((token) =>
      token
        .replace('border-radius-border-radius-', 'border-radius-')
        .replace('$', '--')
    );

  const layoutTokens = [
    ...smallBreakpointTokens,
    ...smallBreakpointGridTokens,
    ...shadowTokens,
    ...radiusTokens,
    ...breakpointsTokens
  ];

  const layoutVariables = layoutTokens
    .map((token) => {
      const formattedToken = token.replace('--', '$');

      if (formattedToken.startsWith('$grid')) {
        const tokenArr = formattedToken.split(':');
        return `${tokenArr[0]}: var(${tokenArr[0].replace('$', '--')});`;
      }

      return formattedToken;
    })
    .join('\n');

  return (
    `:root {\n${smallBreakpointGridTokens.join('\n')}\n}\n` +
    `@media (min-width: ${breakpoints.medium}px) {\n:root {\n${mediumBreakpointGridTokens}\n}}\n` +
    `@media (min-width: ${breakpoints.large}px) {\n:root {\n${largeBreakpointGridTokens}\n}}\n` +
    `@media (min-width: ${breakpoints.xLarge}px) {\n:root {\n${xLargeBreakpointGridTokens}\n}}\n
${layoutVariables}
    `
  );
};

export const formatSCSSPalette = ({ dictionary, options }) => {
  const outputTokens = generateOutputTokens({ dictionary, options });

  const paletteTokens = outputTokens
    .filter((token) => token.includes('$colour'))
    .map((token) => {
      return token.replace('$colour-', '$');
    })
    .join('\n');

  return paletteTokens;
};
