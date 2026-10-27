# Architecture Documentation

This document provides a comprehensive overview of DevPockit's architecture, design decisions, and implementation patterns.

## Table of Contents

- [System Overview](#system-overview)
- [Project Structure](#project-structure)
- [Component Architecture](#component-architecture)
- [Tool Implementation Pattern](#tool-implementation-pattern)
- [State Management](#state-management)
- [Routing](#routing)
- [Build & Deployment](#build--deployment)
- [Design Decisions](#design-decisions)

## System Overview

DevPockit is a client-side web application built with Next.js 16 that provides 30+ developer tools. All processing happens in the browser, ensuring privacy and optimal performance.

### Key Characteristics

- **Client-Side Only**: No backend server required, all tools run in the browser
- **Static Export**: Can be deployed as static files (GitHub Pages compatible)
- **Type-Safe**: Full TypeScript implementation with strict mode
- **Component-Based**: React components with clear separation of concerns
- **Modular**: Tools are self-contained modules that can be easily added/removed

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Code Editor**: Monaco Editor
- **Package Manager**: pnpm
- **Testing**: Jest + React Testing Library

## Project Structure

```
devpockit/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   └── tools/              # Tool routes
│   │       └── [category]/
│   │           └── [toolId]/
│   │               └── page.tsx
│   ├── components/
│   │   ├── ui/                 # Shadcn/ui components
│   │   ├── tools/              # Tool-specific components
│   │   ├── layout/             # Layout components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   └── ...
│   │   └── pages/              # Page components
│   ├── libs/                   # Core logic and utilities
│   │   ├── tools-data.ts       # Tool definitions
│   │   ├── tool-components.ts  # Dynamic component loader
│   │   └── [tool-name].ts     # Tool-specific logic
│   ├── config/                 # Tool configurations
│   │   └── [tool-name]-config.ts
│   ├── hooks/                  # Custom React hooks
│   │   ├── useMonacoEditor.ts
│   │   └── useCodeEditorTheme.ts
│   ├── types/                  # TypeScript type definitions
│   │   └── tools.ts
│   └── providers/              # React context providers
│       └── ToolStateProvider.tsx
├── public/                     # Static assets
├── .github/                    # GitHub templates and workflows
├── docs/                       # Documentation
└── scripts/                    # Build and utility scripts
```

### Directory Purposes

#### `src/app/`
Next.js App Router directory. Contains:
- **Layout**: Root layout with theme provider and tool state provider
- **Pages**: Route pages, including dynamic tool pages
- **Global Styles**: Tailwind CSS and custom styles

#### `src/components/`
React components organized by purpose:
- **`ui/`**: Reusable UI components from Shadcn/ui
- **`tools/`**: Tool-specific React components (one per tool)
- **`layout/`**: Layout components (sidebar, header, etc.)
- **`pages/`**: Page-level components

#### `src/libs/`
Core business logic:
- **`tools-data.ts`**: Central registry of all tools and categories
- **`tool-components.ts`**: Dynamic component loader for static export compatibility
- **`[tool-name].ts`**: Pure functions implementing tool logic (no React dependencies)

#### `src/config/`
Tool configuration files:
- Tool-specific options, examples, and settings
- Separated from logic for easier maintenance

#### `src/hooks/`
Custom React hooks:
- Editor hooks (Monaco Editor integration)
- Theme hooks
- Reusable state management hooks

#### `src/types/`
TypeScript type definitions:
- Shared interfaces and types
- Tool type definitions

#### `src/providers/`
React context providers:
- Tool state management
- Theme management (via next-themes)

## Component Architecture

### Component Hierarchy

```
AppLayout (Root)
├── AppSidebar (Navigation)
├── Header (Top bar with search)
└── ToolPage
    └── DynamicToolRenderer
        └── [Tool Component]
            ├── Input Section
            ├── Settings/Options
            └── Output Section
```

### Key Components

#### AppLayout
- **Purpose**: Root layout wrapper
- **Responsibilities**:
  - Provides theme context
  - Provides tool state context
  - Renders sidebar and main content
  - Handles responsive layout

#### AppSidebar
- **Purpose**: Navigation sidebar
- **Responsibilities**:
  - Displays tool categories
  - Tool search functionality
  - Mobile-responsive navigation
  - Active tool highlighting

#### DynamicToolRenderer
- **Purpose**: Dynamically loads tool components
- **Responsibilities**:
  - Maps tool ID to component name
  - Lazy loads tool components
  - Handles loading states
  - Error boundaries for tools

#### Tool Components
- **Purpose**: Individual tool implementations
- **Structure**:
  ```typescript
  export function ToolName() {
    // State management
    // Event handlers
    // Tool logic (via libs/)
    // UI rendering
  }
  ```

### Component Patterns

#### Separation of Concerns
- **Logic**: Pure functions in `src/libs/`
- **Configuration**: Data in `src/config/`
- **UI**: React components in `src/components/tools/`
- **State**: React hooks and context

#### Reusability
- Shared UI components in `src/components/ui/`
- Common patterns extracted to hooks
- Configuration-driven tool options

## Tool Implementation Pattern

### Adding a New Tool

Each tool follows a consistent pattern with four main parts:

#### 1. Tool Logic (`src/libs/[tool-name].ts`)

Pure functions that implement the tool's core functionality:

```typescript
// src/libs/json-formatter.ts
export function formatJson(input: string, minify: boolean): string {
  // Pure function, no React dependencies
  // Handles all business logic
  // Returns formatted result
}
```

**Principles**:
- Pure functions (no side effects)
- No React dependencies
- Easy to test
- Reusable across contexts

#### 2. Tool Configuration (`src/config/[tool-name]-config.ts`)

Configuration data for the tool:

```typescript
// src/config/json-formatter-config.ts
export const JSON_FORMAT_OPTIONS = {
  // Options, examples, defaults
};

export const JSON_EXAMPLES = {
  // Example inputs
};
```

**Contains**:
- Default options
- Example inputs
- Validation rules
- UI configuration

#### 3. Tool Component (`src/components/tools/[ToolName].tsx`)

React component that provides the UI:

```typescript
// src/components/tools/JsonFormatter.tsx
export function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [options, setOptions] = useState(DEFAULT_OPTIONS);

  const handleFormat = () => {
    const result = formatJson(input, options.minify);
    setOutput(result);
  };

  return (
    <div>
      {/* Input section */}
      {/* Options section */}
      {/* Output section */}
    </div>
  );
}
```

**Responsibilities**:
- User interface
- State management
- Event handling
- Calls logic functions from `libs/`

#### 4. Tool Registration (`src/libs/tools-data.ts`)

Register the tool in the central registry:

```typescript
{
  id: 'json-formatter',
  name: 'JSON Formatter',
  description: 'Format and beautify JSON data',
  category: 'formatters',
  path: '/tools/formatters/json-formatter',
  component: 'JsonFormatter',
  // ... other metadata
}
```

### Tool Component Structure

Standard tool component follows this structure:

```typescript
export function ToolName() {
  // 1. State declarations
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [options, setOptions] = useState(DEFAULT_OPTIONS);

  // 2. Event handlers
  const handleProcess = () => {
    const result = processTool(input, options);
    setOutput(result);
  };

  // 3. UI rendering
  return (
    <div className="tool-container">
      <ToolHeader />
      <InputSection />
      <OptionsSection />
      <OutputSection />
    </div>
  );
}
```

### Dynamic Component Loading

For static export compatibility, tools are loaded dynamically:

```typescript
// src/libs/tool-components.ts
export const getToolComponent = async (componentName: string) => {
  const componentMap = {
    'JsonFormatter': () => import('@/components/tools/JsonFormatter'),
    // ... other tools
  };
  return componentMap[componentName]();
};
```

This allows:
- Code splitting per tool
- Smaller initial bundle
- Static export compatibility
- Lazy loading

## State Management

### Tool State Provider

Global tool state management via React Context:

```typescript
// src/providers/ToolStateProvider.tsx
export function ToolStateProvider({ children }) {
  const [toolStates, setToolStates] = useState({});

  const saveToolState = (toolId: string, state: any) => {
    // Save tool state
  };

  const getToolState = (toolId: string) => {
    // Retrieve tool state
  };

  return (
    <ToolStateContext.Provider value={{ ... }}>
      {children}
    </ToolStateContext.Provider>
  );
}
```

**Features**:
- Persists tool state across navigation
- Per-tool state isolation
- LocalStorage integration (optional)

### Local Component State

Most tools use local React state:
- Input values
- Output results
- UI state (expanded/collapsed)
- Options/settings

### Theme State

Managed by `next-themes`:
- Dark/light mode
- System preference detection
- Persistent theme selection

## Routing

### Route Structure

```
/                          # Home page
/tools                     # Tools listing
/tools/[category]          # Category page
/tools/[category]/[toolId] # Individual tool page
```

### Dynamic Routes

Next.js App Router dynamic routes:
- `[category]`: Tool category (e.g., "formatters", "encoders")
- `[toolId]`: Specific tool ID (e.g., "json-formatter")

### Route Implementation

```typescript
// src/app/tools/[category]/[toolId]/page.tsx
export default async function ToolPage({ params }) {
  const { category, toolId } = await params;
  const tool = getToolById(toolId);

  return <AppLayout><ToolPageContent tool={tool} /></AppLayout>;
}
```

## Build & Deployment

### Build Process

1. **Type Checking**: TypeScript compilation
2. **Linting**: ESLint validation
3. **Testing**: Jest test suite
4. **Build**: Next.js production build
5. **Export**: Static file generation (if needed)

### Static Export

For static hosting (GitHub Pages, etc.):

```javascript
// next.config.js
module.exports = {
  output: 'export',
  trailingSlash: true,
};
```

**Considerations**:
- All routes must be statically generable
- Dynamic imports for code splitting
- No server-side features

### Build Output

```
.next/          # Next.js build output
out/            # Static export (if enabled)
```

### Deployment

The application can be deployed as:
- **Static Site**: Export to `out/` directory
- **Node.js App**: Run `next start` with `.next/` directory
- **Serverless**: Vercel, Netlify, etc.

## Design Decisions

### Why Client-Side Only?

- **Privacy**: No data sent to servers
- **Performance**: Instant processing
- **Cost**: No server infrastructure needed
- **Reliability**: Works offline (with service workers)

### Why Next.js App Router?

- **Modern**: Latest Next.js features
- **TypeScript**: Excellent TypeScript support
- **Static Export**: Can generate static sites
- **Code Splitting**: Automatic route-based splitting
- **Performance**: Optimized out of the box

### Why Shadcn/ui?

- **Accessible**: Built on Radix UI
- **Customizable**: Copy components, not install
- **Type-Safe**: Full TypeScript support
- **Modern**: Uses latest React patterns

### Why Separate Logic from Components?

- **Testability**: Pure functions are easy to test
- **Reusability**: Logic can be used outside React
- **Maintainability**: Clear separation of concerns
- **Performance**: Logic can be optimized independently

### Why Dynamic Component Loading?

- **Code Splitting**: Smaller initial bundle
- **Static Export**: Required for static site generation
- **Performance**: Load tools on demand
- **Scalability**: Easy to add new tools

## Performance Considerations

### Code Splitting
- Route-based splitting (automatic)
- Component-based splitting (dynamic imports)
- Tool-level splitting (each tool is separate chunk)

### Optimization Techniques
- **Lazy Loading**: Tools loaded on demand
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For long lists (if needed)
- **Image Optimization**: Next.js Image component

### Bundle Size
- Tree shaking enabled
- Minimal dependencies
- Shared code extracted
- Tool code split per tool

## Security Considerations

### Client-Side Security
- **Input Validation**: All inputs validated
- **XSS Prevention**: React's built-in escaping
- **No Eval**: No use of eval() or similar
- **Content Security Policy**: Can be configured

### Privacy
- **No Tracking**: No analytics or tracking
- **No Data Collection**: All processing local
- **No External Requests**: Tools don't call APIs (except IP checker)

## Future Architecture Considerations

### Potential Enhancements
- **Service Workers**: Offline support
- **IndexedDB**: Local data persistence
- **Web Workers**: Heavy computation off main thread
- **Progressive Web App**: PWA capabilities

### Scalability
- Current architecture supports 100+ tools
- Dynamic loading ensures performance
- Modular design allows easy extension

---

For implementation details, see [CONTRIBUTING.md](../CONTRIBUTING.md).
For development setup, see [CONTRIBUTING.md](../CONTRIBUTING.md#development-setup).

