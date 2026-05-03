/**
 * Persist recent and pinned tool ids in localStorage (client-only).
 */

export const RECENT_TOOLS_STORAGE_KEY = 'devpockit:recent-tool-ids';
export const PINNED_TOOLS_STORAGE_KEY = 'devpockit:pinned-tool-ids';

export const MAX_RECENT_TOOLS = 12;
export const MAX_PINNED_TOOLS = 12;

function parseIdList(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
}

export function loadRecentToolIds(): string[] {
  if (typeof window === 'undefined') return [];
  return parseIdList(window.localStorage.getItem(RECENT_TOOLS_STORAGE_KEY)).slice(
    0,
    MAX_RECENT_TOOLS
  );
}

export function loadPinnedToolIds(): string[] {
  if (typeof window === 'undefined') return [];
  return parseIdList(window.localStorage.getItem(PINNED_TOOLS_STORAGE_KEY)).slice(
    0,
    MAX_PINNED_TOOLS
  );
}

export function saveRecentToolIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    RECENT_TOOLS_STORAGE_KEY,
    JSON.stringify(ids.slice(0, MAX_RECENT_TOOLS))
  );
}

export function savePinnedToolIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    PINNED_TOOLS_STORAGE_KEY,
    JSON.stringify(ids.slice(0, MAX_PINNED_TOOLS))
  );
}

/** MRU: move toolId to front, dedupe, cap length */
export function bumpRecentToolIds(current: string[], toolId: string): string[] {
  const next = [toolId, ...current.filter(id => id !== toolId)];
  return next.slice(0, MAX_RECENT_TOOLS);
}

export function togglePinnedToolId(current: string[], toolId: string): string[] {
  if (current.includes(toolId)) {
    return current.filter(id => id !== toolId);
  }
  if (current.length >= MAX_PINNED_TOOLS) {
    return [...current.slice(1), toolId];
  }
  return [...current, toolId];
}
