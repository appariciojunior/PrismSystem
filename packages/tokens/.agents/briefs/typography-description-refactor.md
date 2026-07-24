# Typography Token Description Refactor Proposal

## Purpose

Standardise all 188 semantic typography token descriptions to align with content styleguide principles and serve all three audiences: Product, Design, Code.

## Current State vs. Target

### Phase 1: Terminology Normalization

#### Issue: Weight naming inconsistency

**Current:** Mix of "light", "light-weight", "light weight", "bold-weight", "Bold", "black"
**Target:** Consistent naming: `light`, `regular`, `bold`, `black` (no hyphens after intro)

**Before:**

```
"Fixed light-weight heading at 19px. Typically h5, h6."
"Ultra-bold micro headline for badges and compact callouts. Typically h5, h6."
```

**After:**

```
"Fixed light heading at 19px. Pair with `h5` or `h6`."
"Ultra-bold micro headline for badges and compact callouts. Pair with `h5` or `h6`."
```

---

#### Issue: HTML element guidance format

**Current:** Inconsistent formats—"Typically h5, h6", "Use h5, h6", "Use p", "Use a inside p"
**Target:** Standardised format: Always inline code, clear action verb

**Before:**

```
"Typically h5, h6."
"Use span or p."
"Use a inside paragraph flow."
```

**After:**

```
"Pair with `h5` or `h6`."
"Use inside `span` or `p`."
"Use for standalone links outside paragraph text."
```

---

### Phase 2: Active Voice & User-Intent Refactor

#### Issue: Redundant context

**Current:** Token path context restated in description

- `brand.paragraph.regular.small` → "Regular-weight body paragraph, small..."
- `utility.heading.small` → "Compact utility heading for..."
- `brand.heading.fluid.light.2xsmall` → "Subtle subheading..."

**Target:** Remove classification; lead with user intent

**Example Refactor:**

**Token:** `brand.paragraph.regular.small`

| Audience | Before | After |
| ----------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Product** | "Regular-weight body paragraph, small. Use p." | "Small body text for dense layouts. Creates hierarchy without visual weight. Use `p`." |
| **Design** | "Regular-weight body paragraph, small. Use p." | "Body text (14px, 1.5x line height) for footnotes and captions. Pair with medium for contrast." |
| **Code** | "Regular-weight body paragraph, small. Use p." | "CSS: `font-family: SourceSerif; font-size: 14px; line-height: 1.5; margin-bottom: 1rem`. Use `p`." |

**New single description (all audiences):**

```
"Small body text for tight layouts. Pair with p."
```

---

### Phase 3: Token Category Refactors

#### Category 1: `brand.heading.fluid.*` (28 tokens)

**Current pattern:**

```
"[Weight descriptor] [context] for [use case]. Typically [HTML elements]."
```

Example: "Subtle subheading for sections and tertiary content. Typically h5, h6."

**Target pattern:**

```
"[Size/user intent]. [Visual hierarchy role]. Pair with [HTML element]."
```

Example: "Micro heading. Tertiary section breaks. Pair with `h5` or `h6`."

**Benefits:**

- Removes weight repetition (already in token path)
- Leads with visual size, not weight classification
- Clarifies purpose for designers
- Provides code guidance

---

#### Category 2: `brand.heading.static.*` (40 tokens)

**Current issue:** "Fixed [weight] heading at [size]px"

- Redundant: "fixed" is already in token path
- Vague: "fixed" doesn't explain why vs. fluid

**Target:** Clarify when to use static vs. fluid

**Before:**

```
"Fixed light-weight heading at 19px. Typically h5, h6."
"Fixed light-weight heading at 20px. Typically h5, h6."
"Fixed light-weight heading at 24px. Typically h4, h5."
```

**After:**

```
"Micro heading (19px). Use when size must not scale. Pair with `h5` or `h6`."
"Micro heading (20px). Use when size must not scale. Pair with `h5` or `h6`."
"Small heading (24px). Use when size must not scale. Pair with `h4` or `h5`."
```

---

#### Category 3: `brand.display.*` (40 tokens)

**Current issue:** "Decorative brand use only" is vague and lacks context

- No guidance on when/why to use
- No warning about accessibility trade-offs
- Massive sizes (68px–300px) need accessibility caution

**Before:**

```
"Fixed light-weight display type at 68px. Decorative brand use only. Use p or span."
```

**After:**

```
"Mega-headline (68px, light). Brand splash pages only. Warning: avoid on mobile; may break layouts. Use `p` or `span`."
```

**New guidance:**

- Add context about use cases (splash, hero, landing pages)
- Include warnings for extreme sizes
- Clarify semantic vs. presentational intent

---

#### Category 4: Link tokens (16 tokens)

**Current issue:** No clarity on visual state; confusing HTML guidance

**Before:**

```
"Inline links within footnotes and compact navigation. Use a inside p."
"Inline links within body text. Use a inside p."
```

**After:**

```
"Underlined inline link (footnotes, compact nav). Use inside `p` or other text container."
"Underlined inline link (body text). Use inside `p` or other text container."
```

**New guidance:**

- Explicitly note underline present (for inline) or absent (for standalone)
- Clarify container context (not just "inside p")
- Distinguish brand vs. utility families

---

#### Category 5: Utility tokens (`utility.body`, `utility.heading`, etc.)

**Current issue:** No accessibility warnings for minimum sizes

**Before:**

```
"Minimum-size regular body. Use p or span."
"Micro utility subheading. Typically h6 or span."
```

**After:**

```
"Minimum-size body (12px). For captions and metadata only. Verify 4.5:1 contrast ratio. Use `p` or `span`."
"Micro subheading (10px). For inline labels only. Verify 4.5:1 contrast ratio. Use `h6` or `span`."
```

**New guidance:**

- Flag minimum sizes
- Require contrast verification
- Clarify when NOT to use

---

### Implementation Plan

#### Stage 1: Styleguide Update

Add new section: **Typography Token Description Standards**

- Template for description structure
- Examples of each category
- Audience guidance

#### Stage 2: Sample Refactor

Implement full refactor on `brand.heading.fluid.*` (7 weight variants × 2 sizes = 14 tokens)

- Proves pattern works
- Provides production example
- Can be extended to other families

#### Stage 3: Full Implementation

Apply refactor to remaining categories:

1. `brand.heading.static.*`
2. `brand.display.*`
3. Link tokens
4. Utility tokens
5. Remaining brand tokens

**Estimated effort:** 4–6 hours to complete all 188 tokens

---

## Quality Gates

**Before committing refactored descriptions:**

- [ ] All descriptions start with user intent (not weight/size)
- [ ] No descriptions repeat token path context
- [ ] All HTML elements in inline code: `` `h5` ``, not "h5"
- [ ] All action verbs are active: "Use", "Pair with", not "Typically", "Should"
- [ ] All descriptions ≤60 characters (or justified if longer)
- [ ] No duplicate labels in description (if token name has "heading", description doesn't lead with "heading")
- [ ] Extreme sizes (display, minimum-size) have warnings
- [ ] JSON validates: `python3 -m json.tool packages/tokens/src/tokens.json > /dev/null`
- [ ] Build output passes: `npm run build:output && npm run test:output`

---

## Audience Alignment Checklist

For each refactored token, verify it serves all three audiences:

| Audience | What They Need | Validation |
| ----------- | -------------------------------------------------- | ------------------------------------------ |
| **Product** | Context: When to use this token in product UI | Can a PM understand the business use case? |
| **Design** | Visual role: How does this token fit the hierarchy | Can a designer see the visual intent? |
| **Code** | Implementation: How to apply this in code | Can a dev understand the HTML/CSS pairing? |

---

## Risks & Mitigations

| Risk | Mitigation |
| ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| Breaking external tooling that parses descriptions | Audit downstream consumers (Storybook, build scripts, docs) before commit |
| User confusion during transition | Provide clear changelog with before/after examples |
| Inconsistent refactoring across token family | Use template from styleguide; peer-review each family |
| Accidentally changing token values instead of descriptions | Use multi_replace_string_in_file with exact context matching |

---

## Success Metrics

- [ ] All 188 descriptions follow new template
- [ ] Zero "typically", "usually", "should" verbs in descriptions
- [ ] All HTML elements are inline code
- [ ] All weight names consistent (light, regular, bold, black)
- [ ] At least 3 audiences (Product/Design/Code) represented
- [ ] Build and test suite pass
- [ ] No regressions in Storybook output
