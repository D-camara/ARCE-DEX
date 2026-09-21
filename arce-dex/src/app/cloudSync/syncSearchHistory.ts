import { supabase } from '@/shared/services/supabase/client'
import { useSearchHistoryStore } from '@/features/search'
import { decideSyncStrategy } from './decideSyncStrategy'
import { subscribeToTableChanges } from './realtimeChannel'

export async function startSearchHistorySync(userId: string): Promise<() => void> {
  if (!supabase) {
    return () => {}
  }

  const client = supabase

  const { data: remoteRows } = await client
    .from('search_history')
    .select('term, searched_at')
    .eq('user_id', userId)
    .order('searched_at', { ascending: false })

  const strategy = decideSyncStrategy(remoteRows ?? [])

  if (strategy === 'push') {
    const localTerms = useSearchHistoryStore.getState().history
    if (localTerms.length > 0) {
      await client
        .from('search_history')
        .insert(localTerms.map((term) => ({ user_id: userId, term })))
    }
  } else {
    useSearchHistoryStore.setState({ history: (remoteRows ?? []).map((row) => row.term as string) })
  }

  let isApplyingRemote = false

  const channel = await subscribeToTableChanges(
    client,
    `search-history-${userId}`,
    'search_history',
    userId,
    async () => {
      isApplyingRemote = true
      const { data } = await client
        .from('search_history')
        .select('term, searched_at')
        .eq('user_id', userId)
        .order('searched_at', { ascending: false })
      useSearchHistoryStore.setState({ history: (data ?? []).map((row) => row.term as string) })
      isApplyingRemote = false
    },
  )

  let previousTerms = useSearchHistoryStore.getState().history

  const unsubscribeStore = useSearchHistoryStore.subscribe((state) => {
    if (isApplyingRemote) {
      previousTerms = state.history
      return
    }

    const addedTerms = state.history.filter((term) => !previousTerms.includes(term))
    previousTerms = state.history

    addedTerms.forEach((term) => {
      void client
        .from('search_history')
        .upsert({ user_id: userId, term, searched_at: new Date().toISOString() })
        .then()
    })
  })

  return () => {
    unsubscribeStore()
    void client.removeChannel(channel)
  }
}
