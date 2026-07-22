#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$REPO_ROOT"

echo "[mcp] Installing workspace dependencies (if needed)..."
npm install

echo "[mcp] Starting Design System Tokens MCP..."
node packages/tokens/mcp-server/index.js
