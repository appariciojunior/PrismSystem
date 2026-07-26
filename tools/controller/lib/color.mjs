// Colour maths: sRGB <-> OKLCH, ramp generation, WCAG contrast.
// Zero dependencies. Based on Björn Ottosson's OKLab reference implementation.

export function hexToRgb(hex) {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
}

export function rgbToHex([r, g, b]) {
  const c = (v) =>
    Math.round(Math.max(0, Math.min(1, v)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

const srgbToLinear = (c) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const linearToSrgb = (c) =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

export function rgbToOklch(rgb) {
  const [r, g, b] = rgb.map(srgbToLinear);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.sqrt(a * a + b2 * b2);
  let H = (Math.atan2(b2, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

export function oklchToRgb({ L, C, H }) {
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  ].map(linearToSrgb);
}

const inGamut = (rgb) => rgb.every((v) => v >= -0.000075 && v <= 1.000075);
const clip = (rgb) => rgb.map((v) => Math.max(0, Math.min(1, v)));

/**
 * Bring an out-of-gamut OKLCH colour into sRGB, the way CSS Color 4 does.
 *
 * This is the gamut mapping algorithm from the spec rather than a convenient
 * approximation, and the difference matters here: the engine now ships a resolved
 * hex and a live color-mix() for the same token, and a browser asked to mix two
 * colours that land outside sRGB will map the result with exactly this procedure.
 * An approximation that merely looks close puts the two emissions on different
 * colours, which is the one thing dual emission cannot afford.
 *
 * Binary search for the most chroma that still fits, allowing a result to be
 * clipped while it stays inside a just-noticeable difference of the unclipped
 * colour. In-gamut colours return untouched on the first test, so nothing that
 * already worked moves.
 */
function toGamut(lch) {
  const { L, C, H } = lch;
  if (L >= 1) return [1, 1, 1];
  if (L <= 0) return [0, 0, 0];
  const direct = oklchToRgb({ L, C, H });
  if (inGamut(direct)) return direct;

  const JND = 0.02;
  const EPS = 0.0001;
  const lab = (c) => {
    const r = (H * Math.PI) / 180;
    return [L, c * Math.cos(r), c * Math.sin(r)];
  };
  let lo = 0;
  let hi = C;
  while (hi - lo > EPS) {
    const mid = (lo + hi) / 2;
    const rgb = oklchToRgb({ L, C: mid, H });
    if (inGamut(rgb)) { lo = mid; continue; }
    const clipped = clip(rgb);
    const a = rgbToOklch(clipped);
    const ar = (a.H * Math.PI) / 180;
    const p = [a.L, a.C * Math.cos(ar), a.C * Math.sin(ar)];
    const q = lab(mid);
    const dE = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
    if (dE < JND) {
      if (JND - dE < EPS) return clipped;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return clip(oklchToRgb({ L, C: lo, H }));
}

export const hexToOklch = (hex) => rgbToOklch(hexToRgb(hex));
export const oklchToHex = (lch) => rgbToHex(toGamut(lch));

/**
 * Generate a ramp for arbitrary step names (e.g. 50..1000).
 * Steps map to a perceptual lightness curve; the seed colour is pinned to
 * its nearest step so the picked brand colour appears exactly in the ramp.
 * mode 'dark' inverts the lightness curve and softens chroma slightly.
 */
export function generateRamp(seedHex, steps, { mode = 'light', neutral = false, anchor = null } = {}) {
  const seed = hexToOklch(seedHex);
  const sorted = [...steps].map(Number).sort((a, b) => a - b);
  const min = sorted[0], max = sorted[sorted.length - 1];

  // Anchored curve: passes exactly through the seed lightness at `anchor`
  // (light mode) or at the mirrored step (dark mode), so the system's
  // conventional reference step (e.g. brand at 800) hits the picked colour.
  const seedLDark = Math.min(0.85, Math.max(0.35, 1.03 - seed.L));
  const anchorStep = anchor == null ? null
    : mode === 'light' ? anchor : min + max - anchor;
  const anchorL = mode === 'light' ? seed.L : seedLDark;
  const ends = mode === 'light' ? [0.985, 0.13] : [0.05, 0.93];

  const lightFor = (step) => {
    const t = (step - min) / (max - min || 1); // 0..1
    if (anchorStep == null) return ends[0] + t * (ends[1] - ends[0]);
    const ta = (anchorStep - min) / (max - min || 1);
    if (step <= anchorStep) {
      const u = ta === 0 ? 1 : t / ta;
      return ends[0] + u * (anchorL - ends[0]);
    }
    const u = ta === 1 ? 0 : (t - ta) / (1 - ta);
    return anchorL + u * (ends[1] - anchorL);
  };

  // chroma bell curve peaking around the middle of the ramp
  const chromaFor = (step) => {
    if (neutral) return Math.min(seed.C, 0.012);
    const t = (step - min) / (max - min || 1);
    const bell = Math.sin(Math.PI * Math.min(1, Math.max(0, 0.12 + t * 0.82)));
    const peak = Math.max(seed.C, 0.06) * (mode === 'dark' ? 0.9 : 1);
    return peak * (0.35 + 0.65 * bell);
  };

  const out = {};
  for (const s of sorted) {
    if (!neutral && mode === 'light' && anchorStep != null && s === anchorStep) {
      out[s] = oklchToHex(seed); // picked colour appears verbatim
    } else {
      out[s] = oklchToHex({ L: lightFor(s), C: chromaFor(s), H: seed.H });
    }
  }
  return out;
}

// WCAG 2.1 contrast
export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(hexA, hexB) {
  const a = luminance(hexA), b = luminance(hexB);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}
