import {
  parseHttpHeaderBlock,
  parseRequestCookiePairs,
  parseSetCookiePaste,
  parseSingleSetCookieLine,
  lookupHeaderGlossary,
} from '@/libs/headers-cookies-explainer';

describe('parseHttpHeaderBlock', () => {
  it('parses colon-separated headers', () => {
    const raw = ['Host: example.com', 'Accept: application/json'].join('\n');
    const { rows, skippedFirstLine, malformedLines } = parseHttpHeaderBlock(raw);
    expect(skippedFirstLine).toBeNull();
    expect(malformedLines).toHaveLength(0);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      name: 'Host',
      value: 'example.com',
      occurrenceIndex: 1,
    });
    expect(rows[1].name).toBe('Accept');
    expect(rows[1].glossary?.summary).toMatch(/acceptable response content types/i);
  });

  it('strips a leading GET request line', () => {
    const raw =
      `GET /x HTTP/1.1\r\n` + `Host: a.test\r\n` + `Authorization: Bearer x\r\n`;
    const result = parseHttpHeaderBlock(raw);
    expect(result.skippedFirstLine).toBe('GET /x HTTP/1.1');
    expect(result.rows.map((r) => r.name)).toEqual(['Host', 'Authorization']);
  });

  it('strips a leading HTTP response status line', () => {
    const raw =
      `HTTP/1.1 200 OK\r\n` +
      `Content-Type: application/json\r\n`;
    const result = parseHttpHeaderBlock(raw);
    expect(result.skippedFirstLine).toContain('HTTP/1.1 200 OK');
    expect(result.rows[0]).toMatchObject({ name: 'Content-Type', occurrenceIndex: 1 });
    expect(result.rows[0].glossary?.category).toBe('content');
  });

  it('reports malformed lines without colon', () => {
    const result = parseHttpHeaderBlock('Host: ok\nnot-a-header-line');
    expect(result.rows).toHaveLength(1);
    expect(result.malformedLines.length).toBeGreaterThanOrEqual(1);
  });

  it('supports obsolete folded lines with a warning', () => {
    const raw = ['Host: ex.com', ' continued-value'].join('\n');
    const result = parseHttpHeaderBlock(raw);
    expect(result.warnings.some((w) => /folding/i.test(w))).toBe(true);
    expect(result.rows[0].value).toContain(' continued-value');
  });

  it('warns on duplicate uncommon headers', () => {
    const raw = 'X-Foo: 1\nX-Foo: 2';
    const { warnings } = parseHttpHeaderBlock(raw);
    expect(warnings.some((w) => /appears 2 times/i.test(w))).toBe(true);
  });

  it('does not warn for repeated Set-Cookie', () => {
    const raw = 'Set-Cookie: a=1\nSet-Cookie: b=2';
    const { warnings } = parseHttpHeaderBlock(raw);
    expect(warnings.some((w) => /Set-Cookie.*appears 2/i.test(w))).toBe(false);
  });
});

describe('parseRequestCookiePairs', () => {
  it('parses semicolon-separated name=value pairs', () => {
    const { pairs, warnings } = parseRequestCookiePairs('sid=abc; lang=en-US');
    expect(warnings).toHaveLength(0);
    expect(pairs).toEqual([
      { name: 'sid', value: 'abc' },
      { name: 'lang', value: 'en-US' },
    ]);
  });

  it('warns on flag segments without equals', () => {
    const { pairs, warnings } = parseRequestCookiePairs('good=ok; stray');
    expect(pairs).toHaveLength(1);
    expect(warnings.some((w) => /stray/i.test(w))).toBe(true);
  });

  it('handles values containing equals signs', () => {
    const { pairs } = parseRequestCookiePairs('t=a=b');
    expect(pairs).toEqual([{ name: 't', value: 'a=b' }]);
  });
});

describe('parseSingleSetCookieLine', () => {
  it('parses attributes and glossary', () => {
    const parsed = parseSingleSetCookieLine(
      'Set-Cookie: session=x; Path=/; HttpOnly; Secure; SameSite=Lax'
    );
    expect(parsed).not.toBeNull();
    expect(parsed!.cookieName).toBe('session');
    expect(parsed!.cookieValue).toBe('x');
    expect(parsed!.attributes.map((a) => a.name)).toEqual([
      'path',
      'httponly',
      'secure',
      'samesite',
    ]);
    expect(parsed!.attributes.find((a) => a.name === 'samesite')?.glossary?.summary).toMatch(
      /cross-site/i
    );
  });

  it('parses quoted cookie values', () => {
    const parsed = parseSingleSetCookieLine(`id="a\\\"b"; Path=/`);
    expect(parsed!.cookieValue).toBe('a"b');
    expect(parsed!.attributes[0]?.name).toBe('path');
  });
});

describe('parseSetCookiePaste', () => {
  it('parses newline-separated cookies', () => {
    const { cookies } = parseSetCookiePaste(
      [`Set-Cookie: a=1; Path=/`, `Set-Cookie: b=two; Secure`].join('\n')
    );
    expect(cookies).toHaveLength(2);
    expect(cookies[1].cookieName).toBe('b');
    expect(cookies[1].attributes.some((x) => x.name === 'secure')).toBe(true);
  });

  it('warns on single-line input with commas', () => {
    const { warnings } = parseSetCookiePaste('a=b; Expires=Wed, 21 Oct 2015 07:28:00 GMT');
    expect(warnings.some((w) => /comma/i.test(w))).toBe(true);
  });

  it('reports unparseable lines', () => {
    const { cookies, warnings } = parseSetCookiePaste('%%%');
    expect(cookies).toHaveLength(0);
    expect(warnings.some((w) => /could not parse/i.test(w))).toBe(true);
  });
});

describe('lookupHeaderGlossary', () => {
  it('is case insensitive', () => {
    expect(lookupHeaderGlossary('HOST')?.summary).toBeTruthy();
    expect(lookupHeaderGlossary('CACHE-CONTROL')).toBeTruthy();
  });
});
