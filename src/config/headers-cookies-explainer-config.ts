/** Category labels shown as badges alongside glossary entries */
export type HeaderCookieGlossaryCategory =
  | 'security'
  | 'caching'
  | 'cors'
  | 'auth'
  | 'privacy'
  | 'content'
  | 'general';

export interface GlossaryEntry {
  summary: string;
  detail: string;
  category: HeaderCookieGlossaryCategory;
}

/** Lowercase HTTP header names → glossary (lookup with normalizeHeaderNameKey) */
export const HEADER_NAME_GLOSSARY: Record<string, GlossaryEntry> = {
  accept: {
    summary: 'Advertises acceptable response content types.',
    detail:
      'The client tells the server which media types it can understand. Servers may use this for content negotiation (e.g. JSON vs HTML).',
    category: 'content',
  },
  'accept-encoding': {
    summary: 'Advertises acceptable compression codings.',
    detail:
      'Common values include gzip, br, deflate. The server chooses one encoder and responds with Content-Encoding.',
    category: 'content',
  },
  'accept-language': {
    summary: 'Preferred natural languages for the response.',
    detail:
      'Used for localization; values are RFC 7231 language ranges with optional quality weights (q=).',
    category: 'content',
  },
  authorization: {
    summary: 'Credentials for authenticating the client.',
    detail:
      'Typically `Bearer <token>`, `Basic <base64>`, or scheme-specific syntax. Sensitive: treat as secret.',
    category: 'auth',
  },
  'cache-control': {
    summary: 'Directives for caches (browser and intermediaries).',
    detail:
      'Controls freshness and revalidation: max-age, no-store, no-cache, private, public, s-maxage, immutable, stale-while-revalidate, etc.',
    category: 'caching',
  },
  connection: {
    summary: 'Per-hop connection management options.',
    detail:
      'HTTP/1.1 uses keep-alive vs close; hop-by-hop headers may be listed. Less relevant for HTTP/2+.',
    category: 'general',
  },
  'content-encoding': {
    summary: 'How the payload body is compressed or transformed.',
    detail:
      'Examples: gzip, br. The recipient decodes before interpreting Content-Type.',
    category: 'content',
  },
  'content-length': {
    summary: 'Size of the message body in bytes.',
    detail:
      'Required for HTTP/1.1 bodies unless chunked transfer-encoding is used. Must match actual body length.',
    category: 'content',
  },
  'content-security-policy': {
    summary: 'Restricts loads and execution to mitigate XSS.',
    detail:
      'Policy directives like default-src, script-src define allowed sources for scripts, styles, frames, etc.',
    category: 'security',
  },
  'content-type': {
    summary: 'Media type (and charset) of the body.',
    detail:
      'Examples: application/json; charset=UTF-8, text/html. Drives how clients parse the response.',
    category: 'content',
  },
  cookie: {
    summary: 'State sent by the client from prior Set-Cookie responses.',
    detail:
      'Semicolon-separated name=value pairs. Sent only to matching origins per cookie rules; still sensitive.',
    category: 'privacy',
  },
  date: {
    summary: 'When the message was originated.',
    detail: 'RFC 7231 HTTP-date; used by caches and intermediaries.',
    category: 'general',
  },
  etag: {
    summary: 'Opaque validator for conditional requests.',
    detail:
      'Client sends If-None-Match on repeat requests; server returns 304 if unchanged. Strong vs weak validators differ in semantics.',
    category: 'caching',
  },
  expect: {
    summary: 'Expectations requiring server acknowledgement.',
    detail:
      'Rare in browsers; sometimes `100-continue` for large uploads. Servers may reply 417 Expectation Failed.',
    category: 'general',
  },
  expires: {
    summary: 'HTTP/1.0-style response expiration time.',
    detail:
      'Largely superseded by Cache-Control for HTTP/1.1 caches, but still used for interoperability.',
    category: 'caching',
  },
  host: {
    summary: 'Target host and optional port.',
    detail:
      'Mandatory in HTTP/1.1. Drives routing and effective request URL; critical for shared hosting and HTTPS.',
    category: 'general',
  },
  origin: {
    summary: 'Originating site for CORS-enabled requests.',
    detail:
      'Browser sends scheme + host + port (no path). Servers use it with Access-Control-* for permission checks.',
    category: 'cors',
  },
  pragma: {
    summary: 'Legacy cache directives.',
    detail:
      'HTTP/1.0 `Pragma: no-cache` is not a reliable substitute for Cache-Control no-store/no-cache.',
    category: 'caching',
  },
  referer: {
    summary: 'URL of the linking document.',
    detail:
      'Typo fixed in RFC: Referer header. Privacy-sensitive; stripped or shortened by browsers and Referrer-Policy.',
    category: 'privacy',
  },
  'referrer-policy': {
    summary: 'Controls Referer granularity on navigations/subresources.',
    detail:
      'Values like strict-origin-when-cross-origin limit data leaked in the Referer header.',
    category: 'privacy',
  },
  range: {
    summary: 'Request partial content.',
    detail:
      'Used for resumed downloads or media seeking; pairs with 206 Partial Content.',
    category: 'content',
  },
  'sec-fetch-dest': {
    summary: 'Fetch metadata: destination.',
    detail: 'Browser-added hint about how the resource will be used (document, image, iframe, …).',
    category: 'security',
  },
  'sec-fetch-mode': {
    summary: 'Fetch metadata: request mode.',
    detail: 'e.g. navigate, cors, no-cors, same-origin. Helps servers differentiate entry types.',
    category: 'security',
  },
  'sec-fetch-site': {
    summary: 'Fetch metadata: same-site relationship.',
    detail: 'Cross-site vs same-origin vs none (user navigation). Helps CSRF defenses.',
    category: 'security',
  },
  server: {
    summary: 'Identifies origin server software.',
    detail:
      'Informational; fingerprinting detail—often minimized or standardized in hardened deployments.',
    category: 'general',
  },
  'set-cookie': {
    summary: 'Instructs client to store a cookie.',
    detail:
      'May appear multiple times. Attributes (Path, Domain, Secure, HttpOnly, SameSite) constrain scope and delivery.',
    category: 'privacy',
  },
  'strict-transport-security': {
    summary: 'Forces HTTPS for a duration (HSTS).',
    detail:
      'includeSubDomains and preload tighten policy. Misconfigured max-age can lock users out if TLS breaks.',
    category: 'security',
  },
  'transfer-encoding': {
    summary: 'How the body is chunked for HTTP/1.1.',
    detail:
      'Chunked encoding separates body framing from Content-Length. Hop-by-hop; not duplicated on HTTP/2.',
    category: 'content',
  },
  'user-agent': {
    summary: 'Client software identifier string.',
    detail:
      'Used for telemetry and compatibility hints; spoofable—do not rely on it for authentication.',
    category: 'general',
  },
  vary: {
    summary: 'Headers that selective responses depend on.',
    detail:
      'Caches store separate entries per distinct value set of listed headers—important with compression and language.',
    category: 'caching',
  },
  via: {
    summary: 'Proxy chain trace.',
    detail: 'Adds each intermediary; useful debugging but exposes topology.',
    category: 'general',
  },
  'www-authenticate': {
    summary: 'Challenges clients for credentials (401).',
    detail:
      'Contains auth scheme (Basic, Bearer) and realm. Paired with Authorization on subsequent requests.',
    category: 'auth',
  },
  'x-content-type-options': {
    summary: 'Disables MIME sniffing.',
    detail:
      'nosniff helps prevent browsers from interpreting non-script types as executable content.',
    category: 'security',
  },
  'x-forwarded-for': {
    summary: 'De facto client chain through proxies.',
    detail:
      'Appended by proxies; easily forged at the edge if not sanitized—do not trust as sole proof of identity.',
    category: 'general',
  },
  'access-control-allow-origin': {
    summary: 'CORS allowed origin response.',
    detail:
      '`*` vs specific origins; credentials require explicit origin, not wildcard. Browser enforces.',
    category: 'cors',
  },
  'access-control-allow-credentials': {
    summary: 'Whether credentialed CORS reads are permitted.',
    detail:
      'When true, allows cookies/auth on cross-origin reads if other CORS checks pass.',
    category: 'cors',
  },
  'access-control-allow-methods': {
    summary: 'CORS allowed HTTP methods.',
    detail: 'Advertised with preflight (OPTIONS); actual method still subject to Same-Origin semantics.',
    category: 'cors',
  },
  'access-control-allow-headers': {
    summary: 'CORS headers allowed from the client.',
    detail: 'Used in response to Access-Control-Request-Headers during preflight.',
    category: 'cors',
  },
  forwarded: {
    summary: 'Standardized proxy-derived request fields.',
    detail:
      'Canonical alternative to informal X-Forwarded-*; still must be validated at trusted edges.',
    category: 'general',
  },
  'if-none-match': {
    summary: 'Conditional GET using ETags.',
    detail:
      'If ETag matches, server responds 304 Not Modified without a body.',
    category: 'caching',
  },
  'if-modified-since': {
    summary: 'Conditional GET using modification time.',
    detail: 'Older than ETag-based validators; caches and servers combine rules per RFC.',
    category: 'caching',
  },
  'retry-after': {
    summary: 'How long to wait before retry.',
    detail: 'Used with 503, 429, or certain redirects; delta-seconds or HTTP-date.',
    category: 'general',
  },
};

/** Lowercase Set-Cookie attribute names */
export const COOKIE_ATTRIBUTE_GLOSSARY: Record<string, GlossaryEntry> = {
  domain: {
    summary: 'Which hosts may receive this cookie.',
    detail:
      'Broader domains mean more origins get the cookie. Subdomains obey public suffix rules.',
    category: 'privacy',
  },
  expires: {
    summary: 'Absolute expiration (legacy attribute).',
    detail:
      'HTTP-date format. Prefer Max-Age when both set; interplay is specified in RFC 6265bis.',
    category: 'privacy',
  },
  httponly: {
    summary: 'Not exposed to JavaScript (document.cookie).',
    detail:
      'Mitigates many XSS steal attempts—does not replace server-side sanitization.',
    category: 'security',
  },
  'max-age': {
    summary: 'Seconds until cookie expiry from now.',
    detail:
      'Relative lifetime; clearer than Expires across time zones.',
    category: 'privacy',
  },
  partitioned: {
    summary: '(CHIPS) Separates embedded third-party jar.',
    detail:
      'Keyed per top-level site; limits cross-site tracking while allowing embedded use.',
    category: 'privacy',
  },
  path: {
    summary: 'URL path prefix where cookie is sent.',
    detail: 'Default often `/`; narrower paths isolate cookies to subtrees.',
    category: 'privacy',
  },
  priority: {
    summary: 'Browser eviction hint (experimental).',
    detail: 'Values like Low, Medium, High—not standardized everywhere.',
    category: 'general',
  },
  samesite: {
    summary: 'Cross-site inclusion policy.',
    detail:
      'Strict, Lax, or None (+ Secure). Controls cross-site navigations/subresources vs defaults.',
    category: 'security',
  },
  secure: {
    summary: 'Send only over HTTPS.',
    detail:
      'Prevents plaintext transport exposure; paired with HTTPS-only deployments.',
    category: 'security',
  },
};

export const HEADERS_COOKIE_EXAMPLES = {
  headRequest:
    `GET /dashboard HTTP/1.1\r\n` +
    `Host: api.example.com\r\n` +
    `Accept: application/json\r\n` +
    `Authorization: Bearer eyJhbGciOiJIUzI1NiJ9\r\n` +
    `Cache-Control: no-cache\r\n` +
    `User-Agent: DevPockit/1.0\r\n`,

  responseWithSetCookie:
    `HTTP/1.1 200 OK\r\n` +
    `Content-Type: application/json\r\n` +
    `Cache-Control: private, max-age=0\r\n` +
    `Set-Cookie: session=abc123; Path=/; HttpOnly; Secure; SameSite=Lax\r\n`,

  requestCookies:
    '_ga=GA1.1.9; sidebar=collapsed; theme=dark',

  setCookiesMultiline:
    `Set-Cookie: id=u1; Path=/; HttpOnly\r\n` +
    `Set-Cookie: prefs=compact; Path=/; Secure; SameSite=None\r\n`,
} as const;
