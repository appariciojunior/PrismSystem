---
name: figma-use
description: '**MANDATORY prerequisite** — load this skill BEFORE every `figma_execute` (Console MCP) or `use_figma` (Desktop Bridge MCP) call. Skipping causes common, hard-to-debug failures. Trigger whenever the task involves write actions or programmatic reads in the Figma file context: create/edit/delete nodes, set up variables or tokens, build components and variants, modify auto-layout or fills, bind variables to properties, or inspect file structure programmatically.'
license: MIT
metadata:
  category: figma-integration
  agents: [Figma Executor, React Expert, Code]
  autonomy: autonomous
  portable: true
  source: 'https://github.com/figma/mcp-server-guide/tree/main/skills/figma-use'
---

# figma-use — Figma Plugin API Skill

Use `figma_execute` (Figma Console MCP) or `use_figma` (Figma Desktop Bridge MCP) to execute JavaScript in Figma files via the Plugin API. All detailed reference docs live in `references/`.

**Design System note:** This repo uses the **Figma Console MCP** (`figma_execute`) as the primary execution tool. The Figma Desktop Bridge MCP (`use_figma`) is a fallback when Console MCP is unavailable. All API patterns below apply to both tools identically — only the tool name differs.

**If the task involves building or updating a full page, screen, or multi-section layout**, also load `figma-integration/figma-make-workflow.md`. Both skills work together: this one covers the Plugin API rules; that one covers the screen-building workflow.

Before writing any Plugin API code, load [references/plugin-api-standalone.index.md](references/plugin-api-standalone.index.md) to understand what is possible. For exact type signatures, grep [references/plugin-api-standalone.d.ts](references/plugin-api-standalone.d.ts) for relevant symbols — never load it all at once.

**Always start with** [references/working-with-design-systems/wwds.md](references/working-with-design-systems/wwds.md) when working with design systems: understanding components, variables, text styles, and effect styles.

---

## 1. Critical Rules

1. **Use `return` to send data back.** The return value is JSON-serialized automatically. Do NOT call `figma.closePlugin()` or wrap code in an async IIFE.
2. **Write plain JavaScript with top-level `await` and `return`.** Code is automatically wrapped in an async context. Do NOT wrap in `(async () => { ... })()`.
3. **`figma.notify()` throws "not implemented"** — never use it.
4. **`getPluginData()` / `setPluginData()` are not supported** — use `getSharedPluginData()` / `setSharedPluginData()` instead, or track node IDs by returning them.
5. **Work incrementally in small steps.** Break large operations into multiple calls. Validate after each step. This is the most important practice for avoiding bugs.
6. Colors are **0–1 range** (not 0–255): `{r: 1, g: 0, b: 0}` = red.
7. Fills/strokes are **read-only arrays** — clone, modify, reassign.
8. Font **MUST** be loaded before any text operation: `await figma.loadFontAsync({family, style})`.
9. **Pages load incrementally** — use `await figma.setCurrentPageAsync(page)` to switch pages and load their content.
10. `setBoundVariableForPaint` returns a **NEW** paint — must capture and reassign.
11. `createVariable` accepts collection **object or ID string** (object preferred).
12. **`layoutSizingHorizontal/Vertical = 'FILL'` MUST be set AFTER `parent.appendChild(child)`** — setting before append throws. Same applies to `'HUG'` on non-auto-layout nodes.
13. **Position new top-level nodes away from (0,0).** Scan `figma.currentPage.children` to find a clear position to the right of the rightmost node. Only applies to page-level nodes — nested nodes are positioned by their parent.
14. **On error, STOP. Do NOT immediately retry.** Failed scripts are atomic — no changes are made. Read the error carefully, fix the script, then retry.
15. **MUST `return` ALL created/mutated node IDs.** Collect every affected node ID and return them: `return { createdNodeIds: [...], mutatedNodeIds: [...] }`.
16. **Always set `variable.scopes` explicitly.** The default `ALL_SCOPES` pollutes every property picker. Use specific scopes: `["FRAME_FILL", "SHAPE_FILL"]` for backgrounds, `["TEXT_FILL"]` for text colors, `["GAP"]` for spacing.
17. **`await` every Promise.** Never leave a Promise unawaited — unawaited async calls cause silent failures and race conditions.

> For detailed WRONG/CORRECT examples of each rule, see [references/gotchas.md](references/gotchas.md).

---

## 2. Page Rules (Critical)

**Page context resets between calls** — `figma.currentPage` starts on the first page each time.

### Switching pages

Use `await figma.setCurrentPageAsync(page)` to switch pages and load content. The sync setter `figma.currentPage = page` **throws** in `use_figma`/`figma_execute` runtimes.

```js
// Switch to a specific page
const targetPage = figma.root.children.find((p) => p.name === 'My Page');
await figma.setCurrentPageAsync(targetPage);
// targetPage.children is now populated

// Iterate over all pages
for (const page of figma.root.children) {
  await figma.setCurrentPageAsync(page);
  // page.children is now loaded
}
```

### Across script runs

`figma.currentPage` resets to the **first page** at the start of each call. If your workflow spans multiple calls and targets a non-default page, call `await figma.setCurrentPageAsync(page)` at the start of each invocation.

---

## 3. `return` Is Your Output Channel

The agent sees **ONLY** the value you `return`. Everything else is invisible.

- **Returning IDs (CRITICAL)**: Every script that creates or mutates canvas nodes **MUST** return all affected node IDs.
- **Progress reporting**: `return { createdNodeIds: [...], count: 5, errors: [] }`
- `console.log()` output is **never** returned to the agent.
- Always return actionable data (IDs, counts, status) so subsequent calls can reference created objects.

---

## 4. Editor Mode

Scripts work in **design mode** (editorType `"figma"`, the default). FigJam (`"figjam"`) has a different set of available node types.

**Available in design mode:** Rectangle, Frame, Component, Text, Ellipse, Star, Line, Vector, Polygon, BooleanOperation, Slice, Page, Section, TextPath.
**Blocked in design mode:** Sticky, Connector, ShapeWithText, CodeBlock, Slide, SlideRow, Webpage.

---

## 5. Incremental Workflow (How to Avoid Bugs)

The most common cause of bugs is trying to do too much in a single call. **Work in small steps and validate after each one.**

### The pattern

1. **Inspect first.** Run a read-only script to discover what already exists — pages, components, variables, naming conventions.
2. **Do one thing per call.** Create variables in one call, components in the next, compose layouts in another.
3. **Return IDs from every call.** Always `return` created node IDs, variable IDs, collection IDs.
4. **Validate after each step.** Use `get_metadata` to verify structure; use `get_screenshot` after major milestones.
5. **Fix before moving on.** If validation reveals a problem, fix it before proceeding.

### Suggested step order for complex tasks

```
Step 1: Inspect file — discover pages, components, variables, conventions
Step 2: Create tokens/variables (if needed) → validate with get_metadata
Step 3: Create individual components → validate with get_metadata + get_screenshot
Step 4: Compose layouts from component instances → validate with get_screenshot
Step 5: Final verification
```

### What to validate at each step

| After...            | Check with `get_metadata`                            | Check with `get_screenshot`                   |
| ------------------- | ---------------------------------------------------- | --------------------------------------------- |
| Creating variables  | Collection count, variable count, mode names         | —                                             |
| Creating components | Child count, variant names, property definitions     | Variants visible, grid readable               |
| Binding variables   | Node properties reflect bindings                     | Colors/tokens resolved correctly              |
| Composing layouts   | Instance nodes have mainComponent, hierarchy correct | No cropped text, no overlaps, correct spacing |

---

## 6. Error Recovery & Self-Correction

**Scripts are atomic — failed scripts do not execute.** File remains unchanged on error.

### When a script returns an error

1. **STOP.** Do not immediately fix and retry.
2. **Read the error message carefully.**
3. **If unclear**, call `get_metadata` or `get_screenshot` to understand file state.
4. **Fix the script** based on the error.
5. **Retry** the corrected script.

### Common self-correction patterns

| Error                                          | Likely cause                        | Fix                                                |
| ---------------------------------------------- | ----------------------------------- | -------------------------------------------------- |
| `"not implemented"`                            | Used `figma.notify()`               | Remove it — use `return`                           |
| `"node must be an auto-layout frame..."`       | Set `FILL`/`HUG` before appending   | Move `appendChild` before `layoutSizingX = 'FILL'` |
| `"Setting figma.currentPage is not supported"` | Used sync page setter               | Use `await figma.setCurrentPageAsync(page)`        |
| Property value out of range                    | Color channel > 1                   | Divide by 255                                      |
| `"Cannot read properties of null"`             | Node doesn't exist                  | Check page context, verify ID                      |
| `"The node with id X does not exist"`          | Parent instance implicitly detached | Re-discover by traversal from a stable frame       |

> For the full validation workflow, see [references/validation-and-recovery.md](references/validation-and-recovery.md).

---

## 7. Pre-Flight Checklist

Before submitting ANY script call, verify:

- [ ] Code uses `return` to send data back (NOT `figma.closePlugin()`)
- [ ] Code is NOT wrapped in an async IIFE
- [ ] `return` value includes structured data with actionable info (IDs, counts)
- [ ] NO usage of `figma.notify()` anywhere
- [ ] NO usage of `console.log()` as output (use `return` instead)
- [ ] All colors use 0–1 range (not 0–255)
- [ ] Fills/strokes are reassigned as new arrays (not mutated in place)
- [ ] Page switches use `await figma.setCurrentPageAsync(page)` (sync setter throws)
- [ ] `layoutSizingVertical/Horizontal = 'FILL'` is set AFTER `parent.appendChild(child)`
- [ ] `loadFontAsync()` called BEFORE any text property changes
- [ ] `lineHeight`/`letterSpacing` use `{unit, value}` format (not bare numbers)
- [ ] `resize()` is called BEFORE setting sizing modes (resize resets them to FIXED)
- [ ] New top-level nodes are positioned away from (0,0)
- [ ] ALL created/mutated node IDs are collected and included in the `return` value
- [ ] Every async call is `await`ed — no fire-and-forget Promises

---

## 8. Discover Conventions Before Creating

**Always inspect the Figma file before creating anything.** Different files use different naming conventions, variable structures, and component patterns. Match what's already there.

### Quick inspection scripts

**List all pages and top-level nodes:**

```js
const pages = figma.root.children.map(
  (p) => `${p.name} id=${p.id} children=${p.children.length}`
);
return pages.join('\n');
```

**List existing components across all pages:**

```js
const results = [];
for (const page of figma.root.children) {
  await figma.setCurrentPageAsync(page);
  page.findAll((n) => {
    if (n.type === 'COMPONENT' || n.type === 'COMPONENT_SET')
      results.push(`[${page.name}] ${n.name} (${n.type}) id=${n.id}`);
    return false;
  });
}
return results.join('\n');
```

**List existing variable collections:**

```js
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const results = collections.map((c) => ({
  name: c.name,
  id: c.id,
  varCount: c.variableIds.length,
  modes: c.modes.map((m) => m.name)
}));
return results;
```

---

## 9. Design System Context

When working with Design System tokens in Figma:

- **Token architecture**: Foundation → Palette → Semantic (3-layer).
- **Dark mode neutrals are reversed**: `neutral.50` = white in light mode, black in dark mode. Verify with `hex_lookup` MCP tool before setting variable values.
- **Variable naming follows token paths**: `semantic/color/background/default` maps to the Figma variable `color/background/default` (collection prefix stripped).
- **Use Token MCP** (`search_tokens`, `token_lookup`, `dependency_graph`) for intent-first discovery before writing variables.
- **Scopes match token categories**: color tokens → `["FRAME_FILL","SHAPE_FILL"]` / `["TEXT_FILL"]` / `["STROKE_COLOR"]`; spacing tokens → `["GAP"]` / `["WIDTH_HEIGHT"]`; radius tokens → `["CORNER_RADIUS"]`.
- **Code syntax**: set `WEB` code syntax to the CSS variable name from tokens (e.g. `var(--color-bg-default)`).

---

## 10. Reference Docs

Load these as needed based on what your task involves:

| Doc                                                                                                       | When to load                        | What it covers                                                                             |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------ |
| [gotchas.md](references/gotchas.md)                                                                       | Before any script                   | Every known pitfall with WRONG/CORRECT code examples                                       |
| [common-patterns.md](references/common-patterns.md)                                                       | Need working code examples          | Script scaffolds: shapes, text, auto-layout, variables, components, multi-step workflows   |
| [plugin-api-patterns.md](references/plugin-api-patterns.md)                                               | Creating/editing nodes              | Fills, strokes, Auto Layout, effects, grouping, cloning, styles                            |
| [api-reference.md](references/api-reference.md)                                                           | Need exact API surface              | Node creation, variables API, core properties, what works and what doesn't                 |
| [validation-and-recovery.md](references/validation-and-recovery.md)                                       | Multi-step writes or error recovery | `get_metadata` vs `get_screenshot` workflow, mandatory error recovery steps                |
| [component-patterns.md](references/component-patterns.md)                                                 | Creating components/variants        | combineAsVariants, component properties, INSTANCE_SWAP, variant layout, metadata traversal |
| [variable-patterns.md](references/variable-patterns.md)                                                   | Creating/binding variables          | Collections, modes, scopes, aliasing, binding patterns, discovering existing variables     |
| [text-style-patterns.md](references/text-style-patterns.md)                                               | Creating/applying text styles       | Type ramps, font probing, listing styles, applying styles to nodes                         |
| [effect-style-patterns.md](references/effect-style-patterns.md)                                           | Creating/applying effect styles     | Drop shadows, listing styles, applying styles to nodes                                     |
| [working-with-design-systems/wwds.md](references/working-with-design-systems/wwds.md)                     | Working with design systems         | Key concepts, processes, and guidelines for design systems in Figma                        |
| [working-with-design-systems/wwds-variables.md](references/working-with-design-systems/wwds-variables.md) | Design system variable context      | Aliasing strategy, mode decisions, code syntax philosophy, grouping conventions            |

---

## 11. Snippet Examples

Snippets throughout the reference docs contain useful Plugin API code. Use them as-is or as starter code. If a pattern recurs and isn't yet documented, write it to disk as a new reference snippet for future reuse.
