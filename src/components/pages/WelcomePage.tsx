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

  return (
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
                pinButton={
                  hydrated
                    ? {
                        pinned: isPinned(tool.id),
                        onToggle: () => togglePinnedTool(tool.id),
                      }
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>
  );
}
