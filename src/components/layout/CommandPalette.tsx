'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { getCategoryById, searchTools, toolIcons } from '@/libs/tools-data';
import { cn } from '@/libs/utils';
import { type Tool } from '@/types/tools';
import { Search } from 'lucide-react';
import { startTransition, useEffect, useRef, useState } from 'react';

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
}

const CommandPaletteResult = ({ tool, onSelect, isSelected = false, index, onHover }: CommandPaletteResultProps) => {
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
    <div
      role="option"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      className={cn(
        'group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200',
        'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
        isHovered || isSelected
          ? 'bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-900 shadow-sm'
          : 'bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border border-transparent'
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
      {/* Icon Section */}
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 shrink-0',
          isHovered || isSelected
            ? 'bg-orange-100 dark:bg-orange-900 scale-105'
            : 'bg-neutral-100 dark:bg-neutral-800'
        )}
      >
        {IconComponent ? (
          <IconComponent
            className={cn(
              'w-4 h-4 transition-all duration-200',
              isHovered || isSelected
                ? 'text-orange-600 dark:text-orange-500 scale-110'
                : 'text-neutral-600 dark:text-neutral-400'
            )}
            strokeWidth={1.5}
          />
        ) : (
          <span className="text-xs">{tool.icon}</span>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <div className={cn(
          'font-medium text-sm transition-colors duration-200',
          isHovered || isSelected
            ? 'text-orange-900 dark:text-orange-100'
            : 'text-neutral-900 dark:text-neutral-100'
        )}>
          {tool.name}
        </div>
        <div className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1">
          {tool.description}
        </div>
        {category && (
          <div className="mt-1">
            <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-1.5 py-0.5 inline-block">
              <p className="font-normal text-[9px] leading-3 text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                {category.name}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export function CommandPalette({ open, onOpenChange, onToolSelect }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tool[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const keyboardShortcut = useKeyboardShortcut();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.platform);

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      // Small delay to ensure dialog is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Clear query when dialog closes
  useEffect(() => {
    if (!open) {
      startTransition(() => {
        setQuery('');
        setResults([]);
        setSelectedIndex(0);
      });
    }
  }, [open]);

  // Search logic
  useEffect(() => {
    if (query.trim().length > 0) {
      const searchResults = searchTools(query);
      startTransition(() => {
        setResults(searchResults);
        // Reset to first result when query changes, but ensure it's within bounds
        setSelectedIndex(0);
      });
    } else {
      startTransition(() => {
        setResults([]);
        setSelectedIndex(0);
      });
    }
  }, [query]);

  // Ensure selectedIndex is within bounds when results change
  useEffect(() => {
    if (results.length > 0 && selectedIndex >= results.length) {
      startTransition(() => {
        setSelectedIndex(0);
      });
    }
  }, [results.length, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0 && selectedIndex >= 0) {
      // Find the actual result element (it's wrapped in a div with id)
      const resultsContainer = resultsRef.current.querySelector('[role="group"]');
      if (resultsContainer) {
        const selectedElement = resultsContainer.children[selectedIndex]?.querySelector('[role="option"]') as HTMLElement;
        if (selectedElement) {
          selectedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }
    }
  }, [selectedIndex, results.length]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
      return;
    }

    if (e.key === 'Enter' && results.length > 0 && selectedIndex >= 0 && selectedIndex < results.length) {
      e.preventDefault();
      const toolToSelect = results[selectedIndex];
      if (toolToSelect) {
        handleToolSelect(toolToSelect.id);
      }
      return;
    }

    if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const nextIndex = (prev + 1) % results.length;
        return nextIndex;
      });
      return;
    }

    if (e.key === 'ArrowUp' && results.length > 0) {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const prevIndex = (prev - 1 + results.length) % results.length;
        return prevIndex;
      });
      return;
    }

    // Home key - go to first result
    if (e.key === 'Home' && results.length > 0) {
      e.preventDefault();
      setSelectedIndex(0);
      return;
    }

    // End key - go to last result
    if (e.key === 'End' && results.length > 0) {
      e.preventDefault();
      setSelectedIndex(results.length - 1);
      return;
    }

    // Tab key should work normally for accessibility
    if (e.key === 'Tab') {
      // Allow default Tab behavior
      return;
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleToolSelect = (toolId: string) => {
    onToolSelect(toolId);
    handleClose();
  };

  const hasQuery = query.trim().length > 0;
  const hasResults = results.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 h-[600px] flex flex-col bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 [&>button]:hidden"
        aria-label="Command palette for searching tools"
      >
        <DialogTitle className="sr-only">Search Tools</DialogTitle>
        <DialogDescription className="sr-only">
          Search for developer tools by name or description. Use arrow keys to navigate and Enter to select.
        </DialogDescription>
        <div className="px-6 pt-6 pb-0 flex flex-col flex-1 min-h-0">
          {/* Search Input */}
          <div className="relative shrink-0">
            <label htmlFor="command-palette-search" className="sr-only">
              Search for tools
            </label>
            <div className="relative bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#262626] rounded-lg flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-[#0a0a0a] dark:text-[#e5e5e5] pointer-events-none" aria-hidden="true" />
              <Input
                id="command-palette-search"
                ref={inputRef}
                type="text"
                placeholder="Search tools..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-12 pl-9 pr-20 text-base border-0 bg-transparent text-[#0a0a0a] dark:text-[#e5e5e5] placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                aria-label="Search tools"
                aria-autocomplete="list"
                aria-controls="command-palette-results"
                aria-expanded={hasResults}
                aria-activedescendant={hasResults ? `result-${selectedIndex}` : undefined}
              />
              {keyboardShortcut && (
                <div className="absolute right-3 text-xs font-medium text-[#111827] dark:text-[#e5e5e5] leading-[20px] tracking-normal pointer-events-none" aria-hidden="true">
                  {keyboardShortcut}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <Separator className="my-3" />

          {/* Results Container */}
          <div className="flex-1 min-h-0 overflow-hidden pb-5">
            {!hasQuery && (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <Search className="h-10 w-10 text-neutral-400 dark:text-neutral-500 mb-3 opacity-50" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                  Start typing to search for tools...
                </p>
                {keyboardShortcut && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1 text-center">
                    Press {keyboardShortcut} to open this palette anytime
                  </p>
                )}
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1 text-center">
                  Press {isMac ? '⌘B' : 'Ctrl+B'} to toggle sidebar
                </p>
              </div>
            )}

            {hasQuery && hasResults && (
              <div
                id="command-palette-results"
                role="listbox"
                aria-label="Search results"
                className="space-y-1 overflow-y-auto max-h-full scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent"
                ref={resultsRef}
              >
                <div
                  className="px-2 py-2.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 sticky top-0 bg-white dark:bg-neutral-900 z-10 border-b border-neutral-200 dark:border-neutral-700 mb-1 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {results.length} tool{results.length !== 1 ? 's' : ''} found
                </div>
                <div className="space-y-0.5" role="group">
                  {results.map((tool, index) => (
                    <div key={tool.id} id={`result-${index}`}>
                      <CommandPaletteResult
                        tool={tool}
                        onSelect={handleToolSelect}
                        isSelected={index === selectedIndex}
                        index={index}
                        onHover={setSelectedIndex}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasQuery && !hasResults && (
              <div
                className="flex flex-col items-center justify-center h-full py-12"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <Search className="h-12 w-12 mx-auto mb-4 text-neutral-400 dark:text-neutral-500 opacity-50" aria-hidden="true" />
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                  No tools found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Try a different search term
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
