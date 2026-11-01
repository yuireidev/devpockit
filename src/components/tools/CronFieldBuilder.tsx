'use client'

import { NumberInput } from '@/components/ui/number-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CRON_FIELD_DEFINITIONS, type CronFieldValue } from '@/config/cron-parser-config'
import { cn } from '@/libs/utils'
import * as React from 'react'

interface CronFieldBuilderProps {
  fieldName: 'minute' | 'hour' | 'day' | 'month' | 'weekday'
  field: CronFieldValue
  onChange: (value: CronFieldValue) => void
  className?: string
}

interface ListInputProps {
  label: string
  value: number[]
  onChange: (value: number[]) => void
  min: number
  max: number
  containerClassName?: string
}

const ListInput = React.forwardRef<HTMLInputElement, ListInputProps>(
  ({ label, value, onChange, min, max, containerClassName }, ref) => {
    const [inputValue, setInputValue] = React.useState(value.join(','))
    const isUserInputRef = React.useRef(false)

    // Only sync when external value changes (not from our updates)
    React.useEffect(() => {
      if (!isUserInputRef.current) {
        setInputValue(value.join(','))
      }
      isUserInputRef.current = false
    }, [value])

    const handleChange = (newValue: string) => {
      setInputValue(newValue)
      // Allow user to type freely, including commas
      // We'll parse and validate on blur
    }

    const handleBlur = () => {
      // Parse the input value and filter valid numbers
      const list = inputValue
        .split(',')
        .map((v) => parseInt(v.trim()))
        .filter((v) => !isNaN(v) && v >= min && v <= max)

      // Update both internal state and parent atomically
      isUserInputRef.current = true
      const finalValue = list.length > 0 ? list.join(',') : ''
      setInputValue(finalValue)
      onChange(list)
    }

    return (
      <div
        className={cn(
          'bg-background ring-offset-background focus-within:ring-ring inline-flex h-10 items-center rounded-lg border border-neutral-200 py-[9.5px] pr-2 pl-3 text-sm focus-within:ring-2 focus-within:ring-offset-2 dark:border-neutral-700',
          containerClassName
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 text-sm leading-normal tracking-[0.07px]">
          <span className="whitespace-nowrap text-neutral-500 dark:text-neutral-400">{label}</span>
          <input
            ref={ref}
            type="text"
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g., 1,5,10"
            className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent font-mono text-neutral-900 outline-hidden dark:text-neutral-100"
          />
        </div>
      </div>
    )
  }
)

ListInput.displayName = 'ListInput'

export function CronFieldBuilder({ fieldName, field, onChange, className }: CronFieldBuilderProps) {
  const fieldDef = CRON_FIELD_DEFINITIONS[fieldName]

  const handleTypeChange = (value: CronFieldValue['type']) => {
    const newField: CronFieldValue = { type: value }
    if (value === 'specific') {
      newField.value = fieldDef.range.min
    } else if (value === 'range') {
      newField.start = fieldDef.range.min
      newField.end = fieldDef.range.max
    } else if (value === 'step') {
      newField.step = 1
    } else if (value === 'list') {
      newField.list = []
    }
    onChange(newField)
  }

  return (
    <div className={cn('flex flex-1 flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center">
          <Select value={field.type} onValueChange={handleTypeChange}>
            <SelectTrigger
              label={`${fieldDef.label}:`}
              className="w-[180px] rounded-r-none border-r-0"
              valueAlign="center"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="every">Every</SelectItem>
              <SelectItem value="specific">Specific</SelectItem>
              <SelectItem value="range">Range</SelectItem>
              <SelectItem value="step">Step</SelectItem>
              <SelectItem value="list">List</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" />

          {field.type === 'every' && (
            <div className="flex h-10 flex-1 items-center rounded-lg rounded-l-none border border-l-0 border-neutral-200 bg-neutral-50 px-3 dark:border-neutral-700 dark:bg-neutral-900/50">
              <span className="text-sm text-neutral-400 dark:text-neutral-500">—</span>
            </div>
          )}

          {field.type !== 'every' && (
            <>
              {field.type === 'specific' && (
                <NumberInput
                  value={
                    typeof field.value === 'number'
                      ? field.value
                      : field.value
                        ? parseInt(field.value.toString())
                        : fieldDef.range.min
                  }
                  onChange={(value: number) => {
                    onChange({ ...field, value })
                  }}
                  min={fieldDef.range.min}
                  max={fieldDef.range.max}
                  showLabel={false}
                  containerClassName="flex-1 rounded-l-none border-l-0 rounded-r-lg"
                  inputClassName="text-center"
                  isFirst={true}
                  isLast={true}
                />
              )}

              {field.type === 'range' && (
                <>
                  <NumberInput
                    value={field.start || fieldDef.range.min}
                    onChange={(value) => onChange({ ...field, start: value })}
                    min={fieldDef.range.min}
                    max={fieldDef.range.max}
                    showLabel={false}
                    containerClassName="flex-1 rounded-l-none border-l-0 rounded-r-none border-r-0"
                    inputClassName="text-center"
                    isFirst={true}
                    isLast={false}
                  />
                  <div className="bg-background flex h-10 items-center justify-center border-y border-r-0 border-l-0 border-neutral-200 px-2 dark:border-neutral-700">
                    <span className="text-sm text-neutral-500">—</span>
                  </div>
                  <NumberInput
                    value={field.end || fieldDef.range.max}
                    onChange={(value) => onChange({ ...field, end: value })}
                    min={fieldDef.range.min}
                    max={fieldDef.range.max}
                    showLabel={false}
                    containerClassName="flex-1 rounded-l-none border-l-0 rounded-r-lg"
                    inputClassName="text-center"
                    isFirst={false}
                    isLast={true}
                  />
                </>
              )}

              {field.type === 'step' && (
                <NumberInput
                  label="Every"
                  value={field.step || 1}
                  onChange={(step) => {
                    onChange({ ...field, step: Math.max(1, Math.min(step, fieldDef.range.max)) })
                  }}
                  min={1}
                  max={fieldDef.range.max}
                  showLabel={true}
                  containerClassName="flex-1 rounded-l-none border-l-0 rounded-r-lg"
                  inputClassName="w-20 text-center"
                  isFirst={true}
                  isLast={true}
                />
              )}

              {field.type === 'list' && (
                <ListInput
                  label="Values"
                  value={field.list || []}
                  onChange={(list) => {
                    onChange({ ...field, list })
                  }}
                  min={fieldDef.range.min}
                  max={fieldDef.range.max}
                  containerClassName="flex-1 rounded-l-none border-l-0"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
