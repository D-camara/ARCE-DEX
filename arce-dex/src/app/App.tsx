import { useMemo, useState } from 'react'
import { Heart, History, Menu, Users } from 'lucide-react'
import { PokemonCard } from '../components/pokemon/PokemonCard'
import { PokemonTabs } from '../components/pokemon/PokemonTabs'
import { TeamDrawer } from '../components/team/TeamDrawer'
import { TeamAnalysisPanel } from '../components/type-analysis/TeamAnalysisPanel'
import { EmptyState, ErrorState, LoadingState, SkeletonCard, Toast } from '../components/ui/StatusStates'
import { FavoritesPanel } from '../features/favorites/FavoritesPanel'
import { TeamTransferPanel } from '../features/import-export/TeamTransferPanel'
import {
  favoritePokemon,
  featuredPokemon,
  mockTeams,
  pokemonSuggestions,
  pokemonTabData,
  searchHistory,
  teamAnalysis,
  type PokemonSuggestion,
} from '../features/mockPokemonData'
import { SearchExperience } from '../features/pokemon-search/SearchExperience'

function App() {
  const [query, setQuery] = useState('')
  const [selectedPokemonId, setSelectedPokemonId] = useState(featuredPokemon.id)
  const [isTeamOpen, setIsTeamOpen] = useState(false)
  const [activeTeamId, setActiveTeamId] = useState(mockTeams[0].id)
  const [isFavorite, setIsFavorite] = useState(true)
  const [showToast, setShowToast] = useState(false)

  const selectedPokemon = useMemo(() => {
    const suggestion = pokemonSuggestions.find((pokemon) => pokemon.id === selectedPokemonId)

    if (!suggestion || suggestion.id === featuredPokemon.id) {
      return featuredPokemon
    }

    return {
      ...featuredPokemon,
      ...suggestion,
      genus: 'Mock visual',
      abilities: ['Battle Ready', 'Team Sync'],
    }
  }, [selectedPokemonId])

  function handleSelectPokemon(pokemon: PokemonSuggestion) {
    setSelectedPokemonId(pokemon.id)
    setQuery(pokemon.name)
  }

  function handleAddToTeam() {
    setShowToast(true)
    window.setTimeout(() => setShowToast(false), 2400)
  }

  const exportValue = JSON.stringify(mockTeams[0], null, 2)

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
          onChange={setQuery}
          onSelect={handleSelectPokemon}
          suggestions={pokemonSuggestions}
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
            <PokemonCard
              isFavorite={isFavorite}
              onAddToTeam={handleAddToTeam}
              onToggleFavorite={() => setIsFavorite((value) => !value)}
              pokemon={selectedPokemon}
            />
            <PokemonTabs data={pokemonTabData} />
          </div>

          <div className="secondary-column">
            <TeamAnalysisPanel analysis={teamAnalysis} />
            <FavoritesPanel favorites={favoritePokemon} history={searchHistory} />
            <TeamTransferPanel exportValue={exportValue} />
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
        onClose={() => setIsTeamOpen(false)}
        onSelectTeam={setActiveTeamId}
        teams={mockTeams}
      />

      {showToast && <Toast />}
    </div>
  )
}

export default App
