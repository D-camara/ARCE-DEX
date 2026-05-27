import type { PokeApiListResponse, PokeApiPokemonResponse } from '../../types/pokeapi'
import { pokeApiGet } from './client'

export function getPokemonList(limit = 20, offset = 0) {
  return pokeApiGet<PokeApiListResponse>(`/pokemon?limit=${limit}&offset=${offset}`)
}

export function getPokemon(identifier: string | number) {
  return pokeApiGet<PokeApiPokemonResponse>(`/pokemon/${identifier}`)
}

export function getEvolutionChain(id: string | number) {
  return pokeApiGet<unknown>(`/evolution-chain/${id}`)
}

export function getPokemonSpecies(identifier: string | number) {
  return pokeApiGet<unknown>(`/pokemon-species/${identifier}`)
}
