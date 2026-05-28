import { describe, expect, it } from 'vitest'
import {
  calculateFinalStat,
  calculateFinalStats,
  getDefaultEvs,
  getDefaultIvs,
  getNatureModifier,
  normalizeCompetitivePokemon,
} from '.'
import type { PokemonStats } from '../../types/pokemon'
import type { TeamPokemon } from '../../types/team'

const charizardBaseStats: PokemonStats = {
  hp: 78,
  attack: 84,
  defense: 78,
  'special-attack': 109,
  'special-defense': 85,
  speed: 100,
}

describe('competitive stats', () => {
  it('creates default EVs', () => {
    expect(getDefaultEvs()).toEqual({
      hp: 0,
      attack: 0,
      defense: 0,
      'special-attack': 0,
      'special-defense': 0,
      speed: 0,
    })
  })

  it('creates default IVs', () => {
    expect(getDefaultIvs()).toEqual({
      hp: 31,
      attack: 31,
      defense: 31,
      'special-attack': 31,
      'special-defense': 31,
      speed: 31,
    })
  })

  it('normalizes old team Pokemon with defaults', () => {
    const oldPokemon: TeamPokemon = {
      id: 6,
      name: 'charizard',
      displayName: 'Charizard',
      sprite: '',
      types: ['fire', 'flying'],
    }

    expect(normalizeCompetitivePokemon(oldPokemon)).toMatchObject({
      level: 50,
      nature: 'neutral',
      ability: '',
      item: '',
      moves: [],
      evs: getDefaultEvs(),
      ivs: getDefaultIvs(),
      role: '',
      notes: '',
    })
  })

  it('calculates HP with the Pokemon stat formula', () => {
    expect(
      calculateFinalStat({
        base: 78,
        ev: 0,
        iv: 31,
        level: 50,
        stat: 'hp',
      }),
    ).toBe(153)
  })

  it('calculates non-HP stats with neutral nature', () => {
    expect(
      calculateFinalStat({
        base: 100,
        ev: 0,
        iv: 31,
        level: 50,
        stat: 'speed',
      }),
    ).toBe(120)
  })

  it('returns nature modifiers for neutral, favorable and unfavorable stats', () => {
    expect(getNatureModifier('neutral', 'attack')).toBe(1)
    expect(getNatureModifier('adamant', 'attack')).toBe(1.1)
    expect(getNatureModifier('adamant', 'special-attack')).toBe(0.9)
  })

  it('calculates a complete final stat table', () => {
    const stats = calculateFinalStats(charizardBaseStats, {
      level: 50,
      nature: 'timid',
      evs: { ...getDefaultEvs(), speed: 252 },
      ivs: getDefaultIvs(),
    })

    expect(stats.hp.final).toBe(153)
    expect(stats.speed.final).toBe(167)
  })
})
