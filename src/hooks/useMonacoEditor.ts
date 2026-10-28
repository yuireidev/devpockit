/**
 * Monaco Editor Hook
 * Manages Monaco Editor instance lifecycle and configuration
 */

import type { CodeEditorTheme } from '@/config/code-editor-themes';
import { getMonacoTheme } from '@/config/monaco-themes';
import { connectShikiToMonaco, isShikiConnectedToMonaco } from '@/libs/monaco-shiki-bridge';
import { createMonacoOptions, getMonacoLanguageId } from '@/libs/monaco-utils';
import { getShikiHighlighter, initializeShiki, isShikiInitialized } from '@/libs/shiki-init';
import type * as Monaco from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    monaco?: typeof Monaco;
  }
}

export interface UseMonacoEditorOptions {
  language?: string;
  theme?: CodeEditorTheme;
  showLineNumbers?: boolean;
  wrapText?: boolean;
  readOnly?: boolean;
  placeholder?: string;
}

export interface UseMonacoEditorReturn {
  editorRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  error: Error | null;
  editorInstance: Monaco.editor.IStandaloneCodeEditor | null;
}

/**
 * Hook to manage Monaco Editor instance
 * Handles dynamic loading, initialization, and lifecycle
 * @param value - Editor content value
 * @param onChange - Callback when content changes
 * @param options - Editor configuration options
 * @returns Editor ref, loading state, error, and editor instance
 */
export function useMonacoEditor(
  value: string,
  onChange: ((value: string) => void) | undefined,
  options: UseMonacoEditorOptions
): UseMonacoEditorReturn {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMonacoLoaded, setIsMonacoLoaded] = useState(false);
  const [editorInstance, setEditorInstance] = useState<Monaco.editor.IStandaloneCodeEditor | null>(null);

  // Keep refs updated
  useEffect(() => {
    onChangeRef.current = onChange;
    valueRef.current = value;
  }, [onChange, value]);

  // Initialize Monaco and Shiki
  useEffect(() => {
    let isMounted = true;

    const initializeEditor = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Step 1: Load Monaco Editor dynamically
        if (!isMonacoLoaded) {
          const monacoModule = await import('monaco-editor');
          const monaco = monacoModule.default || monacoModule;

          // Store Monaco in window for @monaco-editor/react
          if (typeof window !== 'undefined') {
            window.monaco = monaco as typeof Monaco;
          }

          setIsMonacoLoaded(true);

          if (!isMounted) return;

          // Step 2: Initialize Shiki
          if (!isShikiInitialized()) {
            await initializeShiki();
          }

          if (!isMounted) return;

          // Step 3: Connect Shiki to Monaco
          const highlighter = getShikiHighlighter();
          if (highlighter && !isShikiConnectedToMonaco()) {
            await connectShikiToMonaco(monaco, highlighter);
          }
        }

        if (!isMounted || !editorRef.current) return;

        // Step 4: Get Monaco instance
        const monacoModule = await import('monaco-editor');
        const monaco = window.monaco || (monacoModule.default || monacoModule) as typeof Monaco;

        // Step 5: Destroy existing editor if it exists
        if (editorInstanceRef.current) {
          editorInstanceRef.current.dispose();
          editorInstanceRef.current = null;
        }

        // Step 6: Create Monaco options
        const monacoTheme = getMonacoTheme(options.theme || 'basicDark');
        const monacoOptions = createMonacoOptions(
          options.language,
          options.showLineNumbers ?? true,
          options.wrapText ?? true,
          options.readOnly ?? false
        );

        const editorOptions: Monaco.editor.IStandaloneEditorConstructionOptions = {
          ...monacoOptions,
          theme: monacoTheme,
          value: value || '',
          readOnly: options.readOnly ?? false,
        };

        // Step 7: Create editor instance
        const editor = monaco.editor.create(editorRef.current, editorOptions);

        // Step 8: Set up change listener
        editor.onDidChangeModelContent(() => {
          if (onChangeRef.current) {
            const newValue = editor.getValue();
            if (newValue !== valueRef.current) {
              valueRef.current = newValue;
              onChangeRef.current(newValue);
            }
          }
        });

        editorInstanceRef.current = editor;
        setEditorInstance(editor);
        setIsLoading(false);
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error('Failed to initialize Monaco Editor');
          setError(error);
          setIsLoading(false);
          console.error('Monaco Editor initialization error:', error);
        }
      }
    };

    initializeEditor();

    return () => {
      isMounted = false;
      if (editorInstanceRef.current) {
        editorInstanceRef.current.dispose();
        editorInstanceRef.current = null;
        setEditorInstance(null);
      }
    };
    // value is handled by a separate useEffect below, so we don't include it here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isMonacoLoaded,
    options.language,
    options.theme,
    options.showLineNumbers,
    options.wrapText,
    options.readOnly,
  ]);

  // Update editor content when value changes externally
  useEffect(() => {
    if (editorInstanceRef.current) {
      const currentValue = editorInstanceRef.current.getValue();
      if (value !== currentValue) {
        editorInstanceRef.current.setValue(value);
        valueRef.current = value;
      }
    }
  }, [value]);

  // Update editor options when they change
  useEffect(() => {
    if (editorInstanceRef.current) {
      const monacoTheme = getMonacoTheme(options.theme || 'basicDark');
      const monacoOptions = createMonacoOptions(
        options.language,
        options.showLineNumbers ?? true,
        options.wrapText ?? true,
        options.readOnly ?? false
      );

      // Update theme
      editorInstanceRef.current.updateOptions({
        ...monacoOptions,
        theme: monacoTheme,
      });

      // Update language
      const languageId = getMonacoLanguageId(options.language);
      const model = editorInstanceRef.current.getModel();
      if (model) {
        // Get Monaco instance from window or import
        const monaco = window.monaco;
        if (monaco && monaco.editor) {
          monaco.editor.setModelLanguage(model, languageId);
        }
      }
    }
  }, [options.language, options.theme, options.showLineNumbers, options.wrapText, options.readOnly]);

  return {
    editorRef,
    isLoading,
    error,
    editorInstance,
  };
}

