import {
  COOKIE_ATTRIBUTE_GLOSSARY,
  HEADER_NAME_GLOSSARY,
  type GlossaryEntry,
} from '@/config/headers-cookies-explainer-config';

export type CookieExplainerTab = 'request' | 'set-cookie';

export interface ParsedHeaderRow {
  name: string;
  value: string;
  glossary?: GlossaryEntry;
  occurrenceIndex: number;
}

export interface ParseHeadersResult {
  rows: ParsedHeaderRow[];
  skippedFirstLine: string | null;
  warnings: string[];
  malformedLines: { lineNumber: number; content: string }[];
}

export interface ParsedRequestCookiePair {
  name: string;
  value: string;
  glossary?: GlossaryEntry;
}

export interface ParsedSetCookieCookie {
  cookieName: string;
  cookieValue: string;
  attributes: Array<{ name: string; value: string; glossary?: GlossaryEntry }>;
}

export interface ParseRequestCookiesResult {
  pairs: ParsedRequestCookiePair[];
  warnings: string[];
}

export interface ParseSetCookiesResult {
  cookies: ParsedSetCookieCookie[];
  warnings: string[];
}

const HTTP_FIRST_LINE_REGEX = /^(?:[A-Za-z]+ \S+ HTTP\/\d(?:\.\d)?|HTTP\/\d(?:\.\d)? \d{3}|HTTP\/\d(?:\.\d)? [A-Za-z0-9 .-]*)$/;

function normalizeHeaderLookupKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/^:/, '');
}

function normalizeCookieAttrKey(attr: string): string {
  return attr.trim().toLowerCase().replace(/^:/, '').replace(/^maxage$/i, 'max-age');
}

export function lookupHeaderGlossary(name: string): GlossaryEntry | undefined {
  return HEADER_NAME_GLOSSARY[normalizeHeaderLookupKey(name)];
}

export function lookupCookieAttributeGlossary(name: string): GlossaryEntry | undefined {
  return COOKIE_ATTRIBUTE_GLOSSARY[normalizeCookieAttrKey(name)];
}

/**
 * Parses a block of colon-separated HTTP header lines.
 * Strips a leading HTTP request or status line if present.
 */
export function parseHttpHeaderBlock(rawInput: string): ParseHeadersResult {
  const warnings: string[] = [];
  const malformedLines: { lineNumber: number; content: string }[] = [];
  const text = rawInput.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  let lines = text.split('\n');

  let skippedFirstLine: string | null = null;
  if (lines.length > 0 && lines[0].trim()) {
    const first = lines[0].trim();
    if (HTTP_FIRST_LINE_REGEX.test(first)) {
      skippedFirstLine = lines[0];
      lines = lines.slice(1);
    }
  }

  const unfolded: string[] = [];
  for (const rawLine of lines) {
    const line = rawLine;
    const isObsoleteFold = (/^[ \t]/).test(line) && unfolded.length > 0;
    if (isObsoleteFold) {
      warnings.push(
        'At least one line uses obsolete header folding (leading space/tab). Combined with previous line.'
      );
      unfolded[unfolded.length - 1] += ` ${line.trimStart()}`;
    } else {
      unfolded.push(line);
    }
  }

  const rows: Omit<ParsedHeaderRow, 'occurrenceIndex'>[] = [];

  unfolded.forEach((line, idx) => {
    const num = skippedFirstLine ? idx + 2 : idx + 1;
    const trimmed = line.trim();
    if (trimmed === '') return;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx <= 0) {
      malformedLines.push({ lineNumber: num, content: trimmed });
      return;
    }

    const name = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    if (!name) {
      malformedLines.push({ lineNumber: num, content: trimmed });
      return;
    }

    rows.push({
      name,
      value,
      glossary: lookupHeaderGlossary(name),
    });
  });

  const nameCounts = new Map<string, number>();
  const withIndex: ParsedHeaderRow[] = rows.map((r) => {
    const key = normalizeHeaderLookupKey(r.name);
    const next = (nameCounts.get(key) ?? 0) + 1;
    nameCounts.set(key, next);
    return { ...r, occurrenceIndex: next };
  });

  const occurrenceByKey = withIndex.reduce<Record<string, number>>((acc, r) => {
    const key = normalizeHeaderLookupKey(r.name);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const knownMultiAllowed = ['set-cookie', 'vary', 'warning', 'via'];
  for (const [k, count] of Object.entries(occurrenceByKey)) {
    if (count > 1 && !knownMultiAllowed.includes(k)) {
      warnings.push(
        `Header "${withIndex.find((x) => normalizeHeaderLookupKey(x.name) === k)?.name}" appears ${count} times; semantics depend on header.`
      );
    }
  }

  return { rows: withIndex, skippedFirstLine, warnings, malformedLines };
}

/** Splits Cookie request header pair string (without "Cookie:" prefix). */
export function parseRequestCookiePairs(rawInput: string): ParseRequestCookiesResult {
  const warnings: string[] = [];
  const text = rawInput.trim();
  if (!text) {
    return { pairs: [], warnings: [] };
  }

  const segments = text.split(';').map((s) => s.trim()).filter(Boolean);
  const pairs: ParsedRequestCookiePair[] = [];

  for (const seg of segments) {
    const eq = seg.indexOf('=');
    if (eq <= 0) {
      warnings.push(`Segment "${seg}" looks like a flag without = or is malformed; skipping.`);
      continue;
    }
    const name = seg.slice(0, eq).trim();
    const value = seg.slice(eq + 1).trim();
    if (!name) {
      warnings.push('Skipped an empty cookie name.');
      continue;
    }
    pairs.push({ name, value });
  }

  return { pairs, warnings };
}

/**
 * RFC 6265-style parse of one Set-Cookie line (cookie-name=cookie-value; attr=val; ...)
 */
export function parseSingleSetCookieLine(line: string): ParsedSetCookieCookie | null {
  const trimmed = line.replace(/^\s*set-cookie:\s*/i, '').trim();
  if (!trimmed) return null;

  const eqIdx = trimmed.indexOf('=');
  if (eqIdx <= 0) return null;

  const cookieName = trimmed.slice(0, eqIdx).trim();
  if (!cookieName) return null;

  let remainder = trimmed.slice(eqIdx + 1);
  let cookieValue = '';

  if (remainder.startsWith('"')) {
    let i = 1;
    let out = '';
    while (i < remainder.length) {
      const ch = remainder[i];
      if (ch === '\\' && i + 1 < remainder.length) {
        out += remainder[i + 1];
        i += 2;
        continue;
      }
      if (ch === '"') {
        i++;
        break;
      }
      out += ch;
      i++;
    }
    cookieValue = out;
    remainder = remainder.slice(i).trimStart();
    if (remainder.startsWith(';')) remainder = remainder.slice(1).trimStart();
  } else {
    const semi = remainder.indexOf(';');
    if (semi === -1) {
      cookieValue = remainder.trim();
      remainder = '';
    } else {
      cookieValue = remainder.slice(0, semi).trim();
      remainder = remainder.slice(semi + 1).trimStart();
    }
  }

  const attributes: Array<{ name: string; value: string; glossary?: GlossaryEntry }> = [];
  for (const part of remainder.split(';')) {
    const p = part.trim();
    if (!p) continue;
    const ae = p.indexOf('=');
    if (ae === -1) {
      const cn = normalizeCookieAttrKey(p);
      attributes.push({
        name: cn,
        value: '',
        glossary: lookupCookieAttributeGlossary(cn),
      });
    } else {
      const an = normalizeCookieAttrKey(p.slice(0, ae).trim());
      const av = p.slice(ae + 1).trim();
      attributes.push({
        name: an,
        value: av,
        glossary: lookupCookieAttributeGlossary(an),
      });
    }
  }

  return { cookieName, cookieValue, attributes };
}

/**
 * Parses newline-separated Set-Cookie lines (optionally prefixed with Set-Cookie:).
 * Warns when a single line might contain comma-separated concatenation (ambiguous with Expires dates).
 */
export function parseSetCookiePaste(rawInput: string): ParseSetCookiesResult {
  const warnings: string[] = [];
  const normalized = rawInput.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const lines = normalized
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const joinedForScan = normalized.replace(/\s+/g, ' ');
  const looksLikeExpiryComma = /\bexpires\s*=/i.test(joinedForScan) &&
    /\b(wed|thu|fri|sat|sun|mon|tue|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(joinedForScan);

  if (!normalized.includes('\n') && normalized.includes(',')) {
    warnings.push(
      'Single-line input contains commas; Expires dates also contain commas, so concatenated Set-Cookie lines can be ambiguous. Prefer pasting newline-separated Set-Cookie lines from DevTools.'
    );
  }

  const cookies: ParsedSetCookieCookie[] = [];

  for (const rawLine of lines) {
    const parsed = parseSingleSetCookieLine(rawLine);
    if (parsed) {
      cookies.push(parsed);
    } else {
      warnings.push(
        `Could not parse cookie line: ${rawLine.slice(0, 80)}${rawLine.length > 80 ? '…' : ''}`
      );
    }
  }

  if (looksLikeExpiryComma && cookies.length <= 1 && cookies[0]?.attributes.some((a) => a.name === 'expires')) {
    warnings.push(
      'If multiple Set-Cookies were merged on one line, attributes may look wrong—use newline-separated lines.'
    );
  }

  return { cookies, warnings };
}
