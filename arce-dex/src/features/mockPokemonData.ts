import type { PokemonTypeName } from '../types/pokemon'

export type DisplayPokemon = {
  id: number
  name: string
  imageUrl: string
  types: PokemonTypeName[]
  genus: string
  height: string
  weight: string
  abilities: string[]
  stats: Array<{
    label: string
    value: number
  }>
}

export type PokemonSuggestion = Pick<
  DisplayPokemon,
  'id' | 'name' | 'imageUrl' | 'types'
>

export type PokemonTabData = {
  evolution: string[]
  moves: Array<{
    name: string
    level: number
    type: PokemonTypeName
  }>
  weaknesses: PokemonTypeName[]
  resistances: PokemonTypeName[]
  immunities: PokemonTypeName[]
  forms: string[]
}

export type TeamMock = {
  id: string
  name: string
  slots: Array<PokemonSuggestion | null>
}

export type TeamAnalysisMock = {
  defensiveRisks: Array<{
    type: PokemonTypeName
    score: string
  }>
  resistances: PokemonTypeName[]
  immunities: PokemonTypeName[]
  coverage: Array<{
    type: PokemonTypeName
    covered: boolean
  }>
}

export const featuredPokemon: DisplayPokemon = {
  id: 448,
  name: 'Lucario',
  imageUrl:
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png',
  types: ['fighting', 'steel'],
  genus: 'Aura Pokemon',
  height: '1.2 m',
  weight: '54.0 kg',
  abilities: ['Steadfast', 'Inner Focus', 'Justified'],
  stats: [
    { label: 'HP', value: 70 },
    { label: 'Atk', value: 110 },
    { label: 'Def', value: 70 },
    { label: 'SpA', value: 115 },
    { label: 'SpD', value: 70 },
    { label: 'Spe', value: 90 },
  ],
}

export const pokemonSuggestions: PokemonSuggestion[] = [
  featuredPokemon,
  {
    id: 6,
    name: 'Charizard',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    types: ['fire', 'flying'],
  },
  {
    id: 658,
    name: 'Greninja',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png',
    types: ['water', 'dark'],
  },
  {
    id: 282,
    name: 'Gardevoir',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png',
    types: ['psychic', 'fairy'],
  },
]

export const pokemonTabData: PokemonTabData = {
  evolution: ['Riolu', 'Lucario'],
  moves: [
    { name: 'Metal Claw', level: 1, type: 'steel' },
    { name: 'Aura Sphere', level: 24, type: 'fighting' },
    { name: 'Dragon Pulse', level: 40, type: 'dragon' },
  ],
  weaknesses: ['fire', 'fighting', 'ground'],
  resistances: ['normal', 'grass', 'ice', 'dragon', 'dark', 'steel'],
  immunities: ['poison'],
  forms: ['Lucario', 'Mega Lucario'],
}

export const mockTeams: TeamMock[] = [
  {
    id: 'team-1',
    name: 'História',
    slots: [
      featuredPokemon,
      pokemonSuggestions[1],
      pokemonSuggestions[2],
      null,
      null,
      null,
    ],
  },
  {
    id: 'team-2',
    name: 'Ranked',
    slots: [pokemonSuggestions[3], null, null, null, null, null],
  },
  { id: 'team-3', name: 'Time 3', slots: [null, null, null, null, null, null] },
  { id: 'team-4', name: 'Time 4', slots: [null, null, null, null, null, null] },
  { id: 'team-5', name: 'Time 5', slots: [null, null, null, null, null, null] },
  { id: 'team-6', name: 'Time 6', slots: [null, null, null, null, null, null] },
]

export const teamAnalysis: TeamAnalysisMock = {
  defensiveRisks: [
    { type: 'electric', score: '2 fracos' },
    { type: 'ground', score: '2 fracos' },
    { type: 'fairy', score: '1 fraco' },
  ],
  resistances: ['rock', 'bug', 'dark', 'steel'],
  immunities: ['poison'],
  coverage: [
    { type: 'fire', covered: true },
    { type: 'water', covered: true },
    { type: 'dragon', covered: true },
    { type: 'fairy', covered: false },
    { type: 'ghost', covered: false },
    { type: 'steel', covered: true },
  ],
}

export const favoritePokemon = [featuredPokemon, pokemonSuggestions[2]]
export const searchHistory = pokemonSuggestions.slice(0, 3)
