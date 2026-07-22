/* eslint-disable react/prop-types */
// ─── Dimension token mapping table (border-radius + spacing) ─────────────────
// Mirrors MappingTable.jsx design exactly; no theme selector since dimension
// tokens carry no light/dark or section-theme variance.
import React, { useState } from 'react';

// ─── Figma-exact design constants (shared with MappingTable) ─────────────────
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

// Grey monospace badge showing the resolved pixel value
function ValueBadge({ value }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 24,
        padding: '0 8px',
        boxSizing: 'border-box',
        background: '#f5f5f5',
        border: '1px solid #d0d0d0',
        borderRadius: 4,
        fontFamily: FONTS.mono,
        fontSize: 12,
        color: '#595959',
        whiteSpace: 'nowrap',
        flexShrink: 0
      }}
    >
      {value}
    </span>
  );
}

// Visual preview atom:
//   borderRadius → 20×20 square demonstrating the corner curvature
//   spacing      → horizontal bar whose width scales with the resolved px value
function SizePreview({ previewType, value }) {
  if (!value) return null;

  if (previewType === 'borderRadius') {
    const px = value === '9999' ? 9999 : parseInt(value, 10) || 0;
    return (
      <span
        style={{
          display: 'inline-flex',
          width: 20,
          height: 20,
          background: '#e0e8f5',
          border: '1px solid #97aed7',
          borderRadius: px,
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      />
    );
  }

  if (previewType === 'spacing') {
    const px = parseInt(value, 10) || 0;
    const displayWidth = Math.max(2, Math.min(px, 80));
    return (
      <span
        style={{
          display: 'inline-flex',
          height: 8,
          width: displayWidth,
          background: '#c8d9f0',
          borderRadius: 2,
          flexShrink: 0
        }}
      />
    );
  }

  return null;
}

// One token row inside a match block: chip · score badge · value badge · preview
function TokenRow({ token, score, resolvedValue, previewType }) {
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
      {resolvedValue && <ValueBadge value={resolvedValue} />}
      {resolvedValue && (
        <SizePreview previewType={previewType} value={resolvedValue} />
      )}
    </div>
  );
}

// ─── Match block (Primary / Secondary) ───────────────────────────────────────
// Identical Figma pattern as MappingTable: label tab stacked above bordered
// container. `matches` is an array of token rows.
function MatchBlock({ type, matches, previewType }) {
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
          items.map((match, i) => (
            <TokenRow
              key={match.token || i}
              token={match.token}
              score={match.score}
              resolvedValue={match.resolvedValue}
              previewType={previewType}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Property row ─────────────────────────────────────────────────────────────
function PropertyRow({ row, previewType }) {
  return (
    <tr>
      {/* Legacy Token cell: chip + resolved value badge */}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <TokenChip text={row.legacyToken} />
          {row.legacyValue && <ValueBadge value={row.legacyValue} />}
        </div>
      </td>

      {/* Description cell */}
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

      {/* DS Token cell — primary + secondary match blocks */}
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
            previewType={previewType}
          />
          <MatchBlock
            type="synthetic"
            matches={row.matches?.synthetic}
            previewType={previewType}
          />
        </div>
      </td>
    </tr>
  );
}

// ─── Group section ────────────────────────────────────────────────────────────
function GroupSection({ group, rows, description, previewType }) {
  const [expanded, setExpanded] = useState(true);
  const title = group.charAt(0).toUpperCase() + group.slice(1);

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
                  previewType={previewType}
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
// Props:
//   data        — imported JSON (border-radius-mapping.json or spacing-mapping.json)
//   previewType — 'borderRadius' | 'spacing'  controls SizePreview rendering
export function DimensionMappingTable({ data, previewType }) {
  const rows = data?.rows || [];
  const groupMeta = data?.groupMeta || {};

  // Collect groups preserving insertion order
  const grouped = [];
  const seen = new Map();
  for (const row of rows) {
    const key = row.group || 'other';
    if (!seen.has(key)) {
      const entry = { group: key, rows: [] };
      seen.set(key, entry);
      grouped.push(entry);
    }
    seen.get(key).rows.push(row);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONTS.roboto
      }}
    >
      {grouped.map(({ group, rows: groupRows }) => (
        <GroupSection
          key={group}
          group={group}
          rows={groupRows}
          description={groupMeta[group] || ''}
          previewType={previewType}
        />
      ))}
    </div>
  );
}

export default DimensionMappingTable;
