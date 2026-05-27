import {
  calculateOffensiveCoverage,
  calculateTeamDefensiveAnalysis,
  calculateTypeAnalysis,
} from '../lib/type-chart'
import type { Pokemon, PokemonSummary } from '../types/pokemon'
import type { Team, TeamPokemon, TeamSlot } from '../types/team'
import type { PokemonTabData } from '../components/pokemon/PokemonTabs'

export function toTeamPokemon(pokemon: Pokemon): TeamPokemon {
  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName: pokemon.displayName,
    sprite: pokemon.sprite,
    types: pokemon.types,
  }
}

function summaryToTeamPokemon(pokemon: PokemonSummary): TeamPokemon {
  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName: pokemon.displayName,
    sprite: pokemon.sprite,
    types: pokemon.types,
  }
}

export function createImportedSlots(
  pokemons: Array<string | number>,
  summaries: PokemonSummary[],
): TeamSlot[] {
  return Array.from({ length: 6 }, (_, index) => {
    const identifier = pokemons[index]
    const summary = summaries.find(
      (pokemon) => pokemon.name === identifier || pokemon.id === identifier,
    )

    return {
      id: `import-slot-${index + 1}`,
      pokemon: summary ? summaryToTeamPokemon(summary) : null,
    }
  })
}

export function uniqueSummaries(pokemons: PokemonSummary[]): PokemonSummary[] {
  return [...new Map(pokemons.map((pokemon) => [pokemon.id, pokemon])).values()]
}

export function createPokemonTabData(pokemon: Pokemon | undefined): PokemonTabData {
  const typeAnalysis = calculateTypeAnalysis(pokemon?.types ?? [])

  return {
    evolution: [],
    moves: pokemon?.moves.slice(0, 12) ?? [],
    weaknesses: typeAnalysis.weaknesses,
    resistances: typeAnalysis.resistances,
    immunities: typeAnalysis.immunities,
    forms: pokemon?.forms ?? [],
  }
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

export function getRecentPokemon(
  history: string[],
  summaries: PokemonSummary[],
): PokemonSummary[] {
  return history
    .map((item) =>
      summaries.find((pokemon) => pokemon.name === item || pokemon.displayName.toLowerCase() === item),
    )
    .filter((pokemon): pokemon is PokemonSummary => Boolean(pokemon))
}
