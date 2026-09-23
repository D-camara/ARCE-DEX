import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth'
import { startFavoritesSync } from './cloudSync/syncFavorites'
import { startSearchHistorySync } from './cloudSync/syncSearchHistory'
import { startTeamsSync } from './cloudSync/syncTeams'
import { startSettingsSync } from './cloudSync/syncSettings'
import { readLastSyncedUserId, resolveOwnership, writeLastSyncedUserId } from './cloudSync/syncBaseline'
import { useSyncStatusStore } from './cloudSync/syncStatusStore'
import type { DomainSync } from './cloudSync/startDomainSync'

export function useCloudSync() {
  const status = useAuthStore((state) => state.status)
  const userId = useAuthStore((state) => state.user?.id)

  useEffect(() => {
    if (status !== 'authenticated' || !userId) {
      return
    }

    let syncs: DomainSync[] = []
    let cancelled = false

    const syncAll = () => {
      syncs.forEach((sync) => void sync.requestNow())
    }
    const syncWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        syncAll()
      }
    }

    void (async () => {
      const ownership = resolveOwnership(await readLastSyncedUserId(), userId)
      const results = await Promise.allSettled([
        startFavoritesSync(userId, ownership),
        startSearchHistorySync(userId, ownership),
        startTeamsSync(userId, ownership),
        startSettingsSync(userId, ownership),
      ])

      const started = results.flatMap((result) => {
        if (result.status === 'rejected') {
          console.error('[useCloudSync] failed to start sync', result.reason)
          return []
        }
        return result.value ? [result.value] : []
      })

      if (cancelled) {
        started.forEach((sync) => sync.stop())
        return
      }
      syncs = started

      // Local data now belongs to this account — unless some domain never managed to sync,
      // in which case keep treating it as before so nothing leaks on the next attempt.
      if (started.length === results.length && started.every((sync) => sync.initialSyncOk)) {
        await writeLastSyncedUserId(userId)
      }
    })()

    window.addEventListener('online', syncAll)
    document.addEventListener('visibilitychange', syncWhenVisible)

    return () => {
      cancelled = true
      window.removeEventListener('online', syncAll)
      document.removeEventListener('visibilitychange', syncWhenVisible)
      syncs.forEach((sync) => sync.stop())
      useSyncStatusStore.getState().reset()
    }
  }, [status, userId])
}
