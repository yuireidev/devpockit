'use client';

import { useToolActivity } from '@/components/providers/ToolActivityProvider';
import { ToolCard } from '@/components/ui/tool-card';
import { getAllTools, getCategoryById, toolIcons } from '@/libs/tools-data';
import type { Tool } from '@/types/tools';
import { useMemo } from 'react';

interface WelcomePageProps {
  onToolSelect: (toolId: string) => void;
  activeToolIds?: string[];
}

export function WelcomePage({ onToolSelect, activeToolIds = [] }: WelcomePageProps) {
  const allTools = getAllTools();
  const { pinnedTools, recentTools, hydrated } = useToolActivity();

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
    <div className="h-full overflow-auto">
      <div className="flex flex-col gap-6 items-center justify-center pb-12 pt-20 px-12 w-full">
        {/* Hero Section */}
        <div className="flex flex-col gap-3 items-center justify-center w-full text-center">
          <h1 className="font-normal text-[64px] leading-[100%] tracking-normal overflow-visible py-4 w-fit h-fit text-center max-w-[678px]">
            Your <span className="font-serif text-orange-600 dark:text-orange-500 italic" style={{ verticalAlign: 'bottom', marginRight: '6px' }}>essential</span> dev tools at your fingertips
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
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => onToolSelect(tool.id)}
                  className="flex shrink-0 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-orange-800 dark:hover:bg-orange-950/40"
                >
                  {IconComponent ? (
                    <IconComponent className="h-4 w-4 text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
                  ) : (
                    <span className="text-base" aria-hidden>
                      {tool.icon}
                    </span>
                  )}
                  <span className="max-w-[200px] truncate">{tool.name}</span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Tools Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(242px,1fr))] gap-6 px-12 py-6 w-full">
        {allTools.map((tool) => {
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
  );
}
