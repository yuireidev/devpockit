/**
 * Lorem Ipsum Generator Logic
 * Pure functions for generating Lorem Ipsum text
 */

import {
  BACON_WORDS,
  CLIMBER_WORDS,
  GEN_ALPHA_WORDS,
  LATIN_WORDS,
  TECH_BRO_WORDS,
  WIBU_WORDS,
} from '@/config/lorem-ipsum-config'

export interface LoremOptions {
  type: 'latin' | 'bacon' | 'gen-alpha' | 'tech-bro' | 'wibu' | 'climber-bro'
  unit: 'words' | 'sentences' | 'paragraphs'
  quantity: number
  format: 'plain' | 'html'
}

/**
 * Generate Lorem Ipsum text based on options
 */
export function generateLoremIpsum(options: LoremOptions): string {
  const words =
    options.type === 'latin'
      ? LATIN_WORDS
      : options.type === 'bacon'
        ? BACON_WORDS
        : options.type === 'gen-alpha'
          ? GEN_ALPHA_WORDS
          : options.type === 'tech-bro'
            ? TECH_BRO_WORDS
            : options.type === 'wibu'
              ? WIBU_WORDS
              : options.type === 'climber-bro'
                ? CLIMBER_WORDS
                : LATIN_WORDS

  switch (options.unit) {
    case 'words':
      return generateWords(words, options.quantity, options.format)

    case 'sentences':
      return generateSentences(words, options.quantity, options.format)

    case 'paragraphs':
      return generateParagraphs(words, options.quantity, options.format)

    default:
      return ''
  }
}

/**
 * Generate a specified number of words
 */
function generateWords(words: string[], quantity: number, format: 'plain' | 'html'): string {
  const result = Array(quantity)
    .fill(0)
    .map(() => words[Math.floor(Math.random() * words.length)])
    .join(' ')

  return format === 'html' ? `<p>${result}</p>` : result
}

/**
 * Generate a specified number of sentences
 */
function generateSentences(words: string[], quantity: number, format: 'plain' | 'html'): string {
  const sentences = Array(quantity)
    .fill(0)
    .map(() => {
      const wordCount = Math.floor(Math.random() * 8) + 5 // 5-12 words per sentence
      const sentenceWords = Array(wordCount)
        .fill(0)
        .map(() => words[Math.floor(Math.random() * words.length)])

      const sentence = sentenceWords.join(' ') + '.'
      return sentence.charAt(0).toUpperCase() + sentence.slice(1)
    })

  const result = sentences.join(' ')
  return format === 'html' ? `<p>${result}</p>` : result
}

/**
 * Generate a specified number of paragraphs
 */
function generateParagraphs(words: string[], quantity: number, format: 'plain' | 'html'): string {
  const paragraphs = Array(quantity)
    .fill(0)
    .map(() => {
      const sentenceCount = Math.floor(Math.random() * 7) + 4 // 4-10 sentences per paragraph
      const sentences = Array(sentenceCount)
        .fill(0)
        .map(() => {
          const wordCount = Math.floor(Math.random() * 8) + 5
          const sentenceWords = Array(wordCount)
            .fill(0)
            .map(() => words[Math.floor(Math.random() * words.length)])

          const sentence = sentenceWords.join(' ') + '.'
          return sentence.charAt(0).toUpperCase() + sentence.slice(1)
        })

      return sentences.join(' ')
    })

  const result = paragraphs.join('\n\n')
  return format === 'html' ? paragraphs.map((p) => `<p>${p}</p>`).join('\n') : result
}

/**
 * Validate Lorem Ipsum options
 */
export function validateLoremOptions(options: Partial<LoremOptions>): string[] {
  const errors: string[] = []

  if (options.quantity !== undefined) {
    if (options.quantity < 1) {
      errors.push('Quantity must be at least 1')
    }
    if (options.quantity > 100) {
      errors.push('Quantity must be at most 100')
    }
  }

  if (options.type && !['latin', 'bacon', 'gen-alpha', 'tech-bro', 'wibu', 'climber-bro'].includes(options.type)) {
    errors.push('Type must be "latin", "bacon", "gen-alpha", "tech-bro", "wibu", or "climber-bro"')
  }

  if (options.unit && !['words', 'sentences', 'paragraphs'].includes(options.unit)) {
    errors.push('Unit must be "words", "sentences", or "paragraphs"')
  }

  if (options.format && !['plain', 'html'].includes(options.format)) {
    errors.push('Format must be either "plain" or "html"')
  }

  return errors
}

/**
 * Get word count for a given text
 */
export function getWordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length
}

/**
 * Get character count for a given text
 */
export function getCharacterCount(text: string): number {
  return text.length
}
