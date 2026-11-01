/**
 * EditorSettingsMenu Component
 * A dropdown menu for code editor settings with upward-opening menu
 * Includes: Text Wrap, Sticky Scroll, Render Whitespace, Render Control Characters, Auto-complete, Zoom controls
 */

'use client'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/libs/utils'
import { ChevronUp, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import type * as Monaco from 'monaco-editor'

export interface EditorSettingsMenuProps {
  // Editor instance (nullable - menu should handle when editor is not yet mounted)
  editorInstance: Monaco.editor.IStandaloneCodeEditor | null

  // Text Wrap
  wrapText: boolean
  onWrapTextChange: (enabled: boolean) => void

  // Sticky Scroll
  stickyScroll: boolean
  onStickyScrollChange: (enabled: boolean) => void

  // Render Whitespace
  renderWhitespace: boolean
  onRenderWhitespaceChange: (enabled: boolean) => void

  // Render Control Characters
  renderControlCharacters: boolean
  onRenderControlCharactersChange: (enabled: boolean) => void

  // Line Numbers
  showLineNumbers: boolean
  onShowLineNumbersChange: (enabled: boolean) => void

  // Auto-complete
  autoComplete: boolean
  onAutoCompleteChange: (enabled: boolean) => void

  // Zoom actions
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void

  // Optional styling
  className?: string
}

export function EditorSettingsMenu({
  editorInstance,
  wrapText,
  onWrapTextChange,
  stickyScroll,
  onStickyScrollChange,
  renderWhitespace,
  onRenderWhitespaceChange,
  renderControlCharacters,
  onRenderControlCharactersChange,
  showLineNumbers,
  onShowLineNumbersChange,
  autoComplete,
  onAutoCompleteChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  className,
}: EditorSettingsMenuProps) {
  const handleWrapTextChange = (checked: boolean) => {
    if (editorInstance) {
      editorInstance.updateOptions({
        wordWrap: checked ? 'on' : 'off',
      })
    }
    onWrapTextChange(checked)
  }

  const handleStickyScrollChange = (checked: boolean) => {
    if (editorInstance) {
      editorInstance.updateOptions({
        stickyScroll: {
          enabled: checked,
        },
      })
    }
    onStickyScrollChange(checked)
  }

  const handleRenderWhitespaceChange = (checked: boolean) => {
    if (editorInstance) {
      editorInstance.updateOptions({
        renderWhitespace: checked ? 'all' : 'none',
      })
    }
    onRenderWhitespaceChange(checked)
  }

  const handleRenderControlCharactersChange = (checked: boolean) => {
    if (editorInstance) {
      editorInstance.updateOptions({
        renderControlCharacters: checked,
      })
    }
    onRenderControlCharactersChange(checked)
  }

  const handleShowLineNumbersChange = (checked: boolean) => {
    if (editorInstance) {
      editorInstance.updateOptions({
        lineNumbers: checked ? 'on' : 'off',
      })
    }
    onShowLineNumbersChange(checked)
  }

  const handleAutoCompleteChange = (checked: boolean) => {
    if (editorInstance) {
      editorInstance.updateOptions({
        quickSuggestions: checked,
        suggestOnTriggerCharacters: checked,
        acceptSuggestionOnCommitCharacter: checked,
        tabCompletion: checked ? 'on' : 'off',
      })
    }
    onAutoCompleteChange(checked)
  }

  const handleZoomIn = () => {
    if (editorInstance) {
      editorInstance.getAction('editor.action.fontZoomIn')?.run()
    }
    onZoomIn()
  }

  const handleZoomOut = () => {
    if (editorInstance) {
      editorInstance.getAction('editor.action.fontZoomOut')?.run()
    }
    onZoomOut()
  }

  const handleResetZoom = () => {
    if (editorInstance) {
      editorInstance.getAction('editor.action.fontZoomReset')?.run()
    }
    onResetZoom()
  }

  const isEditorAvailable = editorInstance !== null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'text-muted-foreground hover:text-foreground flex h-6 w-6 items-center justify-center rounded-md border border-neutral-300 bg-white transition-colors hover:border-neutral-400 dark:border-neutral-600 dark:bg-neutral-900 dark:hover:border-neutral-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          disabled={!isEditorAvailable}
          aria-label="Editor settings"
          title="Editor settings"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" sideOffset={8} className="min-w-[200px]">
        {/* Line Numbers */}
        <DropdownMenuCheckboxItem
          checked={showLineNumbers}
          onCheckedChange={handleShowLineNumbersChange}
          disabled={!isEditorAvailable}
        >
          Line Numbers
        </DropdownMenuCheckboxItem>

        {/* Text Wrap */}
        <DropdownMenuCheckboxItem
          checked={wrapText}
          onCheckedChange={handleWrapTextChange}
          disabled={!isEditorAvailable}
        >
          Text Wrap
        </DropdownMenuCheckboxItem>

        {/* Sticky Scroll */}
        <DropdownMenuCheckboxItem
          checked={stickyScroll}
          onCheckedChange={handleStickyScrollChange}
          disabled={!isEditorAvailable}
        >
          Sticky Scroll
        </DropdownMenuCheckboxItem>

        {/* Render Whitespace */}
        <DropdownMenuCheckboxItem
          checked={renderWhitespace}
          onCheckedChange={handleRenderWhitespaceChange}
          disabled={!isEditorAvailable}
        >
          Render White Space
        </DropdownMenuCheckboxItem>

        {/* Render Control Characters */}
        <DropdownMenuCheckboxItem
          checked={renderControlCharacters}
          onCheckedChange={handleRenderControlCharactersChange}
          disabled={!isEditorAvailable}
        >
          Render Control Character
        </DropdownMenuCheckboxItem>

        {/* Auto-complete */}
        <DropdownMenuCheckboxItem
          checked={autoComplete}
          onCheckedChange={handleAutoCompleteChange}
          disabled={!isEditorAvailable}
        >
          Auto-complete
        </DropdownMenuCheckboxItem>

        {/* Divider */}
        <DropdownMenuSeparator />

        {/* Zoom In */}
        <DropdownMenuItem onSelect={handleZoomIn} disabled={!isEditorAvailable} className="flex items-center gap-2">
          <ZoomIn className="h-4 w-4" />
          <span>Zoom In</span>
        </DropdownMenuItem>

        {/* Zoom Out */}
        <DropdownMenuItem onSelect={handleZoomOut} disabled={!isEditorAvailable} className="flex items-center gap-2">
          <ZoomOut className="h-4 w-4" />
          <span>Zoom Out</span>
        </DropdownMenuItem>

        {/* Reset Zoom */}
        <DropdownMenuItem onSelect={handleResetZoom} disabled={!isEditorAvailable} className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          <span>Reset Zoom</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
