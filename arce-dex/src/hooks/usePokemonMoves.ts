import { useQuery } from '@tanstack/react-query'
import { findPokemon, getMove } from '../services/pokeapi/endpoints'
import { mapMoveDetail, mapPokemonDetail } from '../services/pokeapi/mappers'
import { normalizePokemonSearch } from '../lib/utils'
import type { MoveDetail, PokemonMove } from '../types/pokemon'

export function usePokemonMoves(identifier: string | number | null, search = '') {
  const normalizedIdentifier =
    typeof identifier === 'string' ? normalizePokemonSearch(identifier) : identifier

  return useQuery({
    queryKey: ['pokemon-moves', normalizedIdentifier, search],
    queryFn: async () => {
      const pokemon = mapPokemonDetail(await findPokemon(normalizedIdentifier as string | number))
      const normalizedSearch = search.trim().toLowerCase()

      if (!normalizedSearch) {
        return pokemon.moves
      }

      return pokemon.moves.filter((move) => move.name.includes(normalizedSearch))
    },
    enabled: normalizedIdentifier !== null && normalizedIdentifier !== '',
  })
}

export function useMoveDetails(
  moveNames: string[],
  moveOptions: PokemonMove[] = [],
  maxMoves = 4,
) {
  const normalizedMoveNames = normalizeMoveNames(moveNames, maxMoves)

  return useQuery({
    queryKey: ['move-details', normalizedMoveNames],
    queryFn: async () => {
      const learnedMoveByName = new Map(moveOptions.map((move) => [move.name, move]))
      const details = await Promise.all(
        normalizedMoveNames.map(async (moveName) =>
          mapMoveDetail(await getMove(moveName), learnedMoveByName.get(moveName)),
        ),
      )

      return details.reduce<Record<string, MoveDetail>>(
        (result, detail) => ({
          ...result,
          [detail.name]: detail,
        }),
        {},
      )
    },
    enabled: normalizedMoveNames.length > 0,
  })
}

function normalizeMoveNames(moveNames: string[], maxMoves: number): string[] {
  return [
    ...new Set(
      moveNames
        .map((moveName) =>
          moveName
            .trim()
            .toLowerCase()
            .replace(/[_\s]+/g, '-'),
        )
        .filter(Boolean),
    ),
  ].slice(0, maxMoves)
}
