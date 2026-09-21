import { useMemo } from 'react'
import type { PokemonTypeName } from '@/shared/types/pokemon'
import { calculateTypeAnalysis } from '../lib/type-chart'

export function useTypeAnalysis(types: PokemonTypeName[]) {
  return useMemo(() => calculateTypeAnalysis(types), [types])
}
