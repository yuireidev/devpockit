'use client';

import { cn } from '@/libs/utils';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

interface AppToastContextValue {
  showToast: (message: string) => void;
}

const AppToastContext = createContext<AppToastContextValue | null>(null);

const TOAST_DURATION_MS = 2400;

export function AppToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const showToast = useCallback((next: string) => {
    clearTimer();
    setMessage(next);
    hideTimerRef.current = setTimeout(() => {
      setMessage(null);
      hideTimerRef.current = null;
    }, TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => clearTimer(), []);

  return (
    <AppToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={cn(
          'pointer-events-none fixed bottom-6 left-1/2 z-[200] flex max-w-[min(90vw,380px)] -translate-x-1/2 justify-center px-4 motion-safe:transition-opacity motion-safe:duration-200',
          message ? 'opacity-100' : 'opacity-0'
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {message ? (
          <div
            role="status"
            className="pointer-events-none rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-neutral-900 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          >
            {message}
          </div>
        ) : null}
      </div>
    </AppToastContext.Provider>
  );
}

export function useAppToast(): AppToastContextValue | null {
  return useContext(AppToastContext);
}
