# Ask-First Protocol (Agent Communication Standard)

**Version**: 1.0  
**Adoption**: Soft requirement — agents reference this for structured decision-making

## Pattern

Every architectural decision, trade-off, ambiguity, or gate should be communicated via structured question format, not plain text prose.

## Tool

Use `vscode_askQuestions` for all clarifications:

```typescript
{
  "questions": [
    {
      "header": "unique_identifier",
      "question": "One-sentence question",
      "options": [
        { "label": "Option 1", "description": "Context" },
        { "label": "Option 2", "description": "Context" }
      ],
      "allowFreeformInput": true
    }
  ]
}
```

## When to Use (All Agents)

1. **Ambiguous scope** — Ask before planning
2. **Multiple valid solutions** — Present options, ask user preference
3. **Trade-offs** — Confirm risk/benefit decision
4. **Governance gates** — Confirm approval path
5. **Changelog inclusion** — Ask before including/excluding
6. **Tool selection** — Confirm which tool to use when multiple exist
7. **Iteration decisions** — Ask to continue/stop instead of assuming

## Format Rules

- **Header**: Unique identifier, lowercase, underscores (e.g., `semantic_token_mapping_decision`)
- **Question**: Concise, single sentence when possible
- **Options**: 2–4 primary options + always include `allowFreeformInput: true` for custom direction
- **Message** (optional): Rich context block above the question (markdown supported)
- **Always include freeform**: Never force-gate user to predefined options

## Example (Architect asking about token mapping)

```
Header: semantic_vs_palette_mapping
Message: "Two valid approaches:\n- Option A: New semantic token aliases palette\n- Option B: Extend palette with theme variant"
Question: "Which mapping strategy?"
Options: ["New semantic alias", "Palette variant", "Other"]
```

## Benefit

- User always has clear, actionable choices
- Decisions are logged (structured in tool history)
- No ambiguous prose → fewer follow-up clarifications
- Agents self-serve without blocking on interpretation

## Status

This is a **reference protocol**. Other agents adopt it when they need to ask clarifying questions. Not a hard mandate, but a recommended pattern for decision quality.
