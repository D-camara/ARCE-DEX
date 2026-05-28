export type PokeApiNamedResource = {
  name: string
  url: string
}

export type PokeApiListResponse<T = PokeApiNamedResource> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type PokeApiPokemonResponse = {
  id: number
  name: string
  height: number
  weight: number
  species: PokeApiNamedResource
  sprites: {
    other?: {
      'official-artwork'?: {
        front_default: string | null
        front_shiny?: string | null
      }
      home?: {
        front_default: string | null
        front_shiny?: string | null
      }
    }
    front_default: string | null
    front_shiny?: string | null
  }
  types: Array<{
    slot: number
    type: PokeApiNamedResource
  }>
  abilities: Array<{
    is_hidden: boolean
    ability: PokeApiNamedResource
  }>
  stats: Array<{
    base_stat: number
    stat: PokeApiNamedResource
  }>
  moves: Array<{
    move: PokeApiNamedResource
    version_group_details: Array<{
      level_learned_at: number
      move_learn_method: PokeApiNamedResource
    }>
  }>
  forms: PokeApiNamedResource[]
}

export type PokeApiMoveResponse = {
  id: number
  name: string
  accuracy: number | null
  power: number | null
  pp: number | null
  damage_class: PokeApiNamedResource
  type: PokeApiNamedResource
  effect_entries: Array<{
    effect: string
    short_effect: string
    language: PokeApiNamedResource
  }>
}

export type PokeApiPokemonSpeciesResponse = {
  id: number
  name: string
  base_happiness: number | null
  capture_rate: number
  gender_rate: number
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  generation: PokeApiNamedResource
  egg_groups: PokeApiNamedResource[]
  evolution_chain: {
    url: string
  } | null
  varieties: Array<{
    is_default: boolean
    pokemon: PokeApiNamedResource
  }>
}

export type PokeApiEvolutionChainResponse = {
  id: number
  chain: PokeApiEvolutionNode
}

export type PokeApiEvolutionNode = {
  species: PokeApiNamedResource
  evolution_details: Array<{
    min_level: number | null
    min_happiness: number | null
    time_of_day: string
    gender: number | null
    location: PokeApiNamedResource | null
    held_item: PokeApiNamedResource | null
    item: PokeApiNamedResource | null
    known_move: PokeApiNamedResource | null
    min_beauty: number | null
    min_affection: number | null
    needs_overworld_rain: boolean
    relative_physical_stats: number | null
    trigger: PokeApiNamedResource | null
  }>
  evolves_to: PokeApiEvolutionNode[]
}

export type PokeApiPokemonFormResponse = {
  id: number
  name: string
  is_default: boolean
  pokemon: PokeApiNamedResource
  sprites: {
    front_default: string | null
  }
}

export type PokeApiResolvedPokemonResponse = PokeApiPokemonResponse & {
  formSprite?: string | null
}

export type PokeApiTypeResponse = {
  id: number
  name: string
  damage_relations: {
    double_damage_from: PokeApiNamedResource[]
    double_damage_to: PokeApiNamedResource[]
    half_damage_from: PokeApiNamedResource[]
    half_damage_to: PokeApiNamedResource[]
    no_damage_from: PokeApiNamedResource[]
    no_damage_to: PokeApiNamedResource[]
  }
}
