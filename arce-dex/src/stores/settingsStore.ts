import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createLocalForageStateStorage } from '../lib/storage'

type ThemeMode = 'light' | 'dark' | 'system'

type SettingsStore = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'arce-dex:settings-store',
      storage: createJSONStorage(() => createLocalForageStateStorage()),
    },
  ),
)
