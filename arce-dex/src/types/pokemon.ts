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
  imageUrl: string
  types: PokemonTypeName[]
}

export type PokemonMove = {
  name: string
  displayName: string
  learnedAtLevel: number | null
  learnMethod: string
}

export type Pokemon = PokemonSummary & {
  height: number
  weight: number
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
  evolutionChainUrl: string | null
  varieties: PokemonForm[]
}

export type EvolutionNode = {
  name: string
  displayName: string
  speciesUrl: string
  method: string
  evolvesTo: EvolutionNode[]
}

export type EvolutionChain = {
  id: number
  root: EvolutionNode
}

export type PokemonForm = {
  name: string
  displayName: string
  url: string
  isDefault?: boolean
}

export type TypeEffectiveness = {
  type: PokemonTypeName
  multiplier: number
}
