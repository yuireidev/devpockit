'use client'

import { useToolState } from '@/components/providers/ToolStateProvider'
import { Button } from '@/components/ui/button'
import { CodePanel, type CodeOutputTab } from '@/components/ui/code-panel'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SecretInput } from '@/components/ui/secret-input'
import { JWT_EXAMPLE_TOKENS } from '@/config/jwt-decoder-config'
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme'
import { decodeJwt, formatTimeRemaining, verifyJwtSignature, type JwtDecodeResult } from '@/libs/jwt-decoder'
import { cn } from '@/libs/utils'
import { ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useEffect, useMemo, useState } from 'react'

interface JwtDecoderProps {
  className?: string
  instanceId: string
}

export function JwtDecoder({ className, instanceId }: JwtDecoderProps) {
  const { toolState, updateToolState } = useToolState('jwt-decoder', instanceId)

  // Initialize with defaults to avoid hydration mismatch
  const [token, setToken] = useState<string>((toolState?.token as string) ?? '')
  const [secret, setSecret] = useState<string>((toolState?.secret as string) ?? '')
  const [decodedResult, setDecodedResult] = useState<JwtDecodeResult | null>(
    (toolState?.decodedResult as JwtDecodeResult) ?? null
  )
  const [isDecoding, setIsDecoding] = useState(false)
  const [error, setError] = useState<string>((toolState?.error as string) ?? '')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{ isValid: boolean; error?: string } | null>(
    (toolState?.verificationResult as { isValid: boolean; error?: string } | undefined) ?? null
  )
  const [activeTab, setActiveTab] = useState<'header' | 'payload' | 'signature' | 'raw'>(
    (toolState?.activeTab as 'header' | 'payload' | 'signature' | 'raw' | undefined) ?? 'header'
  )

  // Editor settings
  const [theme] = useCodeEditorTheme('basicDark')
  const [inputWrapText, setInputWrapText] = useState(true)
  const [outputWrapText, setOutputWrapText] = useState(true)

  // Hydrate state from toolState after mount (client-side only)

  // Update persistent state whenever local state changes
  useEffect(() => {
    updateToolState({
      token,
      secret,
      decodedResult: decodedResult || undefined,
      error,
      verificationResult: verificationResult || undefined,
      activeTab,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, secret, decodedResult, error, verificationResult, activeTab])

  // Reset local state when tool state is cleared

  const handleDecode = async () => {
    if (!token.trim()) {
      setError('Please enter a JWT token')
      return
    }

    setIsDecoding(true)
    setError('')
    setVerificationResult(null)

    try {
      // Simulate async operation for better UX
      await new Promise((resolve) => setTimeout(resolve, 300))

      const result = decodeJwt(token.trim())
      setDecodedResult(result)

      if (!result.isValid) {
        setError(result.error || 'Failed to decode JWT')
      } else {
        setError('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decode JWT')
      setDecodedResult(null)
    } finally {
      setIsDecoding(false)
    }
  }

  const handleVerify = async () => {
    if (!token.trim() || !secret.trim()) {
      setError('Token and secret are required for verification')
      return
    }

    if (!decodedResult || !decodedResult.isValid) {
      setError('Please decode the token first')
      return
    }

    const algorithm = decodedResult.header.alg as string
    if (!['HS256', 'HS384', 'HS512'].includes(algorithm)) {
      setError(`Signature verification is only supported for HS256, HS384, and HS512. This token uses ${algorithm}.`)
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      const result = await verifyJwtSignature(token.trim(), secret.trim(), algorithm as 'HS256' | 'HS384' | 'HS512')
      setVerificationResult(result)
      if (!result.isValid) {
        setError(result.error || 'Signature verification failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify signature')
      setVerificationResult({ isValid: false, error: err instanceof Error ? err.message : 'Verification error' })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleLoadExample = (exampleKey: keyof typeof JWT_EXAMPLE_TOKENS.valid) => {
    const example = JWT_EXAMPLE_TOKENS.valid[exampleKey]
    setToken(example)
    setError('')
    setDecodedResult(null)
    setVerificationResult(null)
  }

  // Prepare tabs for CodePanel
  const outputTabs: CodeOutputTab[] = useMemo(() => {
    if (!decodedResult || !decodedResult.isValid) {
      return []
    }

    return [
      {
        id: 'header',
        label: 'Header',
        value: JSON.stringify(decodedResult.header, null, 2),
        language: 'json',
      },
      {
        id: 'payload',
        label: 'Payload',
        value: JSON.stringify(decodedResult.payload, null, 2),
        language: 'json',
      },
      {
        id: 'signature',
        label: 'Signature',
        value: decodedResult.signature,
        language: 'plaintext',
      },
      {
        id: 'raw',
        label: 'Raw Token',
        value: decodedResult.rawToken,
        language: 'plaintext',
      },
    ]
  }, [decodedResult])

  const getStatusBadge = () => {
    if (!decodedResult || !decodedResult.isValid) return null

    if (decodedResult.isExpired) {
      return (
        <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Expired
        </span>
      )
    }

    if (decodedResult.expiresAt) {
      return (
        <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-300">
          Valid ({decodedResult.timeRemaining ? formatTimeRemaining(decodedResult.timeRemaining) : 'N/A'} remaining)
        </span>
      )
    }

    return (
      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
        Valid
      </span>
    )
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header Section */}
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="mb-3 text-[32px] leading-6 font-normal tracking-normal text-neutral-900 dark:text-neutral-100">
          JWT Decoder
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Decode and analyze JWT tokens. View header, payload, and signature.
        </p>
      </div>

      {/* Body Section */}
      <div className="bg-background flex min-h-0 flex-1 flex-col overflow-y-auto px-[24px] pt-6 pb-10">
        <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
          {/* Input Panel */}
          <CodePanel
            fillHeight={true}
            title="JWT Token"
            value={token}
            onChange={setToken}
            language="plaintext"
            height="150px"
            theme={theme}
            wrapText={inputWrapText}
            onWrapTextChange={setInputWrapText}
            placeholder="Paste your JWT token here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
            showClearButton={true}
            className="w-full"
            headerActions={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                    Load Example
                    <ChevronDownIcon className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleLoadExample('hs256')}>Valid HS256 Token</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLoadExample('expired')}>Expired Token</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLoadExample('withCustomClaims')}>
                    Token with Custom Claims
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
            footerRightContent={
              <Button onClick={handleDecode} disabled={isDecoding || !token.trim()} variant="default" size="sm">
                {isDecoding ? (
                  <>
                    <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                    Decoding...
                  </>
                ) : (
                  'Decode'
                )}
              </Button>
            }
          />

          {/* Secret Input (for verification) */}
          {decodedResult && decodedResult.isValid && (
            <div className="flex w-full flex-wrap items-center gap-3">
              <SecretInput
                label="Secret (for verification):"
                value={secret}
                onChange={setSecret}
                onSecretChange={() => setVerificationResult(null)}
                placeholder="Enter secret to verify signature"
                name="jwt-secret-verify"
                id="jwt-secret-verify-input"
                containerClassName="w-full"
                verificationStatus={verificationResult}
                isVerifying={isVerifying}
              />
              <Button onClick={handleVerify} disabled={isVerifying || !secret.trim()} variant="outline" size="default">
                {isVerifying ? (
                  <>
                    <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Signature'
                )}
              </Button>
            </div>
          )}

          {/* Output Panel */}
          {decodedResult && decodedResult.isValid ? (
            <CodePanel
              fillHeight={true}
              tabs={outputTabs}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
              height="500px"
              className="flex-1"
              theme={theme}
              wrapText={outputWrapText}
              onWrapTextChange={setOutputWrapText}
              footerLeftContent={
                decodedResult && (
                  <>
                    {getStatusBadge()}
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Algorithm: {decodedResult.header.alg || 'N/A'} | Claims: {decodedResult.statistics.claimCount}
                    </span>
                    {decodedResult.expiresAt && (
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Expires: {decodedResult.expiresAt.toLocaleString()}
                      </span>
                    )}
                    {decodedResult.issuedAt && (
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Issued: {decodedResult.issuedAt.toLocaleString()}
                      </span>
                    )}
                    <span>{decodedResult.statistics.totalSize} bytes</span>
                  </>
                )
              }
            />
          ) : (
            error && (
              <div className="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
                <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
