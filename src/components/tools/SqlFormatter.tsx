'use client'

import { useToolState } from '@/components/providers/ToolStateProvider'
import { Button } from '@/components/ui/button'
import { CodePanel } from '@/components/ui/code-panel'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LoadFileButton } from '@/components/ui/load-file-button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DEFAULT_SQL_OPTIONS,
  SQL_DIALECT_OPTIONS,
  SQL_EXAMPLES,
  SQL_FORMAT_OPTIONS,
} from '@/config/sql-formatter-config'
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme'
import {
  formatSql,
  getSqlDialectValidationHint,
  getSqlStats,
  type SqlFormatOptions,
  type SqlFormatResult,
  type SqlLanguage,
} from '@/libs/sql-formatter'
import { cn } from '@/libs/utils'
import { ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

interface SqlFormatterProps {
  className?: string
  instanceId: string
}

export function SqlFormatter({ className, instanceId }: SqlFormatterProps) {
  const { toolState, updateToolState } = useToolState('sql-formatter', instanceId)

  const [options, setOptions] = useState<SqlFormatOptions>(
    (toolState?.options as SqlFormatOptions) ?? DEFAULT_SQL_OPTIONS
  )
  const [input, setInput] = useState<string>((toolState?.input as string) ?? '')
  const [output, setOutput] = useState<string>((toolState?.output as string) ?? '')
  const [isFormatting, setIsFormatting] = useState(false)
  const [error, setError] = useState<string>((toolState?.error as string) ?? '')
  const [stats, setStats] = useState<{ size: number; lines: number; statements: number } | null>(
    (toolState?.stats as { size: number; lines: number; statements: number }) ?? null
  )

  const [theme] = useCodeEditorTheme('basicDark')
  const [inputWrapText, setInputWrapText] = useState(true)
  const [outputWrapText, setOutputWrapText] = useState(true)

  const validationHint = getSqlDialectValidationHint(options.dialect)

  useEffect(() => {
    updateToolState({
      options,
      input,
      output,
      error,
      stats: stats || undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, input, output, error, stats])

  const handleFormat = async () => {
    if (!input.trim()) {
      setError('Please enter SQL to format')
      return
    }

    setIsFormatting(true)
    setError('')

    try {
      await new Promise((resolve) => setTimeout(resolve, 200))

      const result: SqlFormatResult = formatSql(input, options)

      if (result.isValid) {
        setOutput(result.formatted)
        setStats(getSqlStats(result.formatted))
      } else {
        setError(result.error || 'Invalid SQL')
        setOutput('')
        setStats(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to format SQL')
      setOutput('')
      setStats(null)
    } finally {
      setIsFormatting(false)
    }
  }

  const handleLoadExample = (type: 'valid' | 'minified' | 'invalid') => {
    setInput(SQL_EXAMPLES[type])
    setError('')
  }

  const getCharacterCount = (text: string): number => text.length

  const getLineCount = (text: string): number => {
    if (!text) return 0
    return text.split('\n').length
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="mb-3 text-[32px] leading-6 font-normal tracking-normal text-neutral-900 dark:text-neutral-100">
          SQL Formatter
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Validate, beautify, and minify SQL with dialect-aware formatting
        </p>
      </div>

      <div className="bg-background flex min-h-0 flex-1 flex-col overflow-y-auto px-[24px] pt-6 pb-10">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={options.format}
                onValueChange={(value: 'beautify' | 'minify') => setOptions((prev) => ({ ...prev, format: value }))}
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
                onValueChange={(value: SqlLanguage) => setOptions((prev) => ({ ...prev, dialect: value }))}
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
                  onValueChange={(value) => setOptions((prev) => ({ ...prev, indentSize: parseInt(value, 10) }))}
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
              <p className="max-w-3xl text-xs text-neutral-600 dark:text-neutral-400">{validationHint}</p>
            )}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
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
                      setInput(content)
                      setError('')
                    }}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                        Load examples
                        <ChevronDownIcon className="ml-1 h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleLoadExample('valid')}>
                        Valid multi-line example
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLoadExample('minified')}>
                        Minified example
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLoadExample('invalid')}>Invalid example</DropdownMenuItem>
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
                      <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
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
                    {stats && stats.statements > 0 && <span>{stats.statements} statement(s)</span>}
                  </>
                )
              }
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
