'use client'

import { ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useEffect, useMemo, useState } from 'react'

import { useToolState } from '@/components/providers/ToolStateProvider'
import { Button } from '@/components/ui/button'
import { CodePanel } from '@/components/ui/code-panel'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  CSV_MARKDOWN_EXAMPLES,
  DEFAULT_CSV_MARKDOWN_OPTIONS,
  type CsvMarkdownConverterOptions,
} from '@/config/csv-markdown-converter-config'
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme'
import {
  convertCsvMarkdown,
  isLargeInput,
  type CsvMarkdownResult,
  type CsvMarkdownWarning,
  type TableInputKind,
} from '@/libs/csv-markdown-converter'
import { cn } from '@/libs/utils'

interface CsvMarkdownConverterProps {
  className?: string
  instanceId: string
}

export function CsvMarkdownConverter({ className, instanceId }: CsvMarkdownConverterProps) {
  const { toolState, updateToolState } = useToolState('csv-markdown-converter', instanceId)

  const [options, setOptions] = useState<CsvMarkdownConverterOptions>(
    (toolState?.options as CsvMarkdownConverterOptions) ?? DEFAULT_CSV_MARKDOWN_OPTIONS
  )
  const [input, setInput] = useState<string>((toolState?.input as string) ?? '')
  const [output, setOutput] = useState<string>((toolState?.output as string) ?? '')
  const [error, setError] = useState<string>((toolState?.error as string) ?? '')
  const [warnings, setWarnings] = useState<CsvMarkdownWarning[]>((toolState?.warnings as CsvMarkdownWarning[]) ?? [])
  const [stats, setStats] = useState<CsvMarkdownResult['stats'] | null>(
    (toolState?.stats as CsvMarkdownResult['stats']) ?? null
  )
  const [detected, setDetected] = useState<TableInputKind | ''>((toolState?.detected as TableInputKind) ?? '')

  const [theme] = useCodeEditorTheme('basicDark')
  const [inputWrap, setInputWrap] = useState(true)
  const [outputWrap, setOutputWrap] = useState(true)

  const isMdToCsv = options.direction === 'md-to-csv'
  const isLarge = useMemo(() => isLargeInput(input), [input])

  useEffect(() => {
    updateToolState({ options, input, output, error, warnings, stats, detected })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, input, output, error, warnings, stats, detected])

  const applyResult = (result: CsvMarkdownResult) => {
    if (result.success) {
      setOutput(result.output)
      setError('')
      setWarnings(result.warnings)
      setStats(result.stats)
      setDetected(result.detectedInput ?? '')
    } else {
      setOutput('')
      setError(result.error ?? 'Conversion failed')
      setWarnings(result.warnings)
      setStats(null)
      setDetected('')
    }
  }

  const clearResult = () => {
    setOutput('')
    setError('')
    setWarnings([])
    setStats(null)
    setDetected('')
  }

  useEffect(() => {
    if (!input.trim() || isLarge) return

    const timer = setTimeout(() => applyResult(convertCsvMarkdown(input, options)), 200)
    return () => clearTimeout(timer)
  }, [input, options, isLarge])

  const handleInputChange = (value: string) => {
    setInput(value)
    if (!value.trim() || isLargeInput(value)) {
      clearResult()
    }
  }

  const handleConvert = () => {
    if (!input.trim()) {
      clearResult()
      return
    }
    applyResult(convertCsvMarkdown(input, options))
  }

  const handleSwap = () => {
    const canSwap = output.trim().length > 0 && !error
    setOptions((prev) => ({
      ...prev,
      direction: prev.direction === 'csv-to-md' ? 'md-to-csv' : 'csv-to-md',
    }))
    if (canSwap) {
      setInput(output)
      clearResult()
    }
  }

  const handleDirectionChange = (direction: CsvMarkdownConverterOptions['direction']) => {
    setOptions((prev) => ({ ...prev, direction }))
    clearResult()
  }

  const loadExample = (key: keyof typeof CSV_MARKDOWN_EXAMPLES) => {
    setInput(CSV_MARKDOWN_EXAMPLES[key])
    clearResult()
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="mb-3 text-[32px] leading-6 font-normal tracking-normal text-neutral-900 dark:text-neutral-100">
          CSV ↔ Markdown Table Converter
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Convert CSV or spreadsheet paste (TSV) to GitHub-flavored Markdown tables, and convert Markdown tables back to
          CSV or TSV. Everything runs in your browser.
        </p>
      </div>

      <div className="bg-background flex min-h-0 flex-1 flex-col overflow-y-auto px-[24px] pt-6 pb-10">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={options.direction}
                onValueChange={(value) => handleDirectionChange(value as CsvMarkdownConverterOptions['direction'])}
              >
                <SelectTrigger label="Direction:" className="min-w-[280px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv-to-md">CSV / Spreadsheet → Markdown</SelectItem>
                  <SelectItem value="md-to-csv">Markdown → CSV / TSV</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={handleSwap} title="Swap">
                <ArrowPathIcon className="mr-1 h-3 w-3" />
                Swap
              </Button>
              <Button size="sm" className="h-8 px-3 text-xs" onClick={handleConvert}>
                Convert
              </Button>
              {isMdToCsv && (
                <Select
                  value={options.reverseOutputFormat}
                  onValueChange={(value) =>
                    setOptions((prev) => ({
                      ...prev,
                      reverseOutputFormat: value as CsvMarkdownConverterOptions['reverseOutputFormat'],
                    }))
                  }
                >
                  <SelectTrigger label="Output Format:" className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="tsv">TSV (Excel paste)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {!isMdToCsv && (
              <div className="flex min-h-[40px] flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">First row is header:</span>
                  <Switch
                    aria-label="First row is header"
                    checked={options.firstRowIsHeader}
                    onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, firstRowIsHeader: checked }))}
                  />
                </div>
                <Select
                  value={options.alignment}
                  onValueChange={(value) =>
                    setOptions((prev) => ({
                      ...prev,
                      alignment: value as CsvMarkdownConverterOptions['alignment'],
                    }))
                  }
                >
                  <SelectTrigger label="Alignment:" className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Pad cells:</span>
                  <Switch
                    aria-label="Pad cells"
                    checked={options.padCells}
                    onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, padCells: checked }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Skip empty rows:</span>
                  <Switch
                    aria-label="Skip empty rows"
                    checked={options.skipEmptyRows}
                    onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, skipEmptyRows: checked }))}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
            <CodePanel
              fillHeight={true}
              title={isMdToCsv ? 'Input (Markdown)' : 'Input (CSV / TSV)'}
              value={input}
              onChange={handleInputChange}
              language={isMdToCsv ? 'markdown' : 'plaintext'}
              height="500px"
              theme={theme}
              wrapText={inputWrap}
              onWrapTextChange={setInputWrap}
              placeholder={isMdToCsv ? 'Paste a Markdown table…' : 'Paste from Excel/Sheets or raw CSV…'}
              showCopyButton={true}
              showClearButton={true}
              headerActions={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                      Load Example <ChevronDownIcon className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => loadExample('tsv')}>Spreadsheet paste (TSV)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => loadExample('csv')}>Raw CSV</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => loadExample('markdown')}>Markdown table</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
              footerLeftContent={
                stats && detected ? (
                  <>
                    <span>
                      {stats.rows} rows × {stats.cols} cols
                    </span>
                    <span>detected: {detected}</span>
                  </>
                ) : null
              }
            />
            <CodePanel
              fillHeight={true}
              title={isMdToCsv ? `Output (${options.reverseOutputFormat.toUpperCase()})` : 'Output (Markdown)'}
              value={output}
              readOnly={true}
              language={isMdToCsv ? 'plaintext' : 'markdown'}
              height="500px"
              theme={theme}
              wrapText={outputWrap}
              onWrapTextChange={setOutputWrap}
              footerLeftContent={
                output && stats ? (
                  <>
                    <span>
                      {stats.rows} rows × {stats.cols} cols
                    </span>
                    <span>{output.length} chars</span>
                  </>
                ) : null
              }
            />
          </div>

          {isLarge && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-200">
              Large input: live preview is paused. Click Convert to update the output.
            </div>
          )}

          {warnings.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
              <ul className="list-disc space-y-1 pl-4">
                {warnings.map((warning, index) => (
                  <li key={`${warning.code}-${index}`}>{warning.message}</li>
                ))}
              </ul>
            </div>
          )}

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
