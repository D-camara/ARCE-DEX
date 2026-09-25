import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { Heart, LogIn, LogOut, Menu } from 'lucide-react'
import { AuthForm, useAuthStore } from '@/features/auth'
import { getSupabase, isSupabaseConfigured } from '@/shared/services/supabase/client'
import { AbilityDetailsDialog, PokemonCard, PokemonCardSkeleton, PokemonTabs } from '@/features/pokemon'
import { AddToTeamDialog, TeamLab } from '@/features/team'
import { ErrorState, LoadingState, Toast } from '@/shared/ui/StatusStates'
import { duration, ease } from '@/shared/ui'
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
import { DEFAULT_URL_STATE } from './urlState'

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

  // After a view switch (not on first load), move focus to the new view so keyboard and
  // screen-reader users land on it instead of on a button that no longer exists.
  const isFirstView = useRef(true)
  useEffect(() => {
    isFirstView.current = false
  }, [])
  const focusNewView = useCallback((element: HTMLDivElement | null) => {
    if (element && !isFirstView.current) {
      element.focus({ preventScroll: true })
    }
  }, [])
  const isTeamLab = view.activeView === 'team-lab'

  return (
    // The header is sticky (in the flow), not fixed: its height changes with width (title
    // wrapping, search stacking), so no fixed padding-top could keep content out from under it.
    // Its negative margins cancel the container padding so it keeps the full container width.
    // overflow-x-clip (not hidden): hidden would make this a scroll container and break sticky.
    // It also keeps the views' sideways slide-in from creating a horizontal scrollbar mid-animation.
    <div className="mx-auto w-full max-w-[1180px] overflow-x-clip px-3.5 pb-7 md:px-6 max-xs:px-2 max-fold:px-1">
      <header className="sticky top-0 z-[1002] short:static -mx-3.5 mb-4 flex min-h-[56px] items-center justify-between gap-4 border-b border-line bg-cosmic-soft/92 px-4 py-2 backdrop-blur-[18px] md:min-h-[60px] md:px-6 md:py-2.5 max-md:grid max-md:min-h-0 max-md:grid-cols-[minmax(0,1fr)_auto] max-md:gap-3 max-md:px-4 max-md:py-3 max-phone:gap-2 max-phone:px-2.5 max-phone:py-2 max-fold:gap-1 max-fold:px-2 md:-mx-6 md:mb-5 max-xs:-mx-2 max-fold:-mx-1">
        <div className="flex min-w-0 shrink-0 items-center gap-2.5 max-md:col-start-1 max-md:row-start-1 max-md:self-center">
          <span className="grid h-[38px] w-[38px] place-items-center rounded-[14px] border border-azure/45 bg-[linear-gradient(135deg,rgba(56,189,248,0.3),rgba(249,115,22,0.18))] font-black text-azure-100">
            A
          </span>
          <span className="grid min-w-0 gap-0.5">
            <strong className="truncate text-[1.02rem] leading-none max-sm:text-[0.95rem] max-xs:sr-only">Archivum Arceus</strong>
            <small className="block text-xs text-muted max-sm:hidden">Pokémon battle helper</small>
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

        <div className="flex shrink-0 items-center gap-2 max-sm:gap-1.5 max-md:col-start-2 max-md:row-start-1 max-md:justify-self-end max-md:self-center">
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
              <span className="relative flex items-center gap-2">
                {/* On phones the sync status becomes a small badge on the account button. */}
                <SyncStatusIndicator />
                <HeaderButton
                  icon={<LogOut size={16} />}
                  label="Sair"
                  title={authUser?.email ?? 'Sair'}
                  onClick={() => void getSupabase().then((client) => client?.auth.signOut())}
                />
              </span>
            ) : (
              <HeaderButton icon={<LogIn size={16} />} label="Entrar" onClick={() => setIsAuthOpen(true)} />
            ))}
        </div>
      </header>

      {/* View switch: the lab slides in from the right, the Pokédex from the left (also on the
          browser's back/forward); the old view only fades out, and waits for nothing else. */}
      <AnimatePresence initial={false} mode="wait">
        <m.div
          animate={{ opacity: 1, x: 0, transition: { duration: duration.base, ease: ease.out } }}
          aria-label={isTeamLab ? 'Laboratório do time' : 'Pokédex'}
          // Focused programmatically after a view switch: it's a landmark, not a control, so no
          // ring (the global focus-visible rule is unlayered, hence the important modifier).
          className="focus-visible:outline-none! focus-visible:shadow-none!"
          exit={{ opacity: 0, transition: { duration: duration.exit, ease: ease.in } }}
          initial={{ opacity: 0, x: isTeamLab ? 16 : -16 }}
          key={view.activeView}
          ref={focusNewView}
          role="region"
          tabIndex={-1}
        >
          {isTeamLab ? (
            <Suspense fallback={<LoadingState />}>
              <TeamLab onBack={() => view.setActiveView('dex')} />
            </Suspense>
          ) : (
            <main className="flex w-full flex-col gap-8">
              <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
                {/* grid-cols-1 = minmax(0,1fr): lets the column shrink below the tab bar's
                    nowrap width (the tab bar scrolls sideways instead of widening the card). */}
                <div className="grid grid-cols-1 content-start gap-4">
                  {data.selectedPokemonQuery.isLoading && <PokemonCardSkeleton />}
                  {data.selectedPokemonQuery.isError &&
                    (/404|não encontrado/i.test(String(data.selectedPokemonQuery.error?.message)) ? (
                      <ErrorState
                        title={`Não encontramos “${view.selectedIdentifier}”.`}
                        hint="Confira o nome ou busque pelo número da Pokédex (ex.: 448)."
                        actionLabel="Voltar ao início"
                        onAction={() => view.setSelectedIdentifier(DEFAULT_URL_STATE.pokemon)}
                      />
                    ) : (
                      <ErrorState
                        title="Sem conexão com a PokeAPI."
                        hint="Verifique sua internet e tente de novo."
                        actionLabel="Tentar de novo"
                        onAction={() => void data.selectedPokemonQuery.refetch()}
                      />
                    ))}
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
        </m.div>
      </AnimatePresence>

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

      <AnimatePresence>
        {isAuthOpen && <AuthForm key="auth" onClose={() => setIsAuthOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}

export default App
