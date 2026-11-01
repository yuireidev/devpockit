import { v1 as uuidv1, v4 as uuidv4, v5 as uuidv5, v7 as uuidv7 } from 'uuid'

export type UuidVersion = 'v1' | 'v4' | 'v5' | 'v7'
export type UuidFormat = 'lowercase' | 'uppercase'
export type UuidHyphens = 'include' | 'exclude'

export interface UuidGenerationOptions {
  version: UuidVersion
  format: UuidFormat
  hyphens: UuidHyphens
  quantity: number
  namespace?: string
  name?: string
}

export interface UuidGenerationResult {
  uuids: string[]
  version: UuidVersion
  format: UuidFormat
  hyphens: UuidHyphens
  quantity: number
  totalLength: number
}

/**
 * Generate a single UUID based on version and format
 */
export function generateSingleUuid(
  version: UuidVersion,
  format: UuidFormat,
  hyphens: UuidHyphens,
  namespace?: string,
  name?: string
): string {
  let uuid: string

  switch (version) {
    case 'v1':
      uuid = uuidv1()
      break
    case 'v4':
      uuid = uuidv4()
      break
    case 'v5':
      if (!namespace || !name) {
        throw new Error('Namespace and name are required for v5 UUIDs')
      }
      uuid = uuidv5(name, namespace)
      break
    case 'v7':
      uuid = uuidv7()
      break
    default:
      throw new Error(`Unsupported UUID version: ${version}`)
  }

  // Apply format (uppercase/lowercase)
  uuid = format === 'uppercase' ? uuid.toUpperCase() : uuid.toLowerCase()

  // Apply hyphen option
  if (hyphens === 'exclude') {
    uuid = uuid.replace(/-/g, '')
  }

  return uuid
}

/**
 * Generate multiple UUIDs with the same options
 */
export function generateUuids(options: UuidGenerationOptions): UuidGenerationResult {
  const { version, format, hyphens, quantity, namespace, name } = options

  if (quantity < 1 || quantity > 100) {
    throw new Error('Quantity must be between 1 and 100')
  }

  const uuids: string[] = []

  for (let i = 0; i < quantity; i++) {
    const uuid = generateSingleUuid(version, format, hyphens, namespace, name)
    uuids.push(uuid)
  }

  const totalLength = uuids.join('\n').length

  return {
    uuids,
    version,
    format,
    hyphens,
    quantity,
    totalLength,
  }
}

/**
 * Validate UUID format
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Get UUID statistics
 */
export function getUuidStats(uuids: string[]): {
  count: number
  totalLength: number
  averageLength: number
  uniqueCount: number
  duplicates: number
} {
  const count = uuids.length
  const totalLength = uuids.join('\n').length
  const averageLength = count > 0 ? totalLength / count : 0
  const uniqueUuids = new Set(uuids)
  const uniqueCount = uniqueUuids.size
  const duplicates = count - uniqueCount

  return {
    count,
    totalLength,
    averageLength,
    uniqueCount,
    duplicates,
  }
}

/**
 * Get UUID version from UUID string
 */
export function getUuidVersion(uuid: string): UuidVersion | null {
  if (!isValidUuid(uuid)) {
    return null
  }

  // Check version by looking at the variant and version bits
  const version = parseInt(uuid.charAt(14), 16)

  switch (version) {
    case 1:
      return 'v1'
    case 4:
      return 'v4'
    case 5:
      return 'v5'
    case 7:
      return 'v7'
    default:
      return null
  }
}

/**
 * Format UUIDs for display
 */
export function formatUuidsForDisplay(uuids: string[], format: UuidFormat): string {
  const formattedUuids = uuids.map((uuid) => (format === 'uppercase' ? uuid.toUpperCase() : uuid.toLowerCase()))

  return formattedUuids.join('\n')
}
