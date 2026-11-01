/**
 * JSON Formatter Configuration
 * Options and settings for JSON formatting tool
 */

export const JSON_FORMAT_OPTIONS = {
  formats: [
    { value: 'beautify', label: '🎨 Beautify (Pretty Print)' },
    { value: 'minify', label: '📦 Minify (Compact)' },
  ],
  indentSizes: [
    { value: 2, label: '2 spaces' },
    { value: 4, label: '4 spaces' },
    { value: 8, label: '8 spaces' },
  ],
  sortKeys: [
    { value: 'none', label: 'Keep original order' },
    { value: 'asc', label: 'Ascending (A-Z)' },
    { value: 'desc', label: 'Descending (Z-A)' },
  ],
} as const

export const DEFAULT_JSON_OPTIONS = {
  format: 'beautify' as const,
  indentSize: 2,
  sortKeys: 'none' as const,
}

export const JSON_EXAMPLES = {
  valid: `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "swimming", "coding"],
  "address": {
    "street": "123 Main St",
    "zipcode": "10001"
  }
}`,
  invalid: `{
  "name": "John Doe"
  "age": 30,
  "city": "New York"
}`,
  minified: `{"name":"John Doe","age":30,"city":"New York","hobbies":["reading","swimming","coding"],"address":{"street":"123 Main St","zipcode":"10001"}}`,
}
