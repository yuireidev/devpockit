#!/usr/bin/env bash
# AI changelog helper: prints commits since last tag + prompt for AI to draft Keep-a-Changelog entry.
# Usage: scripts/ai-changelog.sh [version] | copy into your AI assistant
set -euo pipefail
VER="${1:-$(node -p "require('./package.json').version")}"
PREV=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
RANGE="${PREV:+$PREV..HEAD}"; RANGE="${RANGE:-HEAD}"
echo "=== COMMITS ($RANGE) ==="
git log $RANGE --pretty=format:'%h %s (%an)' --no-merges | head -100
echo ""
echo "=== PROMPT (paste to AI with output above) ==="
cat <<EOF
Draft a Keep-a-Changelog entry for version [$VER] from the commits above.
Rules: group under Added/Changed/Fixed/Security; one bullet per user-facing change;
ignore chore/ci/lint commits unless user-visible; concise past-tense; no invented features.
Output markdown starting with '## [$VER] - YYYY-MM-DD'.
EOF
