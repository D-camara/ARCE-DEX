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

export type PokemonSummary = {
  id: number
  name: string
  imageUrl: string
  types: PokemonTypeName[]
}

export type PokemonMove = {
  name: string
  learnedAtLevel?: number
}

export type PokemonDetail = PokemonSummary & {
  height: number
  weight: number
  abilities: string[]
  moves: PokemonMove[]
}
