---
name: design-dna
description: The single source of truth for who the Design System is, how your brand designs, and what we consider good design. Acts both as a standalone prototyping companion (call it when starting any quick design or first iteration) and as an always-on preamble (other design skills compose with this skill to anchor their outputs in your brand's voice and principles). Load this before reaching for anything else.
license: MIT
metadata:
  category: design/foundation
  pillar: foundation
  agents: [Designer, Design Engineer, PM, Content, Architect, Code]
  autonomy: autonomous
  portable: true
  cadence: always
  composition_mode: preamble_or_standalone
---

# Design DNA

## Purpose

When you start any design work, you start by asking what fits your brand. This skill is the answer. It is the shortest path to "what would our brand do here", written so a designer, a PM, an engineer, or an AI assistant can read it once and be properly oriented.

This file ships with example content written for a serious, content-led product. Treat it as a template: replace the identity, channels and tone below with your own. A design system anchored in a real, specific identity produces far better work than one anchored in generic-AI aesthetics.

There are two ways to use this skill:

1. **Standalone.** Call it before you start a prototype or a new design. The output is the brief version of who we are, our channels, our principles, our anti-patterns. Read it once per work session and you are calibrated.
2. **Preamble.** Other design skills load this skill's TL;DR section as context. When you run `ui/design-critique` or `handoff/frame-to-spec`, the output is automatically grounded in this DNA rather than in generic design advice.

If you ever feel the system has given you a generic-looking answer, ask for this skill to be re-loaded. It is the cure.

## Preconditions

None. This skill is foundational. It reads from the repo, it does not depend on Figma, on tokens, or on any other skill. It is always available.

## Inputs

Optional:

* `mode` — `tldr` (default for preamble) | `full` (default for standalone). The TL;DR is the bullet-pointed essentials; full is the long form below.
* `lens` — `brand` | `channels` | `tokens` | `motion` | `voice` | `anti-patterns` | `all`. Default `all`. Narrows the response to a single area.

## Procedure

When called standalone with no lens, return the full document below (everything from "Who we are" to "Quick-start patterns"). When called as preamble, return only the TL;DR section. When called with a lens, return only the relevant section plus the TL;DR for context.

---

## TL;DR (the always-on preamble)

**Who we are.** Design System (DS) is a white-label design system starter. Fill this in with your own brand: its personality, its tone, what it stands for. The example identity is a content-led, serious and quietly confident product. Keep it specific.

**Thirteen channels.** `home`, `uk`, `world`, `money`, `comment`, `business`, `sport`, `travel`, `puzzle`, `culture`, `obituaries`, `ireland`, `lifeAndStyle`. Each channel has its own colour, set at the section level, flowing into channel-aware semantic tokens. Components never reach for channel colour directly. (Naming note: the foundation key is `puzzle`, the semantic theme set is named `puzzles`.) These channel keys are token identifiers; rename them in `tokens.json` first if your brand's content sections differ.

**Three token layers.** Foundation (primitives, raw values) → Palette (named scales) → Semantic (usage). Components only ever consume Semantic. Foundation and Palette are off-limits to components.

**Themes are 1:1.** Semantic tokens are structurally identical across light and dark. The only allowed exception is `.channel.` tokens, where documented value divergence is part of the design.

**Voice.** British English. Plain English. Active voice. Short sentences. Never `—` (em dash). Never `DS` by default; use `Design System` in full.

**Brand marks.** The real logos live in `brand-logos/` at the repo root (`foundation/brand-assets`). Every generated screen, prototype and conversion uses those files; the wordmark is never retyped as styled text, the logo never redrawn.

**Off-brand.** Purple gradients on white. Generic sans-serif at every size. Bouncy spring animations. AI-generated stock illustrations. Emoji in product surfaces. Anything that could be mistaken for any other product.

**Quick-start motion (provisional, until motion tokens land).** Hover: `instant + linear`. Modal open: `slow + ease-out`. Page transition: `slower + emphasised`. Disabled by default for `prefers-reduced-motion: reduce`.

---

## Who we are

This is the identity section. The shipped example is a serious, content-led product with a long-form editorial heritage: clear, accurate, occasionally dry, never showing off. Replace it with your own brand story, then keep the rest of this file aligned to it.

The brand voice is not chatty. It is not corporate. It is closer to a well-edited article: clear, accurate, occasionally dry, never showing off. Headlines are written, never algorithmically assembled. Body text earns its place. Whitespace is editorial, not decorative.

What this means for design:

* Clarity beats novelty. If a designer-friendly pattern conflicts with reader comprehension, comprehension wins.
* Hierarchy is the most important visual decision. Multiple display sizes in one frame is a sign of a confused hierarchy.
* Channels are personality, not decoration. A `comment` section is darker, weightier, more confident in opinion than `home`. A `puzzle` section is more playful, brighter, more interactive. The colours encode the tone, they are not arbitrary.
* Trust is the product. Anything that makes the page feel "less real" (decorative animation, fake personalisation, faux-rich interactions) erodes the product.

## The thirteen channels

Each channel has a foundation colour (in `tokens.json` under `product.channel.<name>`), a set of palette ramps (`light/ channels/ ramp/ <name>` and the dark equivalent), and a set of channel-aware semantic tokens (paths containing `.channel.`).

| Channel | Foundation colour | Tone | Common surfaces |
|---|---|---|---|
| `home` | `#135DCB` | The default brand tone. Authoritative, broad, calm. | Homepage, top stories, header. |
| `uk` | `#407196` | Domestic news. Matter-of-fact, close to home. | Politics, society, regional reporting. |
| `world` | `#00787C` | Global, considered, slightly more serious than home. | International news, foreign affairs. |
| `money` | `#58A385` | Practical, advisory, grown-up. | Personal finance, markets, business advice. |
| `comment` | `#9B1F45` | Opinionated, weighty, confident. | Op-ed, leaders, columns. |
| `business` | `#21709C` | Sharp, transactional, professional. | Business news, markets. |
| `sport` | `#007A3F` | Energetic but restrained. Not stadium-loud. | Match reports, columns, fixtures. |
| `travel` | `#2c79ad` | Aspirational, beautiful, considered. | Destinations, advice, guides. |
| `puzzle` | `#DF7334` | Playful, interactive, warm. | Crosswords, sudoku, games. |
| `culture` | `#942364` | Cultured, reflective, opinionated. | Arts, books, theatre, film. |
| `obituaries` | `#6c6c69` | Quiet, respectful, formal. | Obituaries section only. |
| `ireland` | `#0f3d38` | Regional identity, distinct header, otherwise close to home. | Regional edition. |
| `lifeAndStyle` | `#149FB5` | Lighter, personal, service-led without being frivolous. | Fashion, food, health, relationships, property. |

Naming note: the foundation colour key for puzzles is `product.channel.puzzle` (singular); the semantic theme sets are named `puzzles` (`light/ puzzles`, `dark/ puzzles`). Both refer to the same channel.

Setting a channel is a section-level decision, never a component-level one. A button does not say "I am a comment button". A button in a comment section gets channel-aware colour because the section sets the channel.

Cross-channel mixing (a `sport` header with a `comment` accent) is an error, not a creative choice.

## How the tokens work

```text
Foundation                  Palette                      Semantic
(primitives)               (named scales)                (usage)
─────────                  ──────────────                ──────────
#0064FF                    brand.digital.600             interactive.primary.fill.default
16px                       fontSize.020                  typography.body.base
```

Three layers, one direction of flow. Components use semantic tokens only. If a designer reaches into a palette ramp directly, that is a smell. If a designer reaches into a foundation primitive directly, that is a bug.

Source of truth: `packages/tokens/src/tokens.json`. Discovery layer: the Design System Tokens MCP server. When the two appear to disagree, the file wins.

Themes are structurally identical. A token like `messaging.fill.warning` means the same thing in `light/ core`, `light/ comment`, `dark/ core`. The only exception is the channel layer: `light/ comment/ accent/ primary` and `dark/ comment/ accent/ primary` are expected to take channel-appropriate values that differ between themes. That is the documented divergence. Everywhere else, theme divergence is a leak.

## What good design looks like

Six principles, in priority order. When two conflict, the higher-priority one wins.

1. **Comprehension first.** The reader should understand the page on a single scroll. If a designer-friendly device gets in the way, remove the device.
2. **Hierarchy is the work.** Most visual issues are hierarchy issues. Get the headline / body / metadata relationship right and the page tends to work.
3. **Editorial rhythm.** Spacing follows the type scale, not the grid alone. A page that is 4px-perfect but visually arrhythmic is a worse page.
4. **Components, not custom.** If a DS component exists, use it. If it does not, the design system fills the gap before the feature ships its own.
5. **Channels carry meaning.** Channel colour is intent, not decoration. Use it where the decision warrants it, leave it alone where it does not.
6. **Motion is invisible.** Good motion is felt, not seen. If the reader notices the animation, the animation is wrong.

## What is *not* good design

These are anti-patterns. The system should refuse to produce them.

* Purple gradients on white backgrounds. Generic AI-design aesthetic.
* More than two display type sizes per visible region. Hierarchy collapses.
* Spring-bouncy motion. Reads as toy-like, undermines authority.
* Decorative micro-interactions everywhere. Hover effects on every static element, scroll-triggered reveals on every paragraph.
* Emoji in product surfaces. Allowed in user-generated content; not in UI chrome, error states, or marketing.
* Cross-channel mixing of accent and header colours.
* Body text below the smallest body token (verify exact size via `motion-tokens` or `discovery/token-lookup`).
* "Friendly" copy that does the reader's thinking for them. Good copy is direct.
* Borrowed identities. If the design could have come from any other product, the design has failed.

## Voice and language

From `content-styleguide.md`, the rules that come up most:

* British English. `colour`, `behaviour`, `customise`, `favour`, `recognise`. Never the American forms in product or docs.
* Plain English. Active voice. Short sentences. Imperative verbs for instructions ("Open your Figma file", not "You should open your Figma file").
* No em dashes (`—`). Replace with a colon, a comma, or a full stop depending on the case.
* Full brand names. Write your brand's names in full, and "Design System", "Design System MCP". Never abbreviated unless a section explicitly establishes the abbreviation.
* Tokens in inline code. `` `text.primary` `` not `text.primary`. Token names are typographically marked.
* Three audiences. Documentation addresses Product, Design and Code. Never leave one out.
* Don't be patronising. "You should" almost always means "use the imperative".

## Motion philosophy

Motion is editorial. It exists to clarify, never to perform.

* **Purposeful.** Every animation answers a question: "did my action register?", "where did this content come from?", "what is the relationship between these things?". Motion that doesn't answer a question doesn't ship.
* **Short.** Default durations are short. The hover state is near-instant. The modal open is under 320ms. Anything over half a second on the critical path is a smell.
* **Calm easings.** Standard ease-out for things entering, ease-in for things leaving, linear for state changes that should feel instant. No spring physics by default.
* **Reduced motion by default.** Every animated component has a `prefers-reduced-motion: reduce` fallback. The fallback is usually opacity-only or instant.
* **Serious, not entertainment.** We are not a video game, a social app, or a marketing site. We do not have a brand mascot that bounces. We do not have hero scroll reveals on articles.

Specific motion tokens are in `motion/motion-tokens.md`. Specific interaction patterns are in `motion/interaction-patterns.md`. This skill is where the *why* lives.

## Component philosophy

* **Reuse always.** Every primitive (Button, Input, Link, Chip, Label, Icon, Toast, Divider, Text, Flag) is in `@ds/components-react`. Use it. If you need to override, override via prop. If you cannot override via prop, that is a system gap.
* **Composition over invention.** New patterns combine existing primitives. Inventing a new primitive requires governance approval (`governance/token-modification-gates.md`).
* **Variants for state, not for opinion.** A Button has size, intent, state, behaviour. It does not have a `Button.LookFancy` variant. Variants encode functional difference.
* **Channels via tokens, not via props.** A button in a comment section is the same Button component as one in a sport section. The channel colour flows in through tokens.

## Quick-start patterns (the prototyping cheat-sheet)

When you are starting a prototype and want to be productive in the next 15 minutes, these are the defaults to reach for.

**Surface.** Use `light/ core/ surface/ primary` for page background. Use `light/ core/ surface/ secondary` for cards.

**Text.** Headlines: `typography.heading.<size>`. Body: `typography.body.base`. Metadata, bylines, timestamps: `typography.utility.<role>`.

**Spacing.** Stick to the 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 scale. Avoid 6, 10, 14, 18, 22. If your design needs an off-scale value, your hierarchy probably needs adjusting first.

**Actions.** Primary action: `Button intent="primary"`. Secondary: `intent="secondary"`. Destructive: `intent="danger"`.

**Hover.** Almost-instant fill change. Do not animate width, height, or position on hover.

**Modal / overlay.** Use the standard interaction pattern from `motion/interaction-patterns.md` (`modal-open` + `modal-close`).

**Channel.** Pick one channel and stick with it for the section. If you do not need channel colour, use core tokens and leave the channel system alone.

**Reduced motion.** Wrap any animation in `@media (prefers-reduced-motion: reduce)` and replace it with opacity-only or no animation.

## How other skills use this skill

When a skill in `design/` runs, it should load this skill's TL;DR section before producing its output. That means:

* `ui/design-critique` rates against the principles above, not against generic design advice.
* `handoff/frame-to-spec` writes the spec in the right voice (British English, no em dashes, real token paths).
* `motion/motion-review` enforces the motion philosophy above, not generic web animation guidelines.
* `ui/content-style-check` enforces voice and language rules from this skill.

If you author a new design skill, the first line of its Procedure should reference loading this skill's TL;DR.

## How to push back on this skill

This skill is a snapshot of how we think, not a constitution. It will be wrong about some things over time. When you find a part that is wrong, the path is:

1. Note the disagreement with a specific example.
2. Raise it in the design-systems channel or via a PR to this file.
3. The design-systems leads adjudicate.
4. The file is updated, and every downstream skill is automatically re-grounded.

Do not fork this skill. The whole point is that everyone is reading the same DNA.

## Output Contract

### Standalone mode

Return the full document above, prefixed by:

```markdown
# Design DNA — full

> Loaded: <ISO timestamp>
> Tokens snapshot: <git sha>
> Lens: <lens or "all">
> Skill version: <semver>
```

### Preamble mode

Return only the TL;DR section, prefixed by:

```markdown
> Design DNA preamble (loaded for context). Tokens snapshot: <sha>.
```

### Lensed mode

Return the requested lens section plus the TL;DR for context. Prefixed by:

```markdown
# Design DNA — <lens>

> Loaded: <ISO timestamp>
> Tokens snapshot: <sha>
> Skill version: <semver>
```

## Error Handling

* **`lens` value not recognised.** Return the full document with a note "lens not recognised, returning all".
* **`tokens.json` unreachable.** Return the skill anyway, omit the snapshot sha, note "tokens snapshot unavailable" in provenance.
* **Conflicting source.** If a fact in this skill contradicts a fact in another design skill (e.g. token paths drift), the file at `packages/tokens/src/tokens.json` and `content-styleguide.md` are the higher authorities. This skill is a synthesis of those sources. If they change, this skill is updated.

## Composition

* `compose_after`: none (this is foundational)
* `compose_before`: every skill in `design/`
* `calls`: optionally `discovery/token-lookup` to verify token paths at load time

## Related Skills

This skill is referenced by all other skills in `design/`. It is the only skill that the others *should* compose with by default.

## A note on maintenance

This skill is the most important file in `design/`. If your brand voice changes, channels are added or removed, or design principles evolve, this is the file that changes first. Every other skill follows.
