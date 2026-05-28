import { describe, expect, it } from 'vitest'
import type {
  PokeApiAbilityResponse,
  PokeApiMoveResponse,
  PokeApiPokemonResponse,
  PokeApiPokemonSpeciesResponse,
} from '../../types/pokeapi'
import {
  getPokemonSprite,
  mapAbilityDetail,
  mapMoveDetail,
  mapPokemonSpecies,
  mapPokemonSummary,
} from './mappers'

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

  it('maps detailed move data from PokeAPI', () => {
    expect(
      mapMoveDetail(createFlamethrowerResponse(), {
        name: 'flamethrower',
        displayName: 'Flamethrower',
        learnedAtLevel: 32,
        learnMethod: 'level-up',
      }),
    ).toEqual({
      name: 'flamethrower',
      displayName: 'Flamethrower',
      learnedAtLevel: 32,
      learnMethod: 'level-up',
      type: 'fire',
      category: 'special',
      power: 90,
      accuracy: 100,
      pp: 15,
      categoryLabel: 'Special',
      shortEffect: 'Has a 10% chance to burn the target.',
      effect: 'Has a 10% chance to burn the target.',
    })
  })

  it('formats generation roman numerals in uppercase', () => {
    const species = createPokemonSpeciesResponse()

    expect(mapPokemonSpecies(species).generation).toBe('Generation VII')
  })

  it('uses localized ability text without translating the ability name', () => {
    const ability = createAbilityResponse()

    expect(mapAbilityDetail(ability)).toMatchObject({
      displayName: 'Technician',
      generation: 'Generation IV',
      shortEffect: 'Aumenta golpes fracos.',
      effect: 'Aumenta golpes de poder baixo.',
      flavorText: 'Texto em portugues.',
    })
  })

  it('maps move details with friendly fallbacks', () => {
    const move = createMoveResponse()

    expect(mapMoveDetail(move)).toMatchObject({
      name: 'growl',
      displayName: 'Growl',
      type: 'normal',
      category: 'status',
      power: null,
      accuracy: 100,
      pp: 40,
      shortEffect: 'Descricao nao informada',
    })
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

function createFlamethrowerResponse(): PokeApiMoveResponse {
  return {
    id: 53,
    name: 'flamethrower',
    accuracy: 100,
    effect_chance: 10,
    power: 90,
    pp: 15,
    damage_class: {
      name: 'special',
      url: 'https://pokeapi.co/api/v2/move-damage-class/3/',
    },
    type: {
      name: 'fire',
      url: 'https://pokeapi.co/api/v2/type/10/',
    },
    effect_entries: [
      {
        effect: 'Has a $effect_chance% chance to burn the target.',
        short_effect: 'Has a $effect_chance% chance to burn the target.',
        language: {
          name: 'en',
          url: 'https://pokeapi.co/api/v2/language/9/',
        },
      },
    ],
    flavor_text_entries: [],
  }
}

function createPokemonSpeciesResponse(): PokeApiPokemonSpeciesResponse {
  return {
    id: 1,
    name: 'bulbasaur',
    base_happiness: 50,
    capture_rate: 45,
    gender_rate: 1,
    is_baby: false,
    is_legendary: false,
    is_mythical: false,
    generation: {
      name: 'generation-vii',
      url: 'https://pokeapi.co/api/v2/generation/7/',
    },
    egg_groups: [],
    evolution_chain: null,
    varieties: [],
  }
}

function createAbilityResponse(): PokeApiAbilityResponse {
  return {
    id: 101,
    name: 'technician',
    generation: {
      name: 'generation-iv',
      url: 'https://pokeapi.co/api/v2/generation/4/',
    },
    effect_entries: [
      {
        effect: 'Boosts weak moves.',
        short_effect: 'Boosts weak moves.',
        language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' },
      },
      {
        effect: 'Aumenta golpes de poder baixo.',
        short_effect: 'Aumenta golpes fracos.',
        language: { name: 'pt-BR', url: 'https://pokeapi.co/api/v2/language/10/' },
      },
    ],
    flavor_text_entries: [
      {
        flavor_text: 'Texto em portugues.',
        language: { name: 'pt-BR', url: 'https://pokeapi.co/api/v2/language/10/' },
        version_group: { name: 'scarlet-violet', url: '' },
      },
    ],
  }
}

function createMoveResponse(): PokeApiMoveResponse {
  return {
    id: 45,
    name: 'growl',
    accuracy: 100,
    effect_chance: null,
    pp: 40,
    power: null,
    type: { name: 'normal', url: 'https://pokeapi.co/api/v2/type/1/' },
    damage_class: { name: 'status', url: 'https://pokeapi.co/api/v2/move-damage-class/1/' },
    effect_entries: [],
    flavor_text_entries: [],
  }
}
