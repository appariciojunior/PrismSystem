#!/bin/bash
# sync-skills.sh — Sync skills from canonical source to cross-IDE directories
#
# Usage: ./packages/tokens/scripts/sync-skills.sh
# Or:    npm run sync:skills
#
# Canonical source: packages/tokens/.agents/skills/
# Targets: .github/skills/, .cursor/skills/, .claude/skills/, .codex/skills/
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
CANONICAL="$REPO_ROOT/packages/tokens/.agents/skills"

if [ ! -d "$CANONICAL" ]; then
  echo "❌ Canonical skills directory not found: $CANONICAL"
  exit 1
fi

echo "🔄 Syncing skills from: $CANONICAL"

# --- Symlink targets (target|relative_path) ---

cd "$REPO_ROOT"

sync_link() {
  local target="$1"
  local rel_path="$2"
  local parent_dir
  parent_dir="$(dirname "$target")"

  mkdir -p "$parent_dir"

  if [ -L "$target" ]; then
    current="$(readlink "$target")"
    if [ "$current" = "$rel_path" ]; then
      echo "  ✅ $target → $rel_path (already correct)"
      return
    else
      echo "  🔧 $target: updating symlink ($current → $rel_path)"
      rm "$target"
    fi
  elif [ -e "$target" ]; then
    if [ -d "$target" ]; then
      echo "  ⚠️  $target exists but is not a symlink — mirroring canonical skill files"
      rsync -a --delete "$CANONICAL/" "$target/"
      echo "  ✅ $target mirrored from canonical"
      return
    fi

    echo "  ⚠️  $target exists but is not a symlink — replacing with symlink"
    rm -f "$target"
  fi

  ln -sfn "$rel_path" "$target"
  echo "  ✅ $target → $rel_path (created)"
}

sync_link ".github/skills/tokens" "../../packages/tokens/.agents/skills"
sync_link ".github/skills/design" "../../packages/tokens/.agents/skills/design"
sync_link ".cursor/skills"        "../packages/tokens/.agents/skills"
sync_link ".claude/skills"        "../packages/tokens/.agents/skills"
sync_link ".codex/skills"         "../packages/tokens/.agents/skills"

# --- Validate skills.json manifest ---

MANIFEST="$CANONICAL/skills.json"
if [ -f "$MANIFEST" ]; then
  echo ""
  echo "📋 Validating skills.json manifest..."

  # Check JSON syntax
  if python3 -m json.tool "$MANIFEST" > /dev/null 2>&1; then
    echo "  ✅ JSON syntax valid"
  else
    echo "  ❌ JSON syntax error in $MANIFEST"
    exit 1
  fi

  # Count skills vs actual files
  manifest_count=$(python3 -c "import json; d=json.load(open('$MANIFEST')); print(len(d.get('skills',[])))")
  file_count=$(find "$CANONICAL" -name "*.md" -not -name "README*.md"  -not -name "ONBOARDING.md" -not -name "GUIDE.md" | wc -l | tr -d ' ')

  echo "  📊 Manifest: $manifest_count skills | Files: $file_count skill files"

  if [ "$manifest_count" != "$file_count" ]; then
    echo "  ⚠️  Mismatch! Run: find packages/tokens/.agents/skills -name '*.md' -not -name 'README*.md' -not -name 'ONBOARDING.md' -not -name 'GUIDE.md' | sort"
    echo "     to find missing/extra skills and update skills.json"
  else
    echo "  ✅ Counts match"
  fi

  # Verify each manifest entry has a corresponding file
  echo ""
  echo "  🔍 Checking skill file references..."
  missing=0
  while IFS= read -r path; do
    full="$CANONICAL/$path"
    if [ ! -f "$full" ]; then
      echo "    ❌ Missing: $path"
      missing=$((missing + 1))
    fi
  done < <(python3 -c "import json; d=json.load(open('$MANIFEST')); [print(s['path']) for s in d.get('skills',[])]")

  if [ "$missing" -eq 0 ]; then
    echo "    ✅ All manifest entries have matching files"
  else
    echo "    ❌ $missing missing file(s)"
    exit 1
  fi
else
  echo "  ⚠️  No skills.json manifest found at $MANIFEST"
fi

echo ""
echo "✅ Skill sync complete"
