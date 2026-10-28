/**
 * URL Encoder/Decoder Logic
 * Pure functions for URL encoding, decoding, validation, and manipulation
 */

export type UrlEncodingType = 'url' | 'uri' | 'custom';

export interface UrlEncoderOptions {
  encodingType: UrlEncodingType;
  preserveSpaces: boolean;
  customChars: string;
}

export interface UrlEncoderResult {
  encoded: string;
  decoded: string;
  isValid: boolean;
  error?: string;
  originalLength: number;
  encodedLength: number;
  compressionRatio: number;
  characterAnalysis: {
    total: number;
    spaces: number;
    specialChars: number;
    encodedSpaces: number;
    encodedSpecialChars: number;
  };
}

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  parsedUrl?: {
    protocol: string;
    hostname: string;
    pathname: string;
    search: string;
    hash: string;
  };
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): UrlValidationResult {
  if (!url || url.trim().length === 0) {
    return {
      isValid: false,
      error: 'URL cannot be empty'
    };
  }

  try {
    const parsedUrl = new URL(url);
    return {
      isValid: true,
      parsedUrl: {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        pathname: parsedUrl.pathname,
        search: parsedUrl.search,
        hash: parsedUrl.hash
      }
    };
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format'
    };
  }
}

/**
 * Encode URL using encodeURIComponent (for query parameters and fragments)
 */
export function encodeUrlComponent(url: string): string {
  return encodeURIComponent(url);
}

/**
 * Decode URL using decodeURIComponent
 */
export function decodeUrlComponent(encodedUrl: string): string {
  try {
    return decodeURIComponent(encodedUrl);
  } catch {
    throw new Error('Invalid encoded URL');
  }
}

/**
 * Encode URL using encodeURI (for complete URIs)
 */
export function encodeUri(url: string): string {
  return encodeURI(url);
}

/**
 * Decode URL using decodeURI
 */
export function decodeUri(encodedUrl: string): string {
  try {
    return decodeURI(encodedUrl);
  } catch {
    throw new Error('Invalid encoded URI');
  }
}

/**
 * Custom character set encoding
 */
export function encodeCustomChars(text: string, charsToEncode: string): string {
  let result = text;

  for (const char of charsToEncode) {
    const encoded = encodeURIComponent(char);
    result = result.replace(new RegExp(escapeRegExp(char), 'g'), encoded);
  }

  return result;
}

/**
 * Custom character set decoding
 */
export function decodeCustomChars(encodedText: string, charsToDecode: string): string {
  let result = encodedText;

  for (const char of charsToDecode) {
    const encoded = encodeURIComponent(char);
    result = result.replace(new RegExp(escapeRegExp(encoded), 'g'), char);
  }

  return result;
}

/**
 * Analyze character composition of text
 */
export function analyzeCharacters(text: string): {
  total: number;
  spaces: number;
  specialChars: number;
  encodedSpaces: number;
  encodedSpecialChars: number;
} {
  const total = text.length;
  const spaces = (text.match(/ /g) || []).length;
  const specialChars = (text.match(/[^a-zA-Z0-9\-_.~]/g) || []).length;
  const encodedSpaces = (text.match(/%20/g) || []).length;
  const encodedSpecialChars = (text.match(/%[0-9A-Fa-f]{2}/g) || []).length;

  return {
    total,
    spaces,
    specialChars,
    encodedSpaces,
    encodedSpecialChars
  };
}

/**
 * Calculate compression ratio
 */
export function calculateCompressionRatio(originalLength: number, encodedLength: number): number {
  if (originalLength === 0) return 0;
  return ((encodedLength - originalLength) / originalLength) * 100;
}

/**
 * Main URL encoding function
 */
export function encodeUrl(url: string, options: UrlEncoderOptions): UrlEncoderResult {
  const originalLength = url.length;
  let encoded: string;
  let decoded: string;
  let isValid = true;
  let error: string | undefined;

  try {
    // Validate URL if it's not already encoded and not custom encoding
    if (!url.includes('%') && options.encodingType !== 'custom') {
      const validation = validateUrl(url);
      if (!validation.isValid) {
        isValid = false;
        error = validation.error;
      }
    }

    if (isValid || options.encodingType === 'custom') {
      switch (options.encodingType) {
        case 'url':
          encoded = encodeUrlComponent(url);
          decoded = decodeUrlComponent(encoded);
          break;
        case 'uri':
          encoded = encodeUri(url);
          decoded = decodeUri(encoded);
          break;
        case 'custom':
          encoded = encodeCustomChars(url, options.customChars);
          decoded = decodeCustomChars(encoded, options.customChars);
          break;
        default:
          throw new Error('Invalid encoding type');
      }
    } else {
      encoded = url;
      decoded = url;
    }
  } catch (err) {
    isValid = false;
    error = err instanceof Error ? err.message : 'Encoding error';
    encoded = url;
    decoded = url;
  }

  const encodedLength = encoded.length;
  const compressionRatio = calculateCompressionRatio(originalLength, encodedLength);
  const characterAnalysis = analyzeCharacters(encoded);

  return {
    encoded,
    decoded,
    isValid,
    error,
    originalLength,
    encodedLength,
    compressionRatio,
    characterAnalysis
  };
}

/**
 * Main URL decoding function
 */
export function decodeUrl(encodedUrl: string, options: UrlEncoderOptions): UrlEncoderResult {
  const originalLength = encodedUrl.length;
  let decoded: string;
  let encoded: string;
  let isValid = true;
  let error: string | undefined;

  try {
    switch (options.encodingType) {
      case 'url':
        decoded = decodeUrlComponent(encodedUrl);
        encoded = encodeUrlComponent(decoded);
        break;
      case 'uri':
        decoded = decodeUri(encodedUrl);
        encoded = encodeUri(decoded);
        break;
      case 'custom':
        decoded = decodeCustomChars(encodedUrl, options.customChars);
        encoded = encodeCustomChars(decoded, options.customChars);
        break;
      default:
        throw new Error('Invalid encoding type');
    }
  } catch (err) {
    isValid = false;
    error = err instanceof Error ? err.message : 'Decoding error';
    decoded = encodedUrl;
    encoded = encodedUrl;
  }

  const decodedLength = decoded.length;
  const compressionRatio = calculateCompressionRatio(originalLength, decodedLength);
  const characterAnalysis = analyzeCharacters(decoded);

  return {
    encoded,
    decoded,
    isValid,
    error,
    originalLength,
    encodedLength: originalLength,
    compressionRatio,
    characterAnalysis
  };
}

/**
 * Utility function to escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get URL statistics
 */
export function getUrlStats(url: string): {
  length: number;
  hasProtocol: boolean;
  hasQuery: boolean;
  hasFragment: boolean;
  domain: string | null;
  path: string | null;
} {
  try {
    const parsedUrl = new URL(url);
    return {
      length: url.length,
      hasProtocol: !!parsedUrl.protocol,
      hasQuery: !!parsedUrl.search,
      hasFragment: !!parsedUrl.hash,
      domain: parsedUrl.hostname,
      path: parsedUrl.pathname
    };
  } catch {
    return {
      length: url.length,
      hasProtocol: false,
      hasQuery: false,
      hasFragment: false,
      domain: null,
      path: null
    };
  }
}
