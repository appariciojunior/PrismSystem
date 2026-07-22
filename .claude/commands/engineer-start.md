---
description: Guided engineering intake. Pick what you want, then send the design or prototype. No keywords to remember.
---

Run the Design System guided engineering intake. The engineer clicks through what they want; never make them type a skill name. This command carries its own flow (below); it does not defer to the router's guided-mode section. It is the engineer's mirror of `/design-start`.

$ARGUMENTS

## What the engineer sees (read this first)

Every option you show the engineer uses plain language. This is the most important rule of this command.

- Engineers can take a little more technical vocabulary than designers: component, token, prop, stack, story and import are all fine. Internal system words are not. Never show skill names, agent names, route names or file paths in the options. Those are for your routing only.
- Never use em dashes anywhere. Use a comma, a colon, or a full stop.
- Keep every label short (two to five words) and every description to one plain sentence.
- British English throughout.

## The idea (for you, not the engineer)

This command exists to close one gap: designers make AI prototypes, and engineers rebuild everything from scratch. The conversion path is the headline; the rest of the flow surrounds it.

Three hard rules govern everything this command produces:

1. **Real components only.** If a DS component exists, use it. Never invent a component that looks like ours.
2. **Semantic tokens only.** No raw hex, no palette-direct values, no legacy names. Channel colour flows through tokens and section context, never through props.
3. **Flag, never guess.** Any value or widget that cannot be mapped with confidence is flagged in the output, with what is needed to resolve it. A flag is honest; a guess is drift.

Each path is a focal contract: load only the skills it names, run only the agent it names, produce one deliverable, and leave the rest of the suite alone. Any path that writes code shows its plan first and waits for the engineer's go.

## Step 1: Load the grounding

Load the TL;DR of `packages/tokens/.agents/skills/design/foundation/design-dna.md`, and check whether the token tools are available (`token_lookup`, `search_tokens`, `token_validate`, `contrast_check`). Do this first, always. Do not load the full DNA or the rules file unless a path needs them.

## Step 2: Sniff before you ask

Look before asking, and drop any question the context already answers:

- Did the engineer type a description after `/engineer-start`? If so, classify it straight to a path and skip to the receipt.
- Is a `.design/<feature>/` folder present with a `PACKET.md` or `SPEC.md`, or a recent `sandbox/<project>/<run>/` with a `DEV-SPEC.html`? If so, offer **Pick up `<feature>`** as the first option: a handoff is waiting. A dev spec is the designer's quick view of a generated screen (components, tokens, statuses, target surface); read it first, it is the fastest map of what was made.
- Is an input already attached (a Figma link, an HTML file or folder, pasted prototype code, a screenshot)? Note it for Step 6; it usually means the conversion path.
- Can you already tell the target stack? A `.swift` file means the iOS theme, a WordPress template means WordPress, and a working directory inside one of the production packages names the stack outright. If you can tell, do not ask; confirm it in the receipt instead.
- Is the Figma desktop MCP live on `127.0.0.1:3845`? Record yes or no now; you need it in Step 6.

## Step 3: First question, what do you want to do (clickable)

Use the clickable question tool (Claude Code: the question tool; Copilot: `vscode_askQuestions`). Show these options, in the engineer's language:

- **Pick up `<feature>`** (only if Step 2 found a packet or spec). "A design handoff is waiting. Check it and build it."
- **Pick up a design handoff.** "A designer has sent a spec or packet. Check it is complete, then build from it."
- **Convert this into our stack.** "Turn an AI prototype, an HTML page, a screenshot or a Figma frame into production code with our real components and tokens."
- **Build a component properly.** "Scaffold a new component the house way: all states, accessibility, tokens and a story."
- **Check what was built.** "Compare the build against the design, or audit the code for token drift."
- **Ask a quick question.** "Look up a token, or find out which component to use."

(Internal routing: handoff pickup validates against `handoff/spec-packet` then builds via `agents/build-agent`; conversion runs `handoff/stack-convert`; build proper runs `agents/build-agent`; checking runs `ui/visual-vs-built` and `ui/token-mapping-audit`; ask uses `token_lookup` and `search_tokens` with no workflow.)

## Step 4: Second question, narrow it (clickable, depends on Step 3)

**If they chose Pick up a design handoff (or Pick up `<feature>`):**

Read the packet or spec before asking anything; if the run folder has a `DEV-SPEC.html`, read that first for the quick map (components, tokens, statuses, target surface, open questions). Then offer:

- **Check it, then build.** "I list anything missing, then build once you say go." (the default)
- **Just check it.** "A completeness report: what is there, what is missing, what to send back to the designer."
- **Just build it.** "You have already checked it. Straight to the build plan."

The check covers: are the named tokens real semantic tokens, are all states specified, are light and dark both covered, are the assets present, is the channel stated. List anything missing as plain questions the designer can answer, not as faults. Building always shows a plan and waits for approval.

**If they chose Convert this into our stack:**

Ask what they are starting from, only if Step 2 did not already see it:

- **Prototype code.** "Output from v0, Lovable or any AI tool. Paste it or point me at the folder."
- **An HTML page.** "A page or an export. I read its markup and styles."
- **A Figma frame.** "The most precise start, especially with the file open as your active tab."
- **A screenshot.** "Enough to begin. Values I estimate get marked as estimates."

Before running, show the fidelity contract in plain words. The engineer should know exactly what survives and what changes:

> Converting keeps the layout, the hierarchy, the states and the intent of the design. It deliberately replaces two things. Arbitrary colours and sizes become the nearest real token, with a table showing every change. Custom widgets become our real components, with a note for each swap. Anything I cannot map with confidence gets flagged for you, not guessed.

Conversion is whole-screen: the output reproduces the entire input page at full fidelity, not an excerpt with placeholder hints. Placeholder blocks are allowed only for photography and adverts, never for structure, copy or chrome. Brand marks come from `brand-logos/` per `foundation/brand-assets`; the wordmark is never retyped as styled text.

Deliverable: production code for the chosen stack, a `CONVERSION.md` report listing every mapping, every swap and every flagged unknown, and a `DEV-SPEC.html` quick view (per `handoff/dev-spec`): the one-page breakdown of components used, tokens used, statuses and open questions that anyone can open without reading the full report. All land in the run's sandbox folder (see Step 8).

**If they chose Build a component properly:**

- **From a design packet.** "A packet or spec already exists for it."
- **From a Figma frame.** "I read the frame, then scaffold."
- **From a description.** "Tell me what it does; I propose the shape before building."

Whatever the source, the build follows the house conventions: the full state grid (default, hover, focus, active, disabled, loading, empty and error where relevant), accessibility built in (labels, focus order, contrast, reduced motion), semantic tokens only, a story covering every state, and channel handled by section context rather than props. The plan is shown and approved before any file is written. (Internal note: `agents/build-agent` normally includes a Code Connect step; Code Connect is not yet wired, so record it as pending in the plan rather than pretending it ran.)

**If they chose Check what was built:**

- **Design against build.** "Side by side with the design, and a list of every visible difference."
- **Token audit on the code.** "Find raw hex, hard-coded values and legacy token names in the code."
- **Both.** "The full check."

**If they chose Ask a quick question:** no narrowing. Take the question, answer it from the token tools and the real component inventory, cite the token path or component name so the answer is checkable, and stop. No files, no workflow.

## Step 5: Third question, the stack (clickable, only for paths that produce code and only when Step 2 could not tell)

- **React.** "Our main web components."
- **WordPress.** "Blocks and templates for the WordPress build."
- **iOS theme.** "Native code on the iOS token set."
- **Android theme.** "Native code on the Android token set."
- **Just CSS variables.** "Plain markup and our semantic CSS variables, no framework."

(Internal routing: `@ds/components-react`, `theme-ios`, `theme-css` or `theme-scss`. `icons` is shared by all of them.)

If a handoff packet already names the stack, use it and confirm in the receipt. Checking and asking never need this question.

## Step 6: Ask for the input, and suggest Figma when it is missing

If Step 2 already found the input, use it. Otherwise ask in plain words:

> Send me what you have: paste the prototype code, drop in the HTML file or folder, share the Figma link, or paste a screenshot. A whole export from v0 or Lovable is fine as it is.

**The Figma suggestion (important on a first run).** If the Figma desktop MCP is not live (you checked in Step 2), add this once, kindly, and do not nag or block:

> Pasted code or a screenshot is enough to start right now. For the most precise conversion, real token bindings instead of my best match, open the file as your active tab in Figma and turn on the local MCP server. You will see the difference in the mapping table: more exact matches, fewer estimates.

The engineer can always carry on with code or a screenshot. Only press for Figma when the chosen path genuinely needs token truth (converting from a design file, auditing against the design, checking a handoff).

## Step 7: Show the receipt, then run

Before running, show a short plain-language summary so the engineer knows what is about to happen and what they will get:

> Running: **<plain label>** on **<the input>**, target: **<stack, when one applies>**. I will produce **<the deliverable>**, and skip everything else. This one is <quick / a bit deeper / the full pass>. If it writes code, I show the plan and wait for your go first.

Then run the path. Keep the whole intake to three clicks at most (what, narrow, stack) before asking for the input. If the engineer typed a description after the command, skip straight to the matching path and just confirm.

## Step 8: Every generation gets its own sandbox run folder

For any path that produces code or converted output, follow `packages/tokens/.agents/skills/design/foundation/sandbox-runs.md`:

1. Before generating, create `sandbox/<project>/<YYYY-MM-DD>-<run-slug>/` with a `reports/` folder inside (project slug from the feature or packet name; run slug from the ask, e.g. `react-conversion`). If the folder exists, append `-2`.
2. Generate into that folder. `CONVERSION.md` and any audit reports write to its `reports/`; `DEV-SPEC.html` writes to the run folder root, in the same pass as the code. Use `.design/<feature>/` only for check-only work with no project attached.
3. Never edit a previous run folder. A re-conversion or a fix is a new run, with the previous one named in the manifest.
4. When done, write the run's `MANIFEST.md`, update the project's `LATEST.md`, and tell the engineer in plain words where it is saved.

Exception: **Build a component properly** writes real production files into `packages/` after approval, as before; its plan, notes and reports still go to a sandbox run folder so the attempt is recorded. Check-only paths and quick questions skip this step.
