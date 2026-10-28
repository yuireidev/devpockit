export interface DecodedJwtHeader {
  alg?: string;
  typ?: string;
  kid?: string;
  [key: string]: unknown;
}

export interface DecodedJwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

export interface JwtDecodeResult {
  header: DecodedJwtHeader;
  payload: DecodedJwtPayload;
  signature: string;
  rawToken: string;
  isValid: boolean;
  error?: string;
  isExpired: boolean;
  expiresAt?: Date;
  issuedAt?: Date;
  notBefore?: Date;
  timeRemaining?: number;
  claims: {
    standard: Record<string, unknown>;
    custom: Record<string, unknown>;
  };
  statistics: {
    headerSize: number;
    payloadSize: number;
    signatureSize: number;
    totalSize: number;
    claimCount: number;
  };
}

const STANDARD_CLAIMS = ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti'];

/**
 * Decode a JWT token without verification
 */
export function decodeJwt(token: string): JwtDecodeResult {
  const result: JwtDecodeResult = {
    header: {},
    payload: {},
    signature: '',
    rawToken: token,
    isValid: false,
    isExpired: false,
    claims: {
      standard: {},
      custom: {}
    },
    statistics: {
      headerSize: 0,
      payloadSize: 0,
      signatureSize: 0,
      totalSize: token.length,
      claimCount: 0
    }
  };

  try {
    // Validate token structure (should have 3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      result.error = 'Invalid JWT format: token must have 3 parts (header.payload.signature)';
      return result;
    }

    // Decode header
    try {
      const headerJson = base64UrlDecode(parts[0]);
      result.header = JSON.parse(headerJson) as DecodedJwtHeader;
      result.statistics.headerSize = parts[0].length;
    } catch (err) {
      result.error = `Failed to decode header: ${err instanceof Error ? err.message : 'Unknown error'}`;
      return result;
    }

    // Decode payload
    try {
      const payloadJson = base64UrlDecode(parts[1]);
      result.payload = JSON.parse(payloadJson) as DecodedJwtPayload;
      result.statistics.payloadSize = parts[1].length;

      // Separate standard and custom claims
      Object.keys(result.payload).forEach(key => {
        if (STANDARD_CLAIMS.includes(key)) {
          result.claims.standard[key] = result.payload[key];
        } else {
          result.claims.custom[key] = result.payload[key];
        }
      });

      result.statistics.claimCount = Object.keys(result.payload).length;
    } catch (err) {
      result.error = `Failed to decode payload: ${err instanceof Error ? err.message : 'Unknown error'}`;
      return result;
    }

    // Extract signature
    result.signature = parts[2];
    result.statistics.signatureSize = parts[2].length;

    // Check expiration
    if (result.payload.exp) {
      const expTimestamp = typeof result.payload.exp === 'number'
        ? result.payload.exp
        : parseInt(String(result.payload.exp), 10);
      result.expiresAt = new Date(expTimestamp * 1000);
      result.isExpired = Date.now() > result.expiresAt.getTime();

      if (!result.isExpired) {
        result.timeRemaining = Math.floor((result.expiresAt.getTime() - Date.now()) / 1000);
      }
    }

    // Check issued at
    if (result.payload.iat) {
      const iatTimestamp = typeof result.payload.iat === 'number'
        ? result.payload.iat
        : parseInt(String(result.payload.iat), 10);
      result.issuedAt = new Date(iatTimestamp * 1000);
    }

    // Check not before
    if (result.payload.nbf) {
      const nbfTimestamp = typeof result.payload.nbf === 'number'
        ? result.payload.nbf
        : parseInt(String(result.payload.nbf), 10);
      result.notBefore = new Date(nbfTimestamp * 1000);
    }

    result.isValid = true;
  } catch (err) {
    result.error = err instanceof Error ? err.message : 'Failed to decode JWT';
    result.isValid = false;
  }

  return result;
}

/**
 * Base64 URL decode
 */
function base64UrlDecode(str: string): string {
  // Add padding if needed
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }

  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    throw new Error('Invalid base64url encoding');
  }
}

/**
 * Verify JWT signature (for HS256, HS384, HS512)
 */
export async function verifyJwtSignature(
  token: string,
  secret: string,
  algorithm: 'HS256' | 'HS384' | 'HS512' = 'HS256'
): Promise<{ isValid: boolean; error?: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false, error: 'Invalid token format' };
    }

    // Import secret as key
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);

    const algorithmMap: Record<string, string> = {
      HS256: 'SHA-256',
      HS384: 'SHA-384',
      HS512: 'SHA-512'
    };

    const hashAlgorithm = algorithmMap[algorithm] || 'SHA-256';

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: 'HMAC',
        hash: hashAlgorithm
      },
      false,
      ['sign', 'verify']
    );

    // Create signature
    const headerPayload = `${parts[0]}.${parts[1]}`;
    const signature = await crypto.subtle.sign(
      {
        name: 'HMAC',
        hash: hashAlgorithm
      },
      cryptoKey,
      encoder.encode(headerPayload)
    );

    // Convert signature to base64url
    const signatureArray = Array.from(new Uint8Array(signature));
    const signatureBase64 = btoa(String.fromCharCode(...signatureArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Compare signatures
    const isValid = signatureBase64 === parts[2];

    return {
      isValid,
      error: isValid ? undefined : 'Signature verification failed'
    };
  } catch (err) {
    return {
      isValid: false,
      error: err instanceof Error ? err.message : 'Verification error'
    };
  }
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toISOString();
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconds`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
}

