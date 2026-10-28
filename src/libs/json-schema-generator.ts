/**
 * JSON Schema Generator
 * Generates JSON Schema (Draft 7) from JSON or YAML data
 */

import { parse } from 'yaml';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

interface GeneratedSchema {
  [key: string]: unknown;
  type?: string;
  description?: string;
  examples?: JsonValue[];
  properties?: Record<string, GeneratedSchema>;
  required?: string[] | boolean;
  items?: GeneratedSchema | { oneOf: GeneratedSchema[] };
  minItems?: number;
  maxItems?: number;
  additionalProperties?: boolean;
}

export interface JsonSchemaOptions {
  strictTypes: boolean; // If true, uses specific types (string, number, etc.), otherwise uses more generic types
  includeExamples: boolean; // Include example values in schema
  includeDescriptions: boolean; // Include descriptions based on property names
  makeRequired: boolean; // Make all properties required
  arrayItemsRequired: boolean; // Make array items required
  minItems?: number; // Minimum items for arrays
  maxItems?: number; // Maximum items for arrays
  additionalProperties: boolean; // Allow additional properties
}

export interface JsonSchemaResult {
  success: boolean;
  schema: GeneratedSchema; // JSON Schema object
  error?: string;
  format: 'json' | 'yaml';
}

export const DEFAULT_SCHEMA_OPTIONS: JsonSchemaOptions = {
  strictTypes: true,
  includeExamples: true,
  includeDescriptions: true,
  makeRequired: false,
  arrayItemsRequired: false,
  additionalProperties: true
};

/**
 * Generate JSON Schema from JSON data
 */
export function generateJsonSchema(
  data: JsonValue,
  options: JsonSchemaOptions = DEFAULT_SCHEMA_OPTIONS
): GeneratedSchema {
  if (data === null) {
    return { type: 'null' };
  }

  if (Array.isArray(data)) {
    return generateArraySchema(data, options);
  }

  if (typeof data === 'object') {
    return generateObjectSchema(data, options);
  }

  // Primitive types
  return generatePrimitiveSchema(data, options);
}

/**
 * Generate schema for primitive types
 */
function generatePrimitiveSchema(value: JsonValue, options: JsonSchemaOptions): GeneratedSchema {
  const schema: GeneratedSchema = {};

  if (options.strictTypes) {
    if (typeof value === 'string') {
      schema.type = 'string';
    } else if (typeof value === 'number') {
      schema.type = Number.isInteger(value) ? 'integer' : 'number';
    } else if (typeof value === 'boolean') {
      schema.type = 'boolean';
    } else if (value === null) {
      schema.type = 'null';
    }
  } else {
    // More generic approach
    if (typeof value === 'string') {
      schema.type = 'string';
    } else if (typeof value === 'number') {
      schema.type = 'number';
    } else if (typeof value === 'boolean') {
      schema.type = 'boolean';
    }
  }

  if (options.includeExamples) {
    schema.examples = [value];
  }

  return schema;
}

/**
 * Generate schema for arrays
 */
function generateArraySchema(array: JsonValue[], options: JsonSchemaOptions): GeneratedSchema {
  const schema: GeneratedSchema = {
    type: 'array'
  };

  if (array.length === 0) {
    // Empty array - use generic item schema
    schema.items = {};
    return schema;
  }

  // Analyze all items to create a comprehensive schema
  const itemSchemas = array.map(item => generateJsonSchema(item, options));

  // If all items have the same structure, use that
  // Otherwise, use oneOf or anyOf
  if (itemSchemas.length > 0) {
    const firstSchema = JSON.stringify(itemSchemas[0]);
    const allSame = itemSchemas.every(s => JSON.stringify(s) === firstSchema);

    if (allSame) {
      schema.items = itemSchemas[0];
      if (options.arrayItemsRequired) {
        schema.items = { ...schema.items, required: true };
      }
    } else {
      // Use oneOf for different types
      const uniqueSchemas = getUniqueSchemas(itemSchemas);
      if (uniqueSchemas.length === 1) {
        schema.items = uniqueSchemas[0];
      } else {
        schema.items = { oneOf: uniqueSchemas };
      }
    }
  }

  if (options.minItems !== undefined) {
    schema.minItems = options.minItems;
  } else if (array.length > 0) {
    schema.minItems = 1;
  }

  if (options.maxItems !== undefined) {
    schema.maxItems = options.maxItems;
  }

  if (options.includeExamples && array.length > 0) {
    schema.examples = [array.slice(0, 3)]; // Include first 3 items as example
  }

  return schema;
}

/**
 * Generate schema for objects
 */
function generateObjectSchema(obj: Record<string, JsonValue>, options: JsonSchemaOptions): GeneratedSchema {
  const schema: GeneratedSchema = {
    type: 'object'
  };

  const properties: Record<string, GeneratedSchema> = {};
  const required: string[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const propertySchema = generateJsonSchema(value, options);

      if (options.includeDescriptions) {
        propertySchema.description = generateDescription(key, value);
      }

      properties[key] = propertySchema;

      if (options.makeRequired) {
        required.push(key);
      }
    }
  }

  schema.properties = properties;

  if (required.length > 0) {
    schema.required = required;
  }

  if (!options.additionalProperties) {
    schema.additionalProperties = false;
  }

  if (options.includeExamples) {
    schema.examples = [obj];
  }

  return schema;
}

/**
 * Get unique schemas from an array
 */
function getUniqueSchemas(schemas: GeneratedSchema[]): GeneratedSchema[] {
  const unique: GeneratedSchema[] = [];
  const seen = new Set<string>();

  for (const schema of schemas) {
    const key = JSON.stringify(schema);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(schema);
    }
  }

  return unique;
}

/**
 * Generate description from property name
 */
function generateDescription(key: string, value: JsonValue): string {
  // Convert camelCase, snake_case, kebab-case to readable text
  const readable = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase());

  const type = Array.isArray(value)
    ? 'array'
    : typeof value === 'object' && value !== null
    ? 'object'
    : typeof value;

  return `${readable} (${type})`;
}

/**
 * Generate JSON Schema from JSON string
 */
export function generateSchemaFromJson(
  jsonString: string,
  options: JsonSchemaOptions = DEFAULT_SCHEMA_OPTIONS
): JsonSchemaResult {
  try {
    const data = JSON.parse(jsonString);
    const schema = generateJsonSchema(data, options);

    // Add schema metadata
    // If root is an array, don't force type: 'object'
    const fullSchema = Array.isArray(data)
      ? {
          $schema: 'http://json-schema.org/draft-07/schema#',
          ...schema,
          title: 'Generated Schema',
          description: 'Auto-generated JSON Schema'
        }
      : {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          ...schema,
          title: 'Generated Schema',
          description: 'Auto-generated JSON Schema'
        };

    return {
      success: true,
      schema: fullSchema,
      format: 'json'
    };
  } catch (error) {
    return {
      success: false,
      schema: {},
      error: error instanceof Error ? error.message : 'Invalid JSON format',
      format: 'json'
    };
  }
}

/**
 * Generate JSON Schema from YAML string
 */
export function generateSchemaFromYaml(
  yamlString: string,
  options: JsonSchemaOptions = DEFAULT_SCHEMA_OPTIONS
): JsonSchemaResult {
  try {
    // Parse YAML to JSON
    const data = parse(yamlString);

    if (data === undefined || data === null) {
      return {
        success: false,
        schema: {},
        error: 'YAML data is empty or null',
        format: 'yaml'
      };
    }

    const schema = generateJsonSchema(data, options);

    // Add schema metadata
    // If root is an array, don't force type: 'object'
    const fullSchema = Array.isArray(data)
      ? {
          $schema: 'http://json-schema.org/draft-07/schema#',
          ...schema,
          title: 'Generated Schema',
          description: 'Auto-generated JSON Schema from YAML'
        }
      : {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          ...schema,
          title: 'Generated Schema',
          description: 'Auto-generated JSON Schema from YAML'
        };

    return {
      success: true,
      schema: fullSchema,
      format: 'yaml'
    };
  } catch (error) {
    return {
      success: false,
      schema: {},
      error: error instanceof Error ? error.message : 'Invalid YAML format',
      format: 'yaml'
    };
  }
}

/**
 * Auto-detect format and generate schema
 */
export function generateSchema(
  content: string,
  options: JsonSchemaOptions = DEFAULT_SCHEMA_OPTIONS
): JsonSchemaResult {
  const trimmed = content.trim();

  // Try JSON first
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return generateSchemaFromJson(content, options);
    } catch {
      // Not valid JSON, continue
    }
  }

  // Try YAML
  try {
    const parsed = parse(trimmed);
    if (parsed !== undefined && parsed !== null) {
      return generateSchemaFromYaml(content, options);
    }
  } catch {
    // Not valid YAML
  }

  return {
    success: false,
    schema: {},
    error: 'Unable to detect format. Please ensure the content is valid JSON or YAML.',
    format: 'json'
  };
}

/**
 * Format schema as JSON string
 */
export function formatSchema(schema: GeneratedSchema, indent: number = 2): string {
  return JSON.stringify(schema, null, indent);
}

