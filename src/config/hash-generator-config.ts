import { HashAlgorithm } from '@/libs/hash-generator'

export interface HashAlgorithmOption {
  value: HashAlgorithm
  label: string
  description: string
  security: 'deprecated' | 'weak' | 'strong' | 'very-strong'
}

export const HASH_ALGORITHMS: HashAlgorithmOption[] = [
  {
    value: 'MD5',
    label: 'MD5',
    description: '128-bit hash (cryptographically broken, not recommended)',
    security: 'deprecated',
  },
  {
    value: 'SHA-1',
    label: 'SHA-1',
    description: '160-bit hash (deprecated, not recommended)',
    security: 'deprecated',
  },
  {
    value: 'SHA-256',
    label: 'SHA-256',
    description: '256-bit hash (recommended for most use cases)',
    security: 'strong',
  },
  {
    value: 'SHA-384',
    label: 'SHA-384',
    description: '384-bit hash (high security)',
    security: 'very-strong',
  },
  {
    value: 'SHA-512',
    label: 'SHA-512',
    description: '512-bit hash (maximum security)',
    security: 'very-strong',
  },
  {
    value: 'SHA3-256',
    label: 'SHA3-256',
    description: 'SHA-3 256-bit hash (modern standard)',
    security: 'strong',
  },
  {
    value: 'SHA3-384',
    label: 'SHA3-384',
    description: 'SHA-3 384-bit hash (modern high security)',
    security: 'very-strong',
  },
  {
    value: 'SHA3-512',
    label: 'SHA3-512',
    description: 'SHA-3 512-bit hash (modern maximum security)',
    security: 'very-strong',
  },
]

export const HASH_OUTPUT_FORMATS = [
  {
    value: 'hex' as const,
    label: 'Hexadecimal',
    description: 'Lowercase hex string (e.g., a1b2c3)',
  },
  {
    value: 'base64' as const,
    label: 'Base64',
    description: 'Base64 encoded string',
  },
]

export const HASH_SALT_POSITIONS = [
  {
    value: 'none' as const,
    label: 'No Salt',
    description: 'Hash input without salt',
  },
  {
    value: 'prefix' as const,
    label: 'Prefix',
    description: 'Add salt before input',
  },
  {
    value: 'suffix' as const,
    label: 'Suffix',
    description: 'Add salt after input',
  },
]

export const DEFAULT_HASH_OPTIONS = {
  algorithm: 'SHA-256' as HashAlgorithm,
  input: '',
  salt: '',
  saltPosition: 'none' as const,
  outputFormat: 'hex' as const,
  uppercase: false,
}

// Note: Hash examples will be generated dynamically, so we only store the input
export const HASH_EXAMPLE_INPUTS: Partial<Record<HashAlgorithm, string>> = {
  MD5: 'Hello, World!',
  'SHA-256': 'Hello, World!',
  'SHA-512': 'Hello, World!',
  'SHA-384': 'Hello, World!',
  'SHA-1': 'Hello, World!',
  'SHA3-256': 'Hello, World!',
  'SHA3-384': 'Hello, World!',
  'SHA3-512': 'Hello, World!',
}

export const HASH_USE_CASES = {
  MD5: ['Legacy systems', 'Non-security applications', 'Checksums (non-cryptographic)'],
  'SHA-1': ['Legacy systems', 'Non-security applications'],
  'SHA-256': ['Password hashing', 'File integrity', 'Digital signatures', 'Blockchain'],
  'SHA-384': ['High-security applications', 'Government systems'],
  'SHA-512': ['Maximum security', 'Cryptographic keys', 'Sensitive data'],
  'SHA3-256': ['Modern applications', 'Post-quantum security'],
  'SHA3-384': ['High-security modern systems'],
  'SHA3-512': ['Maximum security modern systems'],
}

export const HASH_SECURITY_NOTES = {
  MD5: 'MD5 is cryptographically broken and should never be used for security purposes. It is vulnerable to collision attacks and should only be used for non-cryptographic checksums.',
  'SHA-1':
    'SHA-1 is deprecated and should not be used for security-sensitive applications. It is vulnerable to collision attacks.',
  'SHA-256': 'SHA-256 is widely used and considered secure for most applications. Recommended for general use.',
  'SHA-384': 'SHA-384 provides higher security than SHA-256 and is recommended for high-security applications.',
  'SHA-512': 'SHA-512 provides maximum security and is recommended for cryptographic keys and sensitive data.',
  'SHA3-256': 'SHA-3 is the latest standard and provides good security with modern cryptographic properties.',
  'SHA3-384': 'SHA-3 384-bit provides high security with modern cryptographic properties.',
  'SHA3-512': 'SHA-3 512-bit provides maximum security with modern cryptographic properties.',
}
