@echo off
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
pushd "%SCRIPT_DIR%\..\..\.."

echo [mcp] Installing workspace dependencies (if needed)...
call npm install
if errorlevel 1 (
  echo [mcp] npm install failed.
  popd
  exit /b 1
)

echo [mcp] Starting Design System Tokens MCP...
node packages/tokens/mcp-server/index.js
set EXIT_CODE=%ERRORLEVEL%

popd
exit /b %EXIT_CODE%
