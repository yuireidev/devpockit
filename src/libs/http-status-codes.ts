export type HttpStatusCategory = '1xx' | '2xx' | '3xx' | '4xx' | '5xx';

export interface HttpStatusEntry {
  code: number;
  /** Official or common reason phrase */
  name: string;
  summary: string;
  category: HttpStatusCategory;
}

/**
 * Common HTTP status codes with short descriptions for the cheatsheet table.
 */
export const HTTP_STATUS_ENTRIES: HttpStatusEntry[] = [
  { code: 100, name: 'Continue', summary: 'Client should continue with the request.', category: '1xx' },
  { code: 101, name: 'Switching Protocols', summary: 'Server is switching protocols per Upgrade header.', category: '1xx' },
  { code: 102, name: 'Processing', summary: 'Request received; WebDAV; server is processing.', category: '1xx' },
  { code: 103, name: 'Early Hints', summary: 'HMR-preload hints while the final response is prepared.', category: '1xx' },

  { code: 200, name: 'OK', summary: 'Request succeeded.', category: '2xx' },
  { code: 201, name: 'Created', summary: 'Resource created; often returns Location.', category: '2xx' },
  { code: 202, name: 'Accepted', summary: 'Accepted for processing; processing not complete.', category: '2xx' },
  {
    code: 203,
    name: 'Non-Authoritative Information',
    summary: 'Success; payload from a transforming proxy.',
    category: '2xx',
  },
  { code: 204, name: 'No Content', summary: 'Success with no payload body.', category: '2xx' },
  { code: 205, name: 'Reset Content', summary: 'Success; client should reset document UI.', category: '2xx' },
  { code: 206, name: 'Partial Content', summary: 'Range request fulfilled with partial representation.', category: '2xx' },
  { code: 207, name: 'Multi-Status', summary: 'WebDAV; multiple distinct status codes in body.', category: '2xx' },
  { code: 208, name: 'Already Reported', summary: 'WebDAV; avoids repeating members inside a propstat.', category: '2xx' },
  { code: 226, name: 'IM Used', summary: 'Instance manipulation applied inside response.', category: '2xx' },

  { code: 300, name: 'Multiple Choices', summary: 'Several representations; Link header may guide choice.', category: '3xx' },
  { code: 301, name: 'Moved Permanently', summary: 'Target URI permanently changed.', category: '3xx' },
  { code: 302, name: 'Found', summary: 'Temporary redirect (historically “Moved Temporarily”).', category: '3xx' },
  { code: 303, name: 'See Other', summary: 'GET the resource at another URI.', category: '3xx' },
  { code: 304, name: 'Not Modified', summary: 'Cached representation still valid.', category: '3xx' },
  { code: 305, name: 'Use Proxy', summary: 'Deprecated in HTTP/1.1; deprecated proxy redirection.', category: '3xx' },
  { code: 307, name: 'Temporary Redirect', summary: 'Same method and body on the redirected URI.', category: '3xx' },
  { code: 308, name: 'Permanent Redirect', summary: 'Permanent redirect preserving method and body.', category: '3xx' },

  { code: 400, name: 'Bad Request', summary: 'Malformed syntax or validation failure.', category: '4xx' },
  { code: 401, name: 'Unauthorized', summary: 'Authentication required (WWW-Authenticate).', category: '4xx' },
  { code: 402, name: 'Payment Required', summary: 'Reserved for future payment schemes.', category: '4xx' },
  { code: 403, name: 'Forbidden', summary: 'Understood request but refusal to authorize.', category: '4xx' },
  { code: 404, name: 'Not Found', summary: 'No matching resource.', category: '4xx' },
  { code: 405, name: 'Method Not Allowed', summary: 'Method not supported for resource.', category: '4xx' },
  { code: 406, name: 'Not Acceptable', summary: 'No representation matches Accept negotiation.', category: '4xx' },
  { code: 407, name: 'Proxy Authentication Required', summary: 'Proxy demands authentication.', category: '4xx' },
  { code: 408, name: 'Request Timeout', summary: 'Server waited too long for a complete request.', category: '4xx' },
  { code: 409, name: 'Conflict', summary: 'Conflict with current resource state.', category: '4xx' },
  { code: 410, name: 'Gone', summary: 'Resource once existed and is intentionally gone.', category: '4xx' },
  { code: 411, name: 'Length Required', summary: 'Content-Length or Transfer-Encoding needed.', category: '4xx' },
  { code: 412, name: 'Precondition Failed', summary: 'Precondition headers failed on evaluation.', category: '4xx' },
  { code: 413, name: 'Payload Too Large', summary: 'Request body exceeds server limits.', category: '4xx' },
  { code: 414, name: 'URI Too Long', summary: 'Request target URI exceeds limits.', category: '4xx' },
  { code: 415, name: 'Unsupported Media Type', summary: 'Format not supported by server.', category: '4xx' },
  { code: 416, name: 'Range Not Satisfiable', summary: 'Range header cannot be fulfilled.', category: '4xx' },
  { code: 417, name: 'Expectation Failed', summary: 'Expect header condition could not be met.', category: '4xx' },
  { code: 418, name: "I'm a teapot", summary: 'Easter egg (RFC 2324); not a serious protocol code.', category: '4xx' },
  { code: 421, name: 'Misdirected Request', summary: 'Request not intended for this origin/server.', category: '4xx' },
  { code: 422, name: 'Unprocessable Entity', summary: 'Semantic errors; common in APIs for validation.', category: '4xx' },
  { code: 423, name: 'Locked', summary: 'WebDAV; resource is locked.', category: '4xx' },
  { code: 424, name: 'Failed Dependency', summary: 'WebDAV; action failed due to another failed request.', category: '4xx' },
  { code: 425, name: 'Too Early', summary: 'Replay risk; early data rejected.', category: '4xx' },
  { code: 426, name: 'Upgrade Required', summary: 'Switch required protocol (Upgrade header).', category: '4xx' },
  { code: 428, name: 'Precondition Required', summary: 'Conditional headers required to avoid conflicts.', category: '4xx' },
  { code: 429, name: 'Too Many Requests', summary: 'Rate limiting; Retry-After may be present.', category: '4xx' },
  { code: 431, name: 'Request Header Fields Too Large', summary: 'Headers overall too large or single field too big.', category: '4xx' },
  {
    code: 451,
    name: 'Unavailable For Legal Reasons',
    summary: 'Blocked for legal or censorship reasons.',
    category: '4xx',
  },

  { code: 500, name: 'Internal Server Error', summary: 'Unexpected server condition.', category: '5xx' },
  { code: 501, name: 'Not Implemented', summary: 'Server does not support the functionality.', category: '5xx' },
  { code: 502, name: 'Bad Gateway', summary: 'Invalid response from upstream gateway.', category: '5xx' },
  { code: 503, name: 'Service Unavailable', summary: 'Temporary overload or maintenance.', category: '5xx' },
  { code: 504, name: 'Gateway Timeout', summary: 'Upstream did not respond in time.', category: '5xx' },
  { code: 505, name: 'HTTP Version Not Supported', summary: 'HTTP version not supported.', category: '5xx' },
  { code: 506, name: 'Variant Also Negotiates', summary: 'Transparent negotiation misconfiguration.', category: '5xx' },
  { code: 507, name: 'Insufficient Storage', summary: 'WebDAV; cannot store representation.', category: '5xx' },
  { code: 508, name: 'Loop Detected', summary: 'WebDAV; infinite loop in processing.', category: '5xx' },
  { code: 510, name: 'Not Extended', summary: 'Further extensions required for request.', category: '5xx' },
  {
    code: 511,
    name: 'Network Authentication Required',
    summary: 'Client must authenticate to gain network access.',
    category: '5xx',
  },
];

export type HttpStatusCategoryFilter = HttpStatusCategory | 'all';

/**
 * Typical pitfalls, misunderstandings, and debugging angles for modal detail (not normative specs).
 */
const COMMON_PROBLEMS_AND_CAUSES: Record<number, string> = {
  100:
    'Often tied to Expect: 100-continue uploads. Typical issues: proxies or gateways swallowing intermediates, clients that never resume after Continue, duplicated Expect headers, or servers that mishandle chunked bodies.',
  101:
    'Common with WebSockets or negotiated upgrades. Typical causes: missing or mismatched Upgrade/Connection headers, TLS termination changing the handshake path, proxies blocking Upgrade, ALPN negotiated HTTP/2 when the client expects HTTP/1 upgrade, or websocket origin checks failing.',
  102:
    'WebDAV/long requests. Typical issues: callers timing out assuming hung requests, proxies closing idle intermediates before the real response completes, poor progress reporting in clients.',
  103:
    'Early Hints and preload pushes. Typical problems: duplicate resource loading when hints and HTML both declare scripts, CSP blocking hinted URLs, clients or CDNs that ignore 103 entirely, mismatched preload priorities.',
  200:
    'Usually success. Debugging pain when clients expect 201 after POST, when APIs return bodies that violate schemas, stale cache headers masking fresh data, or success returned for partial/failed workflows.',
  201:
    'Created resources. Typical issues: missing Location (clients cannot discover URIs), double-submit creating duplicates without idempotency keys, transactional rollbacks returning 201 without cleanup, mismatched slug vs canonical URL.',
  202:
    'Async workflows. Typical problems: polling storms, nowhere to correlate job IDs, abandoned jobs appearing “accepted” forever, clients treating 202 like 200 without checking status URLs.',
  203:
    'Transformed payload from a proxy. Typical confusion: validators and ETags from the intermediary not matching the origin; caches treating merged content incorrectly; CDN minification stripping fields clients rely on.',
  204:
    'No body successes. Typical client bugs: parsers requiring JSON on success, XMLHttpRequest/onload handlers crashing on empty body, Axios interceptors misclassifying legitimate empty deletes.',
  205:
    'Rare in APIs. Typical issues: misunderstanding as “reload page” when only document view should reset; clients refetch losing SPA state unnecessarily.',
  206:
    'Partial content downloads. Typical problems: mismatched Range units, requesting ranges past Content-Length, media players looping on overlapping ranges, cache corruption combining partial shards.',
  207:
    'WebDAV multi-status. Typical pain: callers reading only outer HTTP status and ignoring per-member failures in XML/JSON bodies, inconsistent rollback after partial DAV success.',
  208:
    'WebDAV “already reported” to shrink responses. Debugging difficulty when clients omit duplicate bindings and become out of sync with server propstat aggregates.',
  226:
    'Instance manipulations deltas. Typical issues: patching wrong base representation, mishandling IM headers so deltas apply to stale content, intermediary stripping IM metadata.',
  300:
    'Multiple representations. Typical issues: ambiguous default without Link rel=alternate, bots choosing wrong MIME type, caches storing the wrong negotiated variant.',
  301:
    'Permanent redirects. Typical problems: typo’d target URI baked into SEO forever, clients not updating bookmarks despite 301, mixed HTTP→HTTPS redirects creating redirect loops.',
  302:
    'Temporary redirect historically abused. Typical bugs: caches treating temporary like permanent, POST turning into unintended GET on legacy stacks, intermediaries rewriting Location.',
  303:
    'See Other GET follows. Typical issues: AJAX losing POST semantics after POST+303, forgetting to rebuild query parameters on subsequent GET.',
  304:
    'Not modified caching. Debugging traps: validators never changing so clients stay stale forever, clock skew breaking If-Modified-Since, CDN ignoring Vary breaking negotiation.',
  305:
    'Deprecated directive. Encountering this usually signals legacy infra or captive misconfiguration behind old proxies—not something to emulate in modern apps.',
  307:
    'Temporary redirect with method preservation. Typical problems: middleware auto-following redirects and duplicating POST bodies, OAuth redirects breaking when method flips unintentionally.',
  308:
    'Permanent redirect with method preservation. Similar to 307 but caches update longer—wrong destination poisons crawling and API clients similarly to broken 301 chains.',
  400:
    'Bad request framing or validation. Usual suspects: malformed JSON/XML, mismatched Content-Type charset, duplicated fields, proxies corrupting chunked encoding, max header count limits exceeded in reverse proxies.',
  401:
    'Authentication required vs authorization. Typical mix-ups with 403 when tokens are stale or scopes wrong—missing/expired Bearer vs truly blocked users. Omitting WWW-Authenticate confuses frameworks and proxies.',
  402:
    'Reserved and rarely standardized. Seeing it usually means bespoke billing flows or placeholder APIs—integrations break when expectations drift without documentation.',
  403:
    'Forbidden after identity may be known. Typical causes: IP/geo allowlists, missing RBAC role, filesystem permissions in static hosts, accidentally blocking bots that your SSR depends on.',
  404:
    'No route or missing resource—also returned intentionally to obscure existence of private resources. Usual suspects: typo paths, SPA servers not configured with fallback routing, ingress path prefixes stripped wrong, stale deployment without the new routes.',
  405:
    'Method unsupported. Frequently misconfigured OPTIONS for CORS, disabled PATCH/DELETE in reverse proxies, or APIs returning 405 without Allow header so tooling cannot heal itself.',
  406:
    'Content negotiation unhappy. Typical issues: unrealistic Accept:*/* assumptions, serializers missing for requested MIME, GraphQL gateways expecting JSON.',
  407:
    'Proxy authentication. Common in captive corporate networks—the app works direct but breaks behind PAC with missing Proxy-Authorization on clients not configured.',
  408:
    'Server gave up waiting. Often slow mobile uploads or half-open HTTP/2 streams; alternatively aggressive load balancer timeouts while app still computes.',
  409:
    'State conflict—optimistic concurrency failures, uniqueness violations, simultaneous edits hitting the same aggregate, workflow states that disallow the transition.',
  410:
    'Intentionally removed. Helps audit trails vs 404. Problems when CDNs incorrectly cache “gone”, or caches never forget when content returns under a reuse policy.',
  411:
    'Length required—some origins reject chunked bodies without explicit sizing. Debugging reverse proxies rewriting Transfer-Encoding inconsistently.',
  412:
    'Preconditions failed—If-Match/If-Unmodified-Since losing races during frequent updates, retries duplicating conflicting writes if not idempotent.',
  413:
    'Payload too large. Often nginx client_max_body_size, API gateway quotas, multipart parser limits far below user expectation for media uploads.',
  414:
    'URI oversize—GET query strings exploding from filters, misplaced auth tokens in URLs, SSRF gateways limiting path lengths.',
  415:
    'Unsupported Media Type—sending multipart when API expects JSON, missing charset, multipart boundary mismatch, PATCH with wrong subtype.',
  416:
    'Range nonsense—byte ranges exceeding file sizes, mismatched Accept-Ranges semantics, CDN edge missing full object.',
  417:
    'Expect header mishandling—often intermediaries rewriting Expect: 100-continue or forbidding chunked trailers.',
  418:
    'Not meaningful for diagnostics—almost always novelty. If unexpected, hunt for buggy middleware injecting RFC 2324 jokes rather than infra failure.',
  421:
    'Misdirected request—HTTP/2 routing issues: TLS SNI not matching `:authority`, multiplexed connections routed to wrong vhost behind shared IPs.',
  422:
    'Semantic validation failures with syntactically valid JSON—schema mismatch, regex field errors, inconsistent cross-field constraints. Frontend/backend contract drift.',
  423:
    'WebDAV locking—exclusive locks left behind after crashed editors, timeouts not releasing leases, collaborative tooling deadlocks.',
  424:
    'Failed dependency chaining—compound WebDAV failures where diagnosing root cause buried under dependent operation errors.',
  425:
    'Too Early—replay-related rejection of 0‑RTT or early handshake data until TLS/session replays ruled out.',
  426:
    'Upgrade required—old cleartext or HTTP versions blocked; clients must retry with TLS/WebSocket handshake after inspecting Upgrade guidance.',
  428:
    'Precondition Required—lost race protection forcing If-Match/If-Unmodified headers; concurrency bugs if clients ignore mandated preconditions.',
  429:
    'Rate limiting. Common failure modes: retry storms multiplying load, scraping without exponential backoff, shared egress IP tripping quotas for many users.',
  431:
    'Header fields oversized—cookies bloated with SSO claims, gigantic Authorization tokens, proxies aggregating duplicated headers hitting limits.',
  451:
    'Legal/policy blocks geographies or jurisdictions—tests pass locally then fail overseas; misunderstanding compliance vs censorship vs DNS mistakes.',
  500:
    'Unhandled exceptions, corrupted configuration, datastore outages, deadlock threads, mismatched deployments (schema vs code). Always inspect server-side stack traces/logs—never masked by generic mobile error UI.',
  501:
    'Feature/method deliberately absent—calling DELETE on read-only gateways, OPTIONS blocked, HTTP/3 disabled while client upgrades.',
  502:
    'Bad gateway upstream. Classic causes: pod crash loops, RDS connection exhaustion, stale DNS to dead nodes, TLS handshake mismatches between proxy and upstream, chunked encoding breakage through HAProxy/nginx.',
  503:
    'Service unavailable/overloaded/draining instances. Troubleshoot readiness probes flipping, autoscaling delays, noisy neighbors saturating CPUs, deliberate maintenance windows forgetting Retry-After.',
  504:
    'Gateway timeouts—cold starts, synchronous chains waiting on queues, oversized SQL, missing timeouts causing threads to stall until proxy kills them.',
  505:
    'HTTP version refusal—clients forcing incorrect protocol after ALPN downgrade, plaintext HTTP spoken to HTTPS-only backends.',
  506:
    'Variant negotiation loop—opaque server configuration errors in negotiation modules; exceedingly rare.',
  507:
    'Insufficient storage—NAS volumes full on WebDAV, mailboxes quotas, multipart temp disk exhaustion.',
  508:
    'Loop detected deep in DAV trees—collections referencing themselves recursively; miswired reverse proxies chaining infinite internal forwards.',
  510:
    'Feature extension missing—not implemented policy—clients must supply required protocol extensions or drop optional features.',
  511:
    'Network authentication or captive portals—Wi-Fi hotspots intercepting HTTPS with login pages mirrored as 511 in some setups; captive portal probes confused with API failures.',
};

/** Returns true when every cheatsheet row has troubleshooting copy (guard for drift). */
export function httpStatusProblemsCoversCheatsheet(): boolean {
  return HTTP_STATUS_ENTRIES.every((e) =>
    Object.prototype.hasOwnProperty.call(COMMON_PROBLEMS_AND_CAUSES, e.code)
  );
}

/** Returns troubleshooting copy for modal (typical pitfalls and debugging cues). */
export function getHttpStatusTroubleshooting(entry: HttpStatusEntry): string {
  const problems = COMMON_PROBLEMS_AND_CAUSES[entry.code];
  if (problems === undefined) {
    return `No extended troubleshooting blurb configured for HTTP ${entry.code}.`;
  }
  return problems;
}

/**
 * Concatenates cheatsheet summary and troubleshooting prose (same order as modal sections).
 */
export function getHttpStatusDetailedDescription(entry: HttpStatusEntry): string {
  return `${entry.summary}\n\n${getHttpStatusTroubleshooting(entry)}`;
}

/** Canonical-looking status line (teaching/example only; HTTP version differs on the wire). */
export function getHttpStatusLineExample(entry: HttpStatusEntry): string {
  return `HTTP/1.1 ${entry.code} ${entry.name}`;
}

/**
 * Filter status entries by optional category and free-text query (code, name, summary).
 */
export function filterHttpStatuses(
  query: string,
  category: HttpStatusCategoryFilter
): HttpStatusEntry[] {
  const q = query.trim().toLowerCase();
  return HTTP_STATUS_ENTRIES.filter((e) => {
    if (category !== 'all' && e.category !== category) return false;
    if (!q) return true;
    if (e.code.toString().includes(q)) return true;
    return e.name.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q);
  });
}
