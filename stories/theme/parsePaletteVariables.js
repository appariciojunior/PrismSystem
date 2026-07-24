/**
 * Parse brand ramps from output/build/css/variables.css raw text.
 * Variable pattern: --light-brand-ramp-{name}-{step}: {hex}; [comment with Brand base colour]
 * Skip overlay-dark ramp entirely.
 *
 * Returns: { neutral: { '50': { hex: '#ffffff', isBase: true }, ... }, ... }
 */
export function parseBrandRamps(css) {
  const ramps = {};

  const rampRe = /--light-brand-ramp-([a-z0-9-]+)-(\d+):\s*(#[0-9a-fA-F]{3,8});([^;\n]*)/g;
  let m;
  while ((m = rampRe.exec(css)) !== null) {
    const [, name, step, hex, rest] = m;
    if (name === 'overlay-dark') continue;
    if (!ramps[name]) ramps[name] = {};
    const isBase = rest.includes('Brand base colour');
    ramps[name][step] = { hex: hex.toLowerCase(), isBase };
  }

  return ramps;
}
