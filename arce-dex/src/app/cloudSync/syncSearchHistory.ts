import { supabase } from '@/shared/services/supabase/client'
import { MAX_HISTORY_ITEMS, useSearchHistoryStore, type SearchHistoryEntry } from '@/features/search'
import { mergeLww, type LwwEntry } from './merge/mergeLww'
import type { DataOwnership } from './syncBaseline'
import { startDomainSync, type DomainSync } from './startDomainSync'

const toLwwEntry = (entry: SearchHistoryEntry): LwwEntry<SearchHistoryEntry> => ({
  key: entry.term,
  updatedAt: entry.searchedAt,
  value: entry,
})

export async function startSearchHistorySync(
  userId: string,
  ownership: DataOwnership,
): Promise<DomainSync | null> {
  if (!supabase) {
    return null
  }

  const client = supabase
  let lastApplied: SearchHistoryEntry[] | null = null

  async function reconcile(currentOwnership: DataOwnership) {
    const { data, error } = await client
      .from('search_history')
      .select('term, searched_at')
      .eq('user_id', userId)
    if (error) {
      throw error
    }

    const remote = data.map((row) => ({ term: row.term as string, searchedAt: row.searched_at as string }))
    const local = currentOwnership === 'other-user' ? [] : useSearchHistoryStore.getState().history
    const { merged, toUpsert } = mergeLww(local.map(toLwwEntry), remote.map(toLwwEntry))

    const kept = merged
      .map((entry) => entry.value)
      .sort((a, b) => Date.parse(b.searchedAt) - Date.parse(a.searchedAt))
      .slice(0, MAX_HISTORY_ITEMS)
    const keptTerms = new Set(kept.map((entry) => entry.term))

    applyToStore(kept)

    const upserts = toUpsert.filter((entry) => keptTerms.has(entry.key))
    // The remote table used to grow forever; keep it at the same cap as the local store.
    const overflow = remote.filter((entry) => !keptTerms.has(entry.term)).map((entry) => entry.term)

    const results = await Promise.all([
      upserts.length > 0
        ? client.from('search_history').upsert(
            upserts.map(({ value }) => ({ user_id: userId, term: value.term, searched_at: value.searchedAt })),
          )
        : null,
      overflow.length > 0
        ? client.from('search_history').delete().eq('user_id', userId).in('term', overflow)
        : null,
    ])
    const failed = results.find((result) => result?.error)
    if (failed?.error) {
      throw failed.error
    }
  }

  function applyToStore(kept: SearchHistoryEntry[]) {
    const current = useSearchHistoryStore.getState().history
    const isSame =
      current.length === kept.length &&
      current.every((entry, index) => entry.term === kept[index].term && entry.searchedAt === kept[index].searchedAt)

    if (!isSame) {
      useSearchHistoryStore.setState({ history: kept })
    }
    lastApplied = useSearchHistoryStore.getState().history
  }

  return startDomainSync({
    client,
    domain: 'search-history',
    table: 'search_history',
    userId,
    ownership,
    store: useSearchHistoryStore,
    reconcile,
    subscribeToLocalChanges: (onChange) =>
      useSearchHistoryStore.subscribe((state) => {
        if (state.history !== lastApplied) {
          onChange()
        }
      }),
  })
}
