# Design Token Framework - Reference Modules

**Location**: `packages/tokens/docs/reference-modules/`

This folder contains focused, focused documentation modules for understanding the Design System token architecture. Each module addresses a specific aspect of the design token system and is optimized for agent context window efficiency.

## Quick Navigation

| Module                                                             | Focus                                               | For Role                  | Time   |
| ------------------------------------------------------------------ | --------------------------------------------------- | ------------------------- | ------ |
| [01-token-naming.md](01-token-naming.md)                           | Token naming conventions, structure, attributes     | Architect, Code Agent     | 5 min  |
| [02-elevation-system.md](02-elevation-system.md)                   | Z-index levels, shadows, surface tokens, dark mode  | Code Agent, Testing Agent | 8 min  |
| [03-spacing-tokens.md](03-spacing-tokens.md)                       | Fluid vs static spacing, viewport multipliers       | Code Agent                | 5 min  |
| [04-typography-system.md](04-typography-system.md)                 | Font sizing, responsive tokens, viewport scales     | Code Agent, Testing Agent | 8 min  |
| [05-color-ramps.md](05-color-ramps.md)                             | Color generation, WCAG accessibility, modifiers     | Code Agent, Testing Agent | 7 min  |
| [06-token-studio-architecture.md](06-token-studio-architecture.md) | Token Studio `$themes`, collections, mode switching | Architect, Plugin Dev     | 10 min |

**Total reading time for complete system**: ~43 minutes

---

## When to Use Each Module

### Architect Agent

- Read: **01-token-naming.md** (understand naming structure)
- Read: **05-color-ramps.md** (if planning color-related changes)
- Read: **06-token-studio-architecture.md** (if working with themes/collections)
- Reference: All modules when planning cross-system changes

### Code Agent

- **Required baseline**: 01-token-naming.md, 02-elevation-system.md
- **If modifying colors**: 05-color-ramps.md
- **If modifying typography**: 04-typography-system.md
- **If modifying spacing**: 03-spacing-tokens.md

### Testing Agent

- **Required baseline**: All modules (10-minute skim for overview)
- **Deep dive for failures**: Specific module based on error type
  - Naming issues → 01-token-naming.md
  - Elevation/z-index → 02-elevation-system.md
  - Spacing scaling → 03-spacing-tokens.md
  - Font size validation → 04-typography-system.md
  - Color contrast → 05-color-ramps.md

---

## Relationship to Original Document

The original `design-token-framework.md` (1,960 lines) has been split into these 5 focused modules. For the full design token framework context, see the root documentation at `packages/tokens/`.

**Semantic tokens reference**: See [../reference/semantic-tokens.md](../reference/semantic-tokens.md)

---

## Why This Structure?

### Token Window Optimization

The original monolithic document (~80KB) consumed significant context window:

- Per-agent reading: ~20KB per session
- Multiple reads: 40-60KB cumulative
- 10 agent sessions: ~200KB+ per project

**With modular approach:**

- Architect reads 01 + 05 if needed: ~15KB
- Code Agent reads 01 + module for task: ~12KB per session
- Testing Agent reads all on first session: ~35KB (one-time)
- Subsequent sessions: 5-8KB focused reads

**Savings**: ~65% reduction in average context window per session

### Searchability

Agents can now:

- Search for "elevation" in one focused file
- Search for "responsive tokens" in typography file
- Find color modifier logic without scanning 1,960 lines

### Maintenance

Changes to one system (e.g., new spacing scale) require:

- Before: Re-read 1,960 lines to find updates
- After: Update 03-spacing-tokens.md, agents re-read 200 lines

---

## Related Documentation

- **Semantic Token Reference**: [../reference/semantic-tokens.md](../reference/semantic-tokens.md)
- **Semantic Color Mappings**: [../semantic-colour.md](../semantic-colour.md)

---

## Questions?

Consult the appropriate reference module or ask in agent briefs. Each brief now includes links to relevant modules for context-efficient learning.
