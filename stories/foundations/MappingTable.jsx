/* eslint-disable react/prop-types */
// ─── FIGMA SOURCE: UI-Kit node 1271:43194 "Semantic Token Mapping Table template" ─
import React, { useMemo, useState } from 'react';
import mappingData from '../../packages/tokens/docs/migration/data/token-mapping-table.generated.json';

// ─── Figma-exact design constants ─────────────────────────────────────────────
const FONTS = {
  roboto: "'Inter', system-ui, -apple-system, sans-serif",
  digital:
    "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace"
};

const SCORE_LABELS = { H: 'High', M: 'Medium', L: 'Low', Orphan: 'Orphan' };

const SCORE_STYLES = {
  H: { background: '#e9f3ed', border: '1px solid #95ceb1', color: '#15412c' },
  M: { background: '#ffe7cb', border: '1px solid #ffc274', color: '#664109' },
  L: { background: '#ffdad8', border: '1px solid #ff8883', color: '#670909' },
  Orphan: {
    background: '#e6e6e6',
    border: '1px solid #a8a8a8',
    color: '#595959'
  }
};

// Primary Match = human-curated intent match; Secondary Match = computed nearest candidate
const MATCH_CFG = {
  canonical: {
    labelBg: '#7f9cce',
    borderColor: '#7f9cce',
    label: 'Primary Match'
  },
  synthetic: {
    labelBg: '#999999',
    borderColor: '#999999',
    label: 'Secondary Match'
  }
};

const GROUP_DESCRIPTIONS = {
  ink: 'Text and icon colour aliases: core hierarchy (base, contrast, subtle, non-essential, inverse), static values, brand, status variants (positive, negative, informative, notice), and section-specific overrides.',
  interface:
    'Page and component background colours: canvas, elevation contrasts, dividers, skeleton loading states, brand surfaces, status fills (positive, negative, notice, informative, neutral), and section surface overrides.',
  interactive:
    'Action and button state colours across five palettes (primary, secondary, negative, positive, inverse) and five states each, plus form input fills, link states, focus ring, disabled, and visited.',
  overlay:
    'Tint overlays for modal and drawer backgrounds, in base (darkening) and inverse (lightening) variants, plus directional gradient helpers. Gradient tokens have no Design System equivalent.',
  sections:
    'Ten-step brand colour scale (010 to 100) for editorial section theming. Resolves to the neutral ramp in the default Brand theme and to channel-specific colours in section themes.',
  foundations:
    'Foundation colours used directly in legacy design system code, bypassing the semantic layer. Using foundation colours directly is not recommended: map to the appropriate semantic token instead. Preserved here for migration reference only.'
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hexLuminance(hex) {
  const clean = (hex || '#ffffff').replace('#', '');
  if (clean.length !== 6) return 1;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function modeCircleTextColor(hex) {
  return hexLuminance(hex) > 0.45 ? '#1a1a1a' : '#ffffff';
}
function modeCircleBorder(hex) {
  return hexLuminance(hex) > 0.88 ? '1px solid #d9d9d9' : 'none';
}

// ─── Atoms ────────────────────────────────────────────────────────────────────
function TokenChip({ text }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 24,
        padding: '0 8px',
        boxSizing: 'border-box',
        background: '#fafafd',
        border: '1px solid #97aed7',
        borderRadius: 4,
        fontFamily: FONTS.mono,
        fontSize: 12,
        color: '#0b2c62',
        whiteSpace: 'nowrap',
        flexShrink: 0
      }}
    >
      {text}
    </span>
  );
}

function ScoreBadge({ score }) {
  const key = score || 'Orphan';
  const s = SCORE_STYLES[key] || SCORE_STYLES.Orphan;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 24,
        padding: '0 8px',
        boxSizing: 'border-box',
        borderRadius: 4,
        fontFamily: FONTS.mono,
        fontSize: 12,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...s
      }}
    >
      {SCORE_LABELS[key] || key}
    </span>
  );
}

// L / D resolved-colour circles — background IS the resolved hex swatch;
// the letter sits at 50% alpha so the swatch colour shows clearly through it.
function ModeCircle({ mode, hex }) {
  const bg = hex || '#ffffff';
  const letterBase = modeCircleTextColor(bg); // #1a1a1a or #ffffff
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: 9999,
        background: bg,
        border: modeCircleBorder(bg),
        boxSizing: 'border-box',
        flexShrink: 0,
        overflow: 'hidden'
      }}
    >
      <span
        style={{
          fontFamily: FONTS.roboto,
          fontSize: 12,
          fontWeight: 500,
          lineHeight: 1,
          color: letterBase,
          opacity: 0.5,
          userSelect: 'none'
        }}
      >
        {mode}
      </span>
    </span>
  );
}

// One token row inside a match block: chip · score badge · L circle · D circle
function TokenRow({ token, score, lightHex, darkHex }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        minHeight: 24,
        flexWrap: 'nowrap'
      }}
    >
      <TokenChip text={token || 'Orphan'} />
      <ScoreBadge score={score} />
      <ModeCircle mode="L" hex={lightHex} />
      <ModeCircle mode="D" hex={darkHex} />
    </div>
  );
}

// ─── Match block (Canonical / Synthetic) ──────────────────────────────────────
// Figma pattern: label tab (tl+tr=4 radius, bl+br=0) stacked above a bordered
// container (tl=0, tr+br+bl=4) — border colour matches label background.
// `matches` is now an array — each item is one TokenRow inside the container.
function MatchBlock({ type, matches, selectedTheme }) {
  const cfg = MATCH_CFG[type] || MATCH_CFG.canonical;
  const items = Array.isArray(matches) ? matches : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Label tab */}
      <div
        style={{
          alignSelf: 'flex-start',
          background: cfg.labelBg,
          borderRadius: '4px 4px 0 0',
          padding: '4px 8px',
          boxSizing: 'border-box',
          display: 'inline-flex',
          alignItems: 'center',
          fontFamily: FONTS.roboto,
          fontSize: 12,
          fontWeight: 500,
          color: '#ffffff',
          userSelect: 'none',
          lineHeight: 1
        }}
      >
        {cfg.label}
      </div>
      {/* Container */}
      <div
        style={{
          border: `1px solid ${cfg.borderColor}`,
          borderRadius: '0 4px 4px 4px',
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}
      >
        {items.length === 0 ? (
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 12,
              color: '#595959',
              fontStyle: 'italic'
            }}
          >
            No match
          </span>
        ) : (
          items.map((match, i) => {
            const resolved =
              (match?.resolvedByTheme || {})[selectedTheme] || {};
            return (
              <TokenRow
                key={match.token || i}
                token={match.token}
                score={match.score}
                lightHex={resolved.light}
                darkHex={resolved.dark}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Property row ─────────────────────────────────────────────────────────────
function PropertyRow({ row, selectedTheme }) {
  return (
    <tr>
      {/* Legacy Token cell */}
      <td
        style={{
          padding: 16,
          verticalAlign: 'top',
          background: '#ffffff',
          borderBottom: '1px solid #e6e5e6',
          borderRight: '1px solid #e6e5e6',
          whiteSpace: 'nowrap'
        }}
      >
        <TokenChip text={row.legacyToken} />
      </td>

      {/* Description cell — 17px Inter, 150% line-height */}
      <td
        style={{
          padding: 16,
          verticalAlign: 'top',
          background: '#ffffff',
          borderBottom: '1px solid #e6e5e6',
          borderRight: '1px solid #e6e5e6',
          fontSize: 17,
          fontFamily: FONTS.digital,
          color: '#1a1a1a',
          lineHeight: '150%',
          width: '100%'
        }}
      >
        {row.description}
      </td>

      {/* DS Token cell — primary match block + secondary match block, gap 10 */}
      <td
        style={{
          padding: 16,
          verticalAlign: 'top',
          background: '#ffffff',
          borderBottom: '1px solid #e6e5e6',
          whiteSpace: 'nowrap'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MatchBlock
            type="canonical"
            matches={row.matches?.canonical}
            selectedTheme={selectedTheme}
          />
          <MatchBlock
            type="synthetic"
            matches={row.matches?.synthetic}
            selectedTheme={selectedTheme}
          />
        </div>
      </td>
    </tr>
  );
}

// ─── Group section ─────────────────────────────────────────────────────────────
function GroupSection({ group, rows, selectedTheme }) {
  const [expanded, setExpanded] = useState(true);
  const title = group.charAt(0).toUpperCase() + group.slice(1);
  const description = GROUP_DESCRIPTIONS[group] || '';

  return (
    <div style={{ border: '1px solid #e6e5e6', marginBottom: 4 }}>
      {/* Figma: #737373 header, height 70px, padding 16, gap 10, HORIZONTAL */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: '100%',
          minHeight: 70,
          border: 'none',
          background: '#737373',
          color: '#ffffff',
          padding: 16,
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          cursor: 'pointer',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 0
          }}
        >
          {/* Section title — 16px Inter */}
          <span
            style={{
              fontSize: 16,
              fontFamily: FONTS.roboto,
              fontWeight: 500,
              color: '#ffffff'
            }}
          >
            {title}
          </span>
          {/* Section description — 12px Inter */}
          {description && (
            <span
              style={{
                fontSize: 12,
                fontFamily: FONTS.roboto,
                fontWeight: 400,
                color: '#ffffff',
                whiteSpace: 'normal'
              }}
            >
              {description}
            </span>
          )}
        </span>
        {/* Expand / collapse indicator */}
        <span
          style={{
            fontSize: 18,
            flexShrink: 0,
            fontFamily: FONTS.roboto,
            lineHeight: 1,
            color: '#ffffff'
          }}
        >
          {expanded ? '−' : '+'}
        </span>
      </button>

      {expanded && (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              tableLayout: 'auto'
            }}
          >
            <thead>
              <tr>
                {['Legacy Token', 'Description', 'DS Token'].map(
                  (heading) => (
                    <th
                      key={heading}
                      style={{
                        textAlign: 'left',
                        padding: '0 16px',
                        height: 42,
                        fontSize: 16,
                        fontFamily: FONTS.roboto,
                        fontWeight: 500,
                        background: '#f2f2f2',
                        color: '#1a1a1a',
                        borderBottom: '1px solid #e6e5e6',
                        borderRight: '1px solid #e6e5e6',
                        boxSizing: 'border-box'
                      }}
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <PropertyRow
                  key={row.legacyToken}
                  row={row}
                  selectedTheme={selectedTheme}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Root component ────────────────────────────────────────────────────────────
export function MappingTable() {
  const themes = mappingData?.metadata?.themes || [];
  const defaultTheme =
    mappingData?.metadata?.defaultTheme || themes[0] || 'core';
  const [selectedTheme, setSelectedTheme] = useState(defaultTheme);

  const grouped = useMemo(() => {
    const buckets = new Map();
    for (const row of mappingData.rows || []) {
      const key = row.group || 'other';
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(row);
    }
    return [...buckets.entries()].map(([group, rows]) => ({ group, rows }));
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONTS.roboto
      }}
    >
      {/* ── Theme segmented control ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 16px',
          background: '#f9f9f9',
          border: '1px solid #e6e5e6',
          marginBottom: 8,
          flexWrap: 'wrap'
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontFamily: FONTS.roboto,
            fontWeight: 500,
            color: '#595959',
            flexShrink: 0,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
        >
          DS Theme
        </span>
        <div
          role="tablist"
          aria-label="DS Theme"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            padding: 3,
            background: '#ebebeb',
            borderRadius: 8
          }}
        >
          {themes.map((theme) => {
            const active = theme === selectedTheme;
            return (
              <button
                key={theme}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setSelectedTheme(theme)}
                style={{
                  height: 28,
                  padding: '0 10px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: FONTS.roboto,
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  background: active ? '#ffffff' : 'transparent',
                  color: active ? '#1a1a1a' : '#595959',
                  boxShadow: active
                    ? '0 1px 3px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)'
                    : 'none',
                  transition:
                    'background 120ms ease, color 120ms ease, box-shadow 120ms ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {theme}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Group sections ── */}
      {grouped.map(({ group, rows }) => (
        <GroupSection
          key={group}
          group={group}
          rows={rows}
          selectedTheme={selectedTheme}
        />
      ))}
    </div>
  );
}

export default MappingTable;
