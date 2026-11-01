import { cn } from '@/libs/utils'
import * as React from 'react'

export interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label?: string
  className?: string
  containerClassName?: string
  inputClassName?: string
  width?: string
  showLabel?: boolean
  // For connected inputs (like in CronFieldBuilder)
  isFirst?: boolean
  isLast?: boolean
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      min = 1,
      max = 100,
      label = 'Quantity:',
      className,
      containerClassName,
      inputClassName,
      width = 'w-[140px]',
      showLabel = true,
      isFirst = false,
      isLast = true,
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState(value.toString())
    const isUserInputRef = React.useRef(false)

    // Only sync when external value changes (not from our updates)
    React.useEffect(() => {
      if (!isUserInputRef.current) {
        setInputValue(value.toString())
      }
      isUserInputRef.current = false
    }, [value])

    const handleChange = (newValue: string) => {
      setInputValue(newValue)

      // Allow empty string for deletion during typing
      if (newValue === '') {
        return
      }

      // Only update parent if it's a valid number within range
      const parsed = parseInt(newValue, 10)
      if (!isNaN(parsed) && parsed >= min && parsed <= max) {
        isUserInputRef.current = true
        onChange(parsed)
      }
    }

    const handleBlur = () => {
      let finalValue: number

      // If empty on blur, set to minimum value
      if (inputValue === '' || inputValue.trim() === '') {
        finalValue = min
      } else {
        const parsed = parseInt(inputValue, 10)

        // Clamp to valid range
        if (isNaN(parsed) || parsed < min) {
          finalValue = min
        } else if (parsed > max) {
          finalValue = max
        } else {
          finalValue = parsed
        }
      }

      // Update both internal state and parent atomically
      isUserInputRef.current = true
      setInputValue(finalValue.toString())
      onChange(finalValue)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleBlur()
        // Blur the input to remove focus
        e.currentTarget.blur()
      }
    }

    // If containerClassName is provided, use it (for connected inputs)
    // Otherwise, use the default container styling
    const containerClasses = containerClassName
      ? cn(
          'inline-flex h-10 items-center border border-neutral-200 bg-background px-2 py-[9.5px] text-sm dark:border-neutral-700',
          containerClassName,
          // Apply border radius adjustments for connected inputs
          isFirst && 'rounded-l-none border-l-0',
          !isLast && 'rounded-r-none border-r-0',
          isLast && !isFirst && 'rounded-r-lg',
          !isFirst && isLast && 'rounded-l-none'
        )
      : cn(
          'inline-flex h-10 items-center rounded-lg border border-neutral-200 bg-background pl-3 pr-2 py-[9.5px] text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 dark:border-neutral-700',
          width,
          className
        )

    const inputClasses = inputClassName
      ? cn(
          'font-mono bg-transparent text-neutral-900 dark:text-neutral-100 outline-hidden flex-1 min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          inputClassName
        )
      : cn(
          'font-mono bg-transparent text-neutral-900 dark:text-neutral-100 outline-hidden flex-1 min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          // Center text when no label
          !showLabel && 'text-center'
        )

    return (
      <div className={containerClasses}>
        {showLabel ? (
          <div className="flex min-w-0 flex-1 items-center gap-3 text-sm leading-normal tracking-[0.07px]">
            <span className="whitespace-nowrap text-neutral-500 dark:text-neutral-400">{label}</span>
            <input
              ref={ref}
              type="number"
              min={min}
              max={max}
              value={inputValue}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={inputClasses}
            />
          </div>
        ) : (
          <input
            ref={ref}
            type="number"
            min={min}
            max={max}
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={inputClasses}
          />
        )}
      </div>
    )
  }
)

NumberInput.displayName = 'NumberInput'
