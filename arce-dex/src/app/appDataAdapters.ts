import {
  calculateOffensiveCoverage,
  calculateTeamDefensiveAnalysis,
  calculateTypeAnalysis,
} from '../lib/type-chart'
import type {
  EvolutionChain,
  EvolutionNode,
  Pokemon,
  PokemonForm,
  PokemonMove,
  PokemonSpecies,
  PokemonSummary,
} from '../types/pokemon'
import type { Team, TeamPokemon } from '../types/team'
import type { PokemonTabData } from '../components/pokemon/PokemonTabs'
import { normalizeCompetitivePokemon } from '../lib/stats'

export function toTeamPokemon(pokemon: Pokemon): TeamPokemon {
  return normalizeCompetitivePokemon({
    id: pokemon.id,
    name: pokemon.name,
    displayName: pokemon.displayName,
    sprite: pokemon.sprite,
    types: pokemon.types,
    baseStats: pokemon.stats,
  })
}

export function uniqueSummaries(pokemons: PokemonSummary[]): PokemonSummary[] {
  return [...new Map(pokemons.map((pokemon) => [pokemon.id, pokemon])).values()]
}

export function preparePokemonLevelUpMoves(moves: PokemonMove[]): PokemonMove[] {
  const naturalMoves = moves.filter((move) => move.learnMethod === 'level-up')
  const uniqueMoves = [...naturalMoves]
    .sort((left, right) => {
      const leftLevel = left.learnedAtLevel ?? Number.MAX_SAFE_INTEGER
      const rightLevel = right.learnedAtLevel ?? Number.MAX_SAFE_INTEGER

      return leftLevel - rightLevel
    })
    .reduce<Map<string, PokemonMove>>((movesByName, move) => {
      if (!movesByName.has(move.name)) {
        movesByName.set(move.name, move)
      }

      return movesByName
    }, new Map())

  return [...uniqueMoves.values()].sort((left, right) => {
    const leftLevel = left.learnedAtLevel ?? Number.MAX_SAFE_INTEGER
    const rightLevel = right.learnedAtLevel ?? Number.MAX_SAFE_INTEGER

    if (leftLevel !== rightLevel) {
      return leftLevel - rightLevel
    }

    return left.displayName.localeCompare(right.displayName)
  })
}

export function createPokemonTabData(
  pokemon: Pokemon | undefined,
  species: PokemonSpecies | undefined,
  evolutionChain: EvolutionChain | undefined,
  enrichedSummaries: PokemonSummary[] = [],
  moveDetails: PokemonMove[] = [],
): PokemonTabData {
  const typeAnalysis = calculateTypeAnalysis(pokemon?.types ?? [])

  return {
    currentPokemonName: pokemon?.name ?? '',
    evolutionChain,
    infoItems: createPokemonInfoItems(species),
    moves: enrichPokemonMoves(
      preparePokemonLevelUpMoves(pokemon?.moves ?? []).slice(0, 32),
      moveDetails,
    ),
    weaknesses: typeAnalysis.weaknesses,
    resistances: typeAnalysis.resistances,
    immunities: typeAnalysis.immunities,
    effectiveness: typeAnalysis.effectiveness,
    forms: enrichPokemonForms(species?.varieties ?? pokemon?.forms ?? [], enrichedSummaries),
  }
}

function enrichPokemonMoves(moves: PokemonMove[], moveDetails: PokemonMove[]): PokemonMove[] {
  const detailsByName = new Map(moveDetails.map((move) => [move.name, move]))

  return moves.map((move) => ({
    ...detailsByName.get(move.name),
    ...move,
  }))
}

function createPokemonInfoItems(species: PokemonSpecies | undefined) {
  if (!species) {
    return []
  }

  return [
    { label: 'Geracao', value: species.generation },
    { label: 'Taxa de captura', value: String(species.captureRate) },
    { label: 'Genero', value: formatGenderRate(species.genderRate) },
    { label: 'Grupo de ovos', value: species.eggGroups.join(', ') || 'Nao informado' },
    { label: 'Lendario', value: formatBoolean(species.isLegendary) },
    { label: 'Mitico', value: formatBoolean(species.isMythical) },
    { label: 'Baby', value: formatBoolean(species.isBaby) },
    {
      label: 'Felicidade base',
      value: species.baseHappiness === null ? 'Nao informado' : String(species.baseHappiness),
    },
  ]
}

function formatBoolean(value: boolean) {
  return value ? 'Sim' : 'Nao'
}

function formatGenderRate(genderRate: number) {
  if (genderRate < 0) {
    return 'Sem genero'
  }

  const femaleRate = (genderRate / 8) * 100
  const maleRate = 100 - femaleRate

  return `${maleRate}% macho / ${femaleRate}% femea`
}

export function createTeamAnalysis(team: Team) {
  const defensiveSummary = calculateTeamDefensiveAnalysis(team)
  const teamTypes = team.slots.flatMap((slot) => slot.pokemon?.types ?? [])

  return {
    defensiveRisks: defensiveSummary
      .filter((summary) => summary.weakTo > 0)
      .sort((left, right) => right.weakTo - left.weakTo)
      .slice(0, 3),
    resistances: defensiveSummary
      .filter((summary) => summary.resists > 0)
      .map((summary) => summary.type),
    immunities: defensiveSummary
      .filter((summary) => summary.immune > 0)
      .map((summary) => summary.type),
    coverage: calculateOffensiveCoverage(teamTypes),
  }
}

export type TeamAnalysis = ReturnType<typeof createTeamAnalysis>

export function getRecentPokemon(
  history: string[],
  summaries: PokemonSummary[],
): PokemonSummary[] {
  return history
    .map((item) => {
      const numericItem = Number(item)

      return summaries.find(
        (pokemon) =>
          pokemon.name === item ||
          pokemon.displayName.toLowerCase() === item ||
          (!Number.isNaN(numericItem) && pokemon.id === numericItem),
      )
    })
    .filter((pokemon): pokemon is PokemonSummary => Boolean(pokemon))
    .slice(0, 8)
}

export function getFavoritePokemon(
  favoriteIds: number[],
  summaries: PokemonSummary[],
): PokemonSummary[] {
  return favoriteIds
    .map((id) => summaries.find((pokemon) => pokemon.id === id))
    .filter((pokemon): pokemon is PokemonSummary => Boolean(pokemon))
}

export function mergePokemonSummaries(...groups: PokemonSummary[][]): PokemonSummary[] {
  const merged = new Map<number, PokemonSummary>()

  groups.flat().forEach((pokemon) => {
    const current = merged.get(pokemon.id)

    if (
      !current ||
      (current.types.length === 0 && pokemon.types.length > 0) ||
      (!current.imageUrl && pokemon.imageUrl)
    ) {
      merged.set(pokemon.id, pokemon)
    }
  })

  return [...merged.values()]
}

export function flattenEvolutionNodes(root: EvolutionNode | undefined): PokemonSummary[] {
  if (!root) {
    return []
  }

  return flattenEvolutionBranch(root)
}

function flattenEvolutionBranch(node: EvolutionNode): PokemonSummary[] {
  const current =
    node.id === null
      ? []
      : [
          {
            id: node.id,
            name: node.name,
            displayName: node.displayName,
            sprite: node.sprite,
            shinySprite: undefined,
            imageUrl: node.sprite,
            types: [],
          },
        ]

  return [...current, ...node.evolvesTo.flatMap(flattenEvolutionBranch)]
}

function enrichPokemonForms(forms: PokemonForm[], summaries: PokemonSummary[]): PokemonForm[] {
  return forms.map((form) => {
    const summary = summaries.find(
      (pokemon) => pokemon.name === form.name || (form.id !== null && pokemon.id === form.id),
    )

    return {
      ...form,
      id: form.id ?? summary?.id ?? null,
      sprite: form.sprite || summary?.imageUrl || summary?.sprite || '',
      types: summary?.types ?? form.types,
    }
  })
}
