#!/usr/bin/env bash

set -u

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

log_info() {
  echo "[INFO] $1"
}

log_pass() {
  echo "[PASS] $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

log_fail() {
  echo "[FAIL] $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

log_warn() {
  echo "[WARN] $1"
  WARN_COUNT=$((WARN_COUNT + 1))
}

print_header() {
  echo "==============================================="
  echo "Docmancer Agent Access Smoke Test"
  echo "==============================================="
}

print_summary() {
  echo ""
  echo "-----------------------------------------------"
  echo "Summary"
  echo "-----------------------------------------------"
  echo "Pass: ${PASS_COUNT}"
  echo "Warn: ${WARN_COUNT}"
  echo "Fail: ${FAIL_COUNT}"
}

print_header

if ! command -v docmancer >/dev/null 2>&1; then
  log_fail "docmancer CLI not found. Install with: pipx install docmancer"
  print_summary
  exit 1
fi
log_pass "docmancer CLI is installed"

if [ -f "docmancer.yaml" ]; then
  log_pass "project config found (docmancer.yaml)"
else
  log_warn "project config missing (docmancer.yaml). Run: docmancer init"
fi

FOUND_SKILLS=0
SKILL_PATHS=(
  "$HOME/.codex/skills/docmancer/SKILL.md"
  "$HOME/.agents/skills/docmancer/SKILL.md"
  "$HOME/.cursor/skills/docmancer/SKILL.md"
  "$HOME/.claude/skills/docmancer/SKILL.md"
  "$HOME/.gemini/skills/docmancer/SKILL.md"
  "$HOME/.config/opencode/skills/docmancer/SKILL.md"
)

for skill_path in "${SKILL_PATHS[@]}"; do
  if [ -f "$skill_path" ]; then
    log_pass "skill installed: $skill_path"
    FOUND_SKILLS=$((FOUND_SKILLS + 1))
  fi
done

if [ "$FOUND_SKILLS" -eq 0 ]; then
  log_fail "no agent skill file found. Run: docmancer install codex (or docmancer setup --all)"
fi

log_info "Running: docmancer doctor"
DOCTOR_OUTPUT="$(docmancer doctor 2>&1)"
DOCTOR_EXIT=$?
echo "$DOCTOR_OUTPUT"
if [ "$DOCTOR_EXIT" -ne 0 ]; then
  log_fail "docmancer doctor returned a non-zero exit code"
else
  log_pass "docmancer doctor ran successfully"
fi

QUERY="${1:-button accessibility keyboard focus}"
log_info "Running query smoke test"
log_info "Query: $QUERY"

QUERY_OUTPUT="$(docmancer query "$QUERY" 2>&1)"
QUERY_EXIT=$?
echo "$QUERY_OUTPUT"

if [ "$QUERY_EXIT" -ne 0 ]; then
  log_fail "docmancer query failed"
elif echo "$QUERY_OUTPUT" | grep -Eqi "no results|0 results|not found|error"; then
  log_warn "query ran, but output may not contain useful indexed matches"
else
  log_pass "docmancer query returned non-empty results"
fi

if [ "$FAIL_COUNT" -gt 0 ]; then
  print_summary
  exit 1
fi

print_summary
exit 0
