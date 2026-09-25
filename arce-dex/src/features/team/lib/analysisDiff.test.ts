import { describe, expect, it } from 'vitest'
import type { TeamDefensiveTypeSummary } from '@/features/type-analysis'
import { diffTeamAnalysis, snapshotTeamAnalysis } from './analysisDiff'

const row = (type: TeamDefensiveTypeSummary['type'], weakTo: number, immune = 0): TeamDefensiveTypeSummary => ({
  type,
  weakTo,
  resists: 0,
  immune,
})

describe('diffTeamAnalysis', () => {
  it('has nothing to show on the first visit', () => {
    expect(diffTeamAnalysis(null, snapshotTeamAnalysis([row('ice', 2)], []))).toBeNull()
  })

  it('has nothing to show when nothing changed', () => {
    const snapshot = snapshotTeamAnalysis([row('ice', 2)], ['dragon'])
    expect(diffTeamAnalysis(snapshot, snapshotTeamAnalysis([row('ice', 2)], ['dragon']))).toBeNull()
  })

  it('reports weaknesses going up and down, with a sentence for each', () => {
    const before = snapshotTeamAnalysis([row('ice', 2), row('fairy', 1)], null)
    const after = snapshotTeamAnalysis([row('ice', 3), row('fairy', 0)], null)

    const diff = diffTeamAnalysis(before, after)!

    expect(diff.weakToDelta).toEqual({ ice: 1, fairy: -1 })
    expect(diff.messages).toEqual(['Fraqueza a Ice subiu para 3.', 'Fraqueza a Fairy caiu para 0.'])
  })

  it('reports coverage gained and lost', () => {
    const diff = diffTeamAnalysis(
      snapshotTeamAnalysis([], ['dragon', 'fairy']),
      snapshotTeamAnalysis([], ['dragon', 'steel']),
    )!

    expect(diff.newlyCovered).toEqual(['steel'])
    expect(diff.noLongerCovered).toEqual(['fairy'])
    expect(diff.messages).toContain('Agora cobre Steel.')
  })

  it('does not compare coverage while move details are still loading', () => {
    expect(diffTeamAnalysis(snapshotTeamAnalysis([], ['dragon']), snapshotTeamAnalysis([], null))).toBeNull()
  })

  it('reports a new immunity', () => {
    const diff = diffTeamAnalysis(snapshotTeamAnalysis([], null), snapshotTeamAnalysis([row('ground', 0, 1)], null))!
    expect(diff.newlyImmune).toEqual(['ground'])
  })
})
