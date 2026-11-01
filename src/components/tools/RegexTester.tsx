'use client'

import { useToolState } from '@/components/providers/ToolStateProvider'
import { Button } from '@/components/ui/button'
import { CodePanel, type CodeOutputTab } from '@/components/ui/code-panel'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LabeledInput } from '@/components/ui/labeled-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  COMMON_PATTERNS,
  DEFAULT_REGEX_OPTIONS,
  PATTERN_CATEGORIES,
  REGEX_EXAMPLES,
  REGEX_FLAGS,
  REGEX_FLAVORS,
  type CommonPattern,
  type RegexExample,
  type RegexTesterOptions,
} from '@/config/regex-tester-config'
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme'
import type { OnMount } from '@monaco-editor/react'
import {
  analyzeBackreferences,
  deleteTestCase,
  explainRegex,
  exportMatchesToCsv,
  exportMatchesToJson,
  exportMatchesToXml,
  flagsToString,
  formatMatchResults,
  generateJavaScriptCode,
  generateMatchDecorations,
  generateOutputDecorations,
  generatePatternDecorations,
  generatePythonCode,
  loadTestCases,
  saveTestCase,
  testRegex,
  toMonacoDecorations,
  type RegexExplanation,
  type RegexTestResult,
  type TestCase,
} from '@/libs/regex-tester'
import { cn } from '@/libs/utils'
import { ArrowDownTrayIcon, ChevronDownIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

interface RegexTesterProps {
  className?: string
  instanceId: string
}

type MonacoEditorInstance = Parameters<OnMount>[0]
type MonacoInstance = Parameters<OnMount>[1]
type RegexEditorKey = 'testString' | 'pattern' | 'output'

const subscribeToTestCases = (onStoreChange: () => void) => {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener('devpockit:test-cases-change', onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener('devpockit:test-cases-change', onStoreChange)
  }
}
const getTestCasesSnapshot = () => JSON.stringify(loadTestCases())
const getServerTestCasesSnapshot = () => '[]'

export function RegexTester({ className, instanceId }: RegexTesterProps) {
  const { toolState, updateToolState } = useToolState('regex-tester', instanceId)

  // Initialize with defaults to avoid hydration mismatch
  const [options, setOptions] = useState<RegexTesterOptions>(
    (toolState?.options as RegexTesterOptions) ?? DEFAULT_REGEX_OPTIONS
  )
  const [testResult, setTestResult] = useState<RegexTestResult | null>(
    (toolState?.testResult as RegexTestResult) ?? null
  )
  const [error, setError] = useState<string>((toolState?.error as string) ?? '')
  const [activeTab, setActiveTab] = useState<'matches' | 'replace' | 'code' | 'explanation' | 'empty'>(
    (toolState?.activeTab as 'matches' | 'replace' | 'code' | 'explanation' | 'empty' | undefined) ?? 'matches'
  )

  const [explanation, setExplanation] = useState<RegexExplanation | null>(null)
  const testCasesSnapshot = useSyncExternalStore(subscribeToTestCases, getTestCasesSnapshot, getServerTestCasesSnapshot)
  const testCases = useMemo(() => JSON.parse(testCasesSnapshot) as TestCase[], [testCasesSnapshot])
  const [flagsDropdownOpen, setFlagsDropdownOpen] = useState(false)

  // Monaco editor refs - consolidated structure
  const editorRefs = useRef({
    testString: {
      editor: null as MonacoEditorInstance | null,
      monaco: null as MonacoInstance | null,
      decorations: [] as string[],
    },
    pattern: {
      editor: null as MonacoEditorInstance | null,
      monaco: null as MonacoInstance | null,
      decorations: [] as string[],
    },
    output: {
      editor: null as MonacoEditorInstance | null,
      monaco: null as MonacoInstance | null,
      decorations: [] as string[],
    },
  })

  // Editor settings
  const [theme] = useCodeEditorTheme('basicDark')
  const [patternWrapText, setPatternWrapText] = useState(false)
  const [testStringWrapText, setTestStringWrapText] = useState(true)
  const [outputWrapText, setOutputWrapText] = useState(true)

  // Hydrate state from toolState after mount (client-side only)

  // Update persistent state whenever local state changes
  useEffect(() => {
    updateToolState({
      options,
      testResult: testResult || undefined,
      error,
      activeTab,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, testResult, error, activeTab])

  // Reset local state when tool state is cleared

  // Helper to create editor mount handler
  const createEditorMountHandler = useCallback((key: RegexEditorKey) => {
    return (editor: MonacoEditorInstance, monaco: MonacoInstance) => {
      editorRefs.current[key].editor = editor
      editorRefs.current[key].monaco = monaco
    }
  }, [])

  // Apply decorations to test string editor
  useEffect(() => {
    const refs = editorRefs.current.testString
    const editor = refs.editor
    if (!editor || !refs.monaco) return

    const timeoutId = setTimeout(() => {
      try {
        if (!testResult || !testResult.isValid || testResult.matches.length === 0) {
          if (refs.decorations.length > 0) {
            refs.decorations = editor.deltaDecorations(refs.decorations, [])
          }
          return
        }

        const decorations = generateMatchDecorations(testResult.matches, options.testString, options.showGroups)
        const monacoDecorations = toMonacoDecorations(decorations, refs.monaco)
        refs.decorations = editor.deltaDecorations(refs.decorations, monacoDecorations)
      } catch (err) {
        console.warn('Failed to update test string decorations:', err)
      }
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [testResult, options.testString, options.showGroups])

  // Apply decorations to pattern input
  useEffect(() => {
    const refs = editorRefs.current.pattern
    const editor = refs.editor
    if (!editor || !refs.monaco) return

    const timeoutId = setTimeout(() => {
      try {
        const decorations = generatePatternDecorations(options.pattern)
        const monacoDecorations = toMonacoDecorations(decorations, refs.monaco)
        refs.decorations = editor.deltaDecorations(refs.decorations, monacoDecorations)
      } catch (err) {
        console.warn('Failed to update pattern decorations:', err)
      }
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [options.pattern])

  // Apply decorations to output panel
  useEffect(() => {
    const refs = editorRefs.current.output
    const editor = refs.editor
    if (!editor || !refs.monaco) return

    if (activeTab !== 'matches') {
      if (refs.decorations.length > 0) {
        refs.decorations = editor.deltaDecorations(refs.decorations, [])
      }
      return
    }

    if (!testResult || !testResult.isValid || testResult.matches.length === 0) {
      if (refs.decorations.length > 0) {
        refs.decorations = editor.deltaDecorations(refs.decorations, [])
      }
      return
    }

    const timeoutId = setTimeout(() => {
      try {
        const formattedOutput = formatMatchResults(testResult.matches, options.showGroups, options.showPositions)
        const decorations = generateOutputDecorations(testResult.matches, formattedOutput, options.showGroups)
        const monacoDecorations = toMonacoDecorations(decorations, refs.monaco)
        refs.decorations = editor.deltaDecorations(refs.decorations, monacoDecorations)
      } catch (err) {
        console.warn('Failed to update output decorations:', err)
      }
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [testResult, activeTab, options.showGroups, options.showPositions])

  // Update explanation when pattern changes (debounced)
  useEffect(() => {
    if (!options.pattern || !options.pattern.trim()) {
      return
    }

    // Debounce explanation generation
    const timeoutId = setTimeout(() => {
      try {
        const expl = explainRegex(options.pattern, options.flags)
        setExplanation(expl)
      } catch {
        setExplanation(null)
      }
    }, 500) // 500ms debounce for explanation

    return () => clearTimeout(timeoutId)
  }, [options.pattern, options.flags])

  const handleTest = () => {
    if (!options.pattern || !options.pattern.trim()) {
      setError('Pattern cannot be empty')
      setTestResult(null)
      return
    }

    const result = testRegex(options)
    setTestResult(result)

    if (!result.isValid) {
      setError(result.error || 'Invalid regex pattern')
    } else {
      setError('')
    }
  }

  const handleLoadPattern = (pattern: CommonPattern) => {
    setOptions((prev) => ({
      ...prev,
      pattern: pattern.pattern,
      testString: prev.testString || pattern.example,
    }))
    setError('')
    setTestResult(null)
  }

  const handleLoadExample = (example?: RegexExample) => {
    const exampleToLoad = example || REGEX_EXAMPLES[0]
    setOptions((prev) => ({
      ...prev,
      pattern: exampleToLoad.pattern,
      testString: exampleToLoad.testString,
      replaceString: exampleToLoad.replaceString || '',
      flags: exampleToLoad.flags ? { ...prev.flags, ...exampleToLoad.flags } : prev.flags,
    }))
    setError('')
    setTestResult(null)
  }

  const handleSaveTestCase = useCallback(() => {
    if (!options.pattern || !options.pattern.trim()) {
      setError('Pattern is required to save test case')
      return
    }

    const name = prompt('Enter a name for this test case:')
    if (!name) return

    saveTestCase({
      name,
      pattern: options.pattern,
      testString: options.testString,
      flags: options.flags,
      replaceString: options.replaceString || undefined,
      expectedMatchCount: testResult?.matchCount,
    })

    window.dispatchEvent(new Event('devpockit:test-cases-change'))
    alert('Test case saved!')
  }, [options, testResult])

  const handleLoadTestCase = useCallback((testCase: TestCase) => {
    setOptions((prev) => ({
      ...prev,
      pattern: testCase.pattern,
      testString: testCase.testString,
      flags: testCase.flags,
      replaceString: testCase.replaceString || '',
    }))
    setError('')
    setTestResult(null)
  }, [])

  const handleDeleteTestCase = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this test case?')) {
      deleteTestCase(id)
      window.dispatchEvent(new Event('devpockit:test-cases-change'))
    }
  }, [])

  const handleExport = useCallback(
    (format: 'json' | 'csv' | 'xml') => {
      if (!testResult || !testResult.isValid || testResult.matches.length === 0) {
        setError('No matches to export')
        return
      }

      let content = ''
      let filename = ''
      let mimeType = ''

      switch (format) {
        case 'json':
          content = exportMatchesToJson(testResult.matches)
          filename = 'regex-matches.json'
          mimeType = 'application/json'
          break
        case 'csv':
          content = exportMatchesToCsv(testResult.matches)
          filename = 'regex-matches.csv'
          mimeType = 'text/csv'
          break
        case 'xml':
          content = exportMatchesToXml(testResult.matches)
          filename = 'regex-matches.xml'
          mimeType = 'application/xml'
          break
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    [testResult]
  )

  // Analyze backreferences in replace string
  const backreferences = useMemo(() => {
    if (!options.replaceString) return []
    return analyzeBackreferences(options.replaceString)
  }, [options.replaceString])

  // Prepare tabs for CodePanel - always return at least one tab to keep panel visible
  const outputTabs: CodeOutputTab[] = useMemo(() => {
    const tabs: CodeOutputTab[] = []

    if (testResult && testResult.isValid) {
      tabs.push({
        id: 'matches',
        label: 'Matches',
        value: formatMatchResults(testResult.matches, options.showGroups, options.showPositions),
        language: 'plaintext',
      })

      if (testResult.replacedText !== undefined) {
        tabs.push({
          id: 'replace',
          label: 'Replace Preview',
          value: testResult.replacedText,
          language: 'plaintext',
        })
      }

      // Code generation
      if (options.flavor === 'javascript') {
        tabs.push({
          id: 'code',
          label: 'JavaScript Code',
          value: generateJavaScriptCode(options),
          language: 'javascript',
        })
      } else {
        tabs.push({
          id: 'code',
          label: 'Python Code',
          value: generatePythonCode(options),
          language: 'python',
        })
      }
    }

    // Explanation tab
    if (explanation && explanation.pattern === options.pattern) {
      let explanationText = `Pattern: ${explanation.pattern}\n\n`
      explanationText += `Explanation: ${explanation.explanation}\n\n`

      if (explanation.components.length > 0) {
        explanationText += 'Components:\n'
        explanation.components.forEach((comp, idx) => {
          explanationText += `  ${idx + 1}. ${comp.part} - ${comp.description}\n`
          if (comp.example) {
            explanationText += `     Example: ${comp.example}\n`
          }
        })
        explanationText += '\n'
      }

      if (explanation.warnings.length > 0) {
        explanationText += 'Warnings:\n'
        explanation.warnings.forEach((warning) => {
          explanationText += `  ⚠ ${warning}\n`
        })
      }

      tabs.push({
        id: 'explanation',
        label: 'Explanation',
        value: explanationText,
        language: 'plaintext',
      })
    }

    // Always return at least one tab to keep panel visible
    if (tabs.length === 0) {
      tabs.push({
        id: 'empty',
        label: 'Output',
        value: 'Test results will appear here...',
        language: 'plaintext',
      })
    }

    return tabs
  }, [testResult, options, explanation])

  const selectedOutputTab = outputTabs.find((tab) => tab.id === activeTab)?.id ?? outputTabs[0]?.id ?? activeTab

  // Group patterns by category
  const patternsByCategory = useMemo(() => {
    const grouped: Record<string, CommonPattern[]> = {}
    COMMON_PATTERNS.forEach((pattern) => {
      if (!grouped[pattern.category]) {
        grouped[pattern.category] = []
      }
      grouped[pattern.category].push(pattern)
    })
    return grouped
  }, [])

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header Section */}
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="mb-3 text-[32px] leading-6 font-normal tracking-normal text-neutral-900 dark:text-neutral-100">
          Regex Tester
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Test and debug regular expressions with real-time matching, group extraction, and code generation.
        </p>
      </div>

      {/* Body Section */}
      <div className="bg-background flex min-h-0 flex-1 flex-col overflow-y-auto px-[24px] pt-6 pb-10">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Controls */}
          <div className="flex flex-col gap-4">
            {/* Main Controls Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Flavor Selection */}
              <Select
                value={options.flavor}
                onValueChange={(value) => setOptions((prev) => ({ ...prev, flavor: value as typeof options.flavor }))}
              >
                <SelectTrigger label="Flavor:" className="min-w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGEX_FLAVORS.map((flavor) => (
                    <SelectItem key={flavor.value} value={flavor.value}>
                      {flavor.symbol} {flavor.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Flags Dropdown */}
              <DropdownMenu open={flagsDropdownOpen} onOpenChange={setFlagsDropdownOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="bg-background inline-flex h-10 min-w-[200px] items-center justify-between rounded-lg border border-neutral-200 py-[9.5px] pr-2 pl-3 text-sm focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700">
                    <div className="flex min-w-0 flex-1 items-end text-sm leading-normal tracking-[0.07px]">
                      <span className="whitespace-nowrap text-neutral-500 dark:text-neutral-400">Flags:</span>
                      <span className="ml-2 truncate text-neutral-900 dark:text-neutral-100">
                        {flagsToString(options.flags) || 'None'}
                      </span>
                    </div>
                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80" onCloseAutoFocus={(e) => e.preventDefault()}>
                  <DropdownMenuLabel>REGEX FLAGS</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {REGEX_FLAGS.map((flag) => (
                    <DropdownMenuCheckboxItem
                      key={flag.key}
                      checked={options.flags[flag.key]}
                      onCheckedChange={(checked) => {
                        setOptions((prev) => {
                          const newFlags = { ...prev.flags, [flag.key]: checked }

                          // Unicode and vnicode (unicodeSets) are mutually exclusive
                          if (flag.key === 'unicode' && checked) {
                            newFlags.unicodeSets = false
                          } else if (flag.key === 'unicodeSets' && checked) {
                            newFlags.unicode = false
                          }

                          return {
                            ...prev,
                            flags: newFlags,
                          }
                        })
                      }}
                      onSelect={(e) => {
                        e.preventDefault()
                      }}
                    >
                      <div className="flex flex-1 items-center gap-2">
                        <span className="min-w-[20px] font-mono text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          {flag.char}
                        </span>
                        <div className="flex flex-1 flex-col">
                          <span className="text-sm">{flag.label}</span>
                          <span className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                            {flag.description}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Display Options Toggles */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={options.showGroups}
                    onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, showGroups: checked }))}
                    size="sm"
                  />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Show groups</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={options.showPositions}
                    onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, showPositions: checked }))}
                    size="sm"
                  />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Show positions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pattern Input Panel */}
          <CodePanel
            fillHeight={true}
            title="Pattern"
            value={options.pattern}
            onChange={(value) => setOptions((prev) => ({ ...prev, pattern: value }))}
            language="plaintext"
            height="35px"
            theme={theme}
            wrapText={patternWrapText}
            onWrapTextChange={setPatternWrapText}
            placeholder="Enter regex pattern (e.g., \\b\\w+@\\w+\\.\\w+\\b)"
            showClearButton={true}
            showWrapToggle={false}
            singleLine={true}
            onEditorMount={createEditorMountHandler('pattern')}
            headerActions={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                    Common Patterns
                    <ChevronDownIcon className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-[400px] overflow-y-auto">
                  {PATTERN_CATEGORIES.map((category) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        {category}
                      </div>
                      {patternsByCategory[category]?.map((pattern, index) => (
                        <DropdownMenuItem
                          key={`${category}-${index}`}
                          onClick={() => handleLoadPattern(pattern)}
                          className="flex flex-col items-start gap-1"
                        >
                          <span className="font-medium">{pattern.name}</span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">{pattern.description}</span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />

          {/* Replace String Input (Optional) */}
          <div className="w-full space-y-2">
            <LabeledInput
              label="Replace String (optional):"
              value={options.replaceString}
              onChange={(value) => setOptions((prev) => ({ ...prev, replaceString: value }))}
              placeholder="Enter replacement string (use $1, $2 for groups)"
              containerClassName="w-full"
            />
            {backreferences.length > 0 && (
              <div className="ml-2 text-xs text-neutral-600 dark:text-neutral-400">
                Backreferences:{' '}
                {backreferences.map((b, i) => (
                  <span key={i} className="mr-1 inline-block rounded bg-blue-100 px-1.5 py-0.5 dark:bg-blue-900/30">
                    {b.backref} → {b.description}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Test String and Output Panels Side by Side */}
          <div className="flex min-h-0 flex-1 gap-4">
            {/* Test String Input Panel */}
            <div className="flex flex-1 flex-col">
              <CodePanel
                fillHeight={true}
                title="Test String"
                value={options.testString}
                onChange={(value) => setOptions((prev) => ({ ...prev, testString: value }))}
                language="plaintext"
                height="400px"
                className="flex-1"
                theme={theme}
                wrapText={testStringWrapText}
                onWrapTextChange={setTestStringWrapText}
                placeholder="Enter text to test against the pattern"
                showClearButton={true}
                onEditorMount={createEditorMountHandler('testString')}
                headerActions={
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                          Load Example
                          <ChevronDownIcon className="ml-1 h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="max-h-[400px] w-[300px] overflow-y-auto">
                        {REGEX_EXAMPLES.map((example, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={() => handleLoadExample(example)}
                            className="flex flex-col items-start gap-1"
                          >
                            <span className="font-medium">{example.name}</span>
                            {example.description && (
                              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                {example.description}
                              </span>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                          Test Cases ({testCases.length})
                          <ChevronDownIcon className="ml-1 h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="max-h-[400px] w-[400px] overflow-y-auto">
                        <DropdownMenuLabel>Saved Test Cases</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {testCases.length === 0 ? (
                          <div className="px-2 py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                            No test cases saved yet.
                          </div>
                        ) : (
                          testCases.map((testCase) => (
                            <div key={testCase.id} className="px-2 py-1">
                              <div className="flex items-center justify-between gap-2 rounded border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-700 dark:bg-neutral-900">
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-medium">{testCase.name}</div>
                                  <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                                    Pattern: {testCase.pattern.substring(0, 40)}
                                    {testCase.pattern.length > 40 ? '...' : ''}
                                  </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => handleLoadTestCase(testCase)}
                                  >
                                    Load
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                                    onClick={() => handleDeleteTestCase(testCase.id)}
                                  >
                                    <TrashIcon className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={handleSaveTestCase}
                      disabled={!options.pattern || !options.pattern.trim()}
                    >
                      <PlusIcon className="mr-1 h-3 w-3" />
                      Save
                    </Button>
                  </div>
                }
                footerRightContent={
                  <Button
                    onClick={handleTest}
                    variant="default"
                    size="sm"
                    disabled={!options.pattern || !options.pattern.trim()}
                  >
                    Test
                  </Button>
                }
              />
            </div>

            {/* Output Panel */}
            <div className="flex flex-1 flex-col">
              <CodePanel
                fillHeight={true}
                tabs={outputTabs}
                activeTab={selectedOutputTab}
                onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
                height="400px"
                className="flex-1"
                theme={theme}
                readOnly={true}
                wrapText={outputWrapText}
                onWrapTextChange={setOutputWrapText}
                onEditorMount={createEditorMountHandler('output')}
                headerActions={
                  testResult &&
                  testResult.isValid &&
                  testResult.matches.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                          <ArrowDownTrayIcon className="mr-1 h-3 w-3" />
                          Export
                          <ChevronDownIcon className="ml-1 h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExport('json')}>Export as JSON</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('csv')}>Export as CSV</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('xml')}>Export as XML</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                }
                footerLeftContent={
                  testResult &&
                  testResult.isValid && (
                    <>
                      <span>
                        {testResult.matchCount} match{testResult.matchCount === 1 ? '' : 'es'}
                      </span>
                      {testResult.executionTime && <span>{testResult.executionTime.toFixed(2)}ms</span>}
                      {testResult.flagsString && <span>Flags: {testResult.flagsString || 'none'}</span>}
                    </>
                  )
                }
              />
            </div>
          </div>

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
