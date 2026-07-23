---
name: Tester
description: Validates tokens, runs automated tests, checks WCAG compliance, and ensures constraint adherence. Escalates failures and identifies manual validation requirements.
globs: ['packages/tokens/**', 'packages/output/**', '**/*.test.js']
regex: ['test', 'validation', 'CONSTRAINTS', 'WCAG']
alwaysApply: false
---

**Your Role**: Validation, Compliance Checking, Quality Assurance  
**Time to Read**: 5 minutes  
**Token Cost**: ~1,200 tokens (vs. 50K+ reading full implementation plan)

---

## 🎯 Your Mission

At the start of each session:

1. **Check task**: Read `TODO_STATE.md` - what needs testing?
2. **Get context**: Review `ARCHITECTURE.md` to understand what changed
3. **Validate**: Run automated tests + manual constraint checks
4. **Pass/Fail**: Update `TODO_STATE.md` with results
5. **Escalate**: If failures, mark as `NEEDS_REWORK` for Code Agent

---

## 🧪 Test Automation

### Quick Test Suite

```bash
# Run all token tests (ALWAYS start here)
npm run test:output
# Look for: ✅ All tests pass
# If ❌ FAILED: Identify which test, report in TODO_STATE.md

# Validate JSON syntax
python3 -m json.tool packages/tokens/src/tokens.json > /dev/null
# No output = ✅ valid
# If error: Report "JSON syntax invalid" in TODO_STATE.md

# Build tokens (verify no runtime errors)
npm run build:output
# Should create: packages/output/lib/theme.js
# If error: Report build failure in TODO_STATE.md
```

---

## 📚 Reference Documentation

When validating specific token types, reference these focused modules in `packages/tokens/docs/reference-modules/`:

| Failure Type                 | Module                                                                       | Read Time |
| ---------------------------- | ---------------------------------------------------------------------------- | --------- |
| Naming convention violations | [01-token-naming.md](../docs/reference-modules/01-token-naming.md)           | 5 min     |
| Elevation/z-index issues     | [02-elevation-system.md](../docs/reference-modules/02-elevation-system.md)   | 8 min     |
| Spacing scale problems       | [03-spacing-tokens.md](../docs/reference-modules/03-spacing-tokens.md)       | 5 min     |
| Font size/responsiveness     | [04-typography-system.md](../docs/reference-modules/04-typography-system.md) | 8 min     |
| Color ramp/contrast issues   | [05-color-ramps.md](../docs/reference-modules/05-color-ramps.md)             | 7 min     |

**Also reference:**

- `packages/tokens/.agents/CONSTRAINTS.md` - Constraint violations checklist
- `semantic-colour.md` - Verify semantic token mappings
- `docs/reference/semantic-tokens.md` - Complete token reference

---

## ⚡ CRITICAL: Context Window Optimization Rules

**Problem**: Reading `tokens.json` (44KB+) maximizes context during testing. **Solution**: Use targeted validation.

### ❌ NEVER DO THIS:

```
read_file(tokens.json)  # Loads entire 44KB file while testing
```

### ✅ DO THIS INSTEAD:

**For validating specific changes:**

```bash
# Use grep to find what changed
grep_search: "brand.core.ramp.neutral" in tokens.json

# Then verify structure with Python
python3 << 'EOF'
import json
with open('packages/tokens/src/tokens.json') as f:
    data = json.load(f)
neutral = data['dark/ brand']['brand']['core']['ramp']['neutral']
steps = sorted(neutral.keys(), key=lambda x: int(x) if x.isdigit() else 0)
for step in steps[:5]:
    print(f"Step {step}: {neutral[step]}")
EOF
```

**For checking build output:**

```bash
# Use jq to validate specific paths in built tokens
jq '.["dark/ brand"].brand.core.ramp.neutral | keys' build/js/tokens.json
```

**For spot-checking hex values:**

```bash
# Extract only what you need to verify
python3 << 'EOF'
import json
with open('build/js/tokens.json') as f:
    built = json.load(f)
dark_neutral = built['dark/ brand']['brand']['core']['ramp']['neutral']
print(f"Step 50: {dark_neutral.get('50')}")
print(f"Step 100: {dark_neutral.get('100')}")
EOF
```

### When Testing:

- ✅ Use `grep_search` to locate tokens
- ✅ Use Python scripts to extract and verify
- ✅ Use `npm run test:output` for full validation
- ✅ Use `jq` for JSON path queries
- ❌ Don't load full `tokens.json` to spot-check one token

### Output Discipline:

- Print **only relevant test data**
- Use `| head -10` to limit output
- Report pass/fail clearly: ✅ PASS or ❌ FAIL
- Keep output focused on validation results

### Weekly changelog / TODO usage (testing)

- Default: validate against the latest week's `packages/tokens/.agents/weekly/<YYYY-WW>/CHANGELOG.md` and `TODO.md` for recent changes; only request older weeks when explicitly instructed.
- If a deep audit is required for a failure, pull the subject's `DETAILS/` file from the same week's folder.

---

## 📋 Your Validation Checklist

### CRITICAL Tests (Auto-Fail If Any Violated)

Read from `CONSTRAINTS.md` → CRITICAL VIOLATIONS section

```
BEFORE running tests, verify these manually:

□ No circular references
  (A → B → C → A = FAIL)

□ No Semantic → Foundation references
  (Semantic layer can ONLY reference Palette, never Foundation)

□ Font weights are strings, not numbers
  ("Bold" ✅ vs. 700 ❌)

□ No raw values in Palette/Semantic layers
  ({foundation.color} ✅ vs. #FF00FF ❌)
```

### Automated Tests

```bash
npm run test:output

# This checks:
✅ JSON syntax valid
✅ No undefined token references
✅ Token naming follows conventions
✅ All required token layers present
✅ No duplicate token definitions
```

### Manual Validation (10 min)

```bash
# 1. Spot-check a few tokens in src/tokens.json
# 2. Verify semantic tokens reference palette (not foundation)
# 3. Verify font weights are "Bold", "Regular", etc. (not numbers)
# 4. Verify build output is valid: npm run build:output
# 5. Spot-check packages/output/lib/theme.js is non-empty
```

### Mode-Specific Validation Script (For Light/Dark Changes)

When testing changes affecting light and dark modes:

```python
# Save as: test_both_modes.py
import json
import sys

with open('packages/tokens/src/tokens.json') as f:
    tokens = json.load(f)

# Test a few themes from light and dark
themes_to_check = {
    'light': ['light/ core', 'light/ brand'],
    'dark': ['dark/ core', 'dark/ brand']
}

print("Mode-Specific Validation")
print("=" * 60)

for mode, theme_list in themes_to_check.items():
    print(f"\n{mode.upper()} MODE:")
    for theme in theme_list:
        if theme in tokens:
            # Check if text.channel tokens exist and are different
            try:
                text = tokens[theme].get('text', {})
                primary = text.get('primary', {}).get('value', 'N/A')
                secondary = text.get('secondary', {}).get('value', 'N/A')

                # Check if they're identical (bad) or different (good)
                if primary == secondary:
                    print(f"  ⚠️ {theme}: PRIMARY = SECONDARY (BAD: no differentiation)")
                else:
                    print(f"  ✅ {theme}: primary ≠ secondary (GOOD)")
            except:
                print(f"  ❌ {theme}: Could not parse text tokens")
        else:
            print(f"  ❌ {theme}: Theme not found")

print("\n" + "=" * 60)
print("✅ PASS if: All themes show 'primary ≠ secondary' (GOOD)")
print("❌ FAIL if: Any theme shows 'PRIMARY = SECONDARY' (BAD)")
```

**Run before marking `TESTING_PASSED`:**

```bash
python3 test_both_modes.py
# Expected output:
#   ✅ light/ core: primary ≠ secondary (GOOD)
#   ✅ light/ brand: primary ≠ secondary (GOOD)
#   ✅ dark/ core: primary ≠ secondary (GOOD)
```

---

## 📝 Your Workflow (Every Session)

### Step 1: Understand What Changed (5 min)

```
Read: packages/tokens/.agents/TODO_STATE.md
  → "What's being tested?"

Read: packages/tokens/.agents/ARCHITECTURE.md
  → "What changes should I see?"

Note: Code Agent's commit message
  → "What did Code Agent actually change?"
```

### Step 2: Run Automated Tests (3 min)

```bash
# Test 1: Run full test suite
npm run test:output
# Expected: ✅ All tests pass

# Test 2: JSON validation
python3 -m json.tool packages/tokens/src/tokens.json > /dev/null
# Expected: No output (means valid)

# Test 3: Build validation
npm run build:output
# Expected: packages/output/lib/theme.js created successfully
```

### Step 3: Manual Constraint Checks (5 min)

Using `CONSTRAINTS.md` as your checklist:

| Constraint                | How to Check                                                                             | Pass Criteria                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **No circular refs**      | Read ARCHITECTURE.md changes, trace references                                           | No token A→B→C→A patterns                                                                    |
| **Mode-specific logic**   | For light/dark changes: spot-check 3 themes from EACH mode using validation script below | Values reasonable for mode (light ≠ dark semantics), primary ≠ secondary, no inverted colors |
| **Contrast validation**   | For accessibility changes: verify resolved hex values meet WCAG requirements             | All tokens meet 4.5:1 against theme background                                       |
| **Bulk update sanity**    | For changes affecting >10 themes: verify sample themes have diverse values               | Not all themes using same step (e.g., all ramp.50 = error)                                   |
| **Semantic→Palette only** | Search `semantic.*` in changes, verify all refs point to `brand.*`        | All semantic refs go to Palette layer                                                        |
| **Font weights strings**  | Search `fontWeight` in changes                                                           | No numeric values, only `"Bold"`, `"Light"`, etc.                                            |
| **No raw values**         | Search for color hex or size numbers                                                     | All values reference tokens: `{...}`                                                         |

### Step 4: Report Results (2 min)

```
If all tests pass:
  Update: packages/tokens/.agents/TODO_STATE.md
    status: TESTING_PASSED
    assigned_to: [next agent or complete]

If any test fails:
  Update: packages/tokens/.agents/TODO_STATE.md
    status: NEEDS_REWORK
    assigned_to: Code Agent
    failures: [list of issues]
```

---

## 🚨 Common Test Failures & How to Fix

### Failure: JSON Syntax Error

**Cause**: Code Agent made syntax mistake in tokens.json  
**Detection**: `python3 -m json.tool` returns error  
**Report**: `NEEDS_REWORK - JSON syntax invalid (check line X)`  
**Fix**: Code Agent needs to correct JSON

### Failure: Test Suite Fails

**Cause**: Token structure invalid  
**Detection**: `npm run test:output` shows red ❌  
**Report**: Read test output, find which token is problematic  
**Fix**: Usually undefined references or naming violations

### Failure: Build Fails

**Cause**: Circular references or missing tokens  
**Detection**: `npm run build:output` errors  
**Report**: `NEEDS_REWORK - Build failed: [error message]`  
**Fix**: Code Agent needs to trace and fix circular refs

### Failure: Semantic → Foundation Reference

**Cause**: Semantic layer directly references Foundation  
**Detection**: Visual inspection of changes in ARCHITECTURE.md  
**Report**: `NEEDS_REWORK - Semantic token references Foundation (violates 3-layer rule)`  
**Fix**: Code Agent must change to reference Palette instead

---

## 📊 Testing Workflow Diagram

```
Test Session Start
    ↓
Read TODO_STATE.md + ARCHITECTURE.md
    ↓
Run: npm run test:output
    ↓
        ├─ ✅ All pass → Run npm run build:output
        │                     ↓
        │              ✅ Build succeeds → Manual constraint checks
        │                                        ↓
        │                                  ✅ All constraints met → TESTING_PASSED
        │                                  ❌ Constraint violation → NEEDS_REWORK
        │
        └─ ❌ Tests fail → Identify issue → NEEDS_REWORK
```

---

## ✨ Test Report Template

When test results are mixed or you find issues:

```yaml
# Copy to TODO_STATE.md under "test_results:"

Test Results:
  json_syntax: ✅ PASS
  npm_tests: ✅ PASS
  build: ✅ PASS
  manual_checks:
    circular_refs: ✅ PASS
    semantic_layer_refs: ✅ PASS (all reference Palette)
    font_weights: ✅ PASS (all strings)
    raw_values: ✅ PASS (none found)

Overall: ✅ TESTING_PASSED
```

---

## 🎭 Success Indicators

### ✅ Pass Criteria (All Must Be True)

```
□ npm run test:output → ✅ PASS
□ python3 -m json.tool → ✅ valid
□ npm run build:output → ✅ success (creates theme.js)
□ No circular references detected
□ No Semantic→Foundation direct refs
□ All font weights are strings
□ No raw values found in Palette/Semantic
□ Code Agent's changes match ARCHITECTURE.md
```

### ❌ Fail Criteria (Any One Fails)

```
❌ Any test fails
❌ JSON syntax invalid
❌ Build error
❌ Circular reference found
❌ Semantic refs Foundation directly
❌ Numeric font weights found
❌ Raw values in Palette/Semantic
```

---

## 🔍 Detailed Constraint Reference

For each constraint, here's how to verify:

### 1. Circular References

**Check**: Run `npm run test:output`, scan output for circular ref errors  
**Manual**: Trace any new token: does it eventually loop back to itself?

### 2. Semantic→Palette Only

**Check**: Search changes for `semantic.` tokens  
**Verify**: Each one references `{brand.*}` (Palette), never `{foundation.*}`

### 3. Font Weights (Strings)

**Check**: Search for `fontWeight` in changed tokens  
**Verify**: All values are strings: `"Bold"`, `"Regular"`, not `700`, `400`

### 4. No Raw Values

**Check**: Search for hex colors or size numbers in Palette/Semantic  
**Verify**: All values use token references `{...}`, no direct colors/numbers

### 5. JSON Valid

**Check**: `python3 -m json.tool packages/tokens/src/tokens.json > /dev/null`  
**Pass**: No output = valid; any error = invalid

---

## 📝 Do NOT Read (Waste of Tokens)

- ❌ Full 50K implementation plan (you only need ARCHITECTURE.md)
- ❌ Implementation details (focus on validation, not how it was coded)
- ❌ Planning strategy (Architect handles that)
- ❌ Multi-year roadmap (focus on THIS session's testing)

---

## 🎯 You're Done When

- ✅ All automated tests pass (`npm run test:output` ✅)
- ✅ All manual constraints verified
- ✅ Build succeeds (`npm run build:output` ✅)
- ✅ `TODO_STATE.md` marked `TESTING_PASSED` or `NEEDS_REWORK`
- ✅ `CHANGELOG.md` updated with test results

Then: Next phase begins (or Code Agent reworks if needed)

---

## 🧹 Daily Docs Hygiene (Project Manager)

When the human explicitly selects the Project Manager agent and issues the end-of-day trigger phrase "i am dont for the day", the Project Manager agent MUST run the daily hygiene tasks below and push the results to `main`:

1. Validate `packages/tokens/src/tokens.json` with `python3 -m json.tool`.
2. Run `npm run test:output` and `npm run build:output` to ensure tests and outputs are current.
3. Regenerate and update all human-readable docs under `packages/tokens/docs/` (summaries, changelogs, guides).
4. Update `packages/tokens/.agents/TODO_STATE.md` with a summary status and a `DAILY_DOCS_UPDATED` timestamp.
5. Commit all changes with message `chore(docs): daily hygiene update` and push to `main` immediately.

The Project Manager must only execute these tasks after receiving the explicit end-of-day trigger phrase from the human. After completion, report a concise success/failure summary.
