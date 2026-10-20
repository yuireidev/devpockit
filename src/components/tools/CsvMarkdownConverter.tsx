'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { CodePanel } from '@/components/ui/code-panel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  CSV_MARKDOWN_EXAMPLES,
  DEFAULT_CSV_MARKDOWN_OPTIONS,
  type CsvMarkdownConverterOptions,
} from '@/config/csv-markdown-converter-config';
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme';
import { convertCsvMarkdown, type CsvMarkdownResult } from '@/libs/csv-markdown-converter';
import { ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface CsvMarkdownConverterProps {
  className?: string;
  instanceId: string;
}

export function CsvMarkdownConverter({ className, instanceId }: CsvMarkdownConverterProps) {
  const { toolState, updateToolState } = useToolState('csv-markdown-converter', instanceId);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [options, setOptions] = useState<CsvMarkdownConverterOptions>(DEFAULT_CSV_MARKDOWN_OPTIONS);
  const [error, setError] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [stats, setStats] = useState<CsvMarkdownResult['stats'] | null>(null);
  const [detected, setDetected] = useState<string>('');
  const [theme] = useCodeEditorTheme('basicDark');
  const [inputWrap, setInputWrap] = useState(true);
  const [outputWrap, setOutputWrap] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
    if (toolState) {
      if (toolState.input) setInput(toolState.input as string);
      if (toolState.output) setOutput(toolState.output as string);
      if (toolState.options) setOptions(toolState.options as CsvMarkdownConverterOptions);
      if (toolState.error) setError(toolState.error as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isHydrated) updateToolState({ input, output, options, error });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, output, options, error, isHydrated]);

  useEffect(() => {
    if (isHydrated && (!toolState || Object.keys(toolState).length === 0)) {
      setInput(''); setOutput(''); setOptions(DEFAULT_CSV_MARKDOWN_OPTIONS);
      setError(''); setStats(null); setDetected('');
    }
  }, [toolState, isHydrated]);

  useEffect(() => {
    if (isHydrated && input.trim()) handleConvert();
    else { setOutput(''); setError(''); setStats(null); setDetected(''); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, options, isHydrated]);

  const handleConvert = () => {
    if (!input.trim()) { setOutput(''); setError(''); setStats(null); return; }
    const result = convertCsvMarkdown(input, options);
    if (result.success) {
      setOutput(result.output); setStats(result.stats);
      setDetected(result.detectedInput ?? ''); setError('');
    } else {
      setOutput(''); setError(result.error || 'Conversion failed'); setStats(null); setDetected('');
    }
  };

  const handleSwap = () => {
    setOptions(prev => ({
      ...prev,
      direction: prev.direction === 'csv-to-md' ? 'md-to-csv' : 'csv-to-md',
    }));
    setInput(output);
    setOutput('');
  };

  const isCsvToMd = options.direction === 'csv-to-md';

  return (
    <div className={`flex flex-col h-full ${className ?? ''}`}>
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="text-[32px] font-normal leading-6 tracking-normal text-neutral-900 dark:text-neutral-100 mb-3">
          CSV to Markdown Table
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Paste from Excel/Sheets or raw CSV to get a Markdown table — and convert Markdown tables back to CSV/TSV
        </p>
      </div>
      <div className="flex-1 flex flex-col bg-background px-[24px] pt-6 pb-10 min-h-0 overflow-auto">
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Select
                value={options.direction}
                onValueChange={value => setOptions(prev => ({ ...prev, direction: value as typeof prev.direction }))}
              >
                <SelectTrigger label="Direction:" className="min-w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv-to-md">CSV / Spreadsheet → Markdown</SelectItem>
                  <SelectItem value="md-to-csv">Markdown → CSV / TSV</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleSwap} className="h-8 px-3 text-xs" title="Swap direction">
                <ArrowPathIcon className="h-3 w-3 mr-1" /> Swap
              </Button>
              {!isCsvToMd && (
                <Select
                  value={options.reverseOutputFormat}
                  onValueChange={value => setOptions(prev => ({ ...prev, reverseOutputFormat: value as typeof prev.reverseOutputFormat }))}
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
            {isCsvToMd && (
              <div className="flex items-center gap-4 flex-wrap min-h-[40px]">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">First row is header:</span>
                  <Switch checked={options.firstRowIsHeader} onCheckedChange={checked => setOptions(prev => ({ ...prev, firstRowIsHeader: checked }))} />
                </div>
                <Select
                  value={options.alignment}
                  onValueChange={value => setOptions(prev => ({ ...prev, alignment: value as typeof prev.alignment }))}
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
                  <span className="text-sm text-muted-foreground">Pad cells:</span>
                  <Switch checked={options.padCells} onCheckedChange={checked => setOptions(prev => ({ ...prev, padCells: checked }))} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Trim cells:</span>
                  <Switch checked={options.trimCells} onCheckedChange={checked => setOptions(prev => ({ ...prev, trimCells: checked }))} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Skip empty rows:</span>
                  <Switch checked={options.skipEmptyRows} onCheckedChange={checked => setOptions(prev => ({ ...prev, skipEmptyRows: checked }))} />
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
            <CodePanel
              fillHeight={true}
              title={isCsvToMd ? 'Input (CSV / TSV)' : 'Input (Markdown)'}
              value={input}
              onChange={setInput}
              language={isCsvToMd ? 'plaintext' : 'markdown'}
              height="500px"
              theme={theme}
              wrapText={inputWrap}
              onWrapTextChange={setInputWrap}
              placeholder={isCsvToMd ? 'Paste from Excel/Sheets or raw CSV…' : 'Paste a Markdown table…'}
              showCopyButton={true}
              showClearButton={true}
              headerActions={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                      Load Example <ChevronDownIcon className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setInput(CSV_MARKDOWN_EXAMPLES.tsv)}>Spreadsheet paste (TSV)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setInput(CSV_MARKDOWN_EXAMPLES.csv)}>Raw CSV</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setInput(CSV_MARKDOWN_EXAMPLES.markdown)}>Markdown table</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
              footerLeftContent={stats && detected ? <><span>{stats.rows} rows × {stats.cols} cols</span><span>detected: {detected}</span></> : <></>}
            />
            <CodePanel
              fillHeight={true}
              title={isCsvToMd ? 'Output (Markdown)' : `Output (${options.reverseOutputFormat.toUpperCase()})`}
              value={output}
              readOnly={true}
              language={isCsvToMd ? 'markdown' : 'plaintext'}
              height="500px"
              theme={theme}
              wrapText={outputWrap}
              onWrapTextChange={setOutputWrap}
              footerLeftContent={output && stats ? <><span>{stats.rows} rows × {stats.cols} cols</span><span>{output.length} chars</span></> : <></>}
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
