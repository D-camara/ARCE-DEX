export type PokemonTypeName =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy'

export type PokemonType = PokemonTypeName

export type PokemonAbility = {
  name: string
  displayName: string
  isHidden: boolean
}

export type AbilityDetail = {
  id: number
  name: string
  displayName: string
  generation: string
  shortEffect: string
  effect: string
  flavorText: string
}

export type PokemonStatName =
  | 'hp'
  | 'attack'
  | 'defense'
  | 'special-attack'
  | 'special-defense'
  | 'speed'

export type PokemonStats = Record<PokemonStatName, number>

export type PokemonSummary = {
  id: number
  name: string
  displayName: string
  sprite: string
  shinySprite?: string
  imageUrl: string
  types: PokemonTypeName[]
}

export type PokemonMove = {
  name: string
  displayName: string
  learnedAtLevel: number | null
  learnMethod: string
  type?: PokemonTypeName
  category?: 'physical' | 'special' | 'status'
  categoryLabel?: string
  power?: number | null
  accuracy?: number | null
  pp?: number | null
  shortEffect?: string
  effect?: string
}

export type Pokemon = PokemonSummary & {
  height: number
  weight: number
  cryUrl?: string
  abilities: PokemonAbility[]
  stats: PokemonStats
  moves: PokemonMove[]
  speciesUrl: string
  forms: PokemonForm[]
}

export type PokemonDetail = Pokemon

export type PokemonSpecies = {
  id: number
  name: string
  displayName: string
  baseHappiness: number | null
  captureRate: number
  genderRate: number
  isBaby: boolean
  isLegendary: boolean
  isMythical: boolean
  generation: string
  eggGroups: string[]
  evolutionChainUrl: string | null
  varieties: PokemonForm[]
}

export type EvolutionNode = {
  id: number | null
  name: string
  displayName: string
  speciesUrl: string
  sprite: string
  method: string
  evolvesTo: EvolutionNode[]
}

export type EvolutionChain = {
  id: number
  root: EvolutionNode
}

export type PokemonForm = {
  id: number | null
  name: string
  displayName: string
  url: string
  sprite: string
  category: string
  types?: PokemonTypeName[]
  isDefault?: boolean
}

export type TypeEffectiveness = {
  type: PokemonTypeName
  multiplier: number
}
