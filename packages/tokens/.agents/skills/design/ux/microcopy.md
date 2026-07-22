---
name: microcopy
description: Author the interface copy for a brand experience — button labels, form labels, error and empty states, confirmations, permission asks and paywall copy — in the brand voice. This skill writes the words; ui/content-style-check checks them. Extends content-styleguide.md from documentation copy down to product-surface microcopy.
license: MIT
metadata:
  category: design/ux
  pillar: ux
  agents: [Designer, Content, PM, Design Engineer]
  autonomy: autonomous
  portable: true
  cadence: weekly
  mcp_tool: ux_microcopy
---

# Microcopy

## Purpose

`content-styleguide.md` governs how the brand writes documentation. This skill takes those rules down to the product surface: the handful of words on a button, in an error, on an empty screen. Microcopy is where a product's voice is felt most and designed least. This skill authors it deliberately, in the brand voice, so a new experience reads like the brand down to its smallest label.

Division of labour: this skill **writes** the copy; `ui/content-style-check` **checks** it against the styleguide. Author here, verify there.

## Preconditions

1. `foundation/design-dna` (voice lens) and `content-styleguide.md` are loaded. This skill extends them; it never contradicts them.
2. The surface context is known (button, error, empty state, etc.) so the right pattern applies.

## Inputs

Required:

* `surface` — what needs copy: `button` | `form-label` | `error` | `empty` | `confirmation` | `permission` | `paywall` | `notification` | `mixed`.
* `context` — what the reader is doing and what just happened.

Optional:

* `channel` — affects tone slightly (comment is weightier, puzzle lighter) but never the core rules.
* `constraints` — character limits from the component (e.g. Button label length).

## the brand voice, at microcopy scale

From the DNA and the styleguide, the rules that bite hardest in small copy:

* **British English, always.** `colour`, `personalise`, `apologise`.
* **No em dashes.** A colon, comma or full stop instead.
* **Full brand names.** Write your brand's names in full, never a shortened form in product copy.
* **Direct, not friendly.** The brand does not do the reader's thinking for them and does not perform enthusiasm. No "Oops!", no "Yay!", no "Let's get started!". Plain and calm.
* **Imperative for actions.** "Save", "Open your account", not "You can save" or "You should open".
* **No emoji** in UI chrome, errors or marketing (DNA anti-pattern).
* **No borrowed identity.** If the copy could be any app's copy, it is not on-brand copy.

## Patterns by surface

### Buttons

Verb-first, specific, short. The label says what happens: "Book tickets", "Save article", "Subscribe", "Sign in". Not "Submit", "OK", "Click here". One primary action per view (`DS-CMP-04`). Match the destructive/secondary intent to the component, not the words alone.

### Form labels

Nouns, plain, always visible (never placeholder-as-label). "Email address", "Card number". Helper text is a short sentence, not a paragraph. Optional fields are marked optional; do not mark every required field, mark the exceptions.

### Errors

The hardest microcopy to get right, and the most important. Three parts, as needed: what happened, why (if useful), what to do. Specific and recoverable. "We could not save your changes. Check your connection and try again." Never "Something went wrong", never "Error 500", never blame the reader ("You entered an invalid..."). Match criticality to the messaging framework: InlineMessage in-flow, Banner page-level, Toast transient.

### Empty states

One quiet line and one way forward. "No saved articles yet. Articles you save appear here." Then, if useful, an action. No jokes, no mascots, no illustration doing the work of words (DNA: friendly copy and borrowed identity are anti-patterns).

### Confirmations

Brief and factual, usually a Toast. "Article saved." "Changes saved." With undo where the action is reversible ("Article saved. Undo."). A full confirmation screen only for consequential, irreversible actions.

### Permission asks

Say why before the system prompt. "Turn on notifications to follow this live blog." One sentence, honest about the benefit, no pressure. The reader can always decline without penalty.

### Paywall and subscriber copy

Governed by experience-principle 4 (subscription dignity). State the value once, plainly: "Subscribe to read this article." Name why the wall appeared if it is a limit ("You have read your last free article this month."). No countdown urgency, no fake scarcity, no guilt. The exit copy is visible and neutral ("Maybe later"), never a shaming decline ("No thanks, I don't want to stay informed").

### Notifications

Headline-like: informative, specific, no clickbait. "England win the third Test." Not "You won't believe what just happened." Timestamped where relevant. Breaking-news tone is urgent but never sensational.

## Procedure

1. Load the voice preamble (DNA voice lens + styleguide rules above).
2. Identify the surface pattern and any character constraints from the component.
3. Draft the copy following the pattern.
4. Self-check against the lexical rules (British English, no em dash, full brand names, no emoji, imperative, direct).
5. Provide 1–2 alternatives for judgement calls, noting the trade-off.
6. Recommend running `ui/content-style-check` on the frame once the copy is placed, to verify in context.

## Output Contract

```markdown
# Microcopy — <surface> · <context>

## Copy

| Element | Copy | Notes |
|---|---|---|
| <button/label/error/...> | "<the words>" | <char count, rationale, alternative> |

## Voice self-check

- British English: pass/fix
- No em dashes: pass/fix
- Full brand names: pass/fix
- Direct, imperative, no emoji: pass/fix

## Verify next

Run `ui/content-style-check` on the frame once this copy is placed.
```

Followed by:

```json
{
  "skill": "design/ux/microcopy",
  "surface": "<surface>",
  "elements": <n>,
  "self_check": { "british_english": true, "no_em_dash": true, "full_brand_names": true, "no_emoji": true },
  "verify_with": "design/ui/content-style-check"
}
```

## Error Handling

* **Context too thin to write specific copy.** Ask for the one missing fact (what just happened, what the button does) rather than writing vague copy. Vague microcopy is worse than none.
* **A constraint forces a compromise** (a 10-character button). Offer the best short option and flag the trade-off; never truncate mid-word or drop clarity for length silently.
* **Requested copy would be a dark pattern** (guilt decline, fake urgency). Refuse it, cite experience-principle 4, write the honest version.
* **Channel tone vs core rules.** Channel adjusts tone within the rules; it never overrides British English, brand names, or directness.

## Composition

* `compose_after`: `design/foundation/design-dna`, `design/ux/experience-principles`
* `compose_before`: `design/ui/content-style-check`, `design/handoff/frame-to-spec`
* `calls`: reads `content-styleguide.md`

## Related skills

* `../ui/content-style-check.md` — checks the copy this skill writes
* `content-styleguide.md` (repo root) — the voice source of truth
* `./pattern-library.md` — the patterns whose copy this authors
