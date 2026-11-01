export interface JwtAlgorithm {
  value: string
  label: string
  symbol: string
  description: string
}

export const JWT_ALGORITHMS: JwtAlgorithm[] = [
  {
    value: 'HS256',
    label: 'HS256 (HMAC SHA-256)',
    symbol: '🔐',
    description: 'Symmetric key algorithm',
  },
  {
    value: 'HS384',
    label: 'HS384 (HMAC SHA-384)',
    symbol: '🔐',
    description: 'Symmetric key algorithm',
  },
  {
    value: 'HS512',
    label: 'HS512 (HMAC SHA-512)',
    symbol: '🔐',
    description: 'Symmetric key algorithm',
  },
  {
    value: 'RS256',
    label: 'RS256 (RSA SHA-256)',
    symbol: '🔑',
    description: 'Asymmetric key algorithm',
  },
  {
    value: 'RS384',
    label: 'RS384 (RSA SHA-384)',
    symbol: '🔑',
    description: 'Asymmetric key algorithm',
  },
  {
    value: 'RS512',
    label: 'RS512 (RSA SHA-512)',
    symbol: '🔑',
    description: 'Asymmetric key algorithm',
  },
  {
    value: 'ES256',
    label: 'ES256 (ECDSA SHA-256)',
    symbol: '🔑',
    description: 'Elliptic curve algorithm',
  },
  {
    value: 'ES384',
    label: 'ES384 (ECDSA SHA-384)',
    symbol: '🔑',
    description: 'Elliptic curve algorithm',
  },
  {
    value: 'ES512',
    label: 'ES512 (ECDSA SHA-512)',
    symbol: '🔑',
    description: 'Elliptic curve algorithm',
  },
  {
    value: 'none',
    label: 'None (Unsecured)',
    symbol: '⚠️',
    description: 'No signature verification',
  },
]

export const JWT_EXAMPLE_TOKENS = {
  valid: {
    hs256:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    expired:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNTE2MjM5MDIyfQ.invalid_signature',
    withCustomClaims:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.invalid_signature',
  },
  invalid: {
    malformed: 'not.a.valid.jwt.token',
    missingParts: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    invalidBase64: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.!!!invalid!!!.signature',
  },
}

export const JWT_STANDARD_CLAIMS = [
  { key: 'iss', label: 'Issuer (iss)', description: 'Who issued the token' },
  { key: 'sub', label: 'Subject (sub)', description: 'Who the token is about' },
  { key: 'aud', label: 'Audience (aud)', description: 'Who the token is intended for' },
  { key: 'exp', label: 'Expiration (exp)', description: 'When the token expires (Unix timestamp)' },
  { key: 'nbf', label: 'Not Before (nbf)', description: 'Token not valid before (Unix timestamp)' },
  { key: 'iat', label: 'Issued At (iat)', description: 'When the token was issued (Unix timestamp)' },
  { key: 'jti', label: 'JWT ID (jti)', description: 'Unique identifier for the token' },
]

export const JWT_DECODER_TOOL_DESCRIPTIONS = {
  title: 'JWT Decoder',
  description: 'Decode and analyze JWT tokens. View header, payload, and signature. Validate expiration and claims.',
  features: [
    'Decode JWT tokens (header, payload, signature)',
    'Validate token structure and format',
    'Check expiration and validity dates',
    'Analyze standard and custom claims',
    'Verify signature (with secret)',
    'Token statistics and metadata',
    'Copy individual sections',
  ],
  useCases: [
    'Debug JWT tokens',
    'Inspect token claims',
    'Validate token expiration',
    'Understand token structure',
    'Security analysis',
    'API development',
  ],
}
