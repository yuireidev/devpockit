/**
 * YAML Path Finder Logic
 * Pure functions for YAMLPath query evaluation and path finding
 * Supports YAML-specific features: anchors, aliases, tags, and multi-document YAML
 */

import { parse, parseAllDocuments, parseDocument, stringify, type Document, type Node } from 'yaml';

interface YamlAstNode {
  anchor?: string;
  type?: string;
  source?: string;
  tag?: string;
  items?: unknown[];
  key?: unknown;
  value?: unknown;
  toJS?: (doc?: Document<Node, boolean>) => unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asYamlAstNode(value: unknown): YamlAstNode | null {
  return isRecord(value) ? (value as YamlAstNode) : null;
}

function getProperty(value: unknown, key: string): unknown {
  return isRecord(value) ? value[key] : undefined;
}

export interface YamlPathResult {
  success: boolean;
  matches: unknown[];
  paths: string[];
  count: number;
  error?: string;
  anchors?: Map<string, unknown>; // YAML-specific: anchor definitions
  aliases?: Map<string, string>; // YAML-specific: alias references
}

export interface YamlPathOptions {
  returnPaths: boolean;
  returnValues: boolean;
  formatOutput: boolean;
  handleAnchors: boolean; // YAML-specific option
  handleAliases: boolean; // YAML-specific option
  handleTags: boolean; // YAML-specific option
}

export interface YamlDocument {
  content: unknown;
  anchors: Map<string, unknown>;
  aliases: Map<string, string>;
  tags: Map<string, string>;
  lineNumber?: number; // For multi-document support
}

export interface YamlMetadata {
  anchors: Map<string, unknown>;
  aliases: Map<string, string>;
  tags: Map<string, string>;
}

// Token types for YAML path parsing
type TokenType =
  | 'ROOT'           // $
  | 'DOT'            // .
  | 'DOUBLE_DOT'     // ..
  | 'BRACKET_OPEN'   // [
  | 'BRACKET_CLOSE'  // ]
  | 'WILDCARD'       // *
  | 'ANCHOR'         // *anchor (YAML-specific)
  | 'ALIAS'          // *alias (YAML-specific)
  | 'TAG'            // !!str (YAML-specific)
  | 'IDENTIFIER'     // property name
  | 'STRING'         // quoted string
  | 'NUMBER'         // array index
  | 'SLICE';         // [start:end]

interface Token {
  type: TokenType;
  value: string;
  position: number;
}

/**
 * Parse YAML string and extract metadata (anchors, aliases, tags)
 * @param yamlString - The YAML string to parse
 * @returns Parsed documents with metadata or error
 */
export function parseYamlWithMetadata(yamlString: string): {
  documents: YamlDocument[];
  error?: string;
} {
  if (!yamlString || !yamlString.trim()) {
    return {
      documents: [],
      error: 'YAML string cannot be empty'
    };
  }

  try {
    const documents: YamlDocument[] = [];

    // Check if it's multi-document YAML (contains ---)
    const isMultiDocument = yamlString.includes('---');

    if (isMultiDocument) {
      // Parse all documents
      try {
        const yamlDocs = parseAllDocuments(yamlString);

        yamlDocs.forEach((doc, index) => {
          if (doc.errors && doc.errors.length > 0) {
            throw new Error(`Document ${index + 1} has errors: ${doc.errors.map(e => e.message).join(', ')}`);
          }

          const content = doc.toJS();
          const anchors = new Map<string, unknown>();
          const aliases = new Map<string, string>();
          const tags = new Map<string, string>();

          // Extract metadata from document
          extractMetadataFromDocument(doc, content, '$', anchors, aliases, tags);

        // Debug: Try alternative extraction if no anchors found
        if (anchors.size === 0 && doc.contents) {
          extractAnchorsFromAST(doc.contents, content, '$', anchors, doc);
        }

          documents.push({
            content,
            anchors,
            aliases,
            tags,
            lineNumber: doc.range ? doc.range[0] : undefined
          });
        });
    } catch {
        // Fallback: try parsing as single document
        const content = parse(yamlString);
        const anchors = new Map<string, unknown>();
        const aliases = new Map<string, string>();
        const tags = new Map<string, string>();

        // Try to extract metadata from parsed content (basic extraction)
        extractMetadataFromData(content, '$', anchors, aliases, tags);

        documents.push({
          content,
          anchors,
          aliases,
          tags
        });
      }
    } else {
      // Single document
      try {
        const doc = parseDocument(yamlString);

        if (doc.errors && doc.errors.length > 0) {
          throw new Error(`YAML parsing errors: ${doc.errors.map(e => e.message).join(', ')}`);
        }

        const content = doc.toJS();
        const anchors = new Map<string, unknown>();
        const aliases = new Map<string, string>();
        const tags = new Map<string, string>();

        // Extract metadata from document
        extractMetadataFromDocument(doc, content, '$', anchors, aliases, tags);

        // Debug: Log anchors found (can be removed later)
        if (anchors.size === 0 && doc.contents) {
          // Try alternative extraction method
          extractAnchorsFromAST(doc.contents, content, '$', anchors, doc);
        }

        documents.push({
          content,
          anchors,
          aliases,
          tags
        });
    } catch {
        // Fallback: use simple parse
        const content = parse(yamlString);
        const anchors = new Map<string, unknown>();
        const aliases = new Map<string, string>();
        const tags = new Map<string, string>();

        // Try to extract metadata from parsed content (basic extraction)
        extractMetadataFromData(content, '$', anchors, aliases, tags);

        documents.push({
          content,
          anchors,
          aliases,
          tags
        });
      }
    }

    return {
      documents
    };
  } catch (error) {
    return {
      documents: [],
      error: error instanceof Error ? error.message : 'Failed to parse YAML'
    };
  }
}

/**
 * Extract metadata from YAML document (anchors, aliases, tags)
 * Uses the document's internal structure to find anchors and aliases
 */
function extractMetadataFromDocument(
  doc: Document<Node, boolean>,
  content: unknown,
  currentPath: string,
  anchors: Map<string, unknown>,
  aliases: Map<string, string>,
  tags: Map<string, string>
): void {
  // Traverse the document's internal AST structure before conversion
  if (doc && typeof doc === 'object') {
    // The yaml library stores anchors in the AST nodes
    // We need to traverse the contents property which contains the AST
    if (doc.contents) {
      traverseDocumentNode(doc.contents, content, currentPath, anchors, aliases, tags, doc);
    } else {
      // Fallback: traverse the document itself
      traverseDocumentNode(doc, content, currentPath, anchors, aliases, tags, doc);
    }
  }

  // Also extract from the parsed data structure as fallback
  extractMetadataFromData(content, currentPath, anchors, aliases, tags);
}

/**
 * Traverse document node to find anchors and aliases
 * This is a helper to work with yaml library's internal structure
 */
function traverseDocumentNode(
  node: unknown,
  data: unknown,
  currentPath: string,
  anchors: Map<string, unknown>,
  aliases: Map<string, string>,
  tags: Map<string, string>,
  doc: Document<Node, boolean>
): void {
  const astNode = asYamlAstNode(node);
  if (!astNode) {
    return;
  }

  // FIRST: Check for anchor - this must be done before type checking
  if (astNode.anchor) {
    let nodeValue;
    try {
      // toJS() requires the document as argument in yaml v2
      nodeValue = astNode.toJS ? astNode.toJS(doc) : (data !== undefined ? data : node);
      } catch {
      nodeValue = data !== undefined ? data : node;
    }
    anchors.set(astNode.anchor, nodeValue);
  }

  // Check for alias (yaml library v2 uses type 'ALIAS' or source property)
  if ((astNode.type === 'ALIAS' || astNode.source === 'ALIAS') && astNode.anchor) {
    aliases.set(currentPath, astNode.anchor);
  }

  // Check for tag
  if (astNode.tag && astNode.tag !== '?' && astNode.tag !== '!') {
    tags.set(currentPath, astNode.tag);
  }

  // THEN: Traverse based on structure
  if (astNode.items) {
    // Check if it's a MAP (key-value pairs) or sequence (array)
    if (astNode.items.length > 0 && asYamlAstNode(astNode.items[0])?.key !== undefined) {
      // It's a MAP with key-value pairs
      astNode.items.forEach(item => {
        const pair = asYamlAstNode(item);
        const keyNode = asYamlAstNode(pair?.key);
        if (pair?.key && pair.value && keyNode) {
          const key = keyNode.value !== undefined ? keyNode.value : (keyNode.toJS ? keyNode.toJS(doc) : pair.key);
          const keyStr = typeof key === 'string' ? key : String(key);
          const newPath = `${currentPath}.${keyStr}`;

          // Get the value from data if available
          const valueData = getProperty(data, keyStr);

          traverseDocumentNode(pair.value, valueData, newPath, anchors, aliases, tags, doc);
        }
      });
    } else {
      // It's a sequence (array)
      astNode.items.forEach((item, index) => {
        const itemData = Array.isArray(data) ? data[index] : undefined;
        traverseDocumentNode(item, itemData, `${currentPath}[${index}]`, anchors, aliases, tags, doc);
      });
    }
  }
}

/**
 * Alternative anchor extraction from AST
 * Recursively searches the AST for nodes with anchor property
 */
function extractAnchorsFromAST(
  node: unknown,
  data: unknown,
  currentPath: string,
  anchors: Map<string, unknown>,
  doc: Document<Node, boolean>
): void {
  const astNode = asYamlAstNode(node);
  if (!astNode) {
    return;
  }

  // Check if this node has an anchor
  if (astNode.anchor) {
    let value;
    try {
      value = astNode.toJS ? astNode.toJS(doc) : data;
      } catch {
      value = data;
    }
    anchors.set(astNode.anchor, value);
  }

  // Recursively traverse
  if (astNode.items) {
    // Check if it's a MAP (key-value pairs) or sequence
    if (astNode.items.length > 0 && asYamlAstNode(astNode.items[0])?.key !== undefined) {
      // For maps, items are key-value pairs
      astNode.items.forEach(item => {
        const pair = asYamlAstNode(item);
        const keyNode = asYamlAstNode(pair?.key);
        if (pair?.key && pair.value && keyNode) {
          const key = keyNode.value !== undefined ? keyNode.value : (keyNode.toJS ? keyNode.toJS(doc) : pair.key);
          const keyStr = typeof key === 'string' ? key : String(key);
          const valueData = getProperty(data, keyStr);
          extractAnchorsFromAST(pair.value, valueData, `${currentPath}.${keyStr}`, anchors, doc);
        }
      });
    } else {
      // For sequences, items are array elements
      astNode.items.forEach((item, index) => {
        const itemData = Array.isArray(data) ? data[index] : undefined;
        extractAnchorsFromAST(item, itemData, `${currentPath}[${index}]`, anchors, doc);
      });
    }
  }
}

/**
 * Extract anchors, aliases, and tags from parsed YAML data
 * This is a fallback method that works with the parsed JavaScript object
 * Note: This won't capture all anchors/aliases since they're resolved during parsing,
 * but it can help identify some patterns
 */
function extractMetadataFromData(
  data: unknown,
  currentPath: string,
  anchors: Map<string, unknown>,
  aliases: Map<string, string>,
  tags: Map<string, string>
): void {
  if (data === null || data === undefined) {
    return;
  }

  // For parsed YAML, anchors and aliases are already resolved
  // We can't easily extract them from the parsed object
  // This function is mainly for structure traversal

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      extractMetadataFromData(item, `${currentPath}[${index}]`, anchors, aliases, tags);
    });
  } else if (isRecord(data)) {
    Object.keys(data).forEach(key => {
      const value = data[key];
      const newPath = `${currentPath}.${key}`;

      // Check for tag-like patterns in keys (unlikely but possible)
      if (key.includes('!!')) {
        tags.set(newPath, key);
      }

      extractMetadataFromData(value, newPath, anchors, aliases, tags);
    });
  }
}

/**
 * Main function to evaluate YAML path expression
 * @param yamlData - The parsed YAML data
 * @param path - The YAMLPath expression to evaluate
 * @param options - Optional configuration options
 * @param metadata - Optional YAML metadata (anchors, aliases, tags)
 * @returns Evaluation result with matches and paths
 */
export function evaluateYamlPath(
  yamlData: unknown,
  path: string,
  options?: YamlPathOptions,
  metadata?: YamlMetadata
): YamlPathResult {
  if (!path || !path.trim()) {
    return {
      success: false,
      matches: [],
      paths: [],
      count: 0,
      error: 'YAMLPath expression cannot be empty'
    };
  }

  try {
    const normalizedPath = path.trim();

    // Handle root selector
    if (normalizedPath === '$' || normalizedPath === '$.') {
      return {
        success: true,
        matches: [yamlData],
        paths: ['$'],
        count: 1,
        anchors: metadata?.anchors,
        aliases: metadata?.aliases
      };
    }

    // Remove leading $ if present
    const pathExpr = normalizedPath.startsWith('$')
      ? normalizedPath.substring(1)
      : normalizedPath;

    // Special handling for root-level array access (e.g., $[0], $[*])
    if (Array.isArray(yamlData)) {
      if (pathExpr === '' || pathExpr === '.' || pathExpr.startsWith('[')) {
        const results = evaluatePath(yamlData, pathExpr, '$', metadata);
        return {
          success: true,
          matches: results.values,
          paths: results.paths,
          count: results.values.length,
          anchors: metadata?.anchors,
          aliases: metadata?.aliases
        };
      }
    }

    // Start from root
    const results = evaluatePath(yamlData, pathExpr, '$', metadata);

    return {
      success: true,
      matches: results.values,
      paths: results.paths,
      count: results.values.length,
      anchors: metadata?.anchors,
      aliases: metadata?.aliases
    };
  } catch (error) {
    return {
      success: false,
      matches: [],
      paths: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Invalid YAMLPath expression'
    };
  }
}

interface PathEvaluationResult {
  values: unknown[];
  paths: string[];
}

function evaluatePath(
  data: unknown,
  path: string,
  currentPath: string,
  metadata?: YamlMetadata
): PathEvaluationResult {
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
    collectRecursive(data, remainingPath, currentPath, results, metadata);
    return results;
  }

  // Handle YAML-specific: anchor reference ($.*anchor) - check BEFORE removing leading dot
  if (path.startsWith('.*') && /^\.\*[a-zA-Z_$][a-zA-Z0-9_$]*/.test(path)) {
    const anchorMatch = path.match(/^\.\*([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (anchorMatch && metadata?.anchors) {
      const anchorName = anchorMatch[1];
      const remainingPath = path.substring(anchorMatch[0].length);
      return evaluateAnchor(data, anchorName, remainingPath, currentPath, metadata.anchors);
    }
  }

  // Remove leading dot
  const cleanPath = path.startsWith('.') ? path.substring(1) : path;

  // Handle bracket notation
  if (cleanPath.startsWith('[')) {
    return evaluateBracketNotation(data, cleanPath, currentPath, metadata);
  }

  // Handle YAML-specific: tag selector ($..!!str)
  if (cleanPath.startsWith('..!!')) {
    const tagMatch = cleanPath.match(/^\.\.(!![a-zA-Z0-9_-]+)/);
    if (tagMatch) {
      const tagName = tagMatch[1];
      const remainingPath = cleanPath.substring(tagMatch[0].length);
      return evaluateTag(data, tagName, remainingPath, currentPath);
    }
  }

  // Handle dot notation
  const bracketIndex = cleanPath.indexOf('[');
  const dotIndex = cleanPath.indexOf('.');

  let firstPart: string;
  let remainingParts: string;

  if (bracketIndex !== -1 && (dotIndex === -1 || bracketIndex < dotIndex)) {
    const propertyName = cleanPath.substring(0, bracketIndex);
    const bracketAndAfter = cleanPath.substring(bracketIndex);
    firstPart = propertyName;
    remainingParts = bracketAndAfter;
  } else {
    const parts = cleanPath.split('.');
    firstPart = parts[0];
    remainingParts = parts.slice(1).join('.');
  }

  // Handle wildcard
  if (firstPart === '*') {
    return evaluateWildcard(data, remainingParts, currentPath, metadata);
  }

  // Navigate to property
  if (data !== null && typeof data === 'object') {
    if (Array.isArray(data)) {
      if (firstPart && firstPart !== '*') {
        const results: PathEvaluationResult = { values: [], paths: [] };
        data.forEach((item, index) => {
          const itemPath = `${currentPath}[${index}]`;
          const itemResults = evaluatePath(item, cleanPath, itemPath, metadata);
          results.values.push(...itemResults.values);
          results.paths.push(...itemResults.paths);
        });
        return results;
      } else {
        const results: PathEvaluationResult = { values: [], paths: [] };
        data.forEach((item, index) => {
          const itemPath = `${currentPath}[${index}]`;
          if (!remainingParts || remainingParts === '') {
            results.values.push(item);
            results.paths.push(itemPath);
          } else {
            const itemResults = evaluatePath(item, remainingParts, itemPath, metadata);
            results.values.push(...itemResults.values);
            results.paths.push(...itemResults.paths);
          }
        });
        return results;
      }
    } else if (isRecord(data) && firstPart in data) {
      const newPath = `${currentPath}.${firstPart}`;
      return evaluatePath(data[firstPart], remainingParts, newPath, metadata);
    }
  }

  return { values: [], paths: [] };
}

function evaluateBracketNotation(
  data: unknown,
  path: string,
  currentPath: string,
  metadata?: YamlMetadata
): PathEvaluationResult {
  const bracketEnd = path.indexOf(']');
  if (bracketEnd === -1) {
    throw new Error('Unclosed bracket in YAMLPath');
  }

  const bracketContent = path.substring(1, bracketEnd);
  const remainingPath = path.substring(bracketEnd + 1).trim();

  if (Array.isArray(data)) {
    // Array index [n]
    if (/^\d+$/.test(bracketContent)) {
      const index = parseInt(bracketContent, 10);
      if (index >= 0 && index < data.length) {
        const newPath = `${currentPath}[${index}]`;
        if (remainingPath && remainingPath !== '') {
          return evaluatePath(data[index], remainingPath, newPath, metadata);
        } else {
          return {
            values: [data[index]],
            paths: [newPath]
          };
        }
      }
      return { values: [], paths: [] };
    }

    // Array slice [start:end]
    if (bracketContent.includes(':')) {
      const sliceParts = bracketContent.split(':');
      if (sliceParts.length === 2) {
        const start = sliceParts[0] === '' ? 0 : parseInt(sliceParts[0], 10);
        const end = sliceParts[1] === '' ? data.length : parseInt(sliceParts[1], 10);
        const results: PathEvaluationResult = { values: [], paths: [] };

        for (let i = start; i < end && i < data.length; i++) {
          const itemPath = `${currentPath}[${i}]`;
          if (remainingPath && remainingPath !== '') {
            const itemResults = evaluatePath(data[i], remainingPath, itemPath, metadata);
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

    // Wildcard in brackets [*]
    if (bracketContent === '*') {
      const results: PathEvaluationResult = { values: [], paths: [] };
      data.forEach((item, index) => {
        const itemPath = `${currentPath}[${index}]`;
        if (remainingPath && remainingPath !== '') {
          const itemResults = evaluatePath(item, remainingPath, itemPath, metadata);
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

  if (!isRecord(data)) {
    return { values: [], paths: [] };
  }

  // Property access ['property'] or ["property"]
  if (
    (bracketContent.startsWith("'") && bracketContent.endsWith("'")) ||
    (bracketContent.startsWith('"') && bracketContent.endsWith('"'))
  ) {
    const property = bracketContent.slice(1, -1);
    if (property in data) {
      const newPath = `${currentPath}['${property}']`;
      return evaluatePath(data[property], remainingPath, newPath, metadata);
    }
    return { values: [], paths: [] };
  }

  // Wildcard in brackets [*]
  if (bracketContent === '*') {
    if (Array.isArray(data)) {
      const results: PathEvaluationResult = { values: [], paths: [] };
      data.forEach((item, index) => {
        const itemPath = `${currentPath}[${index}]`;
        const itemResults = evaluatePath(item, remainingPath, itemPath, metadata);
        results.values.push(...itemResults.values);
        results.paths.push(...itemResults.paths);
      });
      return results;
    } else if (isRecord(data)) {
      const results: PathEvaluationResult = { values: [], paths: [] };
      Object.keys(data).forEach(key => {
        const itemPath = `${currentPath}['${key}']`;
        const itemResults = evaluatePath(data[key], remainingPath, itemPath, metadata);
        results.values.push(...itemResults.values);
        results.paths.push(...itemResults.paths);
      });
      return results;
    }
    return { values: [], paths: [] };
  }

  // Default: treat as property name
  if (bracketContent in data) {
    const newPath = `${currentPath}['${bracketContent}']`;
    return evaluatePath(data[bracketContent], remainingPath, newPath, metadata);
  }

  return { values: [], paths: [] };
}

function evaluateWildcard(
  data: unknown,
  remainingPath: string,
  currentPath: string,
  metadata?: YamlMetadata
): PathEvaluationResult {
  const results: PathEvaluationResult = { values: [], paths: [] };

  if (data === null || typeof data !== 'object') {
    return results;
  }

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const itemPath = `${currentPath}[${index}]`;
      const itemResults = evaluatePath(item, remainingPath, itemPath, metadata);
      results.values.push(...itemResults.values);
      results.paths.push(...itemResults.paths);
    });
  } else if (isRecord(data)) {
    Object.keys(data).forEach(key => {
      const itemPath = `${currentPath}.${key}`;
      const itemResults = evaluatePath(data[key], remainingPath, itemPath, metadata);
      results.values.push(...itemResults.values);
      results.paths.push(...itemResults.paths);
    });
  }

  return results;
}

function collectRecursive(
  data: unknown,
  path: string,
  currentPath: string,
  results: PathEvaluationResult,
  metadata?: YamlMetadata
): void {
  if (path === '' || path === '.') {
    results.values.push(data);
    results.paths.push(currentPath);
  } else {
    const matchResults = evaluatePath(data, path, currentPath, metadata);
    if (matchResults.values.length > 0) {
      results.values.push(...matchResults.values);
      results.paths.push(...matchResults.paths);
    }
  }

  if (data !== null && typeof data === 'object') {
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        collectRecursive(item, path, `${currentPath}[${index}]`, results, metadata);
      });
    } else if (isRecord(data)) {
      Object.keys(data).forEach(key => {
        collectRecursive(data[key], path, `${currentPath}.${key}`, results, metadata);
      });
    }
  }
}

/**
 * Handle anchor references (YAML-specific)
 */
function evaluateAnchor(
  data: unknown,
  anchorName: string,
  remainingPath: string,
  currentPath: string,
  anchors: Map<string, unknown>
): PathEvaluationResult {
  const anchorValue = anchors.get(anchorName);
  if (anchorValue === undefined) {
    return { values: [], paths: [] };
  }

  const anchorPath = `${currentPath}.*${anchorName}`;
  if (remainingPath && remainingPath !== '') {
    return evaluatePath(anchorValue, remainingPath, anchorPath);
  } else {
    return {
      values: [anchorValue],
      paths: [anchorPath]
    };
  }
}

/**
 * Handle tag selectors (YAML-specific)
 */
function evaluateTag(
  data: unknown,
  tagName: string,
  remainingPath: string,
  currentPath: string
): PathEvaluationResult {
  const results: PathEvaluationResult = { values: [], paths: [] };

  // Recursively find all nodes with the specified tag
  function findTaggedNodes(node: unknown, path: string): void {
    // Check if current node has the tag (this would require metadata)
    // For now, we'll do a basic type check based on tag name
    if (tagName === '!!str' && typeof node === 'string') {
      if (remainingPath && remainingPath !== '') {
        const tagResults = evaluatePath(node, remainingPath, path);
        results.values.push(...tagResults.values);
        results.paths.push(...tagResults.paths);
      } else {
        results.values.push(node);
        results.paths.push(path);
      }
    } else if (tagName === '!!int' && typeof node === 'number' && Number.isInteger(node)) {
      if (remainingPath && remainingPath !== '') {
        const tagResults = evaluatePath(node, remainingPath, path);
        results.values.push(...tagResults.values);
        results.paths.push(...tagResults.paths);
      } else {
        results.values.push(node);
        results.paths.push(path);
      }
    } else if (tagName === '!!bool' && typeof node === 'boolean') {
      if (remainingPath && remainingPath !== '') {
        const tagResults = evaluatePath(node, remainingPath, path);
        results.values.push(...tagResults.values);
        results.paths.push(...tagResults.paths);
      } else {
        results.values.push(node);
        results.paths.push(path);
      }
    }

    // Recurse
    if (node && typeof node === 'object') {
      if (Array.isArray(node)) {
        node.forEach((item, index) => {
          findTaggedNodes(item, `${path}[${index}]`);
        });
      } else if (isRecord(node)) {
        Object.keys(node).forEach(key => {
          findTaggedNodes(node[key], `${path}.${key}`);
        });
      }
    }
  }

  findTaggedNodes(data, currentPath);
  return results;
}

/**
 * Validate YAML path syntax
 * @param path - The YAMLPath expression to validate
 * @returns Validation result with error message if invalid
 */
export function validateYamlPath(path: string): { isValid: boolean; error?: string } {
  if (!path || !path.trim()) {
    return { isValid: false, error: 'YAMLPath cannot be empty' };
  }

  const trimmed = path.trim();

  // Must start with $ (root selector)
  if (!trimmed.startsWith('$')) {
    return { isValid: false, error: 'YAMLPath must start with $ (root selector)' };
  }

  // Check for balanced brackets
  let bracketCount = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];

    // Handle string quotes
    if ((char === '"' || char === "'") && (i === 0 || trimmed[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
      continue;
    }

    if (inString) continue;

    // Count brackets
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;

    if (bracketCount < 0) {
      return { isValid: false, error: 'Unmatched closing bracket' };
    }
  }

  if (bracketCount !== 0) {
    return { isValid: false, error: 'Unmatched opening bracket' };
  }

  // Basic syntax validation - check for invalid patterns
  // Invalid: $..* (recursive descent followed by wildcard without property)
  if (/\.\.\*[^a-zA-Z_$]/.test(trimmed)) {
    return { isValid: false, error: 'Invalid syntax: recursive descent cannot be followed by wildcard without property name' };
  }

  // Try to tokenize to catch syntax errors
  try {
    tokenizeYamlPath(trimmed);
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid YAMLPath syntax'
    };
  }

  return { isValid: true };
}

/**
 * Tokenize YAML path expression
 * @param path - The YAMLPath expression to tokenize
 * @returns Array of tokens
 */
function tokenizeYamlPath(path: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = path.length;

  while (i < len) {
    const char = path[i];
    const start = i;

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Root selector
    if (char === '$') {
      tokens.push({ type: 'ROOT', value: '$', position: start });
      i++;
      continue;
    }

    // Recursive descent (..)
    if (char === '.' && i + 1 < len && path[i + 1] === '.') {
      tokens.push({ type: 'DOUBLE_DOT', value: '..', position: start });
      i += 2;
      continue;
    }

    // Dot
    if (char === '.') {
      tokens.push({ type: 'DOT', value: '.', position: start });
      i++;
      continue;
    }

    // Bracket open
    if (char === '[') {
      tokens.push({ type: 'BRACKET_OPEN', value: '[', position: start });
      i++;
      continue;
    }

    // Bracket close
    if (char === ']') {
      tokens.push({ type: 'BRACKET_CLOSE', value: ']', position: start });
      i++;
      continue;
    }

    // String (quoted)
    if (char === '"' || char === "'") {
      const quoteChar = char;
      let value = char;
      i++;

      while (i < len) {
        if (path[i] === '\\' && i + 1 < len) {
          value += path[i] + path[i + 1];
          i += 2;
        } else if (path[i] === quoteChar) {
          value += quoteChar;
          i++;
          break;
        } else {
          value += path[i];
          i++;
        }
      }

      tokens.push({ type: 'STRING', value, position: start });
      continue;
    }

    // Tag (!!str, !!int, etc.)
    if (char === '!' && i + 1 < len && path[i + 1] === '!') {
      let value = '!!';
      i += 2;

      while (i < len && /[a-zA-Z0-9_-]/.test(path[i])) {
        value += path[i];
        i++;
      }

      tokens.push({ type: 'TAG', value, position: start });
      continue;
    }

    // Number (for array indices)
    if (/\d/.test(char)) {
      let value = '';
      while (i < len && /\d/.test(path[i])) {
        value += path[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value, position: start });
      continue;
    }

    // Wildcard or anchor/alias
    if (char === '*') {
      // Check if it's followed by an identifier (anchor/alias) or standalone (wildcard)
      let value = '*';
      i++;

      // Check for anchor/alias pattern: *identifier
      if (i < len && /[a-zA-Z_$]/.test(path[i])) {
        // Collect identifier
        while (i < len && /[a-zA-Z0-9_$]/.test(path[i])) {
          value += path[i];
          i++;
        }

        // Determine if it's anchor or alias based on context
        // For now, we'll treat it as ANCHOR if it appears after a dot, ALIAS otherwise
        const prevToken = tokens[tokens.length - 1];
        if (prevToken && prevToken.type === 'DOT') {
          tokens.push({ type: 'ANCHOR', value, position: start });
        } else {
          tokens.push({ type: 'ALIAS', value, position: start });
        }
      } else {
        // Standalone wildcard
        tokens.push({ type: 'WILDCARD', value, position: start });
      }
      continue;
    }

    // Identifier (property name)
    if (/[a-zA-Z_$]/.test(char)) {
      let value = '';
      while (i < len && /[a-zA-Z0-9_$]/.test(path[i])) {
        value += path[i];
        i++;
      }
      tokens.push({ type: 'IDENTIFIER', value, position: start });
      continue;
    }

    // Slice separator (:)
    if (char === ':') {
      // This will be handled in bracket parsing
      i++;
      continue;
    }

    // Unknown character
    throw new Error(`Unexpected character '${char}' at position ${start}`);
  }

  return tokens;
}

/**
 * Format YAML path results for display
 * @param result - The evaluation result
 * @param format - Output format ('json' or 'yaml')
 * @returns Formatted string representation
 */
export function formatYamlPathResults(
  result: YamlPathResult,
  format: 'json' | 'yaml' = 'json'
): string {
  if (!result.success) {
    return result.error || 'Query failed';
  }

  if (result.count === 0) {
    return 'No matches found';
  }

  const output: Record<string, unknown> = {
    count: result.count,
    matches: result.matches.map((match, index) => ({
      path: result.paths[index] || `$[${index}]`,
      value: match
    }))
  };

  // Add metadata if available
  if (result.anchors && result.anchors.size > 0) {
    output.anchors = Object.fromEntries(result.anchors);
  }
  if (result.aliases && result.aliases.size > 0) {
    output.aliases = Object.fromEntries(result.aliases);
  }

  if (format === 'yaml') {
    return stringify(output, { indent: 2, lineWidth: 0 });
  }

  return JSON.stringify(output, null, 2);
}

/**
 * Find YAML path for a specific value (reverse lookup)
 * @param data - The YAML data to search
 * @param targetValue - The value to find
 * @param currentPath - Current path in the tree (default: '$')
 * @returns Path to the value or null if not found
 */
export function findYamlPath(
  data: unknown,
  targetValue: unknown,
  currentPath: string = '$'
): string | null {
  // Use strict equality for primitives
  if (data === targetValue) {
    return currentPath;
  }

  if (data !== null && typeof data === 'object') {
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const path = findYamlPath(data[i], targetValue, `${currentPath}[${i}]`);
        if (path) return path;
      }
    } else if (isRecord(data)) {
      for (const key in data) {
        const path = findYamlPath(data[key], targetValue, `${currentPath}.${key}`);
        if (path) return path;
      }
    }
  }

  return null;
}

/**
 * Get all paths in YAML document
 * @param data - The YAML data
 * @param currentPath - Current path in the tree (default: '$')
 * @returns Array of all paths in the document
 */
export function getAllYamlPaths(data: unknown, currentPath: string = '$'): string[] {
  const paths: string[] = [currentPath];

  if (data !== null && typeof data === 'object') {
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        paths.push(...getAllYamlPaths(item, `${currentPath}[${index}]`));
      });
    } else if (isRecord(data)) {
      Object.keys(data).forEach(key => {
        paths.push(...getAllYamlPaths(data[key], `${currentPath}.${key}`));
      });
    }
  }

  return paths;
}

/**
 * Check if path exists in YAML document
 * @param data - The YAML data
 * @param path - The path to check
 * @returns True if path exists, false otherwise
 */
export function yamlPathExists(data: unknown, path: string): boolean {
  try {
    const result = evaluateYamlPath(data, path);
    return result.success && result.count > 0;
  } catch {
    return false;
  }
}

