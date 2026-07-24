---
name: design-linting
description: Workflow for design quality and accessibility auditing using figma_lint_design (post-creation node-level checks) and figma_audit_design_system (whole-file health scoring via MCP Apps). Run both before any handoff.
license: MIT
metadata:
  category: figma-integration
  agents: [Figma Executor, Code, Testing]
  autonomy: autonomous
  portable: true
---

# Design Linting Workflow

## Purpose

Audit Figma designs for accessibility, token hygiene, and structural quality before handoff. Two complementary tools cover different scopes.

---

## Tool 1: `figma_lint_design` — Node-Level Lint (v1.13.0+)

Checks a specific node (component, frame, or canvas region) against 10 rules. Zero setup — no Desktop Bridge required.

**When to run:** After creating or modifying any component. Required before every Figma Executor handoff.

**What it checks:**

- **Accessibility (WCAG):** Colour contrast ratios, text size minimums, touch target sizing
- **Token hygiene:** Hardcoded fill/stroke values where variables should be used
- **Component integrity:** Detached components (instances broken from their source)
- **Layout quality:** Auto-layout misconfigurations, improper hug/fill settings

**Usage pattern:**

```javascript
figma_lint_design({
  nodeId: '123:456', // Component set or frame to audit
  fileUrl: 'https://figma.com/design/abc123' // omit if already navigated
});
```

**Interpreting results:** Findings include severity (error/warning/info), the affected node ID, and a fix hint. Errors block handoff; warnings are documented in the Execution Report.

**Fix loop:**

1. Run `figma_lint_design` → collect errors
2. For **token hygiene violations** (hardcoded fills/strokes): use `search_tokens` (DS MCP) to find the correct semantic token, then `token_lookup` to confirm its path and value before applying via `figma_execute`
3. Fix all other errors via `figma_execute` or specific write tool
4. Re-run `figma_lint_design` → confirm errors resolved
5. Screenshot for before/after evidence

---

## Tool 2: `figma_audit_design_system` — File-Level Health Scoring (MCP App)

Lighthouse-style scorecard for the whole design system. Requires Local Mode with `ENABLE_MCP_APPS=true`.

**When to run:** During design system audits, before token or component release, or when evaluating quality risk. Use `audit_design_system` (DS MCP) alongside this to cross-check that Figma variable naming and alias depth match the 3-layer architecture (`Foundation → Palette → Semantic`).

**Scoring model (weighted):**

| Category           | Weight | Checks                                                       |
| ------------------ | ------ | ------------------------------------------------------------ |
| Naming & Semantics | 25%    | Semantic variable naming, component naming conventions       |
| Token Architecture | 20%    | Alias usage, depth layering, mode support, descriptions      |
| Component Metadata | 20%    | Descriptions, variant structure, standalone vs. set ratio    |
| Accessibility      | 10%    | Contrast-ready tokens, focus state components                |
| Consistency        | 15%    | Delimiter/casing patterns, scale adherence, mode naming      |
| Coverage           | 10%    | Token type coverage, core component presence, variable count |

**Usage:**

```
"Audit the design system in the current file"
```

The AI calls `figma_audit_design_system` and renders an interactive dashboard inline.

**Enabling MCP Apps (one-time config):**

```json
{
  "env": {
    "FIGMA_ACCESS_TOKEN": "figd_YOUR_TOKEN",
    "ENABLE_MCP_APPS": "true"
  }
}
```

---

## Integration with Executor Workflow

Run both tools as part of the mandatory post-execution gate:

```
1. Execute component changes
2. figma_lint_design({ nodeId }) → fix all errors
3. figma_take_screenshot → capture final state
4. Invoke visual-regression-gate skill
5. If file-level audit is in scope: figma_audit_design_system
```

Add all `figma_lint_design` findings to the Execution Report under **Lint Results**.

---

## Token Browser Companion: `figma_browse_tokens`

Interactive token explorer rendered inline. Useful during creation to verify variable bindings without leaving the AI context.

```
"Browse the design tokens in the current file"
```

Organises collections with expandable sections, mode columns, colour swatches, and click-to-copy values. Local Mode only, requires `ENABLE_MCP_APPS=true`.

---

## References

- `https://docs.figma-console-mcp.southleft.com/mcp-apps`
- `https://docs.figma-console-mcp.southleft.com/tools` (figma_lint_design section)
