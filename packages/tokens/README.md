# 📚 Design System - Tokens Repository

**Location**: `/packages/tokens/`  
**Purpose**: Source of truth for design tokens (Foundation, Palette, Semantic layers)  
**Last Updated**: January 11, 2026

---

## 🎯 Quick Navigation

### 🚀 New to this repo? START HERE

1. **New Agent?** → Read [Agent Quick Start](#-agent-quick-start) (5 min)
2. **Want to understand the token system?** → Read [Token System Overview](#-token-system-overview) (10 min)
3. **Need to execute a phase?** → Read [How to Run Phases](#-how-to-run-phases) (5 min)
4. **Project Manager?** → Read PROJECT_MANAGER_BRIEF.md + ROADMAP.md (10 min)
5. **Stuck?** → Jump to [Troubleshooting](#-troubleshooting)

### 📂 Finding Files in This Repo

| Need                     | Location                                       | What                                  |
| ------------------------ | ---------------------------------------------- | ------------------------------------- |
| **Agent coordination**   | `.agents/`                                     | State files, briefs, execution guides |
| **Project roadmap**      | `.agents/ROADMAP.md`                           | Timeline, decisions, strategic goals  |
| **Token definitions**    | `tokens.json` or `src/tokens.json`             | Source of truth                       |
| **Current task status**  | `.agents/TODO_STATE.md`                        | What's being worked on                |
| **What happened before** | `.agents/CHANGELOG.md`                         | Audit trail of all work               |
| **Token rules**          | `.agents/CONSTRAINTS.md`                       | Non-negotiable violations             |
| **Validation checklist** | `.agents/SEMANTIC_RULES.md`                    | How to test tokens                    |
| **Code patterns**        | `.agents/COMMON_PATTERNS.md`                   | Reusable snippets                     |
| **Build/test commands**  | See [Commands Reference](#-commands-reference) | npm/python commands                   |

---

## 🤖 Agent Quick Start

### You're a New Agent?

**Read in this order (15 minutes total):**

1. **Your role-specific brief** (5 min)
   - Architect → `.agents/ARCHITECT_BRIEF.md`
   - Code → `.agents/CODE_BRIEF.md`
   - Testing → `.agents/TEST_BRIEF.md`
   - Project Manager → `.agents/PROJECT_MANAGER_BRIEF.md`

2. **How handoffs work** (3 min)
   - → `.agents/HANDOFF_PROTOCOL.md`

3. **Current task status** (2 min)
   - → `.agents/TODO_STATE.md` (what am I doing?)

4. **Previous context** (3 min)
   - → `.agents/CHANGELOG.md` (last 3 entries)

5. **References as needed**
   - → `.agents/CONSTRAINTS.md` (rules to follow)
   - → `.agents/SEMANTIC_RULES.md` (validation)
   - → `.agents/COMMON_PATTERNS.md` (code examples)

**You're ready to work.** Your brief tells you exactly what to do.

---

## 📖 Token System Overview

### Semantic Token Categories

**Mode-Dependent** (change color based on light/dark theme):

- `surface.*` - Backgrounds, elevations, overlays
- `text.*` - Text colors (primary, secondary, tertiary, inverse for high-contrast text)
- `border.*` - Dividers and outlines
- `interactive.*` - Button and link states
- `feedback.*` - Error, success, warning, info
- `tag.*`, `channel.*`, `input.*` - Component-specific colors

**Mode-Independent** (maintain fixed colors regardless of theme):

- `surface.static.dark` - Always black (#000000)
- `surface.static.light` - Always white (#ffffff)
- `text.static.dark` - Always black (#000000)
- `text.static.light` - Always white (#ffffff)
- `border.static.dark` - Always black (#000000)
- `border.static.light` - Always white (#ffffff)

👉 **See**: `docs/semantic-colour.md` for detailed color mapping and static token usage

---

### 3-Layer Architecture (CRITICAL)

```
┌─────────────────────────────────────────────┐
│ FOUNDATION LAYER (Primitives)               │
│ • Colors: #FFFFFF, #000000, etc.           │
│ • Font sizes: 8px, 10px, 12px, ...         │
│ • Spacing: 4px, 8px, 16px, ...             │
│ Reference: {foundation.brand.white}        │
└─────────────────────────────────────────────┘
                     ↑
                References ONLY
                     ↑
┌─────────────────────────────────────────────┐
│ PALETTE LAYER (Ramps & Variants)            │
│ • Brand ramps: aqua, sky, neutral (100-1000)│
│ • Channel ramps: comment, like, share       │
│ • Viewport scales: Small, Medium, Large     │
│ Reference: {brand.core.ramp.neutral.600}   │
└─────────────────────────────────────────────┘
                     ↑
                References ONLY Palette
                     ↑
┌─────────────────────────────────────────────┐
│ SEMANTIC LAYER (Usage Tokens)               │
│ • interactive: primary, secondary, disabled │
│ • feedback: success, error, warning         │
│ • text: primary, secondary, tertiary        │
│ • surface: background, elevated             │
│ Reference: {semantic.interactive.primary}  │
└─────────────────────────────────────────────┘
```

### Key Rules (Violations = Auto-Reject)

| Rule                                  | Why                      | Example                                                |
| ------------------------------------- | ------------------------ | ------------------------------------------------------ |
| **Semantic → Palette ONLY**           | Enables theme switching  | ❌ `{foundation.blue}` ✅ `{brand.core.ramp.blue.600}` |
| **No circular references**            | Breaks token resolution  | ❌ A→B→C→A ✅ A→B→C                                    |
| **Font weights are strings**          | Figma export requirement | ❌ `700` ✅ `"Bold"`                                   |
| **No raw values in Palette/Semantic** | Can't theme or update    | ❌ `"#FF00FF"` ✅ `{foundation.brand.aqua}`            |

👉 **See**: `.agents/CONSTRAINTS.md` for all rules

---

## 🚀 How to Run Phases

### The 6-Phase Plan

| Phase | Task                                  | Duration | Status     |
| ----- | ------------------------------------- | -------- | ---------- |
| **1** | Create `.agents/` coordination system | 2-3h     | ✅ DONE    |
| **2** | Reorganize documentation              | 2-3h     | 📋 PLANNED |
| **3** | Reorganize data files (CSVs)          | 1h       | 📋 PLANNED |
| **4** | Reorganize resources (Figma, plugins) | 1h       | 📋 PLANNED |
| **5** | Migrate tokens.json to `src/`         | 3-4h     | 📋 PLANNED |
| **6** | Cleanup & archive                     | 1h       | 📋 PLANNED |

**See**: `.agents/PHASE_REFERENCE.md` for detailed phase breakdown

### How to Execute a Phase

**3-Step Process:**

#### Step 1: Architect Plans (1-2 hours)

```
Read: ARCHITECT_BRIEF.md + CONSTRAINTS.md
Do:
  1. Choose phase from PHASE_REFERENCE.md
  2. Write ARCHITECTURE.md (your blueprint)
  3. Update TODO_STATE.md to "READY_FOR_CODE"
  4. Add entry to CHANGELOG.md
Output: ARCHITECTURE.md written, TODO_STATE.md updated
```

#### Step 2: Code Implements (2-3 hours)

```
Read: ARCHITECTURE.md + CODE_BRIEF.md + COMMON_PATTERNS.md
Do:
  1. Implement exactly as ARCHITECTURE.md specifies
  2. Run: npm run test:output (must pass)
  3. Run: npm run build:output (must succeed)
  4. Commit: git commit -m "feat(tokens): ..."
  5. Update TODO_STATE.md to "READY_FOR_TESTING"
  6. Add entry to CHANGELOG.md
Output: Code committed, tests passing, build succeeding
```

#### Step 3: Testing Validates (1 hour)

```
Read: TEST_BRIEF.md + CONSTRAINTS.md + SEMANTIC_RULES.md
Do:
  1. Run: npm run test:output (automated)
  2. Run: npm run build:output (build validation)
  3. Check all CONSTRAINTS.md rules manually
  4. Update TODO_STATE.md to "TESTING_PASSED" or "NEEDS_REWORK"
  5. Add entry to CHANGELOG.md
Output: Phase passed or issues identified for rework
```

### Execution Models

**Choose One:**

#### Sequential (Safe)

```
Architect → Code → Testing → Next phase
Total: 4-5 hours per phase
Best for: Learning, high-risk changes
```

#### Parallel (Recommended)

```
Architect planning Phase 2 WHILE Code implements Phase 1
Speedup: 2x faster, still coordinated
Best for: Normal operation
```

#### Full Parallel (Fastest)

```
Architect Phase 3 + Code Phase 2 + Testing Phase 1 (simultaneously)
Speedup: 3-5x faster
Best for: Low-risk, coordinated teams
```

👉 **See**: `.agents/PARALLEL_EXECUTION_GUIDE.md` for detailed examples

---

## 📂 Repository Structure

### Current Layout

```
packages/tokens/
├── tokens.json                    ← Current source of truth (44,763 lines)
├── README.md                      ← You are here
├── styleguide.md                  ← AI agent rules (used by briefs)
│
├── data/                          ← Data files
│   └── resolved-hexes.json         ← Figma-resolved hex values
│
├── .agents/                       ← AGENT COORDINATION (Phase 1 ✅)
│   ├── README.md                  ← System overview
│   ├── ARCHITECT_BRIEF.md         ← For Architect Agent
│   ├── CODE_BRIEF.md              ← For Code Agent
│   ├── TEST_BRIEF.md              ← For Testing Agent
│   ├── HANDOFF_PROTOCOL.md        ← How to pass work
│   ├── TODO_STATE.md              ← Current task (THE TRAFFIC LIGHT)
│   ├── CHANGELOG.md               ← Audit trail
│   ├── CONSTRAINTS.md             ← Rules (non-negotiable)
│   ├── ARCHITECTURE.md            ← Current blueprint
│   ├── TOKEN_SYSTEM_SUMMARY.md    ← Token facts
│   ├── SEMANTIC_RULES.md          ← Validation checklist
│   ├── PHASE_REFERENCE.md         ← 6 phases overview
│   ├── COMMON_PATTERNS.md         ← Code patterns
│   └── PARALLEL_EXECUTION_GUIDE.md ← How to run in parallel
│
├── .planning-archive/             ← OLD DOCS (for reference)
│   ├── .MULTI_AGENT_IMPLEMENTATION_PLAN.md
│   ├── .WORKFLOW_VISUAL_SUMMARY.md
│   └── [8 more original planning docs]
│
├── docs/                          ← DOCUMENTATION (Phase 2  📋)
│   ├── design-token-framework.md
│   ├── Semantic Token Usage Guide.md
│   ├── ramp-colors-guide.md
│   └── [more docs to reorganize]
│
├── scripts/                       ← AUTOMATION & UTILITIES
│   ├── token-operations.py        ← Main bulk token editor
│   ├── colors/                    ← Color analysis utilities
│   │   ├── identify-ramp-base-steps.py
│   │   └── validate-ramps.py
│   ├── tokens/                    ← Token analysis/transformation utilities (Phase 6)
│   │   ├── README.md              ← Full documentation
│   │   ├── analyze-channel-text.js
│   │   ├── check-overlay.js
│   │   ├── deep-clean-tokens.py
│   │   ├── fix-*.py (5 utilities)
│   │   ├── flatten-tokens-*.py (2 utilities)
│   │   └── generate-color-csv.js
│   └── README.md
│
├── resources/                     ← DESIGN RESOURCES (Phase 4)
│   ├── figma-make-assets/         ← Figma Make CSS + guidelines
│   ├── json-to-figma-variables-plugin/ ← Figma plugin research
│   └── component-usage/           ← Component token usage
│
├── src/                           ← SOURCE (Phase 5)
│   └── tokens.json                ← Single source of truth (44,762 lines)
│
└── [Other files: release docs, config]
```

### Completed Reorganization (Phases 1-6)

| Phase | Task                          | Status  | Details                                    |
| ----- | ----------------------------- | ------- | ------------------------------------------ |
| **1** | Agent coordination system     | ✅ DONE | .agents/ with briefs, state, CHANGELOG     |
| **2** | Documentation reorganization  | ✅ DONE | docs/reference/, docs/guides/, docs/brand/ |
| **3** | Data file reorganization      | ✅ DONE | CSV files moved to data/                   |
| **4** | Resources reorganization      | ✅ DONE | Design assets in resources/                |
| **5** | tokens.json migration to src/ | ✅ DONE | Single source of truth at src/tokens.json  |
| **6** | Cleanup & archive utilities   | ✅ DONE | Scripts moved to scripts/tokens/ (Phase 6) |

👉 **Repository reorganization complete.** See `.agents/CHANGELOG.md` for full audit trail.

---

## 💻 Commands Reference

### Building & Testing

```bash
# Run all token tests
npm run test:output
# Expected output: ✅ All tests pass

# Build tokens → CSS/JS themes
npm run build:output
# Creates: packages/output/lib/theme.js

# Validate JSON syntax
python3 -m json.tool packages/tokens/src/tokens.json > /dev/null
# No output = valid, error = fix syntax
```

### Token Operations

```bash
# Bulk add descriptions to tokens
cd packages/tokens
python3 scripts/token-operations.py describe "Foundation.spacing.fluid.*" \
  --template "Fluid spacing - scales with viewport"

# Reorder tokens numerically (010, 020, ... 100)
python3 scripts/token-operations.py reorder "Foundation.display" --pattern numeric

# Identify ramp base steps
python3 scripts/colors/identify-ramp-base-steps.py
```

### Git Workflow

```bash
# See changes
git status

# Commit with clear message (Conventional Commits)
git commit -m "feat(tokens): add semantic feedback tokens"
git commit -m "fix(tokens): update neutral ramp contrast"
git commit -m "docs(tokens): update color guidelines"

# See recent commits
git log --oneline | head -10
```

---

## 🎯 Workflow Checklist

### Before Starting Work

```
□ Read your role-specific brief (.agents/*_BRIEF.md)
□ Check TODO_STATE.md for current task
□ Read CHANGELOG.md last 3 entries (what happened before?)
□ Understand CONSTRAINTS.md violations (won't tolerate these)
```

### During Work

```
□ Architect: Write ARCHITECTURE.md blueprint
□ Code: Implement + test + commit
□ Testing: Validate + report results
```

### Handing Off to Next Agent

```
□ Update TODO_STATE.md with new status
□ Add entry to CHANGELOG.md
□ Include "For Next Agent" notes (what to focus on?)
```

### After Phase Complete

```
□ Mark as TESTING_PASSED in TODO_STATE.md
□ Verify CHANGELOG.md has entry
□ Next Architect Agent reads PHASE_REFERENCE.md for next phase
```

---

## 🚨 Troubleshooting

### "I don't know what to do"

**Solution**: Read TODO_STATE.md (current task) → Read ARCHITECTURE.md (what to build) → Read your role brief

### "Tests failing"

**Solution**:

1. Run: `python3 -m json.tool tokens.json > /dev/null` (check syntax)
2. Read error message carefully
3. Check: `.agents/CONSTRAINTS.md` (what rule was violated?)
4. Fix and re-run: `npm run test:output`

### "Build error"

**Solution**: Usually circular reference or undefined token

1. Run: `npm run build:output` (read error)
2. Check: `.agents/CONSTRAINTS.md` (circular refs section)
3. Trace token references
4. Fix and retry

### "Lost context, what happened?"

**Solution**: Read `.agents/CHANGELOG.md` (last 3 entries = full context)

### "Need code examples"

**Solution**: Check `.agents/COMMON_PATTERNS.md` (reusable snippets)

### "Don't understand the token system"

**Solution**: Read `.agents/TOKEN_SYSTEM_SUMMARY.md` (quick facts) or this README's [Token System Overview](#-token-system-overview)

### "Need validation rules"

**Solution**:

- Critical violations: `.agents/CONSTRAINTS.md`
- Token-specific rules: `.agents/SEMANTIC_RULES.md`

### "How do I parallelize?"

**Solution**: Read `.agents/PARALLEL_EXECUTION_GUIDE.md` (detailed strategies + examples)

---

## 📊 Key Files at a Glance

| File                            | Size | Purpose              | When to Read            |
| ------------------------------- | ---- | -------------------- | ----------------------- |
| **ARCHITECT_BRIEF.md**          | 6K   | Planning guide       | If you're Architect     |
| **CODE_BRIEF.md**               | 8.5K | Implementation guide | If you're Code Agent    |
| **TEST_BRIEF.md**               | 8K   | Validation guide     | If you're Testing Agent |
| **CONSTRAINTS.md**              | 7K   | Rules checklist      | Before testing          |
| **TODO_STATE.md**               | 8K   | Current task         | Start of every session  |
| **CHANGELOG.md**                | 7K   | What happened        | Context recovery        |
| **HANDOFF_PROTOCOL.md**         | 9K   | How handoffs work    | First time setup        |
| **TOKEN_SYSTEM_SUMMARY.md**     | 7K   | Token facts          | Understanding system    |
| **SEMANTIC_RULES.md**           | 8K   | Validation rules     | During testing          |
| **PHASE_REFERENCE.md**          | 7K   | Phase overview       | Planning next phase     |
| **COMMON_PATTERNS.md**          | 8K   | Code examples        | During coding           |
| **PARALLEL_EXECUTION_GUIDE.md** | 17K  | Parallel strategies  | Planning execution      |
| **README.md** (here)            | 8K   | This guide           | Navigation & overview   |

---

## 🎯 Decision Tree: "What Do I Do Right Now?"

```
START HERE
│
├─ "I'm new to this repo"
│  └─ Read: .agents/README.md (overview) + your role brief
│
├─ "I need to work on a phase"
│  ├─ Architect? → Read ARCHITECT_BRIEF.md, write ARCHITECTURE.md
│  ├─ Code? → Read CODE_BRIEF.md + ARCHITECTURE.md, implement
│  └─ Testing? → Read TEST_BRIEF.md, run validation
│
├─ "I need to understand the token system"
│  └─ Read: TOKEN_SYSTEM_SUMMARY.md (quick) or this README's "Token System Overview"
│
├─ "I'm stuck, something's broken"
│  └─ Jump to: Troubleshooting (above)
│
├─ "I want to run agents in parallel"
│  └─ Read: PARALLEL_EXECUTION_GUIDE.md (strategies + examples)
│
└─ "I need to find something specific"
   └─ Use: "Finding Files in This Repo" table at top
```

---

## 📝 Workflow Example: Running Phase 1

### Architect Agent (Morning, 1 hour)

```
Read:
  1. ARCHITECT_BRIEF.md (understand role)
  2. CONSTRAINTS.md (what can't violate)
  3. PHASE_REFERENCE.md (phase details)

Work:
  1. Create .agents/ARCHITECTURE.md with blueprint
  2. Check: Does it respect all CONSTRAINTS.md?
  3. Update: TODO_STATE.md to "READY_FOR_CODE"
  4. Log: Add entry to CHANGELOG.md

Output:
  ✅ ARCHITECTURE.md written
  ✅ TODO_STATE.md marked "READY_FOR_CODE"
  ✅ CHANGELOG.md has entry
```

### Code Agent (Late morning - noon, 2 hours)

```
Read:
  1. CODE_BRIEF.md (understand role)
  2. ARCHITECTURE.md (what to build)
  3. COMMON_PATTERNS.md (code examples)

Work:
  1. Implement EXACTLY what ARCHITECTURE.md says
  2. Test: npm run test:output ✅
  3. Build: npm run build:output ✅
  4. Commit: git commit -m "feat(tokens): ..."
  5. Update: TODO_STATE.md to "READY_FOR_TESTING"
  6. Log: Add entry to CHANGELOG.md

Output:
  ✅ Code committed
  ✅ npm tests passing
  ✅ Build succeeds
  ✅ TODO_STATE.md marked "READY_FOR_TESTING"
```

### Testing Agent (Afternoon, 1 hour)

```
Read:
  1. TEST_BRIEF.md (understand role)
  2. ARCHITECTURE.md (what was supposed to happen)
  3. CONSTRAINTS.md (rules to validate)

Work:
  1. Run: npm run test:output ✅
  2. Run: npm run build:output ✅
  3. Check: All CONSTRAINTS.md rules
  4. Result: TESTING_PASSED or NEEDS_REWORK
  5. Update: TODO_STATE.md
  6. Log: Add entry to CHANGELOG.md

Output:
  ✅ Phase validated
  ✅ TODO_STATE.md marked "TESTING_PASSED"
  ✅ Ready for next phase
```

---

## 🌟 Pro Tips

### Tip 1: Use CHANGELOG.md for Context Recovery

When joining a phase mid-way, read the last 3 CHANGELOG entries (~5 minutes).
Gives you full context without reading 50K of docs.

### Tip 2: Check TODO_STATE.md First

At the start of EVERY session: "What am I doing?" → Check TODO_STATE.md
Takes 30 seconds, prevents wasted work.

### Tip 3: Font Weights Gotcha

❌ `"fontWeight": 700` (breaks Figma)  
✅ `"fontWeight": "Bold"` (correct)

Burned in styleguide.md. Copy this rule.

### Tip 4: Use Scripts for Bulk Operations

❌ Manual find-replace for 10+ tokens (error-prone)  
✅ Use `token-operations.py` (reliable, auditable)

See: `.agents/COMMON_PATTERNS.md` for examples

### Tip 5: Parallelize Non-Blocking Phases

- Phase 2 (docs) doesn't need Phase 1 (infra) complete
- Phase 3 (data) doesn't need Phase 2 complete
- Phase 4 (resources) doesn't need Phase 3 complete

Run 2-3 in parallel. Saves hours.

See: `.agents/PARALLEL_EXECUTION_GUIDE.md`

---

## ✅ You Know Your Way Around When

```
□ You can find files in this repo (60 second max)
□ You know what TODO_STATE.md does (it's the traffic light)
□ You understand the 3-layer token architecture
□ You know CONSTRAINTS.md violations = auto-reject
□ You can run npm test:output + npm build:output
□ You know to add CHANGELOG.md entries
□ You can explain the agent handoff process
```

If yes to all: **YOU'RE GOOD TO GO** 🚀

---

## 📞 Quick Links

| Need                   | Go To                                      |
| ---------------------- | ------------------------------------------ |
| System overview        | `.agents/README.md`                        |
| Your role instructions | `.agents/*_BRIEF.md` (Architect/Code/Test) |
| Current task status    | `.agents/TODO_STATE.md`                    |
| What happened before   | `.agents/CHANGELOG.md`                     |
| Token rules            | `.agents/CONSTRAINTS.md`                   |
| Validation checklist   | `.agents/SEMANTIC_RULES.md`                |
| Phase details          | `.agents/PHASE_REFERENCE.md`               |
| Code examples          | `.agents/COMMON_PATTERNS.md`               |
| Parallel execution     | `.agents/PARALLEL_EXECUTION_GUIDE.md`      |
| How handoffs work      | `.agents/HANDOFF_PROTOCOL.md`              |
| Token facts            | `.agents/TOKEN_SYSTEM_SUMMARY.md`          |
| This guide             | `packages/tokens/README.md`                |

---

## 🎯 Bottom Line

**This repo is organized into agent-friendly layers:**

1. **Coordination** (`.agents/`) - How agents communicate
2. **Tokens** (`tokens.json`) - The actual token data
3. **Documentation** (`docs/`, etc.) - Context and guides
4. **Automation** (`scripts/`) - Build and test utilities
5. **Archive** (`.planning-archive/`) - Historical docs

**When you need something**, use the tables and decision trees above to find it in <1 minute.

**When you're stuck**, follow the troubleshooting section.

**When you're running a phase**, follow the 3-step process (Architect → Code → Testing).

**That's it. You've got this.** 🚀

---

## 📝 VS Code Multi-Agent Workflow Guide

**For detailed copy-paste prompts for all phases**, see the separate execution guide document that contains:

- Phase-by-phase prompts for Architect/Code/Testing agents
- VS Code setup instructions
- Sequential vs parallel execution strategies
- Tool-specific instructions (Copilot, Cline, etc.)

**To run phases 2-6**, ask for the execution prompts document.

---

**Last Updated**: January 1, 2026  
**Maintained by**: Multi-Agent System  
**Next Review**: After Phase 6 completion
