/**
 * HTML to Markdown tool configuration
 */

import type { HtmlToMarkdownOptions } from '@/libs/html-to-markdown';

export const HTML_TO_MARKDOWN_OPTIONS = {
  headingStyles: [
    { value: 'atx', label: 'ATX (# headings)' },
    { value: 'setext', label: 'Setext (underlined)' },
  ],
  bulletMarkers: [
    { value: '-', label: 'Dash (-)' },
    { value: '*', label: 'Asterisk (*)' },
    { value: '+', label: 'Plus (+)' },
  ],
  codeBlockStyles: [
    { value: 'fenced', label: 'Fenced (```)' },
    { value: 'indented', label: 'Indented' },
  ],
  fences: [
    { value: '```', label: 'Backticks (```)' },
    { value: '~~~', label: 'Tildes (~~~)' },
  ],
  strongDelimiters: [
    { value: '**', label: '**bold**' },
    { value: '__', label: '__bold__' },
  ],
  emDelimiters: [
    { value: '_', label: '_italic_' },
    { value: '*', label: '*italic*' },
  ],
} as const;

export const DEFAULT_HTML_TO_MARKDOWN_OPTIONS: HtmlToMarkdownOptions = {
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
  strongDelimiter: '**',
  emDelimiter: '_',
};

export const HTML_TO_MARKDOWN_EXAMPLES = {
  article: `<h1>Project notes</h1>
<p>This is a <strong>summary</strong> with a <a href="https://example.com">link</a>.</p>
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>`,
  table: `<table>
  <thead>
    <tr><th>Name</th><th>Role</th></tr>
  </thead>
  <tbody>
    <tr><td>Ada</td><td>Engineer</td></tr>
    <tr><td>Lin</td><td>Designer</td></tr>
  </tbody>
</table>`,
  strike: `<p>Price: <del>99</del> <strong>79</strong></p>`,
};
