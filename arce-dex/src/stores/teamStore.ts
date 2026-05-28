import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { normalizeCompetitivePokemon } from '../lib/stats'
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
    pokemon: team.slots[index]?.pokemon
      ? normalizeCompetitivePokemon(team.slots[index].pokemon)
      : null,
  }))
}

function normalizeTeam(team: Team, teamIndex: number): Team {
  return {
    id: team.id || `team-${teamIndex + 1}`,
    name: team.name.trim() || `Time ${teamIndex + 1}`,
    slots: normalizeTeamSlots(team, teamIndex),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTeamPokemon(value: unknown): value is TeamPokemon {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.displayName === 'string' &&
    typeof value.sprite === 'string' &&
    Array.isArray(value.types)
  )
}

function createSlotsFromPokemonList(pokemonList: unknown, teamIndex: number): TeamSlot[] | null {
  if (!Array.isArray(pokemonList)) {
    return null
  }

  const slots = createEmptySlots(teamIndex)

  return slots.map((slot, index) => {
    const pokemon = pokemonList[index]

    return {
      ...slot,
      pokemon: isTeamPokemon(pokemon) ? normalizeCompetitivePokemon(pokemon) : null,
    }
  })
}

function parseImportedTeam(payload: string, fallbackTeam: Team, teamIndex: number): Team | null {
  let parsed: unknown

  try {
    parsed = JSON.parse(payload)
  } catch {
    return null
  }

  const imported = isRecord(parsed) && isRecord(parsed.team) ? parsed.team : parsed

  if (!isRecord(imported)) {
    return null
  }

  if (Array.isArray(imported.slots)) {
    return normalizeTeam(
      {
        id: fallbackTeam.id,
        name: typeof imported.name === 'string' ? imported.name : fallbackTeam.name,
        slots: imported.slots as TeamSlot[],
      },
      teamIndex,
    )
  }

  const slots = createSlotsFromPokemonList(imported.pokemon ?? imported.pokemons, teamIndex)

  if (!slots) {
    return null
  }

  return {
    id: fallbackTeam.id,
    name: typeof imported.name === 'string' ? imported.name.trim() || fallbackTeam.name : fallbackTeam.name,
    slots,
  }
}

function exportTeam(team: Team): string {
  return JSON.stringify(
    {
      version: 2,
      exportedAt: new Date().toISOString(),
      team: {
        id: team.id,
        name: team.name,
        slots: team.slots.map((slot) => ({
          id: slot.id,
          pokemon: slot.pokemon ? normalizeCompetitivePokemon(slot.pokemon) : null,
        })),
      },
    },
    null,
    2,
  )
}

function normalizeTeams(teams: Team[] | undefined): Team[] {
  const defaultTeams = createDefaultTeams()

  return defaultTeams.map((defaultTeam, index) =>
    normalizeTeam(teams?.[index] ?? defaultTeam, index),
  )
}

function normalizePersistedState(
  state: Partial<Pick<TeamStore, 'activeTeamId' | 'teams'>>,
): Pick<TeamStore, 'activeTeamId' | 'teams'> {
  const teams = normalizeTeams(state.teams)
  const fallbackTeamId = teams[0].id
  const activeTeamId =
    state.activeTeamId && teams.some((team) => team.id === state.activeTeamId)
      ? state.activeTeamId
      : fallbackTeamId

  return { activeTeamId, teams }
}

type TeamStore = {
  activeTeamId: string
  teams: Team[]
  getActiveTeam: () => Team
  setActiveTeam: (teamId: string) => void
  addPokemon: (pokemon: TeamPokemon, slotIndex?: number) => boolean
  addPokemonToTeam: (teamId: string, pokemon: TeamPokemon) => boolean
  updatePokemonInTeam: (
    teamId: string,
    slotIndex: number,
    updates: Partial<TeamPokemon>,
  ) => void
  removePokemon: (slotIndex: number, teamId?: string) => void
  renameTeam: (teamId: string, name: string) => void
  clearTeam: (teamId?: string) => void
  exportActiveTeam: () => string
  importTeam: (payload: string, teamId?: string) => boolean
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
                index === nextSlotIndex
                  ? { ...slot, pokemon: normalizeCompetitivePokemon(pokemon) }
                  : slot,
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
                index === nextSlotIndex
                  ? { ...slot, pokemon: normalizeCompetitivePokemon(pokemon) }
                  : slot,
              ),
            }
          }),
          activeTeamId: wasAdded ? teamId : state.activeTeamId,
        }))

        return wasAdded
      },
      updatePokemonInTeam: (teamId, slotIndex, updates) =>
        set((state) => ({
          teams: state.teams.map((team) =>
            team.id === teamId
              ? {
                  ...team,
                  slots: team.slots.map((slot, index) => {
                    if (index !== slotIndex || !slot.pokemon) {
                      return slot
                    }

                    return {
                      ...slot,
                      pokemon: normalizeCompetitivePokemon({
                        ...slot.pokemon,
                        ...updates,
                        id: slot.pokemon.id,
                        name: slot.pokemon.name,
                        displayName: slot.pokemon.displayName,
                        sprite: slot.pokemon.sprite,
                        types: slot.pokemon.types,
                      }),
                    }
                  }),
                }
              : team,
          ),
        })),
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
      exportActiveTeam: () => exportTeam(get().getActiveTeam()),
      importTeam: (payload, teamId) => {
        let wasImported = false

        set((state) => {
          const targetTeamId = teamId ?? state.activeTeamId

          return {
            teams: state.teams.map((team, index) => {
              if (team.id !== targetTeamId) {
                return team
              }

              const importedTeam = parseImportedTeam(payload, team, index)

              if (!importedTeam) {
                return team
              }

              wasImported = true
              return importedTeam
            }),
          }
        })

        return wasImported
      },
    }),
    {
      name: 'arce-dex:team-store',
      storage: createJSONStorage(() => createLocalForageStateStorage()),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizePersistedState(
          (persistedState ?? {}) as Partial<Pick<TeamStore, 'activeTeamId' | 'teams'>>,
        ),
      }),
    },
  ),
)
