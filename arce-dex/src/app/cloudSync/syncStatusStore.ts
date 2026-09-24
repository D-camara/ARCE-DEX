import { create } from 'zustand'

export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error'

type SyncStatusStore = {
  statuses: Record<string, SyncStatus>
  setDomainStatus: (domain: string, status: SyncStatus) => void
  reset: () => void
}

export const useSyncStatusStore = create<SyncStatusStore>((set) => ({
  statuses: {},
  setDomainStatus: (domain, status) =>
    set((state) => ({ statuses: { ...state.statuses, [domain]: status } })),
  reset: () => set({ statuses: {} }),
}))

const PRIORITY: SyncStatus[] = ['error', 'offline', 'syncing', 'idle']

/** The worst status across domains wins: one failing table is enough to show a problem. */
export function selectOverallSyncStatus(state: Pick<SyncStatusStore, 'statuses'>): SyncStatus {
  const values = Object.values(state.statuses)
  return PRIORITY.find((status) => values.includes(status)) ?? 'idle'
}
