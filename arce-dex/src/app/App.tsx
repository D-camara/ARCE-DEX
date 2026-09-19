import { useMemo, useState } from 'react'
import { Heart, Menu } from 'lucide-react'
import { AbilityDetailsDialog } from '@/features/pokemon/components/AbilityDetailsDialog'
import { PokemonCard } from '@/features/pokemon/components/PokemonCard'
import { PokemonTabs, type PokemonTabName } from '@/features/pokemon/components/PokemonTabs'
import { AddToTeamDialog } from '@/features/team/components/AddToTeamDialog'
import { ErrorState, LoadingState, Toast } from '@/shared/ui/StatusStates'
import { FavoritesDrawer } from '@/features/favorites/components/FavoritesDrawer'
import { RecentPokemonPanel } from '@/features/favorites/components/RecentPokemonPanel'
import { SearchExperience } from '@/features/search/components/SearchExperience'
import { TeamLabView } from '@/features/team/components/TeamLabView'
import { normalizePokemonSearch } from '@/shared/lib/utils'
import { getPokemonAutocompleteSuggestions } from '@/features/search/lib/search'
import { usePokemon } from '@/features/pokemon/hooks/usePokemon'
import { useAbility } from '@/features/pokemon/hooks/useAbility'
import { useEvolutionChain } from '@/features/pokemon/hooks/useEvolutionChain'
import { usePokemonAutocompleteList } from '@/features/pokemon/hooks/usePokemonList'
import { useMovesDetails } from '@/features/pokemon/hooks/useMovesDetails'
import { usePokemonSpecies } from '@/features/pokemon/hooks/usePokemonSpecies'
import { usePokemonSummaries } from '@/features/pokemon/hooks/usePokemonSummaries'
import { useFavoritesStore } from '@/features/favorites/store/favoritesStore'
import { useSearchHistoryStore } from '@/features/search/store/searchHistoryStore'
import { useTeamStore } from '@/features/team/store/teamStore'
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

function App() {
  const [query, setQuery] = useState('')
  const [activeView, setActiveView] = useState<'dex' | 'team-lab'>('dex')
  const [selectedIdentifier, setSelectedIdentifier] = useState<string | number>(448)
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const [isAddToTeamOpen, setIsAddToTeamOpen] = useState(false)
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  const [activePokemonTab, setActivePokemonTab] = useState<PokemonTabName>('Info')
  const [selectedAddTeamId, setSelectedAddTeamId] = useState('team-1')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [selectedAbilityName, setSelectedAbilityName] = useState<string | null>(null)

  const pokemonListQuery = usePokemonAutocompleteList()
  const selectedPokemonQuery = usePokemon(selectedIdentifier)
  const selectedPokemon = selectedPokemonQuery.data
  const selectedAbilityQuery = useAbility(selectedAbilityName)
  const selectedSpeciesQuery = usePokemonSpecies(selectedIdentifier)
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
    () => getPokemonAutocompleteSuggestions(query, summaries),
    [query, summaries],
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
      setSelectedIdentifier(normalizedSearch)
      addSearch(String(normalizedSearch))
      setActiveView('dex')
      setIsAutocompleteOpen(false)
    }
  }

  function handleSelectPokemon(pokemon: PokemonSummary) {
    setSelectedIdentifier(pokemon.name)
    setQuery(pokemon.displayName)
    addSearch(pokemon.name)
    setActiveView('dex')
    setActivePokemonTab('Info')
    setIsAutocompleteOpen(false)
  }

  function handleSearchChange(value: string) {
    setQuery(value)
    setIsAutocompleteOpen(value.trim().length >= 2)
  }

  function handleAddToTeam() {
    if (!selectedPokemon) {
      return
    }

    setSelectedAddTeamId(activeTeamId)
    setIsAddToTeamOpen(true)
  }

  function handleSelectPokemonIdentifier(identifier: string | number) {
    setSelectedIdentifier(identifier)
    setQuery('')
    addSearch(String(identifier))
    setIsAutocompleteOpen(false)
  }

  function handleConfirmAddToTeam(teamId: string) {
    if (!selectedPokemon) {
      return
    }

    const team = teams.find((item) => item.id === teamId)
    const wasAdded = addPokemonToTeam(teamId, toTeamPokemon(selectedPokemon))
    setToastMessage(
      wasAdded
        ? `${selectedPokemon.displayName} adicionado em ${team?.name ?? 'time'}.`
        : `${team?.name ?? 'Time'} esta cheio.`,
    )
    setShowToast(true)
    setIsAddToTeamOpen(!wasAdded)

    window.setTimeout(() => setShowToast(false), 2400)
  }

  function handleToggleFavorite() {
    if (!selectedPokemon) {
      return
    }

    const willFavorite = !isFavorite(selectedPokemon.id)
    toggleFavorite(selectedPokemon.id)
    setToastMessage(willFavorite ? 'Pokemon favoritado.' : 'Pokemon removido dos favoritos.')
    setShowToast(true)
    window.setTimeout(() => setShowToast(false), 2400)
  }

  function handleRemoveFavorite(pokemonId: number) {
    toggleFavorite(pokemonId)
    setToastMessage('Pokemon removido dos favoritos.')
    setShowToast(true)
    window.setTimeout(() => setShowToast(false), 2400)
  }

  function handlePlayCry() {
    if (!selectedPokemon?.cryUrl) {
      return
    }

    const audio = new Audio(selectedPokemon.cryUrl)

    void audio.play().catch(() => {
      setToastMessage('Nao foi possivel tocar o cry agora.')
      setShowToast(true)
      window.setTimeout(() => setShowToast(false), 2400)
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
            isAutocompleteOpen={isAutocompleteOpen}
            isError={pokemonListQuery.isError}
            isLoading={pokemonListQuery.isLoading}
            onChange={handleSearchChange}
            onFocus={() => setIsAutocompleteOpen(query.trim().length >= 2)}
            onSearch={handleSearch}
            onSelect={handleSelectPokemon}
            suggestions={summaryCache}
            value={query}
          />
        </div>

        <div className="topbar__actions">
          <button
            type="button"
            onClick={() => setActiveView('team-lab')}
            className="topbar-btn"
            title="Meu Time"
          >
            <Menu size={16} />
            <span className="btn-text">Meu Time</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFavoritesOpen(true)}
            className="topbar-btn"
            title="Favoritos"
          >
            <Heart size={16} />
            <span className="btn-text">Favoritos</span>
          </button>
        </div>
      </header>

      {activeView === 'team-lab' ? (
        <TeamLabView
          activeTeamId={activeTeamId}
          onBack={() => setActiveView('dex')}
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
                    onSelectAbility={setSelectedAbilityName}
                    onToggleFavorite={handleToggleFavorite}
                    pokemon={selectedPokemon}
                  />
                  <PokemonTabs
                    activeTab={activePokemonTab}
                    data={pokemonTabData}
                    onTabChange={setActivePokemonTab}
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
        isOpen={isAddToTeamOpen}
        onClose={() => setIsAddToTeamOpen(false)}
        onConfirm={handleConfirmAddToTeam}
        onSelectTeam={setSelectedAddTeamId}
        pokemon={selectedPokemon}
        selectedTeamId={selectedAddTeamId}
        teams={teams}
      />

      <FavoritesDrawer
        favorites={favoritePokemon}
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        onRemove={handleRemoveFavorite}
        onSelect={(pokemon) => {
          handleSelectPokemon(pokemon)
          setIsFavoritesOpen(false)
        }}
      />

      <AbilityDetailsDialog
        ability={selectedAbilityQuery.data}
        isError={selectedAbilityQuery.isError}
        isLoading={selectedAbilityQuery.isLoading}
        isOpen={selectedAbilityName !== null}
        onClose={() => setSelectedAbilityName(null)}
      />

      {showToast && <Toast message={toastMessage} />}
    </div>
  )
}

export default App
