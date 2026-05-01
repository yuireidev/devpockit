'use client';

import { Button } from '@/components/ui/button';
import { Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

const storageKey = (toolId: string) => `devpockit:dismiss-desktop-hint:${toolId}`;

interface DesktopRecommendedBannerProps {
  toolId: string;
  toolName: string;
}

export function DesktopRecommendedBanner({ toolId, toolName }: DesktopRecommendedBannerProps) {
  /** null = not yet read from sessionStorage */
  const [storedDismissed, setStoredDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        setStoredDismissed(sessionStorage.getItem(storageKey(toolId)) === '1');
      } catch {
        setStoredDismissed(false);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [toolId]);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(storageKey(toolId), '1');
    } catch {
      /* ignore quota / private mode */
    }
    setStoredDismissed(true);
  };

  if (storedDismissed !== false) {
    return null;
  }

  return (
    <div
      role="status"
      className="mx-4 mt-3 shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
          <p>
            <span className="font-medium">{toolName}</span> is easiest to use on a larger screen. You can
            still use it here—layout may be tight on small viewports.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 border-amber-300 bg-white hover:bg-amber-100 dark:border-amber-800 dark:bg-transparent dark:hover:bg-amber-950"
          onClick={handleDismiss}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}
