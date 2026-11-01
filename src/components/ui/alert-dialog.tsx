'use client'

import * as React from 'react'
import { cn } from '@/libs/utils'
import { Button } from './button'

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  confirmText?: string
  onConfirm?: () => void
}

export function AlertDialog({ open, onOpenChange, title, message, confirmText = 'OK', onConfirm }: AlertDialogProps) {
  if (!open) return null

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onOpenChange(false)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'relative mx-4 w-full max-w-md bg-white dark:bg-neutral-900',
          'border border-neutral-200 dark:border-neutral-700',
          'rounded-lg shadow-lg',
          'space-y-4 p-6'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">{message}</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleConfirm} size="sm">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
