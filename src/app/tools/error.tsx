'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'

interface ToolsErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ToolsError({ error, reset }: ToolsErrorProps) {
  useEffect(() => {
    console.error('Tools error:', error)
  }, [error])

  return (
    <div className="flex h-full min-h-[400px] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="flex justify-center">
          <div className="bg-destructive/10 dark:bg-destructive/20 rounded-full p-3">
            <AlertCircle className="text-destructive h-8 w-8" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Failed to load tools</h2>
          <p className="text-muted-foreground text-sm">An error occurred while loading the tools. Please try again.</p>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-3 text-left">
            <p className="text-destructive text-xs font-medium">Error:</p>
            <p className="text-muted-foreground mt-1 font-mono text-xs break-all">{error.message}</p>
          </div>
        )}

        <Button onClick={reset} variant="default" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  )
}
