import type { PokemonDetail, PokemonSummary, PokemonTypeName } from '../../types/pokemon'
import type { PokeApiPokemonResponse } from '../../types/pokeapi'

export function mapPokemonSummary(pokemon: PokeApiPokemonResponse): PokemonSummary {
  return {
    id: pokemon.id,
    name: pokemon.name,
    imageUrl:
      pokemon.sprites.other?.['official-artwork']?.front_default ??
      pokemon.sprites.front_default ??
      '',
    types: pokemon.types
      .sort((left, right) => left.slot - right.slot)
      .map(({ type }) => type.name as PokemonTypeName),
  }
}

export function mapPokemonDetail(pokemon: PokeApiPokemonResponse): PokemonDetail {
  return {
    ...mapPokemonSummary(pokemon),
    height: pokemon.height,
    weight: pokemon.weight,
    abilities: pokemon.abilities.map(({ ability }) => ability.name),
    moves: pokemon.moves.map(({ move, version_group_details }) => ({
      name: move.name,
      learnedAtLevel: version_group_details[0]?.level_learned_at,
    })),
  }
}
