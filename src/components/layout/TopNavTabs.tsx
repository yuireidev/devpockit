'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/libs/utils'
import { ChevronDown, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

export interface ActiveTab {
  toolId: string
  instanceId: string // REQUIRED - always present
  toolName: string
  category: string
  isActive: boolean
  displayName: string // "JSON Formatter" or "JSON Formatter (2)"
  customName?: string // Optional: User-renamed tab name
}

interface TopNavTabsProps {
  tabs: ActiveTab[]
  activeTab?: string // toolId of active tab
  onTabSelect: (toolId: string, instanceId: string) => void
  onTabClose: (toolId: string, instanceId: string) => void
  onCloseAll?: () => void
  onTabsReorder?: (tabs: ActiveTab[]) => void
  className?: string
}

export function TopNavTabs({
  tabs,
  activeTab,
  onTabSelect,
  onTabClose,
  onCloseAll,
  onTabsReorder,
  className,
}: TopNavTabsProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null) // key: toolId:instanceId
  const [draggedTab, setDraggedTab] = useState<string | null>(null) // key: toolId:instanceId
  const [dragOverTab, setDragOverTab] = useState<string | null>(null) // key: toolId:instanceId
  // Ref for potential future programmatic scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Helper to create unique tab key
  const getTabKey = (toolId: string, instanceId: string) => `${toolId}:${instanceId}`

  // Calculate dynamic width based on longest tab name
  const dropdownWidth = useMemo(() => {
    if (tabs.length === 0) return 224 // Default width (w-56 = 224px)

    const longestTabName = tabs.reduce((longest, tab) => {
      const tabLabel = tab.customName || tab.displayName
      return tabLabel.length > longest.length ? tabLabel : longest
    }, '')

    // Estimate: ~8px per character for text-sm, plus padding (16px left + 16px right),
    // plus space for X button (24px) and gap (8px), plus some buffer (32px)
    const estimatedWidth = longestTabName.length * 8 + 16 + 16 + 24 + 8 + 32

    // Clamp between min (200px) and max (500px)
    return Math.max(200, Math.min(500, estimatedWidth))
  }, [tabs])

  if (tabs.length === 0) {
    return null
  }

  const handleDragStart = (e: React.DragEvent, toolId: string, instanceId: string) => {
    const tabKey = getTabKey(toolId, instanceId)
    setDraggedTab(tabKey)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', tabKey)
  }

  const handleDragOver = (e: React.DragEvent, toolId: string, instanceId: string) => {
    e.preventDefault()
    const tabKey = getTabKey(toolId, instanceId)
    if (draggedTab && draggedTab !== tabKey) {
      setDragOverTab(tabKey)
    }
  }

  const handleDragLeave = () => {
    setDragOverTab(null)
  }

  const handleDrop = (e: React.DragEvent, targetToolId: string, targetInstanceId: string) => {
    e.preventDefault()
    const targetTabKey = getTabKey(targetToolId, targetInstanceId)
    if (!draggedTab || draggedTab === targetTabKey) {
      setDraggedTab(null)
      setDragOverTab(null)
      return
    }

    const draggedIndex = tabs.findIndex((t) => getTabKey(t.toolId, t.instanceId) === draggedTab)
    const targetIndex = tabs.findIndex((t) => getTabKey(t.toolId, t.instanceId) === targetTabKey)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newTabs = [...tabs]
      const [removed] = newTabs.splice(draggedIndex, 1)
      newTabs.splice(targetIndex, 0, removed)
      onTabsReorder?.(newTabs)
    }

    setDraggedTab(null)
    setDragOverTab(null)
  }

  const handleDragEnd = () => {
    setDraggedTab(null)
    setDragOverTab(null)
  }

  return (
    <div className={cn('border-border flex items-center bg-neutral-100 dark:bg-neutral-800', className)}>
      {/* Scrollable tabs container */}
      <div
        ref={scrollContainerRef}
        className="scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent flex flex-1 items-center overflow-x-auto"
        style={{ scrollbarWidth: 'thin' }}
      >
        {tabs.map((tab) => {
          const tabKey = getTabKey(tab.toolId, tab.instanceId)
          const isSelected = tab.toolId === activeTab && tab.isActive
          const isHovered = hoveredTab === tabKey
          const isDragging = draggedTab === tabKey
          const isDragOver = dragOverTab === tabKey
          const showCloseIcon = isSelected || isHovered
          // Use customName if available, otherwise use displayName
          const tabLabel = tab.customName || tab.displayName

          return (
            <div
              key={tabKey}
              draggable
              onDragStart={(e) => handleDragStart(e, tab.toolId, tab.instanceId)}
              onDragOver={(e) => handleDragOver(e, tab.toolId, tab.instanceId)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, tab.toolId, tab.instanceId)}
              onDragEnd={handleDragEnd}
              className={cn(
                'group flex shrink-0 cursor-pointer items-center gap-2 border-r border-neutral-200 py-3 pr-3 pl-4 transition-all dark:border-neutral-700',
                isSelected ? 'bg-white dark:bg-neutral-900' : 'hover:bg-accent bg-transparent',
                isDragging && 'opacity-50',
                isDragOver && 'border-l-primary border-l-2'
              )}
              onMouseEnter={() => setHoveredTab(tabKey)}
              onMouseLeave={() => setHoveredTab(null)}
              onClick={() => onTabSelect(tab.toolId, tab.instanceId)}
            >
              <h2
                className={cn(
                  'text-sm font-normal tracking-normal whitespace-nowrap select-none',
                  isSelected ? 'text-neutral-900 dark:text-neutral-100' : 'text-foreground'
                )}
              >
                {tabLabel}
              </h2>
              <button
                className={cn(
                  'shrink-0 rounded-md p-1 transition-all duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-700',
                  showCloseIcon ? 'opacity-100' : 'opacity-0'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose(tab.toolId, tab.instanceId)
                }}
                title="Close tool"
              >
                <X className="text-foreground h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Close All and Dropdown buttons - fixed on the right */}
      {tabs.length > 1 && onCloseAll && (
        <div className="flex shrink-0 items-center gap-2 border-l border-neutral-200 bg-neutral-100 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
          <button
            className="text-muted-foreground hover:text-foreground text-xs whitespace-nowrap transition-colors"
            onClick={onCloseAll}
            title="Close all tabs"
          >
            Close All
          </button>
          <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-600" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="text-muted-foreground hover:text-foreground flex h-6 w-6 items-center justify-center rounded-md border border-neutral-300 bg-white transition-colors hover:border-neutral-400 dark:border-neutral-600 dark:bg-neutral-900 dark:hover:border-neutral-500"
                title="Show all tabs"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-[300px] overflow-y-auto"
              style={{ width: `${dropdownWidth}px`, minWidth: '200px', maxWidth: '500px' }}
            >
              {tabs.map((tab) => {
                const tabKey = getTabKey(tab.toolId, tab.instanceId)
                const isActive = tab.toolId === activeTab && tab.isActive
                const tabLabel = tab.customName || tab.displayName

                return (
                  <DropdownMenuItem
                    key={tabKey}
                    onClick={() => onTabSelect(tab.toolId, tab.instanceId)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-2',
                      isActive && 'bg-neutral-100 font-semibold dark:bg-neutral-700'
                    )}
                  >
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate text-sm',
                        isActive && 'text-neutral-900 dark:text-neutral-100'
                      )}
                    >
                      {tabLabel}
                    </span>
                    <button
                      className="shrink-0 rounded-md p-1 opacity-70 transition-colors hover:bg-neutral-200 hover:opacity-100 dark:hover:bg-neutral-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTabClose(tab.toolId, tab.instanceId)
                      }}
                      title="Close tab"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <X className="text-foreground h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
