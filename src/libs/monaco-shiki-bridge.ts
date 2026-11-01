/**
 * Monaco-Shiki Bridge Module
 * Connects Shiki syntax highlighting to Monaco Editor
 */

import { shikiToMonaco } from '@shikijs/monaco'
import type * as Monaco from 'monaco-editor'
import type { Highlighter } from 'shiki'

/**
 * Track if bridge has been connected to prevent duplicate connections
 */
let isConnected = false
let connectedMonacoInstance: typeof Monaco | null = null

/**
 * Languages to register with Monaco
 * These should match the languages loaded in Shiki
 */
const LANGUAGES_TO_REGISTER = ['json', 'xml', 'javascript', 'plaintext'] as const

/**
 * Register languages with Monaco Editor
 * Idempotent - can be called multiple times safely
 * @param monaco - Monaco Editor instance
 */
function registerLanguages(monaco: typeof Monaco): void {
  for (const langId of LANGUAGES_TO_REGISTER) {
    try {
      // Check if language is already registered
      const languages = monaco.languages.getLanguages()
      const isRegistered = languages.some((lang) => lang.id === langId)

      if (!isRegistered) {
        monaco.languages.register({ id: langId })
      }
    } catch (error) {
      // Language might already be registered, ignore error
      console.warn(`Failed to register language ${langId}:`, error)
    }
  }
}

/**
 * Connect Shiki highlighter to Monaco Editor
 * This function is idempotent - safe to call multiple times
 * @param monaco - Monaco Editor instance
 * @param highlighter - Shiki highlighter instance
 * @returns Promise that resolves when connection is complete
 */
export async function connectShikiToMonaco(monaco: typeof Monaco, highlighter: Highlighter): Promise<void> {
  // Check if already connected with the same instance
  if (isConnected && connectedMonacoInstance === monaco) {
    return
  }

  try {
    // Register languages with Monaco first
    registerLanguages(monaco)

    // Connect Shiki to Monaco
    // This registers Shiki's tokenization with Monaco's language services
    shikiToMonaco(highlighter, monaco)

    // Mark as connected
    isConnected = true
    connectedMonacoInstance = monaco
  } catch (error) {
    console.error('Failed to connect Shiki to Monaco:', error)
    throw new Error('Failed to connect Shiki syntax highlighting to Monaco Editor')
  }
}

/**
 * Check if Shiki is connected to Monaco
 * @returns true if connected, false otherwise
 */
export function isShikiConnectedToMonaco(): boolean {
  return isConnected
}

/**
 * Reset connection state (useful for testing or re-initialization)
 * WARNING: This will allow re-connection, but you should re-initialize
 * the highlighter if you reset this
 */
export function resetMonacoShikiConnection(): void {
  isConnected = false
  connectedMonacoInstance = null
}

/**
 * Initialize Monaco-Shiki integration
 * This is a convenience function that combines initialization steps
 * @param monaco - Monaco Editor instance
 * @param highlighter - Shiki highlighter instance
 * @returns Promise that resolves when integration is complete
 */
export async function initializeMonacoShikiIntegration(monaco: typeof Monaco, highlighter: Highlighter): Promise<void> {
  // Ensure languages are registered
  registerLanguages(monaco)

  // Connect Shiki to Monaco
  await connectShikiToMonaco(monaco, highlighter)
}

/**
 * Get the Monaco instance that Shiki is connected to
 * @returns Monaco instance or null if not connected
 */
export function getConnectedMonacoInstance(): typeof Monaco | null {
  return connectedMonacoInstance
}
