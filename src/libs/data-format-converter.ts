import { parse, stringify } from 'yaml';

export type FormatType = 'json' | 'yaml' | 'python' | 'typescript' | 'xml';
type JsonData = null | boolean | number | string | JsonData[] | { [key: string]: JsonData };

export interface MultiFormatConversionResult {
  success: boolean;
  output: string;
  error?: string;
  format: FormatType;
}

export interface MultiFormatStats {
  inputSize: number;
  outputSize: number;
  inputLines: number;
  outputLines: number;
  format: FormatType;
}

/**
 * Convert any format to JSON (common format)
 */
function toJson(content: string, inputFormat: FormatType): { success: boolean; data?: JsonData; error?: string } {
  try {
    if (inputFormat === 'json') {
      return { success: true, data: JSON.parse(content) };
    } else if (inputFormat === 'yaml') {
      return { success: true, data: parse(content) };
    } else if (inputFormat === 'python') {
      // Parse Python dictionary string
      // Remove comments and handle common Python dict patterns
      let cleaned = content.trim();

      // Handle Python-specific values first
      cleaned = cleaned.replace(/None/g, 'null');
      cleaned = cleaned.replace(/True/g, 'true');
      cleaned = cleaned.replace(/False/g, 'false');

      // Handle quotes - if we see both single and double quotes, preserve double quotes
      // Otherwise, convert single quotes to double quotes for JSON compatibility
      const hasDoubleQuotes = cleaned.includes('"');
      const hasSingleQuotes = cleaned.includes("'");

      if (hasSingleQuotes && !hasDoubleQuotes) {
        // Only single quotes, convert to double
        cleaned = cleaned.replace(/'/g, '"');
      } else if (hasDoubleQuotes && hasSingleQuotes) {
        // Both present - escape single quotes that are inside double-quoted strings
        // This is a simplified approach - for complex cases, user should use consistent quotes
        cleaned = cleaned.replace(/'/g, '"');
      }
      // If only double quotes, leave as is

      // Try to parse as JSON after cleaning
      try {
        return { success: true, data: JSON.parse(cleaned) };
      } catch {
        // If that fails, try to evaluate (with safety checks)
        // For security, we'll be strict about what we accept
        if (cleaned.match(/^[\s\n]*\{[\s\S]*\}/) || cleaned.match(/^[\s\n]*\[[\s\S]*\]/)) {
          // It looks like a dict or list, try to parse more carefully
          // Replace Python-specific syntax
          cleaned = cleaned.replace(/,\s*}/g, '}'); // trailing commas
          cleaned = cleaned.replace(/,\s*]/g, ']'); // trailing commas in arrays
          return { success: true, data: JSON.parse(cleaned) };
        }
        throw new Error('Invalid Python dictionary format');
      }
    } else if (inputFormat === 'typescript') {
      // Parse TypeScript Map
      // Extract content from Map constructor or object literal
      let cleaned = content.trim();

      // Handle new Map([...]) syntax
      const mapMatch = cleaned.match(/new\s+Map\s*\(\s*\[([\s\S]*?)\]\s*\)/);
      if (mapMatch) {
        // Convert array of [key, value] pairs to object
        const pairs = mapMatch[1];
        // This is complex, so we'll try a simpler approach
        // For now, treat it as JSON-like
        cleaned = pairs;
      }

      // Handle object literal { key: value } or array
      if (cleaned.match(/^[\s\n]*\{[\s\S]*\}/) || cleaned.match(/^[\s\n]*\[[\s\S]*\]/)) {
        // Remove TypeScript-specific syntax
        cleaned = cleaned.replace(/:\s*Map<[^>]+>/g, ': {}');
        cleaned = cleaned.replace(/,\s*}/g, '}');
        cleaned = cleaned.replace(/,\s*]/g, ']');

        // Quote unquoted keys in object literals (TypeScript allows unquoted keys, JSON doesn't)
        // Use a regex that matches unquoted keys that follow { or ,
        // We'll do multiple passes to handle nested objects
        let previousCleaned = '';
        let iterations = 0;
        while (cleaned !== previousCleaned && iterations < 10) {
          previousCleaned = cleaned;
          // Match unquoted keys: { key: or , key: where key is not already quoted
          // This regex looks for { or , followed by whitespace, then an identifier, then :
          // We need to avoid matching keys that are already inside quotes
          cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
          iterations++;
        }

        // Handle single quotes - convert to double quotes for JSON
        // Replace single quotes, but be aware this might break if there are escaped quotes
        cleaned = cleaned.replace(/'/g, '"');

        try {
          return { success: true, data: JSON.parse(cleaned) };
        } catch {
          // If parsing still fails, try one more cleanup
          // Remove trailing commas more aggressively
          cleaned = cleaned.replace(/,\s*}/g, '}');
          cleaned = cleaned.replace(/,\s*]/g, ']');
          // Try one more time to quote any remaining unquoted keys
          cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
          try {
            return { success: true, data: JSON.parse(cleaned) };
          } catch (finalError) {
            throw new Error(`Failed to parse TypeScript: ${finalError instanceof Error ? finalError.message : 'Unknown error'}`);
          }
        }
      }

      throw new Error('Invalid TypeScript Map format');
    } else if (inputFormat === 'xml') {
      // Parse XML to JSON
      return xmlToJson(content);
    }

    return { success: false, error: 'Unsupported input format' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse input'
    };
  }
}

/**
 * Convert XML to JSON
 */
function xmlToJson(xmlString: string): { success: boolean; data?: JsonData; error?: string } {
  try {
    // Remove XML declaration
    let cleaned = xmlString.trim();
    cleaned = cleaned.replace(/<\?xml[^>]*\?>/g, '').trim();

    // Remove comments
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

    // Parse XML to object
    const result = parseXmlToObject(cleaned);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid XML format'
    };
  }
}

/**
 * Parse XML string to JavaScript object
 */
function parseXmlToObject(xml: string): Record<string, JsonData> {
  // Remove leading/trailing whitespace
  xml = xml.trim();

  // Handle self-closing tags
  xml = xml.replace(/<([^>]+)\/>/g, '<$1></$1>');

  // Extract root tag
  const rootMatch = xml.match(/^<([^>\s]+)([^>]*)>([\s\S]*)<\/\1>$/);
  if (!rootMatch) {
    // Try to parse as single element with attributes
    const singleMatch = xml.match(/^<([^>\s]+)([^>]*)>$/);
    if (singleMatch) {
      const tagName = singleMatch[1];
      const attrs = parseAttributes(singleMatch[2]);
      return attrs && Object.keys(attrs).length > 0 ? { [tagName]: attrs } : { [tagName]: '' };
    }
    throw new Error('Invalid XML structure');
  }

  const tagName = rootMatch[1];
  const attributes = parseAttributes(rootMatch[2]);
  const content = rootMatch[3].trim();

  // Parse children
  const children = parseXmlContent(content);

  // Build result object
  const result: Record<string, JsonData> = {};

  // Add attributes if present
  if (attributes && Object.keys(attributes).length > 0) {
    result['@attributes'] = attributes;
  }

  // Add children
  if (children && Object.keys(children).length > 0) {
    Object.assign(result, children);
  } else if (content && !content.match(/^<[^>]+>/)) {
    // Text content only
    result['#text'] = content;
  }

  return { [tagName]: result };
}

/**
 * Parse XML attributes string
 */
function parseAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (!attrString.trim()) return attrs;

  // Match attribute="value" or attribute='value'
  const attrRegex = /(\S+)=["']([^"']*)["']/g;
  let match;
  while ((match = attrRegex.exec(attrString)) !== null) {
    attrs[match[1]] = match[2];
  }

  return attrs;
}

/**
 * Parse XML content (children and text)
 */
function parseXmlContent(content: string): Record<string, JsonData> {
  const result: Record<string, JsonData> = {};

  if (!content.trim()) return result;

  // Check if content is just text (no tags)
  if (!content.match(/<[^>]+>/)) {
    return { '#text': content.trim() };
  }

  // Parse child elements
  const childRegex = /<([^>\s]+)([^>]*)>([\s\S]*?)<\/\1>/g;
  let match;
  let lastIndex = 0;

  while ((match = childRegex.exec(content)) !== null) {
    // Check for text before this match
    const beforeText = content.substring(lastIndex, match.index).trim();
    if (beforeText) {
      // There's text content, which is complex - for now, skip it
    }

    const childTag = match[1];
    const childAttrs = parseAttributes(match[2]);
    const childContent = match[3].trim();

    let childValue: JsonData;
    if (childContent && childContent.match(/<[^>]+>/)) {
      // Nested elements
      childValue = parseXmlToObject(`<${childTag}${match[2]}>${childContent}</${childTag}>`);
      childValue = childValue[childTag];
    } else {
      // Text content or empty
      childValue = {};
      if (childAttrs && Object.keys(childAttrs).length > 0) {
        childValue['@attributes'] = childAttrs;
      }
      if (childContent) {
        childValue['#text'] = childContent;
      } else if (Object.keys(childValue).length === 0) {
        childValue = '';
      }
    }

    // Handle multiple children with same tag name
    if (result[childTag]) {
      if (!Array.isArray(result[childTag])) {
        result[childTag] = [result[childTag]];
      }
      result[childTag].push(childValue);
    } else {
      result[childTag] = childValue;
    }

    lastIndex = match.index + match[0].length;
  }

  return result;
}

/**
 * Convert JSON to target format
 */
function fromJson(data: JsonData, targetFormat: FormatType, indentSize: number = 2, pythonQuoteStyle: 'single' | 'double' = 'single'): string {
  // Ensure indentSize is valid (between 1 and 9 for YAML, any positive number for others)
  const validIndent = Math.max(1, Math.min(9, indentSize));

  if (targetFormat === 'json') {
    return JSON.stringify(data, null, indentSize);
  } else if (targetFormat === 'yaml') {
    // YAML library supports indent option, ensure it's a valid number
    return stringify(data, {
      indent: validIndent,
      lineWidth: 0
    });
  } else if (targetFormat === 'python') {
    return jsonToPythonDict(data, indentSize, 0, pythonQuoteStyle);
  } else if (targetFormat === 'typescript') {
    return jsonToTypeScriptMap(data, indentSize);
  } else if (targetFormat === 'xml') {
    return jsonToXml(data, indentSize);
  }

  return '';
}

/**
 * Convert JSON object to Python dictionary string
 */
function jsonToPythonDict(data: JsonData, indentSize: number = 2, currentIndent: number = 0, quoteStyle: 'single' | 'double' = 'single'): string {
  const indent = ' '.repeat(currentIndent);
  const nextIndent = ' '.repeat(currentIndent + indentSize);
  const quote = quoteStyle === 'single' ? "'" : '"';

  if (data === null) {
    return 'None';
  }

  if (typeof data === 'string') {
    // Escape quotes and wrap in quotes
    const escaped = data.replace(/\\/g, '\\\\').replace(new RegExp(quote, 'g'), `\\${quote}`);
    return `${quote}${escaped}${quote}`;
  }

  if (typeof data === 'number') {
    return data.toString();
  }

  if (typeof data === 'boolean') {
    return data ? 'True' : 'False';
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return '[]';
    }
    const items = data.map(item => `${nextIndent}${jsonToPythonDict(item, indentSize, currentIndent + indentSize, quoteStyle)}`).join(',\n');
    return `[\n${items}\n${indent}]`;
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return '{}';
    }
    const items = keys.map(key => {
      const value = jsonToPythonDict(data[key], indentSize, currentIndent + indentSize, quoteStyle);
      // Always quote dictionary keys
      const escapedKey = key.replace(/\\/g, '\\\\').replace(new RegExp(quote, 'g'), `\\${quote}`);
      const keyStr = `${quote}${escapedKey}${quote}`;
      return `${nextIndent}${keyStr}: ${value}`;
    }).join(',\n');
    return `{\n${items}\n${indent}}`;
  }

  return String(data);
}

/**
 * Convert JSON object to TypeScript Map string
 */
function jsonToTypeScriptMap(data: JsonData, indentSize: number = 2, currentIndent: number = 0): string {
  const indent = ' '.repeat(currentIndent);
  const nextIndent = ' '.repeat(currentIndent + indentSize);

  if (data === null) {
    return 'null';
  }

  if (typeof data === 'string') {
    const escaped = data.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
    return `'${escaped}'`;
  }

  if (typeof data === 'number') {
    return data.toString();
  }

  if (typeof data === 'boolean') {
    return data ? 'true' : 'false';
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return '[]';
    }
    const items = data.map(item => `${nextIndent}${jsonToTypeScriptMap(item, indentSize, currentIndent + indentSize)}`).join(',\n');
    return `[\n${items}\n${indent}]`;
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return '{}';
    }
    const items = keys.map(key => {
      const value = jsonToTypeScriptMap(data[key], indentSize, currentIndent + indentSize);
      const keyStr = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? key : `'${key.replace(/'/g, "\\'")}'`;
      return `${nextIndent}${keyStr}: ${value}`;
    }).join(',\n');
    return `{\n${items}\n${indent}}`;
  }

  return String(data);
}

/**
 * Convert JSON object to XML string
 */
function jsonToXml(data: JsonData, indentSize: number = 2, currentIndent: number = 0, rootTag: string = 'root'): string {
  const indent = ' '.repeat(currentIndent);
  // Handle special case: if data is an object with a single key, use that as root
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const keys = Object.keys(data);
    if (keys.length === 1 && !keys[0].startsWith('@') && keys[0] !== '#text') {
      rootTag = keys[0];
      data = data[keys[0]];
    }
  }

  if (data === null || data === undefined) {
    return `${indent}<${rootTag}></${rootTag}>`;
  }

  if (typeof data === 'string') {
    const escaped = data
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
    return `${indent}<${rootTag}>${escaped}</${rootTag}>`;
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return `${indent}<${rootTag}>${data}</${rootTag}>`;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return `${indent}<${rootTag}></${rootTag}>`;
    }
    return data.map(item => jsonToXml(item, indentSize, currentIndent, rootTag)).join('\n');
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return `${indent}<${rootTag}></${rootTag}>`;
    }

    // Handle attributes
    const attributes = data['@attributes'] || {};
    const textContent = data['#text'];
    const attrString = Object.keys(attributes).length > 0
      ? ' ' + Object.entries(attributes).map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`).join(' ')
      : '';

    // Filter out special keys
    const childKeys = keys.filter(k => k !== '@attributes' && k !== '#text');

    if (childKeys.length === 0) {
      // Only text content or empty
      if (textContent !== undefined) {
        const escaped = String(textContent)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
        return `${indent}<${rootTag}${attrString}>${escaped}</${rootTag}>`;
      }
      return `${indent}<${rootTag}${attrString}></${rootTag}>`;
    }

    // Has child elements
    let result = `${indent}<${rootTag}${attrString}>`;
    if (textContent !== undefined) {
      const escaped = String(textContent)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
      result += escaped;
    }

    // Process child elements
    for (const key of childKeys) {
      const value = data[key];
      if (Array.isArray(value)) {
        // Multiple elements with same tag name
        for (const item of value) {
          result += '\n' + jsonToXml(item, indentSize, currentIndent + indentSize, key);
        }
      } else {
        result += '\n' + jsonToXml(value, indentSize, currentIndent + indentSize, key);
      }
    }

    result += `\n${indent}</${rootTag}>`;
    return result;
  }

  return `${indent}<${rootTag}>${String(data)}</${rootTag}>`;
}

/**
 * Auto-detect input format
 */
export function detectFormat(content: string): FormatType | 'unknown' {
  const trimmed = content.trim();

  // Check for JSON format
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid JSON, continue checking
    }
  }

  // Check for YAML format
  if (trimmed.includes(':') && (trimmed.includes('\n') || trimmed.includes('---'))) {
    try {
      parse(trimmed);
      return 'yaml';
    } catch {
      // Not valid YAML
    }
  }

  // Check for Python dictionary
  if (trimmed.match(/^[\s\n]*\{[\s\S]*\}/) || trimmed.match(/^[\s\n]*\[[\s\S]*\]/)) {
    // Check for Python-specific syntax
    if (trimmed.includes('None') || trimmed.includes('True') || trimmed.includes('False') ||
        trimmed.match(/['"][^'"]*['"]\s*:/)) {
      return 'python';
    }
  }

  // Check for TypeScript Map
  if (trimmed.includes('new Map') || trimmed.match(/:\s*Map</) ||
      (trimmed.match(/^[\s\n]*\{[\s\S]*\}/) && trimmed.includes(':'))) {
    return 'typescript';
  }

  // Check for XML format
  if (trimmed.match(/^<\?xml[\s\S]*\?>/i) || trimmed.match(/^<[^>]+>[\s\S]*<\/[^>]+>$/)) {
    return 'xml';
  }

  return 'unknown';
}

/**
 * Convert between formats (JSON is the common format)
 */
export function convertFormat(
  content: string,
  inputFormat: FormatType,
  targetFormat: FormatType,
  indentSize: number = 2,
  pythonQuoteStyle: 'single' | 'double' = 'single'
): MultiFormatConversionResult {
  try {
    const detectedInputFormat: FormatType = inputFormat;

    // If same format, return as-is (but formatted)
    if (detectedInputFormat === targetFormat) {
      const jsonResult = toJson(content, detectedInputFormat);
      if (jsonResult.success && jsonResult.data) {
        return {
          success: true,
          output: fromJson(jsonResult.data, targetFormat, indentSize, pythonQuoteStyle),
          format: targetFormat
        };
      }
    }

    // Convert to JSON first (common format)
    const jsonResult = toJson(content, detectedInputFormat);
    if (!jsonResult.success || !jsonResult.data) {
      return {
        success: false,
        output: '',
        error: jsonResult.error || 'Failed to parse input',
        format: targetFormat
      };
    }

    // Convert from JSON to target format
    const output = fromJson(jsonResult.data, targetFormat, indentSize, pythonQuoteStyle);

    return {
      success: true,
      output,
      format: targetFormat
    };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Conversion failed',
      format: targetFormat
    };
  }
}

/**
 * Get conversion statistics
 */
export function getConversionStats(
  input: string,
  output: string,
  format: FormatType
): MultiFormatStats {
  const inputSize = input.length;
  const outputSize = output.length;
  const inputLines = input.split('\n').length;
  const outputLines = output.split('\n').length;

  return {
    inputSize,
    outputSize,
    inputLines,
    outputLines,
    format
  };
}

/**
 * Validate input format
 */
export function validateFormat(content: string, format: FormatType): { isValid: boolean; error?: string } {
  try {
    const result = toJson(content, format);
    return {
      isValid: result.success,
      error: result.error
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Validation failed'
    };
  }
}

