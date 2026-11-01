export type CsvMarkdownDirection = 'csv-to-md' | 'md-to-csv'
export type CsvMarkdownAlignment = 'left' | 'center' | 'right'
export type CsvMarkdownOutputFormat = 'csv' | 'tsv'

export interface CsvMarkdownConverterOptions {
  direction: CsvMarkdownDirection
  firstRowIsHeader: boolean
  alignment: CsvMarkdownAlignment
  padCells: boolean
  skipEmptyRows: boolean
  reverseOutputFormat: CsvMarkdownOutputFormat
}

export const DEFAULT_CSV_MARKDOWN_OPTIONS: CsvMarkdownConverterOptions = {
  direction: 'csv-to-md',
  firstRowIsHeader: true,
  alignment: 'left',
  padCells: false,
  skipEmptyRows: true,
  reverseOutputFormat: 'csv',
}

export const CSV_MARKDOWN_EXAMPLES = {
  tsv: `Name\tAge\tCity
Alice\t30\tNew York
Bob\t25\tLondon`,
  csv: `Name,Age,City
Alice,30,"New York, NY"
Bob,25,London`,
  markdown: `| Name | Age | City |
| --- | --- | --- |
| Alice | 30 | New York |
| Bob | 25 | London |`,
}
