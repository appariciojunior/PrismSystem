---
name: rollback
description: Safely revert token changes when issues are discovered. Creates recovery branches, supports commit/file/session level rollbacks with proper documentation.
license: MIT
metadata:
  category: coordination
  agents: [Architect, Code, Testing]
  autonomy: autonomous (own changes) | requires-approval (others)
---

# Rollback

## Purpose

Safely revert token changes when issues are discovered, with proper documentation and notification.

## Preconditions

- Git repository is clean (no uncommitted changes)
- Change to revert is identified by commit hash or file state
- Understanding of what will be lost in rollback

## Inputs

| Parameter       | Type     | Required | Description                                   |
| --------------- | -------- | -------- | --------------------------------------------- |
| `rollback_type` | enum     | yes      | `commit`, `file`, `session`                   |
| `target`        | string   | yes      | Commit hash, file path, or session identifier |
| `reason`        | string   | yes      | Why the rollback is needed                    |
| `notify`        | string[] | no       | Agents/humans to notify                       |

## Procedure

### Step 1: Assess Rollback Scope

```python
def assess_rollback(rollback_type, target):
    """Determine what will be affected by rollback"""

    if rollback_type == 'commit':
        # Single commit revert
        affected = run(f"git show --name-only {target}")
        return {
            'type': 'commit',
            'commit': target,
            'files_affected': affected.split('\n'),
            'can_revert_safely': not is_merge_commit(target)
        }

    elif rollback_type == 'file':
        # Reset single file
        return {
            'type': 'file',
            'file': target,
            'files_affected': [target],
            'can_revert_safely': True
        }

    elif rollback_type == 'session':
        # Revert all changes since session start
        commits = run(f"git log --oneline --since='{target}'")
        return {
            'type': 'session',
            'commits_affected': commits.split('\n'),
            'files_affected': get_files_changed_since(target),
            'can_revert_safely': False,  # Requires review
            'warning': 'Session rollback affects multiple commits'
        }
```

### Step 2: Create Checkpoint

```bash
# Before any rollback, create a recovery branch
git branch backup-before-rollback-$(date +%Y%m%d-%H%M%S)
echo "Recovery branch created: backup-before-rollback-..."
```

### Step 3: Execute Rollback

#### Single Commit Revert

```bash
# Revert a specific commit (creates new commit)
git revert --no-edit <commit_hash>

# Verify
git log --oneline -3
```

#### File Reset

```bash
# Reset single file to last commit
git checkout HEAD -- packages/tokens/src/tokens.json

# Or to specific commit
git checkout <commit_hash> -- packages/tokens/src/tokens.json
```

#### Session Rollback

```bash
# Reset to specific commit (DESTRUCTIVE - loses commits after)
# Only use with approval
git reset --hard <commit_hash>

# Force push if already pushed (REQUIRES APPROVAL)
git push --force origin main  # DANGEROUS
```

### Step 4: Validate Post-Rollback

```bash
# Verify JSON is valid
python3 -m json.tool packages/tokens/src/tokens.json > /dev/null

# Run tests
npm run test:output

# Build
npm run build:output
```

### Step 5: Document Rollback

```python
def document_rollback(rollback_type, target, reason, result):
    """Document the rollback in CHANGELOG.md"""

    entry = f"""
### ROLLBACK - {datetime.now().isoformat()[:10]}

**Type**: {rollback_type}
**Target**: {target}
**Reason**: {reason}

**Recovery branch**: {result['backup_branch']}
**New commit**: {result.get('revert_commit', 'N/A')}

**Files affected**:
"""

    for f in result['files_affected'][:10]:
        entry += f"- {f}\n"

    return entry
```

## Outputs

| Output           | Type   | Description                           |
| ---------------- | ------ | ------------------------------------- |
| `status`         | enum   | `success`, `failed`, `blocked`        |
| `backup_branch`  | string | Name of backup branch created         |
| `revert_commit`  | string | Hash of revert commit (if applicable) |
| `files_restored` | array  | List of files affected                |
| `validation`     | object | Post-rollback validation results      |

## Error Handling

| Error                          | Recovery                                        |
| ------------------------------ | ----------------------------------------------- |
| `Merge conflict during revert` | Manual resolution required; document in handoff |
| `Commit not found`             | Verify hash; check if in remote                 |
| `Working directory dirty`      | Stash or commit current changes first           |
| `Force push blocked`           | Requires maintainer approval                    |

## Examples

### Example 1: Revert single bad commit

```
INVOKE: skill/coordination/rollback
INPUTS: {
  rollback_type: "commit",
  target: "abc123",
  reason: "Introduced circular reference in text.primary",
  notify: ["testing", "architect"]
}
RESULT: {
  status: "success",
  backup_branch: "backup-before-rollback-20260206-143000",
  revert_commit: "def456",
  files_restored: ["packages/tokens/src/tokens.json"],
  validation: {
    json_valid: true,
    tests_passed: true,
    build_succeeded: true
  }
}
```

### Example 2: Reset tokens.json to last known good

```
INVOKE: skill/coordination/rollback
INPUTS: {
  rollback_type: "file",
  target: "packages/tokens/src/tokens.json",
  reason: "JSON syntax corrupted during bulk edit"
}
RESULT: {
  status: "success",
  backup_branch: "backup-before-rollback-20260206-150000",
  files_restored: ["packages/tokens/src/tokens.json"],
  validation: {
    json_valid: true
  }
}
```

### Example 3: Session rollback (blocked without approval)

```
INVOKE: skill/coordination/rollback
INPUTS: {
  rollback_type: "session",
  target: "2026-02-06T10:00:00Z",
  reason: "Multiple commits introduced systematic errors"
}
RESULT: {
  status: "blocked",
  message: "Session rollback requires human approval",
  commits_affected: ["abc123", "def456", "ghi789"],
  action: "Request approval from human owner"
}
```

## Quick Rollback Commands

```bash
# Reset tokens.json to last commit
git checkout HEAD -- packages/tokens/src/tokens.json

# Revert last commit
git revert HEAD --no-edit

# See what changed in a commit
git show --name-only <commit>

# Create recovery branch before risky operation
git branch backup-$(date +%Y%m%d-%H%M%S)

# View recent commits
git log --oneline -10
```

## When NOT to Rollback

- **Minor issues that can be fixed forward**: Edit the token instead
- **Already released changes**: Requires version bump strategy
- **Multiple dependent changes**: May cause more issues than it solves
- **Before investigating root cause**: Understand why before reverting

## Rollback Decision Tree

```
Issue discovered
│
├─ Is it blocking? (tests fail, build broken)
│   └─ YES → Rollback immediately, then investigate
│
├─ Can it be fixed in 5 minutes?
│   └─ YES → Fix forward instead of rollback
│
├─ Are multiple commits involved?
│   └─ YES →
│       ├─ If same session → Session rollback (needs approval)
│       └─ If mixed → Selective revert of problematic commits
│
└─ Is this production-critical?
    └─ YES → Escalate to human before rollback
```
