import * as React from 'react'
import { cn } from '@/libs/utils'

export interface LabeledInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  value: string
  onChange: (value: string) => void
  containerClassName?: string
  inputClassName?: string
}

export const LabeledInput = React.forwardRef<HTMLInputElement, LabeledInputProps>(
  ({ label, value, onChange, placeholder, containerClassName, inputClassName, className, ...props }, ref) => {
    return (
      <div
        className={cn(
          'bg-background ring-offset-background focus-within:ring-ring flex h-10 items-center rounded-lg border border-neutral-200 py-[9.5px] pr-2 pl-3 text-sm focus-within:ring-2 focus-within:ring-offset-2 dark:border-neutral-700',
          containerClassName || 'w-full'
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 text-sm leading-normal tracking-[0.07px]">
          <span className="whitespace-nowrap text-neutral-500 dark:text-neutral-400">{label}</span>
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent font-mono text-neutral-900 outline-hidden dark:text-neutral-100',
              inputClassName,
              className
            )}
            {...props}
          />
        </div>
      </div>
    )
  }
)

LabeledInput.displayName = 'LabeledInput'
