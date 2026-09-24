import { normalizePokemonSearch } from '@/shared/lib/utils'
import type { Pokemon, PokemonSummary } from '@/shared/types/pokemon'
import { useFavoritesStore } from '@/features/favorites'
import { useSearchHistoryStore } from '@/features/search'
import { useTeamStore } from '@/features/team'
import { toTeamPokemon } from './appDataAdapters'
import type { useAppView } from './useAppView'
import type { useAppDialogs } from './useAppDialogs'

type UseDexActionsParams = {
  view: ReturnType<typeof useAppView>
  dialogs: ReturnType<typeof useAppDialogs>
  selectedPokemon: Pokemon | undefined
}

// Handlers read stores at call time (getState) — they don't need to re-render on store changes.
const addSearch = (value: string) => useSearchHistoryStore.getState().addSearch(value)
const toggleFavorite = (pokemonId: number) => useFavoritesStore.getState().toggleFavorite(pokemonId)

export function useDexActions({ view, dialogs, selectedPokemon }: UseDexActionsParams) {
  function handleSearch(value: string) {
    const normalizedSearch = normalizePokemonSearch(value)

    if (normalizedSearch !== '') {
      view.setSelectedIdentifier(normalizedSearch)
      addSearch(String(normalizedSearch))
      view.setActiveView('dex')
      view.setIsAutocompleteOpen(false)
    }
  }

  function handleSelectPokemon(pokemon: PokemonSummary) {
    view.setSelectedIdentifier(pokemon.name)
    view.setQuery(pokemon.displayName)
    addSearch(pokemon.name)
    view.setActiveView('dex')
    view.setActivePokemonTab('Info')
    view.setIsAutocompleteOpen(false)
  }

  function handleSearchChange(value: string) {
    view.setQuery(value)
    view.setIsAutocompleteOpen(value.trim().length >= 2)
  }

  function handleAddToTeam() {
    if (!selectedPokemon) {
      return
    }

    dialogs.setSelectedAddTeamId(useTeamStore.getState().activeTeamId)
    dialogs.setIsAddToTeamOpen(true)
  }

  function handleSelectPokemonIdentifier(identifier: string | number) {
    view.setSelectedIdentifier(identifier)
    view.setQuery('')
    addSearch(String(identifier))
    view.setIsAutocompleteOpen(false)
  }

  function handleConfirmAddToTeam(teamId: string) {
    if (!selectedPokemon) {
      return
    }

    const { teams, addPokemonToTeam } = useTeamStore.getState()
    const team = teams.find((item) => item.id === teamId)
    const wasAdded = addPokemonToTeam(teamId, toTeamPokemon(selectedPokemon))
    dialogs.showToastMessage(
      wasAdded
        ? `${selectedPokemon.displayName} adicionado em ${team?.name ?? 'time'}.`
        : `${team?.name ?? 'Time'} esta cheio.`,
    )
    dialogs.setIsAddToTeamOpen(!wasAdded)
  }

  function handleToggleFavorite() {
    if (!selectedPokemon) {
      return
    }

    const willFavorite = !useFavoritesStore.getState().isFavorite(selectedPokemon.id)
    toggleFavorite(selectedPokemon.id)
    dialogs.showToastMessage(willFavorite ? 'Pokemon favoritado.' : 'Pokemon removido dos favoritos.')
  }

  function handleRemoveFavorite(pokemonId: number) {
    toggleFavorite(pokemonId)
    dialogs.showToastMessage('Pokemon removido dos favoritos.')
  }

  function handlePlayCry() {
    if (!selectedPokemon?.cryUrl) {
      return
    }

    const audio = new Audio(selectedPokemon.cryUrl)

    void audio.play().catch(() => {
      dialogs.showToastMessage('Nao foi possivel tocar o cry agora.')
    })
  }

  return {
    handleSearch,
    handleSelectPokemon,
    handleSearchChange,
    handleAddToTeam,
    handleSelectPokemonIdentifier,
    handleConfirmAddToTeam,
    handleToggleFavorite,
    handleRemoveFavorite,
    handlePlayCry,
  }
}
