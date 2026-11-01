import { DEFAULT_CSV_MARKDOWN_OPTIONS } from '@/config/csv-markdown-converter-config'
import {
  convertCsvMarkdown,
  detectTableInput,
  parseCSV,
  parseMarkdownTable,
  parseTSV,
  toCSV,
  toMarkdown,
  toTSV,
} from '@/libs/csv-markdown-converter'

const base = { ...DEFAULT_CSV_MARKDOWN_OPTIONS }
const warningCodes = (result: ReturnType<typeof convertCsvMarkdown>) => result.warnings.map((warning) => warning.code)

describe('detectTableInput', () => {
  it('detects plain CSV', () => {
    expect(detectTableInput('a,b\nc,d')).toBe('csv')
  })

  it('detects spreadsheet paste as TSV', () => {
    expect(detectTableInput('a\tb\nc\td')).toBe('tsv')
  })

  it('detects a Markdown table, including after a preamble', () => {
    expect(detectTableInput('| a | b |\n| --- | --- |\n| 1 | 2 |')).toBe('markdown')
    expect(detectTableInput('notes\n\n| a | b |\n| --- | --- |\n| 1 | 2 |')).toBe('markdown')
  })

  it('does not treat a tab inside a quoted field as TSV', () => {
    expect(detectTableInput('"a\tb",c\n1,2')).toBe('csv')
  })

  it('treats a pipe without a separator row as CSV', () => {
    expect(detectTableInput('a|b,c\nd|e,f')).toBe('csv')
  })

  it('prefers Markdown when a separator row and tabs are both present', () => {
    expect(detectTableInput('| a\tb | c |\n| --- | --- |\n| 1 | 2 |')).toBe('markdown')
  })

  it('keeps quote state across lines when looking for an unquoted tab', () => {
    expect(detectTableInput('"a\n\tb",c\n1,2')).toBe('csv')
  })
})

describe('parseCSV', () => {
  it('parses quoted commas, quotes, and newlines', () => {
    expect(parseCSV('a,b\n"x, y","q""q"\n"l1\nl2",z')).toEqual([
      ['a', 'b'],
      ['x, y', 'q"q'],
      ['l1\nl2', 'z'],
    ])
  })

  it('normalizes CRLF and strips a UTF-8 BOM', () => {
    expect(parseCSV('\ufeffa,b\r\n"x\r\ny",z')).toEqual([
      ['a', 'b'],
      ['x\ny', 'z'],
    ])
  })

  it('does not create a phantom row for a trailing newline', () => {
    expect(parseCSV('a,b\nc,d\n')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ])
  })
})

describe('parseTSV', () => {
  it('keeps unquoted commas literal inside TSV fields', () => {
    expect(parseTSV('a,b\tc\nd\te')).toEqual([
      ['a,b', 'c'],
      ['d', 'e'],
    ])
  })

  it('supports quoted fields in TSV', () => {
    expect(parseTSV('"a\tb"\tc')).toEqual([['a\tb', 'c']])
  })
})

describe('parseMarkdownTable', () => {
  it('parses a header and body rows', () => {
    expect(parseMarkdownTable('| a | b |\n| --- | --- |\n| 1 | 2 |')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('uses the line before the separator as the header', () => {
    expect(parseMarkdownTable('preamble\n| a | b |\n| --- | --- |\n| 1 | 2 |')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('unescapes pipes and backslashes', () => {
    expect(parseMarkdownTable('| a |\n| --- |\n| x \\| y |')).toEqual([['a'], ['x | y']])
    expect(parseMarkdownTable('| a |\n| --- |\n| x \\\\ y |')).toEqual([['a'], ['x \\ y']])
  })

  it('rejects input without a separator row', () => {
    expect(() => parseMarkdownTable('| a | b |\n| 1 | 2 |')).toThrow(/separator/)
  })
})

describe('toMarkdown', () => {
  it('emits a compact GFM table by default', () => {
    const { output, warnings } = toMarkdown(
      [
        ['Name', 'Age'],
        ['Alice', '30'],
      ],
      base
    )
    expect(output).toBe('| Name | Age |\n| --- | --- |\n| Alice | 30 |')
    expect(warnings).toEqual([])
  })

  it('applies alignment markers', () => {
    const center = toMarkdown(
      [
        ['a', 'b'],
        ['1', '2'],
      ],
      { ...base, alignment: 'center' }
    ).output
    expect(center.split('\n')[1]).toBe('| :---: | :---: |')

    const right = toMarkdown(
      [
        ['a', 'b'],
        ['1', '2'],
      ],
      { ...base, alignment: 'right' }
    ).output
    expect(right.split('\n')[1]).toBe('| ---: | ---: |')
  })

  it('pads cells according to alignment when padding is on', () => {
    const { output } = toMarkdown(
      [
        ['a', 'bb'],
        ['c', 'd'],
      ],
      { ...base, padCells: true, alignment: 'right' }
    )
    expect(output).toContain('|   a |  bb |')
    expect(output.split('\n')[1]).toBe('| ---: | ---: |')
  })

  it('measures escaped cells by their rendered width when padding', () => {
    const { output } = toMarkdown([['a|b'], ['xx']], { ...base, padCells: true })
    expect(output.split('\n')[0]).toBe('| a\\|b |')
    expect(output.split('\n')[2]).toBe('| xx  |')
  })

  it('synthesizes header names when the first row is not a header', () => {
    const { output, warnings } = toMarkdown(
      [
        ['1', '2'],
        ['3', '4'],
      ],
      { ...base, firstRowIsHeader: false }
    )
    expect(output).toContain('| Column 1 | Column 2 |')
    expect(output).toContain('| 1 | 2 |')
    expect(warnings.map((warning) => warning.code)).toContain('blank-header')
  })

  it('synthesizes names for blank header cells', () => {
    const { output, warnings } = toMarkdown(
      [
        ['', 'Age'],
        ['Alice', '30'],
      ],
      base
    )
    expect(output).toContain('| Column 1 | Age |')
    expect(warnings.map((warning) => warning.code)).toContain('blank-header')
  })

  it('synthesizes names for whitespace-only header cells', () => {
    const { output, warnings } = toMarkdown(
      [
        ['   ', 'Age'],
        ['Alice', '30'],
      ],
      base
    )
    expect(output).toContain('| Column 1 | Age |')
    expect(warnings.map((warning) => warning.code)).toContain('blank-header')
  })

  it('pads ragged rows and warns', () => {
    const { output, warnings } = toMarkdown(
      [
        ['a', 'b', 'c'],
        ['1', '2'],
      ],
      base
    )
    expect(output).toContain('| 1 | 2 |  |')
    expect(warnings.map((warning) => warning.code)).toContain('ragged-rows')
  })

  it('preserves leading and trailing whitespace in fields', () => {
    const { output } = toMarkdown(
      [
        [' a ', ' b '],
        [' 1 ', ' 2 '],
      ],
      base
    )
    expect(output).toContain('|  a  |  b  |')
    expect(output).toContain('|  1  |  2  |')
  })

  it('drops empty body rows when skipEmptyRows is on', () => {
    const { output } = toMarkdown(
      [
        ['a', 'b'],
        ['', ''],
        ['1', '2'],
      ],
      base
    )
    expect(output).toBe('| a | b |\n| --- | --- |\n| 1 | 2 |')
  })

  it('keeps empty body rows when skipEmptyRows is off', () => {
    const { output } = toMarkdown(
      [
        ['a', 'b'],
        ['', ''],
        ['1', '2'],
      ],
      { ...base, skipEmptyRows: false }
    )
    expect(output).toContain('|  |  |')
  })

  it('escapes pipes, backslashes, and newlines', () => {
    const { output } = toMarkdown(
      [
        ['a', 'b', 'c'],
        ['x|y', 'c\\d', 'e\nf'],
      ],
      base
    )
    expect(output).toContain('| x\\|y | c\\\\d | e<br>f |')
  })

  it('never drops a blank header row', () => {
    const { output, warnings } = toMarkdown(
      [
        ['', ''],
        ['1', '2'],
      ],
      base
    )
    expect(output.split('\n')[0]).toBe('| Column 1 | Column 2 |')
    expect(warnings.map((warning) => warning.code)).toContain('blank-header')
  })
})

describe('toCSV and toTSV', () => {
  it('quotes CSV fields containing commas, quotes, and newlines', () => {
    expect(toCSV([['x, y'], ['q"q'], ['e\nf'], ['plain']])).toBe('"x, y"\n"q""q"\n"e\nf"\nplain')
  })

  it('collapses tabs and newlines in TSV output and reports the count', () => {
    const result = toTSV([['a\tb'], ['c\nd'], ['ok']])
    expect(result.output).toBe('a b\nc d\nok')
    expect(result.collapsed).toBe(2)
  })
})

describe('convertCsvMarkdown', () => {
  it('converts CSV to Markdown with a single trailing newline', () => {
    const result = convertCsvMarkdown('Name,Age\nAlice,30', base)
    expect(result.success).toBe(true)
    expect(result.detectedInput).toBe('csv')
    expect(result.output).toBe('| Name | Age |\n| --- | --- |\n| Alice | 30 |\n')
    expect(result.stats.rows).toBe(1)
    expect(result.stats.cols).toBe(2)
  })

  it('converts spreadsheet paste to Markdown', () => {
    const result = convertCsvMarkdown('Name\tAge\nAlice\t30', base)
    expect(result.success).toBe(true)
    expect(result.detectedInput).toBe('tsv')
    expect(result.output).toContain('| Name | Age |')
  })

  it('strips a BOM before the first header cell', () => {
    const result = convertCsvMarkdown('\ufeffName,Age\nAlice,30', base)
    expect(result.output.split('\n')[0]).toBe('| Name | Age |')
  })

  it('warns instead of failing on an unclosed quote', () => {
    const result = convertCsvMarkdown('a,b\n"x,1', base)
    expect(result.success).toBe(true)
    expect(result.output).toContain('| x,1 |')
    expect(warningCodes(result)).toContain('unclosed-quote')
  })

  it('warns on a quote inside an unquoted field and keeps it literal', () => {
    const result = convertCsvMarkdown('a,b\nc"d,e', base)
    expect(result.success).toBe(true)
    expect(result.output).toContain('c"d')
    expect(warningCodes(result)).toContain('quote-in-unquoted-field')
  })

  it('supports a header-only table', () => {
    const result = convertCsvMarkdown('Name,Age', base)
    expect(result.success).toBe(true)
    expect(result.output).toBe('| Name | Age |\n| --- | --- |\n')
    expect(result.stats.rows).toBe(0)
  })

  it('ignores trailing blank lines even when empty rows are kept', () => {
    const result = convertCsvMarkdown('a,b\n1,2\n\n\n', { ...base, skipEmptyRows: false })
    expect(result.stats.rows).toBe(1)
    expect(result.output).not.toContain('|  |  |')
  })

  it('accepts a Markdown table in the forward direction and normalizes it', () => {
    const result = convertCsvMarkdown('| a | b |\n| --- | --- |\n| 1 | 2 |', base)
    expect(result.success).toBe(true)
    expect(result.detectedInput).toBe('markdown')
    expect(result.output).toBe('| a | b |\n| --- | --- |\n| 1 | 2 |\n')
  })

  it('handles a large number of rows without a call-stack overflow', () => {
    const result = convertCsvMarkdown('h\n' + 'x\n'.repeat(120_000), base)
    expect(result.success).toBe(true)
    expect(result.stats.rows).toBe(120_000)
  })

  it('treats whitespace-only input as an error', () => {
    const result = convertCsvMarkdown('   \n\t', base)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/empty/i)
  })

  it('rejects input above the hard size cap', () => {
    const result = convertCsvMarkdown('x'.repeat(10 * 1024 * 1024 + 1), base)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/too large/i)
  })

  it('converts Markdown to CSV with RFC 4180 quoting', () => {
    const result = convertCsvMarkdown('| Name | Note |\n| --- | --- |\n| Al | x, y |', {
      ...base,
      direction: 'md-to-csv',
    })
    expect(result.success).toBe(true)
    expect(result.detectedInput).toBe('markdown')
    expect(result.output).toBe('Name,Note\nAl,"x, y"\n')
  })

  it('inverts escapes when converting Markdown to CSV', () => {
    const result = convertCsvMarkdown('| a |\n| --- |\n| x \\| y |\n| c\\\\d |\n| e<br>f |', {
      ...base,
      direction: 'md-to-csv',
    })
    expect(result.output).toBe('a\nx | y\nc\\d\n"e\nf"\n')
  })

  it('collapses tabs and newlines when converting Markdown to TSV', () => {
    const result = convertCsvMarkdown('| a | b |\n| --- | --- |\n| x\ty | z |', {
      ...base,
      direction: 'md-to-csv',
      reverseOutputFormat: 'tsv',
    })
    expect(result.output).toBe('a\tb\nx y\tz\n')
    expect(warningCodes(result)).toContain('tsv-cell-collapsed')
  })

  it('pads ragged Markdown rows when converting back to CSV', () => {
    const result = convertCsvMarkdown('| a | b |\n| --- | --- |\n| 1 |', { ...base, direction: 'md-to-csv' })
    expect(result.output).toBe('a,b\n1,\n')
    expect(warningCodes(result)).toContain('ragged-rows')
  })

  it('round-trips fields through CSV → Markdown → CSV', () => {
    const original = 'Name,Note\nAda,"x, y"\nLin,a|b\nBo,c\\d\nCy,"e\nf"'
    const markdown = convertCsvMarkdown(original, base).output
    const back = convertCsvMarkdown(markdown, { ...base, direction: 'md-to-csv' }).output
    expect(parseCSV(back)).toEqual(parseCSV(original))
  })
})
