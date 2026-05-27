import { useMemo, useState } from 'react'
import { Heart, History, Menu, Users } from 'lucide-react'
import { PokemonCard } from '../components/pokemon/PokemonCard'
import { PokemonTabs } from '../components/pokemon/PokemonTabs'
import { TeamDrawer } from '../components/team/TeamDrawer'
import { TeamAnalysisPanel } from '../components/type-analysis/TeamAnalysisPanel'
import { EmptyState, ErrorState, LoadingState, SkeletonCard, Toast } from '../components/ui/StatusStates'
import { FavoritesPanel } from '../features/favorites/FavoritesPanel'
import { TeamTransferPanel } from '../features/import-export/TeamTransferPanel'
import { SearchExperience } from '../features/pokemon-search/SearchExperience'
import { importTeamJson } from '../lib/export-import'
import { normalizePokemonSearch } from '../lib/utils'
import { usePokemon } from '../hooks/usePokemon'
import { usePokemonList } from '../hooks/usePokemonList'
import { useFavoritesStore } from '../stores/favoritesStore'
import { useSearchHistoryStore } from '../stores/searchHistoryStore'
import { useTeamStore } from '../stores/teamStore'
import type { PokemonSummary } from '../types/pokemon'
import type { Team } from '../types/team'
import {
  createImportedSlots,
  createPokemonTabData,
  createTeamAnalysis,
  getRecentPokemon,
  toTeamPokemon,
  uniqueSummaries,
} from './appDataAdapters'

function App() {
  const [query, setQuery] = useState('')
  const [selectedIdentifier, setSelectedIdentifier] = useState<string | number>(448)
  const [isTeamOpen, setIsTeamOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [transferValue, setTransferValue] = useState('')
  const [transferMessage, setTransferMessage] = useState('Formato validado pela base tecnica.')

  const pokemonListQuery = usePokemonList()
  const selectedPokemonQuery = usePokemon(selectedIdentifier)
  const selectedPokemon = selectedPokemonQuery.data

  const activeTeamId = useTeamStore((state) => state.activeTeamId)
  const teams = useTeamStore((state) => state.teams)
  const setActiveTeam = useTeamStore((state) => state.setActiveTeam)
  const addPokemon = useTeamStore((state) => state.addPokemon)
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

  const activeTeam = teams.find((team) => team.id === activeTeamId) ?? teams[0]
  const summaries = pokemonListQuery.data?.results ?? []
  const selectedSummary = selectedPokemon ? [selectedPokemon] : []
  const summaryCache = uniqueSummaries([...summaries, ...selectedSummary])
  const exportValue = transferValue || exportActiveTeam()

  const pokemonTabData = useMemo(() => createPokemonTabData(selectedPokemon), [selectedPokemon])
  const teamAnalysis = useMemo(() => createTeamAnalysis(activeTeam), [activeTeam])

  const favoritePokemon = summaryCache.filter((pokemon) => favoritePokemonIds.includes(pokemon.id))
  const recentPokemon = getRecentPokemon(searchHistory, summaryCache)

  function handleSearch(value: string) {
    const normalizedSearch = normalizePokemonSearch(value)

    if (normalizedSearch !== '') {
      setSelectedIdentifier(normalizedSearch)
      addSearch(String(normalizedSearch))
    }
  }

  function handleSelectPokemon(pokemon: PokemonSummary) {
    setSelectedIdentifier(pokemon.id)
    setQuery(pokemon.displayName)
    addSearch(pokemon.name)
  }

  function handleAddToTeam() {
    if (!selectedPokemon) {
      return
    }

    const wasAdded = addPokemon(toTeamPokemon(selectedPokemon))
    setShowToast(wasAdded)

    if (wasAdded) {
      window.setTimeout(() => setShowToast(false), 2400)
    }
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
          <button type="button" aria-label="Favoritos">
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
          isError={pokemonListQuery.isError}
          isLoading={pokemonListQuery.isLoading}
          onChange={setQuery}
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
          <button type="button">
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
                  onAddToTeam={handleAddToTeam}
                  onToggleFavorite={() => toggleFavorite(selectedPokemon.id)}
                  pokemon={selectedPokemon}
                />
                <PokemonTabs data={pokemonTabData} />
              </>
            )}
          </div>

          <div className="secondary-column">
            <TeamAnalysisPanel analysis={teamAnalysis} />
            <FavoritesPanel favorites={favoritePokemon} history={recentPokemon} />
            <TeamTransferPanel
              exportValue={exportValue}
              importMessage={transferMessage}
              onCopy={handleCopyTeam}
              onImport={handleImportTeam}
              onImportValueChange={setTransferValue}
            />
            <section className="states-panel">
              <LoadingState />
              <EmptyState />
              <ErrorState />
              <SkeletonCard />
            </section>
          </div>
        </section>
      </main>

      <TeamDrawer
        activeTeamId={activeTeamId}
        isOpen={isTeamOpen}
        onClearTeam={clearTeam}
        onClose={() => setIsTeamOpen(false)}
        onRemovePokemon={removePokemon}
        onRenameTeam={renameTeam}
        onSelectTeam={setActiveTeam}
        teams={teams}
      />

      {showToast && <Toast />}
    </div>
  )
}

export default App
