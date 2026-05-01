import { formatSql, getSqlDialectValidationHint, getSqlStats } from '../sql-formatter';

describe('SQL Formatter', () => {
  const sample = 'select a,b from t where id=1';

  describe('formatSql', () => {
    it('beautifies valid SQL', () => {
      const result = formatSql(sample, {
        format: 'beautify',
        indentSize: 2,
        dialect: 'postgresql',
        keywordCase: 'preserve',
      });
      expect(result.isValid).toBe(true);
      expect(result.formatted).toContain('\n');
      expect(result.formatted.toLowerCase()).toContain('select');
    });

    it('minifies SQL to a single line', () => {
      const result = formatSql('SELECT 1\nFROM dual', {
        format: 'minify',
        indentSize: 2,
        dialect: 'mysql',
        keywordCase: 'preserve',
      });
      expect(result.isValid).toBe(true);
      expect(result.formatted.split('\n').length).toBe(1);
    });

    it('returns error for invalid SQL', () => {
      const result = formatSql('SELEC 1 FORM x;', {
        format: 'beautify',
        indentSize: 2,
        dialect: 'mysql',
        keywordCase: 'preserve',
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects empty input', () => {
      const result = formatSql('   ', {
        format: 'beautify',
        indentSize: 2,
        dialect: 'sql',
        keywordCase: 'preserve',
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/enter SQL/i);
    });

    it('does not validate PL/SQL dialect but still formats', () => {
      const result = formatSql('SELECT 1 FROM dual', {
        format: 'beautify',
        indentSize: 2,
        dialect: 'plsql',
        keywordCase: 'preserve',
      });
      expect(result.isValid).toBe(true);
      expect(result.formatted.length).toBeGreaterThan(0);
    });
  });

  describe('getSqlDialectValidationHint', () => {
    it('returns null for exact dialects', () => {
      expect(getSqlDialectValidationHint('mysql')).toBeNull();
    });

    it('returns hint for proxy dialects', () => {
      expect(getSqlDialectValidationHint('spark')).toContain('Hive');
    });

    it('returns hint for format-only PL/SQL', () => {
      expect(getSqlDialectValidationHint('plsql')).toMatch(/not validated/i);
    });
  });

  describe('getSqlStats', () => {
    it('counts lines and statements', () => {
      const stats = getSqlStats('SELECT 1;\nSELECT 2;');
      expect(stats.lines).toBe(2);
      expect(stats.statements).toBe(2);
    });
  });
});
