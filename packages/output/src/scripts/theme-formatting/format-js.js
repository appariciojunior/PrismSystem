export const formatJS = ({ dictionary }) => {
  const allTokens = dictionary.allTokens;

  // Build nested object structure matching javascript/esm format
  const output = {};

  // Helper function to simplify fontSize references
  const simplifyReferences = (value) => {
    if (typeof value === 'object' && value !== null) {
      // Recursively simplify references in objects
      const simplified = {};
      for (const [key, val] of Object.entries(value)) {
        simplified[key] = simplifyReferences(val);
      }
      return simplified;
    }
    return value;
  };

  allTokens.forEach((token) => {
    const parts = token.path;
    let current = output;

    // Navigate/create nested structure
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    // Set the token value
    const tokenName = parts[parts.length - 1];
    const originalValue = token.original.value;
    const isTypography = token.original.type === 'typography';

    // For typography tokens, use original value (with variable references)
    // For other tokens, use resolved value
    let tokenValue = token.value;

    // Calculate value if it contains mathematical expressions
    if (typeof tokenValue === 'string' && tokenValue.includes('*')) {
      const baseNumericalValue = tokenValue.replace(/rem|%|px/gi, '');
      tokenValue = `${eval(baseNumericalValue).toFixed(3)}${tokenValue.match(/rem|%|px/gi)?.[0] || ''}`;
    }

    if (token.type == 'spacing') {
      tokenValue = !tokenValue.includes('px')
        ? `${Math.round(tokenValue)}px`
        : tokenValue;
    }

    if (token.type == 'fontWeights') {
      const baseWeight = token.name.replace('FoundationFontWeight0', '');
      tokenValue = `${eval(baseWeight * 10)}`;
    }

    const reconcileLineHeight = (lineHeightValue) =>
      lineHeightValue === '100%'
        ? `1`
        : `${lineHeightValue.replace('100%*', '')}`;

    if (token.type == 'lineHeights') {
      tokenValue = reconcileLineHeight(token.value);
    }

    if (isTypography) {
      // Simplify fontSize references within typography tokens
      const formattedFontsizeToken = originalValue.fontSize.replace(
        'viewport/ xlarge.',
        ''
      );
      const formattedFontweightToken = originalValue.fontWeight?.replace(
        /[^1-9]/g,
        ''
      );

      tokenValue.fontSize = originalValue.fontSize.includes('{')
        ? formattedFontsizeToken
        : `${token.value.fontSize}px`;

      tokenValue.fontWeight = eval(formattedFontweightToken * 100);
      tokenValue.lineHeight = reconcileLineHeight(tokenValue.lineHeight);
      tokenValue = simplifyReferences(tokenValue);
    }

    // Simplify fontSize references
    tokenValue = simplifyReferences(tokenValue);

    // Convert hex values in rgba references to rgb
    if (
      tokenValue?.type &&
      tokenValue.type === 'dropShadow' &&
      tokenValue.color.includes('rgba(')
    ) {
      const transformedColor = tokenValue.color.replace(
        /#([0-9A-Fa-f]{6})/g,
        (match, hex) => {
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          return `${r}, ${g}, ${b}`;
        }
      );
      tokenValue = `${token.value.x} ${token.value.y} ${token.value.blur} ${token.value.spread} ${transformedColor}`;
    }

    current[tokenName] = tokenValue;
  });

  const breakpoints = {
    small: 0,
    medium: 440,
    large: 1024,
    xlarge: 1440
  };

  output['breakpoints'] = breakpoints;

  return JSON.stringify(output, null, 2);
};
