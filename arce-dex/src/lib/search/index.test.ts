import { describe, expect, it } from 'vitest'
import {
  getPokemonAutocompleteSuggestions,
  getPokemonSearchCandidates,
  resolvePokemonSearchInput,
} from '.'
import type { PokemonSummary } from '../../types/pokemon'

function expectFirstCandidate(input: string, expected: string | number) {
  expect(resolvePokemonSearchInput(input)).toBe(expected)
}

const autocompleteSummaries: PokemonSummary[] = [
  createSummary(6, 'charizard'),
  createSummary(25, 'pikachu'),
  createSummary(848, 'toxel'),
  createSummary(849, 'toxtricity-amped'),
  createSummary(10184, 'toxtricity-low-key'),
  createSummary(10219, 'toxtricity-amped-gmax'),
  createSummary(10034, 'charizard-mega-x'),
  createSummary(10035, 'charizard-mega-y'),
  createSummary(10043, 'lucario-mega'),
  createSummary(10195, 'charizard-gmax'),
  createSummary(10100, 'raichu-alola'),
]

describe('pokemon search resolver', () => {
  it('normalizes numeric and # searches', () => {
    expectFirstCandidate('6', 6)
    expectFirstCandidate('#006', 6)
    expectFirstCandidate('001', 1)
    expectFirstCandidate('#001', 1)
    expectFirstCandidate('#848', 848)
    expectFirstCandidate('849', 849)
  })

  it('resolves mega aliases', () => {
    expectFirstCandidate('mega charizard x', 'charizard-mega-x')
    expectFirstCandidate('charizard mega x', 'charizard-mega-x')
    expectFirstCandidate('mega charizard y', 'charizard-mega-y')
    expectFirstCandidate('charizard mega y', 'charizard-mega-y')
    expectFirstCandidate('mega lucario', 'lucario-mega')
    expectFirstCandidate('lucario mega', 'lucario-mega')
    expectFirstCandidate('mega gengar', 'gengar-mega')
    expectFirstCandidate('venusaur mega', 'venusaur-mega')
    expect(getPokemonSearchCandidates('mega lucario z')).toContain('lucario-z-mega')
  })

  it('resolves gmax and gigantamax aliases', () => {
    expectFirstCandidate('gmax charizard', 'charizard-gmax')
    expectFirstCandidate('charizard g-max', 'charizard-gmax')
    expectFirstCandidate('gigantamax charizard', 'charizard-gmax')
    expectFirstCandidate('charizard gigantamax', 'charizard-gmax')
    expectFirstCandidate('gmax gengar', 'gengar-gmax')
    expectFirstCandidate('gigantamax lapras', 'lapras-gmax')
    expectFirstCandidate('gmax toxtricity', 'toxtricity-amped-gmax')
  })

  it('resolves toxtricity aliases', () => {
    expectFirstCandidate('toxtricity', 'toxtricity-amped')
    expectFirstCandidate('toxtricity amped', 'toxtricity-amped')
    expectFirstCandidate('amped toxtricity', 'toxtricity-amped')
    expectFirstCandidate('toxtricity low key', 'toxtricity-low-key')
    expectFirstCandidate('toxtricity low-key', 'toxtricity-low-key')
    expectFirstCandidate('low key toxtricity', 'toxtricity-low-key')
  })

  it('resolves regional form aliases', () => {
    expectFirstCandidate('alolan raichu', 'raichu-alola')
    expectFirstCandidate('raichu alola', 'raichu-alola')
    expectFirstCandidate('hisuian zoroark', 'zoroark-hisui')
    expectFirstCandidate('zoroark hisui', 'zoroark-hisui')
    expectFirstCandidate('galarian slowbro', 'slowbro-galar')
    expectFirstCandidate('paldean tauros', 'tauros-paldea-combat-breed')
  })

  it('falls back to hyphenated PokeAPI names', () => {
    expect(getPokemonSearchCandidates('mr mime')).toContain('mr-mime')
    expect(getPokemonSearchCandidates('mime jr')).toContain('mime-jr')
    expect(getPokemonSearchCandidates('porygon z')).toContain('porygon-z')
    expect(getPokemonSearchCandidates('ho oh')).toContain('ho-oh')
    expect(getPokemonSearchCandidates('jangmo o')).toContain('jangmo-o')
    expect(getPokemonSearchCandidates('hakamo o')).toContain('hakamo-o')
    expect(getPokemonSearchCandidates('kommo o')).toContain('kommo-o')
  })

  it('keeps autocomplete small and alias aware', () => {
    expect(getPokemonAutocompleteSuggestions('mega charizard', autocompleteSummaries)).toEqual([
      autocompleteSummaries[6],
      autocompleteSummaries[7],
    ])
    expect(getPokemonAutocompleteSuggestions('charizard mega', autocompleteSummaries)[0]).toBe(
      autocompleteSummaries[6],
    )
    expect(getPokemonAutocompleteSuggestions('gmax', autocompleteSummaries)[0]).toBe(
      autocompleteSummaries[5],
    )
    expect(getPokemonAutocompleteSuggestions('alolan', autocompleteSummaries)[0]).toBe(
      autocompleteSummaries[10],
    )
    expect(getPokemonAutocompleteSuggestions('low key', autocompleteSummaries)[0]).toBe(
      autocompleteSummaries[4],
    )
    expect(getPokemonAutocompleteSuggestions('#849', autocompleteSummaries)[0]).toBe(
      autocompleteSummaries[3],
    )
    expect(getPokemonAutocompleteSuggestions('a', autocompleteSummaries)).toHaveLength(0)
  })
})

function createSummary(id: number, name: string): PokemonSummary {
  return {
    id,
    name,
    displayName: name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    sprite: '',
    imageUrl: '',
    types: [],
  }
}
