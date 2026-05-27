import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createLocalForageStateStorage } from '../lib/storage'

const MAX_HISTORY_ITEMS = 20

type SearchHistoryStore = {
  history: string[]
  addSearch: (value: string) => void
  clearHistory: () => void
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
              normalizedValue,
              ...state.history.filter((item) => item !== normalizedValue),
            ].slice(0, MAX_HISTORY_ITEMS),
          }
        }),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'arce-dex:search-history-store',
      storage: createJSONStorage(() => createLocalForageStateStorage()),
    },
  ),
)
