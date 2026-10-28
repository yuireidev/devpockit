'use client';

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps as NextThemesProviderProps } from 'next-themes';
import * as React from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: NextThemesProviderProps['attribute'];
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'light',
  enableSystem = true,
  disableTransitionOnChange = false
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
    >
      {children}
    </NextThemesProvider>
  );
}
