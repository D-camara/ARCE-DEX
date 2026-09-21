import { normalizePokemonSearch } from '@/shared/lib/utils'
import type { Pokemon, PokemonSummary } from '@/shared/types/pokemon'
import type { Team } from '@/shared/types/team'
import { toTeamPokemon } from './appDataAdapters'
import type { useAppView } from './useAppView'
import type { useAppDialogs } from './useAppDialogs'

type UseDexActionsParams = {
  view: ReturnType<typeof useAppView>
  dialogs: ReturnType<typeof useAppDialogs>
  selectedPokemon: Pokemon | undefined
  teams: Team[]
  activeTeamId: string
  addPokemonToTeam: (teamId: string, pokemon: ReturnType<typeof toTeamPokemon>) => boolean
  toggleFavorite: (pokemonId: number) => void
  isFavorite: (pokemonId: number) => boolean
  addSearch: (value: string) => void
}

export function useDexActions({
  view,
  dialogs,
  selectedPokemon,
  teams,
  activeTeamId,
  addPokemonToTeam,
  toggleFavorite,
  isFavorite,
  addSearch,
}: UseDexActionsParams) {
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

    dialogs.setSelectedAddTeamId(activeTeamId)
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

    const willFavorite = !isFavorite(selectedPokemon.id)
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
