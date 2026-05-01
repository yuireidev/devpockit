/**
 * Text minifier tool configuration
 */

import type { TextMinifyMode, TextMinifyOptions } from '@/libs/text-minifier';

export const TEXT_MINIFY_MODE_OPTIONS = [
  { value: 'single_line' as const, label: 'Single line', description: 'Collapse all whitespace into single spaces (one paragraph)' },
  { value: 'per_line' as const, label: 'Per line', description: 'Trim each line and collapse spaces inside lines; keep newlines' },
] as const;

export const DEFAULT_TEXT_MINIFY_OPTIONS: TextMinifyOptions = {
  mode: 'single_line',
  normalizeLineEndings: true,
  removeEmptyLines: false,
};

export const TEXT_MINIFIER_EXAMPLES: Record<
  'multilineParagraph' | 'indentedBlocks' | 'mixedCrlf',
  string
> = {
  multilineParagraph: `The   quick

	brown fox

jumps over  the lazy dog.`,

  indentedBlocks: `
    Line one with trailing spaces   
    Line two

       Line three deeply indented`,

  mixedCrlf: 'Same line\r\nNext line\rMac old style\r\nThird',
};
