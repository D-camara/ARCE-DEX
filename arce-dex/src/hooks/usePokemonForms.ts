import { useQuery } from '@tanstack/react-query'
import { getPokemon } from '../services/pokeapi/endpoints'
import { mapPokemonDetail } from '../services/pokeapi/mappers'
import { normalizePokemonSearch } from '../lib/utils'

export function usePokemonForms(identifier: string | number | null) {
  const normalizedIdentifier =
    typeof identifier === 'string' ? normalizePokemonSearch(identifier) : identifier

  return useQuery({
    queryKey: ['pokemon-forms', normalizedIdentifier],
    queryFn: async () => mapPokemonDetail(await getPokemon(normalizedIdentifier as string | number)).forms,
    enabled: normalizedIdentifier !== null && normalizedIdentifier !== '',
  })
}
