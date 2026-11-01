/**
 * Base Encoder/Decoder Configuration
 * Options and settings for base encoding and decoding tool
 */

export const BASE_ENCODING_TYPES = [
  {
    value: 'base64',
    label: 'Base64',
    symbol: '🔢',
    description: 'Standard Base64 encoding (RFC 4648)',
  },
  {
    value: 'base64url',
    label: 'Base64URL',
    symbol: '🔗',
    description: 'URL-safe Base64 encoding (RFC 4648 §5)',
  },
  {
    value: 'base32',
    label: 'Base32',
    symbol: '📝',
    description: 'Standard Base32 encoding (RFC 4648)',
  },
  {
    value: 'base32hex',
    label: 'Base32 Hex',
    symbol: '🔷',
    description: 'Base32 with hexadecimal character set',
  },
  {
    value: 'base16',
    label: 'Base16 (Hex)',
    symbol: '🔷',
    description: 'Hexadecimal encoding',
  },
  {
    value: 'base85',
    label: 'Base85 (Ascii85)',
    symbol: '📊',
    description: 'Ascii85 encoding (RFC 1924)',
  },
] as const

export const BASE64_VARIANTS = [
  { value: 'standard', label: 'Standard', description: 'Standard Base64 with padding' },
  { value: 'urlSafe', label: 'URL-Safe', description: 'URL-safe Base64 (-_ instead of +/)' },
  { value: 'mime', label: 'MIME', description: 'MIME format with line breaks' },
] as const

export const LINE_WRAP_OPTIONS = [
  { value: 0, label: 'No wrapping' },
  { value: 64, label: '64 characters' },
  { value: 76, label: '76 characters (MIME standard)' },
  { value: 80, label: '80 characters' },
] as const

export const HEX_CASE_OPTIONS = [
  { value: 'lowercase', label: 'Lowercase' },
  { value: 'uppercase', label: 'Uppercase' },
] as const

export const BASE_ENCODING_OPTIONS = {
  encodingTypes: BASE_ENCODING_TYPES,
  base64Variants: BASE64_VARIANTS,
  lineWrapOptions: LINE_WRAP_OPTIONS,
  hexCaseOptions: HEX_CASE_OPTIONS,
} as const

export const DEFAULT_BASE_OPTIONS = {
  encodingType: 'base64' as const,
  variant: 'standard' as const,
  padding: true,
  lineWrap: 0,
  hexCase: 'lowercase' as const,
}

export const BASE_EXAMPLES = {
  simple: 'Hello, World!',
  json: '{"name":"John","age":30}',
  url: 'https://example.com/path?query=value',
  binary: 'Binary data example',
  unicode: 'Hello 世界 🌍',
  multiline: 'Line 1\nLine 2\nLine 3',
  specialChars: 'Special: !@#$%^&*()',
  empty: '',
}

export const BASE_ENCODED_EXAMPLES = {
  base64_simple: 'SGVsbG8sIFdvcmxkIQ==',
  base64url_simple: 'SGVsbG8sIFdvcmxkIQ',
  base32_simple: 'JBSWY3DPFQQHO33SNRSCC===',
  base16_simple: '48656c6c6f2c20576f726c6421',
  base64_json: 'eyJuYW1lIjoiSm9obiIsImFnZSI6MzB9',
  base64_unicode: 'SGVsbG8g5LiW5L2gIOKYjeKbjQ==',
}

export const BASE_EXAMPLE_SETS = {
  simple: ['Hello, World!', 'Base64 encoding test', 'Quick brown fox'],
  json: ['{"name":"John","age":30}', '{"users":["Alice","Bob"]}', '{"data":{"key":"value"}}'],
  urls: [
    'https://example.com/path',
    'https://api.example.com/v1/users?id=123',
    'https://example.com/search?q=test&lang=en',
  ],
  unicode: ['Hello 世界', 'Bonjour le monde 🌍', 'Привет мир'],
  binary: ['Binary data example', 'File content here', 'Raw bytes data'],
}

export const BASE_VALIDATION_RULES = {
  base64: {
    description: 'Standard Base64 encoding using A-Z, a-z, 0-9, +, /, and = padding',
    characters: 'A-Z, a-z, 0-9, +, /, =',
    useCase: 'Email attachments, data URIs, API tokens',
  },
  base64url: {
    description: 'URL-safe Base64 using - and _ instead of + and /',
    characters: 'A-Z, a-z, 0-9, -, _, =',
    useCase: 'URL parameters, JWT tokens, web-safe encoding',
  },
  base32: {
    description: 'Base32 encoding using A-Z and 2-7',
    characters: 'A-Z, 2-7, =',
    useCase: 'Case-insensitive encoding, file names',
  },
  base32hex: {
    description: 'Base32 with hexadecimal character set (0-9, A-V)',
    characters: '0-9, A-V, =',
    useCase: 'Case-insensitive hex-like encoding',
  },
  base16: {
    description: 'Hexadecimal encoding using 0-9 and A-F',
    characters: '0-9, A-F (or a-f)',
    useCase: 'Color codes, hash representations, binary data',
  },
  base85: {
    description: 'Ascii85 encoding for efficient binary encoding',
    characters: '! through u (ASCII 33-117)',
    useCase: 'PDF encoding, binary data compression',
  },
}

export const BASE_TOOL_DESCRIPTIONS = {
  base64:
    'Base64 encoding is commonly used for encoding binary data in text format. It uses 64 characters (A-Z, a-z, 0-9, +, /) and padding with =.',
  base64url:
    'Base64URL is a URL-safe variant of Base64 that uses - and _ instead of + and /, making it safe for use in URLs and filenames.',
  base32:
    'Base32 encoding uses only uppercase letters and numbers, making it case-insensitive and suitable for case-sensitive systems.',
  base32hex: 'Base32 Hex uses a hexadecimal character set (0-9, A-V) for case-insensitive encoding.',
  base16: 'Base16 (hexadecimal) encoding represents each byte as two hexadecimal digits (0-9, A-F).',
  base85: 'Base85 (Ascii85) encoding is more efficient than Base64, using 85 characters to represent binary data.',
}

export const BASE_USE_CASES = {
  base64: [
    'Email attachments (MIME)',
    'Data URIs in HTML/CSS',
    'API authentication tokens',
    'Binary data in JSON',
    'Image encoding',
  ],
  base64url: ['JWT tokens', 'URL parameters', 'Web-safe encoding', 'Filename encoding'],
  base32: ['Case-insensitive systems', 'File naming', 'Human-readable encoding', 'DNS encoding'],
  base16: ['Color codes (hex)', 'Hash representations', 'Binary data display', 'Memory addresses'],
  base85: ['PDF encoding', 'Binary data compression', 'Efficient encoding'],
}

export const BASE_STATISTICS_LABELS = {
  originalLength: 'Original Length',
  encodedLength: 'Encoded Length',
  sizeChange: 'Size Change',
  encodingEfficiency: 'Encoding Efficiency',
  paddingChars: 'Padding Characters',
  lineBreaks: 'Line Breaks',
}

export const BASE_HELP_TEXT = {
  base64: 'Use Base64 for encoding binary data in text format. Standard Base64 uses + and / characters.',
  base64url: 'Use Base64URL for URL-safe encoding. It uses - and _ instead of + and /.',
  base32: 'Use Base32 for case-insensitive encoding. It only uses uppercase letters and numbers.',
  base16: 'Use Base16 (hex) for hexadecimal representation. Each byte becomes two hex digits.',
  base85: 'Use Base85 for more efficient encoding than Base64. It uses 85 characters.',
  examples: 'Try the examples below to see how different data types are encoded.',
  validation: 'Invalid encoded strings will show error messages. Make sure your input is properly formatted.',
}

export const BASE_ERROR_MESSAGES = {
  invalidInput: 'Invalid input format. Please check your input.',
  encodingError: 'Error during encoding. Please try again.',
  decodingError: 'Error during decoding. The input may not be properly encoded.',
  invalidCharacters: 'Invalid characters for this encoding type.',
  emptyInput: 'Please enter text to encode or decode.',
  paddingError: 'Invalid padding in encoded string.',
  lengthError: 'Input length is not valid for this encoding type.',
}
