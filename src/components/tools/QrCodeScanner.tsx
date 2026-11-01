'use client'

import { useToolState } from '@/components/providers/ToolStateProvider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CodePanel } from '@/components/ui/code-panel'
import { CameraManager } from '@/libs/qr-code-decoder'
import { cn } from '@/libs/utils'
import { QrDecoderOptions, QrDecoderResult } from '@/types/qr-decoder'
import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle,
  Copy,
  Download,
  Flashlight,
  FlashlightOff,
  Loader2,
  RotateCcw,
  Share,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { QR_SCANNER_CONFIG } from '../../config/qr-code-scanner-config'

interface QrCodeScannerProps {
  className?: string
  instanceId: string
  onResult?: (result: QrDecoderResult) => void
  onError?: (error: string) => void
}

type CameraStatus = ReturnType<CameraManager['getCameraStatus']> & {
  facingMode?: string
  width?: number
  height?: number
}

export function QrCodeScanner({ className, instanceId, onResult, onError }: QrCodeScannerProps) {
  const { toolState, updateToolState } = useToolState('qr-code-scanner', instanceId)

  // State management
  const [isScanning, setIsScanning] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [results, setResults] = useState<QrDecoderResult[]>(
    () => (toolState?.results as QrDecoderResult[] | undefined) ?? []
  )
  const [error, setError] = useState<string | null>(() => (toolState?.error as string | undefined) ?? null)
  const [state, setState] = useState<string>(() => (toolState?.state as string | undefined) ?? 'idle')
  const [options] = useState<QrDecoderOptions>(
    () => (toolState?.options as QrDecoderOptions | undefined) ?? QR_SCANNER_CONFIG.DEFAULT_OPTIONS
  )

  // Camera state
  const [currentCamera, setCurrentCamera] = useState<string>('environment')
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [cameraStatus, setCameraStatus] = useState<CameraStatus | null>(null)

  // UI state
  const [showParsedData] = useState(true)

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const cameraManagerRef = useRef<CameraManager | null>(null)
  const prevStateRef = useRef<string | null>(null)

  // Tool state management
  // Initialize camera manager
  useEffect(() => {
    if (!cameraManagerRef.current) {
      cameraManagerRef.current = new CameraManager()
    }
    return () => {
      if (cameraManagerRef.current) {
        cameraManagerRef.current.cleanup()
      }
    }
  }, [])

  // Update tool state when state changes
  useEffect(() => {
    const currentState = { options, results, error: error || undefined, state }
    const serializedState = JSON.stringify(currentState)

    if (prevStateRef.current !== serializedState) {
      updateToolState(currentState)
      prevStateRef.current = serializedState
    }
  }, [options, results, error, state, updateToolState])

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    if (!videoRef.current) {
      setError('Video element not available')
      return
    }

    setState('camera initializing')
    setError(null)

    try {
      const cameraManager = cameraManagerRef.current!
      const result = await cameraManager.initializeCamera(videoRef.current, {
        video: {
          facingMode: currentCamera,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      if (result.success) {
        setIsCameraActive(true)
        setState('idle')

        const flashStatus = await cameraManager.getFlashStatus()
        setIsFlashOn(flashStatus.isOn || false)

        const status = await cameraManager.getCameraStatus()
        setCameraStatus(status)
      } else {
        setError(result.error || 'Failed to initialize camera')
        setState('error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Camera initialization failed')
      setState('error')
    }
  }, [currentCamera])

  // Start scanning
  const startScanning = useCallback(async () => {
    if (!cameraManagerRef.current || !isCameraActive) {
      setError('Camera not initialized')
      return
    }

    setState('scanning')
    setError(null)

    try {
      const cameraManager = cameraManagerRef.current
      await cameraManager.startScanning(
        (result: QrDecoderResult) => {
          setResults([result])
          setState('qr detected')
          onResult?.(result)

          setIsScanning(false)
          if (cameraManagerRef.current) {
            cameraManagerRef.current.stopScanning()
          }
        },
        (error: string) => {
          setError(error)
          setState('error')
          onError?.(error)
        },
        {
          scanIntervalMs: 100,
          maxResults: 1,
          qualityThreshold: 0.5,
          enableMultipleDetection: false,
        }
      )

      setIsScanning(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start scanning')
      setState('error')
    }
  }, [isCameraActive, onResult, onError])

  // Stop scanning only (keep camera active)
  const stopScanningOnly = useCallback(async () => {
    if (cameraManagerRef.current) {
      await cameraManagerRef.current.stopScanning()
    }
    setIsScanning(false)
    setState('camera ready')
  }, [])

  // Stop camera completely
  const stopCamera = useCallback(async () => {
    if (cameraManagerRef.current) {
      await cameraManagerRef.current.stopScanning()
      await cameraManagerRef.current.cleanup()
    }
    setIsScanning(false)
    setIsCameraActive(false)
    setState('idle')
  }, [])

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (!cameraManagerRef.current || !isCameraActive) return

    try {
      await cameraManagerRef.current.stopScanning()
      await cameraManagerRef.current.cleanup()

      const newFacingMode = currentCamera === 'environment' ? 'user' : 'environment'
      setCurrentCamera(newFacingMode)

      const result = await cameraManagerRef.current.initializeCamera(videoRef.current!, {
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      if (result.success) {
        const status = await cameraManagerRef.current.getCameraStatus()
        setCameraStatus(status)

        if (isScanning) {
          await cameraManagerRef.current.startScanning(
            (result) => {
              setResults([result])
              setIsScanning(false)
              setState('qr detected')
            },
            (error) => {
              setError(error)
              setState('error')
            },
            {
              scanIntervalMs: 100,
              maxResults: 1,
              qualityThreshold: 0.5,
              enableMultipleDetection: false,
            }
          )
          setIsScanning(true)
          setState('scanning')
        }
      } else {
        setError(result.error || 'Failed to switch camera')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch camera')
    }
  }, [currentCamera, isCameraActive, isScanning])

  // Toggle flash
  const toggleFlash = useCallback(async () => {
    if (!cameraManagerRef.current) return

    try {
      const result = await cameraManagerRef.current.toggleFlash()
      setIsFlashOn(result.isFlashOn || false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle flash')
    }
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

  // Clear results
  const clearResults = useCallback(() => {
    setResults([])
  }, [])

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header Section */}
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="mb-3 text-[32px] leading-6 font-normal tracking-normal text-neutral-900 dark:text-neutral-100">
          QR Code Scanner
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Scan QR codes using your device camera with real-time detection
        </p>
      </div>

      {/* Body Section */}
      <div className="bg-background flex min-h-0 flex-1 flex-col overflow-y-auto px-[24px] pt-6 pb-10">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Main Content - Side by Side */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Input Panel - Camera */}
            <CodePanel
              fillHeight={true}
              title="Camera Scanner"
              height="600px"
              showCopyButton={false}
              showWrapToggle={false}
              headerActions={
                isCameraActive && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={switchCamera}
                      className="rounded p-1 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      <RotateCcw className="h-4 w-4 text-neutral-900 dark:text-neutral-300" />
                    </button>
                    <button
                      onClick={toggleFlash}
                      className="rounded p-1 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      {isFlashOn ? (
                        <FlashlightOff className="h-4 w-4 text-neutral-900 dark:text-neutral-300" />
                      ) : (
                        <Flashlight className="h-4 w-4 text-neutral-900 dark:text-neutral-300" />
                      )}
                    </button>
                    <button
                      onClick={stopCamera}
                      className="rounded p-1 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      <CameraOff className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                )
              }
              footerRightContent={
                !isCameraActive ? (
                  <Button
                    onClick={initializeCamera}
                    size="sm"
                    className="h-8 px-4"
                    disabled={state === 'camera initializing'}
                  >
                    {state === 'camera initializing' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Start Camera
                      </>
                    )}
                  </Button>
                ) : !isScanning ? (
                  <Button onClick={startScanning} size="sm" className="h-8 px-4">
                    <Camera className="mr-2 h-4 w-4" />
                    Start Scanning
                  </Button>
                ) : (
                  <Button onClick={stopScanningOnly} variant="destructive" size="sm" className="h-8 px-4">
                    <CameraOff className="mr-2 h-4 w-4" />
                    Stop Scanning
                  </Button>
                )
              }
            >
              <div className="flex h-full flex-col">
                {/* Camera Video */}
                <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-black">
                  <video
                    ref={videoRef}
                    className={`h-full w-full object-contain ${!isCameraActive ? 'hidden' : ''}`}
                    playsInline
                    muted
                  />
                  {!isCameraActive && (
                    <div className="space-y-4 text-center">
                      <Camera className="mx-auto h-12 w-12 text-white/50" />
                      <p className="text-sm text-white/70">Camera not active</p>
                      {state === 'camera initializing' && (
                        <div className="flex items-center justify-center gap-2 text-white/70">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Initializing...</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scanning Overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 animate-pulse rounded-lg border-4 border-green-500">
                      <div className="absolute top-2 right-2 left-2 rounded bg-green-500 px-2 py-1 text-xs font-medium text-white">
                        Scanning for QR codes...
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera Info */}
                {cameraStatus && isCameraActive && (
                  <div className="text-muted-foreground mt-2 flex gap-4 text-xs">
                    <span>{cameraStatus.facingMode === 'environment' ? 'Back' : 'Front'} Camera</span>
                    <span>
                      {cameraStatus.width}x{cameraStatus.height}
                    </span>
                  </div>
                )}
              </div>
            </CodePanel>

            {/* Output Panel - Results */}
            <CodePanel
              fillHeight={true}
              title="Scan Result"
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

                      {showParsedData && (
                        <div className="text-muted-foreground space-y-1 text-sm">
                          <div className="flex gap-4">
                            <span>Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                            <span>
                              Position: {result.position.x}, {result.position.y}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground flex h-full flex-col items-center justify-center text-sm">
                  <Camera className="mb-4 h-12 w-12 opacity-50" />
                  Scanned QR content will appear here
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
