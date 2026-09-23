import { useState } from 'react'
import { Heart, LogIn, LogOut, Menu } from 'lucide-react'
import { AuthForm, useAuthStore } from '@/features/auth'
import { isSupabaseConfigured, supabase } from '@/shared/services/supabase/client'
import { AbilityDetailsDialog, PokemonCard, PokemonTabs } from '@/features/pokemon'
import { AddToTeamDialog, TeamLabView, useTeamStore } from '@/features/team'
import { ErrorState, LoadingState, Toast } from '@/shared/ui/StatusStates'
import { FavoritesDrawer, RecentPokemonPanel, useFavoritesStore } from '@/features/favorites'
import { SearchExperience, useSearchHistoryStore } from '@/features/search'
import { useAppView } from './useAppView'
import { useAppDialogs } from './useAppDialogs'
import { useCloudSync } from './useCloudSync'
import { SyncStatusIndicator } from './SyncStatusIndicator'
import { HeaderButton } from './HeaderButton'
import { useDexPageData } from './useDexPageData'
import { useDexActions } from './useDexActions'
import { useCanonicalPokemonUrl } from './useCanonicalPokemonUrl'

function App() {
  const view = useAppView()
  const dialogs = useAppDialogs()
  const authStatus = useAuthStore((state) => state.status)
  const authUser = useAuthStore((state) => state.user)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  useCloudSync()

  const data = useDexPageData(view)
  useCanonicalPokemonUrl(view, data.selectedPokemon)

  const activeTeamId = useTeamStore((state) => state.activeTeamId)
  const teams = useTeamStore((state) => state.teams)
  const setActiveTeam = useTeamStore((state) => state.setActiveTeam)
  const addPokemonToTeam = useTeamStore((state) => state.addPokemonToTeam)
  const removePokemon = useTeamStore((state) => state.removePokemon)
  const renameTeam = useTeamStore((state) => state.renameTeam)
  const clearTeam = useTeamStore((state) => state.clearTeam)
  const updatePokemonInTeam = useTeamStore((state) => state.updatePokemonInTeam)

  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const isFavorite = useFavoritesStore((state) => state.isFavorite)
  const addSearch = useSearchHistoryStore((state) => state.addSearch)

  const actions = useDexActions({
    view,
    dialogs,
    selectedPokemon: data.selectedPokemon,
    teams,
    activeTeamId,
    addPokemonToTeam,
    toggleFavorite,
    isFavorite,
    addSearch,
  })

  return (
    <div className="mx-auto w-full max-w-[1180px] px-3.5 pt-[124px] pb-7 md:px-6 md:pt-20 max-xs:overflow-x-hidden max-xs:px-2 max-fold:pt-[110px] max-fold:px-1">
      <header className="fixed inset-x-0 top-0 z-[1002] mx-auto flex min-h-[56px] w-full max-w-[1180px] items-center justify-between gap-4 border-b border-line bg-cosmic-soft/92 px-4 py-2 backdrop-blur-[18px] md:min-h-[60px] md:px-6 md:py-2.5 max-md:grid max-md:min-h-0 max-md:grid-cols-[1fr_auto] max-md:gap-3 max-md:px-4 max-md:py-3 max-phone:gap-2 max-phone:px-2.5 max-phone:py-2 max-fold:gap-1 max-fold:px-2">
        <div className="flex min-w-0 shrink-0 items-center gap-2.5 max-md:col-start-1 max-md:row-start-1 max-md:self-center">
          <span className="grid h-[38px] w-[38px] place-items-center rounded-[14px] border border-azure/45 bg-[linear-gradient(135deg,rgba(56,189,248,0.3),rgba(249,115,22,0.18))] font-black text-azure-100">
            A
          </span>
          <span className="grid min-w-0 gap-0.5">
            <strong className="text-[1.02rem] leading-none">Archivum Arceus</strong>
            <small className="block text-[0.72rem] text-muted">Pokemon battle helper</small>
          </span>
        </div>

        <div className="relative min-w-0 flex-1 max-w-[380px] max-md:col-span-2 max-md:row-start-2 max-md:w-full max-md:max-w-full">
          <SearchExperience
            isAutocompleteOpen={view.isAutocompleteOpen}
            isError={data.pokemonListQuery.isError}
            isLoading={data.pokemonListQuery.isLoading}
            onChange={actions.handleSearchChange}
            onFocus={() => view.setIsAutocompleteOpen(view.query.trim().length >= 2)}
            onSearch={actions.handleSearch}
            onSelect={actions.handleSelectPokemon}
            suggestions={data.summaryCache}
            value={view.query}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2 max-md:col-start-2 max-md:row-start-1 max-md:justify-self-end max-md:self-center">
          <HeaderButton
            icon={<Menu size={16} />}
            label="Meu Time"
            title="Meu Time"
            onClick={() => view.setActiveView('team-lab')}
          />
          <HeaderButton
            icon={<Heart size={16} />}
            label="Favoritos"
            title="Favoritos"
            onClick={() => dialogs.setIsFavoritesOpen(true)}
          />
          {isSupabaseConfigured &&
            (authStatus === 'authenticated' ? (
              <>
                <SyncStatusIndicator />
                <HeaderButton
                  icon={<LogOut size={16} />}
                  label="Sair"
                  title={authUser?.email ?? 'Sair'}
                  onClick={() => void supabase?.auth.signOut()}
                />
              </>
            ) : (
              <HeaderButton icon={<LogIn size={16} />} label="Entrar" onClick={() => setIsAuthOpen(true)} />
            ))}
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
          <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_360px] md:items-start lg:grid-cols-[minmax(0,1fr)_390px]">
            <div className="grid content-start gap-4">
              {data.selectedPokemonQuery.isLoading && <LoadingState />}
              {data.selectedPokemonQuery.isError && <ErrorState />}
              {data.selectedPokemon && (
                <>
                  <PokemonCard
                    isFavorite={isFavorite(data.selectedPokemon.id)}
                    key={data.selectedPokemon.id}
                    onAddToTeam={actions.handleAddToTeam}
                    onPlayCry={actions.handlePlayCry}
                    onSelectAbility={view.setSelectedAbilityName}
                    onToggleFavorite={actions.handleToggleFavorite}
                    pokemon={data.selectedPokemon}
                  />
                  <PokemonTabs
                    activeTab={view.activePokemonTab}
                    data={data.pokemonTabData}
                    onTabChange={view.setActivePokemonTab}
                    onSelectPokemon={actions.handleSelectPokemonIdentifier}
                  />
                </>
              )}
            </div>

            <div className="grid content-start gap-4">
              <RecentPokemonPanel onSelect={actions.handleSelectPokemon} pokemon={data.recentPokemon} />
            </div>
          </section>
        </main>
      )}

      <AddToTeamDialog
        isOpen={dialogs.isAddToTeamOpen}
        onClose={() => dialogs.setIsAddToTeamOpen(false)}
        onConfirm={actions.handleConfirmAddToTeam}
        onSelectTeam={dialogs.setSelectedAddTeamId}
        pokemon={data.selectedPokemon}
        selectedTeamId={dialogs.selectedAddTeamId}
        teams={teams}
      />

      <FavoritesDrawer
        favorites={data.favoritePokemon}
        isOpen={dialogs.isFavoritesOpen}
        onClose={() => dialogs.setIsFavoritesOpen(false)}
        onRemove={actions.handleRemoveFavorite}
        onSelect={(pokemon) => {
          actions.handleSelectPokemon(pokemon)
          dialogs.setIsFavoritesOpen(false)
        }}
      />

      <AbilityDetailsDialog
        ability={data.selectedAbilityQuery.data}
        isError={data.selectedAbilityQuery.isError}
        isLoading={data.selectedAbilityQuery.isLoading}
        isOpen={view.selectedAbilityName !== null}
        onClose={() => view.setSelectedAbilityName(null)}
      />

      {dialogs.showToast && <Toast message={dialogs.toastMessage} />}

      {isAuthOpen && <AuthForm onClose={() => setIsAuthOpen(false)} />}
    </div>
  )
}

export default App
