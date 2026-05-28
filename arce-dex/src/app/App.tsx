import { useMemo, useState } from 'react'
import { Heart, History, Menu, Users } from 'lucide-react'
import { AbilityDetailsDialog } from '../components/pokemon/AbilityDetailsDialog'
import { PokemonCard } from '../components/pokemon/PokemonCard'
import { PokemonTabs, type PokemonTabName } from '../components/pokemon/PokemonTabs'
import { AddToTeamDialog } from '../components/team/AddToTeamDialog'
import { ErrorState, LoadingState, Toast } from '../components/ui/StatusStates'
import { FavoritesDrawer } from '../features/favorites/FavoritesDrawer'
import { RecentPokemonPanel } from '../features/favorites/RecentPokemonPanel'
import { SearchExperience } from '../features/pokemon-search/SearchExperience'
import { TeamLabView } from '../features/team-builder'
import { normalizePokemonSearch } from '../lib/utils'
import { usePokemon } from '../hooks/usePokemon'
import { useAbility } from '../hooks/useAbility'
import { useEvolutionChain } from '../hooks/useEvolutionChain'
import { usePokemonAutocompleteList } from '../hooks/usePokemonList'
import { useMovesDetails } from '../hooks/useMovesDetails'
import { usePokemonSpecies } from '../hooks/usePokemonSpecies'
import { usePokemonSummaries } from '../hooks/usePokemonSummaries'
import { useFavoritesStore } from '../stores/favoritesStore'
import { useSearchHistoryStore } from '../stores/searchHistoryStore'
import { useTeamStore } from '../stores/teamStore'
import type { PokemonSummary } from '../types/pokemon'
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
  const relatedSummaryQuery = usePokemonSummaries([
    ...searchHistory.slice(0, 8),
    ...favoritePokemonIds,
    ...formIdentifiers,
  ])

  const summaries = pokemonListQuery.data?.results ?? []
  const selectedSummary = selectedPokemon ? [selectedPokemon] : []
  const evolutionSummaries = flattenEvolutionNodes(evolutionChainQuery.data?.root)
  const summaryCache = mergePokemonSummaries(
    summaries,
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
      setIsAutocompleteOpen(false)
    }
  }

  function handleSelectPokemon(pokemon: PokemonSummary) {
    setSelectedIdentifier(pokemon.name)
    setQuery(pokemon.displayName)
    addSearch(pokemon.name)
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
        <div>
          <span className="brand-mark">A</span>
          <span>
            <strong>ARCE-DEX</strong>
            <small>mobile battle helper</small>
          </span>
        </div>
        <nav aria-label="Atalhos">
          <button type="button" aria-label="Favoritos" onClick={() => setIsFavoritesOpen(true)}>
            <Heart size={18} />
          </button>
          <button type="button" aria-label="Historico">
            <History size={18} />
          </button>
          <button type="button" aria-label="Abrir Meu Time" onClick={() => setActiveView('team-lab')}>
            <Users size={18} />
          </button>
        </nav>
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
        <main>
          <SearchExperience
            isAutocompleteOpen={isAutocompleteOpen}
            isError={pokemonListQuery.isError}
            isLoading={pokemonListQuery.isLoading}
            onChange={handleSearchChange}
            onFocus={() => setIsAutocompleteOpen(query.trim().length >= 2)}
            onSearch={handleSearch}
            onSelect={handleSelectPokemon}
            suggestions={summaries}
            value={query}
          />

          <section className="mobile-action-strip">
            <button type="button" onClick={() => setActiveView('team-lab')}>
              <Menu size={18} />
              Meu Time
            </button>
            <button type="button" onClick={() => setIsFavoritesOpen(true)}>
              <Heart size={18} />
              Favoritos
            </button>
          </section>

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
