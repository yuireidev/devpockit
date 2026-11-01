export type SchemaFormat =
  | 'json-schema'
  | 'spark'
  | 'mongo'
  | 'bigquery'
  | 'typescript'
  | 'python'
  | 'sql'
  | 'pandas'
  | 'polars'
  | 'protobuf'
  | 'avro'
  | 'duckdb'
  | 'pyspark'

export interface SchemaConverterOptions {
  sourceFormat: SchemaFormat
  targetFormat: SchemaFormat
  // Type mapping preferences
  stringType: 'varchar' | 'text' | 'string'
  numberType: 'int' | 'bigint' | 'decimal' | 'float' | 'double'
  booleanType: 'bool' | 'boolean' | 'bit'
  // Naming conventions
  fieldNaming: 'camelCase' | 'snake_case' | 'PascalCase' | 'kebab-case' | 'preserve'
  // SQL specific
  sqlDialect: 'postgresql' | 'mysql' | 'sqlite' | 'mssql' | 'oracle'
  // TypeScript specific
  typescriptStyle: 'interface' | 'type' | 'class'
  // Python specific
  pythonStyle: 'dataclass' | 'pydantic' | 'attrs' | 'class'
  // MongoDB specific
  mongoValidation: boolean
  // BigQuery specific
  bigQueryMode: 'standard' | 'legacy'
}

export const DEFAULT_SCHEMA_CONVERTER_OPTIONS: SchemaConverterOptions = {
  sourceFormat: 'json-schema',
  targetFormat: 'typescript',
  stringType: 'varchar',
  numberType: 'int',
  booleanType: 'bool',
  fieldNaming: 'preserve',
  sqlDialect: 'postgresql',
  typescriptStyle: 'interface',
  pythonStyle: 'dataclass',
  mongoValidation: true,
  bigQueryMode: 'standard',
}

export const SCHEMA_FORMAT_OPTIONS = [
  {
    value: 'json-schema',
    label: 'JSON Schema',
    description: 'JSON Schema (Draft 7)',
    language: 'json',
  },
  {
    value: 'spark',
    label: 'Spark Schema (JSON)',
    description: 'Apache Spark DataFrame Schema',
    language: 'json',
  },
  {
    value: 'mongo',
    label: 'MongoDB Schema',
    description: 'MongoDB BSON Schema',
    language: 'json',
  },
  {
    value: 'bigquery',
    label: 'BigQuery Schema',
    description: 'Google BigQuery Schema',
    language: 'json',
  },
  {
    value: 'typescript',
    label: 'TypeScript',
    description: 'TypeScript Interface/Type/Class',
    language: 'typescript',
  },
  {
    value: 'python',
    label: 'Python',
    description: 'Python Class/Dataclass',
    language: 'python',
  },
  {
    value: 'sql',
    label: 'SQL Table',
    description: 'SQL Table Definition',
    language: 'sql',
  },
  {
    value: 'pandas',
    label: 'Pandas Schema',
    description: 'Pandas DataFrame dtypes',
    language: 'json',
  },
  {
    value: 'polars',
    label: 'Polars Schema',
    description: 'Polars DataFrame schema',
    language: 'json',
  },
  {
    value: 'protobuf',
    label: 'Protocol Buffers',
    description: 'Protocol Buffers (.proto)',
    language: 'protobuf',
  },
  {
    value: 'avro',
    label: 'Apache Avro',
    description: 'Apache Avro Schema (JSON)',
    language: 'json',
  },
  {
    value: 'duckdb',
    label: 'DuckDB Schema',
    description: 'DuckDB Table Schema',
    language: 'sql',
  },
  {
    value: 'pyspark',
    label: 'PySpark Schema',
    description: 'PySpark DataFrame Schema (Python)',
    language: 'python',
  },
]

export const STRING_TYPE_OPTIONS = [
  { value: 'varchar', label: 'VARCHAR', description: 'Variable-length string' },
  { value: 'text', label: 'TEXT', description: 'Unlimited length text' },
  { value: 'string', label: 'STRING', description: 'Generic string type' },
]

export const NUMBER_TYPE_OPTIONS = [
  { value: 'int', label: 'INT', description: '32-bit integer' },
  { value: 'bigint', label: 'BIGINT', description: '64-bit integer' },
  { value: 'decimal', label: 'DECIMAL', description: 'Fixed-point decimal' },
  { value: 'float', label: 'FLOAT', description: '32-bit floating point' },
  { value: 'double', label: 'DOUBLE', description: '64-bit floating point' },
]

export const BOOLEAN_TYPE_OPTIONS = [
  { value: 'bool', label: 'BOOL', description: 'Boolean type' },
  { value: 'boolean', label: 'BOOLEAN', description: 'Boolean type (full name)' },
  { value: 'bit', label: 'BIT', description: 'Bit type (0 or 1)' },
]

export const FIELD_NAMING_OPTIONS = [
  { value: 'preserve', label: 'Preserve', description: 'Keep original naming' },
  { value: 'camelCase', label: 'camelCase', description: 'camelCase naming' },
  { value: 'snake_case', label: 'snake_case', description: 'snake_case naming' },
  { value: 'PascalCase', label: 'PascalCase', description: 'PascalCase naming' },
  { value: 'kebab-case', label: 'kebab-case', description: 'kebab-case naming' },
]

export const SQL_DIALECT_OPTIONS = [
  { value: 'postgresql', label: 'PostgreSQL', description: 'PostgreSQL dialect' },
  { value: 'mysql', label: 'MySQL', description: 'MySQL dialect' },
  { value: 'sqlite', label: 'SQLite', description: 'SQLite dialect' },
  { value: 'mssql', label: 'SQL Server', description: 'Microsoft SQL Server' },
  { value: 'oracle', label: 'Oracle', description: 'Oracle Database' },
]

export const TYPESCRIPT_STYLE_OPTIONS = [
  { value: 'interface', label: 'Interface', description: 'TypeScript interface' },
  { value: 'type', label: 'Type', description: 'TypeScript type alias' },
  { value: 'class', label: 'Class', description: 'TypeScript class' },
]

export const PYTHON_STYLE_OPTIONS = [
  { value: 'dataclass', label: 'Dataclass', description: 'Python dataclass' },
  { value: 'pydantic', label: 'Pydantic', description: 'Pydantic model' },
  { value: 'attrs', label: 'Attrs', description: 'Attrs class' },
  { value: 'class', label: 'Class', description: 'Standard Python class' },
]

export const SCHEMA_EXAMPLES = [
  {
    name: 'Simple User Schema',
    format: 'json-schema',
    content: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "age": {
      "type": "integer",
      "minimum": 0
    },
    "active": {
      "type": "boolean"
    }
  },
  "required": ["id", "name", "email"]
}`,
    description: 'Basic user object with common field types',
  },
  {
    name: 'Nested Product Schema',
    format: 'json-schema',
    content: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string"
    },
    "price": {
      "type": "number"
    },
    "category": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer"
        },
        "name": {
          "type": "string"
        }
      }
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": ["id", "name", "price"]
}`,
    description: 'Product with nested category and array of tags',
  },
  {
    name: 'Spark Schema Example',
    format: 'spark',
    content: `{
  "type": "struct",
  "fields": [
    {
      "name": "id",
      "type": "long",
      "nullable": false,
      "metadata": {}
    },
    {
      "name": "name",
      "type": "string",
      "nullable": true,
      "metadata": {}
    },
    {
      "name": "email",
      "type": "string",
      "nullable": true,
      "metadata": {}
    },
    {
      "name": "scores",
      "type": {
        "type": "array",
        "elementType": "double",
        "containsNull": true
      },
      "nullable": true,
      "metadata": {}
    }
  ]
}`,
    description: 'Spark DataFrame schema with array field',
  },
  {
    name: 'TypeScript Interface Example',
    format: 'typescript',
    content: `export interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  active: boolean;
}`,
    description: 'TypeScript interface definition',
  },
  {
    name: 'Python Dataclass Example',
    format: 'python',
    content: `from dataclasses import dataclass
from typing import Optional

@dataclass
class User:
    id: int
    name: str
    email: str
    age: Optional[int] = None
    active: bool = True`,
    description: 'Python dataclass definition',
  },
  {
    name: 'SQL Table Example',
    format: 'sql',
    content: `CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    age INTEGER,
    active BOOLEAN DEFAULT TRUE
);`,
    description: 'SQL table definition',
  },
  {
    name: 'MongoDB Schema Example',
    format: 'mongo',
    content: `{
  "bsonType": "object",
  "required": ["name", "email"],
  "properties": {
    "name": {
      "bsonType": "string",
      "description": "User's full name"
    },
    "email": {
      "bsonType": "string",
      "description": "User's email address"
    },
    "age": {
      "bsonType": "int",
      "minimum": 0,
      "description": "User's age"
    },
    "active": {
      "bsonType": "bool",
      "description": "Whether the user is active"
    },
    "tags": {
      "bsonType": "array",
      "items": {
        "bsonType": "string"
      },
      "description": "Array of tags"
    }
  }
}`,
    description: 'MongoDB BSON schema with validation',
  },
  {
    name: 'BigQuery Schema Example',
    format: 'bigquery',
    content: `[
  {
    "name": "id",
    "type": "INTEGER",
    "mode": "REQUIRED",
    "description": "Unique identifier"
  },
  {
    "name": "name",
    "type": "STRING",
    "mode": "REQUIRED",
    "description": "User's name"
  },
  {
    "name": "email",
    "type": "STRING",
    "mode": "REQUIRED",
    "description": "User's email"
  },
  {
    "name": "age",
    "type": "INTEGER",
    "mode": "NULLABLE",
    "description": "User's age"
  },
  {
    "name": "tags",
    "type": "STRING",
    "mode": "REPEATED",
    "description": "Array of tags"
  },
  {
    "name": "address",
    "type": "RECORD",
    "mode": "NULLABLE",
    "fields": [
      {
        "name": "street",
        "type": "STRING",
        "mode": "REQUIRED"
      },
      {
        "name": "city",
        "type": "STRING",
        "mode": "REQUIRED"
      }
    ]
  }
]`,
    description: 'BigQuery schema with nested and repeated fields',
  },
  {
    name: 'Pandas Schema Example',
    format: 'pandas',
    content: `{
  "id": "int64",
  "name": "object",
  "age": "int64",
  "email": "object",
  "active": "bool"
}`,
    description: 'Pandas DataFrame dtypes dictionary',
  },
  {
    name: 'Polars Schema Example',
    format: 'polars',
    content: `{
  "id": "Int64",
  "name": "Utf8",
  "age": "Int64",
  "email": "Utf8",
  "active": "Bool"
}`,
    description: 'Polars DataFrame schema dictionary',
  },
  {
    name: 'Protocol Buffers Example',
    format: 'protobuf',
    content: `syntax = "proto3";

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
  optional int32 age = 4;
  bool active = 5;
  repeated string tags = 6;
}`,
    description: 'Protocol Buffers message definition with common field types',
  },
  {
    name: 'Apache Avro Example',
    format: 'avro',
    content: `{
  "type": "record",
  "name": "User",
  "fields": [
    {
      "name": "id",
      "type": "int"
    },
    {
      "name": "name",
      "type": "string"
    },
    {
      "name": "email",
      "type": "string"
    },
    {
      "name": "age",
      "type": ["null", "int"],
      "default": null
    },
    {
      "name": "active",
      "type": "boolean",
      "default": true
    },
    {
      "name": "tags",
      "type": {
        "type": "array",
        "items": "string"
      }
    }
  ]
}`,
    description: 'Apache Avro schema with union types for nullable fields',
  },
  {
    name: 'DuckDB Schema Example',
    format: 'duckdb',
    content: `CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    age INTEGER,
    active BOOLEAN DEFAULT TRUE,
    tags VARCHAR[]
);`,
    description: 'DuckDB table schema with array type',
  },
  {
    name: 'PySpark Schema Example',
    format: 'pyspark',
    content: `from pyspark.sql.types import StructType, StructField, StringType, IntegerType, BooleanType, ArrayType

schema = StructType([
    StructField("id", IntegerType(), False),
    StructField("name", StringType(), True),
    StructField("email", StringType(), True),
    StructField("age", IntegerType(), True),
    StructField("active", BooleanType(), True),
    StructField("tags", ArrayType(StringType()), True)
])`,
    description: 'PySpark StructType schema definition',
  },
]

export const SCHEMA_CONVERSION_MATRIX: Record<SchemaFormat, SchemaFormat[]> = {
  'json-schema': ['typescript', 'python', 'sql', 'spark', 'mongo', 'bigquery', 'protobuf', 'avro', 'duckdb', 'pyspark'],
  spark: ['json-schema', 'typescript', 'python', 'sql', 'protobuf', 'avro', 'duckdb', 'pyspark'],
  mongo: ['json-schema', 'typescript', 'python', 'sql', 'protobuf', 'avro', 'duckdb', 'pyspark'],
  bigquery: ['json-schema', 'typescript', 'python', 'sql', 'protobuf', 'avro', 'duckdb', 'pyspark'],
  typescript: ['json-schema', 'python', 'sql', 'spark', 'protobuf', 'avro', 'duckdb', 'pyspark'],
  python: ['json-schema', 'typescript', 'sql', 'spark', 'protobuf', 'avro', 'duckdb', 'pyspark'],
  sql: ['json-schema', 'typescript', 'python', 'spark', 'protobuf', 'avro', 'duckdb', 'pyspark'],
  pandas: ['json-schema', 'typescript', 'python', 'sql', 'protobuf', 'avro', 'duckdb', 'pyspark'],
  polars: ['json-schema', 'typescript', 'python', 'sql', 'protobuf', 'avro', 'duckdb', 'pyspark'],
  protobuf: ['json-schema', 'typescript', 'python', 'sql', 'spark', 'mongo', 'bigquery', 'avro', 'duckdb', 'pyspark'],
  avro: ['json-schema', 'typescript', 'python', 'sql', 'spark', 'mongo', 'bigquery', 'protobuf', 'duckdb', 'pyspark'],
  duckdb: ['json-schema', 'typescript', 'python', 'sql', 'spark', 'mongo', 'bigquery', 'protobuf', 'avro', 'pyspark'],
  pyspark: ['json-schema', 'typescript', 'python', 'sql', 'spark', 'mongo', 'bigquery', 'protobuf', 'avro', 'duckdb'],
}
