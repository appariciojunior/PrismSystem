/**
 * generate-typography-mapping-table-data.js
 *
 * Produces packages/tokens/docs/migration/data/typography-mapping-table.generated.json
 * from the legacy tokens JSON and DS tokens.json.
 *
 * Scoring (0–100):
 *   family    40pts  exact token ref match
 *   size      30pts  scaled by rem proximity
 *   weight    20pts  scaled by weight-step distance
 *   lineHeight 10pts exact category match
 *
 *   H ≥ 80 | M ≥ 50 | L ≥ 25 | Orphan < 25 or cross-family impossible
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const NK_TOKENS_PATH = path.join(
  ROOT,
  'packages/tokens/docs/migration/legacy-tokens.json'
);
const DS_TOKENS_PATH = path.join(ROOT, 'packages/tokens/src/tokens.json');
const OUTPUT_DIR = path.join(ROOT, 'packages/tokens/docs/migration/data');
const OUTPUT_PATH = path.join(
  OUTPUT_DIR,
  'typography-mapping-table.generated.json'
);

// ─── Font-family resolution ───────────────────────────────────────────────────
// NK fontFamily010 = Inter         → DS fontFamily010 = Inter        ✓ same
// NK fontFamily020 = Inter → DS fontFamily020 = Inter ✓ same
// NK fontFamily030 = Inter (legacy)       → DS fontFamily040 = Inter        ⚠ REMAPPED
// DS fontFamily030 = Inter  (no NK equivalent)

const NK_TO_DS_FAMILY = {
  fontFamily010: 'fontFamily010', // Inter
  fontFamily020: 'fontFamily020', // Inter
  fontFamily030: 'fontFamily040' // NK Inter → DS Inter
};

// Legacy font family labels (fontFamily030 = Inter)
const NK_FAMILY_LABELS = {
  fontFamily010: 'Inter',
  fontFamily020: 'Inter',
  fontFamily030: 'Inter'
};

// DS font family labels (DS fontFamily030 = Inter)
const DS_FAMILY_LABELS = {
  fontFamily010: 'Inter',
  fontFamily020: 'Inter',
  fontFamily030: 'Inter',
  fontFamily040: 'Inter'
};

// NK weight.NNN → numeric string
const WEIGHT_ORDER = [
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900'
];

// DS composite weight dimension name → numeric string
const DS_WEIGHT_NAME_TO_NUM = {
  light: '300',
  regular: '400',
  medium: '500',
  bold: '700',
  black: '800' // DS "black" = ExtraBold 800
};

// Line-height % → category bucket
function lhCategory(lhStr) {
  const val = parseFloat(lhStr);
  if (val <= 105) return 'tight'; // 100%
  if (val <= 115) return 'heading'; // 112.5%
  if (val <= 130) return 'quote'; // 125%
  if (val <= 160) return 'body'; // 150%
  return 'loose';
}

// ─── Score helpers ────────────────────────────────────────────────────────────
function familyScore(nkFamilyRef, tdsFamilyRef) {
  const mapped = NK_TO_DS_FAMILY[nkFamilyRef] || nkFamilyRef;
  return mapped === tdsFamilyRef ? 40 : 0;
}

function sizeScore(nkRem, tdsRem) {
  if (typeof nkRem !== 'number' || typeof tdsRem !== 'number') return 0;
  const delta = Math.abs(nkRem - tdsRem);
  if (delta <= 0.001) return 30;
  if (delta <= 0.0626) return 25; // ≤1 DS step
  if (delta <= 0.1876) return 15; // ≤2 steps
  if (delta <= 0.3751) return 5; // ≤3 steps
  return 0;
}

function weightScore(nkWeightNum, tdsWeightNum) {
  const ni = WEIGHT_ORDER.indexOf(nkWeightNum);
  const ti = WEIGHT_ORDER.indexOf(tdsWeightNum);
  if (ni < 0 || ti < 0) return 0;
  const dist = Math.abs(ni - ti);
  if (dist === 0) return 20;
  if (dist === 1) return 12;
  if (dist === 2) return 6;
  return 0;
}

function lhScore(nkLhStr, tdsLhStr) {
  if (!nkLhStr || !tdsLhStr) return 0;
  if (Math.abs(parseFloat(nkLhStr) - parseFloat(tdsLhStr)) < 0.5) return 10;
  if (lhCategory(nkLhStr) === lhCategory(tdsLhStr)) return 5;
  return 0;
}

function totalScore(nkToken, tdsToken) {
  const fam = familyScore(nkToken.fontFamilyRef, tdsToken.fontFamilyRef);
  const sz = sizeScore(nkToken.fontSizeRem, tdsToken.fontSizeRem);
  const wt = weightScore(nkToken.weightNum, tdsToken.weightNum);
  const lh = lhScore(nkToken.lineHeightStr, tdsToken.lineHeightStr);
  return fam + sz + wt + lh;
}

function scoreLabel(score) {
  if (score >= 80) return 'H';
  if (score >= 50) return 'M';
  if (score >= 25) return 'L';
  return 'Orphan';
}

// ─── Token resolution ─────────────────────────────────────────────────────────
function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function buildFontSizeMap(foundation) {
  // All fontSize* tokens, resolved to float rem
  const raw = {};
  for (const [k, v] of Object.entries(foundation)) {
    if (k.startsWith('fontSize') && v?.value !== undefined) {
      raw[k] = String(v.value);
    }
  }
  function resolveExpr(expr) {
    if (!expr) return null;
    if (typeof expr === 'number') return expr;
    const s = String(expr).trim();
    if (s.endsWith('rem')) return parseFloat(s);
    if (s.includes('*')) {
      const [base, mult] = s.split('*').map((p) => p.trim());
      const baseRef = base.replace(/[{}]/g, '');
      const baseVal = resolveExpr(raw[baseRef]);
      return baseVal != null ? baseVal * parseFloat(mult) : null;
    }
    if (s.startsWith('{')) {
      const ref = s.replace(/[{}]/g, '');
      return resolveExpr(raw[ref]);
    }
    // static pixel value (display/heading static tokens)
    const num = parseFloat(s);
    return !isNaN(num) ? num / 16 : null; // px → rem
  }
  const resolved = {};
  for (const k of Object.keys(raw)) {
    resolved[k] = resolveExpr(raw[k]);
  }
  return resolved;
}

function buildFontWeightMap(foundation) {
  const weights = foundation?.weight || {};
  const map = {};
  for (const k of Object.keys(weights)) {
    map[`weight.${k}`] = k; // e.g. "weight.700" → "700"
  }
  return map;
}

function buildLineHeightMap(foundation) {
  const map = {};
  for (const [k, v] of Object.entries(foundation)) {
    if (k.startsWith('fontLineHeight') && v?.value !== undefined) {
      const s = String(v.value);
      if (s.includes('%')) {
        map[k] = s; // e.g. "112.5%"
      } else if (s.includes('*')) {
        // e.g. "{fontLineHeight010}*1.125"
        const [base, mult] = s.split('*');
        const baseRef = base.trim().replace(/[{}]/g, '');
        const baseStr = foundation[baseRef]?.value;
        if (baseStr && String(baseStr).includes('%')) {
          const baseVal = parseFloat(baseStr);
          map[k] = `${(baseVal * parseFloat(mult.trim())).toFixed(1)}%`;
        }
      }
    }
  }
  return map;
}

// ─── NK preset flattening ─────────────────────────────────────────────────────
function flattenNkPresets(nkTokens) {
  const foundation = nkTokens.Foundations || {};
  const fsSizeMap = buildFontSizeMap(foundation);
  const fwMap = buildFontWeightMap(foundation);
  const lhMap = buildLineHeightMap(foundation);

  const groups = [
    'editorial',
    'editorial regular',
    'editorial light',
    'utility'
  ];
  const presets = [];

  for (const groupKey of groups) {
    const groupData = foundation[groupKey] || {};
    for (const [presetName, tokenDef] of Object.entries(groupData)) {
      const val = tokenDef?.value;
      if (!val || typeof val !== 'object') continue;

      const familyRef = (val.fontFamily || '').replace(/[{}]/g, '');
      const sizeRef = (val.fontSize || '').replace(/[{}]/g, '');
      const weightRef = (val.fontWeight || '').replace(/[{}]/g, '');
      const lhRef = (val.lineHeight || '').replace(/[{}]/g, '');

      const weightNum = fwMap[weightRef] || null; // e.g. "700"
      const sizeRem = fsSizeMap[sizeRef] || null;
      const lhStr = lhMap[lhRef] || null;

      presets.push({
        group: groupKey,
        presetName,
        description: tokenDef.description || '',
        fontFamilyRef: familyRef,
        fontFamilyLabel: NK_FAMILY_LABELS[familyRef] || familyRef,
        fontSizeRef: sizeRef,
        fontSizeRem: sizeRem,
        weightRef,
        weightNum,
        lineHeightRef: lhRef,
        lineHeightStr: lhStr
      });
    }
  }
  return presets;
}

// ─── DS typography token flattening ─────────────────────────────────────────
function flattenDSTypoTokens(tdsTokens) {
  const foundation = tdsTokens.foundation || {};
  const fsSizeMap = buildFontSizeMap(foundation);

  // Line-height for DS (same structure)
  const lhMap = buildLineHeightMap(foundation);

  // Font weight: DS uses fontWeight010-090 as named strings
  const fwDSMap = {};
  for (const [k, v] of Object.entries(foundation)) {
    if (k.startsWith('fontWeight') && v?.value !== undefined) {
      // map numeric weight to the token ref e.g. fontWeight070 → "700"
      const wStr = String(v.value).toLowerCase();
      const numMap = {
        thin: '100',
        extralight: '200',
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900'
      };
      fwDSMap[k] = numMap[wStr] || null;
    }
  }

  const typo = tdsTokens.typographyTokens || {};
  const tokens = [];

  function walk(obj, pathParts) {
    for (const [k, v] of Object.entries(obj)) {
      const newPath = [...pathParts, k];
      if (
        v &&
        typeof v === 'object' &&
        'value' in v &&
        typeof v.value === 'object'
      ) {
        // It's a leaf typography composite token
        const val = v.value;
        const familyRef = (val.fontFamily || '').replace(/[{}]/g, '');
        const sizeRaw = val.fontSize;
        const weightRef = (val.fontWeight || '').replace(/[{}]/g, '');
        const lhRef = (val.lineHeight || '').replace(/[{}]/g, '');

        // Resolve size — may be a token ref or a bare pixel number (static tokens)
        let sizeRem = null;
        if (sizeRaw != null) {
          const sRef = String(sizeRaw).replace(/[{}]/g, '');
          if (fsSizeMap[sRef] != null) {
            sizeRem = fsSizeMap[sRef];
          } else {
            const num = parseFloat(sRef);
            if (!isNaN(num)) sizeRem = num / 16; // bare px value
          }
        }

        const weightNum = fwDSMap[weightRef] || null;
        const lhStr = lhMap[lhRef] || null;

        // Determine weight dimension name from path
        // Path segments: brand.heading.fluid.bold.2xsmall  → weightDim = "bold"
        const weightDim = DS_WEIGHT_NAME_TO_NUM[newPath[newPath.length - 2]]
          ? newPath[newPath.length - 2]
          : null;

        tokens.push({
          tokenPath: newPath.join('.'),
          namespace: newPath[0], // brand | utility
          fontFamilyRef: familyRef,
          fontFamilyLabel: DS_FAMILY_LABELS[familyRef] || familyRef,
          fontSizeRem: sizeRem,
          weightRef,
          weightNum:
            weightNum || (weightDim ? DS_WEIGHT_NAME_TO_NUM[weightDim] : null),
          lineHeightRef: lhRef,
          lineHeightStr: lhStr,
          description: v.description || '',
          isFluid: newPath.includes('fluid')
        });
      } else if (v && typeof v === 'object' && !('value' in v)) {
        walk(v, newPath);
      }
    }
  }

  walk(typo, []);
  return tokens;
}

// ─── Matching engine ──────────────────────────────────────────────────────────
function findMatches(nkPreset, tdsTokens, topN = 3) {
  const candidates = [];
  for (const ds of tdsTokens) {
    const score = totalScore(nkPreset, ds);
    if (score > 0) {
      candidates.push({ ds, score });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, topN).map(({ ds, score }) => ({
    token: ds.tokenPath,
    score: scoreLabel(score),
    numericScore: score,
    tdsProperties: {
      fontFamily: ds.fontFamilyRef,
      fontFamilyLabel: ds.fontFamilyLabel,
      fontSizeRem:
        ds.fontSizeRem != null
          ? `${ds.fontSizeRem.toFixed(4).replace(/\.?0+$/, '')}rem`
          : null,
      fontWeight: ds.weightNum,
      lineHeight: ds.lineHeightStr,
      isFluid: ds.isFluid
    },
    delta:
      nkPreset.fontSizeRem != null && ds.fontSizeRem != null
        ? `${ds.fontSizeRem - nkPreset.fontSizeRem >= 0 ? '+' : ''}${(ds.fontSizeRem - nkPreset.fontSizeRem).toFixed(4).replace(/\.?0+$/, '')}rem`
        : null,
    note: buildNote(nkPreset, ds)
  }));
}

function buildNote(nk, ds) {
  const notes = [];
  if (ds.isFluid) notes.push('Responsive: scales with viewport');
  // Family remap info is shown via badge — no need to duplicate in note
  return notes.join('; ') || null;
}

// ─── Group labelling ──────────────────────────────────────────────────────────
function groupLabel(nkGroup) {
  const g = nkGroup.toLowerCase();
  if (g === 'editorial') return 'editorial-bold';
  if (g === 'editorial regular') return 'editorial-regular';
  if (g === 'editorial light') return 'editorial-light';
  if (g === 'utility') return 'utility';
  return g;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function main() {
  const nkTokens = readJson(NK_TOKENS_PATH);
  const tdsTokens = readJson(DS_TOKENS_PATH);

  const nkPresets = flattenNkPresets(nkTokens);
  const tdsFlat = flattenDSTypoTokens(tdsTokens);

  const rows = nkPresets.map((preset) => {
    const matches = findMatches(preset, tdsFlat);
    const topMatch = matches[0];
    const topScore = topMatch?.numericScore ?? 0;

    // Orphan: no match at all, or top score < 25
    const isOrphan = topScore < 25;

    return {
      group: groupLabel(preset.group),
      legacyToken: preset.presetName,
      description: preset.description,
      nkProperties: {
        fontFamily: preset.fontFamilyRef,
        fontFamilyLabel: preset.fontFamilyLabel,
        fontSizeRem:
          preset.fontSizeRem != null
            ? `${preset.fontSizeRem.toFixed(4).replace(/\.?0+$/, '')}rem`
            : null,
        fontWeight: preset.weightNum,
        lineHeight: preset.lineHeightStr
      },
      matches: {
        // Primary (canonical) = best single match; user can curate later
        canonical: isOrphan
          ? []
          : topMatch
            ? [
                {
                  token: topMatch.token,
                  score: topMatch.score,
                  tdsProperties: topMatch.tdsProperties,
                  delta: topMatch.delta,
                  note: topMatch.note
                }
              ]
            : [],
        // Secondary = next best candidates (excluding first)
        synthetic: isOrphan
          ? []
          : matches.slice(1).map((m) => ({
              token: m.token,
              score: m.score,
              tdsProperties: m.tdsProperties,
              delta: m.delta,
              note: m.note
            }))
      },
      orphanNote: isOrphan
        ? preset.presetName.toLowerCase().includes('quote')
          ? 'No DS semantic quote token exists. Nearest: brand.heading.fluid.bold.* + manual line-height override.'
          : 'No sufficiently close DS token found.'
        : null
    };
  });

  const payload = {
    metadata: {
      generatedAt: new Date().toISOString(),
      source: {
        nkTokens: 'packages/tokens/docs/migration/legacy-tokens.json',
        tdsTokens: 'packages/tokens/src/tokens.json'
      },
      totalPresets: rows.length,
      groups: [
        'editorial-bold',
        'editorial-regular',
        'editorial-light',
        'utility'
      ]
    },
    rows
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(payload, null, 2) + '\n',
    'utf8'
  );

  const orphans = rows
    .filter((r) => r.matches.canonical.length === 0)
    .map((r) => r.legacyToken);
  console.log(`✓ Generated ${rows.length} rows → ${OUTPUT_PATH}`);
  console.log(`  Orphans (${orphans.length}): ${orphans.join(', ') || 'none'}`);

  // Score breakdown
  const scores = { H: 0, M: 0, L: 0, Orphan: 0 };
  for (const r of rows) {
    const s = r.matches.canonical[0]?.score || 'Orphan';
    scores[s] = (scores[s] || 0) + 1;
  }
  console.log(
    `  H=${scores.H} M=${scores.M} L=${scores.L} Orphan=${scores.Orphan}`
  );
}

main();
