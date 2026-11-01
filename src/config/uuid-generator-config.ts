import { UuidFormat, UuidHyphens, UuidVersion } from '@/libs/uuid-generator'

export const UUID_VERSIONS: { value: UuidVersion; label: string; symbol: string; description: string }[] = [
  {
    value: 'v1',
    label: 'Version 1 (Timestamp)',
    symbol: '🕐',
    description: 'Based on timestamp and MAC address',
  },
  {
    value: 'v4',
    label: 'Version 4 (Random)',
    symbol: '🎲',
    description: 'Random or pseudo-random',
  },
  {
    value: 'v5',
    label: 'Version 5 (Namespace)',
    symbol: '🏷️',
    description: 'Based on namespace and name',
  },
  {
    value: 'v7',
    label: 'Version 7 (Time-ordered)',
    symbol: '⏰',
    description: 'Time-ordered with random data',
  },
]

export const UUID_FORMATS: { value: UuidFormat; label: string; symbol: string }[] = [
  {
    value: 'lowercase',
    label: 'Lowercase',
    symbol: '🔤',
  },
  {
    value: 'uppercase',
    label: 'Uppercase',
    symbol: '🔠',
  },
]

export const UUID_HYPHENS: { value: UuidHyphens; label: string; symbol: string; description: string }[] = [
  {
    value: 'include',
    label: 'Include Hyphens',
    symbol: '➖',
    description: 'Standard format with hyphens (8-4-4-4-12)',
  },
  {
    value: 'exclude',
    label: 'Exclude Hyphens',
    symbol: '🔗',
    description: 'Compact format without hyphens (32 characters)',
  },
]

export const DEFAULT_UUID_OPTIONS = {
  version: 'v4' as UuidVersion,
  format: 'lowercase' as UuidFormat,
  hyphens: 'include' as UuidHyphens,
  quantity: 1,
  namespace: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // DNS namespace for v5
  name: 'example.com',
}

export const UUID_EXAMPLES = {
  v1: '550e8400-e29b-11d4-a716-446655440000',
  v4: '550e8400-e29b-41d4-a716-446655440000',
  v5: '886313e1-3b8a-5372-9b90-0c9aee199e5d',
  v7: '018c4f94-14ea-7000-8000-000000000000',
}

export const UUID_EXAMPLES_NO_HYPHENS = {
  v1: '550e8400e29b11d4a716446655440000',
  v4: '550e8400e29b41d4a716446655440000',
  v5: '886313e13b8a53729b900c9aee199e5d',
  v7: '018c4f9414ea70008000000000000000',
}

export const UUID_EXAMPLE_SETS = {
  v1: [
    '550e8400-e29b-11d4-a716-446655440000',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  ],
  v4: [
    '550e8400-e29b-41d4-a716-446655440000',
    '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  ],
  v5: [
    '886313e1-3b8a-5372-9b90-0c9aee199e5d',
    '5df41881-3aed-3515-88a7-2f4a814cf09a',
    '21f7f8de-8051-5b89-8680-0195ef798b6a',
  ],
  v7: [
    '018c4f94-14ea-7000-8000-000000000000',
    '018c4f94-14ea-7001-8000-000000000000',
    '018c4f94-14ea-7002-8000-000000000000',
  ],
}

export const UUID_NAMESPACES = {
  dns: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  url: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  oid: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  x500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
}

export const UUID_NAMESPACE_OPTIONS = [
  { value: UUID_NAMESPACES.dns, label: 'DNS', description: 'Domain names' },
  { value: UUID_NAMESPACES.url, label: 'URL', description: 'Uniform Resource Locators' },
  { value: UUID_NAMESPACES.oid, label: 'OID', description: 'Object identifiers' },
  { value: UUID_NAMESPACES.x500, label: 'X.500', description: 'X.500 Distinguished Names' },
]

export const UUID_QUANTITY_LIMITS = {
  min: 1,
  max: 100,
  default: 1,
}

export const UUID_VALIDATION_RULES = {
  v1: {
    required: [],
    optional: ['namespace', 'name'],
  },
  v4: {
    required: [],
    optional: ['namespace', 'name'],
  },
  v5: {
    required: ['namespace', 'name'],
    optional: [],
  },
  v7: {
    required: [],
    optional: ['namespace', 'name'],
  },
}

export const UUID_TOOL_DESCRIPTIONS = {
  v1: 'Version 1 UUIDs are based on timestamp and MAC address, making them somewhat predictable but unique across time and space.',
  v4: 'Version 4 UUIDs are randomly or pseudo-randomly generated, providing the highest level of uniqueness.',
  v5: 'Version 5 UUIDs are generated using a namespace and name, ensuring the same input always produces the same UUID.',
  v7: 'Version 7 UUIDs are time-ordered with random data, providing both uniqueness and sortability by generation time.',
}

export const UUID_USE_CASES = {
  v1: ['Database primary keys', 'Distributed systems', 'Time-based ordering'],
  v4: ['Session IDs', 'API tokens', 'Random identifiers'],
  v5: ['Content addressing', 'Deterministic IDs', 'Namespace-based systems'],
  v7: ['Time-ordered IDs', 'Event logging', 'Sortable identifiers', 'Modern applications'],
}
