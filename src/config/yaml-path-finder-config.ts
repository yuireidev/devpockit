export interface YamlPathFinderOptions {
  returnPaths: boolean
  returnValues: boolean
  formatOutput: boolean
  handleAnchors: boolean
  handleAliases: boolean
  handleTags: boolean
}

export const DEFAULT_YAML_PATH_OPTIONS: YamlPathFinderOptions = {
  returnPaths: true,
  returnValues: true,
  formatOutput: true,
  handleAnchors: true,
  handleAliases: true,
  handleTags: false, // Optional, less common
}

export const YAML_PATH_EXAMPLES = [
  {
    name: 'Kubernetes ConfigMap',
    yaml: `apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
  namespace: default
data:
  key1: value1
  key2: value2
  database_url: postgresql://localhost:5432/mydb`,
    path: '$.data.key1',
    description: 'Access ConfigMap data property',
  },
  {
    name: 'Docker Compose',
    yaml: `services:
  web:
    image: nginx
    ports:
      - "80:80"
      - "443:443"
    environment:
      - NODE_ENV=production
  db:
    image: postgres
    environment:
      - POSTGRES_PASSWORD=secret`,
    path: '$..image',
    description: 'Find all image names recursively',
  },
  {
    name: 'YAML with Anchors',
    yaml: `defaults: &defaults
  timeout: 30
  retries: 3
  max_connections: 100

service:
  <<: *defaults
  name: api
  port: 8080`,
    path: '$.*defaults',
    description: 'Access anchor definition',
  },
  {
    name: 'GitHub Actions Workflow',
    yaml: `name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test`,
    path: '$.jobs.build.steps[*].name',
    description: 'Get all step names from build job',
  },
  {
    name: 'Kubernetes Deployment',
    yaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.21
          ports:
            - containerPort: 80`,
    path: '$..image',
    description: 'Find all container images recursively',
  },
  {
    name: 'Environment Configuration',
    yaml: `development:
  database:
    host: localhost
    port: 5432
    name: dev_db
  api:
    base_url: http://localhost:3000
    timeout: 5000

production:
  database:
    host: prod.example.com
    port: 5432
    name: prod_db
  api:
    base_url: https://api.example.com
    timeout: 10000`,
    path: '$..database.host',
    description: 'Find all database hosts across environments',
  },
  {
    name: 'Array of Objects',
    yaml: `users:
  - id: 1
    name: Alice
    email: alice@example.com
    role: admin
  - id: 2
    name: Bob
    email: bob@example.com
    role: user
  - id: 3
    name: Charlie
    email: charlie@example.com
    role: user`,
    path: '$.users[*].email',
    description: 'Get all user emails',
  },
  {
    name: 'Nested Configuration',
    yaml: `app:
  name: MyApp
  version: 1.0.0
  settings:
    theme: dark
    language: en
    features:
      analytics: true
      notifications: false
      caching: true`,
    path: '$.app.settings.features.analytics',
    description: 'Access nested feature setting',
  },
  {
    name: 'Multi-Document YAML',
    yaml: `---
name: Document 1
value: first
---
name: Document 2
value: second
---
name: Document 3
value: third`,
    path: '$..name',
    description: 'Find all names across multiple documents',
  },
  {
    name: 'Complex Nested Structure',
    yaml: `company:
  departments:
    engineering:
      teams:
        - name: Frontend
          members: 5
          tech: [React, TypeScript]
        - name: Backend
          members: 8
          tech: [Node.js, Python]
      budget: 500000
    sales:
      teams:
        - name: Enterprise
          members: 3
        - name: SMB
          members: 7
      budget: 300000`,
    path: '$..teams[*].name',
    description: 'Get all team names from all departments',
  },
]

export const YAML_PATH_COMMON_PATTERNS = [
  {
    pattern: '$.property',
    description: 'Access root property',
    example: '$.name',
  },
  {
    pattern: '$.parent.child',
    description: 'Access nested property',
    example: '$.user.profile.name',
  },
  {
    pattern: '$.array[0]',
    description: 'Access array element by index',
    example: '$.items[0]',
  },
  {
    pattern: '$.array[*]',
    description: 'Access all array elements',
    example: '$.users[*]',
  },
  {
    pattern: '$.array[1:4]',
    description: 'Array slice (start:end)',
    example: '$.items[1:4]',
  },
  {
    pattern: '$..property',
    description: 'Recursive descent - find all properties',
    example: '$..name',
  },
  {
    pattern: '$.*',
    description: 'All root properties',
    example: '$.*',
  },
  {
    pattern: '$["property"]',
    description: 'Bracket notation for property',
    example: '$["user-name"]',
  },
  {
    pattern: '$.*anchor',
    description: 'Access anchor definition (YAML-specific)',
    example: '$.*defaults',
  },
  {
    pattern: '$..!!str',
    description: 'Find all string values (YAML-specific)',
    example: '$..!!str',
  },
]

export const YAML_PATH_TIPS = [
  {
    tip: 'Root Selector',
    description: 'Always start with $ to reference the root of the YAML document',
    example: '$.property',
  },
  {
    tip: 'Dot Notation',
    description: 'Use dots to navigate nested objects',
    example: '$.user.profile.name',
  },
  {
    tip: 'Bracket Notation',
    description: 'Use brackets for array indices or property names with special characters',
    example: '$.items[0] or $["property-name"]',
  },
  {
    tip: 'Wildcard',
    description: 'Use * to match all elements at a level',
    example: '$.users[*].name',
  },
  {
    tip: 'Recursive Descent',
    description: 'Use .. to search recursively through all levels',
    example: '$..email (finds all email properties)',
  },
  {
    tip: 'Array Slicing',
    description: 'Use [start:end] to get a range of array elements',
    example: '$.items[1:4] (gets indices 1, 2, 3)',
  },
  {
    tip: 'YAML Anchors',
    description: 'Use $.*anchorName to access anchor definitions',
    example: '$.*defaults',
  },
  {
    tip: 'YAML Tags',
    description: 'Use $..!!tag to find all values with a specific YAML tag',
    example: '$..!!str (finds all strings)',
  },
]

export const YAML_PATH_FINDER_DESCRIPTIONS = {
  title: 'YAML Path Finder',
  description: 'Query and extract data from YAML using YAMLPath expressions',
  features: [
    'Evaluate YAMLPath expressions against YAML data',
    'Find and extract matching values',
    'Display paths to matched elements',
    'Support for common YAMLPath syntax',
    'YAML-specific features: anchors, aliases, tags',
    'Multi-document YAML support',
    'Real-time query validation',
  ],
  useCases: [
    'Extract specific data from Kubernetes manifests',
    'Navigate Docker Compose configurations',
    'Query GitHub Actions workflows',
    'Find all occurrences of a property in YAML',
    'Query nested objects and arrays',
    'Data transformation and filtering',
    'Configuration file analysis',
  ],
}
