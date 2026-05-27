import { useMemo, useState } from 'react'
import { Heart, History, Menu, Users } from 'lucide-react'
import { PokemonCard } from '../components/pokemon/PokemonCard'
import { PokemonTabs, type PokemonTabName } from '../components/pokemon/PokemonTabs'
import { AddToTeamDialog } from '../components/team/AddToTeamDialog'
import { TeamDrawer } from '../components/team/TeamDrawer'
import { ErrorState, LoadingState, Toast } from '../components/ui/StatusStates'
import { FavoritesDrawer } from '../features/favorites/FavoritesDrawer'
import { RecentPokemonPanel } from '../features/favorites/RecentPokemonPanel'
import { SearchExperience } from '../features/pokemon-search/SearchExperience'
import { importTeamJson } from '../lib/export-import'
import { normalizePokemonSearch } from '../lib/utils'
import { usePokemon } from '../hooks/usePokemon'
import { useEvolutionChain } from '../hooks/useEvolutionChain'
import { usePokemonAutocompleteList } from '../hooks/usePokemonList'
import { usePokemonSpecies } from '../hooks/usePokemonSpecies'
import { usePokemonSummaries } from '../hooks/usePokemonSummaries'
import { useFavoritesStore } from '../stores/favoritesStore'
import { useSearchHistoryStore } from '../stores/searchHistoryStore'
import { useTeamStore } from '../stores/teamStore'
import type { PokemonSummary } from '../types/pokemon'
import type { Team } from '../types/team'
import {
  createImportedSlots,
  flattenEvolutionNodes,
  getFavoritePokemon,
  createPokemonTabData,
  createTeamAnalysis,
  getRecentPokemon,
  mergePokemonSummaries,
  toTeamPokemon,
} from './appDataAdapters'

function App() {
  const [query, setQuery] = useState('')
  const [selectedIdentifier, setSelectedIdentifier] = useState<string | number>(448)
  const [isTeamOpen, setIsTeamOpen] = useState(false)
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const [isAddToTeamOpen, setIsAddToTeamOpen] = useState(false)
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  const [activePokemonTab, setActivePokemonTab] = useState<PokemonTabName>('Info')
  const [selectedAddTeamId, setSelectedAddTeamId] = useState('team-1')
  const [transferMode, setTransferMode] = useState<'export' | 'import' | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [transferValue, setTransferValue] = useState('')
  const [transferMessage, setTransferMessage] = useState('Formato validado pela base tecnica.')
  const [toastMessage, setToastMessage] = useState('')

  const pokemonListQuery = usePokemonAutocompleteList()
  const selectedPokemonQuery = usePokemon(selectedIdentifier)
  const selectedPokemon = selectedPokemonQuery.data
  const selectedSpeciesQuery = usePokemonSpecies(selectedIdentifier)
  const selectedSpecies = selectedSpeciesQuery.data
  const evolutionChainQuery = useEvolutionChain(selectedSpecies?.evolutionChainUrl ?? null)

  const activeTeamId = useTeamStore((state) => state.activeTeamId)
  const teams = useTeamStore((state) => state.teams)
  const setActiveTeam = useTeamStore((state) => state.setActiveTeam)
  const addPokemonToTeam = useTeamStore((state) => state.addPokemonToTeam)
  const removePokemon = useTeamStore((state) => state.removePokemon)
  const renameTeam = useTeamStore((state) => state.renameTeam)
  const clearTeam = useTeamStore((state) => state.clearTeam)
  const importTeam = useTeamStore((state) => state.importTeam)
  const exportActiveTeam = useTeamStore((state) => state.exportActiveTeam)

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

  const activeTeam = teams.find((team) => team.id === activeTeamId) ?? teams[0]
  const summaries = pokemonListQuery.data?.results ?? []
  const selectedSummary = selectedPokemon ? [selectedPokemon] : []
  const evolutionSummaries = flattenEvolutionNodes(evolutionChainQuery.data?.root)
  const summaryCache = mergePokemonSummaries(
    summaries,
    evolutionSummaries,
    relatedSummaryQuery.data,
    selectedSummary,
  )
  const exportValue = transferValue || exportActiveTeam()

  const pokemonTabData = useMemo(
    () =>
      createPokemonTabData(
        selectedPokemon,
        selectedSpecies,
        evolutionChainQuery.data,
        summaryCache,
      ),
    [evolutionChainQuery.data, selectedPokemon, selectedSpecies, summaryCache],
  )
  const teamAnalysis = useMemo(() => createTeamAnalysis(activeTeam), [activeTeam])

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

  function handleImportTeam() {
    const result = importTeamJson(exportValue)

    if (!result.ok) {
      setTransferMessage(result.error)
      return
    }

    const importedTeam: Team = {
      id: activeTeam.id,
      name: result.team.name,
      slots: createImportedSlots(result.team.pokemons, summaryCache),
    }

    importTeam(importedTeam, activeTeam.id)
    setTransferValue('')
    setTransferMessage('Time importado quando os Pokemon estavam no cache local.')
  }

  function handleCopyTeam() {
    void navigator.clipboard.writeText(exportActiveTeam())
    setTransferMessage('JSON do time copiado.')
  }

  function handleShowTransfer(mode: 'export' | 'import') {
    setTransferMode(mode)
    setTransferValue('')
    setTransferMessage('')
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
          <button type="button" aria-label="Abrir Meu Time" onClick={() => setIsTeamOpen(true)}>
            <Users size={18} />
          </button>
        </nav>
      </header>

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
          <button type="button" onClick={() => setIsTeamOpen(true)}>
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

      <TeamDrawer
        activeTeamId={activeTeamId}
        isOpen={isTeamOpen}
        onClearTeam={clearTeam}
        onCloseTransfer={() => setTransferMode(null)}
        onClose={() => setIsTeamOpen(false)}
        onCopyTeam={handleCopyTeam}
        onImportTeam={handleImportTeam}
        onImportValueChange={setTransferValue}
        onRemovePokemon={removePokemon}
        onRenameTeam={renameTeam}
        onSelectTeam={setActiveTeam}
        onShowTransfer={handleShowTransfer}
        teamAnalysis={teamAnalysis}
        teams={teams}
        transferMessage={transferMessage}
        transferMode={transferMode}
        transferValue={exportValue}
      />

      {showToast && <Toast message={toastMessage} />}
    </div>
  )
}

export default App
