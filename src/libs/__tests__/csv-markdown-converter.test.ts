import {
  convertCsvMarkdown,
  detectTableInput,
  parseCSV,
  parseMarkdownTable,
  parseTSV,
  toCSV,
  toTSV,
} from '@/libs/csv-markdown-converter';
import { DEFAULT_CSV_MARKDOWN_OPTIONS } from '@/config/csv-markdown-converter-config';

const base = { ...DEFAULT_CSV_MARKDOWN_OPTIONS };

describe('detectTableInput', () => {
  it('detects TSV when tabs present', () => {
    expect(detectTableInput('a\tb\nc\td')).toBe('tsv');
  });
  it('detects CSV otherwise', () => {
    expect(detectTableInput('a,b\nc,d')).toBe('csv');
  });
  it('detects markdown tables', () => {
    expect(detectTableInput('| a | b |\n| --- | --- |\n| 1 | 2 |')).toBe('markdown');
  });
});

describe('parsers', () => {
  it('parses quoted CSV with commas, quotes, newlines', () => {
    const rows = parseCSV('a,b\n"x, y","q""q"\n"l1\nl2",z');
    expect(rows).toEqual([['a', 'b'], ['x, y', 'q"q'], ['l1\nl2', 'z']]);
  });
  it('parses TSV with literal commas', () => {
    expect(parseTSV('a,b\tc\nd\te')).toEqual([['a,b', 'c'], ['d', 'e']]);
  });
  it('parses markdown and rejects missing separator', () => {
    expect(parseMarkdownTable('| a | b |\n| --- | --- |\n| 1 | 2 |')).toEqual([['a', 'b'], ['1', '2']]);
    expect(() => parseMarkdownTable('| a | b |\n| 1 | 2 |')).toThrow(/separator/);
  });
});

describe('convertCsvMarkdown', () => {
  it('converts TSV to markdown', () => {
    const r = convertCsvMarkdown('Name\tAge\nAlice\t30', base);
    expect(r.success).toBe(true);
    expect(r.detectedInput).toBe('tsv');
    expect(r.output).toContain('| Name');
    expect(r.output).toContain('| ---');
  });
  it('escapes pipes and pads ragged rows', () => {
    const r = convertCsvMarkdown('a,b,c\n1,2\nx|y,3,4', base);
    expect(r.output).toContain('x\\|y');
    expect(r.stats.cols).toBe(3);
  });
  it('applies alignment markers', () => {
    const c = convertCsvMarkdown('a,b\n1,2', { ...base, alignment: 'center' });
    expect(c.output.split('\n')[1]).toContain(':');
    const r = convertCsvMarkdown('a,b\n1,2', { ...base, alignment: 'right' });
    expect(r.output.split('\n')[1]).toContain('---:');
  });
  it('converts markdown back to CSV and TSV', () => {
    const md = '| Name | Note |\n| --- | --- |\n| Al | x, y |\n| Bo | q |';
    const csv = convertCsvMarkdown(md, { ...base, direction: 'md-to-csv', reverseOutputFormat: 'csv' });
    expect(csv.success).toBe(true);
    expect(toCSV([['x, y']])).toBe('"x, y"');
    expect(csv.output).toContain('"x, y"');
    const tsv = convertCsvMarkdown(md, { ...base, direction: 'md-to-csv', reverseOutputFormat: 'tsv' });
    expect(tsv.output).toBe(toTSV(parseMarkdownTable(md)));
  });
  it('errors on empty input', () => {
    expect(convertCsvMarkdown('   ', base).success).toBe(false);
  });
});
