function clampByte(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHex(input) {
  const raw = String(input || '').trim();
  const clean = raw.startsWith('#') ? raw.slice(1) : raw;

  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    const expanded = clean
      .split('')
      .map((c) => c + c)
      .join('')
      .toUpperCase();
    return { hex: `#${expanded}` };
  }

  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return { hex: `#${clean.toUpperCase()}` };
  }

  return null;
}

function parseRgb(input) {
  const raw = String(input || '').trim();
  const match = raw.match(/^rgb\(([^)]+)\)$/i);
  if (!match) return null;

  const parts = match[1]
    .split(',')
    .map((p) => Number(p.trim()))
    .filter((n) => Number.isFinite(n));

  if (parts.length !== 3) return null;

  const [r, g, b] = parts.map(clampByte);
  const hex = `#${[r, g, b]
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;

  return { hex };
}

function parseHsl(input) {
  const raw = String(input || '').trim();
  const match = raw.match(/^hsl\(([^)]+)\)$/i);
  if (!match) return null;

  const parts = match[1].split(',').map((p) => p.trim());
  if (parts.length !== 3) return null;

  const h = Number(parts[0]);
  const s = Number(parts[1].replace('%', '')) / 100;
  const l = Number(parts[2].replace('%', '')) / 100;

  if (![h, s, l].every((n) => Number.isFinite(n))) return null;

  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hue < 60) {
    r1 = c;
    g1 = x;
  } else if (hue < 120) {
    r1 = x;
    g1 = c;
  } else if (hue < 180) {
    g1 = c;
    b1 = x;
  } else if (hue < 240) {
    g1 = x;
    b1 = c;
  } else if (hue < 300) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  const r = clampByte((r1 + m) * 255);
  const g = clampByte((g1 + m) * 255);
  const b = clampByte((b1 + m) * 255);

  const hex = `#${[r, g, b]
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;

  return { hex };
}

export function colorNormalize({ value }) {
  const source = String(value || '').trim();
  const parsed = parseHex(source) || parseRgb(source) || parseHsl(source);

  if (!parsed) {
    return {
      valid: false,
      input: source,
      errors: [
        'Unsupported color format. Use hex (#RGB or #RRGGBB), rgb(r,g,b), or hsl(h,s%,l%).'
      ]
    };
  }

  const r = Number.parseInt(parsed.hex.slice(1, 3), 16);
  const g = Number.parseInt(parsed.hex.slice(3, 5), 16);
  const b = Number.parseInt(parsed.hex.slice(5, 7), 16);

  return {
    valid: true,
    input: source,
    hex: parsed.hex,
    rgb: { r, g, b },
    errors: []
  };
}
