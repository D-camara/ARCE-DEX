import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth'
import { startFavoritesSync } from './cloudSync/syncFavorites'
import { startSearchHistorySync } from './cloudSync/syncSearchHistory'
import { startTeamsSync } from './cloudSync/syncTeams'
import { startSettingsSync } from './cloudSync/syncSettings'

export function useCloudSync() {
  const status = useAuthStore((state) => state.status)
  const userId = useAuthStore((state) => state.user?.id)

  useEffect(() => {
    if (status !== 'authenticated' || !userId) {
      return
    }

    let cleanups: Array<() => void> = []
    let cancelled = false

    void Promise.allSettled([
      startFavoritesSync(userId),
      startSearchHistorySync(userId),
      startTeamsSync(userId),
      startSettingsSync(userId),
    ]).then((results) => {
      const unsubscribers = results.flatMap((result) => {
        if (result.status === 'rejected') {
          console.error('[useCloudSync] failed to start sync', result.reason)
          return []
        }
        return [result.value]
      })

      if (cancelled) {
        unsubscribers.forEach((unsubscribe) => unsubscribe())
        return
      }
      cleanups = unsubscribers
    })

    return () => {
      cancelled = true
      cleanups.forEach((unsubscribe) => unsubscribe())
    }
  }, [status, userId])
}
