import type {
  MoveDetail,
  PokemonMoveCategory,
  PokemonTypeName,
  TypeEffectiveness,
} from '../../types/pokemon'
import type { Team, TeamPokemon } from '../../types/team'

export type TypeAnalysis = {
  weaknesses: PokemonTypeName[]
  resistances: PokemonTypeName[]
  immunities: PokemonTypeName[]
  effectiveness: TypeEffectiveness[]
}

export type TeamDefensiveTypeSummary = {
  type: PokemonTypeName
  weakTo: number
  resists: number
  immune: number
}

export type OffensiveCoverage = {
  attackingTypes: PokemonTypeName[]
  superEffectiveAgainst: PokemonTypeName[]
  resistedBy: PokemonTypeName[]
  noEffectAgainst: PokemonTypeName[]
}

export type TeamOffensiveProfile = {
  coverage: OffensiveCoverage
  attackingTypes: PokemonTypeName[]
  moveCount: number
  pokemonWithoutMoves: number
  usedFallbackTypes: boolean
  categoryCounts: Record<PokemonMoveCategory, number>
}

export const ALL_POKEMON_TYPES: PokemonTypeName[] = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
]

const ATTACK_EFFECTIVENESS: Record<
  PokemonTypeName,
  Partial<Record<PokemonTypeName, number>>
> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2,
  },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: {
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5,
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    ground: 2,
    flying: 2,
    dragon: 2,
    steel: 0.5,
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: {
    grass: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
    fairy: 2,
  },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
    steel: 2,
  },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    bug: 2,
    steel: 0.5,
  },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    rock: 2,
    steel: 0.5,
    fairy: 2,
  },
  fairy: {
    fire: 0.5,
    fighting: 2,
    poison: 0.5,
    dragon: 2,
    dark: 2,
    steel: 0.5,
  },
}

export function getTypeEffectiveness(
  attackingType: PokemonTypeName,
  defendingTypes: PokemonTypeName[],
): number {
  return defendingTypes.reduce(
    (multiplier, defendingType) =>
      multiplier * (ATTACK_EFFECTIVENESS[attackingType][defendingType] ?? 1),
    1,
  )
}

export function calculateTypeEffectiveness(
  defendingTypes: PokemonTypeName[],
): TypeEffectiveness[] {
  return ALL_POKEMON_TYPES.map((type) => ({
    type,
    multiplier: getTypeEffectiveness(type, defendingTypes),
  }))
}

export function calculateWeaknesses(defendingTypes: PokemonTypeName[]): PokemonTypeName[] {
  return calculateTypeEffectiveness(defendingTypes)
    .filter((item) => item.multiplier > 1)
    .map((item) => item.type)
}

export function calculateResistances(defendingTypes: PokemonTypeName[]): PokemonTypeName[] {
  return calculateTypeEffectiveness(defendingTypes)
    .filter((item) => item.multiplier > 0 && item.multiplier < 1)
    .map((item) => item.type)
}

export function calculateImmunities(defendingTypes: PokemonTypeName[]): PokemonTypeName[] {
  return calculateTypeEffectiveness(defendingTypes)
    .filter((item) => item.multiplier === 0)
    .map((item) => item.type)
}

export function calculateTypeAnalysis(types: PokemonTypeName[]): TypeAnalysis {
  const effectiveness = calculateTypeEffectiveness(types)

  return {
    weaknesses: effectiveness.filter((item) => item.multiplier > 1).map((item) => item.type),
    resistances: effectiveness
      .filter((item) => item.multiplier > 0 && item.multiplier < 1)
      .map((item) => item.type),
    immunities: effectiveness.filter((item) => item.multiplier === 0).map((item) => item.type),
    effectiveness,
  }
}

export function calculatePokemonDefensiveAnalysis(pokemon: TeamPokemon): TypeAnalysis {
  return calculateTypeAnalysis(pokemon.types)
}

function getTeamPokemons(team: Team | TeamPokemon[]): TeamPokemon[] {
  if (Array.isArray(team)) {
    return team
  }

  return team.slots.flatMap((slot) => (slot.pokemon ? [slot.pokemon] : []))
}

export function calculateTeamDefensiveAnalysis(
  team: Team | TeamPokemon[],
): TeamDefensiveTypeSummary[] {
  const pokemons = getTeamPokemons(team)

  return ALL_POKEMON_TYPES.map((type) =>
    pokemons.reduce<TeamDefensiveTypeSummary>(
      (summary, pokemon) => {
        const multiplier = getTypeEffectiveness(type, pokemon.types)

        if (multiplier === 0) {
          return { ...summary, immune: summary.immune + 1 }
        }

        if (multiplier > 1) {
          return { ...summary, weakTo: summary.weakTo + 1 }
        }

        if (multiplier < 1) {
          return { ...summary, resists: summary.resists + 1 }
        }

        return summary
      },
      { type, weakTo: 0, resists: 0, immune: 0 },
    ),
  )
}

export function calculateOffensiveCoverage(
  attackingTypes: PokemonTypeName[],
): OffensiveCoverage {
  const uniqueAttackingTypes = [...new Set(attackingTypes)]

  return {
    attackingTypes: uniqueAttackingTypes,
    superEffectiveAgainst: ALL_POKEMON_TYPES.filter((defendingType) =>
      uniqueAttackingTypes.some((attackingType) =>
        getTypeEffectiveness(attackingType, [defendingType]) > 1,
      ),
    ),
    resistedBy: ALL_POKEMON_TYPES.filter((defendingType) =>
      uniqueAttackingTypes.every(
        (attackingType) => getTypeEffectiveness(attackingType, [defendingType]) < 1,
      ),
    ),
    noEffectAgainst: ALL_POKEMON_TYPES.filter((defendingType) =>
      uniqueAttackingTypes.every(
        (attackingType) => getTypeEffectiveness(attackingType, [defendingType]) === 0,
      ),
    ),
  }
}

export function calculateTeamOffensiveProfile(
  pokemons: TeamPokemon[],
  moveDetails: Record<string, MoveDetail> = {},
): TeamOffensiveProfile {
  const moveTypes = pokemons.flatMap((pokemon) =>
    (pokemon.moves ?? []).flatMap((moveName) => {
      const move = moveDetails[normalizeMoveName(moveName)]

      return move ? [move.type] : []
    }),
  )
  const hasMoveTypes = moveTypes.length > 0
  const attackingTypes = hasMoveTypes
    ? moveTypes
    : pokemons.flatMap((pokemon) => pokemon.types)

  return {
    attackingTypes: [...new Set(attackingTypes)],
    coverage: calculateOffensiveCoverage(attackingTypes),
    moveCount: pokemons.reduce((total, pokemon) => total + (pokemon.moves ?? []).length, 0),
    pokemonWithoutMoves: pokemons.filter((pokemon) => (pokemon.moves ?? []).length === 0).length,
    usedFallbackTypes: !hasMoveTypes,
    categoryCounts: summarizeMoveCategories(pokemons, moveDetails),
  }
}

function summarizeMoveCategories(
  pokemons: TeamPokemon[],
  moveDetails: Record<string, MoveDetail>,
): Record<PokemonMoveCategory, number> {
  return pokemons.reduce<Record<PokemonMoveCategory, number>>(
    (summary, pokemon) =>
      (pokemon.moves ?? []).reduce<Record<PokemonMoveCategory, number>>((nextSummary, moveName) => {
        const move = moveDetails[normalizeMoveName(moveName)]

        if (!move) {
          return nextSummary
        }

        return {
          ...nextSummary,
          [move.category]: nextSummary[move.category] + 1,
        }
      }, summary),
    { physical: 0, special: 0, status: 0 },
  )
}

function normalizeMoveName(moveName: string): string {
  return moveName.trim().toLowerCase().replace(/[_\s]+/g, '-')
}
