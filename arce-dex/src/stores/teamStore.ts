import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { exportTeam } from '../lib/export-import'
import { createLocalForageStateStorage } from '../lib/storage'
import type { Team, TeamPokemon, TeamSlot } from '../types/team'

export const MAX_TEAMS = 6
export const TEAM_SIZE = 6

function createEmptySlots(teamIndex: number): TeamSlot[] {
  return Array.from({ length: TEAM_SIZE }, (_, slotIndex) => ({
    id: `team-${teamIndex + 1}-slot-${slotIndex + 1}`,
    pokemon: null,
  }))
}

function createDefaultTeam(index: number): Team {
  return {
    id: `team-${index + 1}`,
    name: index === 0 ? 'Meu time' : `Time ${index + 1}`,
    slots: createEmptySlots(index),
  }
}

function createDefaultTeams(): Team[] {
  return Array.from({ length: MAX_TEAMS }, (_, index) => createDefaultTeam(index))
}

function normalizeTeamSlots(team: Team, teamIndex: number): TeamSlot[] {
  const slots = createEmptySlots(teamIndex)

  return slots.map((slot, index) => ({
    ...slot,
    pokemon: team.slots[index]?.pokemon ?? null,
  }))
}

function normalizeTeam(team: Team, teamIndex: number): Team {
  return {
    id: team.id || `team-${teamIndex + 1}`,
    name: team.name.trim() || `Time ${teamIndex + 1}`,
    slots: normalizeTeamSlots(team, teamIndex),
  }
}

type TeamStore = {
  activeTeamId: string
  teams: Team[]
  getActiveTeam: () => Team
  setActiveTeam: (teamId: string) => void
  addPokemon: (pokemon: TeamPokemon, slotIndex?: number) => boolean
  addPokemonToTeam: (teamId: string, pokemon: TeamPokemon) => boolean
  removePokemon: (slotIndex: number, teamId?: string) => void
  renameTeam: (teamId: string, name: string) => void
  clearTeam: (teamId?: string) => void
  importTeam: (team: Team, teamId?: string) => void
  exportActiveTeam: () => string
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      activeTeamId: 'team-1',
      teams: createDefaultTeams(),
      getActiveTeam: () =>
        get().teams.find((team) => team.id === get().activeTeamId) ?? get().teams[0],
      setActiveTeam: (teamId) =>
        set((state) => ({
          activeTeamId: state.teams.some((team) => team.id === teamId)
            ? teamId
            : state.activeTeamId,
        })),
      addPokemon: (pokemon, slotIndex) => {
        let wasAdded = false

        set((state) => ({
          teams: state.teams.map((team) => {
            if (team.id !== state.activeTeamId) {
              return team
            }

            const nextSlotIndex =
              slotIndex ?? team.slots.findIndex((slot) => slot.pokemon === null)

            if (nextSlotIndex < 0 || nextSlotIndex >= TEAM_SIZE) {
              return team
            }

            wasAdded = true

            return {
              ...team,
              slots: team.slots.map((slot, index) =>
                index === nextSlotIndex ? { ...slot, pokemon } : slot,
              ),
            }
          }),
        }))

        return wasAdded
      },
      addPokemonToTeam: (teamId, pokemon) => {
        let wasAdded = false

        set((state) => ({
          teams: state.teams.map((team) => {
            if (team.id !== teamId) {
              return team
            }

            const nextSlotIndex = team.slots.findIndex((slot) => slot.pokemon === null)

            if (nextSlotIndex < 0) {
              return team
            }

            wasAdded = true

            return {
              ...team,
              slots: team.slots.map((slot, index) =>
                index === nextSlotIndex ? { ...slot, pokemon } : slot,
              ),
            }
          }),
          activeTeamId: wasAdded ? teamId : state.activeTeamId,
        }))

        return wasAdded
      },
      removePokemon: (slotIndex, teamId) =>
        set((state) => {
          const targetTeamId = teamId ?? state.activeTeamId

          return {
            teams: state.teams.map((team) =>
              team.id === targetTeamId
                ? {
                    ...team,
                    slots: team.slots.map((slot, index) =>
                      index === slotIndex ? { ...slot, pokemon: null } : slot,
                    ),
                  }
                : team,
            ),
          }
        }),
      renameTeam: (teamId, name) =>
        set((state) => ({
          teams: state.teams.map((team) =>
            team.id === teamId ? { ...team, name: name.trim() || team.name } : team,
          ),
        })),
      clearTeam: (teamId) =>
        set((state) => {
          const targetTeamId = teamId ?? state.activeTeamId

          return {
            teams: state.teams.map((team, index) =>
              team.id === targetTeamId ? { ...team, slots: createEmptySlots(index) } : team,
            ),
          }
        }),
      importTeam: (team, teamId) =>
        set((state) => {
          const targetTeamId = teamId ?? state.activeTeamId

          return {
            teams: state.teams.map((currentTeam, index) =>
              currentTeam.id === targetTeamId
                ? normalizeTeam({ ...team, id: currentTeam.id }, index)
                : currentTeam,
            ),
          }
        }),
      exportActiveTeam: () => exportTeam(get().getActiveTeam()),
    }),
    {
      name: 'arce-dex:team-store',
      storage: createJSONStorage(() => createLocalForageStateStorage()),
    },
  ),
)
