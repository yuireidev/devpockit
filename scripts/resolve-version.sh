#!/usr/bin/env bash
# Resolve app version: git tag (vX.Y.Z) > package.json > dev fallback.
# Works for clones/forks without tags. Usage: source or $(scripts/resolve-version.sh)
set -euo pipefail
TAG_VER=""
if git describe --tags --abbrev=0 >/dev/null 2>&1; then
  TAG_VER=$(git describe --tags --abbrev=0 | sed 's/^v//')
fi
if [ -n "$TAG_VER" ]; then
  # Append short SHA on non-tagged commits for traceability
  if ! git describe --tags --exact-match >/dev/null 2>&1; then
    SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    echo "${TAG_VER}+${SHA}"
  else
    echo "$TAG_VER"
  fi
elif [ -f package.json ]; then
  node -p "require('./package.json').version"
else
  echo "dev"
fi
