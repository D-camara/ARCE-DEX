import { useQuery } from '@tanstack/react-query'
import { getPokemonList } from '../services/pokeapi/endpoints'

export function usePokemonList(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ['pokemon-list', limit, offset],
    queryFn: () => getPokemonList(limit, offset),
  })
}
