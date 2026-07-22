---
mode: agent
description: '🚀 Daily bootstrap — sync repo and load agent state'
tools:
  - read_file
  - run_in_terminal
---

# Daily Bootstrap

Run this at the start of every session to sync the repo and load current state.

## Procedure

Execute these steps in order:

### 1. Sync Repository

```bash
git fetch origin main && git pull origin main --rebase 2>/dev/null || echo "Offline mode"
```

### 2. Quick Status

```bash
echo "=== REPO STATUS ===" && \
git log --oneline -3 && \
echo "" && \
echo "=== TODO STATE ===" && \
head -30 packages/tokens/.agents/TODO_STATE.md && \
echo "" && \
echo "=== SKILLS VERSION ===" && \
python3 -c "import json; d=json.load(open('packages/tokens/.agents/skills/skills.json')); print(f'v{d[\"version\"]} — {len(d[\"skills\"])} skills')"
```

### 3. Read Current State

Read these files:

- `packages/tokens/.agents/TODO_STATE.md` — current tasks and status
- `packages/tokens/.agents/skills/governance/constraint-reference.md` — active constraints

### 4. Report

Output a bootstrap summary:

```
🚀 Daily Bootstrap Complete
- Repo Status: [synced/behind/offline]
- Current Phase: [from TODO_STATE.md]
- Active Tasks: [list]
- Skills: [version and count from step 2]
- Ready to proceed.
```
