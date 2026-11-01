import type { FormatType } from '@/libs/data-format-converter'

export interface MultiFormatOptions {
  inputFormat: FormatType
  outputFormat: FormatType
  indentSize: number
  pythonQuoteStyle: 'single' | 'double'
}

export const DEFAULT_MULTI_FORMAT_OPTIONS: MultiFormatOptions = {
  inputFormat: 'json',
  outputFormat: 'json',
  indentSize: 2,
  pythonQuoteStyle: 'single',
}

export const FORMAT_OPTIONS: Array<{ value: FormatType; label: string; description: string }> = [
  { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
  { value: 'yaml', label: 'YAML', description: "YAML Ain't Markup Language" },
  { value: 'python', label: 'Python Dictionary', description: 'Python dict syntax' },
  { value: 'typescript', label: 'TypeScript Map', description: 'TypeScript object/Map syntax' },
  { value: 'xml', label: 'XML', description: 'eXtensible Markup Language' },
]

export const INPUT_FORMAT_OPTIONS: Array<{ value: FormatType; label: string; description: string }> = FORMAT_OPTIONS

export const INDENT_OPTIONS = [
  { value: 2, label: '2 spaces', description: 'Standard indentation' },
  { value: 4, label: '4 spaces', description: 'Wide indentation' },
  { value: 1, label: '1 space', description: 'Compact indentation' },
]

export const PYTHON_QUOTE_STYLE_OPTIONS = [
  { value: 'single', label: 'Single Quotes', description: "Use single quotes (')" },
  { value: 'double', label: 'Double Quotes', description: 'Use double quotes (")' },
]

export const MULTI_FORMAT_EXAMPLES = [
  {
    name: 'Simple Object',
    json: `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com"
}`,
    yaml: `name: John Doe
age: 30
email: john@example.com`,
    python: `{
  'name': 'John Doe',
  'age': 30,
  'email': 'john@example.com'
}`,
    typescript: `{
  name: 'John Doe',
  age: 30,
  email: 'john@example.com'
}`,
    xml: `<root>
  <name>John Doe</name>
  <age>30</age>
  <email>john@example.com</email>
</root>`,
    description: 'Basic object with string and number values',
    category: 'Basic',
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
    yaml: `user:
  id: 1
  profile:
    firstName: John
    lastName: Doe
    address:
      street: 123 Main St
      city: New York
      zipCode: '10001'`,
    python: `{
  'user': {
    'id': 1,
    'profile': {
      'firstName': 'John',
      'lastName': 'Doe',
      'address': {
        'street': '123 Main St',
        'city': 'New York',
        'zipCode': '10001'
      }
    }
  }
}`,
    typescript: `{
  user: {
    id: 1,
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      address: {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001'
      }
    }
  }
}`,
    xml: `<root>
  <user>
    <id>1</id>
    <profile>
      <firstName>John</firstName>
      <lastName>Doe</lastName>
      <address>
        <street>123 Main St</street>
        <city>New York</city>
        <zipCode>10001</zipCode>
      </address>
    </profile>
  </user>
</root>`,
    description: 'Object with nested structures',
    category: 'Nested',
  },
  {
    name: 'Array of Objects',
    json: `[
  {
    "id": 1,
    "name": "Product A",
    "price": 29.99,
    "inStock": true
  },
  {
    "id": 2,
    "name": "Product B",
    "price": 39.99,
    "inStock": false
  }
]`,
    yaml: `- id: 1
  name: Product A
  price: 29.99
  inStock: true
- id: 2
  name: Product B
  price: 39.99
  inStock: false`,
    python: `[
  {
    'id': 1,
    'name': 'Product A',
    'price': 29.99,
    'inStock': True
  },
  {
    'id': 2,
    'name': 'Product B',
    'price': 39.99,
    'inStock': False
  }
]`,
    typescript: `[
  {
    id: 1,
    name: 'Product A',
    price: 29.99,
    inStock: true
  },
  {
    id: 2,
    name: 'Product B',
    price: 39.99,
    inStock: false
  }
]`,
    description: 'Array containing multiple objects',
    category: 'Arrays',
  },
  {
    name: 'Configuration File',
    json: `{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp",
    "credentials": {
      "username": "admin",
      "password": "secret"
    }
  },
  "server": {
    "port": 3000,
    "cors": {
      "enabled": true,
      "origins": ["http://localhost:3000", "https://myapp.com"]
    }
  }
}`,
    yaml: `database:
  host: localhost
  port: 5432
  name: myapp
  credentials:
    username: admin
    password: secret
server:
  port: 3000
  cors:
    enabled: true
    origins:
      - http://localhost:3000
      - https://myapp.com`,
    python: `{
  'database': {
    'host': 'localhost',
    'port': 5432,
    'name': 'myapp',
    'credentials': {
      'username': 'admin',
      'password': 'secret'
    }
  },
  'server': {
    'port': 3000,
    'cors': {
      'enabled': True,
      'origins': ['http://localhost:3000', 'https://myapp.com']
    }
  }
}`,
    typescript: `{
  database: {
    host: 'localhost',
    port: 5432,
    name: 'myapp',
    credentials: {
      username: 'admin',
      password: 'secret'
    }
  },
  server: {
    port: 3000,
    cors: {
      enabled: true,
      origins: ['http://localhost:3000', 'https://myapp.com']
    }
  }
}`,
    xml: `<root>
  <database>
    <host>localhost</host>
    <port>5432</port>
    <name>myapp</name>
    <credentials>
      <username>admin</username>
      <password>secret</password>
    </credentials>
  </database>
  <server>
    <port>3000</port>
    <cors>
      <enabled>true</enabled>
      <origins>http://localhost:3000</origins>
      <origins>https://myapp.com</origins>
    </cors>
  </server>
</root>`,
    description: 'Application configuration structure',
    category: 'Configuration',
  },
  {
    name: 'Mixed Types',
    json: `{
  "string": "value",
  "number": 42,
  "boolean": true,
  "null": null,
  "array": [1, 2, 3],
  "object": {
    "nested": "data"
  }
}`,
    yaml: `string: value
number: 42
boolean: true
null: null
array:
  - 1
  - 2
  - 3
object:
  nested: data`,
    python: `{
  'string': 'value',
  'number': 42,
  'boolean': True,
  'null': None,
  'array': [1, 2, 3],
  'object': {
    'nested': 'data'
  }
}`,
    typescript: `{
  string: 'value',
  number: 42,
  boolean: true,
  null: null,
  array: [1, 2, 3],
  object: {
    nested: 'data'
  }
}`,
    xml: `<root>
  <string>value</string>
  <number>42</number>
  <boolean>true</boolean>
  <null></null>
  <array>1</array>
  <array>2</array>
  <array>3</array>
  <object>
    <nested>data</nested>
  </object>
</root>`,
    description: 'Object with various data types',
    category: 'Mixed',
  },
]

export const MULTI_FORMAT_TOOL_DESCRIPTIONS = {
  title: 'Data Format Converter',
  description:
    'Convert between JSON, YAML, Python Dictionary, TypeScript Map, and XML formats. JSON is used as the common intermediate format.',
  features: [
    'Convert between JSON, YAML, Python Dictionary, and TypeScript Map',
    'Auto-detect input format',
    'JSON as common intermediate format',
    'Format validation with error messages',
    'Pretty-printing with customizable indentation',
    'Real-time conversion statistics',
  ],
  useCases: [
    'Converting configuration files between formats',
    'API response format conversion',
    'Data migration between systems',
    'Configuration management',
    'Cross-language data sharing',
  ],
}

export const MULTI_FORMAT_CONVERSION_TIPS = [
  {
    tip: 'JSON as Common Format',
    description: 'All conversions use JSON as an intermediate format for maximum compatibility',
    example: 'Input → JSON → Output',
  },
  {
    tip: 'Python Dictionary',
    description: 'Python dicts use single quotes, True/False/None instead of true/false/null',
    example: "{'key': 'value', 'bool': True, 'null': None}",
  },
  {
    tip: 'TypeScript Map',
    description: 'TypeScript uses object literal syntax with unquoted keys when valid identifiers',
    example: '{ key: "value", number: 42, bool: true }',
  },
  {
    tip: 'YAML Format',
    description: 'YAML uses indentation and colons, more human-readable than JSON',
    example: 'key: value\nnested:\n  inner: data',
  },
]
