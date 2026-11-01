// Timestamp Converter Configuration

export const TIMEZONES = [
  { value: 'local', label: 'Local Time' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'America/Toronto', label: 'Toronto (ET)' },
  { value: 'America/Vancouver', label: 'Vancouver (PT)' },
] as const

export type TimezoneValue = (typeof TIMEZONES)[number]['value']

export const INPUT_FORMATS = [
  { value: 'auto', label: 'Auto-detect', description: 'Automatically detect the input format' },
  { value: 'unix-s', label: 'Unix (seconds)', description: 'e.g., 1734537600' },
  { value: 'unix-ms', label: 'Unix (milliseconds)', description: 'e.g., 1734537600000' },
  { value: 'unix-us', label: 'Unix (microseconds)', description: 'e.g., 1734537600000000' },
  { value: 'unix-ns', label: 'Unix (nanoseconds)', description: 'e.g., 1734537600000000000' },
  { value: 'iso8601', label: 'ISO 8601', description: 'e.g., 2024-12-18T12:00:00Z' },
  { value: 'rfc2822', label: 'RFC 2822', description: 'e.g., Thu, 18 Dec 2024 12:00:00 +0000' },
  { value: 'custom', label: 'Custom string', description: 'Any parseable date string' },
] as const

export type InputFormat = (typeof INPUT_FORMATS)[number]['value']

export const TIMESTAMP_EXAMPLES = [
  { label: 'Unix (seconds)', value: '1734537600', format: 'unix-s' as InputFormat },
  { label: 'Unix (milliseconds)', value: '1734537600000', format: 'unix-ms' as InputFormat },
  { label: 'ISO 8601', value: '2024-12-18T12:00:00Z', format: 'iso8601' as InputFormat },
  { label: 'ISO 8601 with offset', value: '2024-12-18T12:00:00+05:30', format: 'iso8601' as InputFormat },
  { label: 'RFC 2822', value: 'Thu, 18 Dec 2024 12:00:00 +0000', format: 'rfc2822' as InputFormat },
  { label: 'Date string', value: 'December 18, 2024 12:00 PM', format: 'custom' as InputFormat },
  { label: 'Short date', value: '2024-12-18', format: 'custom' as InputFormat },
] as const

export const DEFAULT_OPTIONS = {
  inputFormat: 'auto' as InputFormat,
  timezone: 'local' as TimezoneValue,
  liveMode: false,
}

// Common timestamp presets
export const TIMESTAMP_PRESETS = [
  { label: 'Now', getValue: () => Date.now() },
  { label: 'Start of today', getValue: () => new Date().setHours(0, 0, 0, 0) },
  { label: 'End of today', getValue: () => new Date().setHours(23, 59, 59, 999) },
  {
    label: 'Start of week',
    getValue: () => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - d.getDay())
      return d.getTime()
    },
  },
  { label: 'Start of month', getValue: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() },
  { label: 'Start of year', getValue: () => new Date(new Date().getFullYear(), 0, 1).getTime() },
  { label: 'Unix epoch', getValue: () => 0 },
  { label: 'Y2K', getValue: () => new Date(2000, 0, 1).getTime() },
] as const
