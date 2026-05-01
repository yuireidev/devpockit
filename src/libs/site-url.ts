/**
 * Build absolute URLs for static export (supports NEXT_PUBLIC_BASE_URL + BASE_PATH).
 */

export function getSiteOrigin(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || 'https://devpockit.hypkey.com').replace(/\/$/, '');
}

export function getPublicBasePathPrefix(): string {
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (!bp) return '';
  const trimmed = bp.replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}` : '';
}

/**
 * @param path Absolute path starting with `/` (e.g. `/tools/formatters/json-formatter/`).
 */
export function absoluteSiteUrl(path: string): string {
  const origin = getSiteOrigin();
  const base = getPublicBasePathPrefix();
  const p = path.startsWith('/') ? path : `/${path}`;
  const combined = base ? `${base}${p}` : p;
  const withSlash = combined.endsWith('/') ? combined : `${combined}/`;
  return `${origin}${withSlash}`;
}

/** Same as origin + base path + path, without forcing a trailing slash (for assets like `/og-image.png`). */
export function absoluteAssetUrl(path: string): string {
  const origin = getSiteOrigin();
  const base = getPublicBasePathPrefix();
  const p = path.startsWith('/') ? path : `/${path}`;
  const combined = base ? `${base}${p}` : p;
  return `${origin}${combined}`;
}
