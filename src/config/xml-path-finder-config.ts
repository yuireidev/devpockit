export interface XmlPathFinderOptions {
  returnPaths: boolean
  returnValues: boolean
  returnXml: boolean
  formatOutput: boolean
}

export const DEFAULT_XML_PATH_OPTIONS: XmlPathFinderOptions = {
  returnPaths: true,
  returnValues: true,
  returnXml: true,
  formatOutput: true,
}

export const XML_PATH_EXAMPLES = [
  {
    name: 'Simple Element',
    xml: `<root>
  <name>John Doe</name>
  <age>30</age>
  <email>john@example.com</email>
</root>`,
    path: '/root/name',
    description: 'Access element by absolute path',
  },
  {
    name: 'Nested Elements',
    xml: `<user>
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
</user>`,
    path: '/user/profile/address/city',
    description: 'Navigate nested elements',
  },
  {
    name: 'Array Access',
    xml: `<users>
  <user>
    <id>1</id>
    <name>Alice</name>
  </user>
  <user>
    <id>2</id>
    <name>Bob</name>
  </user>
  <user>
    <id>3</id>
    <name>Charlie</name>
  </user>
</users>`,
    path: '/users/user[1]/name',
    description: 'Access first element (1-indexed)',
  },
  {
    name: 'Descendant Selector',
    xml: `<catalog>
  <book>
    <title>Book 1</title>
    <author>Author A</author>
  </book>
  <book>
    <title>Book 2</title>
    <author>Author B</author>
  </book>
</catalog>`,
    path: '//title',
    description: 'Find all titles anywhere in document',
  },
  {
    name: 'Attribute Filter',
    xml: `<users>
  <user id="1" active="true">Alice</user>
  <user id="2" active="false">Bob</user>
  <user id="3" active="true">Charlie</user>
</users>`,
    path: '//user[@active="true"]',
    description: 'Find elements with specific attribute value',
  },
  {
    name: 'Text Content',
    xml: `<root>
  <item>Value</item>
  <item>Another Value</item>
</root>`,
    path: '/root/item/text()',
    description: 'Get text content of elements',
  },
  {
    name: 'Attribute Access',
    xml: `<products>
  <product id="101" price="29.99">Product A</product>
  <product id="102" price="39.99">Product B</product>
</products>`,
    path: '//product/@price',
    description: 'Get attribute values',
  },
  {
    name: 'Wildcard',
    xml: `<catalog>
  <book>
    <title>Book 1</title>
    <author>Author A</author>
  </book>
  <magazine>
    <title>Magazine 1</title>
    <editor>Editor A</editor>
  </magazine>
</catalog>`,
    path: '//*/title',
    description: 'Find title in any element type',
  },
  {
    name: 'Position Predicate',
    xml: `<items>
  <item>First</item>
  <item>Second</item>
  <item>Third</item>
  <item>Fourth</item>
</items>`,
    path: '/items/item[last()]',
    description: 'Get last element',
  },
  {
    name: 'Multiple Conditions',
    xml: `<store>
  <product category="electronics" price="99.99">Laptop</product>
  <product category="electronics" price="49.99">Mouse</product>
  <product category="books" price="19.99">Novel</product>
</store>`,
    path: '//product[@category="electronics"][@price>50]',
    description: 'Filter by multiple attributes',
  },
  {
    name: 'Complex Structure',
    xml: `<response>
  <status>success</status>
  <data>
    <users>
      <user id="1" role="admin">Alice</user>
      <user id="2" role="user">Bob</user>
    </users>
    <pagination>
      <page>1</page>
      <limit>10</limit>
      <total>2</total>
    </pagination>
  </data>
</response>`,
    path: '//user[@role]',
    description: 'Find all users with role attribute',
  },
  {
    name: 'Namespaces',
    xml: `<?xml version="1.0"?>
<ns:root xmlns:ns="http://example.com">
  <ns:item>Value</ns:item>
</ns:root>`,
    path: '/ns:root/ns:item',
    description: 'Access namespaced elements',
  },
]

export const XML_PATH_COMMON_PATTERNS = [
  {
    pattern: '/root/child',
    description: 'Absolute path to element',
    example: '/catalog/book',
  },
  {
    pattern: '//element',
    description: 'Descendant selector - find anywhere',
    example: '//title',
  },
  {
    pattern: 'element[@attr]',
    description: 'Element with attribute exists',
    example: 'book[@id]',
  },
  {
    pattern: 'element[@attr="value"]',
    description: 'Element with attribute equals value',
    example: 'user[@active="true"]',
  },
  {
    pattern: 'element[1]',
    description: 'First element (1-indexed)',
    example: 'book[1]',
  },
  {
    pattern: 'element[last()]',
    description: 'Last element',
    example: 'item[last()]',
  },
  {
    pattern: 'element/text()',
    description: 'Text content of element',
    example: 'title/text()',
  },
  {
    pattern: 'element/@attr',
    description: 'Attribute value',
    example: 'product/@price',
  },
  {
    pattern: '//*[@id]',
    description: 'Any element with id attribute',
    example: '//*[@id="123"]',
  },
  {
    pattern: '//element[@attr>value]',
    description: 'Numeric comparison',
    example: '//product[@price>50]',
  },
  {
    pattern: '/root/*',
    description: 'All direct children',
    example: '/catalog/*',
  },
  {
    pattern: '//element[position()>1]',
    description: 'Position-based filtering',
    example: '//item[position()>1]',
  },
]

export const XML_PATH_TIPS = [
  {
    tip: 'Absolute Path',
    description: 'Start with / to reference from document root',
    example: '/root/child',
  },
  {
    tip: 'Descendant Selector',
    description: 'Use // to search recursively through all levels',
    example: '//title (finds all title elements)',
  },
  {
    tip: 'Attribute Access',
    description: 'Use @ to access attributes',
    example: 'element/@attr or element[@attr="value"]',
  },
  {
    tip: 'Text Nodes',
    description: 'Use text() to get text content of elements',
    example: '/root/item/text()',
  },
  {
    tip: 'Position Indexing',
    description: 'XPath uses 1-based indexing (not 0-based)',
    example: 'element[1] (first element)',
  },
  {
    tip: 'Wildcard',
    description: 'Use * to match any element name',
    example: '//*[@id] (any element with id attribute)',
  },
  {
    tip: 'Predicates',
    description: 'Use [] for filtering and position selection',
    example: 'element[@attr="value"] or element[1]',
  },
  {
    tip: 'Last Element',
    description: 'Use last() function to get the last element',
    example: 'items/item[last()]',
  },
]

export const XML_PATH_FINDER_DESCRIPTIONS = {
  title: 'XML Path Finder',
  description: 'Query and extract data from XML using XPath expressions',
  features: [
    'Evaluate XPath expressions against XML data',
    'Find and extract matching elements and attributes',
    'Display XPath paths to matched nodes',
    'Support for common XPath syntax',
    'Real-time query validation',
    'Visual XML tree structure',
  ],
  useCases: [
    'Extract specific data from XML documents',
    'Navigate complex XML structures',
    'Find all occurrences of elements or attributes',
    'Query nested elements with filters',
    'Data transformation and extraction',
    'XML document analysis',
  ],
}
