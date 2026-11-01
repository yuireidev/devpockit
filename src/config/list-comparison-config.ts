/**
 * List Comparison Configuration
 * Options and settings for list comparison tool
 */

export type InputFormat =
  | 'line-by-line'
  | 'comma-separated'
  | 'space-separated'
  | 'pipe-separated'
  | 'tab-separated'
  | 'json-array'
  | 'python-list'
  | 'javascript-array'
  | 'yaml-array'
export type ComparisonOperation = 'union' | 'intersection' | 'a-minus-b' | 'b-minus-a' | 'symmetric'

export interface ListComparisonOptions {
  inputFormat: InputFormat
  caseSensitive: boolean
  sortOrder: 'none' | 'asc' | 'desc'
  operation: ComparisonOperation
}

export const LIST_COMPARISON_OPTIONS = {
  inputFormats: [
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
  operations: [
    { value: 'union', label: 'Union', description: 'All unique items from both lists' },
    { value: 'intersection', label: 'Intersection', description: 'Items present in both lists' },
    { value: 'a-minus-b', label: 'A - B', description: 'Items in List A but not in List B' },
    { value: 'b-minus-a', label: 'B - A', description: 'Items in List B but not in List A' },
    { value: 'symmetric', label: 'Symmetric Difference', description: 'Items in either list but not both' },
  ] as const,
} as const

export const DEFAULT_LIST_COMPARISON_OPTIONS: ListComparisonOptions = {
  inputFormat: 'line-by-line',
  caseSensitive: false,
  sortOrder: 'none',
  operation: 'union',
}

export const LIST_COMPARISON_EXAMPLES = {
  'list-a': {
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
  },
  'list-b': {
    'line-by-line': `Apple
banana
cherry
date
123
789`,
    'comma-separated': `Apple, banana, cherry, date, 123, 789`,
    'space-separated': `Apple banana cherry date 123 789`,
    'pipe-separated': `Apple | banana | cherry | date | 123 | 789`,
    'tab-separated': `Apple\tbanana\tcherry\tdate\t123\t789`,
    'json-array': `["Apple", "banana", "cherry", "date", 123, 789]`,
    'python-list': `['Apple', 'banana', 'cherry', 'date', 123, 789]`,
    'javascript-array': `['Apple', 'banana', 'cherry', 'date', 123, 789]`,
    'yaml-array': `- Apple\n- banana\n- cherry\n- date\n- 123\n- 789`,
  },
} as const
