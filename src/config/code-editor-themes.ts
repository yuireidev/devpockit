/**
 * Code Editor Theme Configuration
 * Defines available themes for Monaco Editor with Shiki
 * Themes are independent from the website theme
 */

import { getShikiThemeName } from '@/libs/shiki-init'
import { getMonacoTheme } from './monaco-themes'

export type CodeEditorTheme =
  | 'basicLight'
  | 'basicDark'
  | 'vscodeLight'
  | 'vscodeDark'
  | 'githubLight'
  | 'githubDark'
  | 'materialLight'
  | 'materialDark'
  | 'monokai'
  | 'solarizedLight'
  | 'solarizedDark'
  | 'catppuccin'
  | 'nord'

export interface ThemeConfig {
  name: string
  label: string
  monacoTheme: string // Monaco theme name (matches Shiki theme name)
  shikiTheme: string // Shiki theme name
}

/**
 * Theme configuration with labels
 * Monaco and Shiki theme names are the same (registered via @shikijs/monaco)
 */
export const CODE_EDITOR_THEMES: Record<CodeEditorTheme, ThemeConfig> = {
  basicLight: {
    name: 'basicLight',
    label: 'Basic Light',
    monacoTheme: getMonacoTheme('basicLight'),
    shikiTheme: getShikiThemeName('basicLight'),
  },
  basicDark: {
    name: 'basicDark',
    label: 'Basic Dark',
    monacoTheme: getMonacoTheme('basicDark'),
    shikiTheme: getShikiThemeName('basicDark'),
  },
  vscodeLight: {
    name: 'vscodeLight',
    label: 'VS Code Light',
    monacoTheme: getMonacoTheme('vscodeLight'),
    shikiTheme: getShikiThemeName('vscodeLight'),
  },
  vscodeDark: {
    name: 'vscodeDark',
    label: 'VS Code Dark',
    monacoTheme: getMonacoTheme('vscodeDark'),
    shikiTheme: getShikiThemeName('vscodeDark'),
  },
  githubLight: {
    name: 'githubLight',
    label: 'GitHub Light',
    monacoTheme: getMonacoTheme('githubLight'),
    shikiTheme: getShikiThemeName('githubLight'),
  },
  githubDark: {
    name: 'githubDark',
    label: 'GitHub Dark',
    monacoTheme: getMonacoTheme('githubDark'),
    shikiTheme: getShikiThemeName('githubDark'),
  },
  materialLight: {
    name: 'materialLight',
    label: 'Material Light',
    monacoTheme: getMonacoTheme('materialLight'),
    shikiTheme: getShikiThemeName('materialLight'),
  },
  materialDark: {
    name: 'materialDark',
    label: 'Material Dark',
    monacoTheme: getMonacoTheme('materialDark'),
    shikiTheme: getShikiThemeName('materialDark'),
  },
  monokai: {
    name: 'monokai',
    label: 'Monokai',
    monacoTheme: getMonacoTheme('monokai'),
    shikiTheme: getShikiThemeName('monokai'),
  },
  solarizedLight: {
    name: 'solarizedLight',
    label: 'Solarized Light',
    monacoTheme: getMonacoTheme('solarizedLight'),
    shikiTheme: getShikiThemeName('solarizedLight'),
  },
  solarizedDark: {
    name: 'solarizedDark',
    label: 'Solarized Dark',
    monacoTheme: getMonacoTheme('solarizedDark'),
    shikiTheme: getShikiThemeName('solarizedDark'),
  },
  catppuccin: {
    name: 'catppuccin',
    label: 'Catppuccin',
    monacoTheme: getMonacoTheme('catppuccin'),
    shikiTheme: getShikiThemeName('catppuccin'),
  },
  nord: {
    name: 'nord',
    label: 'Nord',
    monacoTheme: getMonacoTheme('nord'),
    shikiTheme: getShikiThemeName('nord'),
  },
}

/**
 * Get Monaco theme name by CodeEditorTheme
 * @param theme - CodeEditorTheme
 * @returns Monaco theme name
 */
export function getThemeMonacoName(theme: CodeEditorTheme): string {
  return getMonacoTheme(theme)
}

/**
 * Get Shiki theme name by CodeEditorTheme
 * @param theme - CodeEditorTheme
 * @returns Shiki theme name
 */
export function getThemeShikiName(theme: CodeEditorTheme): string {
  return getShikiThemeName(theme)
}

/**
 * Get all available themes
 */
export function getAvailableThemes(): CodeEditorTheme[] {
  return Object.keys(CODE_EDITOR_THEMES) as CodeEditorTheme[]
}

/**
 * Get theme configuration
 */
export function getThemeConfig(theme: CodeEditorTheme): ThemeConfig {
  return CODE_EDITOR_THEMES[theme] || CODE_EDITOR_THEMES.basicDark
}
