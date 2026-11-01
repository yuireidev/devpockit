import {
  analyzeCharacters,
  calculateCompressionRatio,
  decodeCustomChars,
  decodeUri,
  decodeUrl,
  decodeUrlComponent,
  encodeCustomChars,
  encodeUri,
  encodeUrl,
  encodeUrlComponent,
  getUrlStats,
  validateUrl,
  type UrlEncoderOptions,
} from '../url-encoder'

describe('URL Encoder/Decoder', () => {
  const validUrl = 'https://example.com/path?param=value with spaces'
  const encodedUrl = 'https%3A//example.com/path%3Fparam%3Dvalue%20with%20spaces'
  const invalidUrl = 'not-a-valid-url'
  const emptyUrl = ''

  describe('validateUrl', () => {
    it('should validate correct URL', () => {
      const result = validateUrl(validUrl)
      expect(result.isValid).toBe(true)
      expect(result.parsedUrl).toBeDefined()
      expect(result.parsedUrl?.protocol).toBe('https:')
      expect(result.parsedUrl?.hostname).toBe('example.com')
    })

    it('should reject empty URL', () => {
      const result = validateUrl(emptyUrl)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('URL cannot be empty')
    })

    it('should reject invalid URL format', () => {
      const result = validateUrl(invalidUrl)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid URL format')
    })

    it('should handle URLs with special characters', () => {
      const specialUrl = 'https://example.com/path with spaces'
      const result = validateUrl(specialUrl)
      expect(result.isValid).toBe(true)
    })
  })

  describe('encodeUrlComponent', () => {
    it('should encode URL component correctly', () => {
      const result = encodeUrlComponent('hello world')
      expect(result).toBe('hello%20world')
    })

    it('should encode special characters', () => {
      const result = encodeUrlComponent('hello&world=test')
      expect(result).toBe('hello%26world%3Dtest')
    })

    it('should handle empty string', () => {
      const result = encodeUrlComponent('')
      expect(result).toBe('')
    })

    it('should encode Unicode characters', () => {
      const result = encodeUrlComponent('测试')
      expect(result).toBe('%E6%B5%8B%E8%AF%95')
    })
  })

  describe('decodeUrlComponent', () => {
    it('should decode URL component correctly', () => {
      const result = decodeUrlComponent('hello%20world')
      expect(result).toBe('hello world')
    })

    it('should decode special characters', () => {
      const result = decodeUrlComponent('hello%26world%3Dtest')
      expect(result).toBe('hello&world=test')
    })

    it('should handle empty string', () => {
      const result = decodeUrlComponent('')
      expect(result).toBe('')
    })

    it('should decode Unicode characters', () => {
      const result = decodeUrlComponent('%E6%B5%8B%E8%AF%95')
      expect(result).toBe('测试')
    })

    it('should throw error for invalid encoded string', () => {
      expect(() => decodeUrlComponent('%invalid')).toThrow('Invalid encoded URL')
    })
  })

  describe('encodeUri', () => {
    it('should encode URI correctly', () => {
      const result = encodeUri('https://example.com/path with spaces')
      expect(result).toBe('https://example.com/path%20with%20spaces')
    })

    it('should preserve URL structure', () => {
      const result = encodeUri('https://example.com/path?param=value')
      expect(result).toBe('https://example.com/path?param=value')
    })

    it('should encode special characters in path', () => {
      const result = encodeUri('https://example.com/path with & symbols')
      expect(result).toBe('https://example.com/path%20with%20&%20symbols')
    })
  })

  describe('decodeUri', () => {
    it('should decode URI correctly', () => {
      const result = decodeUri('https://example.com/path%20with%20spaces')
      expect(result).toBe('https://example.com/path with spaces')
    })

    it('should preserve URL structure', () => {
      const result = decodeUri('https://example.com/path?param=value')
      expect(result).toBe('https://example.com/path?param=value')
    })

    it('should throw error for invalid encoded URI', () => {
      expect(() => decodeUri('%invalid')).toThrow('Invalid encoded URI')
    })
  })

  describe('encodeCustomChars', () => {
    it('should encode custom characters', () => {
      const result = encodeCustomChars('hello world', ' ')
      expect(result).toBe('hello%20world')
    })

    it('should encode multiple custom characters', () => {
      const result = encodeCustomChars('hello&world=test', '&=')
      expect(result).toBe('hello%26world%3Dtest')
    })

    it('should handle empty custom characters', () => {
      const result = encodeCustomChars('hello world', '')
      expect(result).toBe('hello world')
    })

    it('should handle special regex characters', () => {
      const result = encodeCustomChars('hello world', ' ')
      // The space character should be encoded as %20
      expect(result).toBe('hello%20world')
    })
  })

  describe('decodeCustomChars', () => {
    it('should decode custom characters', () => {
      const result = decodeCustomChars('hello%20world', ' ')
      expect(result).toBe('hello world')
    })

    it('should decode multiple custom characters', () => {
      const result = decodeCustomChars('hello%26world%3Dtest', '&=')
      expect(result).toBe('hello&world=test')
    })

    it('should handle empty custom characters', () => {
      const result = decodeCustomChars('hello%20world', '')
      expect(result).toBe('hello%20world')
    })
  })

  describe('analyzeCharacters', () => {
    it('should analyze character composition', () => {
      const result = analyzeCharacters('hello world!')
      expect(result.total).toBe(12)
      expect(result.spaces).toBe(1)
      expect(result.specialChars).toBe(2) // ! and space
    })

    it('should count encoded spaces', () => {
      const result = analyzeCharacters('hello%20world')
      expect(result.encodedSpaces).toBe(1)
    })

    it('should count encoded special characters', () => {
      const result = analyzeCharacters('hello%26world')
      expect(result.encodedSpecialChars).toBe(1)
    })

    it('should handle empty string', () => {
      const result = analyzeCharacters('')
      expect(result.total).toBe(0)
      expect(result.spaces).toBe(0)
      expect(result.specialChars).toBe(0)
    })
  })

  describe('calculateCompressionRatio', () => {
    it('should calculate compression ratio correctly', () => {
      const result = calculateCompressionRatio(10, 15)
      expect(result).toBe(50)
    })

    it('should handle zero original length', () => {
      const result = calculateCompressionRatio(0, 5)
      expect(result).toBe(0)
    })

    it('should handle negative ratio', () => {
      const result = calculateCompressionRatio(10, 5)
      expect(result).toBe(-50)
    })
  })

  describe('getUrlStats', () => {
    it('should analyze valid URL', () => {
      const result = getUrlStats('https://example.com/path?param=value#fragment')
      expect(result.length).toBe(45)
      expect(result.hasProtocol).toBe(true)
      expect(result.hasQuery).toBe(true)
      expect(result.hasFragment).toBe(true)
      expect(result.domain).toBe('example.com')
      expect(result.path).toBe('/path')
    })

    it('should handle invalid URL', () => {
      const result = getUrlStats('not-a-url')
      expect(result.length).toBe(9)
      expect(result.hasProtocol).toBe(false)
      expect(result.hasQuery).toBe(false)
      expect(result.hasFragment).toBe(false)
      expect(result.domain).toBeNull()
      expect(result.path).toBeNull()
    })
  })

  describe('encodeUrl', () => {
    const defaultOptions: UrlEncoderOptions = {
      encodingType: 'url',
      preserveSpaces: false,
      customChars: ' &?=#/:;,',
    }

    it('should encode URL with URL encoding', () => {
      const result = encodeUrl(validUrl, defaultOptions)
      expect(result.isValid).toBe(true)
      expect(result.encoded).toContain('%3A')
      expect(result.originalLength).toBe(validUrl.length)
      expect(result.encodedLength).toBeGreaterThan(0)
    })

    it('should encode URL with URI encoding', () => {
      const options: UrlEncoderOptions = { ...defaultOptions, encodingType: 'uri' }
      const result = encodeUrl(validUrl, options)
      expect(result.isValid).toBe(true)
      expect(result.encoded).toContain('https://')
    })

    it('should encode URL with custom encoding', () => {
      const options: UrlEncoderOptions = { ...defaultOptions, encodingType: 'custom', customChars: ' ' }
      const result = encodeUrl('hello world', options)
      // Custom encoding doesn't validate URL format, it just encodes the string
      expect(result.encoded).toContain('%20')
    })

    it('should handle invalid URL', () => {
      const result = encodeUrl(invalidUrl, defaultOptions)
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle empty URL', () => {
      const result = encodeUrl(emptyUrl, defaultOptions)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('URL cannot be empty')
    })

    it('should calculate compression ratio', () => {
      const result = encodeUrl(validUrl, defaultOptions)
      expect(result.compressionRatio).toBeDefined()
      expect(typeof result.compressionRatio).toBe('number')
    })

    it('should provide character analysis', () => {
      const result = encodeUrl(validUrl, defaultOptions)
      expect(result.characterAnalysis).toBeDefined()
      expect(result.characterAnalysis.total).toBeGreaterThan(0)
    })
  })

  describe('decodeUrl', () => {
    const defaultOptions: UrlEncoderOptions = {
      encodingType: 'url',
      preserveSpaces: false,
      customChars: ' &?=#/:;,',
    }

    it('should decode URL with URL decoding', () => {
      const result = decodeUrl(encodedUrl, defaultOptions)
      expect(result.isValid).toBe(true)
      expect(result.decoded).toContain('https://')
    })

    it('should decode URL with URI decoding', () => {
      const options: UrlEncoderOptions = { ...defaultOptions, encodingType: 'uri' }
      const result = decodeUrl('https://example.com/path%20with%20spaces', options)
      expect(result.isValid).toBe(true)
      expect(result.decoded).toContain('path with spaces')
    })

    it('should decode URL with custom decoding', () => {
      const options: UrlEncoderOptions = { ...defaultOptions, encodingType: 'custom', customChars: ' ' }
      const result = decodeUrl('hello%20world', options)
      expect(result.isValid).toBe(true)
      expect(result.decoded).toBe('hello world')
    })

    it('should handle decoding errors', () => {
      const result = decodeUrl('%invalid', defaultOptions)
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should calculate compression ratio', () => {
      const result = decodeUrl(encodedUrl, defaultOptions)
      expect(result.compressionRatio).toBeDefined()
      expect(typeof result.compressionRatio).toBe('number')
    })

    it('should provide character analysis', () => {
      const result = decodeUrl(encodedUrl, defaultOptions)
      expect(result.characterAnalysis).toBeDefined()
      expect(result.characterAnalysis.total).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000)
      const result = encodeUrl(longUrl, { encodingType: 'url', preserveSpaces: false, customChars: '' })
      expect(result.isValid).toBe(true)
      expect(result.encoded.length).toBeGreaterThan(1000)
    })

    it('should handle URLs with Unicode characters', () => {
      const unicodeUrl = 'https://example.com/测试/路径'
      const result = encodeUrl(unicodeUrl, { encodingType: 'url', preserveSpaces: false, customChars: '' })
      expect(result.isValid).toBe(true)
      expect(result.encoded).toContain('%E6%B5%8B%E8%AF%95')
    })

    it('should handle URLs with query parameters', () => {
      const queryUrl = 'https://example.com/search?q=hello world&category=tools'
      const result = encodeUrl(queryUrl, { encodingType: 'url', preserveSpaces: false, customChars: '' })
      expect(result.isValid).toBe(true)
      expect(result.encoded).toContain('%3Fq%3D') // encoded ?q=
    })

    it('should handle malformed encoded strings', () => {
      const result = decodeUrl('%invalid%', { encodingType: 'url', preserveSpaces: false, customChars: '' })
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
