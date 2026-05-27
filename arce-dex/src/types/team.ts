import type { PokemonTypeName } from './pokemon'

export type TeamPokemon = {
  id: number
  name: string
  displayName: string
  sprite: string
  types: PokemonTypeName[]
}

export type TeamSlot = {
  id: string
  pokemon: TeamPokemon | null
}

export type Team = {
  id: string
  name: string
  slots: TeamSlot[]
}

export type SavedTeam = Team

export type CompactTeamExport = {
  name: string
  pokemons: Array<string | number>
}
