/* eslint-disable react/prop-types */
// Typography Migration Mapping Table: legacy design system to Design System
import React, { useMemo, useState } from 'react';
import mappingData from '../../packages/tokens/docs/migration/data/typography-mapping-table.generated.json';

// ─── Design constants ─────────────────────────────────────────────────────────
const FONTS = {
  roboto: "'Inter', system-ui, -apple-system, sans-serif",
  digital:
    "'Inter', system-ui, -apple-system, sans-serif",
  modern: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace"
};

// Map token ref → CSS font-family string (DS definitions)
const DS_FAMILY_CSS = {
  fontFamily010: FONTS.modern,
  fontFamily020: FONTS.digital,
  fontFamily030:
    "'Inter', system-ui, -apple-system, sans-serif",
  fontFamily040: FONTS.roboto
};

// Legacy family map (legacy fontFamily030 = Inter, not the bold serif)
const NK_FAMILY_CSS = {
  fontFamily010: FONTS.modern,
  fontFamily020: FONTS.digital,
  fontFamily030: FONTS.roboto // NK Inter
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
  'editorial-bold':
    'Bold editorial typography presets using Inter. Used for headlines, display type, and bylines.',
  'editorial-regular':
    'Regular-weight editorial typography presets using Inter. Used for body text, subheadings, and softer headline variants.',
  'editorial-light':
    'Light editorial typography presets using Inter. Used for decorative headings and large-scale display.',
  utility:
    'Inter-based utility typography presets. Used for UI labels, buttons, navigation, captions, and metadata outside editorial content.'
};

// Fluid token size ranges: Small → XLarge viewport rem values
const FLUID_SIZE_RANGE = {
  '2xsmall': { min: 1.1875, max: 1.1875, fixed: true },
  xsmall: { min: 1.25, max: 1.25, fixed: true },
  small: { min: 1.5, max: 1.5, fixed: true },
  medium: { min: 1.75, max: 1.75, fixed: true },
  large: { min: 2, max: 2.25, fixed: false },
  xlarge: { min: 2.125, max: 2.125, fixed: true },
  '2xlarge': { min: 2.25, max: 3.5, fixed: false }
};

// Detect fluid size dimension from token path
function fluidSizeDimension(tokenPath) {
  if (!tokenPath) return null;
  for (const dim of Object.keys(FLUID_SIZE_RANGE)) {
    if (tokenPath.endsWith(`.${dim}`)) return dim;
  }
  return null;
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

function ResponsiveBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 24,
        padding: '0 8px',
        background: '#fff3e0',
        border: '1px solid #ffb300',
        borderRadius: 4,
        fontFamily: FONTS.mono,
        fontSize: 11,
        color: '#7a4000',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        fontWeight: 600,
        letterSpacing: '0.03em'
      }}
    >
      ⟳ Responsive
    </span>
  );
}

function DeltaBadge({ delta }) {
  if (!delta) return null;
  const exact = delta === '+0rem' || delta === '0rem';
  // Skip badge for exact matches — "High" score is sufficient
  if (exact) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 6px',
        background: '#f4f4f4',
        border: '1px solid #d0d0d0',
        borderRadius: 3,
        fontFamily: FONTS.mono,
        fontSize: 11,
        color: '#555',
        whiteSpace: 'nowrap',
        flexShrink: 0
      }}
    >
      Δ {delta}
    </span>
  );
}

function FamilyWarningBadge() {
  return (
    <span
      title="Legacy fontFamily030 (Inter) collides with Design System fontFamily030 (the bold serif). This token uses fontFamily030 in the legacy system, which maps to fontFamily040 in Design System."
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 6px',
        background: '#fff8e1',
        border: '1px solid #ffd54f',
        borderRadius: 3,
        fontFamily: FONTS.mono,
        fontSize: 11,
        color: '#5d4037',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        cursor: 'help'
      }}
    >
      ⚠ family remap
    </span>
  );
}

// ─── Type specimen ────────────────────────────────────────────────────────────
function TypeSpecimen({
  familyRef,
  sizeRem,
  weight,
  lineHeight,
  label,
  source
}) {
  // Use appropriate family map: NK vs DS have different fontFamily030 meanings
  const familyMap = source === 'NK' ? NK_FAMILY_CSS : DS_FAMILY_CSS;
  const cssFamily = familyMap[familyRef] || FONTS.roboto;
  // For fluid tokens with responsive size, adjust by viewport context
  let displayRem = parseFloat(sizeRem) || 1;

  // Clamp specimen to readable range for the table: min 0.75rem, max 2rem display
  const specimenRem = Math.min(Math.max(displayRem, 0.75), 2);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: '6px 8px',
        background: '#fafafa',
        border: '1px solid #e8e8e8',
        borderRadius: 4,
        minWidth: 100,
        maxWidth: 200
      }}
    >
      {/* Label */}
      <span
        style={{
          fontFamily: FONTS.roboto,
          fontSize: 10,
          color: '#888',
          lineHeight: 1.2,
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}
      >
        {label}
      </span>
      {/* Specimen text */}
      <span
        style={{
          fontFamily: cssFamily,
          fontSize: `${specimenRem}rem`,
          fontWeight: weight || '400',
          lineHeight: lineHeight || '150%',
          color: '#1a1a1a',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
        title={`${familyRef} · ${sizeRem} · ${weight} · ${lineHeight}`}
      >
        Example Brand
      </span>
      {/* Metrics row */}
      <span
        style={{
          fontFamily: FONTS.mono,
          fontSize: 10,
          color: '#888',
          lineHeight: 1.3
        }}
      >
        {sizeRem} · {weight} · {lineHeight}
      </span>
    </div>
  );
}

// ─── Match block ──────────────────────────────────────────────────────────────
function MatchBlock({ type, matches, viewportSize }) {
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
            const isFluid = match.tdsProperties?.isFluid;
            const sizeDim = fluidSizeDimension(match.token);
            const fluidRange = sizeDim ? FLUID_SIZE_RANGE[sizeDim] : null;

            // Compute display size based on viewport (interpolate for medium/large)
            let displaySizeRem = match.tdsProperties?.fontSizeRem;
            if (fluidRange && !fluidRange.fixed) {
              const { min, max } = fluidRange;
              if (viewportSize === 'small') {
                displaySizeRem = `${min}rem`;
              } else if (viewportSize === 'medium') {
                displaySizeRem = `${(min + (max - min) * 0.33).toFixed(4)}rem`;
              } else if (viewportSize === 'large') {
                displaySizeRem = `${(min + (max - min) * 0.66).toFixed(4)}rem`;
              } else if (viewportSize === 'xlarge') {
                displaySizeRem = `${max}rem`;
              }
            } else if (fluidRange && viewportSize === 'small') {
              displaySizeRem = `${fluidRange.min}rem`;
            }

            return (
              <div
                key={match.token || i}
                style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
              >
                {/* Token chip row */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <TokenChip text={match.token || 'Orphan'} />
                  <ScoreBadge score={match.score} />
                  {isFluid && <ResponsiveBadge />}
                  <DeltaBadge delta={match.delta} />
                </div>
                {/* Type specimen */}
                {match.tdsProperties && (
                  <TypeSpecimen
                    label="DS"
                    source="DS"
                    familyRef={match.tdsProperties.fontFamily}
                    sizeRem={displaySizeRem}
                    weight={match.tdsProperties.fontWeight}
                    lineHeight={match.tdsProperties.lineHeight}
                    viewportSize={viewportSize}
                  />
                )}
                {/* Note */}
                {match.note && (
                  <span
                    style={{
                      fontFamily: FONTS.roboto,
                      fontSize: 11,
                      color: '#666',
                      fontStyle: 'italic',
                      lineHeight: 1.4
                    }}
                  >
                    {match.note}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Property row ─────────────────────────────────────────────────────────────
function PropertyRow({ row, viewportSize }) {
  const hasFamilyRemap = row.nkProperties?.fontFamily === 'fontFamily030';

  return (
    <tr>
      {/* Legacy Token + properties cell */}
      <td
        style={{
          padding: 12,
          verticalAlign: 'top',
          background: '#ffffff',
          borderBottom: '1px solid #e6e5e6',
          borderRight: '1px solid #e6e5e6',
          width: 240
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <TokenChip text={row.legacyToken} />
          {hasFamilyRemap && <FamilyWarningBadge />}
          {/* NK properties */}
          {row.nkProperties && (
            <TypeSpecimen
              label="NK"
              source="NK"
              familyRef={row.nkProperties.fontFamily}
              sizeRem={row.nkProperties.fontSizeRem}
              weight={row.nkProperties.fontWeight}
              lineHeight={row.nkProperties.lineHeight}
            />
          )}
        </div>
      </td>

      {/* Description cell */}
      <td
        style={{
          padding: 12,
          verticalAlign: 'top',
          background: '#ffffff',
          borderBottom: '1px solid #e6e5e6',
          borderRight: '1px solid #e6e5e6',
          fontSize: 14,
          fontFamily: FONTS.digital,
          color: '#1a1a1a',
          lineHeight: '150%',
          minWidth: 180,
          maxWidth: 260
        }}
      >
        {row.description || '—'}
        {row.orphanNote && (
          <div
            style={{
              marginTop: 6,
              padding: '6px 8px',
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: FONTS.roboto,
              color: '#664d03',
              lineHeight: 1.4
            }}
          >
            ⚠ {row.orphanNote}
          </div>
        )}
      </td>

      {/* DS Token cell */}
      <td
        style={{
          padding: 12,
          verticalAlign: 'top',
          background: '#ffffff',
          borderBottom: '1px solid #e6e5e6',
          minWidth: 280
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MatchBlock
            type="canonical"
            matches={row.matches?.canonical}
            viewportSize={viewportSize}
          />
          <MatchBlock
            type="synthetic"
            matches={row.matches?.synthetic}
            viewportSize={viewportSize}
          />
        </div>
      </td>
    </tr>
  );
}

// ─── Group section ────────────────────────────────────────────────────────────
function GroupSection({ group, rows, viewportSize }) {
  const [expanded, setExpanded] = useState(true);
  const titleMap = {
    'editorial-bold': 'Editorial: Bold',
    'editorial-regular': 'Editorial: Regular',
    'editorial-light': 'Editorial: Light',
    utility: 'Utility'
  };
  const title = titleMap[group] || group;
  const description = GROUP_DESCRIPTIONS[group] || '';

  return (
    <div style={{ border: '1px solid #e6e5e6', marginBottom: 4 }}>
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
                        padding: '0 12px',
                        height: 42,
                        fontSize: 14,
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
                  viewportSize={viewportSize}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────
export function TypographyMappingTable() {
  const [viewportSize, setViewportSize] = useState('small');

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
      {/* ── Viewport toggle (for fluid tokens) ── */}
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
          Specimen viewport
        </span>
        <div
          role="tablist"
          aria-label="Specimen viewport size"
          style={{
            display: 'flex',
            gap: 2,
            padding: 3,
            background: '#ebebeb',
            borderRadius: 8
          }}
        >
          {[
            { id: 'small', label: 'Small (≤767px)' },
            { id: 'medium', label: 'Medium (768–1023px)' },
            { id: 'large', label: 'Large (1024–1439px)' },
            { id: 'xlarge', label: 'XLarge (≥1440px)' }
          ].map(({ id, label }) => {
            const active = viewportSize === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setViewportSize(id)}
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
                {label}
              </button>
            );
          })}
        </div>
        <span
          style={{
            fontSize: 11,
            fontFamily: FONTS.roboto,
            color: '#888',
            fontStyle: 'italic'
          }}
        >
          Affects{' '}
          <span
            style={{
              background: '#fff3e0',
              border: '1px solid #ffb300',
              borderRadius: 3,
              padding: '1px 5px',
              fontSize: 11,
              color: '#7a4000'
            }}
          >
            ⟳ Responsive
          </span>{' '}
          tokens only
        </span>
      </div>

      {/* ── Score legend ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          padding: '8px 12px',
          background: '#f2f2f2',
          border: '1px solid #e6e5e6',
          marginBottom: 8,
          borderRadius: 4,
          alignItems: 'center'
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontFamily: FONTS.roboto,
            color: '#595959',
            fontWeight: 500
          }}
        >
          Match score:
        </span>
        {Object.entries(SCORE_LABELS).map(([key]) => (
          <span
            key={key}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <ScoreBadge score={key} />
            <span
              style={{
                fontSize: 11,
                fontFamily: FONTS.roboto,
                color: '#595959'
              }}
            >
              {key === 'H'
                ? '≥80'
                : key === 'M'
                  ? '≥50'
                  : key === 'L'
                    ? '≥25'
                    : '<25'}
            </span>
          </span>
        ))}
        <span
          style={{
            fontSize: 11,
            fontFamily: FONTS.roboto,
            color: '#888',
            marginLeft: 4
          }}
        >
          · Scored on: family (40%) + size (30%) + weight (20%) + line-height
          (10%)
        </span>
      </div>

      {/* ── Group sections ── */}
      {grouped.map(({ group, rows }) => (
        <GroupSection
          key={group}
          group={group}
          rows={rows}
          viewportSize={viewportSize}
        />
      ))}
    </div>
  );
}

export default TypographyMappingTable;
