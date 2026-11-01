import { generateLoremIpsum } from '../lorem-ipsum'

describe('Lorem Ipsum Generation - Simple Tests', () => {
  describe('generateLoremIpsum', () => {
    it('should generate words correctly', () => {
      const result = generateLoremIpsum({
        type: 'latin',
        unit: 'words',
        quantity: 5,
        format: 'plain',
      })

      const words = result.split(' ')
      expect(words).toHaveLength(5)
      expect(typeof result).toBe('string')
    })

    it('should generate sentences correctly', () => {
      const result = generateLoremIpsum({
        type: 'latin',
        unit: 'sentences',
        quantity: 2,
        format: 'plain',
      })

      const sentences = result.split('. ').filter((s) => s.length > 0)
      expect(sentences).toHaveLength(2)
      expect(typeof result).toBe('string')
    })

    it('should generate paragraphs correctly', () => {
      const result = generateLoremIpsum({
        type: 'latin',
        unit: 'paragraphs',
        quantity: 2,
        format: 'plain',
      })

      const paragraphs = result.split('\n\n').filter((p) => p.length > 0)
      expect(paragraphs).toHaveLength(2)
      expect(typeof result).toBe('string')
    })

    it('should generate HTML format correctly', () => {
      const result = generateLoremIpsum({
        type: 'latin',
        unit: 'words',
        quantity: 3,
        format: 'html',
      })

      expect(result).toMatch(/^<p>.*<\/p>$/)
      expect(typeof result).toBe('string')
    })

    it('should handle different quantities', () => {
      const quantities = [1, 5, 10, 50, 100]

      quantities.forEach((quantity) => {
        const result = generateLoremIpsum({
          type: 'latin',
          unit: 'words',
          quantity,
          format: 'plain',
        })

        const words = result.split(' ')
        expect(words).toHaveLength(quantity)
        expect(typeof result).toBe('string')
      })
    })

    it('should generate different content for different types', () => {
      const latinResult = generateLoremIpsum({
        type: 'latin',
        unit: 'words',
        quantity: 10,
        format: 'plain',
      })

      const baconResult = generateLoremIpsum({
        type: 'bacon',
        unit: 'words',
        quantity: 10,
        format: 'plain',
      })

      expect(latinResult).not.toEqual(baconResult)
      expect(typeof latinResult).toBe('string')
      expect(typeof baconResult).toBe('string')
    })
  })
})
