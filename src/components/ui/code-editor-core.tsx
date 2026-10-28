/**
 * CodeEditorCore Component
 * A minimal Monaco Editor wrapper - just the editor, no chrome
 */

'use client';

import { MonacoEditorInstance } from '@/components/ui/monaco-editor-instance';
import { type CodeEditorTheme } from '@/config/code-editor-themes';
import { cn } from '@/libs/utils';
import type { OnMount } from '@monaco-editor/react';

export interface CodeEditorCoreProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  theme?: CodeEditorTheme;
  readOnly?: boolean;
  wrapText?: boolean;
  showLineNumbers?: boolean;
  placeholder?: string;
  height?: string;
  className?: string;
  singleLine?: boolean;
  onMount?: OnMount;
}

export function CodeEditorCore({
  value,
  onChange,
  language = 'plaintext',
  theme = 'basicDark',
  readOnly = false,
  wrapText = true,
  showLineNumbers = true,
  placeholder,
  height = '100%',
  className,
  singleLine = false,
  onMount,
}: CodeEditorCoreProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-neutral-900 rounded-[8px] overflow-hidden h-full',
        className
      )}
      style={{ height }}
    >
      <MonacoEditorInstance
        value={value}
        onChange={onChange}
        language={language}
        theme={theme}
        showLineNumbers={showLineNumbers}
        wrapText={wrapText}
        readOnly={readOnly}
        placeholder={placeholder}
        height="100%"
        className="h-full"
        padding={singleLine ? { top: 4, bottom: 4 } : { top: 8 }}
        singleLine={singleLine}
        onMount={onMount}
      />
    </div>
  );
}

