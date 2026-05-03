'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToolActivity } from '@/components/providers/ToolActivityProvider';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { getCategoryById, searchTools, toolIcons } from '@/libs/tools-data';
import { cn } from '@/libs/utils';
import { type Tool } from '@/types/tools';
import { Search, Star } from 'lucide-react';
import { startTransition, useEffect, useMemo, useRef, useState } from 'react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToolSelect: (toolId: string) => void;
}

interface CommandPaletteResultProps {
  tool: Tool;
  onSelect: (toolId: string) => void;
  isSelected?: boolean;
  index: number;
  onHover?: (index: number) => void;
  showPin?: boolean;
  pinned?: boolean;
  onTogglePin?: (toolId: string) => void;
}

const CommandPaletteResult = ({
  tool,
  onSelect,
  isSelected = false,
  index,
  onHover,
  showPin = false,
  pinned = false,
  onTogglePin,
}: CommandPaletteResultProps) => {
  const category = getCategoryById(tool.category);
  const IconComponent = toolIcons[tool.id];
  const [isHovered, setIsHovered] = useState(false);

  const handleSelect = () => {
    onSelect(tool.id);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(index);
  };

  return (
    <div className="flex items-stretch gap-1">
      <div
        role="option"
        aria-selected={isSelected}
        tabIndex={isSelected ? 0 : -1}
        id={`palette-option-${index}`}
        className={cn(
          'group flex min-w-0 flex-1 items-center gap-2.5 rounded-lg border px-3 py-2 transition-all duration-200',
          'cursor-pointer hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
          isHovered || isSelected
            ? 'border-orange-200 bg-orange-50 shadow-sm dark:border-orange-900 dark:bg-orange-950/50'
            : 'border-transparent bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
        )}
        onClick={handleSelect}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect();
          }
        }}
      >
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
            isHovered || isSelected
              ? 'scale-105 bg-orange-100 dark:bg-orange-900'
              : 'bg-neutral-100 dark:bg-neutral-800'
          )}
        >
          {IconComponent ? (
            <IconComponent
              className={cn(
                'h-4 w-4 transition-all duration-200',
                isHovered || isSelected
                  ? 'scale-110 text-orange-600 dark:text-orange-500'
                  : 'text-neutral-600 dark:text-neutral-400'
              )}
              strokeWidth={1.5}
            />
          ) : (
            <span className="text-xs">{tool.icon}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'text-sm font-medium transition-colors duration-200',
              isHovered || isSelected
                ? 'text-orange-900 dark:text-orange-100'
                : 'text-neutral-900 dark:text-neutral-100'
            )}
          >
            {tool.name}
          </div>
          <div className="mt-0.5 line-clamp-1 text-xs text-neutral-600 dark:text-neutral-400">
            {tool.description}
          </div>
          {category && (
            <div className="mt-1">
              <div className="inline-block rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 dark:border-neutral-700 dark:bg-neutral-800">
                <p className="whitespace-nowrap text-[9px] font-normal leading-3 text-neutral-700 dark:text-neutral-300">
                  {category.name}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPin && onTogglePin ? (
        <button
          type="button"
          tabIndex={0}
          className={cn(
            'flex w-10 shrink-0 items-center justify-center rounded-lg border transition-colors',
            pinned
              ? 'border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/40'
              : 'border-transparent bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/80 dark:hover:bg-neutral-800'
          )}
          aria-label={pinned ? `Unpin ${tool.name}` : `Pin ${tool.name}`}
          aria-pressed={pinned}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onTogglePin(tool.id);
          }}
        >
          <Star
            className={cn(
              'h-4 w-4 text-neutral-500 dark:text-neutral-400',
              pinned && 'fill-orange-500 text-orange-600 dark:fill-orange-500 dark:text-orange-400'
            )}
            strokeWidth={1.5}
          />
        </button>
      ) : null}
    </div>
  );
};

export function CommandPalette({ open, onOpenChange, onToolSelect }: CommandPaletteProps) {
  const { pinnedTools, recentTools, togglePinnedTool, isPinned } = useToolActivity();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tool[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const keyboardShortcut = useKeyboardShortcut();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const shortcutRows = useMemo(() => {
    const pinnedSet = new Set(pinnedTools.map(t => t.id));
    const out: { tool: Tool; index: number }[] = [];
    let i = 0;
    for (const tool of pinnedTools) {
      out.push({ tool, index: i++ });
    }
    for (const tool of recentTools) {
      if (!pinnedSet.has(tool.id)) {
        out.push({ tool, index: i++ });
      }
    }
    return out;
  }, [pinnedTools, recentTools]);

  const hasQuery = query.trim().length > 0;
  const hasResults = results.length > 0;
  const showShortcuts = !hasQuery && shortcutRows.length > 0;
  const activeCount = hasQuery ? results.length : shortcutRows.length;

  useEffect(() => {
    if (open && inputRef.current) {
      const t = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      startTransition(() => {
        setQuery('');
        setResults([]);
        setSelectedIndex(0);
      });
    }
  }, [open]);

  useEffect(() => {
    if (query.trim().length > 0) {
      const searchResults = searchTools(query);
      startTransition(() => {
        setResults(searchResults);
        setSelectedIndex(0);
      });
    } else {
      startTransition(() => {
        setResults([]);
        setSelectedIndex(0);
      });
    }
  }, [query]);

  useEffect(() => {
    if (activeCount > 0 && selectedIndex >= activeCount) {
      startTransition(() => {
        setSelectedIndex(0);
      });
    }
  }, [activeCount, selectedIndex]);

  useEffect(() => {
    if (!resultsRef.current || activeCount <= 0 || selectedIndex < 0) return;

    const container = resultsRef.current.querySelector('[role="group"]');
    if (!container) return;

    const selectedWrap = container.children[selectedIndex] as HTMLElement | undefined;
    const selectedElement = selectedWrap?.querySelector('[role="option"]') as HTMLElement | undefined;
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex, activeCount, hasQuery, showShortcuts]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handlePaletteToolSelect = (toolId: string) => {
    onToolSelect(toolId);
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
      return;
    }

    const list = hasQuery ? results : shortcutRows.map(r => r.tool);
    if (
      e.key === 'Enter' &&
      list.length > 0 &&
      selectedIndex >= 0 &&
      selectedIndex < list.length
    ) {
      e.preventDefault();
      const toolToSelect = list[selectedIndex];
      if (toolToSelect) {
        handlePaletteToolSelect(toolToSelect.id);
      }
      return;
    }

    if (e.key === 'ArrowDown' && list.length > 0) {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % list.length);
      return;
    }

    if (e.key === 'ArrowUp' && list.length > 0) {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + list.length) % list.length);
      return;
    }

    if (e.key === 'Home' && list.length > 0) {
      e.preventDefault();
      setSelectedIndex(0);
      return;
    }

    if (e.key === 'End' && list.length > 0) {
      e.preventDefault();
      setSelectedIndex(list.length - 1);
      return;
    }
  };

  const listboxActive = hasQuery ? hasResults : showShortcuts;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[600px] max-w-2xl flex-col border-neutral-200 bg-white p-0 dark:border-neutral-700 dark:bg-neutral-900 [&>button]:hidden"
        aria-label="Command palette for searching tools"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Search Tools</DialogTitle>
        <DialogDescription className="sr-only">
          Search for developer tools by name or description. Use arrow keys to navigate and Enter to
          select.
        </DialogDescription>
        <div className="flex min-h-0 flex-1 flex-col px-6 pb-0 pt-6">
          <div className="relative shrink-0">
            <label htmlFor="command-palette-search" className="sr-only">
              Search for tools
            </label>
            <div className="relative flex items-center rounded-lg border border-[#e5e5e5] bg-white dark:border-[#262626] dark:bg-[#0a0a0a]">
              <Search
                className="pointer-events-none absolute left-3 h-4 w-4 text-[#0a0a0a] dark:text-[#e5e5e5]"
                aria-hidden="true"
              />
              <Input
                id="command-palette-search"
                ref={inputRef}
                type="text"
                placeholder="Search tools..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-12 border-0 bg-transparent pl-9 pr-20 text-base text-[#0a0a0a] placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-[#e5e5e5] dark:placeholder:text-neutral-400"
                aria-label="Search tools"
                aria-autocomplete="list"
                aria-controls="command-palette-results"
                aria-expanded={listboxActive}
                aria-activedescendant={
                  listboxActive ? `palette-option-${selectedIndex}` : undefined
                }
              />
              {keyboardShortcut ? (
                <div
                  className="pointer-events-none absolute right-3 text-xs font-medium leading-[20px] tracking-normal text-[#111827] dark:text-[#e5e5e5]"
                  aria-hidden="true"
                >
                  {keyboardShortcut}
                </div>
              ) : null}
            </div>
          </div>

          <Separator className="my-3" />

          <div className="min-h-0 flex-1 overflow-hidden pb-5">
            {!hasQuery && !showShortcuts ? (
              <div className="flex h-full flex-col items-center justify-center py-12">
                <Search className="mb-3 h-10 w-10 text-neutral-400 opacity-50 dark:text-neutral-500" />
                <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                  Start typing to search, or open a tool to build your recent list.
                </p>
                {keyboardShortcut ? (
                  <p className="mt-1 text-center text-xs text-neutral-500 dark:text-neutral-500">
                    Press {keyboardShortcut} to open this palette anytime
                  </p>
                ) : null}
              </div>
            ) : null}

            {showShortcuts ? (
              <div
                id="command-palette-results"
                role="listbox"
                aria-label="Pinned and recent tools"
                className="scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent dark:scrollbar-thumb-neutral-600 max-h-full space-y-1 overflow-y-auto"
                ref={resultsRef}
              >
                <div
                  className="sticky top-0 z-10 mb-1 border-b border-neutral-200 bg-white px-2 py-2.5 text-xs font-medium text-neutral-600 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  Jump back in
                </div>
                <div className="space-y-0.5" role="group">
                  {shortcutRows.map(({ tool, index }) => (
                    <div key={`${tool.id}-shortcut-${index}`}>
                      <CommandPaletteResult
                        tool={tool}
                        onSelect={handlePaletteToolSelect}
                        isSelected={index === selectedIndex}
                        index={index}
                        onHover={setSelectedIndex}
                        showPin
                        pinned={isPinned(tool.id)}
                        onTogglePin={togglePinnedTool}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {hasQuery && hasResults ? (
              <div
                id="command-palette-results"
                role="listbox"
                aria-label="Search results"
                className="scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent dark:scrollbar-thumb-neutral-600 max-h-full space-y-1 overflow-y-auto"
                ref={resultsRef}
              >
                <div
                  className="sticky top-0 z-10 mb-1 border-b border-neutral-200 bg-white px-2 py-2.5 text-xs font-medium text-neutral-600 backdrop-blur-sm dark:border-neutral-900 dark:bg-neutral-900 dark:text-neutral-400"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {results.length} tool{results.length !== 1 ? 's' : ''} found
                </div>
                <div className="space-y-0.5" role="group">
                  {results.map((tool, index) => (
                    <div key={tool.id}>
                      <CommandPaletteResult
                        tool={tool}
                        onSelect={handlePaletteToolSelect}
                        isSelected={index === selectedIndex}
                        index={index}
                        onHover={setSelectedIndex}
                        showPin
                        pinned={isPinned(tool.id)}
                        onTogglePin={togglePinnedTool}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {hasQuery && !hasResults ? (
              <div
                className="flex h-full flex-col items-center justify-center py-12"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <Search
                  className="mx-auto mb-4 h-12 w-12 text-neutral-400 opacity-50 dark:text-neutral-500"
                  aria-hidden="true"
                />
                <p className="mb-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  No tools found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Try a different search term
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
