---
name: rebrand-system
description: Fork the Design System suite into a new brand or product. Reads a brand's Figma file and an optional moodboard, extracts its colour, type, shape, corner and logo language, and rewrites the grounding layer (DNA, tokens, rules, voice, corpus) so the whole suite re-grounds to the new brand while the machinery stays intact. The "make this system mine" engine.
license: MIT
metadata:
  category: design/rebrand
  pillar: rebrand
  agents: [Designer, Design Engineer, Architect]
  autonomy: requires-approval
  portable: true
  cadence: on-demand
  mcp_tool: design_rebrand
---

# Rebrand System

## Purpose

Turn this design system into a different brand's design system without rebuilding it. The suite is a factory: everything brand-specific lives in a small grounding layer, and the skills, agents and router are brand-agnostic machinery that re-ground themselves off the DNA. This skill reads a new brand from its Figma file and moodboard, then rewrites the grounding so the whole suite starts speaking that brand instead. The machinery does not change.

## The core principle: swap the grounding, keep the machinery

| Changes for the new brand | Stays exactly as it is |
|---|---|
| `foundation/<brand>-design-dna.md` (the keystone) | Every skill in `ui/`, `ux/`, `handoff/`, `motion/`, `corpus/` |
| `packages/tokens/src/tokens.json` (colours, type, spacing, radius) | Every agent (prototyping, critique, handoff, build) |
| `foundation/design-rules.md` (keep universal, drop brand-specific, add new) | The router and the intake flow |
| `content-styleguide.md` (voice and wording) | The critique procedure, the accessibility maths, the corpus engine |
| `design-corpus/` (emptied, then refilled with the new brand's screens) | The output contracts and the `.design/<feature>/` convention |

Because every skill loads the DNA TL;DR as its preamble, swapping the DNA re-grounds all of them at once. You are editing four files and refilling one folder, not rewriting two dozen skills.

## Preconditions

1. The design suite is present in the repo (this is the thing being forked).
2. A Figma file for the new brand, reachable via the Figma desktop MCP (active tab) or an export. This is the primary source of truth for exact colour, type, spacing, radius and components.
3. Vision is available to the running agent (to read the moodboard and any logo or screen images).
4. Optionally, a folder of brand images: logo files, a moodboard, references, or real product screens.

## Inputs

* `figma_url`: the new brand's Figma file or node. The primary source. If absent, the skill runs from the moodboard plus explicit values, and flags that tokens are approximate.
* `moodboard`: optional folder of images (logo, moodboard, references, product screens). Informs the qualitative side: shape, tone, imagery, personality.
* `brand_name`: the new brand or product name.
* `target`: where the forked system is written: a new repo path, or a brand-pack subfolder. Default: a new `brand-pack/<brand_name>/` folder, so nothing is overwritten in place until you approve.
* `dry_run`: when true, produce the plan and the proposed files without writing. Default true. Set false to apply.

## What the skill reads, and where each brand signal lands

This is the map from a brand's raw identity to the files it becomes. It answers "how should the system adapt colours, logos, buttons, shapes and corners".

| Brand signal (from Figma and the moodboard) | Where it lands |
|---|---|
| Colours: primary, secondary, neutrals, semantic (success, warning, danger), surfaces, text | `tokens.json` palette and semantic layers, the DNA colour section, and a colour rule set |
| Logo and wordmark | an asset in `assets/` or `fonts/`, the DNA identity section, and a logo rule (clear space, never recoloured) |
| Type: families, sizes, weights, line heights | `tokens.json` type scale, the DNA type section |
| Corners and radius | a radius scale in `tokens.json`, the DNA shape language, and a corner rule |
| Shape: geometric or organic, border widths, elevation and shadow | `tokens.json` radius, border and elevation tokens, the DNA "what good looks like" section |
| Buttons and controls | the `interactive.*` semantic tokens, the component library (when one exists), and `state-matrix` later |
| Spacing and density | the `tokens.json` spacing scale, the DNA rhythm section |
| Motion and feel | motion tokens, the DNA motion philosophy |
| Imagery and illustration style | the DNA, corpus evidence, and content rules |
| Voice and wording | `content-styleguide.md` and the DNA voice section |

## Procedure

### Step 0: Decide the brand model

Before extracting anything, settle one question, because it shapes everything downstream:

**Component library.** Does the brand already have a real component library and Storybook? If not, the handoff, build, state-matrix and visual-vs-built paths have little to work on yet. Note this, and defer those paths in the pack rather than pretending they are ready.

If it is undecided, stop and ask. Do not guess; it touches too much.

### Step 1: Read the brand from Figma

Use the Figma desktop MCP (active tab preferred). Pull, and record as a raw brand inventory before interpreting anything:

* **Colour** via `get_variable_defs` and `get_design_context`: every colour variable or style, its name and value. Group into primary, secondary, neutrals, semantic, surface and text.
* **Type**: font families, sizes, weights and line heights, assembled into a scale.
* **Spacing, radius and shape**: the spacing scale, the corner radii (this is your "corners"), border widths, shadows and elevation.
* **Components** via `get_libraries` and the component list: what exists (buttons, inputs, cards), and their variants.
* **Logo** via `download_assets` or a screenshot: the mark itself, its colours and its clear space.

Never guess a binding. If the MCP is not connected, say so and fall back to Step 2 plus explicit values, noting that the tokens will be approximate.

### Step 2: Read the moodboard (vision), if given

Look at the images and extract the qualitative identity: shape language (rounded or sharp, geometric or organic), colour temperament (warm or cool, saturated or muted), imagery style (photographic, illustrated, flat), density (airy or packed), and three or four personality words (playful, serious, premium, friendly). Cross-check against the Figma values.

The division of labour: **Figma gives the exact values, the moodboard gives the tone.** Where they conflict, Figma wins for numbers and the moodboard informs judgement. Record any conflict rather than smoothing it over.

### Step 3: Build the token layers

From the inventory, generate `tokens.json` in the three-layer structure the suite expects: foundation (raw primitives) then palette (named scales) then semantic (usage). Map the brand's colours into the existing semantic roles (`surface.primary`, `text.primary`, `interactive.primary.fill`, `messaging.warning`, and so on). Keep the semantic names wherever you can, so skills that reference them keep working; only the values change. Include the radius, border and elevation tokens, since corners and shape are part of the brand. Validate the file as JSON.

### Step 4: Write the DNA (the keystone)

Draft `foundation/<brand>-design-dna.md` in the same structure as `design-dna.md` (the starter DNA), replacing all the content:

* **Who we are**, in the brand's own voice.
* **Token layers**, pointing at the new `tokens.json`.
* **Voice**, the brand's actual voice. Do not carry over the starter's example voice rules. If the brand uses American English, or allows em dashes, or is deliberately chatty, say so here.
* **Anti-patterns**, drawn from the opposite of the moodboard.
* **Shape, corners and motion**, the brand's feel, from the radii and the moodboard.
* **Quick-start patterns**, the brand's default tokens for surface, text, spacing and actions.

Keep the TL;DR section intact, because the whole suite loads it as its preamble.

### Step 5: Rewrite the rules

Take `design-rules.md` and sort every rule into three piles. **Keep** the universal ones: accessibility contrast, hierarchy, token discipline, design every state. **Drop** the starter-specific ones: the brand-name-in-full rule, and "no em dash" unless the new brand also wants it. **Add** new ones from the moodboard and the corpus, for example "corners are always 12px" or "the logo is never recoloured". Keep the `CAT-NN` ID scheme so cited IDs keep resolving; rename the category set to the brand.

### Step 6: Swap the voice styleguide

Replace `content-styleguide.md` with the brand's wording rules: spelling, tone, punctuation and naming. This one matters more than it looks. If you leave the starter styleguide in place, `content-style-check` will actively correct the new brand back into the starter's voice.

### Step 7: Reset and seed the corpus

Empty `design-corpus/distilled` and reset the manifest to a fresh version. Then, if a moodboard or product-screens folder was given, run `corpus/distill-corpus` on it so the brand's real patterns begin informing critiques. The corpus is how the system keeps learning the brand from examples over time, so seed it early.

### Step 8: Prune and re-point the skills

The skills are brand-agnostic, but a few name starter-only concepts. Do not rewrite their procedures; only adjust what they reference:

* `token-mapping-audit`: re-point its legacy-drift definitions (the legacy design system) to the brand's own legacy, or remove that section if the brand has none.
* Everything else re-grounds automatically off the new DNA.

### Step 9: Re-point the router and the intake

Update the router and `/design-start` to load the new DNA and to use the brand's intents. The intents and paths structure stays; only the grounding it loads changes.

### Step 10: Verify the fork

* Grep the forked files for residual starter references: the starter brand names, `NK-*` legacy tokens, `#135DCB`, and the British-English rules. Nothing should remain except what you kept on purpose.
* Run one critique on a brand screen and confirm the findings cite the new rules and the new tokens.
* Run one voice check and confirm it enforces the brand's voice, not the starter's.

Only when these pass is the fork clean.

## Output Contract

```markdown
# Rebrand: <brand_name>

> Source: <figma_url or "moodboard only">
> Moodboard: <n images>
> Mode: <dry-run | applied>

## Brand inventory
- Colour: <n roles mapped>
- Type: <families, scale>
- Radius / shape: <summary>
- Logo: <captured yes/no>
- Components found: <n or "none yet">

## Files written (or proposed)
- [ ] tokens.json
- [ ] foundation/<brand>-design-dna.md
- [ ] foundation/design-rules.md (kept <n>, dropped <n>, added <n>)
- [ ] content-styleguide.md
- [ ] design-corpus reset + seeded (<n screens)

## Deferred
- <paths deferred because no component library yet, etc.>

## Residual-brand check
- <clean | list of leftovers to fix>
```

Followed by the machine-readable summary:

```json
{
  "skill": "design/rebrand/rebrand-system",
  "brand": "<brand_name>",
  "files_written": ["tokens.json", "foundation/<brand>-design-dna.md", "..."],
  "rules": { "kept": 0, "dropped": 0, "added": 0 },
  "corpus_seeded": 0,
  "deferred": ["handoff", "build"],
  "residual_brand": []
}
```

## The brand pack

Frame the output as a swappable **brand pack**: the DNA, the tokens, the rules, the styleguide and the corpus, together. The pack is the only brand-specific part of the system. Keeping it as one named unit is what lets the same machinery run more than one brand later, which is the direction the `portable: true` skills were written for.

## Error Handling

* **No Figma access.** Run from the moodboard plus explicit colour and type input, but mark the tokens approximate (pixels, not bindings) and recommend a Figma pass before shipping the pack.
* **Moodboard conflicts with Figma.** Figma wins for values, the moodboard informs tone. Record the conflict, do not silently average.
* **No component library yet.** Defer the handoff, build, state-matrix and visual-vs-built paths, and note it in the pack rather than pretending they run.
* **Applying over the live suite.** Never overwrite the source suite on a dry run. Write to `brand-pack/<brand>/` first, and only merge in place on an explicit apply.

## Composition

* `compose_after`: none. This bootstraps a new system.
* `compose_before`: the whole design suite, once forked.
* `calls`: the Figma MCP (`get_variable_defs`, `get_design_context`, `get_libraries`, `download_assets`), vision for the moodboard, `python3` for the token and JSON work, and `corpus/distill-corpus` for the corpus seed.

## How to invoke

- "Rebrand the system. My Figma is the active tab, brand name Acme, and here is my moodboard folder."
- "Fork this into a new product from this Figma file. I have no component library yet, so defer handoff and build."
- "Read my brand from Figma and the logo folder, and draft the DNA and tokens only. Dry run, I want to review before you write anything."
