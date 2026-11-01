export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' | 'SHA3-256' | 'SHA3-384' | 'SHA3-512'

export interface HashGenerationOptions {
  algorithm: HashAlgorithm
  input: string
  salt?: string
  saltPosition: 'prefix' | 'suffix' | 'none'
  outputFormat: 'hex' | 'base64'
  uppercase: boolean
}

export interface HashGenerationResult {
  hash: string
  algorithm: HashAlgorithm
  inputLength: number
  hashLength: number
  saltUsed: boolean
  outputFormat: 'hex' | 'base64'
}

/**
 * Convert ArrayBuffer to hex string
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * MD5 hash implementation
 * Note: MD5 is cryptographically broken and should not be used for security purposes
 */
function md5(input: string): string {
  // Simple MD5 implementation using a lightweight approach
  // This is a basic implementation - for production, consider using a library
  function md5cycle(x: number[], k: number[]) {
    let a = x[0],
      b = x[1],
      c = x[2],
      d = x[3]

    a = ff(a, b, c, d, k[0], 7, -680876936)
    d = ff(d, a, b, c, k[1], 12, -389564586)
    c = ff(c, d, a, b, k[2], 17, 606105819)
    b = ff(b, c, d, a, k[3], 22, -1044525330)
    a = ff(a, b, c, d, k[4], 7, -176418897)
    d = ff(d, a, b, c, k[5], 12, 1200080426)
    c = ff(c, d, a, b, k[6], 17, -1473231341)
    b = ff(b, c, d, a, k[7], 22, -45705983)
    a = ff(a, b, c, d, k[8], 7, 1770035416)
    d = ff(d, a, b, c, k[9], 12, -1958414417)
    c = ff(c, d, a, b, k[10], 17, -42063)
    b = ff(b, c, d, a, k[11], 22, -1990404162)
    a = ff(a, b, c, d, k[12], 7, 1804603682)
    d = ff(d, a, b, c, k[13], 12, -40341101)
    c = ff(c, d, a, b, k[14], 17, -1502002290)
    b = ff(b, c, d, a, k[15], 22, 1236535329)

    a = gg(a, b, c, d, k[1], 5, -165796510)
    d = gg(d, a, b, c, k[6], 9, -1069501632)
    c = gg(c, d, a, b, k[11], 14, 643717713)
    b = gg(b, c, d, a, k[0], 20, -373897302)
    a = gg(a, b, c, d, k[5], 5, -701558691)
    d = gg(d, a, b, c, k[10], 9, 38016083)
    c = gg(c, d, a, b, k[15], 14, -660478335)
    b = gg(b, c, d, a, k[4], 20, -405537848)
    a = gg(a, b, c, d, k[9], 5, 568446438)
    d = gg(d, a, b, c, k[14], 9, -1019803690)
    c = gg(c, d, a, b, k[3], 14, -187363961)
    b = gg(b, c, d, a, k[8], 20, 1163531501)
    a = gg(a, b, c, d, k[13], 5, -1444681467)
    d = gg(d, a, b, c, k[2], 9, -51403784)
    c = gg(c, d, a, b, k[7], 14, 1735328473)
    b = gg(b, c, d, a, k[12], 20, -1926607734)

    a = hh(a, b, c, d, k[5], 4, -378558)
    d = hh(d, a, b, c, k[8], 11, -2022574463)
    c = hh(c, d, a, b, k[11], 16, 1839030562)
    b = hh(b, c, d, a, k[14], 23, -35309556)
    a = hh(a, b, c, d, k[1], 4, -1530992060)
    d = hh(d, a, b, c, k[4], 11, 1272893353)
    c = hh(c, d, a, b, k[7], 16, -155497632)
    b = hh(b, c, d, a, k[10], 23, -1094730640)
    a = hh(a, b, c, d, k[13], 4, 681279174)
    d = hh(d, a, b, c, k[0], 11, -358537222)
    c = hh(c, d, a, b, k[3], 16, -722521979)
    b = hh(b, c, d, a, k[6], 23, 76029189)
    a = hh(a, b, c, d, k[9], 4, -640364487)
    d = hh(d, a, b, c, k[12], 11, -421815835)
    c = hh(c, d, a, b, k[15], 16, 530742520)
    b = hh(b, c, d, a, k[2], 23, -995338651)

    a = ii(a, b, c, d, k[0], 6, -198630844)
    d = ii(d, a, b, c, k[7], 10, 1126891415)
    c = ii(c, d, a, b, k[14], 15, -1416354905)
    b = ii(b, c, d, a, k[5], 21, -57434055)
    a = ii(a, b, c, d, k[12], 6, 1700485571)
    d = ii(d, a, b, c, k[3], 10, -1894986606)
    c = ii(c, d, a, b, k[10], 15, -1051523)
    b = ii(b, c, d, a, k[1], 21, -2054922799)
    a = ii(a, b, c, d, k[8], 6, 1873313359)
    d = ii(d, a, b, c, k[15], 10, -30611744)
    c = ii(c, d, a, b, k[6], 15, -1560198380)
    b = ii(b, c, d, a, k[13], 21, 1309151649)
    a = ii(a, b, c, d, k[4], 6, -145523070)
    d = ii(d, a, b, c, k[11], 10, -1120210379)
    c = ii(c, d, a, b, k[2], 15, 718787259)
    b = ii(b, c, d, a, k[9], 21, -343485551)

    x[0] = add32(a, x[0])
    x[1] = add32(b, x[1])
    x[2] = add32(c, x[2])
    x[3] = add32(d, x[3])
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t))
    return add32((a << s) | (a >>> (32 - s)), b)
  }

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t)
  }

  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t)
  }

  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t)
  }

  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t)
  }

  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff
  }

  function rhex(n: number) {
    let s = '',
      j = 0
    for (; j < 4; j++) s += hex_chr[(n >> (j * 8 + 4)) & 0x0f] + hex_chr[(n >> (j * 8)) & 0x0f]
    return s
  }

  const hex_chr = '0123456789abcdef'.split('')

  let utf8 = unescape(encodeURIComponent(input))
  const strLen = utf8.length
  const state = [1732584193, -271733879, -1732584194, 271733878]
  let i: number

  for (i = 64; i <= strLen; i += 64) {
    md5cycle(state, md5blk(utf8.substring(i - 64, i)))
  }
  utf8 = utf8.substring(i - 64)
  const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  for (i = 0; i < utf8.length; i++) tail[i >> 2] |= utf8.charCodeAt(i) << ((i % 4) << 3)
  tail[i >> 2] |= 0x80 << ((i % 4) << 3)
  if (i > 55) {
    md5cycle(state, tail)
    for (i = 0; i < 16; i++) tail[i] = 0
  }
  tail[14] = strLen * 8
  md5cycle(state, tail)
  return rhex(state[0]) + rhex(state[1]) + rhex(state[2]) + rhex(state[3])
}

function md5blk(s: string): number[] {
  const md5blks: number[] = []
  let i: number
  for (i = 0; i < 64; i += 4) {
    md5blks[i >> 2] =
      s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24)
  }
  return md5blks
}

/**
 * Get the Web Crypto API algorithm name for the hash algorithm
 */
function getCryptoAlgorithm(algorithm: HashAlgorithm): string {
  const algorithmMap: Record<Exclude<HashAlgorithm, 'MD5'>, string> = {
    'SHA-1': 'SHA-1',
    'SHA-256': 'SHA-256',
    'SHA-384': 'SHA-384',
    'SHA-512': 'SHA-512',
    'SHA3-256': 'SHA3-256',
    'SHA3-384': 'SHA3-384',
    'SHA3-512': 'SHA3-512',
  }
  return algorithmMap[algorithm as Exclude<HashAlgorithm, 'MD5'>]
}

/**
 * Hash a string using MD5 (not supported by Web Crypto API)
 */
async function hashMD5(input: string): Promise<ArrayBuffer> {
  const hash = md5(input)
  // Convert hex string to ArrayBuffer
  const bytes = new Uint8Array(hash.length / 2)
  for (let i = 0; i < hash.length; i += 2) {
    bytes[i / 2] = parseInt(hash.substr(i, 2), 16)
  }
  return bytes.buffer
}

/**
 * Hash a string using Web Crypto API
 */
async function hashWithCrypto(input: string, algorithm: HashAlgorithm): Promise<ArrayBuffer> {
  // Handle MD5 separately since Web Crypto API doesn't support it
  if (algorithm === 'MD5') {
    return hashMD5(input)
  }

  const cryptoAlgorithm = getCryptoAlgorithm(algorithm)
  const encoder = new TextEncoder()
  const data = encoder.encode(input)

  try {
    const hashBuffer = await crypto.subtle.digest(cryptoAlgorithm, data)
    return hashBuffer
  } catch (err) {
    // Check if SHA-3 is not supported
    if (algorithm.startsWith('SHA3-')) {
      throw new Error(
        `SHA-3 algorithms are not supported in this browser. ` + `Please use SHA-256, SHA-384, or SHA-512 instead.`
      )
    }
    throw err
  }
}

/**
 * Generate hash from input text
 */
export async function generateHash(options: HashGenerationOptions): Promise<HashGenerationResult> {
  const { algorithm, input, salt, saltPosition, outputFormat, uppercase } = options

  // Prepare input with salt if provided
  let dataToHash = input
  if (salt && saltPosition !== 'none') {
    if (saltPosition === 'prefix') {
      dataToHash = salt + input
    } else if (saltPosition === 'suffix') {
      dataToHash = input + salt
    }
  }

  // Generate hash
  const hashBuffer = await hashWithCrypto(dataToHash, algorithm)

  // Convert to desired format
  let hash: string
  if (outputFormat === 'hex') {
    hash = arrayBufferToHex(hashBuffer)
  } else {
    hash = arrayBufferToBase64(hashBuffer)
  }

  // Apply uppercase if requested
  if (uppercase) {
    hash = hash.toUpperCase()
  }

  return {
    hash,
    algorithm,
    inputLength: input.length,
    hashLength: hash.length,
    saltUsed: salt !== undefined && salt !== '' && saltPosition !== 'none',
    outputFormat,
  }
}

/**
 * Generate multiple hashes for the same input using different algorithms
 */
export async function generateMultipleHashes(
  input: string,
  algorithms: HashAlgorithm[],
  options?: Partial<HashGenerationOptions>
): Promise<Record<HashAlgorithm, string>> {
  const results: Record<string, string> = {}

  for (const algorithm of algorithms) {
    try {
      const result = await generateHash({
        algorithm,
        input,
        salt: options?.salt,
        saltPosition: options?.saltPosition || 'none',
        outputFormat: options?.outputFormat || 'hex',
        uppercase: options?.uppercase || false,
      })
      results[algorithm] = result.hash
    } catch (err) {
      results[algorithm] = `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
  }

  return results as Record<HashAlgorithm, string>
}
