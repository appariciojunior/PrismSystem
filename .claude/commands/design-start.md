---
description: Guided design intake. Pick what you want, then send your design. No keywords to remember.
---

Run the Design System guided design intake. The designer clicks through what they want; never make them type a skill name. This command carries its own flow (below); it does not defer to the router's guided-mode section.

$ARGUMENTS

## What the designer sees (read this first)

Every option you show the designer uses plain, common design language. This is the most important rule of this command.

- Never show system words in the options. No "diverge", "converge", "corpus", "route", "focal path", "skill", "agent", or file paths. Those are for your routing only, never for the designer.
- Never use em dashes anywhere. Use a comma, a colon, or a full stop.
- Keep every label short (two to five words) and every description to one plain sentence.
- British English throughout.

Behind the scenes you still group work into two modes, **diverge** (make or explore options) and **converge** (check and ship), and you still route to the real skills and agents. The designer never needs to know that vocabulary.

## The idea (for you, not the designer)

Each path is a focal contract: load only the skills it names, run only the agent it names, produce one deliverable in `.design/<feature>/`, and leave the rest of the suite alone. This keeps the designer focused and the context small. One principle guides fidelity: exploration is generated fast and rough because most of it gets thrown away; only the direction the designer keeps earns the full build and the review battery.

## Step 1: Load the DNA

Load the TL;DR of `packages/tokens/.agents/skills/design/foundation/design-dna.md`. Do this first, always. Do not load the full DNA or the rules file unless a path needs them.

## Step 2: Sniff before you ask

Look before asking, and drop any question the context already answers:

- Did the designer type a description after `/design-start`? If so, classify it straight to a path and skip to the receipt.
- Is a `.design/<feature>/` folder already present? If so, offer **Resume `<feature>`** as the first option: read its latest artefact and its next-steps, and propose the next move.
- Is an input already attached (a Figma link, a screenshot, a folder)? Note it for Step 7.
- Can you already tell the target surface (web desktop, web mobile, responsive web, or native iOS)? A description that says "on mobile", a base screen that is clearly a phone frame, or a Swift context all answer it. If you can tell, do not ask in Step 6; confirm it in the summary instead.
- Is the Figma desktop MCP live on `127.0.0.1:3845`? Record yes or no now; you need it in Step 7.

## Step 3: First question, what do you want to do (clickable)

Use the clickable question tool (Claude Code: the question tool; Copilot: `vscode_askQuestions`). Show these options, in the designer's language:

- **Resume `<feature>`** (only if Step 2 found a folder). "Pick up where you left off." Add the one concrete next step in plain words.
- **Create or explore a design.** "Try a quick idea, design something new, or build on a screen you already have."
- **Check or hand off a design.** "Get feedback and a score, or package it for engineering."
- **Teach the system, or ask a question.** "Learn from screenshots, or look up the house style or a rule."

(Internal routing: option 2 is the diverge intents, option 3 is the converge intents, option 4 is teach or ask.)

## Step 4: Second question, narrow it (clickable, depends on Step 3)

**If they chose "Create or explore":**

- **Rough idea, fast.** "A quick first pass, nothing saved yet." → `agents/prototyping-agent`
- **Something brand new.** "A page, flow, pattern or copy that does not exist yet." → the `ux/` pillar
- **Build on a screen I have.** "You have a Figma link or screenshot. Add a feature, change part of it, or move it to another section." → generative (Evolve)
- **A few different directions.** "Stuck? Get several different takes, then pick one." → generative fan-out (Versions)

**If they chose "Check or hand off":**

- **Check this design.** "Score it against the rules, or focus on one thing." → the `ui/` pillar
- **Hand it to engineering.** "Turn it into a spec, a full packet, or built code." → `handoff/`

**If they chose "Teach or ask":**

- **Teach from screenshots.** "Show the system how your brand really designs." → `corpus/distill-corpus`
- **Ask a quick question.** "The house style on something, or look up a rule." → a DNA lens or `foundation/design-rules`, no workflow.

## Step 5: Third question, the focus, only when the choice has several paths

Show the focal options in plain language, and map each to its skills and agents behind the scenes.

**Check this design:**

- **Everything (scored review)** → `agents/critique-agent`
- **Accessibility** → `ui/a11y-check`
- **Copy and tone** → `ui/content-style-check`
- **Colour and channel** → `ui/token-mapping-audit` + `ui/channel-context` (best with Figma connected)
- **Light vs dark** → `ui/light-dark-parity`
- **Motion** → `ui/motion-review`
- **Component states** → `ui/state-matrix`
- **Design vs what is built** → `ui/visual-vs-built`

**Something brand new:**

- **A flow or journey** → `ux/experience-principles` + `ux/flow-design`
- **A page layout** → `ux/page-templates`
- **The right pattern** → `ux/pattern-library`
- **UI copy** → `ux/microcopy`
- **An interaction or motion** → `motion/interaction-patterns` + `motion/motion-tokens` + `motion/prototype-spec`

**Build on a screen I have** (the Figma link is the starting point, not just something to inspect):

- **Add a feature** → read the screen + `ux/pattern-library` + `/figma-generate-design`
- **Change something that is there** → read the screen + `/figma-generate-design`
- **Move it to another section or platform** → read the screen + `ui/channel-context` + `/figma-generate-design`

Read the base (Figma desktop MCP active tab if connected, otherwise a screenshot), keep its section colour, grid and components, and build the change from the same tokens.

**The whole screen, not a strip.** The deliverable reproduces the designer's entire base screen at full fidelity, with the change applied in place. Read the complete frame from the Figma connection (structure, bindings, and per-band renders when the design context is too heavy), transcribe the real content, and rebuild all of it bound to the semantic tokens; never substitute the rest of the page with placeholder hints or a compressed context strip. Placeholder blocks are allowed only for photography and adverts, never for structure, copy or chrome. Anything transcribed from a render rather than read from bindings is flagged in the change note. Brand marks come from `brand-logos/` per `foundation/brand-assets`; the wordmark is never retyped as styled text.

Deliverable: the updated full screen, a short note of what changed, and the dev spec page (Step 9).

**Hand it to engineering:**

- **Just the spec** → `handoff/frame-to-spec`
- **The full packet** → `agents/handoff-agent`
- **Build the component in code** → `agents/build-agent` (asks before writing code)

Single-path choices (Rough idea, A few different directions, Teach, Ask, Resume) skip this step.

**A few different directions** (Versions): generate several takes (default six), each from a genuinely different angle: denser and more editorial, image led, calmer and more open, a bolder headline, a mobile-first layout, a different section colour. Keep them rough and quick. Then line them up, and help the designer pick one or mix two together. Only the chosen one gets built properly later.

> Build on a screen and A few different directions are new. They do not have their own skill files yet, so run them inline as described here, grounded in the DNA and the real tokens and components. Everything else routes to a skill or agent that already exists.

## Step 6: Fourth question, where will it live (clickable, only for paths that make a screen)

Any path that generates a full page or a feature (a rough idea, something brand new, building on a screen, a few directions) needs the target surface before anything is drawn. The grid, the patterns, the components and the token set all change with it, so this is a question the designer must answer, not one you guess. Skip it only when Step 2 already answered it; then confirm the answer in the summary instead.

Ask it plainly:

> Where will this live? This changes the layout, the components and the tokens I use, so it is worth being sure.

- **Web desktop.** "A big-screen web layout."
- **Web mobile.** "A small-screen web layout."
- **Responsive web page.** "One page that adapts from desktop down to mobile."
- **Native iOS app (Swift).** "A native iPhone screen: iOS patterns, the iOS token set, built for SwiftUI."

(Internal routing: the three web targets prototype in HTML on the `theme-css` semantic variables at the right canvas. Native iOS designs to iOS navigation patterns and safe areas, uses the `theme-ios` token names, and its dev spec maps elements to SwiftUI; when writing to Figma for this target, load the `figma-swiftui` skill alongside `figma-use`.)

When building on a screen the designer already has, the base screen usually answers this; confirm rather than ask, and only ask outright on the "move it to another section or platform" path.

Check-only paths, teach, ask and resume skip this step. Record the answer for the summary, the manifest and the dev spec.

## Step 7: Ask for the design, and suggest Figma when it is missing

If Step 2 already found the input, use it. Otherwise ask for it in plain words:

> Send me the design: paste a screenshot, point me at a folder, or just describe the page. If you have the Figma file, that is even better.

**The Figma suggestion (important, especially on a first run).** If the Figma desktop MCP is not live (you checked in Step 2), add this once, kindly, and do not nag or block:

> A screenshot is enough for layout, hierarchy, wording and a rough colour read, so we can start right now. For the most precise results, the real colour, token and channel checks, connect the Figma desktop MCP: open your file as the active tab and turn on the local MCP server. Even a single clear screen example helps me be accurate.

The designer can always carry on with a screenshot or a description. Only press for Figma when the chosen focus actually needs token truth (colour and channel, light vs dark by token, a real handoff).

## Step 8: Show a quick summary, then run

Before running, show a short plain-language summary so the designer knows what is about to happen and what they will get:

> Running: **<plain label>**, for **<the target surface, when one applies>**. I will produce **<the deliverable>**, plus a dev spec page for engineering when I build a screen, and skip everything else. This one is <quick / a bit deeper / the full pass>.

Then run the path. Keep the whole intake to four clicks at most (what, narrow, focus, where it lives) before asking for the design. If the designer typed a description after the command, skip straight to the matching path and just confirm.

## Step 9: Every generation gets its own sandbox run folder

For any path that generates something (a screen, a page, a flow, versions, an evolved frame), follow `packages/tokens/.agents/skills/design/foundation/sandbox-runs.md`:

1. Before generating, create `sandbox/<project>/<YYYY-MM-DD>-<run-slug>/` with a `reports/` folder inside. The project slug comes from the feature name you already collected; the run slug is two to four words from the ask. If the folder exists, append `-2`.
2. Generate into that folder. Reports from composed skills (critique, audits, specs) write to its `reports/`, not to `.design/`. Use `.design/<feature>/` only for quick checks with no project attached.
3. **The dev spec is part of the same pass.** Whenever the artefact is a screen or page, also write `DEV-SPEC.html` into the run folder root, per `handoff/dev-spec`: the engineer's quick view of the new feature, with every component and token used, each with an honest status (existing, variant needed, gap; bound, nearest, flagged), the target surface from Step 6, and the open questions. It is written from the generation's own record, never re-derived by guessing. Flow documents and check-only runs skip it.
4. Never edit a previous run folder. Iterating means a new run folder, with the previous one named in the manifest.
5. When done, write the run's `MANIFEST.md` (the template is in the convention, including the Target line), update the project's `LATEST.md`, and tell the designer in plain words where it is saved and that the dev spec is beside it ("saved in sandbox under checkout, run 2026-07-21-darker-header, with a dev spec page for engineering").

Check-only paths with no generation (a critique of a pasted screenshot, a quick question) skip this step.
