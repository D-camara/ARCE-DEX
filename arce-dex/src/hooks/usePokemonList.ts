import { useQuery } from '@tanstack/react-query'
import { getPokemon, getPokemonList } from '../services/pokeapi/endpoints'
import { mapPokemonListResource, mapPokemonSummary } from '../services/pokeapi/mappers'

const DEFAULT_AUTOCOMPLETE_LIMIT = 1500

export function usePokemonList(limit = 151, offset = 0) {
  return useQuery({
    queryKey: ['pokemon-list', limit, offset],
    queryFn: async () => {
      const list = await getPokemonList(limit, offset)
      const pokemons = await Promise.all(
        list.results.map((pokemon) => getPokemon(pokemon.name).then(mapPokemonSummary)),
      )

      return {
        count: list.count,
        next: list.next,
        previous: list.previous,
        results: pokemons,
      }
    },
  })
}

export function usePokemonAutocompleteList(limit = DEFAULT_AUTOCOMPLETE_LIMIT, offset = 0) {
  return useQuery({
    queryKey: ['pokemon-autocomplete-list', limit, offset],
    queryFn: async () => {
      const list = await getPokemonList(limit, offset)

      return {
        count: list.count,
        next: list.next,
        previous: list.previous,
        results: list.results.flatMap((pokemon) => {
          const summary = mapPokemonListResource(pokemon)

          return summary ? [summary] : []
        }),
      }
    },
  })
}
