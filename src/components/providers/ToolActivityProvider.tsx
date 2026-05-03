'use client';

import {
  bumpRecentToolIds,
  loadPinnedToolIds,
  loadRecentToolIds,
  savePinnedToolIds,
  saveRecentToolIds,
  togglePinnedToolId,
} from '@/libs/tool-activity-storage';
import { getToolById } from '@/libs/tools-data';
import type { Tool } from '@/types/tools';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface ToolActivityContextValue {
  recentTools: Tool[];
  pinnedTools: Tool[];
  recordToolOpen: (toolId: string) => void;
  togglePinnedTool: (toolId: string) => void;
  isPinned: (toolId: string) => boolean;
  hydrated: boolean;
}

const ToolActivityContext = createContext<ToolActivityContextValue | null>(null);

function resolveTools(ids: string[]): Tool[] {
  return ids.map(getToolById).filter((t): t is Tool => t !== undefined);
}

export function ToolActivityProvider({ children }: { children: ReactNode }) {
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setRecentIds(loadRecentToolIds());
      setPinnedIds(loadPinnedToolIds());
      setHydrated(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const recordToolOpen = useCallback((toolId: string) => {
    setRecentIds(prev => {
      const base = prev.length > 0 ? prev : loadRecentToolIds();
      const next = bumpRecentToolIds(base, toolId);
      saveRecentToolIds(next);
      return next;
    });
  }, []);

  const togglePinnedTool = useCallback((toolId: string) => {
    setPinnedIds(prev => {
      const base = hydrated ? prev : loadPinnedToolIds();
      const next = togglePinnedToolId(base, toolId);
      savePinnedToolIds(next);
      return next;
    });
  }, [hydrated]);

  const value = useMemo<ToolActivityContextValue>(() => {
    const pinnedSet = new Set(pinnedIds);
    const recentFiltered = recentIds.filter(id => !pinnedSet.has(id));

    return {
      recentTools: resolveTools(recentFiltered),
      pinnedTools: resolveTools(pinnedIds),
      recordToolOpen,
      togglePinnedTool,
      isPinned: (toolId: string) => pinnedIds.includes(toolId),
      hydrated,
    };
  }, [recentIds, pinnedIds, recordToolOpen, togglePinnedTool, hydrated]);

  return (
    <ToolActivityContext.Provider value={value}>{children}</ToolActivityContext.Provider>
  );
}

export function useToolActivity(): ToolActivityContextValue {
  const ctx = useContext(ToolActivityContext);
  if (!ctx) {
    throw new Error('useToolActivity must be used within ToolActivityProvider');
  }
  return ctx;
}
