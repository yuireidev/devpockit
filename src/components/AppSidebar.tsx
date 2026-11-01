'use client'

import { SearchTools } from '@/components/layout/SearchTools'
import { useToolActivity } from '@/components/providers/ToolActivityProvider'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CODE_EDITOR_THEMES, type CodeEditorTheme } from '@/config/code-editor-themes'
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { toolCategories } from '@/libs/tools-data'
import { cn } from '@/libs/utils'
import {
  ArrowLeftRight,
  ChevronRight,
  Code,
  FileText,
  Globe,
  Heart,
  Home,
  Info,
  Lock,
  Moon,
  PanelLeft,
  RefreshCw,
  Search,
  Settings,
  Star,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import * as React from 'react'

const subscribeToHydration = () => () => {}
const getClientHydrationSnapshot = () => true
const getServerHydrationSnapshot = () => false

const getExpandedCategoryIds = (selectedTool?: string) => {
  if (!selectedTool) return []
  const category = toolCategories.find((cat) => cat.tools.some((tool) => tool.id === selectedTool))
  return category ? [category.id] : []
}

// Map category IDs to lucide icons
const getCategoryIcon = (categoryId: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'text-tools': FileText,
    formatters: Code,
    cryptography: Lock,
    encoders: RefreshCw,
    converters: ArrowLeftRight,
    network: Globe,
    utilities: Settings,
  }
  return iconMap[categoryId] || FileText
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  selectedTool?: string
  onToolSelect?: (toolId: string) => void
  onHomeClick?: () => void
  onLogoClick?: () => void // Clears all state and navigates home
  onAboutClick?: () => void // Handles About page navigation
  onSearchClick?: () => void // Opens command palette
  onClearAllAndGoHome?: () => void // Clears all tabs and navigates home
}

export function AppSidebar({
  selectedTool,
  onToolSelect,
  onHomeClick,
  onLogoClick,
  onAboutClick,
  onSearchClick,
  onClearAllAndGoHome,
  ...props
}: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { state, toggleSidebar } = useSidebar()
  const sidebarShortcut = useKeyboardShortcut('sidebar')
  const { hydrated: pinsHydrated, isPinned, togglePinnedTool } = useToolActivity()
  const [codeEditorTheme, setCodeEditorTheme] = useCodeEditorTheme('basicDark')
  const mounted = React.useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  )
  const [openCategories, setOpenCategories] = React.useState<Set<string>>(
    () => new Set(getExpandedCategoryIds(selectedTool))
  )
  const [previousSelectedTool, setPreviousSelectedTool] = React.useState(selectedTool)
  const [isLogoHovered, setIsLogoHovered] = React.useState(false)

  if (selectedTool !== previousSelectedTool) {
    setPreviousSelectedTool(selectedTool)
    const expandedCategories = getExpandedCategoryIds(selectedTool)
    if (expandedCategories.length > 0) {
      setOpenCategories((prev) => {
        const newSet = new Set(prev)
        expandedCategories.forEach((catId) => newSet.add(catId))
        return newSet
      })
    }
  }

  const handleToolSelect = (toolId: string) => {
    if (onToolSelect) {
      onToolSelect(toolId)
    } else {
      const tool = toolCategories.flatMap((cat) => cat.tools).find((t) => t.id === toolId)
      if (tool) {
        router.push(`/tools/${tool.category}/${toolId}`)
      }
    }
  }

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick()
    } else {
      router.push('/')
    }
  }

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick()
    } else {
      router.push('/')
    }
  }

  const handleCategoryToggle = (categoryId: string, isOpen: boolean) => {
    setOpenCategories((prev) => {
      const newSet = new Set(prev)
      if (isOpen) {
        newSet.add(categoryId)
      } else {
        newSet.delete(categoryId)
      }
      return newSet
    })
  }

  const isCollapsed = state === 'collapsed'

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center transition-all',
                  isCollapsed && 'hover:bg-sidebar-accent rounded-md'
                )}
                onMouseEnter={() => setIsLogoHovered(true)}
                onMouseLeave={() => setIsLogoHovered(false)}
                onClick={isCollapsed ? toggleSidebar : handleLogoClick}
              >
                {isCollapsed && isLogoHovered ? (
                  <PanelLeft className="text-sidebar-foreground h-4 w-4" />
                ) : (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/assets/devpockit-logo.svg`}
                    alt="DevPockit Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                )}
              </div>
            </TooltipTrigger>
            {isCollapsed ? (
              <TooltipContent side="right">Expand sidebar · {sidebarShortcut}</TooltipContent>
            ) : (
              <TooltipContent side="right">Go to home</TooltipContent>
            )}
          </Tooltip>
          <div className="min-w-0 flex-1 cursor-pointer group-data-[collapsible=icon]:hidden" onClick={handleLogoClick}>
            <div className="flex items-baseline gap-2 transition-opacity hover:opacity-80">
              <span className="text-sidebar-foreground font-serif text-[24px] leading-[24px] tracking-normal">
                DevPockit
              </span>
              <span className="text-muted-foreground text-xs">v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger className={cn('ml-auto', isCollapsed && 'hidden')} />
            </TooltipTrigger>
            <TooltipContent side="right">Toggle sidebar · {sidebarShortcut}</TooltipContent>
          </Tooltip>
        </div>
        <div className="mt-1 group-data-[collapsible=icon]:hidden">
          <SearchTools onToolSelect={handleToolSelect} onSearchClick={onSearchClick} />
        </div>
        {/* Search button for collapsed sidebar */}
        {isCollapsed && (
          <div className="mt-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSearchClick?.()}
                  className="hover:bg-sidebar-accent flex h-9 w-full items-center justify-center rounded-md transition-colors"
                  aria-label="Search tools"
                >
                  <Search className="text-sidebar-foreground h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Search tools</TooltipContent>
            </Tooltip>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="mb-1">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="All tools"
                  isActive={pathname === '/'}
                  onClick={() => {
                    if (onClearAllAndGoHome) {
                      onClearAllAndGoHome()
                    } else {
                      handleHomeClick()
                    }
                  }}
                >
                  <Home className="h-4 w-4" />
                  <span>All tools</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="my-1" />
        {toolCategories.map((category, index) => {
          const IconComponent = getCategoryIcon(category.id)
          const isOpen = openCategories.has(category.id)

          return (
            <SidebarGroup key={category.id} className={index === 0 ? 'mt-1' : ''}>
              <SidebarGroupContent>
                <Collapsible
                  asChild
                  open={isOpen}
                  onOpenChange={(open) => handleCategoryToggle(category.id, open)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={{
                          children: (
                            <div className="flex flex-col gap-1">
                              <div className="mb-1 border-b border-neutral-200 pb-1 font-semibold text-neutral-900 dark:border-neutral-700 dark:text-neutral-100">
                                {category.name}
                              </div>
                              {category.tools.map((tool) => (
                                <div
                                  key={tool.id}
                                  className="-mx-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs"
                                >
                                  <div
                                    className="-mx-1 min-w-0 flex-1 cursor-pointer rounded-md px-2 py-1 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleToolSelect(tool.id)
                                    }}
                                  >
                                    <span className="block truncate">{tool.name}</span>
                                  </div>
                                  {mounted && pinsHydrated ? (
                                    <button
                                      type="button"
                                      className={cn(
                                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-600 dark:hover:text-neutral-100',
                                        isPinned(tool.id) && 'text-orange-600 dark:text-orange-400'
                                      )}
                                      aria-label={isPinned(tool.id) ? `Unpin ${tool.name}` : `Pin ${tool.name}`}
                                      aria-pressed={isPinned(tool.id)}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        togglePinnedTool(tool.id)
                                      }}
                                    >
                                      <Star
                                        className={cn(
                                          'h-3.5 w-3.5',
                                          isPinned(tool.id) &&
                                            'fill-orange-500 text-orange-600 dark:fill-orange-500 dark:text-orange-400'
                                        )}
                                        strokeWidth={1.5}
                                      />
                                    </button>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          ),
                          className: 'w-56',
                        }}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{category.name}</span>
                        <ChevronRight className="ml-auto h-8 w-8 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent suppressHydrationWarning>
                      <SidebarMenuSub>
                        {category.tools.map((tool) => (
                          <SidebarMenuSubItem key={tool.id}>
                            <div className="flex w-full min-w-0 items-center gap-0.5">
                              <SidebarMenuSubButton
                                className="min-w-0 flex-1 pr-0"
                                isActive={tool.id === selectedTool}
                                onClick={() => handleToolSelect(tool.id)}
                              >
                                <span>{tool.name}</span>
                              </SidebarMenuSubButton>
                              {pinsHydrated ? (
                                <button
                                  type="button"
                                  className={cn(
                                    'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                                    isPinned(tool.id) && 'text-orange-600 dark:text-orange-400'
                                  )}
                                  aria-label={isPinned(tool.id) ? `Unpin ${tool.name}` : `Pin ${tool.name}`}
                                  aria-pressed={isPinned(tool.id)}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    togglePinnedTool(tool.id)
                                  }}
                                >
                                  <Star
                                    className={cn(
                                      'h-3.5 w-3.5',
                                      isPinned(tool.id) &&
                                        'fill-orange-500 text-orange-600 dark:fill-orange-500 dark:text-orange-400'
                                    )}
                                    strokeWidth={1.5}
                                  />
                                </button>
                              ) : null}
                            </div>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
      <SidebarFooter className="gap-2 px-2 pt-2 pb-5 group-data-[collapsible=icon]:items-center">
        {/* Top Separator */}
        <SidebarSeparator className="-mx-2 my-1 w-auto self-stretch" />

        {/* About and Support us menu items */}
        <SidebarMenu className="group-data-[collapsible=icon]:w-auto">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={isCollapsed ? 'About' : undefined}
              onClick={() => {
                if (onAboutClick) {
                  onAboutClick()
                } else {
                  router.push('/about')
                }
              }}
            >
              <Info className="h-4 w-4" />
              <span className={cn(isCollapsed && 'hidden')}>About</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <a href="https://buymeacoffee.com/hypkey" target="_blank" rel="noopener noreferrer">
              <SidebarMenuButton tooltip={isCollapsed ? 'Support us' : undefined}>
                <Heart className="h-4 w-4" />
                <span className={cn(isCollapsed && 'hidden')}>Support us</span>
              </SidebarMenuButton>
            </a>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Separator */}
        <SidebarSeparator className="-mx-2 my-1 w-auto self-stretch" />

        {/* Theme Toggle - Different layouts for collapsed vs expanded */}
        {isCollapsed ? (
          /* Collapsed: Single icon toggle button */
          <div className="flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-[8px] bg-neutral-100 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700'
                  )}
                >
                  {mounted && theme === 'dark' ? (
                    <Sun className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {mounted && theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          /* Expanded: Combined Theme Toggle and Code Editor Theme Selector */
          <div className="flex items-center gap-2 pt-1 pr-[8px] pl-1.5">
            {/* Dark/Light Mode Toggle */}
            <div className="flex flex-shrink-0 items-center rounded-[10px] bg-neutral-100 p-[3px] dark:bg-neutral-800">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'flex min-h-[29px] min-w-[29px] items-center justify-center rounded-[8px] px-2 py-1 transition-colors',
                  mounted && theme === 'light' ? 'bg-white shadow-xs dark:bg-neutral-900' : 'bg-transparent'
                )}
                title="Light mode"
              >
                <Sun className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex min-h-[29px] min-w-[29px] items-center justify-center rounded-[8px] px-2 py-1 transition-colors',
                  mounted && theme === 'dark' ? 'bg-white shadow-xs dark:bg-neutral-900' : 'bg-transparent'
                )}
                title="Dark mode"
              >
                <Moon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>

            {/* Code Editor Theme Selector */}
            <div className="flex-1">
              <Select value={codeEditorTheme} onValueChange={(value) => setCodeEditorTheme(value as CodeEditorTheme)}>
                <SelectTrigger borderless className="h-[35px] w-full bg-neutral-100 text-xs dark:bg-neutral-800">
                  <div className="flex items-center gap-2">
                    <Code className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent container={typeof document !== 'undefined' ? document.body : undefined}>
                  {Object.values(CODE_EDITOR_THEMES).map((themeConfig) => (
                    <SelectItem key={themeConfig.name} value={themeConfig.name}>
                      {themeConfig.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
