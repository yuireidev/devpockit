'use client'

import { useToolState } from '@/components/providers/ToolStateProvider'
import { Button } from '@/components/ui/button'
import { CodePanel } from '@/components/ui/code-panel'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme'
import {
  DEFAULT_SYSTEM_INFO_OPTIONS,
  SystemInfoOptions,
  SystemInfo as SystemInfoType,
  collectSystemInfo,
  formatSystemInfo,
} from '@/libs/system-info'
import { SYSTEM_INFO_FORMAT_OPTIONS } from '@/config/system-info-config'
import { cn } from '@/libs/utils'
import {
  ArrowPathIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  LockClosedIcon,
  PhotoIcon,
  ShieldCheckIcon,
  Square3Stack3DIcon,
  VideoCameraIcon,
  WifiIcon,
} from '@heroicons/react/24/outline'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface SystemInfoProps {
  className?: string
  instanceId: string
}

export function SystemInfo({ className, instanceId }: SystemInfoProps) {
  const { toolState, updateToolState } = useToolState('system-info', instanceId)

  // Initialize with defaults to avoid hydration mismatch
  const [options, setOptions] = useState<SystemInfoOptions>(
    (toolState?.options as SystemInfoOptions) ?? DEFAULT_SYSTEM_INFO_OPTIONS
  )
  const [systemInfo, setSystemInfo] = useState<SystemInfoType | null>(
    (toolState?.systemInfo as SystemInfoType) ?? ((toolState?.systemInfo as SystemInfoType) || null)
  )
  const [isLoading, setIsLoading] = useState(() => !toolState?.systemInfo)
  const [error, setError] = useState<string>((toolState?.error as string) ?? (toolState?.error || ''))
  const output = useMemo(() => (systemInfo ? formatSystemInfo(systemInfo, options) : ''), [systemInfo, options])
  const [lastChecked, setLastChecked] = useState<string>('')

  // Editor settings
  const [theme] = useCodeEditorTheme('basicDark')
  const [wrapText, setWrapText] = useState(true)

  // Track if we've already hydrated to prevent re-hydration on toolState changes

  const handleCollectInfo = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const info = await collectSystemInfo()
      setSystemInfo(info)
      setLastChecked(new Date().toLocaleString())
    } catch (err) {
      let errorMessage = 'Failed to collect system information'

      if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Hydrate state from toolState after mount (client-side only)

  // Update persistent state
  useEffect(() => {
    updateToolState({
      options,
      output,
      error,
      systemInfo: systemInfo || undefined,
    })
  }, [options, output, error, systemInfo, updateToolState])

  // Collect browser information asynchronously when no prior result exists.
  useEffect(() => {
    if (systemInfo) return
    let cancelled = false
    const collect = async () => {
      try {
        const info = await collectSystemInfo()
        if (!cancelled) {
          setSystemInfo(info)
          setLastChecked(new Date().toLocaleString())
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to collect system information')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void collect()
    return () => {
      cancelled = true
    }
  }, [systemInfo])

  const handleOptionChange = (key: keyof SystemInfoOptions, value: unknown) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  const getLineCount = (text: string): number => {
    if (!text) return 0
    return text.split('\n').length
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header Section */}
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="mb-3 text-[32px] leading-6 font-normal tracking-normal text-neutral-900 dark:text-neutral-100">
          System Information
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          View detailed information about your browser, device, display, network, and system capabilities
        </p>
      </div>

      {/* Body Section */}
      <div className="bg-background flex min-h-0 flex-1 flex-col overflow-y-auto px-[24px] pt-6 pb-10">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Controls */}
          <div className="flex flex-col gap-4">
            {/* Format Selection */}
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={options.format}
                onValueChange={(value) => handleOptionChange('format', value as 'json' | 'formatted')}
              >
                <SelectTrigger label="Output Format:">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SYSTEM_INFO_FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Collect Button */}
              <Button onClick={handleCollectInfo} disabled={isLoading} variant="default" size="default">
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                    Collecting...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="mr-2 h-4 w-4" />
                    Refresh Info
                  </>
                )}
              </Button>
            </div>

            {/* Section Toggles */}
            <div className="flex flex-col gap-3">
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Show Sections:</div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={options.showBrowser}
                    onCheckedChange={(checked) => handleOptionChange('showBrowser', checked)}
                    size="sm"
                  />
                  <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <GlobeAltIcon className="h-4 w-4" />
                    Browser
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={options.showDevice}
                    onCheckedChange={(checked) => handleOptionChange('showDevice', checked)}
                    size="sm"
                  />
                  <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <DevicePhoneMobileIcon className="h-4 w-4" />
                    Device
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={options.showDisplay}
                    onCheckedChange={(checked) => handleOptionChange('showDisplay', checked)}
                    size="sm"
                  />
                  <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <ComputerDesktopIcon className="h-4 w-4" />
                    Display
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={options.showNetwork}
                    onCheckedChange={(checked) => handleOptionChange('showNetwork', checked)}
                    size="sm"
                  />
                  <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <WifiIcon className="h-4 w-4" />
                    Network
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={options.showPerformance}
                    onCheckedChange={(checked) => handleOptionChange('showPerformance', checked)}
                    size="sm"
                  />
                  <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <CpuChipIcon className="h-4 w-4" />
                    Performance
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={options.showStorage}
                    onCheckedChange={(checked) => handleOptionChange('showStorage', checked)}
                    size="sm"
                  />
                  <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <Square3Stack3DIcon className="h-4 w-4" />
                    Storage
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={options.showMedia}
                    onCheckedChange={(checked) => handleOptionChange('showMedia', checked)}
                    size="sm"
                  />
                  <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <VideoCameraIcon className="h-4 w-4" />
                    Media
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={options.showPermissions}
                    onCheckedChange={(checked) => handleOptionChange('showPermissions', checked)}
                    size="sm"
                  />
                  <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <LockClosedIcon className="h-4 w-4" />
                    Permissions
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={options.showTimeLocale}
                    onCheckedChange={(checked) => handleOptionChange('showTimeLocale', checked)}
                    size="sm"
                  />
                  <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <PhotoIcon className="h-4 w-4" />
                    Time & Locale
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={options.showSecurity}
                    onCheckedChange={(checked) => handleOptionChange('showSecurity', checked)}
                    size="sm"
                  />
                  <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <ShieldCheckIcon className="h-4 w-4" />
                    Security
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <CodePanel
            fillHeight={true}
            title="System Information"
            value={output}
            language={options.format === 'json' ? 'json' : 'text'}
            height="500px"
            className="flex-1"
            theme={theme}
            wrapText={wrapText}
            onWrapTextChange={setWrapText}
            footerLeftContent={
              output && (
                <>
                  <span>{getLineCount(output)} lines</span>
                  {lastChecked && <span>Last checked: {lastChecked}</span>}
                </>
              )
            }
          />

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
