import { useQuery } from '@tanstack/react-query'
import { getPokemonSpeciesByUrl } from '@/shared/services/pokeapi/endpoints'
import { mapPokemonSpecies } from '@/shared/services/pokeapi/mappers'

/**
 * Takes the species URL from the already-loaded Pokémon (`pokemon.speciesUrl`) instead of
 * resolving the Pokémon again: no duplicate /pokemon request, and the cache key doesn't
 * change when the URL is canonicalized from an id to a name.
 */
export function usePokemonSpecies(speciesUrl: string | null) {
  return useQuery({
    queryKey: ['pokemon-species', speciesUrl],
    queryFn: async () => mapPokemonSpecies(await getPokemonSpeciesByUrl(speciesUrl as string)),
    enabled: speciesUrl !== null,
  })
}
