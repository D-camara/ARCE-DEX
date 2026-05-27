import type { PokemonSummary } from './pokemon'

export type TeamSlot = {
  id: string
  pokemon: PokemonSummary | null
}

export type Team = {
  id: string
  name: string
  slots: TeamSlot[]
}
