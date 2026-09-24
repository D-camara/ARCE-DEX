import { useQuery, useQueryClient } from '@tanstack/react-query'
import { findPokemon } from '@/shared/services/pokeapi/endpoints'
import { mapPokemonDetail, mapPokemonSummary } from '@/shared/services/pokeapi/mappers'
import { normalizePokemonSearch } from '@/shared/lib/utils'

export function usePokemon(identifier: string | number | null) {
  const normalizedIdentifier =
    typeof identifier === 'string' ? normalizePokemonSearch(identifier) : identifier

  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['pokemon', normalizedIdentifier],
    queryFn: async () => {
      const response = await findPokemon(normalizedIdentifier as string | number)
      const result = mapPokemonDetail(response)
      // Also cache under the canonical name: the URL gets rewritten from id/alias to the
      // name once loaded, and that must not trigger a second fetch.
      queryClient.setQueryData(['pokemon', result.name], result)
      // The selected Pokémon usually also shows up as a summary (recent list, forms, evolution
      // chain). Same response — seed those keys instead of fetching /pokemon/<x> again.
      const summary = mapPokemonSummary(response)
      queryClient.setQueryData(['pokemon-summary', normalizePokemonSearch(response.name) || response.name], summary)
      queryClient.setQueryData(['pokemon-summary', response.id], summary)
      return result
    },
    enabled: normalizedIdentifier !== null && normalizedIdentifier !== '',
  })
}
