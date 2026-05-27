import { useMemo } from 'react'
import type { PokemonMove } from '../types/pokemon'

export function usePokemonMoves(moves: PokemonMove[] = [], search = '') {
  return useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return moves
    }

    return moves.filter((move) => move.name.includes(normalizedSearch))
  }, [moves, search])
}
