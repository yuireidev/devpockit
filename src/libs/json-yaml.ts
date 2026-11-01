import { parse, stringify } from 'yaml'

export interface JsonYamlConversionResult {
  success: boolean
  output: string
  error?: string
  format: 'json' | 'yaml'
}

export interface JsonYamlStats {
  inputSize: number
  outputSize: number
  inputLines: number
  outputLines: number
  compressionRatio: number
  format: 'json' | 'yaml'
}

export interface JsonYamlValidationResult {
  isValid: boolean
  format: 'json' | 'yaml' | 'unknown'
  error?: string
}

/**
 * Convert JSON to YAML
 */
export function jsonToYaml(jsonString: string): JsonYamlConversionResult {
  try {
    // First validate that it's valid JSON
    const jsonData = JSON.parse(jsonString)

    // Convert to YAML
    const yamlString = stringify(jsonData, {
      indent: 2,
      lineWidth: 0,
    })

    return {
      success: true,
      output: yamlString,
      format: 'yaml',
    }
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Invalid JSON format',
      format: 'yaml',
    }
  }
}

/**
 * Convert YAML to JSON
 */
export function yamlToJson(yamlString: string): JsonYamlConversionResult {
  try {
    // Parse YAML
    const yamlData = parse(yamlString)

    // Convert to JSON with pretty printing
    const jsonString = JSON.stringify(yamlData, null, 2)

    return {
      success: true,
      output: jsonString,
      format: 'json',
    }
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Invalid YAML format',
      format: 'json',
    }
  }
}

/**
 * Validate JSON format
 */
export function validateJson(jsonString: string): JsonYamlValidationResult {
  try {
    JSON.parse(jsonString)
    return {
      isValid: true,
      format: 'json',
    }
  } catch (error) {
    return {
      isValid: false,
      format: 'json',
      error: error instanceof Error ? error.message : 'Invalid JSON format',
    }
  }
}

/**
 * Validate YAML format
 */
export function validateYaml(yamlString: string): JsonYamlValidationResult {
  try {
    parse(yamlString)
    return {
      isValid: true,
      format: 'yaml',
    }
  } catch (error) {
    return {
      isValid: false,
      format: 'yaml',
      error: error instanceof Error ? error.message : 'Invalid YAML format',
    }
  }
}

/**
 * Auto-detect format (JSON or YAML)
 */
export function detectFormat(content: string): 'json' | 'yaml' | 'unknown' {
  const trimmed = content.trim()

  // Check for JSON format
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch {
      // Not valid JSON, continue checking
    }
  }

  // Check for YAML format indicators - be more strict
  if (trimmed.includes(':') && (trimmed.includes('\n') || trimmed.includes('---'))) {
    try {
      parse(trimmed)
      return 'yaml'
    } catch {
      // Not valid YAML, continue checking
    }
  }

  // Only try YAML parsing if it looks like YAML (has colons and proper structure)
  if (trimmed.includes(':') && !trimmed.includes('{') && !trimmed.includes('[')) {
    try {
      parse(trimmed)
      return 'yaml'
    } catch {
      // Not valid YAML
    }
  }

  return 'unknown'
}

/**
 * Get conversion statistics
 */
export function getConversionStats(input: string, output: string, format: 'json' | 'yaml'): JsonYamlStats {
  const inputSize = input.length
  const outputSize = output.length
  const inputLines = input.split('\n').length
  const outputLines = output.split('\n').length
  const compressionRatio = inputSize > 0 ? outputSize / inputSize : 1

  return {
    inputSize,
    outputSize,
    inputLines,
    outputLines,
    compressionRatio,
    format,
  }
}

/**
 * Convert between formats with auto-detection
 */
export function convertFormat(content: string, targetFormat: 'json' | 'yaml'): JsonYamlConversionResult {
  const detectedFormat = detectFormat(content)

  if (detectedFormat === 'unknown') {
    return {
      success: false,
      output: '',
      error: 'Unable to detect input format. Please ensure the content is valid JSON or YAML.',
      format: targetFormat,
    }
  }

  if (detectedFormat === targetFormat) {
    return {
      success: true,
      output: content,
      format: targetFormat,
    }
  }

  if (detectedFormat === 'json' && targetFormat === 'yaml') {
    return jsonToYaml(content)
  }

  if (detectedFormat === 'yaml' && targetFormat === 'json') {
    return yamlToJson(content)
  }

  return {
    success: false,
    output: '',
    error: 'Conversion not supported',
    format: targetFormat,
  }
}

/**
 * Format and validate content
 */
export function formatContent(content: string, format: 'json' | 'yaml'): JsonYamlConversionResult {
  if (format === 'json') {
    try {
      const parsed = JSON.parse(content)
      const formatted = JSON.stringify(parsed, null, 2)
      return {
        success: true,
        output: formatted,
        format: 'json',
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Invalid JSON format',
        format: 'json',
      }
    }
  } else {
    try {
      const parsed = parse(content)
      const formatted = stringify(parsed, {
        indent: 2,
        lineWidth: 0,
      })
      return {
        success: true,
        output: formatted,
        format: 'yaml',
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Invalid YAML format',
        format: 'yaml',
      }
    }
  }
}
