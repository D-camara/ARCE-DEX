import type {
  EvolutionChain,
  EvolutionNode,
  AbilityDetail,
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
  PokeApiAbilityResponse,
  PokeApiEvolutionNode,
  PokeApiNamedResource,
  PokeApiPokemonResponse,
  PokeApiResolvedPokemonResponse,
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
  const id = getIdFromPokeApiUrl(resource.url)

  return {
    id,
    name: resource.name,
    displayName: formatPokemonName(resource.name),
    url: resource.url,
    sprite:
      id === null
        ? ''
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    category: getFormCategory(resource.name),
  }
}

function getFormCategory(name: string): string {
  if (name.includes('mega')) {
    return 'Mega'
  }

  if (name.includes('gmax') || name.includes('gigantamax')) {
    return 'Gigantamax'
  }

  if (name.includes('alola')) {
    return 'Alola'
  }

  if (name.includes('galar')) {
    return 'Galar'
  }

  if (name.includes('hisui')) {
    return 'Hisui'
  }

  if (name.includes('paldea')) {
    return 'Paldea'
  }

  return 'Forma'
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
  const sprite = getPokemonSprite(pokemon)
  const shinySprite =
    pokemon.sprites.other?.['official-artwork']?.front_shiny ??
    pokemon.sprites.other?.home?.front_shiny ??
    pokemon.sprites.front_shiny ??
    undefined

  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName: formatPokemonName(pokemon.name),
    sprite,
    shinySprite,
    imageUrl: sprite,
    types: pokemon.types
      .sort((left, right) => left.slot - right.slot)
      .map(({ type }) => type.name as PokemonTypeName),
  }
}

export function getPokemonSprite(pokemon: PokeApiPokemonResponse): string {
  const resolvedPokemon = pokemon as PokeApiResolvedPokemonResponse

  return (
    pokemon.sprites.other?.['official-artwork']?.front_default ??
    pokemon.sprites.other?.home?.front_default ??
    pokemon.sprites.front_default ??
    resolvedPokemon.formSprite ??
    ''
  )
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
    cryUrl: pokemon.cries.latest ?? pokemon.cries.legacy ?? undefined,
    abilities: pokemon.abilities.map(mapPokemonAbility),
    stats: mapPokemonStats(pokemon),
    moves: pokemon.moves.map(mapPokemonMove),
    speciesUrl: pokemon.species.url,
    forms: pokemon.forms.map(mapNamedResourceToForm),
  }
}

export function mapAbilityDetail(ability: PokeApiAbilityResponse): AbilityDetail {
  const effectEntry = ability.effect_entries.find((entry) => entry.language.name === 'en')
  const flavorEntry = ability.flavor_text_entries.find((entry) => entry.language.name === 'en')

  return {
    id: ability.id,
    name: ability.name,
    displayName: formatPokemonName(ability.name),
    generation: formatPokemonName(ability.generation.name),
    shortEffect: effectEntry?.short_effect ?? 'Descricao nao encontrada para esta habilidade.',
    effect: effectEntry?.effect ?? 'Descricao nao encontrada para esta habilidade.',
    flavorText:
      flavorEntry?.flavor_text.replace(/\s+/g, ' ') ??
      'Flavor text nao encontrado para esta habilidade.',
  }
}

export function mapPokemonSpecies(species: PokeApiPokemonSpeciesResponse): PokemonSpecies {
  return {
    id: species.id,
    name: species.name,
    displayName: formatPokemonName(species.name),
    baseHappiness: species.base_happiness,
    captureRate: species.capture_rate,
    genderRate: species.gender_rate,
    isBaby: species.is_baby,
    isLegendary: species.is_legendary,
    isMythical: species.is_mythical,
    generation: formatPokemonName(species.generation.name),
    eggGroups: species.egg_groups.map((group) => formatPokemonName(group.name)),
    evolutionChainUrl: species.evolution_chain?.url ?? null,
    varieties: species.varieties.map(({ is_default, pokemon }) => ({
      ...mapNamedResourceToForm(pokemon),
      isDefault: is_default,
    })),
  }
}

function mapEvolutionNode(node: PokeApiEvolutionNode): EvolutionNode {
  const id = getIdFromPokeApiUrl(node.species.url)

  return {
    id,
    name: node.species.name,
    displayName: formatPokemonName(node.species.name),
    speciesUrl: node.species.url,
    sprite:
      id === null
        ? ''
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    method: formatEvolutionMethod(node),
    evolvesTo: node.evolves_to.map(mapEvolutionNode),
  }
}

function formatEvolutionMethod(node: PokeApiEvolutionNode): string {
  const detail = node.evolution_details[0]

  if (!detail) {
    return 'Pokemon base'
  }

  if (detail.min_level !== null) {
    return `Lv. ${detail.min_level}`
  }

  if (detail.item) {
    return formatPokemonName(detail.item.name)
  }

  if (detail.held_item) {
    return `Hold ${formatPokemonName(detail.held_item.name)}`
  }

  if (detail.trigger?.name === 'trade') {
    return 'Trade'
  }

  if (detail.min_happiness !== null) {
    const time = detail.time_of_day ? ` durante ${detail.time_of_day}` : ''

    return `High friendship${time}`
  }

  if (detail.known_move) {
    return `Know ${formatPokemonName(detail.known_move.name)}`
  }

  if (detail.location) {
    return formatPokemonName(detail.location.name)
  }

  if (detail.trigger) {
    return formatPokemonName(detail.trigger.name)
  }

  return 'Metodo nao informado'
}

export function mapEvolutionChain(chain: PokeApiEvolutionChainResponse): EvolutionChain {
  return {
    id: chain.id,
    root: mapEvolutionNode(chain.chain),
  }
}
