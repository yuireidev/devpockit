export interface JsonSchemaGeneratorOptions {
  strictTypes: boolean
  includeExamples: boolean
  includeDescriptions: boolean
  makeRequired: boolean
  arrayItemsRequired: boolean
  additionalProperties: boolean
}

export const DEFAULT_SCHEMA_OPTIONS: JsonSchemaGeneratorOptions = {
  strictTypes: true,
  includeExamples: true,
  includeDescriptions: true,
  makeRequired: false,
  arrayItemsRequired: false,
  additionalProperties: true,
}

export const SCHEMA_GENERATOR_EXAMPLES = [
  {
    name: 'Simple User Object',
    json: `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "active": true
}`,
    description: 'Generate schema for a simple user object',
  },
  {
    name: 'Nested Object',
    json: `{
  "user": {
    "id": 1,
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "zipCode": "10001"
      }
    }
  }
}`,
    description: 'Generate schema for nested objects',
  },
  {
    name: 'Array of Objects',
    json: `{
  "users": [
    {"id": 1, "name": "Alice", "role": "admin"},
    {"id": 2, "name": "Bob", "role": "user"},
    {"id": 3, "name": "Charlie", "role": "user"}
  ]
}`,
    description: 'Generate schema for arrays of objects',
  },
  {
    name: 'API Response',
    json: `{
  "status": "success",
  "data": {
    "users": [
      {"id": 1, "name": "Alice"},
      {"id": 2, "name": "Bob"}
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2
    }
  }
}`,
    description: 'Generate schema for API response structure',
  },
  {
    name: 'YAML Example',
    yaml: `user:
  id: 1
  name: John Doe
  email: john@example.com
  active: true
  tags:
    - developer
    - admin
`,
    description: 'Generate schema from YAML data',
  },
]

export const SCHEMA_GENERATOR_DESCRIPTIONS = {
  title: 'JSON/YAML Schema Generator',
  description: 'Generate JSON Schema (Draft 7) from JSON or YAML data',
  features: [
    'Generate JSON Schema from JSON data',
    'Generate JSON Schema from YAML data',
    'Auto-detect input format',
    'Customizable schema options',
    'Support for nested objects and arrays',
  ],
  useCases: [
    'Create API documentation',
    'Validate data structures',
    'Generate TypeScript types',
    'Document data formats',
    'API contract specification',
  ],
}
