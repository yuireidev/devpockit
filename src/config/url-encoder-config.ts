/**
 * URL Encoder/Decoder Configuration
 * Options and settings for URL encoding and decoding tool
 */

export const URL_ENCODING_TYPES = [
  {
    value: 'url',
    label: 'URL Encoding (encodeURIComponent)',
    symbol: '🔗',
    description: 'Encodes special characters for URL components (query parameters, fragments)',
  },
  {
    value: 'uri',
    label: 'URI Encoding (encodeURI)',
    symbol: '🌐',
    description: 'Encodes full URIs while preserving URL structure',
  },
  {
    value: 'custom',
    label: 'Custom Character Set',
    symbol: '⚙️',
    description: 'Define custom characters to encode',
  },
] as const

export const URL_ENCODING_OPTIONS = {
  encodingTypes: URL_ENCODING_TYPES,
  preserveSpaces: [
    { value: false, label: 'Encode spaces as %20' },
    { value: true, label: 'Preserve spaces (not recommended for URLs)' },
  ],
  customChars: [
    { value: ' ', label: 'Spaces' },
    { value: '&', label: 'Ampersands' },
    { value: '=', label: 'Equals signs' },
    { value: '?', label: 'Question marks' },
    { value: '#', label: 'Hash symbols' },
    { value: '/', label: 'Forward slashes' },
    { value: '\\', label: 'Backslashes' },
    { value: ':', label: 'Colons' },
    { value: ';', label: 'Semicolons' },
    { value: ',', label: 'Commas' },
  ],
} as const

export const DEFAULT_URL_OPTIONS = {
  encodingType: 'url' as const,
  preserveSpaces: false,
  customChars: ' &?=#/:;,' as string,
}

export const URL_EXAMPLES = {
  simple: 'https://example.com',
  withParams: 'https://example.com/search?q=hello world&category=tools',
  specialChars: 'https://example.com/path with spaces/file.txt',
  unicode: 'https://example.com/测试/路径',
  complex: 'https://api.example.com/v1/users?name=John Doe&email=john@example.com&tags=developer,programmer',
  malformed: 'https://example.com/path with spaces and & symbols?param=value with spaces',
}

export const URL_ENCODED_EXAMPLES = {
  simple: 'https%3A%2F%2Fexample.com',
  withParams: 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26category%3Dtools',
  specialChars: 'https%3A%2F%2Fexample.com%2Fpath%20with%20spaces%2Ffile.txt',
  unicode: 'https%3A%2F%2Fexample.com%2F%E6%B5%8B%E8%AF%95%2F%E8%B7%AF%E5%BE%84',
  complex:
    'https%3A%2F%2Fapi.example.com%2Fv1%2Fusers%3Fname%3DJohn%20Doe%26email%3Djohn%40example.com%26tags%3Ddeveloper%2Cprogrammer',
  malformed: 'https%3A%2F%2Fexample.com%2Fpath%20with%20spaces%20and%20%26%20symbols%3Fparam%3Dvalue%20with%20spaces',
}

export const URL_EXAMPLE_SETS = {
  simple: ['https://example.com', 'http://localhost:3000', 'https://www.google.com'],
  withParams: [
    'https://example.com/search?q=hello world',
    'https://api.example.com/users?name=John Doe&age=30',
    'https://example.com/path?param1=value1&param2=value2',
  ],
  specialChars: [
    'https://example.com/path with spaces/file.txt',
    'https://example.com/folder/subfolder/file with spaces.pdf',
    'https://example.com/path/to/file with & symbols.txt',
  ],
  unicode: ['https://example.com/测试/路径', 'https://example.com/中文/页面', 'https://example.com/日本語/パス'],
  complex: [
    'https://api.example.com/v1/users?name=John Doe&email=john@example.com&tags=developer,programmer',
    'https://example.com/search?q=hello world&category=tools&sort=date&order=desc',
    'https://example.com/path?param1=value with spaces&param2=value&param3=another value',
  ],
}

export const URL_VALIDATION_RULES = {
  url: {
    description: 'Standard URL encoding for query parameters and fragments',
    characters: 'Encodes all special characters except alphanumeric and -_.~',
    useCase: 'Query parameters, form data, URL fragments',
  },
  uri: {
    description: 'Full URI encoding while preserving URL structure',
    characters: 'Encodes special characters but preserves ://, /, ?, #, &',
    useCase: 'Complete URLs, API endpoints, web addresses',
  },
  custom: {
    description: 'Custom character set encoding',
    characters: 'User-defined characters to encode',
    useCase: 'Specialized encoding requirements, legacy systems',
  },
}

export const URL_TOOL_DESCRIPTIONS = {
  url: 'URL encoding is used for query parameters, form data, and URL fragments. It encodes all special characters except alphanumeric characters and -_.~',
  uri: 'URI encoding is used for complete URLs and preserves the URL structure while encoding special characters. It maintains ://, /, ?, #, and & characters.',
  custom:
    'Custom encoding allows you to specify which characters to encode, useful for specialized requirements or legacy systems.',
}

export const URL_USE_CASES = {
  url: ['Query parameters in URLs', 'Form data encoding', 'URL fragments and anchors', 'API parameter encoding'],
  uri: ['Complete URL encoding', 'API endpoint URLs', 'Web address encoding', 'URL redirection'],
  custom: [
    'Legacy system compatibility',
    'Specialized encoding requirements',
    'Custom protocol handling',
    'Data migration scenarios',
  ],
}

export const URL_STATISTICS_LABELS = {
  originalLength: 'Original Length',
  encodedLength: 'Encoded Length',
  compressionRatio: 'Size Change',
  characterCount: 'Character Count',
  specialChars: 'Special Characters',
  spaces: 'Spaces',
  encodedSpaces: 'Encoded Spaces',
}

export const URL_HELP_TEXT = {
  url: 'Use URL encoding for query parameters, form data, and URL fragments. This is the most common encoding type.',
  uri: 'Use URI encoding for complete URLs. This preserves the URL structure while encoding special characters.',
  custom: 'Use custom encoding when you need to specify exactly which characters to encode.',
  examples: 'Try the examples below to see how different URL types are encoded.',
  validation: 'Invalid URLs will show error messages. Make sure your URL is properly formatted.',
}

export const URL_ERROR_MESSAGES = {
  invalidUrl: 'Invalid URL format. Please check your input.',
  encodingError: 'Error during encoding. Please try again.',
  decodingError: 'Error during decoding. The input may not be properly encoded.',
  customCharsError: 'Invalid custom characters. Please use valid characters.',
  emptyInput: 'Please enter a URL to encode or decode.',
  networkError: 'Network error. Please check your connection.',
}
