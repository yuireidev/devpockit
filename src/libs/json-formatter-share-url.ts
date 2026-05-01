import type { JsonFormatOptions } from '@/libs/json-formatter';

const PREFIX = 'jf=v1.';

export interface JsonFormatterSharePayload {
  input: string;
  format: JsonFormatOptions['format'];
  indentSize: number;
  sortKeys: JsonFormatOptions['sortKeys'];
}

/** Total hash budget including prefix (some browsers limit URL length). */
const MAX_FRAGMENT_LENGTH = 1800;

function utf8ToBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(bin);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToUtf8(b64url: string): string {
  let padded = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (padded.length % 4 !== 0) {
    padded += '=';
  }
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function encodeJsonFormatterShareFragment(payload: JsonFormatterSharePayload): {
  fragment: string;
} | { error: string } {
  try {
    const json = JSON.stringify(payload);
    const body = utf8ToBase64Url(json);
    const fragment = `${PREFIX}${body}`;
    if (fragment.length > MAX_FRAGMENT_LENGTH) {
      return {
        error: 'Input is too large to fit in a shareable link. Shorten the JSON or copy it manually.',
      };
    }
    return { fragment };
  } catch {
    return { error: 'Could not build share link for this input.' };
  }
}

export function decodeJsonFormatterShareFragment(hash: string): JsonFormatterSharePayload | null {
  const trimmed = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!trimmed.startsWith(PREFIX)) {
    return null;
  }
  const body = trimmed.slice(PREFIX.length);
  if (!body) return null;
  try {
    const json = base64UrlToUtf8(body);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    if (typeof parsed.input !== 'string') return null;
    const format = parsed.format === 'minify' || parsed.format === 'beautify' ? parsed.format : 'beautify';
    const indentSize =
      typeof parsed.indentSize === 'number' && Number.isFinite(parsed.indentSize)
        ? parsed.indentSize
        : 2;
    const sortKeys =
      parsed.sortKeys === 'asc' || parsed.sortKeys === 'desc' || parsed.sortKeys === 'none'
        ? parsed.sortKeys
        : 'none';
    return { input: parsed.input, format, indentSize, sortKeys };
  } catch {
    return null;
  }
}
