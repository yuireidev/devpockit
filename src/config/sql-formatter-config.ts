/**
 * SQL Formatter configuration
 */

import type { SqlLanguage } from 'sql-formatter';

export const SQL_FORMAT_OPTIONS = {
  formats: [
    { value: 'beautify', label: 'Beautify (pretty print)' },
    { value: 'minify', label: 'Minify (compact)' },
  ],
  indentSizes: [
    { value: 2, label: '2 spaces' },
    { value: 4, label: '4 spaces' },
    { value: 8, label: '8 spaces' },
  ],
  keywordCases: [
    { value: 'preserve', label: 'Preserve keywords' },
    { value: 'upper', label: 'UPPERCASE keywords' },
    { value: 'lower', label: 'lowercase keywords' },
  ],
} as const;

export const DEFAULT_SQL_OPTIONS = {
  format: 'beautify' as const,
  indentSize: 2,
  dialect: 'sql' as SqlLanguage,
  keywordCase: 'preserve' as const,
};

/** Dialect select options — every `sql-formatter` language with a readable label. */
export const SQL_DIALECT_OPTIONS: { value: SqlLanguage; label: string }[] = [
  { value: 'bigquery', label: 'BigQuery' },
  { value: 'clickhouse', label: 'ClickHouse' },
  { value: 'db2', label: 'IBM Db2' },
  { value: 'db2i', label: 'IBM Db2 for i' },
  { value: 'duckdb', label: 'DuckDB' },
  { value: 'hive', label: 'Hive / Hadoop' },
  { value: 'mariadb', label: 'MariaDB' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'n1ql', label: 'N1QL (Couchbase)' },
  { value: 'plsql', label: 'PL/SQL (Oracle)' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'redshift', label: 'Amazon Redshift' },
  { value: 'singlestoredb', label: 'SingleStore' },
  { value: 'snowflake', label: 'Snowflake' },
  { value: 'spark', label: 'Spark SQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'sql', label: 'Standard SQL' },
  { value: 'tidb', label: 'TiDB' },
  { value: 'transactsql', label: 'Transact-SQL (SQL Server)' },
  { value: 'trino', label: 'Trino' },
  { value: 'tsql', label: 'T-SQL (alias of Transact-SQL)' },
];

export const SQL_EXAMPLES = {
  valid: `SELECT u.id, u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 0
ORDER BY order_count DESC
LIMIT 10;`,
  minified:
    "select u.id,u.name,count(o.id) as order_count from users u left join orders o on o.user_id=u.id where u.created_at>='2024-01-01' group by u.id,u.name having count(o.id)>0 order by order_count desc limit 10;",
  invalid: `SELEC id, name FORM users WHRE id = 1;`,
};
