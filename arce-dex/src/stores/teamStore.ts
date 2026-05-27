import { create } from 'zustand'
import type { PokemonSummary } from '../types/pokemon'
import type { Team, TeamSlot } from '../types/team'

const TEAM_SIZE = 6

function createEmptySlots(): TeamSlot[] {
  return Array.from({ length: TEAM_SIZE }, (_, index) => ({
    id: `slot-${index + 1}`,
    pokemon: null,
  }))
}

type TeamStore = {
  team: Team
  setPokemon: (slotIndex: number, pokemon: PokemonSummary | null) => void
  clearTeam: () => void
}

export const useTeamStore = create<TeamStore>((set) => ({
  team: {
    id: 'default',
    name: 'Meu time',
    slots: createEmptySlots(),
  },
  setPokemon: (slotIndex, pokemon) =>
    set((state) => ({
      team: {
        ...state.team,
        slots: state.team.slots.map((slot, index) =>
          index === slotIndex ? { ...slot, pokemon } : slot,
        ),
      },
    })),
  clearTeam: () =>
    set((state) => ({
      team: {
        ...state.team,
        slots: createEmptySlots(),
      },
    })),
}))
