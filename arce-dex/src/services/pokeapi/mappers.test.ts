import { describe, expect, it } from 'vitest'
import type { PokeApiPokemonResponse } from '../../types/pokeapi'
import { getPokemonSprite, mapPokemonSummary } from './mappers'

describe('pokeapi mappers', () => {
  it('uses official artwork before other sprite fallbacks', () => {
    const pokemon = createPokemonResponse({
      officialArtwork: 'official.png',
      home: 'home.png',
      front: 'front.png',
    })

    expect(getPokemonSprite(pokemon)).toBe('official.png')
    expect(mapPokemonSummary(pokemon).imageUrl).toBe('official.png')
  })

  it('uses home artwork when official artwork is missing', () => {
    const pokemon = createPokemonResponse({
      officialArtwork: null,
      home: 'home.png',
      front: 'front.png',
    })

    expect(getPokemonSprite(pokemon)).toBe('home.png')
  })

  it('uses front_default when artwork sprites are missing', () => {
    const pokemon = createPokemonResponse({
      officialArtwork: null,
      home: null,
      front: 'front.png',
    })

    expect(getPokemonSprite(pokemon)).toBe('front.png')
  })

  it('uses preserved pokemon-form sprite as final remote fallback', () => {
    const pokemon = {
      ...createPokemonResponse({
        officialArtwork: null,
        home: null,
        front: null,
      }),
      formSprite: 'form.png',
    }

    expect(getPokemonSprite(pokemon)).toBe('form.png')
  })

  it('returns an empty sprite safely when no sprite exists', () => {
    const pokemon = createPokemonResponse({
      officialArtwork: null,
      home: null,
      front: null,
    })

    expect(getPokemonSprite(pokemon)).toBe('')
    expect(mapPokemonSummary(pokemon).imageUrl).toBe('')
  })
})

function createPokemonResponse({
  officialArtwork,
  home,
  front,
}: {
  officialArtwork: string | null
  home: string | null
  front: string | null
}): PokeApiPokemonResponse {
  return {
    id: 1,
    name: 'bulbasaur',
    height: 7,
    weight: 69,
    species: {
      name: 'bulbasaur',
      url: 'https://pokeapi.co/api/v2/pokemon-species/1/',
    },
    sprites: {
      other: {
        'official-artwork': {
          front_default: officialArtwork,
          front_shiny: null,
        },
        home: {
          front_default: home,
          front_shiny: null,
        },
      },
      front_default: front,
      front_shiny: null,
    },
    types: [
      {
        slot: 1,
        type: {
          name: 'grass',
          url: 'https://pokeapi.co/api/v2/type/12/',
        },
      },
    ],
    abilities: [],
    stats: [],
    moves: [],
    forms: [],
    cries: {
      latest: null,
      legacy: null,
    },
  }
}
