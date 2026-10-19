import { useSyncExternalStore } from 'react';

import { SIDEBAR_TOGGLE_SHORTCUT_LABELS } from '@/libs/keyboard';

export type KeyboardShortcutKind = 'palette' | 'sidebar';

// Get keyboard shortcut based on platform (avoids hydration mismatch)
function getKeyboardShortcut(kind: KeyboardShortcutKind) {
  if (typeof window === 'undefined') return null;
  const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.platform);
  if (kind === 'sidebar') {
    return isMac ? SIDEBAR_TOGGLE_SHORTCUT_LABELS.mac : SIDEBAR_TOGGLE_SHORTCUT_LABELS.other;
  }
  return isMac ? '⌘K' : 'Ctrl+K';
}

/**
 * Hook to get platform-aware keyboard shortcut.
 * Returns the shortcut label for the given kind: '⌘K' / 'Ctrl+K' for 'palette'
 * (default) and '⌘B' / 'Ctrl+B' for 'sidebar', based on Mac/iOS vs other platforms.
 * Returns null during SSR to avoid hydration mismatch.
 */
export function useKeyboardShortcut(kind: KeyboardShortcutKind = 'palette') {
  return useSyncExternalStore(
    () => () => {}, // No subscription needed, value doesn't change
    () => getKeyboardShortcut(kind), // Client snapshot
    () => null // Server snapshot (null to avoid hydration mismatch)
  );
}
