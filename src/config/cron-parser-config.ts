export interface CronFieldValue {
  type: 'every' | 'specific' | 'range' | 'step' | 'list'
  value?: string | number
  start?: number
  end?: number
  step?: number
  list?: number[]
}

export interface CronParserOptions {
  minute: CronFieldValue
  hour: CronFieldValue
  day: CronFieldValue
  month: CronFieldValue
  weekday: CronFieldValue
  timezone?: string
}

export const DEFAULT_CRON_PARSER_OPTIONS: CronParserOptions = {
  minute: { type: 'every' },
  hour: { type: 'every' },
  day: { type: 'every' },
  month: { type: 'every' },
  weekday: { type: 'every' },
  timezone: 'UTC',
}

export interface CronPreset {
  name: string
  description: string
  expression: string
  category: string
  options: CronParserOptions
}

export const CRON_PRESETS: CronPreset[] = [
  {
    name: 'Every Minute',
    description: 'Runs every minute',
    expression: '* * * * *',
    category: 'Common',
    options: {
      minute: { type: 'every' },
      hour: { type: 'every' },
      day: { type: 'every' },
      month: { type: 'every' },
      weekday: { type: 'every' },
    },
  },
  {
    name: 'Every Hour',
    description: 'Runs at the top of every hour',
    expression: '0 * * * *',
    category: 'Common',
    options: {
      minute: { type: 'specific', value: 0 },
      hour: { type: 'every' },
      day: { type: 'every' },
      month: { type: 'every' },
      weekday: { type: 'every' },
    },
  },
  {
    name: 'Every Day at Midnight',
    description: 'Runs every day at midnight',
    expression: '0 0 * * *',
    category: 'Daily',
    options: {
      minute: { type: 'specific', value: 0 },
      hour: { type: 'specific', value: 0 },
      day: { type: 'every' },
      month: { type: 'every' },
      weekday: { type: 'every' },
    },
  },
  {
    name: 'Every Day at 9 AM',
    description: 'Runs every day at 9:00 AM',
    expression: '0 9 * * *',
    category: 'Daily',
    options: {
      minute: { type: 'specific', value: 0 },
      hour: { type: 'specific', value: 9 },
      day: { type: 'every' },
      month: { type: 'every' },
      weekday: { type: 'every' },
    },
  },
  {
    name: 'Every Monday at 9 AM',
    description: 'Runs every Monday at 9:00 AM',
    expression: '0 9 * * 1',
    category: 'Weekly',
    options: {
      minute: { type: 'specific', value: 0 },
      hour: { type: 'specific', value: 9 },
      day: { type: 'every' },
      month: { type: 'every' },
      weekday: { type: 'specific', value: 1 },
    },
  },
  {
    name: 'Every 15 Minutes',
    description: 'Runs every 15 minutes',
    expression: '*/15 * * * *',
    category: 'Interval',
    options: {
      minute: { type: 'step', step: 15 },
      hour: { type: 'every' },
      day: { type: 'every' },
      month: { type: 'every' },
      weekday: { type: 'every' },
    },
  },
  {
    name: 'Every 30 Minutes',
    description: 'Runs every 30 minutes',
    expression: '*/30 * * * *',
    category: 'Interval',
    options: {
      minute: { type: 'step', step: 30 },
      hour: { type: 'every' },
      day: { type: 'every' },
      month: { type: 'every' },
      weekday: { type: 'every' },
    },
  },
  {
    name: 'Every 2 Hours',
    description: 'Runs every 2 hours',
    expression: '0 */2 * * *',
    category: 'Interval',
    options: {
      minute: { type: 'specific', value: 0 },
      hour: { type: 'step', step: 2 },
      day: { type: 'every' },
      month: { type: 'every' },
      weekday: { type: 'every' },
    },
  },
  {
    name: 'Weekdays at 6 PM',
    description: 'Runs Monday to Friday at 6:00 PM',
    expression: '0 18 * * 1-5',
    category: 'Business',
    options: {
      minute: { type: 'specific', value: 0 },
      hour: { type: 'specific', value: 18 },
      day: { type: 'every' },
      month: { type: 'every' },
      weekday: { type: 'range', start: 1, end: 5 },
    },
  },
  {
    name: 'Business Hours (9 AM - 5 PM)',
    description: 'Runs every hour from 9 AM to 5 PM, Monday to Friday',
    expression: '0 9-17 * * 1-5',
    category: 'Business',
    options: {
      minute: { type: 'specific', value: 0 },
      hour: { type: 'range', start: 9, end: 17 },
      day: { type: 'every' },
      month: { type: 'every' },
      weekday: { type: 'range', start: 1, end: 5 },
    },
  },
  {
    name: 'First Day of Month',
    description: 'Runs on the 1st of every month at midnight',
    expression: '0 0 1 * *',
    category: 'Monthly',
    options: {
      minute: { type: 'specific', value: 0 },
      hour: { type: 'specific', value: 0 },
      day: { type: 'specific', value: 1 },
      month: { type: 'every' },
      weekday: { type: 'every' },
    },
  },
  {
    name: 'Backup at 2 AM',
    description: 'Runs daily backup at 2:00 AM',
    expression: '0 2 * * *',
    category: 'Maintenance',
    options: {
      minute: { type: 'specific', value: 0 },
      hour: { type: 'specific', value: 2 },
      day: { type: 'every' },
      month: { type: 'every' },
      weekday: { type: 'every' },
    },
  },
  {
    name: 'Quarterly Report',
    description: 'Runs quarterly on the 1st of Jan, Apr, Jul, Oct at 9 AM',
    expression: '0 9 1 1,4,7,10 *',
    category: 'Reports',
    options: {
      minute: { type: 'specific', value: 0 },
      hour: { type: 'specific', value: 9 },
      day: { type: 'specific', value: 1 },
      month: { type: 'list', list: [1, 4, 7, 10] },
      weekday: { type: 'every' },
    },
  },
  {
    name: 'Weekend Backup',
    description: 'Runs on Saturday and Sunday at 2:00 AM',
    expression: '0 2 * * 0,6',
    category: 'Maintenance',
    options: {
      minute: { type: 'specific', value: 0 },
      hour: { type: 'specific', value: 2 },
      day: { type: 'every' },
      month: { type: 'every' },
      weekday: { type: 'list', list: [0, 6] },
    },
  },
]

export const CRON_FIELD_DEFINITIONS = {
  minute: {
    label: 'Minute',
    range: { min: 0, max: 59 },
    description: 'Minute of the hour (0-59)',
  },
  hour: {
    label: 'Hour',
    range: { min: 0, max: 23 },
    description: 'Hour of the day (0-23)',
  },
  day: {
    label: 'Month-Day',
    range: { min: 1, max: 31 },
    description: 'Day of the month (1-31)',
  },
  month: {
    label: 'Month',
    range: { min: 1, max: 12 },
    description: 'Month of the year (1-12)',
    names: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  },
  weekday: {
    label: 'Week-Day',
    range: { min: 0, max: 6 },
    description: 'Day of the week (0=Sunday, 6=Saturday)',
    names: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  },
}

// Timezone options for cron parser
export const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'local', label: 'Local Time' },
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
