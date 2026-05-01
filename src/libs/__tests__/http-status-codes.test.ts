import {
  filterHttpStatuses,
  getHttpStatusDetailedDescription,
  getHttpStatusLineExample,
  getHttpStatusTroubleshooting,
  HTTP_STATUS_ENTRIES,
  httpStatusProblemsCoversCheatsheet,
} from '../http-status-codes';

describe('http-status-codes', () => {
  it('exposes a non-empty static list', () => {
    expect(HTTP_STATUS_ENTRIES.length).toBeGreaterThan(40);
  });

  it('filters by code substring', () => {
    const r = filterHttpStatuses('404', 'all');
    expect(r.some((e) => e.code === 404)).toBe(true);
    expect(r.every((e) => e.code.toString().includes('404'))).toBe(true);
  });

  it('filters by name or summary', () => {
    const tee = filterHttpStatuses('teapot', 'all');
    expect(tee.some((e) => e.code === 418)).toBe(true);
  });

  it('respects category filter', () => {
    const only2xx = filterHttpStatuses('', '2xx');
    expect(only2xx.length).toBeGreaterThan(5);
    expect(only2xx.every((e) => e.category === '2xx')).toBe(true);
  });

  it('provides extended troubleshooting (no RFC/IANA footer) for dialogs', () => {
    expect(httpStatusProblemsCoversCheatsheet()).toBe(true);

    const entry = HTTP_STATUS_ENTRIES.find((e) => e.code === 404);
    expect(entry).toBeDefined();
    if (!entry) return;
    expect(getHttpStatusLineExample(entry)).toContain('404');
    expect(getHttpStatusLineExample(entry)).toContain('Not Found');

    const detail = getHttpStatusDetailedDescription(entry);
    expect(detail).toContain(entry.summary);
    expect(detail).not.toMatch(/RFC 9110|IANA HTTP Status Code Registry/i);

    const problems = getHttpStatusTroubleshooting(entry);
    expect(problems.length).toBeGreaterThan(80);
    expect(problems.toLowerCase()).toMatch(/route|proxy|deployment/i);
  });
});
