import { Suspense, useCallback, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Heart, LogIn, LogOut, Menu } from 'lucide-react'
import { AuthForm, useAuthStore } from '@/features/auth'
import { getSupabase, isSupabaseConfigured } from '@/shared/services/supabase/client'
import { AbilityDetailsDialog, PokemonCard, PokemonCardSkeleton, PokemonTabs } from '@/features/pokemon'
import { AddToTeamDialog, TeamLab } from '@/features/team'
import { ErrorState, LoadingState, Toast } from '@/shared/ui/StatusStates'
import { FavoritesDrawer, RecentPokemonPanel, useFavoritesStore } from '@/features/favorites'
import { SearchExperience } from '@/features/search'
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

  const data = useDexPageData(view, { isFavoritesOpen: dialogs.isFavoritesOpen })
  useCanonicalPokemonUrl(view, data.selectedPokemon)

  const selectedPokemonId = data.selectedPokemon?.id
  const isSelectedFavorite = useFavoritesStore(
    (state) => selectedPokemonId !== undefined && state.favoritePokemonIds.includes(selectedPokemonId),
  )

  const actions = useDexActions({ view, dialogs, selectedPokemon: data.selectedPokemon })
  const { setIsAutocompleteOpen } = view
  const closeAutocomplete = useCallback(() => setIsAutocompleteOpen(false), [setIsAutocompleteOpen])

  return (
    // The header is sticky (in the flow), not fixed: its height changes with width (title
    // wrapping, search stacking), so no fixed padding-top could keep content out from under it.
    // Its negative margins cancel the container padding so it keeps the full container width.
    // overflow-x-clip (not hidden): hidden would make this a scroll container and break sticky.
    <div className="mx-auto w-full max-w-[1180px] px-3.5 pb-7 md:px-6 max-xs:overflow-x-clip max-xs:px-2 max-fold:px-1">
      <header className="sticky top-0 z-[1002] -mx-3.5 mb-4 flex min-h-[56px] items-center justify-between gap-4 border-b border-line bg-cosmic-soft/92 px-4 py-2 backdrop-blur-[18px] md:min-h-[60px] md:px-6 md:py-2.5 max-md:grid max-md:min-h-0 max-md:grid-cols-[minmax(0,1fr)_auto] max-md:gap-3 max-md:px-4 max-md:py-3 max-phone:gap-2 max-phone:px-2.5 max-phone:py-2 max-fold:gap-1 max-fold:px-2 md:-mx-6 md:mb-5 max-xs:-mx-2 max-fold:-mx-1">
        <div className="flex min-w-0 shrink-0 items-center gap-2.5 max-md:col-start-1 max-md:row-start-1 max-md:self-center">
          <span className="grid h-[38px] w-[38px] place-items-center rounded-[14px] border border-azure/45 bg-[linear-gradient(135deg,rgba(56,189,248,0.3),rgba(249,115,22,0.18))] font-black text-azure-100">
            A
          </span>
          <span className="grid min-w-0 gap-0.5">
            <strong className="truncate text-[1.02rem] leading-none">Archivum Arceus</strong>
            <small className="block text-xs text-muted max-sm:hidden">Pokemon battle helper</small>
          </span>
        </div>

        <div className="relative min-w-0 flex-1 max-w-[380px] max-md:col-span-2 max-md:row-start-2 max-md:w-full max-md:max-w-full">
          <SearchExperience
            isAutocompleteOpen={view.isAutocompleteOpen}
            isError={data.pokemonListQuery.isError}
            isLoading={data.pokemonListQuery.isLoading}
            onChange={actions.handleSearchChange}
            onFocus={() => view.setIsAutocompleteOpen(view.query.trim().length >= 2)}
            onClose={closeAutocomplete}
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
                  onClick={() => void getSupabase().then((client) => client?.auth.signOut())}
                />
              </>
            ) : (
              <HeaderButton icon={<LogIn size={16} />} label="Entrar" onClick={() => setIsAuthOpen(true)} />
            ))}
        </div>
      </header>

      {view.activeView === 'team-lab' ? (
        <Suspense fallback={<LoadingState />}>
          <TeamLab onBack={() => view.setActiveView('dex')} />
        </Suspense>
      ) : (
        <main className="flex w-full flex-col gap-8">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_360px] md:items-start lg:grid-cols-[minmax(0,1fr)_390px]">
            {/* grid-cols-1 = minmax(0,1fr): lets the column shrink below the tab bar's
                nowrap width (the tab bar scrolls sideways instead of widening the card). */}
            <div className="grid grid-cols-1 content-start gap-4">
              {data.selectedPokemonQuery.isLoading && <PokemonCardSkeleton />}
              {data.selectedPokemonQuery.isError && <ErrorState />}
              {data.selectedPokemon && (
                <>
                  <PokemonCard
                    isFavorite={isSelectedFavorite}
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

      <AnimatePresence>
        {dialogs.showToast && <Toast key="toast" message={dialogs.toastMessage} />}
      </AnimatePresence>

      {isAuthOpen && <AuthForm onClose={() => setIsAuthOpen(false)} />}
    </div>
  )
}

export default App
