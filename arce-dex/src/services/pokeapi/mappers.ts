import type {
  EvolutionChain,
  EvolutionNode,
  Pokemon,
  PokemonAbility,
  PokemonForm,
  PokemonMove,
  PokemonSpecies,
  PokemonStats,
  PokemonSummary,
  PokemonTypeName,
} from '../../types/pokemon'
import type {
  PokeApiEvolutionChainResponse,
  PokeApiEvolutionNode,
  PokeApiNamedResource,
  PokeApiPokemonResponse,
  PokeApiPokemonSpeciesResponse,
} from '../../types/pokeapi'
import type { TeamPokemon } from '../../types/team'
import { formatPokemonName } from '../../lib/utils'

const DEFAULT_STATS: PokemonStats = {
  hp: 0,
  attack: 0,
  defense: 0,
  'special-attack': 0,
  'special-defense': 0,
  speed: 0,
}

function mapNamedResourceToForm(resource: PokeApiNamedResource): PokemonForm {
  return {
    name: resource.name,
    displayName: formatPokemonName(resource.name),
    url: resource.url,
  }
}

export function getIdFromPokeApiUrl(url: string): number | null {
  const match = url.match(/\/(\d+)\/?$/)

  return match ? Number(match[1]) : null
}

export function mapPokemonListResource(resource: PokeApiNamedResource): PokemonSummary | null {
  const id = getIdFromPokeApiUrl(resource.url)

  if (id === null) {
    return null
  }

  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

  return {
    id,
    name: resource.name,
    displayName: formatPokemonName(resource.name),
    sprite: imageUrl,
    imageUrl,
    types: [],
  }
}

export function mapPokemonSummary(pokemon: PokeApiPokemonResponse): PokemonSummary {
  const sprite =
    pokemon.sprites.other?.['official-artwork']?.front_default ??
    pokemon.sprites.front_default ??
    ''

  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName: formatPokemonName(pokemon.name),
    sprite,
    imageUrl: sprite,
    types: pokemon.types
      .sort((left, right) => left.slot - right.slot)
      .map(({ type }) => type.name as PokemonTypeName),
  }
}

export function mapPokemonToTeamPokemon(pokemon: PokeApiPokemonResponse): TeamPokemon {
  const summary = mapPokemonSummary(pokemon)

  return {
    id: summary.id,
    name: summary.name,
    displayName: summary.displayName,
    sprite: summary.sprite,
    types: summary.types,
  }
}

function mapPokemonStats(pokemon: PokeApiPokemonResponse): PokemonStats {
  return pokemon.stats.reduce<PokemonStats>(
    (stats, item) => ({
      ...stats,
      [item.stat.name]: item.base_stat,
    }),
    DEFAULT_STATS,
  )
}

function mapPokemonAbility(
  ability: PokeApiPokemonResponse['abilities'][number],
): PokemonAbility {
  return {
    name: ability.ability.name,
    displayName: formatPokemonName(ability.ability.name),
    isHidden: ability.is_hidden,
  }
}

function mapPokemonMove(move: PokeApiPokemonResponse['moves'][number]): PokemonMove {
  const naturalLearn = move.version_group_details.find(
    (detail) => detail.move_learn_method.name === 'level-up',
  )
  const fallbackLearn = move.version_group_details[0]

  return {
    name: move.move.name,
    displayName: formatPokemonName(move.move.name),
    learnedAtLevel: naturalLearn?.level_learned_at ?? fallbackLearn?.level_learned_at ?? null,
    learnMethod:
      naturalLearn?.move_learn_method.name ?? fallbackLearn?.move_learn_method.name ?? 'unknown',
  }
}

export function mapPokemonDetail(pokemon: PokeApiPokemonResponse): Pokemon {
  return {
    ...mapPokemonSummary(pokemon),
    height: pokemon.height,
    weight: pokemon.weight,
    abilities: pokemon.abilities.map(mapPokemonAbility),
    stats: mapPokemonStats(pokemon),
    moves: pokemon.moves.map(mapPokemonMove),
    speciesUrl: pokemon.species.url,
    forms: pokemon.forms.map(mapNamedResourceToForm),
  }
}

export function mapPokemonSpecies(species: PokeApiPokemonSpeciesResponse): PokemonSpecies {
  return {
    id: species.id,
    name: species.name,
    displayName: formatPokemonName(species.name),
    evolutionChainUrl: species.evolution_chain?.url ?? null,
    varieties: species.varieties.map(({ is_default, pokemon }) => ({
      ...mapNamedResourceToForm(pokemon),
      isDefault: is_default,
    })),
  }
}

function mapEvolutionNode(node: PokeApiEvolutionNode): EvolutionNode {
  return {
    name: node.species.name,
    displayName: formatPokemonName(node.species.name),
    speciesUrl: node.species.url,
    evolvesTo: node.evolves_to.map(mapEvolutionNode),
  }
}

export function mapEvolutionChain(chain: PokeApiEvolutionChainResponse): EvolutionChain {
  return {
    id: chain.id,
    root: mapEvolutionNode(chain.chain),
  }
}
