import type { SchemaConverterOptions, SchemaFormat } from '@/config/schema-converter-config';

export interface SchemaConversionResult {
  success: boolean;
  output: string;
  error?: string;
  format: SchemaFormat;
}

// Intermediate representation for schemas
interface SchemaField {
  name: string;
  type: string;
  nullable: boolean;
  required?: boolean;
  description?: string;
  defaultValue?: unknown;
  enum?: string[];
  items?: SchemaField;
  properties?: Record<string, SchemaField>;
}

interface IntermediateSchema {
  type: 'object' | 'array';
  fields: Record<string, SchemaField>;
  name?: string;
}

interface SchemaNode {
  [key: string]: unknown;
  type?: string | SchemaNode | Array<string | SchemaNode>;
  name?: string;
  title?: string;
  syntax?: string;
  org?: string;
  body?: string;
  columns?: string;
  column?: string;
  bsonType?: string | string[];
  description?: string;
  default?: unknown;
  enum?: string[];
  required?: string[];
  nullable?: boolean;
  mode?: string;
  doc?: string;
  dtype?: string;
  nestedFields?: string;
  containsNull?: boolean;
  number?: number;
  elementType?: string | SchemaNode;
  repeated?: boolean;
  optional?: boolean;
  properties?: Record<string, SchemaNode>;
  items?: SchemaNode | string;
  fields?: SchemaNode[];
  messages?: SchemaNode;
}

function schemaType(value: SchemaNode['type']): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const primaryType = value.find(type => type !== 'null');
    return typeof primaryType === 'string' ? primaryType : 'string';
  }
  return typeof value?.type === 'string' ? value.type : 'string';
}

function schemaName(value: SchemaNode['name']): string {
  return typeof value === 'string' ? value : 'field';
}

function mongoBsonType(value: SchemaNode['bsonType'] | SchemaNode['type']): string | string[] {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const strings = value.filter(item => typeof item === 'string');
    return strings as string[];
  }
  return schemaType(value);
}

/**
 * Convert field name based on naming convention
 */
function convertFieldName(name: string, convention: SchemaConverterOptions['fieldNaming']): string {
  if (convention === 'preserve') return name;

  // Convert to camelCase
  if (convention === 'camelCase') {
    return name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      .replace(/^[A-Z]/, (letter) => letter.toLowerCase());
  }

  // Convert to snake_case
  if (convention === 'snake_case') {
    return name.replace(/([A-Z])/g, '_$1').toLowerCase()
      .replace(/^-/, '');
  }

  // Convert to PascalCase
  if (convention === 'PascalCase') {
    return name.replace(/(^|_)([a-z])/g, (_, __, letter) => letter.toUpperCase())
      .replace(/_/g, '');
  }

  // Convert to kebab-case
  if (convention === 'kebab-case') {
    return name.replace(/([A-Z])/g, '-$1').toLowerCase()
      .replace(/^-/, '');
  }

  return name;
}

/**
 * Convert JSON Schema to intermediate representation
 */
function jsonSchemaToIntermediate(schema: SchemaNode): IntermediateSchema {
  if (schema.type === 'array') {
    return {
      type: 'array',
      fields: {},
      name: schema.title || 'Item'
    };
  }

  const fields: Record<string, SchemaField> = {};
  const required = schema.required || [];

  if (schema.properties) {
    for (const [key, value] of Object.entries(schema.properties as Record<string, SchemaNode>)) {
      const field: SchemaField = {
        name: key,
        type: mapJsonSchemaType(value),
        nullable: !required.includes(key),
        required: required.includes(key),
        description: value.description,
        defaultValue: value.default
      };

      if (value.enum) {
        field.enum = value.enum;
      }

      if (value.type === 'array' && value.items) {
        const itemSchema = typeof value.items === 'string' ? { type: value.items } : value.items;
        field.items = {
          name: 'item',
          type: mapJsonSchemaType(itemSchema),
          nullable: true
        };
      }

      if (value.type === 'object' && value.properties) {
        field.properties = {};
        for (const [propKey, propValue] of Object.entries(value.properties as Record<string, SchemaNode>)) {
          field.properties[propKey] = {
            name: propKey,
            type: mapJsonSchemaType(propValue),
            nullable: !(value.required || []).includes(propKey)
          };
        }
      }

      fields[key] = field;
    }
  }

  return {
    type: 'object',
    fields,
    name: schema.title || 'Root'
  };
}

/**
 * Map JSON Schema type to common type
 */
function mapJsonSchemaType(schema: SchemaNode): string {
  if (schema.type === 'integer') return 'integer';
  if (schema.type === 'number') return 'number';
  if (schema.type === 'string') return 'string';
  if (schema.type === 'boolean') return 'boolean';
  if (schema.type === 'array') return 'array';
  if (schema.type === 'object') return 'object';
  if (schema.type === 'null') return 'null';
  return 'unknown';
}

/**
 * Convert intermediate schema to JSON Schema
 */
function intermediateToJsonSchema(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const fields = Object.values(intermediate.fields);
  const required: string[] = [];
  const properties: Record<string, SchemaNode> = {};

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const jsonType = mapCommonTypeToJsonSchema(field.type);
    const fieldDef: SchemaNode = {
      type: jsonType,
      description: field.description
    };

    if (field.defaultValue !== undefined) {
      fieldDef.default = field.defaultValue;
    }

    if (field.enum) {
      fieldDef.enum = field.enum;
    }

    if (field.type === 'array' && field.items) {
      fieldDef.type = 'array';
      fieldDef.items = {
        type: mapCommonTypeToJsonSchema(field.items.type)
      };
    }

    if (field.type === 'object' && field.properties) {
      fieldDef.type = 'object';
      fieldDef.properties = {};
      const nestedRequired: string[] = [];
      for (const [propKey, propValue] of Object.entries(field.properties)) {
        const propName = convertFieldName(propKey, options.fieldNaming);
        fieldDef.properties[propName] = {
          type: mapCommonTypeToJsonSchema(propValue.type)
        };
        if (!propValue.nullable) {
          nestedRequired.push(propName);
        }
      }
      if (nestedRequired.length > 0) {
        fieldDef.required = nestedRequired;
      }
    }

    properties[name] = fieldDef;
    if (field.required || !field.nullable) {
      required.push(name);
    }
  }

  const jsonSchema: SchemaNode = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties
  };

  if (required.length > 0) {
    jsonSchema.required = required;
  }

  if (intermediate.name && intermediate.name !== 'Root') {
    jsonSchema.title = intermediate.name;
  }

  return JSON.stringify(jsonSchema, null, 2);
}

/**
 * Map common type to JSON Schema type
 */
function mapCommonTypeToJsonSchema(type: string): string {
  if (type === 'integer') return 'integer';
  if (type === 'number') return 'number';
  if (type === 'string') return 'string';
  if (type === 'boolean') return 'boolean';
  if (type === 'array') return 'array';
  if (type === 'object') return 'object';
  if (type === 'null') return 'null';
  return 'string';
}

/**
 * Convert intermediate schema to TypeScript
 */
function intermediateToTypeScript(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const style = options.typescriptStyle;
  const className = intermediate.name || 'Root';
  const fields = Object.values(intermediate.fields);

  if (style === 'interface') {
    let output = `export interface ${className} {\n`;
    for (const field of fields) {
      const name = convertFieldName(field.name, options.fieldNaming);
      const type = mapTypeToTypeScript(field.type, field);
      const optional = field.nullable ? '?' : '';
      const comment = field.description ? ` // ${field.description}` : '';
      output += `  ${name}${optional}: ${type};${comment}\n`;
    }
    output += '}';
    return output;
  }

  if (style === 'type') {
    let output = `export type ${className} = {\n`;
    for (const field of fields) {
      const name = convertFieldName(field.name, options.fieldNaming);
      const type = mapTypeToTypeScript(field.type, field);
      const optional = field.nullable ? '?' : '';
      const comment = field.description ? ` // ${field.description}` : '';
      output += `  ${name}${optional}: ${type};${comment}\n`;
    }
    output += '};';
    return output;
  }

  // class style
  let output = `export class ${className} {\n`;
  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const type = mapTypeToTypeScript(field.type, field);
    const comment = field.description ? ` // ${field.description}` : '';
    output += `  ${name}${field.nullable ? '?' : ''}: ${type};${comment}\n`;
  }
  output += '}';
  return output;
}

/**
 * Map type to TypeScript type
 */
function mapTypeToTypeScript(type: string, field: SchemaField): string {
  if (type === 'integer' || type === 'number') return 'number';
  if (type === 'string') {
    if (field.enum) {
      return field.enum.map(v => `"${v}"`).join(' | ');
    }
    return 'string';
  }
  if (type === 'boolean') return 'boolean';
  if (type === 'array') {
    if (field.items) {
      return `${mapTypeToTypeScript(field.items.type, field.items)}[]`;
    }
    return 'unknown[]';
  }
  if (type === 'object') {
    if (field.properties) {
      const props = Object.values(field.properties)
        .map(f => `${convertFieldName(f.name, 'preserve')}: ${mapTypeToTypeScript(f.type, f)}`)
        .join('; ');
      return `{ ${props} }`;
    }
    return 'Record<string, unknown>';
  }
  return 'unknown';
}

/**
 * Convert intermediate schema to Python
 */
function intermediateToPython(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const style = options.pythonStyle;
  const className = intermediate.name || 'Root';
  const fields = Object.values(intermediate.fields);

  if (style === 'dataclass') {
    let output = 'from dataclasses import dataclass\n';
    const hasOptional = fields.some(f => f.nullable);
    const hasList = fields.some(f => f.type === 'array');
    const hasEnum = fields.some(f => f.enum && f.enum.length > 0);
    if (hasOptional || hasList || hasEnum) {
      output += 'from typing import';
      const imports: string[] = [];
      if (hasOptional) imports.push('Optional');
      if (hasList) imports.push('List');
      if (hasEnum) imports.push('Literal');
      output += ` ${imports.join(', ')}\n`;
    }
    output += '\n';
    output += `@dataclass\n`;
    output += `class ${className}:\n`;
    for (const field of fields) {
      const name = convertFieldName(field.name, options.fieldNaming);
      const type = mapTypeToPython(field.type, field);
      const pythonType = field.nullable ? `Optional[${type}]` : type;
      const defaultValue = field.defaultValue !== undefined
        ? ` = ${formatPythonValue(field.defaultValue)}`
        : field.nullable
          ? ' = None'
          : '';
      const comment = field.description ? `  # ${field.description}` : '';
      output += `    ${name}: ${pythonType}${defaultValue}${comment}\n`;
    }
    return output;
  }

  if (style === 'pydantic') {
    let output = 'from pydantic import BaseModel\n';
    const hasOptional = fields.some(f => f.nullable);
    const hasList = fields.some(f => f.type === 'array');
    const hasEnum = fields.some(f => f.enum && f.enum.length > 0);
    if (hasOptional || hasList || hasEnum) {
      output += 'from typing import';
      const imports: string[] = [];
      if (hasOptional) imports.push('Optional');
      if (hasList) imports.push('List');
      if (hasEnum) imports.push('Literal');
      output += ` ${imports.join(', ')}\n`;
    }
    output += '\n';
    output += `class ${className}(BaseModel):\n`;
    for (const field of fields) {
      const name = convertFieldName(field.name, options.fieldNaming);
      const type = mapTypeToPython(field.type, field);
      const pythonType = field.nullable ? `Optional[${type}]` : type;
      const defaultValue = field.defaultValue !== undefined
        ? ` = ${formatPythonValue(field.defaultValue)}`
        : field.nullable
          ? ' = None'
          : '';
      const comment = field.description ? `  # ${field.description}` : '';
      output += `    ${name}: ${pythonType}${defaultValue}${comment}\n`;
    }
    return output;
  }

  // Standard class
  let output = `class ${className}:\n`;
  output += `    def __init__(self):\n`;
  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const defaultValue = field.defaultValue !== undefined
      ? formatPythonValue(field.defaultValue)
      : field.nullable
        ? 'None'
        : 'None';
    output += `        self.${name} = ${defaultValue}\n`;
  }
  return output;
}

/**
 * Map type to Python type
 */
function mapTypeToPython(type: string, field: SchemaField): string {
  if (type === 'integer') return 'int';
  if (type === 'number') return 'float';
  if (type === 'string') {
    if (field.enum) {
      return `Literal[${field.enum.map(v => `"${v}"`).join(', ')}]`;
    }
    return 'str';
  }
  if (type === 'boolean') return 'bool';
  if (type === 'array') {
    if (field.items) {
      return `List[${mapTypeToPython(field.items.type, field.items)}]`;
    }
    return 'List[unknown]';
  }
  if (type === 'object') {
    return 'dict';
  }
  return 'unknown';
}

/**
 * Format Python value
 */
function formatPythonValue(value: unknown): string {
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (value === null) return 'None';
  return String(value);
}

/**
 * Convert intermediate schema to SQL
 */
function intermediateToSQL(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const tableName = intermediate.name?.toLowerCase() || 'table_name';
  const fields = Object.values(intermediate.fields);
  const dialect = options.sqlDialect;

  let output = `CREATE TABLE ${tableName} (\n`;
  const sqlFields: string[] = [];

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const type = mapTypeToSQL(field.type, field, options);
    const nullable = field.nullable ? '' : ' NOT NULL';
    const defaultValue = field.defaultValue !== undefined
      ? ` DEFAULT ${formatSQLValue(field.defaultValue, dialect)}`
      : '';
    sqlFields.push(`    ${name} ${type}${nullable}${defaultValue}`);
  }

  // Add primary key if id field exists
  const idField = fields.find(f => f.name.toLowerCase() === 'id');
  if (idField) {
    sqlFields[0] = sqlFields[0].replace(' NOT NULL', ' PRIMARY KEY NOT NULL');
  }

  output += sqlFields.join(',\n');
  output += '\n);';
  return output;
}

/**
 * Map type to SQL type
 */
function mapTypeToSQL(type: string, field: SchemaField, options: SchemaConverterOptions): string {
  if (type === 'integer') {
    return options.numberType === 'bigint' ? 'BIGINT' : 'INTEGER';
  }
  if (type === 'number') {
    if (options.numberType === 'decimal') return 'DECIMAL(10, 2)';
    if (options.numberType === 'float') return 'FLOAT';
    if (options.numberType === 'double') return 'DOUBLE';
    return 'NUMERIC';
  }
  if (type === 'string') {
    if (options.stringType === 'varchar') return 'VARCHAR(255)';
    if (options.stringType === 'text') return 'TEXT';
    return 'VARCHAR(255)';
  }
  if (type === 'boolean') {
    if (options.sqlDialect === 'mysql') return 'TINYINT(1)';
    if (options.sqlDialect === 'mssql') return 'BIT';
    return options.booleanType === 'bit' ? 'BIT' : 'BOOLEAN';
  }
  if (type === 'array') {
    if (options.sqlDialect === 'postgresql') return 'JSONB';
    if (options.sqlDialect === 'mysql') return 'JSON';
    return 'TEXT';
  }
  if (type === 'object') {
    if (options.sqlDialect === 'postgresql') return 'JSONB';
    if (options.sqlDialect === 'mysql') return 'JSON';
    return 'TEXT';
  }
  return 'TEXT';
}

/**
 * Format SQL value
 */
function formatSQLValue(value: unknown, dialect: string): string {
  if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') {
    if (dialect === 'mysql') return value ? '1' : '0';
    return value ? 'TRUE' : 'FALSE';
  }
  return 'NULL';
}

/**
 * Convert intermediate schema to Spark Schema
 */
function intermediateToSpark(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const fields = Object.values(intermediate.fields);
  const sparkFields: SchemaNode[] = [];

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const sparkField: SchemaNode = {
      name,
      type: mapTypeToSpark(field.type),
      nullable: field.nullable,
      metadata: {}
    };

    if (field.type === 'array' && field.items) {
      sparkField.type = {
        type: 'array',
        elementType: mapTypeToSpark(field.items.type),
        containsNull: field.items.nullable !== false
      };
    }

    if (field.type === 'object' && field.properties) {
      const nestedFields: SchemaNode[] = [];
      for (const [propKey, propValue] of Object.entries(field.properties)) {
        nestedFields.push({
          name: convertFieldName(propKey, options.fieldNaming),
          type: mapTypeToSpark(propValue.type),
          nullable: propValue.nullable,
          metadata: {}
        });
      }
      sparkField.type = {
        type: 'struct',
        fields: nestedFields
      };
    }

    sparkFields.push(sparkField);
  }

  const sparkSchema = {
    type: 'struct',
    fields: sparkFields
  };

  return JSON.stringify(sparkSchema, null, 2);
}

/**
 * Map type to Spark type
 */
function mapTypeToSpark(type: string): string {
  if (type === 'integer') return 'integer';
  if (type === 'number') return 'double';
  if (type === 'string') return 'string';
  if (type === 'boolean') return 'boolean';
  if (type === 'array') return 'array';
  if (type === 'object') return 'struct';
  return 'string';
}

/**
 * Parse JSON Schema
 */
function parseJsonSchema(schemaString: string): SchemaNode {
  try {
    return JSON.parse(schemaString) as SchemaNode;
  } catch (error) {
    throw new Error(`Invalid JSON Schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse Spark Schema
 */
function parseSparkSchema(schemaString: string): SchemaNode {
  try {
    const schema = JSON.parse(schemaString) as SchemaNode;
    if (schema.type !== 'struct' || !schema.fields) {
      throw new Error('Invalid Spark Schema: must have type "struct" and "fields" array');
    }
    return schema;
  } catch (error) {
    throw new Error(`Invalid Spark Schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert Spark Schema to intermediate representation
 */
function sparkToIntermediate(schema: SchemaNode): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};

  if (schema.fields && Array.isArray(schema.fields)) {
    for (const field of schema.fields) {
      const fieldType = schemaType(field.type);
      const schemaField: SchemaField = {
        name: schemaName(field.name),
        type: mapSparkTypeToCommon(fieldType),
        nullable: field.nullable !== false
      };

      if (field.type && typeof field.type === 'object' && !Array.isArray(field.type)) {
        if (field.type.type === 'array' && field.type.elementType) {
          schemaField.items = {
            name: 'item',
            type: mapSparkTypeToCommon(schemaType(field.type.elementType)),
            nullable: field.type.containsNull !== false
          };
        }
        if (field.type.type === 'struct' && field.type.fields) {
          schemaField.properties = {};
          for (const nestedField of field.type.fields) {
            const nestedType = schemaType(nestedField.type);
            schemaField.properties[schemaName(nestedField.name)] = {
              name: schemaName(nestedField.name),
              type: mapSparkTypeToCommon(nestedType),
              nullable: nestedField.nullable !== false
            };
          }
        }
      }

      fields[schemaName(field.name)] = schemaField;
    }
  }

  return {
    type: 'object',
    fields,
    name: 'Root'
  };
}

/**
 * Map Spark type to common type
 */
function mapSparkTypeToCommon(sparkType: string): string {
  if (sparkType === 'integer' || sparkType === 'int') return 'integer';
  if (sparkType === 'long') return 'integer';
  if (sparkType === 'double' || sparkType === 'float') return 'number';
  if (sparkType === 'string') return 'string';
  if (sparkType === 'boolean') return 'boolean';
  if (sparkType === 'array') return 'array';
  if (sparkType === 'struct') return 'object';
  return 'string';
}

/**
 * Parse MongoDB Schema
 */
function parseMongoSchema(schemaString: string): SchemaNode {
  try {
    const schema = JSON.parse(schemaString) as SchemaNode;
    // MongoDB schema can be either a JSON Schema object or an array
    if (Array.isArray(schema)) {
      throw new Error('MongoDB schema should be a JSON Schema object, not an array');
    }
    if (schema.bsonType && schema.bsonType !== 'object') {
      throw new Error('MongoDB schema root must have bsonType "object"');
    }
    return schema;
  } catch (error) {
    throw new Error(`Invalid MongoDB Schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert MongoDB Schema to intermediate representation
 */
function mongoToIntermediate(schema: SchemaNode): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};
  const required = schema.required || [];

  if (schema.properties) {
    for (const [key, value] of Object.entries(schema.properties as Record<string, SchemaNode>)) {
      const bsonType = mongoBsonType(value.bsonType || value.type);
      const schemaField: SchemaField = {
        name: key,
        type: mapMongoTypeToCommon(bsonType),
        nullable: !required.includes(key),
        required: required.includes(key),
        description: value.description
      };

      if (value.enum) {
        schemaField.enum = value.enum;
      }

      if (bsonType === 'array' && value.items) {
        const itemBsonType = typeof value.items === 'string'
          ? value.items
          : mongoBsonType(value.items.bsonType || value.items.type);
        schemaField.items = {
          name: 'item',
          type: mapMongoTypeToCommon(itemBsonType),
          nullable: true
        };
      }

      if (bsonType === 'object' && value.properties) {
        schemaField.properties = {};
        const nestedRequired = value.required || [];
        for (const [propKey, propValue] of Object.entries(value.properties as Record<string, SchemaNode>)) {
          const propBsonType = mongoBsonType(propValue.bsonType || propValue.type);
          schemaField.properties[propKey] = {
            name: propKey,
            type: mapMongoTypeToCommon(propBsonType),
            nullable: !nestedRequired.includes(propKey)
          };
        }
      }

      fields[key] = schemaField;
    }
  }

  return {
    type: 'object',
    fields,
    name: 'Root'
  };
}

/**
 * Map MongoDB BSON type to common type
 */
function mapMongoTypeToCommon(bsonType: string | string[]): string {
  if (Array.isArray(bsonType)) {
    // Use the first non-null type
    const nonNullType = bsonType.find(t => t !== 'null');
    return mapMongoTypeToCommon(nonNullType || bsonType[0]);
  }
  if (bsonType === 'int' || bsonType === 'long') return 'integer';
  if (bsonType === 'double' || bsonType === 'decimal') return 'number';
  if (bsonType === 'string') return 'string';
  if (bsonType === 'bool') return 'boolean';
  if (bsonType === 'array') return 'array';
  if (bsonType === 'object') return 'object';
  if (bsonType === 'date') return 'string'; // Dates are typically strings in schemas
  if (bsonType === 'null') return 'null';
  return 'string';
}

/**
 * Parse BigQuery Schema
 */
function parseBigQuerySchema(schemaString: string): SchemaNode[] {
  try {
    const schema = JSON.parse(schemaString) as SchemaNode[];
    if (!Array.isArray(schema)) {
      throw new Error('BigQuery schema must be an array of field definitions');
    }
    return schema;
  } catch (error) {
    throw new Error(`Invalid BigQuery Schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert BigQuery Schema to intermediate representation
 */
function bigQueryToIntermediate(schema: SchemaNode[]): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};

  for (const field of schema) {
    const schemaField: SchemaField = {
      name: schemaName(field.name),
      type: mapBigQueryTypeToCommon(schemaType(field.type)),
      nullable: field.mode !== 'REQUIRED',
      required: field.mode === 'REQUIRED',
      description: field.description
    };

    // Handle REPEATED fields (arrays)
    if (field.mode === 'REPEATED') {
      schemaField.type = 'array';
      schemaField.items = {
        name: 'item',
        type: mapBigQueryTypeToCommon(schemaType(field.type)),
        nullable: true
      };
    }

    // Handle RECORD fields (nested objects)
    if (field.type === 'RECORD' && field.fields) {
      schemaField.type = 'object';
      schemaField.properties = {};
      for (const nestedField of field.fields) {
        schemaField.properties[schemaName(nestedField.name)] = {
          name: schemaName(nestedField.name),
          type: mapBigQueryTypeToCommon(schemaType(nestedField.type)),
          nullable: nestedField.mode !== 'REQUIRED'
        };
        if (nestedField.mode === 'REPEATED') {
          schemaField.properties[schemaName(nestedField.name)].type = 'array';
        }
      }
    }

    fields[schemaName(field.name)] = schemaField;
  }

  return {
    type: 'object',
    fields,
    name: 'Root'
  };
}

/**
 * Map BigQuery type to common type
 */
function mapBigQueryTypeToCommon(bigQueryType: string): string {
  if (bigQueryType === 'INTEGER' || bigQueryType === 'INT64') return 'integer';
  if (bigQueryType === 'FLOAT' || bigQueryType === 'FLOAT64') return 'number';
  if (bigQueryType === 'STRING') return 'string';
  if (bigQueryType === 'BOOLEAN' || bigQueryType === 'BOOL') return 'boolean';
  if (bigQueryType === 'RECORD') return 'object';
  if (bigQueryType === 'DATE' || bigQueryType === 'DATETIME' || bigQueryType === 'TIMESTAMP') return 'string';
  if (bigQueryType === 'TIME') return 'string';
  return 'string';
}

/**
 * Convert intermediate schema to MongoDB Schema
 */
function intermediateToMongo(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const fields = Object.values(intermediate.fields);
  const required: string[] = [];
  const properties: Record<string, SchemaNode> = {};

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const bsonType = mapCommonTypeToMongo(field.type);
    const fieldDef: SchemaNode = {
      bsonType: bsonType,
      description: field.description
    };

    if (field.enum) {
      fieldDef.enum = field.enum;
    }

    if (field.type === 'array' && field.items) {
      fieldDef.bsonType = 'array';
      fieldDef.items = {
        bsonType: mapCommonTypeToMongo(field.items.type)
      };
    }

    if (field.type === 'object' && field.properties) {
      fieldDef.bsonType = 'object';
      fieldDef.properties = {};
      const nestedRequired: string[] = [];
      for (const [propKey, propValue] of Object.entries(field.properties)) {
        const propName = convertFieldName(propKey, options.fieldNaming);
        fieldDef.properties[propName] = {
          bsonType: mapCommonTypeToMongo(propValue.type)
        };
        if (!propValue.nullable) {
          nestedRequired.push(propName);
        }
      }
      if (nestedRequired.length > 0) {
        fieldDef.required = nestedRequired;
      }
    }

    properties[name] = fieldDef;
    if (field.required || !field.nullable) {
      required.push(name);
    }
  }

  const mongoSchema: SchemaNode = {
    bsonType: 'object',
    properties
  };

  if (required.length > 0) {
    mongoSchema.required = required;
  }

  return JSON.stringify(mongoSchema, null, 2);
}

/**
 * Map common type to MongoDB BSON type
 */
function mapCommonTypeToMongo(type: string): string {
  if (type === 'integer') return 'int';
  if (type === 'number') return 'double';
  if (type === 'string') return 'string';
  if (type === 'boolean') return 'bool';
  if (type === 'array') return 'array';
  if (type === 'object') return 'object';
  return 'string';
}

/**
 * Convert intermediate schema to BigQuery Schema
 */
function intermediateToBigQuery(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const fields = Object.values(intermediate.fields);
  const bigQueryFields: SchemaNode[] = [];

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const bigQueryType = mapCommonTypeToBigQuery(field.type);
    const fieldDef: SchemaNode = {
      name,
      type: bigQueryType,
      mode: field.required || !field.nullable ? 'REQUIRED' : 'NULLABLE',
      description: field.description
    };

    // Handle arrays
    if (field.type === 'array') {
      fieldDef.mode = 'REPEATED';
      if (field.items) {
        fieldDef.type = mapCommonTypeToBigQuery(field.items.type);
      }
    }

    // Handle nested objects
    if (field.type === 'object' && field.properties) {
      fieldDef.type = 'RECORD';
      fieldDef.fields = [];
      for (const [propKey, propValue] of Object.entries(field.properties)) {
        const propName = convertFieldName(propKey, options.fieldNaming);
        let propType = mapCommonTypeToBigQuery(propValue.type);
        let propMode = propValue.nullable ? 'NULLABLE' : 'REQUIRED';

        // Handle arrays in nested objects
        if (propValue.type === 'array') {
          propMode = 'REPEATED';
          if (propValue.items) {
            propType = mapCommonTypeToBigQuery(propValue.items.type);
          }
        }

        const nestedField: SchemaNode = {
          name: propName,
          type: propType,
          mode: propMode
        };

        // Handle nested RECORD fields
        if (propValue.type === 'object' && propValue.properties) {
          nestedField.type = 'RECORD';
          nestedField.fields = [];
          for (const [nestedPropKey, nestedPropValue] of Object.entries(propValue.properties)) {
            const nestedPropName = convertFieldName(nestedPropKey, options.fieldNaming);
            const nestedPropType = mapCommonTypeToBigQuery(nestedPropValue.type);
            nestedField.fields.push({
              name: nestedPropName,
              type: nestedPropType,
              mode: nestedPropValue.nullable ? 'NULLABLE' : 'REQUIRED'
            });
          }
        }

        fieldDef.fields.push(nestedField);
      }
    }

    bigQueryFields.push(fieldDef);
  }

  return JSON.stringify(bigQueryFields, null, 2);
}

/**
 * Map common type to BigQuery type
 */
function mapCommonTypeToBigQuery(type: string): string {
  if (type === 'integer') return 'INTEGER';
  if (type === 'number') return 'FLOAT';
  if (type === 'string') return 'STRING';
  if (type === 'boolean') return 'BOOLEAN';
  if (type === 'object') return 'RECORD';
  return 'STRING';
}

/**
 * Parse TypeScript interface/type/class
 */
function parseTypeScript(input: string): SchemaNode {
  // Remove comments
  const cleaned = input.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();

  // Extract interface/type/class name and body
  const interfaceMatch = cleaned.match(/(?:export\s+)?interface\s+(\w+)\s*\{([\s\S]*?)\}/);
  const typeMatch = cleaned.match(/(?:export\s+)?type\s+(\w+)\s*=\s*\{([\s\S]*?)\}/);
  const classMatch = cleaned.match(/(?:export\s+)?class\s+(\w+)[\s\S]*?\{([\s\S]*?)\}/);

  const match = interfaceMatch || typeMatch || classMatch;
  if (!match) {
    throw new Error('Could not parse TypeScript definition. Expected interface, type, or class.');
  }

  return {
    name: match[1],
    body: match[2],
    type: interfaceMatch ? 'interface' : typeMatch ? 'type' : 'class'
  };
}

/**
 * Convert TypeScript to intermediate representation
 */
function typescriptToIntermediate(parsed: SchemaNode): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};
  const body = parsed.body ?? '';

  // Parse field definitions: name?: type; or name: type;
  const fieldRegex = /(\w+)(\??)\s*:\s*([^;]+);/g;
  let match;

  while ((match = fieldRegex.exec(body)) !== null) {
    const name = match[1];
    const optional = match[2] === '?';
    const typeStr = match[3].trim();

    const field: SchemaField = {
      name,
      type: mapTypeScriptTypeToCommon(typeStr),
      nullable: optional
    };

    // Handle array types
    if (typeStr.endsWith('[]')) {
      field.type = 'array';
      const itemType = typeStr.slice(0, -2).trim();
      field.items = {
        name: 'item',
        type: mapTypeScriptTypeToCommon(itemType),
        nullable: true
      };
    }

    // Handle union types (enums)
    if (typeStr.includes('|') && typeStr.includes('"')) {
      const enumValues = typeStr.split('|').map(v => v.trim().replace(/"/g, ''));
      field.enum = enumValues;
      field.type = 'string';
    }

    // Handle object types
    if (typeStr.startsWith('{') && typeStr.endsWith('}')) {
      field.type = 'object';
      // Simple nested object parsing
      const nestedBody = typeStr.slice(1, -1);
      field.properties = {};
      const nestedMatch = nestedBody.match(/(\w+)\s*:\s*([^,}]+)/g);
      if (nestedMatch) {
        for (const nestedField of nestedMatch) {
          const nestedParts = nestedField.match(/(\w+)\s*:\s*(.+)/);
          if (nestedParts) {
            field.properties[nestedParts[1]] = {
              name: nestedParts[1],
              type: mapTypeScriptTypeToCommon(nestedParts[2].trim()),
              nullable: true
            };
          }
        }
      }
    }

    fields[name] = field;
  }

  return {
    type: 'object',
    fields,
    name: parsed.name ?? 'Root'
  };
}

/**
 * Map TypeScript type to common type
 */
function mapTypeScriptTypeToCommon(typeStr: string): string {
  const type = typeStr.trim();
  if (type === 'number' || type === 'Number') return 'number';
  if (type === 'string' || type === 'String') return 'string';
  if (type === 'boolean' || type === 'Boolean') return 'boolean';
  if (type === 'any' || type === 'unknown') return 'string';
  if (type.endsWith('[]')) return 'array';
  if (type.startsWith('{')) return 'object';
  if (type.startsWith('Record<')) return 'object';
  return 'string';
}

/**
 * Parse Python class/dataclass/pydantic
 */
function parsePython(input: string): SchemaNode {
  // Remove comments
  const cleaned = input.replace(/#.*/g, '').trim();

  // Extract class name and body
  const classMatch = cleaned.match(/(?:@\w+\s+)?class\s+(\w+)[\s\S]*?:\s*([\s\S]*)/);
  if (!classMatch) {
    throw new Error('Could not parse Python class definition.');
  }

  const className = classMatch[1];
  const body = classMatch[2];

  // Determine if it's a dataclass, pydantic, or regular class
  const isDataclass = cleaned.includes('@dataclass') || cleaned.includes('from dataclasses');
  const isPydantic = cleaned.includes('BaseModel') || cleaned.includes('from pydantic');

  return {
    name: className,
    body,
    type: isDataclass ? 'dataclass' : isPydantic ? 'pydantic' : 'class'
  };
}

/**
 * Convert Python to intermediate representation
 */
function pythonToIntermediate(parsed: SchemaNode): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};
  const body = parsed.body ?? '';

  // Parse field definitions: name: type = default or name: Optional[type] = None
  const fieldRegex = /(\w+)\s*:\s*([^=]+?)(?:\s*=\s*([^\n]+))?/g;
  let match;

  while ((match = fieldRegex.exec(body)) !== null) {
    const name = match[1];
    let typeStr = match[2].trim();
    const defaultValue = match[3]?.trim();

    const field: SchemaField = {
      name,
      type: mapPythonTypeToCommon(typeStr),
      nullable: typeStr.includes('Optional') || defaultValue === 'None'
    };

    // Handle Optional[Type]
    if (typeStr.includes('Optional[')) {
      typeStr = typeStr.replace(/Optional\[([^\]]+)\]/, '$1');
      field.type = mapPythonTypeToCommon(typeStr);
    }

    // Handle List[Type]
    if (typeStr.includes('List[')) {
      field.type = 'array';
      const itemType = typeStr.replace(/List\[([^\]]+)\]/, '$1');
      field.items = {
        name: 'item',
        type: mapPythonTypeToCommon(itemType),
        nullable: true
      };
    }

    // Handle Literal (enums)
    if (typeStr.includes('Literal[')) {
      const enumMatch = typeStr.match(/Literal\[([^\]]+)\]/);
      if (enumMatch) {
        field.enum = enumMatch[1].split(',').map(v => v.trim().replace(/"/g, '').replace(/'/g, ''));
        field.type = 'string';
      }
    }

    if (defaultValue && defaultValue !== 'None') {
      field.defaultValue = parsePythonValue(defaultValue);
    }

    fields[name] = field;
  }

  return {
    type: 'object',
    fields,
    name: parsed.name ?? 'Root'
  };
}

/**
 * Map Python type to common type
 */
function mapPythonTypeToCommon(typeStr: string): string {
  const type = typeStr.trim();
  if (type === 'int' || type === 'Int') return 'integer';
  if (type === 'float' || type === 'Float') return 'number';
  if (type === 'str' || type === 'String') return 'string';
  if (type === 'bool' || type === 'Boolean') return 'boolean';
  if (type.startsWith('List[')) return 'array';
  if (type === 'dict' || type === 'Dict') return 'object';
  return 'string';
}

/**
 * Parse Python value
 */
function parsePythonValue(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === 'True') return true;
  if (trimmed === 'False') return false;
  if (trimmed === 'None') return null;
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }
  const num = Number(trimmed);
  if (!isNaN(num)) return num;
  return trimmed;
}

/**
 * Parse SQL CREATE TABLE statement
 */
function parseSQL(input: string): SchemaNode {
  // Remove comments
  const cleaned = input.replace(/--.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();

  // Extract table name and columns
  const tableMatch = cleaned.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([\s\S]*?)\)/i);
  if (!tableMatch) {
    throw new Error('Could not parse SQL CREATE TABLE statement.');
  }

  const tableName = tableMatch[1];
  const columnsBody = tableMatch[2];

  return {
    name: tableName,
    columns: columnsBody
  };
}

/**
 * Convert SQL to intermediate representation
 */
function sqlToIntermediate(parsed: SchemaNode): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};
  const columns = parsed.columns ?? '';

  // Parse column definitions: name TYPE constraints
  const columnRegex = /(\w+)\s+(\w+(?:\([^)]+\))?)\s*([^,]*)/g;
  let match;

  while ((match = columnRegex.exec(columns)) !== null) {
    const name = match[1];
    const sqlType = match[2].toUpperCase();
    const constraints = match[3].trim();

    const field: SchemaField = {
      name,
      type: mapSQLTypeToCommon(sqlType),
      nullable: !constraints.includes('NOT NULL'),
      required: constraints.includes('NOT NULL') || constraints.includes('PRIMARY KEY')
    };

    // Extract DEFAULT value
    const defaultMatch = constraints.match(/DEFAULT\s+([^\s,]+)/i);
    if (defaultMatch) {
      field.defaultValue = parseSQLValue(defaultMatch[1]);
    }

    fields[name] = field;
  }

  return {
    type: 'object',
    fields,
    name: parsed.name ?? 'Root'
  };
}

/**
 * Map SQL type to common type
 */
function mapSQLTypeToCommon(sqlType: string): string {
  const type = sqlType.toUpperCase();
  if (type.includes('INT')) return 'integer';
  if (type.includes('DECIMAL') || type.includes('NUMERIC') || type.includes('FLOAT') || type.includes('DOUBLE')) return 'number';
  if (type.includes('VARCHAR') || type.includes('CHAR') || type.includes('TEXT') || type.includes('STRING')) return 'string';
  if (type.includes('BOOL') || type.includes('BOOLEAN') || type.includes('BIT')) return 'boolean';
  if (type.includes('JSON')) return 'object';
  return 'string';
}

/**
 * Parse SQL value
 */
function parseSQLValue(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === 'TRUE' || trimmed === '1') return true;
  if (trimmed === 'FALSE' || trimmed === '0') return false;
  if (trimmed === 'NULL') return null;
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }
  const num = Number(trimmed);
  if (!isNaN(num)) return num;
  return trimmed;
}

/**
 * Parse Pandas Schema
 * Format: {"column1": "int64", "column2": "object"} or [{"name": "column1", "type": "int64"}, ...]
 */
function parsePandasSchema(schemaString: string): SchemaNode[] {
  try {
    const schema = JSON.parse(schemaString) as SchemaNode | SchemaNode[];

    // Handle dictionary format: {"column1": "int64", "column2": "object"}
    if (!Array.isArray(schema) && typeof schema === 'object') {
      return Object.entries(schema).map(([name, dtype]) => ({
        name,
        type: typeof dtype === 'string' ? dtype : 'unknown'
      }));
    }

    // Handle array format: [{"name": "column1", "type": "int64"}, ...]
    if (Array.isArray(schema)) {
      return schema.map(field => ({
        name: schemaName(field.name || field.column),
        type: schemaType(field.type || field.dtype)
      }));
    }

    throw new Error('Invalid Pandas schema format');
  } catch (error) {
    throw new Error(`Invalid Pandas Schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert Pandas Schema to intermediate representation
 */
function pandasToIntermediate(schema: SchemaNode[]): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};

  for (const field of schema) {
    const schemaField: SchemaField = {
      name: schemaName(field.name),
      type: mapPandasTypeToCommon(schemaType(field.type)),
      nullable: true // Pandas allows NaN/null by default
    };

    fields[schemaName(field.name)] = schemaField;
  }

  return {
    type: 'object',
    fields,
    name: 'Root'
  };
}

/**
 * Map Pandas dtype to common type
 */
function mapPandasTypeToCommon(dtype: string): string {
  const type = dtype.toLowerCase();
  if (type.includes('int')) return 'integer';
  if (type.includes('float')) return 'number';
  if (type === 'object' || type === 'string' || type.includes('str')) return 'string';
  if (type === 'bool' || type === 'boolean') return 'boolean';
  if (type.includes('datetime')) return 'string';
  if (type.includes('category')) return 'string';
  return 'string';
}

/**
 * Convert intermediate schema to Pandas Schema
 */
function intermediateToPandas(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const fields = Object.values(intermediate.fields);
  const pandasSchema: Record<string, string> = {};

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const pandasType = mapCommonTypeToPandas(field.type);
    pandasSchema[name] = pandasType;
  }

  return JSON.stringify(pandasSchema, null, 2);
}

/**
 * Map common type to Pandas dtype
 */
function mapCommonTypeToPandas(type: string): string {
  if (type === 'integer') return 'int64';
  if (type === 'number') return 'float64';
  if (type === 'string') return 'object';
  if (type === 'boolean') return 'bool';
  if (type === 'array') return 'object';
  if (type === 'object') return 'object';
  return 'object';
}

/**
 * Parse Polars Schema
 * Format: {"column1": "Int64", "column2": "Utf8"} or [{"name": "column1", "type": "Int64"}, ...]
 */
function parsePolarsSchema(schemaString: string): SchemaNode[] {
  try {
    const schema = JSON.parse(schemaString) as SchemaNode | SchemaNode[];

    // Handle dictionary format: {"column1": "Int64", "column2": "Utf8"}
    if (!Array.isArray(schema) && typeof schema === 'object') {
      return Object.entries(schema).map(([name, type]) => ({
        name,
        type: typeof type === 'string' ? type : 'unknown'
      }));
    }

    // Handle array format: [{"name": "column1", "type": "Int64"}, ...]
    if (Array.isArray(schema)) {
      return schema.map(field => ({
        name: schemaName(field.name || field.column),
        type: schemaType(field.type || field.dtype)
      }));
    }

    throw new Error('Invalid Polars schema format');
  } catch (error) {
    throw new Error(`Invalid Polars Schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert Polars Schema to intermediate representation
 */
function polarsToIntermediate(schema: SchemaNode[]): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};

  for (const field of schema) {
    const schemaField: SchemaField = {
      name: schemaName(field.name),
      type: mapPolarsTypeToCommon(schemaType(field.type)),
      nullable: true // Polars allows null by default unless specified
    };

    fields[schemaName(field.name)] = schemaField;
  }

  return {
    type: 'object',
    fields,
    name: 'Root'
  };
}

/**
 * Map Polars type to common type
 */
function mapPolarsTypeToCommon(polarsType: string): string {
  const type = polarsType.toLowerCase();
  if (type.includes('int')) return 'integer';
  if (type.includes('float')) return 'number';
  if (type === 'utf8' || type === 'str' || type === 'string') return 'string';
  if (type === 'bool' || type === 'boolean') return 'boolean';
  if (type.includes('date') || type.includes('datetime')) return 'string';
  if (type.includes('list') || type.includes('array')) return 'array';
  if (type.includes('struct')) return 'object';
  return 'string';
}

/**
 * Convert intermediate schema to Polars Schema
 */
function intermediateToPolars(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const fields = Object.values(intermediate.fields);
  const polarsSchema: Record<string, string> = {};

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const polarsType = mapCommonTypeToPolars(field.type);
    polarsSchema[name] = polarsType;
  }

  return JSON.stringify(polarsSchema, null, 2);
}

/**
 * Map common type to Polars type
 */
function mapCommonTypeToPolars(type: string): string {
  if (type === 'integer') return 'Int64';
  if (type === 'number') return 'Float64';
  if (type === 'string') return 'Utf8';
  if (type === 'boolean') return 'Bool';
  if (type === 'array') return 'List';
  if (type === 'object') return 'Struct';
  return 'Utf8';
}

/**
 * Parse Protocol Buffers schema (.proto)
 */
function parseProtobufSchema(protoString: string): SchemaNode {
  try {
    // Remove comments
    const cleaned = protoString
      .replace(/\/\*[\s\S]*?\*\//g, '') // Block comments
      .replace(/\/\/.*/g, '') // Line comments
      .trim();

    // Extract syntax version (proto2 or proto3)
    const syntaxMatch = cleaned.match(/syntax\s*=\s*["']([^"']+)["']/);
    const syntax = syntaxMatch ? syntaxMatch[1] : 'proto3';

    // Extract message definitions
    const messageRegex = /message\s+(\w+)\s*\{([\s\S]*?)\}/g;
    const messages: SchemaNode[] = [];
    let match;

    while ((match = messageRegex.exec(cleaned)) !== null) {
      const messageName = match[1];
      const messageBody = match[2];
      const fields: SchemaNode[] = [];

      // Parse fields: type name = number [options];
      const fieldRegex = /(repeated\s+)?(optional\s+)?(\w+)\s+(\w+)\s*=\s*(\d+)(\s*\[[^\]]*\])?;/g;
      let fieldMatch;

      while ((fieldMatch = fieldRegex.exec(messageBody)) !== null) {
        fields.push({
          repeated: !!fieldMatch[1],
          optional: !!fieldMatch[2] || syntax === 'proto3',
          type: fieldMatch[3],
          name: fieldMatch[4],
          number: parseInt(fieldMatch[5], 10)
        });
      }

      messages.push({
        name: messageName,
        fields,
        syntax
      });
    }

    if (messages.length === 0) {
      throw new Error('No message definitions found in protobuf schema');
    }

    return {
      syntax,
      messages: messages.length === 1 ? messages[0] : messages[0] // Use first message as root
    };
  } catch (error) {
    throw new Error(`Invalid Protocol Buffers Schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert Protocol Buffers schema to intermediate representation
 */
function protobufToIntermediate(parsed: SchemaNode): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};
  const message = parsed.messages || parsed;

  if (message.fields && Array.isArray(message.fields)) {
    for (const field of message.fields) {
      const schemaField: SchemaField = {
        name: schemaName(field.name),
        type: mapProtobufTypeToCommon(schemaType(field.type)),
        nullable: field.optional || parsed.syntax === 'proto3',
        required: !field.optional && parsed.syntax === 'proto2'
      };

      // Handle repeated fields (arrays)
      if (field.repeated) {
        schemaField.type = 'array';
        schemaField.items = {
          name: 'item',
          type: mapProtobufTypeToCommon(schemaType(field.type)),
          nullable: true
        };
      }

      fields[schemaName(field.name)] = schemaField;
    }
  }

  return {
    type: 'object',
    fields,
    name: message.name || 'Root'
  };
}

/**
 * Map Protocol Buffers type to common type
 */
function mapProtobufTypeToCommon(protoType: string): string {
  const type = protoType.toLowerCase();
  if (type === 'int32' || type === 'int64' || type === 'uint32' || type === 'uint64' || type === 'sint32' || type === 'sint64') {
    return 'integer';
  }
  if (type === 'float' || type === 'double') {
    return 'number';
  }
  if (type === 'string' || type === 'bytes') {
    return 'string';
  }
  if (type === 'bool') {
    return 'boolean';
  }
  // Nested message types are treated as objects
  return 'object';
}

/**
 * Parse Apache Avro schema (JSON format)
 */
function parseAvroSchema(schemaString: string): SchemaNode {
  try {
    const schema = JSON.parse(schemaString) as SchemaNode;

    // Avro schema must have type "record" for object schemas
    if (schema.type === 'record' && schema.fields && Array.isArray(schema.fields)) {
      return schema;
    }

    throw new Error('Invalid Avro schema: must have type "record" and "fields" array');
  } catch (error) {
    throw new Error(`Invalid Apache Avro Schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert Apache Avro schema to intermediate representation
 */
function avroToIntermediate(schema: SchemaNode): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};

  if (schema.fields && Array.isArray(schema.fields)) {
    for (const field of schema.fields) {
      const avroType = field.type;
      const isNullable = Array.isArray(avroType) && avroType.includes('null');
      const actualType = Array.isArray(avroType)
        ? avroType.find(t => t !== 'null') || avroType[0]
        : avroType;

      const schemaField: SchemaField = {
        name: schemaName(field.name),
        type: mapAvroTypeToCommon(schemaType(actualType)),
        nullable: isNullable,
        required: !isNullable,
        description: field.doc,
        defaultValue: field.default !== undefined ? field.default : undefined
      };

      // Handle array types
      if (typeof actualType === 'object' && actualType.type === 'array') {
        schemaField.type = 'array';
        const itemType = actualType.items;
        schemaField.items = {
          name: 'item',
          type: mapAvroTypeToCommon(schemaType(itemType)),
          nullable: true
        };
      }

      // Handle map types
      if (typeof actualType === 'object' && actualType.type === 'map') {
        schemaField.type = 'object';
      }

      // Handle nested records
      if (typeof actualType === 'object' && actualType.type === 'record' && actualType.fields) {
        schemaField.type = 'object';
        schemaField.properties = {};
        for (const nestedField of actualType.fields) {
          const nestedAvroType = nestedField.type;
          const nestedIsNullable = Array.isArray(nestedAvroType) && nestedAvroType.includes('null');
          const nestedActualType = Array.isArray(nestedAvroType)
            ? nestedAvroType.find(t => t !== 'null') || nestedAvroType[0]
            : nestedAvroType;

          schemaField.properties[schemaName(nestedField.name)] = {
            name: schemaName(nestedField.name),
            type: mapAvroTypeToCommon(schemaType(nestedActualType)),
            nullable: nestedIsNullable
          };
        }
      }

      fields[schemaName(field.name)] = schemaField;
    }
  }

  return {
    type: 'object',
    fields,
    name: schema.name || 'Root'
  };
}

/**
 * Map Avro type to common type
 */
function mapAvroTypeToCommon(avroType: string | SchemaNode): string {
  if (typeof avroType === 'string') {
    if (avroType === 'int' || avroType === 'long') return 'integer';
    if (avroType === 'float' || avroType === 'double') return 'number';
    if (avroType === 'string' || avroType === 'bytes') return 'string';
    if (avroType === 'boolean') return 'boolean';
    if (avroType === 'null') return 'null';
    return 'string';
  }

  if (typeof avroType === 'object') {
    if (avroType.type === 'array') return 'array';
    if (avroType.type === 'map') return 'object';
    if (avroType.type === 'record') return 'object';
  }

  return 'string';
}

/**
 * Parse DuckDB Schema (SQL CREATE TABLE)
 */
function parseDuckDBSchema(schemaString: string): SchemaNode {
  try {
    // Remove comments
    const cleaned = schemaString.replace(/--.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();

    // Extract table name and columns
    const tableMatch = cleaned.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([\s\S]*?)\)/i);
    if (!tableMatch) {
      throw new Error('Could not parse DuckDB CREATE TABLE statement.');
    }

    const tableName = tableMatch[1];
    const columnsBody = tableMatch[2];

    return {
      name: tableName,
      columns: columnsBody
    };
  } catch (error) {
    throw new Error(`Invalid DuckDB Schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert DuckDB Schema to intermediate representation
 */
function duckdbToIntermediate(parsed: SchemaNode): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};
  const columns = parsed.columns ?? '';

  // Parse column definitions: name TYPE constraints
  const columnRegex = /(\w+)\s+(\w+(?:\([^)]+\))?(?:\[\])?)\s*([^,]*)/g;
  let match;

  while ((match = columnRegex.exec(columns)) !== null) {
    const name = match[1];
    const duckdbType = match[2].toUpperCase();
    const constraints = match[3].trim();

    const field: SchemaField = {
      name,
      type: mapDuckDBTypeToCommon(duckdbType),
      nullable: !constraints.includes('NOT NULL'),
      required: constraints.includes('NOT NULL') || constraints.includes('PRIMARY KEY')
    };

    // Handle array types (VARCHAR[])
    if (duckdbType.endsWith('[]')) {
      field.type = 'array';
      const baseType = duckdbType.slice(0, -2);
      field.items = {
        name: 'item',
        type: mapDuckDBTypeToCommon(baseType),
        nullable: true
      };
    }

    // Extract DEFAULT value
    const defaultMatch = constraints.match(/DEFAULT\s+([^\s,]+)/i);
    if (defaultMatch) {
      field.defaultValue = parseSQLValue(defaultMatch[1]);
    }

    fields[name] = field;
  }

  return {
    type: 'object',
    fields,
    name: parsed.name ?? 'Root'
  };
}

/**
 * Map DuckDB type to common type
 */
function mapDuckDBTypeToCommon(duckdbType: string): string {
  const type = duckdbType.toUpperCase();
  if (type.includes('INT')) return 'integer';
  if (type.includes('DECIMAL') || type.includes('NUMERIC') || type.includes('FLOAT') || type.includes('DOUBLE')) {
    return 'number';
  }
  if (type.includes('VARCHAR') || type.includes('CHAR') || type.includes('TEXT') || type.includes('STRING')) {
    return 'string';
  }
  if (type.includes('BOOL') || type.includes('BOOLEAN')) return 'boolean';
  if (type.includes('JSON') || type.includes('STRUCT')) return 'object';
  if (type.endsWith('[]')) return 'array';
  return 'string';
}

/**
 * Parse PySpark Schema (Python StructType code)
 */
function parsePySparkSchema(pythonString: string): SchemaNode {
  try {
    // Remove comments
    const cleaned = pythonString.replace(/#.*/g, '').trim();

    // Extract StructType definition
    const structTypeMatch = cleaned.match(/schema\s*=\s*StructType\(\[([\s\S]*?)\]\)/);
    if (!structTypeMatch) {
      throw new Error('Could not find StructType definition in PySpark schema');
    }

    const fieldsBody = structTypeMatch[1];
    const fields: SchemaNode[] = [];

    // Parse StructField definitions: StructField("name", Type(), nullable)
    const fieldRegex = /StructField\s*\(\s*["'](\w+)["']\s*,\s*(\w+Type)\(\)\s*,\s*(True|False)\s*\)/g;
    let match;

    while ((match = fieldRegex.exec(fieldsBody)) !== null) {
      fields.push({
        name: match[1],
        type: match[2],
        nullable: match[3] === 'True'
      });
    }

    // Handle ArrayType: StructField("name", ArrayType(StringType()), True)
    const arrayFieldRegex = /StructField\s*\(\s*["'](\w+)["']\s*,\s*ArrayType\s*\(\s*(\w+Type)\(\)\s*\)\s*,\s*(True|False)\s*\)/g;
    while ((match = arrayFieldRegex.exec(fieldsBody)) !== null) {
      fields.push({
        name: match[1],
        type: 'ArrayType',
        elementType: match[2],
        nullable: match[3] === 'True'
      });
    }

    // Handle nested StructType: StructField("name", StructType([...]), True)
    const nestedStructRegex = /StructField\s*\(\s*["'](\w+)["']\s*,\s*StructType\s*\(\[([\s\S]*?)\]\)\s*,\s*(True|False)\s*\)/g;
    while ((match = nestedStructRegex.exec(fieldsBody)) !== null) {
      fields.push({
        name: match[1],
        type: 'StructType',
        nestedFields: match[2],
        nullable: match[3] === 'True'
      });
    }

    if (fields.length === 0) {
      throw new Error('No StructField definitions found in PySpark schema');
    }

    return { fields };
  } catch (error) {
    throw new Error(`Invalid PySpark Schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert PySpark Schema to intermediate representation
 */
function pysparkToIntermediate(parsed: SchemaNode): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};

  if (parsed.fields && Array.isArray(parsed.fields)) {
    for (const field of parsed.fields) {
      const schemaField: SchemaField = {
        name: schemaName(field.name),
        type: mapPySparkTypeToCommon(schemaType(field.type)),
        nullable: field.nullable !== false
      };

      // Handle ArrayType
      if (field.type === 'ArrayType' && field.elementType) {
        schemaField.type = 'array';
        schemaField.items = {
          name: 'item',
          type: mapPySparkTypeToCommon(schemaType(field.elementType)),
          nullable: true
        };
      }

      // Handle nested StructType
      if (field.type === 'StructType' && field.nestedFields) {
        schemaField.type = 'object';
        schemaField.properties = {};
        // Parse nested fields (simplified - would need recursive parsing for full support)
        const nestedFieldRegex = /StructField\s*\(\s*["'](\w+)["']\s*,\s*(\w+Type)\(\)\s*,\s*(True|False)\s*\)/g;
        let nestedMatch;
        while ((nestedMatch = nestedFieldRegex.exec(field.nestedFields)) !== null) {
          schemaField.properties[nestedMatch[1]] = {
            name: nestedMatch[1],
            type: mapPySparkTypeToCommon(nestedMatch[2]),
            nullable: nestedMatch[3] === 'True'
          };
        }
      }

      fields[schemaName(field.name)] = schemaField;
    }
  }

  return {
    type: 'object',
    fields,
    name: 'Root'
  };
}

/**
 * Map PySpark type to common type
 */
function mapPySparkTypeToCommon(pysparkType: string): string {
  const type = pysparkType.toLowerCase();
  if (type === 'integertype' || type === 'longtype' || type === 'shorttype') return 'integer';
  if (type === 'floattype' || type === 'doubletype' || type === 'decimaltype') return 'number';
  if (type === 'stringtype' || type === 'binarytype') return 'string';
  if (type === 'booleantype') return 'boolean';
  if (type === 'arraytype') return 'array';
  if (type === 'structtype') return 'object';
  return 'string';
}

/**
 * Convert intermediate schema to Protocol Buffers
 */
function intermediateToProtobuf(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const messageName = intermediate.name || 'Root';
  const fields = Object.values(intermediate.fields);
  let output = 'syntax = "proto3";\n\n';

  // Generate nested messages for nested objects
  const nestedMessages: string[] = [];
  const fieldDefinitions: string[] = [];
  let fieldNumber = 1;

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);

    if (field.type === 'array' && field.items) {
      const itemType = mapCommonTypeToProtobuf(field.items.type, field.items);
      fieldDefinitions.push(`  repeated ${itemType} ${name} = ${fieldNumber};`);
      fieldNumber++;
    } else if (field.type === 'object' && field.properties) {
      // Generate nested message
      const nestedMessageName = `${messageName}_${name.charAt(0).toUpperCase() + name.slice(1)}`;
      let nestedMessage = `message ${nestedMessageName} {\n`;
      let nestedFieldNumber = 1;

      for (const [propKey, propValue] of Object.entries(field.properties)) {
        const propName = convertFieldName(propKey, options.fieldNaming);
        const propType = mapCommonTypeToProtobuf(propValue.type, propValue);
        nestedMessage += `  ${propType} ${propName} = ${nestedFieldNumber};\n`;
        nestedFieldNumber++;
      }

      nestedMessage += '}';
      nestedMessages.push(nestedMessage);
      fieldDefinitions.push(`  ${nestedMessageName} ${name} = ${fieldNumber};`);
      fieldNumber++;
    } else {
      const protoType = mapCommonTypeToProtobuf(field.type, field);
      // In proto3, fields are optional by default, but we can use optional keyword for explicit optional
      const optional = field.nullable ? 'optional ' : '';
      fieldDefinitions.push(`  ${optional}${protoType} ${name} = ${fieldNumber};`);
      fieldNumber++;
    }
  }

  // Add nested messages before main message
  if (nestedMessages.length > 0) {
    output += nestedMessages.join('\n\n') + '\n\n';
  }

  output += `message ${messageName} {\n`;
  output += fieldDefinitions.join('\n');
  output += '\n}';
  return output;
}

/**
 * Map common type to Protocol Buffers type
 */
function mapCommonTypeToProtobuf(type: string, field: SchemaField): string {
  if (type === 'integer') return 'int32';
  if (type === 'number') return 'double';
  if (type === 'string') return 'string';
  if (type === 'boolean') return 'bool';
  if (type === 'array') {
    // This shouldn't be called for arrays directly - arrays are handled separately
    if (field.items) {
      return mapCommonTypeToProtobuf(field.items.type, field.items);
    }
    return 'string';
  }
  if (type === 'object') {
    // Nested objects are handled separately in intermediateToProtobuf
    return 'string';
  }
  return 'string';
}

/**
 * Convert intermediate schema to Apache Avro
 */
function intermediateToAvro(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const recordName = intermediate.name || 'Root';
  const fields = Object.values(intermediate.fields);
  const avroFields: SchemaNode[] = [];

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const avroType = mapCommonTypeToAvro(field.type);

    const fieldDef: SchemaNode = {
      name,
      type: field.nullable ? ['null', avroType] : avroType
    };

    if (field.description) {
      fieldDef.doc = field.description;
    }

    if (field.defaultValue !== undefined) {
      fieldDef.default = field.nullable ? null : field.defaultValue;
    } else if (field.nullable) {
      fieldDef.default = null;
    }

    // Handle arrays
    if (field.type === 'array' && field.items) {
      fieldDef.type = field.nullable
        ? ['null', { type: 'array', items: mapCommonTypeToAvro(field.items.type) }]
        : { type: 'array', items: mapCommonTypeToAvro(field.items.type) };
    }

    // Handle nested objects
    if (field.type === 'object' && field.properties) {
      const nestedFields: SchemaNode[] = [];
      for (const [propKey, propValue] of Object.entries(field.properties)) {
        const propName = convertFieldName(propKey, options.fieldNaming);
        const propAvroType = mapCommonTypeToAvro(propValue.type);
        nestedFields.push({
          name: propName,
          type: propValue.nullable ? ['null', propAvroType] : propAvroType
        });
      }
      fieldDef.type = field.nullable
        ? ['null', { type: 'record', name: `${name}Record`, fields: nestedFields }]
        : { type: 'record', name: `${name}Record`, fields: nestedFields };
    }

    avroFields.push(fieldDef);
  }

  const avroSchema = {
    type: 'record',
    name: recordName,
    fields: avroFields
  };

  return JSON.stringify(avroSchema, null, 2);
}

/**
 * Map common type to Avro type
 */
function mapCommonTypeToAvro(type: string): string {
  if (type === 'integer') return 'int';
  if (type === 'number') return 'double';
  if (type === 'string') return 'string';
  if (type === 'boolean') return 'boolean';
  if (type === 'array') return 'array';
  if (type === 'object') return 'record';
  return 'string';
}

/**
 * Convert intermediate schema to DuckDB SQL
 */
function intermediateToDuckDB(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const tableName = (intermediate.name || 'table_name').toLowerCase();
  const fields = Object.values(intermediate.fields);
  const dialect = options.sqlDialect;

  let output = `CREATE TABLE ${tableName} (\n`;
  const sqlFields: string[] = [];

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const type = mapCommonTypeToDuckDB(field.type, field, options);
    const nullable = field.nullable ? '' : ' NOT NULL';
    const defaultValue = field.defaultValue !== undefined
      ? ` DEFAULT ${formatSQLValue(field.defaultValue, dialect)}`
      : '';
    sqlFields.push(`    ${name} ${type}${nullable}${defaultValue}`);
  }

  // Add primary key if id field exists
  const idField = fields.find(f => f.name.toLowerCase() === 'id');
  if (idField) {
    sqlFields[0] = sqlFields[0].replace(' NOT NULL', ' PRIMARY KEY NOT NULL');
  }

  output += sqlFields.join(',\n');
  output += '\n);';
  return output;
}

/**
 * Map common type to DuckDB type
 */
function mapCommonTypeToDuckDB(type: string, field: SchemaField, options: SchemaConverterOptions): string {
  if (type === 'integer') {
    return options.numberType === 'bigint' ? 'BIGINT' : 'INTEGER';
  }
  if (type === 'number') {
    if (options.numberType === 'decimal') return 'DECIMAL(10, 2)';
    if (options.numberType === 'float') return 'FLOAT';
    if (options.numberType === 'double') return 'DOUBLE';
    return 'DOUBLE';
  }
  if (type === 'string') {
    if (options.stringType === 'varchar') return 'VARCHAR(255)';
    if (options.stringType === 'text') return 'TEXT';
    return 'VARCHAR(255)';
  }
  if (type === 'boolean') {
    return 'BOOLEAN';
  }
  if (type === 'array') {
    if (field.items) {
      const itemType = mapCommonTypeToDuckDB(field.items.type, field.items, options);
      return `${itemType}[]`;
    }
    return 'VARCHAR[]';
  }
  if (type === 'object') {
    return 'JSON';
  }
  return 'VARCHAR(255)';
}

/**
 * Convert intermediate schema to PySpark Schema
 */
function intermediateToPySpark(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const fields = Object.values(intermediate.fields);

  // Determine which types are needed
  const neededTypes = new Set<string>(['StructType', 'StructField', 'StringType']);
  for (const field of fields) {
    if (field.type === 'integer') neededTypes.add('IntegerType');
    if (field.type === 'number') neededTypes.add('DoubleType');
    if (field.type === 'boolean') neededTypes.add('BooleanType');
    if (field.type === 'array') neededTypes.add('ArrayType');
    if (field.type === 'object') neededTypes.add('StructType');
  }

  let output = `from pyspark.sql.types import ${Array.from(neededTypes).sort().join(', ')}\n\n`;
  output += 'schema = StructType([\n';

  const structFields: string[] = [];
  const indent = '    ';

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const nullable = field.nullable ? 'True' : 'False';

    if (field.type === 'array' && field.items) {
      const itemType = mapCommonTypeToPySpark(field.items.type);
      structFields.push(`${indent}StructField("${name}", ArrayType(${itemType}()), ${nullable})`);
    } else if (field.type === 'object' && field.properties) {
      // Handle nested StructType
      const nestedFields: string[] = [];
      for (const [propKey, propValue] of Object.entries(field.properties)) {
        const propName = convertFieldName(propKey, options.fieldNaming);
        const propType = mapCommonTypeToPySpark(propValue.type);
        const propNullable = propValue.nullable ? 'True' : 'False';
        nestedFields.push(`${indent}${indent}StructField("${propName}", ${propType}(), ${propNullable})`);
      }
      structFields.push(`${indent}StructField("${name}", StructType([\n${nestedFields.join(',\n')}\n${indent}]), ${nullable})`);
    } else {
      const pysparkType = mapCommonTypeToPySpark(field.type);
      structFields.push(`${indent}StructField("${name}", ${pysparkType}(), ${nullable})`);
    }
  }

  output += structFields.join(',\n');
  output += '\n])';
  return output;
}

/**
 * Map common type to PySpark type
 */
function mapCommonTypeToPySpark(type: string): string {
  if (type === 'integer') return 'IntegerType';
  if (type === 'number') return 'DoubleType';
  if (type === 'string') return 'StringType';
  if (type === 'boolean') return 'BooleanType';
  if (type === 'array') return 'ArrayType';
  if (type === 'object') return 'StructType';
  return 'StringType';
}

/**
 * Main conversion function
 * Simplified: All formats convert to JSON Schema first, then JSON Schema converts to target format
 */
export function convertSchema(
  input: string,
  options: SchemaConverterOptions
): SchemaConversionResult {
  try {
    let intermediate: IntermediateSchema;
    let jsonSchemaIntermediate: IntermediateSchema;

    // Step 1: Convert source format to JSON Schema intermediate representation
    // All formats convert to JSON Schema first (simplified architecture)
    if (options.sourceFormat === 'json-schema') {
      // Already JSON Schema, just parse it
      const schema = parseJsonSchema(input);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(schema);
    } else if (options.sourceFormat === 'spark') {
      // Convert Spark → Intermediate → JSON Schema → Intermediate
      const schema = parseSparkSchema(input);
      intermediate = sparkToIntermediate(schema);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'mongo') {
      // Convert MongoDB → Intermediate → JSON Schema → Intermediate
      const schema = parseMongoSchema(input);
      intermediate = mongoToIntermediate(schema);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'bigquery') {
      // Convert BigQuery → Intermediate → JSON Schema → Intermediate
      const schema = parseBigQuerySchema(input);
      intermediate = bigQueryToIntermediate(schema);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'typescript') {
      // Convert TypeScript → Intermediate → JSON Schema → Intermediate
      const parsed = parseTypeScript(input);
      intermediate = typescriptToIntermediate(parsed);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'python') {
      // Convert Python → Intermediate → JSON Schema → Intermediate
      const parsed = parsePython(input);
      intermediate = pythonToIntermediate(parsed);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'sql') {
      // Convert SQL → Intermediate → JSON Schema → Intermediate
      const parsed = parseSQL(input);
      intermediate = sqlToIntermediate(parsed);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'pandas') {
      // Convert Pandas → Intermediate → JSON Schema → Intermediate
      const schema = parsePandasSchema(input);
      intermediate = pandasToIntermediate(schema);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'polars') {
      // Convert Polars → Intermediate → JSON Schema → Intermediate
      const schema = parsePolarsSchema(input);
      intermediate = polarsToIntermediate(schema);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'protobuf') {
      // Convert Protocol Buffers → Intermediate → JSON Schema → Intermediate
      const parsed = parseProtobufSchema(input);
      intermediate = protobufToIntermediate(parsed);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'avro') {
      // Convert Apache Avro → Intermediate → JSON Schema → Intermediate
      const schema = parseAvroSchema(input);
      intermediate = avroToIntermediate(schema);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'duckdb') {
      // Convert DuckDB → Intermediate → JSON Schema → Intermediate
      const parsed = parseDuckDBSchema(input);
      intermediate = duckdbToIntermediate(parsed);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'pyspark') {
      // Convert PySpark → Intermediate → JSON Schema → Intermediate
      const parsed = parsePySparkSchema(input);
      intermediate = pysparkToIntermediate(parsed);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else {
      return {
        success: false,
        output: '',
        error: `Source format "${options.sourceFormat}" is not yet supported`,
        format: options.targetFormat
      };
    }

    // Step 2: Convert JSON Schema intermediate to target format
    let output: string;
    if (options.targetFormat === 'json-schema') {
      output = intermediateToJsonSchema(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'typescript') {
      output = intermediateToTypeScript(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'python') {
      output = intermediateToPython(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'sql') {
      output = intermediateToSQL(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'spark') {
      output = intermediateToSpark(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'mongo') {
      output = intermediateToMongo(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'bigquery') {
      output = intermediateToBigQuery(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'pandas') {
      output = intermediateToPandas(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'polars') {
      output = intermediateToPolars(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'protobuf') {
      output = intermediateToProtobuf(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'avro') {
      output = intermediateToAvro(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'duckdb') {
      output = intermediateToDuckDB(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'pyspark') {
      output = intermediateToPySpark(jsonSchemaIntermediate, options);
    } else {
      return {
        success: false,
        output: '',
        error: `Target format "${options.targetFormat}" is not yet supported`,
        format: options.targetFormat
      };
    }

    return {
      success: true,
      output,
      format: options.targetFormat
    };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Conversion failed',
      format: options.targetFormat
    };
  }
}

