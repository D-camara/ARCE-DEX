import { useQuery } from '@tanstack/react-query'
import { getPokemon, getPokemonList } from '../services/pokeapi/endpoints'
import { mapPokemonSummary } from '../services/pokeapi/mappers'

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
