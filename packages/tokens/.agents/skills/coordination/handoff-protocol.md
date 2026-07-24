---
name: handoff-protocol
description: Standardize agent-to-agent handoffs with structured state transfer. Ensures context preservation, clear task boundaries, and completion criteria.
license: MIT
metadata:
  category: coordination
  agents: [Architect, Code, Testing]
  autonomy: autonomous
---

# Handoff Protocol

## Purpose

Standardize agent-to-agent handoffs with structured state transfer, ensuring context preservation and clear task boundaries.

## Preconditions

- Current agent has completed their task phase
- TODO_STATE.md is accessible
- CHANGELOG.md is accessible

## Inputs

| Parameter     | Type   | Required | Description                             |
| ------------- | ------ | -------- | --------------------------------------- |
| `from_agent`  | enum   | yes      | `architect`, `code`, `testing`          |
| `to_agent`    | enum   | yes      | `architect`, `code`, `testing`, `human` |
| `task_status` | enum   | yes      | `complete`, `blocked`, `needs_rework`   |
| `context`     | object | yes      | Structured handoff context (see below)  |

For component docs/specs tasks, `context` must also include these verification flags:

- `property_matrix_verified` (`yes`/`no`)
- `framework_positioning_verified` (`yes`/`no`)
- `concise_specs_verified` (`yes`/`no`)
- `owner_post_subagent_check` (`yes`/`no`)

## Handoff Context Structure

```yaml
handoff:
  timestamp: '2026-02-06T14:30:00Z'
  from: architect
  to: code

  task:
    name: 'Add text.inverse semantic tokens'
    phase: '3.2'
    status: complete

  files_changed:
    - path: '.agents/ARCHITECTURE.md'
      change_type: 'updated'
      summary: 'Blueprint for text.inverse tokens'

  decisions_made:
    - decision: 'Use neutral.1000 for inverse text in both modes'
      rationale: 'Maintains semantic naming while inverting visual appearance'

  completion_criteria:
    - 'Tokens added to light/ core and dark/ core'
    - 'Values reference palette (not foundation)'
    - 'Tests pass (npm run test:output)'

  verification_flags:
    property_matrix_verified: yes
    framework_positioning_verified: yes
    concise_specs_verified: yes
    owner_post_subagent_check: yes

  blockers: []

  notes_for_next_agent:
    - 'Remember dark mode ramp reversal for neutral'
    - 'Check contrast against surface.accent'
```

## Procedure

### Step 1: Prepare Handoff Package

```python
def prepare_handoff(from_agent, to_agent, task_status, context):
    """Prepare structured handoff package"""

    handoff = {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'from': from_agent,
        'to': to_agent,
        'task': context['task'],
        'status': task_status
    }

    # Add what was done
    if 'files_changed' in context:
        handoff['files_changed'] = context['files_changed']

    # Add decisions made
    if 'decisions_made' in context:
        handoff['decisions_made'] = context['decisions_made']

    # Add completion criteria for next agent
    if 'completion_criteria' in context:
        handoff['completion_criteria'] = context['completion_criteria']

    # Add any blockers
    if 'blockers' in context:
        handoff['blockers'] = context['blockers']

    # Add notes
    if 'notes_for_next_agent' in context:
        handoff['notes'] = context['notes_for_next_agent']

    return handoff
```

### Step 2: Update TODO_STATE.md

```python
def update_todo_state(handoff):
    """Update TODO_STATE.md with handoff status"""

    status_update = f"""
## Current Handoff

**Status**: {handoff['status'].upper()}
**From**: {handoff['from'].title()} Agent
**To**: {handoff['to'].title()} Agent
**Timestamp**: {handoff['timestamp']}

### Task
- **Name**: {handoff['task']['name']}
- **Phase**: {handoff['task']['phase']}

### Files Changed
"""

    for f in handoff.get('files_changed', []):
        status_update += f"- `{f['path']}` ({f['change_type']}): {f['summary']}\n"

    if handoff.get('completion_criteria'):
        status_update += "\n### Completion Criteria for Next Agent\n"
        for c in handoff['completion_criteria']:
            status_update += f"- [ ] {c}\n"

    if handoff.get('blockers'):
        status_update += "\n### ⚠️ Blockers\n"
        for b in handoff['blockers']:
            status_update += f"- {b}\n"

    if handoff.get('notes'):
        status_update += "\n### Notes\n"
        for n in handoff['notes']:
            status_update += f"- {n}\n"

    return status_update
```

### Step 3: Log to CHANGELOG.md

```python
def log_to_changelog(handoff):
    """Add brief handoff entry to changelog"""

    entry = f"""
### {handoff['timestamp'][:10]} - {handoff['task']['name']}
- **Agent**: {handoff['from'].title()}
- **Status**: {handoff['status']}
- **Handed to**: {handoff['to'].title()}
"""

    if handoff['status'] == 'blocked':
        entry += f"- **Blocker**: {handoff['blockers'][0] if handoff.get('blockers') else 'See TODO_STATE.md'}\n"

    return entry
```

## Outputs

| Output              | Type   | Description                      |
| ------------------- | ------ | -------------------------------- |
| `handoff_package`   | object | Full structured handoff data     |
| `todo_state_update` | string | Markdown to add to TODO_STATE.md |
| `changelog_entry`   | string | Markdown to add to CHANGELOG.md  |
| `next_agent_prompt` | string | Suggested prompt for next agent  |

Completion rule for docs/specs handoffs:

- Do not mark handoff `complete` unless all four verification flags are `yes`, or blockers explicitly explain why not.

## Agent-Specific Handoff Templates

### Architect → Code

```yaml
handoff:
  completion_criteria:
    - 'Implement exactly what ARCHITECTURE.md specifies'
    - 'Run npm run test:output (must pass)'
    - 'Run npm run build:output (must succeed)'
    - 'Commit with descriptive message'
  notes:
    - 'Blueprint is in .agents/ARCHITECTURE.md'
    - 'Check CONSTRAINTS.md for rules'
```

### Code → Testing

```yaml
handoff:
  completion_criteria:
    - 'Verify JSON is valid'
    - 'Verify tests pass'
    - 'Verify build succeeds'
    - 'Check constraint compliance'
    - 'Verify implementation matches ARCHITECTURE.md'
  notes:
    - 'Changes committed in: [commit hash]'
    - 'Files modified: [list]'
```

### Testing → Human

```yaml
handoff:
  completion_criteria:
    - 'All tests passing'
    - 'No constraint violations'
    - 'Ready for merge/release'
  # or if failures:
  blockers:
    - 'Test failure: [description]'
    - 'Constraint violation: [description]'
```

### Testing → Code (Rework)

```yaml
handoff:
  status: needs_rework
  blockers:
    - 'Test failure: [specific test]'
    - 'Validation issue: [description]'
  completion_criteria:
    - 'Fix: [specific issue]'
    - 'Re-run tests'
    - 'Re-submit to Testing'
```

## Examples

### Example 1: Architect → Code (Success)

```
INVOKE: skill/coordination/handoff-protocol
INPUTS: {
  from_agent: "architect",
  to_agent: "code",
  task_status: "complete",
  context: {
    task: { name: "Add text.inverse tokens", phase: "3.2" },
    files_changed: [
      { path: ".agents/ARCHITECTURE.md", change_type: "created", summary: "Blueprint for inverse tokens" }
    ],
    completion_criteria: [
      "Add tokens to light/ core and dark/ core",
      "Reference palette only",
      "Tests must pass"
    ],
    notes_for_next_agent: ["Review dark mode mapping skill for neutral ramp"]
  }
}
RESULT: {
  status: "handoff_ready",
  todo_state_update: "## Current Handoff\n...",
  changelog_entry: "### 2026-02-06 - Add text.inverse tokens\n...",
  next_agent_prompt: "Code Agent: Implement text.inverse per ARCHITECTURE.md"
}
```

### Example 2: Testing → Code (Rework)

```
INVOKE: skill/coordination/handoff-protocol
INPUTS: {
  from_agent: "testing",
  to_agent: "code",
  task_status: "needs_rework",
  context: {
    task: { name: "Add text.inverse tokens", phase: "3.2" },
    blockers: [
      "Circular reference detected: text.inverse → text.primary → text.inverse"
    ],
    completion_criteria: [
      "Fix circular reference",
      "Re-run npm run test:output",
      "Re-submit for testing"
    ]
  }
}
RESULT: {
  status: "rework_required",
  todo_state_update: "## Current Handoff\n**Status**: NEEDS_REWORK...",
  next_agent_prompt: "Code Agent: Fix circular reference in text.inverse"
}
```

## Best Practices

1. **Always use structured handoffs**: Don't rely on prose descriptions
2. **Be specific about completion criteria**: Numbered checklist items
3. **Include relevant file paths**: Exact paths to documentation/changes
4. **Note mode-specific concerns**: Light/dark mode gotchas
5. **Reference relevant skills**: Point to skills for complex operations
