import { useQuery } from '@tanstack/react-query'
import { findPokemon } from '@/shared/services/pokeapi/endpoints'
import { mapPokemonDetail } from '@/shared/services/pokeapi/mappers'
import { normalizePokemonSearch } from '@/shared/lib/utils'

export function usePokemon(identifier: string | number | null) {
  const normalizedIdentifier =
    typeof identifier === 'string' ? normalizePokemonSearch(identifier) : identifier

  return useQuery({
    queryKey: ['pokemon', normalizedIdentifier],
    queryFn: async () => mapPokemonDetail(await findPokemon(normalizedIdentifier as string | number)),
    enabled: normalizedIdentifier !== null && normalizedIdentifier !== '',
  })
}
