# AGENTS.md

This file provides guidance to Kilo when working with code in this repository.

## Commands

```bash
# Development
pnpm dev               # Start dev server
pnpm dev:https         # Dev server with HTTPS

# Build
pnpm build             # Production static export
pnpm type-check        # TypeScript check only
pnpm lint              # ESLint check
pnpm lint:fix          # ESLint auto-fix

# Testing
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage report
pnpm test:ci           # CI mode (no watch, with coverage)

# Run a single test file
pnpm test src/libs/__tests__/someUtil.test.ts

# Full pre-release verification
pnpm build:test        # type-check + lint + test:ci + build

# Verify static export locally
pnpm build:verify      # build + run scripts/verify-build.js
pnpm serve:build       # serve the `out/` dir at localhost:8080
```

**Package manager**: pnpm (not npm/yarn).

## Architecture

DevPockit is a **client-side-only** web app with 30+ developer tools. There is no backend. Next.js is configured with `output: 'export'` for fully static HTML output.

### Tool System

Each tool follows a three-layer pattern:

1. **Config** (`src/config/<toolId>-config.ts`) — Defines tool metadata, input/output fields, options schema, and default values.
2. **Logic** (`src/libs/<toolId>.ts`) — Pure TypeScript functions with no React dependencies. All processing happens here.
3. **Component** (`src/components/tools/<ToolName>.tsx`) — React component that wires config → state → lib functions → UI.

### Routing

Dynamic routes handle tool navigation:
- `/tools/[category]/` — Category listing
- `/tools/[category]/[toolId]/` — Single tool panel
- `/tools/[category]/[toolId]/[instanceId]/` — Multi-panel tool instance

Tool components are **dynamically imported** via `src/libs/tool-components.ts` (`getToolComponent`) to enable code splitting for static export. Tool metadata and category assignments live in `src/libs/tools-data.ts` (`toolCategories`).

### Key Directories

- `src/app/` — Next.js App Router pages and layouts
- `src/components/` — React UI components (tools, layout, shared)
- `src/libs/` — Pure logic functions (one file per tool)
- `src/config/` — Tool configurations (one file per tool)
- `src/hooks/` — Custom React hooks
- `src/types/` — Shared TypeScript types
- `src/__mocks__/` — Jest mocks (e.g., uuid)

### Adding a New Tool

1. Create `src/config/<toolId>-config.ts` with tool definition
2. Create `src/libs/<toolId>.ts` with processing logic
3. Create `src/components/tools/<ToolName>.tsx` as the React component
4. Register the component in `src/libs/tool-components.ts` (add to `componentMap` with a string key)
5. Add the tool entry to `src/libs/tools-data.ts` — the `component` field must exactly match the `componentMap` key from step 4

### Testing Conventions

- Tests live in `__tests__/` subdirectories alongside the code they test
- Lib functions (pure logic) should have unit tests
- React components use `@testing-library/react`
- Coverage threshold is 5% globally (enforced in CI)
- The `uuid` package is mocked in `src/__mocks__/`

### Static Export Constraints

- No server-side APIs (`getServerSideProps`, API routes, etc.)
- Images must use `unoptimized: true` (already configured)
- Base path is configurable via `BASE_PATH` env var (used for GitHub Pages subpath deployment)

### Branching Model

- `develop` — active development
- `main` — production-ready; releases are tagged here with `vX.Y.Z`
- PRs go develop → main; releases are triggered by pushing a version tag

### TypeScript

Strict mode is enabled. Avoid `any` types. Path alias `@/` maps to `src/`.
