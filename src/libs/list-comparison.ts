/**
 * List Comparison Utilities
 * Functions for parsing, comparing, and operating on lists
 */

import { parse } from 'yaml';

export interface ListComparisonStats {
  listASize: number;
  listBSize: number;
  listAUnique: number;
  listBUnique: number;
  commonItems: number;
  onlyInA: number;
  onlyInB: number;
  similarity: number; // Percentage
}

export interface ListItem {
  value: string;
  source: 'both' | 'a-only' | 'b-only';
  originalValue: string; // Preserve original for display
}

export type InputFormat = 'line-by-line' | 'comma-separated' | 'space-separated' | 'pipe-separated' | 'tab-separated' | 'json-array' | 'python-list' | 'javascript-array' | 'yaml-array';

/**
 * Parse input text into an array of strings based on format
 */
export function parseListInput(input: string, format: InputFormat, caseSensitive: boolean): string[] {
  if (!input.trim()) {
    return [];
  }

  let items: string[] = [];

  switch (format) {
    case 'line-by-line':
      items = input
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      break;

    case 'comma-separated':
      items = input
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
      break;

    case 'space-separated':
      items = input
        .split(/\s+/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
      break;

    case 'pipe-separated':
      items = input
        .split('|')
        .map(item => item.trim())
        .filter(item => item.length > 0);
      break;

    case 'tab-separated':
      items = input
        .split('\t')
        .map(item => item.trim())
        .filter(item => item.length > 0);
      break;

    case 'json-array':
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) {
          items = parsed.map(item => String(item));
        } else {
          throw new Error('Input is not a valid JSON array');
        }
      } catch {
        throw new Error('Invalid JSON array format');
      }
      break;

    case 'yaml-array':
      try {
        const parsed = parse(input);
        if (Array.isArray(parsed)) {
          items = parsed.map(item => String(item));
        } else {
          throw new Error('Input is not a valid YAML array');
        }
      } catch {
        throw new Error('Invalid YAML array format');
      }
      break;

    case 'python-list':
    case 'javascript-array': {
      // Remove leading/trailing whitespace
      const trimmed = input.trim();

      // Check if it starts with [ and ends with ]
      if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
        throw new Error(`Invalid ${format === 'python-list' ? 'Python' : 'JavaScript'} array format: missing brackets`);
      }

      // Extract content between brackets
      const content = trimmed.slice(1, -1).trim();

      if (!content) {
        // Empty array
        items = [];
        break;
      }

      // Parse array elements using a state machine
      const elements: string[] = [];
      let current = '';
      let inString = false;
      let quoteChar = '';
      let i = 0;

      while (i < content.length) {
        const char = content[i];
        const nextChar = i + 1 < content.length ? content[i + 1] : '';

        if (!inString) {
          // Skip whitespace
          if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
            i++;
            continue;
          }

          // Comma separator
          if (char === ',') {
            if (current.trim()) {
              elements.push(current.trim());
              current = '';
            }
            i++;
            continue;
          }

          // Start of string (single or double quote)
          if (char === "'" || char === '"') {
            inString = true;
            quoteChar = char;
            i++;
            continue;
          }

          // Number or unquoted value
          current += char;
          i++;
        } else {
          // Inside string
          // Check for escaped quote
          if (char === '\\' && (nextChar === quoteChar || nextChar === '\\')) {
            // Escaped quote or backslash
            current += nextChar;
            i += 2;
            continue;
          }

          // End of string (matching quote, not escaped)
          if (char === quoteChar) {
            inString = false;
            quoteChar = '';
            elements.push(current);
            current = '';
            i++;
            // Skip whitespace after closing quote
            while (i < content.length && (content[i] === ' ' || content[i] === '\t' || content[i] === '\n' || content[i] === '\r')) {
              i++;
            }
            continue;
          }

          // Regular character inside string
          current += char;
          i++;
        }
      }

      // Add last element if exists
      if (current.trim()) {
        elements.push(current.trim());
      }

      // Process elements: remove quotes from strings, keep numbers as strings
      items = elements.map(item => {
        const trimmed = item.trim();
        // Check if it's a quoted string
        if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
            (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
          // Remove outer quotes and unescape
          let unquoted = trimmed.slice(1, -1);
          // Unescape common escape sequences
          unquoted = unquoted.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
          return unquoted;
        }
        // Number or unquoted value
        return trimmed;
      }).filter(item => item.length > 0);

      break;
    }
  }

  // Apply case sensitivity
  if (!caseSensitive) {
    // Store original values but normalize for comparison
    return items;
  }

  return items;
}

/**
 * Normalize item for comparison (handles case sensitivity)
 */
function normalizeItem(item: string, caseSensitive: boolean): string {
  return caseSensitive ? item : item.toLowerCase();
}

/**
 * Calculate statistics for two lists
 */
export function calculateStats(
  listA: string[],
  listB: string[],
  caseSensitive: boolean
): ListComparisonStats {
  const normalizedA = listA.map(item => normalizeItem(item, caseSensitive));
  const normalizedB = listB.map(item => normalizeItem(item, caseSensitive));

  const setA = new Set(normalizedA);
  const setB = new Set(normalizedB);
  const setAUnique = new Set(normalizedA);
  const setBUnique = new Set(normalizedB);

  // Find common items
  const common = new Set<string>();
  setA.forEach(item => {
    if (setB.has(item)) {
      common.add(item);
    }
  });

  // Find items only in A
  const onlyInA = new Set<string>();
  setA.forEach(item => {
    if (!setB.has(item)) {
      onlyInA.add(item);
    }
  });

  // Find items only in B
  const onlyInB = new Set<string>();
  setB.forEach(item => {
    if (!setA.has(item)) {
      onlyInB.add(item);
    }
  });

  // Calculate similarity percentage
  const totalUnique = setAUnique.size + setBUnique.size;
  const similarity = totalUnique > 0 ? (common.size * 2 / totalUnique) * 100 : 0;

  return {
    listASize: listA.length,
    listBSize: listB.length,
    listAUnique: setAUnique.size,
    listBUnique: setBUnique.size,
    commonItems: common.size,
    onlyInA: onlyInA.size,
    onlyInB: onlyInB.size,
    similarity: Math.round(similarity * 100) / 100,
  };
}

/**
 * Perform set operations on two lists
 */
export function performOperation(
  listA: string[],
  listB: string[],
  operation: 'union' | 'intersection' | 'a-minus-b' | 'b-minus-a' | 'symmetric',
  caseSensitive: boolean
): ListItem[] {
  // Create maps to preserve original values
  const mapA = new Map<string, string>();
  const mapB = new Map<string, string>();

  listA.forEach(item => {
    const normalized = normalizeItem(item, caseSensitive);
    if (!mapA.has(normalized)) {
      mapA.set(normalized, item);
    }
  });

  listB.forEach(item => {
    const normalized = normalizeItem(item, caseSensitive);
    if (!mapB.has(normalized)) {
      mapB.set(normalized, item);
    }
  });

  const normalizedA = Array.from(mapA.keys());
  const normalizedB = Array.from(mapB.keys());

  const setA = new Set(normalizedA);
  const setB = new Set(normalizedB);

  let result: string[] = [];

  switch (operation) {
    case 'union': {
      const union = new Set([...normalizedA, ...normalizedB]);
      result = Array.from(union);
      break;
    }

    case 'intersection': {
      const intersection = normalizedA.filter(item => setB.has(item));
      result = intersection;
      break;
    }

    case 'a-minus-b': {
      const diff = normalizedA.filter(item => !setB.has(item));
      result = diff;
      break;
    }

    case 'b-minus-a': {
      const diff = normalizedB.filter(item => !setA.has(item));
      result = diff;
      break;
    }

    case 'symmetric': {
      const symmetric = [
        ...normalizedA.filter(item => !setB.has(item)),
        ...normalizedB.filter(item => !setA.has(item)),
      ];
      result = symmetric;
      break;
    }
  }

  // Convert to ListItem format with source information
  return result.map(normalized => {
    const inA = setA.has(normalized);
    const inB = setB.has(normalized);
    const source: 'both' | 'a-only' | 'b-only' = inA && inB ? 'both' : inA ? 'a-only' : 'b-only';

    // Use original value from the appropriate map
    const originalValue = source === 'a-only'
      ? mapA.get(normalized)!
      : source === 'b-only'
      ? mapB.get(normalized)!
      : mapA.get(normalized) || mapB.get(normalized)!;

    return {
      value: normalized,
      source,
      originalValue,
    };
  });
}

/**
 * Sort list items (preserving original values)
 */
export function sortListItems(items: ListItem[], sortOrder: 'none' | 'asc' | 'desc' = 'none'): ListItem[] {
  if (sortOrder === 'none') {
    return items;
  }

  const ascending = sortOrder === 'asc';
  const sorted = [...items].sort((a, b) => {
    // Try numeric comparison first
    const numA = Number(a.originalValue);
    const numB = Number(b.originalValue);

    if (!isNaN(numA) && !isNaN(numB)) {
      return ascending ? numA - numB : numB - numA;
    }

    // String comparison
    return ascending
      ? a.originalValue.localeCompare(b.originalValue)
      : b.originalValue.localeCompare(a.originalValue);
  });

  return sorted;
}

