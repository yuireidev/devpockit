/**
 * List Format Converter Configuration
 * Options and settings for list format conversion tool
 */

import type { InputFormat } from './list-comparison-config'

export type ListFormat = InputFormat

export interface ListConverterOptions {
  inputFormat: ListFormat
  outputFormat: ListFormat
  preserveTypes: boolean
  removeEmpty: boolean
  removeDuplicates: boolean
  sortOrder: 'none' | 'asc' | 'desc'
}

export const LIST_CONVERTER_OPTIONS = {
  formats: [
    { value: 'line-by-line', label: 'Line-by-Line' },
    { value: 'comma-separated', label: 'Comma-Separated' },
    { value: 'space-separated', label: 'Space-Separated' },
    { value: 'pipe-separated', label: 'Pipe-Separated (|)' },
    { value: 'tab-separated', label: 'Tab-Separated' },
    { value: 'json-array', label: 'JSON Array' },
    { value: 'python-list', label: 'Python List' },
    { value: 'javascript-array', label: 'JavaScript Array' },
    { value: 'yaml-array', label: 'YAML Array' },
  ] as const,
} as const

export const DEFAULT_LIST_CONVERTER_OPTIONS: ListConverterOptions = {
  inputFormat: 'line-by-line',
  outputFormat: 'json-array',
  preserveTypes: true,
  removeEmpty: true,
  removeDuplicates: false,
  sortOrder: 'none',
}

export const LIST_CONVERTER_EXAMPLES: Record<ListFormat, string> = {
  'line-by-line': `apple
banana
cherry
123
456`,
  'comma-separated': `apple, banana, cherry, 123, 456`,
  'space-separated': `apple banana cherry 123 456`,
  'pipe-separated': `apple | banana | cherry | 123 | 456`,
  'tab-separated': `apple\tbanana\tcherry\t123\t456`,
  'json-array': `["apple", "banana", "cherry", 123, 456]`,
  'python-list': `['apple', 'banana', 'cherry', 123, 456]`,
  'javascript-array': `['apple', 'banana', 'cherry', 123, 456]`,
  'yaml-array': `- apple\n- banana\n- cherry\n- 123\n- 456`,
}
