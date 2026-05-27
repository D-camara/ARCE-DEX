import { useQuery } from '@tanstack/react-query'
import { getPokemon } from '../services/pokeapi/endpoints'
import { mapPokemonDetail } from '../services/pokeapi/mappers'

export function usePokemon(identifier: string | number | null) {
  return useQuery({
    queryKey: ['pokemon', identifier],
    queryFn: async () => mapPokemonDetail(await getPokemon(identifier as string | number)),
    enabled: identifier !== null,
  })
}
