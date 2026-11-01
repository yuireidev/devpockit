'use client'

import { cn } from '@/libs/utils'
import { CheckCircleIcon, EyeIcon, EyeSlashIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export interface SecretInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  name?: string
  id?: string
  containerClassName?: string
  verificationStatus?: {
    isValid: boolean
    error?: string
  } | null
  isVerifying?: boolean
  onSecretChange?: (value: string) => void
}

export function SecretInput({
  label,
  value,
  onChange,
  placeholder,
  name,
  id,
  containerClassName,
  verificationStatus,
  isVerifying = false,
  onSecretChange,
}: SecretInputProps) {
  const [showSecret, setShowSecret] = useState(false)

  const handleChange = (newValue: string) => {
    onChange(newValue)
    if (onSecretChange) {
      onSecretChange(newValue)
    }
  }

  return (
    <div className={cn('min-w-0 flex-1', containerClassName)}>
      <div className="bg-background ring-offset-background focus-within:ring-ring flex h-10 w-full items-center rounded-lg border border-neutral-200 py-[9.5px] pr-2 pl-3 text-sm focus-within:ring-2 focus-within:ring-offset-2 dark:border-neutral-700">
        <div className="flex min-w-0 flex-1 items-center gap-3 text-sm leading-normal tracking-[0.07px]">
          <span className="whitespace-nowrap text-neutral-500 dark:text-neutral-400">{label}</span>
          <input
            type={showSecret ? 'text' : 'password'}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            name={name}
            id={id}
            className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent font-mono text-neutral-900 outline-hidden dark:text-neutral-100"
          />
          {/* Verification Status */}
          {verificationStatus && !isVerifying && (
            <div className="flex shrink-0 items-center gap-1.5 pr-1">
              {verificationStatus.isValid ? (
                <>
                  <CheckCircleIcon className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  <span className="text-xs whitespace-nowrap text-green-600 dark:text-green-400">Valid</span>
                </>
              ) : (
                <>
                  <XCircleIcon className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  <span className="text-xs whitespace-nowrap text-red-600 dark:text-red-400">Invalid</span>
                </>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowSecret(!showSecret)}
            className="shrink-0 rounded p-1 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
            aria-label={showSecret ? 'Hide secret' : 'Show secret'}
          >
            {showSecret ? (
              <EyeSlashIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            ) : (
              <EyeIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
