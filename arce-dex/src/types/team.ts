import type { PokemonStats, PokemonStatName, PokemonTypeName } from './pokemon'

export type CompetitiveStatTable = Record<PokemonStatName, number>

export type PokemonNature =
  | 'neutral'
  | 'hardy'
  | 'lonely'
  | 'brave'
  | 'adamant'
  | 'naughty'
  | 'bold'
  | 'docile'
  | 'relaxed'
  | 'impish'
  | 'lax'
  | 'timid'
  | 'hasty'
  | 'serious'
  | 'jolly'
  | 'naive'
  | 'modest'
  | 'mild'
  | 'quiet'
  | 'bashful'
  | 'rash'
  | 'calm'
  | 'gentle'
  | 'sassy'
  | 'careful'
  | 'quirky'

export type TeamRole =
  | ''
  | 'physical-sweeper'
  | 'special-sweeper'
  | 'physical-tank'
  | 'special-tank'
  | 'support'
  | 'lead'
  | 'pivot'
  | 'wallbreaker'
  | 'hazard-setter'
  | 'hazard-remover'

export type TeamPokemon = {
  id: number
  name: string
  displayName: string
  sprite: string
  types: PokemonTypeName[]
  level?: number
  nature?: PokemonNature
  ability?: string
  item?: string
  moves?: string[]
  evs?: CompetitiveStatTable
  ivs?: CompetitiveStatTable
  role?: TeamRole
  notes?: string
  baseStats?: PokemonStats
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
