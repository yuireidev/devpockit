/**
 * XML Formatter Configuration
 * Options and settings for XML formatting tool
 */

export const XML_FORMAT_OPTIONS = {
  formats: [
    { value: 'beautify', label: '🎨 Beautify (Pretty Print)' },
    { value: 'minify', label: '📦 Minify (Compact)' },
  ],
  indentSizes: [
    { value: 2, label: '2 spaces' },
    { value: 4, label: '4 spaces' },
    { value: 8, label: '8 spaces' },
  ],
  preserveWhitespace: [
    { value: false, label: 'Normalize whitespace' },
    { value: true, label: 'Preserve whitespace' },
  ],
  selfClosingTags: [
    { value: 'auto', label: 'Auto-detect' },
    { value: 'always', label: 'Always use self-closing' },
    { value: 'never', label: 'Never use self-closing' },
  ],
} as const

export const DEFAULT_XML_OPTIONS = {
  format: 'beautify' as const,
  indentSize: 2,
  preserveWhitespace: false,
  selfClosingTags: 'auto' as const,
}

export const XML_EXAMPLES = {
  valid: `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book id="1">
    <title>The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <price currency="USD">12.99</price>
    <description>
      A classic American novel set in the Jazz Age.
    </description>
  </book>
  <book id="2">
    <title>To Kill a Mockingbird</title>
    <author>Harper Lee</author>
    <price currency="USD">10.99</price>
    <description>
      A gripping tale of racial injustice and childhood innocence.
    </description>
  </book>
</bookstore>`,
  invalid: `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book id="1">
    <title>The Great Gatsby</title>
    <author>F. Scott Fitzgerald
    <price currency="USD">12.99</price>
  </book>
  <book id="2">
    <title>To Kill a Mockingbird</title>
    <author>Harper Lee</author>
</bookstore>`,
  minified: `<?xml version="1.0" encoding="UTF-8"?><bookstore><book id="1"><title>The Great Gatsby</title><author>F. Scott Fitzgerald</author><price currency="USD">12.99</price><description>A classic American novel set in the Jazz Age.</description></book><book id="2"><title>To Kill a Mockingbird</title><author>Harper Lee</author><price currency="USD">10.99</price><description>A gripping tale of racial injustice and childhood innocence.</description></book></bookstore>`,
}
