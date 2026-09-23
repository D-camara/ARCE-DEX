import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createReconciler } from './createReconciler'

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

describe('createReconciler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('collapses a burst of debounced requests into one run', async () => {
    const run = vi.fn().mockResolvedValue(undefined)
    const reconciler = createReconciler(run, { debounceMs: 300 })

    for (let i = 0; i < 5; i += 1) {
      reconciler.request()
      await vi.advanceTimersByTimeAsync(20)
    }
    await vi.advanceTimersByTimeAsync(300)

    expect(run).toHaveBeenCalledTimes(1)
  })

  it('runs exactly once more when requested during a run, never in parallel', async () => {
    const first = deferred()
    let active = 0
    let maxActive = 0
    const run = vi.fn(async () => {
      active += 1
      maxActive = Math.max(maxActive, active)
      if (run.mock.calls.length === 1) {
        await first.promise
      }
      active -= 1
    })
    const reconciler = createReconciler(run)

    const pending = reconciler.requestNow()
    void reconciler.requestNow()
    void reconciler.requestNow()
    first.resolve()
    await pending

    expect(run).toHaveBeenCalledTimes(2)
    expect(maxActive).toBe(1)
  })

  it('keeps working after a failed run', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const run = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined)
    const reconciler = createReconciler(run)

    await reconciler.requestNow()
    await reconciler.requestNow()

    expect(run).toHaveBeenCalledTimes(2)
    expect(consoleError).toHaveBeenCalledTimes(1)
    consoleError.mockRestore()
  })

  it('cancels a pending debounced run on dispose', async () => {
    const run = vi.fn().mockResolvedValue(undefined)
    const reconciler = createReconciler(run, { debounceMs: 300 })

    reconciler.request()
    reconciler.dispose()
    await vi.advanceTimersByTimeAsync(1000)

    expect(run).not.toHaveBeenCalled()
  })
})
