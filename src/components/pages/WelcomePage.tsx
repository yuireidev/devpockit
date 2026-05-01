'use client';

import { useToolActivity } from '@/components/providers/ToolActivityProvider';
import { ToolCard } from '@/components/ui/tool-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getAllTools, getCategoryById, toolIcons } from '@/libs/tools-data';
import type { Tool } from '@/types/tools';
import { Star } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/libs/utils';

interface WelcomePageProps {
  onToolSelect: (toolId: string) => void;
  activeToolIds?: string[];
}

export function WelcomePage({ onToolSelect, activeToolIds = [] }: WelcomePageProps) {
  const allTools = getAllTools();
  const { pinnedTools, recentTools, hydrated, togglePinnedTool, isPinned } = useToolActivity();

  const orderedTools = useMemo(() => {
    const seen = new Set<string>();
    const order: Tool[] = [];
    for (const t of pinnedTools) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        order.push(t);
      }
    }
    for (const t of recentTools) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        order.push(t);
      }
    }
    for (const t of allTools) {
      if (!seen.has(t.id)) {
        order.push(t);
      }
    }
    return order;
  }, [pinnedTools, recentTools, allTools]);

  const quickAccessTools = useMemo(() => {
    const seen = new Set<string>();
    const out: Tool[] = [];
    for (const t of pinnedTools) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        out.push(t);
      }
    }
    for (const t of recentTools) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        out.push(t);
      }
    }
    return out.slice(0, 12);
  }, [pinnedTools, recentTools]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-full overflow-auto">
        <div className="flex flex-col gap-6 items-center justify-center pb-12 pt-20 px-12 w-full">
          {/* Hero Section */}
          <div className="flex flex-col gap-3 items-center justify-center w-full text-center">
            <h1 className="font-normal text-[64px] leading-[100%] tracking-normal overflow-visible py-4 w-fit h-fit text-center max-w-[678px]">
              Your{' '}
              <span
                className="font-serif text-orange-600 dark:text-orange-500 italic"
                style={{ verticalAlign: 'bottom', marginRight: '6px' }}
              >
                essential
              </span>{' '}
              dev tools at your fingertips
            </h1>
            <p className="font-normal text-base leading-7 text-pretty text-center">
              Everything run locally in your browser for optimal performance and privacy
            </p>
          </div>
        </div>

        {hydrated && quickAccessTools.length > 0 ? (
          <section className="w-full max-w-6xl px-12 pb-2">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Pinned &amp; recent
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {quickAccessTools.map(tool => {
                const IconComponent = toolIcons[tool.id];
                const pinned = isPinned(tool.id);
                return (
                  <div
                    key={tool.id}
                    className="flex shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    <button
                      type="button"
                      onClick={() => onToolSelect(tool.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm font-medium text-neutral-900 transition-colors hover:bg-orange-50 dark:text-neutral-100 dark:hover:bg-orange-950/40"
                    >
                      {IconComponent ? (
                        <IconComponent
                          className="h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400"
                          strokeWidth={1.5}
                        />
                      ) : (
                        <span className="text-base" aria-hidden>
                          {tool.icon}
                        </span>
                      )}
                      <span className="max-w-[200px] truncate">{tool.name}</span>
                    </button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center border-l border-neutral-200 px-2.5 text-neutral-500 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
                          aria-label={pinned ? `Unpin ${tool.name}` : `Pin ${tool.name}`}
                          aria-pressed={pinned}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            togglePinnedTool(tool.id);
                          }}
                        >
                          <Star
                            className={cn(
                              'h-4 w-4',
                              pinned && 'fill-orange-500 text-orange-600 dark:fill-orange-500 dark:text-orange-400'
                            )}
                            strokeWidth={1.5}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {pinned ? 'Unpin from Jump back in and home' : 'Pin — same as star in ⌘K palette'}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* Tools Grid */}
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(242px,1fr))] gap-6 px-12 py-6">
          {orderedTools.map(tool => {
            const category = getCategoryById(tool.category);
            const IconComponent = toolIcons[tool.id];
            const isActive = activeToolIds.includes(tool.id);

            return (
              <ToolCard
                key={tool.id}
                icon={IconComponent && <IconComponent className="w-10 h-10" />}
                name={tool.name}
                category={category?.name || tool.category}
                isActive={isActive}
                supportsDesktop={tool.supportsDesktop}
                supportsMobile={tool.supportsMobile}
                onClick={() => onToolSelect(tool.id)}
              />
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
