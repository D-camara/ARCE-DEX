import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createLocalForageStateStorage } from '@/shared/lib/storage'

type ThemeMode = 'light' | 'dark' | 'system'

type SettingsStore = {
  theme: ThemeMode
  /** Set by setTheme; cloud sync resolves conflicts with it (last write wins). */
  updatedAt?: string
  setTheme: (theme: ThemeMode) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme, updatedAt: new Date().toISOString() }),
    }),
    {
      name: 'arce-dex:settings-store',
      storage: createJSONStorage(() => createLocalForageStateStorage()),
    },
  ),
)
