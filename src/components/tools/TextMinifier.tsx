'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { CodePanel } from '@/components/ui/code-panel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LoadFileButton } from '@/components/ui/load-file-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  DEFAULT_TEXT_MINIFY_OPTIONS,
  TEXT_MINIFIER_EXAMPLES,
  TEXT_MINIFY_MODE_OPTIONS,
} from '@/config/text-minifier-config';
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme';
import { minifyText, type TextMinifyOptions, type TextMinifyResult } from '@/libs/text-minifier';
import { cn } from '@/libs/utils';
import { ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface TextMinifierProps {
  className?: string;
  instanceId: string;
}

export function TextMinifier({ className, instanceId }: TextMinifierProps) {
  const { toolState, updateToolState } = useToolState('text-minifier', instanceId);

  const [options, setOptions] = useState<TextMinifyOptions>(DEFAULT_TEXT_MINIFY_OPTIONS);
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isMinifying, setIsMinifying] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [stats, setStats] = useState<Omit<TextMinifyResult, 'output'> | null>(null);

  const [theme] = useCodeEditorTheme('basicDark');
  const [inputWrapText, setInputWrapText] = useState(true);
  const [outputWrapText, setOutputWrapText] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
    if (toolState) {
      if (toolState.options) setOptions(toolState.options as TextMinifyOptions);
      if (toolState.input) setInput(toolState.input as string);
      if (toolState.output) setOutput(toolState.output as string);
      if (toolState.error) setError(toolState.error as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isHydrated) {
      updateToolState({
        options,
        input,
        output,
        error,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, input, output, error, isHydrated]);

  useEffect(() => {
    if (isHydrated && (!toolState || Object.keys(toolState).length === 0)) {
      setOptions(DEFAULT_TEXT_MINIFY_OPTIONS);
      setInput('');
      setOutput('');
      setError('');
      setStats(null);
    }
  }, [toolState, isHydrated]);

  const handleMinify = async () => {
    if (!input.trim()) {
      setError('Please enter text to minify');
      return;
    }

    setIsMinifying(true);
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const result = minifyText(input, options);
      setOutput(result.output);
      setStats({
        originalLength: result.originalLength,
        outputLength: result.outputLength,
        originalLineCount: result.originalLineCount,
        outputLineCount: result.outputLineCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to minify text');
      setOutput('');
      setStats(null);
    } finally {
      setIsMinifying(false);
    }
  };

  const loadExample = (key: keyof typeof TEXT_MINIFIER_EXAMPLES) => {
    setInput(TEXT_MINIFIER_EXAMPLES[key]);
    setError('');
  };

  const perLineMode = options.mode === 'per_line';

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="text-[32px] font-normal leading-6 tracking-normal text-neutral-900 dark:text-neutral-100 mb-3">
          Text Minifier
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Collapse extra whitespace in plain text. Use single-line mode for one paragraph, or per-line mode to compact
          each line while preserving line breaks.
        </p>
      </div>

      <div className="flex-1 flex flex-col bg-background px-[24px] pt-6 pb-10 min-h-0 overflow-y-auto">
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Select
                value={options.mode}
                onValueChange={(value: TextMinifyOptions['mode']) =>
                  setOptions((prev) => ({ ...prev, mode: value }))
                }
              >
                <SelectTrigger label="Mode:" className="min-w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEXT_MINIFY_MODE_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Switch
                  checked={options.normalizeLineEndings}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, normalizeLineEndings: checked }))
                  }
                  size="sm"
                  id="text-minify-normalize-eol"
                />
                <label
                  htmlFor="text-minify-normalize-eol"
                  className="text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer select-none"
                >
                  Normalize line endings (CRLF → LF)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={options.removeEmptyLines}
                  disabled={!perLineMode}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, removeEmptyLines: checked }))
                  }
                  size="sm"
                  id="text-minify-remove-empty"
                />
                <label
                  htmlFor="text-minify-remove-empty"
                  className={cn(
                    'text-sm select-none',
                    perLineMode
                      ? 'text-neutral-600 dark:text-neutral-400 cursor-pointer'
                      : 'text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                  )}
                >
                  Remove empty lines
                </label>
              </div>
            </div>

            {stats && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Before: {stats.originalLength.toLocaleString()} characters · {stats.originalLineCount.toLocaleString()}{' '}
                lines → After: {stats.outputLength.toLocaleString()} characters ·{' '}
                {stats.outputLineCount.toLocaleString()} lines
              </p>
            )}
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
            <CodePanel
              fillHeight={true}
              title="Input"
              value={input}
              onChange={setInput}
              language="plaintext"
              height="500px"
              theme={theme}
              wrapText={inputWrapText}
              onWrapTextChange={setInputWrapText}
              showCopyButton={false}
              showClearButton={true}
              headerActions={
                <>
                  <LoadFileButton
                    accept=".txt,.md,text/plain,*/*"
                    onFileLoad={(content) => {
                      setInput(content);
                      setError('');
                    }}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                        Load examples
                        <ChevronDownIcon className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => loadExample('multilineParagraph')}>
                        Multiline paragraph
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => loadExample('indentedBlocks')}>
                        Indented lines
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => loadExample('mixedCrlf')}>
                        Mixed CRLF / LF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              }
              footerRightContent={
                <Button
                  onClick={() => void handleMinify()}
                  disabled={!input.trim() || isMinifying}
                  variant="default"
                  size="sm"
                  className="h-8 px-4"
                >
                  {isMinifying ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                      Minifying…
                    </>
                  ) : (
                    'Minify'
                  )}
                </Button>
              }
            />

            <CodePanel
              fillHeight={true}
              title="Output"
              value={output}
              language="plaintext"
              height="500px"
              theme={theme}
              wrapText={outputWrapText}
              onWrapTextChange={setOutputWrapText}
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
