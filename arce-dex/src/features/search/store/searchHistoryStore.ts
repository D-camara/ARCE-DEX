import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createLocalForageStateStorage } from '@/shared/lib/storage'

export const MAX_HISTORY_ITEMS = 20

export type SearchHistoryEntry = {
  term: string
  searchedAt: string
}

type SearchHistoryStore = {
  history: SearchHistoryEntry[]
  addSearch: (value: string) => void
  clearHistory: () => void
}

/** v0 stored plain terms, newest first. Fake descending timestamps keep that order. */
export function migrateSearchHistory(persistedState: unknown, version: number) {
  const state = (persistedState ?? {}) as { history?: unknown }

  if (version === 0 && Array.isArray(state.history)) {
    const now = Date.now()
    return {
      ...state,
      history: state.history
        .filter((term): term is string => typeof term === 'string')
        .map((term, index) => ({ term, searchedAt: new Date(now - index).toISOString() })),
    }
  }

  return state
}

export const useSearchHistoryStore = create<SearchHistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addSearch: (value) =>
        set((state) => {
          const normalizedValue = value.trim().toLowerCase()

          if (!normalizedValue) {
            return state
          }

          return {
            history: [
              { term: normalizedValue, searchedAt: new Date().toISOString() },
              ...state.history.filter((entry) => entry.term !== normalizedValue),
            ].slice(0, MAX_HISTORY_ITEMS),
          }
        }),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'arce-dex:search-history-store',
      version: 1,
      migrate: (persistedState, version) =>
        migrateSearchHistory(persistedState, version) as SearchHistoryStore,
      storage: createJSONStorage(() => createLocalForageStateStorage()),
    },
  ),
)
