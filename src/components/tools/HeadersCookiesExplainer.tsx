'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  HEADERS_COOKIE_EXAMPLES,
  type HeaderCookieGlossaryCategory,
  type GlossaryEntry,
} from '@/config/headers-cookies-explainer-config';
import {
  parseHttpHeaderBlock,
  parseRequestCookiePairs,
  parseSetCookiePaste,
  type ParsedHeaderRow,
  type ParsedSetCookieCookie,
} from '@/libs/headers-cookies-explainer';
import { cn } from '@/libs/utils';
import { ChevronDownIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';

const TOOL_ID = 'headers-cookies-explainer' as const;

type MainTab = 'headers' | 'cookie-request' | 'set-cookie';

interface HeadersCookiesExplainerProps {
  className?: string;
  instanceId: string;
}

function categoryBadgeClass(cat: HeaderCookieGlossaryCategory | undefined): string {
  switch (cat) {
    case 'security':
      return 'border-red-200 bg-red-100 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100';
    case 'caching':
      return 'border-amber-200 bg-amber-100 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/35 dark:text-amber-50';
    case 'cors':
      return 'border-violet-200 bg-violet-100 text-violet-950 dark:border-violet-900/40 dark:bg-violet-950/40 dark:text-violet-100';
    case 'auth':
      return 'border-blue-200 bg-blue-100 text-blue-950 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-50';
    case 'privacy':
      return 'border-teal-200 bg-teal-100 text-teal-950 dark:border-teal-900/40 dark:bg-teal-950/35 dark:text-teal-50';
    case 'content':
      return 'border-sky-200 bg-sky-100 text-sky-950 dark:border-sky-900/40 dark:bg-sky-950/35 dark:text-sky-50';
    default:
      return 'border-neutral-200 bg-neutral-100 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100';
  }
}

function copyText(text: string) {
  if (!navigator.clipboard?.writeText) return;
  navigator.clipboard.writeText(text).catch(console.error);
}

export function HeadersCookiesExplainer({ className, instanceId }: HeadersCookiesExplainerProps) {
  const { toolState, updateToolState } = useToolState(TOOL_ID, instanceId);

  const [mainTab, setMainTab] = useState<MainTab>('headers');
  const [headersText, setHeadersText] = useState('');
  const [cookieRequestText, setCookieRequestText] = useState('');
  const [setCookieText, setSetCookieText] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  const [detailEntry, setDetailEntry] = useState<{ title: string; entry: GlossaryEntry } | null>(
    null
  );

  useEffect(() => {
    setIsHydrated(true);
    if (toolState) {
      if (toolState.mainTab) setMainTab(toolState.mainTab as MainTab);
      if (toolState.headersText !== undefined && toolState.headersText !== null) {
        setHeadersText(toolState.headersText as string);
      }
      if (toolState.cookieRequestText !== undefined && toolState.cookieRequestText !== null) {
        setCookieRequestText(toolState.cookieRequestText as string);
      }
      if (toolState.setCookieText !== undefined && toolState.setCookieText !== null) {
        setSetCookieText(toolState.setCookieText as string);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isHydrated) {
      updateToolState({
        mainTab,
        headersText,
        cookieRequestText,
        setCookieText,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainTab, headersText, cookieRequestText, setCookieText, isHydrated]);

  useEffect(() => {
    if (isHydrated && (!toolState || Object.keys(toolState).length === 0)) {
      setHeadersText('');
      setCookieRequestText('');
      setSetCookieText('');
      setMainTab('headers');
    }
  }, [toolState, isHydrated]);

  const parsedHeaders = useMemo(() => parseHttpHeaderBlock(headersText), [headersText]);
  const parsedRequestCookies = useMemo(
    () => parseRequestCookiePairs(cookieRequestText),
    [cookieRequestText]
  );
  const parsedSetCookies = useMemo(() => parseSetCookiePaste(setCookieText), [setCookieText]);

  const allWarnings =
    mainTab === 'headers'
      ? parsedHeaders.warnings
      : mainTab === 'cookie-request'
        ? parsedRequestCookies.warnings
        : parsedSetCookies.warnings;

  const openGlossary = (title: string, entry?: GlossaryEntry) => {
    if (!entry) return;
    setDetailEntry({ title, entry });
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="text-[32px] font-normal leading-8 tracking-normal text-neutral-900 dark:text-neutral-100 mb-3">
          Headers / Cookies explainer
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100 max-w-3xl">
          Paste HTTP headers or cookie strings copied from DevTools or server logs. The tool parses rows
          client-side only and attaches short glossary notes—not a substitute for inspecting real traffic policies.
        </p>
      </div>

      <div className="flex-1 flex flex-col bg-background px-[24px] pt-6 pb-10 min-h-0 overflow-hidden">
        <Tabs
          value={mainTab}
          onValueChange={(v) => setMainTab(v as MainTab)}
          className="flex flex-col gap-4 min-h-0 flex-1"
        >
          <TabsList className="w-full sm:w-auto flex-shrink-0">
            <TabsTrigger value="headers">HTTP headers</TabsTrigger>
            <TabsTrigger value="cookie-request">Cookie (request)</TabsTrigger>
            <TabsTrigger value="set-cookie">Set-Cookie</TabsTrigger>
          </TabsList>

          <TabsContent value="headers" className="flex flex-col gap-4 min-h-0 flex-1 mt-0 outline-none">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <Label htmlFor="hcd-headers-input" className="text-sm font-medium mb-2 block">
                  Header block
                </Label>
                <Textarea
                  id="hcd-headers-input"
                  value={headersText}
                  onChange={(e) => setHeadersText(e.target.value)}
                  spellCheck={false}
                  placeholder="Host: api.example.com&#10;Accept: application/json"
                  rows={10}
                  className="font-mono text-xs min-h-[220px]"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" className="gap-2 sm:self-auto self-start shrink-0">
                    Load example
                    <ChevronDownIcon className="h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setHeadersText(HEADERS_COOKIE_EXAMPLES.headRequest)}
                  >
                    Sample GET request
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setHeadersText(HEADERS_COOKIE_EXAMPLES.responseWithSetCookie)}
                  >
                    Sample response (+ Set-Cookie)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TabsContent>

          <TabsContent
            value="cookie-request"
            className="flex flex-col gap-4 min-h-0 flex-1 mt-0 outline-none"
          >
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <Label htmlFor="hcd-cookie-req-input" className="text-sm font-medium mb-2 block">
                  Cookie header value (omit <span className="font-mono">Cookie:</span> prefix)
                </Label>
                <Textarea
                  id="hcd-cookie-req-input"
                  value={cookieRequestText}
                  onChange={(e) => setCookieRequestText(e.target.value)}
                  spellCheck={false}
                  placeholder={"session=abc123; locale=en"}
                  rows={8}
                  className="font-mono text-xs min-h-[160px]"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 self-start sm:self-auto"
                onClick={() => setCookieRequestText(HEADERS_COOKIE_EXAMPLES.requestCookies)}
              >
                Load example
              </Button>
            </div>
          </TabsContent>

          <TabsContent
            value="set-cookie"
            className="flex flex-col gap-4 min-h-0 flex-1 mt-0 outline-none"
          >
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <Label htmlFor="hcd-set-cookie-input" className="text-sm font-medium mb-2 block">
                  One Set-Cookie per line (optional <span className="font-mono">Set-Cookie:</span>{' '}
                  prefix)
                </Label>
                <Textarea
                  id="hcd-set-cookie-input"
                  value={setCookieText}
                  onChange={(e) => setSetCookieText(e.target.value)}
                  spellCheck={false}
                  placeholder={`Set-Cookie: id=u1; Path=/; HttpOnly\nSet-Cookie: prefs=compact; Secure; SameSite=None`}
                  rows={10}
                  className="font-mono text-xs min-h-[220px]"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 self-start sm:self-auto"
                onClick={() => setSetCookieText(HEADERS_COOKIE_EXAMPLES.setCookiesMultiline)}
              >
                Load example
              </Button>
            </div>
          </TabsContent>

          {(allWarnings.length > 0 || (mainTab === 'headers' && parsedHeaders.malformedLines.length > 0)) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/90 dark:border-amber-900/50 dark:bg-amber-950/25 px-3 py-2 text-sm text-amber-950 dark:text-amber-100 flex-shrink-0 space-y-1">
              <p className="font-medium">Parsing notes</p>
              <ul className="list-disc pl-5 space-y-0.5 text-amber-900/90 dark:text-amber-200/90">
                {mainTab === 'headers' &&
                  parsedHeaders.malformedLines.map((m, i) => (
                    <li key={`m-${m.lineNumber}-${i}`}>
                      Line {m.lineNumber}: ignored “{m.content.slice(0, 64)}
                      {m.content.length > 64 ? '…' : ''}” (missing name:value colon)
                    </li>
                  ))}
                {allWarnings.map((w, i) => (
                  <li key={`w-${i}`}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {mainTab === 'headers' && parsedHeaders.skippedFirstLine?.trim() && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 flex-shrink-0">
              Stripped initial line:{' '}
              <span className="font-mono break-all">{parsedHeaders.skippedFirstLine.trim()}</span>
            </p>
          )}

          {/* Results */}
          <div className="flex-1 min-h-0 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-auto flex flex-col">
            {mainTab === 'headers' &&
              (parsedHeaders.rows.length === 0 ? (
                <p className="p-6 text-sm text-neutral-600 dark:text-neutral-400">
                  Paste a header block to see a row-by-row breakdown.
                </p>
              ) : (
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900/95 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
                    <tr>
                      <th className="px-4 py-3 font-medium min-w-[140px]">Header</th>
                      <th className="px-4 py-3 font-medium min-w-[120px]">Value</th>
                      <th className="px-4 py-3 font-medium w-36">Topic</th>
                      <th className="px-4 py-3 font-medium">Summary</th>
                      <th className="px-4 py-3 font-medium w-28 text-right">Copy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedHeaders.rows.map((row, index) => (
                      <ParsedHeaderRowTr
                        key={`${row.name}-${row.occurrenceIndex}-${index}`}
                        row={row}
                        onOpenExplain={
                          row.glossary
                            ? () =>
                                openGlossary(
                                  `${row.name} (#${row.occurrenceIndex})`,
                                  row.glossary
                                )
                            : undefined
                        }
                      />
                    ))}
                  </tbody>
                </table>
              ))}

            {mainTab === 'cookie-request' &&
              (parsedRequestCookies.pairs.length === 0 ? (
                <p className="p-6 text-sm text-neutral-600 dark:text-neutral-400">
                  Paste cookie pairs from the Cookie request header (_name=value;_).
                </p>
              ) : (
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900/95 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Value</th>
                      <th className="px-4 py-3 font-medium w-28 text-right">Copy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRequestCookies.pairs.map((p, i) => (
                      <tr
                        key={`${p.name}-${i}`}
                        className={cn(
                          'border-b border-neutral-100 dark:border-neutral-800/80',
                          i % 2 === 0 ? 'bg-background' : 'bg-neutral-50/50 dark:bg-neutral-950/30'
                        )}
                      >
                        <td className="px-4 py-2.5 font-mono text-neutral-900 dark:text-neutral-100">
                          {p.name}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-neutral-700 dark:text-neutral-300 break-all">
                          {p.value || '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => copyText(`${p.name}=${p.value}`)}
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}

            {mainTab === 'set-cookie' &&
              (parsedSetCookies.cookies.length === 0 ? (
                <p className="p-6 text-sm text-neutral-600 dark:text-neutral-400">
                  Paste newline-separated Set-Cookie lines; avoid merging multiple cookies on one line when Expires dates
                  are present (commas confuse naive splitting).
                </p>
              ) : (
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {parsedSetCookies.cookies.map((cookie, ci) => (
                    <div key={`${cookie.cookieName}-${ci}`} className="p-4 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="font-mono text-sm text-neutral-900 dark:text-neutral-100">
                          <span className="font-semibold">{cookie.cookieName}</span>
                          <span className="text-neutral-600 dark:text-neutral-400 mx-1">=</span>
                          <span className="break-all">{cookie.cookieValue || '(empty)'}</span>
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 shrink-0"
                          onClick={() =>
                            copyText(`${cookie.cookieName}=${cookie.cookieValue}`)
                          }
                        >
                          Copy name=value
                        </Button>
                      </div>
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/50">
                            <th className="px-3 py-2 font-medium">Attribute</th>
                            <th className="px-3 py-2 font-medium">Value</th>
                            <th className="px-3 py-2 font-medium">Topic</th>
                            <th className="px-3 py-2 font-medium">Summary</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cookie.attributes.map((attr, ai) => (
                            <SetCookieAttrRow
                              key={`${ci}-${attr.name}-${ai}`}
                              attr={attr}
                              cookieName={cookie.cookieName}
                              onOpenExplain={(title, entry) => openGlossary(title, entry)}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </Tabs>
      </div>

      <Dialog open={detailEntry !== null} onOpenChange={(open) => !open && setDetailEntry(null)}>
        <DialogContent className="max-w-lg gap-6">
          {detailEntry ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{detailEntry.title}</DialogTitle>
              </DialogHeader>
              <DialogDescription asChild>
                <div className="space-y-3 text-left text-neutral-900 dark:text-neutral-100">
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] uppercase tracking-wide', categoryBadgeClass(detailEntry.entry.category))}
                  >
                    {detailEntry.entry.category}
                  </Badge>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <span className="font-medium">{detailEntry.entry.summary}</span>
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {detailEntry.entry.detail}
                  </p>
                </div>
              </DialogDescription>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ParsedHeaderRowTr({
  row,
  onOpenExplain,
}: {
  row: ParsedHeaderRow;
  onOpenExplain?: () => void;
}) {
  return (
    <tr
      className={cn(
        'border-b border-neutral-100 dark:border-neutral-800/80',
        'transition-colors hover:bg-neutral-100/90 dark:hover:bg-neutral-800/50'
      )}
    >
      <td className="px-4 py-2.5 align-top">
        <div className="font-mono text-neutral-900 dark:text-neutral-100">
          {row.name}
          {row.occurrenceIndex > 1 && (
            <span className="ml-2 text-[10px] text-neutral-500 dark:text-neutral-400">
              #{row.occurrenceIndex}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-2.5 align-top font-mono text-xs text-neutral-700 dark:text-neutral-300 break-all max-w-[40vw] sm:max-w-md">
        {row.value || '—'}
      </td>
      <td className="px-4 py-2.5 align-top">
        {row.glossary?.category ? (
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] uppercase tracking-normal',
              categoryBadgeClass(row.glossary.category)
            )}
          >
            {row.glossary.category}
          </Badge>
        ) : (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">—</span>
        )}
      </td>
      <td className="px-4 py-2.5 align-top text-neutral-700 dark:text-neutral-300 leading-snug">
        {row.glossary && onOpenExplain ? (
          <button
            type="button"
            onClick={onOpenExplain}
            className="text-left underline-offset-2 hover:underline text-neutral-800 dark:text-neutral-200 cursor-pointer bg-transparent border-0 p-0 font-inherit"
          >
            {row.glossary.summary}
          </button>
        ) : (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            No glossary entry for this header name yet.
          </span>
        )}
      </td>
      <td className="px-4 py-2.5 align-top text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => copyText(`${row.name}: ${row.value}`)}
          aria-label="Copy header line"
        >
          <DocumentDuplicateIcon className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}

function SetCookieAttrRow({
  attr,
  cookieName,
  onOpenExplain,
}: {
  attr: ParsedSetCookieCookie['attributes'][number];
  cookieName: string;
  onOpenExplain: (title: string, entry: GlossaryEntry) => void;
}) {
  const title = `${cookieName} » ${attr.name}`;
  const glossary = attr.glossary;
  return (
    <tr className="border-b border-neutral-100 dark:border-neutral-800/40">
      <td className="px-3 py-2 font-mono text-xs text-neutral-900 dark:text-neutral-100 align-top">{attr.name}</td>
      <td className="px-3 py-2 font-mono text-xs text-neutral-700 dark:text-neutral-300 break-all align-top">
        {attr.value || '(flag)'}
      </td>
      <td className="px-3 py-2 align-top">
        {glossary?.category ? (
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] uppercase tracking-normal whitespace-nowrap',
              categoryBadgeClass(glossary.category)
            )}
          >
            {glossary.category}
          </Badge>
        ) : (
          <span className="text-xs text-neutral-500">—</span>
        )}
      </td>
      <td className="px-3 py-2 text-neutral-700 dark:text-neutral-300 text-xs align-top leading-snug">
        {glossary ? (
          <button
            type="button"
            className="text-left underline-offset-2 hover:underline cursor-pointer bg-transparent border-0 p-0 font-inherit text-inherit"
            onClick={() => onOpenExplain(title, glossary)}
          >
            {glossary.summary}
          </button>
        ) : (
          <span className="text-neutral-500 dark:text-neutral-400">
            Standard cookie attribute semantics apply.
          </span>
        )}
      </td>
    </tr>
  );
}
