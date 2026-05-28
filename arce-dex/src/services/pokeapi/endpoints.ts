import type {
  PokeApiEvolutionChainResponse,
  PokeApiAbilityResponse,
  PokeApiListResponse,
  PokeApiPokemonFormResponse,
  PokeApiPokemonResponse,
  PokeApiPokemonSpeciesResponse,
  PokeApiTypeResponse,
} from '../../types/pokeapi'
import { getPokemonSearchCandidates } from '../../lib/search'
import { pokeApiGet } from './client'

export function getPokemonList(limit = 151, offset = 0) {
  return pokeApiGet<PokeApiListResponse>(`/pokemon?limit=${limit}&offset=${offset}`)
}

export function getPokemon(identifier: string | number) {
  return pokeApiGet<PokeApiPokemonResponse>(`/pokemon/${identifier}`)
}

export async function findPokemon(identifier: string | number) {
  const candidates =
    typeof identifier === 'string' ? getPokemonSearchCandidates(identifier) : [identifier]
  let lastError: unknown

  for (const candidate of candidates) {
    try {
      return await getPokemon(candidate)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Pokemon nao encontrado para essa busca.')
}

export function getEvolutionChain(id: string | number) {
  return pokeApiGet<PokeApiEvolutionChainResponse>(`/evolution-chain/${id}`)
}

export function getEvolutionChainByUrl(url: string) {
  return pokeApiGet<PokeApiEvolutionChainResponse>(url)
}

export function getPokemonSpecies(identifier: string | number) {
  return pokeApiGet<PokeApiPokemonSpeciesResponse>(`/pokemon-species/${identifier}`)
}

export async function findPokemonSpecies(identifier: string | number) {
  const pokemon = await findPokemon(identifier)

  return pokeApiGet<PokeApiPokemonSpeciesResponse>(pokemon.species.url)
}

export function getPokemonForm(identifier: string | number) {
  return pokeApiGet<PokeApiPokemonFormResponse>(`/pokemon-form/${identifier}`)
}

export function getPokemonForms(identifier: string | number) {
  return getPokemon(identifier).then((pokemon) => pokemon.forms)
}

export function getPokemonMoves(identifier: string | number) {
  return getPokemon(identifier).then((pokemon) => pokemon.moves)
}

export function getType(identifier: string | number) {
  return pokeApiGet<PokeApiTypeResponse>(`/type/${identifier}`)
}

export function getAbility(identifier: string | number) {
  return pokeApiGet<PokeApiAbilityResponse>(`/ability/${identifier}`)
}
