# Agent-neutral repository guide

This is the shared source of project instructions for developers and coding agents, regardless of provider or editor. Keep reusable workflow and architecture guidance here. Provider-specific instruction files should link to this guide and contain only integration details that cannot be shared.

## Secret hygiene

- Never print, log, echo, or otherwise expose tokens, passwords, private keys, `.op/` contents, or `GH_TOKEN` values.
- Never run commands that reveal secrets, including `gh auth status --show-token`, `printenv`, or `op item get ... --reveal` when output would be displayed.
- Never capture secrets in shell variables or files. Pipe credentials directly between commands when needed.
- If a secret is accidentally exposed, tell the user to rotate it immediately.
- Never commit `.op/`, `.env`, `*.pem`, or `*.key` files. Check `git status` before committing.

## Project overview

DevPockit is a client-side Next.js application with static export. Tool processing runs in the browser; this repository has no backend. The application uses TypeScript, React, Tailwind CSS, and pnpm.

## Commands

Use Node.js 20 or newer and pnpm 10, pinned by the package manifest.

```bash
pnpm install --frozen-lockfile
pnpm dev                  # Start the local app
pnpm lint                 # Check the repository with ESLint
pnpm lint:fix             # Apply ESLint fixes
pnpm format               # Format supported project files with Prettier
pnpm format:check         # Check formatting
pnpm type-check           # Run TypeScript checks
pnpm test                 # Run Jest tests
pnpm test <file>          # Run one test file
pnpm e2e                  # Run the fast browser suite against the dev server
pnpm e2e:static           # Build and smoke-test the static export
pnpm check:changed        # Type-check and check tests related to changed JS/TS files
pnpm build                # Create the static export
pnpm preview              # Serve the generated out/ directory on port 8080
pnpm build:verify         # Build and verify static export output
pnpm build:test           # Full type-check, lint, test, and build sequence
```

### Browser E2E tests

Install the Chromium browser once after installing project dependencies:

```bash
pnpm exec playwright install chromium
```

`pnpm e2e` starts the Next.js development server on `127.0.0.1:3100`, runs the local smoke suite headlessly, and stops the server afterward. `pnpm e2e:static` builds the static export, serves `out/` on `127.0.0.1:3101`, and checks the exported home page and a tool route. Both commands retain screenshots and traces for failed tests under `test-results/`.

To review the actions from a successful run, record traces for every test and open one in Playwright Trace Viewer:

```bash
pnpm e2e -- --trace on
pnpm exec playwright show-trace test-results/<test-folder>/trace.zip
```

Use `pnpm e2e:static -- --trace on` to do the same for the static export suite. Trace Viewer shows the action timeline, screenshots and DOM snapshots around each step, and network activity. Tracing every test creates larger output and adds overhead; the default configuration keeps traces only for failures.

To run one test by name, pass Playwright's name filter after `--`:

```bash
pnpm e2e -- --grep "JSON Formatter"
```

CI runs the static export smoke suite and uploads `test-results/` when failures produce artifacts. The local dev-server suite is intended for quick iteration; Jest remains the detailed unit and component test suite.

## Architecture and tool system

- `src/app/` contains routes and layouts.
- `src/components/` contains shared UI and tool components.
- `src/libs/` contains tool logic and registries.
- `src/config/` contains tool-specific configuration.
- `src/hooks/` and `src/types/` contain shared hooks and types.

Tools generally separate configuration, pure processing logic, and UI. To add a tool, implement its logic and component, register its component in `src/libs/tool-components.ts`, and add metadata to `src/libs/tools-data.ts`. A consistency test checks that each metadata component name has a registered loader.

Static export constraints apply: do not add server-only APIs or API routes. `BASE_PATH` supports subpath hosting.

## Change workflow

1. Read the relevant implementation and nearby tests before editing.
2. Keep changes scoped to the requested behavior and follow existing patterns.
3. Add or update tests for behavior changes; keep processing logic testable as pure functions where practical.
4. Run `pnpm check:changed` during iteration and `pnpm build:test` for full verification when requested or appropriate.
5. Report what changed, what checks ran, and any known gaps. Do not claim checks passed unless they were run.

Do not commit, push, create a pull request, or change release state unless the user asks.

## Branches

- `main` is the active integration branch; it may contain unreleased changes.
- Release tags identify stable, published versions. Use a tag when a stable snapshot is needed.
- Release branches are cut from `main` for version bumps and changelog curation, then merged back to `main`.
- Use descriptive branch prefixes such as `feature/`, `fix/`, `docs/`, `refactor/`, `perf/`, or `chore/`.
- Pull requests for development and release work target `main`.

## TypeScript

Strict mode is enabled. Prefer precise types over `any`. The `@/` path alias maps to `src/`.
