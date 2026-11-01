/**
 * Hook for managing CodeEditor theme persistence
 * Persists theme preference in localStorage
 */

import { type CodeEditorTheme, CODE_EDITOR_THEMES } from '@/config/code-editor-themes'
import { useEffect, useState } from 'react'

const THEME_STORAGE_KEY = 'code-editor-theme'

/**
 * Hook to manage CodeEditor theme with persistence
 * @param defaultTheme - Default theme if none is stored
 * @returns [currentTheme, setTheme] tuple
 */
export function useCodeEditorTheme(
  defaultTheme: CodeEditorTheme = 'basicDark'
): [CodeEditorTheme, (theme: CodeEditorTheme) => void] {
  const [theme, setThemeState] = useState<CodeEditorTheme>(() => {
    // Try to load from localStorage on mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (stored && stored in CODE_EDITOR_THEMES) {
        return stored as CodeEditorTheme
      }
    }
    return defaultTheme
  })

  // Persist theme changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }, [theme])

  // Listen for storage changes from other components (like sidebar)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const newTheme = e.newValue as CodeEditorTheme
        if (newTheme in CODE_EDITOR_THEMES && newTheme !== theme) {
          setThemeState(newTheme)
        }
      }
    }

    // Listen for custom storage event (for same-tab updates)
    const handleCustomStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail && customEvent.detail in CODE_EDITOR_THEMES) {
        const newTheme = customEvent.detail as CodeEditorTheme
        // Only update if the theme is different to avoid infinite loops
        if (newTheme !== theme) {
          setThemeState(newTheme)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('code-editor-theme-change', handleCustomStorageChange as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('code-editor-theme-change', handleCustomStorageChange as EventListener)
    }
  }, [theme])

  const setTheme = (newTheme: CodeEditorTheme) => {
    // Only update if the theme is different to avoid unnecessary updates
    if (newTheme !== theme) {
      setThemeState(newTheme)
      // Dispatch custom event for same-tab updates (storage event only fires in other tabs)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('code-editor-theme-change', { detail: newTheme }))
      }
    }
  }

  return [theme, setTheme]
}

/**
 * Get the stored theme from localStorage
 * @param defaultTheme - Default theme if none is stored
 * @returns The stored theme or default
 */
export function getStoredTheme(defaultTheme: CodeEditorTheme = 'basicDark'): CodeEditorTheme {
  if (typeof window === 'undefined') {
    return defaultTheme
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored && stored in CODE_EDITOR_THEMES) {
    return stored as CodeEditorTheme
  }

  return defaultTheme
}

/**
 * Clear the stored theme preference
 */
export function clearStoredTheme(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(THEME_STORAGE_KEY)
  }
}
