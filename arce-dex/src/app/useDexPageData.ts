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
import { normalizePokemonSearch } from '@/shared/lib/utils'
import type { useAppView } from './useAppView'

export function useDexPageData(
  view: ReturnType<typeof useAppView>,
  { isFavoritesOpen }: { isFavoritesOpen: boolean },
) {
  const pokemonListQuery = usePokemonAutocompleteList()
  const selectedPokemonQuery = usePokemon(view.selectedIdentifier)
  const selectedPokemon = selectedPokemonQuery.data
  const selectedAbilityQuery = useAbility(view.selectedAbilityName)
  const selectedSpeciesQuery = usePokemonSpecies(selectedPokemon?.speciesUrl ?? null)
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
  const searchHistoryEntries = useSearchHistoryStore((state) => state.history)
  const searchHistory = useMemo(
    () => searchHistoryEntries.map((entry) => entry.term),
    [searchHistoryEntries],
  )
  const formIdentifiers = selectedSpecies?.varieties.map((form) => form.name) ?? []
  const summaries = useMemo(() => pokemonListQuery.data?.results ?? [], [pokemonListQuery.data])
  const visibleAutocompleteSuggestions = useMemo(
    () => getPokemonAutocompleteSuggestions(view.query, summaries),
    [view.query, summaries],
  )
  const autocompleteSummaryQuery = usePokemonSummaries(
    visibleAutocompleteSuggestions.map((pokemon) => pokemon.name),
  )
  // The selected Pokémon is already in the summary cache via selectedSummary (and its query
  // seeds the summary keys). Asking for it here too would race that query with a 2nd request.
  const selectedKeys = new Set(
    [view.selectedIdentifier, selectedPokemon?.name, selectedPokemon?.id].map((identifier) =>
      typeof identifier === 'string' ? normalizePokemonSearch(identifier) : identifier,
    ),
  )
  const relatedSummaryQuery = usePokemonSummaries(
    [...searchHistory.slice(0, 8), ...formIdentifiers].filter(
      (identifier) => !selectedKeys.has(normalizePokemonSearch(identifier)),
    ),
  )
  // Favorites can be many and are only shown in the drawer: fetch them when it opens.
  // Once fetched they stay cached, so closing the drawer doesn't lose them.
  const favoriteSummaryQuery = usePokemonSummaries(favoritePokemonIds, { enabled: isFavoritesOpen })

  const selectedSummary = selectedPokemon ? [selectedPokemon] : []
  const evolutionSummaries = flattenEvolutionNodes(evolutionChainQuery.data?.root)
  const summaryCache = mergePokemonSummaries(
    summaries,
    autocompleteSummaryQuery.data,
    evolutionSummaries,
    relatedSummaryQuery.data,
    favoriteSummaryQuery.data,
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
