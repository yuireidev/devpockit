'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { getCategoryById, searchTools, toolIcons } from '@/libs/tools-data'
import { cn } from '@/libs/utils'
import { type Tool } from '@/types/tools'
import { Search } from 'lucide-react'
import * as React from 'react'
import { startTransition, useEffect, useState } from 'react'

interface SearchToolsProps {
  onToolSelect: (toolId: string) => void
  className?: string
  hideShortcut?: boolean
  onSearchClick?: () => void
}

interface SearchResultProps {
  tool: Tool
  onSelect: (toolId: string) => void
  onClose: () => void
  isSelected?: boolean
}

const SearchResult = ({ tool, onSelect, onClose, isSelected = false }: SearchResultProps) => {
  const category = getCategoryById(tool.category)
  const IconComponent = toolIcons[tool.id]
  const [isHovered, setIsHovered] = useState(false)

  const handleSelect = () => {
    onSelect(tool.id)
    onClose()
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'group cursor-pointer rounded-md border bg-white transition-all duration-200 dark:bg-neutral-800',
            isHovered || isSelected
              ? 'border-orange-600 hover:shadow-md'
              : 'border-neutral-200 hover:shadow-md dark:border-neutral-700'
          )}
          onClick={handleSelect}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex items-center gap-2 p-1.5">
            {/* Icon Section */}
            <div
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors duration-200',
                isHovered || isSelected ? 'bg-orange-50 dark:bg-orange-950' : 'bg-neutral-100 dark:bg-neutral-900'
              )}
            >
              {IconComponent ? (
                <IconComponent
                  className={cn(
                    'h-3.5 w-3.5 transition-colors duration-200',
                    isHovered || isSelected
                      ? 'text-orange-600 dark:text-orange-500'
                      : 'text-neutral-400 dark:text-neutral-400'
                  )}
                  strokeWidth={1.5}
                />
              ) : (
                <span className="text-xs">{tool.icon}</span>
              )}
            </div>

            {/* Content Section */}
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs leading-4 font-medium text-neutral-900 dark:text-neutral-100">
                {tool.name}
              </div>
              <div className="mt-0.5">
                <div className="inline-block rounded border border-neutral-200 bg-neutral-100 px-1 py-0.5 dark:border-neutral-700 dark:bg-neutral-800">
                  <p className="text-[9px] leading-3 font-normal whitespace-nowrap text-neutral-700 dark:text-neutral-300">
                    {category?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <p>{tool.description}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function SearchTools({ onToolSelect, className, hideShortcut = false, onSearchClick }: SearchToolsProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Tool[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const keyboardShortcut = useKeyboardShortcut()
  const inputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (query.trim().length > 0) {
      const searchResults = searchTools(query)
      startTransition(() => {
        setResults(searchResults)
        setIsOpen(true)
        setSelectedIndex(0) // Reset to first result when query changes
      })
    } else {
      startTransition(() => {
        setResults([])
        setIsOpen(false)
        setSelectedIndex(0)
      })
    }
  }, [query])

  // Note: Global ⌘K/Ctrl+K handler is in AppLayout.tsx (opens command palette)

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    setSelectedIndex(0)
  }

  const handleSelectTool = (toolId: string) => {
    onToolSelect(toolId)
    handleClear()
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear()
      inputRef.current?.blur()
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault()
      const toolToSelect = results[selectedIndex]
      if (toolToSelect) {
        handleSelectTool(toolToSelect.id)
      }
    } else if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp' && results.length > 0) {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
    }
  }

  const handleInputClick = () => {
    if (onSearchClick) {
      onSearchClick()
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div className="relative flex min-h-[36px] items-center rounded-lg border border-[#e5e5e5] bg-white dark:border-[#262626] dark:bg-[#0a0a0a]">
        <Search className="pointer-events-none absolute left-2 h-[15.417px] w-[15.417px] text-[#0a0a0a] dark:text-[#e5e5e5]" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={handleInputClick}
          className={cn(
            'h-[36px] cursor-pointer border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0',
            hideShortcut ? 'pr-2 pl-8' : 'pr-12 pl-8'
          )}
        />
        {!hideShortcut && keyboardShortcut && (
          <div className="absolute right-2 text-sm leading-[20px] font-medium tracking-normal text-[#111827] dark:text-[#e5e5e5]">
            {keyboardShortcut}
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <TooltipProvider delayDuration={300}>
          <Card className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-md border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            <div className="space-y-0.5">
              <div className="px-2 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {results.length} tool{results.length !== 1 ? 's' : ''} found
              </div>
              {results.map((tool, index) => (
                <SearchResult
                  key={tool.id}
                  tool={tool}
                  onSelect={handleSelectTool}
                  onClose={() => setIsOpen(false)}
                  isSelected={index === selectedIndex}
                />
              ))}
            </div>
          </Card>
        </TooltipProvider>
      )}

      {isOpen && results.length === 0 && query.trim().length > 0 && (
        <Card className="bg-popover absolute top-full right-0 left-0 z-50 mt-2 border p-4 shadow-lg">
          <div className="text-muted-foreground text-center">
            <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">No tools found for &ldquo;{query}&rdquo;</p>
            <p className="mt-1 text-xs">Try a different search term</p>
          </div>
        </Card>
      )}
    </div>
  )
}
