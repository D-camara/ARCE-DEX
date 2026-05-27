import { describe, expect, it } from 'vitest'
import { normalizePokemonSearch } from '.'

describe('normalizePokemonSearch', () => {
  it('normalizes Pokemon names', () => {
    expect(normalizePokemonSearch(' Pikachu ')).toBe('pikachu')
  })

  it('normalizes numeric searches', () => {
    expect(normalizePokemonSearch('25')).toBe(25)
  })

  it('normalizes # searches', () => {
    expect(normalizePokemonSearch('#25')).toBe(25)
    expect(normalizePokemonSearch('#025')).toBe(25)
  })

  it('normalizes human aliases', () => {
    expect(normalizePokemonSearch('Mega Charizard X')).toBe('charizard-mega-x')
    expect(normalizePokemonSearch('g-max Charizard')).toBe('charizard-gmax')
    expect(normalizePokemonSearch('Alolan Raichu')).toBe('raichu-alola')
  })
})
