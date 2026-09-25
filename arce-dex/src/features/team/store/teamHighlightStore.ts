import { create } from 'zustand'

type RecentlyAdded = { teamId: string; slotIndex: number }

type TeamHighlightStore = {
  /** Last Pokémon added from the Pokédex: the lab makes that slot glow once when opened. */
  recentlyAdded: RecentlyAdded | null
  markAdded: (recentlyAdded: RecentlyAdded) => void
  clear: () => void
}

/**
 * Ephemeral UI state, deliberately NOT persisted (no localForage, no cloud sync): a glow that
 * survives a reload or shows up on another device would point at nothing the user just did.
 */
export const useTeamHighlightStore = create<TeamHighlightStore>()((set) => ({
  recentlyAdded: null,
  markAdded: (recentlyAdded) => set({ recentlyAdded }),
  clear: () => set({ recentlyAdded: null }),
}))
