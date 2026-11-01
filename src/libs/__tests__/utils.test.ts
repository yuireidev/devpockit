import { cn } from '../utils'

describe('Utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
    })

    it('should handle false conditional classes', () => {
      const isActive = false
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toContain('base-class')
      expect(result).not.toContain('active-class')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['text-lg', 'font-bold'], 'text-red-500')
      expect(result).toContain('text-lg')
      expect(result).toContain('font-bold')
      expect(result).toContain('text-red-500')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        'text-red-500': true,
        'bg-blue-500': false,
        'font-bold': true,
      })
      expect(result).toContain('text-red-500')
      expect(result).not.toContain('bg-blue-500')
      expect(result).toContain('font-bold')
    })

    it('should handle empty inputs', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle single class', () => {
      const result = cn('single-class')
      expect(result).toBe('single-class')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'end-class')
      expect(result).toContain('base-class')
      expect(result).toContain('end-class')
    })

    it('should merge conflicting Tailwind classes', () => {
      // This tests that twMerge is working correctly
      const result = cn('text-red-500', 'text-blue-500')
      // The result should only contain one text color class
      expect(result).not.toContain('text-red-500')
      expect(result).toContain('text-blue-500')
    })

    it('should handle complex combinations', () => {
      const isActive = true
      const isDisabled = false
      const result = cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class',
        ['array-class-1', 'array-class-2'],
        {
          'object-true': true,
          'object-false': false,
        }
      )

      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
      expect(result).not.toContain('disabled-class')
      expect(result).toContain('array-class-1')
      expect(result).toContain('array-class-2')
      expect(result).toContain('object-true')
      expect(result).not.toContain('object-false')
    })
  })
})
