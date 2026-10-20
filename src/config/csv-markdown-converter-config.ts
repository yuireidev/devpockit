export type CsvMarkdownDirection = 'csv-to-md' | 'md-to-csv';
export type CsvMarkdownAlignment = 'left' | 'center' | 'right';
export type CsvMarkdownOutputFormat = 'csv' | 'tsv';

export interface CsvMarkdownConverterOptions {
  direction: CsvMarkdownDirection;
  firstRowIsHeader: boolean;
  alignment: CsvMarkdownAlignment;
  padCells: boolean;
  trimCells: boolean;
  skipEmptyRows: boolean;
  reverseOutputFormat: CsvMarkdownOutputFormat;
}

export const DEFAULT_CSV_MARKDOWN_OPTIONS: CsvMarkdownConverterOptions = {
  direction: 'csv-to-md',
  firstRowIsHeader: true,
  alignment: 'left',
  padCells: true,
  trimCells: true,
  skipEmptyRows: true,
  reverseOutputFormat: 'csv',
};

export const CSV_MARKDOWN_EXAMPLES = {
  tsv: `Name\tAge\tCity\nAlice\t30\tNew York\nBob\t25\tLondon`,
  csv: `Name,Age,City\nAlice,30,"New York, NY"\nBob,25,London`,
  markdown: `| Name | Age | City |\n| --- | --- | --- |\n| Alice | 30 | New York |\n| Bob | 25 | London |`,
};
