/**
 * List Format Converter Utilities
 * Functions for converting lists between different formats
 */

import { stringify } from 'yaml'
import { parseListInput, type InputFormat } from './list-comparison'

export interface ConversionResult {
  output: string
  success: boolean
  error?: string
  stats: {
    inputItems: number
    outputItems: number
    inputSize: number
    outputSize: number
  }
}

export interface ConverterOptions {
  preserveTypes: boolean
  removeEmpty: boolean
  removeDuplicates: boolean
  sortOrder: 'none' | 'asc' | 'desc'
}

/**
 * Format a list of values to the specified output format
 */
export function formatListOutput(values: string[], format: InputFormat, options: ConverterOptions): string {
  // Apply transformations
  let processed = [...values]

  // Remove empty items
  if (options.removeEmpty) {
    processed = processed.filter((item) => item.trim().length > 0)
  }

  // Remove duplicates
  if (options.removeDuplicates) {
    const seen = new Set<string>()
    processed = processed.filter((item) => {
      const normalized = item.toLowerCase()
      if (seen.has(normalized)) {
        return false
      }
      seen.add(normalized)
      return true
    })
  }

  // Sort items
  if (options.sortOrder !== 'none') {
    processed.sort((a, b) => {
      // Try numeric comparison first
      const numA = Number(a)
      const numB = Number(b)
      const isNumA = !isNaN(numA) && a.trim() === numA.toString()
      const isNumB = !isNaN(numB) && b.trim() === numB.toString()

      if (isNumA && isNumB) {
        return options.sortOrder === 'asc' ? numA - numB : numB - numA
      }

      // String comparison
      return options.sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
    })
  }

  // Format based on output format
  switch (format) {
    case 'line-by-line':
      return processed.join('\n')

    case 'comma-separated':
      return processed.join(', ')

    case 'space-separated':
      return processed.join(' ')

    case 'pipe-separated':
      return processed.join(' | ')

    case 'tab-separated':
      return processed.join('\t')

    case 'json-array': {
      // Convert to JSON array, preserving types if requested
      const jsonValues = options.preserveTypes
        ? processed.map((item) => {
            const num = Number(item)
            if (!isNaN(num) && item.trim() === num.toString()) {
              return num
            }
            return item
          })
        : processed
      return JSON.stringify(jsonValues)
    }

    case 'python-list': {
      const formatted = processed.map((item) => {
        if (options.preserveTypes) {
          const num = Number(item)
          if (!isNaN(num) && item.trim() === num.toString()) {
            return num.toString()
          }
        }
        // Escape single quotes
        const escaped = item.replace(/'/g, "\\'")
        return `'${escaped}'`
      })
      return `[${formatted.join(', ')}]`
    }

    case 'javascript-array': {
      const formatted = processed.map((item) => {
        if (options.preserveTypes) {
          const num = Number(item)
          if (!isNaN(num) && item.trim() === num.toString()) {
            return num.toString()
          }
        }
        // Escape single quotes
        const escaped = item.replace(/'/g, "\\'")
        return `'${escaped}'`
      })
      return `[${formatted.join(', ')}]`
    }

    case 'yaml-array': {
      // Convert to YAML array format
      // If preserveTypes is enabled, try to preserve numeric types
      const yamlValues = options.preserveTypes
        ? processed.map((item) => {
            const num = Number(item)
            if (!isNaN(num) && item.trim() === num.toString()) {
              return num
            }
            return item
          })
        : processed

      // Use YAML library to format as array
      return stringify(yamlValues, {
        indent: 2,
        lineWidth: 0,
      })
    }

    default:
      return processed.join('\n')
  }
}

/**
 * Convert list from one format to another
 */
export function convertListFormat(
  input: string,
  inputFormat: InputFormat,
  outputFormat: InputFormat,
  options: ConverterOptions
): ConversionResult {
  try {
    // Parse input
    const items = parseListInput(input, inputFormat, false)

    // Format output
    const output = formatListOutput(items, outputFormat, options)

    return {
      output,
      success: true,
      stats: {
        inputItems: items.length,
        outputItems: items.length,
        inputSize: input.length,
        outputSize: output.length,
      },
    }
  } catch (error) {
    return {
      output: '',
      success: false,
      error: error instanceof Error ? error.message : 'Conversion failed',
      stats: {
        inputItems: 0,
        outputItems: 0,
        inputSize: input.length,
        outputSize: 0,
      },
    }
  }
}

/**
 * Get language for syntax highlighting based on format
 */
export function getLanguageForFormat(format: InputFormat): string {
  switch (format) {
    case 'json-array':
      return 'json'
    case 'python-list':
      return 'python'
    case 'javascript-array':
      return 'javascript'
    case 'yaml-array':
      return 'yaml'
    default:
      return 'plaintext'
  }
}
