import React, { useMemo, useState } from 'react';
import tokens from '../../packages/tokens/src/tokens.json';

function flattenTokenObject(obj, prefix = '', out = []) {
  for (const [key, val] of Object.entries(obj || {})) {
    if (key.startsWith('$')) continue;
    const path = prefix ? `${prefix}.${key}` : key;

    if (val && typeof val === 'object' && 'value' in val) {
      out.push({
        path,
        value: val.value,
        type: val.type || null,
        description: val.description || ''
      });
      continue;
    }

    if (val && typeof val === 'object') {
      flattenTokenObject(val, path, out);
    }
  }

  return out;
}

const ROLE_ORDER = [
  'Text',
  'Fill',
  'Border',
  'Icon',
  'Surface',
  'Input',
  'Tag',
  'Interactive',
  'Feedback',
  'Other'
];

const TYPE_ORDER = [
  'colour token',
  'text token',
  'spacing token',
  'border radius token',
  'typography token',
  'other'
];

function hasPathTerm(path, terms) {
  return terms.some((term) => path.includes(term));
}

function inferRoleGroup(path) {
  if (hasPathTerm(path, ['.text.', '.text'])) return 'Text';
  if (hasPathTerm(path, ['.fill.', '.fill'])) return 'Fill';
  if (hasPathTerm(path, ['.border.', '.border', '.stroke.', '.stroke']))
    return 'Border';
  if (hasPathTerm(path, ['.icon.', '.icon'])) return 'Icon';
  if (hasPathTerm(path, ['.surface.', '.surface'])) return 'Surface';
  if (hasPathTerm(path, ['.input.', '.input'])) return 'Input';
  if (hasPathTerm(path, ['.tag.', '.tag'])) return 'Tag';
  if (hasPathTerm(path, ['.interactive.', '.interactive']))
    return 'Interactive';
  if (hasPathTerm(path, ['.feedback.', '.feedback'])) return 'Feedback';
  return 'Other';
}

function inferType(token) {
  const tokenType = String(token.type || '').toLowerCase();
  const path = String(token.path || '').toLowerCase();

  if (hasPathTerm(path, ['.text.', '.text'])) return 'text token';

  if (
    tokenType.includes('radius') ||
    hasPathTerm(path, ['radius', 'rounded', 'corner'])
  ) {
    return 'border radius token';
  }

  if (tokenType.includes('spacing') || tokenType.includes('dimension'))
    return 'spacing token';
  if (
    hasPathTerm(path, ['spacing', 'space', 'gap', 'inset', 'padding', 'margin'])
  )
    return 'spacing token';

  if (tokenType.includes('typography') || tokenType.includes('font'))
    return 'typography token';
  if (
    hasPathTerm(path, ['font', 'line-height', 'letter-spacing', 'typography'])
  )
    return 'typography token';

  if (
    tokenType.includes('color') ||
    hasPathTerm(path, ['.fill.', '.icon.', '.border.', '.surface.'])
  ) {
    return 'colour token';
  }

  return 'other';
}

function getForcedTypeForSet(setName) {
  if (setName === 'grid') return 'spacing token';
  if (setName === 'border-radius') return 'border radius token';
  if (setName === 'typographyTokens') return 'typography token';
  return null;
}

function shouldIndexSet(setName) {
  if (setName.startsWith('light/') || setName.startsWith('dark/')) return true;
  return (
    setName === 'grid' ||
    setName === 'border-radius' ||
    setName === 'typographyTokens'
  );
}

function buildSemanticIndex() {
  const entries = new Map();

  for (const [setName, setData] of Object.entries(tokens)) {
    if (!shouldIndexSet(setName) || !setData || typeof setData !== 'object')
      continue;

    const flat = flattenTokenObject(setData);
    const forcedType = getForcedTypeForSet(setName);

    for (const token of flat) {
      if (
        String(token.path || '')
          .toLowerCase()
          .includes('ramp')
      )
        continue;
      const isSemanticSet =
        setName.startsWith('light/') || setName.startsWith('dark/');
      const scopedPath = isSemanticSet
        ? token.path
        : `${setName}.${token.path}`;
      const key = scopedPath;

      if (!entries.has(key)) {
        const safePath = String(scopedPath || '').toLowerCase();
        entries.set(key, {
          tokenPath: scopedPath,
          description: token.description || '',
          roleGroup: inferRoleGroup(safePath),
          tokenType: forcedType || inferType(token)
        });
      }
    }
  }

  return [...entries.values()].sort((a, b) =>
    a.tokenPath.localeCompare(b.tokenPath)
  );
}

function tokenize(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9./_\-\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function normalizeQuery(input) {
  return String(input || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(input) {
  return String(input || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMatches(text, terms) {
  const safeText = String(text || '');
  if (!safeText) return safeText;

  const cleaned = [...new Set((terms || []).filter((t) => t && t.length > 1))];
  if (cleaned.length === 0) return safeText;

  const pattern = cleaned.map(escapeRegExp).join('|');
  const regex = new RegExp(`(${pattern})`, 'ig');
  const parts = safeText.split(regex);

  return parts.map((part, index) => {
    if (cleaned.some((term) => term.toLowerCase() === part.toLowerCase())) {
      return (
        <mark
          key={`${part}-${index}`}
          style={{ background: '#FFF4BD', padding: '0 2px', borderRadius: 2 }}
        >
          {part}
        </mark>
      );
    }
    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
}

function score(entry, terms) {
  let points = 0;
  const reasons = [];
  const path = entry.tokenPath.toLowerCase();
  const description = String(entry.description || '').toLowerCase();
  const roleGroup = String(entry.roleGroup || '').toLowerCase();
  const tokenType = String(entry.tokenType || '').toLowerCase();

  for (const term of terms) {
    if (!term) continue;

    if (path.includes(term)) {
      points += 6;
      reasons.push(`path: ${term}`);
      continue;
    }

    if (description.includes(term)) {
      points += 4;
      reasons.push(`description: ${term}`);
      continue;
    }

    if (roleGroup.includes(term) || tokenType.includes(term)) {
      points += 2;
      reasons.push(`group/type: ${term}`);
    }
  }

  return { points, reasons: [...new Set(reasons)] };
}

function groupByRoleAndType(items) {
  const grouped = new Map();

  for (const item of items) {
    if (!grouped.has(item.roleGroup)) {
      grouped.set(item.roleGroup, new Map());
    }

    const typeMap = grouped.get(item.roleGroup);
    if (!typeMap.has(item.tokenType)) {
      typeMap.set(item.tokenType, []);
    }
    typeMap.get(item.tokenType).push(item);
  }

  return ROLE_ORDER.map((role) => {
    const typeMap = grouped.get(role);
    if (!typeMap) return null;

    const types = TYPE_ORDER.map((type) => {
      const tokensForType = typeMap.get(type) || [];
      if (tokensForType.length === 0) return null;

      return {
        type,
        items: [...tokensForType].sort((a, b) =>
          a.tokenPath.localeCompare(b.tokenPath)
        )
      };
    }).filter(Boolean);

    return {
      role,
      types,
      count: types.reduce((acc, t) => acc + t.items.length, 0)
    };
  }).filter(Boolean);
}

export default function TokenDiscoveryWidget() {
  const index = useMemo(() => buildSemanticIndex(), []);
  const [draftIntent, setDraftIntent] = useState('');
  const [submittedIntent, setSubmittedIntent] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const normalizedIntent = useMemo(
    () => normalizeQuery(submittedIntent),
    [submittedIntent]
  );
  const terms = useMemo(() => tokenize(normalizedIntent), [normalizedIntent]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    const normalizedDraft = normalizeQuery(draftIntent);
    if (!normalizedDraft) {
      setSubmittedIntent('');
      setHasSearched(false);
      return;
    }

    setSubmittedIntent(normalizedDraft);
    setHasSearched(true);
  }

  function handleClear() {
    setDraftIntent('');
    setSubmittedIntent('');
    setHasSearched(false);
  }

  const ranked = useMemo(() => {
    if (!hasSearched || terms.length === 0) return [];
    const source =
      terms.length === 0
        ? index
        : index.filter((entry) => score(entry, terms).points > 0);

    return source
      .map((entry) => {
        const scored = score(entry, terms);
        return {
          ...entry,
          score: scored.points,
          reasons: scored.reasons
        };
      })
      .sort(
        (a, b) => b.score - a.score || a.tokenPath.localeCompare(b.tokenPath)
      )
      .slice(0, 60);
  }, [hasSearched, index, terms]);

  const grouped = useMemo(() => groupByRoleAndType(ranked), [ranked]);

  return (
    <section
      style={{
        border: '1px solid #E6E6E6',
        borderRadius: 10,
        padding: 16,
        margin: '18px 0 26px 0',
        background: '#FAFAFA'
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 10 }}>Token Discovery</h3>
      <p style={{ marginTop: 0, marginBottom: 12 }}>
        Search semantic tokens by intent. Results include spacing tokens,
        border-radius tokens, and typography tokens.
      </p>

      <form onSubmit={handleSearchSubmit} style={{ marginBottom: 10 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            gap: 8
          }}
        >
          <input
            id="token-intent-search"
            value={draftIntent}
            onChange={(e) => setDraftIntent(e.target.value)}
            placeholder="Search tokens (e.g. muted label text, typography heading, grid spacing)"
            aria-label="Search semantic tokens by intent"
            style={{
              width: '100%',
              padding: '9px 10px',
              border: '1px solid #CCC',
              borderRadius: 8
            }}
          />
          <button
            type="submit"
            style={{
              padding: '9px 12px',
              border: '1px solid #CCC',
              borderRadius: 8,
              background: '#1A1A1A',
              color: '#FFF',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: '9px 12px',
              border: '1px solid #CCC',
              borderRadius: 8,
              background: '#FFF',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
      </form>

      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        {hasSearched
          ? grouped.map((roleGroup) => (
              <div
                key={roleGroup.role}
                style={{
                  background: '#FFF',
                  border: '1px solid #E6E6E6',
                  borderRadius: 8,
                  padding: 10
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 8 }}>
                  {roleGroup.role} ({roleGroup.count})
                </div>

                {roleGroup.types.map((typeGroup) => (
                  <div
                    key={`${roleGroup.role}-${typeGroup.type}`}
                    style={{ marginBottom: 10 }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: '#444',
                        marginBottom: 5
                      }}
                    >
                      {typeGroup.type}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {typeGroup.items.map((item) => (
                        <li key={item.tokenPath} style={{ marginBottom: 6 }}>
                          <div style={{ fontWeight: 600 }}>
                            {highlightMatches(item.tokenPath, terms)}
                          </div>
                          {item.description ? (
                            <div style={{ color: '#555', fontSize: 12 }}>
                              {highlightMatches(item.description, terms)}
                            </div>
                          ) : null}
                          {item.reasons?.length ? (
                            <div
                              style={{
                                color: '#777',
                                fontSize: 11,
                                marginTop: 2
                              }}
                            >
                              matched by: {item.reasons.join(', ')}
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))
          : null}
      </div>
    </section>
  );
}
