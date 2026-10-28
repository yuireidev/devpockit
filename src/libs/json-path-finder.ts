/**
 * JSON Path Finder Logic
 * Pure functions for JSONPath query evaluation and path finding
 */

export interface JsonPathResult {
  success: boolean;
  matches: JsonValue[];
  paths: string[];
  count: number;
  error?: string;
}

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };

function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export interface JsonPathOptions {
  returnPaths: boolean;
  returnValues: boolean;
}

/**
 * Evaluate a JSONPath expression against JSON data
 * Supports basic JSONPath syntax:
 * - $ (root)
 * - . (child operator)
 * - .. (recursive descent)
 * - * (wildcard)
 * - [] (subscript operator)
 * - [n] (array index)
 * - [start:end] (array slice)
 * - [?(expression)] (filter expression - basic support)
 */
export function evaluateJsonPath(data: JsonValue, path: string): JsonPathResult {
  if (!path || !path.trim()) {
    return {
      success: false,
      matches: [],
      paths: [],
      count: 0,
      error: 'JSONPath expression cannot be empty'
    };
  }

  try {
    const normalizedPath = path.trim();

    // Handle root selector
    if (normalizedPath === '$' || normalizedPath === '$.') {
      return {
        success: true,
        matches: [data],
        paths: ['$'],
        count: 1
      };
    }

    // Remove leading $ if present
    const pathExpr = normalizedPath.startsWith('$')
      ? normalizedPath.substring(1)
      : normalizedPath;

    // Special handling for root-level array access (e.g., $[0], $[*])
    // This handles cases where the root JSON is an array
    if (Array.isArray(data)) {
      // If path is empty or starts with bracket, handle as array access
      if (pathExpr === '' || pathExpr === '.' || pathExpr.startsWith('[')) {
        const results = evaluatePath(data, pathExpr, '$');
        return {
          success: true,
          matches: results.values,
          paths: results.paths,
          count: results.values.length
        };
      }
    }

    // Start from root (for objects or when path doesn't start with bracket)
    const results = evaluatePath(data, pathExpr, '$');

    return {
      success: true,
      matches: results.values,
      paths: results.paths,
      count: results.values.length
    };
  } catch (error) {
    return {
      success: false,
      matches: [],
      paths: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Invalid JSONPath expression'
    };
  }
}

interface PathEvaluationResult {
  values: JsonValue[];
  paths: string[];
}

function evaluatePath(data: JsonValue, path: string, currentPath: string): PathEvaluationResult {
  if (!path || path === '.') {
    return {
      values: [data],
      paths: [currentPath]
    };
  }

  // Handle recursive descent (..)
  if (path.startsWith('..')) {
    const remainingPath = path.substring(2);
    const results: PathEvaluationResult = { values: [], paths: [] };

    // Collect all matching nodes recursively
    collectRecursive(data, remainingPath, currentPath, results);
    return results;
  }

  // Remove leading dot
  const cleanPath = path.startsWith('.') ? path.substring(1) : path;

  // Handle bracket notation
  if (cleanPath.startsWith('[')) {
    return evaluateBracketNotation(data, cleanPath, currentPath);
  }

  // Handle dot notation
  // Check if first part contains bracket notation (e.g., "users[0]" or "items[*]")
  const bracketIndex = cleanPath.indexOf('[');
  const dotIndex = cleanPath.indexOf('.');

  let firstPart: string;
  let remainingParts: string;

  // If bracket comes before dot, handle property with bracket notation
  if (bracketIndex !== -1 && (dotIndex === -1 || bracketIndex < dotIndex)) {
    // Extract property name before bracket (e.g., "users" from "users[0]")
    const propertyName = cleanPath.substring(0, bracketIndex);
    // Extract everything from bracket onwards (e.g., "[0].name" from "users[0].name")
    const bracketAndAfter = cleanPath.substring(bracketIndex);

    firstPart = propertyName;
    remainingParts = bracketAndAfter;
  } else {
    // Normal dot notation splitting
    const parts = cleanPath.split('.');
    firstPart = parts[0];
    remainingParts = parts.slice(1).join('.');
  }

  // Handle wildcard
  if (firstPart === '*') {
    return evaluateWildcard(data, remainingParts, currentPath);
  }

  // Navigate to property
  if (data && typeof data === 'object') {
    if (Array.isArray(data)) {
      // If we have a property name (not empty), try to access it on array elements
      if (firstPart && firstPart !== '*') {
        // Array - apply property access to all elements
        const results: PathEvaluationResult = { values: [], paths: [] };
        data.forEach((item, index) => {
          const itemPath = `${currentPath}[${index}]`;
          const itemResults = evaluatePath(item, cleanPath, itemPath);
          results.values.push(...itemResults.values);
          results.paths.push(...itemResults.paths);
        });
        return results;
      } else {
        // Empty path or wildcard on array - return all elements
        const results: PathEvaluationResult = { values: [], paths: [] };
        data.forEach((item, index) => {
          const itemPath = `${currentPath}[${index}]`;
          if (!remainingParts || remainingParts === '') {
            results.values.push(item);
            results.paths.push(itemPath);
          } else {
            const itemResults = evaluatePath(item, remainingParts, itemPath);
            results.values.push(...itemResults.values);
            results.paths.push(...itemResults.paths);
          }
        });
        return results;
      }
    } else if (firstPart in data) {
      // Access the property, then continue with remaining path (which may include brackets)
      const newPath = remainingParts
        ? `${currentPath}.${firstPart}`
        : `${currentPath}.${firstPart}`;
      return evaluatePath(data[firstPart], remainingParts, newPath);
    }
  }

  return { values: [], paths: [] };
}

function evaluateBracketNotation(data: JsonValue, path: string, currentPath: string): PathEvaluationResult {
  // Extract bracket content
  const bracketEnd = path.indexOf(']');
  if (bracketEnd === -1) {
    throw new Error('Unclosed bracket in JSONPath');
  }

  const bracketContent = path.substring(1, bracketEnd);
  const remainingPath = path.substring(bracketEnd + 1).trim();

  // Handle arrays
  if (Array.isArray(data)) {
    // Handle array index [n]
    if (/^\d+$/.test(bracketContent)) {
      const index = parseInt(bracketContent, 10);
      if (index >= 0 && index < data.length) {
        const newPath = `${currentPath}[${index}]`;
        if (remainingPath && remainingPath !== '') {
          return evaluatePath(data[index], remainingPath, newPath);
        } else {
          return {
            values: [data[index]],
            paths: [newPath]
          };
        }
      }
      return { values: [], paths: [] };
    }

    // Handle array slice [start:end]
    if (bracketContent.includes(':')) {
      const sliceParts = bracketContent.split(':');
      if (sliceParts.length === 2) {
        const start = sliceParts[0] === '' ? 0 : parseInt(sliceParts[0], 10);
        const end = sliceParts[1] === '' ? data.length : parseInt(sliceParts[1], 10);
        const results: PathEvaluationResult = { values: [], paths: [] };

        for (let i = start; i < end && i < data.length; i++) {
          const itemPath = `${currentPath}[${i}]`;
          if (remainingPath && remainingPath !== '') {
            const itemResults = evaluatePath(data[i], remainingPath, itemPath);
            results.values.push(...itemResults.values);
            results.paths.push(...itemResults.paths);
          } else {
            results.values.push(data[i]);
            results.paths.push(itemPath);
          }
        }
        return results;
      }
      return { values: [], paths: [] };
    }

    // Handle wildcard in brackets [*]
    if (bracketContent === '*') {
      const results: PathEvaluationResult = { values: [], paths: [] };
      data.forEach((item, index) => {
        const itemPath = `${currentPath}[${index}]`;
        if (remainingPath && remainingPath !== '') {
          const itemResults = evaluatePath(item, remainingPath, itemPath);
          results.values.push(...itemResults.values);
          results.paths.push(...itemResults.paths);
        } else {
          results.values.push(item);
          results.paths.push(itemPath);
        }
      });
      return results;
    }
  }

  // Handle objects (non-array) - arrays were already handled above
  if (!isJsonObject(data)) {
    return { values: [], paths: [] };
  }

  // Handle property access ['property'] or ["property"]
  if ((bracketContent.startsWith("'") && bracketContent.endsWith("'")) ||
      (bracketContent.startsWith('"') && bracketContent.endsWith('"'))) {
    const property = bracketContent.slice(1, -1);
    if (property in data) {
      const newPath = `${currentPath}['${property}']`;
      return evaluatePath(data[property], remainingPath, newPath);
    }
    return { values: [], paths: [] };
  }

  // Handle wildcard in brackets [*]
  if (bracketContent === '*') {
    if (Array.isArray(data)) {
      const results: PathEvaluationResult = { values: [], paths: [] };
      data.forEach((item, index) => {
        const itemPath = `${currentPath}[${index}]`;
        const itemResults = evaluatePath(item, remainingPath, itemPath);
        results.values.push(...itemResults.values);
        results.paths.push(...itemResults.paths);
      });
      return results;
    } else if (isJsonObject(data)) {
      const results: PathEvaluationResult = { values: [], paths: [] };
      Object.keys(data).forEach(key => {
        const itemPath = `${currentPath}['${key}']`;
        const itemResults = evaluatePath(data[key], remainingPath, itemPath);
        results.values.push(...itemResults.values);
        results.paths.push(...itemResults.paths);
      });
      return results;
    }
    return { values: [], paths: [] };
  }

  // Handle filter expression [?(@.property == value)] - basic support
  if (bracketContent.startsWith('?(')) {
    // For now, return empty - full filter support would require expression parsing
    return { values: [], paths: [] };
  }

  // Default: treat as property name
  if (bracketContent in data) {
    const newPath = `${currentPath}['${bracketContent}']`;
    return evaluatePath(data[bracketContent], remainingPath, newPath);
  }

  return { values: [], paths: [] };
}

function evaluateWildcard(data: JsonValue, remainingPath: string, currentPath: string): PathEvaluationResult {
  const results: PathEvaluationResult = { values: [], paths: [] };

  if (data === null || typeof data !== 'object') {
    return results;
  }

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const itemPath = `${currentPath}[${index}]`;
      const itemResults = evaluatePath(item, remainingPath, itemPath);
      results.values.push(...itemResults.values);
      results.paths.push(...itemResults.paths);
    });
  } else {
    Object.keys(data).forEach(key => {
      const itemPath = `${currentPath}.${key}`;
      const itemResults = evaluatePath(data[key], remainingPath, itemPath);
      results.values.push(...itemResults.values);
      results.paths.push(...itemResults.paths);
    });
  }

  return results;
}

function collectRecursive(data: JsonValue, path: string, currentPath: string, results: PathEvaluationResult): void {
  // Check current node
  if (path === '' || path === '.') {
    results.values.push(data);
    results.paths.push(currentPath);
  } else {
    // Try to match path from current node
    const matchResults = evaluatePath(data, path, currentPath);
    if (matchResults.values.length > 0) {
      results.values.push(...matchResults.values);
      results.paths.push(...matchResults.paths);
    }
  }

  // Recurse into children
  if (data && typeof data === 'object') {
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        collectRecursive(item, path, `${currentPath}[${index}]`, results);
      });
    } else if (isJsonObject(data)) {
      Object.keys(data).forEach(key => {
        collectRecursive(data[key], path, `${currentPath}.${key}`, results);
      });
    }
  }
}

/**
 * Format JSONPath results for display
 */
export function formatJsonPathResults(result: JsonPathResult): string {
  if (!result.success) {
    return result.error || 'Query failed';
  }

  if (result.count === 0) {
    return 'No matches found';
  }

  const output = {
    count: result.count,
    matches: result.matches.map((match, index) => ({
      path: result.paths[index] || `$[${index}]`,
      value: match
    }))
  };

  return JSON.stringify(output, null, 2);
}

/**
 * Get JSONPath for a specific value in JSON (reverse lookup)
 * This is a simplified version - finds first occurrence
 */
export function findJsonPath(data: JsonValue, targetValue: JsonValue, currentPath: string = '$'): string | null {
  if (data === targetValue) {
    return currentPath;
  }

  if (data && typeof data === 'object') {
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const path = findJsonPath(data[i], targetValue, `${currentPath}[${i}]`);
        if (path) return path;
      }
    } else if (isJsonObject(data)) {
      for (const key in data) {
        const path = findJsonPath(data[key], targetValue, `${currentPath}.${key}`);
        if (path) return path;
      }
    }
  }

  return null;
}

/**
 * Validate JSONPath expression syntax (basic validation)
 */
export function validateJsonPath(path: string): { isValid: boolean; error?: string } {
  if (!path || !path.trim()) {
    return { isValid: false, error: 'JSONPath cannot be empty' };
  }

  // Basic syntax checks
  const trimmed = path.trim();

  // Check for balanced brackets
  let bracketCount = 0;
  for (const char of trimmed) {
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;
    if (bracketCount < 0) {
      return { isValid: false, error: 'Unmatched closing bracket' };
    }
  }
  if (bracketCount !== 0) {
    return { isValid: false, error: 'Unmatched opening bracket' };
  }

  return { isValid: true };
}

