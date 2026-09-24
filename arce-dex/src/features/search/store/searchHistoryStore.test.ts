import { beforeEach, describe, expect, it } from 'vitest'
import { migrateSearchHistory, useSearchHistoryStore } from './searchHistoryStore'

const terms = () => useSearchHistoryStore.getState().history.map((entry) => entry.term)

beforeEach(() => {
  useSearchHistoryStore.setState({ history: [] })
})

describe('searchHistoryStore', () => {
  it('adds a normalized search term with a timestamp', () => {
    useSearchHistoryStore.getState().addSearch('  Pikachu  ')

    expect(terms()).toEqual(['pikachu'])
    expect(Date.parse(useSearchHistoryStore.getState().history[0].searchedAt)).not.toBeNaN()
  })

  it('ignores an empty search term', () => {
    useSearchHistoryStore.getState().addSearch('   ')

    expect(terms()).toEqual([])
  })

  it('moves a repeated term to the front instead of duplicating it', () => {
    useSearchHistoryStore.getState().addSearch('pikachu')
    useSearchHistoryStore.getState().addSearch('charizard')
    useSearchHistoryStore.getState().addSearch('pikachu')

    expect(terms()).toEqual(['pikachu', 'charizard'])
  })

  it('caps history at 20 entries', () => {
    for (let i = 0; i < 25; i += 1) {
      useSearchHistoryStore.getState().addSearch(`pokemon-${i}`)
    }

    expect(terms()).toHaveLength(20)
    expect(terms()[0]).toBe('pokemon-24')
  })

  it('clears history', () => {
    useSearchHistoryStore.getState().addSearch('pikachu')
    useSearchHistoryStore.getState().clearHistory()

    expect(terms()).toEqual([])
  })
})

describe('migrateSearchHistory', () => {
  it('turns v0 plain terms into entries with descending timestamps, keeping order', () => {
    const migrated = migrateSearchHistory({ history: ['garchomp', 'pikachu'] }, 0) as {
      history: Array<{ term: string; searchedAt: string }>
    }

    expect(migrated.history.map((entry) => entry.term)).toEqual(['garchomp', 'pikachu'])
    expect(Date.parse(migrated.history[0].searchedAt)).toBeGreaterThan(
      Date.parse(migrated.history[1].searchedAt),
    )
  })

  it('leaves current-version state alone', () => {
    const state = { history: [{ term: 'pikachu', searchedAt: '2026-01-01T00:00:00.000Z' }] }
    expect(migrateSearchHistory(state, 1)).toEqual(state)
  })
})
