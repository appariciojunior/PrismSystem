---
name: brief-updater
description: Update agent briefs when skills change or patterns evolve. Propagates changes from skills library to brief references and keeps briefs in sync.
license: MIT
metadata:
  category: coordination
  agents: [Architect, Code, Testing]
  autonomy: requires-approval
---

# Brief Updater

## Purpose

Keep agent briefs synchronized with:

- New skills added to the library
- Changed skill names or locations
- Updated best practices
- Version bumps

## When to Run

Trigger this skill when:

- A new skill is added to `skills/`
- A skill is renamed or moved
- User requests "update briefs" or "sync briefs"
- TODO_STATE.md shows outdated brief_version

## Procedure

### Step 1: Check Current State

```bash
# List all skills
echo "=== Current Skills ==="
find packages/tokens/.agents/skills -name "*.md" -type f | grep -v README | sort

# Check brief versions
echo "=== Brief Files ==="
ls -la packages/tokens/.agents/briefs/

# Check TODO_STATE version
grep "brief_version" packages/tokens/.agents/TODO_STATE.md
```

### Step 2: Identify Drift

```python
import os
import re
from pathlib import Path

# Get all skill names
skills_dir = Path("packages/tokens/.agents/skills")
skills = []
for skill_file in skills_dir.rglob("*.md"):
    if skill_file.name != "README.md":
        # Extract skill name from frontmatter
        content = skill_file.read_text()
        match = re.search(r'^name:\s*(\S+)', content, re.MULTILINE)
        if match:
            skills.append({
                'name': match.group(1),
                'path': str(skill_file.relative_to(skills_dir.parent)),
                'category': skill_file.parent.name
            })

# Check each brief for missing skill references
briefs_dir = Path("packages/tokens/.agents/briefs")
for brief in briefs_dir.glob("*-v2.md"):
    content = brief.read_text()
    print(f"\n=== {brief.name} ===")
    for skill in skills:
        if skill['name'] not in content:
            print(f"  Missing reference: {skill['name']} ({skill['category']})")
```

### Step 3: Update Brief Skill Tables

For each brief, ensure the "Skills You Can Invoke" table includes all relevant skills:

```markdown
## 📚 Skills You Can Invoke

| When You Need To... | Use This Skill                                    |
| ------------------- | ------------------------------------------------- |
| [action]            | [skill/category/name](../skills/category/name.md) |
```

### Step 4: Update Version Numbers

```bash
# Update TODO_STATE.md with new version
DATE=$(date +%Y-%m-%d)
sed -i '' "s/last_brief_update:.*/last_brief_update: \"$DATE\"/" packages/tokens/.agents/TODO_STATE.md

# Bump version if significant changes
# Minor: new skills added
# Patch: descriptions updated
```

### Step 5: Commit Changes

```bash
git add packages/tokens/.agents/briefs/ packages/tokens/.agents/TODO_STATE.md
git commit -m "chore(briefs): sync with skills library

- Updated skill references
- Brief version: X.Y.Z"
git push origin main
```

## Outputs

| Output           | Type   | Description                     |
| ---------------- | ------ | ------------------------------- |
| `skills_added`   | array  | New skills referenced in briefs |
| `skills_removed` | array  | Obsolete references removed     |
| `briefs_updated` | array  | Which briefs were modified      |
| `new_version`    | string | Updated brief version           |

## Auto-Update Trigger

To enable automatic brief updates when skills change, add this to your git hooks:

```bash
# .git/hooks/post-commit
#!/bin/bash

# Check if skills were modified
if git diff --name-only HEAD~1 | grep -q "\.agents/skills/"; then
    echo "Skills changed - consider running brief-updater"
fi
```
