import { describe, expect, it } from 'vitest'
import {
  calculateOffensiveCoverage,
  calculateTeamDefensiveAnalysis,
  calculateTypeAnalysis,
  getTypeEffectiveness,
} from '.'
import type { TeamPokemon } from '../../types/team'

describe('type-chart', () => {
  it('calculates water/ground defensive profile', () => {
    const analysis = calculateTypeAnalysis(['water', 'ground'])

    expect(getTypeEffectiveness('grass', ['water', 'ground'])).toBe(4)
    expect(analysis.weaknesses).toEqual(['grass'])
    expect(analysis.immunities).toContain('electric')
  })

  it('calculates ghost defensive profile', () => {
    const analysis = calculateTypeAnalysis(['ghost'])

    expect(analysis.immunities).toEqual(expect.arrayContaining(['normal', 'fighting']))
    expect(analysis.weaknesses).toEqual(expect.arrayContaining(['ghost', 'dark']))
  })

  it('calculates normal/flying defensive profile', () => {
    const analysis = calculateTypeAnalysis(['normal', 'flying'])

    expect(analysis.weaknesses).toEqual(expect.arrayContaining(['electric', 'ice', 'rock']))
    expect(analysis.immunities).toEqual(expect.arrayContaining(['ground', 'ghost']))
  })

  it('calculates steel/fairy defensive profile', () => {
    const analysis = calculateTypeAnalysis(['steel', 'fairy'])

    expect(analysis.weaknesses).toEqual(expect.arrayContaining(['fire', 'ground']))
    expect(analysis.immunities).toEqual(expect.arrayContaining(['poison', 'dragon']))
  })

  it('summarizes team defensive counts', () => {
    const team: TeamPokemon[] = [
      {
        id: 260,
        name: 'swampert',
        displayName: 'Swampert',
        sprite: '',
        types: ['water', 'ground'],
      },
      {
        id: 94,
        name: 'gengar',
        displayName: 'Gengar',
        sprite: '',
        types: ['ghost', 'poison'],
      },
    ]

    const summary = calculateTeamDefensiveAnalysis(team)
    const grass = summary.find((item) => item.type === 'grass')
    const normal = summary.find((item) => item.type === 'normal')

    expect(grass?.weakTo).toBe(1)
    expect(normal?.immune).toBe(1)
  })

  it('calculates basic offensive coverage', () => {
    const coverage = calculateOffensiveCoverage(['water', 'ground'])

    expect(coverage.superEffectiveAgainst).toEqual(
      expect.arrayContaining(['fire', 'electric', 'rock', 'steel']),
    )
  })
})
