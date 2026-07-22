# The DS Prompt Cookbook

Recipes for talking to the Design System design suite. Find your situation below, copy a prompt, tweak the details, go. Nothing to memorise, nothing to set up.

New here? The two ways in:

- **`/design-start`** opens a clickable wizard. It asks two or three short questions, then asks for your screen. Pick this if you would rather click than type.
- **`/design <what you want>`** is the typed version. Describe the task in a sentence and the system works out the rest.

For the deeper how and why, read `GUIDE.md` next to this file. This cookbook is the quick version: real situations, real prompts.

---

## How to talk to the system

1. **Say what you are doing.** "Critique this", "add a feature", "write the error message". Plain verbs work best.
2. **Say what the screen is.** "Article page", "checkout step 2", "empty saved-articles state". One phrase is enough.
3. **Name the section if it matters.** This example brand has thirteen content sections (comment, sport, money and so on) and each has its own colour and tone. If your screen belongs to one, say so. If it is a settings page or similar, say "core".
4. **Say light or dark** if you know it.
5. **Attach the screen.** A screenshot is fine for most things. For colour and token precision, open the file in the Figma desktop app and say "it's my active tab".
6. **Say what you want back.** A full review, just accessibility, just the copy, a spec for engineering.
7. One screen per image, full frame, sharp. Crop to the screen, not a corner of it.
8. If detail matters (a button state, a tooltip), send a second close-up image and say which is which.
9. You can always answer follow-up questions later. A rough prompt beats no prompt.
10. When in doubt, type `/design-start` and click your way through.

---

## Recipes

### 1. I have a design and want honest feedback

You have finished a screen, or nearly. You want a proper review before you share it: what works, what breaks the rules, and a score you can track.

```
/design critique the attached screen. It's an article page, comment section, dark theme. Full review please.
```

```
/design is this any good? It's the new podcast landing page, light theme. Be honest.
```

```
/design critique my active Figma tab. It's the money-section homepage. Check the tokens too.
```

**What you get back:** a scored review out of 100, with every finding tied to a named rule so you know exactly what to fix and why. It lands in `.design/<feature>/CRITIQUE.md`. Fix the top findings, run it again, and watch the score move.

**Avoid:** sending a bare image with just "critique this". Without knowing what the screen is and which section it belongs to, the feedback has to hedge.

### 2. I am stuck and need direction ideas

You know what the page needs to do but not what it should be. You want several genuinely different takes to react to, not one polished answer.

```
/design I'm stuck on the saved-articles page. Give me a few different directions to react to.
```

```
/design show me six takes on this screen: denser, calmer, image-led, whatever contrasts. <screenshot attached>
```

```
/design-start
(then pick "Create or explore a design", then "A few different directions")
```

**What you get back:** around six quick, rough versions, each from a different angle: denser and more editorial, image-led, calmer and more open, bolder headline, mobile-first, a different section colour. They are lined up so you can compare, pick one, or mix two. Only the one you choose gets built properly afterwards.

**Avoid:** asking for polish at this stage. These are meant to be rough and fast. Judge the direction, not the pixels.

### 3. I have a Figma screen and want to build on it

You are not starting from scratch. You have a real screen and want to add a feature, change part of it, or move it to another section, keeping everything else intact.

```
/design build on my active Figma tab: add a "save for later" action to the article header. Keep everything else as it is.
```

```
/design take this screen and swap the hero for a live-blog module. Sport section. <screenshot attached>
```

```
/design move this comment-section layout to the money section. Same structure, right colours.
```

**What you get back:** the updated screen, built from the same grid, components and section colour as the original, plus a short note listing exactly what changed. With Figma as your active tab the system reads the real tokens; with a screenshot it matches what it can see.

**Avoid:** vague asks like "make it better". Name the change. The system keeps everything you do not mention.

### 4. I am designing something brand new

The page or flow does not exist yet. You want the house way to do it, grounded in real patterns, not a generic template.

```
/design design a live-blog experience for sport. Web first, mobile matters.
```

```
/design we need an onboarding flow for the puzzles app. Three steps max. Help me shape it.
```

```
/design what's the house pattern for a paywall on a long read? Then design one for the comment section.
```

**What you get back:** a flow or page design built from brand principles, real components and shipped patterns, with the reasoning shown. The flow lands in `.design/<feature>/FLOW.md` so you can pick it up again tomorrow.

**Avoid:** skipping the context. "Design a settings page" gets a competent guess; "design a settings page for the app, core section, our users are mostly over 50" gets an on-brand answer.

### 5. I need to hand this to engineering

The design is settled and someone has to build it. You want a spec engineers will not have to interpret: tokens, spacing, states, behaviour, all pinned down.

```
/design this is ready for engineering. It's the events landing page. Figma is my active tab.
```

```
/design hand off the saved-articles feature. Light: <figma link>. Dark: <figma link>.
```

```
/design just the spec for this card, no full packet. <figma link>
```

**What you get back:** a complete engineering packet in `.design/<feature>/PACKET.md` (or a lighter `SPEC.md` if that is all you asked for): every value mapped to a real token, every state covered, ready to build from. If you want, the system can then scaffold the component in code; it always asks before writing any.

**Avoid:** handing off from a screenshot alone. A handoff needs the real token bindings, so open the file in the Figma desktop app first and say it is your active tab.

### 6. I want to check accessibility only

You do not need the full review. You just want to know the screen holds up: contrast, tap targets, focus order, text sizes.

```
/design check accessibility only on this screen. Light theme. <screenshot attached>
```

```
/design a11y check on my active Figma tab. I'm mainly worried about contrast in dark mode.
```

```
/design are these tap targets big enough on mobile? <screenshot attached>
```

**What you get back:** a focused accessibility report with pass and fail per check, and concrete fixes. It lands in `.design/<feature>/A11Y.md`. Nothing else runs, so it is quick.

**Avoid:** expecting exact contrast ratios from a blurry or scaled-down screenshot. Send it sharp and full-size, or use Figma for precision.

### 7. The colours look off and I want to know why

Something is not quite right: a blue that is nearly the brand blue, a dark mode that drifts, a section colour that seems wrong. This is a token question, and it needs Figma.

```
/design my active Figma tab: check every colour is bound to the right token. Comment section.
```

```
/design why does dark mode look off on this screen? Compare light and dark properly. Figma is my active tab.
```

```
/design is this using the sport section colour correctly, or is it hard-coded somewhere?
```

**What you get back:** a value-by-value audit naming which token each colour, space and size is actually bound to, and flagging anything hard-coded, legacy or borrowed from the wrong place. A screenshot shows a blue; Figma shows whether it is the right blue.

**Avoid:** asking this from a screenshot. Pixels cannot tell you what a colour is bound to. Open the file in the Figma desktop app, make it the active tab, and say so.

### 8. I am writing UI copy

Buttons, error messages, empty states, onboarding lines. You want words that sound like the brand: direct, calm, British English.

```
/design write the empty state for saved articles. Warm but not chirpy.
```

```
/design give me three options for the error message when payment fails on the subscribe page.
```

```
/design check the copy in this screen against the brand voice. <screenshot attached>
```

**What you get back:** copy in the brand voice, usually with a couple of options and a note on why each works. If you asked for a copy check, you get line-by-line feedback against the style guide instead.

**Avoid:** asking for copy with no situation. "Write a button label" is unanswerable; "write the label for confirming a subscription cancellation" writes itself.

### 9. Teach the system our real product

The more real product screens the system has studied, the more specific its advice gets: real card anatomy, real paywall behaviour, not principled guesses. Feeding it takes two minutes.

```
/design learn from these screenshots. They're from the iOS app, mostly article pages.
```

```
/design I've dropped 15 web screenshots in design-corpus/raw/inbox/. Take a look and learn from them.
```

```
/design-start
(then pick "Teach the system, or ask a question")
```

**What you get back:** the screens are sorted, studied and folded into the system's knowledge, and it may propose new rules it has spotted. Every future review and design gets a little more on-brand. Ten to twenty screens per batch is the sweet spot; web, iOS and Android all welcome.

**Avoid:** feeding it Figma exports of unfinished work. Teach it from the shipped product, the thing readers actually see.

### 10. Quick question about the house way

No files, no process. You just want an answer: what is the rule, what is the pattern, what would your brand do.

```
/design what's the rule on section colours in components?
```

```
/design what's the house way to do an inline sign-up prompt?
```

```
/design quick one: do we ever use exclamation marks in error messages?
```

**What you get back:** a direct answer citing the actual rule or principle, in the chat. Nothing is written to disk. Seconds, not minutes.

**Avoid:** turning a quick question into a project. If you just want to know, just ask.

---

## Good prompt, weak prompt

**Weak:** `critique this` (with a bare image)
**Good:** `/design critique the attached article screen. Comment section, dark theme. Full review please.`
The good one names the screen, the section and the theme, so every check runs against the right rules instead of hedging.

**Weak:** `is this accessible?`
**Good:** `/design accessibility only on this screen. Light theme. I care most about contrast and tap targets.`
The good one scopes the job, so you get a fast, focused report instead of a full review you did not ask for.

**Weak:** `make this better` (with a Figma link)
**Good:** `/design build on my active Figma tab: add a share button to the article footer. Keep the sport section colour.`
The good one names one concrete change, so the system knows what to touch and what to leave alone.

**Weak:** `write some copy for this`
**Good:** `/design write the error message for a failed card payment on the subscribe page. Calm and direct, offer a next step.`
The good one gives the moment, the reader's mood and the job the words must do; the copy nearly writes itself.

---

## FAQ

**Do I need Figma every time?**
No. A screenshot is enough for layout, hierarchy, UX, copy and a rough colour read, which covers most everyday questions. You only need Figma when the answer depends on what a value is actually bound to: token audits, section-colour checks, light versus dark comparisons, and handoffs.

**What if I only have a screenshot?**
Paste it and carry on. Say what the screen is and which section it belongs to, and you will get a full, useful review. The system will tell you if something you asked for genuinely needs Figma.

**How do I connect Figma when I do need it?**
Open the Figma desktop app, make your file the active tab, and turn on the local MCP server in Preferences. Then just say "it's my active tab". It reads one file at a time, whichever tab is active.

**How do I pick a channel?**
The channel is the editorial section the screen lives in: comment, sport, money and so on, thirteen in all. If your screen belongs to one, name it, because colour and tone depend on it. Settings, account and other utility pages are "core". Not sure? Say so and the system will ask or work it out from the screen.

**Where do the outputs go?**
Written results land in a folder named `.design/<feature>/` in your project: `CRITIQUE.md` for reviews, `A11Y.md` for accessibility, `SPEC.md` and `PACKET.md` for engineering handoffs, `FLOW.md` for new flows. They are working files you can revisit, share or regenerate. Quick questions are answered in the chat and write nothing.

**What if the answer looks generic?**
Two fixes. First, add context: what the screen is, the section, the theme. Second, teach the system from real screens (recipe 9); once it has studied the shipped product, its advice cites how your brand actually designs. If you called something very specific directly and it feels flat, go back through `/design` instead, which always loads the brand foundations first.

**How do I see the score improve?**
Critique, fix the top findings, critique again. Each finding cites a rule, so the fix is unambiguous, and the score is calculated the same way every run, so the trend is real. Over time the monthly roll-up shows the bigger picture. The findings are the work; the number just proves it.

**Will it change my Figma file or write code without asking?**
No. Reviews and specs are read-only. Anything that writes, whether building on a Figma screen or scaffolding a component in code, is spelled out first and asks before it acts.
