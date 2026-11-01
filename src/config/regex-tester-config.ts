export type RegexFlavor = 'javascript' | 'python'

export interface RegexFlags {
  global: boolean
  caseInsensitive: boolean
  multiline: boolean
  dotall: boolean
  unicode: boolean
  sticky: boolean
  unicodeSets: boolean
  hasIndices: boolean
}

export interface RegexTesterOptions {
  pattern: string
  testString: string
  flags: RegexFlags
  flavor: RegexFlavor
  replaceString: string
  showGroups: boolean
  showPositions: boolean
}

export const DEFAULT_REGEX_OPTIONS: RegexTesterOptions = {
  pattern: '',
  testString: '',
  flags: {
    global: true,
    caseInsensitive: false,
    multiline: false,
    dotall: false,
    unicode: false,
    sticky: false,
    unicodeSets: false,
    hasIndices: false,
  },
  flavor: 'javascript',
  replaceString: '',
  showGroups: true,
  showPositions: true,
}

export const REGEX_FLAGS = [
  {
    key: 'global' as keyof RegexFlags,
    label: 'global',
    char: 'g',
    description: "Don't return after first match",
  },
  {
    key: 'multiline' as keyof RegexFlags,
    label: 'multi line',
    char: 'm',
    description: 'and match start/end of line',
  },
  {
    key: 'caseInsensitive' as keyof RegexFlags,
    label: 'insensitive',
    char: 'i',
    description: 'Case insensitive match',
  },
  {
    key: 'sticky' as keyof RegexFlags,
    label: 'sticky',
    char: 'y',
    description: 'Anchor to start of pattern, or at the end of the most recent match',
  },
  {
    key: 'unicode' as keyof RegexFlags,
    label: 'unicode',
    char: 'u',
    description: 'Match with full unicode',
  },
  {
    key: 'unicodeSets' as keyof RegexFlags,
    label: 'vnicode',
    char: 'v',
    description: 'Enable all unicode and character set features',
  },
  {
    key: 'dotall' as keyof RegexFlags,
    label: 'single line',
    char: 's',
    description: 'Dot matches newline',
  },
  {
    key: 'hasIndices' as keyof RegexFlags,
    label: 'indices',
    char: 'd',
    description: 'The regex engine returns match indices',
  },
]

export const REGEX_FLAVORS: { value: RegexFlavor; label: string; symbol: string; description: string }[] = [
  {
    value: 'javascript',
    label: 'JavaScript',
    symbol: '🟨',
    description: 'Native JavaScript RegExp (browser-compatible)',
  },
  {
    value: 'python',
    label: 'Python',
    symbol: '🐍',
    description: 'Python-style regex (for reference and code generation)',
  },
]

export interface CommonPattern {
  name: string
  pattern: string
  description: string
  example: string
  category: string
}

export const COMMON_PATTERNS: CommonPattern[] = [
  // Email
  {
    name: 'Email Address',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: 'Matches standard email addresses',
    example: 'user@example.com',
    category: 'Validation',
  },
  {
    name: 'URL',
    pattern:
      '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
    description: 'Matches HTTP/HTTPS URLs',
    example: 'https://example.com/path?query=value',
    category: 'Validation',
  },
  {
    name: 'IP Address (IPv4)',
    pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    description: 'Matches IPv4 addresses',
    example: '192.168.1.1',
    category: 'Network',
  },
  {
    name: 'Phone Number (US)',
    pattern: '^\\+?1?[-.\\s]?\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})$',
    description: 'Matches US phone numbers in various formats',
    example: '(555) 123-4567',
    category: 'Validation',
  },
  {
    name: 'Date (YYYY-MM-DD)',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$',
    description: 'Matches dates in YYYY-MM-DD format',
    example: '2024-12-19',
    category: 'Date/Time',
  },
  {
    name: 'Credit Card',
    pattern: '^[4-6]\\d{3}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}$',
    description: 'Matches Visa, Mastercard, and Amex card numbers',
    example: '4532-1234-5678-9010',
    category: 'Validation',
  },
  {
    name: 'Hex Color',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
    description: 'Matches hex color codes',
    example: '#FF5733',
    category: 'Format',
  },
  {
    name: 'UUID',
    pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
    description: 'Matches UUID format',
    example: '550e8400-e29b-41d4-a716-446655440000',
    category: 'Format',
  },
  {
    name: 'Password (Strong)',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    description: 'Matches strong passwords (8+ chars, upper, lower, digit, special)',
    example: 'MyP@ssw0rd',
    category: 'Validation',
  },
  {
    name: 'Time (HH:MM)',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
    description: 'Matches 24-hour time format',
    example: '14:30',
    category: 'Date/Time',
  },
  {
    name: 'Postal Code (US)',
    pattern: '^\\d{5}(-\\d{4})?$',
    description: 'Matches US ZIP codes',
    example: '12345-6789',
    category: 'Validation',
  },
  {
    name: 'HTML Tag',
    pattern: '<([a-z][a-z0-9]*)\\b[^>]*(?:>(.*?)<\\/\\1>|\\s*\\/>)',
    description: 'Matches HTML tags',
    example: '<div class="test">content</div>',
    category: 'Parsing',
  },
  {
    name: 'Number (Integer)',
    pattern: '^-?\\d+$',
    description: 'Matches integers (positive or negative)',
    example: '-123',
    category: 'Format',
  },
  {
    name: 'Number (Decimal)',
    pattern: '^-?\\d+\\.\\d+$',
    description: 'Matches decimal numbers',
    example: '123.45',
    category: 'Format',
  },
  {
    name: 'Alphanumeric',
    pattern: '^[a-zA-Z0-9]+$',
    description: 'Matches alphanumeric strings only',
    example: 'abc123',
    category: 'Format',
  },
  {
    name: 'Whitespace',
    pattern: '\\s+',
    description: 'Matches one or more whitespace characters',
    example: '   ',
    category: 'Format',
  },
  {
    name: 'Domain Name',
    pattern: '^([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}$',
    description: 'Matches valid domain names',
    example: 'example.com',
    category: 'Network',
  },
  {
    name: 'MAC Address',
    pattern: '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$',
    description: 'Matches MAC addresses in various formats',
    example: '00:1B:44:11:3A:B7',
    category: 'Network',
  },
  {
    name: 'IPv6 Address',
    pattern: '^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$',
    description: 'Matches IPv6 addresses',
    example: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    category: 'Network',
  },
  {
    name: 'Date (MM/DD/YYYY)',
    pattern: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/\\d{4}$',
    description: 'Matches dates in MM/DD/YYYY format',
    example: '12/25/2024',
    category: 'Date/Time',
  },
  {
    name: 'Date (DD-MM-YYYY)',
    pattern: '^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\\d{4}$',
    description: 'Matches dates in DD-MM-YYYY format',
    example: '25-12-2024',
    category: 'Date/Time',
  },
  {
    name: 'Time (12-hour)',
    pattern: '^(1[0-2]|0?[1-9]):[0-5][0-9]\\s?(AM|PM)$',
    description: 'Matches 12-hour time format with AM/PM',
    example: '03:45 PM',
    category: 'Date/Time',
  },
  {
    name: 'Social Security Number (US)',
    pattern: '^\\d{3}-\\d{2}-\\d{4}$',
    description: 'Matches US Social Security Numbers',
    example: '123-45-6789',
    category: 'Validation',
  },
  {
    name: 'Credit Card (Visa)',
    pattern: '^4[0-9]{12}(?:[0-9]{3})?$',
    description: 'Matches Visa card numbers',
    example: '4532015112830366',
    category: 'Validation',
  },
  {
    name: 'Credit Card (Mastercard)',
    pattern: '^5[1-5][0-9]{14}$',
    description: 'Matches Mastercard numbers',
    example: '5555555555554444',
    category: 'Validation',
  },
  {
    name: 'ISBN-10',
    pattern:
      '^(?:ISBN(?:-10)?:?\\s?)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-\\s]){3})[-\\s0-9X]{13}$)[0-9]{1,5}[-\\s]?[0-9]+[-\\s]?[0-9]+[-\\s]?[0-9X]$',
    description: 'Matches ISBN-10 book identifiers',
    example: '0-306-40615-2',
    category: 'Validation',
  },
  {
    name: 'ISBN-13',
    pattern:
      '^(?:ISBN(?:-13)?:?\\s?)?(?=[0-9]{13}$|(?=(?:[0-9]+[-\\s]){4})[-\\s0-9]{17}$)97[89][-\\s]?[0-9]{1,5}[-\\s]?[0-9]+[-\\s]?[0-9]+[-\\s]?[0-9]$',
    description: 'Matches ISBN-13 book identifiers',
    example: '978-0-306-40615-7',
    category: 'Validation',
  },
  {
    name: 'RGB Color',
    pattern: '^rgb\\((\\d{1,3}),\\s*(\\d{1,3}),\\s*(\\d{1,3})\\)$',
    description: 'Matches RGB color values',
    example: 'rgb(255, 99, 71)',
    category: 'Format',
  },
  {
    name: 'HSL Color',
    pattern: '^hsl\\((\\d{1,3}),\\s*(\\d{1,3})%,\\s*(\\d{1,3})%\\)$',
    description: 'Matches HSL color values',
    example: 'hsl(9, 100%, 64%)',
    category: 'Format',
  },
  {
    name: 'Semantic Version',
    pattern:
      '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$',
    description: 'Matches semantic version numbers',
    example: '1.2.3-beta.1',
    category: 'Format',
  },
  {
    name: 'Git Commit Hash',
    pattern: '^[a-f0-9]{40}$',
    description: 'Matches Git commit SHA-1 hashes',
    example: 'a1b2c3d4e5f6789012345678901234567890abcd',
    category: 'Format',
  },
  {
    name: 'Base64 String',
    pattern: '^[A-Za-z0-9+/]{4}*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$',
    description: 'Matches Base64 encoded strings',
    example: 'SGVsbG8gV29ybGQ=',
    category: 'Format',
  },
  {
    name: 'JSON Number',
    pattern: '^-?(?:0|[1-9]\\d*)(?:\\.\\d+)?(?:[eE][+-]?\\d+)?$',
    description: 'Matches JSON number format',
    example: '-123.456e-78',
    category: 'Format',
  },
  {
    name: 'Word Boundary',
    pattern: '\\b\\w+\\b',
    description: 'Matches whole words',
    example: 'hello world',
    category: 'Parsing',
  },
  {
    name: 'Quoted String',
    pattern: '"[^"]*"',
    description: 'Matches double-quoted strings',
    example: '"Hello, World!"',
    category: 'Parsing',
  },
  {
    name: 'Single Quoted String',
    pattern: "'[^']*'",
    description: 'Matches single-quoted strings',
    example: "'Hello, World!'",
    category: 'Parsing',
  },
  {
    name: 'Markdown Link',
    pattern: '\\[([^\\]]+)\\]\\(([^)]+)\\)',
    description: 'Matches Markdown-style links',
    example: '[Example](https://example.com)',
    category: 'Parsing',
  },
  {
    name: 'Markdown Image',
    pattern: '!\\[([^\\]]*)\\]\\(([^)]+)\\)',
    description: 'Matches Markdown image syntax',
    example: '![Alt text](image.png)',
    category: 'Parsing',
  },
  {
    name: 'Hashtag',
    pattern: '#\\w+',
    description: 'Matches hashtags',
    example: '#regex #coding',
    category: 'Parsing',
  },
  {
    name: 'Mention',
    pattern: '@\\w+',
    description: 'Matches @mentions',
    example: '@username',
    category: 'Parsing',
  },
  {
    name: 'CamelCase',
    pattern: '[a-z]+(?:[A-Z][a-z]+)*',
    description: 'Matches camelCase identifiers',
    example: 'camelCaseVariable',
    category: 'Format',
  },
  {
    name: 'PascalCase',
    pattern: '[A-Z][a-z]+(?:[A-Z][a-z]+)*',
    description: 'Matches PascalCase identifiers',
    example: 'PascalCaseVariable',
    category: 'Format',
  },
  {
    name: 'Snake Case',
    pattern: '[a-z]+(?:_[a-z]+)*',
    description: 'Matches snake_case identifiers',
    example: 'snake_case_variable',
    category: 'Format',
  },
  {
    name: 'Kebab Case',
    pattern: '[a-z]+(?:-[a-z]+)*',
    description: 'Matches kebab-case identifiers',
    example: 'kebab-case-variable',
    category: 'Format',
  },
  {
    name: 'File Extension',
    pattern: '\\.([a-zA-Z0-9]+)$',
    description: 'Matches file extensions',
    example: 'document.pdf',
    category: 'Parsing',
  },
  {
    name: 'File Path (Unix)',
    pattern: '^(?:\\/|(?:\\/[\\w\\.\\-]+)+\\/?)$',
    description: 'Matches Unix-style file paths',
    example: '/home/user/file.txt',
    category: 'Parsing',
  },
  {
    name: 'File Path (Windows)',
    pattern: '^[A-Za-z]:\\(?:[^\\\\/:*?"<>|\\r\\n]+\\\\)*[^\\\\/:*?"<>|\\r\\n]*$',
    description: 'Matches Windows file paths',
    example: 'C:\\Users\\file.txt',
    category: 'Parsing',
  },
  {
    name: 'URL Query Parameter',
    pattern: '([?&])([^=]+)=([^&]+)',
    description: 'Matches URL query parameters',
    example: '?name=value&key=data',
    category: 'Parsing',
  },
  {
    name: 'CSS Selector',
    pattern: '^[.#]?[a-zA-Z][a-zA-Z0-9_-]*$',
    description: 'Matches simple CSS selectors',
    example: '.my-class #my-id',
    category: 'Parsing',
  },
  {
    name: 'CSS Property',
    pattern: '^[a-z-]+:\\s*[^;]+;?$',
    description: 'Matches CSS property declarations',
    example: 'color: red;',
    category: 'Parsing',
  },
  {
    name: 'JavaScript Variable',
    pattern: '^(?:var|let|const)\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*=',
    description: 'Matches JavaScript variable declarations',
    example: 'const myVar = 123;',
    category: 'Parsing',
  },
  {
    name: 'Function Call',
    pattern: '([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*\\(',
    description: 'Matches function calls',
    example: 'myFunction(',
    category: 'Parsing',
  },
  {
    name: 'Comment (Single Line)',
    pattern: '//.*$',
    description: 'Matches single-line comments',
    example: '// This is a comment',
    category: 'Parsing',
  },
  {
    name: 'Comment (Multi Line)',
    pattern: '/\\*[\\s\\S]*?\\*/',
    description: 'Matches multi-line comments',
    example: '/* Multi\nline\ncomment */',
    category: 'Parsing',
  },
  {
    name: 'Currency (USD)',
    pattern: '^\\$\\d{1,3}(?:,\\d{3})*(?:\\.\\d{2})?$',
    description: 'Matches US dollar amounts',
    example: '$1,234.56',
    category: 'Format',
  },
  {
    name: 'Percentage',
    pattern: '^\\d+(?:\\.\\d+)?%$',
    description: 'Matches percentage values',
    example: '45.5%',
    category: 'Format',
  },
  {
    name: 'Scientific Notation',
    pattern: '^-?\\d+\\.?\\d*[eE][+-]?\\d+$',
    description: 'Matches scientific notation numbers',
    example: '1.23e-4',
    category: 'Format',
  },
  {
    name: 'Roman Numeral',
    pattern: '^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$',
    description: 'Matches Roman numerals',
    example: 'MMXXIV',
    category: 'Format',
  },
  {
    name: 'Credit Card CVV',
    pattern: '^\\d{3,4}$',
    description: 'Matches credit card CVV codes',
    example: '123',
    category: 'Validation',
  },
  {
    name: 'License Plate (US)',
    pattern: '^[A-Z]{1,2}\\d{1,6}$',
    description: 'Matches US license plate formats',
    example: 'AB1234',
    category: 'Validation',
  },
]

export const PATTERN_CATEGORIES = Array.from(new Set(COMMON_PATTERNS.map((p) => p.category)))

export interface RegexExample {
  name: string
  pattern: string
  testString: string
  replaceString?: string
  flags?: Partial<RegexFlags>
  description?: string
}

export const REGEX_EXAMPLES: RegexExample[] = [
  {
    name: 'Email Extraction',
    pattern: '\\b\\w+@\\w+\\.\\w+\\b',
    testString: 'Contact us at support@example.com or sales@company.org for more information.',
    replaceString: '[EMAIL]',
    description: 'Find and replace email addresses',
  },
  {
    name: 'Phone Number Extraction',
    pattern: '\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b',
    testString: 'Call us at 555-123-4567 or 555.987.6543 for support.',
    replaceString: '[PHONE]',
    description: 'Find phone numbers in various formats',
  },
  {
    name: 'URL Extraction',
    pattern: 'https?:\\/\\/[^\\s]+',
    testString: 'Visit https://example.com and http://test.org for more info.',
    replaceString: '[URL]',
    description: 'Extract HTTP/HTTPS URLs from text',
  },
  {
    name: 'Date Extraction',
    pattern: '\\b\\d{4}-\\d{2}-\\d{2}\\b',
    testString: 'Events on 2024-12-25, 2024-01-01, and 2024-06-15.',
    replaceString: '[DATE]',
    description: 'Find dates in YYYY-MM-DD format',
  },
  {
    name: 'IP Address Extraction',
    pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
    testString: 'Servers at 192.168.1.1, 10.0.0.1, and 172.16.0.1.',
    replaceString: '[IP]',
    description: 'Extract IPv4 addresses',
  },
  {
    name: 'Hashtag Extraction',
    pattern: '#\\w+',
    testString: 'Check out #regex #coding #javascript for tips!',
    replaceString: '',
    flags: { global: true },
    description: 'Find all hashtags in text',
  },
  {
    name: 'Word Count',
    pattern: '\\b\\w+\\b',
    testString: 'This is a sample text with multiple words.',
    replaceString: '',
    flags: { global: true },
    description: 'Match all words for counting',
  },
  {
    name: 'HTML Tag Removal',
    pattern: '<[^>]+>',
    testString: '<div>Hello</div> <span>World</span>',
    replaceString: '',
    flags: { global: true },
    description: 'Remove all HTML tags',
  },
  {
    name: 'Credit Card Masking',
    pattern: '\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?(\\d{4})\\b',
    testString: 'Card: 4532-1234-5678-9010',
    replaceString: '****-****-****-$1',
    description: 'Mask credit card numbers (shows last 4 digits)',
  },
  {
    name: 'CamelCase to Snake Case',
    pattern: '([a-z])([A-Z])',
    testString: 'camelCaseVariable',
    replaceString: '$1_$2',
    flags: { global: true },
    description: 'Convert camelCase to snake_case',
  },
  {
    name: 'Multiple Spaces',
    pattern: '\\s{2,}',
    testString: 'Text    with     multiple    spaces.',
    replaceString: ' ',
    flags: { global: true },
    description: 'Replace multiple spaces with single space',
  },
  {
    name: 'Email Domain Extraction',
    pattern: '@([\\w.-]+)',
    testString: 'Contact admin@example.com or user@test.org',
    replaceString: '',
    flags: { global: true },
    description: 'Extract email domains',
  },
  {
    name: 'Number Extraction',
    pattern: '\\b\\d+\\.?\\d*\\b',
    testString: 'Prices: $19.99, $100, and $45.50',
    replaceString: '',
    flags: { global: true },
    description: 'Find all numbers in text',
  },
  {
    name: 'Quoted Text',
    pattern: '"([^"]*)"',
    testString: 'He said "Hello World" and "Goodbye".',
    replaceString: '',
    flags: { global: true },
    description: 'Extract text within double quotes',
  },
  {
    name: 'Markdown Links',
    pattern: '\\[([^\\]]+)\\]\\(([^)]+)\\)',
    testString: 'Check [this link](https://example.com) and [another](https://test.org)',
    replaceString: '',
    flags: { global: true },
    description: 'Extract Markdown-style links',
  },
  {
    name: 'Time Extraction',
    pattern: '\\b\\d{1,2}:\\d{2}(?:\\s?[AP]M)?\\b',
    testString: 'Meeting at 14:30, 3:45 PM, and 09:00',
    replaceString: '',
    flags: { global: true },
    description: 'Find time expressions',
  },
  {
    name: 'UUID Extraction',
    pattern: '\\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\b',
    testString: 'IDs: 550e8400-e29b-41d4-a716-446655440000 and f47ac10b-58cc-4372-a567-0e02b2c3d479',
    replaceString: '',
    flags: { global: true, caseInsensitive: true },
    description: 'Extract UUIDs from text',
  },
  {
    name: 'Hex Color Codes',
    pattern: '#[0-9A-Fa-f]{6}',
    testString: 'Colors: #FF5733, #33FF57, and #3357FF',
    replaceString: '',
    flags: { global: true },
    description: 'Find hex color codes',
  },
  {
    name: 'File Extensions',
    pattern: '\\.([a-zA-Z0-9]+)(?=\\s|$)',
    testString: 'Files: document.pdf, image.jpg, script.js',
    replaceString: '',
    flags: { global: true },
    description: 'Extract file extensions',
  },
  {
    name: 'Social Media Handles',
    pattern: '@[\\w]+',
    testString: 'Follow @username and @another_user for updates',
    replaceString: '',
    flags: { global: true },
    description: 'Find social media @mentions',
  },
  {
    name: 'Version Numbers',
    pattern: '\\b\\d+\\.\\d+(?:\\.\\d+)?(?:-[\\w]+)?\\b',
    testString: 'Versions: 1.2.3, 2.0.1-beta, and 3.5',
    replaceString: '',
    flags: { global: true },
    description: 'Extract semantic version numbers',
  },
  {
    name: 'Phone Number Groups',
    pattern: '\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})',
    testString: 'Call (555) 123-4567 or 555.987.6543',
    replaceString: '($1) $2-$3',
    flags: { global: true },
    description: 'Extract and reformat phone numbers using groups',
  },
  {
    name: 'Email Groups (User & Domain)',
    pattern: '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
    testString: 'Contact admin@example.com or user@test.org',
    replaceString: 'User: $1, Domain: $2',
    flags: { global: true },
    description: 'Extract username and domain from emails',
  },
  {
    name: 'Date Groups (Year, Month, Day)',
    pattern: '(\\d{4})-(\\d{2})-(\\d{2})',
    testString: 'Dates: 2024-12-25, 2024-01-01, 2024-06-15',
    replaceString: 'Month: $2, Day: $3, Year: $1',
    flags: { global: true },
    description: 'Extract year, month, and day from dates',
  },
  {
    name: 'URL Groups (Protocol, Domain, Path)',
    pattern: '(https?)://([^/]+)(/.*)?',
    testString: 'Visit https://example.com/path and http://test.org',
    replaceString: 'Protocol: $1, Domain: $2, Path: $3',
    flags: { global: true },
    description: 'Extract protocol, domain, and path from URLs',
  },
  {
    name: 'Named Groups - Email',
    pattern: '(?<username>[a-zA-Z0-9._%+-]+)@(?<domain>[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
    testString: 'Contact admin@example.com or user@test.org',
    replaceString: '',
    flags: { global: true },
    description: 'Extract email using named groups',
  },
  {
    name: 'Named Groups - Date',
    pattern: '(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})',
    testString: 'Events on 2024-12-25 and 2024-01-01',
    replaceString: '',
    flags: { global: true },
    description: 'Extract date components using named groups',
  },
  {
    name: 'IP Address Groups',
    pattern: '(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})',
    testString: 'Servers: 192.168.1.1, 10.0.0.1, 172.16.0.1',
    replaceString: 'Octet1: $1, Octet2: $2, Octet3: $3, Octet4: $4',
    flags: { global: true },
    description: 'Extract each octet from IP addresses',
  },
  {
    name: 'Markdown Link Groups',
    pattern: '\\[([^\\]]+)\\]\\(([^)]+)\\)',
    testString: 'Links: [Example](https://example.com) and [Test](https://test.org)',
    replaceString: 'Text: "$1", URL: "$2"',
    flags: { global: true },
    description: 'Extract link text and URL from Markdown links',
  },
  {
    name: 'Time Groups (Hours & Minutes)',
    pattern: '(\\d{1,2}):(\\d{2})(?:\\s?([AP]M))?',
    testString: 'Times: 14:30, 3:45 PM, and 09:00',
    replaceString: '$1:$2$3',
    flags: { global: true },
    description: 'Extract and reformat times (24h format or with AM/PM)',
  },
  {
    name: 'RGB Color Groups',
    pattern: 'rgb\\((\\d{1,3}),\\s*(\\d{1,3}),\\s*(\\d{1,3})\\)',
    testString: 'Colors: rgb(255, 99, 71) and rgb(50, 150, 200)',
    replaceString: 'R: $1, G: $2, B: $3',
    flags: { global: true },
    description: 'Extract RGB color components',
  },
  {
    name: 'Version Number Groups',
    pattern: '(\\d+)\\.(\\d+)(?:\\.(\\d+))?(?:-([\\w]+))?',
    testString: 'Versions: 1.2.3, 2.0.1-beta, and 3.5',
    replaceString: 'v$1.$2.$3$4',
    flags: { global: true },
    description: 'Reformat version numbers (handles optional patch and pre-release)',
  },
  {
    name: 'File Path Groups',
    pattern: '([\\\\/]?(?:[^\\\\/\\s]+[\\\\/])+)([^\\\\/\\s]+)\\.([^\\s.]+)',
    testString: 'Paths: /home/user/file.txt and C:\\Users\\doc.pdf',
    replaceString: 'Directory: $1, Filename: $2, Extension: $3',
    flags: { global: true },
    description: 'Extract directory, filename, and extension',
  },
  {
    name: 'Credit Card Groups',
    pattern: '(\\d{4})[\\s-]?(\\d{4})[\\s-]?(\\d{4})[\\s-]?(\\d{4})',
    testString: 'Cards: 4532-1234-5678-9010 and 5555 4444 3333 2222',
    replaceString: 'Group1: $1, Group2: $2, Group3: $3, Group4: $4',
    flags: { global: true },
    description: 'Extract credit card number groups',
  },
]

// Default example (for backward compatibility)
export const REGEX_EXAMPLES_DEFAULT = REGEX_EXAMPLES[0]
