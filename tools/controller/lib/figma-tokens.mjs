// Turn raw Figma variables into system-ready token values the controls can adopt.
// The system's radius base is ~10px and its spacing step is 4px at multiplier 1,
// so a Figma corner of 12px maps to radius ×1.2 and a 4px step to spacing ×1.
// Colour semantics are read from the VARIABLE NAMES (reliable), not hue guessing.
import { hexToOklch } from './color.mjs';

export const WEIGHT_WORDS = {
  thin: 100, extralight: 200, light: 300, regular: 400, normal: 400,
  medium: 500, semibold: 600, demibold: 600, bold: 700, extrabold: 800, black: 900
};

// The base grid unit of a spacing scale = the most common gap between sorted steps,
// e.g. [2,4,6,8,12,16,20,24] → deltas [2,2,2,4,4,4,4] → 4px. Falls back to the first step.
export function gridUnit(sortedPositive) {
  if (!sortedPositive.length) return null;
  if (sortedPositive.length === 1) return sortedPositive[0];
  const freq = {};
  let best = sortedPositive[1] - sortedPositive[0];
  for (let i = 1; i < sortedPositive.length; i++) {
    const d = sortedPositive[i] - sortedPositive[i - 1];
    if (d <= 0) continue;
    freq[d] = (freq[d] || 0) + 1;
    if (freq[d] > (freq[best] || 0)) best = d;
  }
  return best || sortedPositive[0];
}

// Normalise to a solid 6-digit hex. Translucent values (alpha below minAlpha) are
// rejected: a "black at 10%" border/overlay must not be read as a solid palette black.
export function normHex(v, minAlpha = 0xcc) {
  let h = String(v || '').trim().toLowerCase();
  const m8 = /^#([0-9a-f]{6})([0-9a-f]{2})$/.exec(h);
  if (m8) { if (parseInt(m8[2], 16) < minAlpha) return null; h = '#' + m8[1]; }
  const m3 = /^#([0-9a-f]{3})$/.exec(h);
  if (m3) h = '#' + m3[1].split('').map((c) => c + c).join('');
  return /^#[0-9a-f]{6}$/.test(h) ? h : null;
}

export function extractFigmaTokens(colours, spacingVals, radiusVals, hasPill, fontFamilies, weights) {
  const swatches = [];
  const seen = new Set();
  const named = {};
  for (const c of colours) {
    const key = String(c.k).toLowerCase();
    // shadows / overlays / scrims are translucent effects, not palette colours —
    // stripping their alpha would turn "black at 5%" into solid black and poison the ramp.
    if (/(shadow|overlay|scrim|elevation|backdrop|glow)/.test(key)) continue;
    const hex = normHex(c.v);
    if (!hex) continue;
    // named semantics straight from the variable name
    if (!named.success && /(success|positive|(^|[^a-z])(green|go)([^a-z]|$))/.test(key)) named.success = hex;
    else if (!named.error && /(error|danger|destructive|negative|critical|(^|[^a-z])red([^a-z]|$))/.test(key)) named.error = hex;
    else if (!named.warning && /(warning|caution|attention|(^|[^a-z])(amber|yellow|orange)([^a-z]|$))/.test(key)) named.warning = hex;
    else if (!named.info && /(info|information)/.test(key)) named.info = hex;
    if (!named.brand && /(brand|primary|accent(?!-)|cta|action)/.test(key)) named.brand = hex;
    if (seen.has(hex)) continue;
    seen.add(hex);
    let och; try { och = hexToOklch(hex); } catch { continue; }
    swatches.push({ name: String(c.k).split('/').pop(), hex, chroma: +och.C.toFixed(3), light: +och.L.toFixed(3), neutral: och.C < 0.045 });
  }
  const accents = swatches.filter((s) => !s.neutral).sort((a, b) => b.chroma - a.chroma);
  const neutrals = swatches.filter((s) => s.neutral).sort((a, b) => b.light - a.light); // light -> dark
  const claimed = new Set([named.success, named.error, named.warning, named.info].filter(Boolean));
  // Only trust a name-derived brand colour if it is actually chromatic — many systems
  // call their neutral text scale "text/primary", and that must not seed the brand ramp black.
  const brandNamedChromatic = named.brand && accents.some((a) => a.hex === named.brand) ? named.brand : null;
  const suggestedBrand = brandNamedChromatic
    || (accents.find((a) => !claimed.has(a.hex)) || {}).hex
    || (neutrals.length ? neutrals[neutrals.length - 1].hex : null); // darkest neutral for mono designs
  const suggestedNeutral = (neutrals.find((n) => n.light > 0.35 && n.light < 0.78) || neutrals[Math.floor(neutrals.length / 2)] || {}).hex || null;
  // radius: the representative (median) real corner is the "card" radius; system base ~10px at ×1
  const realRad = radiusVals.filter((x) => x > 0 && x < 999).sort((a, b) => a - b);
  const radiusPx = realRad.length ? realRad[Math.floor((realRad.length - 1) / 2)] : null;
  const radiusMult = radiusPx ? +(radiusPx / 10).toFixed(2) : null;
  // spacing: the grid unit (most common step-to-step delta) is the base rhythm; system step 4px at ×1
  const posSp = [...new Set(spacingVals.filter((x) => x > 0))].sort((a, b) => a - b);
  const spacingStepPx = gridUnit(posSp);
  const spacingMult = spacingStepPx ? +(spacingStepPx / 4).toFixed(2) : null;
  // weights
  const wnums = [...weights].map((w) => WEIGHT_WORDS[String(w).toLowerCase()] || parseInt(w)).filter((x) => !isNaN(x));
  const headingWeight = wnums.length ? Math.max(...wnums) : null;
  const bodyWeight = wnums.length ? (Math.min(...wnums.filter((x) => x >= 400)) || 400) : null;
  const fontFamily = [...fontFamilies][0] || null;
  return {
    swatches, accents: accents.map((a) => a.hex), neutrals: neutrals.map((n) => n.hex),
    suggestedBrand, suggestedNeutral,
    semantics: { success: named.success || null, warning: named.warning || null, error: named.error || null, info: named.info || null },
    radiusPx, radiusMult, hasPill, spacingStepPx, spacingScale: spacingVals, spacingMult,
    fontFamily, headingWeight, bodyWeight
  };
}
