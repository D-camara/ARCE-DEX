import { useQueries } from '@tanstack/react-query'
import { getMove } from '../services/pokeapi/endpoints'
import { mapMoveDetail } from '../services/pokeapi/mappers'
import type { PokemonMove } from '../types/pokemon'

export function useMovesDetails(moves: PokemonMove[]) {
  const names = [...new Set(moves.map((move) => move.name))].slice(0, 32)

  return useQueries({
    queries: names.map((name) => ({
      queryKey: ['move-detail', name],
      queryFn: async () => mapMoveDetail(await getMove(name)),
      staleTime: 1000 * 60 * 60,
    })),
  })
}
