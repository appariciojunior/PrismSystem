# Skill: Mobbin MCP

**Purpose**: Query Mobbin's library of 600,000+ real shipped product screens to ground design decisions in proven patterns. Use this before committing to any layout, interaction pattern, or component structure.

This applies to both:

- Reference workflows (for example: "which tokens should I use for a modal?")
- Execution workflows (for example: implementation, Figma operations, or planning a new component)

---

## When to Invoke

| Trigger                                 | Example                                                 |
| --------------------------------------- | ------------------------------------------------------- |
| Designing a new component or pattern    | "I need to design a paywall"                            |
| Stuck on a micro-decision               | "Should the CTA label say 'Get started' or 'Continue'?" |
| UI pattern feels uncertain or dated     | "How do top apps handle onboarding permission prompts?" |
| Validating a layout before implementing | "Show me checkout flows from top e-commerce apps"       |
| Comparing competitor approaches         | "How do Revolut and Monzo handle KYC screens?"          |

**architect and figma-executor**: Mobbin search is mandatory before scoping any new component or layout task. See the [Mandatory Trigger Conditions](#mandatory-trigger-conditions-architect-and-figma-executor) section below.

---

## Available Tools

The Mobbin MCP exposes tools for searching and retrieving real app screens. Common operations:

- **Search by design pattern or UI concept** — "paywalls from finance apps", "notification permission prompts", "pull-to-refresh animations"
- **Search by app name** — "Revolut checkout flow", "Duolingo onboarding"
- **Search by platform** — iOS, Android, Web
- **Search by category** — Finance, Health, E-commerce, Social, Productivity

> Tools and exact method signatures are resolved at runtime via the MCP server. Always prefer natural-language intent queries — Mobbin's search is designed for them.

---

## Prompt Templates

Copy and adapt these for common design decisions:

```
# Pattern discovery
"Show me 10 [pattern] examples from top [category] apps"

# Competitor comparison
"Compare how [App A] and [App B] handle [flow or screen]"

# Micro-copy patterns
"How do top apps write microcopy for [action/state]?"

# Permission / sensitive flows
"How do top apps ask for [permission] without getting denied?"

# Error / empty states
"Show me the most effective empty state designs from productivity apps"

# Conversion patterns
"Show me paywall designs from top subscription apps that use a single-tier model"
```

---

## Synthesis Methodology

After retrieving screens, extract named patterns to inform token and layout decisions:

1. **Identify structural patterns** — layout grid, information hierarchy, CTA placement
2. **Extract visual rhythm signals** — spacing cadence, type scale relationships, icon usage
3. **Note interaction conventions** — state transitions, feedback timing, affordance signals
4. **Map to token implications** — which findings affect spacing, color, or typography tokens?
5. **Cite evidence** — always reference which apps/screens informed a decision

---

## Mandatory Trigger Conditions (architect and figma-executor)

The architect and figma-executor agents **must** query Mobbin before:

- Scoping a new component or variant set
- Deciding on a layout structure or information hierarchy
- Choosing between two or more valid interaction patterns
- Proposing a new spec that has no existing precedent in the design system
- Producing reference-only token guidance for component or pattern prompts

For reference-only responses, use this sequence:

1. Query Mobbin for component/pattern examples.
2. Extract pattern cues relevant to token application.
3. Return deterministic token tables per the token reference output contract.

**How to integrate findings into the Execution Report:**

Add a `### Pattern Reference` section to the Execution Report:

```markdown
### Pattern Reference

| App        | Screen               | Pattern Applied            |
| ---------- | -------------------- | -------------------------- |
| [App name] | [Screen description] | [What was adopted and why] |
```

---

## Auth Note

Mobbin MCP uses OAuth. On first use in a new VS Code session, a browser window will open for sign-in. This is a one-time step per session. Requires a paid Mobbin account (Pro or Team plan).

---

## What Mobbin MCP Is Not

- Not a source of truth for Design System tokens — `packages/tokens/src/tokens.json` is always the source of truth.
- Not a replacement for Figma specs — it informs decisions, not implementation.
- Not authoritative for brand decisions — findings must be filtered through the brand principles in `packages/tokens/docs/getting-started.md`.
