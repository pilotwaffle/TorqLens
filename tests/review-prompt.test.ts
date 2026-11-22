import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  REVIEW_PROMPTED_KEY,
  REVIEW_SAVE_COUNT_KEY,
  maybeRequestReviewAfterSuccessfulSave
} from '../src/lib/review-prompt.ts'

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map<string, string>(Object.entries(initial))
  return {
    data,
    async get(key: string): Promise<string | null> {
      const value = data.get(key)
      return value === undefined ? null : value
    },
    async set(key: string, value: string): Promise<void> {
      data.set(key, value)
    }
  }
}

function trackingRequest(impl?: () => Promise<void>): (() => Promise<void>) & { calls: number } {
  const request = Object.assign(
    async () => {
      request.calls += 1
      if (impl) await impl()
    },
    { calls: 0 }
  )
  return request
}

describe('maybeRequestReviewAfterSuccessfulSave', { concurrency: 1 }, () => {
  it('does not ask for untracked lengths 1 and 2', async () => {
    for (const length of [1, 2]) {
      const storage = memoryStorage()
      const requestReview = trackingRequest()
      const result = await maybeRequestReviewAfterSuccessfulSave({
        storage,
        requestReview,
        savedCountIfUntracked: length
      })
      assert.deepEqual(result, { requested: false, savedCount: length })
      assert.equal(requestReview.calls, 0)
      assert.equal(storage.data.get(REVIEW_SAVE_COUNT_KEY), String(length))
      assert.equal(storage.data.has(REVIEW_PROMPTED_KEY), false)
    }
  })

  it('asks once when an untracked history is already length 3', async () => {
    const storage = memoryStorage()
    const requestReview = trackingRequest()
    const result = await maybeRequestReviewAfterSuccessfulSave({
      storage,
      requestReview,
      savedCountIfUntracked: 3
    })
    assert.deepEqual(result, { requested: true, savedCount: 3 })
    assert.equal(requestReview.calls, 1)
    assert.equal(storage.data.get(REVIEW_SAVE_COUNT_KEY), '3')
    assert.equal(storage.data.get(REVIEW_PROMPTED_KEY), '1')
  })

  it('asks only on the third sequential save from empty storage', async () => {
    const storage = memoryStorage()
    const requestReview = trackingRequest()
    const results = []
    for (const length of [1, 2, 3]) {
      results.push(
        await maybeRequestReviewAfterSuccessfulSave({
          storage,
          requestReview,
          savedCountIfUntracked: length
        })
      )
    }
    assert.deepEqual(results, [
      { requested: false, savedCount: 1 },
      { requested: false, savedCount: 2 },
      { requested: true, savedCount: 3 }
    ])
    assert.equal(requestReview.calls, 1)
    assert.equal(storage.data.get(REVIEW_PROMPTED_KEY), '1')
  })

  it('increments a fourth save without asking again', async () => {
    const storage = memoryStorage()
    const requestReview = trackingRequest()
    for (const length of [1, 2, 3]) {
      await maybeRequestReviewAfterSuccessfulSave({
        storage,
        requestReview,
        savedCountIfUntracked: length
      })
    }
    const fourth = await maybeRequestReviewAfterSuccessfulSave({
      storage,
      requestReview,
      savedCountIfUntracked: 99
    })
    assert.deepEqual(fourth, { requested: false, savedCount: 4 })
    assert.equal(requestReview.calls, 1)
    assert.equal(storage.data.get(REVIEW_SAVE_COUNT_KEY), '4')
    assert.equal(storage.data.get(REVIEW_PROMPTED_KEY), '1')
  })

  it('asks once for an untracked upgrade history of length 10', async () => {
    const storage = memoryStorage()
    const requestReview = trackingRequest()
    const result = await maybeRequestReviewAfterSuccessfulSave({
      storage,
      requestReview,
      savedCountIfUntracked: 10
    })
    assert.deepEqual(result, { requested: true, savedCount: 10 })
    assert.equal(requestReview.calls, 1)
    assert.equal(storage.data.get(REVIEW_SAVE_COUNT_KEY), '10')
    assert.equal(storage.data.get(REVIEW_PROMPTED_KEY), '1')
  })

  it('increments a stored count of 2 and ignores savedCountIfUntracked', async () => {
    const storage = memoryStorage({ [REVIEW_SAVE_COUNT_KEY]: '2' })
    const requestReview = trackingRequest()
    const result = await maybeRequestReviewAfterSuccessfulSave({
      storage,
      requestReview,
      savedCountIfUntracked: 100
    })
    assert.deepEqual(result, { requested: true, savedCount: 3 })
    assert.equal(requestReview.calls, 1)
    assert.equal(storage.data.get(REVIEW_SAVE_COUNT_KEY), '3')
    assert.equal(storage.data.get(REVIEW_PROMPTED_KEY), '1')
  })

  it('does not ask when the prompted flag is already set', async () => {
    const storage = memoryStorage({
      [REVIEW_SAVE_COUNT_KEY]: '2',
      [REVIEW_PROMPTED_KEY]: '1'
    })
    const requestReview = trackingRequest()
    const result = await maybeRequestReviewAfterSuccessfulSave({
      storage,
      requestReview,
      savedCountIfUntracked: 2
    })
    assert.deepEqual(result, { requested: false, savedCount: 3 })
    assert.equal(requestReview.calls, 0)
    assert.equal(storage.data.get(REVIEW_SAVE_COUNT_KEY), '3')
    assert.equal(storage.data.get(REVIEW_PROMPTED_KEY), '1')
  })

  it('keeps the prompted flag when requestReview throws and does not ask again', async () => {
    const storage = memoryStorage()
    const requestReview = trackingRequest(async () => {
      throw new Error('storekit unavailable')
    })
    const first = await maybeRequestReviewAfterSuccessfulSave({
      storage,
      requestReview,
      savedCountIfUntracked: 3
    })
    assert.deepEqual(first, { requested: true, savedCount: 3 })
    assert.equal(storage.data.get(REVIEW_PROMPTED_KEY), '1')
    assert.equal(requestReview.calls, 1)

    const second = await maybeRequestReviewAfterSuccessfulSave({
      storage,
      requestReview,
      savedCountIfUntracked: 3
    })
    assert.deepEqual(second, { requested: false, savedCount: 4 })
    assert.equal(requestReview.calls, 1)
    assert.equal(storage.data.get(REVIEW_SAVE_COUNT_KEY), '4')
    assert.equal(storage.data.get(REVIEW_PROMPTED_KEY), '1')
  })

  it('resolves without asking when storage.get throws', async () => {
    const requestReview = trackingRequest()
    let writes = 0
    const result = await maybeRequestReviewAfterSuccessfulSave({
      storage: {
        async get() {
          throw new Error('read failed')
        },
        async set() {
          writes += 1
        }
      },
      requestReview,
      savedCountIfUntracked: 5
    })
    assert.deepEqual(result, { requested: false, savedCount: 0 })
    assert.equal(requestReview.calls, 0)
    assert.equal(writes, 0)
  })

  it('does not ask when persisting the count throws', async () => {
    const requestReview = trackingRequest()
    const result = await maybeRequestReviewAfterSuccessfulSave({
      storage: {
        async get() {
          return null
        },
        async set() {
          throw new Error('count write failed')
        }
      },
      requestReview,
      savedCountIfUntracked: 3
    })
    assert.deepEqual(result, { requested: false, savedCount: 3 })
    assert.equal(requestReview.calls, 0)
  })

  it('does not ask when the prompted-flag write throws, and a later save still can', async () => {
    const data = new Map<string, string>()
    let failPromptedWrite = true
    const storage = {
      async get(key: string): Promise<string | null> {
        const value = data.get(key)
        return value === undefined ? null : value
      },
      async set(key: string, value: string): Promise<void> {
        if (failPromptedWrite && key === REVIEW_PROMPTED_KEY) {
          throw new Error('flag write failed')
        }
        data.set(key, value)
      }
    }
    const requestReview = trackingRequest()
    const first = await maybeRequestReviewAfterSuccessfulSave({
      storage,
      requestReview,
      savedCountIfUntracked: 3
    })
    assert.deepEqual(first, { requested: false, savedCount: 3 })
    assert.equal(requestReview.calls, 0)
    assert.equal(data.has(REVIEW_PROMPTED_KEY), false)
    assert.equal(data.get(REVIEW_SAVE_COUNT_KEY), '3')

    failPromptedWrite = false
    const second = await maybeRequestReviewAfterSuccessfulSave({
      storage,
      requestReview,
      savedCountIfUntracked: 99
    })
    assert.deepEqual(second, { requested: true, savedCount: 4 })
    assert.equal(requestReview.calls, 1)
    assert.equal(data.get(REVIEW_SAVE_COUNT_KEY), '4')
    assert.equal(data.get(REVIEW_PROMPTED_KEY), '1')
  })

  it('serializes two overlapping saves from count 2 into one request and count 4', async () => {
    const storage = memoryStorage({ [REVIEW_SAVE_COUNT_KEY]: '2' })
    let release: () => void = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const requestReview = trackingRequest(async () => {
      await gate
    })

    const first = maybeRequestReviewAfterSuccessfulSave({
      storage,
      requestReview,
      savedCountIfUntracked: 0
    })
    const second = maybeRequestReviewAfterSuccessfulSave({
      storage,
      requestReview,
      savedCountIfUntracked: 50
    })

    const deadline = Date.now() + 1000
    while (requestReview.calls < 1) {
      if (Date.now() > deadline) throw new Error('timed out waiting for requestReview')
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
    assert.equal(requestReview.calls, 1)
    assert.equal(storage.data.get(REVIEW_SAVE_COUNT_KEY), '3')
    assert.equal(storage.data.get(REVIEW_PROMPTED_KEY), '1')

    release()
    const [a, b] = await Promise.all([first, second])
    assert.deepEqual(a, { requested: true, savedCount: 3 })
    assert.deepEqual(b, { requested: false, savedCount: 4 })
    assert.equal(requestReview.calls, 1)
    assert.equal(storage.data.get(REVIEW_SAVE_COUNT_KEY), '4')
    assert.equal(storage.data.get(REVIEW_PROMPTED_KEY), '1')
  })

  it('seeds a non-numeric stored count instead of incrementing it', async () => {
    const storage = memoryStorage({ [REVIEW_SAVE_COUNT_KEY]: 'nope' })
    const requestReview = trackingRequest()
    const result = await maybeRequestReviewAfterSuccessfulSave({
      storage,
      requestReview,
      savedCountIfUntracked: 3
    })
    assert.deepEqual(result, { requested: true, savedCount: 3 })
    assert.equal(requestReview.calls, 1)
    assert.equal(storage.data.get(REVIEW_SAVE_COUNT_KEY), '3')
    assert.equal(storage.data.get(REVIEW_PROMPTED_KEY), '1')
  })

  it('stores 0 and does not ask when there is no key and the seed is <= 0', async () => {
    for (const length of [0, -4]) {
      const storage = memoryStorage()
      const requestReview = trackingRequest()
      const result = await maybeRequestReviewAfterSuccessfulSave({
        storage,
        requestReview,
        savedCountIfUntracked: length
      })
      assert.deepEqual(result, { requested: false, savedCount: 0 })
      assert.equal(requestReview.calls, 0)
      assert.equal(storage.data.get(REVIEW_SAVE_COUNT_KEY), '0')
      assert.equal(storage.data.has(REVIEW_PROMPTED_KEY), false)
    }
  })
})
