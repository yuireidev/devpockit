# Release Process

Single-branch (GitHub Flow) with a release ledger. All PRs merge into `main`;
releases happen through a short `release/X.Y.Z` branch that carries the version
bump and changelog. CI tags the merge commit and creates the GitHub Release.
Pages deploy is a separate manual step. Never tag by hand.

## Branch Model

| Branch | Purpose | Lifetime |
|--------|---------|----------|
| `main` | Integration + release ledger. Every release merge commit is tagged. | Forever |
| `release/X.Y.Z` | Version bump + changelog curation only. No features. | Cut from `main`, merged, deleted |
| `feature/*`, `fix/*`, `chore/*` | One unit of work | Deleted after merge |

Releases are tags, not branches. **Fork users and self-hosters should check out
tags** (`git checkout v0.4.0`) — `main` may contain unreleased work between
releases.

## Release Workflow

1. **Development**: feature branches merged into `main` (squash recommended).
2. **Release branch**: cut `release/X.Y.Z` from `main`, run
   `pnpm release:patch` (or `release:minor` / `release:major`). It bumps
   `package.json` and drafts the `CHANGELOG.md` entry. Curate the changelog
   (`pnpm changelog:ai` drafts from commits).
3. **Ship**: open PR `release/X.Y.Z` → `main`. The version check requires the
   bump (non-release branches are exempt). Merge with a **merge commit**.
4. **Automated**: `auto-tag.yml` creates tag `vX.Y.Z` on the merge commit, then
   runs `release.yml` (build + GitHub Release). No Pages deploy.
5. **Deploy (manual)**: run `Deploy to Pages` from the Actions tab, pick the
   tag. It builds and deploys to GitHub Pages.

Note: anything merged into `main` between step 2 and step 3 ships in that
release (the release PR merges the current `main` head). Keep the window short
or time it deliberately.

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

Pre-releases (`-alpha.1`, `-beta.1`, `-rc.1`) are supported by the tag format.

## Hotfix

A hotfix is just: fix → PR → `main`, then a normal `release/X.Y+1` branch with
a patch bump. No special path.

## Release Checklist

- [ ] `release/X.Y.Z` branch cut from `main`
- [ ] `pnpm release:*` applied; `CHANGELOG.md` curated
- [ ] PR passes version check + CI
- [ ] Merged with a merge commit (not squash)
- [ ] Tag `vX.Y.Z` created by CI
- [ ] GitHub Release created by CI
- [ ] Pages deployed manually via `deploy.yml`
- [ ] Release branch deleted

## Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| `ci.yml` | PR / push to `main` | Lint, type-check, test, build |
| `version-check.yml` | Tag push; PR into `main` | Tag matches `package.json`; `release/*` PRs must bump |
| `auto-tag.yml` | Push to `main` | Tag merge commit when `package.json` is newer, then run release |
| `release.yml` | Tag push, manual dispatch, `auto-tag.yml` | Build + GitHub Release (no deploy) |
| `deploy.yml` | Manual dispatch | Build + deploy to Pages for a chosen tag |
| `deploy-pages.yml` | Manual dispatch (forks) | Build + deploy from default branch |
| `preview.yml` | PR into `main` | Build + upload artifact (no Pages deploy) |

## Rollback

Redeploy a previous tag via `deploy.yml` (pick the older tag), or cut a new
patch release with the fix. Tags are immutable (creation allowed, deletion and
force-push blocked by the `protect-tags` ruleset).

## Troubleshooting

### Release PR fails version check

`package.json` on the branch is not newer than the latest tag. Run
`pnpm release:patch|minor|major` on the release branch and push the bump.

### No tag after merging

`auto-tag.yml` only tags when `package.json` is semver-greater than the latest
tag (and skips releases if the tag already exists). Check the workflow logs.

### Deploy shows the wrong version

`deploy.yml` builds the tag you pick with `NEXT_PUBLIC_APP_VERSION` from that
tag. Verify you selected the right tag in the dispatch inputs.
