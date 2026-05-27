import { useQuery } from '@tanstack/react-query'
import { getEvolutionChain, getEvolutionChainByUrl } from '../services/pokeapi/endpoints'
import { mapEvolutionChain } from '../services/pokeapi/mappers'

export function useEvolutionChain(id: string | number | null) {
  return useQuery({
    queryKey: ['evolution-chain', id],
    queryFn: async () => {
      const evolutionChain =
        typeof id === 'string' && id.startsWith('http')
          ? await getEvolutionChainByUrl(id)
          : await getEvolutionChain(id as string | number)

      return mapEvolutionChain(evolutionChain)
    },
    enabled: id !== null,
  })
}
