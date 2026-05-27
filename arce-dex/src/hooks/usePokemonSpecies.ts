import { useQuery } from '@tanstack/react-query'
import { findPokemonSpecies } from '../services/pokeapi/endpoints'
import { mapPokemonSpecies } from '../services/pokeapi/mappers'
import { normalizePokemonSearch } from '../lib/utils'

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
