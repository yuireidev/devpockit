#!/usr/bin/env bash
# pnpm release:patch|minor|major — bump package.json, draft CHANGELOG entry.
# Tagging is done by CI (auto-tag.yml) after merging the release branch to main. Never tag by hand.
# Usage: scripts/release.sh [patch|minor|major]  (defaults to patch)
# Run on a clean release/X.Y.Z branch cut from main.
set -euo pipefail
BUMP="${1:-patch}"
case "$BUMP" in patch|minor|major) ;; *)
  echo "Usage: scripts/release.sh [patch|minor|major]"; exit 1;; esac
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" = "main" ]; then
  echo "Refusing to bump on main. Run on a release/X.Y.Z branch cut from main."; exit 1
fi
if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is dirty. Commit or stash first."; exit 1
fi
CUR=$(node -p "require('./package.json').version")
NEXT=$(node -e "
const [M,m,p]=process.argv[1].split('.').map(Number);
const b=process.argv[2];
let n=b==='major'?[M+1,0,0]:b==='minor'?[M,m+1,0]:[M,m,p+1];
console.log(n.join('.'));" "$CUR" "$BUMP")
PREV_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
LOG_RANGE="${PREV_TAG:+$PREV_TAG..HEAD}"; LOG_RANGE="${LOG_RANGE:-HEAD}"
COMMITS=$(git log $LOG_RANGE --pretty=format:'- %s (%h)' --no-merges 2>/dev/null | head -50 || echo "- (no commits found)")

node -e "
const fs=require('fs');
const v=process.argv[1], d=new Date().toISOString().slice(0,10);
let c=fs.readFileSync('CHANGELOG.md','utf8');
if(c.includes('## ['+v+']')){console.log('CHANGELOG already has '+v);process.exit(0);}
const entry='## ['+v+'] - '+d+'\n\n### Added\n- TODO: curate from commits below (AI: rewrite into Keep-a-Changelog entries)\n\n### Fixed\n- \n\n### Changed\n- \n\n';
c=c.replace('## [Unreleased]','## [Unreleased]\n\n'+entry);
fs.writeFileSync('CHANGELOG.md',c); console.log('CHANGELOG drafted for '+v);" "$NEXT"

node -e "
const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));
p.version=process.argv[1];fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n');" "$NEXT"

echo "--- Recent commits (paste into AI to flesh out CHANGELOG) ---"
echo "$COMMITS"
echo "--------------------------------------------------------------"
git add package.json CHANGELOG.md
git commit -m "chore: release v$NEXT"
echo ""
echo "Bumped $CUR -> $NEXT (no tag; CI tags on merge to main)."
echo "Next: curate CHANGELOG.md, commit, push branch, open PR into main."
echo "Merge with a merge commit; auto-tag.yml tags it and runs the release."
