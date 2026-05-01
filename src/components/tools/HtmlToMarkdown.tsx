'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { CodePanel } from '@/components/ui/code-panel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LoadFileButton } from '@/components/ui/load-file-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DEFAULT_HTML_TO_MARKDOWN_OPTIONS,
  HTML_TO_MARKDOWN_EXAMPLES,
  HTML_TO_MARKDOWN_OPTIONS,
} from '@/config/html-to-markdown-config';
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme';
import { convertHtmlToMarkdown, type HtmlToMarkdownOptions } from '@/libs/html-to-markdown';
import { cn } from '@/libs/utils';
import { ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface HtmlToMarkdownProps {
  className?: string;
  instanceId: string;
}

export function HtmlToMarkdown({ className, instanceId }: HtmlToMarkdownProps) {
  const { toolState, updateToolState } = useToolState('html-to-markdown', instanceId);

  const [options, setOptions] = useState<HtmlToMarkdownOptions>(DEFAULT_HTML_TO_MARKDOWN_OPTIONS);
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState(false);

  const [theme] = useCodeEditorTheme('basicDark');
  const [inputWrapText, setInputWrapText] = useState(true);
  const [outputWrapText, setOutputWrapText] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
    if (toolState) {
      if (toolState.options) setOptions(toolState.options as HtmlToMarkdownOptions);
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
      setOptions(DEFAULT_HTML_TO_MARKDOWN_OPTIONS);
      setInput('');
      setOutput('');
      setError('');
    }
  }, [toolState, isHydrated]);

  const handleConvert = async () => {
    if (!input.trim()) {
      setError('Please enter HTML to convert');
      return;
    }

    setIsConverting(true);
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const result = convertHtmlToMarkdown(input, options);
      if (result.error) {
        setError(result.error);
        setOutput('');
      } else {
        setError('');
        setOutput(result.markdown);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setOutput('');
    } finally {
      setIsConverting(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    setError('');
    try {
      if (!navigator.clipboard?.read) {
        setError(
          'Clipboard read is not available. Use HTTPS or paste HTML manually into the editor.'
        );
        return;
      }
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const htmlType = item.types.find((t) => t === 'text/html' || t.startsWith('text/html'));
        if (htmlType) {
          const blob = await item.getType(htmlType);
          const html = await blob.text();
          setInput(html);
          return;
        }
      }
      setError('No HTML found on clipboard. Copy from a web page or paste into the editor.');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not read clipboard. Grant permission or paste manually.'
      );
    }
  };

  const loadExample = (key: keyof typeof HTML_TO_MARKDOWN_EXAMPLES) => {
    setInput(HTML_TO_MARKDOWN_EXAMPLES[key]);
    setError('');
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="text-[32px] font-normal leading-6 tracking-normal text-neutral-900 dark:text-neutral-100 mb-3">
          HTML to Markdown
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Convert HTML copied from websites into GitHub-flavored Markdown. Works best with rich
          HTML from the browser; use the clipboard button on HTTPS or localhost, or paste manually.
        </p>
      </div>

      <div className="flex-1 flex flex-col bg-background px-[24px] pt-6 pb-10 min-h-0 overflow-y-auto">
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Select
                value={options.headingStyle}
                onValueChange={(value: HtmlToMarkdownOptions['headingStyle']) =>
                  setOptions((prev) => ({ ...prev, headingStyle: value }))
                }
              >
                <SelectTrigger label="Headings:" className="min-w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTML_TO_MARKDOWN_OPTIONS.headingStyles.map((h) => (
                    <SelectItem key={h.value} value={h.value}>
                      {h.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={options.bulletListMarker}
                onValueChange={(value: HtmlToMarkdownOptions['bulletListMarker']) =>
                  setOptions((prev) => ({ ...prev, bulletListMarker: value }))
                }
              >
                <SelectTrigger label="List marker:" className="min-w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTML_TO_MARKDOWN_OPTIONS.bulletMarkers.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={options.codeBlockStyle}
                onValueChange={(value: HtmlToMarkdownOptions['codeBlockStyle']) =>
                  setOptions((prev) => ({ ...prev, codeBlockStyle: value }))
                }
              >
                <SelectTrigger label="Code blocks:" className="min-w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTML_TO_MARKDOWN_OPTIONS.codeBlockStyles.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={options.fence}
                onValueChange={(value: HtmlToMarkdownOptions['fence']) =>
                  setOptions((prev) => ({ ...prev, fence: value }))
                }
              >
                <SelectTrigger label="Fence:" className="min-w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTML_TO_MARKDOWN_OPTIONS.fences.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={options.strongDelimiter}
                onValueChange={(value: HtmlToMarkdownOptions['strongDelimiter']) =>
                  setOptions((prev) => ({ ...prev, strongDelimiter: value }))
                }
              >
                <SelectTrigger label="Strong:" className="min-w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTML_TO_MARKDOWN_OPTIONS.strongDelimiters.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={options.emDelimiter}
                onValueChange={(value: HtmlToMarkdownOptions['emDelimiter']) =>
                  setOptions((prev) => ({ ...prev, emDelimiter: value }))
                }
              >
                <SelectTrigger label="Emphasis:" className="min-w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTML_TO_MARKDOWN_OPTIONS.emDelimiters.map((em) => (
                    <SelectItem key={em.value} value={em.value}>
                      {em.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
            <CodePanel
              fillHeight={true}
              title="HTML input"
              value={input}
              onChange={setInput}
              language="html"
              height="500px"
              theme={theme}
              wrapText={inputWrapText}
              onWrapTextChange={setInputWrapText}
              showCopyButton={false}
              showClearButton={true}
              headerActions={
                <>
                  <LoadFileButton
                    accept=".html,.htm,.xhtml,.txt,*/*"
                    onFileLoad={(content) => {
                      setInput(content);
                      setError('');
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => void handlePasteFromClipboard()}
                  >
                    Paste HTML from clipboard
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                        Load examples
                        <ChevronDownIcon className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => loadExample('article')}>
                        Article snippet
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => loadExample('table')}>
                        Table (GFM)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => loadExample('strike')}>
                        Strikethrough
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              }
              footerRightContent={
                <Button
                  onClick={() => void handleConvert()}
                  disabled={!input.trim() || isConverting}
                  variant="default"
                  size="sm"
                  className="h-8 px-4"
                >
                  {isConverting ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                      Converting…
                    </>
                  ) : (
                    'Convert'
                  )}
                </Button>
              }
            />

            <CodePanel
              fillHeight={true}
              title="Markdown output"
              value={output}
              language="markdown"
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
