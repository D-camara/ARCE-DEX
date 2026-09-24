import type { SupabaseClient } from '@supabase/supabase-js'
import { createReconciler } from './createReconciler'
import { subscribeToTableChanges } from './realtimeChannel'
import type { DataOwnership } from './syncBaseline'
import { useSyncStatusStore } from './syncStatusStore'

type PersistedStore = {
  persist: {
    hasHydrated: () => boolean
    onFinishHydration: (listener: () => void) => () => void
  }
}

export type DomainSync = {
  stop: () => void
  requestNow: () => Promise<void>
  /** Whether the first reconcile of this session succeeded. */
  initialSyncOk: boolean
}

type StartDomainSyncOptions = {
  client: SupabaseClient
  domain: string
  table: string
  userId: string
  ownership: DataOwnership
  store: PersistedStore
  /**
   * Reads remote, merges with local, applies the result to the store and writes the difference.
   * Must throw on any failed write so the next run retries it. With `other-user` ownership it
   * must ignore local data (it belongs to another account) and adopt the remote state.
   */
  reconcile: (ownership: DataOwnership) => Promise<void>
  /** Subscribes to local changes made by the user (not by `reconcile` itself). */
  subscribeToLocalChanges: (onChange: () => void) => () => void
}

/** Local data must be loaded from localForage before merging, or it would look like everything was deleted. */
function waitForHydration(store: PersistedStore): Promise<void> {
  if (store.persist.hasHydrated()) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const unsubscribe = store.persist.onFinishHydration(() => {
      unsubscribe()
      resolve()
    })
  })
}

export async function startDomainSync({
  client,
  domain,
  table,
  userId,
  ownership: initialOwnership,
  store,
  reconcile,
  subscribeToLocalChanges,
}: StartDomainSyncOptions): Promise<DomainSync> {
  const { setDomainStatus } = useSyncStatusStore.getState()
  let ownership = initialOwnership
  let lastRunOk = false

  await waitForHydration(store)

  const reconciler = createReconciler(
    async () => {
      setDomainStatus(domain, 'syncing')
      try {
        await reconcile(ownership)
        // Only after a fully successful run is local data considered this user's.
        ownership = 'same-user'
        lastRunOk = true
        setDomainStatus(domain, 'idle')
      } catch (error) {
        lastRunOk = false
        setDomainStatus(domain, navigator.onLine ? 'error' : 'offline')
        throw error
      }
    },
    { label: domain },
  )

  const unsubscribeStore = subscribeToLocalChanges(reconciler.request)
  // Debounced: a remote write can span several statements (e.g. team row + slots).
  const channel = await subscribeToTableChanges(client, `${table}-${userId}`, table, userId, reconciler.request)

  await reconciler.requestNow()

  return {
    initialSyncOk: lastRunOk,
    requestNow: reconciler.requestNow,
    stop: () => {
      reconciler.dispose()
      unsubscribeStore()
      void client.removeChannel(channel)
    },
  }
}
