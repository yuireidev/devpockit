/**
 * XML Formatter Logic
 * Pure functions for XML formatting, validation, and manipulation
 */

export interface XmlFormatOptions {
  format: 'beautify' | 'minify'
  indentSize: number
  preserveWhitespace: boolean
  selfClosingTags: 'auto' | 'always' | 'never'
}

export interface XmlFormatResult {
  formatted: string
  isValid: boolean
  error?: string
  originalSize: number
  formattedSize: number
  compressionRatio?: number
}

/**
 * Format XML based on options
 */
export function formatXml(xmlString: string, options: XmlFormatOptions): XmlFormatResult {
  const originalSize = xmlString.length

  try {
    // Basic XML validation
    const validation = validateXml(xmlString)
    if (!validation.isValid) {
      return {
        formatted: xmlString,
        isValid: false,
        error: validation.error,
        originalSize,
        formattedSize: originalSize,
      }
    }

    let formatted: string

    if (options.format === 'minify') {
      formatted = minifyXml(xmlString, options)
    } else {
      formatted = beautifyXml(xmlString, options)
    }

    const formattedSize = formatted.length
    const compressionRatio = originalSize > 0 ? ((originalSize - formattedSize) / originalSize) * 100 : 0

    return {
      formatted,
      isValid: true,
      originalSize,
      formattedSize,
      compressionRatio: options.format === 'minify' ? compressionRatio : undefined,
    }
  } catch (error) {
    return {
      formatted: xmlString,
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid XML',
      originalSize,
      formattedSize: originalSize,
    }
  }
}

/**
 * Validate XML string
 */
export function validateXml(xmlString: string): { isValid: boolean; error?: string } {
  try {
    // Basic XML structure validation
    if (!xmlString.trim()) {
      return { isValid: false, error: 'Empty XML content' }
    }

    // Remove XML declaration for processing
    let content = xmlString
    const declarationMatch = content.match(/<\?xml[^>]*\?>/)
    if (declarationMatch) {
      content = content.replace(/<\?xml[^>]*\?>/, '').trim()
    }

    // Check for root element (excluding XML declaration)
    const rootMatch = content.match(/<([^\/\s>]+)[^>]*>/)
    if (!rootMatch) {
      return { isValid: false, error: 'No root element found' }
    }

    const rootTag = rootMatch[1]

    // Check for closing tag
    const closingTag = `</${rootTag}>`
    if (!content.includes(closingTag)) {
      return { isValid: false, error: `Missing closing tag: ${closingTag}` }
    }

    // Basic tag balance check (excluding XML declaration)
    const openTags = (content.match(/<[^\/][^>]*>/g) || []).length
    const closeTags = (content.match(/<\/[^>]+>/g) || []).length
    const selfClosingTags = (content.match(/<[^>]*\/>/g) || []).length

    if (openTags !== closeTags + selfClosingTags) {
      return { isValid: false, error: 'Unbalanced XML tags' }
    }

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid XML structure',
    }
  }
}

/**
 * Minify XML
 */
function minifyXml(xmlString: string, options: XmlFormatOptions): string {
  let minified = xmlString

  // Remove XML declaration if present (we'll add it back)
  const declarationMatch = minified.match(/<\?xml[^>]*\?>/)
  const declaration = declarationMatch ? declarationMatch[0] : ''
  minified = minified.replace(/<\?xml[^>]*\?>/, '')

  // Remove comments
  minified = minified.replace(/<!--[\s\S]*?-->/g, '')

  // Remove CDATA sections (preserve content)
  minified = minified.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')

  // Normalize whitespace
  if (!options.preserveWhitespace) {
    minified = minified.replace(/\s+/g, ' ')
  }

  // Remove whitespace between tags
  minified = minified.replace(/>\s+</g, '><')

  // Handle self-closing tags
  if (options.selfClosingTags === 'always') {
    minified = minified.replace(/<([^>]+)><\/\1>/g, '<$1/>')
  } else if (options.selfClosingTags === 'never') {
    minified = minified.replace(/<([^>]+)\/>/g, '<$1></$1>')
  }

  // Trim and add declaration back
  minified = minified.trim()
  if (declaration) {
    minified = declaration + minified
  }

  return minified
}

/**
 * Beautify XML
 */
function beautifyXml(xmlString: string, options: XmlFormatOptions): string {
  let beautified = xmlString

  // Extract XML declaration
  const declarationMatch = beautified.match(/<\?xml[^>]*\?>/)
  const declaration = declarationMatch ? declarationMatch[0] : ''
  beautified = beautified.replace(/<\?xml[^>]*\?>/, '')

  // Normalize whitespace
  if (!options.preserveWhitespace) {
    beautified = beautified.replace(/\s+/g, ' ')
  }

  // Add line breaks and indentation
  const indent = ' '.repeat(options.indentSize)
  let depth = 0
  let result = declaration ? declaration + '\n' : ''

  // Split by tags and process
  const parts = beautified.split(/(<[^>]*>)/)

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]

    if (part.match(/^<[^\/]/)) {
      // Opening tag
      result += indent.repeat(depth) + part + '\n'
      depth++
    } else if (part.match(/^<\/[^>]*>/)) {
      // Closing tag
      depth--
      result += indent.repeat(depth) + part + '\n'
    } else if (part.match(/^<[^>]*\/>$/)) {
      // Self-closing tag
      result += indent.repeat(depth) + part + '\n'
    } else if (part.trim()) {
      // Text content
      result += indent.repeat(depth) + part.trim() + '\n'
    }
  }

  // Handle self-closing tags based on options
  if (options.selfClosingTags === 'always') {
    result = result.replace(/<([^>]+)><\/\1>/g, '<$1/>')
  } else if (options.selfClosingTags === 'never') {
    result = result.replace(/<([^>]+)\/>/g, '<$1></$1>')
  }

  return result.trim()
}

/**
 * Get XML statistics
 */
export function getXmlStats(xmlString: string): {
  size: number
  lines: number
  depth: number
  tags: number
  attributes: number
} {
  const size = xmlString.length
  const lines = xmlString.split('\n').length

  try {
    const { depth, tags, attributes } = analyzeXmlStructure(xmlString)
    return { size, lines, depth, tags, attributes }
  } catch {
    return { size, lines, depth: 0, tags: 0, attributes: 0 }
  }
}

/**
 * Analyze XML structure for statistics
 */
function analyzeXmlStructure(xmlString: string): { depth: number; tags: number; attributes: number } {
  let maxDepth = 0
  let currentDepth = 0
  let tagCount = 0
  let attributeCount = 0

  // Simple tag and attribute counting
  const tagMatches = xmlString.match(/<[^\/][^>]*>/g) || []
  tagCount = tagMatches.length

  // Count attributes
  for (const tag of tagMatches) {
    const attrMatches = tag.match(/\s+[a-zA-Z][a-zA-Z0-9]*\s*=/g) || []
    attributeCount += attrMatches.length
  }

  // Calculate depth (simplified)
  const lines = xmlString.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('<') && !trimmed.startsWith('</')) {
      currentDepth++
      maxDepth = Math.max(maxDepth, currentDepth)
    } else if (trimmed.startsWith('</')) {
      currentDepth--
    }
  }

  return { depth: maxDepth, tags: tagCount, attributes: attributeCount }
}

/**
 * Format XML with syntax highlighting (basic)
 */
export function formatXmlWithHighlighting(xmlString: string): string {
  try {
    // Basic syntax highlighting using simple replacements
    return xmlString
      .replace(/<\?xml[^>]*\?>/g, '<?xml$1?>') // XML declaration
      .replace(/<([^\/\s>]+)/g, '<$1') // Opening tags
      .replace(/<\/([^>]+)>/g, '</$1>') // Closing tags
      .replace(/\s+([a-zA-Z][a-zA-Z0-9]*)\s*=/g, ' $1=') // Attributes
      .replace(/="([^"]*)"/g, '="$1"') // Attribute values
  } catch {
    return xmlString
  }
}
