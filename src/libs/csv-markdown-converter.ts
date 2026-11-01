import type {
  CsvMarkdownAlignment,
  CsvMarkdownConverterOptions,
  CsvMarkdownOutputFormat,
} from '@/config/csv-markdown-converter-config'

/** How the input table is encoded. */
export type TableInputKind = 'tsv' | 'csv' | 'markdown'

/** Categories of non-blocking parse and rendering warnings. */
export type CsvMarkdownWarningCode =
  'unclosed-quote' | 'quote-in-unquoted-field' | 'ragged-rows' | 'blank-header' | 'tsv-cell-collapsed'

/** A field or shape problem found while parsing or rendering, surfaced instead of blocking. */
export interface CsvMarkdownWarning {
  code: CsvMarkdownWarningCode
  message: string
  line?: number
}

/** Number of retained body rows and columns in the converted table. */
export interface CsvMarkdownStats {
  rows: number
  cols: number
}

/** Outcome of a conversion; `output` is populated only when `success` is true. */
export interface CsvMarkdownResult {
  output: string
  success: boolean
  error?: string
  detectedInput?: TableInputKind
  warnings: CsvMarkdownWarning[]
  stats: CsvMarkdownStats
}

/** Hard cap for any input, independent of the live-preview threshold. */
const MAX_INPUT_BYTES = 10 * 1024 * 1024
/** Inputs above this size or row count require an explicit Convert action. */
const LIVE_PREVIEW_LIMIT_BYTES = 2 * 1024 * 1024
const LIVE_PREVIEW_ROW_LIMIT = 50_000

const TRAILING_NEWLINE = '\n'

function normalizeInput(text: string): string {
  return text.replace(/^\ufeff/, '').replace(/\r\n?/g, '\n')
}

/** Counts the UTF-8 bytes of a string without relying on TextEncoder. */
export function utf8ByteLength(text: string): number {
  let bytes = 0
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    if (code < 0x80) {
      bytes += 1
    } else if (code < 0x800) {
      bytes += 2
    } else if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
      bytes += 4
      i++
    } else {
      bytes += 3
    }
  }
  return bytes
}

function countPhysicalLines(text: string): number {
  if (!text) return 0
  let lines = 1
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) lines++
  }
  return lines
}

/**
 * Whether an input is too large for the debounced live preview. The row check is a
 * conservative physical-line proxy so it stays cheap; quoted newlines may pause early,
 * which is safe because the explicit Convert action is always available.
 */
export function isLargeInput(text: string, firstRowIsHeader = true): boolean {
  if (utf8ByteLength(text) > LIVE_PREVIEW_LIMIT_BYTES) return true
  if (text.length < LIVE_PREVIEW_ROW_LIMIT) return false

  const lines = countPhysicalLines(stripTrailingBlankLines(normalizeInput(text)))
  const dataRows = Math.max(0, lines - (firstRowIsHeader ? 1 : 0))
  return dataRows > LIVE_PREVIEW_ROW_LIMIT
}

function stripTrailingBlankLines(text: string): string {
  return text.replace(/(\n[ \t]*)+$/, '')
}

function ensureTrailingNewline(text: string): string {
  if (!text) return ''
  return text.endsWith(TRAILING_NEWLINE) ? text : text + TRAILING_NEWLINE
}

interface ParsedDelimited {
  rows: string[][]
  warnings: CsvMarkdownWarning[]
}

function parseDelimited(text: string, delimiter: string): ParsedDelimited {
  const src = stripTrailingBlankLines(normalizeInput(text))
  const rows: string[][] = []
  const warnings: CsvMarkdownWarning[] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let fieldStart = true
  let line = 1
  let quoteOpenLine = 1

  const pushField = () => {
    row.push(field)
    field = ''
    fieldStart = true
  }

  const pushRow = () => {
    pushField()
    rows.push(row)
    row = []
  }

  for (let i = 0; i < src.length; i++) {
    const char = src[i]

    if (inQuotes) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        if (char === '\n') line++
        field += char
      }
      continue
    }

    if (char === '"' && fieldStart) {
      inQuotes = true
      quoteOpenLine = line
      fieldStart = false
    } else if (char === '"') {
      warnings.push({
        code: 'quote-in-unquoted-field',
        message: `Line ${line}: a quote inside an unquoted field was kept literally.`,
        line,
      })
      field += char
    } else if (char === delimiter) {
      pushField()
    } else if (char === '\n') {
      pushRow()
      line++
    } else {
      field += char
      fieldStart = false
    }
  }

  if (inQuotes) {
    warnings.push({
      code: 'unclosed-quote',
      message: `Line ${quoteOpenLine}: a quoted field was not closed before the end of the input.`,
      line: quoteOpenLine,
    })
  }

  if (field.length > 0 || row.length > 0) {
    pushRow()
  }

  return { rows, warnings }
}

/** Parses comma-separated values using RFC 4180 quoting, leniently. */
export function parseCSV(text: string): string[][] {
  return parseDelimited(text, ',').rows
}

/** Parses tab-separated values, including quoted fields from TSV files. */
export function parseTSV(text: string): string[][] {
  return parseDelimited(text, '\t').rows
}

function tableLines(text: string): string[] {
  return normalizeInput(text)
    .split('\n')
    .filter((line) => line.trim().length > 0)
}

function isEscapedAt(text: string, index: number): boolean {
  let backslashes = 0
  for (let i = index - 1; i >= 0 && text[i] === '\\'; i--) backslashes++
  return backslashes % 2 === 1
}

function splitMarkdownRow(line: string): string[] {
  const trimmed = line.trim()
  let start = 0
  let end = trimmed.length
  if (trimmed.startsWith('|')) start = 1
  if (trimmed.endsWith('|') && !isEscapedAt(trimmed, trimmed.length - 1)) end = trimmed.length - 1

  const cells: string[] = []
  let current = ''

  for (let i = start; i < end; i++) {
    const char = trimmed[i]
    if (char === '\\' && i + 1 < end && (trimmed[i + 1] === '\\' || trimmed[i + 1] === '|')) {
      current += trimmed[i + 1]
      i++
    } else if (char === '|') {
      cells.push(current)
      current = ''
    } else {
      current += char
    }
  }
  cells.push(current)

  return cells.map((cell) => cell.trim().replace(/<br\s*\/?>/gi, '\n'))
}

function separatorCells(line: string): string[] | null {
  if (!line.includes('|')) return null
  const cells = splitMarkdownRow(line)
  if (cells.length === 0) return null
  if (!cells.every((cell) => /^:?-{3,}:?$/.test(cell))) return null
  return cells
}

function findSeparatorIndex(lines: string[], limit = lines.length): number {
  const max = Math.min(lines.length, limit)
  for (let i = 0; i < max; i++) {
    if (separatorCells(lines[i])) return i
  }
  return -1
}

function hasUnquotedTab(text: string, maxLines = 5): boolean {
  let inQuotes = false
  let lines = 1
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        i++
        continue
      }
      inQuotes = !inQuotes
    } else if (char === '\t' && !inQuotes) {
      return true
    } else if (char === '\n' && !inQuotes) {
      lines++
      if (lines > maxLines) return false
    }
  }
  return false
}

/** Classifies input as Markdown, spreadsheet paste (TSV), or CSV. */
export function detectTableInput(text: string): TableInputKind {
  const lines = tableLines(text)
  if (findSeparatorIndex(lines.slice(0, 5)) > 0) return 'markdown'
  if (hasUnquotedTab(normalizeInput(text))) return 'tsv'
  return 'csv'
}

/** Parses a GFM Markdown table; throws when the separator row is missing. */
export function parseMarkdownTable(text: string): string[][] {
  const lines = tableLines(text)
  const separatorIndex = findSeparatorIndex(lines)
  if (separatorIndex < 1) {
    throw new Error('Not a Markdown table: missing separator row (e.g. | --- |).')
  }

  const header = splitMarkdownRow(lines[separatorIndex - 1])
  const body = lines.slice(separatorIndex + 1).map(splitMarkdownRow)
  return [header, ...body]
}

function escapeMarkdownCell(cell: string): string {
  return cell
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/\r\n?|\n/g, '<br>')
}

function markdownCellWidth(cell: string): number {
  let width = 0
  for (let i = 0; i < cell.length; i++) {
    if (cell[i] === '\\' && (cell[i + 1] === '\\' || cell[i + 1] === '|')) i++
    width++
  }
  return width
}

function padCell(cell: string, width: number, alignment: CsvMarkdownAlignment): string {
  const missing = Math.max(0, width - markdownCellWidth(cell))
  if (alignment === 'right') return ' '.repeat(missing) + cell
  if (alignment === 'center') {
    const left = Math.floor(missing / 2)
    return ' '.repeat(left) + cell + ' '.repeat(missing - left)
  }
  return cell + ' '.repeat(missing)
}

function alignmentMarker(width: number, alignment: CsvMarkdownAlignment): string {
  if (alignment === 'center') return ':' + '-'.repeat(Math.max(3, width - 2)) + ':'
  if (alignment === 'right') return '-'.repeat(Math.max(3, width - 1)) + ':'
  return '-'.repeat(Math.max(3, width))
}

const RAGGED_ROWS_MESSAGE = 'Some rows had fewer cells than the widest row; they were padded with empty cells.'

function padRaggedRows(rows: string[][]): { rows: string[][]; padded: boolean } {
  const cols = rows.reduce((max, row) => Math.max(max, row.length), 0)
  const padded = rows.some((row) => row.length < cols)
  if (!padded) return { rows, padded }
  return { rows: rows.map((row) => [...row, ...Array(cols - row.length).fill('')]), padded }
}

/** Rendered GFM table plus the warnings and retained body dimensions. */
export interface MarkdownTableResult {
  output: string
  warnings: CsvMarkdownWarning[]
  stats: CsvMarkdownStats
}

/** Builds a GFM table, synthesizing header names and reporting data-shaping warnings. */
export function toMarkdown(rows: string[][], options: CsvMarkdownConverterOptions): MarkdownTableResult {
  if (rows.length === 0) throw new Error('No data rows to convert.')

  const warnings: CsvMarkdownWarning[] = []
  const { rows: paddedRows, padded } = padRaggedRows(rows)
  const cols = paddedRows[0]?.length ?? 0
  if (cols === 0) throw new Error('No columns to convert.')
  if (padded) warnings.push({ code: 'ragged-rows', message: RAGGED_ROWS_MESSAGE })

  const headerSource = options.firstRowIsHeader ? paddedRows[0] : null
  let body = options.firstRowIsHeader ? paddedRows.slice(1) : paddedRows

  if (options.skipEmptyRows) {
    body = body.filter((row) => row.some((cell) => cell.trim().length > 0))
  }

  const isBlank = (cell: string) => cell.trim().length === 0

  let header: string[]
  if (headerSource) {
    header = [...headerSource]
    const blankHeader = header.some(isBlank)
    header = header.map((cell, index) => (isBlank(cell) ? `Column ${index + 1}` : cell))
    if (blankHeader) {
      warnings.push({
        code: 'blank-header',
        message: 'Some header cells were empty and were named Column N.',
      })
    }
  } else {
    header = Array.from({ length: cols }, (_, index) => `Column ${index + 1}`)
    warnings.push({
      code: 'blank-header',
      message: 'No header row was supplied; column names were synthesized as Column N.',
    })
  }

  const escapedHeader = header.map(escapeMarkdownCell)
  const escapedBody = body.map((row) => row.map(escapeMarkdownCell))

  const widths = Array(cols).fill(3)
  if (options.padCells) {
    for (let column = 0; column < cols; column++) {
      for (const row of [escapedHeader, ...escapedBody]) {
        widths[column] = Math.max(widths[column], markdownCellWidth(row[column]))
      }
    }
  }

  const render = (row: string[]) =>
    '| ' +
    row.map((cell, index) => (options.padCells ? padCell(cell, widths[index], options.alignment) : cell)).join(' | ') +
    ' |'

  const output = [
    render(escapedHeader),
    '| ' + widths.map((width) => alignmentMarker(width, options.alignment)).join(' | ') + ' |',
    ...escapedBody.map(render),
  ].join('\n')

  return { output, warnings, stats: { rows: body.length, cols } }
}

function quoteCsvCell(cell: string): string {
  if (/[",\n\r]/.test(cell)) return '"' + cell.replace(/"/g, '""') + '"'
  return cell
}

/** Serializes rows as CSV with RFC 4180 quoting. */
export function toCSV(rows: string[][]): string {
  return rows.map((row) => row.map(quoteCsvCell).join(',')).join('\n')
}

/** TSV output plus the number of cells whose tabs or line breaks were collapsed. */
export interface TsvResult {
  output: string
  collapsed: number
}

/** Serializes rows as TSV, replacing embedded tabs and line breaks with spaces. */
export function toTSV(rows: string[][]): TsvResult {
  let collapsed = 0
  const output = rows
    .map((row) =>
      row
        .map((cell) => {
          const replaced = cell.replace(/[\t\n\r]/g, ' ')
          if (replaced !== cell) collapsed++
          return replaced
        })
        .join('\t')
    )
    .join('\n')
  return { output, collapsed }
}

/** Converts between CSV/TSV and a GFM Markdown table in either direction. */
export function convertCsvMarkdown(input: string, options: CsvMarkdownConverterOptions): CsvMarkdownResult {
  const warnings: CsvMarkdownWarning[] = []
  const fail = (error: string): CsvMarkdownResult => ({
    output: '',
    success: false,
    error,
    warnings,
    stats: { rows: 0, cols: 0 },
  })

  if (!input.trim()) return fail('Input is empty.')
  if (utf8ByteLength(input) > MAX_INPUT_BYTES) return fail('Input is too large (max 10 MB).')

  try {
    if (options.direction === 'md-to-csv') {
      const parsed = padRaggedRows(parseMarkdownTable(input))
      if (parsed.padded) {
        warnings.push({
          code: 'ragged-rows',
          message: RAGGED_ROWS_MESSAGE,
        })
      }
      const rows = parsed.rows
      const format: CsvMarkdownOutputFormat = options.reverseOutputFormat
      let output: string

      if (format === 'tsv') {
        const tsv = toTSV(rows)
        output = tsv.output
        if (tsv.collapsed > 0) {
          warnings.push({
            code: 'tsv-cell-collapsed',
            message: `${tsv.collapsed} cell(s) contained tabs or line breaks; they were replaced with spaces for TSV.`,
          })
        }
      } else {
        output = toCSV(rows)
      }

      output = ensureTrailingNewline(output)
      const cols = rows.reduce((max, row) => Math.max(max, row.length), 0)
      return {
        output,
        success: true,
        detectedInput: 'markdown',
        warnings,
        stats: { rows: Math.max(0, rows.length - 1), cols },
      }
    }

    const kind = detectTableInput(input)
    let parsedRows: string[][]
    if (kind === 'markdown') {
      parsedRows = parseMarkdownTable(input)
    } else {
      const parsed = parseDelimited(input, kind === 'tsv' ? '\t' : ',')
      parsedRows = parsed.rows
      warnings.push(...parsed.warnings)
    }

    const table = toMarkdown(parsedRows, options)
    warnings.push(...table.warnings)
    const output = ensureTrailingNewline(table.output)

    return {
      output,
      success: true,
      detectedInput: kind,
      warnings,
      stats: table.stats,
    }
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Conversion failed')
  }
}
