import { useQuery } from '@tanstack/react-query'
import { getEvolutionChain } from '../services/pokeapi/endpoints'

export function useEvolutionChain(id: string | number | null) {
  return useQuery({
    queryKey: ['evolution-chain', id],
    queryFn: () => getEvolutionChain(id as string | number),
    enabled: id !== null,
  })
}
