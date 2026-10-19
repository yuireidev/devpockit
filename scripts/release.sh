#!/usr/bin/env bash
# pnpm release:patch|minor|major — bump package.json, draft CHANGELOG entry (AI-friendly), commit + tag.
# Usage: scripts/release.sh [patch|minor|major] [--push]  (defaults to patch, no push)
set -euo pipefail
BUMP="${1:-patch}"
PUSH=false; [[ "${2:-}" == "--push" ]] && PUSH=true
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
git tag -a "v$NEXT" -m "Release version $NEXT"
echo "Created v$NEXT (from $CUR). Review CHANGELOG.md, then: git push origin HEAD && git push origin v$NEXT"
$PUSH && git push origin HEAD && git push origin "v$NEXT"
