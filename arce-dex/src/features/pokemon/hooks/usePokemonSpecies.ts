import { useQuery } from '@tanstack/react-query'
import { findPokemonSpecies } from '@/shared/services/pokeapi/endpoints'
import { mapPokemonSpecies } from '@/shared/services/pokeapi/mappers'
import { normalizePokemonSearch } from '@/shared/lib/utils'

export function usePokemonSpecies(identifier: string | number | null) {
  const normalizedIdentifier =
    typeof identifier === 'string' ? normalizePokemonSearch(identifier) : identifier

  return useQuery({
    queryKey: ['pokemon-species', normalizedIdentifier],
    queryFn: async () =>
      mapPokemonSpecies(await findPokemonSpecies(normalizedIdentifier as string | number)),
    enabled: normalizedIdentifier !== null && normalizedIdentifier !== '',
  })
}
