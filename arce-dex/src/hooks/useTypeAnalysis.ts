import { useMemo } from 'react'
import type { PokemonTypeName } from '../types/pokemon'
import { calculateTypeAnalysis } from '../lib/type-chart'

export function useTypeAnalysis(types: PokemonTypeName[]) {
  return useMemo(() => calculateTypeAnalysis(types), [types])
}
