import { useMemo } from 'react'
import {
  usePokemon,
  useAbility,
  useEvolutionChain,
  usePokemonAutocompleteList,
  useMovesDetails,
  usePokemonSpecies,
  usePokemonSummaries,
} from '@/features/pokemon'
import { useFavoritesStore } from '@/features/favorites'
import { getPokemonAutocompleteSuggestions, useSearchHistoryStore } from '@/features/search'
import {
  flattenEvolutionNodes,
  getFavoritePokemon,
  createPokemonTabData,
  getRecentPokemon,
  mergePokemonSummaries,
  preparePokemonLevelUpMoves,
} from './appDataAdapters'
import type { useAppView } from './useAppView'

export function useDexPageData(view: ReturnType<typeof useAppView>) {
  const pokemonListQuery = usePokemonAutocompleteList()
  const selectedPokemonQuery = usePokemon(view.selectedIdentifier)
  const selectedPokemon = selectedPokemonQuery.data
  const selectedAbilityQuery = useAbility(view.selectedAbilityName)
  const selectedSpeciesQuery = usePokemonSpecies(view.selectedIdentifier)
  const selectedSpecies = selectedSpeciesQuery.data
  const evolutionChainQuery = useEvolutionChain(selectedSpecies?.evolutionChainUrl ?? null)
  const baseMoves = useMemo(
    () => preparePokemonLevelUpMoves(selectedPokemon?.moves ?? []).slice(0, 32),
    [selectedPokemon],
  )
  const moveDetailQueries = useMovesDetails(baseMoves)
  const moveDetails = useMemo(
    () =>
      moveDetailQueries
        .map((query) => query.data)
        .filter((move): move is NonNullable<typeof move> => Boolean(move)),
    [moveDetailQueries],
  )

  const favoritePokemonIds = useFavoritesStore((state) => state.favoritePokemonIds)
  const searchHistory = useSearchHistoryStore((state) => state.history)
  const formIdentifiers = selectedSpecies?.varieties.map((form) => form.name) ?? []
  const summaries = useMemo(() => pokemonListQuery.data?.results ?? [], [pokemonListQuery.data])
  const visibleAutocompleteSuggestions = useMemo(
    () => getPokemonAutocompleteSuggestions(view.query, summaries),
    [view.query, summaries],
  )
  const autocompleteSummaryQuery = usePokemonSummaries(
    visibleAutocompleteSuggestions.map((pokemon) => pokemon.name),
  )
  const relatedSummaryQuery = usePokemonSummaries([
    ...searchHistory.slice(0, 8),
    ...favoritePokemonIds,
    ...formIdentifiers,
  ])

  const selectedSummary = selectedPokemon ? [selectedPokemon] : []
  const evolutionSummaries = flattenEvolutionNodes(evolutionChainQuery.data?.root)
  const summaryCache = mergePokemonSummaries(
    summaries,
    autocompleteSummaryQuery.data,
    evolutionSummaries,
    relatedSummaryQuery.data,
    selectedSummary,
  )

  const pokemonTabData = useMemo(
    () =>
      createPokemonTabData(
        selectedPokemon,
        selectedSpecies,
        evolutionChainQuery.data,
        summaryCache,
        moveDetails,
      ),
    [evolutionChainQuery.data, moveDetails, selectedPokemon, selectedSpecies, summaryCache],
  )
  const favoritePokemon = getFavoritePokemon(favoritePokemonIds, summaryCache)
  const recentPokemon = getRecentPokemon(searchHistory, summaryCache)

  return {
    pokemonListQuery,
    selectedPokemonQuery,
    selectedPokemon,
    selectedAbilityQuery,
    summaryCache,
    pokemonTabData,
    favoritePokemon,
    recentPokemon,
  }
}
