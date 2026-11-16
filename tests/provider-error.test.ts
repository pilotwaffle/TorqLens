import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { summarizeProviderError } from '../src/app/api/_provider-error.ts'

describe('summarizeProviderError', () => {
  it('maps a missing provider key without leaking the env var name', () => {
    assert.deepEqual(summarizeProviderError(new Error('provider not configured')), {
      code: 'provider_unconfigured'
    })
  })

  it('maps an unsupported image payload', () => {
    assert.deepEqual(summarizeProviderError(new Error('unsupported image payload')), {
      code: 'unsupported_image'
    })
  })

  it('maps Anthropic-style authentication failures by status and type', () => {
    const err = { status: 401, error: { type: 'authentication_error', message: 'invalid x-api-key' } }
    assert.deepEqual(summarizeProviderError(err), {
      code: 'provider_auth',
      status: 401,
      type: 'authentication_error'
    })
  })

  it('maps billing and rate-limit failures', () => {
    assert.equal(
      summarizeProviderError({ status: 402, error: { type: 'billing_error' } }).code,
      'provider_billing'
    )
    assert.equal(
      summarizeProviderError({ status: 429, error: { type: 'rate_limit_error' } }).code,
      'provider_rate_limit'
    )
  })

  it('maps model-not-found without including any model id', () => {
    const err = {
      status: 404,
      error: { type: 'not_found_error', message: 'model: claude-sonnet-4-6' }
    }
    const summary = summarizeProviderError(err)
    assert.deepEqual(summary, {
      code: 'provider_not_found',
      status: 404,
      type: 'not_found_error'
    })
    assert.equal(JSON.stringify(summary).includes('claude'), false)
  })

  it('ignores unknown error.type strings so a message cannot leak', () => {
    const err = { status: 500, type: 'secret-model-name', message: 'claude-sonnet-4-6 exploded' }
    assert.deepEqual(summarizeProviderError(err), {
      code: 'provider_upstream',
      status: 500
    })
  })

  it('returns a generic code for an empty or non-object throw', () => {
    assert.deepEqual(summarizeProviderError(undefined), { code: 'provider_error' })
    assert.deepEqual(summarizeProviderError('nope'), { code: 'provider_error' })
  })
})
