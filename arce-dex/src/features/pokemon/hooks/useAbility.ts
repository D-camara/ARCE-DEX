import { useQuery } from '@tanstack/react-query'
import { getAbility } from '@/shared/services/pokeapi/endpoints'
import { mapAbilityDetail } from '@/shared/services/pokeapi/mappers'

export function useAbility(name: string | null) {
  return useQuery({
    queryKey: ['ability', name],
    queryFn: async () => mapAbilityDetail(await getAbility(name as string)),
    enabled: Boolean(name),
  })
}
