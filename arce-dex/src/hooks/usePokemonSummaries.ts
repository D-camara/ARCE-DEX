import { useQueries } from '@tanstack/react-query'
import { getPokemon } from '../services/pokeapi/endpoints'
import { mapPokemonSummary } from '../services/pokeapi/mappers'
import { normalizePokemonSearch } from '../lib/utils'

export function usePokemonSummaries(identifiers: Array<string | number>) {
  const normalizedIdentifiers = [...new Set(
    identifiers
      .map((identifier) =>
        typeof identifier === 'string' ? normalizePokemonSearch(identifier) : identifier,
      )
      .filter((identifier) => identifier !== ''),
  )]

  const queries = useQueries({
    queries: normalizedIdentifiers.map((identifier) => ({
      queryKey: ['pokemon-summary', identifier],
      queryFn: async () => mapPokemonSummary(await getPokemon(identifier)),
      staleTime: 1000 * 60 * 30,
    })),
  })

  return {
    data: queries.flatMap((query) => (query.data ? [query.data] : [])),
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
  }
}
