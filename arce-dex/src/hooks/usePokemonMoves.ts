import { useQuery } from '@tanstack/react-query'
import { findPokemon } from '../services/pokeapi/endpoints'
import { mapPokemonDetail } from '../services/pokeapi/mappers'
import { normalizePokemonSearch } from '../lib/utils'

export function usePokemonMoves(identifier: string | number | null, search = '') {
  const normalizedIdentifier =
    typeof identifier === 'string' ? normalizePokemonSearch(identifier) : identifier

  return useQuery({
    queryKey: ['pokemon-moves', normalizedIdentifier, search],
    queryFn: async () => {
      const pokemon = mapPokemonDetail(await findPokemon(normalizedIdentifier as string | number))
      const normalizedSearch = search.trim().toLowerCase()

      if (!normalizedSearch) {
        return pokemon.moves
      }

      return pokemon.moves.filter((move) => move.name.includes(normalizedSearch))
    },
    enabled: normalizedIdentifier !== null && normalizedIdentifier !== '',
  })
}
