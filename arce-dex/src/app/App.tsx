import { useMemo, useState } from 'react'
import { Heart, LogIn, LogOut, Menu } from 'lucide-react'
import { AuthForm, useAuthStore } from '@/features/auth'
import { supabase } from '@/shared/services/supabase/client'
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
  const authStatus = useAuthStore((state) => state.status)
  const authUser = useAuthStore((state) => state.user)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

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
    <div className="mx-auto w-full max-w-[1180px] px-3.5 pt-[124px] pb-7 min-[760px]:px-6 min-[760px]:pt-20 max-[375px]:overflow-x-hidden max-[375px]:px-2 max-[280px]:pt-[110px] max-[280px]:px-1">
      <header className="fixed inset-x-0 top-0 z-[1002] mx-auto flex min-h-[56px] w-full max-w-[1180px] items-center justify-between gap-4 border-b border-line bg-[rgba(13,13,16,0.92)] px-4 py-2 backdrop-blur-[18px] min-[760px]:min-h-[60px] min-[760px]:px-6 min-[760px]:py-2.5 max-[760px]:grid max-[760px]:min-h-0 max-[760px]:grid-cols-[1fr_auto] max-[760px]:gap-3 max-[760px]:px-4 max-[760px]:py-3 max-[399px]:gap-2 max-[399px]:px-2.5 max-[399px]:py-2 max-[280px]:gap-1 max-[280px]:px-2">
        <div className="flex min-w-0 shrink-0 items-center gap-2.5 max-[760px]:col-start-1 max-[760px]:row-start-1 max-[760px]:self-center">
          <span className="grid h-[38px] w-[38px] place-items-center rounded-[14px] border border-[rgba(56,189,248,0.45)] bg-[linear-gradient(135deg,rgba(56,189,248,0.3),rgba(249,115,22,0.18))] font-black text-[#e0f2fe]">
            A
          </span>
          <span className="grid min-w-0 gap-0.5">
            <strong className="text-[1.02rem] leading-none">Archivum Arceus</strong>
            <small className="block text-[0.72rem] text-muted">Pokemon battle helper</small>
          </span>
        </div>

        <div className="relative min-w-0 flex-1 max-w-[380px] max-[760px]:col-span-2 max-[760px]:row-start-2 max-[760px]:w-full max-[760px]:max-w-full">
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

        <div className="flex shrink-0 items-center gap-2 max-[760px]:col-start-2 max-[760px]:row-start-1 max-[760px]:justify-self-end max-[760px]:self-center">
          <button
            type="button"
            onClick={() => view.setActiveView('team-lab')}
            className="inline-flex min-h-[36px] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(246,237,211,0.12)] bg-white/[0.04] px-4 py-1.5 text-[0.85rem] font-semibold text-ivory-soft transition-colors duration-150 hover:border-[rgba(246,237,211,0.25)] hover:bg-white/[0.08] hover:text-ivory max-[760px]:min-h-[34px] max-[375px]:h-9 max-[375px]:w-9 max-[375px]:min-h-[36px] max-[375px]:min-w-[36px] max-[375px]:rounded-full max-[375px]:p-0"
            title="Meu Time"
          >
            <Menu size={16} />
            <span className="max-[375px]:hidden">Meu Time</span>
          </button>
          <button
            type="button"
            onClick={() => dialogs.setIsFavoritesOpen(true)}
            className="inline-flex min-h-[36px] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(246,237,211,0.12)] bg-white/[0.04] px-4 py-1.5 text-[0.85rem] font-semibold text-ivory-soft transition-colors duration-150 hover:border-[rgba(246,237,211,0.25)] hover:bg-white/[0.08] hover:text-ivory max-[760px]:min-h-[34px] max-[375px]:h-9 max-[375px]:w-9 max-[375px]:min-h-[36px] max-[375px]:min-w-[36px] max-[375px]:rounded-full max-[375px]:p-0"
            title="Favoritos"
          >
            <Heart size={16} />
            <span className="max-[375px]:hidden">Favoritos</span>
          </button>
          {authStatus === 'authenticated' ? (
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="inline-flex min-h-[36px] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(246,237,211,0.12)] bg-white/[0.04] px-4 py-1.5 text-[0.85rem] font-semibold text-ivory-soft transition-colors duration-150 hover:border-[rgba(246,237,211,0.25)] hover:bg-white/[0.08] hover:text-ivory max-[760px]:min-h-[34px] max-[375px]:h-9 max-[375px]:w-9 max-[375px]:min-h-[36px] max-[375px]:min-w-[36px] max-[375px]:rounded-full max-[375px]:p-0"
              title={authUser?.email ?? 'Sair'}
            >
              <LogOut size={16} />
              <span className="max-[375px]:hidden">Sair</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="inline-flex min-h-[36px] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(246,237,211,0.12)] bg-white/[0.04] px-4 py-1.5 text-[0.85rem] font-semibold text-ivory-soft transition-colors duration-150 hover:border-[rgba(246,237,211,0.25)] hover:bg-white/[0.08] hover:text-ivory max-[760px]:min-h-[34px] max-[375px]:h-9 max-[375px]:w-9 max-[375px]:min-h-[36px] max-[375px]:min-w-[36px] max-[375px]:rounded-full max-[375px]:p-0"
            >
              <LogIn size={16} />
              <span className="max-[375px]:hidden">Entrar</span>
            </button>
          )}
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
        <main className="flex w-full flex-col gap-8">
          <section className="grid gap-4 min-[760px]:grid-cols-[minmax(0,1fr)_360px] min-[760px]:items-start min-[1024px]:grid-cols-[minmax(0,1fr)_390px]">
            <div className="grid content-start gap-4">
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

            <div className="grid content-start gap-4">
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

      {isAuthOpen && <AuthForm onClose={() => setIsAuthOpen(false)} />}
    </div>
  )
}

export default App
