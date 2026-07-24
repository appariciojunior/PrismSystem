#!/usr/bin/env python3
"""
Expand token-mapping-table.generated.json to include ALL legacy semantic colour
tokens (ink, interface, interactive, overlay, sections).

Rules:
- Preserves existing canonical matches exactly (user curates those manually).
- Recomputes secondary (synthetic) matches for ALL rows using a combined signal:
    1. RGB hex proximity (primary gate: MAX_DIST = 90)
    2. Description word-overlap (Jaccard) — boosts ranking by up to DESC_WEIGHT (35%)
       without affecting the H/M/L score label, which stays hex-only.
- Foundations group rows are preserved from the existing JSON (legacy group).
- Overlay gradient tokens (no solid hex) get no secondary match.
"""

import json, math, re, os, sys
from datetime import datetime, timezone
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
NEWSKIT_PATH      = os.path.join(ROOT, 'packages/tokens/docs/migration/newskit-tokens.json')
RESOLVED_PATH     = os.path.join(ROOT, 'build/js/tokens.json')
TOKENS_SRC_PATH   = os.path.join(ROOT, 'packages/tokens/src/tokens.json')
CURRENT_PATH      = os.path.join(ROOT, 'packages/tokens/docs/migration/data/token-mapping-table.generated.json')
OUTPUT_PATH       = CURRENT_PATH

SEMANTIC_GROUPS = ['ink', 'interface', 'interactive', 'overlay', 'sections']
GROUP_ORDER     = ['ink', 'interface', 'interactive', 'overlay', 'sections', 'foundations']

MAX_DIST    = 90    # RGB Euclidean distance threshold
MAX_RESULTS = 3
SCORE_H     = 10
SCORE_M     = 40
DESC_WEIGHT = 0.35  # max fraction by which description similarity can boost ranking

# Common words that carry no semantic signal for token intent matching
STOPWORDS = {
    'a', 'an', 'the', 'of', 'for', 'and', 'or', 'in', 'on', 'at', 'to', 'is',
    'it', 'by', 'as', 'be', 'do', 'if', 'no', 'not', 'so', 'vs', 'with', 'from',
    'into', 'when', 'where', 'this', 'that', 'which', 'used', 'use', 'uses',
    'all', 'any', 'are', 'was', 'were', 'has', 'have', 'its', 'only', 'also',
}


# ── Helpers ──────────────────────────────────────────────────────────────────

def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def hex_to_rgb(h):
    h = h.lstrip('#')
    if len(h) == 8:
        return None   # rgba — skip
    if len(h) != 6:
        return None
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def rgb_dist(h1, h2):
    r1, r2 = hex_to_rgb(h1), hex_to_rgb(h2)
    if r1 is None or r2 is None:
        return 9999
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(r1, r2)))


def tokenise_desc(text):
    """Lowercase word set from a description, stopwords and short words removed."""
    if not text:
        return set()
    return {w for w in re.findall(r'[a-z]+', text.lower())
            if len(w) > 2 and w not in STOPWORDS}


def desc_jaccard(nk_words, tds_desc):
    """Jaccard similarity between a pre-tokenised legacy word set and a DS description string."""
    tds_words = tokenise_desc(tds_desc)
    if not nk_words or not tds_words:
        return 0.0
    intersection = len(nk_words & tds_words)
    union = len(nk_words | tds_words)
    return intersection / union if union else 0.0


def build_tds_descriptions(tokens_src):
    """Walk light/ core semantic tokens in tokens.json → {path: description}."""
    out = {}
    core = tokens_src.get('light/ core', {})

    def walk(obj, path):
        if not isinstance(obj, dict):
            return
        if 'value' in obj:
            desc = obj.get('description', '').strip()
            if path:
                out[path] = desc
            return
        for k, v in obj.items():
            if k.startswith('$'):
                continue
            walk(v, f'{path}.{k}' if path else k)

    walk(core, '')
    return out


def build_foundations_map(newskit):
    out = {}
    for k, v in newskit.get('Foundations', {}).items():
        if isinstance(v, dict) and v.get('type') == 'color':
            val = v.get('value', '')
            if isinstance(val, str) and val.startswith('#'):
                out[k] = val.lower()
    return out


def resolve_ref(value, light_theme, foundations, depth=0):
    """Resolve a legacy token value string to a lowercase hex (or None)."""
    if depth > 5 or not value or not isinstance(value, str):
        return None
    v = value.strip()
    if v.startswith('#'):
        return None if len(v.lstrip('#')) == 8 else v.lower()  # skip rgba
    m = re.match(r'^\{([^}]+)\}$', v)
    if not m:
        return None  # gradient or complex value
    ref = m.group(1)
    # Direct foundation lookup
    if ref in foundations:
        return foundations[ref]
    # Navigate light_theme tree (e.g. 'sections.sectionBrand060')
    parts = ref.split('.')
    node = light_theme
    for p in parts:
        if isinstance(node, dict):
            node = node.get(p)
        else:
            return None
    if isinstance(node, dict) and 'value' in node:
        return resolve_ref(node['value'], light_theme, foundations, depth + 1)
    return None


def collect_semantic_tokens(newskit, foundations):
    """Walk Light/Light semantic groups → {token_path: {hex, description, group}}"""
    light_theme = newskit.get('Light/Light', {})
    tokens = {}

    def walk(obj, path, group):
        if not isinstance(obj, dict):
            return
        if 'value' in obj and obj.get('type') == 'color':
            tokens[path] = {
                'hex':         resolve_ref(obj['value'], light_theme, foundations),
                'description': obj.get('description', '').strip(),
                'group':       group,
            }
            return
        for k, v in obj.items():
            if k.startswith('$'):
                continue
            walk(v, f'{path}.{k}' if path else k, group)

    for group in SEMANTIC_GROUPS:
        walk(light_theme.get(group, {}), group, group)

    return tokens


# ── DS resolved token helpers ────────────────────────────────────────────────

def get_tds_hex(path, resolved, theme, mode):
    key = f'{mode}/ {theme}'
    node = resolved.get(key, {})
    for part in path.split('.'):
        if isinstance(node, dict):
            node = node.get(part)
        else:
            return None
    return node if isinstance(node, str) and node.startswith('#') else None


def flatten_tds_tokens(resolved, tds_descriptions, theme='core', mode='light'):
    """Return all non-foundation DS token paths with hex and description in core/light."""
    result = []

    def walk(obj, path):
        if isinstance(obj, dict):
            for k, v in obj.items():
                walk(v, f'{path}.{k}' if path else k)
        elif isinstance(obj, str) and obj.startswith('#'):
            desc = tds_descriptions.get(path, '')
            result.append((path, obj.lower(), desc))

    walk(resolved.get(f'{mode}/ {theme}', {}), '')
    return [(p, h, d) for p, h, d in result if not p.startswith('foundation')]


def build_resolved_matrix(token_path, resolved, themes):
    out = {}
    for theme in themes:
        out[theme] = {
            'light': get_tds_hex(token_path, resolved, theme, 'light'),
            'dark':  get_tds_hex(token_path, resolved, theme, 'dark'),
        }
    return out


# ── Secondary matching ───────────────────────────────────────────────────────

def compute_synthetic(newskit_hex, newskit_desc, all_tds, canonical_set):
    """Rank DS candidates by a combined hex + description similarity signal.

    Hex proximity is the primary gate (MAX_DIST). Description word-overlap
    (Jaccard) adjusts ranking within that gate by up to DESC_WEIGHT, but does
    not affect the H/M/L score label — that remains hex-only so scores stay
    comparable across rows.
    """
    if not newskit_hex:
        return []
    nk_words = tokenise_desc(newskit_desc)
    candidates = []
    for tds_path, tds_hex, tds_desc in all_tds:
        if tds_path in canonical_set:
            continue
        d = rgb_dist(newskit_hex, tds_hex)
        if d <= MAX_DIST:
            sim = desc_jaccard(nk_words, tds_desc)
            effective_d = d * (1.0 - sim * DESC_WEIGHT)
            score = 'H' if d <= SCORE_H else 'M' if d <= SCORE_M else 'L'
            candidates.append((effective_d, d, tds_path, score))
    candidates.sort()
    return [{'token': p, 'score': s} for _, _, p, s in candidates[:MAX_RESULTS]]


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    newskit    = load(NEWSKIT_PATH)
    resolved   = load(RESOLVED_PATH)
    tokens_src = load(TOKENS_SRC_PATH)
    current    = load(CURRENT_PATH)

    foundations      = build_foundations_map(newskit)
    themes           = current['metadata']['themes']
    tds_descriptions = build_tds_descriptions(tokens_src)

    # Existing canonical map: newskitToken -> list[{token, score, resolvedByTheme}]
    existing_canonical = {
        row['newskitToken']: row['matches']['canonical']
        for row in current['rows']
    }

    # Collect all semantic colour tokens from Light/Light
    all_newskit = collect_semantic_tokens(newskit, foundations)

    # All DS tokens for matching (core/light), with descriptions
    all_tds = flatten_tds_tokens(resolved, tds_descriptions)

    rows = []

    for group in GROUP_ORDER:
        if group == 'foundations':
            # Preserve foundations rows from current JSON (legacy group)
            found_rows = [r for r in current['rows'] if r['group'].lower() == 'foundations']
            for row in found_rows:
                canonical     = row['matches']['canonical']
                canonical_set = {m['token'] for m in canonical if m.get('token')}
                # Get legacy hex from foundations map for synthetic matching
                token_key = row['newskitToken'].replace('Foundations.', '')
                newskit_hex = foundations.get(token_key)
                newskit_desc = row.get('description', '')
                synthetic_raw = compute_synthetic(newskit_hex, newskit_desc, all_tds, canonical_set)
                rows.append({
                    'group':        'foundations',
                    'newskitToken': row['newskitToken'],
                    'description':  row['description'],
                    'matches': {
                        'canonical': canonical,
                        'synthetic': [
                            {
                                'token':           m['token'],
                                'score':           m['score'],
                                'resolvedByTheme': build_resolved_matrix(m['token'], resolved, themes),
                            }
                            for m in synthetic_raw
                        ],
                    },
                })
            continue

        # Semantic group — build from all_newskit
        group_tokens = [
            (path, data)
            for path, data in all_newskit.items()
            if data['group'] == group
        ]
        # Preserve original token order from the JSON walk

        for token_path, token_data in group_tokens:
            canonical     = existing_canonical.get(token_path, [])
            canonical_set = {m['token'] for m in canonical if m.get('token')}
            newskit_hex   = token_data['hex']
            newskit_desc  = token_data['description']
            synthetic_raw = compute_synthetic(newskit_hex, newskit_desc, all_tds, canonical_set)

            canonical_full = []
            for m in canonical:
                canonical_full.append({
                    'token':           m['token'],
                    'score':           m['score'],
                    'resolvedByTheme': (
                        build_resolved_matrix(m['token'], resolved, themes)
                        if m.get('token') else {}
                    ),
                })

            synthetic_full = [
                {
                    'token':           m['token'],
                    'score':           m['score'],
                    'resolvedByTheme': build_resolved_matrix(m['token'], resolved, themes),
                }
                for m in synthetic_raw
            ]

            rows.append({
                'group':        group,
                'newskitToken': token_path,
                'description':  token_data['description'],
                'matches': {
                    'canonical': canonical_full,
                    'synthetic': synthetic_full,
                },
            })

    payload = {
        'metadata': {
            'generatedAt': datetime.now(timezone.utc).isoformat(),
            'source': {
                'mappingMarkdown': 'packages/tokens/docs/archive/strategy-and-bridge-logic.md',
                'tokens':          'packages/tokens/src/tokens.json',
            },
            'defaultTheme': 'core',
            'themes':       themes,
            'rowCount':     len(rows),
        },
        'rows': rows,
    }

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2)
        f.write('\n')

    # Summary
    print(f'✓ Generated {OUTPUT_PATH}')
    print(f'  Total rows: {len(rows)}')
    counts = defaultdict(int)
    for r in rows:
        counts[r['group']] += 1
    for g in GROUP_ORDER:
        print(f'  {g:12s}: {counts[g]:3d} rows')

    # Spot-check: how many rows have no canonical
    orphans = sum(1 for r in rows if not r['matches']['canonical'])
    print(f'\n  Rows with no canonical yet: {orphans}')
    print(f'  Rows with canonical:        {len(rows) - orphans}')

    # Spot-check: how many rows have synthetic
    with_synth = sum(1 for r in rows if r['matches']['synthetic'])
    print(f'  Rows with synthetic match:  {with_synth}')


if __name__ == '__main__':
    main()
