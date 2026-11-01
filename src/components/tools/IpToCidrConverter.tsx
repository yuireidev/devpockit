'use client'

import { useToolState } from '@/components/providers/ToolStateProvider'
import { Button } from '@/components/ui/button'
import { CodePanel } from '@/components/ui/code-panel'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme'
import { analyzeNetwork, getCidrSuggestions, ipToCidrAuto, validateIpAddress } from '@/libs/ip-cidr'
import { cn } from '@/libs/utils'
import { ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

interface IpToCidrConverterProps {
  className?: string
  instanceId: string
}

const IP_EXAMPLES = [
  { label: 'Private Class A', value: '10.0.0.1' },
  { label: 'Private Class B', value: '172.16.0.1' },
  { label: 'Private Class C', value: '192.168.1.1' },
  { label: 'Loopback', value: '127.0.0.1' },
  { label: 'Link Local', value: '169.254.1.1' },
  { label: 'Public IP Example', value: '8.8.8.8' },
  { label: 'Cloudflare DNS', value: '1.1.1.1' },
]

export function IpToCidrConverter({ className, instanceId }: IpToCidrConverterProps) {
  const { toolState, updateToolState } = useToolState('ip-to-cidr-converter', instanceId)

  // Initialize with defaults
  const [input, setInput] = useState((toolState?.input as string) ?? '')
  const [output, setOutput] = useState((toolState?.output as string) ?? '')
  const [error, setError] = useState((toolState?.error as string) ?? '')
  const [isConverting, setIsConverting] = useState(false)

  // Editor settings
  const [theme] = useCodeEditorTheme('basicDark')
  const [wrapText, setWrapText] = useState(true)

  // Hydrate state from toolState after mount

  // Update persistent state
  useEffect(() => {
    updateToolState({ input, output, error })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, output, error])

  // Reset state when tool is cleared

  const handleConvert = async () => {
    if (!input.trim()) {
      setError('Please enter an IP address')
      setOutput('')
      return
    }

    setIsConverting(true)
    setError('')

    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const ipValidation = validateIpAddress(input)
      if (!ipValidation.isValid) {
        throw new Error(ipValidation.error || 'Invalid IP address')
      }

      const autoResult = ipToCidrAuto(input)
      if (!autoResult.isValid) {
        throw new Error(autoResult.error || 'Failed to convert IP to CIDR')
      }

      let result = `IP Address: ${input}\nSuggested CIDR: ${autoResult.cidr}\nNetwork Address: ${autoResult.networkAddress}\nSubnet Mask: ${autoResult.subnetMask}`

      // Get suggestions
      const suggestions = getCidrSuggestions(input)
      if (suggestions.length > 0) {
        result += `\n\n=== Other CIDR Options ===\n${suggestions.map((s) => `  ${s}`).join('\n')}`
      }

      // Analyze the suggested CIDR
      const analysisResult = analyzeNetwork(autoResult.cidr)
      if (analysisResult?.isValid) {
        result += `\n\n=== Network Analysis ===\n`
        result += `Network Class: ${analysisResult.networkClass}\n`
        result += `Total Hosts: ${analysisResult.totalHosts.toLocaleString()}\n`
        result += `Usable Hosts: ${analysisResult.usableHosts.toLocaleString()}\n`
        result += `Wildcard Mask: ${analysisResult.wildcardMask}\n`
        result += `Is Private: ${analysisResult.isPrivate ? 'Yes' : 'No'}\n`
        result += `Is Loopback: ${analysisResult.isLoopback ? 'Yes' : 'No'}`
        if (analysisResult.isMulticast) result += `\nIs Multicast: Yes`
        if (analysisResult.isLinkLocal) result += `\nIs Link Local: Yes`
      }

      setOutput(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during conversion')
      setOutput('')
    } finally {
      setIsConverting(false)
    }
  }

  const handleLoadExample = (value: string) => {
    setInput(value)
    setError('')
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
          IP to CIDR Converter
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Convert an IP address to CIDR notation with network suggestions
        </p>
      </div>

      {/* Body Section */}
      <div className="bg-background flex min-h-0 flex-1 flex-col overflow-y-auto px-[24px] pt-6 pb-10">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Controls */}
          <div className="flex flex-col gap-4">
            {/* Input Row */}
            <div className="flex items-center gap-3">
              <div className="bg-background ring-offset-background focus-within:ring-ring inline-flex h-10 flex-1 items-center rounded-lg border border-neutral-200 py-[9.5px] pr-2 pl-3 text-sm focus-within:ring-2 focus-within:ring-offset-2 dark:border-neutral-700">
                <div className="flex min-w-0 flex-1 items-center gap-3 text-sm leading-normal tracking-[0.07px]">
                  <span className="whitespace-nowrap text-neutral-500 dark:text-neutral-400">IP Address:</span>
                  <input
                    placeholder="e.g., 192.168.1.1"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent font-mono text-neutral-900 outline-hidden dark:text-neutral-100"
                  />
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 px-3 text-xs">
                    Load Examples
                    <ChevronDownIcon className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                  {IP_EXAMPLES.map((example) => (
                    <DropdownMenuItem key={example.value} onClick={() => handleLoadExample(example.value)}>
                      <div className="flex flex-col">
                        <span>{example.label}</span>
                        <span className="text-muted-foreground font-mono text-xs">{example.value}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Button Row */}
            <div className="flex items-center gap-3">
              <Button onClick={handleConvert} disabled={isConverting || !input.trim()} variant="default" size="default">
                {isConverting ? (
                  <>
                    <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  'Convert'
                )}
              </Button>
            </div>
          </div>

          {/* Output Panel */}
          <CodePanel
            fillHeight={true}
            title="Conversion Result"
            value={output}
            language="plaintext"
            height="500px"
            className="flex-1"
            theme={theme}
            wrapText={wrapText}
            onWrapTextChange={setWrapText}
            footerLeftContent={output && <span>{getLineCount(output)} lines</span>}
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
