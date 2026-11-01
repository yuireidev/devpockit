import { BACON_WORDS, LATIN_WORDS } from '../../config/lorem-ipsum-config'
import { generateLoremIpsum } from '../lorem-ipsum'

describe('Lorem Ipsum Generation', () => {
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
      words.forEach((word) => {
        expect(LATIN_WORDS).toContain(word)
      })
    })

    it('should generate sentences correctly', () => {
      const result = generateLoremIpsum({
        type: 'latin',
        unit: 'sentences',
        quantity: 2,
        format: 'plain',
      })

      // Split by periods and filter out empty strings
      const sentences = result.split('.').filter((s) => s.trim().length > 0)
      expect(sentences).toHaveLength(2)

      sentences.forEach((sentence) => {
        const trimmed = sentence.trim()
        expect(trimmed).toMatch(/^[A-Z]/) // Should start with capital letter
      })
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
    })

    it('should generate HTML format correctly', () => {
      const result = generateLoremIpsum({
        type: 'latin',
        unit: 'words',
        quantity: 3,
        format: 'html',
      })

      expect(result).toMatch(/^<p>.*<\/p>$/)
      expect(result).toContain('<p>')
      expect(result).toContain('</p>')
    })

    it('should use different word lists for different types', () => {
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

      const latinWords = latinResult.split(' ')
      const baconWords = baconResult.split(' ')

      // Should have some overlap but not be identical
      expect(latinWords).not.toEqual(baconWords)

      // All words should be from their respective lists
      latinWords.forEach((word) => {
        expect(LATIN_WORDS).toContain(word)
      })

      baconWords.forEach((word) => {
        expect(BACON_WORDS).toContain(word)
      })
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
      })
    })

    it('should generate sentences with proper word count range', () => {
      const result = generateLoremIpsum({
        type: 'latin',
        unit: 'sentences',
        quantity: 10,
        format: 'plain',
      })

      const sentences = result.split('. ').filter((s) => s.length > 0)

      sentences.forEach((sentence) => {
        const words = sentence.replace('.', '').split(' ')
        expect(words.length).toBeGreaterThanOrEqual(5)
        expect(words.length).toBeLessThanOrEqual(12)
      })
    })

    it('should generate paragraphs with proper sentence count range', () => {
      const result = generateLoremIpsum({
        type: 'latin',
        unit: 'paragraphs',
        quantity: 5,
        format: 'plain',
      })

      const paragraphs = result.split('\n\n').filter((p) => p.length > 0)

      paragraphs.forEach((paragraph) => {
        const sentences = paragraph.split('. ').filter((s) => s.length > 0)
        expect(sentences.length).toBeGreaterThanOrEqual(4)
        expect(sentences.length).toBeLessThanOrEqual(10)
      })
    })
  })
})
