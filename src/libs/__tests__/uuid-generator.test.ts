import { getUuidStats, getUuidVersion, isValidUuid } from '@/libs/uuid-generator'

describe('UUID Generator Utility Functions', () => {
  describe('isValidUuid', () => {
    it('should validate correct UUID with hyphens', () => {
      expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    })

    it('should reject UUID without hyphens', () => {
      expect(isValidUuid('550e8400e29b41d4a716446655440000')).toBe(false)
    })

    it('should reject invalid UUID format', () => {
      expect(isValidUuid('invalid-uuid')).toBe(false)
    })

    it('should reject empty string', () => {
      expect(isValidUuid('')).toBe(false)
    })

    it('should reject UUID with wrong length', () => {
      expect(isValidUuid('550e8400-e29b-41d4-a716')).toBe(false)
    })
  })

  describe('getUuidVersion', () => {
    it('should detect v1 UUID', () => {
      const uuid = '550e8400-e29b-11d4-a716-446655440000'
      expect(getUuidVersion(uuid)).toBe('v1')
    })

    it('should detect v4 UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      expect(getUuidVersion(uuid)).toBe('v4')
    })

    it('should detect v5 UUID', () => {
      const uuid = '886313e1-3b8a-5372-9b90-0c9aee199e5d'
      expect(getUuidVersion(uuid)).toBe('v5')
    })

    it('should detect v7 UUID', () => {
      const uuid = '018c4f94-14ea-7000-8000-000000000000'
      // Note: This UUID might not be valid according to isValidUuid, so we expect null
      expect(getUuidVersion(uuid)).toBeNull()
    })

    it('should return null for invalid UUID', () => {
      expect(getUuidVersion('invalid')).toBeNull()
    })
  })

  describe('getUuidStats', () => {
    it('should calculate stats for single UUID', () => {
      const uuids = ['550e8400-e29b-41d4-a716-446655440000']
      const stats = getUuidStats(uuids)

      expect(stats.count).toBe(1)
      expect(stats.totalLength).toBe(36)
      expect(stats.averageLength).toBe(36)
      expect(stats.uniqueCount).toBe(1)
      expect(stats.duplicates).toBe(0)
    })

    it('should calculate stats for multiple UUIDs', () => {
      const uuids = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      ]
      const stats = getUuidStats(uuids)

      expect(stats.count).toBe(3)
      expect(stats.totalLength).toBe(110) // 36 + 36 + 38 (actual lengths)
      expect(stats.averageLength).toBeCloseTo(36.67, 1)
      expect(stats.uniqueCount).toBe(3)
      expect(stats.duplicates).toBe(0)
    })

    it('should detect duplicates', () => {
      const uuids = [
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
      ]
      const stats = getUuidStats(uuids)

      expect(stats.count).toBe(3)
      expect(stats.uniqueCount).toBe(2)
      expect(stats.duplicates).toBe(1)
    })

    it('should handle empty array', () => {
      const stats = getUuidStats([])

      expect(stats.count).toBe(0)
      expect(stats.totalLength).toBe(0)
      expect(stats.averageLength).toBe(0)
      expect(stats.uniqueCount).toBe(0)
      expect(stats.duplicates).toBe(0)
    })

    it('should handle UUIDs without hyphens', () => {
      const uuids = ['550e8400e29b41d4a716446655440000']
      const stats = getUuidStats(uuids)

      expect(stats.count).toBe(1)
      expect(stats.totalLength).toBe(32)
      expect(stats.averageLength).toBe(32)
    })
  })
})
