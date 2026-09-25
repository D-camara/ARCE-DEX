import { beforeEach, describe, expect, it } from 'vitest'
import { useTeamStore, MAX_TEAMS, TEAM_SIZE, stampChangedTeams } from './teamStore'
import { useTeamHighlightStore } from './teamHighlightStore'
import type { TeamPokemon } from '@/shared/types/team'

const pikachu: TeamPokemon = {
  id: 25,
  name: 'pikachu',
  displayName: 'Pikachu',
  sprite: '',
  types: ['electric'],
}

beforeEach(() => {
  useTeamStore.persist.clearStorage()
  useTeamStore.setState(useTeamStore.getInitialState(), true)
})

describe('teamStore', () => {
  it('moves a slot to another position and shifts the ones in between', () => {
    const lucario: TeamPokemon = { ...pikachu, id: 448, name: 'lucario', displayName: 'Lucario' }
    const { addPokemonToTeam, moveSlot } = useTeamStore.getState()
    addPokemonToTeam('team-1', pikachu)
    addPokemonToTeam('team-1', lucario)
    const old = new Date(0).toISOString()
    useTeamStore.setState((state) => ({ teams: state.teams.map((team) => ({ ...team, updatedAt: old })) }))

    moveSlot('team-1', 0, 2)

    const after = useTeamStore.getState().teams[0]
    expect(after.slots.map((slot) => slot.pokemon?.name ?? null).slice(0, 3)).toEqual(['lucario', null, 'pikachu'])
    // Stamped, so cloud sync (last-write-wins per team) pushes the new order.
    expect(after.updatedAt).not.toBe(old)
  })

  it('ignores a move to the same place or out of range (no stamp)', () => {
    useTeamStore.getState().addPokemonToTeam('team-1', pikachu)
    const before = useTeamStore.getState().teams[0]

    useTeamStore.getState().moveSlot('team-1', 0, 0)
    useTeamStore.getState().moveSlot('team-1', 0, 9)

    expect(useTeamStore.getState().teams[0]).toBe(before)
  })

  it('marks the slot filled from the Pokédex so the lab can highlight it once', () => {
    useTeamHighlightStore.getState().clear()
    useTeamStore.getState().addPokemonToTeam('team-2', pikachu)
    useTeamStore.getState().addPokemonToTeam('team-2', pikachu)

    expect(useTeamHighlightStore.getState().recentlyAdded).toEqual({ teamId: 'team-2', slotIndex: 1 })
    // Ephemeral: never part of the persisted/synced team state.
    expect(JSON.stringify(useTeamStore.getState().teams)).not.toContain('recentlyAdded')
  })

  it('starts with MAX_TEAMS empty teams', () => {
    const { teams } = useTeamStore.getState()

    expect(teams).toHaveLength(MAX_TEAMS)
    expect(teams[0].slots).toHaveLength(TEAM_SIZE)
    expect(teams[0].slots.every((slot) => slot.pokemon === null)).toBe(true)
  })

  it('adds a pokemon to the active team in the first empty slot', () => {
    const wasAdded = useTeamStore.getState().addPokemon(pikachu)

    expect(wasAdded).toBe(true)
    const activeTeam = useTeamStore.getState().getActiveTeam()
    expect(activeTeam.slots[0].pokemon?.name).toBe('pikachu')
  })

  it('does not add a pokemon when the active team is full', () => {
    for (let i = 0; i < TEAM_SIZE; i += 1) {
      useTeamStore.getState().addPokemon(pikachu)
    }

    const wasAdded = useTeamStore.getState().addPokemon(pikachu)

    expect(wasAdded).toBe(false)
  })

  it('removes a pokemon from a slot', () => {
    useTeamStore.getState().addPokemon(pikachu)
    useTeamStore.getState().removePokemon(0)

    const activeTeam = useTeamStore.getState().getActiveTeam()
    expect(activeTeam.slots[0].pokemon).toBeNull()
  })

  it('renames a team, falling back to the default name when blank', () => {
    const teamId = useTeamStore.getState().activeTeamId

    useTeamStore.getState().renameTeam(teamId, 'Aces')
    expect(useTeamStore.getState().getActiveTeam().name).toBe('Aces')

    useTeamStore.getState().renameTeam(teamId, '   ')
    expect(useTeamStore.getState().getActiveTeam().name).toBe('Aces')
  })

  it('clears a team back to empty slots', () => {
    useTeamStore.getState().addPokemon(pikachu)
    useTeamStore.getState().clearTeam()

    const activeTeam = useTeamStore.getState().getActiveTeam()
    expect(activeTeam.slots.every((slot) => slot.pokemon === null)).toBe(true)
  })

  it('exports and re-imports a team round-trip', () => {
    useTeamStore.getState().addPokemon(pikachu)
    const exported = useTeamStore.getState().exportActiveTeam()

    useTeamStore.getState().clearTeam()
    const wasImported = useTeamStore.getState().importTeam(exported)

    expect(wasImported).toBe(true)
    expect(useTeamStore.getState().getActiveTeam().slots[0].pokemon?.name).toBe('pikachu')
  })

  it('rejects an unparseable import payload', () => {
    const wasImported = useTeamStore.getState().importTeam('not json')

    expect(wasImported).toBe(false)
  })

  it('stamps updatedAt only on the team that was edited', () => {
    useTeamStore.getState().renameTeam('team-2', 'Rain')

    const teams = useTeamStore.getState().teams
    expect(Date.parse(teams[1].updatedAt ?? '')).not.toBeNaN()
    expect(teams.filter((team) => team.updatedAt)).toHaveLength(1)
  })

  it('does not stamp anything when an action changes nothing', () => {
    useTeamStore.getState().setActiveTeam('team-3')

    expect(useTeamStore.getState().teams.some((team) => team.updatedAt)).toBe(false)
  })
})

describe('stampChangedTeams', () => {
  it('stamps teams whose reference changed and keeps the rest as-is', () => {
    const previous = useTeamStore.getState().teams
    const next = previous.map((team, index) => (index === 0 ? { ...team, name: 'X' } : team))

    const stamped = stampChangedTeams(previous, next, '2026-01-01T00:00:00.000Z')

    expect(stamped[0].updatedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(stamped[1]).toBe(previous[1])
  })
})
