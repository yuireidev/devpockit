/**
 * Shiki Initialization Module
 * Handles Shiki highlighter initialization and theme mapping
 */

import type { CodeEditorTheme } from '@/config/code-editor-themes';
import { createHighlighter, type Highlighter } from 'shiki';

/**
 * Cached highlighter instance (singleton pattern)
 */
let highlighterInstance: Highlighter | null = null;
let initializationPromise: Promise<Highlighter> | null = null;
let isInitializing = false;

/**
 * Required languages for the application
 */
const REQUIRED_LANGUAGES = ['json', 'xml', 'javascript', 'plaintext'] as const;

/**
 * Required themes for the application
 * Based on theme mapping strategy
 */
const REQUIRED_THEMES = [
  'github-light',
  'github-dark',
  'light-plus', // VS Code light
  'dark-plus', // VS Code dark
  'monokai',
  'solarized-light',
  'solarized-dark',
  'catppuccin-mocha', // Catppuccin dark variant
  'nord',
  // Material themes - will try these, fallback if they don't exist
  'material-theme-lighter',
  'material-theme-darker',
] as const;

/**
 * Map CodeEditorTheme to Shiki theme name
 * @param theme - CodeEditorTheme from config
 * @returns Shiki theme name
 */
export function getShikiThemeName(theme: CodeEditorTheme): string {
  const themeMap: Record<CodeEditorTheme, string> = {
    basicLight: 'github-light',
    basicDark: 'github-dark',
    vscodeLight: 'light-plus',
    vscodeDark: 'dark-plus',
    githubLight: 'github-light',
    githubDark: 'github-dark',
    materialLight: 'material-theme-lighter', // May need verification
    materialDark: 'material-theme-darker', // May need verification
    monokai: 'monokai',
    solarizedLight: 'solarized-light',
    solarizedDark: 'solarized-dark',
    catppuccin: 'catppuccin-mocha', // Catppuccin dark variant
    nord: 'nord',
  };

  return themeMap[theme] || 'github-dark';
}

/**
 * Initialize Shiki highlighter with required languages and themes
 * Uses singleton pattern to cache the instance
 * Loads themes individually to handle missing themes gracefully
 * @returns Promise that resolves to the highlighter instance
 */
export async function initializeShiki(): Promise<Highlighter> {
  // Return cached instance if available
  if (highlighterInstance) {
    return highlighterInstance;
  }

  // Return existing initialization promise if already initializing
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  isInitializing = true;
  initializationPromise = (async () => {
    try {
      // Start with core themes that are guaranteed to exist
      const coreThemes = [
        'github-light',
        'github-dark',
        'light-plus',
        'dark-plus',
        'monokai',
      ];

      // Initialize highlighter with core themes first
      const highlighter = await createHighlighter({
        themes: coreThemes as any,
        langs: REQUIRED_LANGUAGES as any,
      });

      // Try to load additional themes one by one
      const additionalThemes = [
        'solarized-light',
        'solarized-dark',
        'catppuccin-mocha',
        'nord',
        'material-theme-lighter',
        'material-theme-darker',
      ];

      for (const theme of additionalThemes) {
        try {
          await highlighter.loadTheme(theme as any);
        } catch (themeError) {
          // Theme doesn't exist or failed to load - skip it
          console.warn(`Theme ${theme} not available, skipping`, themeError);
        }
      }

      highlighterInstance = highlighter;
      isInitializing = false;
      return highlighter;
    } catch (error) {
      isInitializing = false;
      initializationPromise = null;
      console.error('Failed to initialize Shiki highlighter:', error);
      throw new Error('Failed to initialize Shiki highlighter');
    }
  })();

  return initializationPromise;
}

/**
 * Get the cached Shiki highlighter instance
 * Returns null if not initialized
 * @returns Highlighter instance or null
 */
export function getShikiHighlighter(): Highlighter | null {
  return highlighterInstance;
}

/**
 * Check if Shiki is initialized
 * @returns true if highlighter is ready, false otherwise
 */
export function isShikiInitialized(): boolean {
  return highlighterInstance !== null;
}

/**
 * Check if Shiki is currently initializing
 * @returns true if initialization is in progress, false otherwise
 */
export function isShikiInitializing(): boolean {
  return isInitializing;
}

/**
 * Reset Shiki instance (useful for testing or re-initialization)
 * WARNING: This will clear the cached instance
 */
export function resetShikiInstance(): void {
  highlighterInstance = null;
  initializationPromise = null;
  isInitializing = false;
}

/**
 * Load additional theme if not already loaded
 * @param themeName - Shiki theme name to load
 * @returns Promise that resolves when theme is loaded, or rejects if theme doesn't exist
 */
export async function loadShikiTheme(themeName: string): Promise<void> {
  if (!highlighterInstance) {
    await initializeShiki();
  }

  if (!highlighterInstance) {
    throw new Error('Shiki highlighter not initialized');
  }

  // Check if theme is already loaded
  const loadedThemes = highlighterInstance.getLoadedThemes();
  if (loadedThemes.includes(themeName as any)) {
    return;
  }

  // Load the theme
  try {
    await highlighterInstance.loadTheme(themeName as any);
  } catch (error) {
    // Re-throw the error so caller can handle it (e.g., use fallback)
    throw new Error(`Theme ${themeName} not found, you may need to load it first`);
  }
}

/**
 * Load additional language if not already loaded
 * @param language - Shiki language ID to load
 * @returns Promise that resolves when language is loaded
 */
export async function loadShikiLanguage(language: string): Promise<void> {
  if (!highlighterInstance) {
    await initializeShiki();
  }

  if (!highlighterInstance) {
    throw new Error('Shiki highlighter not initialized');
  }

  // Check if language is already loaded
  const loadedLanguages = highlighterInstance.getLoadedLanguages();
  if (loadedLanguages.includes(language as any)) {
    return;
  }

  // Load the language
  try {
    await highlighterInstance.loadLanguage(language as any);
  } catch (error) {
    console.warn(`Failed to load Shiki language: ${language}`, error);
    // Don't throw - language loading failure shouldn't break the app
  }
}

/**
 * Get list of loaded themes
 * @returns Array of loaded theme names
 */
export function getLoadedThemes(): string[] {
  if (!highlighterInstance) {
    return [];
  }

  return highlighterInstance.getLoadedThemes() as string[];
}

/**
 * Get list of loaded languages
 * @returns Array of loaded language IDs
 */
export function getLoadedLanguages(): string[] {
  if (!highlighterInstance) {
    return [];
  }

  return highlighterInstance.getLoadedLanguages() as string[];
}

/**
 * Semantic editor theme colors extracted from a Shiki theme
 */
export interface EditorThemeColors {
  background: string;
  foreground: string;
  lineNumber: string;
  findMatchBackground: string;
  findMatchHighlightBackground: string;
  selectionBackground: string;
}

/**
 * Extract semantic editor colors from a loaded Shiki theme
 * @param themeName - Shiki theme name (e.g. 'github-dark', 'dark-plus')
 * @returns EditorThemeColors or null if highlighter/theme not available
 */
export function getThemeColors(themeName: string): EditorThemeColors | null {
  const highlighter = getShikiHighlighter();
  if (!highlighter) return null;

  const shikiTheme = (highlighter as any).getTheme(themeName);
  if (!shikiTheme) return null;

  const colors = shikiTheme.colors || {};
  return {
    background: colors['editor.background'] || '#ffffff',
    foreground: colors['editor.foreground'] || '#000000',
    lineNumber: colors['editorLineNumber.foreground'] || '#999999',
    findMatchBackground: colors['editor.findMatchBackground'] || '#ffff00',
    findMatchHighlightBackground: colors['editor.findMatchHighlightBackground'] || '#ffd700',
    selectionBackground: colors['editor.selectionBackground'] || '#add6ff',
  };
}

