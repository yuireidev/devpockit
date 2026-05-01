'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { CodePanel } from '@/components/ui/code-panel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LoadFileButton } from '@/components/ui/load-file-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DEFAULT_SQL_OPTIONS,
  SQL_DIALECT_OPTIONS,
  SQL_EXAMPLES,
  SQL_FORMAT_OPTIONS,
} from '@/config/sql-formatter-config';
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme';
import {
  formatSql,
  getSqlDialectValidationHint,
  getSqlStats,
  type SqlFormatOptions,
  type SqlFormatResult,
  type SqlLanguage,
} from '@/libs/sql-formatter';
import { cn } from '@/libs/utils';
import { ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface SqlFormatterProps {
  className?: string;
  instanceId: string;
}

export function SqlFormatter({ className, instanceId }: SqlFormatterProps) {
  const { toolState, updateToolState } = useToolState('sql-formatter', instanceId);

  const [options, setOptions] = useState<SqlFormatOptions>(DEFAULT_SQL_OPTIONS);
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isFormatting, setIsFormatting] = useState(false);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState<{ size: number; lines: number; statements: number } | null>(
    null
  );
  const [isHydrated, setIsHydrated] = useState(false);

  const [theme] = useCodeEditorTheme('basicDark');
  const [inputWrapText, setInputWrapText] = useState(true);
  const [outputWrapText, setOutputWrapText] = useState(true);

  const validationHint = getSqlDialectValidationHint(options.dialect);

  useEffect(() => {
    setIsHydrated(true);
    if (toolState) {
      if (toolState.options) setOptions(toolState.options as SqlFormatOptions);
      if (toolState.input) setInput(toolState.input as string);
      if (toolState.output) setOutput(toolState.output as string);
      if (toolState.error) setError(toolState.error as string);
      if (toolState.stats) {
        setStats(toolState.stats as { size: number; lines: number; statements: number });
      }
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
        stats: stats || undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, input, output, error, stats, isHydrated]);

  useEffect(() => {
    if (isHydrated && (!toolState || Object.keys(toolState).length === 0)) {
      setOptions(DEFAULT_SQL_OPTIONS);
      setInput('');
      setOutput('');
      setError('');
      setStats(null);
    }
  }, [toolState, isHydrated]);

  const handleFormat = async () => {
    if (!input.trim()) {
      setError('Please enter SQL to format');
      return;
    }

    setIsFormatting(true);
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const result: SqlFormatResult = formatSql(input, options);

      if (result.isValid) {
        setOutput(result.formatted);
        setStats(getSqlStats(result.formatted));
      } else {
        setError(result.error || 'Invalid SQL');
        setOutput('');
        setStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to format SQL');
      setOutput('');
      setStats(null);
    } finally {
      setIsFormatting(false);
    }
  };

  const handleLoadExample = (type: 'valid' | 'minified' | 'invalid') => {
    setInput(SQL_EXAMPLES[type]);
    setError('');
  };

  const getCharacterCount = (text: string): number => text.length;

  const getLineCount = (text: string): number => {
    if (!text) return 0;
    return text.split('\n').length;
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="text-[32px] font-normal leading-6 tracking-normal text-neutral-900 dark:text-neutral-100 mb-3">
          SQL Formatter
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Validate, beautify, and minify SQL with dialect-aware formatting
        </p>
      </div>

      <div className="flex-1 flex flex-col bg-background px-[24px] pt-6 pb-10 min-h-0 overflow-y-auto">
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Select
                value={options.format}
                onValueChange={(value: 'beautify' | 'minify') =>
                  setOptions((prev) => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger label="Format type:" className="min-w-[260px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SQL_FORMAT_OPTIONS.formats.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={options.dialect}
                onValueChange={(value: SqlLanguage) =>
                  setOptions((prev) => ({ ...prev, dialect: value }))
                }
              >
                <SelectTrigger label="Dialect:" className="min-w-[280px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SQL_DIALECT_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={options.keywordCase}
                onValueChange={(value: 'preserve' | 'upper' | 'lower') =>
                  setOptions((prev) => ({ ...prev, keywordCase: value }))
                }
              >
                <SelectTrigger label="Keywords:" className="min-w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SQL_FORMAT_OPTIONS.keywordCases.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {options.format === 'beautify' && (
                <Select
                  value={options.indentSize.toString()}
                  onValueChange={(value) =>
                    setOptions((prev) => ({ ...prev, indentSize: parseInt(value, 10) }))
                  }
                >
                  <SelectTrigger label="Indent:" className="min-w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SQL_FORMAT_OPTIONS.indentSizes.map((indent) => (
                      <SelectItem key={indent.value} value={indent.value.toString()}>
                        {indent.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {validationHint && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-3xl">
                {validationHint}
              </p>
            )}
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
            <CodePanel
              fillHeight={true}
              title="SQL input"
              value={input}
              onChange={setInput}
              language="sql"
              height="500px"
              theme={theme}
              wrapText={inputWrapText}
              onWrapTextChange={setInputWrapText}
              showCopyButton={false}
              showClearButton={true}
              headerActions={
                <>
                  <LoadFileButton
                    accept=".sql,.txt,*/*"
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
                      <DropdownMenuItem onClick={() => handleLoadExample('valid')}>
                        Valid multi-line example
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLoadExample('minified')}>
                        Minified example
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLoadExample('invalid')}>
                        Invalid example
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              }
              footerLeftContent={<span>{getCharacterCount(input)} characters</span>}
              footerRightContent={
                <Button
                  onClick={handleFormat}
                  disabled={!input.trim() || isFormatting}
                  variant="default"
                  size="sm"
                  className="h-8 px-4"
                >
                  {isFormatting ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                      Formatting…
                    </>
                  ) : (
                    'Format'
                  )}
                </Button>
              }
            />

            <CodePanel
              fillHeight={true}
              title="Formatted SQL"
              value={output}
              language="sql"
              height="500px"
              theme={theme}
              wrapText={outputWrapText}
              onWrapTextChange={setOutputWrapText}
              footerLeftContent={
                output && (
                  <>
                    <span>{getCharacterCount(output)} characters</span>
                    <span>{getLineCount(output)} lines</span>
                    {stats && stats.statements > 0 && (
                      <span>{stats.statements} statement(s)</span>
                    )}
                  </>
                )
              }
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
