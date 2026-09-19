import { beforeEach, describe, expect, it } from 'vitest'
import { useSearchHistoryStore } from './searchHistoryStore'

beforeEach(() => {
  useSearchHistoryStore.setState({ history: [] })
})

describe('searchHistoryStore', () => {
  it('adds a normalized search term', () => {
    useSearchHistoryStore.getState().addSearch('  Pikachu  ')

    expect(useSearchHistoryStore.getState().history).toEqual(['pikachu'])
  })

  it('ignores an empty search term', () => {
    useSearchHistoryStore.getState().addSearch('   ')

    expect(useSearchHistoryStore.getState().history).toEqual([])
  })

  it('moves a repeated term to the front instead of duplicating it', () => {
    useSearchHistoryStore.getState().addSearch('pikachu')
    useSearchHistoryStore.getState().addSearch('charizard')
    useSearchHistoryStore.getState().addSearch('pikachu')

    expect(useSearchHistoryStore.getState().history).toEqual(['pikachu', 'charizard'])
  })

  it('caps history at 20 entries', () => {
    for (let i = 0; i < 25; i += 1) {
      useSearchHistoryStore.getState().addSearch(`pokemon-${i}`)
    }

    expect(useSearchHistoryStore.getState().history).toHaveLength(20)
    expect(useSearchHistoryStore.getState().history[0]).toBe('pokemon-24')
  })

  it('clears history', () => {
    useSearchHistoryStore.getState().addSearch('pikachu')
    useSearchHistoryStore.getState().clearHistory()

    expect(useSearchHistoryStore.getState().history).toEqual([])
  })
})
