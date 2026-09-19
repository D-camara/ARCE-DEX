import { useMemo } from 'react'
import { Heart, Menu } from 'lucide-react'
import {
  AbilityDetailsDialog,
  PokemonCard,
  PokemonTabs,
  usePokemon,
  useAbility,
  useEvolutionChain,
  usePokemonAutocompleteList,
  useMovesDetails,
  usePokemonSpecies,
  usePokemonSummaries,
} from '@/features/pokemon'
import { AddToTeamDialog, TeamLabView, useTeamStore } from '@/features/team'
import { ErrorState, LoadingState, Toast } from '@/shared/ui/StatusStates'
import { FavoritesDrawer, RecentPokemonPanel, useFavoritesStore } from '@/features/favorites'
import {
  SearchExperience,
  getPokemonAutocompleteSuggestions,
  useSearchHistoryStore,
} from '@/features/search'
import { normalizePokemonSearch } from '@/shared/lib/utils'
import type { PokemonSummary } from '@/shared/types/pokemon'
import {
  flattenEvolutionNodes,
  getFavoritePokemon,
  createPokemonTabData,
  getRecentPokemon,
  mergePokemonSummaries,
  preparePokemonLevelUpMoves,
  toTeamPokemon,
} from './appDataAdapters'
import { useAppView } from './useAppView'
import { useAppDialogs } from './useAppDialogs'

function App() {
  const view = useAppView()
  const dialogs = useAppDialogs()

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

  const activeTeamId = useTeamStore((state) => state.activeTeamId)
  const teams = useTeamStore((state) => state.teams)
  const setActiveTeam = useTeamStore((state) => state.setActiveTeam)
  const addPokemonToTeam = useTeamStore((state) => state.addPokemonToTeam)
  const removePokemon = useTeamStore((state) => state.removePokemon)
  const renameTeam = useTeamStore((state) => state.renameTeam)
  const clearTeam = useTeamStore((state) => state.clearTeam)
  const updatePokemonInTeam = useTeamStore((state) => state.updatePokemonInTeam)

  const favoritePokemonIds = useFavoritesStore((state) => state.favoritePokemonIds)
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const isFavorite = useFavoritesStore((state) => state.isFavorite)
  const searchHistory = useSearchHistoryStore((state) => state.history)
  const addSearch = useSearchHistoryStore((state) => state.addSearch)
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

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="brand-mark">A</span>
          <span className="brand-text">
            <strong>Archivum Arceus</strong>
            <small>Pokemon battle helper</small>
          </span>
        </div>

        <div className="topbar__search">
          <SearchExperience
            isAutocompleteOpen={view.isAutocompleteOpen}
            isError={pokemonListQuery.isError}
            isLoading={pokemonListQuery.isLoading}
            onChange={handleSearchChange}
            onFocus={() => view.setIsAutocompleteOpen(view.query.trim().length >= 2)}
            onSearch={handleSearch}
            onSelect={handleSelectPokemon}
            suggestions={summaryCache}
            value={view.query}
          />
        </div>

        <div className="topbar__actions">
          <button
            type="button"
            onClick={() => view.setActiveView('team-lab')}
            className="topbar-btn"
            title="Meu Time"
          >
            <Menu size={16} />
            <span className="btn-text">Meu Time</span>
          </button>
          <button
            type="button"
            onClick={() => dialogs.setIsFavoritesOpen(true)}
            className="topbar-btn"
            title="Favoritos"
          >
            <Heart size={16} />
            <span className="btn-text">Favoritos</span>
          </button>
        </div>
      </header>

      {view.activeView === 'team-lab' ? (
        <TeamLabView
          activeTeamId={activeTeamId}
          onBack={() => view.setActiveView('dex')}
          onClearTeam={clearTeam}
          onRemovePokemon={removePokemon}
          onRenameTeam={renameTeam}
          onSelectTeam={setActiveTeam}
          onUpdatePokemon={updatePokemonInTeam}
          teams={teams}
        />
      ) : (
        <main className="home-layout">
          <section className="content-grid">
            <div className="primary-column">
              {selectedPokemonQuery.isLoading && <LoadingState />}
              {selectedPokemonQuery.isError && <ErrorState />}
              {selectedPokemon && (
                <>
                  <PokemonCard
                    isFavorite={isFavorite(selectedPokemon.id)}
                    key={selectedPokemon.id}
                    onAddToTeam={handleAddToTeam}
                    onPlayCry={handlePlayCry}
                    onSelectAbility={view.setSelectedAbilityName}
                    onToggleFavorite={handleToggleFavorite}
                    pokemon={selectedPokemon}
                  />
                  <PokemonTabs
                    activeTab={view.activePokemonTab}
                    data={pokemonTabData}
                    onTabChange={view.setActivePokemonTab}
                    onSelectPokemon={handleSelectPokemonIdentifier}
                  />
                </>
              )}
            </div>

            <div className="secondary-column">
              <RecentPokemonPanel onSelect={handleSelectPokemon} pokemon={recentPokemon} />
            </div>
          </section>
        </main>
      )}

      <AddToTeamDialog
        isOpen={dialogs.isAddToTeamOpen}
        onClose={() => dialogs.setIsAddToTeamOpen(false)}
        onConfirm={handleConfirmAddToTeam}
        onSelectTeam={dialogs.setSelectedAddTeamId}
        pokemon={selectedPokemon}
        selectedTeamId={dialogs.selectedAddTeamId}
        teams={teams}
      />

      <FavoritesDrawer
        favorites={favoritePokemon}
        isOpen={dialogs.isFavoritesOpen}
        onClose={() => dialogs.setIsFavoritesOpen(false)}
        onRemove={handleRemoveFavorite}
        onSelect={(pokemon) => {
          handleSelectPokemon(pokemon)
          dialogs.setIsFavoritesOpen(false)
        }}
      />

      <AbilityDetailsDialog
        ability={selectedAbilityQuery.data}
        isError={selectedAbilityQuery.isError}
        isLoading={selectedAbilityQuery.isLoading}
        isOpen={view.selectedAbilityName !== null}
        onClose={() => view.setSelectedAbilityName(null)}
      />

      {dialogs.showToast && <Toast message={dialogs.toastMessage} />}
    </div>
  )
}

export default App
