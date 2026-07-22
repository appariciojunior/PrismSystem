import { transformColorModifiers } from '@tokens-studio/sd-transforms';

// Color conversion utilities
export const hexToRgb = (hexColor) => {
  hexColor = hexColor.toLowerCase().replace('#', '');
  let alpha = undefined;

  // Handle 8-character hex (with alpha)
  if (hexColor.length === 8) {
    alpha = parseInt(hexColor.substring(6, 8), 16) / 255;
    hexColor = hexColor.substring(0, 6);
  }
  // Handle 4-character hex (with alpha)
  else if (hexColor.length === 4) {
    alpha = parseInt(hexColor.charAt(3) + hexColor.charAt(3), 16) / 255;
    hexColor = hexColor.substring(0, 3);
  }

  // Expand 3-character hex
  if (hexColor.length === 3) {
    hexColor = hexColor
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const rgb = [
    parseInt(hexColor.substring(0, 2), 16),
    parseInt(hexColor.substring(2, 4), 16),
    parseInt(hexColor.substring(4, 6), 16)
  ];

  return alpha !== undefined ? [...rgb, alpha] : rgb;
};

export const rgbaToHex = (rgba) => {
  // Parse rgba string: "rgba(r, g, b, a)" or "rgb(r, g, b)"
  let formattedRgba = rgba;
  if (typeof rgba === 'string') {
    const match = rgba.match(
      /rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/i
    );
    if (match) {
      formattedRgba = [
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3]),
        match[4] ? parseFloat(match[4]) : undefined
      ];
    }
  }
  const [r, g, b, a] = formattedRgba;
  const hex =
    '#' +
    [r, g, b]
      .map((c) => {
        const v = Math.max(0, Math.min(255, Math.round(c)));
        return v.toString(16).padStart(2, '0');
      })
      .join('');

  if (a !== undefined) {
    const alpha = Math.max(0, Math.min(255, Math.round(a * 255)));
    return hex + alpha.toString(16).padStart(2, '0');
  }

  return hex;
};

export const rgbToHsl = (rgb) => {
  const [r, g, b, a] = rgb;
  const [rn, gn, bn] = [r, g, b].map((v) => v / 255);
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        break;
      case gn:
        h = ((bn - rn) / d + 2) / 6;
        break;
      case bn:
        h = ((rn - gn) / d + 4) / 6;
        break;
    }
  }

  return a !== undefined
    ? [h * 360, s * 100, l * 100, a]
    : [h * 360, s * 100, l * 100];
};

export const hslToRgb = (hsl) => {
  const [h, s, l, a] = hsl.map((v, i) => {
    if (i === 0) return v / 360; // Hue: 0-360 -> 0-1
    if (i === 3) return v; // Alpha: keep as-is
    return v / 100; // Sat/Light: 0-100 -> 0-1
  });
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return a !== undefined
    ? [r * 255, g * 255, b * 255, a]
    : [r * 255, g * 255, b * 255];
};

export const lightenHsl = (hsl, amount) => {
  const [h, s, l] = hsl;
  const newL = l + (100 - l) * amount;
  return [h, s, Math.min(newL, 100)];
};

export const darkenHsl = (hsl, amount) => {
  const [h, s, l] = hsl;
  const newL = l - l * amount;
  return [h, s, Math.max(newL, 0)];
};

export const mixHsl = (hsl1, hsl2, amount) => {
  const [h1, s1, l1] = hsl1;
  const [h2, s2, l2] = hsl2;

  // Interpolate hue, saturation, and lightness
  const h = h1 + (h2 - h1) * amount;
  const s = s1 + (s2 - s1) * amount;
  const l = l1 + (l2 - l1) * amount;

  return [h, s, l];
};

// P3 color space conversion functions
export const rgbToP3 = (rgb) => {
  // De-gamma function: converts gamma-encoded sRGB to linear
  const degamma = (c) => {
    if (c <= 0.04045) {
      return c / 12.92;
    } else {
      return Math.pow((c + 0.055) / 1.055, 2.4);
    }
  };

  // P3 gamma function: converts linear color to gamma-encoded P3
  const p3Gamma = (c) => {
    if (c <= 0.0031308) {
      return c * 12.92;
    } else {
      return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    }
  };

  const [r_srgb_255, g_srgb_255, b_srgb_255, a] = rgb;

  // Normalize from 0-255 to 0-1
  const r_srgb = r_srgb_255 / 255;
  const g_srgb = g_srgb_255 / 255;
  const b_srgb = b_srgb_255 / 255;

  // De-gamma sRGB to linear
  const r_srgb_lin = degamma(r_srgb);
  const g_srgb_lin = degamma(g_srgb);
  const b_srgb_lin = degamma(b_srgb);

  // Apply sRGB linear to P3 linear transformation matrix
  const r_p3_lin =
    0.4865709 * r_srgb_lin + 0.2656677 * g_srgb_lin + 0.2482589 * b_srgb_lin;
  const g_p3_lin =
    0.0284231 * r_srgb_lin + 0.6629262 * g_srgb_lin + 0.3095379 * b_srgb_lin;
  const b_p3_lin =
    0.0 * r_srgb_lin + 0.027804 * g_srgb_lin + 0.8027324 * b_srgb_lin;

  // Re-gamma to P3
  const r_p3 = p3Gamma(r_p3_lin);
  const g_p3 = p3Gamma(g_p3_lin);
  const b_p3 = p3Gamma(b_p3_lin);

  // Clamp to valid range
  const clamp = (v) => Math.max(0, Math.min(1, v));
  return a !== undefined
    ? [clamp(r_p3), clamp(g_p3), clamp(b_p3), a]
    : [clamp(r_p3), clamp(g_p3), clamp(b_p3)];
};

export const p3ToRgb = (p3) => {
  // De-gamma function: converts gamma-encoded color to linear
  const degamma = (c) => {
    if (c <= 0.04045) {
      return c / 12.92;
    } else {
      return Math.pow((c + 0.055) / 1.055, 2.4);
    }
  };

  // sRGB gamma function: converts linear color to gamma-encoded
  const srgbGamma = (c) => {
    if (c <= 0.0031308) {
      return c * 12.92;
    } else {
      return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    }
  };

  const [r_p3, g_p3, b_p3, a] = p3;

  // De-gamma P3 to linear
  const r_lin = degamma(r_p3);
  const g_lin = degamma(g_p3);
  const b_lin = degamma(b_p3);

  // Apply P3 linear to sRGB linear transformation matrix
  const r_srgb_lin =
    2.493496947 * r_lin - 0.9313836811 * g_lin - 0.4027107845 * b_lin;
  const g_srgb_lin =
    -0.8294889696 * r_lin + 1.7626297337 * g_lin + 0.0236246858 * b_lin;
  const b_srgb_lin =
    0.0362318766 * r_lin - 0.0968930571 * g_lin + 0.9163308122 * b_lin;

  // Re-gamma to sRGB
  const r_srgb = srgbGamma(r_srgb_lin);
  const g_srgb = srgbGamma(g_srgb_lin);
  const b_srgb = srgbGamma(b_srgb_lin);

  // Clamp to valid range and convert to 0-255
  const clamp = (v) => Math.max(0, Math.min(1, v));
  return a !== undefined
    ? [clamp(r_srgb) * 255, clamp(g_srgb) * 255, clamp(b_srgb) * 255, a]
    : [clamp(r_srgb) * 255, clamp(g_srgb) * 255, clamp(b_srgb) * 255];
};

export const hexToP3 = (hex = '', { colorspace = 'display-p3' } = {}) => {
  // Calculate richer P3 colors from HEX values
  try {
    let count;
    let alpha = false;
    const { 0: match } = hex.trim().match(/^#(?:[0-9a-f]{3,4}){1,2}$/i);
    switch (match.length) {
      case 5: // #RGBA
        alpha = true;
        break;
      case 4: // #RGB
        count = 1;
        break;
      case 9: // #RRGGBBAA
        alpha = true;
        break;
      case 7: // #RRGGBB
        count = 2;
        break;
    }
    const _ = (x) => (parseInt(x, 16) / 255).toFixed(6) * 1;
    const process = [(x) => _(x + x), (x) => _(x)][count - 1];
    const components = match
      .slice(1)
      .match(new RegExp(`.{${count}}`, 'g'))
      .map(process);
    return `color(${colorspace} ${components.slice(0, 3).join(' ')}${
      alpha ? ` / ${components.slice(-1)}` : ''
    })`;
  } catch (e) {
    throw Error(e, 'Argument is not an hexadecimal color');
  }
};

export const resolveValue = (
  tokens,
  value,
  space = 'hsl',
  currentPath = null
) => {
  const returnColour = (colour) => {
    let resolvedColour = resolveValue(tokens, colour, currentPath);
    if (space === 'p3') {
      resolvedColour = hexToP3(resolvedColour);
    }

    return resolvedColour;
  };

  if (typeof value === 'string' && value.startsWith('rgb')) {
    return rgbaToHex(value);
  }
  if (
    typeof value !== 'string' ||
    !value.startsWith('{') ||
    !value.endsWith('}')
  ) {
    return value;
  }

  const fullPath = value.slice(1, -1).replace(/\//g, '.');
  const legacyAliasMap = {
    'interactive.chip.secondary.solid.fill.default':
      'interactive.chip.secondary.off.text.default',
    'interactive.chip.secondary.solid.text.default':
      'interactive.chip.secondary.off.fill.default'
  };
  const aliasedPath = legacyAliasMap[fullPath] || fullPath;
  const parts = aliasedPath.split('.');

  function getByPath(obj, pathParts) {
    let current = obj;
    for (const part of pathParts) {
      if (typeof current === 'object' && current !== null) {
        if (part in current) {
          current = current[part];
        } else {
          const found = Object.keys(current).find(
            (key) => key.trim().toLowerCase() === part.trim().toLowerCase()
          );
          if (found) {
            current = current[found];
          } else {
            return null;
          }
        }
      } else {
        return null;
      }
    }
    return current;
  }

  const candidatePaths = [parts];

  if (Array.isArray(currentPath) && currentPath.length > 0) {
    candidatePaths.unshift([currentPath[0], ...parts]);
  }

  let result = null;

  for (const candidate of candidatePaths) {
    result = getByPath(tokens, candidate);
    if (result !== null) break;
  }

  // Try by prepending common top-level keys if not found
  if (result === null) {
    for (const topKey of Object.keys(tokens)) {
      result = getByPath(tokens[topKey], parts);
      if (result !== null) break;
    }
  }

  if (result === null) {
    return value;
  }

  if (typeof result === 'object' && result !== null && 'value' in result) {
    return returnColour(result.value);
  }

  if (typeof result === 'string') {
    return returnColour(result);
  }

  return result;
};

const normalizeModifierSpace = (space) => {
  const normalized = String(space || 'srgb').toLowerCase();
  if (normalized === 'rgb') return 'srgb';
  return normalized;
};

const normalizeModifierPayload = (ext, tokens, currentPath = null) => {
  const payload = { ...ext };

  if (payload.value !== undefined) {
    const resolvedValue = resolveValue(tokens, payload.value, currentPath);
    payload.value = String(resolvedValue);
  }

  if (payload.color !== undefined) {
    payload.color = resolveValue(tokens, payload.color, currentPath);
  }

  payload.space = normalizeModifierSpace(payload.space);
  return payload;
};

export const processModifier = (baseHex, ext, tokens, currentPath = null) => {
  const baseColorCandidate = baseHex?.value || baseHex;
  const resolvedBaseColor = resolveValue(
    tokens,
    baseColorCandidate,
    currentPath
  );

  if (!ext) {
    return resolvedBaseColor;
  }

  const normalizedModifier = normalizeModifierPayload(ext, tokens, currentPath);

  const token = {
    value: resolvedBaseColor,
    $extensions: {
      'studio.tokens': {
        modify: normalizedModifier
      }
    }
  };

  try {
    const transformed = transformColorModifiers(token, { format: 'hex' });

    if (typeof transformed === 'string' && transformed.startsWith('rgb')) {
      return rgbaToHex(transformed);
    }

    return transformed || resolvedBaseColor;
  } catch {
    return resolvedBaseColor;
  }
};
