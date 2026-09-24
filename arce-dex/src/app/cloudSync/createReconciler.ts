export type Reconciler = {
  /** Debounced — for bursts of local store changes. */
  request: () => void
  /** Immediate — for sync start, Realtime events, coming back online/visible. */
  requestNow: () => Promise<void>
  dispose: () => void
}

/**
 * Runs `run` serially: never two at once. A request that arrives while a run is in flight
 * marks it dirty, and exactly one more run happens afterwards (so it sees the latest state).
 * A failed run is logged and swallowed — the next request simply tries again.
 */
export function createReconciler(
  run: () => Promise<void>,
  { debounceMs = 300, label = 'sync' }: { debounceMs?: number; label?: string } = {},
): Reconciler {
  let timer: ReturnType<typeof setTimeout> | undefined
  let current: Promise<void> | null = null
  let dirty = false
  let disposed = false

  async function loop() {
    do {
      dirty = false
      try {
        await run()
      } catch (error) {
        console.error(`[cloudSync] ${label} failed`, error)
      }
    } while (dirty && !disposed)
  }

  function execute(): Promise<void> {
    if (disposed) {
      return Promise.resolve()
    }

    if (current) {
      dirty = true
      return current
    }

    current = loop().finally(() => {
      current = null
    })
    return current
  }

  return {
    request() {
      clearTimeout(timer)
      timer = setTimeout(() => void execute(), debounceMs)
    },
    requestNow() {
      clearTimeout(timer)
      return execute()
    },
    dispose() {
      disposed = true
      clearTimeout(timer)
    },
  }
}
