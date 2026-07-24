# Agent Knowledge Integration Guide

**Date:** 18 May 2026  
**Status:** Embedded knowledge ready for architect & figma-executor agents  
**Strategy:** Self-contained skill references (docmancer optional for validation)

---

## Knowledge Base Created

Three comprehensive skill documents now serve as **foundational reference material** for both agents:

### 1. **Design Token Naming Architecture**

📍 `.agents/skills/token-foundations/design-token-naming-architecture.md`

**For:** Both agents (architect & figma-executor)  
**Contains:**

- 3-tier token architecture (Foundation → Palette → Semantic)
- CTI and tier-based naming patterns
- 10 naming best practices with examples
- Dark mode & theme architecture
- Anti-patterns to avoid
- Quick reference decision tree

**Use when:**

- Proposing new tokens (architect)
- Validating token names for consistency (both)
- Planning semantic layers
- Setting up dark mode support

### 2. **Figma Variables Implementation Guide**

📍 `.agents/skills/figma-integration/figma-variables-implementation-guide.md`

**For:** Figma-executor agent (primary)  
**Contains:**

- Variables vs. Styles decision matrix
- Collection architecture (mirror token layers in Figma)
- Modes setup for light/dark themes
- Variable aliasing patterns
- Component property binding best practices
- Dev Mode integration
- Performance & maintenance
- Pre-implementation checklist

**Use when:**

- Creating/restructuring variable collections
- Setting up themes/modes
- Binding variables to component properties
- Exporting tokens to code
- Validating Figma structure

### 3. **Token Governance & Scaling Reference**

📍 `.agents/skills/governance/token-governance-and-scaling.md`

**For:** Architect agent (primary)  
**Contains:**

- 6-phase token lifecycle (Discovery → Maintenance)
- Governance gates (Foundation/Palette/Semantic approval levels)
- 4 scaling challenges + solutions (proliferation, themes, cross-product, docs)
- Approval workflows by layer
- Semantic versioning strategy
- Team roles & responsibilities
- Quarterly audit checklists
- Antipatterns to avoid

**Use when:**

- Planning major token changes
- Creating governance proposals
- Evaluating whether change is foundation/palette/semantic
- Scaling the token system
- Planning deprecation strategies

---

## How Agents Should Use These Documents

### Architect Agent Workflow

**Before proposing any token change:**

1. **Consult naming architecture** for consistency

   ```
   Check: Is my proposed token name following
   the CTI/tier pattern? (category-concept-property-modifier)
   ```

2. **Consult governance guide** to determine gate level

   ```
   Check: Is this Foundation (🔴 highest), Palette (🟡 medium),
   or Semantic (🟢 low) layer change?
   ```

3. **Reference examples** in both docs

   ```
   "My token is similar to: [example from docs]
   Best practice for this is: [pattern from docs]"
   ```

4. **Create blueprint** citing internalized knowledge
   ```
   "Blueprint grounded in:
   - Token Naming Architecture (section 3: Naming Best Practices)
   - Governance & Scaling (section 2: Governance Gates)
   - Pattern precedent: [reference specific example]"
   ```

### Figma-Executor Agent Workflow

**Before any Figma implementation work:**

1. **Consult naming architecture** to validate token names

   ```
   Check: Are all token names consistent with
   the naming pattern documented?
   ```

2. **Consult Figma guide** for implementation strategy

   ```
   "For this task, I will:
   - Use Variables (per section 1: Variables vs. Styles)
   - Structure collection as: [hierarchy from guide]
   - Set up modes for: [reference section 3: Modes]"
   ```

3. **Follow checklist** before implementation

   ```
   Per section 10 checklist:
   ☑ Foundation layer values are raw (hex/px/weight)
   ☑ Palette refs only foundation
   ☑ Semantic refs only palette
   ☑ All modes have all values
   ```

4. **Reference examples** when needed
   ```
   "Component property binding follows section 5 best practice:
   - Don't over-bind (only 1-2 vars per component)
   - Use component properties for semantic switching"
   ```

---

## Document Cross-References

These three skills work together:

### Naming → Figma Implementation

```
Architect decides: "Add color-button-primary token"
  ↓ (uses naming architecture: semantic layer naming pattern)
  ↓
Figma-Executor implements:
  - Group: color/semantic/button/
  - Variable: primary
  - (follows Figma guide section 2: hierarchy)
  - (validates against Figma guide section 7: checklist)
```

### Governance → Figma Execution

```
Architect determines: "This is Palette layer (🟡 gate)"
  ↓ (uses governance guide: section 2)
  ↓
Figma-Executor follows:
  - "Palette tokens have mode-dependent values"
  - (implements per Figma guide section 3: Modes)
  - Sets up Light/Dark mode mappings
```

### Scaling → Naming

```
Architect notices: "Too many semantic tokens (token explosion)"
  ↓ (uses governance guide: section 3, Challenge 1)
  ↓
Solution: Review naming with Naming Architecture
  - Enforce category-concept-property pattern
  - Remove duplicates
  - Merge edge-case tokens
```

---

## Docmancer as Optional Validation

Docmancer is **NOT required** for agent operation. These three skill documents contain all necessary guidance.

**Docmancer should only be used when:**

- Architect wants external precedent confirmation ("Is industry doing this?")
- Figma-executor wants to validate Figma-specific patterns
- Planning major architecture shift and want to cross-check industry standards

**Example optional usage:**

```
Architect: "My proposal uses Foundation/Palette/Semantic 3-layer model.
Let me validate this against industry via docmancer."

Command: docmancer query "What are standard token architectures in design systems?"

Result confirms: RedHat, Contentful, Netguru all use 3-tier model.

Architect conclusion: "Our approach is validated by industry precedent."
```

---

## Knowledge Maintenance

### Update Triggers

- **Figma feature change:** Update Figma guide section with new capability
- **Governance policy change:** Update governance guide with new approval workflows
- **Naming convention drift:** Update naming architecture with new examples
- **Quarterly audit:** Review examples for accuracy and relevance

### File Locations (Ready to Use)

```
packages/tokens/.agents/skills/
├── token-foundations/
│   └── design-token-naming-architecture.md         ← Naming patterns
├── figma-integration/
│   └── figma-variables-implementation-guide.md     ← Figma impl
└── governance/
    └── token-governance-and-scaling.md             ← Governance
```

---

## Next Steps for Integration

### Immediate (Ready Now)

- [x] Naming architecture created and ready for use
- [x] Figma guide created and ready for use
- [x] Governance guide created and ready for use
- [ ] **Update architect brief** to reference these documents

### Short Term (This Week)

- [ ] Update architect brief with skill document references
- [ ] Update figma-executor brief with skill document references
- [ ] Create `.agents/templates/blueprint-knowledge-section.md` for architects to cite these docs
- [ ] Test with a sample token proposal (architect cites naming+governance guides)

### Medium Term (Next 2 Weeks)

- [ ] Add usage examples to briefs: "See [Naming Architecture](link) section X"
- [ ] Create `.agents/checklists/token-proposal-checklist.md` that references all three guides
- [ ] Document in briefs: "These documents are your primary reference, not docmancer"

---

## Quick Reference: Where to Find What

| Question                                 | Document             | Section                             |
| ---------------------------------------- | -------------------- | ----------------------------------- |
| "What naming pattern should I use?"      | Naming Architecture  | Section 2 (CTI/Tier patterns)       |
| "Is this foundation/palette/semantic?"   | Governance & Scaling | Section 2 (Governance Gates)        |
| "How do I set up dark mode tokens?"      | Naming Architecture  | Section 4 (Dark Mode)               |
| "How do I structure variables in Figma?" | Figma Guide          | Section 2 (Collection Architecture) |
| "What's the approval process?"           | Governance & Scaling | Section 4 (Approval Workflows)      |
| "Should I use variables or styles?"      | Figma Guide          | Section 1 (Variables vs. Styles)    |
| "How do I avoid token explosion?"        | Governance & Scaling | Section 3 (Scaling Challenges)      |
| "What's a semantic token?"               | Naming Architecture  | Section 1 (3-Tier Architecture)     |
| "How do I bind variables to components?" | Figma Guide          | Section 4 (Component Binding)       |
| "What's the deprecation strategy?"       | Governance & Scaling | Section 5 (Versioning)              |

---

**Status:** ✅ Ready for immediate use by both agents. Docmancer indexed as optional reference only.
