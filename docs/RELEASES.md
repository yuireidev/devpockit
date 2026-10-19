# Release Process

`develop` owns the version. Releasing is: bump PR into `develop`, then PR
`develop` to `main`. CI tags the merge commit and creates the GitHub Release.
Pages deploy is a separate manual step. Never tag by hand.

## Branching Model

| Branch | Purpose |
|--------|---------|
| `main` | Released code only. Every merge into `main` carries a version bump and gets tagged. |
| `develop` | Active development — all feature branches merge here. Holds the next version. |

Tags always point to merge commits on `main`. The tag is the source of truth;
`package.json` mirrors it.

## Release Workflow

1. **Development** happens on feature branches merged into `develop`.
2. **Bump**: on a short branch from `develop`, run `pnpm release:patch`
   (or `release:minor` / `release:major`). Curate `CHANGELOG.md`
   (`pnpm changelog:ai` drafts it). Open a PR into `develop` and merge.
3. **Ship**: open a PR `develop` to `main`. The version check fails the PR
   unless `package.json` is newer than the latest tag
   (escape hatch: `no-release` label). Merge with a **merge commit**.
4. **Automated**: `auto-tag.yml` creates tag `vX.Y.Z` on the merge commit,
   then runs `release.yml` (build + GitHub Release). No Pages deploy.
5. **Deploy (manual)**: run `Deploy to Pages` from the Actions tab, pick the
   tag. It builds and deploys to GitHub Pages.

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

Pre-releases (`-alpha.1`, `-beta.1`, `-rc.1`) are supported by the tag format.

## Release Checklist

- [ ] Bump PR merged into `develop` (`package.json` + `CHANGELOG.md`)
- [ ] PR `develop` to `main` passes version check + CI
- [ ] Merged with a merge commit (not squash)
- [ ] Tag `vX.Y.Z` created by CI
- [ ] GitHub Release created by CI
- [ ] Pages deployed manually via `deploy.yml`

## Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| `ci.yml` | PR / push to `main`, `develop` | Lint, type-check, test, build |
| `version-check.yml` | Tag push; PR into `main` | Tag matches `package.json`; PR must bump version |
| `auto-tag.yml` | Push to `main` | Tag merge commit when `package.json` is newer, then run release |
| `release.yml` | Tag push, manual dispatch, `auto-tag.yml` | Build + GitHub Release (no deploy) |
| `deploy.yml` | Manual dispatch | Build + deploy to Pages for a chosen tag |
| `deploy-pages.yml` | Manual dispatch (forks) | Build + deploy from default branch |
| `preview.yml` | PR | Build + upload artifact (no Pages deploy) |

## Hotfix

Branch from `main`, bump the version, open a PR into `main`, then open a
follow-up PR `main` to `develop` so `develop` does not drift.

```bash
git checkout main && git pull origin main
git checkout -b hotfix/0.2.4
pnpm release:patch
# curate CHANGELOG.md, commit, push, PR into main, merge
# then: PR main to develop, merge
```

## Rollback

Redeploy a previous tag via `deploy.yml` (pick the older tag), or cut a new
patch release with the fix. Tags are immutable (creation allowed,
deletion and force-push blocked by the `protect-tags` ruleset).

## Troubleshooting

### PR into `main` fails version check

`package.json` is not newer than the latest tag. Bump on `develop` first
(step 2), or add the `no-release` label for non-release merges.

### No tag after merging to `main`

`auto-tag.yml` only tags when `package.json` is semver-greater than the
latest tag. Check the workflow run logs; re-running on the same commit
exits without a duplicate tag.

### Deploy shows the wrong version

`deploy.yml` builds the tag you pick with `NEXT_PUBLIC_APP_VERSION` from
that tag. Verify you selected the right tag in the dispatch inputs.
