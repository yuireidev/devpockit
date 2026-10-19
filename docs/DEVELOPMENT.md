# Development Guide

This guide covers day-to-day development workflows, debugging techniques, and practical tips for working on DevPockit.

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Development Workflow](#development-workflow)
- [Common Development Tasks](#common-development-tasks)
- [Adding a New Tool](#adding-a-new-tool)
- [Debugging](#debugging)
- [Code Style Guide](#code-style-guide)
- [Testing Guide](#testing-guide)
- [Troubleshooting](#troubleshooting)

## Local Development Setup

### Initial Setup

1. **Clone and Install**:
   ```bash
   git clone https://github.com/yuireidev/devpockit.git
   cd devpockit
   pnpm install
   ```

2. **Start Development Server**:
   ```bash
   pnpm dev
   ```
   The app will be available at `http://localhost:3000`

3. **HTTPS Development** (optional):
   ```bash
   pnpm dev:https
   ```
   Uses self-signed certificates from `certificates/` directory

### Development Scripts

```bash
# Development
pnpm dev              # Start dev server (port 3000)
pnpm dev:https        # Start with HTTPS

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm type-check       # TypeScript type checking
pnpm format           # Format with Prettier

# Testing
pnpm test             # Run tests
pnpm test:watch       # Watch mode
pnpm test:coverage     # Coverage report

# Building
pnpm build            # Production build
pnpm start            # Start production server
pnpm export           # Static export (for GitHub Pages)

# Verification
pnpm build:test       # Full test suite before build
pnpm build:verify     # Verify build output
```

### Environment Variables

Environment variables are optional for local development. If needed:

```bash
# .env.local
NEXT_PUBLIC_APP_NAME=DevPockit
NEXT_PUBLIC_APP_VERSION=0.1.0
```

## Development Workflow

### Typical Development Session

1. **Start Development Server**:
   ```bash
   pnpm dev
   ```

2. **Make Changes**: Edit files in `src/`

3. **Hot Reload**: Changes automatically reload in browser

4. **Check Code Quality**:
   ```bash
   pnpm lint
   pnpm type-check
   ```

5. **Run Tests** (if applicable):
   ```bash
   pnpm test:watch
   ```

6. **Build Verification** (before committing):
   ```bash
   pnpm build:test
   ```

### File Watching

- **Next.js**: Hot Module Replacement (HMR) enabled by default
- **TypeScript**: Type checking in editor and on build
- **ESLint**: Real-time linting in editor (if configured)

### Editor Configuration

Recommended VS Code extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

## Common Development Tasks

### Adding a New Dependency

```bash
# Production dependency
pnpm add package-name

# Development dependency
pnpm add -D package-name

# Update lockfile
pnpm install
```

### Updating Dependencies

```bash
# Update all dependencies
pnpm update

# Update specific package
pnpm update package-name

# Check for outdated packages
pnpm outdated
```

### Adding a Shadcn/ui Component

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
# Components added to src/components/ui/
```

### Creating a New Hook

1. Create file in `src/hooks/`:
   ```typescript
   // src/hooks/useYourHook.ts
   import { useState, useEffect } from 'react';

   export function useYourHook() {
     const [state, setState] = useState();
     // Hook logic
     return { state };
   }
   ```

2. Export from `src/hooks/index.ts` (if using barrel exports)

### Modifying Global Styles

Edit `src/app/globals.css`:
- Tailwind directives
- CSS variables for theming
- Global styles

## Adding a New Tool

Follow the [Tool Implementation Pattern](../ARCHITECTURE.md#tool-implementation-pattern) from the architecture docs.

### Step-by-Step Guide

#### 1. Create Tool Logic

```typescript
// src/libs/your-tool.ts
export function processYourTool(input: string, options: ToolOptions): string {
  // Pure function implementation
  // No React dependencies
  return result;
}
```

**Testing the Logic**:
```typescript
// __tests__/libs/your-tool.test.ts
import { processYourTool } from '@/libs/your-tool';

describe('processYourTool', () => {
  it('should process input correctly', () => {
    const result = processYourTool('input', {});
    expect(result).toBe('expected');
  });
});
```

#### 2. Create Tool Configuration

```typescript
// src/config/your-tool-config.ts
export const YOUR_TOOL_OPTIONS = {
  option1: true,
  option2: 'default',
};

export const YOUR_TOOL_EXAMPLES = {
  example1: 'sample input',
  example2: 'another sample',
};
```

#### 3. Create Tool Component

```typescript
// src/components/tools/YourTool.tsx
'use client';

import { useState } from 'react';
import { processYourTool } from '@/libs/your-tool';
import { YOUR_TOOL_OPTIONS, YOUR_TOOL_EXAMPLES } from '@/config/your-tool-config';

export function YourTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [options, setOptions] = useState(YOUR_TOOL_OPTIONS);

  const handleProcess = () => {
    try {
      const result = processYourTool(input, options);
      setOutput(result);
    } catch (error) {
      // Error handling
    }
  };

  return (
    <div className="space-y-4">
      {/* Input section */}
      {/* Options section */}
      {/* Output section */}
    </div>
  );
}
```

#### 4. Register Tool

Add to `src/libs/tools-data.ts`:

```typescript
{
  id: 'your-tool',
  name: 'Your Tool',
  description: 'Tool description',
  category: 'utilities', // or appropriate category
  icon: '🔧',
  isPopular: false,
  path: '/tools/utilities/your-tool',
  component: 'YourTool',
  supportsDesktop: true,
  supportsMobile: true,
}
```

#### 5. Add to Component Loader

Add to `src/libs/tool-components.ts`:

```typescript
'YourTool': () => import('@/components/tools/YourTool').then(m => m.YourTool),
```

#### 6. Test the Tool

1. Start dev server: `pnpm dev`
2. Navigate to `/tools/utilities/your-tool`
3. Test functionality
4. Write unit tests

#### 7. Update Documentation

- Add to README.md tools list
- Update CHANGELOG.md
- Add usage examples if needed

## Debugging

### Browser DevTools

1. **Open DevTools**: `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)
2. **Console Tab**: Check for errors and warnings
3. **Network Tab**: Monitor API calls (if any)
4. **React DevTools**: Install browser extension for React debugging

### TypeScript Errors

```bash
# Check TypeScript errors
pnpm type-check

# Common fixes:
# - Check import paths (@/ aliases)
# - Verify type definitions
# - Check tsconfig.json paths
```

### ESLint Errors

```bash
# See all linting errors
pnpm lint

# Auto-fix what's possible
pnpm lint:fix

# Common issues:
# - Unused variables
# - Missing dependencies in useEffect
# - Console.log statements
```

### Next.js Errors

- **Build Errors**: Check `next.config.js` configuration
- **Route Errors**: Verify file structure matches App Router conventions
- **Import Errors**: Check path aliases in `tsconfig.json`

### React Component Debugging

```typescript
// Add console.log for debugging
console.log('Component state:', state);

// Use React DevTools Profiler
// Use breakpoints in browser DevTools

// Check component props
console.log('Props:', props);
```

### Tool-Specific Debugging

1. **Check Tool Logic**: Test pure functions independently
2. **Check Component State**: Use React DevTools
3. **Check Configuration**: Verify config imports
4. **Check Routing**: Verify tool is registered correctly

## Code Style Guide

### TypeScript

```typescript
// ✅ Good: Explicit types
function formatJson(input: string): string {
  return JSON.stringify(JSON.parse(input), null, 2);
}

// ✅ Good: Interface for objects
interface ToolOptions {
  minify: boolean;
  indent: number;
}

// ⚠️ Acceptable: any when necessary
function processDynamic(data: any): any {
  // Use when type is truly unknown
}
```

### React Components

```typescript
// ✅ Good: Functional component with hooks
export function ToolComponent() {
  const [state, setState] = useState('');

  return <div>{state}</div>;
}

// ✅ Good: Props interface
interface ToolProps {
  onResult: (result: string) => void;
}

export function Tool({ onResult }: ToolProps) {
  // Component
}
```

### File Naming

- **Components**: PascalCase (`JsonFormatter.tsx`)
- **UI Components**: kebab-case (`button.tsx`)
- **Hooks**: camelCase (`useMonacoEditor.ts`)
- **Utils/Config**: kebab-case (`json-formatter.ts`)

### Import Order

```typescript
// 1. External dependencies
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Internal absolute imports
import { formatJson } from '@/libs/json-formatter';

// 3. Relative imports
import './styles.css';

// 4. Type imports
import type { ToolResult } from '@/types/tools';
```

### Comments

```typescript
// ✅ Good: Explain "why"
// Using Map for O(1) lookup performance
const cache = new Map();

// ✅ Good: JSDoc for public APIs
/**
 * Formats JSON with optional minification.
 * @param input - JSON string to format
 * @param minify - Whether to minify output
 */
export function formatJson(input: string, minify: boolean): string {
  // Implementation
}

// ❌ Bad: Explain "what" (obvious from code)
// Set the state to the input value
setState(input);
```

## Testing Guide

### Writing Tests

#### Unit Tests for Logic

```typescript
// __tests__/libs/json-formatter.test.ts
import { formatJson } from '@/libs/json-formatter';

describe('formatJson', () => {
  it('should format valid JSON', () => {
    const input = '{"name":"test"}';
    const result = formatJson(input, false);
    expect(result).toContain('"name"');
  });

  it('should handle invalid JSON', () => {
    expect(() => formatJson('invalid', false)).toThrow();
  });
});
```

#### Component Tests

```typescript
// __tests__/components/tools/JsonFormatter.test.tsx
import { render, screen } from '@testing-library/react';
import { JsonFormatter } from '@/components/tools/JsonFormatter';

describe('JsonFormatter', () => {
  it('renders input field', () => {
    render(<JsonFormatter />);
    expect(screen.getByPlaceholderText(/json/i)).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode (rerun on changes)
pnpm test:watch

# Coverage report
pnpm test:coverage

# Run specific test file
pnpm test json-formatter.test.ts

# Run tests matching pattern
pnpm test --testNamePattern="format"
```

### Test Coverage

- **Target**: 80%+ coverage
- **Focus**: Test business logic and critical paths
- **Report**: Generated in `coverage/` directory

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

### TypeScript Errors

```bash
# Clear Next.js cache
rm -rf .next

# Restart TypeScript server (in VS Code: Cmd+Shift+P > "TypeScript: Restart TS Server")

# Verify tsconfig.json paths
pnpm type-check
```

### Build Errors

```bash
# Clear all caches
rm -rf .next node_modules

# Reinstall dependencies
pnpm install

# Rebuild
pnpm build
```

### Module Not Found

1. Check import path (use `@/` aliases)
2. Verify file exists
3. Check `tsconfig.json` paths configuration
4. Restart dev server

### Styling Issues

```bash
# Rebuild Tailwind
pnpm build

# Check Tailwind config
npx tailwindcss --help

# Verify Tailwind is processing
# Check for Tailwind classes in browser DevTools
```

### Hot Reload Not Working

1. Check file is saved
2. Check for syntax errors (prevents HMR)
3. Restart dev server
4. Clear browser cache

### Static Export Issues

```bash
# Verify static export config
# Check next.config.js has output: 'export'

# Test static build
pnpm build
pnpm serve:build  # Serves out/ directory

# Check for dynamic routes (not allowed in static export)
```

## Performance Tips

### Development Performance

- **Use Turbopack** (if available): Faster builds
- **Disable source maps** in production builds
- **Monitor bundle size**: Use `@next/bundle-analyzer`

### Code Splitting

- Tools are automatically code-split (dynamic imports)
- Large dependencies should be lazy-loaded
- Use `React.lazy()` for heavy components

### Optimization Checklist

- [ ] Components use `React.memo` when appropriate
- [ ] Expensive calculations use `useMemo`
- [ ] Event handlers use `useCallback` when needed
- [ ] Images optimized (if using Next.js Image)
- [ ] No unnecessary re-renders

## Best Practices

### Code Organization

- Keep components small and focused
- Extract reusable logic to hooks
- Separate concerns (logic, config, UI)
- Use TypeScript for type safety

### Git Workflow

- Create feature branches
- Write descriptive commit messages
- Test before committing
- Keep commits focused and atomic

### Documentation

- Document complex logic
- Add JSDoc to public APIs
- Update README for user-facing changes
- Update CHANGELOG for releases

---

For more information:
- [Architecture Documentation](./ARCHITECTURE.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [README](../README.md)

