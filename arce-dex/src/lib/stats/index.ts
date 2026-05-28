import type { PokemonStatName, PokemonStats } from '../../types/pokemon'
import type {
  CompetitiveStatTable,
  PokemonNature,
  TeamPokemon,
  TeamRole,
} from '../../types/team'

export const COMPETITIVE_STAT_NAMES: PokemonStatName[] = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
]

export const DEFAULT_COMPETITIVE_LEVEL = 50
export const DEFAULT_COMPETITIVE_NATURE: PokemonNature = 'neutral'

const NATURE_EFFECTS: Partial<
  Record<PokemonNature, { increased: PokemonStatName; decreased: PokemonStatName }>
> = {
  lonely: { increased: 'attack', decreased: 'defense' },
  brave: { increased: 'attack', decreased: 'speed' },
  adamant: { increased: 'attack', decreased: 'special-attack' },
  naughty: { increased: 'attack', decreased: 'special-defense' },
  bold: { increased: 'defense', decreased: 'attack' },
  relaxed: { increased: 'defense', decreased: 'speed' },
  impish: { increased: 'defense', decreased: 'special-attack' },
  lax: { increased: 'defense', decreased: 'special-defense' },
  timid: { increased: 'speed', decreased: 'attack' },
  hasty: { increased: 'speed', decreased: 'defense' },
  jolly: { increased: 'speed', decreased: 'special-attack' },
  naive: { increased: 'speed', decreased: 'special-defense' },
  modest: { increased: 'special-attack', decreased: 'attack' },
  mild: { increased: 'special-attack', decreased: 'defense' },
  quiet: { increased: 'special-attack', decreased: 'speed' },
  rash: { increased: 'special-attack', decreased: 'special-defense' },
  calm: { increased: 'special-defense', decreased: 'attack' },
  gentle: { increased: 'special-defense', decreased: 'defense' },
  sassy: { increased: 'special-defense', decreased: 'speed' },
  careful: { increased: 'special-defense', decreased: 'special-attack' },
}

export type CalculatedStat = {
  base: number
  ev: number
  iv: number
  final: number
}

export type CalculatedStats = Record<PokemonStatName, CalculatedStat>

export function getDefaultEvs(): CompetitiveStatTable {
  return createStatTable(0)
}

export function getDefaultIvs(): CompetitiveStatTable {
  return createStatTable(31)
}

export function normalizeCompetitivePokemon(pokemon: TeamPokemon): TeamPokemon {
  return {
    ...pokemon,
    level: normalizeLevel(pokemon.level),
    nature: normalizeNature(pokemon.nature),
    ability: pokemon.ability ?? '',
    item: pokemon.item ?? '',
    moves: normalizeMoves(pokemon.moves),
    evs: normalizeStatTable(pokemon.evs, 0, 252),
    ivs: normalizeStatTable(pokemon.ivs, 31, 31),
    role: normalizeRole(pokemon.role),
    notes: pokemon.notes ?? '',
    baseStats: pokemon.baseStats ? normalizeBaseStats(pokemon.baseStats) : undefined,
  }
}

export function getNatureModifier(
  nature: PokemonNature | undefined,
  stat: PokemonStatName,
) {
  if (stat === 'hp') {
    return 1
  }

  const effect = NATURE_EFFECTS[normalizeNature(nature)]

  if (!effect) {
    return 1
  }

  if (effect.increased === stat) {
    return 1.1
  }

  if (effect.decreased === stat) {
    return 0.9
  }

  return 1
}

export function calculateFinalStat({
  base,
  ev,
  iv,
  level,
  natureModifier = 1,
  stat,
}: {
  base: number
  ev: number
  iv: number
  level: number
  natureModifier?: number
  stat: PokemonStatName
}) {
  const normalizedBase = clampInteger(base, 1, 255)
  const normalizedEv = clampInteger(ev, 0, 252)
  const normalizedIv = clampInteger(iv, 0, 31)
  const normalizedLevel = normalizeLevel(level)
  const effort = Math.floor(normalizedEv / 4)

  if (stat === 'hp') {
    return (
      Math.floor(((2 * normalizedBase + normalizedIv + effort) * normalizedLevel) / 100) +
      normalizedLevel +
      10
    )
  }

  return Math.floor(
    (Math.floor(((2 * normalizedBase + normalizedIv + effort) * normalizedLevel) / 100) +
      5) *
      natureModifier,
  )
}

export function calculateFinalStats(
  baseStats: PokemonStats,
  pokemon: Pick<TeamPokemon, 'evs' | 'ivs' | 'level' | 'nature'>,
): CalculatedStats {
  const normalizedBaseStats = normalizeBaseStats(baseStats)
  const evs = normalizeStatTable(pokemon.evs, 0, 252)
  const ivs = normalizeStatTable(pokemon.ivs, 31, 31)
  const level = normalizeLevel(pokemon.level)
  const nature = normalizeNature(pokemon.nature)

  return COMPETITIVE_STAT_NAMES.reduce<CalculatedStats>((stats, stat) => {
    const base = normalizedBaseStats[stat]
    const ev = evs[stat]
    const iv = ivs[stat]

    return {
      ...stats,
      [stat]: {
        base,
        ev,
        iv,
        final: calculateFinalStat({
          base,
          ev,
          iv,
          level,
          natureModifier: getNatureModifier(nature, stat),
          stat,
        }),
      },
    }
  }, {} as CalculatedStats)
}

function createStatTable(value: number): CompetitiveStatTable {
  return COMPETITIVE_STAT_NAMES.reduce<CompetitiveStatTable>(
    (stats, stat) => ({ ...stats, [stat]: value }),
    {} as CompetitiveStatTable,
  )
}

function normalizeStatTable(
  value: Partial<CompetitiveStatTable> | undefined,
  fallback: number,
  max: number,
): CompetitiveStatTable {
  return COMPETITIVE_STAT_NAMES.reduce<CompetitiveStatTable>(
    (stats, stat) => ({
      ...stats,
      [stat]: clampInteger(value?.[stat] ?? fallback, 0, max),
    }),
    {} as CompetitiveStatTable,
  )
}

function normalizeBaseStats(baseStats: PokemonStats): PokemonStats {
  return COMPETITIVE_STAT_NAMES.reduce<PokemonStats>(
    (stats, stat) => ({
      ...stats,
      [stat]: clampInteger(baseStats[stat], 1, 255),
    }),
    {} as PokemonStats,
  )
}

function normalizeLevel(level: number | undefined): number {
  return clampInteger(level ?? DEFAULT_COMPETITIVE_LEVEL, 1, 100)
}

function normalizeNature(nature: PokemonNature | undefined): PokemonNature {
  return nature ?? DEFAULT_COMPETITIVE_NATURE
}

function normalizeRole(role: TeamRole | undefined): TeamRole {
  return role ?? ''
}

function normalizeMoves(moves: string[] | undefined): string[] {
  if (!Array.isArray(moves)) {
    return []
  }

  return moves.filter((move) => typeof move === 'string').slice(0, 4)
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(max, Math.max(min, Math.floor(value)))
}
