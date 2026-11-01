import { SignJWT } from 'jose'
import type { JwtEncoderOptions } from '@/config/jwt-encoder-config'

export interface JwtEncodeResult {
  token: string
  header: Record<string, unknown>
  payload: Record<string, unknown>
  isValid: boolean
  error?: string
  statistics: {
    tokenSize: number
    headerSize: number
    payloadSize: number
    claimCount: number
  }
}

/**
 * Encode a JWT token
 */
export async function encodeJwt(options: JwtEncoderOptions): Promise<JwtEncodeResult> {
  const result: JwtEncodeResult = {
    token: '',
    header: {},
    payload: {},
    isValid: false,
    statistics: {
      tokenSize: 0,
      headerSize: 0,
      payloadSize: 0,
      claimCount: 0,
    },
  }

  try {
    // Parse header
    let header: Record<string, unknown>
    try {
      header = JSON.parse(options.header)
      result.header = header
    } catch (err) {
      result.error = `Invalid header JSON: ${err instanceof Error ? err.message : 'Unknown error'}`
      return result
    }

    // Parse payload
    let payload: Record<string, unknown>
    try {
      payload = JSON.parse(options.payload)
      result.payload = payload
    } catch (err) {
      result.error = `Invalid payload JSON: ${err instanceof Error ? err.message : 'Unknown error'}`
      return result
    }

    // Validate algorithm
    if (!['HS256', 'HS384', 'HS512'].includes(options.algorithm)) {
      result.error = `Unsupported algorithm: ${options.algorithm}. Only HS256, HS384, and HS512 are supported.`
      return result
    }

    // Validate secret
    if (!options.secret || options.secret.trim().length === 0) {
      result.error = 'Secret is required for signing the token'
      return result
    }

    // Auto-generate iat if requested
    if (options.autoGenerateIat && !payload.iat) {
      payload.iat = Math.floor(Date.now() / 1000)
    }

    // Auto-generate exp if expiration is set
    if (options.expirationMinutes !== null && !payload.exp) {
      const expirationSeconds = options.expirationMinutes * 60
      payload.exp = Math.floor(Date.now() / 1000) + expirationSeconds
    }

    // Create JWT using jose library
    const secret = new TextEncoder().encode(options.secret)

    // Merge custom header fields with required alg and typ
    const protectedHeader = {
      alg: options.algorithm,
      typ: 'JWT',
      ...Object.fromEntries(Object.entries(header).filter(([key]) => !['alg', 'typ'].includes(key))),
    }

    const jwt = new SignJWT(payload as Record<string, string | number>).setProtectedHeader(protectedHeader)

    // Set issued at only if present
    if (payload.iat !== undefined && payload.iat !== null) {
      jwt.setIssuedAt(new Date((payload.iat as number) * 1000))
    }

    // Set expiration time only if present
    if (payload.exp !== undefined && payload.exp !== null) {
      jwt.setExpirationTime(new Date((payload.exp as number) * 1000))
    }

    // Add other standard claims if present
    if (payload.iss) jwt.setIssuer(payload.iss as string)
    if (payload.sub) jwt.setSubject(payload.sub as string)
    if (payload.aud) {
      const aud = payload.aud
      if (Array.isArray(aud)) {
        jwt.setAudience(aud as string[])
      } else {
        jwt.setAudience(aud as string)
      }
    }
    if (payload.jti) jwt.setJti(payload.jti as string)
    if (payload.nbf) jwt.setNotBefore(new Date((payload.nbf as number) * 1000))

    // Sign the token
    const token = await jwt.sign(secret)
    result.token = token
    result.isValid = true

    // Calculate statistics
    result.statistics.tokenSize = token.length
    result.statistics.headerSize = JSON.stringify(header).length
    result.statistics.payloadSize = JSON.stringify(payload).length
    result.statistics.claimCount = Object.keys(payload).length

    // Update header and payload with final values
    result.header = protectedHeader
    result.payload = payload
  } catch (err) {
    result.error = err instanceof Error ? err.message : 'Failed to encode JWT'
    result.isValid = false
  }

  return result
}

/**
 * Validate JSON string
 */
export function validateJson(jsonString: string): { isValid: boolean; error?: string } {
  try {
    JSON.parse(jsonString)
    return { isValid: true }
  } catch (err) {
    return {
      isValid: false,
      error: err instanceof Error ? err.message : 'Invalid JSON',
    }
  }
}

/**
 * Format JSON with indentation
 */
export function formatJson(jsonString: string, indent: number = 2): string {
  try {
    const parsed = JSON.parse(jsonString)
    return JSON.stringify(parsed, null, indent)
  } catch {
    return jsonString
  }
}

/**
 * Get default header for algorithm
 */
export function getDefaultHeader(algorithm: string): Record<string, unknown> {
  return {
    alg: algorithm,
    typ: 'JWT',
  }
}

/**
 * Get default payload template
 */
export function getDefaultPayload(): Record<string, unknown> {
  return {
    sub: '1234567890',
    name: 'John Doe',
    iat: Math.floor(Date.now() / 1000),
  }
}
