/**
 * Sanitize provider failures for server logs.
 *
 * Route handlers catch every provider exception and return a generic
 * user-safe message. Without a structured, secret-free summary in the
 * server log, operators cannot tell a missing key from auth, billing,
 * quota, or an upstream outage. Never log the raw Error, its message,
 * stack, provider name, model id, request body, or API key.
 */

export type ProviderErrorSummary = {
  code: string
  status?: number
  type?: string
}

const ALLOWED_TYPES = new Set([
  'authentication_error',
  'billing_error',
  'permission_error',
  'not_found_error',
  'invalid_request_error',
  'rate_limit_error',
  'timeout_error',
  'connection_error',
  'api_error',
  'overloaded_error'
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function statusOf(err: unknown): number | undefined {
  if (!isRecord(err) || typeof err.status !== 'number') return undefined
  return err.status
}

function typeOf(err: unknown): string | undefined {
  if (!isRecord(err)) return undefined
  const nested = isRecord(err.error) ? err.error.type : undefined
  const direct = err.type
  const raw = typeof nested === 'string' ? nested : typeof direct === 'string' ? direct : undefined
  return raw && ALLOWED_TYPES.has(raw) ? raw : undefined
}

export function summarizeProviderError(err: unknown): ProviderErrorSummary {
  if (err instanceof Error && err.message === 'provider not configured') {
    return { code: 'provider_unconfigured' }
  }
  if (err instanceof Error && err.message === 'unsupported image payload') {
    return { code: 'unsupported_image' }
  }

  const status = statusOf(err)
  const type = typeOf(err)

  let code = 'provider_error'
  if (type === 'authentication_error' || status === 401) code = 'provider_auth'
  else if (type === 'billing_error' || status === 402) code = 'provider_billing'
  else if (type === 'permission_error' || status === 403) code = 'provider_permission'
  else if (type === 'not_found_error' || status === 404) code = 'provider_not_found'
  else if (type === 'invalid_request_error' || status === 400) code = 'provider_invalid_request'
  else if (type === 'rate_limit_error' || status === 429) code = 'provider_rate_limit'
  else if (type === 'overloaded_error' || status === 529) code = 'provider_overloaded'
  else if (type === 'timeout_error' || type === 'connection_error') code = 'provider_network'
  else if (typeof status === 'number' && status >= 500) code = 'provider_upstream'

  const summary: ProviderErrorSummary = { code }
  if (typeof status === 'number') summary.status = status
  if (type) summary.type = type
  return summary
}

export function logProviderError(route: string, err: unknown): void {
  console.error(`${route}: unhandled server error`, summarizeProviderError(err))
}
