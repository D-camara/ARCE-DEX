import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PokeApiPokemonFormResponse, PokeApiPokemonResponse } from '../../types/pokeapi'
import { findPokemon } from './endpoints'

describe('pokeapi endpoints', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('tries pokemon-form after pokemon and preserves the form sprite', async () => {
    const form = createPokemonFormResponse()
    const pokemon = createPokemonResponse('form-backed')

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input)

      if (url.endsWith('/pokemon/form-only')) {
        return createJsonResponse({}, 404)
      }

      if (url.endsWith('/pokemon-form/form-only')) {
        return createJsonResponse(form)
      }

      if (url.endsWith('/pokemon/form-backed')) {
        return createJsonResponse(pokemon)
      }

      return createJsonResponse({}, 404)
    })

    await expect(findPokemon('form only')).resolves.toMatchObject({
      name: 'form-backed',
      formSprite: 'form-sprite.png',
    })
  })

  it('rejects unresolved invalid forms without throwing synchronously', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(createJsonResponse({}, 404))

    await expect(findPokemon('mega lucario z')).rejects.toThrow()
  })
})

function createJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText: status === 200 ? 'OK' : 'Not Found',
    headers: {
      'content-type': 'application/json',
    },
  })
}

function createPokemonFormResponse(): PokeApiPokemonFormResponse {
  return {
    id: 9999,
    name: 'form-only',
    is_default: false,
    pokemon: {
      name: 'form-backed',
      url: 'https://pokeapi.co/api/v2/pokemon/form-backed/',
    },
    sprites: {
      front_default: 'form-sprite.png',
    },
  }
}

function createPokemonResponse(name: string): PokeApiPokemonResponse {
  return {
    id: 999,
    name,
    height: 10,
    weight: 100,
    species: {
      name,
      url: `https://pokeapi.co/api/v2/pokemon-species/${name}/`,
    },
    sprites: {
      other: {
        'official-artwork': {
          front_default: null,
          front_shiny: null,
        },
        home: {
          front_default: null,
          front_shiny: null,
        },
      },
      front_default: null,
      front_shiny: null,
    },
    types: [],
    abilities: [],
    stats: [],
    moves: [],
    forms: [],
  }
}
