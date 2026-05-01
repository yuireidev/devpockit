import { convertHtmlToMarkdown } from '../html-to-markdown';

const defaults = {
  headingStyle: 'atx' as const,
  bulletListMarker: '-' as const,
  codeBlockStyle: 'fenced' as const,
  fence: '```' as const,
  strongDelimiter: '**' as const,
  emDelimiter: '_' as const,
};

describe('html-to-markdown', () => {
  it('converts headings and paragraphs', () => {
    const { markdown, error } = convertHtmlToMarkdown('<h1>Title</h1><p>Hello</p>', defaults);
    expect(error).toBeUndefined();
    expect(markdown).toContain('# Title');
    expect(markdown).toContain('Hello');
  });

  it('converts links', () => {
    const { markdown } = convertHtmlToMarkdown(
      '<p><a href="https://example.com">Example</a></p>',
      defaults
    );
    expect(markdown).toContain('[Example](https://example.com)');
  });

  it('converts unordered lists', () => {
    const { markdown } = convertHtmlToMarkdown('<ul><li>One</li><li>Two</li></ul>', defaults);
    expect(markdown).toContain('One');
    expect(markdown).toContain('Two');
    expect(markdown).toMatch(/^-\s+/m);
  });

  it('converts tables with GFM', () => {
    const html = `<table>
<thead><tr><th>A</th><th>B</th></tr></thead>
<tbody><tr><td>1</td><td>2</td></tr></tbody>
</table>`;
    const { markdown } = convertHtmlToMarkdown(html, defaults);
    expect(markdown).toContain('|');
    expect(markdown.toLowerCase()).toContain('a');
    expect(markdown).toMatch(/1/);
  });

  it('returns error for empty input', () => {
    const { markdown, error } = convertHtmlToMarkdown('   ', defaults);
    expect(markdown).toBe('');
    expect(error).toMatch(/enter HTML/i);
  });

  it('passes through plain text without tags', () => {
    const { markdown, error } = convertHtmlToMarkdown('Just plain text', defaults);
    expect(error).toBeUndefined();
    expect(markdown).toContain('Just plain text');
  });
});
