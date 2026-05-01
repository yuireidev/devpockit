/**
 * HTML → Markdown using Turndown + GFM (tables, task lists, strikethrough).
 */

import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

export interface HtmlToMarkdownOptions {
  headingStyle: 'atx' | 'setext';
  bulletListMarker: '-' | '*' | '+';
  codeBlockStyle: 'fenced' | 'indented';
  /** Fence string for fenced code blocks (`\`\`\`` or `~~~`). */
  fence: '```' | '~~~';
  strongDelimiter: '**' | '__';
  emDelimiter: '_' | '*';
}

export interface HtmlToMarkdownResult {
  markdown: string;
  error?: string;
}

function buildService(options: HtmlToMarkdownOptions): TurndownService {
  const service = new TurndownService({
    headingStyle: options.headingStyle,
    bulletListMarker: options.bulletListMarker,
    codeBlockStyle: options.codeBlockStyle,
    fence: options.fence,
    strongDelimiter: options.strongDelimiter,
    emDelimiter: options.emDelimiter,
  });
  service.use(gfm);
  return service;
}

export function convertHtmlToMarkdown(
  html: string,
  options: HtmlToMarkdownOptions
): HtmlToMarkdownResult {
  const trimmed = html.trim();
  if (!trimmed) {
    return { markdown: '', error: 'Please enter HTML to convert' };
  }

  try {
    const service = buildService(options);
    const markdown = service.turndown(trimmed).trim();
    return { markdown };
  } catch (e) {
    return {
      markdown: '',
      error: e instanceof Error ? e.message : 'Failed to convert HTML',
    };
  }
}
