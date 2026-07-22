---
name: approval-workflow
description: Manage approval workflow for token changes. Determines required labels, reviews, and sign-offs based on change type and scope.
license: MIT
metadata:
  category: governance
  agents: [Architect, Code, Testing]
  autonomy: autonomous (checking) | blocked (bypassing)
---

# Approval Workflow

## Purpose

Manage the approval workflow for token changes, ensuring proper labels, reviews, and sign-offs are in place.

## Preconditions

- PR/change context available
- Agent knows what type of changes being made

## Inputs

| Parameter             | Type     | Required | Description                                 |
| --------------------- | -------- | -------- | ------------------------------------------- |
| `change_type`         | enum     | yes      | `foundation`, `palette`, `semantic`, `docs` |
| `tokens_affected`     | number   | yes      | Count of tokens being modified              |
| `current_labels`      | string[] | no       | Labels currently on PR                      |
| `has_design_approval` | boolean  | no       | Whether design team approved                |

## Procedure

### Step 1: Determine Required Approvals

```python
def get_required_approvals(change_type, tokens_affected):
    """Determine what approvals are needed"""
    requirements = {
        'labels': [],
        'reviews': [],
        'sign_offs': [],
        'checklist_items': []
    }

    # Foundation changes
    if change_type == 'foundation':
        requirements['labels'].append('foundation-change')
        requirements['reviews'].append('design-tokens-owners')
        requirements['sign_offs'].append('design-lead')
        requirements['checklist_items'].extend([
            'Impact analysis completed',
            'Rollback plan documented',
            'Downstream token audit performed'
        ])

    # Palette changes
    elif change_type == 'palette':
        requirements['labels'].append('palette/approval')
        requirements['reviews'].append('design-tokens-owners')
        requirements['sign_offs'].append('design')
        requirements['checklist_items'].extend([
            'Design sign-off obtained',
            'WCAG contrast verified',
            'Both light/dark modes checked'
        ])

    # Semantic changes (normal)
    elif change_type == 'semantic':
        if tokens_affected > 10:
            requirements['labels'].append('bulk-change')
            requirements['checklist_items'].append('Dry-run preview reviewed')
        requirements['checklist_items'].extend([
            'JSON validated',
            'Tests passing',
            'Build successful'
        ])

    # Docs only
    elif change_type == 'docs':
        # Minimal requirements
        requirements['checklist_items'].append('Documentation in packages/tokens/')

    return requirements
```

### Step 2: Check Current Status

```python
def check_approval_status(requirements, current_labels, has_design_approval):
    """Check what's missing"""
    missing = {
        'labels': [],
        'sign_offs': [],
        'ready': True
    }

    # Check labels
    for label in requirements['labels']:
        if label not in (current_labels or []):
            missing['labels'].append(label)
            missing['ready'] = False

    # Check sign-offs
    if 'design' in requirements['sign_offs'] or 'design-lead' in requirements['sign_offs']:
        if not has_design_approval:
            missing['sign_offs'].append('design approval')
            missing['ready'] = False

    return missing
```

### Step 3: Generate Checklist

```python
def generate_checklist(requirements, current_status):
    """Generate PR checklist markdown"""
    checklist = "## Token Change Checklist\n\n"

    # Labels section
    checklist += "### Required Labels\n"
    for label in requirements['labels']:
        status = "✅" if label in (current_status.get('labels', [])) else "⬜"
        checklist += f"- {status} `{label}`\n"

    # Reviews section
    if requirements['reviews']:
        checklist += "\n### Required Reviews\n"
        for reviewer in requirements['reviews']:
            checklist += f"- ⬜ {reviewer}\n"

    # Checklist items
    checklist += "\n### Validation Checklist\n"
    for item in requirements['checklist_items']:
        checklist += f"- ⬜ {item}\n"

    return checklist
```

## Outputs

| Output         | Type    | Description                    |
| -------------- | ------- | ------------------------------ |
| `requirements` | object  | Full list of needed approvals  |
| `status`       | object  | Current approval status        |
| `ready`        | boolean | Whether all approvals in place |
| `missing`      | array   | List of missing requirements   |
| `checklist`    | string  | Markdown checklist for PR      |
| `blockers`     | array   | What's blocking merge          |

## Examples

### Example 1: Semantic change ready to go

```
INVOKE: skill/governance/approval-workflow
INPUTS: {
  change_type: "semantic",
  tokens_affected: 5,
  current_labels: []
}
RESULT: {
  ready: true,
  missing: { labels: [], sign_offs: [] },
  requirements: {
    labels: [],
    reviews: [],
    checklist_items: ["JSON validated", "Tests passing", "Build successful"]
  },
  checklist: "## Token Change Checklist\n\n### Validation Checklist\n- ⬜ JSON validated\n..."
}
```

### Example 2: Foundation change missing approvals

```
INVOKE: skill/governance/approval-workflow
INPUTS: {
  change_type: "foundation",
  tokens_affected: 1,
  current_labels: [],
  has_design_approval: false
}
RESULT: {
  ready: false,
  missing: {
    labels: ["foundation-change"],
    sign_offs: ["design approval"]
  },
  blockers: [
    "Missing label: foundation-change",
    "Missing sign-off: design approval"
  ],
  checklist: "## Token Change Checklist\n\n### Required Labels\n- ⬜ `foundation-change`\n..."
}
```

### Example 3: Bulk semantic change

```
INVOKE: skill/governance/approval-workflow
INPUTS: {
  change_type: "semantic",
  tokens_affected: 28,
  current_labels: ["bulk-change"]
}
RESULT: {
  ready: true,
  missing: { labels: [], sign_offs: [] },
  requirements: {
    labels: ["bulk-change"],
    checklist_items: [
      "Dry-run preview reviewed",
      "JSON validated",
      "Tests passing",
      "Build successful"
    ]
  }
}
```

## PR Checklist Template

```markdown
## Token Change Checklist

**Change Type**: [foundation | palette | semantic | docs]
**Tokens Affected**: [count]

### Required Labels

- [ ] `label-name` (if applicable)

### Required Approvals

- [ ] Design sign-off (if palette/foundation)
- [ ] Design Tokens Owner review (if palette/foundation)

### Validation

- [ ] JSON syntax valid (`python3 -m json.tool`)
- [ ] Tests passing (`npm run test:output`)
- [ ] Build successful (`npm run build:output`)
- [ ] Documentation updated (if applicable)

### Mode-Specific (if colors changed)

- [ ] Light mode verified
- [ ] Dark mode verified (remember ramp reversal!)
- [ ] WCAG contrast checked
```

## Integration Points

- **Pre-merge CI**: Verify labels present before merge
- **foundation-gate**: Check `foundation-change` label
- **palette-gate**: Check `palette/approval` label
- **Architect agent**: Generate and update checklists
