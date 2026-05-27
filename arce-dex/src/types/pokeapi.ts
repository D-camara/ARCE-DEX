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
  sprites: {
    other?: {
      'official-artwork'?: {
        front_default: string | null
      }
    }
    front_default: string | null
  }
  types: Array<{
    slot: number
    type: PokeApiNamedResource
  }>
  abilities: Array<{
    ability: PokeApiNamedResource
  }>
  moves: Array<{
    move: PokeApiNamedResource
    version_group_details: Array<{
      level_learned_at: number
    }>
  }>
}
