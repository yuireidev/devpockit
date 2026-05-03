import { minifyText, type TextMinifyOptions } from '../text-minifier';

describe('text-minifier', () => {
  const singleDefaults: TextMinifyOptions = {
    mode: 'single_line',
    normalizeLineEndings: true,
    removeEmptyLines: false,
  };

  const perLineDefaults: TextMinifyOptions = {
    mode: 'per_line',
    normalizeLineEndings: true,
    removeEmptyLines: false,
  };

  describe('single_line mode', () => {
    it('collapses whitespace and trims ends', () => {
      expect(minifyText('  a \n\t b  ', singleDefaults)).toMatchObject({
        output: 'a b',
        outputLineCount: 1,
      });
    });

    it('produces one logical line for multiline prose', () => {
      expect(
        minifyText('hello   world\ngoodbye', singleDefaults).output
      ).toBe('hello world goodbye');
    });
  });

  describe('per_line mode', () => {
    it('trims lines and collapses spaces inside lines while preserving line breaks', () => {
      const r = minifyText('  foo  bar \n baz\t\tqux ', perLineDefaults);
      expect(r.output).toBe('foo bar\nbaz qux');
      expect(r.originalLineCount).toBe(2);
      expect(r.outputLineCount).toBe(2);
    });

    it('removes blank lines when removeEmptyLines is true', () => {
      const opts: TextMinifyOptions = {
        ...perLineDefaults,
        removeEmptyLines: true,
      };
      expect(minifyText('a\n\n\nb', opts).output).toBe('a\nb');
    });

    it('preserves blank lines when removeEmptyLines is false', () => {
      expect(minifyText('a\n\nb', perLineDefaults).output).toBe('a\n\nb');
    });
  });

  describe('normalizeLineEndings', () => {
    it('normalizes CRLF and CR to LF before minifying (single_line)', () => {
      const r = minifyText('x\r\ny', singleDefaults);
      expect(r.output).toBe('x y');
      expect(r.originalLineCount).toBe(2);
    });

    it('leaves CRLF as-is when normalization is disabled', () => {
      const raw = 'x\r\ny';
      const r = minifyText(raw, {
        ...singleDefaults,
        normalizeLineEndings: false,
      });
      expect(r.output).toBe('x y');
      expect(r.originalLength).toBe(raw.length);
    });
  });

  describe('edge cases', () => {
    it('returns empty output and zero stats for empty string', () => {
      expect(minifyText('', singleDefaults)).toEqual({
        output: '',
        originalLength: 0,
        outputLength: 0,
        originalLineCount: 0,
        outputLineCount: 0,
      });
    });

    it('handles whitespace-only input in single_line as empty string', () => {
      expect(minifyText('  \n\t  ', singleDefaults)).toMatchObject({
        output: '',
        outputLength: 0,
        outputLineCount: 0,
      });
    });
  });
});
