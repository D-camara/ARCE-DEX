import { useQuery, useQueryClient } from '@tanstack/react-query'
import { findPokemon } from '@/shared/services/pokeapi/endpoints'
import { mapPokemonDetail } from '@/shared/services/pokeapi/mappers'
import { normalizePokemonSearch } from '@/shared/lib/utils'

export function usePokemon(identifier: string | number | null) {
  const normalizedIdentifier =
    typeof identifier === 'string' ? normalizePokemonSearch(identifier) : identifier

  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['pokemon', normalizedIdentifier],
    queryFn: async () => {
      const result = mapPokemonDetail(await findPokemon(normalizedIdentifier as string | number))
      // Also cache under the canonical name: the URL gets rewritten from id/alias to the
      // name once loaded, and that must not trigger a second fetch.
      queryClient.setQueryData(['pokemon', result.name], result)
      return result
    },
    enabled: normalizedIdentifier !== null && normalizedIdentifier !== '',
  })
}
