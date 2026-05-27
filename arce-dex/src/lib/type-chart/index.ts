import type { PokemonTypeName } from '../../types/pokemon'

export type TypeAnalysis = {
  weaknesses: PokemonTypeName[]
  resistances: PokemonTypeName[]
  immunities: PokemonTypeName[]
}

export function calculateTypeAnalysis(types: PokemonTypeName[]): TypeAnalysis {
  return {
    weaknesses: [],
    resistances: types,
    immunities: [],
  }
}
