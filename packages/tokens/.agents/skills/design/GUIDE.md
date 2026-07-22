# Using the Design System design suite

A practical guide: how to drive the design skills, how to prompt, when to use each, how to get good results from screens, and when you actually need Figma.

This is the single how-to for the suite. Prefer recipes over a manual? See `PROMPT-COOKBOOK.md` in this folder for copy-paste prompts by scenario. It now also covers the getting-started walkthrough that used to live in `ONBOARDING.md`, so this is the one doc to read to learn how to use the system. For *what* the system is (the architecture and pillars), read `README.md`. For the brand and principles, read `foundation/design-dna.md`.

---

## Start here (30 seconds)

**The easiest way in — no keywords to remember.** In Claude Code or Copilot, type:

```
/design-start
```

Press enter and you get **clickable options**: a short question about what you want to do, then a couple of follow-ups that narrow it down, and finally "send me your screen / Figma link / folder, or describe the page." You click, you never have to know a skill name. This is the recommended entry for everyone.

**The quick way in — if you already know what you want.** Describe the task after the command:

```
/design critique this checkout screen for spacing and contrast
/design design a new saved-articles experience
/design this comment-section article is ready, get it ready for engineering
/design learn from these screenshots
```

Both go to the same place — the router loads the Design DNA, works out what you are doing, and runs the right skills in the right order. `/design-start` asks you; `/design <task>` reads your sentence. (Typing `/design` on its own also opens the guided wizard.)

If you know exactly which skill or agent you want, you can also call it by name (see the cheat-sheets below).

---

## The mental model

Three layers. You talk to the top; it leans on the bottom.

```
        /design  ← you type this
           │
     ┌─────┴─────┐
   agents      skills          ← the router picks these for you
     │           │
     └─────┬─────┘
       grounding                ← always loaded, never optional
   DNA · rules · tokens · corpus
```

- **The router** (`/design`) classifies your request into one of five routes and composes a sequence.
- **Agents** run a whole flow for you (a critique battery, a handoff packet). **Skills** are the individual steps.
- **Grounding** is always loaded first: the DNA (who your brand is), the 56 rules, the real tokens, and — once you feed it — the screenshot corpus. This is why the output is brand-specific, not generic design advice.

Golden rule of the system: **every judgement traces to a source.** If a critique says "this is wrong", it cites a rule ID and a brand source. No "feels off".

---

## The five routes

| You are… | Route | What runs |
|---|---|---|
| Trying a quick idea | **prototype** | `prototyping-agent` — fast, read-only, low ceremony |
| Checking or fixing a design | **ui-craft** | `design-critique` (scored) + the checks you need |
| Designing something new that doesn't exist yet | **new-experience** | the `ux/` pillar: principles → flow-design → templates |
| Handing a design to engineering | **handoff** | `handoff-flow` → a `PACKET.md` |
| Teaching the system from screenshots | **corpus-distill** | `distill-corpus` |

---

## How to prompt: the three ways in

### 1. The router (recommended default)

```
/design <task>. Channel: <name if it matters>. <light/dark if it matters>.
```

Good router prompts name the **task**, the **channel** if the screen is editorial, and the **artefact** (a Figma link, "the screenshot above", or a description):

```
/design critique the attached article screen. Channel: comment. It's the dark theme.
/design design a live-blog experience for sport. Web first.
/design hand off the events landing page. Figma is my active tab.
```

### 2. An agent (when you know the shape of the job)

Call the agent by name and give it the artefact:

```
Use the critique-agent on the screenshot above. It's a money-section article.
Use the prototyping-agent: what surface and text tokens for a comment callout card?
Use the handoff-agent for the "saved articles" feature. Light: <figma-url>. Dark: <figma-url>.
Use the build-agent to scaffold Banner from the packet in .design/banner/.
```

### 3. A single skill (when you want one specific check)

Name the skill or just describe the narrow task:

```
Run design/ui/a11y-check on this frame.
Check the copy in this screen against the styleguide.   (→ content-style-check)
What's the score on this design?                         (→ design-critique)
Map every value in this frame to tokens.                 (→ token-mapping-audit)
```

---

## When to use which agent

| Agent | Use it when | Writes code? | Speed |
|---|---|---|---|
| **prototyping-agent** | Early exploration, "mock this up", "what token for X", first 30 minutes | No | Fast |
| **critique-agent** | "Is this any good?" — runs the full battery (critique + a11y + content + parity) and gives one report with a score | No | Balanced |
| **handoff-agent** | "This is ready" — produces the complete engineering `PACKET.md` | No | Thorough |
| **build-agent** | Turn an approved packet into a React component (scaffold + Code Connect + visual check) | **Yes, approval-gated** | Careful |

Rule of thumb: **prototyping → critique → handoff → build** is the lifecycle. Most days you live in prototyping and critique.

## Skill cheat-sheet by task

| I want to… | Skill |
|---|---|
| Score a design against the rules | `ui/design-critique` |
| Check accessibility (contrast, targets, focus) | `ui/a11y-check` |
| Check copy and voice | `ui/content-style-check` |
| Check every value maps to a real token | `ui/token-mapping-audit` |
| Confirm channel colour is used correctly | `ui/channel-context` |
| Get the full state grid for a component | `ui/state-matrix` |
| Compare light vs dark | `ui/light-dark-parity` |
| Design a new flow/journey | `ux/flow-design` |
| Find the house way to build a list, paywall, feed | `ux/pattern-library` |
| Lay a new page on the grid | `ux/page-templates` |
| Write button/error/empty-state copy | `ux/microcopy` |
| Turn a frame into an engineering spec | `handoff/frame-to-spec` |
| Look up who your brand is / a principle | `foundation/design-dna` |
| See or promote a rule | `foundation/design-rules` |

---

## Getting better results from screens

The single biggest lever on output quality is the input you give. In order of impact:

**1. Give context with the screen.** A bare image gets a generic read. Tell the system:
- **What it is** — "article page", "checkout step 2 of 3", "empty saved-articles state".
- **The channel** — home, comment, sport, money… (colour and tone depend on it). If it's a utility page, say "core".
- **Light or dark** — parity and contrast checks need to know.
- **What you want** — a full critique, just accessibility, just the copy.

**2. One screen per image, full frame, high resolution.** Crop to the screen, not a detail. If detail matters (a control, a state), send that as a second image and say so. Blurry or partial screens produce hedged findings.

**3. Iterate — the score is meant to move.** The loop that works:

```
/design critique this  →  fix the top findings  →  /design critique this again
```

Each finding cites a rule ID so the fix is unambiguous, and the 0–100 score trends across runs so you can see progress. `ui/monthly-audit` rolls those scores up over time.

**4. Feed the corpus.** This is the compounding one. Drop real product screenshots into `design-corpus/raw/inbox/` and run `distill-corpus`. After that, the skills cite how the brand *actually* designs (real card anatomy, real paywall behaviour) instead of principled assumptions. The more you feed it, the more brand-specific every future critique and flow becomes. Ten to twenty screens per batch; web, iOS and Android all welcome.

**5. Point at prior art for new experiences.** For `new-experience` work, the flow is grounded in Mobbin (600k+ shipped screens) plus your corpus. If Mobbin is connected, say so; if you have a reference, mention it.

---

## Do you need the Figma MCP every time?

**No.** It depends on *what kind* of feedback you want. There are three ways to give the system a screen, and they are good at different things.

| Input | Setup | Best for | The catch |
|---|---|---|---|
| **Paste a screenshot** | None | Visual critique, UX review, accessibility eyeballing, feeding the corpus | The system sees *pixels*, not token names |
| **Figma Desktop MCP** (`localhost:3845`) | Open the file as the active tab, enable the local MCP server | **Token-level accuracy** — is this bound to the right token? channel tokens? legacy drift? | Serves only the **active tab**, one file at a time |
| **claude.ai Figma connector** | Connector auth | Any file the connected account can open | Your work/org files are **not** accessible on the personal-account connector (blocked) |

### The rule of thumb

- **For design quality — layout, hierarchy, spacing rhythm, does-it-look-right, UX flow, copy, rough contrast — a screenshot is enough.** You do not need Figma. Paste and go.

- **For token fidelity — "is this the right token?", "is this using channel tokens?", "is there legacy drift?", light/dark parity by token — you need the Figma MCP**, because only it can read the *actual variable bindings*. A screenshot shows a blue; the Figma MCP shows whether that blue is `interactive.primary.fill` (correct), `product.channel.home` (wrong — channel bound at component level), or `NK-legacy/interactivePrimary030` (legacy drift). You cannot see that in pixels.

This is exactly what happened critiquing the Home page v2: the **screenshot** gave a clean 91 on structure, but pulling the **variable definitions via the desktop MCP** is what exposed the legacy bindings that dropped the real score to the mid-60s. Same screen, two very different findings — the difference was token access.

### Practical guidance

- Doing UX, layout, or a quick "is this good?" → **screenshot, no Figma needed.**
- Doing a real handoff, a token audit, or chasing why colours look off → **make the file your active tab and use the Figma Desktop MCP.**
- Feeding the corpus → **screenshots are ideal** (you want the rendered product, not the file).

To use the Desktop MCP: open the Figma desktop app, make the file the active tab, enable the local MCP server (Preferences → enable local MCP server; it serves on `127.0.0.1:3845`). Then tell me "it's my active tab" and I'll pull the node.

---

## The golden rules (what "correct" means)

These are enforced by the rules and the DNA; know them and your designs pass more often. Full detail in `foundation/design-dna.md`.

- **Channel is a section-level decision, never component-level.** A button in a comment section is the same Button; the channel colour flows through tokens. Never bind `product.channel.*` on a component. Never mix two channels.
- **Semantic tokens only.** Palette-direct is a smell; foundation-direct is a bug; raw hex is a bug; legacy is drift.
- **Design every state**, not the happy path — loading, empty, error, success, edge.
- **Voice:** British English, no em dashes, full brand names ("the brand", never abbreviated), direct not "friendly".
- **Components, not custom.** If a DS component exists, use it. A genuinely new primitive needs governance approval.
- **Motion is invisible.** Short, calm, reduced-motion fallback. No spring, no bounce, no hero scroll theatrics.

---

## Where things go, and quick reference

- **Skill outputs** land in `.design/<feature>/` (CRITIQUE.md, FLOW.md, PACKET.md…). These are working artefacts, regenerable, gitignored. What each file is:
  - `SPEC.md`: the developer spec for a frame.
  - `TOKEN_AUDIT_LIGHT.md` / `_DARK.md`: every value mapped to a token, plus anything unmapped.
  - `STATE_MATRIX.md`: every interactive state of a component, with the token that changes it.
  - `CHANNEL_CONTEXT.md`: channel colour validation.
  - `A11Y_CHECK.md`: accessibility findings.
  - `CRITIQUE.md`, `FLOW.md`, `PACKET.md`: the scored review, a new flow, and the engineering packet.
- **Generated designs and prototypes** live in `sandbox/<project>/<date>-<run>/`, one folder per generation, never overwritten. Each run carries a `MANIFEST.md` (what was asked, what ran, what came out) and its reports in `reports/`. While a run is active, skill reports write there instead of `.design/`. Full convention: `foundation/sandbox-runs.md`.
- **Corpus** lives at `design-corpus/` — raw screenshots (gitignored) and versioned distilled knowledge.

Common prompting mistakes to avoid:

- **No context** — "critique this" with a bare image. Add what it is and the channel.
- **Asking for token accuracy from a screenshot** — for that, use the Figma MCP.
- **Skipping the DNA framing** — you never need to; the router always loads it. But if you call a raw skill directly and get generic output, route through `/design` instead.
- **Treating the score as the goal** — the findings are the work; the number just tracks it.

When unsure: `/design` and describe what you are doing. That is always the right first move.
