/**
 * Base Encoder/Decoder Logic
 * Pure functions for base encoding, decoding, validation, and manipulation
 */

export type BaseEncodingType = 'base64' | 'base64url' | 'base32' | 'base32hex' | 'base16' | 'base85'
export type Base64Variant = 'standard' | 'urlSafe' | 'mime'
export type HexCase = 'lowercase' | 'uppercase'

export interface BaseEncoderOptions {
  encodingType: BaseEncodingType
  variant?: Base64Variant
  padding?: boolean
  lineWrap?: number
  hexCase?: HexCase
}

export interface BaseEncoderResult {
  encoded: string
  decoded: string
  isValid: boolean
  error?: string
  originalLength: number
  encodedLength: number
  compressionRatio: number
  encodingEfficiency: number
  characterAnalysis: {
    total: number
    paddingChars: number
    lineBreaks: number
    invalidChars: number
  }
}

// Base64 character sets
const BASE64_STANDARD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const BASE64_URL_SAFE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

// Base32 character sets
const BASE32_STANDARD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const BASE32_HEX = '0123456789ABCDEFGHIJKLMNOPQRSTUV'

// Base16 (hex) characters
const BASE16_LOWER = '0123456789abcdef'
const BASE16_UPPER = '0123456789ABCDEF'

// Base85 (Ascii85) character set
const BASE85_CHARS = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstu'

/**
 * Convert string to Uint8Array
 */
function stringToBytes(str: string): Uint8Array {
  const encoder = new TextEncoder()
  return encoder.encode(str)
}

/**
 * Convert Uint8Array to string
 */
function bytesToString(bytes: Uint8Array): string {
  const decoder = new TextDecoder()
  return decoder.decode(bytes)
}

/**
 * Encode Base64 (standard or URL-safe)
 */
function encodeBase64Internal(data: Uint8Array, urlSafe: boolean, padding: boolean): string {
  const alphabet = urlSafe ? BASE64_URL_SAFE : BASE64_STANDARD
  let result = ''

  for (let i = 0; i < data.length; i += 3) {
    const byte1 = data[i]
    const byte2 = i + 1 < data.length ? data[i + 1] : 0
    const byte3 = i + 2 < data.length ? data[i + 2] : 0

    const bitmap = (byte1 << 16) | (byte2 << 8) | byte3

    result += alphabet[(bitmap >> 18) & 63]
    result += alphabet[(bitmap >> 12) & 63]

    if (i + 1 < data.length) {
      result += alphabet[(bitmap >> 6) & 63]
    } else if (padding) {
      result += '='
    }

    if (i + 2 < data.length) {
      result += alphabet[bitmap & 63]
    } else if (padding) {
      result += '='
    }
  }

  return result
}

/**
 * Decode Base64 (standard or URL-safe)
 */
function decodeBase64Internal(encoded: string, urlSafe: boolean): Uint8Array {
  const alphabet = urlSafe ? BASE64_URL_SAFE : BASE64_STANDARD
  const lookup: Record<string, number> = {}

  for (let i = 0; i < alphabet.length; i++) {
    lookup[alphabet[i]] = i
  }

  // Remove padding and whitespace
  encoded = encoded.replace(/[=\s]/g, '')

  const bytes: number[] = []
  let buffer = 0
  let bitsCollected = 0

  for (const char of encoded) {
    const value = lookup[char]
    if (value === undefined) {
      throw new Error(`Invalid Base64 character: ${char}`)
    }

    buffer = (buffer << 6) | value
    bitsCollected += 6

    if (bitsCollected >= 8) {
      bytes.push((buffer >> (bitsCollected - 8)) & 0xff)
      bitsCollected -= 8
    }
  }

  return new Uint8Array(bytes)
}

/**
 * Encode Base32
 */
function encodeBase32Internal(data: Uint8Array, hex: boolean): string {
  const alphabet = hex ? BASE32_HEX : BASE32_STANDARD
  let result = ''

  let buffer = 0
  let bitsCollected = 0

  for (let i = 0; i < data.length; i++) {
    const byte = data[i]
    buffer = (buffer << 8) | byte
    bitsCollected += 8

    while (bitsCollected >= 5) {
      result += alphabet[(buffer >> (bitsCollected - 5)) & 31]
      bitsCollected -= 5
    }
  }

  if (bitsCollected > 0) {
    result += alphabet[(buffer << (5 - bitsCollected)) & 31]
  }

  // Add padding
  const padding = (8 - (result.length % 8)) % 8
  result += '='.repeat(padding)

  return result
}

/**
 * Decode Base32
 */
function decodeBase32Internal(encoded: string, hex: boolean): Uint8Array {
  const alphabet = hex ? BASE32_HEX : BASE32_STANDARD
  const lookup: Record<string, number> = {}

  for (let i = 0; i < alphabet.length; i++) {
    lookup[alphabet[i]] = i
  }

  // Remove padding and whitespace, convert to uppercase
  encoded = encoded.replace(/[=\s]/g, '').toUpperCase()

  const bytes: number[] = []
  let buffer = 0
  let bitsCollected = 0

  for (const char of encoded) {
    const value = lookup[char]
    if (value === undefined) {
      throw new Error(`Invalid Base32 character: ${char}`)
    }

    buffer = (buffer << 5) | value
    bitsCollected += 5

    while (bitsCollected >= 8) {
      bytes.push((buffer >> (bitsCollected - 8)) & 0xff)
      bitsCollected -= 8
    }
  }

  return new Uint8Array(bytes)
}

/**
 * Encode Base16 (hex)
 */
function encodeBase16Internal(data: Uint8Array, uppercase: boolean): string {
  const alphabet = uppercase ? BASE16_UPPER : BASE16_LOWER
  let result = ''

  for (let i = 0; i < data.length; i++) {
    const byte = data[i]
    result += alphabet[byte >> 4]
    result += alphabet[byte & 15]
  }

  return result
}

/**
 * Decode Base16 (hex)
 */
function decodeBase16Internal(encoded: string): Uint8Array {
  // Remove whitespace and common prefixes
  encoded = encoded.replace(/[\s0x\\x]/gi, '')

  if (encoded.length % 2 !== 0) {
    throw new Error('Invalid hex string length')
  }

  const bytes: number[] = []

  for (let i = 0; i < encoded.length; i += 2) {
    const hexByte = encoded.substr(i, 2)
    const byte = parseInt(hexByte, 16)

    if (isNaN(byte)) {
      throw new Error(`Invalid hex character: ${hexByte}`)
    }

    bytes.push(byte)
  }

  return new Uint8Array(bytes)
}

/**
 * Encode Base85 (Ascii85)
 */
function encodeBase85Internal(data: Uint8Array): string {
  let result = ''

  for (let i = 0; i < data.length; i += 4) {
    const byte1 = data[i] || 0
    const byte2 = i + 1 < data.length ? data[i + 1] : 0
    const byte3 = i + 2 < data.length ? data[i + 2] : 0
    const byte4 = i + 3 < data.length ? data[i + 3] : 0

    const value = (byte1 << 24) | (byte2 << 16) | (byte3 << 8) | byte4

    if (value === 0 && i + 4 <= data.length) {
      result += 'z'
      continue
    }

    const chars: string[] = []
    let temp = value

    for (let j = 0; j < 5; j++) {
      chars.unshift(BASE85_CHARS[temp % 85])
      temp = Math.floor(temp / 85)
    }

    // Remove leading zeros for partial groups
    const actualChars = i + 4 > data.length ? chars.slice(0, Math.ceil(((data.length - i) * 5) / 4)) : chars

    result += actualChars.join('')
  }

  return result
}

/**
 * Decode Base85 (Ascii85)
 */
function decodeBase85Internal(encoded: string): Uint8Array {
  const lookup: Record<string, number> = {}

  for (let i = 0; i < BASE85_CHARS.length; i++) {
    lookup[BASE85_CHARS[i]] = i
  }

  // Remove whitespace
  encoded = encoded.replace(/\s/g, '')

  const bytes: number[] = []
  let i = 0

  while (i < encoded.length) {
    if (encoded[i] === 'z') {
      bytes.push(0, 0, 0, 0)
      i++
      continue
    }

    let value = 0
    let charCount = 0

    for (let j = 0; j < 5 && i + j < encoded.length; j++) {
      const char = encoded[i + j]
      if (char === 'z') break

      const digit = lookup[char]
      if (digit === undefined) {
        throw new Error(`Invalid Base85 character: ${char}`)
      }

      value = value * 85 + digit
      charCount++
    }

    i += charCount

    // Convert value to bytes
    const byte1 = (value >> 24) & 0xff
    const byte2 = (value >> 16) & 0xff
    const byte3 = (value >> 8) & 0xff
    const byte4 = value & 0xff

    if (charCount >= 1) bytes.push(byte1)
    if (charCount >= 2) bytes.push(byte2)
    if (charCount >= 3) bytes.push(byte3)
    if (charCount >= 4) bytes.push(byte4)
  }

  return new Uint8Array(bytes)
}

/**
 * Add line breaks to encoded string
 */
function addLineBreaks(encoded: string, lineWrap: number): string {
  if (lineWrap <= 0) return encoded

  const lines: string[] = []
  for (let i = 0; i < encoded.length; i += lineWrap) {
    lines.push(encoded.substr(i, lineWrap))
  }
  return lines.join('\n')
}

/**
 * Remove line breaks from encoded string
 */
function removeLineBreaks(encoded: string): string {
  return encoded.replace(/\r?\n/g, '')
}

/**
 * Analyze character composition
 */
function analyzeCharacters(
  encoded: string,
  encodingType: BaseEncodingType
): {
  total: number
  paddingChars: number
  lineBreaks: number
  invalidChars: number
} {
  const total = encoded.length
  const paddingChars = (encoded.match(/=/g) || []).length
  const lineBreaks = (encoded.match(/\n/g) || []).length

  let invalidChars = 0
  let validPattern: RegExp

  switch (encodingType) {
    case 'base64':
    case 'base64url':
      validPattern = /^[A-Za-z0-9+\/_-]*={0,2}$/
      break
    case 'base32':
    case 'base32hex':
      validPattern = /^[A-Z0-9=]*$/
      break
    case 'base16':
      validPattern = /^[0-9A-Fa-f\s]*$/
      break
    case 'base85':
      validPattern = /^[!-u\s]*$/
      break
    default:
      validPattern = /.*/
  }

  const cleanEncoded = removeLineBreaks(encoded.replace(/=/g, ''))
  for (const char of cleanEncoded) {
    if (!validPattern.test(char)) {
      invalidChars++
    }
  }

  return {
    total,
    paddingChars,
    lineBreaks,
    invalidChars,
  }
}

/**
 * Calculate compression ratio
 */
function calculateCompressionRatio(originalLength: number, encodedLength: number): number {
  if (originalLength === 0) return 0
  return ((encodedLength - originalLength) / originalLength) * 100
}

/**
 * Calculate encoding efficiency (bytes per character)
 */
function calculateEncodingEfficiency(originalBytes: number, encodedLength: number): number {
  if (encodedLength === 0) return 0
  return originalBytes / encodedLength
}

/**
 * Main encoding function
 */
export function encodeBase(text: string, options: BaseEncoderOptions): BaseEncoderResult {
  const originalLength = text.length
  const originalBytes = stringToBytes(text)
  let encoded: string
  let decoded: string
  let isValid = true
  let error: string | undefined

  try {
    let rawEncoded: string
    const urlSafe =
      options.encodingType === 'base64url' || (options.encodingType === 'base64' && options.variant === 'urlSafe')
    const padding = options.padding !== false
    const lineWrap = options.lineWrap || 0
    const hexCase = options.hexCase || 'lowercase'

    switch (options.encodingType) {
      case 'base64':
      case 'base64url':
        rawEncoded = encodeBase64Internal(originalBytes, urlSafe, padding)
        if (options.encodingType === 'base64' && options.variant === 'mime' && lineWrap === 0) {
          rawEncoded = addLineBreaks(rawEncoded, 76)
        } else if (lineWrap > 0) {
          rawEncoded = addLineBreaks(rawEncoded, lineWrap)
        }
        encoded = rawEncoded
        decoded = bytesToString(decodeBase64Internal(removeLineBreaks(encoded), urlSafe))
        break

      case 'base32':
        rawEncoded = encodeBase32Internal(originalBytes, false)
        if (lineWrap > 0) {
          rawEncoded = addLineBreaks(rawEncoded, lineWrap)
        }
        encoded = rawEncoded
        decoded = bytesToString(decodeBase32Internal(removeLineBreaks(encoded), false))
        break

      case 'base32hex':
        rawEncoded = encodeBase32Internal(originalBytes, true)
        if (lineWrap > 0) {
          rawEncoded = addLineBreaks(rawEncoded, lineWrap)
        }
        encoded = rawEncoded
        decoded = bytesToString(decodeBase32Internal(removeLineBreaks(encoded), true))
        break

      case 'base16':
        rawEncoded = encodeBase16Internal(originalBytes, hexCase === 'uppercase')
        if (lineWrap > 0) {
          rawEncoded = addLineBreaks(rawEncoded, lineWrap)
        }
        encoded = rawEncoded
        decoded = bytesToString(decodeBase16Internal(removeLineBreaks(encoded)))
        break

      case 'base85':
        rawEncoded = encodeBase85Internal(originalBytes)
        if (lineWrap > 0) {
          rawEncoded = addLineBreaks(rawEncoded, lineWrap)
        }
        encoded = rawEncoded
        decoded = bytesToString(decodeBase85Internal(removeLineBreaks(encoded)))
        break

      default:
        throw new Error('Invalid encoding type')
    }
  } catch (err) {
    isValid = false
    error = err instanceof Error ? err.message : 'Encoding error'
    encoded = ''
    decoded = text
  }

  const encodedLength = encoded.length
  const compressionRatio = calculateCompressionRatio(originalLength, encodedLength)
  const encodingEfficiency = calculateEncodingEfficiency(originalBytes.length, encodedLength)
  const characterAnalysis = analyzeCharacters(encoded, options.encodingType)

  return {
    encoded,
    decoded,
    isValid,
    error,
    originalLength,
    encodedLength,
    compressionRatio,
    encodingEfficiency,
    characterAnalysis,
  }
}

/**
 * Main decoding function
 */
export function decodeBase(encoded: string, options: BaseEncoderOptions): BaseEncoderResult {
  const originalLength = encoded.length
  let decoded: string
  let reEncoded: string
  let isValid = true
  let error: string | undefined

  try {
    const cleanEncoded = removeLineBreaks(encoded)
    const urlSafe =
      options.encodingType === 'base64url' || (options.encodingType === 'base64' && options.variant === 'urlSafe')
    const padding = options.padding !== false
    const lineWrap = options.lineWrap || 0
    const hexCase = options.hexCase || 'lowercase'

    let decodedBytes: Uint8Array

    switch (options.encodingType) {
      case 'base64':
      case 'base64url':
        decodedBytes = decodeBase64Internal(cleanEncoded, urlSafe)
        decoded = bytesToString(decodedBytes)
        reEncoded = encodeBase64Internal(decodedBytes, urlSafe, padding)
        if (options.encodingType === 'base64' && options.variant === 'mime' && lineWrap === 0) {
          reEncoded = addLineBreaks(reEncoded, 76)
        } else if (lineWrap > 0) {
          reEncoded = addLineBreaks(reEncoded, lineWrap)
        }
        break

      case 'base32':
        decodedBytes = decodeBase32Internal(cleanEncoded, false)
        decoded = bytesToString(decodedBytes)
        reEncoded = encodeBase32Internal(decodedBytes, false)
        if (lineWrap > 0) {
          reEncoded = addLineBreaks(reEncoded, lineWrap)
        }
        break

      case 'base32hex':
        decodedBytes = decodeBase32Internal(cleanEncoded, true)
        decoded = bytesToString(decodedBytes)
        reEncoded = encodeBase32Internal(decodedBytes, true)
        if (lineWrap > 0) {
          reEncoded = addLineBreaks(reEncoded, lineWrap)
        }
        break

      case 'base16':
        decodedBytes = decodeBase16Internal(cleanEncoded)
        decoded = bytesToString(decodedBytes)
        reEncoded = encodeBase16Internal(decodedBytes, hexCase === 'uppercase')
        if (lineWrap > 0) {
          reEncoded = addLineBreaks(reEncoded, lineWrap)
        }
        break

      case 'base85':
        decodedBytes = decodeBase85Internal(cleanEncoded)
        decoded = bytesToString(decodedBytes)
        reEncoded = encodeBase85Internal(decodedBytes)
        if (lineWrap > 0) {
          reEncoded = addLineBreaks(reEncoded, lineWrap)
        }
        break

      default:
        throw new Error('Invalid encoding type')
    }
  } catch (err) {
    isValid = false
    error = err instanceof Error ? err.message : 'Decoding error'
    decoded = ''
    reEncoded = encoded
  }

  const decodedLength = decoded.length
  const compressionRatio = calculateCompressionRatio(originalLength, decodedLength)
  const encodingEfficiency = calculateEncodingEfficiency(decodedLength, originalLength)
  const characterAnalysis = analyzeCharacters(encoded, options.encodingType)

  return {
    encoded: reEncoded,
    decoded,
    isValid,
    error,
    originalLength,
    encodedLength: originalLength,
    compressionRatio,
    encodingEfficiency,
    characterAnalysis,
  }
}
