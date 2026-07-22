#!/bin/bash
#
# Cleanup old canary versions from npm registry
# Keeps the last N canary versions for each package and deprecates older ones
#

set -e

KEEP_VERSIONS=${KEEP_VERSIONS:-5}

echo "Cleaning up canary versions, keeping last ${KEEP_VERSIONS}..."

# Get all package names from lerna
PACKAGES=$(npx lerna list --json 2>/dev/null | jq -r '.[].name')

for PACKAGE in $PACKAGES; do
  echo ""
  echo "Processing ${PACKAGE}..."

  # Get all canary versions (versions containing 'alpha' or 'canary')
  CANARY_VERSIONS=$(npm view "${PACKAGE}" versions --json 2>/dev/null | jq -r '.[]' | grep -E '(alpha|canary)' | sort -V || echo "")

  if [ -z "$CANARY_VERSIONS" ]; then
    echo "  No canary versions found for ${PACKAGE}"
    continue
  fi

  VERSION_COUNT=$(echo "$CANARY_VERSIONS" | wc -l | tr -d ' ')
  echo "  Found ${VERSION_COUNT} canary versions"

  if [ "$VERSION_COUNT" -le "$KEEP_VERSIONS" ]; then
    echo "  Keeping all versions (${VERSION_COUNT} <= ${KEEP_VERSIONS})"
    continue
  fi

  # Get versions to deprecate (all except last KEEP_VERSIONS)
  VERSIONS_TO_DEPRECATE=$(echo "$CANARY_VERSIONS" | head -n -${KEEP_VERSIONS})
  DEPRECATE_COUNT=$(echo "$VERSIONS_TO_DEPRECATE" | wc -l | tr -d ' ')

  echo "  Deprecating ${DEPRECATE_COUNT} old versions..."

  for VERSION in $VERSIONS_TO_DEPRECATE; do
    echo "    Deprecating ${PACKAGE}@${VERSION}"
    npm deprecate "${PACKAGE}@${VERSION}" "Old canary version - please use @canary tag for latest" 2>/dev/null || echo "    Failed to deprecate ${VERSION}"
  done
done

echo ""
echo "Canary cleanup complete!"
