'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HTTP_STATUS_CATEGORY_OPTIONS } from '@/config/http-status-cheatsheet-config';
import {
  filterHttpStatuses,
  getHttpStatusLineExample,
  getHttpStatusTroubleshooting,
  HTTP_STATUS_ENTRIES,
  type HttpStatusCategoryFilter,
  type HttpStatusEntry,
} from '@/libs/http-status-codes';
import { cn } from '@/libs/utils';
import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';

interface HttpStatusCheatsheetProps {
  className?: string;
  instanceId: string;
}

export function HttpStatusCheatsheet({ className, instanceId }: HttpStatusCheatsheetProps) {
  const { toolState, updateToolState } = useToolState('http-status-cheatsheet', instanceId);

  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<HttpStatusCategoryFilter>('all');
  const [detailEntry, setDetailEntry] = useState<HttpStatusEntry | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (toolState) {
      if (toolState.searchQuery !== undefined && toolState.searchQuery !== null) {
        setSearchQuery(toolState.searchQuery as string);
      }
      if (toolState.category) setCategory(toolState.category as HttpStatusCategoryFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isHydrated) {
      updateToolState({ searchQuery, category });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, category, isHydrated]);

  useEffect(() => {
    if (isHydrated && (!toolState || Object.keys(toolState).length === 0)) {
      setSearchQuery('');
      setCategory('all');
    }
  }, [toolState, isHydrated]);

  const filtered = useMemo(
    () => filterHttpStatuses(searchQuery, category),
    [searchQuery, category]
  );

  const categoryBadgeClass = (c: HttpStatusCategoryFilter): string => {
    switch (c) {
      case '1xx':
        return 'bg-sky-100 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100';
      case '2xx':
        return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100';
      case '3xx':
        return 'bg-amber-100 text-amber-950 dark:bg-amber-950/35 dark:text-amber-50';
      case '4xx':
        return 'bg-orange-100 text-orange-950 dark:bg-orange-950/40 dark:text-orange-50';
      case '5xx':
        return 'bg-red-100 text-red-950 dark:bg-red-950/40 dark:text-red-50';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100';
    }
  };

  const openDetail = (row: HttpStatusEntry) => setDetailEntry(row);

  const onRowActivate = (row: HttpStatusEntry) => () => openDetail(row);

  const onRowKeyDown =
    (row: HttpStatusEntry) => (e: KeyboardEvent<HTMLTableRowElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDetail(row);
      }
    };

  const troubleshootingParagraphs = useMemo(() => {
    if (!detailEntry) return [];
    return getHttpStatusTroubleshooting(detailEntry).split('\n\n').filter(Boolean);
  }, [detailEntry]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="text-[32px] font-normal leading-8 tracking-normal text-neutral-900 dark:text-neutral-100 mb-3">
          HTTP Status Codes
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100 max-w-3xl">
          Searchable cheatsheet for common HTTP response status codes ({HTTP_STATUS_ENTRIES.length}{' '}
          entries). Filter by status class or search code, phrase, or description.
        </p>
      </div>

      <div className="flex-1 flex flex-col bg-background px-[24px] pt-6 pb-10 min-h-0 overflow-hidden">
        <div className="flex flex-col gap-4 min-h-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-shrink-0">
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              <Label htmlFor="http-status-search" className="text-sm font-medium">
                Search
              </Label>
              <Input
                id="http-status-search"
                type="search"
                placeholder="Code, phrase, or description…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xl"
              />
            </div>
            <div className="flex flex-col gap-2 sm:w-[240px]">
              <Select
                value={category}
                onValueChange={(value: HttpStatusCategoryFilter) => setCategory(value)}
              >
                <SelectTrigger id="http-status-category" label="Show:" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTTP_STATUS_CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 flex-shrink-0">
            Showing {filtered.length}{' '}
            {filtered.length === 1 ? 'status code' : 'status codes'}
            {category !== 'all' ? ` in ${category}` : ''}. Click any row or press Enter or Space while
            focused for more detail.
          </p>

          <div className="flex-1 min-h-0 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900/95 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100 w-24">
                    Code
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100 w-24">
                    Class
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100 min-w-[180px]">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, index) => (
                  <tr
                    key={row.code}
                    tabIndex={0}
                    role="button"
                    onClick={onRowActivate(row)}
                    onKeyDown={onRowKeyDown(row)}
                    className={cn(
                      'cursor-pointer outline-offset-[-2px] transition-colors hover:bg-neutral-100/90 focus-visible:bg-neutral-100 focus-visible:z-10 focus-visible:relative focus-visible:outline-2 focus-visible:outline-neutral-400 dark:hover:bg-neutral-800/70 dark:focus-visible:bg-neutral-800 dark:focus-visible:outline-neutral-500',
                      'border-b border-neutral-100 dark:border-neutral-800/80',
                      index % 2 === 0 ? 'bg-background' : 'bg-neutral-50/50 dark:bg-neutral-950/30'
                    )}
                    aria-label={`HTTP ${row.code} ${row.name}. Open detailed description`}
                  >
                    <td className="px-4 py-2.5 font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                      {row.code}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
                          categoryBadgeClass(row.category)
                        )}
                      >
                        {row.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-neutral-100">
                      {row.name}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {row.summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
                No status codes match your search. Try a different phrase or reset the class filter.
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={detailEntry !== null} onOpenChange={(open) => !open && setDetailEntry(null)}>
        <DialogContent className="max-w-xl gap-6">
          {detailEntry ? (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={cn(
                      'inline-flex rounded px-2 py-0.5 text-xs font-medium',
                      categoryBadgeClass(detailEntry.category)
                    )}
                  >
                    {detailEntry.category}
                  </span>
                </div>
                <DialogTitle className="text-xl">
                  <span className="font-mono tabular-nums text-neutral-500 dark:text-neutral-400 mr-2">
                    {detailEntry.code}
                  </span>
                  {detailEntry.name}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription asChild>
                <div className="space-y-4 text-left text-neutral-900 dark:text-neutral-100">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
                      Example status line
                    </p>
                    <pre className="rounded-md bg-neutral-100 dark:bg-neutral-900 px-3 py-2 font-mono text-xs overflow-x-auto text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap break-all">
                      {getHttpStatusLineExample(detailEntry)}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
                      Overview
                    </p>
                    <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {detailEntry.summary}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
                      Typical problems & causes
                    </p>
                    <div className="space-y-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {troubleshootingParagraphs.map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                    </div>
                  </div>
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
