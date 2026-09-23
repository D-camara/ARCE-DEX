import { describe, expect, it } from 'vitest'
import { DEFAULT_URL_STATE, parseUrlState, serializeUrlState, type UrlState } from './urlState'

describe('urlState', () => {
  it('falls back to defaults for an empty query string', () => {
    expect(parseUrlState('')).toEqual(DEFAULT_URL_STATE)
  })

  it('serializes defaults to an empty string', () => {
    expect(serializeUrlState(DEFAULT_URL_STATE)).toBe('')
  })

  it('round-trips a full state', () => {
    const state: UrlState = { view: 'team-lab', pokemon: 'garchomp', tab: 'Golpes' }

    expect(serializeUrlState(state)).toBe('?view=team&pokemon=garchomp&tab=golpes')
    expect(parseUrlState(serializeUrlState(state))).toEqual(state)
  })

  it('reads a numeric pokemon as an id', () => {
    expect(parseUrlState('?pokemon=445').pokemon).toBe(445)
  })

  it('accepts tab slugs in any case', () => {
    expect(parseUrlState('?tab=FRAQUEZAS').tab).toBe('Fraquezas')
  })

  it('ignores garbage values instead of breaking', () => {
    expect(parseUrlState('?view=nope&tab=nope&pokemon=0')).toEqual(DEFAULT_URL_STATE)
    expect(parseUrlState('?pokemon=%20%20')).toEqual(DEFAULT_URL_STATE)
  })
})
