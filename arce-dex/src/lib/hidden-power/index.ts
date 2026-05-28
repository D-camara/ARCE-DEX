import type { PokemonStatName, PokemonTypeName } from '../../types/pokemon'
import type { CompetitiveStatTable } from '../../types/team'
import { getDefaultIvs } from '../stats'

export const HIDDEN_POWER_TYPES: PokemonTypeName[] = [
  'fighting',
  'flying',
  'poison',
  'ground',
  'rock',
  'bug',
  'ghost',
  'steel',
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'ice',
  'dragon',
  'dark',
]

export const HIDDEN_POWER_STAT_ORDER: PokemonStatName[] = [
  'hp',
  'attack',
  'defense',
  'speed',
  'special-attack',
  'special-defense',
]

export type HiddenPowerResult = {
  type: PokemonTypeName
  typeIndex: number
  bits: Record<PokemonStatName, number>
  weightedValue: number
  ivs: CompetitiveStatTable
  isPerfectIvSpread: boolean
}

export function calculateHiddenPowerType(
  ivInput?: Partial<CompetitiveStatTable>,
): HiddenPowerResult {
  const ivs = normalizeHiddenPowerIvs(ivInput)
  const bits = HIDDEN_POWER_STAT_ORDER.reduce<Record<PokemonStatName, number>>(
    (result, stat) => ({
      ...result,
      [stat]: ivs[stat] % 2,
    }),
    {} as Record<PokemonStatName, number>,
  )
  const weightedValue =
    bits.hp +
    2 * bits.attack +
    4 * bits.defense +
    8 * bits.speed +
    16 * bits['special-attack'] +
    32 * bits['special-defense']
  const typeIndex = Math.floor((weightedValue * 15) / 63)

  return {
    type: HIDDEN_POWER_TYPES[typeIndex],
    typeIndex,
    bits,
    weightedValue,
    ivs,
    isPerfectIvSpread: HIDDEN_POWER_STAT_ORDER.every((stat) => ivs[stat] === 31),
  }
}

export function normalizeHiddenPowerIvs(
  ivInput?: Partial<CompetitiveStatTable>,
): CompetitiveStatTable {
  const defaults = getDefaultIvs()

  return HIDDEN_POWER_STAT_ORDER.reduce<CompetitiveStatTable>(
    (result, stat) => ({
      ...result,
      [stat]: clampIv(ivInput?.[stat] ?? defaults[stat]),
    }),
    {} as CompetitiveStatTable,
  )
}

function clampIv(value: number): number {
  if (!Number.isFinite(value)) {
    return 31
  }

  return Math.min(31, Math.max(0, Math.floor(value)))
}
