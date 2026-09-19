import { beforeEach, describe, expect, it } from 'vitest'
import { useTeamStore, MAX_TEAMS, TEAM_SIZE } from './teamStore'
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
})
