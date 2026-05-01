/**
 * SQL Formatter logic — validate with node-sql-parser, layout with sql-formatter.
 */

import { Parser } from 'node-sql-parser';
import { format, type FormatOptionsWithLanguage, type SqlLanguage } from 'sql-formatter';

export type { SqlLanguage };

export type SqlValidationMode = 'exact' | 'proxy' | 'formatOnly';

export interface SqlDialectMeta {
  mode: SqlValidationMode;
  /** node-sql-parser `database` option when mode is exact or proxy */
  parserDatabase?: string;
  /** Shown in UI for proxy / format-only */
  hint?: string;
}

export const SQL_DIALECT_META = {
  sql: { mode: 'exact', parserDatabase: 'MySQL' },
  mysql: { mode: 'exact', parserDatabase: 'MySQL' },
  mariadb: { mode: 'exact', parserDatabase: 'MariaDB' },
  postgresql: { mode: 'exact', parserDatabase: 'Postgresql' },
  sqlite: { mode: 'exact', parserDatabase: 'Sqlite' },
  bigquery: { mode: 'exact', parserDatabase: 'BigQuery' },
  db2: { mode: 'exact', parserDatabase: 'DB2' },
  hive: { mode: 'exact', parserDatabase: 'Hive' },
  redshift: { mode: 'exact', parserDatabase: 'Redshift' },
  snowflake: { mode: 'exact', parserDatabase: 'Snowflake' },
  transactsql: { mode: 'exact', parserDatabase: 'TransactSQL' },
  tsql: { mode: 'exact', parserDatabase: 'TransactSQL' },
  db2i: {
    mode: 'proxy',
    parserDatabase: 'DB2',
    hint: 'Syntax is checked using DB2 rules (DB2 for i may differ).',
  },
  spark: {
    mode: 'proxy',
    parserDatabase: 'Hive',
    hint: 'Syntax is checked using Hive rules (approximate for Spark SQL).',
  },
  clickhouse: {
    mode: 'proxy',
    parserDatabase: 'MySQL',
    hint: 'Syntax is checked using MySQL rules (approximate for ClickHouse).',
  },
  tidb: {
    mode: 'proxy',
    parserDatabase: 'MySQL',
    hint: 'Syntax is checked using MySQL rules (approximate for TiDB).',
  },
  singlestoredb: {
    mode: 'proxy',
    parserDatabase: 'MySQL',
    hint: 'Syntax is checked using MySQL rules (approximate for SingleStore).',
  },
  n1ql: {
    mode: 'proxy',
    parserDatabase: 'MySQL',
    hint: 'Syntax is checked using MySQL rules (approximate for N1QL).',
  },
  duckdb: {
    mode: 'proxy',
    parserDatabase: 'Postgresql',
    hint: 'Syntax is checked using PostgreSQL rules (approximate for DuckDB).',
  },
  trino: {
    mode: 'proxy',
    parserDatabase: 'Postgresql',
    hint: 'Syntax is checked using PostgreSQL rules (approximate for Trino).',
  },
  plsql: {
    mode: 'formatOnly',
    hint: 'PL/SQL syntax is not validated; output is formatted only.',
  },
} as const satisfies Record<SqlLanguage, SqlDialectMeta>;

const parser = new Parser();

export interface SqlFormatOptions {
  format: 'beautify' | 'minify';
  indentSize: number;
  dialect: SqlLanguage;
  keywordCase: 'preserve' | 'upper' | 'lower';
}

export interface SqlFormatResult {
  formatted: string;
  isValid: boolean;
  error?: string;
  originalSize: number;
  formattedSize: number;
  compressionRatio?: number;
}

export function getSqlDialectValidationHint(dialect: SqlLanguage): string | null {
  const meta = SQL_DIALECT_META[dialect];
  if (meta.mode === 'formatOnly') {
    return meta.hint ?? null;
  }
  if (meta.mode === 'proxy') {
    return meta.hint ?? null;
  }
  return null;
}

function validateSql(
  sql: string,
  dialect: SqlLanguage
): { ok: true } | { ok: false; error: string } {
  const meta = SQL_DIALECT_META[dialect];
  if (meta.mode === 'formatOnly') {
    return { ok: true };
  }
  const db = meta.parserDatabase;
  if (!db) {
    return { ok: false, error: 'No parser database configured for dialect.' };
  }
  try {
    parser.astify(sql, { database: db });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

function buildFormatterOptions(options: SqlFormatOptions): FormatOptionsWithLanguage {
  const { dialect, keywordCase, format: fmt, indentSize } = options;
  if (fmt === 'minify') {
    return {
      language: dialect,
      keywordCase,
      tabWidth: 0,
      useTabs: false,
      denseOperators: true,
      linesBetweenQueries: 0,
      newlineBeforeSemicolon: false,
      expressionWidth: 10_000,
      logicalOperatorNewline: 'after',
      indentStyle: 'standard',
    };
  }
  return {
    language: dialect,
    keywordCase,
    tabWidth: indentSize,
    denseOperators: false,
    linesBetweenQueries: 1,
    newlineBeforeSemicolon: false,
    expressionWidth: 50,
    logicalOperatorNewline: 'before',
    indentStyle: 'standard',
  };
}

/** Collapse formatted SQL to one line (may affect whitespace inside string literals). */
function collapseMinified(formatted: string): string {
  return formatted
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatSql(input: string, options: SqlFormatOptions): SqlFormatResult {
  const originalSize = input.length;
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      formatted: '',
      isValid: false,
      error: 'Please enter SQL to format',
      originalSize,
      formattedSize: 0,
    };
  }

  const validated = validateSql(trimmed, options.dialect);
  if (!validated.ok) {
    return {
      formatted: trimmed,
      isValid: false,
      error: validated.error,
      originalSize,
      formattedSize: originalSize,
    };
  }

  try {
    let formatted = format(trimmed, buildFormatterOptions(options));
    if (options.format === 'minify') {
      formatted = collapseMinified(formatted);
    }

    const formattedSize = formatted.length;
    const compressionRatio =
      originalSize > 0 ? ((originalSize - formattedSize) / originalSize) * 100 : 0;

    return {
      formatted,
      isValid: true,
      originalSize,
      formattedSize,
      compressionRatio: options.format === 'minify' ? compressionRatio : undefined,
    };
  } catch (e) {
    return {
      formatted: trimmed,
      isValid: false,
      error: e instanceof Error ? e.message : 'Failed to format SQL',
      originalSize,
      formattedSize: originalSize,
    };
  }
}

export function getSqlStats(sql: string): {
  size: number;
  lines: number;
  statements: number;
} {
  const trimmed = sql.trim();
  if (!trimmed) {
    return { size: 0, lines: 0, statements: 0 };
  }
  const statements = trimmed
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0).length;
  return {
    size: sql.length,
    lines: sql.split('\n').length,
    statements,
  };
}
