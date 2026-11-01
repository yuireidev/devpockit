'use client'

import { useToolState } from '@/components/providers/ToolStateProvider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CodePanel } from '@/components/ui/code-panel'
import { DEFAULT_QR_DECODER_OPTIONS } from '@/config/qr-code-decoder-config'
import { decodeQrFromImage, getErrorMessage, validateImageFile } from '@/libs/qr-code-decoder'
import { cn } from '@/libs/utils'
import { QrDecoderOptions, QrDecoderResult } from '@/types/qr-decoder'
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  FileImage,
  Loader2,
  Share,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

interface QrCodeDecoderProps {
  className?: string
  instanceId: string
  onResult?: (result: QrDecoderResult) => void
  onError?: (error: string) => void
}

export function QrCodeDecoder({ className, instanceId, onResult, onError }: QrCodeDecoderProps) {
  const { toolState, updateToolState } = useToolState('qr-code-decoder', instanceId)

  // State management
  const [files, setFiles] = useState<File[]>([])
  const [results, setResults] = useState<QrDecoderResult[]>(
    () => (toolState?.results as QrDecoderResult[] | undefined) ?? []
  )
  const [error, setError] = useState<string | null>(() => (toolState?.error as string | undefined) ?? null)
  const [state, setState] = useState<string>(() => (toolState?.state as string | undefined) ?? 'idle')
  const [options] = useState<QrDecoderOptions>(
    () => (toolState?.options as QrDecoderOptions | undefined) ?? DEFAULT_QR_DECODER_OPTIONS
  )

  // UI state
  const [isProcessing, setIsProcessing] = useState(false)
  const [displayedImage, setDisplayedImage] = useState<string | null>(null)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const prevStateRef = useRef<string | null>(null)
  const displayedImageRef = useRef<string | null>(null)
  const filesRef = useRef<File[]>([])
  const onResultRef = useRef<((result: QrDecoderResult) => void) | undefined>(undefined)
  const onErrorRef = useRef<((error: string) => void) | undefined>(undefined)

  // Update refs when props change
  useEffect(() => {
    onResultRef.current = onResult
    onErrorRef.current = onError
  }, [onResult, onError])

  // Update tool state when state changes
  useEffect(() => {
    const currentState = { options, results, error: error || undefined, state }
    const serializedState = JSON.stringify(currentState)

    if (prevStateRef.current !== serializedState) {
      updateToolState(currentState)
      prevStateRef.current = serializedState
    }
  }, [options, results, error, state, updateToolState])

  // Cleanup displayed image on unmount
  useEffect(() => {
    return () => {
      if (displayedImageRef.current) {
        URL.revokeObjectURL(displayedImageRef.current)
      }
    }
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const file = selectedFiles[0]
    const validation = validateImageFile(file)

    if (validation.isValid) {
      filesRef.current = [file]
      setFiles([file])
      setError(null)
    } else {
      setError(`${file.name}: ${validation.error}`)
    }
  }, [])

  // Process files
  const processFiles = useCallback(async () => {
    if (filesRef.current.length === 0) {
      setError('No file selected')
      return
    }

    setIsProcessing(true)
    setState('file processing')
    setError(null)

    try {
      const file = filesRef.current[0]
      const imageUrl = URL.createObjectURL(file)

      if (displayedImageRef.current) {
        URL.revokeObjectURL(displayedImageRef.current)
      }

      displayedImageRef.current = imageUrl
      setDisplayedImage(imageUrl)

      const results = await decodeQrFromImage(file)

      if (results && results.length > 0) {
        setResults(results)
        setState('qr detected')
        results.forEach((result) => onResultRef.current?.(result))
      } else {
        setError('No QR codes found in the uploaded image')
        setState('error')
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err as Error))
      setState('error')
      onErrorRef.current?.(getErrorMessage(err as Error))
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Remove file
  const removeFile = useCallback((index: number) => {
    const newFiles = filesRef.current.filter((_, i) => i !== index)
    filesRef.current = newFiles
    setFiles(newFiles)
  }, [])

  // Clear all files
  const clearFiles = useCallback(() => {
    if (displayedImageRef.current) {
      URL.revokeObjectURL(displayedImageRef.current)
      displayedImageRef.current = null
      setDisplayedImage(null)
    }
    filesRef.current = []
    setFiles([])
    setResults([])
  }, [])

  // Clear results
  const clearResults = useCallback(() => {
    setResults([])
  }, [])

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }, [])

  // Share results
  const shareResults = useCallback(
    async (result: QrDecoderResult) => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'QR Code Result',
            text: result.data,
            url: result.format === 'url' ? result.data : undefined,
          })
        } catch {
          // User cancelled or error
        }
      } else {
        await copyToClipboard(result.data)
      }
    },
    [copyToClipboard]
  )

  // Export results
  const exportResults = useCallback(
    (format: 'json' | 'csv' | 'txt') => {
      const data = results
      let content = ''
      let filename = ''

      switch (format) {
        case 'json':
          content = JSON.stringify(data, null, 2)
          filename = 'qr-results.json'
          break
        case 'csv':
          const headers = ['ID', 'Format', 'Data', 'Timestamp']
          const rows = data.map((r) => [r.id, r.format, r.data, new Date(r.timestamp).toISOString()])
          content = [headers, ...rows].map((row) => row.join(',')).join('\n')
          filename = 'qr-results.csv'
          break
        case 'txt':
          content = data.map((r) => `${r.format}: ${r.data}`).join('\n')
          filename = 'qr-results.txt'
          break
      }

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },
    [results]
  )

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header Section */}
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="mb-3 text-[32px] leading-6 font-normal tracking-normal text-neutral-900 dark:text-neutral-100">
          QR Code Decoder
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Upload an image containing a QR code to decode it with support for multiple formats
        </p>
      </div>

      {/* Body Section */}
      <div className="bg-background flex min-h-0 flex-1 flex-col overflow-y-auto px-[24px] pt-6 pb-10">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Main Content - Side by Side */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Input Panel - Upload */}
            <CodePanel
              fillHeight={true}
              title="Upload Image"
              height="600px"
              showCopyButton={false}
              showWrapToggle={false}
              headerActions={
                files.length > 0 && (
                  <button
                    onClick={clearFiles}
                    className="rounded p-1 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  >
                    <Trash2 className="h-4 w-4 text-neutral-900 dark:text-neutral-300" />
                  </button>
                )
              }
              footerRightContent={
                <Button
                  onClick={processFiles}
                  disabled={isProcessing || files.length === 0}
                  size="sm"
                  className="h-8 px-4"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Decoding...
                    </>
                  ) : (
                    'Decode'
                  )}
                </Button>
              }
            >
              {/* Drop Zone */}
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDrop={handleDrop}
                className="border-muted-foreground/25 hover:border-muted-foreground/50 flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors"
              >
                {files.length === 0 ? (
                  <>
                    <FileImage className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <p className="mb-2 text-sm font-medium">Drop an image here or click to select</p>
                    <p className="text-muted-foreground mb-4 text-xs">Supports JPG, PNG, GIF, WebP (max 10MB)</p>
                    <Button onClick={() => fileInputRef.current?.click()} size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Select File
                    </Button>
                  </>
                ) : (
                  <div className="w-full space-y-4">
                    {displayedImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={displayedImage}
                        alt="Uploaded QR code"
                        className="mx-auto h-auto max-h-48 max-w-full rounded-lg border object-contain"
                      />
                    ) : (
                      <FileImage className="text-muted-foreground mx-auto h-16 w-16" />
                    )}
                    <div className="flex items-center justify-center gap-2">
                      <FileImage className="h-4 w-4" />
                      <span className="text-sm">{files[0].name}</span>
                      <Badge variant="outline">{(files[0].size / 1024 / 1024).toFixed(1)} MB</Badge>
                      <button
                        onClick={() => removeFile(0)}
                        className="rounded p-1 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      >
                        <XCircle className="h-4 w-4 text-neutral-900 dark:text-neutral-300" />
                      </button>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>
            </CodePanel>

            {/* Output Panel - Results */}
            <CodePanel
              fillHeight={true}
              title="Decoded Result"
              height="600px"
              showCopyButton={false}
              showWrapToggle={false}
              headerActions={
                results.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(results[0].data)}
                      className="rounded p-1 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      <Copy className="h-4 w-4 text-neutral-900 dark:text-neutral-300" />
                    </button>
                    <button
                      onClick={clearResults}
                      className="rounded p-1 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      <Trash2 className="h-4 w-4 text-neutral-900 dark:text-neutral-300" />
                    </button>
                  </div>
                )
              }
              footerRightContent={
                results.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button onClick={() => exportResults('json')} variant="outline" size="sm" className="h-8">
                      <Download className="mr-2 h-4 w-4" />
                      Export JSON
                    </Button>
                    <Button onClick={() => shareResults(results[0])} variant="outline" size="sm" className="h-8">
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                )
              }
              alwaysShowFooter={true}
            >
              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((result) => (
                    <div key={result.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Badge variant="outline">{result.format}</Badge>
                        <span className="text-muted-foreground text-xs">
                          {new Date(result.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-muted rounded p-3 font-mono text-sm break-all">{result.data}</div>

                      <div className="text-muted-foreground space-y-1 text-sm">
                        <div className="flex gap-4">
                          <span>Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                          <span>
                            Position: {result.position.x}, {result.position.y}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground flex h-full flex-col items-center justify-center text-sm">
                  <FileImage className="mb-4 h-12 w-12 opacity-50" />
                  Decoded QR content will appear here
                </div>
              )}
            </CodePanel>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
