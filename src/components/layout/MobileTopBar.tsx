'use client'

import { SearchTools } from '@/components/layout/SearchTools'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CODE_EDITOR_THEMES, type CodeEditorTheme } from '@/config/code-editor-themes'
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme'
import { cn } from '@/libs/utils'
import { Heart, Info, Menu, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { startTransition, useEffect, useState } from 'react'

interface MobileTopBarProps {
  onToolSelect: (toolId: string) => void
  onHomeClick: () => void
}

export function MobileTopBar({ onToolSelect, onHomeClick }: MobileTopBarProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [codeEditorTheme, setCodeEditorTheme] = useCodeEditorTheme('basicDark')
  const [mounted, setMounted] = useState(false)

  // Set mounted state after hydration to avoid SSR mismatch
  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    startTransition(() => {
      setMounted(true)
    })
  }, [])

  const handleLogoClick = () => {
    onHomeClick()
    router.push('/')
  }

  return (
    <div className="bg-background border-border fixed top-0 right-0 left-0 z-50 flex h-14 items-center gap-2 border-b px-3 md:hidden">
      {/* Logo - Left */}
      <button
        onClick={handleLogoClick}
        className="flex h-8 w-8 shrink-0 items-center justify-center transition-opacity hover:opacity-80"
        aria-label="Go to homepage"
      >
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/assets/devpockit-logo.svg`}
          alt="DevPockit Logo"
          width={32}
          height={32}
          className="h-8 w-8"
        />
      </button>

      {/* Search Box - Middle */}
      <div className="min-w-0 flex-1">
        <SearchTools onToolSelect={onToolSelect} hideShortcut />
      </div>

      {/* Menu Button - Right */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 shrink-0 p-0" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Code Editor Theme Selector */}
          <div className="px-2 py-1.5">
            <div className="text-muted-foreground mb-1.5 px-1 text-xs font-medium">Code Editor Theme</div>
            <Select value={codeEditorTheme} onValueChange={(value) => setCodeEditorTheme(value as CodeEditorTheme)}>
              <SelectTrigger borderless className="h-8 w-full text-xs">
                <SelectValue />
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

          <DropdownMenuSeparator />

          {/* Website Theme Toggle */}
          <div className="px-2 py-1.5">
            <div className="text-muted-foreground mb-1.5 px-1 text-xs font-medium">Website Theme</div>
            <div className="flex items-center rounded-[10px] border border-[rgba(229,229,229,1)] bg-neutral-100 p-[3px] dark:bg-neutral-800">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'flex min-h-[29px] min-w-[29px] flex-1 items-center justify-center rounded-[8px] px-2 py-1 transition-colors',
                  mounted && theme === 'light' ? 'bg-white shadow-xs dark:bg-neutral-900' : 'bg-transparent'
                )}
                title="Light mode"
              >
                <Sun className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex min-h-[29px] min-w-[29px] flex-1 items-center justify-center rounded-[8px] px-2 py-1 transition-colors',
                  mounted && theme === 'dark' ? 'bg-white shadow-xs dark:bg-neutral-900' : 'bg-transparent'
                )}
                title="Dark mode"
              >
                <Moon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* About and Support Us */}
          <DropdownMenuItem onClick={() => router.push('/about')}>
            <Info className="mr-2 h-4 w-4" />
            About
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="https://buymeacoffee.com/hypkey" target="_blank" rel="noopener noreferrer">
              <Heart className="mr-2 h-4 w-4" />
              Support Us
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
