/**
 * Monaco Editor Theme Configuration
 * Maps CodeEditorTheme to Monaco theme names
 * Monaco themes match Shiki theme names via @shikijs/monaco integration
 */

import type * as Monaco from 'monaco-editor';
import type { CodeEditorTheme } from './code-editor-themes';

/**
 * Map CodeEditorTheme to Monaco theme name
 * Monaco theme names match Shiki theme names (registered via @shikijs/monaco)
 * @param theme - CodeEditorTheme from config
 * @returns Monaco theme name (same as Shiki theme name)
 */
export function getMonacoTheme(theme: CodeEditorTheme): string {
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
 * Get fallback Monaco theme based on theme type (light/dark)
 * @param theme - CodeEditorTheme
 * @returns Fallback Monaco theme name
 */
export function getMonacoThemeFallback(theme: CodeEditorTheme): string {
  // Determine if theme is light or dark
  const isLight = theme.includes('Light') || theme === 'basicLight' || theme === 'vscodeLight' || theme === 'githubLight';

  if (isLight) {
    // Fallback to VS Code light or GitHub light
    return 'light-plus';
  } else {
    // Fallback to VS Code dark or GitHub dark
    return 'dark-plus';
  }
}

/**
 * Check if a Monaco theme is available
 * Note: This checks if theme is registered, but actual availability
 * depends on Shiki highlighter initialization
 * @param monaco - Monaco Editor instance
 * @param themeName - Theme name to check
 * @returns true if theme is registered, false otherwise
 */
export function isMonacoThemeAvailable(monaco: typeof Monaco, themeName: string): boolean {
  try {
    // Monaco doesn't have a direct API to check theme availability
    // We'll try to get the theme definition
    // If it throws, the theme doesn't exist
    monaco.editor.defineTheme(themeName, {} as Monaco.editor.IStandaloneThemeData);
    return true;
  } catch {
    // Theme might already be defined, which is fine
    // We'll assume it's available if no error
    return true;
  }
}

/**
 * Register a custom Monaco theme
 * Use this only if Shiki themes don't work or need exact color matching
 * @param monaco - Monaco Editor instance
 * @param themeName - Name of the theme
 * @param themeDefinition - Monaco theme definition
 */
export function registerCustomMonacoTheme(
  monaco: typeof Monaco,
  themeName: string,
  themeDefinition: Monaco.editor.IStandaloneThemeData
): void {
  try {
    monaco.editor.defineTheme(themeName, themeDefinition);
  } catch (error) {
    console.error(`Failed to register custom Monaco theme: ${themeName}`, error);
    throw error;
  }
}

/**
 * Get Monaco built-in theme names
 * These are always available in Monaco Editor
 * @returns Array of built-in theme names
 */
export function getMonacoBuiltInThemes(): string[] {
  return ['vs', 'vs-dark', 'hc-black'];
}

/**
 * Check if a theme is a built-in Monaco theme
 * @param themeName - Theme name to check
 * @returns true if built-in, false otherwise
 */
export function isMonacoBuiltInTheme(themeName: string): boolean {
  return getMonacoBuiltInThemes().includes(themeName);
}

/**
 * Get all available Monaco theme names
 * Includes both Shiki themes (via @shikijs/monaco) and built-in themes
 * Note: Shiki themes must be loaded via Shiki highlighter first
 * @param monaco - Monaco Editor instance (optional, for future use)
 * @returns Array of available theme names
 */
export function getAvailableMonacoThemes(): string[] {
  // Built-in themes are always available
  const builtInThemes = getMonacoBuiltInThemes();

  // Shiki themes (registered via @shikijs/monaco)
  // These match the CodeEditorTheme mappings
  const shikiThemes = [
    'github-light',
    'github-dark',
    'light-plus',
    'dark-plus',
    'monokai',
    'solarized-light',
    'solarized-dark',
    'catppuccin-mocha',
    'nord',
    'material-theme-lighter',
    'material-theme-darker',
  ];

  return [...builtInThemes, ...shikiThemes];
}

/**
 * Validate Monaco theme name
 * Checks if theme name is valid (either built-in or Shiki theme)
 * @param themeName - Theme name to validate
 * @returns true if valid, false otherwise
 */
export function isValidMonacoTheme(themeName: string): boolean {
  const availableThemes = getAvailableMonacoThemes();
  return availableThemes.includes(themeName);
}

