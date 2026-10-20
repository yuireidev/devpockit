import type {
  CsvMarkdownAlignment,
  CsvMarkdownConverterOptions,
  CsvMarkdownOutputFormat,
} from '@/config/csv-markdown-converter-config';

export type TableInputKind = 'tsv' | 'csv' | 'markdown';

export interface CsvMarkdownResult {
  output: string;
  success: boolean;
  error?: string;
  detectedInput?: TableInputKind;
  stats: { rows: number; cols: number; inputSize: number; outputSize: number };
}

export function detectTableInput(text: string): TableInputKind {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length >= 2) {
    const sepRe = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;
    if (lines.slice(0, 3).some((l, i) => i > 0 && sepRe.test(l))) return 'markdown';
    if (/^\s*\|.*\|\s*$/.test(lines[0]) && sepRe.test(lines[1])) return 'markdown';
  }
  const sample = lines.slice(0, 5).join('\n');
  if (sample.includes('\t')) return 'tsv';
  return 'csv';
}

function normalize(text: string): string {
  return text.replace(/\r\n?/g, '\n');
}

export function parseCSV(text: string): string[][] {
  const src = normalize(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let fieldQuoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') { inQuotes = true; fieldQuoted = true; }
      else if (c === ',') { row.push(fieldQuoted ? field : field); field = ''; fieldQuoted = false; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; fieldQuoted = false; }
      else field += c;
    }
  }
  row.push(field);
  rows.push(row);
  return rows;
}

export function parseTSV(text: string): string[][] {
  return normalize(text).split('\n').map(line => line.split('\t'));
}

function splitMdRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const cells: string[] = [];
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\' && s[i + 1] === '|') { cur += '|'; i++; }
    else if (c === '|') { cells.push(cur); cur = ''; }
    else cur += c;
  }
  cells.push(cur);
  return cells.map(c => c.trim().replace(/\\\|/g, '|'));
}

const MD_SEP_RE = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;

export function parseMarkdownTable(text: string): string[][] {
  const lines = normalize(text).split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) throw new Error('Not a Markdown table: expected a header row and a separator row (e.g. | --- |).');
  const sepIdx = lines.findIndex(l => MD_SEP_RE.test(l));
  if (sepIdx < 0) throw new Error('Not a Markdown table: missing separator row (e.g. | --- | --- |).');
  const dataLines = [...lines.slice(0, sepIdx), ...lines.slice(sepIdx + 1)];
  return dataLines.map(splitMdRow);
}

function escapeMdCell(cell: string): string {
  return cell.replace(/\r?\n/g, '<br>').replace(/\|/g, '\\|');
}

export function toMarkdown(
  rows: string[][],
  opts: { firstRowIsHeader: boolean; alignment: CsvMarkdownAlignment; padCells: boolean; trimCells: boolean; skipEmptyRows: boolean }
): string {
  let data = rows.map(r => (opts.trimCells ? r.map(c => c.trim()) : [...r]));
  if (opts.skipEmptyRows) data = data.filter(r => r.some(c => c.trim().length > 0));
  if (data.length === 0) throw new Error('No data rows to convert.');
  const cols = Math.max(...data.map(r => r.length));
  data = data.map(r => [...r, ...Array(Math.max(0, cols - r.length)).fill('')]);
  const esc = data.map(r => r.map(escapeMdCell));
  const widths = Array(cols).fill(3);
  if (opts.padCells) {
    for (let c = 0; c < cols; c++)
      for (const r of esc) widths[c] = Math.max(widths[c], r[c].length);
  }
  const pad = (s: string, w: number) => (opts.padCells ? s + ' '.repeat(Math.max(0, w - s.length)) : s);
  const alignMarker = (w: number) => {
    const base = opts.alignment === 'center' ? ':---:' : opts.alignment === 'right' ? '---:' : '---';
    if (!opts.padCells) return base;
    if (opts.alignment === 'center') return ':' + '-'.repeat(Math.max(3, w - 2)) + ':';
    if (opts.alignment === 'right') return '-'.repeat(Math.max(3, w - 1)) + ':';
    return '-'.repeat(Math.max(3, w));
  };
  const header = opts.firstRowIsHeader ? esc[0] : Array(cols).fill('').map((_, i) => `Column ${i + 1}`);
  const body = opts.firstRowIsHeader ? esc.slice(1) : esc;
  const lines = [
    '| ' + header.map((h, i) => pad(h, widths[i])).join(' | ') + ' |',
    '| ' + widths.map(alignMarker).join(' | ') + ' |',
    ...body.map(r => '| ' + r.map((c, i) => pad(c, widths[i])).join(' | ') + ' |'),
  ];
  return lines.join('\n');
}

function quoteCsvCell(cell: string): string {
  if (/[",\n]/.test(cell)) return '"' + cell.replace(/"/g, '""') + '"';
  return cell;
}

export function toCSV(rows: string[][]): string {
  return rows.map(r => r.map(quoteCsvCell).join(',')).join('\n');
}

export function toTSV(rows: string[][]): string {
  return rows.map(r => r.join('\t')).join('\n');
}

export function convertCsvMarkdown(
  input: string,
  options: CsvMarkdownConverterOptions
): CsvMarkdownResult {
  const fail = (error: string): CsvMarkdownResult => ({
    output: '', success: false, error,
    stats: { rows: 0, cols: 0, inputSize: input.length, outputSize: 0 },
  });
  try {
    if (!input.trim()) return fail('Input is empty.');
    if (options.direction === 'md-to-csv') {
      const fmt: CsvMarkdownOutputFormat = options.reverseOutputFormat;
      const rows = parseMarkdownTable(input);
      const output = fmt === 'tsv' ? toTSV(rows) : toCSV(rows);
      const cols = Math.max(...rows.map(r => r.length));
      return { output, success: true, detectedInput: 'markdown', stats: { rows: rows.length, cols, inputSize: input.length, outputSize: output.length } };
    }
    const kind = detectTableInput(input);
    const rows = kind === 'tsv' ? parseTSV(input) : parseCSV(input);
    const output = toMarkdown(rows, options);
    const cols = Math.max(...rows.map(r => r.length));
    return { output, success: true, detectedInput: kind, stats: { rows: rows.length, cols, inputSize: input.length, outputSize: output.length } };
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Conversion failed');
  }
}
