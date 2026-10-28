/**
 * Monaco Editor Instance Component
 * React component wrapper for Monaco Editor with Shiki integration
 * Uses @monaco-editor/react with dynamic loading
 */

'use client';

import type { CodeEditorTheme } from '@/config/code-editor-themes';
import { getMonacoTheme } from '@/config/monaco-themes';
import { connectShikiToMonaco, isShikiConnectedToMonaco } from '@/libs/monaco-shiki-bridge';
import { createMonacoOptions, getMonacoLanguageId } from '@/libs/monaco-utils';
import { getShikiHighlighter, initializeShiki, isShikiInitialized, loadShikiTheme } from '@/libs/shiki-init';
import { cn } from '@/libs/utils';
import type { OnMount } from '@monaco-editor/react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';

// Dynamic import of Monaco Editor React component
// ssr: false is required because Monaco Editor doesn't work on server
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    ),
  }
);

export interface MonacoEditorInstanceProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  theme?: CodeEditorTheme;
  showLineNumbers?: boolean;
  wrapText?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  height?: string;
  className?: string;
  padding?: { top?: number; bottom?: number };
  singleLine?: boolean;
  onMount?: OnMount;
}

/**
 * Monaco Editor Instance Component
 * Wraps @monaco-editor/react with Shiki integration
 */
export function MonacoEditorInstance({
  value = '',
  onChange,
  language = 'plaintext',
  theme = 'basicDark',
  showLineNumbers = true,
  wrapText = true,
  readOnly = false,
  placeholder,
  height = '400px',
  className,
  padding,
  singleLine = false,
  onMount,
}: MonacoEditorInstanceProps) {
  const [initError, setInitError] = useState<Error | null>(null);
  const initializationRef = useRef(false);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);

  // Get Monaco theme - recalculate when theme prop changes
  // This ensures the theme is always up-to-date, especially on initial load
  const monacoTheme = useMemo(() => getMonacoTheme(theme), [theme]);

  // Load theme helper function with proper fallback chain
  const loadThemeSafely = async (monaco: Parameters<OnMount>[1], themeName: string, currentTheme: CodeEditorTheme): Promise<string> => {
    // First, check if theme is already loaded
    const highlighter = getShikiHighlighter();
    if (highlighter) {
      const loadedThemes: readonly string[] = highlighter.getLoadedThemes();
      if (loadedThemes.includes(themeName)) {
        return themeName;
      }
    }

    // Try to load the requested theme
    try {
      await loadShikiTheme(themeName);
      return themeName;
    } catch (themeError) {
      // If theme loading fails, try fallback themes in order
      console.warn(`Theme ${themeName} not available, trying fallback`, themeError);

      // Determine if we need light or dark theme
      const isLight = currentTheme.includes('Light') ||
                     currentTheme === 'basicLight' ||
                     currentTheme === 'vscodeLight' ||
                     currentTheme === 'githubLight' ||
                     currentTheme === 'materialLight' ||
                     currentTheme === 'solarizedLight';

      // Fallback chain: try multiple themes in order
      const fallbackThemes = isLight
        ? ['github-light', 'light-plus'] // Light fallbacks
        : ['github-dark', 'dark-plus']; // Dark fallbacks

      for (const fallbackTheme of fallbackThemes) {
        try {
          // Check if already loaded
          if (highlighter) {
            const loaded: readonly string[] = highlighter.getLoadedThemes();
            if (loaded.includes(fallbackTheme)) {
              return fallbackTheme;
            }
          }

          await loadShikiTheme(fallbackTheme);
          return fallbackTheme;
        } catch {
          // Try next fallback
          continue;
        }
      }

      // Last resort: use VS Code defaults (these should always be available)
      const defaultTheme = isLight ? 'light-plus' : 'dark-plus';
      console.warn(`All fallback themes failed, using default: ${defaultTheme}`);
      return defaultTheme;
    }
  };

  // Handle editor mount - initialize Shiki and connect to Monaco here
  const handleEditorDidMount: OnMount = async (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure single-line mode if enabled
    if (singleLine) {
      // Prevent Enter key from creating new lines
      editor.onKeyDown((e) => {
        // Check both keyCode (Monaco's KeyCode enum) and key property
        const isEnter = e.keyCode === monaco.KeyCode?.Enter || e.keyCode === 3;
        if (isEnter) {
          e.preventDefault();
          e.stopPropagation();
        }
      });

      // Remove any existing newlines from the value
      if (value && value.includes('\n')) {
        const singleLineValue = value.split('\n')[0];
        editor.setValue(singleLineValue);
        if (onChange) {
          onChange(singleLineValue);
        }
      }

      // Update editor options for single-line mode
      editor.updateOptions({
        wordWrap: 'off',
        scrollBeyondLastLine: false,
        lineNumbers: 'off',
        minimap: { enabled: false },
      });
    }

    // Call custom onMount if provided
    onMount?.(editor, monaco);

    // Prevent multiple initializations
    if (initializationRef.current) {
      return;
    }

    try {
      initializationRef.current = true;

      // Initialize Shiki if not already initialized
      if (!isShikiInitialized()) {
        await initializeShiki();
      }

      // Connect Shiki to Monaco if not already connected
      const highlighter = getShikiHighlighter();
      if (highlighter && !isShikiConnectedToMonaco()) {
        await connectShikiToMonaco(monaco, highlighter);
      }

      // Load the current theme if not already loaded
      // This ensures the theme is available before we try to use it
      // Use the current monacoTheme from the prop (which should be the persisted theme)
      const currentMonacoTheme = getMonacoTheme(theme);
      const loadedTheme = await loadThemeSafely(monaco, currentMonacoTheme, theme);

      // Always set the theme, even if it's the same, to ensure it's applied
      monaco.editor.setTheme(loadedTheme);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to initialize Shiki');
      setInitError(err);
      console.error('Shiki initialization error:', err);
      // Don't block editor from working if Shiki fails
    }

    // Additional setup if needed
    // For example, setting up placeholder
    if (placeholder && !value) {
      // Monaco doesn't have built-in placeholder, but we can add it via CSS or overlay
      // This is handled by the parent component or via styling
    }
  };

  // Handle theme changes dynamically
  // This effect ensures the theme is updated when the prop changes
  useEffect(() => {
    if (!monacoRef.current || !editorRef.current) {
      return;
    }

    const updateTheme = async () => {
      try {
        // Load the theme and apply it
        const loadedTheme = await loadThemeSafely(monacoRef.current, monacoTheme, theme);
        monacoRef.current.editor.setTheme(loadedTheme);
      } catch (error) {
        console.warn('Failed to update theme:', error);
      }
    };

    updateTheme();

  }, [theme, monacoTheme]);

  const monacoOptions = createMonacoOptions(
    language,
    showLineNumbers,
    wrapText,
    readOnly
  );

  // Show error state (only for critical errors)
  if (initError) {
    // Log error but don't block editor - Shiki is optional
    console.warn('Shiki initialization warning:', initError.message);
  }

  // Render Monaco Editor immediately - it will handle its own loading state
  // Shiki initialization happens in onMount callback (non-blocking)
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <MonacoEditor
        height={height}
        language={getMonacoLanguageId(language)}
        theme={monacoTheme}
        value={singleLine ? (value.split('\n')[0] || '') : value}
        onChange={(newValue) => {
          if (onChange) {
            // For single-line mode, remove any newlines
            const processedValue = singleLine ? (newValue || '').split('\n')[0] : (newValue || '');
            onChange(processedValue);
          }
        }}
        options={{
          ...monacoOptions,
          readOnly,
          ...(singleLine && {
            wordWrap: 'off',
            scrollBeyondLastLine: false,
            lineNumbers: 'off',
          }),
          ...(padding && {
            padding: {
              top: padding.top ?? 0,
              bottom: padding.bottom ?? 0,
            },
          }),
        }}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading editor...</p>
            </div>
          </div>
        }
      />
    </div>
  );
}

