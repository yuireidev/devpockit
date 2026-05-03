export type TextMinifyMode = 'single_line' | 'per_line';

export interface TextMinifyOptions {
  mode: TextMinifyMode;
  normalizeLineEndings: boolean;
  removeEmptyLines: boolean;
}

export interface TextMinifyResult {
  output: string;
  originalLength: number;
  outputLength: number;
  originalLineCount: number;
  outputLineCount: number;
}

/** Line count treating empty string as zero lines */
function countLines(text: string): number {
  if (text === '') return 0;
  return text.split('\n').length;
}

function normalizeEnds(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function prepareWorkingCopy(input: string, normalizeLineEndings: boolean): string {
  const base = normalizeLineEndings ? normalizeEnds(input) : input;
  return base;
}

function minifySingleLine(working: string): string {
  return working.trim().replace(/\s+/g, ' ');
}

function minifyPerLine(working: string, removeEmptyLines: boolean): string {
  const segments = working.split('\n').map((line) => line.trim().replace(/\s+/g, ' '));
  const kept = removeEmptyLines ? segments.filter((line) => line.length > 0) : segments;
  return kept.join('\n').trim();
}

/**
 * Collapse whitespace in plain text. Does not parse structure (JSON/XML).
 */
export function minifyText(input: string, options: TextMinifyOptions): TextMinifyResult {
  const working = prepareWorkingCopy(input, options.normalizeLineEndings);
  const originalLength = working.length;
  const originalLineCount = countLines(working);

  let output: string;
  if (options.mode === 'single_line') {
    output = minifySingleLine(working);
  } else {
    output = minifyPerLine(working, options.removeEmptyLines);
  }

  const outputLength = output.length;
  const outputLineCount = countLines(output);

  return {
    output,
    originalLength,
    outputLength,
    originalLineCount,
    outputLineCount,
  };
}
