import { JWT_ALGORITHMS } from './jwt-decoder-config'

export interface JwtEncoderOptions {
  algorithm: string
  header: string
  payload: string
  secret: string
  autoGenerateIat: boolean
  expirationMinutes: number | null // null means no expiration
}

export const DEFAULT_JWT_ENCODER_OPTIONS: JwtEncoderOptions = {
  algorithm: 'HS256',
  header: JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2),
  payload: JSON.stringify({ sub: '1234567890', name: 'John Doe' }, null, 2),
  secret: '',
  autoGenerateIat: true,
  expirationMinutes: null, // No expiration by default
}

export const JWT_ENCODER_ALGORITHMS = JWT_ALGORITHMS.filter((alg) => ['HS256', 'HS384', 'HS512'].includes(alg.value))

export const JWT_TEMPLATES = [
  {
    name: 'Basic Token',
    description: 'Simple token with subject and name',
    header: { alg: 'HS256', typ: 'JWT' },
    payload: {
      sub: '1234567890',
      name: 'John Doe',
      iat: Math.floor(Date.now() / 1000),
    },
  },
  {
    name: 'Authentication Token',
    description: 'Token with user authentication claims',
    header: { alg: 'HS256', typ: 'JWT' },
    payload: {
      sub: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
  },
  {
    name: 'API Token',
    description: 'Token for API access with permissions',
    header: { alg: 'HS256', typ: 'JWT' },
    payload: {
      sub: 'api-client',
      aud: 'api.example.com',
      scope: ['read', 'write'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    },
  },
  {
    name: 'Refresh Token',
    description: 'Long-lived refresh token',
    header: { alg: 'HS256', typ: 'JWT' },
    payload: {
      sub: 'user123',
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 2592000,
    },
  },
]

export const JWT_EXPIRATION_OPTIONS = [
  { value: null, label: 'No expiration' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '8 hours' },
  { value: 1440, label: '24 hours' },
  { value: 10080, label: '7 days' },
  { value: 43200, label: '30 days' },
]

export const JWT_ENCODER_TOOL_DESCRIPTIONS = {
  title: 'JWT Encoder',
  description:
    'Create and encode JWT tokens with custom headers and payloads. Support for standard claims and custom data.',
  features: [
    'Create JWT tokens with custom headers and payloads',
    'Support for HS256, HS384, HS512 algorithms',
    'Auto-generate standard claims (iat, exp)',
    'Token templates for common use cases',
    'Real-time token preview',
    'Copy generated tokens',
  ],
  useCases: [
    'Generate test tokens',
    'Create API authentication tokens',
    'Prototype JWT implementations',
    'Testing and development',
    'Learning JWT structure',
  ],
}
