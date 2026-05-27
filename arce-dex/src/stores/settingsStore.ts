import { create } from 'zustand'

type ThemeMode = 'light' | 'dark' | 'system'

type SettingsStore = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: 'system',
  setTheme: (theme) => set({ theme }),
}))
